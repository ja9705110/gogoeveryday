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
