-- PROJECT 030 · 重拍時刪除舊照片
-- 玩家只能刪除「自己」的「分格照片」（集結之手、多格照片的子資料夾 mosaic-*／set-*）；
-- 已送出審核的合併照片放在上一層資料夾，玩家刪不到。
do $outer$
begin
  if not exists (select 1 from pg_namespace where nspname = 'storage') then
    raise notice 'storage schema missing – skipped';
    return;
  end if;
  begin
    execute $p$create policy p030_owner_delete_tiles on storage.objects for delete to authenticated
    using (bucket_id = 'evidence'
      and (storage.foldername(name))[1] in (select id::text from public.profiles where user_id = auth.uid())
      and coalesce(array_length(storage.foldername(name), 1), 0) >= 3
      and ((storage.foldername(name))[3] like 'mosaic-%' or (storage.foldername(name))[3] like 'set-%'))$p$;
  exception
    when duplicate_object then raise notice 'policy p030_owner_delete_tiles already exists';
    when others then raise notice 'policy p030_owner_delete_tiles skipped: %', sqlerrm;
  end;
end
$outer$;

select '重拍刪除舊照片：權限已設定' as status;
