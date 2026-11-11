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
