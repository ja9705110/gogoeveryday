-- PROJECT 030 · 管理者、測試模式、通知排程、權限

-- ───────────────────────── 管理者 RPC ─────────────────────────
create or replace function public.admin_overview() returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare out jsonb; pr record;
begin
  perform private.assert_admin();
  for pr in select id from public.profiles loop perform private.refresh(pr.id); end loop;
  select jsonb_build_object(
    'settings', (select to_jsonb(s) from public.settings s where id = 1),
    'server_now', now(),
    'game_day', private.game_day(now()),
    'profiles', (select coalesce(jsonb_agg(jsonb_build_object(
        'id', pf.id, 'is_test', pf.is_test, 'label', pf.label,
        'email', (select email from auth.users u where u.id = pf.user_id),
        'game_now', private.game_now(pf.id), 'game_day', private.game_day(private.game_now(pf.id)),
        'levels', (select jsonb_agg(jsonb_build_object('day', day, 'status', status, 'outcome', outcome, 'variant', variant, 'missed_at', missed_at) order by day)
                     from public.player_levels where profile_id = pf.id),
        'stats', private.stats(pf.id),
        'sample', private.sample_state(pf.id) - 'history'
      ) order by pf.is_test, pf.created_at), '[]') from public.profiles pf),
    'pending_evidence', (select count(*) from public.evidence where status = 'PENDING_REVIEW'),
    'allowed_players', (select coalesce(jsonb_agg(to_jsonb(a)), '[]') from public.allowed_players a)
  ) into out;
  return out;
end $$;

create or replace function public.admin_profile_state(p uuid) returns jsonb
language plpgsql security definer set search_path = public, private as $$
begin
  perform private.assert_admin();
  perform private.refresh(p);
  return private.state(p) || jsonb_build_object(
    'flags', (select coalesce(jsonb_object_agg(key, value), '{}') from public.flags where profile_id = p),
    'events_full', (select coalesce(jsonb_agg(to_jsonb(e) - 'profile_id' order by at), '[]') from public.event_log e where profile_id = p),
    'notifications', (select coalesce(jsonb_agg(to_jsonb(n) - 'profile_id' order by created_at desc), '[]') from public.notifications n where profile_id = p),
    'finale_progress', (select to_jsonb(f) from public.finale_progress f where profile_id = p),
    'portrait', (select to_jsonb(g) from public.portrait_gift g where profile_id = p));
end $$;

create or replace function public.admin_list_evidence(filter_status text) returns jsonb
language plpgsql security definer set search_path = public, private as $$
begin
  perform private.assert_admin();
  return (select coalesce(jsonb_agg(to_jsonb(e) || jsonb_build_object(
            'profile_label', pf.label, 'is_test', pf.is_test, 'level_title', l.title) order by e.submitted_at desc), '[]')
            from public.evidence e join public.profiles pf on pf.id = e.profile_id join public.levels l on l.day = e.day
           where (filter_status is null or e.status = filter_status) and e.kind in ('photo','audio','text'));
end $$;

create or replace function public.admin_review_evidence(eid uuid, new_status text, note text) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare e public.evidence; t timestamptz;
begin
  perform private.assert_admin();
  if new_status not in ('APPROVED', 'NEEDS_MORE', 'PENDING_REVIEW') then raise exception 'P030_BAD_STATUS'; end if;
  select * into e from public.evidence where id = eid for update;
  if e.id is null then raise exception 'P030_NOT_FOUND'; end if;
  t := private.game_now(e.profile_id);
  update public.evidence set status = new_status, review_note = note, reviewed_at = now(), reviewer = auth.uid() where id = eid;
  perform private.log(e.profile_id, t, 'REVIEW', e.day, jsonb_build_object('evidence', eid, 'status', new_status));
  if new_status = 'APPROVED' then
    insert into public.flags (profile_id, key, value, source, set_at) values (e.profile_id, 'evidence_ok:' || e.day, 'true', 'review', t)
    on conflict (profile_id, key) do update set value = 'true', set_at = excluded.set_at;
    perform private.notify(e.profile_id, t, 'SPECIAL_EVENT', 'REVIEW:' || eid || ':ok', e.day, '樣本比對完成',
      '你提交的紀錄已通過比對，已歸檔至第 ' || e.day || ' 區。');
  elsif new_status = 'NEEDS_MORE' then
    perform private.notify(e.profile_id, t, 'SPECIAL_EVENT', 'REVIEW:' || eid || ':more', e.day, '紀錄需要補充',
      coalesce(nullif(note, ''), '系統無法辨識這份紀錄。請在區域關閉前補充。'));
  end if;
  return to_jsonb(e) || jsonb_build_object('status', new_status);
end $$;

create or replace function public.admin_delete_evidence(eid uuid) returns text
language plpgsql security definer set search_path = public, private as $$
declare pth text; e public.evidence;
begin
  perform private.assert_admin();
  delete from public.evidence where id = eid returning * into e;
  if e.id is null then raise exception 'P030_NOT_FOUND'; end if;
  perform private.log(e.profile_id, now(), 'EVIDENCE_DELETED', e.day, jsonb_build_object('evidence', eid, 'kind', e.kind));
  return e.storage_path;
end $$;

create or replace function public.admin_trigger_event(target uuid, title text, body text, effects jsonb) returns int
language plpgsql security definer set search_path = public, private as $$
declare pr record; n int := 0; t timestamptz; k text := md5(random()::text || clock_timestamp()::text);
begin
  perform private.assert_admin();
  for pr in select id from public.profiles where (target is null and not is_test) or id = target loop
    t := private.game_now(pr.id);
    perform private.apply_effects(pr.id, t, coalesce(effects, '{}'), private.game_day(t), 'admin_event');
    perform private.notify(pr.id, t, 'SPECIAL_EVENT', 'ADMIN:' || k, private.game_day(t), title, body);
    perform private.log(pr.id, t, 'SPECIAL_EVENT', private.game_day(t), jsonb_build_object('title', title, 'effects', effects));
    n := n + 1;
  end loop;
  return n;
end $$;

create or replace function public.admin_grant_portrait(p uuid) returns void
language plpgsql security definer set search_path = public, private as $$
begin
  perform private.assert_admin();
  perform private.apply_effects(p, private.game_now(p), '{"gift":"portrait"}', null, 'admin');
end $$;

create or replace function public.admin_set_ar_fallback(d int, step_id text, enabled boolean) returns jsonb
language plpgsql security definer set search_path = public, private as $$
begin
  perform private.assert_admin();
  update public.levels set ar_fallback = ar_fallback || jsonb_build_object(step_id, enabled), updated_at = now() where day = d;
  return (select ar_fallback from public.levels where day = d);
end $$;

create or replace function public.admin_export() returns jsonb
language plpgsql security definer set search_path = public, private as $$
begin
  perform private.assert_admin();
  return jsonb_build_object(
    'exported_at', now(),
    'settings', (select to_jsonb(s) from public.settings s),
    'levels', (select jsonb_agg(to_jsonb(l) order by day) from public.levels l),
    'symbols', (select jsonb_agg(to_jsonb(s) order by id) from public.symbols s),
    'finale_config', (select to_jsonb(f) from public.finale_config f),
    'allowed_players', (select coalesce(jsonb_agg(to_jsonb(a)), '[]') from public.allowed_players a),
    'profiles', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from public.profiles x),
    'player_levels', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from public.player_levels x),
    'flags', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from public.flags x),
    'inventory', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from public.inventory x),
    'event_log', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from public.event_log x),
    'observations', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from public.observations x),
    'evidence', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from public.evidence x),
    'notifications', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from public.notifications x),
    'portrait_gift', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from public.portrait_gift x),
    'finale_progress', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from public.finale_progress x));
end $$;

-- ───────────────────────── 測試模式（只作用於 is_test 檔案） ─────────────────────────
create or replace function private.assert_test(p uuid) returns void
language plpgsql stable as $$
begin
  perform private.assert_admin();
  if not exists (select 1 from public.profiles where id = p and is_test and user_id = auth.uid()) then
    raise exception 'P030_NOT_A_TEST_PROFILE' using errcode = '42501';
  end if;
end $$;

create or replace function public.admin_create_test_profile(label text, sim_at timestamptz) returns uuid
language plpgsql security definer set search_path = public, private as $$
declare pid uuid;
begin
  perform private.assert_admin();
  insert into public.profiles (user_id, is_test, label, sim_offset)
  values (auth.uid(), true, coalesce(nullif(label, ''), '測試檔案'), case when sim_at is null then null else sim_at - now() end)
  returning id into pid;
  perform private.refresh(pid);
  return pid;
end $$;

create or replace function public.admin_set_test_time(p uuid, sim_at timestamptz) returns jsonb
language plpgsql security definer set search_path = public, private as $$
begin
  perform private.assert_test(p);
  update public.profiles set sim_offset = case when sim_at is null then null else sim_at - now() end where id = p;
  perform private.refresh(p);
  return private.state(p);
end $$;

-- action: complete | complete_alt | miss | open
create or replace function public.admin_test_force(p uuid, d int, action text) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare t timestamptz; pl public.player_levels;
begin
  perform private.assert_test(p);
  perform private.refresh(p);
  t := private.game_now(p);
  select * into pl from public.player_levels where profile_id = p and day = d;
  if action = 'miss' then
    perform private.mark_missed(p, d, t);
  elsif action = 'complete' then
    if pl.missed_at is not null then raise exception 'P030_ALREADY_MISSED'; end if;
    if pl.status <> 'COMPLETED' then perform private.complete_level(p, d, t); end if;
  elsif action = 'complete_alt' then
    if pl.missed_at is null then perform private.mark_missed(p, d, t); end if;
    select * into pl from public.player_levels where profile_id = p and day = d;
    if pl.status <> 'COMPLETED' then perform private.complete_level(p, d, t); end if;
  elsif action = 'open' then
    update public.player_levels set status = 'AVAILABLE' where profile_id = p and day = d and status = 'LOCKED';
  else
    raise exception 'P030_BAD_ACTION';
  end if;
  return private.state(p);
end $$;

create or replace function public.admin_test_observe(p uuid, d int, action text) returns jsonb
language plpgsql security definer set search_path = public, private as $$
begin
  perform private.assert_test(p);
  if action is null then
    delete from public.observations where profile_id = p and day = d;
  else
    insert into public.observations (profile_id, day, action, at) values (p, d, action, private.game_now(p))
    on conflict (profile_id, day) do update set action = excluded.action;
  end if;
  return private.sample_state(p);
end $$;

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
  perform set_config('p030.purge_test', 'off', true);
  perform private.refresh(p);
end $$;

create or replace function public.admin_delete_test_profile(p uuid) returns void
language plpgsql security definer set search_path = public, private as $$
begin
  perform private.assert_test(p);
  perform set_config('p030.purge_test', 'on', true);
  delete from public.profiles where id = p;
  perform set_config('p030.purge_test', 'off', true);
end $$;

-- ───────────────────────── 提醒產生器（排程呼叫） ─────────────────────────
create or replace function private.generate_reminders(p uuid) returns int
language plpgsql as $$
declare t timestamptz; s public.settings; d int; pl public.player_levels; l public.levels; w record;
        local_t time; sent int; created int := 0; countdown int;
begin
  t := private.game_now(p);
  s := private.settings();
  d := private.game_day(t);
  if d < 1 or d > 11 then return 0; end if;
  select * into l from public.levels where day = d;
  select * into pl from public.player_levels where profile_id = p and day = d;
  select * into w from private.level_window(d);
  if t < w.open_at then return 0; end if;
  countdown := 11 - d;

  if d = 11 then
    if private.notify(p, t, 'NEW_MISSION', 'NEW:11', 11, '第030號檔案室', '所有區域的紀錄已移入同一個房間。門沒有上鎖。') then created := created + 1; end if;
    return created;
  end if;

  if private.notify(p, t, 'NEW_MISSION', 'NEW:' || d, d, 'D-' || countdown || '｜新區域解除封鎖',
       coalesce(l.config #>> '{notify,new}', '偵測到新的異常訊號。區域將於今日 23:59:59 重新封閉。')) then created := created + 1; end if;

  if pl.status in ('COMPLETED', 'MISSED') or pl.missed_at is not null or t >= w.close_at then return created; end if;
  local_t := (t at time zone s.tz)::time;
  select count(*) into sent from public.notifications
   where profile_id = p and day = d and type in ('MISSION_PENDING', 'MISSION_EXPIRING');

  if local_t >= s.pending_reminder and sent < s.daily_reminder_cap and local_t < s.expiring_reminder then
    if private.notify(p, t, 'MISSION_PENDING', 'PENDING:' || d, d, '觀測站仍在等待',
         coalesce(l.config #>> '{notify,pending}', '今天的區域仍有未處理的訊號。')) then created := created + 1; sent := sent + 1; end if;
  end if;
  if local_t >= s.expiring_reminder and sent < s.daily_reminder_cap then
    if private.notify(p, t, 'MISSION_EXPIRING', 'EXPIRING:' || d, d, '區域即將關閉',
         coalesce(l.config #>> '{notify,expiring}', '這個區域將在午夜重新封閉。之後它不會以同樣的樣子回來。')) then created := created + 1; end if;
  end if;
  return created;
end $$;

create or replace function public.cron_tick() returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare pr record; n int := 0;
begin
  for pr in select id from public.profiles where not is_test loop
    perform private.refresh(pr.id);
    n := n + private.generate_reminders(pr.id);
  end loop;
  return jsonb_build_object('created', n, 'at', now());
end $$;

-- 測試檔案：用模擬時間跑一次排程（只產生站內訊息，不推播）
create or replace function public.admin_test_tick(p uuid) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare n int;
begin
  perform private.assert_test(p);
  perform private.refresh(p);
  n := private.generate_reminders(p);
  return jsonb_build_object('created', n, 'game_now', private.game_now(p));
end $$;

-- ───────────────────────── 推播佇列（僅 service_role / Edge Function） ─────────────────────────
create or replace function private.in_quiet(p uuid, t timestamptz) returns boolean
language plpgsql stable as $$
declare prefs public.notification_prefs; lt time;
begin
  select * into prefs from public.notification_prefs where profile_id = p;
  if prefs.quiet_start is null or prefs.quiet_end is null then return false; end if;
  lt := (t at time zone (private.settings()).tz)::time;
  if prefs.quiet_start <= prefs.quiet_end then
    return lt >= prefs.quiet_start and lt < prefs.quiet_end;
  end if;
  return lt >= prefs.quiet_start or lt < prefs.quiet_end;
end $$;

create or replace function public.push_claim(max_items int default 50) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare out jsonb := '[]'; n record;
begin
  update public.notifications set push_status = 'queued'
   where push_status = 'sending' and pushed_at < now() - interval '10 minutes';
  -- 已失效的「即將截止」不再推送
  update public.notifications nn set push_status = 'skipped'
   where push_status = 'queued' and type in ('MISSION_EXPIRING', 'MISSION_PENDING')
     and now() >= (private.level_window(nn.day)).close_at;
  for n in
    select * from public.notifications
     where push_status = 'queued' and created_at <= now()
       and not private.in_quiet(profile_id, now())
     order by created_at limit max_items
     for update skip locked
  loop
    update public.notifications set push_status = 'sending', pushed_at = now() where id = n.id;
    out := out || jsonb_build_object('id', n.id, 'type', n.type, 'title', n.title, 'body', n.body, 'day', n.day,
      'subs', (select coalesce(jsonb_agg(jsonb_build_object('endpoint', endpoint, 'keys', jsonb_build_object('p256dh', p256dh, 'auth', auth))), '[]')
                 from public.push_subscriptions where profile_id = n.profile_id));
  end loop;
  return out;
end $$;

create or replace function public.push_mark(nid bigint, ok boolean, gone text[]) returns void
language plpgsql security definer set search_path = public, private as $$
begin
  update public.notifications set push_status = case when ok then 'sent' else 'failed' end, pushed_at = now() where id = nid;
  delete from public.push_subscriptions where endpoint = any(coalesce(gone, '{}'));
end $$;

-- ───────────────────────── 權限 ─────────────────────────
revoke all on all functions in schema public from public;
revoke all on all functions in schema private from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on all functions in schema public from anon, authenticated';
    execute 'revoke all on all functions in schema private from anon, authenticated';
    execute 'revoke all on schema private from anon, authenticated';
    execute 'grant execute on function public.is_admin() to anon, authenticated';
    execute $g$grant execute on function
      public.bootstrap(), public.get_state(uuid), public.open_level(uuid, int), public.submit_step(uuid, int, text, jsonb),
      public.explore(uuid, int, text), public.request_hint(uuid, int, text),
      public.submit_evidence(uuid, int, text, text, text, text), public.observe(uuid, text),
      public.list_notifications(uuid), public.mark_notifications_read(uuid), public.get_prefs(uuid), public.save_prefs(uuid, jsonb),
      public.save_push_subscription(uuid, jsonb), public.delete_push_subscription(uuid, text),
      public.get_portrait(uuid), public.save_portrait(uuid, jsonb, text[]),
      public.finale_archive(uuid), public.submit_definition(uuid, text, boolean), public.finale_hunt(uuid), public.submit_hunt(uuid, int, text),
      public.admin_overview(), public.admin_profile_state(uuid), public.admin_list_evidence(text),
      public.admin_review_evidence(uuid, text, text), public.admin_delete_evidence(uuid),
      public.admin_trigger_event(uuid, text, text, jsonb), public.admin_grant_portrait(uuid), public.admin_set_ar_fallback(int, text, boolean),
      public.admin_export(), public.admin_create_test_profile(text, timestamptz), public.admin_set_test_time(uuid, timestamptz),
      public.admin_test_force(uuid, int, text), public.admin_test_observe(uuid, int, text), public.admin_test_reset(uuid),
      public.admin_delete_test_profile(uuid), public.admin_test_tick(uuid)
      to authenticated$g$;
  end if;
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    execute 'grant execute on function public.cron_tick(), public.push_claim(int), public.push_mark(bigint, boolean, text[]) to service_role';
  end if;
end $$;
