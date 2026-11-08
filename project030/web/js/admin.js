// PROJECT 030 · 管理後台（所有權限檢查在伺服器端：RLS + assert_admin）
import { sb, rpc, errText, session, passwordLogin, accountToEmail, signOut, signedUrl, removeFile, isConfigured } from './api.js';
import { h } from './steps.js';

const app = document.getElementById('app');
const A = { tab: 'overview', ov: null };
const toast = (m) => { const t = h('div', { class: 'toast fade-in' }, m); document.body.append(t); setTimeout(() => t.remove(), 2800); };
const fmt = (iso) => iso ? new Date(iso).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', hour12: false }) : '—';
const toLocalInput = (d) => { const t = new Date(new Date(d).getTime() + 8 * 3600000); return t.toISOString().slice(0, 16); };
const fromLocalInput = (v) => v ? new Date(v + ':00+08:00').toISOString() : null;
const STATUS_SHORT = { LOCKED: '·', AVAILABLE: '○', IN_PROGRESS: '◐', COMPLETED: '●', MISSED: '×', ALTERNATE: '◇' };

async function boot() {
  if (!isConfigured()) { app.innerHTML = '<div class="card">尚未設定 Supabase（見 README）。</div>'; return; }
  if (!(await session())) return login();
  let b;
  try { b = await rpc('bootstrap'); } catch (e) { app.innerHTML = `<div class="card">${errText(e)}</div>`; return; }
  if (!b.is_admin) {
    app.innerHTML = '';
    app.append(h('div', { class: 'card', style: 'margin-top:15vh' }, h('h1', {}, '權限不足'), h('p', { class: 'dim' }, b.email + ' 不是管理者帳號。'),
      h('button', { class: 'btn', onclick: async () => { await signOut(); location.reload(); } }, '登出')));
    return;
  }
  A.me = b;
  render();
}

function login() {
  app.innerHTML = '';
  const acc = h('input', { type: 'text', placeholder: '帳號', autocomplete: 'username', autocapitalize: 'none', value: localStorage.getItem('p030.account') || '' });
  const pw = h('input', { type: 'password', placeholder: '密碼', autocomplete: 'current-password' });
  const msg = h('div', { class: 'msg' });
  const btn = h('button', { class: 'btn primary block', type: 'submit' }, '登入');
  const go = async (e) => {
    e.preventDefault(); btn.disabled = true; msg.className = 'msg'; msg.textContent = '驗證中…';
    try { await passwordLogin(acc.value, pw.value); localStorage.setItem('p030.account', acc.value.trim()); location.reload(); }
    catch (err) { msg.className = 'msg bad'; msg.textContent = /Invalid login/i.test(err.message || '') ? '帳號或密碼錯誤。' : errText(err); btn.disabled = false; }
  };
  app.append(h('div', { style: 'max-width:420px;margin:12vh auto 0' }, h('div', { class: 'kicker' }, 'PROJECT 030 · CONTROL'), h('h1', {}, '管理者登入'),
    h('form', { class: 'card', onsubmit: go },
      h('label', { class: 'field' }, h('span', {}, '帳號'), acc), h('label', { class: 'field' }, h('span', {}, '密碼'), pw), btn, msg)));
}

const TABS = [['overview', '總覽'], ['settings', '設定與名單'], ['levels', '關卡內容'], ['review', '佐證審核'], ['events', '特殊事件'], ['finale', '終章尋寶'], ['test', '測試模式'], ['print', 'AR 卡片'], ['backup', '備份']];
async function render() {
  app.innerHTML = '';
  app.append(h('div', { class: 'topbar' }, h('span', { class: 'brand' }, 'PROJECT 030 · CONTROL'),
    h('div', { class: 'row' }, h('a', { class: 'btn sm', href: 'index.html' }, '玩家端'), h('button', { class: 'btn sm ghost', onclick: async () => { await signOut(); location.reload(); } }, '登出'))));
  const tabs = h('div', { class: 'admin-tabs' });
  TABS.forEach(([k, l]) => tabs.append(h('button', { class: 'btn sm' + (A.tab === k ? ' primary' : ''), onclick: () => { A.tab = k; render(); } }, l)));
  app.append(tabs);
  const body = h('div', {}, h('div', { class: 'loading' }, '載入中…'));
  app.append(body);
  try { await ({ overview, settings, levels, review, events, finale, test, print, backup })[A.tab](body); }
  catch (e) { body.innerHTML = ''; body.append(h('div', { class: 'card msg bad' }, errText(e))); }
}

// ── 總覽 ──
async function overview(body) {
  const ov = await rpc('admin_overview');
  A.ov = ov;
  body.innerHTML = '';
  const s = ov.settings;
  body.append(h('div', { class: 'grid2' },
    h('div', { class: 'card' }, h('div', { class: 'dim' }, '伺服器時間（Asia/Taipei）'), h('div', { class: 'mono' }, fmt(ov.server_now)), h('div', { class: 'dim' }, `遊戲日：${ov.game_day < 1 ? '尚未開始' : ov.game_day > 11 ? '已結束' : ov.game_day === 11 ? '生日終章' : '第 ' + ov.game_day + ' 天'}`)),
    h('div', { class: 'card' }, h('div', { class: 'dim' }, '生日 / 第一天'), h('div', { class: 'mono' }, `${s.birthday} / ${new Date(new Date(s.birthday) - 10 * 86400000).toISOString().slice(0, 10)}`),
      h('div', { class: 'dim' }, `待審核佐證：${ov.pending_evidence}`))));
  const t = h('table', { class: 't' }, h('tr', {}, ...['檔案', '時間', '關卡 1–11', '準時/錯過', '探索', '樣本', ''].map((x) => h('th', {}, x))));
  for (const p of ov.profiles) {
    const cells = h('div', { class: 'lvl-cells' }, ...(p.levels || []).map((l) => h('span', { class: l.status, title: `D${l.day} ${l.status} ${l.variant || ''}` }, STATUS_SHORT[l.status])));
    t.append(h('tr', {}, h('td', {}, (p.is_test ? '［測試］' : '') + (p.label || ''), h('div', { class: 'faint mono', style: 'font-size:10px' }, p.email || '')),
      h('td', { class: 'mono', style: 'font-size:11px' }, fmt(p.game_now)), h('td', {}, cells),
      h('td', { class: 'mono' }, `${p.stats.ontime} / ${p.stats.missed}`), h('td', { class: 'mono' }, String(p.stats.exploration)),
      h('td', {}, p.sample.form), h('td', {}, h('button', { class: 'btn sm', onclick: () => detail(p) }, '詳細'))));
  }
  body.append(h('div', { class: 'card', style: 'overflow-x:auto' }, t),
    h('p', { class: 'dim', style: 'font-size:12px' }, '圖例：· 未開放　○ 可進入　◐ 進行中　● 已完成　◇ 替代路線　× 已錯過'));
}

async function detail(p) {
  const st = await rpc('admin_profile_state', { p: p.id });
  const m = h('div', { class: 'modal' });
  const sheet = h('div', { class: 'sheet', style: 'max-width:860px' });
  m.append(sheet); m.onclick = (e) => e.target === m && m.remove();
  sheet.append(h('h1', {}, (p.is_test ? '［測試］' : '') + (p.label || '')),
    h('div', { class: 'row wrap' }, h('button', { class: 'btn sm', onclick: async () => { await rpc('admin_grant_portrait', { p: p.id }); toast('已轉交形象照邀請函'); } }, '轉交形象照邀請函（備援）')),
    h('h2', {}, '旗標'), h('pre', { class: 'clue mono', style: 'font-size:12px' }, JSON.stringify(st.flags, null, 2)),
    h('h2', {}, '樣本'), h('pre', { class: 'clue mono', style: 'font-size:12px' }, JSON.stringify({ form: st.sample.form, params: st.sample.params, total: st.sample.total, streak: st.sample.streak, breaks: st.sample.breaks }, null, 2)),
    h('h2', {}, '終章'), h('pre', { class: 'clue mono', style: 'font-size:12px' }, JSON.stringify({ finale: st.finale_progress, portrait: st.portrait }, null, 2)),
    h('h2', {}, '永久事件紀錄'), h('div', { style: 'max-height:300px;overflow:auto;font-size:12px' }, ...st.events_full.map((e) => h('div', { class: 'mono' }, `${fmt(e.at)}  ${e.type}  D${e.day ?? '-'}  ${JSON.stringify(e.payload)}`))),
    h('h2', {}, '通知'), h('div', { style: 'max-height:240px;overflow:auto;font-size:12px' }, ...st.notifications.map((n) => h('div', { class: 'mono' }, `${fmt(n.created_at)}  ${n.type}  [${n.push_status}]  ${n.title}`))));
  document.body.append(m);
}

// ── 設定 ──
async function settings(body) {
  const { data: s, error } = await sb.from('settings').select('*').eq('id', 1).single();
  if (error) throw error;
  const { data: players } = await sb.from('allowed_players').select('*').order('created_at');
  body.innerHTML = '';
  const bd = h('input', { type: 'date', value: s.birthday });
  const pr = h('input', { type: 'time', value: s.pending_reminder.slice(0, 5) });
  const ex = h('input', { type: 'time', value: s.expiring_reminder.slice(0, 5) });
  const cap = h('input', { type: 'text', value: String(s.daily_reminder_cap) });
  body.append(h('div', { class: 'two' },
    h('div', { class: 'card' }, h('h2', {}, '時間設定（Asia/Taipei）'),
      h('label', { class: 'field' }, h('span', {}, '生日日期（遊戲於前 10 天的 00:00 開始）'), bd),
      h('label', { class: 'field' }, h('span', {}, '未完成提醒時間'), pr),
      h('label', { class: 'field' }, h('span', {}, '即將截止提醒時間'), ex),
      h('label', { class: 'field' }, h('span', {}, '每日一般提醒上限'), cap),
      h('p', { class: 'dim', style: 'font-size:12px' }, '注意：遊戲開始後修改生日，會讓已開放的區域重新計算期限；已經錯過的紀錄不會被恢復。'),
      h('button', { class: 'btn primary', onclick: async () => {
        const { error: e } = await sb.from('settings').update({ birthday: bd.value, pending_reminder: pr.value, expiring_reminder: ex.value, daily_reminder_cap: Number(cap.value) || 2, updated_at: new Date().toISOString() }).eq('id', 1);
        toast(e ? errText(e) : '已儲存');
      } }, '儲存')),
    playersCard(players || [])));
}
function playersCard(players) {
  const em = h('input', { type: 'email', placeholder: '壽星的帳號（名稱或 email）' });
  const note = h('input', { type: 'text', placeholder: '備註' });
  const list = h('div');
  players.forEach((p) => list.append(h('div', { class: 'row', style: 'border-bottom:1px solid var(--line);padding:6px 0' }, h('span', {}, p.email), h('span', { class: 'dim' }, p.note || ''), h('span', { class: 'spacer' }),
    h('button', { class: 'btn sm warn', onclick: async () => { if (!confirm('移除後此信箱將無法再登入（已建立的進度保留）。')) return; await sb.from('allowed_players').delete().eq('email', p.email); render(); } }, '移除'))));
  return h('div', { class: 'card' }, h('h2', {}, '受邀玩家（只有名單內的信箱能登入）'), list, h('div', { style: 'height:8px' }), em, h('div', { style: 'height:6px' }), note,
    h('div', { style: 'height:6px' }), h('button', { class: 'btn', onclick: async () => {
      const { error } = await sb.from('allowed_players').insert({ email: accountToEmail(em.value), note: note.value });
      if (error) toast(errText(error)); else render();
    } }, '加入名單'));
}

// ── 關卡內容 ──
async function levels(body) {
  const { data, error } = await sb.from('levels').select('*').order('day');
  if (error) throw error;
  body.innerHTML = '';
  const sel = h('select', {});
  data.forEach((l) => sel.append(h('option', { value: l.day }, `第 ${l.day} 區・${l.title}`)));
  const box = h('div');
  const show = () => {
    const l = data.find((x) => x.day === Number(sel.value));
    box.innerHTML = '';
    const title = h('input', { type: 'text', value: l.title });
    const sub = h('input', { type: 'text', value: l.subtitle || '' });
    const oa = h('input', { type: 'datetime-local', value: l.open_at ? toLocalInput(l.open_at) : '' });
    const ca = h('input', { type: 'datetime-local', value: l.close_at ? toLocalInput(l.close_at) : '' });
    const jsonFields = ['config', 'alternate', 'secrets', 'on_complete', 'on_alternate_complete', 'on_missed'];
    const eds = {};
    jsonFields.forEach((f) => { eds[f] = h('textarea', { class: 'code-edit' }, JSON.stringify(l[f], null, 2)); });
    const arSteps = [...(l.config?.steps || []), ...(l.alternate?.steps || [])].filter((s) => s.type === 'ar');
    box.append(h('div', { class: 'card' },
      h('div', { class: 'grid2' }, h('label', { class: 'field' }, h('span', {}, '標題'), title), h('label', { class: 'field' }, h('span', {}, '副標'), sub),
        h('label', { class: 'field' }, h('span', {}, '自訂開放時間（留空＝當日 00:00）'), oa), h('label', { class: 'field' }, h('span', {}, '自訂截止時間（不含；留空＝次日 00:00）'), ca))),
      arSteps.length ? h('div', { class: 'card' }, h('h2', {}, 'AR 備用驗證'), ...arSteps.map((s) => h('label', { class: 'row' },
        h('input', { type: 'checkbox', checked: l.ar_fallback?.[s.id] ? 'checked' : null, onchange: async (e) => { await rpc('admin_set_ar_fallback', { d: l.day, step_id: s.id, enabled: e.target.checked }); toast('已更新'); } }),
        h('span', {}, `${s.id}（卡片 ${s.card}）・備用碼：${l.secrets?.[s.id]?.fallback || '未設定'}`)))) : null,
      h('p', { class: 'dim', style: 'font-size:12px' }, 'config / alternate 是玩家可見的內容（場景、步驟、變體條件）；secrets 是答案、提示與揭露內容（玩家永遠讀不到）；on_* 是完成 / 替代完成 / 錯過時套用的效果（symbol、items、flags、remove_items、gift）。'),
      h('div', { class: 'two' }, ...jsonFields.map((f) => h('label', { class: 'field' }, h('span', { class: 'mono' }, f), eds[f]))),
      h('button', { class: 'btn primary', onclick: async () => {
        const patch = { title: title.value, subtitle: sub.value, open_at: fromLocalInput(oa.value), close_at: fromLocalInput(ca.value), updated_at: new Date().toISOString() };
        try { jsonFields.forEach((f) => { patch[f] = JSON.parse(eds[f].value); }); } catch (e) { toast('JSON 格式錯誤：' + e.message); return; }
        const { error: err } = await sb.from('levels').update(patch).eq('day', l.day);
        if (err) toast(errText(err)); else { Object.assign(l, patch); toast('已儲存。已開始的玩家會沿用已判定的變體。'); }
      } }, '儲存此關卡'));
  };
  sel.onchange = show;
  body.append(h('div', { class: 'card' }, sel), box);
  show();
}

// ── 佐證審核 ──
async function review(body) {
  const filter = A.reviewFilter || 'PENDING_REVIEW';
  const list = await rpc('admin_list_evidence', { filter_status: filter === 'ALL' ? null : filter });
  body.innerHTML = '';
  const sel = h('select', { onchange: (e) => { A.reviewFilter = e.target.value; render(); } });
  ['PENDING_REVIEW', 'NEEDS_MORE', 'APPROVED', 'OVERDUE', 'REPLACED', 'ALL'].forEach((s) => sel.append(h('option', { value: s, selected: s === filter ? 'selected' : null }, s)));
  body.append(h('div', { class: 'card' }, sel));
  if (!list.length) body.append(h('p', { class: 'dim' }, '沒有資料。'));
  for (const e of list) {
    const note = h('input', { type: 'text', placeholder: '給玩家的說明（以遊戲口吻）', value: e.review_note || '' });
    const media = h('div');
    if (e.kind === 'text') media.append(h('div', { class: 'clue' }, e.text_content));
    if (e.kind === 'photo') { const img = h('img', { style: 'max-width:100%;max-height:420px;border-radius:8px' }); signedUrl(e.storage_path).then((u) => u && (img.src = u)); media.append(img); }
    if (e.kind === 'audio') { const a = h('audio', { controls: true, style: 'width:100%' }); signedUrl(e.storage_path).then((u) => u && (a.src = u)); media.append(a); }
    body.append(h('div', { class: 'card' },
      h('div', { class: 'row wrap' }, h('b', {}, `${e.is_test ? '［測試］' : ''}${e.profile_label}・第 ${e.day} 區 ${e.level_title}・${e.step_id}`), h('span', { class: 'spacer' }),
        h('span', { class: `status-pill s-${e.status}` }, e.status), h('span', { class: 'mono dim', style: 'font-size:11px' }, fmt(e.submitted_at) + (e.on_time ? '' : '（替代路線）'))),
      media, h('div', { style: 'height:6px' }), note,
      h('div', { class: 'row wrap', style: 'margin-top:8px' },
        h('button', { class: 'btn primary sm', onclick: async () => { await rpc('admin_review_evidence', { eid: e.id, new_status: 'APPROVED', note: note.value }); toast('已通過'); render(); } }, '驗證通過'),
        h('button', { class: 'btn sm warn', onclick: async () => { await rpc('admin_review_evidence', { eid: e.id, new_status: 'NEEDS_MORE', note: note.value }); toast('已要求補充'); render(); } }, '需要補充'),
        h('span', { class: 'spacer' }),
        h('button', { class: 'btn sm ghost', onclick: async () => {
          if (!confirm('永久刪除這份佐證與檔案？（事件紀錄會保留刪除記錄）')) return;
          const path = await rpc('admin_delete_evidence', { eid: e.id });
          if (path) await removeFile('evidence', path).catch((x) => toast('檔案刪除失敗：' + errText(x)));
          render();
        } }, '刪除'))));
  }
}

// ── 特殊事件 ──
async function events(body) {
  const ov = A.ov || (await rpc('admin_overview'));
  body.innerHTML = '';
  const target = h('select', {}, h('option', { value: '' }, '所有正式玩家'), ...ov.profiles.map((p) => h('option', { value: p.id }, (p.is_test ? '［測試］' : '') + p.label)));
  const title = h('input', { type: 'text', placeholder: '標題（遊戲口吻）' });
  const bodyT = h('textarea', { placeholder: '內容' });
  const eff = h('textarea', { class: 'code-edit', style: 'min-height:140px' }, JSON.stringify({ flags: {}, items: [] }, null, 2));
  body.append(h('div', { class: 'card' }, h('h2', {}, '觸發特殊劇情'),
    h('label', { class: 'field' }, h('span', {}, '對象'), target), h('label', { class: 'field' }, h('span', {}, '標題'), title), h('label', { class: 'field' }, h('span', {}, '內容'), bodyT),
    h('label', { class: 'field' }, h('span', {}, '效果（旗標可用於任何關卡的 when 條件，例如 {"flag":"my_event"}）'), eff),
    h('button', { class: 'btn primary', onclick: async () => {
      let effects; try { effects = JSON.parse(eff.value); } catch (e) { toast('JSON 錯誤'); return; }
      try { const n = await rpc('admin_trigger_event', { target: target.value || null, title: title.value, body: bodyT.value, effects }); toast(`已送達 ${n} 份檔案`); }
      catch (e) { toast(errText(e)); }
    } }, '觸發')));
}

// ── 終章尋寶 ──
async function finale(body) {
  const { data, error } = await sb.from('finale_config').select('*').eq('id', 1).single();
  if (error) throw error;
  body.innerHTML = '';
  const steps = [...(data.hunt || [])];
  const list = h('div');
  const draw = () => {
    list.innerHTML = '';
    steps.forEach((s, i) => {
      const f = (k, ph, ta) => { const el = h(ta ? 'textarea' : 'input', { type: 'text', placeholder: ph, value: ta ? null : s[k] || '' }); if (ta) el.value = s[k] || ''; el.oninput = () => (s[k] = el.value); return el; };
      list.append(h('div', { class: 'card' }, h('div', { class: 'row' }, h('b', {}, `座標 ${i + 1}`), h('span', { class: 'spacer' }), h('button', { class: 'btn sm ghost', onclick: () => { steps.splice(i, 1); draw(); } }, '刪除')),
        h('label', { class: 'field' }, h('span', {}, '標題'), f('title', '')), h('label', { class: 'field' }, h('span', {}, '提示（玩家可見）'), f('clue', '', true)),
        h('label', { class: 'field' }, h('span', {}, '位置補充（可留空）'), f('location_hint', '')),
        h('label', { class: 'field' }, h('span', {}, '現場密碼（留空＝玩家按「我已抵達」即可）'), f('code', ''))));
    });
  };
  draw();
  const ft = h('input', { type: 'text', value: data.final_title || '' });
  const fb = h('textarea', {}); fb.value = data.final_body || '';
  body.append(h('p', { class: 'dim' }, '這些內容只存在資料庫，只有在生日當天、玩家完成「定義」之後才會逐段送到玩家端。'), list,
    h('button', { class: 'btn', onclick: () => { steps.push({ title: '', clue: '', location_hint: '', code: '' }); draw(); } }, '新增座標'),
    h('div', { class: 'card' }, h('label', { class: 'field' }, h('span', {}, '最後畫面標題'), ft), h('label', { class: 'field' }, h('span', {}, '最後畫面內容'), fb)),
    h('button', { class: 'btn primary', onclick: async () => {
      const { error: e } = await sb.from('finale_config').update({ hunt: steps, final_title: ft.value, final_body: fb.value, updated_at: new Date().toISOString() }).eq('id', 1);
      toast(e ? errText(e) : '已儲存');
    } }, '儲存終章'));
}

// ── 測試模式 ──
async function test(body) {
  const ov = await rpc('admin_overview');
  const tests = ov.profiles.filter((p) => p.is_test);
  body.innerHTML = '';
  body.append(h('p', { class: 'dim' }, '測試檔案屬於你的管理者帳號，使用獨立的模擬時間，只產生站內訊息、不推播，也不會讀寫正式玩家的任何資料（伺服器端強制）。'));
  const label = h('input', { type: 'text', placeholder: '名稱，例如：全部準時' });
  const at = h('input', { type: 'datetime-local', value: toLocalInput(new Date(ov.settings.birthday + 'T10:00:00+08:00').getTime() - 10 * 86400000) });
  body.append(h('div', { class: 'card' }, h('h2', {}, '建立測試檔案'), h('div', { class: 'grid2' }, label, at),
    h('div', { style: 'height:8px' }), h('button', { class: 'btn primary', onclick: async () => { await rpc('admin_create_test_profile', { label: label.value, sim_at: fromLocalInput(at.value) }); toast('已建立'); render(); } }, '建立')));
  for (const p of tests) {
    const t = h('input', { type: 'datetime-local', value: toLocalInput(p.game_now) });
    const day = h('select', {}, ...Array.from({ length: 11 }, (_, i) => h('option', { value: i + 1 }, `第 ${i + 1} 區`)));
    const act = h('select', {}, h('option', { value: 'complete' }, '準時完成'), h('option', { value: 'complete_alt' }, '錯過後以替代路線完成'), h('option', { value: 'miss' }, '標記錯過'), h('option', { value: 'open' }, '強制開放'));
    const obs = h('select', {}, h('option', { value: '' }, '刪除觀測'), ...['explore', 'preserve', 'adjust', 'rest'].map((a) => h('option', { value: a, selected: a === 'explore' ? 'selected' : null }, a)));
    const run = async (fn) => { try { await fn(); toast('完成'); render(); } catch (e) { toast(errText(e)); } };
    body.append(h('div', { class: 'card' },
      h('div', { class: 'row wrap' }, h('b', {}, p.label), h('span', { class: 'mono dim', style: 'font-size:12px' }, `模擬時間 ${fmt(p.game_now)}・第 ${p.game_day} 天`), h('span', { class: 'spacer' }),
        h('a', { class: 'btn sm primary', href: `index.html?profile=${p.id}`, target: '_blank' }, '以此檔案遊玩')),
      h('div', { class: 'lvl-cells', style: 'margin:8px 0' }, ...(p.levels || []).map((l) => h('span', { class: l.status, title: `${l.status} ${l.variant || ''}` }, STATUS_SHORT[l.status]))),
      h('div', { class: 'row wrap' }, t, h('button', { class: 'btn sm', onclick: () => run(() => rpc('admin_set_test_time', { p: p.id, sim_at: fromLocalInput(t.value) })) }, '設定模擬時間'),
        h('button', { class: 'btn sm', onclick: () => run(() => rpc('admin_set_test_time', { p: p.id, sim_at: new Date(new Date(p.game_now).getTime() + 86400000).toISOString() })) }, '+1 天'),
        h('button', { class: 'btn sm', onclick: () => run(async () => { const r = await rpc('admin_test_tick', { p: p.id }); toast(`產生 ${r.created} 則提醒`); }) }, '模擬排程')),
      h('div', { class: 'row wrap', style: 'margin-top:6px' }, day, act, h('button', { class: 'btn sm', onclick: () => run(() => rpc('admin_test_force', { p: p.id, d: Number(day.value), action: act.value })) }, '套用'),
        obs, h('button', { class: 'btn sm', onclick: () => run(() => rpc('admin_test_observe', { p: p.id, d: Number(day.value), action: obs.value || null })) }, '設定該日觀測')),
      h('div', { class: 'row wrap', style: 'margin-top:6px' },
        h('button', { class: 'btn sm', onclick: () => detail(p) }, '詳細'),
        h('button', { class: 'btn sm warn', onclick: () => confirm('重置此測試檔案的所有進度？') && run(() => rpc('admin_test_reset', { p: p.id })) }, '重置'),
        h('button', { class: 'btn sm warn', onclick: () => confirm('刪除此測試檔案？') && run(() => rpc('admin_delete_test_profile', { p: p.id })) }, '刪除'))));
  }
}

// ── 列印 AR 卡片 ──
async function print(body) {
  body.innerHTML = '';
  body.append(h('div', { class: 'card' }, h('p', {}, 'AR 卡片圖檔位於 repo 的 project030/print/（不會部署到公開網站）。請以 A6 或更大尺寸、霧面紙列印，避免反光。'),
    h('ul', {}, h('li', {}, '卡片 A：第 3 區「保險箱」（目標索引 0）'), h('li', {}, '卡片 B：第 7 區「門」（目標索引 1）')),
    h('p', { class: 'dim' }, '若玩家相機無法使用，請到「關卡內容」啟用該步驟的備用驗證，並把備用碼告訴玩家（或寫在卡片背面）。')));
}

// ── 備份 ──
async function backup(body) {
  body.innerHTML = '';
  body.append(h('div', { class: 'card' }, h('p', {}, '匯出所有內容與玩家資料（JSON）。檔案（照片、錄音）存放在 Supabase Storage，可在 Supabase 後台下載整個 bucket。'),
    h('button', { class: 'btn primary', onclick: async () => {
      const data = await rpc('admin_export');
      const a = h('a', { href: URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })), download: `p030-backup-${new Date().toISOString().slice(0, 10)}.json` });
      document.body.append(a); a.click(); a.remove();
    } }, '下載備份')));
}

boot();
