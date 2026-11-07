-- PROJECT 030 · 伺服器端遊戲引擎
-- 時間、狀態轉換、故事分支、養成樣本全部在這裡以資料庫紀錄判定。

-- ───────────────────────── 基礎工具 ─────────────────────────
create or replace function private.norm(x text) returns text
language sql immutable as $$
  select lower(regexp_replace(coalesce(x, ''), '[\s\-_,，、。.·・:：/]+', '', 'g'));
$$;

create or replace function private.settings() returns public.settings
language sql stable as $$ select * from public.settings where id = 1; $$;

create or replace function private.game_now(p uuid) returns timestamptz
language sql stable as $$
  select case when pr.is_test and pr.sim_offset is not null then now() + pr.sim_offset else now() end
  from public.profiles pr where pr.id = p;
$$;

-- 生日前 10 天 = 第 1 天；第 11 天 = 生日當天（終章）
create or replace function private.start_date() returns date
language sql stable as $$ select birthday - 10 from public.settings where id = 1; $$;

create or replace function private.game_day(t timestamptz) returns int
language sql stable as $$
  select ((t at time zone s.tz)::date - (s.birthday - 10)) + 1 from public.settings s where s.id = 1;
$$;

create or replace function private.level_window(p_day int, out open_at timestamptz, out close_at timestamptz)
language plpgsql stable as $$
declare s public.settings; l public.levels; d date;
begin
  s := private.settings();
  select * into l from public.levels where day = p_day;
  d := s.birthday - 10 + (p_day - 1);
  open_at := coalesce(l.open_at, (d::timestamp) at time zone s.tz);
  if p_day = 11 then
    close_at := coalesce(l.close_at, 'infinity'::timestamptz);
  else
    close_at := coalesce(l.close_at, ((d + 1)::timestamp) at time zone s.tz);   -- 不含；等同當日 23:59:59.999
  end if;
end $$;

create or replace function private.assert_profile(p uuid) returns public.profiles
language plpgsql stable as $$
declare r public.profiles;
begin
  select * into r from public.profiles where id = p;
  if r.id is null or r.user_id is distinct from auth.uid() then
    raise exception 'P030_FORBIDDEN' using errcode = '42501';
  end if;
  return r;
end $$;

create or replace function private.assert_admin() returns void
language plpgsql stable as $$
begin
  if not exists (select 1 from public.admins where user_id = auth.uid()) then
    raise exception 'P030_ADMIN_ONLY' using errcode = '42501';
  end if;
end $$;

create or replace function private.log(p uuid, t timestamptz, typ text, d int, payload jsonb default '{}')
returns void language sql as $$
  insert into public.event_log (profile_id, at, type, day, payload) values (p, t, typ, d, coalesce(payload, '{}'));
$$;

-- ───────────────────────── 通知 ─────────────────────────
create or replace function private.notify(p uuid, t timestamptz, typ text, dedupe text, d int, title text, body text)
returns boolean language plpgsql as $$
declare pr public.profiles; prefs public.notification_prefs; st text := 'inapp'; n int;
begin
  select * into pr from public.profiles where id = p;
  select * into prefs from public.notification_prefs where profile_id = p;
  if not pr.is_test
     and coalesce(prefs.push_enabled, true)
     and coalesce((prefs.types ->> typ)::boolean, true)
     and exists (select 1 from public.push_subscriptions where profile_id = p) then
    st := 'queued';
  end if;
  insert into public.notifications (profile_id, type, dedupe_key, day, title, body, created_at, push_status)
  values (p, typ, dedupe, d, title, body, t, st)
  on conflict (profile_id, dedupe_key) do nothing;
  get diagnostics n = row_count;
  return n > 0;
end $$;

-- ───────────────────────── 統計（不是評分，只是條件來源） ─────────────────────────
create or replace function private.sample_state(p uuid) returns jsonb
language plpgsql stable as $$
declare
  o record; prev int; gap int;
  lum numeric := 10; branch numeric := 10; shell numeric := 10; depth numeric := 10;
  drift numeric := 0; rhythm numeric := 0;
  streak int := 0; max_streak int := 0; total int := 0; breaks int := 0;
  hist jsonb := '[]'; scars jsonb := '[]';
  today int; dormant int := 0; base text; modifier text := ''; form text; stage int;
  mx numeric; mn numeric;
begin
  for o in select * from public.observations where profile_id = p order by day loop
    total := total + 1;
    if prev is not null and o.day - prev > 1 then
      gap := o.day - prev - 1;
      breaks := breaks + 1;
      drift := drift + 9 * gap;
      scars := scars || jsonb_build_object('day', o.day, 'gap', gap);
      streak := 1;
    else
      streak := streak + 1;
      if streak >= 2 then rhythm := rhythm + 6; end if;
    end if;
    max_streak := greatest(max_streak, streak);
    case o.action
      when 'explore'  then branch := branch + 14; drift := drift + 3; lum := lum + 2;
      when 'preserve' then shell  := shell + 14;  depth := depth + 2;
      when 'adjust'   then lum    := lum + 14;    rhythm := rhythm + 3; branch := branch + 2;
      when 'rest'     then depth  := depth + 14;  shell := shell + 3;
    end case;
    hist := hist || jsonb_build_object('day', o.day, 'action', o.action, 'streak', streak);
    prev := o.day;
  end loop;

  today := private.game_day(private.game_now(p));
  if prev is not null and today - prev > 1 then dormant := least(today, 11) - prev - 1; end if;
  if prev is not null and dormant > 0 then streak := 0; end if;

  mx := greatest(lum, branch, shell, depth);
  mn := least(lum, branch, shell, depth);
  if total = 0 then base := '未觀測'; form := '未觀測樣本';
  elsif mx - mn < 8 and total >= 3 then base := '未定形';
  elsif mx = branch then base := '岔形';
  elsif mx = lum then base := '燈形';
  elsif mx = shell then base := '年輪形';
  else base := '深根形';
  end if;
  if total > 0 then
    if rhythm >= 36 then modifier := '節律';
    elsif drift >= 27 then modifier := '漂流';
    elsif breaks >= 1 then modifier := '斷續';
    end if;
    form := case when modifier = '' then base else modifier || '・' || base end;
  end if;
  stage := case when total = 0 then 0 when total <= 2 then 1 when total <= 5 then 2 when total <= 8 then 3 else 4 end;

  return jsonb_build_object(
    'params', jsonb_build_object('lum', lum, 'branch', branch, 'shell', shell, 'depth', depth, 'drift', drift, 'rhythm', rhythm),
    'history', hist, 'scars', scars, 'streak', streak, 'max_streak', max_streak,
    'total', total, 'breaks', breaks, 'dormant', dormant,
    'base', base, 'modifier', modifier, 'form', form, 'stage', stage,
    'seed', ('x' || substr(md5(p::text), 1, 8))::bit(32)::int
  );
end $$;

create or replace function private.stats(p uuid) returns jsonb
language sql stable as $$
  with s as (select private.sample_state(p) j)
  select jsonb_build_object(
    'consistency', (select count(*) from public.player_levels where profile_id = p and outcome = 'ON_TIME')
                   + (select (j ->> 'max_streak')::int from s),
    'ontime',      (select count(*) from public.player_levels where profile_id = p and outcome = 'ON_TIME'),
    'completed',   (select count(*) from public.player_levels where profile_id = p and status = 'COMPLETED'),
    'missed',      (select count(*) from public.player_levels where profile_id = p and missed_at is not null),
    'missed_days', (select coalesce(jsonb_agg(day order by day), '[]') from public.player_levels where profile_id = p and missed_at is not null),
    'exploration', (select count(*) from public.inventory where profile_id = p and (data ->> 'hidden')::boolean),
    'choices',     (select coalesce(jsonb_object_agg(key, value), '{}') from public.flags where profile_id = p and key like 'choice:%'),
    'observations',(select (j ->> 'total')::int from s),
    'streak',      (select (j ->> 'streak')::int from s),
    'max_streak',  (select (j ->> 'max_streak')::int from s),
    'breaks',      (select (j ->> 'breaks')::int from s),
    'sample_form', (select j ->> 'form' from s)
  );
$$;

-- ───────────────────────── 條件判斷（故事分支引擎） ─────────────────────────
create or replace function private.eval_cond(p uuid, c jsonb) returns boolean
language plpgsql stable as $$
declare x jsonb; v jsonb; n numeric;
begin
  if c is null or c = 'null'::jsonb or c = '{}'::jsonb then return true; end if;
  if c ? 'all' then
    for x in select * from jsonb_array_elements(c -> 'all') loop
      if not private.eval_cond(p, x) then return false; end if;
    end loop;
    return true;
  end if;
  if c ? 'any' then
    for x in select * from jsonb_array_elements(c -> 'any') loop
      if private.eval_cond(p, x) then return true; end if;
    end loop;
    return false;
  end if;
  if c ? 'not' then return not private.eval_cond(p, c -> 'not'); end if;
  if c ? 'flag' then
    select value into v from public.flags where profile_id = p and key = c ->> 'flag';
    if c ? 'eq' then return v is not null and v = c -> 'eq'; end if;
    return v is not null and v not in ('false'::jsonb, 'null'::jsonb, '0'::jsonb, '""'::jsonb);
  end if;
  if c ? 'missed' then
    return exists (select 1 from public.player_levels where profile_id = p and day = (c ->> 'missed')::int and missed_at is not null);
  end if;
  if c ? 'ontime' then
    return exists (select 1 from public.player_levels where profile_id = p and day = (c ->> 'ontime')::int and outcome = 'ON_TIME');
  end if;
  if c ? 'done' then
    return exists (select 1 from public.player_levels where profile_id = p and day = (c ->> 'done')::int and status = 'COMPLETED');
  end if;
  if c ? 'item' then
    return exists (select 1 from public.inventory where profile_id = p and item_key = c ->> 'item');
  end if;
  if c ? 'stat' then
    n := (private.stats(p) ->> (c ->> 'stat'))::numeric;
    return n is not null
       and (not c ? 'gte' or n >= (c ->> 'gte')::numeric)
       and (not c ? 'lte' or n <= (c ->> 'lte')::numeric);
  end if;
  if c ? 'form' then return private.sample_state(p) ->> 'base' = c ->> 'form'; end if;
  raise exception 'P030_BAD_CONDITION %', c::text;
end $$;

-- ───────────────────────── 效果套用 ─────────────────────────
create or replace function private.apply_effects(p uuid, t timestamptz, eff jsonb, d int, source text)
returns jsonb language plpgsql as $$
declare k text; v jsonb; it jsonb; sym public.symbols; gained jsonb := '[]'; ikey text; echo boolean;
begin
  if eff is null or eff = '{}'::jsonb then return gained; end if;

  if eff ? 'symbol' then
    select * into sym from public.symbols where id = (eff ->> 'symbol')::int;
    echo := coalesce((eff ->> 'echo')::boolean, false);
    ikey := 'sym:' || sym.id || case when echo then ':echo' else '' end;
    insert into public.inventory (profile_id, item_key, kind, name, description, data, source_day, acquired_at)
    values (p, ikey, 'symbol', case when echo then '殘響・' || sym.name else sym.name end,
            case when echo then '原本的符號沒有留下來，留下來的是它的回聲。' else null end,
            jsonb_build_object('symbol', sym.id, 'echo', echo), d, t)
    on conflict do nothing;
    if found then gained := gained || jsonb_build_object('kind','symbol','key',ikey,'symbol',sym.id,'echo',echo,'name',sym.name,'digit',sym.digit); end if;
  end if;

  for it in select * from jsonb_array_elements(coalesce(eff -> 'items', '[]')) loop
    insert into public.inventory (profile_id, item_key, kind, name, description, data, source_day, acquired_at)
    values (p, it ->> 'key', coalesce(it ->> 'kind', 'item'), it ->> 'name', it ->> 'desc', coalesce(it -> 'data', '{}'), d, t)
    on conflict do nothing;
    if found then gained := gained || jsonb_build_object('kind','item','key',it->>'key','name',it->>'name','desc',it->>'desc'); end if;
  end loop;

  for it in select * from jsonb_array_elements(coalesce(eff -> 'remove_items', '[]')) loop
    delete from public.inventory where profile_id = p and item_key = it #>> '{}';
    if found then
      perform private.log(p, t, 'ITEM_LOST', d, jsonb_build_object('item', it #>> '{}', 'source', source));
      gained := gained || jsonb_build_object('kind','lost','key', it #>> '{}');
    end if;
  end loop;

  for k, v in select * from jsonb_each(coalesce(eff -> 'flags', '{}')) loop
    insert into public.flags (profile_id, key, value, source, set_at) values (p, k, v, source, t)
    on conflict on constraint flags_pkey do update set value = excluded.value, source = excluded.source, set_at = excluded.set_at;
  end loop;

  -- 只在尚未設定時寫入（例如：玩家已做出的選擇不會被系統覆寫）
  for k, v in select * from jsonb_each(coalesce(eff -> 'flags_default', '{}')) loop
    insert into public.flags (profile_id, key, value, source, set_at) values (p, k, v, source, t)
    on conflict on constraint flags_pkey do nothing;
  end loop;

  if eff ->> 'gift' = 'portrait' then
    insert into public.portrait_gift (profile_id, unlocked_via, unlocked_at) values (p, source, t) on conflict do nothing;
    if found then
      perform private.notify(p, t, 'SPECIAL_EVENT', 'GIFT:portrait', d, '影像校正邀請函',
        '鏡面系統發出了一封邀請函。它需要你親自決定，影像中的你應該是什麼樣子。');
      gained := gained || jsonb_build_object('kind','gift','key','portrait');
    end if;
  end if;

  if eff ? 'notify' then
    perform private.notify(p, t, 'SPECIAL_EVENT', 'FX:' || source || ':' || coalesce(eff #>> '{notify,key}', md5(eff::text)), d,
                           eff #>> '{notify,title}', eff #>> '{notify,body}');
  end if;
  return gained;
end $$;

-- ───────────────────────── 狀態轉換（時間不可逆） ─────────────────────────
create or replace function private.mark_missed(p uuid, d int, at_t timestamptz) returns void
language plpgsql as $$
declare l public.levels; pl public.player_levels; new_status text;
begin
  select * into l from public.levels where day = d;
  select * into pl from public.player_levels where profile_id = p and day = d for update;
  if pl.status = 'COMPLETED' or pl.missed_at is not null then return; end if;
  -- 逾期：永久記錄，原路線進度封存，開啟替代路線（若有）
  new_status := case when l.alternate is not null then 'ALTERNATE' else 'MISSED' end;
  update public.player_levels
     set missed_at = at_t, status = new_status, variant = null,
         data = jsonb_build_object('done','{}'::jsonb,'attempts','{}'::jsonb,'hints','{}'::jsonb,
                                   'reveals','{}'::jsonb,'started','{}'::jsonb,'main_archive', pl.data)
   where profile_id = p and day = d;
  update public.evidence set status = 'OVERDUE'
   where profile_id = p and day = d and status = 'NEEDS_MORE';
  perform private.log(p, at_t, 'MISSED', d,
    jsonb_build_object('title', l.title, 'had_started', pl.started_at is not null, 'route', new_status));
  perform private.apply_effects(p, at_t, l.on_missed, d, 'missed:' || d);
  perform private.notify(p, at_t, 'MISSION_MISSED', 'MISSED:' || d, d,
    coalesce(l.on_missed #>> '{message,title}', '訊號中斷'),
    coalesce(l.on_missed #>> '{message,body}', '某個區域在你離開時關上了。紀錄已保存，但它不會再以原本的樣子出現。'));
end $$;

create or replace function private.refresh(p uuid) returns void
language plpgsql as $$
declare t timestamptz; l public.levels; w record; pl public.player_levels;
begin
  t := private.game_now(p);
  for l in select * from public.levels order by day loop
    insert into public.player_levels (profile_id, day) values (p, l.day) on conflict do nothing;
    select * into pl from public.player_levels where profile_id = p and day = l.day for update;
    select * into w from private.level_window(l.day);

    if pl.status = 'COMPLETED' or pl.missed_at is not null then continue; end if;
    if t < w.open_at then continue; end if;

    if t >= w.close_at then
      perform private.mark_missed(p, l.day, w.close_at);
    elsif pl.status = 'LOCKED' then
      update public.player_levels set status = 'AVAILABLE' where profile_id = p and day = l.day;
    end if;
  end loop;
end $$;

-- ───────────────────────── 關卡解析 ─────────────────────────
create or replace function private.route_config(l public.levels, pl public.player_levels) returns jsonb
language sql stable as $$
  select case when pl.missed_at is not null then l.alternate else l.config end;
$$;

-- 回傳實際生效的場景與步驟（變體 + 步驟條件皆依資料判斷）
create or replace function private.resolve(p uuid, l public.levels, pl public.player_levels) returns jsonb
language plpgsql stable as $$
declare cfg jsonb; v jsonb; scene jsonb; intro jsonb; steps jsonb; s jsonb; out_steps jsonb := '[]';
        hs jsonb; out_hs jsonb := '[]';
begin
  cfg := private.route_config(l, pl);
  scene := coalesce(cfg -> 'scene', '{}');
  intro := cfg -> 'intro';
  steps := coalesce(cfg -> 'steps', '[]');
  if pl.variant is not null and pl.variant <> 'base' then
    select x into v from jsonb_array_elements(coalesce(cfg -> 'variants', '[]')) x where x ->> 'id' = pl.variant;
    if v is not null then
      scene := scene || coalesce(v -> 'scene', '{}');
      intro := coalesce(v -> 'intro', intro);
      steps := coalesce(v -> 'steps', steps);
    end if;
  end if;
  for s in select * from jsonb_array_elements(steps) loop
    if private.eval_cond(p, s -> 'when') then
      out_steps := out_steps || (s - 'when');
    end if;
  end loop;
  for hs in select * from jsonb_array_elements(coalesce(scene -> 'hotspots', '[]')) loop
    if private.eval_cond(p, hs -> 'when') then out_hs := out_hs || (hs - 'when'); end if;
  end loop;
  scene := jsonb_set(scene, '{hotspots}', out_hs);
  return jsonb_build_object('scene', scene, 'intro', intro, 'steps', out_steps);
end $$;

-- 第 9 天「回放」：以玩家自己的資料動態建立卡片與正確順序
create or replace function private.timeline_cards(p uuid, upto int) returns jsonb
language plpgsql stable as $$
declare d int; card jsonb; cards jsonb := '[]'; ev record; pl public.player_levels; lv public.levels; inv record;
begin
  for d in 1..upto loop
    select * into pl from public.player_levels where profile_id = p and day = d;
    select * into lv from public.levels where day = d;
    if pl.status = 'COMPLETED' then
      select * into ev from public.evidence where profile_id = p and day = d and kind in ('text','photo','audio')
        and status <> 'REPLACED' order by submitted_at desc limit 1;
      select * into inv from public.inventory where profile_id = p and source_day = d and kind = 'symbol' limit 1;
      card := jsonb_build_object('id', md5(p::text || ':card:' || d), 'kind', coalesce(ev.kind, 'symbol'),
        'text', case when ev.kind = 'text' then left(ev.text_content, 60) else null end,
        'path', case when ev.kind in ('photo','audio') then ev.storage_path else null end,
        'symbol', (inv.data ->> 'symbol')::int, 'echo', coalesce((inv.data ->> 'echo')::boolean, false),
        'scene', lv.config #>> '{scene,theme}');
    else
      card := jsonb_build_object('id', md5(p::text || ':card:' || d), 'kind', 'void', 'text', null);
    end if;
    cards := cards || card;
  end loop;
  return cards;
end $$;

create or replace function private.public_step(p uuid, l public.levels, pl public.player_levels, s jsonb) returns jsonb
language plpgsql stable as $$
declare out jsonb := s; sid text := s ->> 'id'; src jsonb; t timestamptz; ev jsonb;
begin
  out := out || jsonb_build_object(
    'done', (pl.data -> 'done') ? sid,
    'reveal', pl.data #> array['reveals', sid],
    'hints', coalesce(pl.data #> array['hints', sid], '[]'),
    'hint_available', jsonb_array_length(coalesce(l.secrets #> array[sid, 'hints'], '[]')) > jsonb_array_length(coalesce(pl.data #> array['hints', sid], '[]')),
    'attempts', coalesce((pl.data #>> array['attempts', sid])::int, 0));
  if s ->> 'type' = 'ar' then
    out := out || jsonb_build_object('fallback_enabled', coalesce((l.ar_fallback ->> sid)::boolean, false));
  end if;
  if s ->> 'type' = 'timeline' then
    select coalesce(jsonb_agg(c order by md5(c ->> 'id' || 'shuffle')), '[]') into src
      from jsonb_array_elements(private.timeline_cards(p, coalesce((s ->> 'upto')::int, 8))) c;
    out := out || jsonb_build_object('cards', src);
  end if;
  if s ? 'inject_evidence_day' then
    select jsonb_build_object('kind', kind, 'text', text_content, 'path', storage_path) into ev
      from public.evidence where profile_id = p and day = (s ->> 'inject_evidence_day')::int
       and kind in ('text','photo','audio') and status <> 'REPLACED' order by submitted_at desc limit 1;
    out := out || jsonb_build_object('injected', coalesce(ev, '{"kind":"void"}'::jsonb));
  end if;
  if s ->> 'type' = 'evidence' then
    select jsonb_agg(jsonb_build_object('id', id, 'kind', e.kind, 'status', e.status, 'note', e.review_note,
                                        'submitted_at', e.submitted_at, 'text', e.text_content, 'path', e.storage_path) order by submitted_at)
      into ev from public.evidence e where profile_id = p and day = l.day and step_id = sid;
    out := out || jsonb_build_object('submissions', coalesce(ev, '[]'));
  end if;
  if s ->> 'type' = 'wait' then
    out := out || jsonb_build_object('started_at', pl.data #> array['started', sid]);
  end if;
  return out;
end $$;

create or replace function private.level_view(p uuid, d int) returns jsonb
language plpgsql stable as $$
declare l public.levels; pl public.player_levels; w record; r jsonb; steps jsonb := '[]'; s jsonb;
begin
  select * into l from public.levels where day = d;
  select * into pl from public.player_levels where profile_id = p and day = d;
  select * into w from private.level_window(d);
  r := private.resolve(p, l, pl);
  for s in select * from jsonb_array_elements(r -> 'steps') loop
    steps := steps || private.public_step(p, l, pl, s);
  end loop;
  return jsonb_build_object(
    'day', d, 'code', l.code, 'title', l.title, 'subtitle', l.subtitle,
    'status', pl.status, 'outcome', pl.outcome, 'variant', pl.variant,
    'route', case when pl.missed_at is not null then 'alternate' else 'main' end,
    'route_title', case when pl.missed_at is not null then l.alternate ->> 'route_title' else null end,
    'missed_at', pl.missed_at, 'started_at', pl.started_at, 'completed_at', pl.completed_at,
    'open_at', w.open_at, 'close_at', case when w.close_at = 'infinity' then null else w.close_at end,
    'scene', r -> 'scene', 'intro', r -> 'intro', 'steps', steps,
    'found', coalesce(pl.data -> 'found', '{}'),
    'server_now', private.game_now(p));
end $$;

-- ───────────────────────── 玩家 RPC ─────────────────────────
create or replace function public.bootstrap() returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare uid uuid := auth.uid(); em text := lower(coalesce(auth.jwt() ->> 'email', '')); adm boolean; allowed boolean; prof jsonb;
begin
  if uid is null then raise exception 'P030_NOT_SIGNED_IN' using errcode = '42501'; end if;
  if exists (select 1 from public.admin_emails where lower(email) = em) then
    insert into public.admins (user_id) values (uid) on conflict do nothing;
  end if;
  adm := exists (select 1 from public.admins where user_id = uid);
  allowed := adm or exists (select 1 from public.allowed_players where lower(email) = em);
  if allowed and not adm then
    insert into public.profiles (user_id, label) values (uid, em) on conflict do nothing;
  end if;
  select coalesce(jsonb_agg(jsonb_build_object('id', id, 'is_test', is_test, 'label', label) order by is_test, created_at), '[]')
    into prof from public.profiles where user_id = uid;
  return jsonb_build_object('is_admin', adm, 'allowed', allowed, 'email', em, 'profiles', prof);
end $$;

create or replace function private.state(p uuid) returns jsonb
language plpgsql stable as $$
declare t timestamptz; s public.settings; lv jsonb; inv jsonb; d int; ev jsonb; w record;
begin
  t := private.game_now(p);
  s := private.settings();
  d := private.game_day(t);
  select coalesce(jsonb_agg(jsonb_build_object(
      'day', l.day,
      'code', case when pl.status = 'LOCKED' then null else l.code end,
      'title', case when pl.status = 'LOCKED' then null else l.title end,
      'status', pl.status, 'outcome', pl.outcome, 'missed_at', pl.missed_at, 'completed_at', pl.completed_at,
      'open_at', (private.level_window(l.day)).open_at,
      'close_at', nullif((private.level_window(l.day)).close_at, 'infinity'),
      'route_title', case when pl.missed_at is not null then l.alternate ->> 'route_title' end
    ) order by l.day), '[]') into lv
    from public.levels l join public.player_levels pl on pl.day = l.day and pl.profile_id = p;
  select coalesce(jsonb_agg(jsonb_build_object(
      'key', i.item_key, 'kind', i.kind, 'name', i.name, 'description', i.description, 'data', i.data,
      'source_day', i.source_day, 'acquired_at', i.acquired_at,
      'digit', case when i.kind = 'symbol' then sy.digit end,
      'lore', case when i.kind = 'symbol' then (select coalesce(jsonb_agg(x ->> 'text'), '[]') from jsonb_array_elements(sy.lore) x where (x ->> 'from_day')::int <= d) end
    ) order by i.acquired_at), '[]') into inv
    from public.inventory i left join public.symbols sy on sy.id = (i.data ->> 'symbol')::int
   where i.profile_id = p;
  select coalesce(jsonb_agg(jsonb_build_object('at', e.at, 'type', e.type, 'day', e.day, 'payload', e.payload) order by e.at desc), '[]')
    into ev from (select * from public.event_log where profile_id = p order by at desc limit 80) e;
  return jsonb_build_object(
    'server_now', t, 'real_now', now(), 'tz', s.tz, 'birthday', s.birthday, 'start_date', s.birthday - 10,
    'game_day', d, 'levels', lv, 'inventory', inv, 'events', ev,
    'sample', private.sample_state(p),
    'observed_today', exists (select 1 from public.observations where profile_id = p and day = d),
    'stats', private.stats(p),
    'unread', (select count(*) from public.notifications where profile_id = p and read_at is null and created_at <= t),
    'portrait', (select jsonb_build_object('unlocked_via', unlocked_via, 'saved', saved_at is not null) from public.portrait_gift where profile_id = p),
    'finale', (select jsonb_build_object('defined', defined_at is not null, 'hunt_index', hunt_index, 'hunt_done', hunt_done_at is not null)
               from public.finale_progress where profile_id = p),
    'is_test', (select is_test from public.profiles where id = p));
end $$;

create or replace function public.get_state(p uuid) returns jsonb
language plpgsql security definer set search_path = public, private as $$
begin
  perform private.assert_profile(p);
  perform private.refresh(p);
  return private.state(p);
end $$;

create or replace function public.open_level(p uuid, d int) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare t timestamptz; l public.levels; pl public.player_levels; cfg jsonb; v jsonb; vid text := 'base';
begin
  perform private.assert_profile(p);
  perform private.refresh(p);
  t := private.game_now(p);
  select * into l from public.levels where day = d;
  if l.day is null then raise exception 'P030_NO_SUCH_LEVEL'; end if;
  select * into pl from public.player_levels where profile_id = p and day = d for update;
  if pl.status = 'LOCKED' then raise exception 'P030_LOCKED' using errcode = 'P0001'; end if;

  if pl.variant is null and pl.status <> 'MISSED' then
    cfg := private.route_config(l, pl);
    for v in select * from jsonb_array_elements(coalesce(cfg -> 'variants', '[]')) loop
      if private.eval_cond(p, v -> 'when') then vid := v ->> 'id'; exit; end if;
    end loop;
    update public.player_levels set variant = vid where profile_id = p and day = d;
    perform private.log(p, t, 'ROUTE', d, jsonb_build_object('variant', vid, 'route', case when pl.missed_at is null then 'main' else 'alternate' end));
  end if;
  if pl.status = 'AVAILABLE' then
    update public.player_levels set status = 'IN_PROGRESS', started_at = t where profile_id = p and day = d;
    perform private.log(p, t, 'STARTED', d, '{}');
  elsif pl.status = 'ALTERNATE' and pl.started_at is null then
    update public.player_levels set started_at = t where profile_id = p and day = d;
  end if;
  return private.level_view(p, d);
end $$;

create or replace function private.complete_level(p uuid, d int, t timestamptz) returns jsonb
language plpgsql as $$
declare l public.levels; pl public.player_levels; eff jsonb; gained jsonb; outc text;
begin
  select * into l from public.levels where day = d;
  select * into pl from public.player_levels where profile_id = p and day = d;
  outc := case when pl.missed_at is null then 'ON_TIME' else 'ALTERNATE' end;
  update public.player_levels set status = 'COMPLETED', outcome = outc, completed_at = t where profile_id = p and day = d;
  eff := case when outc = 'ON_TIME' then l.on_complete else l.on_alternate_complete end;
  gained := private.apply_effects(p, t, eff, d, case when outc = 'ON_TIME' then 'complete:' else 'alternate:' end || d);
  perform private.log(p, t, 'COMPLETED', d, jsonb_build_object('outcome', outc, 'gained', gained));
  return jsonb_build_object('outcome', outc, 'gained', gained, 'epilogue',
    case when outc = 'ON_TIME' then l.config -> 'epilogue' else l.alternate -> 'epilogue' end);
end $$;

create or replace function private.check_completion(p uuid, d int, t timestamptz) returns jsonb
language plpgsql as $$
declare l public.levels; pl public.player_levels; r jsonb; s jsonb;
begin
  select * into l from public.levels where day = d;
  select * into pl from public.player_levels where profile_id = p and day = d;
  if pl.status = 'COMPLETED' then return null; end if;
  r := private.resolve(p, l, pl);
  for s in select * from jsonb_array_elements(r -> 'steps') loop
    if not coalesce((s ->> 'optional')::boolean, false) and not ((pl.data -> 'done') ? (s ->> 'id')) then
      return null;
    end if;
  end loop;
  return private.complete_level(p, d, t);
end $$;

create or replace function private.find_step(p uuid, l public.levels, pl public.player_levels, sid text, out step jsonb, out prior_ok boolean)
language plpgsql stable as $$
declare r jsonb; s jsonb;
begin
  prior_ok := true;
  r := private.resolve(p, l, pl);
  for s in select * from jsonb_array_elements(r -> 'steps') loop
    if s ->> 'id' = sid then step := s; return; end if;
    if not coalesce((s ->> 'optional')::boolean, false) and not ((pl.data -> 'done') ? (s ->> 'id')) then
      prior_ok := false;
    end if;
  end loop;
end $$;

create or replace function private.load_active(p uuid, d int) returns void
language plpgsql as $$
declare st text;
begin
  select status into st from public.player_levels where profile_id = p and day = d for update;
  if st is null or st in ('LOCKED', 'MISSED') then raise exception 'P030_NOT_PLAYABLE'; end if;
  if st = 'COMPLETED' then raise exception 'P030_ALREADY_COMPLETED'; end if;
end $$;

create or replace function public.submit_step(p uuid, d int, step_id text, answer jsonb) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare
  t timestamptz; l public.levels; pl public.player_levels; st jsonb; prior_ok boolean; sec jsonb;
  ok boolean := false; ans text; expected jsonb; att int; msg text; mode text; local_t time; s public.settings;
  cards jsonb; exp_order text; sel text; completion jsonb; reveal jsonb;
begin
  perform private.assert_profile(p);
  perform private.refresh(p);
  t := private.game_now(p);
  perform private.load_active(p, d);
  select * into l from public.levels where day = d;
  select * into pl from public.player_levels where profile_id = p and day = d;
  select * into st, prior_ok from private.find_step(p, l, pl, step_id);
  if st is null then raise exception 'P030_NO_SUCH_STEP'; end if;
  if (pl.data -> 'done') ? step_id then return jsonb_build_object('correct', true, 'already', true); end if;
  if not prior_ok then raise exception 'P030_STEP_ORDER'; end if;

  -- 特定時段任務
  if st ? 'window' then
    s := private.settings();
    local_t := (t at time zone s.tz)::time;
    if local_t < (st #>> '{window,from}')::time or local_t > (st #>> '{window,to}')::time then
      return jsonb_build_object('correct', false, 'message', coalesce(st #>> '{window,closed_text}', '這個機關現在沒有反應。'));
    end if;
  end if;

  sec := l.secrets -> step_id;
  ans := answer ->> 'value';

  case st ->> 'type'
    when 'story', 'observe_hint', 'archive' then ok := true;
    when 'choice' then
      sel := answer ->> 'option';
      if not exists (select 1 from jsonb_array_elements(st -> 'options') o where o ->> 'id' = sel) then
        raise exception 'P030_BAD_OPTION';
      end if;
      ok := true;
      insert into public.flags (profile_id, key, value, source, set_at)
      values (p, 'choice:' || (st ->> 'flag'), to_jsonb(sel), 'day:' || d, t)
      on conflict (profile_id, key) do update set value = excluded.value, set_at = excluded.set_at, source = excluded.source;
      insert into public.evidence (profile_id, day, step_id, kind, payload, status, on_time, submitted_at)
      values (p, d, step_id, 'choice', jsonb_build_object('option', sel), 'APPROVED', pl.missed_at is null, t);
      perform private.log(p, t, 'CHOICE', d, jsonb_build_object('flag', st ->> 'flag', 'option', sel));
    when 'ar' then
      if (answer ->> 'target') is not null and (answer ->> 'target')::int = (st ->> 'target')::int then
        ok := true; mode := 'scan';
      elsif (answer ->> 'code') is not null and coalesce((l.ar_fallback ->> step_id)::boolean, false)
            and private.norm(answer ->> 'code') = private.norm(sec ->> 'fallback') then
        ok := true; mode := 'fallback';
      elsif (answer ->> 'code') is not null and not coalesce((l.ar_fallback ->> step_id)::boolean, false) then
        raise exception 'P030_FALLBACK_DISABLED';
      end if;
      if ok then
        insert into public.evidence (profile_id, day, step_id, kind, payload, status, on_time, submitted_at)
        values (p, d, step_id, 'scan', jsonb_build_object('mode', mode, 'target', answer -> 'target'), 'APPROVED', pl.missed_at is null, t);
        perform private.log(p, t, 'SCAN', d, jsonb_build_object('mode', mode, 'target', answer -> 'target'));
      end if;
    when 'wait' then
      if pl.data #> array['started', step_id] is null then
        update public.player_levels set data = jsonb_set(data, array['started', step_id], to_jsonb(t)) where profile_id = p and day = d;
        return jsonb_build_object('correct', false, 'started', true, 'message', st ->> 'start_text');
      end if;
      ok := t >= (pl.data #>> array['started', step_id])::timestamptz + make_interval(secs => (st ->> 'seconds')::int);
      if not ok then
        update public.player_levels set data = jsonb_set(data, array['started', step_id], to_jsonb(t)) where profile_id = p and day = d;
        return jsonb_build_object('correct', false, 'message', coalesce(st ->> 'early_text', '太快了。重新開始等待。'));
      end if;
    when 'timeline' then
      cards := private.timeline_cards(p, coalesce((st ->> 'upto')::int, 8));
      select string_agg(c ->> 'id', ',' order by ord) into exp_order from jsonb_array_elements(cards) with ordinality x(c, ord);
      ok := private.norm(ans) = private.norm(exp_order);
    when 'observe' then
      ok := exists (select 1 from public.observations where profile_id = p and day = private.game_day(t));
      if not ok then return jsonb_build_object('correct', false, 'message', '培養艙尚未記錄今天的觀測。'); end if;
    when 'evidence' then
      raise exception 'P030_USE_SUBMIT_EVIDENCE';
    else
      expected := sec -> 'answer';
      if expected is null then raise exception 'P030_STEP_HAS_NO_ANSWER %', step_id; end if;
      if jsonb_typeof(expected) = 'array' then
        ok := exists (select 1 from jsonb_array_elements_text(expected) e where private.norm(e) = private.norm(ans));
      else
        ok := private.norm(expected #>> '{}') = private.norm(ans);
      end if;
  end case;

  if not ok then
    att := coalesce((pl.data #>> array['attempts', step_id])::int, 0) + 1;
    update public.player_levels set data = jsonb_set(data, array['attempts', step_id], to_jsonb(att)) where profile_id = p and day = d;
    msg := coalesce(sec ->> 'wrong', '沒有反應。');
    return jsonb_build_object('correct', false, 'attempts', att, 'message', msg);
  end if;

  reveal := sec -> 'reveal';
  update public.player_levels
     set data = jsonb_set(jsonb_set(data, array['done', step_id], to_jsonb(t)), array['reveals', step_id], coalesce(reveal, 'null'))
   where profile_id = p and day = d;
  perform private.apply_effects(p, t, sec -> 'grant', d, 'step:' || d || ':' || step_id);
  completion := private.check_completion(p, d, t);
  return jsonb_build_object('correct', true, 'reveal', reveal, 'success_text', sec ->> 'success',
                            'completed', completion is not null, 'completion', completion, 'mode', mode);
end $$;

create or replace function public.explore(p uuid, d int, spot text) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare t timestamptz; l public.levels; pl public.player_levels; r jsonb; sec jsonb; gained jsonb;
begin
  perform private.assert_profile(p);
  perform private.refresh(p);
  t := private.game_now(p);
  select * into l from public.levels where day = d;
  select * into pl from public.player_levels where profile_id = p and day = d for update;
  if pl.status in ('LOCKED', 'MISSED') then raise exception 'P030_NOT_PLAYABLE'; end if;
  r := private.resolve(p, l, pl);
  if not exists (select 1 from jsonb_array_elements(r #> '{scene,hotspots}') h where h ->> 'id' = spot) then
    raise exception 'P030_NO_SUCH_SPOT';
  end if;
  sec := l.secrets -> 'hotspots' -> spot;
  if (pl.data -> 'found') ? spot then return jsonb_build_object('text', sec ->> 'text', 'already', true); end if;
  update public.player_levels set data = jsonb_set(data, array['found', spot], to_jsonb(t))
   where profile_id = p and day = d;
  gained := private.apply_effects(p, t, sec -> 'grant', d, 'explore:' || d || ':' || spot);
  perform private.log(p, t, 'EXPLORE', d, jsonb_build_object('spot', spot, 'gained', gained));
  return jsonb_build_object('text', sec ->> 'text', 'gained', gained);
end $$;

create or replace function public.request_hint(p uuid, d int, step_id text) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare t timestamptz; l public.levels; pl public.player_levels; used jsonb; all_h jsonb; nxt jsonb;
begin
  perform private.assert_profile(p);
  t := private.game_now(p);
  perform private.load_active(p, d);
  select * into l from public.levels where day = d;
  select * into pl from public.player_levels where profile_id = p and day = d;
  used := coalesce(pl.data #> array['hints', step_id], '[]');
  all_h := coalesce(l.secrets #> array[step_id, 'hints'], '[]');
  if jsonb_array_length(used) >= jsonb_array_length(all_h) then
    return jsonb_build_object('hint', null, 'hints', used);
  end if;
  nxt := all_h -> jsonb_array_length(used);
  used := used || nxt;
  update public.player_levels set data = jsonb_set(data, array['hints', step_id], used) where profile_id = p and day = d;
  perform private.log(p, t, 'HINT', d, jsonb_build_object('step', step_id, 'n', jsonb_array_length(used)));
  return jsonb_build_object('hint', nxt, 'hints', used);
end $$;

create or replace function public.submit_evidence(p uuid, d int, step_id text, kind text, path text, content text) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare t timestamptz; l public.levels; pl public.player_levels; st jsonb; prior_ok boolean; eid uuid; completion jsonb;
        last_status text;
begin
  perform private.assert_profile(p);
  perform private.refresh(p);
  t := private.game_now(p);
  select * into pl from public.player_levels where profile_id = p and day = d for update;
  select * into l from public.levels where day = d;
  if pl.status in ('LOCKED', 'MISSED') then raise exception 'P030_NOT_PLAYABLE'; end if;
  select * into st, prior_ok from private.find_step(p, l, pl, step_id);
  if st is null or st ->> 'type' <> 'evidence' then raise exception 'P030_NO_SUCH_STEP'; end if;
  if not (st -> 'kinds') ? kind then raise exception 'P030_BAD_EVIDENCE_KIND'; end if;

  select e.status into last_status from public.evidence e
   where e.profile_id = p and e.day = d and e.step_id = submit_evidence.step_id and e.status <> 'REPLACED'
   order by e.submitted_at desc limit 1;
  if pl.status = 'COMPLETED' and coalesce(last_status, '') <> 'NEEDS_MORE' then raise exception 'P030_ALREADY_COMPLETED'; end if;
  if (pl.data -> 'done') ? step_id and coalesce(last_status, '') <> 'NEEDS_MORE' then raise exception 'P030_ALREADY_SUBMITTED'; end if;
  if not prior_ok and not ((pl.data -> 'done') ? step_id) then raise exception 'P030_STEP_ORDER'; end if;

  if kind in ('photo', 'audio') then
    if path is null or split_part(path, '/', 1) <> p::text then raise exception 'P030_BAD_PATH'; end if;
  elsif kind = 'text' then
    if length(trim(coalesce(content, ''))) = 0 then raise exception 'P030_EMPTY_TEXT'; end if;
    path := null;
  end if;

  update public.evidence e set status = 'REPLACED'
   where e.profile_id = p and e.day = d and e.step_id = submit_evidence.step_id and e.status = 'NEEDS_MORE';
  insert into public.evidence (profile_id, day, step_id, kind, storage_path, text_content, status, on_time, submitted_at)
  values (p, d, step_id, kind, path, left(content, 4000), 'PENDING_REVIEW', pl.missed_at is null, t)
  returning id into eid;
  perform private.log(p, t, 'EVIDENCE', d, jsonb_build_object('kind', kind, 'step', step_id, 'id', eid));
  if not ((pl.data -> 'done') ? step_id) then
    update public.player_levels set data = jsonb_set(data, array['done', step_id], to_jsonb(t)) where profile_id = p and day = d;
    completion := private.check_completion(p, d, t);
  end if;
  return jsonb_build_object('id', eid, 'status', 'PENDING_REVIEW', 'completed', completion is not null, 'completion', completion);
end $$;

create or replace function public.observe(p uuid, action text) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare t timestamptz; d int;
begin
  perform private.assert_profile(p);
  perform private.refresh(p);
  t := private.game_now(p);
  d := private.game_day(t);
  if d < 1 or d > 11 then raise exception 'P030_OUTSIDE_GAME'; end if;
  if action not in ('explore', 'preserve', 'adjust', 'rest') then raise exception 'P030_BAD_ACTION'; end if;
  insert into public.observations (profile_id, day, action, at) values (p, d, action, t);
  insert into public.inventory (profile_id, item_key, kind, name, description, source_day, acquired_at)
  values (p, 'sample:030', 'sample', '030號未知樣本', '來源不明。它會記得你如何觀測它。', d, t) on conflict do nothing;
  perform private.log(p, t, 'OBSERVE', d, jsonb_build_object('action', action));
  return private.sample_state(p);
exception when unique_violation then
  raise exception 'P030_ALREADY_OBSERVED';
end $$;

-- ───────────────────────── 通知 RPC ─────────────────────────
create or replace function public.list_notifications(p uuid) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare t timestamptz;
begin
  perform private.assert_profile(p);
  perform private.refresh(p);
  t := private.game_now(p);
  return (select coalesce(jsonb_agg(to_jsonb(n) - 'profile_id' - 'dedupe_key' order by created_at desc), '[]')
            from (select * from public.notifications where profile_id = p and created_at <= t order by created_at desc limit 100) n);
end $$;

create or replace function public.mark_notifications_read(p uuid) returns void
language plpgsql security definer set search_path = public, private as $$
begin
  perform private.assert_profile(p);
  update public.notifications set read_at = now() where profile_id = p and read_at is null;
end $$;

create or replace function public.get_prefs(p uuid) returns jsonb
language plpgsql security definer set search_path = public, private as $$
begin
  perform private.assert_profile(p);
  insert into public.notification_prefs (profile_id) values (p) on conflict do nothing;
  return (select to_jsonb(n) - 'profile_id' || jsonb_build_object('subscriptions', (select count(*) from public.push_subscriptions where profile_id = p))
            from public.notification_prefs n where profile_id = p);
end $$;

create or replace function public.save_prefs(p uuid, prefs jsonb) returns jsonb
language plpgsql security definer set search_path = public, private as $$
begin
  perform private.assert_profile(p);
  insert into public.notification_prefs (profile_id) values (p) on conflict do nothing;
  update public.notification_prefs set
    push_enabled = coalesce((prefs ->> 'push_enabled')::boolean, push_enabled),
    types = case when prefs ? 'types' then types || (prefs -> 'types') else types end,
    quiet_start = case when prefs ? 'quiet_start' then nullif(prefs ->> 'quiet_start', '')::time else quiet_start end,
    quiet_end = case when prefs ? 'quiet_end' then nullif(prefs ->> 'quiet_end', '')::time else quiet_end end,
    updated_at = now()
  where profile_id = p;
  return public.get_prefs(p);
end $$;

create or replace function public.save_push_subscription(p uuid, sub jsonb) returns void
language plpgsql security definer set search_path = public, private as $$
begin
  perform private.assert_profile(p);
  insert into public.push_subscriptions (profile_id, endpoint, p256dh, auth)
  values (p, sub ->> 'endpoint', sub #>> '{keys,p256dh}', sub #>> '{keys,auth}')
  on conflict (endpoint) do update set profile_id = excluded.profile_id, p256dh = excluded.p256dh, auth = excluded.auth;
end $$;

create or replace function public.delete_push_subscription(p uuid, endpoint text) returns void
language plpgsql security definer set search_path = public, private as $$
begin
  perform private.assert_profile(p);
  delete from public.push_subscriptions s where s.profile_id = p and s.endpoint = delete_push_subscription.endpoint;
end $$;

-- ───────────────────────── 生日禮物一：形象照 ─────────────────────────
create or replace function public.get_portrait(p uuid) returns jsonb
language plpgsql security definer set search_path = public, private as $$
begin
  perform private.assert_profile(p);
  return (select to_jsonb(g) - 'profile_id' from public.portrait_gift g where profile_id = p);
end $$;

create or replace function public.save_portrait(p uuid, choice jsonb, refs text[]) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare t timestamptz;
begin
  perform private.assert_profile(p);
  t := private.game_now(p);
  if not exists (select 1 from public.portrait_gift where profile_id = p) then raise exception 'P030_GIFT_LOCKED'; end if;
  if exists (select 1 from unnest(coalesce(refs, '{}')) r where split_part(r, '/', 1) <> p::text) then raise exception 'P030_BAD_PATH'; end if;
  update public.portrait_gift set choice = coalesce(save_portrait.choice, '{}'), reference_paths = coalesce(refs, '{}'), saved_at = t
   where profile_id = p;
  perform private.log(p, t, 'PORTRAIT_SAVED', null, coalesce(save_portrait.choice, '{}'));
  return public.get_portrait(p);
end $$;

-- ───────────────────────── 終章 ─────────────────────────
create or replace function private.assert_finale_open(p uuid) returns void
language plpgsql stable as $$
begin
  if private.game_now(p) < (private.level_window(11)).open_at then raise exception 'P030_FINALE_LOCKED'; end if;
end $$;

create or replace function public.finale_archive(p uuid) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare days jsonb; lines jsonb := '[]'; ln jsonb; cfg jsonb;
begin
  perform private.assert_profile(p);
  perform private.refresh(p);
  perform private.assert_finale_open(p);
  select coalesce(jsonb_agg(jsonb_build_object(
      'day', l.day, 'code', l.code, 'title', l.title, 'status', pl.status, 'outcome', pl.outcome,
      'missed_at', pl.missed_at, 'completed_at', pl.completed_at,
      'route_title', case when pl.missed_at is not null then l.alternate ->> 'route_title' end,
      'evidence', (select coalesce(jsonb_agg(jsonb_build_object('kind', e.kind, 'text', e.text_content, 'path', e.storage_path,
                                                               'status', e.status, 'payload', e.payload, 'on_time', e.on_time) order by e.submitted_at), '[]')
                     from public.evidence e where e.profile_id = p and e.day = l.day and e.status <> 'REPLACED'),
      'symbols', (select coalesce(jsonb_agg(jsonb_build_object('key', i.item_key, 'name', i.name, 'data', i.data)), '[]')
                    from public.inventory i where i.profile_id = p and i.source_day = l.day and i.kind = 'symbol')
    ) order by l.day), '[]') into days
    from public.levels l join public.player_levels pl on pl.profile_id = p and pl.day = l.day
   where l.day <= 10;
  select config into cfg from public.levels where day = 11;
  for ln in select * from jsonb_array_elements(coalesce(cfg -> 'monologue', '[]')) loop
    if private.eval_cond(p, ln -> 'when') then lines := lines || to_jsonb(ln ->> 'text'); end if;
  end loop;
  return jsonb_build_object('days', days, 'sample', private.sample_state(p), 'stats', private.stats(p),
    'monologue', lines, 'progress', (select to_jsonb(f) - 'profile_id' from public.finale_progress f where profile_id = p),
    'portrait', (select jsonb_build_object('unlocked_via', unlocked_via, 'choice', choice) from public.portrait_gift where profile_id = p),
    'choices', (private.stats(p) -> 'choices'));
end $$;

create or replace function public.submit_definition(p uuid, definition text, skipped boolean) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare t timestamptz;
begin
  perform private.assert_profile(p);
  perform private.assert_finale_open(p);
  t := private.game_now(p);
  insert into public.finale_progress (profile_id) values (p) on conflict do nothing;
  update public.finale_progress
     set definition = case when submit_definition.skipped then null else left(trim(submit_definition.definition), 2000) end,
         skipped = coalesce(submit_definition.skipped, false), defined_at = t
   where profile_id = p;
  perform private.log(p, t, 'DEFINED', 11, jsonb_build_object('skipped', coalesce(submit_definition.skipped, false)));
  -- 讓使用者的檔案永遠保持「持續更新中」：可以一再改寫
  return jsonb_build_object('lines', jsonb_build_array('定義權限已移交本人。', '檔案狀態：持續更新中。'));
end $$;

create or replace function public.finale_hunt(p uuid) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare fp public.finale_progress; fc public.finale_config; steps jsonb := '[]'; i int; n int;
begin
  perform private.assert_profile(p);
  perform private.assert_finale_open(p);
  select * into fp from public.finale_progress where profile_id = p;
  if fp.defined_at is null then raise exception 'P030_DEFINE_FIRST'; end if;
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
  if fp.defined_at is null then raise exception 'P030_DEFINE_FIRST'; end if;
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
