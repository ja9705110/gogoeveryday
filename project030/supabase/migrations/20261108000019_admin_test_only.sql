-- 管理者只負責「管理」與「測試」：不再擁有正式玩家檔案
-- 正式檔案只屬於壽星（observer@p030.game）；管理者登入遊戲頁面時一律使用測試檔案（模擬時間、不推播、不影響正式進度）
create or replace function public.bootstrap() returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare uid uuid := auth.uid(); em text := lower(coalesce(auth.jwt() ->> 'email', '')); adm boolean; invited boolean; prof jsonb; tp uuid; bday date;
begin
  if uid is null then raise exception 'P030_NOT_SIGNED_IN' using errcode = '42501'; end if;
  if exists (select 1 from public.admin_emails where lower(email) = em) then
    insert into public.admins (user_id) values (uid) on conflict do nothing;
  end if;
  adm := exists (select 1 from public.admins where user_id = uid);
  invited := not adm and exists (select 1 from public.allowed_players where lower(email) = em);
  if invited then
    insert into public.profiles (user_id, label) values (uid, em) on conflict do nothing;
  end if;
  -- 管理者第一次進遊戲頁面：自動建立一份測試檔案，模擬時間＝第 1 天早上 10:00
  if adm and not exists (select 1 from public.profiles where user_id = uid and is_test) then
    select birthday into bday from public.settings where id = 1;
    insert into public.profiles (user_id, is_test, label, sim_offset)
    values (uid, true, '測試檔案',
            case when bday is null then null else (((bday - 10)::timestamp + time '10:00') at time zone 'Asia/Taipei') - now() end)
    returning id into tp;
    perform private.refresh(tp);
  end if;
  select coalesce(jsonb_agg(jsonb_build_object('id', id, 'is_test', is_test, 'label', label) order by is_test, created_at), '[]')
    into prof from public.profiles where user_id = uid and (is_test or not adm);
  return jsonb_build_object('is_admin', adm, 'allowed', adm or invited, 'email', em, 'profiles', prof);
end $$;

-- 清除管理者先前誤建的正式檔案（含其進度紀錄），並把管理者信箱移出玩家名單
do $$
begin
  perform set_config('p030.purge_test', 'on', true);
  delete from public.profiles pf using public.admins a where pf.user_id = a.user_id and not pf.is_test;
  delete from public.allowed_players ap where lower(ap.email) in (select lower(email) from public.admin_emails);
  perform set_config('p030.purge_test', 'off', true);
end $$;
