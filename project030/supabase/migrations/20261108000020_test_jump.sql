-- 測試：直接選區。清空這份測試檔案 → 前面各區以「準時完成」帶過 → 模擬時間跳到該區當天 10:00（或自訂開放時間）
create or replace function public.admin_test_jump(p uuid, d int) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare k int; t timestamptz; s public.settings;
begin
  perform private.assert_test(p);
  if d is null or d < 1 or d > 11 then raise exception 'P030_BAD_DAY'; end if;
  s := private.settings();
  perform public.admin_test_reset(p);
  for k in 1 .. d loop
    -- 當天 10:00；若管理者自訂了較晚的開放時間，就用開放後 1 分鐘
    t := greatest(((s.birthday - 10 + (k - 1))::timestamp + time '10:00') at time zone s.tz,
                  (private.level_window(k)).open_at + interval '1 minute');
    update public.profiles set sim_offset = t - now() where id = p;
    perform private.refresh(p);
    if k < d then perform private.complete_level(p, k, t); end if;
  end loop;
  return private.state(p);
end $$;

revoke all on function public.admin_test_jump(uuid, int) from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on function public.admin_test_jump(uuid, int) from anon';
    execute 'grant execute on function public.admin_test_jump(uuid, int) to authenticated';
  end if;
end $$;
