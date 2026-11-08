-- PROJECT 030 · 伺服器引擎情境測試（本機 Postgres）
-- psql -v ON_ERROR_STOP=1 -f engine_test.sql
\set QUIET on
\pset tuples_only on
\pset format unaligned
set search_path = public, extensions;

create or replace function pg_temp.ok(cond boolean, label text) returns void language plpgsql as $$
begin
  if not coalesce(cond, false) then raise exception 'FAIL: %', label; end if;
  raise notice 'ok - %', label;
end $$;
create or replace function pg_temp.fails(sql text, expect text, label text) returns void language plpgsql as $$
begin
  execute sql;
  raise exception 'FAIL (no error): %', label;
exception when others then
  if sqlerrm like 'FAIL%' then raise; end if;
  if position(expect in sqlerrm) = 0 then raise exception 'FAIL: % (got %)', label, sqlerrm; end if;
  raise notice 'ok - % [%]', label, expect;
end $$;
create or replace function pg_temp.as_user(uid text, email text) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', uid, false);
  perform set_config('request.jwt.claims', json_build_object('sub', uid, 'email', email)::text, false);
end $$;

-- ── 準備：今天 = 第 1 天 ──
reset role; set search_path = public, extensions;
insert into auth.users values ('00000000-0000-0000-0000-00000000000a', 'admin@test.dev'),
                              ('00000000-0000-0000-0000-00000000000b', 'player@test.dev'),
                              ('00000000-0000-0000-0000-00000000000c', 'stranger@test.dev');
insert into public.admin_emails values ('admin@test.dev');
insert into public.allowed_players values ('player@test.dev', '壽星');
update public.settings set birthday = (now() at time zone 'Asia/Taipei')::date + 10;
grant usage on schema public to authenticated;

-- ════════════ A. 正式玩家：第一關可玩、伺服器驗證 ════════════
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b', 'player@test.dev');
set role authenticated;
select (public.bootstrap() -> 'profiles' -> 0 ->> 'id') as pid \gset
select pg_temp.ok(:'pid' <> '', 'player bootstrap creates real profile');
select pg_temp.ok((public.get_state(:'pid') -> 'levels' -> 0 ->> 'status') = 'AVAILABLE', 'day 1 AVAILABLE');
select pg_temp.ok((public.get_state(:'pid') -> 'levels' -> 1 ->> 'status') = 'LOCKED', 'day 2 LOCKED');
select pg_temp.ok((public.get_state(:'pid') -> 'levels' -> 1 ->> 'title') is null, 'locked title hidden');
select pg_temp.fails($$select public.open_level('$$ || :'pid' || $$', 2)$$, 'P030_LOCKED', 'cannot open future level');
select pg_temp.ok((select count(*) from public.levels) = 0, 'RLS: player cannot read level secrets table');
select pg_temp.fails('select public.admin_overview()', 'P030_ADMIN_ONLY', 'player cannot call admin RPC');

select pg_temp.ok((public.open_level(:'pid', 1) ->> 'status') = 'IN_PROGRESS', 'open day 1 -> IN_PROGRESS');
select pg_temp.ok(position('011010' in public.open_level(:'pid', 1)::text) = 0, 'answers not leaked in level payload');
select pg_temp.ok((public.open_level(:'pid', 1) -> 'steps' -> 0 ->> 'stage') = '1', 'steps carry stage numbers');
select pg_temp.fails($$select public.submit_step('$$ || :'pid' || $$', 1, 's_sample', '{}')$$, 'P030_STEP_ORDER', 'steps must be in order');
select pg_temp.ok((public.submit_step(:'pid', 1, 's_wake', '{}') ->> 'correct')::boolean, 'story step');
select pg_temp.ok(not (public.submit_step(:'pid', 1, 's_power', '{"value":"111111"}') ->> 'correct')::boolean, 'wrong switch pattern rejected');
select pg_temp.ok((public.submit_step(:'pid', 1, 's_power', '{"value":"011010"}') ->> 'correct')::boolean, 'switch pattern accepted');
select pg_temp.ok((public.request_hint(:'pid', 1, 's_power') ->> 'hint') is not null, 'hint delivered by server');
select pg_temp.ok((public.submit_step(:'pid', 1, 's_sample', '{}') ->> 'correct')::boolean, 'sample story');
select pg_temp.ok(not (public.submit_step(:'pid', 1, 's_observe', '{}') ->> 'correct')::boolean, 'observe step needs real observation');
select pg_temp.ok((public.observe(:'pid', 'explore') ->> 'total')::int = 1, 'observation recorded');
select pg_temp.fails($$select public.observe('$$ || :'pid' || $$', 'rest')$$, 'P030_ALREADY_OBSERVED', 'one observation per day');
select pg_temp.ok((public.submit_step(:'pid', 1, 's_observe', '{}') ->> 'correct')::boolean, 'observe step ok');
select pg_temp.ok((public.explore(:'pid', 1, 'under_desk') -> 'gained' -> 0 ->> 'key') = 'label_unregistered', 'hidden item found');
select public.submit_step(:'pid', 1, 's_id_intro', '{}') \g /dev/null
select to_char((select birthday from public.settings), 'MMDD') as bmmdd \gset
select pg_temp.ok(not (public.submit_step(:'pid', 1, 's_id', '{"value":"0000"}') ->> 'correct')::boolean, 'wrong observer number');
select pg_temp.ok((public.submit_step(:'pid', 1, 's_id', jsonb_build_object('value', :'bmmdd')) ->> 'correct')::boolean, 'observer number = birthday MMDD');
select public.submit_step(:'pid', 1, 's_calib', '{}') \g /dev/null
select public.submit_step(:'pid', 1, 's_tone', '{"option":"film"}') \g /dev/null
select public.submit_step(:'pid', 1, 's_outfit', '{"option":"self"}') \g /dev/null
select public.submit_step(:'pid', 1, 's_mood', '{"option":"gentle"}') \g /dev/null
select pg_temp.ok((public.submit_step(:'pid', 1, 's_scene', '{"option":"retro"}') ->> 'correct')::boolean, 'portrait calibration choices');
select pg_temp.ok((public.get_state(:'pid') -> 'stats' -> 'choices' ->> 'choice:p_tone') = 'film', 'style choice stored');
select pg_temp.ok((public.submit_step(:'pid', 1, 's_saved', '{}') ->> 'correct')::boolean, 'optional reference photo can be skipped');
select pg_temp.ok((public.submit_step(:'pid', 1, 's_drift', '{}') ->> 'correct')::boolean, 'drift story');
select pg_temp.ok((public.request_hint(:'pid', 1, 's_sync') ->> 'hint') like '%停住%', 'gate task has progressive hints');
select pg_temp.ok((public.submit_evidence(:'pid', 1, 's_sync', 'photo', :'pid' || '/1/clock.jpg', null) ->> 'pending')::boolean, 'gate photo pending review');
select pg_temp.fails($$select public.submit_evidence('$$ || :'pid' || $$', 1, 's_sync', 'photo', '$$ || :'pid' || $$/1/b.jpg', null)$$, 'P030_PENDING_REVIEW', 'cannot resubmit while pending');
select pg_temp.ok((public.get_state(:'pid') -> 'levels' -> 0 ->> 'status') = 'IN_PROGRESS', 'level waits for approval');
reset role; set search_path = public, extensions;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000a', false), set_config('request.jwt.claims', '{"email":"admin@test.dev"}', false) \g /dev/null
insert into public.admins (user_id) values ('00000000-0000-0000-0000-00000000000a') on conflict do nothing;
set role authenticated;
select e ->> 'id' as gid from jsonb_array_elements(public.admin_list_evidence('PENDING_REVIEW')) e where e ->> 'step_id' = 's_sync' limit 1 \gset
select public.admin_review_evidence(:'gid', 'APPROVED', '時間同步完成') \g /dev/null
reset role; set search_path = public, extensions;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b', 'player@test.dev');
set role authenticated;
select pg_temp.ok((public.get_state(:'pid') -> 'levels' -> 0 ->> 'outcome') = 'ON_TIME', 'admin approval completes day 1 ON_TIME');
select pg_temp.ok(public.get_state(:'pid') -> 'inventory' @> '[{"key":"sym:1"}]', 'symbol 1 granted');
select pg_temp.fails($$select public.submit_evidence('$$ || :'pid' || $$', 1, 's_sync', 'photo', 'someoneelse/x.jpg', null)$$, 'P030_', 'evidence path must belong to player');

-- 陌生帳號
reset role; set search_path = public, extensions;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c', 'stranger@test.dev');
set role authenticated;
select pg_temp.ok(not (public.bootstrap() ->> 'allowed')::boolean, 'stranger not allowed');
select pg_temp.fails($$select public.get_state('$$ || :'pid' || $$')$$, 'P030_FORBIDDEN', 'stranger cannot read player profile');

-- ════════════ B. 管理者測試模式：模擬日期與錯過情境 ════════════
reset role; set search_path = public, extensions;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a', 'admin@test.dev');
set role authenticated;
select pg_temp.ok((public.bootstrap() ->> 'is_admin')::boolean, 'admin recognised');
select ((now() at time zone 'Asia/Taipei')::date + 2)::text || ' 10:00:00+08' as d3 \gset
select public.admin_create_test_profile('測試：錯過前兩天', :'d3'::timestamptz) as tp \gset
select pg_temp.ok((public.get_state(:'tp') ->> 'game_day')::int = 3, 'test profile simulated day 3');
select pg_temp.ok((public.get_state(:'tp') -> 'levels' -> 0 ->> 'status') = 'ALTERNATE', 'day 1 missed -> ALTERNATE');
select pg_temp.ok((public.get_state(:'tp') -> 'levels' -> 0 ->> 'missed_at') is not null, 'missed_at recorded');
select pg_temp.ok((select count(*) from public.notifications where profile_id = :'tp' and type = 'MISSION_MISSED') = 2, 'MISSED notifications x2');
select pg_temp.ok((select push_status from public.notifications where profile_id = :'tp' limit 1) = 'inapp', 'test profile never pushes');
select pg_temp.fails($$select public.get_state('$$ || :'pid' || $$')$$, 'P030_FORBIDDEN', 'test tools cannot touch real player via player RPC');
select pg_temp.fails($$select public.admin_set_test_time('$$ || :'pid' || $$', now())$$, 'P030_NOT_A_TEST_PROFILE', 'cannot time-shift a real profile');

-- 第 3 天：守夜人已離開 → 紙條變體
select pg_temp.ok((public.open_level(:'tp', 3) ->> 'variant') = 'note', 'day 3 variant = note (watcher left)');
select pg_temp.ok((public.open_level(:'tp', 3) -> 'steps' -> 0 ->> 'id') = 's_note', 'note step shown instead of watcher');
select pg_temp.ok((public.submit_step(:'tp', 3, 's_note', '{}') ->> 'correct')::boolean, 'note story');
select pg_temp.ok(not (public.submit_step(:'tp', 3, 's_scan', '{"target":1}') ->> 'correct')::boolean, 'wrong AR target rejected');
select pg_temp.fails($$select public.submit_step('$$ || :'tp' || $$', 3, 's_scan', '{"code":"VAULT-A"}')$$, 'P030_FALLBACK_DISABLED', 'fallback disabled by default');
select public.admin_set_ar_fallback(3, 's_scan', true) \g /dev/null
select pg_temp.ok((public.submit_step(:'tp', 3, 's_scan', '{"code":"vault-a"}') -> 'reveal' ->> 'digits') = '418', 'admin-enabled fallback + reveal');
select pg_temp.ok((public.submit_step(:'tp', 3, 's_open', '{"value":"418"}') ->> 'correct')::boolean, 'safe opened');
select pg_temp.ok(not (public.submit_step(:'tp', 3, 's_inside', '{}') ->> 'completed')::boolean, 'day 3 needs stage 3');
select (public.submit_evidence(:'tp', 3, 's_coord', 'photo', :'tp' || '/3/c.jpg', null) ->> 'id') as c3 \gset
select public.admin_review_evidence(:'c3', 'APPROVED', 'ok') \g /dev/null
select pg_temp.ok((public.get_state(:'tp') -> 'levels' -> 2 ->> 'status') = 'COMPLETED', 'day 3 completed after stage 3 approval');

-- 第 1 天替代路線：不同場景與機關
select pg_temp.ok((public.open_level(:'tp', 1) -> 'scene' ->> 'light') = 'off', 'alternate scene is dark');
select pg_temp.ok((public.open_level(:'tp', 1) -> 'steps' -> 0 ->> 'type') = 'find', 'alternate uses different mechanism');
select public.submit_step(:'tp', 1, 'a_find', '{"value":"glyph"}') \g /dev/null
select public.submit_step(:'tp', 1, 'a_terminal', '{"value":"1030"}') \g /dev/null
select public.submit_step(:'tp', 1, 'a_sample', '{}') \g /dev/null
select public.observe(:'tp', 'preserve') \g /dev/null
select public.submit_step(:'tp', 1, 'a_observe', '{}') \g /dev/null
select pg_temp.ok((public.submit_evidence(:'tp', 1, 'a_log', 'text', null, '補登') -> 'completion' ->> 'outcome') = 'ALTERNATE', 'alternate completion outcome');
select pg_temp.ok(public.get_state(:'tp') -> 'inventory' @> '[{"key":"sym:1:echo"}]', 'echo symbol granted on alternate');
select pg_temp.ok((public.get_state(:'tp') -> 'levels' -> 0 ->> 'missed_at') is not null, 'missed_at kept after alternate completion');

-- 跳到第 8 天：4–7 天錯過；照片因第 7 天錯過而遺失
select ((now() at time zone 'Asia/Taipei')::date + 7)::text || ' 12:00:00+08' as d8 \gset
select public.admin_set_test_time(:'tp', :'d8'::timestamptz) \g /dev/null
select pg_temp.ok(not (public.get_state(:'tp') -> 'inventory' @> '[{"key":"photo_old"}]'), 'photo lost when day 7 missed');
select pg_temp.ok(exists (select 1 from public.event_log where profile_id = :'tp' and type = 'ITEM_LOST'), 'ITEM_LOST logged');
select pg_temp.ok((public.open_level(:'tp', 8) ->> 'variant') = 'third', 'day 8 third door appears after >=2 misses');
select pg_temp.ok((public.submit_step(:'tp', 8, 's_intro', '{}') ->> 'correct')::boolean, 'fork intro');
select pg_temp.ok((public.submit_step(:'tp', 8, 's_door', '{"option":"stay"}') ->> 'correct')::boolean, 'choose unnamed door');
select pg_temp.ok((public.open_level(:'tp', 8) -> 'steps' -> 2 ->> 'id') = 's_stay', 'choice reveals the stay puzzle');
select pg_temp.ok((public.submit_step(:'tp', 8, 's_stay', '{}') ->> 'started')::boolean, 'wait started');
select pg_temp.ok(not (public.submit_step(:'tp', 8, 's_stay', '{}') ->> 'correct')::boolean, 'leaving early fails (server timed)');
select public.submit_step(:'tp', 8, 's_stay', '{}') \g /dev/null
select public.admin_set_test_time(:'tp', :'d8'::timestamptz + interval '45 seconds') \g /dev/null
select pg_temp.ok((public.submit_step(:'tp', 8, 's_stay', '{}') ->> 'correct')::boolean, 'waited 30s of server time');

-- 時間倒轉不會恢復錯過
select public.admin_set_test_time(:'tp', :'d3'::timestamptz - interval '3 days') \g /dev/null
select pg_temp.ok((public.get_state(:'tp') -> 'levels' -> 4 ->> 'status') = 'ALTERNATE', 'rewinding clock cannot undo a miss');
reset role; set search_path = public, extensions;
select pg_temp.fails($$update public.player_levels set missed_at = null where profile_id = '$$ || :'tp' || $$' and day = 5$$, 'P030_TIME_IS_IRREVERSIBLE', 'trigger blocks un-missing even for postgres');
select pg_temp.fails($$delete from public.event_log where profile_id = '$$ || :'pid' || $$'$$, 'P030_EVENT_LOG_IMMUTABLE', 'event log immutable');
set role authenticated;

-- 第 9 天：回放卡片由玩家資料動態生成
select ((now() at time zone 'Asia/Taipei')::date + 8)::text || ' 21:05:00+08' as d9 \gset
select public.admin_set_test_time(:'tp', :'d9'::timestamptz) \g /dev/null
select pg_temp.ok(jsonb_array_length(public.open_level(:'tp', 9) -> 'steps' -> 0 -> 'cards') = 8, 'timeline has 8 cards');
reset role; set search_path = public, extensions;
select string_agg(c ->> 'id', ',' order by o) as order9 from jsonb_array_elements(private.timeline_cards(:'tp', 8)) with ordinality x(c, o) \gset
select pg_temp.ok((select count(*) from jsonb_array_elements(private.timeline_cards(:'tp', 8)) c where c ->> 'kind' = 'void') >= 4, 'missed days are void cards');
set role authenticated;
select pg_temp.ok(not (public.submit_step(:'tp', 9, 's_timeline', '{"value":"x,y"}') ->> 'correct')::boolean, 'wrong timeline');
select pg_temp.ok((public.submit_step(:'tp', 9, 's_timeline', jsonb_build_object('value', :'order9')) ->> 'correct')::boolean, 'correct timeline from own data');
select public.submit_step(:'tp', 9, 's_stop', '{}') \g /dev/null
select to_char((select birthday - 10 from public.settings), 'MMDD') as mmdd \gset
select pg_temp.ok((public.submit_step(:'tp', 9, 's_date', jsonb_build_object('value', :'mmdd')) ->> 'correct')::boolean, 'dynamic answer = start date');

-- 提醒：每日上限、去重
select (public.admin_test_tick(:'tp') ->> 'created')::int as c1 \gset
select pg_temp.ok(:c1 = 2, 'NEW_MISSION + MISSION_PENDING at 21:05');
select pg_temp.ok((public.admin_test_tick(:'tp') ->> 'created')::int = 0, 'no duplicates on re-run');
select public.admin_set_test_time(:'tp', :'d9'::timestamptz + interval '90 minutes') \g /dev/null
select pg_temp.ok((public.admin_test_tick(:'tp') ->> 'created')::int = 1, 'MISSION_EXPIRING at 22:35');
select pg_temp.ok((select count(*) from public.notifications where profile_id = :'tp' and day = 9 and type in ('MISSION_PENDING','MISSION_EXPIRING')) <= 2, 'daily cap respected');

-- 第 9 天錯過 → 沒有替代路線 → MISSED
select ((now() at time zone 'Asia/Taipei')::date + 9)::text || ' 09:00:00+08' as d10 \gset
select public.admin_set_test_time(:'tp', :'d10'::timestamptz) \g /dev/null
select pg_temp.ok((public.get_state(:'tp') -> 'levels' -> 8 ->> 'status') = 'MISSED', 'day 9 has no alternate -> MISSED');
select pg_temp.fails($$select public.submit_step('$$ || :'tp' || $$', 9, 's_voice', '{}')$$, 'P030_NOT_PLAYABLE', 'MISSED level not playable');

-- 終章：生日當天，無論完成度
select pg_temp.fails($$select public.finale_archive('$$ || :'tp' || $$')$$, 'P030_FINALE_LOCKED', 'finale locked before birthday');
select ((now() at time zone 'Asia/Taipei')::date + 10)::text || ' 08:00:00+08' as bday \gset
select public.admin_set_test_time(:'tp', :'bday'::timestamptz) \g /dev/null
select pg_temp.ok(jsonb_array_length(public.finale_archive(:'tp') -> 'days') = 10, 'archive shows 10 days');
select pg_temp.ok(public.finale_archive(:'tp') -> 'monologue' @> '["在岔路，你走進了沒有名字的門。系統沒有預料到第三個選項。"]', 'monologue reflects choice');
select pg_temp.ok(public.finale_archive(:'tp') -> 'monologue' @> '["也收集了每一次缺席。缺席的地方沒有被刪除，它們一樣是紀錄。"]', 'monologue reflects misses');
select pg_temp.fails($$select public.finale_hunt('$$ || :'tp' || $$')$$, 'P030_DEFINE_FIRST', 'hunt requires self-definition');
select pg_temp.ok(public.submit_definition(:'tp', null, true) -> 'lines' @> '["定義權限已移交本人。"]', 'no-answer is accepted');
select pg_temp.ok((public.submit_hunt(:'tp', 0, '') ->> 'done')::boolean, 'hunt completes');
select pg_temp.ok((public.get_state(:'tp') -> 'levels' -> 10 ->> 'status') = 'COMPLETED', 'finale completed');
select public.admin_grant_portrait(:'tp') \g /dev/null
select pg_temp.ok((public.get_state(:'tp') -> 'portrait') is not null, 'portrait gift can always be granted');

-- 樣本：由資料驅動
select pg_temp.ok((public.get_state(:'tp') -> 'sample' ->> 'breaks')::int >= 0, 'sample state computed');
select public.admin_test_observe(:'tp', 2, 'explore') \g /dev/null
select public.admin_test_observe(:'tp', 3, 'explore') \g /dev/null
select public.admin_test_observe(:'tp', 7, 'adjust') \g /dev/null
select pg_temp.ok((public.get_state(:'tp') -> 'sample' ->> 'breaks')::int = 1, 'gap counted as a break, not death');
select pg_temp.ok((public.get_state(:'tp') -> 'sample' ->> 'total')::int = 3, 'total observations');

-- 正式玩家資料未受測試影響
reset role; set search_path = public, extensions;
select pg_temp.ok((select count(*) from public.player_levels where profile_id = :'pid' and missed_at is not null) = 0, 'real player untouched by test mode');
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a', 'admin@test.dev');
set role authenticated;
select pg_temp.ok(jsonb_array_length(public.admin_overview() -> 'profiles') = 2, 'admin overview lists real + test');
select pg_temp.ok((select count(*) from public.levels) = 11, 'admin can read content via RLS');
select e ->> 'id' as eid from jsonb_array_elements(public.admin_list_evidence(null)) e where not (e ->> 'is_test')::boolean limit 1 \gset
select pg_temp.ok((public.admin_review_evidence(:'eid', 'NEEDS_MORE', '請再多寫一點') ->> 'status') = 'NEEDS_MORE', 'admin review');
select public.admin_test_reset(:'tp') \g /dev/null
select public.admin_delete_test_profile(:'tp') \g /dev/null
reset role; set search_path = public, extensions;
select pg_temp.ok(not exists (select 1 from public.profiles where id = :'tp'), 'test profile purged');
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b', 'player@test.dev');
set role authenticated;
select pg_temp.ok((public.list_notifications(:'pid') -> 0 ->> 'title') = '紀錄需要補充', 'player notified of NEEDS_MORE');

-- ════════════ C. 關卡門檻：截止前送出、隔天才審核，仍算準時 ════════════
reset role; set search_path = public, extensions;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a', 'admin@test.dev');
set role authenticated;
select ((now() at time zone 'Asia/Taipei')::date)::text || ' 23:50:00+08' as late1 \gset
select public.admin_create_test_profile('門檻測試', :'late1'::timestamptz) as gp \gset
select public.open_level(:'gp', 1) \g /dev/null
select public.submit_step(:'gp', 1, 's_wake', '{}') \g /dev/null
select public.submit_step(:'gp', 1, 's_power', '{"value":"011010"}') \g /dev/null
select public.submit_step(:'gp', 1, 's_sample', '{}') \g /dev/null
select public.observe(:'gp', 'rest') \g /dev/null
select public.submit_step(:'gp', 1, 's_observe', '{}') \g /dev/null
select public.submit_step(:'gp', 1, 's_id_intro', '{}') \g /dev/null
select public.submit_step(:'gp', 1, 's_id', jsonb_build_object('value', to_char((select birthday from public.settings), 'MMDD'))) \g /dev/null
select public.submit_step(:'gp', 1, 's_calib', '{}') \g /dev/null
select public.submit_step(:'gp', 1, 's_tone', '{"option":"mono"}') \g /dev/null
select public.submit_step(:'gp', 1, 's_outfit', '{"option":"formal"}') \g /dev/null
select public.submit_step(:'gp', 1, 's_mood', '{"option":"calm"}') \g /dev/null
select public.submit_step(:'gp', 1, 's_scene', '{"option":"studio"}') \g /dev/null
select public.submit_step(:'gp', 1, 's_saved', '{}') \g /dev/null
select public.submit_step(:'gp', 1, 's_drift', '{}') \g /dev/null
select public.submit_evidence(:'gp', 1, 's_sync', 'photo', :'gp' || '/1/c.jpg', null) \g /dev/null
select public.admin_set_test_time(:'gp', :'late1'::timestamptz + interval '10 hours') \g /dev/null
select pg_temp.ok((public.get_state(:'gp') -> 'levels' -> 0 ->> 'missed_at') is null, 'pending gate before deadline is not marked missed');
select e ->> 'id' as gid2 from jsonb_array_elements(public.admin_list_evidence('PENDING_REVIEW')) e where e ->> 'profile_id' = :'gp' and e ->> 'step_id' = 's_sync' limit 1 \gset
select public.admin_review_evidence(:'gid2', 'APPROVED', 'ok') \g /dev/null
select pg_temp.ok((public.get_state(:'gp') -> 'levels' -> 0 ->> 'outcome') = 'ON_TIME', 'late approval still ON_TIME');
select public.admin_delete_test_profile(:'gp') \g /dev/null

-- ════════════ D. 後台設定壽星（名字＋生日）與重置進度 ════════════
reset role; set search_path = public, extensions;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a', 'admin@test.dev');
set role authenticated;
select pg_temp.ok((public.admin_set_player('小明', '2026-11-18') ->> 'login_code') = '1118', 'admin sets name + birthday');
reset role; set search_path = public, extensions;
select pg_temp.ok((select encrypted_password = crypt('p030-1118', encrypted_password) from auth.users where email = 'observer@p030.game'), 'observer password = birthday MMDD');
select pg_temp.ok((select player_name from public.settings) = '小明', 'player name stored');
insert into public.profiles (user_id, label) select id, email from auth.users where email = 'observer@p030.game';
insert into public.event_log (profile_id, at, type) select p.id, now(), 'X' from public.profiles p join auth.users u on u.id = p.user_id where u.email = 'observer@p030.game';
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a', 'admin@test.dev');
set role authenticated;
select pg_temp.ok(public.admin_reset_player() = 1, 'admin can reset player progress');
select public.admin_set_player('小明', '2026-12-05') \g /dev/null
reset role; set search_path = public, extensions;
select pg_temp.ok((select encrypted_password = crypt('p030-1205', encrypted_password) from auth.users where email = 'observer@p030.game'), 'changing birthday updates login code');
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b', 'player@test.dev');
set role authenticated;
select pg_temp.fails('select public.admin_reset_player()', 'P030_ADMIN_ONLY', 'player cannot reset');
reset role; set search_path = public, extensions;
-- ════════════ E. 現實世界密碼 ════════════
select pg_temp.ok((select private.norm(secrets #>> '{s_serial,answer}') = '4710901898847' from public.levels where day = 2), 'day 2 barcode answer');
select pg_temp.ok((select private.norm(secrets #>> '{s_recipe,answer}') = private.norm('777250') from public.levels where day = 5), 'day 5 essential-oil answer');
select pg_temp.ok((select private.norm(secrets #>> '{s_exam,answer}') = private.norm('bdbbcbabab') from public.levels where day = 6), 'day 6 exam answer (case-insensitive)');
select pg_temp.ok((select count(*) from public.levels l, jsonb_array_elements(l.config #> '{scene,hotspots}') h where h ? 'clue') >= 5, 'scene clue hotspots present');
select pg_temp.ok(position('4710901898847' in (select config::text from public.levels where day = 2)) = 0, 'barcode not leaked in public config');
\echo ALL TESTS PASSED
