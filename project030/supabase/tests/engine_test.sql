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
select pg_temp.fails($$select public.submit_step('$$ || :'pid' || $$', 1, 's_power', '{"value":"011010"}')$$, 'P030_STEP_ORDER', 'steps must be in order');
select pg_temp.ok((public.submit_step(:'pid', 1, 's_id_intro', '{}') ->> 'correct')::boolean, 'identity intro first');
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
select pg_temp.ok((public.submit_step(:'pid', 1, 's_blackout', '{}') ->> 'correct')::boolean, 'blackout event');
select pg_temp.ok((public.open_level(:'pid', 1) -> 'steps' -> 9 -> 'scene' ->> 'light') = 'emergency', 'blackout step carries emergency scene');
select pg_temp.ok(not (public.submit_step(:'pid', 1, 's_power', '{"value":"111111"}') ->> 'correct')::boolean, 'wrong switch pattern rejected');
select pg_temp.ok((public.submit_step(:'pid', 1, 's_power', '{"value":"011010"}') ->> 'correct')::boolean, 'switch pattern accepted');
select pg_temp.ok((public.request_hint(:'pid', 1, 's_lock') ->> 'hint') is not null, 'hint delivered by server');
select pg_temp.ok((public.submit_step(:'pid', 1, 's_sample', '{}') ->> 'correct')::boolean, 'sample story');
select pg_temp.ok(not (public.submit_step(:'pid', 1, 's_lock', '{"value":"A168888418311"}') ->> 'correct')::boolean, 'lock rejects tax id with 1s');
select pg_temp.ok((public.submit_step(:'pid', 1, 's_lock', '{"value":"a1688 88483"}') ->> 'correct')::boolean, 'lock opens: phone model + tax id minus 1s');
select public.submit_step(:'pid', 1, 's_unlocked', '{}') \g /dev/null
select pg_temp.ok(not (public.submit_step(:'pid', 1, 's_observe', '{}') ->> 'correct')::boolean, 'observe step needs real observation');
select pg_temp.ok((public.observe(:'pid', 'explore') ->> 'total')::int = 1, 'observation recorded');
select pg_temp.fails($$select public.observe('$$ || :'pid' || $$', 'rest')$$, 'P030_ALREADY_OBSERVED', 'one observation per day');
select pg_temp.ok((public.submit_step(:'pid', 1, 's_observe', '{}') ->> 'correct')::boolean, 'observe step ok');
select pg_temp.ok((public.explore(:'pid', 1, 'under_desk') -> 'gained' -> 0 ->> 'key') = 'label_unregistered', 'hidden item found');
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
insert into public.allowed_players values ('admin@test.dev', '誤加入名單') on conflict do nothing;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a', 'admin@test.dev');
set role authenticated;
select pg_temp.ok((public.bootstrap() ->> 'is_admin')::boolean, 'admin recognised');
select pg_temp.ok((select count(*) from public.profiles where user_id = auth.uid() and not is_test) = 0, 'admin never gets a real player profile');
select pg_temp.ok((select count(*) from public.profiles where user_id = auth.uid() and is_test) = 1, 'admin gets one automatic test profile');
select pg_temp.ok((select bool_and((p ->> 'is_test')::boolean) from jsonb_array_elements(public.bootstrap() -> 'profiles') p), 'admin bootstrap lists only test profiles');
select pg_temp.ok((public.get_state((public.bootstrap() -> 'profiles' -> 0 ->> 'id')::uuid) ->> 'game_day')::int = 1, 'automatic test profile starts on simulated day 1');
select ((now() at time zone 'Asia/Taipei')::date + 2)::text || ' 10:00:00+08' as d3 \gset
select public.admin_create_test_profile('測試：錯過前兩天', :'d3'::timestamptz) as tp \gset
select pg_temp.ok((public.get_state(:'tp') ->> 'game_day')::int = 3, 'test profile simulated day 3');
select pg_temp.ok((public.get_state(:'tp') -> 'levels' -> 0 ->> 'status') = 'ALTERNATE', 'day 1 missed -> ALTERNATE');
select pg_temp.ok((public.get_state(:'tp') -> 'levels' -> 0 ->> 'missed_at') is not null, 'missed_at recorded');
select pg_temp.ok((select count(*) from public.notifications where profile_id = :'tp' and type = 'MISSION_MISSED') = 2, 'MISSED notifications x2');
select pg_temp.ok((select push_status from public.notifications where profile_id = :'tp' limit 1) = 'inapp', 'test profile never pushes');
select pg_temp.fails($$select public.get_state('$$ || :'pid' || $$')$$, 'P030_FORBIDDEN', 'test tools cannot touch real player via player RPC');
select pg_temp.fails($$select public.admin_set_test_time('$$ || :'pid' || $$', now())$$, 'P030_NOT_A_TEST_PROFILE', 'cannot time-shift a real profile');

-- 第 3 天（溫室・香氛調配）：守夜人已離開 → 基本版；第 3 關三段體溫需審核
select pg_temp.ok((public.open_level(:'tp', 3) ->> 'title') = '溫室', 'day 3 is now the greenhouse');
select pg_temp.ok((public.submit_step(:'tp', 3, 's_order', '{"value":"a,b,c,d,e"}') ->> 'correct')::boolean, 'greenhouse watering order');
select public.submit_step(:'tp', 3, 's_ill', '{}') \g /dev/null
select pg_temp.ok(not (public.submit_step(:'tp', 3, 's_recipe', '{"value":"777251"}') ->> 'correct')::boolean, 'wrong essential-oil code rejected');
select pg_temp.ok((public.submit_step(:'tp', 3, 's_recipe', '{"value":"777250"}') ->> 'correct')::boolean, 'essential-oil code accepted');
select pg_temp.ok(not (public.submit_step(:'tp', 3, 's_night', '{}') ->> 'correct')::boolean, 'night bud closed at 10:00 (game clock)');
select public.admin_set_test_time(:'tp', (((now() at time zone 'Asia/Taipei')::date + 2)::text || ' 21:05:00+08')::timestamptz) \g /dev/null
select pg_temp.ok((public.submit_step(:'tp', 3, 's_night', '{}') ->> 'correct')::boolean, 'night bud opens after 21:00');
select pg_temp.ok(public.get_state(:'tp') -> 'inventory' @> '[{"key":"night_seed"}]', 'night seed granted');
select public.submit_step(:'tp', 3, 's_warm', '{}') \g /dev/null
select pg_temp.ok((public.open_level(:'tp', 3) -> 'steps' @> '[{"id":"s_people","photoset":{"count":3,"live":true}}]'), 'three-person photos are camera-only (live)');
select (public.submit_evidence(:'tp', 3, 's_people', 'photo', :'tp' || '/3/set-final.jpg', null) ->> 'id') as c3 \gset
select public.admin_review_evidence(:'c3', 'APPROVED', 'ok') \g /dev/null
select pg_temp.ok((public.get_state(:'tp') -> 'levels' -> 2 ->> 'status') = 'COMPLETED', 'day 3 completed after stage 3 approval');
select pg_temp.ok(public.get_state(:'tp') -> 'inventory' @> '[{"key":"sym:5"}]' or exists (select 1 from public.inventory where profile_id = :'tp' and source_day = 3 and kind = 'symbol' and (data ->> 'symbol')::int = 5), 'day 3 grants the sprout symbol');

-- 第 5 天（保險箱・投影卡 A）：前 4 天都錯過 → 守夜人已離開 → 紙條變體
select ((now() at time zone 'Asia/Taipei')::date + 4)::text || ' 10:00:00+08' as d5 \gset
select public.admin_create_test_profile('測試：保險箱', :'d5'::timestamptz) as sp \gset
select pg_temp.ok((public.open_level(:'sp', 5) ->> 'variant') = 'note', 'day 5 safe: variant = note (watcher left)');
select pg_temp.ok((public.open_level(:'sp', 5) -> 'steps' -> 0 ->> 'id') = 's_note', 'note step shown instead of watcher');
select pg_temp.ok((public.submit_step(:'sp', 5, 's_note', '{}') ->> 'correct')::boolean, 'note story');
select pg_temp.ok(not (public.submit_step(:'sp', 5, 's_scan', '{"target":1}') ->> 'correct')::boolean, 'wrong AR target rejected');
select pg_temp.fails($$select public.submit_step('$$ || :'sp' || $$', 5, 's_scan', '{"code":"VAULT-A"}')$$, 'P030_FALLBACK_DISABLED', 'fallback disabled by default');
select public.admin_set_ar_fallback(5, 's_scan', true) \g /dev/null
select pg_temp.ok((public.submit_step(:'sp', 5, 's_scan', '{"code":"vault-a"}') -> 'reveal' ->> 'digits') = '418', 'admin-enabled fallback + reveal');
select pg_temp.ok((public.submit_step(:'sp', 5, 's_open', '{"value":"418"}') ->> 'correct')::boolean, 'safe opened');
select pg_temp.ok(not (public.submit_step(:'sp', 5, 's_inside', '{}') ->> 'completed')::boolean, 'day 5 needs stage 3');
select (public.submit_evidence(:'sp', 5, 's_coord', 'photo', :'sp' || '/5/c.jpg', null) ->> 'id') as c5 \gset
select public.admin_review_evidence(:'c5', 'APPROVED', 'ok') \g /dev/null
select pg_temp.ok((public.get_state(:'sp') -> 'levels' -> 4 ->> 'status') = 'COMPLETED', 'day 5 safe completed after stage 3 approval');
select pg_temp.ok(public.get_state(:'sp') -> 'inventory' @> '[{"key":"photo_old"}]', 'old photo granted on day 5');
select ((now() at time zone 'Asia/Taipei')::date + 7)::text || ' 12:00:00+08' as d8s \gset
select public.admin_set_test_time(:'sp', :'d8s'::timestamptz) \g /dev/null
select pg_temp.ok(not (public.get_state(:'sp') -> 'inventory' @> '[{"key":"photo_old"}]'), 'photo lost when day 7 missed');
select pg_temp.ok(exists (select 1 from public.event_log where profile_id = :'sp' and type = 'ITEM_LOST'), 'ITEM_LOST logged');
select public.admin_delete_test_profile(:'sp') \g /dev/null

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
select pg_temp.ok(not (public.get_state(:'tp') -> 'inventory' @> '[{"key":"photo_old"}]'), 'no old photo without the safe');
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
select pg_temp.ok(jsonb_array_length(public.admin_overview() -> 'profiles') = 3, 'admin overview lists real + 2 test (auto + manual)');
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
select public.submit_step(:'gp', 1, 's_id_intro', '{}') \g /dev/null
select public.submit_step(:'gp', 1, 's_id', jsonb_build_object('value', to_char((select birthday from public.settings), 'MMDD'))) \g /dev/null
select public.submit_step(:'gp', 1, 's_calib', '{}') \g /dev/null
select public.submit_step(:'gp', 1, 's_tone', '{"option":"mono"}') \g /dev/null
select public.submit_step(:'gp', 1, 's_outfit', '{"option":"formal"}') \g /dev/null
select public.submit_step(:'gp', 1, 's_mood', '{"option":"calm"}') \g /dev/null
select public.submit_step(:'gp', 1, 's_scene', '{"option":"studio"}') \g /dev/null
select public.submit_step(:'gp', 1, 's_saved', '{}') \g /dev/null
select public.submit_step(:'gp', 1, 's_blackout', '{}') \g /dev/null
select public.submit_step(:'gp', 1, 's_power', '{"value":"011010"}') \g /dev/null
select public.submit_step(:'gp', 1, 's_sample', '{}') \g /dev/null
select public.submit_step(:'gp', 1, 's_lock', '{"value":"A168888483"}') \g /dev/null
select public.submit_step(:'gp', 1, 's_unlocked', '{}') \g /dev/null
select public.observe(:'gp', 'rest') \g /dev/null
select public.submit_step(:'gp', 1, 's_observe', '{}') \g /dev/null
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
select pg_temp.ok((select secrets #>> '{s_count,answer}' = '6' from public.levels where day = 2), 'day 2 listening answer stored server-side');
select pg_temp.ok((select private.norm(secrets #>> '{s_recipe,answer}') = private.norm('777250') from public.levels where day = 3), 'day 3 essential-oil answer');
select pg_temp.ok((select position('好像消化不良' in config::text) > 0 and position('對照速查表' in config::text) = 0 from public.levels where day = 3), 'pot label: indigestion + book in kitchen cupboard, no lookup-table line');
select pg_temp.ok((select secrets #>> '{s_recipe,hints,0}' = '對照速查表：用法 × 肌膚敏感度，數一數每一欄。' and secrets #>> '{s_recipe,hints,1}' like '翻開《居家保健小百科》%' and secrets #>> '{s_recipe,hints,2}' like '速查表有 3 種用法%' from public.levels where day = 3), 'recipe hints: lookup table -> open the book -> count');
select pg_temp.ok((select position('扮鬼臉' in config::text) > 0 and position('三段體溫' in config::text) = 0 from public.levels where day = 3), 'day 3 stage 3 is the funny-face joy nutrient task');
select pg_temp.ok((select private.norm(secrets #>> '{s_exam,answer}') = private.norm('bdbbcbabab') from public.levels where day = 6), 'day 6 exam answer (case-insensitive)');
select pg_temp.ok((select count(*) from public.levels l, jsonb_array_elements(l.config #> '{scene,hotspots}') h where h ? 'clue') >= 5, 'scene clue hotspots present');
select pg_temp.ok(position('找五隻' in (select config::text from public.levels where day = 2)) = 0, 'day 2 decoded cipher not leaked in public config');
select pg_temp.ok((select private.norm(secrets #>> '{s_serial,answer}') = '4710901898847' from public.levels where day = 2), 'day 2 barcode answer');
select pg_temp.ok(position('4710901898847' in (select config::text from public.levels where day = 2)) = 0, 'barcode not leaked in public config');
-- ════════════ F. 每關過關照片 ════════════
insert into public.reward_photos (day, stage, photo, caption) values (1, 1, 'data:image/jpeg;base64,AAA', '第一關'), (1, 2, 'data:image/jpeg;base64,BBB', '第二關'), (1, 3, 'data:image/jpeg;base64,CCC', '第三關');
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b', 'player@test.dev');
set role authenticated;
select pg_temp.ok(jsonb_array_length(public.stage_photos(:'pid', 1)) = 3, 'completed day shows all stage photos');
select pg_temp.ok(jsonb_array_length(public.stage_photos(:'pid', 2)) = 0, 'locked day shows no photos');
reset role; set search_path = public, extensions;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a', 'admin@test.dev');
set role authenticated;
select (select (birthday - 10)::text || ' 10:00:00+08' from public.settings) as phat \gset
select public.admin_create_test_profile('照片測試', :'phat'::timestamptz) as ph \gset
select public.open_level(:'ph', 1) \g /dev/null
select pg_temp.ok(jsonb_array_length(public.stage_photos(:'ph', 1)) = 0, 'no photo before clearing a stage');
select public.submit_step(:'ph', 1, 's_id_intro', '{}') \g /dev/null
select public.submit_step(:'ph', 1, 's_id', jsonb_build_object('value', to_char((select birthday from public.settings), 'MMDD'))) \g /dev/null
select public.submit_step(:'ph', 1, 's_calib', '{}') \g /dev/null
select public.submit_step(:'ph', 1, 's_tone', '{"option":"mono"}') \g /dev/null
select public.submit_step(:'ph', 1, 's_outfit', '{"option":"formal"}') \g /dev/null
select public.submit_step(:'ph', 1, 's_mood', '{"option":"calm"}') \g /dev/null
select public.submit_step(:'ph', 1, 's_scene', '{"option":"studio"}') \g /dev/null
select public.submit_step(:'ph', 1, 's_saved', '{}') \g /dev/null
select pg_temp.ok(jsonb_array_length(public.stage_photos(:'ph', 1)) = 0, 'no photo until the whole day is completed');
select public.admin_delete_test_profile(:'ph') \g /dev/null
reset role; set search_path = public, extensions;
select pg_temp.ok((select count(*) from public.reward_photos) = 3, 'admin can store photos');
-- ════════════ 測試：直接選區 ════════════
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a', 'admin@test.dev');
set role authenticated;
select public.admin_create_test_profile('選區', null) as tj \gset
select public.admin_test_jump(:'tj', 5) \g /dev/null
select pg_temp.ok((public.get_state(:'tj') ->> 'game_day')::int = 5, 'jump: simulated day 5');
select pg_temp.ok((select count(*) from public.player_levels where profile_id = :'tj' and day < 5 and status = 'COMPLETED' and missed_at is null) = 4, 'jump: zones 1-4 completed on time');
select pg_temp.ok((public.get_state(:'tj') -> 'levels' -> 4 ->> 'status') in ('AVAILABLE', 'IN_PROGRESS'), 'jump: zone 5 open');
select pg_temp.ok((public.open_level(:'tj', 5) -> 'steps' -> 0 ->> 'id') is not null, 'jump: zone 5 playable');
select public.admin_test_jump(:'tj', 2) \g /dev/null
select pg_temp.ok((select count(*) from public.player_levels where profile_id = :'tj' and status = 'COMPLETED') = 1, 'jump back: progress cleared, only zone 1 completed');
select public.admin_test_jump(:'tj', 11) \g /dev/null
select pg_temp.ok((public.get_state(:'tj') ->> 'game_day')::int = 11, 'jump: finale day');
select pg_temp.ok((select count(*) from public.player_levels where profile_id = :'tj' and day <= 10 and status = 'COMPLETED') = 10, 'jump: zones 1-10 completed before finale');
select pg_temp.fails($$select public.admin_test_jump('$$ || :'pid' || $$', 3)$$, 'P030_NOT_A_TEST_PROFILE', 'jump refuses real player profile');
select pg_temp.fails($$select public.admin_test_jump('$$ || :'tj' || $$', 12)$$, 'P030_BAD_DAY', 'jump rejects bad day');
select public.admin_delete_test_profile(:'tj') \g /dev/null
reset role; set search_path = public, extensions;
-- ════════════ 第 2 區改版：聽音訊 → 注音亂碼＋五隻貓 → 笑話錄音 ════════════
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a', 'admin@test.dev');
set role authenticated;
select public.admin_create_test_profile('第二區', null) as t2 \gset
select public.admin_test_jump(:'t2', 2) \g /dev/null
select pg_temp.ok((public.open_level(:'t2', 2) -> 'steps' -> 0 ->> 'id') = 's_intro', 'day 2 starts with intro');
select public.submit_step(:'t2', 2, 's_intro', '{}') \g /dev/null
select pg_temp.ok((public.submit_step(:'t2', 2, 's_tune', '{"value":"1037"}') ->> 'correct')::boolean, 'day 2 tune');
select public.submit_step(:'t2', 2, 's_signal', '{}') \g /dev/null
select pg_temp.ok(not (public.submit_step(:'t2', 2, 's_count', '{"value":"5"}') ->> 'correct')::boolean, 'listen: 5 kinds rejected');
select pg_temp.ok((public.submit_step(:'t2', 2, 's_count', '{"value":"6"}') ->> 'correct')::boolean, 'listen: 6 kinds accepted');
select public.submit_step(:'t2', 2, 's_print', '{}') \g /dev/null
select pg_temp.ok(not (public.submit_step(:'t2', 2, 's_serial', '{"value":"4710901898840"}') ->> 'correct')::boolean, 'barcode: wrong serial rejected');
select pg_temp.ok((public.submit_step(:'t2', 2, 's_serial', '{"value":"4710901898847"}') ->> 'correct')::boolean, 'barcode: tissue barcode accepted');
select public.submit_step(:'t2', 2, 's_printed', '{}') \g /dev/null
select pg_temp.ok(not (public.submit_step(:'t2', 2, 's_decode', '{"value":"5l3j35 al au q9 5l4"}') ->> 'correct')::boolean, 'cipher: raw text rejected');
select pg_temp.ok((public.submit_step(:'t2', 2, 's_decode', '{"value":"找 5 隻貓咪，拍照"}') ->> 'correct')::boolean, 'cipher: decoded sentence accepted (spacing/punctuation/digit tolerant)');
select public.submit_evidence(:'t2', 2, 's_cats', 'photo', :'t2' || '/2/cats.jpg', null) as r_cats \gset
select pg_temp.ok((:'r_cats'::jsonb ->> 'pending')::boolean, 'cats photo waits for approval');
select :'r_cats'::jsonb ->> 'id' as e_cats \gset
select pg_temp.fails($$select public.submit_step('$$ || :'t2' || $$', 2, 's_laugh', '{}')$$, 'P030_', 'joke stage locked until cats photo approved');
select public.admin_review_evidence(:'e_cats', 'APPROVED', '五隻都在') \g /dev/null
select public.submit_step(:'t2', 2, 's_laugh', '{}') \g /dev/null
select (public.submit_evidence(:'t2', 2, 's_joke', 'audio', :'t2' || '/2/joke.webm', null) ->> 'id') as e_joke \gset
select public.admin_review_evidence(:'e_joke', 'APPROVED', '有笑') \g /dev/null
select public.submit_step(:'t2', 2, 's_watcher', '{}') \g /dev/null
select pg_temp.ok((public.get_state(:'t2') -> 'levels' -> 1 ->> 'status') = 'COMPLETED', 'day 2 completes after cats photo + joke recording approved');
select public.admin_delete_test_profile(:'t2') \g /dev/null
reset role; set search_path = public, extensions;
-- ════════════ 第二階段進化事件 ════════════
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a', 'admin@test.dev');
set role authenticated;
insert into public.evo_works (category, game_label, work_code, title, source_url, note, image, tint, sort)
select 'env', '環境 E-0' || g, 'ENV-' || g, '環境作品 ' || g, 'https://example.test/env' || g, '備註', 'data:image/jpeg;base64,AA', '#88aacc', g from generate_series(1, 3) g;
insert into public.evo_works (category, game_label, work_code, title, source_url, note, image, tint, sort)
select 'form', '形態 ' || chr(64 + g), 'CS-' || g, '作品 ' || g, 'https://example.test/' || g, '管理者備註 ' || g, 'data:image/jpeg;base64,BB', '#cc8866', g from generate_series(1, 9) g;
select pg_temp.ok((select count(*) from public.evo_works) = 12, 'admin can upload evolution works');
select public.admin_create_test_profile('進化', null) as ev \gset
select public.admin_test_jump(:'ev', 3) \g /dev/null
select pg_temp.ok((public.evo_state(:'ev') ->> 'status') = 'locked', 'evolution locked before day 3 is completed');
select pg_temp.fails($$select public.evo_begin('$$ || :'ev' || $$')$$, 'P030_EVO_LOCKED', 'cannot begin while locked');
select public.admin_test_jump(:'ev', 4) \g /dev/null
select pg_temp.ok((public.evo_state(:'ev') ->> 'status') = 'ready', 'evolution ready after day 3 completed');
select pg_temp.ok((public.get_state(:'ev') #>> '{evo,status}') = 'ready', 'state carries evolution summary');
select public.evo_begin(:'ev') as v \gset
select pg_temp.ok((:'v'::jsonb ->> 'phase') = 'env' and jsonb_array_length(:'v'::jsonb -> 'options') = 2, 'phase 1: pairwise environment comparison');
select pg_temp.ok(position('ENV-' in :'v') = 0 and position('example.test' in :'v') = 0 and position('備註' in :'v') = 0, 'player view hides work codes, links and notes');
select pg_temp.ok((:'v'::jsonb #>> '{identity,observer_no}') is not null, 'initial identity snapshot kept');
select pg_temp.fails($$select public.evo_pick('$$ || :'ev' || $$', gen_random_uuid())$$, 'P030_EVO_BAD_PICK', 'pick must be one of the shown options');
-- 進化環境：3 張 → 2 次比較
select public.evo_pick(:'ev', ((public.evo_state(:'ev') -> 'options' -> 0 ->> 'id'))::uuid) \g /dev/null
select public.evo_pick(:'ev', ((public.evo_state(:'ev') -> 'options' -> 1 ->> 'id'))::uuid) as v \gset
select pg_temp.ok((:'v'::jsonb ->> 'phase') = 'form' and (:'v'::jsonb ->> 'steps')::int = 3 and jsonb_array_length(:'v'::jsonb -> 'options') = 3, 'phase 2: three form rounds of 3');
select public.evo_pick(:'ev', ((public.evo_state(:'ev') -> 'options' -> 0 ->> 'id'))::uuid) \g /dev/null
select public.evo_pick(:'ev', ((public.evo_state(:'ev') -> 'options' -> 1 ->> 'id'))::uuid) \g /dev/null
select public.evo_pick(:'ev', ((public.evo_state(:'ev') -> 'options' -> 2 ->> 'id'))::uuid) as v \gset
select pg_temp.ok((:'v'::jsonb ->> 'phase') = 'final1' and jsonb_array_length(:'v'::jsonb -> 'options') = 3, 'final: choose first from 3 finalists');
select public.evo_pick(:'ev', ((public.evo_state(:'ev') -> 'options' -> 1 ->> 'id'))::uuid) as v \gset
select pg_temp.ok((:'v'::jsonb ->> 'phase') = 'final2' and jsonb_array_length(:'v'::jsonb -> 'options') = 2, 'final: choose second from remaining 2');
select public.evo_pick(:'ev', ((public.evo_state(:'ev') -> 'options' -> 0 ->> 'id'))::uuid) as v \gset
select pg_temp.ok((:'v'::jsonb ->> 'phase') = 'confirm' and (:'v'::jsonb #>> '{first,label}') is not null and (:'v'::jsonb #>> '{second,label}') is not null, 'confirm shows first and second');
select public.evo_redo_final(:'ev') as v \gset
select pg_temp.ok((:'v'::jsonb ->> 'phase') = 'final1', 'can redo final choice before confirming');
select public.evo_pick(:'ev', ((public.evo_state(:'ev') -> 'options' -> 2 ->> 'id'))::uuid) \g /dev/null
select public.evo_pick(:'ev', ((public.evo_state(:'ev') -> 'options' -> 0 ->> 'id'))::uuid) \g /dev/null
select public.evo_confirm(:'ev') as v \gset
select pg_temp.ok((:'v'::jsonb ->> 'status') = 'done' and (:'v'::jsonb ->> 'code') like 'OBS-%-II-%', 'evolution completes with new identity code');
select pg_temp.ok(exists (select 1 from public.inventory where profile_id = :'ev' and item_key = 'evo_mark'), 'special symbol granted');
select pg_temp.ok((public.get_state(:'ev') #>> '{evo,status}') = 'done' and (public.get_state(:'ev') #>> '{evo,tint}') = '#cc8866', 'sample receives evolved appearance');
select pg_temp.fails($$select public.evo_pick('$$ || :'ev' || $$', gen_random_uuid())$$, 'P030_EVO_DONE', 'evolution happens only once');
select (public.admin_evo_results() -> 0) is not null as x \gset
select pg_temp.ok((select (e ->> 'status') = 'done' and (e #>> '{first,work_code}') like 'CS-%' and (e #>> '{second,work_code}') like 'CS-%'
                     and jsonb_array_length(e -> 'log') = 10 and (e #>> '{first,image}') like 'data:%'
                   from jsonb_array_elements(public.admin_evo_results()) e where e ->> 'profile_id' = :'ev'), 'admin sees first/second works, images and full comparison log');
select pg_temp.ok((select count(*) from public.evo_runs where profile_id = :'ev' and completed_at is not null) = 1, 'result persisted');
reset role; set search_path = public, extensions;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b', 'player@test.dev');
set role authenticated;
select pg_temp.ok((select count(*) from public.evo_works) = 0, 'player cannot read works table (codes/notes hidden)');
select pg_temp.fails('select public.admin_evo_results()', 'P030_ADMIN_ONLY', 'player cannot read evolution results');
select pg_temp.ok((public.evo_state(:'pid') ->> 'status') in ('locked', 'ready'), 'real player has own evolution state');
reset role; set search_path = public, extensions;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a', 'admin@test.dev');
set role authenticated;
select public.admin_test_reset(:'ev') \g /dev/null
select pg_temp.ok((select count(*) from public.evo_runs where profile_id = :'ev') = 0, 'test reset clears evolution');
select public.admin_delete_test_profile(:'ev') \g /dev/null
reset role; set search_path = public, extensions;
\echo ALL TESTS PASSED
