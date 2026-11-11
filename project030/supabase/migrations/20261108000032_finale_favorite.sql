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
