-- PROJECT 030 一次補齊：24～34 號 SQL 合併在一起
-- 不管之前貼過哪幾號，都可以整段貼上執行（重複執行也安全）

-- ===== migrations/20261108000024_evolution.sql =====
-- PROJECT 030 · 培養皿第二階段進化事件
-- 玩家只會看到「形態 A／環境 E-01」等遊戲代碼與圖片；作品代碼、名稱、連結、備註只存在管理者可讀的表格中。
-- 初始身分（第 1 天的身分建檔）在進化開始時被快照保存，之後不會被改寫。

-- ── 參考作品（管理者上傳；玩家無法直接讀取） ──
create table if not exists public.evo_works (
  id          uuid primary key default gen_random_uuid(),
  category    text not null check (category in ('env', 'form')),   -- env：進化環境；form：形態
  game_label  text not null,                 -- 玩家看到的代碼
  work_code   text,                          -- 管理者：原始作品代碼
  title       text,                          -- 管理者：作品名稱／說明
  source_url  text,                          -- 管理者：原始作品連結
  note        text,                          -- 管理者備註
  image       text not null,                 -- 圖片（data URL，JPEG）
  tint        text,                          -- 主色（上傳時自動計算）
  sort        int not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.evo_works enable row level security;

create table if not exists public.evo_config (
  id          int primary key default 1 check (id = 1),
  open_day    int not null default 3,         -- 第 3 天（生日前 8 天）完成後開放
  force_open  boolean not null default false, -- 管理者手動立即開放
  updated_at  timestamptz not null default now()
);
insert into public.evo_config (id) values (1) on conflict do nothing;
alter table public.evo_config enable row level security;

create table if not exists public.evo_runs (
  profile_id   uuid primary key references public.profiles on delete cascade,
  identity     jsonb not null default '{}',   -- 初始身分快照（不可改寫）
  state        jsonb not null default '{}',   -- 進行中的比較狀態
  log          jsonb not null default '[]',   -- 每一次視覺比較的紀錄
  env_pick     uuid references public.evo_works(id),
  form_first   uuid references public.evo_works(id),
  form_second  uuid references public.evo_works(id),
  result       jsonb,                          -- 完成時的作品資訊快照（作品之後被修改也不影響）
  evo_code     text,
  started_at   timestamptz not null default now(),
  completed_at timestamptz
);
alter table public.evo_runs enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'evo_works' and policyname = 'admin_all') then
    create policy admin_all on public.evo_works for all using (public.is_admin()) with check (public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where tablename = 'evo_config' and policyname = 'admin_all') then
    create policy admin_all on public.evo_config for all using (public.is_admin()) with check (public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where tablename = 'evo_runs' and policyname = 'admin_read') then
    create policy admin_read on public.evo_runs for select using (public.is_admin());
  end if;
end $$;

-- ── 工具 ──
create or replace function private.evo_ids(j jsonb) returns uuid[]
language sql immutable as $$ select coalesce(array(select x::uuid from jsonb_array_elements_text(coalesce(j, '[]')) x), '{}'::uuid[]) $$;

create or replace function private.evo_opts(ids uuid[]) returns jsonb
language sql stable as $$
  select coalesce(jsonb_agg(jsonb_build_object('id', w.id, 'label', w.game_label, 'image', w.image) order by x.ord), '[]')
  from unnest(ids) with ordinality x(id, ord) join public.evo_works w on w.id = x.id;
$$;

create or replace function private.evo_one(id uuid) returns jsonb
language sql stable as $$ select jsonb_build_object('id', w.id, 'label', w.game_label, 'image', w.image, 'tint', w.tint) from public.evo_works w where w.id = evo_one.id $$;

-- 管理者用：作品完整資訊（不含圖片）
create or replace function private.evo_info(id uuid) returns jsonb
language sql stable as $$
  select jsonb_build_object('id', w.id, 'category', w.category, 'game_label', w.game_label, 'work_code', w.work_code, 'title', w.title,
                            'source_url', w.source_url, 'note', w.note, 'tint', w.tint)
  from public.evo_works w where w.id = evo_info.id
$$;

create or replace function private.evo_available(p uuid) returns boolean
language sql stable as $$
  select coalesce((select force_open from public.evo_config where id = 1), false)
      or exists (select 1 from public.player_levels pl where pl.profile_id = p and pl.status = 'COMPLETED'
                 and pl.day = coalesce((select open_day from public.evo_config where id = 1), 3))
      or private.game_day(private.game_now(p)) > coalesce((select open_day from public.evo_config where id = 1), 3);
$$;

create or replace function private.evo_ready() returns boolean
language sql stable as $$ select (select count(*) from public.evo_works where active and category = 'form') >= 3 $$;

-- 給 get_state 的摘要（不含圖片）
create or replace function private.evo_summary(p uuid) returns jsonb
language plpgsql stable as $$
declare r public.evo_runs;
begin
  select * into r from public.evo_runs where profile_id = p;
  if r.completed_at is not null then
    return jsonb_build_object('status', 'done', 'code', r.evo_code, 'tint', r.result #>> '{first,tint}', 'shape', (r.result ->> 'shape')::int,
                              'label', r.result #>> '{first,game_label}', 'completed_at', r.completed_at);
  end if;
  if not private.evo_available(p) then return jsonb_build_object('status', 'locked'); end if;
  if r.profile_id is not null then return jsonb_build_object('status', 'active', 'phase', r.state ->> 'phase'); end if;
  return jsonb_build_object('status', case when private.evo_ready() then 'ready' else 'not_ready' end);
end $$;

-- 玩家看到的狀態
create or replace function private.evo_view(p uuid) returns jsonb
language plpgsql stable as $$
declare r public.evo_runs; st jsonb; ph text; opts uuid[]; i int; n int; out jsonb; avail boolean;
begin
  select * into r from public.evo_runs where profile_id = p;
  avail := private.evo_available(p);
  if r.profile_id is null then
    return jsonb_build_object('status', case when not avail then 'locked' when private.evo_ready() then 'ready' else 'not_ready' end);
  end if;
  st := r.state; ph := st ->> 'phase';
  out := jsonb_build_object('status', case when r.completed_at is not null then 'done' else 'active' end, 'phase', ph, 'identity', r.identity);
  if r.completed_at is not null then
    return out || jsonb_build_object('code', r.evo_code, 'tint', r.result #>> '{first,tint}', 'shape', (r.result ->> 'shape')::int,
      'first', private.evo_one(r.form_first), 'completed_at', r.completed_at);
  end if;
  if ph = 'env' then
    opts := private.evo_ids(st -> 'env_pool'); i := (st ->> 'env_i')::int;
    n := (st ->> 'env_total')::int;
    out := out || jsonb_build_object('options', private.evo_opts(array[opts[i + 1], opts[i + 2]]),
      'step', (select count(*) from jsonb_array_elements(r.log) e where e ->> 'phase' = 'env') + 1, 'steps', n);
  elsif ph = 'form' then
    i := (st ->> 'form_round')::int;
    out := out || jsonb_build_object('options', private.evo_opts(private.evo_ids(st -> 'groups' -> i)), 'step', i + 1, 'steps', jsonb_array_length(st -> 'groups'));
  elsif ph = 'final1' then
    out := out || jsonb_build_object('options', private.evo_opts(private.evo_ids(st -> 'finalists')));
  elsif ph = 'final2' then
    out := out || jsonb_build_object('options', private.evo_opts(array(select x from unnest(private.evo_ids(st -> 'finalists')) x where x <> (st ->> 'first')::uuid)),
      'first', private.evo_one((st ->> 'first')::uuid));
  elsif ph = 'confirm' then
    out := out || jsonb_build_object('first', private.evo_one((st ->> 'first')::uuid), 'second', private.evo_one((st ->> 'second')::uuid));
  end if;
  return out;
end $$;

create or replace function public.evo_state(p uuid) returns jsonb
language plpgsql security definer set search_path = public, private as $$
begin
  perform private.assert_profile(p);
  return private.evo_view(p);
end $$;

-- 進入進化程序：快照初始身分、建立比較順序（每位玩家固定的隨機順序）
create or replace function public.evo_begin(p uuid) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare env uuid[]; frm uuid[]; groups jsonb; ident jsonb; t timestamptz;
begin
  perform private.assert_profile(p);
  if exists (select 1 from public.evo_runs where profile_id = p) then return private.evo_view(p); end if;
  if not private.evo_available(p) then raise exception 'P030_EVO_LOCKED'; end if;
  if not private.evo_ready() then raise exception 'P030_EVO_NOT_READY'; end if;
  t := private.game_now(p);
  select array_agg(id order by md5(p::text || id::text)) into env from public.evo_works where active and category = 'env';
  select array_agg(id order by md5(p::text || id::text)) into frm from public.evo_works where active and category = 'form';
  if coalesce(array_length(frm, 1), 0) >= 6 then
    select jsonb_agg(g order by k) into groups from (
      select k, jsonb_agg(frm[i] order by i) g from generate_series(1, array_length(frm, 1)) i, lateral (select (i - 1) % 3 as k) z group by k) s;
  else
    groups := '[]';
  end if;
  select coalesce(jsonb_object_agg(substr(key, 8), value), '{}') into ident from public.flags where profile_id = p and key like 'choice:p\_%';
  ident := ident || jsonb_build_object('observer_no', (select to_char(birthday, 'MMDD') from public.settings where id = 1), 'snapshot_at', t);
  insert into public.evo_runs (profile_id, identity, state, started_at)
  values (p, ident, jsonb_build_object(
      'phase', case when coalesce(array_length(env, 1), 0) >= 2 then 'env' when jsonb_array_length(groups) > 0 then 'form' else 'final1' end,
      'env_pool', to_jsonb(coalesce(env, '{}')), 'env_next', '[]'::jsonb, 'env_i', 0, 'env_total', greatest(coalesce(array_length(env, 1), 0) - 1, 0),
      'groups', groups, 'form_round', 0,
      'finalists', case when jsonb_array_length(groups) > 0 then '[]'::jsonb else to_jsonb(frm) end), t);
  perform private.log(p, t, 'EVO_BEGIN', null, jsonb_build_object('identity', ident));
  return private.evo_view(p);
end $$;

create or replace function public.evo_pick(p uuid, w uuid) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare r public.evo_runs; st jsonb; ph text; opts uuid[]; pool uuid[]; nxt uuid[]; i int; t timestamptz; fin uuid[];
begin
  perform private.assert_profile(p);
  select * into r from public.evo_runs where profile_id = p for update;
  if r.profile_id is null then raise exception 'P030_EVO_NOT_STARTED'; end if;
  if r.completed_at is not null then raise exception 'P030_EVO_DONE'; end if;
  st := r.state; ph := st ->> 'phase'; t := private.game_now(p);
  if ph = 'env' then
    pool := private.evo_ids(st -> 'env_pool'); i := (st ->> 'env_i')::int; opts := array[pool[i + 1], pool[i + 2]];
  elsif ph = 'form' then
    opts := private.evo_ids(st -> 'groups' -> (st ->> 'form_round')::int);
  elsif ph = 'final1' then
    opts := private.evo_ids(st -> 'finalists');
  elsif ph = 'final2' then
    opts := array(select x from unnest(private.evo_ids(st -> 'finalists')) x where x <> (st ->> 'first')::uuid);
  else
    raise exception 'P030_EVO_BAD_PHASE';
  end if;
  if not (w = any(opts)) then raise exception 'P030_EVO_BAD_PICK'; end if;
  r.log := r.log || jsonb_build_array(jsonb_build_object('phase', ph,
    'round', case ph when 'env' then (select count(*) from jsonb_array_elements(r.log) e where e ->> 'phase' = 'env') + 1 when 'form' then (st ->> 'form_round')::int + 1 else 1 end,
    'options', to_jsonb(opts), 'pick', w, 'at', t));
  if ph = 'env' then
    nxt := private.evo_ids(st -> 'env_next') || w; i := i + 2;
    if i + 1 >= array_length(pool, 1) then
      if i < array_length(pool, 1) then nxt := nxt || pool[i + 1]; end if;
      if array_length(nxt, 1) = 1 then
        r.env_pick := nxt[1];
        st := st || jsonb_build_object('phase', case when jsonb_array_length(st -> 'groups') > 0 then 'form' else 'final1' end, 'env_pick', nxt[1]);
      else
        st := st || jsonb_build_object('env_pool', to_jsonb(nxt), 'env_next', '[]'::jsonb, 'env_i', 0);
      end if;
    else
      st := st || jsonb_build_object('env_next', to_jsonb(nxt), 'env_i', i);
    end if;
  elsif ph = 'form' then
    fin := private.evo_ids(st -> 'finalists') || w;
    st := st || jsonb_build_object('finalists', to_jsonb(fin), 'form_round', (st ->> 'form_round')::int + 1);
    if (st ->> 'form_round')::int >= jsonb_array_length(st -> 'groups') then st := st || jsonb_build_object('phase', 'final1'); end if;
  elsif ph = 'final1' then
    st := st || jsonb_build_object('first', w, 'phase', 'final2');
  else
    st := st || jsonb_build_object('second', w, 'phase', 'confirm');
  end if;
  update public.evo_runs set state = st, log = r.log, env_pick = r.env_pick where profile_id = p;
  return private.evo_view(p);
end $$;

-- 最終確認前，可以重新選擇首選／備選
create or replace function public.evo_redo_final(p uuid) returns jsonb
language plpgsql security definer set search_path = public, private as $$
begin
  perform private.assert_profile(p);
  update public.evo_runs set state = (state - 'first' - 'second') || '{"phase":"final1"}'::jsonb,
         log = log || jsonb_build_array(jsonb_build_object('phase', 'redo_final', 'at', private.game_now(p)))
   where profile_id = p and completed_at is null and state ->> 'phase' in ('final2', 'confirm');
  return private.evo_view(p);
end $$;

-- 啟動進化：寫入結果快照、新的識別碼、特殊符號
create or replace function public.evo_confirm(p uuid) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare r public.evo_runs; st jsonb; f uuid; s uuid; t timestamptz; code text; shp int; res jsonb;
begin
  perform private.assert_profile(p);
  select * into r from public.evo_runs where profile_id = p for update;
  if r.profile_id is null then raise exception 'P030_EVO_NOT_STARTED'; end if;
  if r.completed_at is not null then return private.evo_view(p); end if;
  st := r.state;
  if st ->> 'phase' <> 'confirm' then raise exception 'P030_EVO_BAD_PHASE'; end if;
  f := (st ->> 'first')::uuid; s := (st ->> 'second')::uuid; t := private.game_now(p);
  shp := abs(hashtext(f::text)) % 4;
  code := 'OBS-' || coalesce(r.identity ->> 'observer_no', '1118') || '-II-' || upper(substr(md5(p::text || f::text), 1, 4));
  res := jsonb_build_object('first', private.evo_info(f), 'second', private.evo_info(s), 'env', private.evo_info(r.env_pick), 'shape', shp);
  update public.evo_runs set form_first = f, form_second = s, result = res, evo_code = code, completed_at = t,
         state = st || '{"phase":"done"}'::jsonb where profile_id = p;
  insert into public.inventory (profile_id, item_key, kind, name, description, data, source_day, acquired_at)
  values (p, 'evo_mark', 'item', '分化印記', '進化完成時，培養皿底部留下的印記。它的形狀，你會再見到。',
          jsonb_build_object('glyph', 'evo', 'code', code), private.game_day(t), t)
  on conflict (profile_id, item_key) do nothing;
  perform private.log(p, t, 'EVOLVED', null, jsonb_build_object('code', code, 'first', f, 'second', s, 'env', r.env_pick));
  return private.evo_view(p);
end $$;

-- 狀態裡附上進化摘要（培養艙用來改變樣本外觀）
create or replace function public.get_state(p uuid) returns jsonb
language plpgsql security definer set search_path = public, private as $$
begin
  perform private.assert_profile(p);
  perform private.refresh(p);
  return private.state(p) || (select jsonb_build_object('player_name', player_name, 'observer_no', to_char(birthday, 'MMDD')) from public.settings where id = 1)
                          || jsonb_build_object('evo', private.evo_summary(p));
end $$;

-- 管理者：所有玩家的進化結果（含作品資訊與圖片）
create or replace function public.admin_evo_results() returns jsonb
language plpgsql security definer set search_path = public, private as $$
begin
  perform private.assert_admin();
  return coalesce((select jsonb_agg(jsonb_build_object(
      'profile_id', pf.id, 'label', pf.label, 'is_test', pf.is_test,
      'status', case when r.completed_at is not null then 'done' when r.profile_id is not null then 'active' when private.evo_available(pf.id) then 'ready' else 'locked' end,
      'phase', r.state ->> 'phase', 'identity', r.identity, 'started_at', r.started_at, 'completed_at', r.completed_at, 'code', r.evo_code,
      'env', case when r.env_pick is not null then private.evo_info(r.env_pick) || jsonb_build_object('image', (select image from public.evo_works where id = r.env_pick)) end,
      'first', case when r.form_first is not null then coalesce(r.result -> 'first', private.evo_info(r.form_first)) || jsonb_build_object('image', (select image from public.evo_works where id = r.form_first)) end,
      'second', case when r.form_second is not null then coalesce(r.result -> 'second', private.evo_info(r.form_second)) || jsonb_build_object('image', (select image from public.evo_works where id = r.form_second)) end,
      'log', coalesce((select jsonb_agg(e || jsonb_build_object(
                'options_info', (select coalesce(jsonb_agg(jsonb_build_object('id', w.id, 'game_label', w.game_label, 'work_code', w.work_code, 'title', w.title) order by x.ord), '[]')
                                   from jsonb_array_elements_text(coalesce(e -> 'options', '[]')) with ordinality x(id, ord) join public.evo_works w on w.id = x.id::uuid),
                'pick_info', (select jsonb_build_object('game_label', w.game_label, 'work_code', w.work_code, 'title', w.title) from public.evo_works w where w.id::text = e ->> 'pick'))
              order by o) from jsonb_array_elements(r.log) with ordinality l(e, o)), '[]'),
      'sample_choices', (select coalesce(jsonb_object_agg(substr(key, 8), value), '{}') from public.flags where profile_id = pf.id and key like 'choice:p\_%')
    ) order by pf.is_test, pf.created_at)
    from public.profiles pf left join public.evo_runs r on r.profile_id = pf.id), '[]');
end $$;

-- 測試檔案重置時也清除進化紀錄
create or replace function public.admin_test_reset(p uuid) returns void
language plpgsql security definer set search_path = public, private as $$
begin
  perform private.assert_test(p);
  perform set_config('p030.purge_test', 'on', true);
  delete from public.event_log where profile_id = p;
  delete from public.player_levels where profile_id = p;
  delete from public.flags where profile_id = p;
  delete from public.inventory where profile_id = p;
  delete from public.observations where profile_id = p;
  delete from public.evidence where profile_id = p;
  delete from public.notifications where profile_id = p;
  delete from public.portrait_gift where profile_id = p;
  delete from public.finale_progress where profile_id = p;
  delete from public.evo_runs where profile_id = p;
  perform set_config('p030.purge_test', 'off', true);
  perform private.refresh(p);
end $$;

revoke all on function public.evo_state(uuid), public.evo_begin(uuid), public.evo_pick(uuid, uuid), public.evo_redo_final(uuid), public.evo_confirm(uuid), public.admin_evo_results() from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on function public.evo_state(uuid), public.evo_begin(uuid), public.evo_pick(uuid, uuid), public.evo_redo_final(uuid), public.evo_confirm(uuid), public.admin_evo_results() from anon';
    execute 'grant execute on function public.evo_state(uuid), public.evo_begin(uuid), public.evo_pick(uuid, uuid), public.evo_redo_final(uuid), public.evo_confirm(uuid), public.admin_evo_results() to authenticated';
    execute 'grant select, insert, update, delete on public.evo_works, public.evo_config to authenticated';
    execute 'grant select on public.evo_runs to authenticated';
  end if;
end $$;

select '第二階段進化事件已安裝' as status;

-- ===== migrations/20261108000025_swap_day3_day5.sql =====
-- PROJECT 030 · 第 3 天與第 5 天對調（11/10 起）
--   第 3 天（11/10）：溫室・香氛調配（《居家保健小百科》精油調配碼）＋ 第 3 關「三段體溫」：和三個不同的人合照，只能現場拍
--   第 5 天（11/12）：保險箱・投影卡 A（保留你自訂的卡片提示文字與 AR 備用驗證設定）
--   符號跟著內容走：第 3 天取得「芽」，第 5 天取得「鑰」。後續謎題只用到「起」「聲」，不受影響。
--   兩天尚未完成的進度會重新開始（已完成的不動）。
do $mig$
declare o3 public.levels; o5 public.levels;
begin
  select * into o3 from public.levels where day = 3;
  select * into o5 from public.levels where day = 5;
  update public.symbols set lore = '[{"from_day":5,"text":"能打開東西，也能只留下形狀。"},{"from_day":7,"text":"第 7 天，再用一次。"}]'::jsonb where id = 3;
  update public.symbols set lore = '[{"from_day":3,"text":"不是每一株都同時長出來。"}]'::jsonb where id = 5;
  update public.levels set secrets = replace(secrets::text, '你在第 3 天拿到的東西', '你在第 5 天拿到的東西')::jsonb where day = 7;
  if coalesce(o3.config #>> '{scene,theme}', '') <> 'vault' then
    raise notice '第 3 天已經是新內容，略過對調';
    return;
  end if;
  update public.levels set title = '溫室', subtitle = 'GREENHOUSE', code = 'ZONE 03',
    config = '{"notify":{"new":"第 03 區的濕度上升。有東西在生長。","pending":"溫室裡的植物還沒有被照顧。","expiring":"溫室的燈將於午夜關閉。"},"scene":{"theme":"greenhouse","light":"on","props":["plants","incubator","window"],"hotspots":[{"id":"roots","x":82,"y":84,"label":"根部"},{"id":"vines","x":10,"y":40,"label":"藤蔓後面","when":{"stat":"exploration","gte":2}},{"id":"c_pot","x":50,"y":82,"label":"花盆上的標籤","clue":[{"type":"note","text":"標籤上的字很小：\n「調配方法：見《居家保健小百科》——消化不良。」\n「對照速查表：用法 × 肌膚敏感度，數一數每一欄。」"}]}]},"variants":[{"id":"watcher","when":{"flag":"watcher_met"},"scene":{"npc":"watcher"},"intro":["守夜人在澆水。","「它們不是同一天種的，」他說，「所以不會同一天開。」"]}],"intro":["溫室裡的植物都不是同一天種下的。","培養艙被移到了這裡。"],"steps":[{"id":"s_order","type":"sequence","title":"澆水順序","pick":5,"render":"plant","stage":1,"stage_title":"澆水順序","items":[{"id":"c","stage":3},{"id":"a","stage":1},{"id":"e","stage":5},{"id":"b","stage":2},{"id":"d","stage":4}],"clue":[{"type":"note","text":"澆水紀錄：「從最晚種下的開始。」"}],"prompt":"依序點選植物。"},{"id":"s_ill","type":"story","text":["溫室的終端亮起紅燈：「樣本消化系統異常。」","「需要一份調配。調配的方法，記載在你世界的一本書裡。」"],"speaker":"SYSTEM","stage":2,"stage_title":"消化系統調配"},{"id":"s_recipe","type":"keypad","title":"消化系統調配","length":6,"stage":2,"stage_title":"消化系統調配","prompt":"輸入 6 位調配碼。（先調查畫面裡的花盆）"},{"id":"s_night","type":"story","optional":true,"title":"夜間花苞","text":["花苞在夜裡打開了。","裡面是一顆很小的、發著光的種子。"],"window":{"from":"21:00","to":"23:59:59","closed_text":"花苞緊閉著。也許要等到夜裡（21:00 後）。"},"stage":2,"stage_title":"消化系統調配"},{"id":"s_warm","type":"story","text":["調配完成。樣本的光穩定下來了，但它還是很冷。","系統：「樣本需要三段不同的體溫，才能完成甦醒。」","「每一段體溫，都必須有你在場。」"],"speaker":"SYSTEM","stage":3,"stage_title":"三段體溫"},{"id":"s_people","type":"evidence","title":"三段體溫","kinds":["photo"],"gate":true,"photoset":{"count":3,"label":"第 {n} 段","live":true},"stage":3,"stage_title":"三段體溫","prompt":"收集三段不同的體溫，每一段都要有你在畫面裡。（只能用相機現場拍攝）","pending_text":"三段體溫已送出。觀察站正在比對……"}],"epilogue":["溫室已歸檔。","你取得了「芽」符號。"]}'::jsonb, alternate = '{"route_title":"枯室","scene":{"theme":"greenhouse","light":"dim","props":["plants_dry","incubator"],"hotspots":[]},"intro":["植物在你離開的那一晚枯了。","但根還在。"],"steps":[{"id":"a_valves","type":"switches","title":"灌溉閥","count":5,"labels":["Ⅰ","Ⅱ","Ⅲ","Ⅳ","Ⅴ"],"clue":[{"type":"roots","has":[1,0,1,1,0],"caption":"撥開土壤，看得到根的形狀。"},{"type":"note","text":"「只澆還有根的那幾株。」"}],"prompt":"打開需要的閥門。"},{"id":"a_photo","type":"evidence","title":"生長紀錄（補登）","kinds":["photo"],"prompt":"拍下一個正在生長、或正在改變中的東西。"}],"epilogue":["有兩株長出了新葉。","和原本的不一樣。"]}'::jsonb,
    secrets = (coalesce(o5.secrets, '{}'::jsonb) - 's_photo' - 's_drops') || '{"s_order":{"answer":"a,b,c,d,e","hints":["最晚種下的，現在長得最小。"],"success":"水流過每一株植物。","wrong":"有一株植物垂下了葉子。"},"s_night":{"grant":{"items":[{"key":"night_seed","name":"夜開的種子","desc":"只在夜裡發光。","data":{"hidden":true}}]}},"hotspots":{"roots":{"text":"根部纏著一張標籤：「不是每一株都需要被看見。」","grant":{"items":[{"key":"root_tag","name":"根部標籤","desc":"不是每一株都需要被看見。","data":{"hidden":true}}]}},"vines":{"text":"藤蔓後面有一間更小的溫室。裡面只種了一株，還沒發芽。","grant":{"items":[{"key":"hidden_greenhouse","name":"隱藏溫室的土","desc":"還沒發芽。","data":{"hidden":true}}]}}},"s_recipe":{"answer":"777250","hints":["花盆標籤提到一本書。它在你家的廚房。","找到《居家保健小百科》裡「消化不良」的複方調配，把用到的精油對照前面的精油速查表。","速查表有 3 種用法、3 種肌膚敏感度，共 6 欄。數一數每一欄有幾支調配裡的精油打勾，依序輸入 6 個數字。"],"success":"調配完成。樣本的光變得穩定。","wrong":"調配比例不對。樣本微微顫抖。"},"s_people":{"hints":["三段體溫，來自三個不同的人。","每一張照片裡，都要有你和其中一個人。","和三個不同的人各拍一張合照（自拍也可以），在格子裡用相機現場拍，三格都完成後一起送出。"]},"a_valves":{"answer":"10110","success":"水滲進土裡。"}}'::jsonb,
    on_complete = '{"symbol":5}'::jsonb, on_alternate_complete = '{"symbol":5,"echo":true}'::jsonb, on_missed = '{"flags":{"greenhouse_wilted":true},"message":{"title":"溫室枯萎","body":"午夜之後，溫室的植物枯了。根還在。"}}'::jsonb,
    ar_fallback = '{}'::jsonb, updated_at = now()
  where day = 3;
  update public.levels set title = '保險箱', subtitle = 'THE SAFE', code = 'ZONE 05',
    config = jsonb_set('{"notify":{"new":"第 05 區偵測到一個實體投影。它在你的世界裡。","pending":"投影卡尚未被掃描。","expiring":"投影將於午夜失效。"},"scene":{"theme":"vault","light":"on","props":["safe","shelf","desk"],"hotspots":[]},"variants":[{"id":"watcher","when":{"flag":"watcher_met"},"scene":{"npc":"watcher"}},{"id":"note","when":{"flag":"watcher_left"},"scene":{"npc":"note"}}],"intro":["房間中央有一個保險箱，但它不是真的在這裡。","系統：「保險箱的實體投影卡已放置於現實世界。」"],"steps":[{"id":"s_watch","type":"story","text":["守夜人：「卡片是我放的。提示我只說一次——」","「找一個你每天都會打開，卻很少注意它的地方。」"],"speaker":"守夜人","when":{"flag":"watcher_met"},"stage":1,"stage_title":"投影卡 A"},{"id":"s_note","type":"story","text":["桌上壓著一張紙條：","「卡片在你每天都會打開，卻很少注意的地方。——守夜人」"],"when":{"not":{"flag":"watcher_met"}},"stage":1,"stage_title":"投影卡 A"},{"id":"s_scan","type":"ar","title":"掃描投影卡 A","target":0,"card":"A","overlay":"safe","prompt":"找到實體卡片 A，用相機對準它。","stage":1,"stage_title":"投影卡 A"},{"id":"s_open","type":"keypad","title":"保險箱轉盤","length":3,"prompt":"輸入保險箱的密碼。","stage":2,"stage_title":"保險箱"},{"id":"s_inside","type":"story","text":["保險箱裡只有一張舊照片。","照片背面寫著：「第 7 天，再用一次。」","照片的角落，有一行很小的字：「座標未確認」。"],"stage":2,"stage_title":"保險箱"},{"id":"s_coord","type":"evidence","title":"座標確認","kinds":["photo"],"gate":true,"stage":3,"stage_title":"座標確認","prompt":"系統需要確認投影卡的原始座標。","pending_text":"座標資料已送出。觀察站正在比對……"}],"epilogue":["保險箱已歸檔。","你取得了「鑰」符號，以及一張照片。"]}'::jsonb, '{steps}', private.p030_keep(coalesce(o3.config -> 'steps', '[]'::jsonb), '[{"id":"s_watch","type":"story","text":["守夜人：「卡片是我放的。提示我只說一次——」","「找一個你每天都會打開，卻很少注意它的地方。」"],"speaker":"守夜人","when":{"flag":"watcher_met"},"stage":1,"stage_title":"投影卡 A"},{"id":"s_note","type":"story","text":["桌上壓著一張紙條：","「卡片在你每天都會打開，卻很少注意的地方。——守夜人」"],"when":{"not":{"flag":"watcher_met"}},"stage":1,"stage_title":"投影卡 A"},{"id":"s_scan","type":"ar","title":"掃描投影卡 A","target":0,"card":"A","overlay":"safe","prompt":"找到實體卡片 A，用相機對準它。","stage":1,"stage_title":"投影卡 A"},{"id":"s_open","type":"keypad","title":"保險箱轉盤","length":3,"prompt":"輸入保險箱的密碼。","stage":2,"stage_title":"保險箱"},{"id":"s_inside","type":"story","text":["保險箱裡只有一張舊照片。","照片背面寫著：「第 7 天，再用一次。」","照片的角落，有一行很小的字：「座標未確認」。"],"stage":2,"stage_title":"保險箱"},{"id":"s_coord","type":"evidence","title":"座標確認","kinds":["photo"],"gate":true,"stage":3,"stage_title":"座標確認","prompt":"系統需要確認投影卡的原始座標。","pending_text":"座標資料已送出。觀察站正在比對……"}]'::jsonb, array['s_watch', 's_note', 's_scan', 's_coord'], array['text', 'prompt'])),
    alternate = '{"route_title":"鑰匙的形狀","scene":{"theme":"vault","light":"dim","props":["safe_open","shelf"],"hotspots":[]},"intro":["保險箱的門半開著，裡面是空的。","內壁上只剩一把鑰匙的壓痕。"],"steps":[{"id":"a_key","type":"dial","title":"復刻鑰匙","dials":5,"digits":[1,2,3,4],"format":"#####","clue":[{"type":"imprint","heights":[3,1,4,1,2],"caption":"內壁上的壓痕"}],"prompt":"調整五個齒的高度，讓鑰匙和壓痕吻合。"},{"id":"a_after","type":"story","text":["鑰匙插進壓痕，牆後有東西鬆開了。","你沒拿到照片。拿到的是一張拓印。"]}],"epilogue":["你得到的不是原本的東西。","但形狀還在。"]}'::jsonb,
    secrets = '{"s_scan":{"fallback":"VAULT-A","reveal":{"overlay":"safe","digits":"418"},"success":"卡片上方浮現一個保險箱。"},"s_open":{"answer":"418","hints":["數字只出現在投影的保險箱上。"],"success":"咔。","wrong":"轉盤卡住了。"},"s_coord":{"hints":["投影卡是在哪裡找到的？","回到那個地方。","拍一張「找到卡片的那個位置」上傳。"]},"a_key":{"answer":"31412","hints":["由左到右，數一數每個齒的高度。"],"success":"吻合。"}}'::jsonb || (coalesce(o3.secrets, '{}'::jsonb) - 's_order' - 's_recipe' - 's_night' - 's_people' - 's_drops' - 's_photo'),
    on_complete = '{"symbol":3,"items":[{"key":"photo_old","name":"舊照片","desc":"背面寫著：第 7 天，再用一次。"}]}'::jsonb, on_alternate_complete = '{"symbol":3,"echo":true,"items":[{"key":"key_rubbing","name":"鑰匙拓印","desc":"不是鑰匙本身，只是它的形狀。"}]}'::jsonb, on_missed = '{"flags":{"safe_taken":true},"message":{"title":"保險箱已被開啟","body":"有人在你之前打開了它。裡面少了一樣東西。"}}'::jsonb,
    ar_fallback = coalesce(o3.ar_fallback, '{}'::jsonb), updated_at = now()
  where day = 5;
  update public.player_levels set variant = null, data = '{"done":{},"attempts":{},"hints":{},"reveals":{},"started":{}}'::jsonb
   where day in (3, 5) and status <> 'COMPLETED' and missed_at is null;
end $mig$;

select '第 3 天已改為溫室・香氛調配；保險箱移到第 5 天' as status;

-- ===== migrations/20261108000026_day3_pot_label.sql =====
-- PROJECT 030 · 第 3 天（溫室）花盆標籤改寫；「對照速查表」改成第二個提示
update public.levels set
  config = jsonb_set(config, '{scene,hotspots}', (
    select jsonb_agg(case when h ->> 'id' = 'c_pot' then h || jsonb_build_object('clue', '[{"type":"note","text":"標籤上的字很小，像是匆忙寫下的：\n「不知道吃了什麼，好像消化不良……」\n「我記得《居家保健小百科》好像放在廚房的某個櫃子裡。」"}]'::jsonb) else h end order by o)
    from jsonb_array_elements(config #> '{scene,hotspots}') with ordinality x(h, o))),
  secrets = jsonb_set(secrets, '{s_recipe,hints}', '["翻開《居家保健小百科》，找到「消化不良」的複方調配，看看用了哪幾支精油。","對照速查表：用法 × 肌膚敏感度，數一數每一欄。","速查表有 3 種用法、3 種肌膚敏感度，共 6 欄。數一數每一欄有幾支調配裡的精油打勾，依序輸入 6 個數字。"]'::jsonb),
  updated_at = now()
where day = 3 and config #>> '{scene,theme}' = 'greenhouse';

select '花盆標籤與提示已更新' as status;

-- ===== migrations/20261108000027_day3_joy.sql =====
-- PROJECT 030 · 第 3 天（溫室）第 3 關改為「歡樂養分」：和三個不同的人各拍一張一起扮鬼臉的合照（只能現場拍）
update public.levels set
  config = jsonb_set(config, '{steps}', (
    select jsonb_agg(case s ->> 'id' when 's_warm' then '{"id":"s_warm","type":"story","text":["調配完成。樣本的光穩定下來了，但溫室裡的植物還是垂著葉子。","系統：「偵測到養分不足。缺少的成分：歡樂。」","「植物需要三份不同的笑臉，才能重新長出葉子。」"],"speaker":"SYSTEM","stage":3,"stage_title":"歡樂養分"}'::jsonb when 's_people' then '{"id":"s_people","type":"evidence","title":"歡樂養分","kinds":["photo"],"gate":true,"photoset":{"count":3,"label":"第 {n} 份養分","live":true},"stage":3,"stage_title":"歡樂養分","prompt":"找三個不同的人，和每個人各拍一張「一起扮鬼臉」的合照，餵給植物。你也要在畫面裡。（只能用相機現場拍攝）","pending_text":"三份歡樂養分已送出。植物正在吸收……"}'::jsonb else s end order by o)
    from jsonb_array_elements(config -> 'steps') with ordinality x(s, o))),
  secrets = jsonb_set(secrets, '{s_people}', '{"hints":["養分不是肥料，是三張笑臉。","每一張照片裡，都要有你和另一個人，而且兩個人都在扮鬼臉。","找三個不同的人，各拍一張一起扮鬼臉的合照（自拍也可以），在格子裡用相機現場拍，三格都完成後一起送出。"]}'::jsonb),
  updated_at = now()
where day = 3 and config #>> '{scene,theme}' = 'greenhouse';

select '第 3 天第 3 關已改為「歡樂養分」' as status;

-- ===== migrations/20261108000028_day3_recipe_hints.sql =====
-- PROJECT 030 · 第 3 天「消化系統調配」提示順序：速查表 → 翻開小百科 → 統計
update public.levels set secrets = jsonb_set(secrets, '{s_recipe,hints}', '["對照速查表：用法 × 肌膚敏感度，數一數每一欄。","翻開《居家保健小百科》，找到「消化不良」的複方調配，看看用了哪幾支精油。","速查表有 3 種用法、3 種肌膚敏感度，共 6 欄。數一數每一欄有幾支調配裡的精油打勾，依序輸入 6 個數字。"]'::jsonb), updated_at = now()
where day = 3 and config #>> '{scene,theme}' = 'greenhouse';

select '提示順序已更新' as status;

-- ===== migrations/20261108000029_retake_delete.sql =====
-- PROJECT 030 · 重拍時刪除舊照片
-- 玩家只能刪除「自己」的「分格照片」（集結之手、多格照片的子資料夾 mosaic-*／set-*）；
-- 已送出審核的合併照片放在上一層資料夾，玩家刪不到。
do $outer$
begin
  if not exists (select 1 from pg_namespace where nspname = 'storage') then
    raise notice 'storage schema missing – skipped';
    return;
  end if;
  begin
    execute $p$create policy p030_owner_delete_tiles on storage.objects for delete to authenticated
    using (bucket_id = 'evidence'
      and (storage.foldername(name))[1] in (select id::text from public.profiles where user_id = auth.uid())
      and coalesce(array_length(storage.foldername(name), 1), 0) >= 3
      and ((storage.foldername(name))[3] like 'mosaic-%' or (storage.foldername(name))[3] like 'set-%'))$p$;
  exception
    when duplicate_object then raise notice 'policy p030_owner_delete_tiles already exists';
    when others then raise notice 'policy p030_owner_delete_tiles skipped: %', sqlerrm;
  end;
end
$outer$;

select '重拍刪除舊照片：權限已設定' as status;

-- ===== migrations/20261108000030_finale_film.sql =====
-- PROJECT 030 · 11/18 終章改版：最後一關「十個詞」→ 回顧影片 → 「我 30 歲了！」（播放歌曲）→ 現實尋寶
-- 也調整第 9 區：錄音改成「給三十歲的你」，會在終章影片最後播放。

-- ── 第 9 區：給三十歲的你 ──
update public.levels set
  config = jsonb_set(config, '{steps}', (select jsonb_agg(case when s ->> 'id' = 's_voice' then s || '{"title":"給三十歲的你","prompt":"回放的最後一格是空的。它留給一段聲音：給 11/18、三十歲的你。","pending_text":"聲音已送出。投影機會在那一天替你播放……","stage_title":"給三十歲的你"}'::jsonb else s end order by o)
                                          from jsonb_array_elements(config -> 'steps') with ordinality x(s, o))),
  secrets = jsonb_set(secrets, '{s_voice}', coalesce(secrets -> 's_voice', '{}'::jsonb) || '{"hints":["這段聲音，會在你三十歲那一天播放。","想一想：11/18 的你，會想聽見什麼？","錄一段聲音，對三十歲的自己（11/18 的你）說一句話。"]}'::jsonb),
  updated_at = now()
where day = 9;

-- ── 終章設定 ──
alter table public.finale_progress add column if not exists words_at timestamptz;
alter table public.finale_progress add column if not exists words_tries int not null default 0;
alter table public.finale_config add column if not exists words jsonb not null default '["開始","理解","陪伴","自信","守護","接納","連結","取捨","肯定","成為"]';
alter table public.finale_config add column if not exists song_path text;

-- 最後一關：十天各放回一個詞（伺服器比對；答錯只告訴他放對了幾個）
create or replace function public.finale_words(p uuid, answer jsonb) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare t timestamptz; w jsonb; right_n int := 0; i int; n int;
begin
  perform private.assert_profile(p);
  perform private.assert_finale_open(p);
  t := private.game_now(p);
  select words into w from public.finale_config where id = 1;
  n := jsonb_array_length(w);
  if jsonb_typeof(answer) <> 'array' or jsonb_array_length(answer) <> n then raise exception 'P030_BAD_ANSWER'; end if;
  for i in 0 .. n - 1 loop
    if private.norm(answer ->> i) = private.norm(w ->> i) then right_n := right_n + 1; end if;
  end loop;
  insert into public.finale_progress (profile_id) values (p) on conflict do nothing;
  if right_n = n then
    update public.finale_progress set words_at = coalesce(words_at, t), words_tries = words_tries + 1 where profile_id = p;
    perform private.log(p, t, 'WORDS', 11, '{}'::jsonb);
    return jsonb_build_object('correct', true, 'right', right_n, 'total', n);
  end if;
  update public.finale_progress set words_tries = words_tries + 1 where profile_id = p;
  return jsonb_build_object('correct', false, 'right', right_n, 'total', n);
end $$;

-- 終章資料：加上打亂順序的詞、歌曲位置
create or replace function public.finale_archive(p uuid) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare days jsonb; lines jsonb := '[]'; ln jsonb; cfg jsonb; fc public.finale_config;
begin
  perform private.assert_profile(p);
  perform private.refresh(p);
  perform private.assert_finale_open(p);
  select coalesce(jsonb_agg(jsonb_build_object(
      'day', l.day, 'code', l.code, 'title', l.title, 'status', pl.status, 'outcome', pl.outcome,
      'missed_at', pl.missed_at, 'completed_at', pl.completed_at,
      'route_title', case when pl.missed_at is not null then l.alternate ->> 'route_title' end,
      'evidence', (select coalesce(jsonb_agg(jsonb_build_object('kind', e.kind, 'text', e.text_content, 'path', e.storage_path, 'step_id', e.step_id,
                                                               'status', e.status, 'payload', e.payload, 'on_time', e.on_time) order by e.submitted_at), '[]')
                     from public.evidence e where e.profile_id = p and e.day = l.day and e.status <> 'REPLACED'),
      'symbols', (select coalesce(jsonb_agg(jsonb_build_object('key', i.item_key, 'name', i.name, 'data', i.data)), '[]')
                    from public.inventory i where i.profile_id = p and i.source_day = l.day and i.kind = 'symbol'),
      'day_photos', case when pl.status = 'COMPLETED' then (select coalesce(jsonb_agg(jsonb_build_object('photo', rp.photo, 'caption', rp.caption) order by rp.stage), '[]')
                    from public.reward_photos rp where rp.day = l.day) else '[]'::jsonb end
    ) order by l.day), '[]') into days
    from public.levels l join public.player_levels pl on pl.profile_id = p and pl.day = l.day
   where l.day <= 10;
  select config into cfg from public.levels where day = 11;
  for ln in select * from jsonb_array_elements(coalesce(cfg -> 'monologue', '[]')) loop
    if private.eval_cond(p, ln -> 'when') then lines := lines || to_jsonb(ln ->> 'text'); end if;
  end loop;
  select * into fc from public.finale_config where id = 1;
  return jsonb_build_object('days', days, 'sample', private.sample_state(p), 'stats', private.stats(p),
    'monologue', lines, 'progress', (select to_jsonb(f) - 'profile_id' from public.finale_progress f where profile_id = p),
    'portrait', (select jsonb_build_object('unlocked_via', unlocked_via, 'choice', choice) from public.portrait_gift where profile_id = p),
    'choices', (private.stats(p) -> 'choices'),
    'words', (select coalesce(jsonb_agg(x order by md5(p::text || x)), '[]') from jsonb_array_elements_text(fc.words) x),
    'song', fc.song_path);
end $$;

-- 尋寶：完成「十個詞」後即可開始（原本要先寫下定義）
create or replace function public.finale_hunt(p uuid) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare fp public.finale_progress; fc public.finale_config; steps jsonb := '[]'; i int; n int;
begin
  perform private.assert_profile(p);
  perform private.assert_finale_open(p);
  select * into fp from public.finale_progress where profile_id = p;
  if fp.defined_at is null and fp.words_at is null then raise exception 'P030_DEFINE_FIRST'; end if;
  select * into fc from public.finale_config where id = 1;
  n := jsonb_array_length(fc.hunt);
  for i in 0 .. least(fp.hunt_index, n - 1) loop
    steps := steps || jsonb_build_object('index', i, 'title', fc.hunt -> i ->> 'title', 'clue', fc.hunt -> i ->> 'clue',
      'location_hint', fc.hunt -> i ->> 'location_hint', 'needs_code', coalesce(fc.hunt -> i ->> 'code', '') <> '',
      'done', i < fp.hunt_index);
  end loop;
  return jsonb_build_object('steps', steps, 'total', n, 'index', fp.hunt_index, 'done', fp.hunt_done_at is not null,
    'final_title', case when fp.hunt_done_at is not null or n = 0 then fc.final_title end,
    'final_body', case when fp.hunt_done_at is not null or n = 0 then fc.final_body end);
end $$;

create or replace function public.submit_hunt(p uuid, idx int, code text) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare t timestamptz; fp public.finale_progress; fc public.finale_config; expected text; n int;
begin
  perform private.assert_profile(p);
  perform private.assert_finale_open(p);
  t := private.game_now(p);
  select * into fp from public.finale_progress where profile_id = p for update;
  if fp.defined_at is null and fp.words_at is null then raise exception 'P030_DEFINE_FIRST'; end if;
  select * into fc from public.finale_config where id = 1;
  n := jsonb_array_length(fc.hunt);
  if idx <> fp.hunt_index or idx >= n then raise exception 'P030_HUNT_ORDER'; end if;
  expected := fc.hunt -> idx ->> 'code';
  if coalesce(expected, '') <> '' and private.norm(expected) <> private.norm(code) then
    return jsonb_build_object('correct', false, 'message', '這不是這裡的密碼。');
  end if;
  update public.finale_progress set hunt_index = idx + 1, hunt_done_at = case when idx + 1 >= n then t end where profile_id = p;
  perform private.log(p, t, 'HUNT', 11, jsonb_build_object('index', idx));
  if idx + 1 >= n then
    update public.player_levels set status = 'COMPLETED', outcome = 'ON_TIME', completed_at = t where profile_id = p and day = 11 and status <> 'COMPLETED';
  end if;
  return jsonb_build_object('correct', true) || public.finale_hunt(p);
end $$;

-- 歌曲檔：存在私人的 gifts/finale/ 資料夾；管理者可上傳；玩家只有在終章開啟後才讀得到
-- 只回答「目前登入的人，終章開了沒」，不透露其他資料
create or replace function public.finale_song_allowed() returns boolean
language sql stable security definer set search_path = public, private as $$
  select exists (select 1 from public.profiles pf where pf.user_id = auth.uid()
                  and private.game_now(pf.id) >= (private.level_window(11)).open_at);
$$;

do $outer$
begin
  if not exists (select 1 from pg_namespace where nspname = 'storage') then
    raise notice 'storage schema missing – skipped';
    return;
  end if;
  begin
    execute $p$create policy p030_admin_insert_finale on storage.objects for insert to authenticated
      with check (bucket_id = 'gifts' and name like 'finale/%' and public.is_admin())$p$;
  exception when duplicate_object then null; when others then raise notice 'policy p030_admin_insert_finale skipped: %', sqlerrm; end;
  begin
    execute $p$create policy p030_finale_song_read on storage.objects for select to authenticated
      using (bucket_id = 'gifts' and name like 'finale/%' and (public.is_admin() or public.finale_song_allowed()))$p$;
  exception when duplicate_object then null; when others then raise notice 'policy p030_finale_song_read skipped: %', sqlerrm; end;
end
$outer$;

revoke all on function public.finale_words(uuid, jsonb), public.finale_song_allowed() from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on function public.finale_words(uuid, jsonb), public.finale_song_allowed() from anon';
    execute 'grant execute on function public.finale_words(uuid, jsonb), public.finale_song_allowed() to authenticated';
  end if;
end $$;

select '終章改版已安裝' as status;

-- ===== migrations/20261108000031_day4_traits.sql =====
-- PROJECT 030 · 第 4 區鏡廳：第一關改為「鏡前的自己」——選出像自己的特質，鏡子把缺點翻過來
-- （取代原本的「鏡中數字」；之後的鏡中時鐘、倒影照片、邀請函不變）
update public.levels set
  config = jsonb_set(config, '{steps}', (
    select jsonb_agg(case when s ->> 'id' = 's_mirror' then '{"id":"s_traits","type":"story","widget":"traits","min":3,"title":"鏡前的自己","stage":1,"stage_title":"鏡前的自己","text":["鏡廳的入口，掛著一面還沒有影像的鏡子。","鏡框上刻著一行字：「照鏡子之前，先說說你看見的自己。」"],"prompt":"點選所有你覺得「像你」的詞——好的、不好的都可以，想選幾個就選幾個（至少 3 個）。"}'::jsonb else s end order by o)
    from jsonb_array_elements(config -> 'steps') with ordinality x(s, o))),
  updated_at = now()
where day = 4 and exists (select 1 from jsonb_array_elements(config -> 'steps') s where s ->> 'id' = 's_mirror');

-- 儲存他選的特質（只接受特質代碼；存成旗標 choice:traits，回顧與後台都讀得到）
create or replace function public.save_traits(p uuid, d int, step_id text, traits jsonb) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare t timestamptz; l public.levels; pl public.player_levels; n int;
begin
  perform private.assert_profile(p);
  t := private.game_now(p);
  if jsonb_typeof(traits) <> 'array' then raise exception 'P030_BAD_ANSWER'; end if;
  n := jsonb_array_length(traits);
  if n < 3 or n > 60 then raise exception 'P030_BAD_ANSWER'; end if;
  if exists (select 1 from jsonb_array_elements(traits) x where jsonb_typeof(x) <> 'string' or (x #>> '{}') !~ '^[a-z_]{2,30}$') then raise exception 'P030_BAD_ANSWER'; end if;
  select * into l from public.levels where day = d;
  if not exists (select 1 from jsonb_array_elements(coalesce(l.config -> 'steps', '[]')) s where s ->> 'id' = step_id and s ->> 'widget' = 'traits') then raise exception 'P030_NO_SUCH_STEP'; end if;
  select * into pl from public.player_levels where profile_id = p and day = d;
  if pl.status is null or pl.status not in ('AVAILABLE', 'IN_PROGRESS', 'COMPLETED') then raise exception 'P030_LOCKED'; end if;
  insert into public.flags (profile_id, key, value, source, set_at) values (p, 'choice:traits', traits, 'day:' || d, t)
  on conflict (profile_id, key) do update set value = excluded.value, set_at = excluded.set_at, source = excluded.source;
  insert into public.evidence (profile_id, day, step_id, kind, payload, status, on_time, submitted_at)
  values (p, d, step_id, 'choice', jsonb_build_object('traits', traits), 'APPROVED', pl.missed_at is null, t);
  perform private.log(p, t, 'TRAITS', d, jsonb_build_object('count', n));
  return jsonb_build_object('ok', true, 'count', n);
end $$;

revoke all on function public.save_traits(uuid, int, text, jsonb) from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on function public.save_traits(uuid, int, text, jsonb) from anon';
    execute 'grant execute on function public.save_traits(uuid, int, text, jsonb) to authenticated';
  end if;
end $$;

select '第 4 區已改為「鏡前的自己」' as status;

-- ===== migrations/20261108000032_finale_favorite.sql =====
-- 終章：不再替十天「命名」。改為讓他回顧十個關卡，選一個最喜歡／最有趣的，
-- 選完後解鎖檔案室（沿用 words_at 作為「最後一關已完成」的時間）。
alter table public.finale_progress add column if not exists favorite_day int;

create or replace function public.finale_favorite(p uuid, d int) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare t timestamptz;
begin
  perform private.assert_profile(p);
  perform private.assert_finale_open(p);
  t := private.game_now(p);
  if d is null or d < 1 or d > 10 or not exists (select 1 from public.player_levels where profile_id = p and day = d) then
    raise exception 'P030_BAD_ANSWER';
  end if;
  insert into public.finale_progress (profile_id) values (p) on conflict do nothing;
  update public.finale_progress set favorite_day = d, words_at = coalesce(words_at, t), words_tries = words_tries + 1 where profile_id = p;
  insert into public.flags (profile_id, key, value, source, set_at) values (p, 'choice:favorite', to_jsonb(d), 'day:11', t)
  on conflict (profile_id, key) do update set value = excluded.value, set_at = excluded.set_at, source = excluded.source;
  perform private.log(p, t, 'FAVORITE', 11, jsonb_build_object('day', d));
  return jsonb_build_object('ok', true, 'day', d);
end $$;

revoke all on function public.finale_favorite(uuid, int) from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on function public.finale_favorite(uuid, int) from anon';
    execute 'grant execute on function public.finale_favorite(uuid, int) to authenticated';
  end if;
end $$;

select '終章已改為「選一個最喜歡的關卡」' as status;

-- 讓 API 立刻認得新的函式
notify pgrst, 'reload schema';

-- ===== migrations/20261108000033_happy_ticket.sql =====
-- 幸福券：讓逾期的那一區重新開啟，回去完成它、看見那一天的回顧，之後再回到今天
-- 例：11/11 太累只破到一半 → 11/12 收到幸福券 → 回去把鏡廳完成
create table if not exists public.happy_tickets (
  profile_id uuid not null references public.profiles on delete cascade,
  day        int  not null check (day between 1 and 10),
  granted_at timestamptz not null default now(),
  until      timestamptz not null,           -- 使用後，這一區開放到這個時間（不含）
  used_at    timestamptz,
  note       text,
  primary key (profile_id, day)
);
alter table public.happy_tickets enable row level security;
do $$ begin
  create policy own_tickets on public.happy_tickets for select
    using (public.is_admin() or exists (select 1 from public.profiles pf where pf.id = profile_id and pf.user_id = auth.uid()));
exception when duplicate_object then null; end $$;

-- missed_at 一旦寫入不可回寫——唯一的例外：測試檔案重置、使用幸福券
create or replace function private.guard_missed() returns trigger language plpgsql as $$
begin
  if old.missed_at is not null and (new.missed_at is distinct from old.missed_at)
     and coalesce(current_setting('p030.purge_test', true), '') <> 'on'
     and coalesce(current_setting('p030.happy_ticket', true), '') <> 'on' then
    raise exception 'P030_TIME_IS_IRREVERSIBLE';
  end if;
  return new;
end $$;

-- 用了幸福券、還在期限內的那一區，不會被標成逾期
create or replace function private.refresh(p uuid) returns void
language plpgsql as $$
declare t timestamptz; l public.levels; w record; pl public.player_levels; tk public.happy_tickets;
begin
  t := private.game_now(p);
  for l in select * from public.levels order by day loop
    insert into public.player_levels (profile_id, day) values (p, l.day) on conflict do nothing;
    select * into pl from public.player_levels where profile_id = p and day = l.day for update;
    select * into w from private.level_window(l.day);

    if pl.status = 'COMPLETED' or pl.missed_at is not null then continue; end if;
    if t < w.open_at then continue; end if;

    if t >= w.close_at then
      select * into tk from public.happy_tickets where profile_id = p and day = l.day and used_at is not null;
      if tk.profile_id is not null and t < tk.until then continue; end if;
      perform private.mark_missed(p, l.day, case when tk.profile_id is not null then tk.until else w.close_at end);
    elsif pl.status = 'LOCKED' then
      update public.player_levels set status = 'AVAILABLE' where profile_id = p and day = l.day;
    end if;
  end loop;
end $$;

-- 使用幸福券：把那一區恢復成逾期前的樣子（已完成的關卡都還在），重新開放到期限
create or replace function public.use_happy_ticket(p uuid, d int) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare t timestamptz; tk public.happy_tickets; pl public.player_levels; restored jsonb;
begin
  perform private.assert_profile(p);
  t := private.game_now(p);
  select * into tk from public.happy_tickets where profile_id = p and day = d for update;
  if tk.profile_id is null then raise exception 'P030_NO_TICKET'; end if;
  if tk.used_at is not null then return jsonb_build_object('ok', true, 'already', true, 'until', tk.until); end if;
  if t >= tk.until then raise exception 'P030_TICKET_EXPIRED'; end if;
  select * into pl from public.player_levels where profile_id = p and day = d for update;
  if pl.status = 'COMPLETED' then raise exception 'P030_ALREADY_DONE'; end if;
  update public.happy_tickets set used_at = t where profile_id = p and day = d;
  if pl.missed_at is not null then
    restored := coalesce(pl.data -> 'main_archive', '{"done":{},"attempts":{},"hints":{},"reveals":{},"started":{}}'::jsonb);
    perform set_config('p030.happy_ticket', 'on', true);
    update public.player_levels
       set missed_at = null, variant = null, data = restored,
           status = case when restored -> 'done' <> '{}'::jsonb or pl.started_at is not null then 'IN_PROGRESS' else 'AVAILABLE' end
     where profile_id = p and day = d;
    perform set_config('p030.happy_ticket', '', true);
    update public.evidence set status = 'NEEDS_MORE' where profile_id = p and day = d and status = 'OVERDUE';
    -- 收回「熄燈」的通知
    update public.notifications set read_at = coalesce(read_at, t) where profile_id = p and dedupe_key = 'MISSED:' || d;
  end if;
  perform private.log(p, t, 'TICKET', d, jsonb_build_object('until', tk.until));
  return jsonb_build_object('ok', true, 'until', tk.until);
end $$;

-- 管理者：送出幸福券（預設開放到對方「今天」結束）
create or replace function public.admin_grant_ticket(p uuid, d int, until_at timestamptz default null, msg text default null) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare t timestamptz; w record; g int; u timestamptz; l public.levels;
begin
  if not public.is_admin() then raise exception 'P030_FORBIDDEN' using errcode = '42501'; end if;
  t := private.game_now(p);
  select * into l from public.levels where day = d;
  if l.day is null or d > 10 then raise exception 'P030_BAD_ANSWER'; end if;
  if exists (select 1 from public.player_levels where profile_id = p and day = d and status = 'COMPLETED') then raise exception 'P030_ALREADY_DONE'; end if;
  -- 預設期限：對方遊戲時間「今天」的 24:00
  select day into g from public.levels lv where (private.level_window(lv.day)).open_at <= t and lv.day <= 10 order by lv.day desc limit 1;
  select * into w from private.level_window(greatest(coalesce(g, d), d));
  u := coalesce(until_at, w.close_at);
  insert into public.happy_tickets (profile_id, day, granted_at, until, note) values (p, d, t, u, msg)
  on conflict (profile_id, day) do update set granted_at = excluded.granted_at, until = excluded.until, used_at = null, note = excluded.note;
  perform private.notify(p, t, 'SPECIAL_EVENT', 'TICKET:' || d || ':' || extract(epoch from t)::bigint, d, '你收到一張幸福券',
    coalesce(msg, '累了也沒關係。用這張券，回去把「' || l.title || '」走完吧，走完再回來就好。'));
  return jsonb_build_object('ok', true, 'until', u);
end $$;

revoke all on function public.use_happy_ticket(uuid, int), public.admin_grant_ticket(uuid, int, timestamptz, text) from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on function public.use_happy_ticket(uuid, int), public.admin_grant_ticket(uuid, int, timestamptz, text) from anon';
    execute 'grant execute on function public.use_happy_ticket(uuid, int), public.admin_grant_ticket(uuid, int, timestamptz, text) to authenticated';
    execute 'grant select on public.happy_tickets to authenticated';
  end if;
end $$;

-- 11/12：送給壽星一張第 4 區（鏡廳）的幸福券，開放到 11/12 23:59
do $$
declare pr record; s public.settings; l public.levels; w record;
begin
  s := private.settings();
  select * into l from public.levels where day = 4;
  select * into w from private.level_window(5);
  for pr in select pf.id from public.profiles pf where not pf.is_test and not exists (select 1 from public.admins a where a.user_id = pf.user_id) loop
    if exists (select 1 from public.player_levels where profile_id = pr.id and day = 4 and status = 'COMPLETED') then continue; end if;
    if exists (select 1 from public.happy_tickets where profile_id = pr.id and day = 4) then continue; end if;
    insert into public.happy_tickets (profile_id, day, granted_at, until, note)
    values (pr.id, 4, now(), w.close_at, '昨天太累了也沒關係。用這張券，回去把鏡廳走完吧——走完再回到今天就好。');
    perform private.notify(pr.id, now(), 'SPECIAL_EVENT', 'TICKET:4', 4, '你收到一張幸福券',
      '昨天太累了也沒關係。用這張券，回去把鏡廳走完吧——走完再回到今天就好。');
  end loop;
end $$;

select '幸福券已安裝' as status;

-- 讓 API 立刻認得新的函式
notify pgrst, 'reload schema';

-- ===== migrations/20261108000034_finale_color.sql =====
-- 終章：他選一個代表自己的顏色，最後的星球（Jasper）用這個顏色呈現
create or replace function public.finale_color(p uuid, color text) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare t timestamptz;
begin
  perform private.assert_profile(p);
  perform private.assert_finale_open(p);
  t := private.game_now(p);
  if color is null or lower(color) !~ '^#[0-9a-f]{6}$' then raise exception 'P030_BAD_ANSWER'; end if;
  insert into public.flags (profile_id, key, value, source, set_at) values (p, 'choice:color', to_jsonb(lower(color)), 'day:11', t)
  on conflict (profile_id, key) do update set value = excluded.value, set_at = excluded.set_at, source = excluded.source;
  perform private.log(p, t, 'COLOR', 11, jsonb_build_object('color', lower(color)));
  return jsonb_build_object('ok', true, 'color', lower(color));
end $$;

revoke all on function public.finale_color(uuid, text) from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on function public.finale_color(uuid, text) from anon';
    execute 'grant execute on function public.finale_color(uuid, text) to authenticated';
  end if;
end $$;

select '終章代表色已安裝' as status;

-- 讓 API 立刻認得新的函式
notify pgrst, 'reload schema';

notify pgrst, 'reload schema';
select '24～34 號已全部安裝' as status;
