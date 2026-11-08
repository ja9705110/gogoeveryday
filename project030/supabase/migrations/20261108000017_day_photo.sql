-- 過關照片改為「一天一張」：當天全部完成（碎片回收）後才會回傳
create or replace function public.stage_photos(p uuid, d int) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare pl public.player_levels;
begin
  perform private.assert_profile(p);
  select * into pl from public.player_levels where profile_id = p and day = d;
  if pl.status is distinct from 'COMPLETED' then return '[]'; end if;
  return (select coalesce(jsonb_agg(jsonb_build_object('stage', rp.stage, 'photo', rp.photo, 'caption', rp.caption) order by rp.stage), '[]')
            from public.reward_photos rp where rp.day = d);
end $$;
revoke all on function public.stage_photos(uuid, int) from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on function public.stage_photos(uuid, int) from anon';
    execute 'grant execute on function public.stage_photos(uuid, int) to authenticated';
  end if;
end $$;
