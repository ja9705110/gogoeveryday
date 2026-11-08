-- PROJECT 030 · 檔案儲存權限與背景排程
-- 這個檔案只在 Supabase 上有效（需要 storage / pg_cron / pg_net）。本機測試會自動略過。

do $outer$
begin
  if not exists (select 1 from pg_namespace where nspname = 'storage') then
    raise notice 'storage schema missing – skipped';
    return;
  end if;

  insert into storage.buckets (id, name, public, file_size_limit)
  values ('evidence', 'evidence', false, 26214400),
         ('gifts', 'gifts', false, 15728640)
  on conflict (id) do nothing;

  -- 路徑規則：<profile_id>/<...>；只有檔案擁有者與管理者能讀寫
  begin
    execute $p$create policy p030_owner_insert on storage.objects for insert to authenticated
    with check (bucket_id in ('evidence', 'gifts')
      and (storage.foldername(name))[1] in (select id::text from public.profiles where user_id = auth.uid()))$p$;
  exception when others then raise notice 'policy p030_owner_insert skipped: %', sqlerrm;
  end;
  begin
    execute $p$create policy p030_owner_read on storage.objects for select to authenticated
    using (bucket_id in ('evidence', 'gifts')
      and ((storage.foldername(name))[1] in (select id::text from public.profiles where user_id = auth.uid()) or public.is_admin()))$p$;
  exception when others then raise notice 'policy p030_owner_read skipped: %', sqlerrm;
  end;
  begin
    execute $p$create policy p030_admin_delete on storage.objects for delete to authenticated
    using (bucket_id in ('evidence', 'gifts') and public.is_admin())$p$;
  exception when others then raise notice 'policy p030_admin_delete skipped: %', sqlerrm;
  end;
  begin
    execute $p$create policy p030_owner_delete_gift on storage.objects for delete to authenticated
    using (bucket_id = 'gifts' and (storage.foldername(name))[1] in (select id::text from public.profiles where user_id = auth.uid()))$p$;
  exception when others then raise notice 'policy p030_owner_delete_gift skipped: %', sqlerrm;
  end;
end
$outer$;

-- 推播派送設定（不經 API 暴露）
create table if not exists private.app_config (key text primary key, value text not null);

create or replace function private.dispatch_push() returns void
language plpgsql security definer set search_path = public, private as $$
declare url text; secret text;
begin
  select value into url from private.app_config where key = 'push_function_url';
  select value into secret from private.app_config where key = 'cron_secret';
  if url is null or secret is null then return; end if;
  if not exists (select 1 from public.notifications where push_status = 'queued') then return; end if;
  perform net.http_post(url := url, body := '{}'::jsonb,
                        headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', secret));
end $$;

do $outer$
begin
  if not exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    raise notice 'pg_cron unavailable – skipped';
    return;
  end if;
  create extension if not exists pg_cron;
  create extension if not exists pg_net;
  perform cron.unschedule(jobid) from cron.job where jobname = 'p030-tick';
  -- 每 5 分鐘：判定逾期、產生提醒、派送推播（與玩家是否開啟網頁無關）
  perform cron.schedule('p030-tick', '*/5 * * * *', 'select public.cron_tick(); select private.dispatch_push();');
end
$outer$;
