# PROJECT 030

一場為 30 歲生日準備的十天互動密室逃脫（手機網頁／PWA）。設計文件見 [docs/DESIGN.md](docs/DESIGN.md)。

```
project030/
├─ web/                 靜態網站（GitHub Pages 部署這個資料夾）
│  ├─ index.html        玩家端
│  ├─ admin.html        管理後台
│  ├─ js/ css/ vendor/  程式、樣式、supabase-js 與 MindAR（已內含，不依賴 CDN）
│  └─ ar/targets.mind   AR 影像追蹤目標（卡片 A、B）
├─ print/               AR 卡片列印檔（不會公開部署）
├─ supabase/
│  ├─ migrations/       資料庫結構、遊戲引擎、管理／排程、儲存權限、種子內容
│  ├─ functions/push-dispatch/   Web Push 派送
│  ├─ content/levels.mjs         關卡內容原稿（產生種子 SQL）
│  └─ tests/            本機引擎測試
└─ tools/               build-seed.mjs、make-ar-targets.mjs
```

## 部署（約 15 分鐘）

1. **Supabase**：到 supabase.com 建立專案（區域建議 Tokyo / Singapore）。
   * Authentication → Providers → Email：開啟。Email Templates → Magic Link：在內容加入 `{{ .Token }}`，玩家就能收到 6 位數驗證碼（信中的連結也可以直接登入）。
   * Authentication → URL Configuration：Site URL 填 GitHub Pages 網址（例如 `https://<帳號>.github.io/gogoeveryday/`）。
   * 建議設定自訂 SMTP，避免內建寄信額度不足。
2. **VAPID 金鑰**（推播用）：`npx web-push generate-vapid-keys`
3. **GitHub → Settings → Secrets and variables → Actions** 新增：

   | Secret | 內容 |
   |---|---|
   | `SUPABASE_ACCESS_TOKEN` | Supabase 個人 Access Token（Account → Access Tokens） |
   | `SUPABASE_PROJECT_REF` | 專案 ref（網址 `https://<ref>.supabase.co` 的那段） |
   | `SUPABASE_DB_PASSWORD` | 建立專案時設定的資料庫密碼 |
   | `SUPABASE_ANON_KEY` | Project Settings → API → anon public key |
   | `ADMIN_EMAIL` | 管理者信箱（用這個信箱登入即自動成為管理者） |
   | `CRON_SECRET` | 任意長隨機字串 |
   | `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | 第 2 步產生的金鑰 |

4. **GitHub → Settings → Pages**：Source 選 **GitHub Actions**。
5. 合併到 `main`（或在 Actions 手動執行「PROJECT 030 deploy」）。工作流程會：推送資料庫 migration → 設定管理者與排程 → 部署推播函式 → 部署網站。
6. 開啟 `…/project030 網址/admin.html`，以 `ADMIN_EMAIL` 登入：
   * 「設定與名單」：設定**生日日期**，把壽星的 email 加入受邀名單。
   * 「關卡內容」：檢查／修改每區的提示文字、答案（`secrets`）、AR 卡片藏匿提示。**repo 是公開的，請至少修改幾個答案**。
   * 「終章尋寶」：設定最後的現實座標、現場密碼與最終訊息（只存在資料庫）。
   * 「AR 卡片」：列印 `print/card-A.png`、`card-B.png`，放到你設定的位置。
   * 「測試模式」：建立測試檔案，模擬不同日期與錯過情境，並以玩家介面實際遊玩。

> 玩家在 iPhone 上請用 Safari 開啟並「加入主畫面」，才能收到推播（iOS 16.4+）。未授權推播時，所有提醒仍會出現在站內「訊息」。

## 本機開發

```bash
# 重新產生種子內容
node project030/tools/build-seed.mjs
# 重新產生 AR 卡片與 targets.mind（需要 Playwright + Chromium）
node project030/tools/make-ar-targets.mjs
# 引擎測試（本機 Postgres 16，socket /tmp，port 54329）
bash project030/supabase/tests/run.sh
```

## 安全性摘要

* 所有遊戲寫入都經由 `SECURITY DEFINER` RPC，並檢查 `auth.uid()` 擁有該檔案；資料表一律開啟 RLS。
* 答案與終章內容玩家端無法讀取；未開放的關卡連標題都不會回傳。
* 上傳檔案放在私有 bucket，路徑以檔案 id 開頭，只有本人與管理者可讀（簽章網址 1 小時有效）。
* `missed_at` 與 `event_log` 由觸發器保護，時間不可逆。
