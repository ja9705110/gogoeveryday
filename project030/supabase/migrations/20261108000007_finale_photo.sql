-- 終章照片：只存在資料庫（管理者上傳），生日當天之後才由 RPC 交給玩家
alter table public.finale_config add column if not exists photo text;

create or replace function public.finale_photo(p uuid) returns text
language plpgsql security definer set search_path = public, private as $$
begin
  perform private.assert_profile(p);
  perform private.assert_finale_open(p);
  return (select photo from public.finale_config where id = 1);
end $$;
revoke all on function public.finale_photo(uuid) from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on function public.finale_photo(uuid) from anon';
    execute 'grant execute on function public.finale_photo(uuid) to authenticated';
  end if;
end $$;
