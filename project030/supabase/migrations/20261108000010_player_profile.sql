-- 壽星資料：後台只需設定「名字」與「生日」
-- 登入：輸入生日月日（MMDD）＝ observer@p030.game 的密碼 p030-MMDD（由伺服器自動設定）
alter table public.settings add column if not exists player_name text not null default '觀察員';

create or replace function public.admin_set_player(p_name text, p_birthday date) returns jsonb
language plpgsql security definer set search_path = public, private, extensions, auth as $$
declare uid uuid; pw text; em text := 'observer@p030.game';
begin
  perform private.assert_admin();
  if p_birthday is null then raise exception 'P030_BIRTHDAY_REQUIRED'; end if;
  update public.settings set player_name = coalesce(nullif(trim(p_name), ''), '觀察員'), birthday = p_birthday, updated_at = now() where id = 1;
  pw := 'p030-' || to_char(p_birthday, 'MMDD');
  select id into uid from auth.users where lower(email) = em limit 1;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
                            raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
                            confirmation_token, recovery_token, email_change_token_new, email_change)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', em,
            crypt(pw, gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '');
  else
    update auth.users set encrypted_password = crypt(pw, gen_salt('bf')), email_confirmed_at = coalesce(email_confirmed_at, now()), updated_at = now()
     where id = uid;
  end if;
  if not exists (select 1 from auth.identities where user_id = uid and provider = 'email') then
    insert into auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid::text, uid, jsonb_build_object('sub', uid::text, 'email', em, 'email_verified', true), 'email', now(), now(), now());
  end if;
  insert into public.allowed_players (email, note) values (em, '壽星') on conflict do nothing;
  return jsonb_build_object('player_name', (select player_name from public.settings where id = 1),
                            'birthday', p_birthday, 'login_code', to_char(p_birthday, 'MMDD'),
                            'start_date', p_birthday - 10);
end $$;

-- 重置壽星進度：刪除正式檔案，下次登入自動建立全新的一份（帳號與生日不變）
create or replace function public.admin_reset_player() returns int
language plpgsql security definer set search_path = public, private as $$
declare n int;
begin
  perform private.assert_admin();
  perform set_config('p030.purge_test', 'on', true);
  delete from public.profiles where not is_test
     and user_id in (select id from auth.users where lower(email) = 'observer@p030.game');
  get diagnostics n = row_count;
  perform set_config('p030.purge_test', 'off', true);
  return n;
end $$;

create or replace function public.get_state(p uuid) returns jsonb
language plpgsql security definer set search_path = public, private as $$
begin
  perform private.assert_profile(p);
  perform private.refresh(p);
  return private.state(p) || (select jsonb_build_object('player_name', player_name, 'observer_no', to_char(birthday, 'MMDD')) from public.settings where id = 1);
end $$;

revoke all on function public.admin_set_player(text, date), public.admin_reset_player() from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on function public.admin_set_player(text, date), public.admin_reset_player() from anon';
    execute 'grant execute on function public.admin_set_player(text, date), public.admin_reset_player(), public.get_state(uuid) to authenticated';
  end if;
end $$;
