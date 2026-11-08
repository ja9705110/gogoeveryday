-- 每關過關照片：管理者上傳；只有玩家真的過了那一關，伺服器才會回傳
create table if not exists public.reward_photos (
  day        int  not null check (day between 1 and 11),
  stage      int  not null check (stage between 1 and 9),
  photo      text not null,
  caption    text,
  updated_at timestamptz not null default now(),
  primary key (day, stage)
);
alter table public.reward_photos enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'reward_photos' and policyname = 'admin_all') then
    create policy admin_all on public.reward_photos for all using (public.is_admin()) with check (public.is_admin());
  end if;
end $$;

create or replace function public.stage_photos(p uuid, d int) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare l public.levels; pl public.player_levels; r jsonb; st jsonb; done_stages int[] := '{}'; pending int[] := '{}';
begin
  perform private.assert_profile(p);
  select * into l from public.levels where day = d;
  select * into pl from public.player_levels where profile_id = p and day = d;
  if pl.status is null or pl.status = 'LOCKED' then return '[]'; end if;
  r := private.resolve(p, l, pl);
  for st in select * from jsonb_array_elements(r -> 'steps') loop
    if st ? 'stage' and not coalesce((st ->> 'optional')::boolean, false) and not ((pl.data -> 'done') ? (st ->> 'id')) then
      pending := pending || (st ->> 'stage')::int;
    end if;
    if st ? 'stage' then done_stages := done_stages || (st ->> 'stage')::int; end if;
  end loop;
  return (select coalesce(jsonb_agg(jsonb_build_object('stage', rp.stage, 'photo', rp.photo, 'caption', rp.caption) order by rp.stage), '[]')
            from public.reward_photos rp
           where rp.day = d
             and (pl.status = 'COMPLETED' and pl.missed_at is null and rp.stage = any(done_stages)
                  or (rp.stage = any(done_stages) and not rp.stage = any(pending))));
end $$;

revoke all on function public.stage_photos(uuid, int) from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on function public.stage_photos(uuid, int) from anon';
    execute 'grant execute on function public.stage_photos(uuid, int) to authenticated';
  end if;
end $$;
