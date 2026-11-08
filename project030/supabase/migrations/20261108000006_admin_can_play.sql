-- 管理者信箱若同時在受邀名單中，也建立一份正式玩家檔案（方便用同一個信箱試玩）
create or replace function public.bootstrap() returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare uid uuid := auth.uid(); em text := lower(coalesce(auth.jwt() ->> 'email', '')); adm boolean; invited boolean; prof jsonb;
begin
  if uid is null then raise exception 'P030_NOT_SIGNED_IN' using errcode = '42501'; end if;
  if exists (select 1 from public.admin_emails where lower(email) = em) then
    insert into public.admins (user_id) values (uid) on conflict do nothing;
  end if;
  adm := exists (select 1 from public.admins where user_id = uid);
  invited := exists (select 1 from public.allowed_players where lower(email) = em);
  if invited then
    insert into public.profiles (user_id, label) values (uid, em) on conflict do nothing;
  end if;
  select coalesce(jsonb_agg(jsonb_build_object('id', id, 'is_test', is_test, 'label', label) order by is_test, created_at), '[]')
    into prof from public.profiles where user_id = uid;
  return jsonb_build_object('is_admin', adm, 'allowed', adm or invited, 'email', em, 'profiles', prof);
end $$;
revoke all on function public.bootstrap() from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on function public.bootstrap() from anon';
    execute 'grant execute on function public.bootstrap() to authenticated';
  end if;
end $$;
