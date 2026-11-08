// 部署時由 GitHub Actions 以 Repository Secrets/Variables 覆寫此檔。
// 本機測試可直接填入 Supabase 專案的 URL 與 anon key（anon key 屬公開金鑰，安全性由 RLS 與 RPC 權限保證）。
export const CONFIG = {
  SUPABASE_URL: '__SUPABASE_URL__',
  SUPABASE_ANON_KEY: '__SUPABASE_ANON_KEY__',
  VAPID_PUBLIC_KEY: '__VAPID_PUBLIC_KEY__',
};
