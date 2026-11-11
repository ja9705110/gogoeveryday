// 與伺服器溝通的唯一入口：所有遊戲判定都在資料庫端完成
import { CONFIG } from './config.js';

const configured = !CONFIG.SUPABASE_URL.startsWith('__');
export const sb = configured
  ? window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;
export const isConfigured = () => configured;

const ERRORS = {
  P030_EVO_LOCKED: '培養皿目前沒有反應。',
  P030_EVO_NOT_READY: '分化訊號尚未穩定，稍後再回來。',
  P030_EVO_DONE: '第二階段進化已經完成。',
  P030_EVO_BAD_PICK: '這個選項已經不在畫面上了，請重新整理。',
  P030_EVO_BAD_PHASE: '進化程序狀態已更新，請重新整理。',
  P030_EVO_NOT_STARTED: '進化程序尚未啟動。',
  P030_FORBIDDEN: '你沒有存取這份檔案的權限。',
  P030_ADMIN_ONLY: '需要管理者權限。',
  P030_LOCKED: '這個區域尚未開放。',
  P030_NOT_PLAYABLE: '這個區域已經關閉。',
  P030_NO_TICKET: '沒有可以使用的幸福券。',
  P030_TICKET_EXPIRED: '這張幸福券已經過期了。',
  P030_ALREADY_DONE: '這一區已經完成了。',
  P030_ALREADY_COMPLETED: '這個區域已經歸檔。',
  P030_STEP_ORDER: '請先完成前面的步驟。',
  P030_ALREADY_OBSERVED: '今天已經觀測過了。明天再來。',
  P030_OUTSIDE_GAME: '觀測期間尚未開始。',
  P030_FALLBACK_DISABLED: '備用驗證尚未啟用。',
  P030_ALREADY_SUBMITTED: '已經提交過了。',
  P030_BAD_PATH: '檔案路徑錯誤。',
  P030_EMPTY_TEXT: '請輸入內容。',
  P030_FINALE_LOCKED: '檔案室尚未開啟。',
  P030_DEFINE_FIRST: '請先完成最後一個欄位。',
  P030_HUNT_ORDER: '順序不對。',
  P030_GIFT_LOCKED: '邀請函尚未送達。',
  P030_NOT_SIGNED_IN: '請先登入。',
  P030_NOT_A_TEST_PROFILE: '只能操作測試檔案。',
};
export function errText(e) {
  const m = (e && (e.message || e.msg || String(e))) || '未知錯誤';
  const code = (m.match(/P030_[A-Z_]+/) || [])[0];
  if (code && ERRORS[code]) return ERRORS[code];
  if (/Failed to fetch|NetworkError|Load failed/i.test(m)) return '連線中斷。請檢查網路後再試一次。';
  if (/JWT|session|refresh token/i.test(m)) return '登入已過期，請重新登入。';
  return m.replace(/^.*?P030_/, '');
}

export async function rpc(name, args = {}) {
  if (!sb) throw new Error('尚未設定 Supabase');
  const { data, error } = await sb.rpc(name, args);
  if (error) throw error;
  return data;
}

// ── 身分 ──
export async function session() {
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  return data.session;
}
export async function sendCode(email) {
  const { error } = await sb.auth.signInWithOtp({
    email, options: { shouldCreateUser: true, emailRedirectTo: location.origin + location.pathname },
  });
  if (error) throw error;
}
export async function verifyCode(email, token) {
  const { data, error } = await sb.auth.verifyOtp({ email, token: token.trim(), type: 'email' });
  if (error) throw error;
  return data.session;
}
// 帳號可以是 email，或不含 @ 的簡單名稱（對應 <名稱>@p030.game）
export const accountToEmail = (acc) => {
  const a = String(acc || '').trim().toLowerCase();
  return a.includes('@') ? a : `${a}@p030.game`;
};
export async function passwordLogin(account, password) {
  if (!String(account || '').trim() || !password) throw new Error('請輸入帳號與密碼。');
  const { data, error } = await sb.auth.signInWithPassword({ email: accountToEmail(account), password });
  if (error) throw error;
  return data.session;
}
// 玩家只輸入生日（月日）登入：對應固定的觀測者帳號，密碼由生日組成（帳號由管理者以 SQL 建立）
export const PLAYER_ACCOUNT = 'observer@p030.game';
export function birthdayToPassword(input) {
  const d = String(input || '').replace(/\D/g, '');
  const mmdd = d.length >= 8 ? d.slice(-4) : d.length === 3 ? '0' + d : d;
  if (mmdd.length !== 4) throw new Error('請輸入生日的月與日，例如 1118。');
  return 'p030-' + mmdd;
}
export async function birthdayLogin(input) {
  const { data, error } = await sb.auth.signInWithPassword({ email: PLAYER_ACCOUNT, password: birthdayToPassword(input) });
  if (error) throw error;
  return data.session;
}
export async function signOut() { await sb.auth.signOut(); }

// ── 檔案 ──
export async function upload(bucket, path, blob, contentType) {
  const { error } = await sb.storage.from(bucket).upload(path, blob, { contentType, upsert: false });
  if (error) throw error;
  return path;
}
const urlCache = new Map();
export async function signedUrl(path, bucket = 'evidence') {
  if (!path) return null;
  const k = bucket + ':' + path;
  const hit = urlCache.get(k);
  if (hit && hit.exp > Date.now()) return hit.url;
  const { data, error } = await sb.storage.from(bucket).createSignedUrl(path, 3600);
  if (error) return null;
  urlCache.set(k, { url: data.signedUrl, exp: Date.now() + 3000_000 });
  return data.signedUrl;
}
export async function removeFile(bucket, path) {
  const { error } = await sb.storage.from(bucket).remove([path]);
  if (error) throw error;
}
export const vapidKey = () => (CONFIG.VAPID_PUBLIC_KEY.startsWith('__') ? null : CONFIG.VAPID_PUBLIC_KEY);
