-- PROJECT 030 · 伺服器引擎情境測試（本機 Postgres）
-- psql -v ON_ERROR_STOP=1 -f engine_test.sql
\set QUIET on
\pset tuples_only on
\pset format unaligned

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
reset role;
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
select pg_temp.fails($$select public.submit_step('$$ || :'pid' || $$', 1, 's_terminal', '{"value":"1030"}')$$, 'P030_STEP_ORDER', 'steps must be in order');
select pg_temp.ok((public.submit_step(:'pid', 1, 's_wake', '{}') ->> 'correct')::boolean, 'story step');
select pg_temp.ok(not (public.submit_step(:'pid', 1, 's_power', '{"value":"111111"}') ->> 'correct')::boolean, 'wrong switch pattern rejected');
select pg_temp.ok((public.submit_step(:'pid', 1, 's_power', '{"value":"011010"}') ->> 'correct')::boolean, 'switch pattern accepted');
select pg_temp.ok((public.request_hint(:'pid', 1, 's_terminal') ->> 'hint') is not null, 'hint delivered by server');
select pg_temp.ok((public.submit_step(:'pid', 1, 's_terminal', '{"value":"10:30"}') ->> 'correct')::boolean, 'keypad accepted (normalized)');
select pg_temp.ok((public.submit_step(:'pid', 1, 's_sample', '{}') ->> 'correct')::boolean, 'sample story');
select pg_temp.ok(not (public.submit_step(:'pid', 1, 's_observe', '{}') ->> 'correct')::boolean, 'observe step needs real observation');
select pg_temp.ok((public.observe(:'pid', 'explore') ->> 'total')::int = 1, 'observation recorded');
select pg_temp.fails($$select public.observe('$$ || :'pid' || $$', 'rest')$$, 'P030_ALREADY_OBSERVED', 'one observation per day');
select pg_temp.ok((public.submit_step(:'pid', 1, 's_observe', '{}') ->> 'correct')::boolean, 'observe step ok');
select pg_temp.ok((public.explore(:'pid', 1, 'under_desk') -> 'gained' -> 0 ->> 'key') = 'label_unregistered', 'hidden item found');
select pg_temp.ok((public.submit_evidence(:'pid', 1, 's_log', 'text', null, '窗外的樹葉掉了一片') ->> 'completed')::boolean, 'evidence completes level');
select pg_temp.ok((public.get_state(:'pid') -> 'levels' -> 0 ->> 'outcome') = 'ON_TIME', 'day 1 COMPLETED ON_TIME');
select pg_temp.ok(public.get_state(:'pid') -> 'inventory' @> '[{"key":"sym:1"}]', 'symbol 1 granted');
select pg_temp.fails($$select public.submit_evidence('$$ || :'pid' || $$', 1, 's_log', 'photo', 'someoneelse/x.jpg', null)$$, 'P030_', 'evidence path must belong to player');

-- 陌生帳號
reset role;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c', 'stranger@test.dev');
set role authenticated;
select pg_temp.ok(not (public.bootstrap() ->> 'allowed')::boolean, 'stranger not allowed');
select pg_temp.fails($$select public.get_state('$$ || :'pid' || $$')$$, 'P030_FORBIDDEN', 'stranger cannot read player profile');

-- ════════════ B. 管理者測試模式：模擬日期與錯過情境 ════════════
reset role;
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
select pg_temp.ok((public.submit_step(:'tp', 3, 's_inside', '{}') ->> 'completed')::boolean, 'day 3 completed');

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
reset role;
select pg_temp.fails($$update public.player_levels set missed_at = null where profile_id = '$$ || :'tp' || $$' and day = 5$$, 'P030_TIME_IS_IRREVERSIBLE', 'trigger blocks un-missing even for postgres');
select pg_temp.fails($$delete from public.event_log where profile_id = '$$ || :'pid' || $$'$$, 'P030_EVENT_LOG_IMMUTABLE', 'event log immutable');
set role authenticated;

-- 第 9 天：回放卡片由玩家資料動態生成
select ((now() at time zone 'Asia/Taipei')::date + 8)::text || ' 21:05:00+08' as d9 \gset
select public.admin_set_test_time(:'tp', :'d9'::timestamptz) \g /dev/null
select pg_temp.ok(jsonb_array_length(public.open_level(:'tp', 9) -> 'steps' -> 0 -> 'cards') = 8, 'timeline has 8 cards');
reset role;
select string_agg(c ->> 'id', ',' order by o) as order9 from jsonb_array_elements(private.timeline_cards(:'tp', 8)) with ordinality x(c, o) \gset
select pg_temp.ok((select count(*) from jsonb_array_elements(private.timeline_cards(:'tp', 8)) c where c ->> 'kind' = 'void') >= 4, 'missed days are void cards');
set role authenticated;
select pg_temp.ok(not (public.submit_step(:'tp', 9, 's_timeline', '{"value":"x,y"}') ->> 'correct')::boolean, 'wrong timeline');
select pg_temp.ok((public.submit_step(:'tp', 9, 's_timeline', jsonb_build_object('value', :'order9')) ->> 'correct')::boolean, 'correct timeline from own data');

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
reset role;
select pg_temp.ok((select count(*) from public.player_levels where profile_id = :'pid' and missed_at is not null) = 0, 'real player untouched by test mode');
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a', 'admin@test.dev');
set role authenticated;
select pg_temp.ok(jsonb_array_length(public.admin_overview() -> 'profiles') = 2, 'admin overview lists real + test');
select pg_temp.ok((select count(*) from public.levels) = 11, 'admin can read content via RLS');
select e ->> 'id' as eid from jsonb_array_elements(public.admin_list_evidence('PENDING_REVIEW')) e where not (e ->> 'is_test')::boolean limit 1 \gset
select pg_temp.ok((public.admin_review_evidence(:'eid', 'NEEDS_MORE', '請再多寫一點') ->> 'status') = 'NEEDS_MORE', 'admin review');
select public.admin_test_reset(:'tp') \g /dev/null
select public.admin_delete_test_profile(:'tp') \g /dev/null
reset role;
select pg_temp.ok(not exists (select 1 from public.profiles where id = :'tp'), 'test profile purged');
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b', 'player@test.dev');
set role authenticated;
select pg_temp.ok((public.list_notifications(:'pid') -> 0 ->> 'title') = '紀錄需要補充', 'player notified of NEEDS_MORE');
reset role;
\echo ALL TESTS PASSED
