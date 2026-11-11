-- PROJECT 030 · 每天完成後送給壽星的一段話
-- 照片變成可選：只放文字也可以。當天全部完成後才會回傳（同照片）。
alter table public.reward_photos alter column photo drop not null;

create or replace function public.stage_photos(p uuid, d int) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare pl public.player_levels;
begin
  perform private.assert_profile(p);
  select * into pl from public.player_levels where profile_id = p and day = d;
  if pl.status is distinct from 'COMPLETED' then return '[]'; end if;
  return (select coalesce(jsonb_agg(jsonb_build_object('stage', rp.stage, 'photo', rp.photo, 'caption', rp.caption, 'updated_at', rp.updated_at) order by rp.stage), '[]')
            from public.reward_photos rp where rp.day = d and (rp.photo is not null or coalesce(trim(rp.caption), '') <> ''));
end $$;

-- 已完成的區域裡，有照片或留言的（只回傳日期與更新時間，不含內容）：用來提示「有新的訊息」
create or replace function public.reward_index(p uuid) returns jsonb
language plpgsql security definer set search_path = public, private as $$
begin
  perform private.assert_profile(p);
  return (select coalesce(jsonb_agg(jsonb_build_object('day', rp.day, 'updated_at', rp.updated_at) order by rp.day), '[]')
            from public.reward_photos rp
            join public.player_levels pl on pl.profile_id = p and pl.day = rp.day and pl.status = 'COMPLETED'
           where rp.stage = 1 and (rp.photo is not null or coalesce(trim(rp.caption), '') <> ''));
end $$;

revoke all on function public.stage_photos(uuid, int), public.reward_index(uuid) from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on function public.stage_photos(uuid, int), public.reward_index(uuid) from anon';
    execute 'grant execute on function public.stage_photos(uuid, int), public.reward_index(uuid) to authenticated';
  end if;
end $$;

select '每日留言已啟用' as status;
