-- 終章：給他的話、小時候的照片與家人的影片、他送給三十歲自己的一句話
-- 信與回憶只存在資料庫（不放進公開的程式碼），生日當天之前玩家端拿不到
alter table public.finale_config add column if not exists letter text;
alter table public.finale_config add column if not exists memories jsonb not null default '[]';  -- [{kind:'photo'|'video', path, caption}]
alter table public.finale_progress add column if not exists note text;
alter table public.finale_progress add column if not exists note_at timestamptz;

-- 家人的影片比較大：gifts 資料夾單檔上限放寬到 50 MB（Supabase 免費方案的上限）
do $$ begin
  if exists (select 1 from pg_namespace where nspname = 'storage') then
    update storage.buckets set file_size_limit = 52428800 where id = 'gifts' and coalesce(file_size_limit, 0) < 52428800;
  end if;
exception when others then raise notice 'bucket limit skipped: %', sqlerrm;
end $$;

-- 終章當天才拿得到：給他的話＋回憶清單
create or replace function public.finale_extras(p uuid) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare fc public.finale_config;
begin
  perform private.assert_profile(p);
  perform private.assert_finale_open(p);
  select * into fc from public.finale_config where id = 1;
  return jsonb_build_object('letter', fc.letter, 'memories', coalesce(fc.memories, '[]'::jsonb));
end $$;

-- 他送給三十歲自己的一句話
create or replace function public.finale_note(p uuid, note text) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare t timestamptz; n text := btrim(coalesce(note, ''));
begin
  perform private.assert_profile(p);
  perform private.assert_finale_open(p);
  if length(n) < 1 or length(n) > 500 then raise exception 'P030_BAD_ANSWER'; end if;
  t := private.game_now(p);
  insert into public.finale_progress (profile_id) values (p) on conflict do nothing;
  update public.finale_progress set note = n, note_at = t where profile_id = p;
  insert into public.flags (profile_id, key, value, source, set_at) values (p, 'choice:note', to_jsonb(n), 'day:11', t)
  on conflict (profile_id, key) do update set value = excluded.value, set_at = excluded.set_at, source = excluded.source;
  perform private.log(p, t, 'NOTE', 11, jsonb_build_object('length', length(n)));
  return jsonb_build_object('ok', true);
end $$;

revoke all on function public.finale_extras(uuid), public.finale_note(uuid, text) from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on function public.finale_extras(uuid), public.finale_note(uuid, text) from anon';
    execute 'grant execute on function public.finale_extras(uuid), public.finale_note(uuid, text) to authenticated';
  end if;
end $$;

notify pgrst, 'reload schema';
select '終章：給他的話與回憶已安裝' as status;
