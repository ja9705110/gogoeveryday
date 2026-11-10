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
