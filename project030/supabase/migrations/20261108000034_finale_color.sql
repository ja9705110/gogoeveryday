-- 終章：他選一個代表自己的顏色，最後的星球（Jasper）用這個顏色呈現
create or replace function public.finale_color(p uuid, color text) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare t timestamptz;
begin
  perform private.assert_profile(p);
  perform private.assert_finale_open(p);
  t := private.game_now(p);
  if color is null or lower(color) !~ '^#[0-9a-f]{6}$' then raise exception 'P030_BAD_ANSWER'; end if;
  insert into public.flags (profile_id, key, value, source, set_at) values (p, 'choice:color', to_jsonb(lower(color)), 'day:11', t)
  on conflict (profile_id, key) do update set value = excluded.value, set_at = excluded.set_at, source = excluded.source;
  perform private.log(p, t, 'COLOR', 11, jsonb_build_object('color', lower(color)));
  return jsonb_build_object('ok', true, 'color', lower(color));
end $$;

revoke all on function public.finale_color(uuid, text) from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on function public.finale_color(uuid, text) from anon';
    execute 'grant execute on function public.finale_color(uuid, text) to authenticated';
  end if;
end $$;

select '終章代表色已安裝' as status;

-- 讓 API 立刻認得新的函式
notify pgrst, 'reload schema';
