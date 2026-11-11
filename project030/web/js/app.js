// PROJECT 030 · 玩家端
import { sb, rpc, errText, session, passwordLogin, birthdayLogin, signOut, upload, signedUrl, isConfigured, vapidKey } from './api.js';
import { renderScene } from './scene.js';
import { mountSample, ACTION_LABEL, ACTION_DESC, PARAM_LABEL } from './sample.js';
import { renderWidget, renderClue, renderRevealed, h } from './steps.js';
import { glyphSVG, NAMES } from './glyphs.js';
import { startAR } from './ar.js';
import { playPrologue } from './prologue.js';
import { sound, sfx, ambience, needsUnlock } from './audio.js';
import { mountBackground } from './bg.js';
import { mountPlanet, morphToPhoto, layerStates, LAYERS } from './planet.js';
import { playCeremony, ceremonyKey, stageClear } from './ceremony.js';
import { PORTRAIT_MAP, portraitFromChoices } from './portrait-map.js';
import { mosaicWidget } from './mosaic.js';
import { photosetWidget } from './photoset.js';
import { avatarSVG, choicesFromStats, AVATAR_STEPS } from './avatar.js';
import { playOmen, playEvolution, EVO_GLYPH } from './evo.js';

// 資料庫中舊稱呼的統一
const T = (str) => String(str ?? '').replace(/觀測者|觀測員|觀察者/g, '觀察員').replace(/觀測/g, '觀察');

const app = document.getElementById('app');
const S = { boot: null, pid: null, state: null, skew: 0, cleanup: [] };
const STATUS = { LOCKED: '未開放', AVAILABLE: '可進入', IN_PROGRESS: '進行中', COMPLETED: '已歸檔', MISSED: '已錯過', ALTERNATE: '替代路線' };
const EVENT_TEXT = {
  STARTED: '進入區域', COMPLETED: '區域歸檔', MISSED: '區域關閉（錯過）', OBSERVE: '觀察樣本', EVIDENCE: '提交紀錄', CHOICE: '做出選擇',
  SCAN: '掃描投影卡', EXPLORE: '調查', HINT: '請求提示', ITEM_LOST: '失去物品', SPECIAL_EVENT: '特殊事件', REVIEW: '紀錄比對',
  ROUTE: '路線判定', DEFINED: '填寫定義', HUNT: '現實座標', PORTRAIT_SAVED: '影像設定',
};

// ── 小工具 ──
export function toast(msg, ms = 2600) {
  const t = h('div', { class: 'toast fade-in' }, msg);
  document.body.append(t); setTimeout(() => t.remove(), ms);
}
function modal(content, { onClose } = {}) {
  const m = h('div', { class: 'modal' }, h('div', { class: 'sheet' }, content));
  m.onclick = (e) => { if (e.target === m) { m.remove(); onClose && onClose(); } };
  document.body.append(m);
  return () => { m.remove(); onClose && onClose(); };
}
const fmtTime = (iso, opt = {}) => iso ? new Date(iso).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, ...opt }) : '';
const serverNow = () => new Date(Date.now() + S.skew);
async function typeLines(container, lines, speed = 22) {
  for (const line of lines || []) {
    const p = h('p', { class: 'typing' }); container.append(p);
    for (const ch of line) { p.textContent += ch; await new Promise((r) => setTimeout(r, speed)); }
    p.classList.remove('typing');
  }
}
function cleanup() { S.cleanup.forEach((f) => { try { f(); } catch (_) {} }); S.cleanup = []; }

// ── 啟動 ──
document.addEventListener('click', (e) => { if (e.target.closest('.btn, .keypad button, .sw, .pick, .chip, .tile, .dial button, .choice button, .tabbar a, .zone, .hs')) sfx('tap'); }, true);

async function boot() {
  if (!isConfigured()) {
    app.innerHTML = '<div class="card" style="margin-top:40px"><div class="kicker">PROJECT 030</div><h1>系統尚未設定</h1><p class="dim">管理者需要在部署設定中填入 Supabase 專案資訊（請見 project030/README.md）。</p></div>';
    return;
  }
  mountBackground();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  sb.auth.onAuthStateChange((ev) => { if (ev === 'SIGNED_OUT') location.hash = '#/'; });
  const sess = await session();
  if (!sess) return renderLogin();
  try {
    S.boot = await rpc('bootstrap');
  } catch (e) { return renderError(e); }
  if (!S.boot.allowed) return renderNotInvited();
  const wanted = new URLSearchParams(location.search).get('profile') || localStorage.getItem('p030.profile');
  const prof = S.boot.profiles.find((p) => p.id === wanted) || S.boot.profiles.find((p) => !p.is_test) || S.boot.profiles[0];
  if (!prof) {
    app.innerHTML = '<div class="card" style="margin-top:40px"><h1>沒有可用的檔案</h1><p class="dim">管理者帳號請到管理後台建立測試檔案。</p><a class="btn" href="admin.html">前往管理後台</a></div>';
    return;
  }
  S.pid = prof.id;
  localStorage.setItem('p030.profile', S.pid);
  const jump = Number(new URLSearchParams(location.search).get('jump'));
  if (jump && prof.is_test) { // 從管理後台「選區測試」開啟
    try { await testJump(jump); } catch (e) { toast(errText(e)); }
    history.replaceState(null, '', location.pathname + (jump === 11 ? '#/finale' : '#/zone/' + jump));
  }
  window.addEventListener('hashchange', route);
  route().then(() => {
    const k = 'p030.prologue.v3.' + S.pid;
    if (localStorage.getItem(k) && needsUnlock()) toast('輕觸畫面任一處，開始播放情境音效', 3500);
    if (!localStorage.getItem(k) && S.state) {
      playPrologue({ startDate: S.state.start_date, observerNo: S.state.observer_no, onDone: () => { localStorage.setItem(k, '1'); if (!location.hash || location.hash === '#/') route(); } });
    }
  });
}

function renderLogin() {
  app.innerHTML = '';
  const bd = h('input', { type: 'text', inputmode: 'numeric', placeholder: 'MMDD', maxlength: 10, autocomplete: 'off',
    style: 'font-size:30px;text-align:center;letter-spacing:.4em;font-family:var(--hud)' });
  const msg = h('div', { class: 'msg' });
  const btn = h('button', { class: 'btn primary block', type: 'submit' }, '接入');
  const go = async (e) => {
    e.preventDefault(); btn.disabled = true; msg.className = 'msg'; msg.textContent = '比對中…';
    try { await birthdayLogin(bd.value); location.reload(); }
    catch (err) { msg.className = 'msg bad'; msg.textContent = /Invalid login/i.test(err.message || '') ? '編號不符。這片海不認得這個頻率。' : errText(err); btn.disabled = false; }
  };
  // 管理者／其他帳號
  const acc = h('input', { type: 'text', placeholder: '帳號', autocapitalize: 'none', autocomplete: 'username' });
  const pw = h('input', { type: 'password', placeholder: '密碼', autocomplete: 'current-password' });
  const msg2 = h('div', { class: 'msg' });
  const other = h('form', { class: 'card hidden', onsubmit: async (e) => {
    e.preventDefault(); msg2.textContent = '驗證中…';
    try { await passwordLogin(acc.value, pw.value); location.reload(); }
    catch (err) { msg2.className = 'msg bad'; msg2.textContent = /Invalid login/i.test(err.message || '') ? '帳號或密碼錯誤。' : errText(err); }
  } }, acc, h('div', { style: 'height:8px' }), pw, h('div', { style: 'height:8px' }), h('button', { class: 'btn block', type: 'submit' }, '登入'), msg2);
  app.append(h('div', { style: 'margin-top:12vh' },
    h('div', { class: 'kicker' }, 'PROJECT 030'),
    h('h1', {}, '觀察員驗證'),
    h('p', { class: 'dim' }, '星海檔案館正在等待一位觀察員。請輸入你的觀察員編號。'),
    h('p', { class: 'faint', style: 'font-size:12px' }, '提示：編號就是你的生日（月日，四位數）。'),
    h('form', { class: 'card glow', onsubmit: go }, bd, h('div', { style: 'height:10px' }), btn, msg),
    h('div', { style: 'text-align:center;margin-top:24px' }, h('button', { class: 'btn ghost sm', onclick: () => other.classList.toggle('hidden') }, '管理者登入')),
    other));
}
function renderNotInvited() {
  app.innerHTML = '';
  app.append(h('div', { class: 'card', style: 'margin-top:20vh' }, h('div', { class: 'kicker' }, 'ACCESS DENIED'),
    h('h1', {}, '這個帳號不在觀察名單上'), h('p', { class: 'dim' }, S.boot.email),
    h('button', { class: 'btn', onclick: async () => { await signOut(); location.reload(); } }, '換一個帳號')));
}
function renderError(e) {
  app.innerHTML = '';
  app.append(h('div', { class: 'card', style: 'margin-top:20vh' }, h('div', { class: 'kicker' }, 'SIGNAL LOST'), h('p', {}, errText(e)),
    h('button', { class: 'btn', onclick: () => location.reload() }, '重新連線')));
}

// ── 外框 ──
const ICONS = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
  lab: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M7 21h10M8 21V9a4 4 0 0 1 8 0v12"/><circle cx="12" cy="13" r="2"/></svg>',
  items: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3l8 8-8 8-8-8z"/></svg>',
  log: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5"/></svg>',
  inbox: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 6h16v12H4z"/><path d="M4 7l8 6 8-6"/></svg>',
};
function soundToggle() {
  const b = h('button', { class: 'snd', 'aria-label': '聲音開關' });
  const paint = () => { b.innerHTML = sound.on ? '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 8a5 5 0 0 1 0 8M19 5a9 9 0 0 1 0 14"/></svg>' : '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>'; b.classList.toggle('on', sound.on); };
  if (sound.pref === null) b.classList.add('ask');
  b.onclick = (e) => { e.stopPropagation(); b.classList.remove('ask'); sound.toggle(); if (sound.on) ambience(S.amb || 'base', true); toast(sound.on ? '情境音效：開啟' : '情境音效：關閉', 1400); paint(); };
  paint();
  return b;
}

function shell(active, content) {
  cleanup();
  if (S.inPlace) { content.classList.remove('fade-in'); content.querySelectorAll('.fade-in').forEach((x) => x.classList.remove('fade-in')); }
  const keepY = S.inPlace ? scrollY : 0;
  app.innerHTML = '';
  const st = S.state;
  const clock = h('div', { class: 'clock' });
  const tick = () => {
    const now = serverNow();
    const bday = st ? new Date(st.birthday + 'T00:00:00+08:00') : null;
    const left = bday ? Math.ceil((bday - now) / 86400000) : null;
    clock.innerHTML = `${now.toLocaleTimeString('zh-TW', { timeZone: 'Asia/Taipei', hour12: false })}<br>${left > 0 ? 'T-' + left : 'FILE 030'}`;
  };
  tick(); const iv = setInterval(tick, 1000); S.cleanup.push(() => clearInterval(iv));
  app.append(h('div', { class: 'topbar' }, h('a', { class: 'brand', href: '#/', style: 'text-decoration:none' }, 'PROJECT 030'),
    h('div', { class: 'row' }, clock, soundToggle(), h('a', { href: '#/settings', 'aria-label': '設定', style: 'color:var(--dim);margin-left:10px', html: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/></svg>' }))));
  if (st?.is_test) app.append(h('a', { class: 'banner', href: '#/', style: 'display:block;text-decoration:none' }, `測試模式・模擬時間 ${fmtTime(st.server_now, { year: 'numeric' })}・不影響正式玩家・回終端選區 ›`));
  app.append(content);
  const tabs = h('nav', { class: 'tabbar' });
  [['home', '#/', '終端'], ['lab', '#/lab', '培養艙'], ['items', '#/items', '物品'], ['log', '#/log', '紀錄'], ['inbox', '#/inbox', '訊息']].forEach(([k, href, label]) => {
    const a = h('a', { href, class: active === k ? 'on' : '', html: ICONS[k] + label });
    if (k === 'inbox' && st?.unread) a.append(h('span', { class: 'badge' }, String(st.unread)));
    tabs.append(a);
  });
  app.append(tabs);
  if (S.inPlace) scrollTo(0, keepY);
}

async function loadState() {
  const t0 = Date.now();
  S.state = await rpc('get_state', { p: S.pid });
  S.skew = new Date(S.state.server_now).getTime() - (t0 + Date.now()) / 2;
  return S.state;
}

async function route() {
  const hash = location.hash.replace(/^#/, '') || '/';
  // 同一頁原地更新：不清空畫面、不顯示「連線中」，避免閃爍與跳回頂端
  S.inPlace = S.renderedHash === hash && !!app.querySelector('.topbar');
  if (!S.inPlace) app.innerHTML = '<div class="loading">連線中…</div>';
  S.renderedHash = hash;
  try {
    await loadState();
    const [, page, arg] = hash.split('/');
    if (page !== 'zone') { S.amb = page === 'finale' ? 'archive' : 'base'; ambience(S.amb); }
    if (!page) return home();
    if (page === 'zone') return zone(Number(arg));
    if (page === 'lab') return lab();
    if (page === 'evo') return evoPage();
    if (page === 'items') return items();
    if (page === 'log') return log();
    if (page === 'inbox') return inbox();
    if (page === 'settings') return settings();
    if (page === 'gift') return gift();
    if (page === 'finale') return finale();
    home();
  } catch (e) { renderError(e); }
}

// ── 任務指引：依伺服器狀態算出「下一步」 ──
function nextObjective(st) {
  const d = st.game_day;
  const lv = (n) => st.levels.find((l) => l.day === n);
  const alts = st.levels.filter((l) => l.day <= 10 && l.status === 'ALTERNATE');
  const zoneLabel = (l) => `第 ${String(l.day).padStart(2, '0')} 區「${l.title}」`;
  if (d < 1) return { goal: '等待第一個訊號', desc: `第一個區域將於 ${st.start_date} 00:00 開啟。先打開通知，才不會錯過。`, href: '#/settings', cta: '設定通知', list: [] };
  if (d >= 11) {
    const f = st.finale || {};
    if (f.hunt_done) return { goal: '檔案狀態：持續更新中', desc: '所有紀錄都已歸檔。你可以隨時回來重讀。', href: '#/finale', cta: '回到檔案室', list: [] };
    return { goal: f.defined ? '前往現實座標' : '進入第030號檔案室', desc: '所有區域的紀錄都移到了同一個房間。', href: '#/finale', cta: '進入檔案室', list: [] };
  }
  const t = lv(d);
  const zoneDone = t.status === 'COMPLETED';
  const list = [
    { ok: zoneDone, text: `完成今天的區域：${zoneLabel(t)}` },
    { ok: st.observed_today, text: '在「培養艙」觀察樣本一次' },
  ];
  if (alts.length) list.push({ ok: false, text: `（可選）替代路線：${alts.map((a) => '第 ' + a.day + ' 區').join('、')}` });
  if (st.portrait && !st.portrait.saved) list.push({ ok: false, text: '（可選）打開「影像校正邀請函」' });
  if (t.status === 'AVAILABLE') return { goal: `進入${zoneLabel(t)}`, desc: '今天 23:59:59 前完成。區域關閉後，不會以原本的樣子回來。', href: `#/zone/${d}`, cta: '進入區域', list };
  if (t.status === 'IN_PROGRESS') return { goal: `繼續${zoneLabel(t)}`, desc: '你上次停在這裡。進度已保存在伺服器上。', href: `#/zone/${d}`, cta: '繼續', list };
  if (!st.observed_today) return { goal: '觀察樣本 030', desc: '今天還沒有觀察。選擇一種方式，它會記住。', href: '#/lab', cta: '前往培養艙', list };
  if (alts.length) return { goal: `走替代路線：${zoneLabel(alts[0])}`, desc: '原本的區域已經關閉，但還有另一條路。', href: `#/zone/${alts[0].day}`, cta: '前往', list };
  if (st.portrait && !st.portrait.saved) return { goal: '打開影像校正邀請函', desc: '鏡面系統在等你的回覆。', href: '#/gift', cta: '查看邀請函', list };
  return { goal: '今天的任務已完成', desc: d < 10 ? '下一個區域將在午夜 00:00 開啟。' : '明天，第030號檔案室將會開啟。', href: '#/lab', cta: '看看樣本', list };
}

function missionStatus(st) {
  const frags = st.levels.filter((l) => l.day <= 10 && l.status === 'COMPLETED').length;
  const syms = new Set(st.inventory.filter((i) => i.kind === 'symbol').map((i) => i.data.symbol)).size;
  const lost = st.levels.filter((l) => l.day <= 10 && l.missed_at).length;
  const bday = new Date(st.birthday + 'T00:00:00+08:00');
  const left = Math.max(0, Math.ceil((bday - serverNow()) / 86400000));
  const cell = (k, v, sub, warn) => h('div', { class: 'ms-cell' }, h('div', { class: 'ms-k' }, k), h('div', { class: 'ms-v' }, v), sub ? h('div', { class: 'ms-s', style: warn ? '' : 'color:var(--dim)' }, sub) : null);
  const av = choicesFromStats(st.stats.choices);
  return h('div', { class: 'mission fade-in' },
    h('div', { class: 'row' }, h('span', { class: 'kicker' }, 'MISSION · 檔案 030 修復'), h('span', { class: 'spacer' }),
      h('button', { class: 'btn ghost sm', onclick: showBrief }, '任務簡報')),
    h('div', { class: 'ms-id' }, `第 ${st.observer_no || '1118'} 號觀察員`, st.player_name && st.player_name !== '觀察員' ? h('span', { class: 'ms-name' }, st.player_name) : null, h('span', { class: 'ms-tag' }, st.is_test ? 'SIM' : 'ACTIVE'),
      Object.keys(av).length ? h('span', { class: 'ms-avatar', html: avatarSVG(av, { size: 48, label: false }) }) : null),
    h('div', { class: 'ms-grid' },
      cell('片段打撈', `${frags}/10`, lost ? `已沉沒 ${lost}` : null, true),
      cell('符號', `${syms}/10`),
      cell('樣本', T(st.sample.form).replace('樣本', '')),
      cell('重新定義', left > 0 ? `T-${left}` : 'NOW', left > 0 ? '天' : null)));
}

function planetCard(st) {
  const states = layerStates(st.levels);
  const built = Object.values(states).filter((v) => v !== 'none').length;
  const cv = h('canvas', { style: 'width:120px;height:120px;flex:none' });
  const next = LAYERS.find((L) => states[L.day] === 'none' && st.levels.find((x) => x.day === L.day)?.status !== 'LOCKED') || LAYERS.find((L) => states[L.day] === 'none');
  const card = h('div', { class: 'planet-card fade-in', onclick: () => showPlanet(st) },
    cv, h('div', { style: 'flex:1;min-width:0' },
      h('div', { class: 'kicker' }, 'PLANET 030 · 重建'),
      h('div', { class: 'pc-n' }, `${built}`, h('span', {}, ' / 10 層')),
      h('div', { class: 'dim', style: 'font-size:13px' }, next ? `下一層：${next.name}（第 ${next.day} 區）` : '十層結構全部重建完成。'),
      h('div', { class: 'faint', style: 'font-size:11px;margin-top:2px' }, '點開查看')));
  requestAnimationFrame(() => S.cleanup.push(mountPlanet(cv, states, { size: 120 })));
  return card;
}

function showPlanet(st, highlight) {
  const states = layerStates(st.levels);
  const cv = h('canvas', { style: 'width:100%;aspect-ratio:1;display:block' });
  const list = h('div', { class: 'layer-list' }, ...LAYERS.map((L) => h('div', { class: 'll ' + states[L.day] + (highlight === L.day ? ' new' : '') },
    h('span', { class: 'mono' }, String(L.day).padStart(2, '0')), h('span', {}, L.name), h('span', { class: 'mono faint' }, L.en),
    h('span', { class: 'spacer' }), h('span', {}, { full: '已重建', alt: '殘響重建', none: '—' }[states[L.day]]))));
  let stop;
  modal(h('div', {}, h('div', { class: 'kicker' }, 'PLANET 030'), h('h2', { style: 'color:var(--text);margin-top:4px' }, '重建中的星球'),
    h('p', { class: 'dim', style: 'font-size:13px' }, '每回收一個片段，星球就會重建一層結構。錯過但走完替代路線的層，會以殘響的顏色重建。'),
    cv, list), { onClose: () => stop && stop() });
  requestAnimationFrame(() => { stop = mountPlanet(cv, states, { highlight }); });
}

function showBrief() {
  modal(h('div', { class: 'manual' },
    h('div', { class: 'kicker' }, 'MISSION BRIEF'), h('h2', { style: 'color:var(--text);margin-top:4px' }, '任務簡報'),
    h('dl', { class: 'brief' },
      h('dt', {}, '你是誰'), h('dd', {}, `星海檔案館的第 ${S.state.observer_no || '1118'} 號觀察員。系統比對所有觀察員後，只有你的頻率與檔案 030 完全一致——原因不明。`),
      h('dt', {}, '發生了什麼'), h('dd', {}, '在星空與深海的交界，漂浮著每一個人的檔案。編號 030 的檔案正在下沉，碎成十個片段，沉入不同的深度。每個片段只會浮上海面 24 小時。'),
      h('dt', {}, '你的任務'), h('dd', {}, '每天進入當天浮上海面的片段，解開機關、回收符號；有些線索藏在你的現實世界裡。每天觀察一次檔案的核心——樣本 030。'),
      h('dt', {}, '如果錯過'), h('dd', {}, '片段會沉入更深的海，不再以原本的樣子出現。系統會開啟替代路線，檔案會長成另一種樣子——但不會消失。'),
      h('dt', {}, '最終目標'), h('dd', {}, '第 11 天，所有片段將浮上同一片海面——第 030 號檔案室，檔案 030 將被重新定義。'),
      h('dt', {}, '協助者'), h('dd', {}, '守夜人——一位比你更早來到這片海的人。他知道的比他說的多。')),
    h('button', { class: 'btn block', onclick: () => { document.querySelector('.modal')?.remove(); playPrologue({ startDate: S.state.start_date, observerNo: S.state.observer_no }); } }, '▶ 重播前導影片')));
}

function showManual() {
  modal(h('div', { class: 'manual' },
    h('div', { class: 'kicker' }, 'OBSERVER MANUAL'), h('h2', { style: 'color:var(--text);margin-top:4px' }, '觀察手冊'),
    h('ol', {},
      h('li', {}, '每天 00:00 會開啟一個新的「區域」，當天 23:59:59 關閉。首頁上方的「下一步」會告訴你現在該做什麼。'),
      h('li', {}, '進入區域後，閱讀畫面上的訊息與線索，操作機關（開關、密碼鎖、旋鈕……）。卡住時可以按「請求提示」。'),
      h('li', {}, '場景畫面裡偶爾閃一下的光點可以點，可能藏著東西。'),
      h('li', {}, '有些區域會要你拍照、錄音、寫一句話，或用相機掃描藏在你現實世界裡的卡片。'),
      h('li', {}, '每天到「培養艙」觀察樣本 030 一次。觀察方式由你決定，它會依你的選擇長成不同的樣子。'),
      h('li', {}, '取得的符號放在「物品」，每個符號都有一個頻率數字，之後會再用到。'),
      h('li', {}, '錯過的區域會永久改變，但會開啟另一條替代路線。故事不會因此結束。'),
      h('li', {}, '到右上角「設定」開啟通知，系統會在新區域開啟、即將關閉時提醒你。')),
    h('button', { class: 'btn block', onclick: () => { document.querySelector('.modal')?.remove(); playPrologue({ startDate: S.state.start_date, observerNo: S.state.observer_no }); } }, '▶ 重播前導影片')));
}

// ── 終端（首頁） ──
function home() {
  const st = S.state;
  const wrap = h('div', { class: 'fade-in' });
  const d = st.game_day;
  const before = d < 1;
  wrap.append(h('div', { class: 'kicker' }, before ? 'STANDBY' : d <= 10 ? `DAY ${String(d).padStart(2, '0')} / 10` : 'FILE 030'),
    h('h1', {}, before ? '等待訊號' : d <= 10 ? '星海觀察中' : '第030號檔案室'));
  if (st.is_test) wrap.append(testPanel(st));
  if (d >= 1) wrap.append(missionStatus(st));
  const ev = st.evo || {};
  if (ev.status === 'ready' || ev.status === 'active') wrap.append(h('a', { class: 'card evo-alert', href: '#/evo' },
    h('div', { class: 'kicker', style: 'color:#ff6fae' }, 'ANOMALY · 培養皿'), h('div', {}, ev.status === 'active' ? '進化程序進行中。' : '培養皿出現未知反應。'),
    h('div', { class: 'dim', style: 'font-size:13px' }, ev.status === 'active' ? '回到進化程序，完成形態分化。' : '偵測到新的形態分化可能。點這裡進入進化程序。')));
  else if (ev.status === 'not_ready') wrap.append(h('div', { class: 'card' }, h('div', { class: 'kicker' }, 'ANOMALY'), h('div', { class: 'dim', style: 'font-size:13px' }, '培養皿出現微弱反應，但分化訊號尚未穩定。稍後再回來看看。')));
  if (d >= 1) wrap.append(planetCard(st));
  const ob = nextObjective(st);
  wrap.append(h('div', { class: 'objective fade-in' },
    h('div', { class: 'row' }, h('span', { class: 'kicker' }, '下一步'), h('span', { class: 'spacer' }), h('button', { class: 'btn ghost sm', onclick: showManual }, '觀察手冊')),
    h('div', { class: 'goal' }, ob.goal), h('div', { class: 'dim', style: 'font-size:14px' }, ob.desc),
    ob.list.length ? h('ul', { class: 'checklist' }, ...ob.list.map((x) => h('li', { class: x.ok ? 'ok' : '' }, x.text))) : null,
    h('a', { class: 'btn primary block', style: 'margin-top:10px', href: ob.href }, ob.cta)));

  if (st.portrait) wrap.append(h('a', { class: 'card', href: '#/gift', style: 'display:block;text-decoration:none;color:var(--text)' },
    h('div', { class: 'kicker', style: 'color:var(--accent2)' }, 'INVITATION'), h('div', {}, '影像校正邀請函'), h('div', { class: 'dim', style: 'font-size:13px' }, st.portrait.saved ? '已設定・可再次修改' : '尚未設定')));

  wrap.append(h('h2', {}, '區域'));
  const list = h('div', { class: 'zones' });
  for (const l of st.levels) {
    const isToday = l.day === d;
    const label = l.day === 11 ? 'FILE 030' : `ZONE ${String(l.day).padStart(2, '0')}`;
    const el = h(l.status === 'LOCKED' ? 'div' : 'a', { class: `zone ${l.status} ${isToday ? 'today' : ''}`, href: l.day === 11 ? '#/finale' : `#/zone/${l.day}` },
      h('span', { class: 'num' }, label),
      h('span', { class: 't' }, l.title || '▒▒▒▒', l.route_title ? h('div', { class: 'dim', style: 'font-size:12px' }, '→ ' + l.route_title) : null),
      h('span', { class: 'st ' + l.status }, l.outcome === 'ALTERNATE' ? '替代歸檔' : STATUS[l.status]));
    list.append(el);
  }
  wrap.append(list);
  shell('home', wrap);
  pendingCeremony(st);
  maybeOmen(st);
  newMessages(wrap);
}

// 已完成的區域有新的照片或留言（例如之後才補上的） → 首頁提示，可重播那一天的回顧
async function newMessages(wrap) {
  let idx = [];
  try { idx = await rpc('reward_index', { p: S.pid }); } catch (_) { return; }
  const fresh = idx.filter((x) => localStorage.getItem(ceremonyKey(S.pid, x.day)) && (localStorage.getItem(`p030.msg.${S.pid}.${x.day}`) || '') < x.updated_at);
  if (!fresh.length || !wrap.isConnected) return;
  const card = h('div', { class: 'card evo-alert', style: 'border-color:rgba(255,181,71,.6)' },
    h('div', { class: 'kicker', style: 'color:var(--accent2)' }, 'SEALED MESSAGE · 封存的訊息'),
    h('div', {}, `第 ${fresh.map((x) => x.day).join('、')} 區的碎片裡，多了一段給你的訊息。`),
    h('div', { class: 'row wrap', style: 'gap:6px;margin-top:8px' }, ...fresh.map((x) => h('button', { class: 'btn sm', onclick: () => openCeremony(x.day, { replay: true }) }, `打開第 ${x.day} 區`))));
  const anchor = wrap.querySelector('.objective');
  anchor ? anchor.before(card) : wrap.append(card);
}

// ── 區域 ──
async function zone(day) {
  let L;
  try { L = await rpc('open_level', { p: S.pid, d: day }); } catch (e) { toast(errText(e)); location.hash = '#/'; return; }
  S.amb = L.scene?.theme || 'base'; ambience(S.amb);
  const wrap = h('div', { class: 'fade-in' });
  const isMissed = L.status === 'MISSED';
  wrap.append(h('div', { class: 'kicker' }, day <= 10 ? `檔案 030 · 片段 ${String(day).padStart(2, '0')}/10 · ${L.subtitle || ''}` : `${L.code} · ${L.subtitle || ''}`),
    h('h1', {}, L.title + (L.route_title ? `｜${L.route_title}` : '')));
  if (L.route === 'alternate') wrap.append(h('div', { class: 'banner', style: 'border-color:var(--violet);color:var(--violet)' },
    `原路線已於 ${fmtTime(L.missed_at)} 封閉。這是另一條路。`));
  if (L.close_at && L.route === 'main' && L.status !== 'COMPLETED') {
    const cd = h('div', { class: 'mono dim', style: 'font-size:12px' });
    const tick = () => {
      const ms = new Date(L.close_at) - serverNow();
      if (ms <= 0) { cd.textContent = '區域已封閉。'; clearInterval(iv); setTimeout(route, 1500); return; }
      const hh = Math.floor(ms / 3600000), mm = Math.floor((ms % 3600000) / 60000), ss = Math.floor((ms % 60000) / 1000);
      cd.textContent = `距離封閉 ${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
    };
    const iv = setInterval(tick, 1000); tick(); S.cleanup.push(() => clearInterval(iv));
    wrap.append(cd);
  }
  // 場景隨劇情變化：套用「已完成或目前進行中」步驟的場景設定（例如突然停電）
  let sceneNow = { ...L.scene };
  for (const st of L.steps) {
    if (st.scene) sceneNow = { ...sceneNow, ...st.scene };
    if (!st.done && !st.optional) { if (st.fx) sfx(st.fx); break; }
  }
  wrap.append(renderScene(sceneNow, L.found, async (spot, btn) => {
    if (spot.clue) { // 場景線索：點了才看得到
      sfx('find'); btn.classList.add('seen');
      try { localStorage.setItem(`p030.clue.${S.pid}.${day}.${spot.id}`, '1'); } catch (_) {}
      modal(h('div', {}, h('div', { class: 'kicker' }, spot.label || '調查'), ...[].concat(spot.clue).map((c) => renderClue(c))));
      return;
    }
    try {
      const r = await rpc('explore', { p: S.pid, d: day, spot: spot.id });
      sfx('find');
      btn.classList.add('found');
      modal(h('div', {}, h('div', { class: 'kicker' }, spot.label || '調查'), h('p', {}, r.text || '這裡什麼也沒有。'),
        ...(r.gained || []).map((g) => h('p', { class: 'mono', style: 'color:var(--accent2)' }, '取得：' + (g.name || g.key)))));
    } catch (e) { toast(errText(e)); }
  }));

  if (isMissed) {
    wrap.append(h('div', { class: 'card' }, h('p', {}, '這個區域已經關閉。'), h('p', { class: 'dim' }, '它沒有替代路線。缺席本身也被記錄下來了。')));
    return shell('home', wrap);
  }
  const intro = h('div', { class: 'lines' });
  wrap.append(intro);
  const stepsBox = h('div');
  wrap.append(stepsBox);
  shell('home', wrap);
  const seenKey = `p030.intro.${S.pid}.${day}.${L.route}`;
  const introLines = (L.intro || []).map(T);
  if (!localStorage.getItem(seenKey)) { await typeLines(intro, introLines); localStorage.setItem(seenKey, '1'); }
  else introLines.forEach((t) => intro.append(h('p', {}, t)));
  drawSteps(L, stepsBox);
  // 捲到目前要做的那一題（影像校準時，從識別影像開始，讓影像與選項同時在畫面內）
  const act = stepsBox.querySelector('.step.active');
  const av = stepsBox.querySelector('.avatar-card');
  const target = act && act.querySelector('.choice') && av && (av.compareDocumentPosition(act) & Node.DOCUMENT_POSITION_FOLLOWING) ? av : (S.inPlace ? act : null);
  if (target) requestAnimationFrame(() => scrollTo({ top: Math.max(0, target.getBoundingClientRect().top + scrollY - 76), behavior: S.inPlace ? 'smooth' : 'auto' }));
}

function stageInfo(L) {
  const map = new Map();
  for (const s of L.steps) {
    if (!s.stage) continue;
    const st = map.get(s.stage) || { n: s.stage, title: s.stage_title, done: true };
    if (!s.optional && !s.done) st.done = false;
    map.set(s.stage, st);
  }
  return [...map.values()].sort((a, b) => a.n - b.n);
}

function drawSteps(L, box) {
  box.innerHTML = '';
  const stages = stageInfo(L);
  if (stages.length) {
    const cur = stages.find((x) => !x.done);
    box.append(h('div', { class: 'stagebar' }, ...stages.map((x) => h('div', { class: 'sb ' + (x.done ? 'done' : x === cur ? 'cur' : '') },
      h('div', { class: 'sb-n' }, `關卡 ${x.n}/${stages.length}`), h('div', { class: 'sb-t' }, x.title || '')))));
  }
  let activeShown = false, lastStage = null, avatarShown = false;
  S.avatarPreview = null;
  for (const s of L.steps) {
    const done = s.done;
    if (!done && activeShown) { if (s.optional) continue; break; }
    if (s.stage && s.stage !== lastStage) {
      lastStage = s.stage;
      const info = stages.find((x) => x.n === s.stage);
      box.append(h('div', { class: 'stage-head' + (info && info.done ? ' done' : '') }, h('span', {}, `STAGE ${s.stage}/${stages.length}`), h('b', {}, s.stage_title || ''), info && info.done ? h('span', { class: 'sh-ok' }, 'CLEAR') : null));
    }
    const isAv = s.type === 'choice' && AVATAR_STEPS.includes(s.flag);
    if (!avatarShown && isAv) {
      avatarShown = true;
      const base = choicesFromStats(S.state.stats.choices);
      const avSteps = L.steps.filter((x) => x.type === 'choice' && AVATAR_STEPS.includes(x.flag));
      const holder = h('div', { class: 'avatar-art', html: avatarSVG(base, { size: 112 }) });
      const list = h('div', { class: 'av-list' }, ...avSteps.map((x) => h('div', { class: 'av-li' + (x.done ? ' ok' : x.id === s.id || (!x.done && avSteps.find((y) => !y.done) === x) ? ' cur' : '') },
        h('i', {}, x.done ? '✓' : '·'), String(x.title || '').split('・').pop())));
      const note = h('div', { class: 'avatar-note' }, Object.keys(base).length >= 4 ? '識別影像已寫入檔案 030。' : '每完成一項校準，影像就會更新。');
      box.append(h('div', { class: 'avatar-card' }, holder, h('div', { class: 'av-side' }, h('div', { class: 'kicker' }, 'ID IMAGE'), list, note)));
      S.avatarPreview = (flag, opt) => { holder.innerHTML = avatarSVG({ ...base, [flag]: opt }, { size: 112 }); holder.classList.remove('pop'); void holder.offsetWidth; holder.classList.add('pop'); };
    }
    // 已完成的校準題收進上方清單，避免把目前的選項擠出畫面
    if (isAv && done) continue;
    const el = h('div', { class: 'step ' + (done ? 'done' : 'active') + (isAv ? ' av-step' : '') });
    el.append(h('div', { class: 'st-title' }, s.title || (s.type === 'story' ? '' : s.type)));
    if (s.speaker) el.append(h('div', { class: 'speaker' }, s.speaker));
    if (s.text) el.append(h('div', { class: 'lines' }, ...[].concat(s.text).map((t) => h('p', {}, T(t)))));
    if (s.injected) el.append(injected(s.injected));
    if (s.options && done && s.type === 'choice') el.append(h('div', { class: 'dim', style: 'font-size:13px' }, '已選擇。'));
    if (!done) {
      (s.clue || []).forEach((c) => el.append(renderClue(c)));
      if (s.prompt) el.append(h('div', { class: 'prompt' }, s.prompt));
      if (s.window) el.append(h('div', { class: 'dim mono', style: 'font-size:12px' }, `僅限 ${s.window.from}–${s.window.to.slice(0, 5)}`));
      const msg = h('div', { class: 'msg' });
      const ctx = makeCtx(L, s, el, msg, box);
      el.append(renderWidget(s, ctx));
      if (s.type !== 'story') el.append(hintBox(L, s));
      el.append(msg);
      if (!s.optional) activeShown = true;
    } else {
      const rv = renderRevealed(s);
      if (rv) el.append(rv);
      if (s.type === 'evidence') el.append(ctxEvidenceList(s, L));
    }
    box.append(el);
  }
  if (L.status === 'COMPLETED') {
    box.append(h('div', { class: 'card glow fade-in' }, h('div', { class: 'kicker' }, L.outcome === 'ALTERNATE' ? 'ARCHIVED · ALTERNATE' : 'ARCHIVED'),
      h('p', {}, L.day <= 10 ? `片段 ${String(L.day).padStart(2, '0')} 已回收。` : ''),
      h('p', { class: 'dim' }, `歸檔時間 ${fmtTime(L.completed_at)}`), h('a', { class: 'btn block', href: '#/' }, '返回終端')));
  }
}

function injected(inj) {
  if (!inj || inj.kind === 'void') return h('div', { class: 'clue glitch' }, '［缺損：這一段紀錄從未被寫入］');
  if (inj.kind === 'text') return h('div', { class: 'clue glitch' }, (inj.text || '').split('').map((c, i) => (i % 5 === 3 ? '▒' : c)).join(''));
  if (inj.kind === 'photo') { const img = h('img', { style: 'width:100%;filter:hue-rotate(140deg) contrast(1.4) saturate(.4)' }); signedUrl(inj.path).then((u) => u && (img.src = u)); return h('div', { class: 'clue glitch' }, img); }
  return h('div', { class: 'clue glitch' }, '［音訊片段損壞］');
}

function hintBox(L, s) {
  const box = h('div', { style: 'margin-top:8px' });
  (s.hints || []).forEach((t) => box.append(h('div', { class: 'clue', style: 'border-color:var(--accent2);font-size:13px' }, '提示：' + t)));
  if (s.hint_available) {
    box.append(h('button', { class: 'btn ghost sm', onclick: async (e) => {
      e.target.disabled = true;
      try { const r = await rpc('request_hint', { p: S.pid, d: L.day, step_id: s.id }); s.hints = r.hints; s.hint_available = false; box.replaceWith(hintBox(L, s)); }
      catch (err) { toast(errText(err)); e.target.disabled = false; }
    } }, s.attempts >= 2 ? '請求提示（已嘗試 ' + s.attempts + ' 次）' : '請求提示'));
  }
  return box;
}

function makeCtx(L, s, el, msg, box) {
  return {
    inventory: S.state.inventory,
    toast,
    preview: (flag, opt) => S.avatarPreview && S.avatarPreview(flag, opt),
    async send(answer, btn, opts = {}) {
      if (btn) btn.disabled = true;
      msg.className = 'msg'; msg.textContent = '…';
      try {
        const r = await rpc('submit_step', { p: S.pid, d: L.day, step_id: s.id, answer });
        if (r.correct) {
          sfx(r.completed ? 'complete' : 'ok');
          if (!r.completed) await maybeStageClear(L, s);
          msg.className = 'msg good'; msg.textContent = T(r.success_text || '……');
          await afterSuccess(L, r);
          return r;
        }
        if (!r.started) sfx('bad');
        msg.className = r.started ? 'msg' : 'msg bad'; msg.textContent = T(r.message || '沒有反應。');
        if (!r.started && !opts.silentFail) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }
        if (r.attempts) s.attempts = r.attempts;
        return r;
      } catch (e) { msg.className = 'msg bad'; msg.textContent = errText(e); return null; }
      finally { if (btn) btn.disabled = false; }
    },
    openAR(step) {
      const ar = startAR({
        cardLabel: step.card,
        onDetect: async (targetIndex) => {
          const r = await rpc('submit_step', { p: S.pid, d: L.day, step_id: step.id, answer: { target: targetIndex } });
          if (r.correct) setTimeout(async () => { (await ar).close(); await afterSuccess(L, r); }, 6000);
          return r;
        },
      });
    },
    evidenceWidget: (step) => evidenceWidget(L, step, msg),
  };
}

async function afterSuccess(L, r) {
  await new Promise((res) => setTimeout(res, 700));
  if (r.completed) {
    await openCeremony(L.day);
  } else {
    route();
  }
}

async function openCeremony(day, { replay = false } = {}) {
  try {
    await loadState();
    const L2 = await rpc('open_level', { p: S.pid, d: day });
    if (L2.status !== 'COMPLETED') return route();
    localStorage.setItem(ceremonyKey(S.pid, day), '1');
    let photos = [];
    try { photos = await rpc('stage_photos', { p: S.pid, d: day }); } catch (_) {}
    const seenAt = photos.map((x) => x.updated_at || '').sort().pop();
    if (seenAt) localStorage.setItem(`p030.msg.${S.pid}.${day}`, seenAt);
    playCeremony({ L: L2, state: S.state, photos, onClose: () => { if (!replay) location.hash = '#/'; route(); } });
  } catch (e) { toast(errText(e)); route(); }
}

// 破關後由管理者審核通過（玩家不在畫面上）→ 下次打開時補播回顧
// ── 測試：直接選區（只有測試檔案看得到；伺服器端也只允許測試檔案） ──
async function testJump(d) {
  await rpc('admin_test_jump', { p: S.pid, d });
  for (let k = 1; k <= 11; k++) { if (k < d) localStorage.setItem(ceremonyKey(S.pid, k), '1'); else localStorage.removeItem(ceremonyKey(S.pid, k)); }
  Object.keys(localStorage).filter((x) => x.startsWith(`p030.intro.${S.pid}.`) && Number(x.split('.')[3]) >= d).forEach((x) => localStorage.removeItem(x));
  localStorage.setItem('p030.prologue.v3.' + S.pid, '1');
}

function testPanel(st) {
  const grid = h('div', { class: 'tj-grid' }, ...st.levels.map((l) => h('button', {
    class: 'btn sm' + (l.day === st.game_day ? ' primary' : ''),
    onclick: async (e) => {
      const name = l.day === 11 ? '生日終章' : `第 ${l.day} 區`;
      if (!confirm(`從「${name}」開始測試？\n\n這份測試檔案的進度會清空，前面各區自動視為已完成，模擬時間跳到那一天 10:00。\n（不會影響壽星的正式進度）`)) return;
      e.target.disabled = true;
      try { await testJump(l.day); toast(`已跳到${name}`); location.hash = l.day === 11 ? '#/finale' : `#/zone/${l.day}`; }
      catch (err) { toast(errText(err)); e.target.disabled = false; }
    },
  }, l.day === 11 ? '終章' : String(l.day))));
  // 模擬時間：有時段限制的機關（例如 21:00 後才會打開的花苞）看的是遊戲時間，不是手機時間
  const now = new Date(st.server_now);
  const ymd = now.toLocaleDateString('sv-SE', { timeZone: 'Asia/Taipei' });
  const setTime = async (iso, e) => {
    e.target.disabled = true;
    try { await rpc('admin_set_test_time', { p: S.pid, sim_at: iso }); toast('模擬時間已更新'); route(); }
    catch (err) { toast(errText(err)); e.target.disabled = false; }
  };
  const clock = h('div', { class: 'row wrap', style: 'gap:8px;margin-top:12px;align-items:center' },
    h('span', { class: 'mono dim', style: 'font-size:12px' }, `模擬時間 ${fmtTime(st.server_now)}`), h('span', { class: 'spacer' }),
    h('button', { class: 'btn sm', onclick: (e) => setTime(`${ymd}T21:00:00+08:00`, e) }, '跳到今晚 21:00'),
    h('button', { class: 'btn sm', onclick: (e) => setTime(new Date(now.getTime() + 3600000).toISOString(), e) }, '+1 小時'));
  return h('div', { class: 'card tj' },
    h('div', { class: 'kicker', style: 'color:var(--accent2)' }, 'TEST · 選區測試'),
    h('p', { class: 'dim', style: 'font-size:13px;margin:4px 0 10px' }, '點一個區域，就從那一區的開頭開始玩。前面各區會自動完成，模擬時間跳到當天 10:00。'),
    grid, clock,
    h('p', { class: 'dim', style: 'font-size:12px;margin:6px 0 0' }, '有時段限制的機關（例如夜間花苞）看的是模擬時間。要測試時，先按「跳到今晚 21:00」。'));
}

// ── 第二階段進化事件 ──
function maybeOmen(st) {
  if (st.evo?.status !== 'ready') return;
  const k = 'p030.evo.omen.' + S.pid;
  if (localStorage.getItem(k)) return;
  setTimeout(() => {
    if (document.querySelector('.prologue, .ceremony, .evo-ov') || location.hash.replace(/^#/, '') !== '/' && location.hash !== '') return;
    localStorage.setItem(k, '1');
    playOmen({ onEnter: () => { location.hash = '#/evo'; } });
  }, 2600);
}

async function evoPage() {
  const wrap = h('div', { class: 'fade-in evo' });
  const body = h('div');
  const st = S.state;
  wrap.append(h('div', { class: 'kicker', style: 'color:#ff6fae' }, 'EVOLUTION · PHASE II'), h('h1', {}, '第二階段進化'));
  const choices = choicesFromStats(st.stats?.choices || {});
  wrap.append(h('div', { class: 'card evo-id' }, h('span', { class: 'evo-id-av', html: avatarSVG(choices, { size: 64, label: false }) }),
    h('div', {}, h('div', { class: 'kicker' }, 'CORE IDENTITY'), h('div', {}, `第 ${st.observer_no || '1118'} 號觀察員`),
      h('div', { class: 'dim', style: 'font-size:12px' }, '初始身分資料：已保留（不可重置）。進化只會建立新的外在形態。'))));
  const phases = h('div', { class: 'evo-phases' });
  wrap.append(phases, body);
  shell('home', wrap);
  const setPhase = (n) => { phases.innerHTML = ''; ['進化環境', '形態分化', '進化啟動'].forEach((t, i) => phases.append(h('div', { class: 'evo-ph' + (i + 1 < n ? ' done' : i + 1 === n ? ' cur' : '') }, h('b', {}, `0${i + 1}`), t))); };
  const busy = (on) => body.querySelectorAll('button').forEach((b) => (b.disabled = on));
  const call = async (fn, args = {}) => { busy(true); try { const v = await rpc(fn, { p: S.pid, ...args }); draw(v); } catch (e) { toast(errText(e)); busy(false); } };
  const zoom = (o) => { const ov = h('div', { class: 'evo-zoom', onclick: () => ov.remove() }, h('img', { src: o.image, alt: o.label }), h('div', { class: 'evo-zoom-cap' }, `SIM FILE ・ ${o.label}`), h('div', { class: 'dim', style: 'font-size:12px' }, '點任意處關閉')); document.body.append(ov); };
  const card = (o, { pick = true, tag } = {}) => h('div', { class: 'evo-opt' },
    h('button', { class: 'evo-img', onclick: () => zoom(o), 'aria-label': '放大 ' + o.label }, h('img', { src: o.image, alt: o.label, loading: 'lazy' }), h('span', { class: 'evo-tag' }, tag || 'SIM FILE')),
    h('div', { class: 'evo-lbl' }, o.label),
    pick ? h('button', { class: 'btn primary block sm', onclick: () => { sfx('match'); call('evo_pick', { w: o.id }); } }, '選擇這個') : null);
  function draw(v) {
    body.innerHTML = '';
    if (v.status === 'locked') { setPhase(0); body.append(h('div', { class: 'card' }, h('p', { class: 'dim' }, '培養皿目前沒有反應。'), h('a', { class: 'btn', href: '#/lab' }, '回到培養艙'))); return; }
    if (v.status === 'not_ready') { setPhase(0); body.append(h('div', { class: 'card' }, h('p', {}, '偵測到微弱的分化反應。'), h('p', { class: 'dim' }, '分化訊號尚未穩定，稍後再回來看看。'))); return; }
    if (v.status === 'ready') {
      setPhase(1);
      body.append(h('div', { class: 'card' }, h('div', { class: 'evo-intro' }, ...['樣本出現了未知的進化反應。', '它的核心不會改變——你是誰，已經寫在檔案裡。', '這一次，它需要決定自己「看起來」的樣子。', '進化程序開始後，請依直覺選擇。'].map((t) => h('p', {}, t))),
        h('button', { class: 'btn primary block', onclick: () => call('evo_begin') }, '啟動進化程序')));
      return;
    }
    if (v.status === 'done') {
      setPhase(4);
      const cv = h('canvas', { class: 'evo-sample' });
      body.append(h('div', { class: 'incubator' }, cv),
        h('div', { class: 'card evo-done' }, h('div', { class: 'kicker' }, 'PHASE II COMPLETE'),
          h('div', { class: 'evo-done-row' }, h('div', {}, h('div', { class: 'dim', style: 'font-size:12px' }, '新識別碼'), h('div', { class: 'mono', style: 'font-size:18px' }, v.code),
            h('div', { class: 'dim', style: 'font-size:12px;margin-top:6px' }, '核心身分：已保留'), h('div', { class: 'dim', style: 'font-size:12px' }, `新形態：${v.first?.label || '已建立'}`)),
            v.first ? card(v.first, { pick: false, tag: 'FORM' }) : null),
          h('div', { class: 'row', style: 'gap:10px;margin-top:10px;align-items:center' }, h('i', { class: 'evo-glyph', html: EVO_GLYPH }), h('div', { class: 'dim', style: 'font-size:13px' }, '分化印記：已收進「物品」。')),
          h('a', { class: 'btn block', href: '#/lab', style: 'margin-top:10px' }, '前往培養艙')));
      requestAnimationFrame(() => S.cleanup.push(mountSample(cv, { ...st.sample, evo: { tint: v.tint, shape: v.shape } })));
      return;
    }
    const ph = v.phase;
    if (ph === 'env') {
      setPhase(1);
      body.append(h('div', { class: 'evo-q' }, h('div', { class: 'kicker' }, `ENVIRONMENT ・ 比對 ${v.step} / ${v.steps}`), h('p', {}, '兩種進化環境。選出樣本更想留下來的那一個。'), h('p', { class: 'dim', style: 'font-size:12px' }, '看光線、背景、顏色與氣氛。點圖片可以放大。')),
        h('div', { class: 'evo-grid two' }, ...v.options.map((o) => card(o, { tag: 'ENV' }))));
    } else if (ph === 'form') {
      setPhase(2);
      body.append(h('div', { class: 'evo-q' }, h('div', { class: 'kicker' }, `FORM ・ 第 ${v.step} / ${v.steps} 輪`), h('p', {}, '形態模擬檔案。選出最接近它想成為的樣子。'), h('p', { class: 'dim', style: 'font-size:12px' }, '只看畫面，不用想太多。點圖片可以放大。')),
        h('div', { class: 'evo-grid' + (v.options.length === 2 ? ' two' : '') }, ...v.options.map((o) => card(o))));
    } else if (ph === 'final1') {
      setPhase(2);
      body.append(h('div', { class: 'evo-q' }, h('div', { class: 'kicker' }, 'FINAL ・ 首選形態'), h('p', {}, '最後的分化候選。選出你的首選形態。')),
        h('div', { class: 'evo-grid' + (v.options.length === 2 ? ' two' : '') }, ...v.options.map((o) => card(o, { tag: 'FINAL' }))));
    } else if (ph === 'final2') {
      setPhase(2);
      body.append(h('div', { class: 'evo-q' }, h('div', { class: 'kicker' }, 'FINAL ・ 備選形態'), h('p', {}, `首選：${v.first.label}。再選出一個備選形態。`)),
        h('div', { class: 'evo-grid two' }, ...v.options.map((o) => card(o, { tag: 'BACKUP' }))));
    } else if (ph === 'confirm') {
      setPhase(3);
      body.append(h('div', { class: 'evo-q' }, h('div', { class: 'kicker' }, 'CONFIRM ・ 分化確認'), h('p', {}, '確認後將啟動進化，無法再更改。')),
        h('div', { class: 'evo-grid two' }, card(v.first, { pick: false, tag: '首選' }), card(v.second, { pick: false, tag: '備選' })),
        h('div', { class: 'row', style: 'gap:8px;margin-top:12px' },
          h('button', { class: 'btn ghost', onclick: () => call('evo_redo_final') }, '重新選擇'),
          h('button', { class: 'btn primary spacer', onclick: async (e) => {
            e.target.disabled = true;
            try { const r = await rpc('evo_confirm', { p: S.pid }); await playEvolution({ evo: r }); await loadState(); draw(r); }
            catch (err) { toast(errText(err)); e.target.disabled = false; }
          } }, '確認並啟動進化')));
    }
    scrollTo({ top: 0, behavior: 'smooth' });
  }
  try { draw(await rpc('evo_state', { p: S.pid })); } catch (e) { body.append(h('div', { class: 'card msg bad' }, errText(e))); }
}

function pendingCeremony(st) {
  if (document.querySelector('.prologue, .ceremony')) return;
  const due = st.levels.filter((l) => l.day <= 10 && l.status === 'COMPLETED' && !localStorage.getItem(ceremonyKey(S.pid, l.day))).sort((x, y) => x.day - y.day)[0];
  if (due) setTimeout(() => { if (!document.querySelector('.prologue, .ceremony')) openCeremony(due.day); }, 900);
}

async function maybeStageClear(L, s) {
  if (!s.stage) return;
  s.done = true;
  const same = L.steps.filter((x) => x.stage === s.stage && !x.optional);
  if (!same.every((x) => x.done)) return;
  const total = new Set(L.steps.filter((x) => x.stage).map((x) => x.stage)).size;
  await stageClear(s.stage, total, s.stage_title);
}

// ── 佐證 ──
function ctxEvidenceList(s, L) {
  const box = h('div', { class: 'evid' });
  for (const sub of s.submissions || []) {
    const row = h('div', { class: 'card', style: 'padding:10px' },
      h('div', { class: 'row' }, h('span', { class: `status-pill s-${sub.status}` }, { PENDING_REVIEW: '已提交・等待審核', APPROVED: '驗證通過', NEEDS_MORE: '需要補充', OVERDUE: '逾期', REPLACED: '已補充', SUBMITTED: '已提交' }[sub.status] || sub.status),
        h('span', { class: 'dim mono', style: 'font-size:11px' }, fmtTime(sub.submitted_at))));
    if (sub.note) row.append(h('div', { class: 'dim', style: 'font-size:13px' }, '審核：' + sub.note));
    if (sub.kind === 'text') row.append(h('div', {}, sub.text));
    if (sub.kind === 'photo') { const img = h('img'); signedUrl(sub.path).then((u) => u && (img.src = u)); row.append(img); }
    if (sub.kind === 'audio') { const a = h('audio', { controls: true, style: 'width:100%' }); signedUrl(sub.path).then((u) => u && (a.src = u)); row.append(a); }
    box.append(row);
  }
  const last = (s.submissions || []).filter((x) => x.status !== 'REPLACED').slice(-1)[0];
  if (last && last.status === 'NEEDS_MORE' && L.status !== 'MISSED') {
    const m = h('div', { class: 'msg' });
    box.append(h('div', { class: 'card' }, h('div', { class: 'dim' }, '補充紀錄'), evidenceWidget(L, s, m), m));
  }
  return box;
}

function evidenceWidget(L, s, msg) {
  const box = h('div');
  if (s.mosaic || s.photoset) {
    const last = (s.submissions || []).filter((x) => x.status !== 'REPLACED').slice(-1)[0];
    if (!(last && last.status === 'PENDING_REVIEW')) {
      const onSubmit = async (blob) => {
        const path = `${S.pid}/${L.day}/${s.mosaic ? 'mosaic' : 'set'}-final-${Date.now()}.jpg`;
        await upload('evidence', path, blob, 'image/jpeg');
        const r = await rpc('submit_evidence', { p: S.pid, d: L.day, step_id: s.id, kind: 'photo', path, content: null });
        sfx(r.completed ? 'complete' : 'ok');
        await afterSuccess(L, r);
      };
      const w = s.mosaic ? mosaicWidget({ step: s, pid: S.pid, day: L.day, toast, onSubmit }) : photosetWidget({ step: s, pid: S.pid, day: L.day, toast, onSubmit });
      if (last && last.status === 'NEEDS_MORE') return h('div', {}, h('div', { class: 'clue', style: 'border-color:var(--warn)' }, '比對失敗：' + (last.note || '這份證據無法通過比對。可以重拍其中幾張，再送出一次。')), w);
      return w;
    }
  }
  if (s.gate) {
    const last = (s.submissions || []).filter((x) => x.status !== 'REPLACED').slice(-1)[0];
    if (last && last.status === 'PENDING_REVIEW') {
      const card = h('div', { class: 'gate-wait' }, h('div', { class: 'kicker' }, 'SYNC · 比對中'), h('p', {}, T(s.pending_text || '證據已送出，觀察站正在比對。')));
      if (last.kind === 'photo') { const img = h('img', { style: 'max-width:100%;max-height:240px;margin-top:6px' }); signedUrl(last.path).then((u) => u && (img.src = u)); card.append(img); }
      card.append(h('button', { class: 'btn ghost sm', style: 'margin-top:8px', onclick: () => route() }, '重新檢查'));
      return card;
    }
    if (last && last.status === 'NEEDS_MORE') box.append(h('div', { class: 'clue', style: 'border-color:var(--warn)' }, '比對失敗：' + (last.note || '這份證據無法通過比對。再試一次。')));
  }
  const submit = async (kind, blob, ext, text, btn) => {
    btn && (btn.disabled = true);
    msg.className = 'msg'; msg.textContent = '上傳中…';
    try {
      let path = null;
      if (blob) {
        path = `${S.pid}/${L.day}/${Date.now()}.${ext}`;
        await upload('evidence', path, blob, blob.type || (kind === 'photo' ? 'image/jpeg' : 'audio/webm'));
      }
      const r = await rpc('submit_evidence', { p: S.pid, d: L.day, step_id: s.id, kind, path, content: text || null });
      sfx(r.completed ? 'complete' : 'ok');
      msg.className = 'msg good'; msg.textContent = r.pending ? '證據已送出，觀察站比對中。' : '已提交，等待比對。';
      if (!r.completed && !r.pending) await maybeStageClear(L, s);
      await afterSuccess(L, r);
    } catch (e) { msg.className = 'msg bad'; msg.textContent = errText(e); btn && (btn.disabled = false); }
  };
  if (s.kinds.includes('text')) {
    const ta = h('textarea', { placeholder: '寫在這裡……', maxlength: 4000 });
    box.append(ta, h('div', { style: 'height:8px' }), h('button', { class: 'btn primary block', onclick: (e) => { if (ta.value.trim()) submit('text', null, null, ta.value.trim(), e.target); } }, '提交紀錄'));
  }
  if (s.kinds.includes('photo')) {
    const inp = h('input', { type: 'file', accept: 'image/*', capture: 'environment', class: 'hidden' });
    const prev = h('img', { style: 'max-width:100%;border-radius:8px;display:none' });
    let file = null;
    inp.onchange = async () => { file = inp.files[0]; if (!file) return; file = await shrinkImage(file); prev.src = URL.createObjectURL(file); prev.style.display = 'block'; send.disabled = false; };
    const send = h('button', { class: 'btn primary block', disabled: true, onclick: (e) => file && submit('photo', file, 'jpg', null, e.target) }, '提交照片');
    box.append(inp, h('button', { class: 'btn block', onclick: () => inp.click() }, '拍照或選擇照片'), prev, h('div', { style: 'height:8px' }), send);
  }
  if (s.kinds.includes('audio')) box.append(audioRecorder((blob, ext, btn) => submit('audio', blob, ext, null, btn)));
  return box;
}

async function shrinkImage(file, max = 1600) {
  try {
    const bmp = await createImageBitmap(file);
    const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    return await new Promise((r) => c.toBlob((b) => r(b || file), 'image/jpeg', 0.85));
  } catch (_) { return file; }
}

function audioRecorder(onSubmit) {
  const box = h('div');
  const status = h('div', { class: 'rec' });
  const player = h('audio', { controls: true, style: 'width:100%;display:none' });
  let rec, chunks = [], blob = null, ext = 'webm', timer;
  const start = h('button', { class: 'btn block' }, '開始錄音');
  const send = h('button', { class: 'btn primary block', disabled: true }, '提交聲音');
  const file = h('input', { type: 'file', accept: 'audio/*', class: 'hidden' });
  file.onchange = () => { blob = file.files[0]; if (blob) { ext = (blob.name.split('.').pop() || 'm4a'); player.src = URL.createObjectURL(blob); player.style.display = 'block'; send.disabled = false; } };
  start.onclick = async () => {
    if (rec && rec.state === 'recording') { rec.stop(); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const type = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm'].find((t) => window.MediaRecorder && MediaRecorder.isTypeSupported(t)) || '';
      rec = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
      ext = (rec.mimeType || '').includes('mp4') ? 'm4a' : 'webm';
      chunks = [];
      rec.ondataavailable = (e) => chunks.push(e.data);
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop()); clearInterval(timer);
        blob = new Blob(chunks, { type: rec.mimeType || 'audio/webm' });
        player.src = URL.createObjectURL(blob); player.style.display = 'block';
        status.innerHTML = ''; start.textContent = '重新錄音'; send.disabled = false;
      };
      rec.start();
      let sec = 0; status.innerHTML = '<span class="dotrec"></span><span class="mono">0s</span>';
      timer = setInterval(() => { sec++; status.lastChild.textContent = sec + 's'; if (sec >= 60) rec.stop(); }, 1000);
      start.textContent = '停止';
    } catch (e) { toast('無法使用麥克風：' + (e.message || e) + '。可以改為上傳音訊檔。'); }
  };
  send.onclick = (e) => blob && onSubmit(blob, ext, e.target);
  box.append(start, status, player, h('button', { class: 'btn ghost sm', onclick: () => file.click() }, '或上傳音訊檔'), file, h('div', { style: 'height:8px' }), send);
  return box;
}

// ── 培養艙 ──
function lab() {
  const st = S.state, sm = st.sample;
  const wrap = h('div', { class: 'fade-in' });
  wrap.append(h('div', { class: 'kicker' }, 'SAMPLE 030'), h('h1', {}, T(sm.form)));
  wrap.append(h('details', { class: 'lab-help', open: sm.total === 0 ? 'open' : null },
    h('summary', {}, '培養艙怎麼用？'),
    h('ul', {},
      h('li', {}, '每天觀察一次，當天任何時間都可以（00:00–23:59），不用固定時間。'),
      h('li', {}, '選一種觀察方式：探索讓它長出分岔、保存讓它長出殼層、調整環境讓它發光、靜置讓它往下扎根。'),
      h('li', {}, '每天都來，它會越來越規律、對稱；漏掉某天不會死掉，只會長歪、留下一道紅色痕跡。'),
      h('li', {}, '第 11 天，它的最終形態會出現在第 030 號檔案室。'))));
  const inc = h('div', { class: 'incubator' }); const cv = h('canvas');
  inc.append(cv); wrap.append(inc);
  const params = h('div', { class: 'params' });
  for (const [k, v] of Object.entries(sm.params)) {
    params.append(h('div', { class: 'param' }, h('span', {}, PARAM_LABEL[k]), h('div', { class: 'bar' }, h('i', { style: `width:${Math.min(100, v)}%` })), h('span', {}, String(Math.round(v)))));
  }
  wrap.append(params);
  wrap.append(h('div', { class: 'grid2' },
    h('div', { class: 'card', style: 'margin:0' }, h('div', { class: 'dim', style: 'font-size:12px' }, '累積觀察'), h('div', { class: 'mono', style: 'font-size:22px' }, `${sm.total} 天`)),
    h('div', { class: 'card', style: 'margin:0' }, h('div', { class: 'dim', style: 'font-size:12px' }, '連續觀察／中斷'), h('div', { class: 'mono', style: 'font-size:22px' }, `${sm.streak} ／ ${sm.breaks}`))));
  const hist = h('div', { class: 'history' });
  for (let d = 1; d <= Math.min(Math.max(st.game_day, 1), 11); d++) {
    const o = sm.history.find((x) => x.day === d);
    hist.append(h('span', { class: o ? '' : 'gap', title: o ? ACTION_LABEL[o.action] : '未觀察' }, o ? ACTION_LABEL[o.action][0] : '·'));
  }
  wrap.append(h('h2', {}, '觀察歷程'), hist);
  if (st.game_day >= 1 && st.game_day <= 11) {
    if (st.observed_today) wrap.append(h('div', { class: 'card' }, h('div', { class: 'dim' }, '今天的觀察已記錄。樣本需要時間反應。')));
    else {
      const acts = h('div', { class: 'obs-actions' });
      for (const a of ['explore', 'preserve', 'adjust', 'rest']) {
        acts.append(h('button', { class: 'btn', onclick: async (e) => {
          acts.querySelectorAll('button').forEach((b) => (b.disabled = true));
          try { await rpc('observe', { p: S.pid, action: a }); sfx('ping'); toast('觀察已記錄。'); route(); }
          catch (err) { toast(errText(err)); acts.querySelectorAll('button').forEach((b) => (b.disabled = false)); }
        } }, h('div', {}, h('b', {}, ACTION_LABEL[a]), h('small', {}, ACTION_DESC[a]))));
      }
      wrap.append(h('h2', {}, '今天的觀察方式'), acts);
    }
  }
  if (sm.dormant > 0) wrap.append(h('p', { class: 'dim', style: 'font-size:13px' }, `樣本已有 ${sm.dormant} 天沒有被觀察。它沒有停止生長，只是長往別的方向。`));
  const ev = st.evo || {};
  if (ev.status === 'done') wrap.append(h('div', { class: 'card evo-card' }, h('div', { class: 'kicker' }, 'PHASE II · 第二階段形態'),
    h('div', { class: 'row', style: 'gap:12px;align-items:center' }, h('i', { class: 'evo-glyph', html: EVO_GLYPH }),
      h('div', {}, h('div', { class: 'mono' }, ev.code), h('div', { class: 'dim', style: 'font-size:13px' }, `核心身分：已保留・新形態：${ev.label || '已建立'}`))),
    h('a', { class: 'btn sm', href: '#/evo', style: 'margin-top:8px' }, '回顧進化形態')));
  else if (ev.status === 'ready' || ev.status === 'active') wrap.append(h('a', { class: 'card evo-alert', href: '#/evo' }, h('div', { class: 'kicker', style: 'color:#ff6fae' }, 'ANOMALY'), h('div', {}, '樣本出現未知反應。進入進化程序 ›')));
  shell('lab', wrap);
  requestAnimationFrame(() => S.cleanup.push(mountSample(cv, { ...sm, evo: ev.status === 'done' ? ev : null })));
}

// ── 物品 ──
function items() {
  const st = S.state;
  const wrap = h('div', { class: 'fade-in' });
  wrap.append(h('div', { class: 'kicker' }, 'INVENTORY'), h('h1', {}, '符號與物品'));
  const owned = {};
  st.inventory.filter((i) => i.kind === 'symbol').forEach((i) => { const id = i.data.symbol; if (!owned[id] || !i.data.echo) owned[id] = i; });
  const grid = h('div', { class: 'sym-grid' });
  for (let id = 1; id <= 10; id++) {
    const it = owned[id];
    const el = h('button', { class: 'sym' + (it ? '' : ' none') + (it?.data.echo ? ' echo' : ''), html: it ? glyphSVG(id, { color: it.data.echo ? '#7d8e9c' : '#f2b84b' }) + `<span class="d">${it.digit}</span>` : '<span class="faint mono">?</span>' });
    if (it) el.onclick = () => modal(h('div', {}, h('div', { style: 'width:96px;margin:auto;color:' + (it.data.echo ? '#7d8e9c' : '#f2b84b'), html: glyphSVG(id) }),
      h('h2', { style: 'text-align:center;color:var(--text)' }, it.name), h('div', { class: 'mono dim', style: 'text-align:center' }, `頻率 ${it.digit}・來源 第 ${it.source_day} 區`),
      it.description ? h('p', { class: 'dim' }, it.description) : null,
      ...(it.lore || []).map((t) => h('p', {}, t))));
    grid.append(el);
  }
  wrap.append(grid);
  const others = st.inventory.filter((i) => i.kind !== 'symbol');
  wrap.append(h('h2', {}, '物品'));
  if (!others.length) wrap.append(h('p', { class: 'dim' }, '尚無。'));
  others.forEach((i) => wrap.append(h('div', { class: 'card' }, i.data?.glyph === 'evo' ? h('i', { class: 'evo-glyph sm', html: EVO_GLYPH }) : null, h('div', {}, i.name), i.description ? h('div', { class: 'dim', style: 'font-size:13px' }, i.description) : null,
    h('div', { class: 'faint mono', style: 'font-size:11px' }, `第 ${i.source_day || '?'} 區・${fmtTime(i.acquired_at)}`))));
  shell('items', wrap);
}

// ── 紀錄 ──
function log() {
  const st = S.state;
  const wrap = h('div', { class: 'fade-in' });
  wrap.append(h('div', { class: 'kicker' }, 'LOG'), h('h1', {}, '觀察紀錄'));
  wrap.append(h('div', { class: 'grid2' },
    stat('完成（準時）', st.stats.ontime), stat('完成（全部）', st.stats.completed),
    stat('錯過的區域', st.stats.missed), stat('發現的隱藏物', st.stats.exploration)));
  const doneDays = st.levels.filter((l) => l.day <= 10 && l.status === 'COMPLETED');
  wrap.append(h('h2', {}, '每日回顧'));
  if (!doneDays.length) wrap.append(h('p', { class: 'dim' }, '完成第一個區域後，回顧會出現在這裡。'));
  else wrap.append(h('div', { class: 'recap-list' }, ...doneDays.map((l) => h('button', { class: 'recap ' + (l.outcome === 'ALTERNATE' ? 'alt' : ''), onclick: () => openCeremony(l.day, { replay: true }) },
    h('span', { class: 'mono' }, `ZONE ${String(l.day).padStart(2, '0')}`), h('b', {}, l.title), h('span', { class: 'spacer' }), h('span', {}, '▶ 重播')))));
  wrap.append(h('h2', {}, '事件'));
  for (const e of st.events.filter((x) => x.type !== 'ROUTE' && x.type !== 'HINT')) {
    wrap.append(h('div', { class: 'row', style: 'border-bottom:1px solid var(--line);padding:8px 0;font-size:14px' },
      h('span', { class: 'mono dim', style: 'font-size:11px;width:84px' }, fmtTime(e.at)),
      h('span', { style: e.type === 'MISSED' || e.type === 'ITEM_LOST' ? 'color:var(--warn)' : '' }, (EVENT_TEXT[e.type] || e.type) + (e.day ? `・第 ${e.day} 區` : '') +
        (e.payload?.action ? '・' + ACTION_LABEL[e.payload.action] : '') + (e.payload?.title && e.type === 'SPECIAL_EVENT' ? '・' + e.payload.title : ''))));
  }
  shell('log', wrap);
}
const stat = (label, v) => h('div', { class: 'card', style: 'margin:0' }, h('div', { class: 'dim', style: 'font-size:12px' }, label), h('div', { class: 'mono', style: 'font-size:22px' }, String(v)));

// ── 訊息 ──
async function inbox() {
  const list = await rpc('list_notifications', { p: S.pid });
  const wrap = h('div', { class: 'fade-in' });
  wrap.append(h('div', { class: 'kicker' }, 'TRANSMISSIONS'), h('h1', {}, '訊息'));
  if (!list.length) wrap.append(h('p', { class: 'dim' }, '沒有訊息。'));
  for (const n of list) {
    wrap.append(h('div', { class: 'card', style: n.read_at ? 'opacity:.7' : 'border-color:var(--accent)' },
      h('div', { class: 'row' }, h('b', {}, n.title), h('span', { class: 'spacer' }), h('span', { class: 'mono dim', style: 'font-size:11px' }, fmtTime(n.created_at))),
      h('div', { class: 'dim' }, n.body)));
  }
  S.state.unread = 0;
  shell('inbox', wrap);
  rpc('mark_notifications_read', { p: S.pid }).catch(() => {});
}

// ── 設定（通知） ──
async function settings() {
  const prefs = await rpc('get_prefs', { p: S.pid });
  const wrap = h('div', { class: 'fade-in' });
  wrap.append(h('div', { class: 'kicker' }, 'SETTINGS'), h('h1', {}, '設定'));
  const types = { NEW_MISSION: '新區域開放', MISSION_PENDING: '區域尚未完成', MISSION_EXPIRING: '區域即將封閉', MISSION_MISSED: '區域已封閉', SPECIAL_EVENT: '特殊事件' };
  const card = h('div', { class: 'card' });
  const pushState = h('div', { class: 'dim', style: 'font-size:13px' });
  const supported = 'serviceWorker' in navigator && 'PushManager' in window && vapidKey();
  const perm = typeof Notification !== 'undefined' ? Notification.permission : 'unsupported';
  pushState.textContent = !supported ? '這個瀏覽器目前無法接收推播（iPhone 需先「加入主畫面」）。訊息仍會出現在站內「訊息」。'
    : perm === 'granted' ? `推播已授權・已登記 ${prefs.subscriptions} 個裝置` : '尚未授權推播。未授權時，訊息只會出現在站內。';
  card.append(h('div', { class: 'row' }, h('b', {}, '推播通知'), h('span', { class: 'spacer' }),
    h('input', { type: 'checkbox', checked: prefs.push_enabled ? 'checked' : null, onchange: (e) => save({ push_enabled: e.target.checked }) })), pushState);
  if (supported && perm !== 'denied') card.append(h('button', { class: 'btn block', style: 'margin-top:8px', onclick: enablePush }, perm === 'granted' ? '重新登記此裝置' : '允許此裝置接收推播'));
  wrap.append(card);
  const tcard = h('div', { class: 'card' }, h('b', {}, '通知類型'));
  for (const [k, v] of Object.entries(types)) {
    tcard.append(h('label', { class: 'row', style: 'padding:6px 0' }, h('span', {}, v), h('span', { class: 'spacer' }),
      h('input', { type: 'checkbox', checked: prefs.types[k] !== false ? 'checked' : null, onchange: (e) => save({ types: { [k]: e.target.checked } }) })));
  }
  tcard.append(h('div', { class: 'dim', style: 'font-size:12px' }, '每日一般提醒最多兩次。'));
  wrap.append(tcard);
  const qs = h('input', { type: 'time', value: (prefs.quiet_start || '').slice(0, 5) });
  const qe = h('input', { type: 'time', value: (prefs.quiet_end || '').slice(0, 5) });
  wrap.append(h('div', { class: 'card' }, h('b', {}, '勿擾時段'), h('div', { class: 'grid2' }, h('label', { class: 'field' }, h('span', {}, '開始'), qs), h('label', { class: 'field' }, h('span', {}, '結束'), qe)),
    h('button', { class: 'btn block', onclick: () => save({ quiet_start: qs.value, quiet_end: qe.value }) }, '儲存勿擾時段')));
  if (S.boot.profiles.length > 1) {
    const sel = h('select', { onchange: (e) => { localStorage.setItem('p030.profile', e.target.value); location.href = location.pathname; } });
    S.boot.profiles.forEach((p) => sel.append(h('option', { value: p.id, selected: p.id === S.pid ? 'selected' : null }, (p.is_test ? '［測試］' : '') + (p.label || p.id))));
    wrap.append(h('div', { class: 'card' }, h('b', {}, '切換檔案'), sel));
  }
  wrap.append(h('button', { class: 'btn block', onclick: () => playPrologue({ startDate: S.state.start_date, observerNo: S.state.observer_no }) }, '▶ 重播前導影片'), h('div', { style: 'height:8px' }));
  if (S.boot.is_admin) wrap.append(h('a', { class: 'btn block', href: 'admin.html' }, '管理後台'));
  wrap.append(h('div', { style: 'height:10px' }), h('button', { class: 'btn ghost block', onclick: async () => { await signOut(); location.reload(); } }, '登出'));
  wrap.append(h('p', { class: 'faint mono', style: 'font-size:11px;text-align:center' }, S.boot.email));
  shell('home', wrap);
  async function save(patch) { try { await rpc('save_prefs', { p: S.pid, prefs: patch }); toast('已儲存。'); } catch (e) { toast(errText(e)); } }
}

async function enablePush() {
  try {
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') { toast('沒有取得通知權限。訊息仍會出現在站內。'); return; }
    const reg = await navigator.serviceWorker.ready;
    const key = vapidKey();
    const raw = atob(key.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (key.length % 4)) % 4));
    const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: Uint8Array.from(raw, (c) => c.charCodeAt(0)) });
    await rpc('save_push_subscription', { p: S.pid, sub: sub.toJSON() });
    toast('此裝置已登記。'); route();
  } catch (e) { toast('推播登記失敗：' + errText(e)); }
}

// ── 禮物一：影像校正邀請函 ──
const PORTRAIT_LABEL = Object.fromEntries(Object.entries(PORTRAIT_MAP).map(([k, v]) => [k, v.label]));
async function gift() {
  const g = await rpc('get_portrait', { p: S.pid });
  const wrap = h('div', { class: 'fade-in' });
  wrap.append(h('div', { class: 'kicker', style: 'color:var(--accent2)' }, 'INVITATION'), h('h1', {}, '影像校正邀請函'));
  if (!g) { wrap.append(h('p', { class: 'dim' }, '邀請函尚未送達。')); return shell('home', wrap); }
  wrap.append(h('p', { class: 'dim' }, '鏡面系統需要一份真正的影像。由你決定，影像中的你應該是什麼樣子。'),
    h('p', { class: 'mono', style: 'font-size:12px;color:var(--accent2)' }, `邀請編號 ${g.invitation_no}・送達途徑 ${{ 'complete:4': '鏡廳', 'alternate:4': '碎鏡', admin: '守夜人轉交' }[g.unlocked_via] || g.unlocked_via}`));
  const day1 = portraitFromChoices(S.state.stats.choices);
  const choice = { ...(g.choice || {}) };
  for (const k of Object.keys(PORTRAIT_MAP)) if (!choice[k] && day1[k]) choice[k] = day1[k].id;
  if (Object.keys(day1).length) wrap.append(h('div', { class: 'card glow' }, h('div', { class: 'kicker' }, 'IDENTITY · 第 1 天的設定'),
    h('div', { style: 'display:flex;justify-content:center;margin:8px 0', html: avatarSVG(choicesFromStats(S.state.stats.choices), { size: 160 }) }),
    h('p', {}, '還記得第一天的「識別影像校準」嗎？那些設定，就是這次影像的方向。'),
    h('div', { class: 'dim', style: 'font-size:14px' }, Object.values(day1).map((x) => `${x.label}：${x.real}`).join('　/　'))));
  for (const [k, def] of Object.entries(PORTRAIT_MAP)) {
    const opts = Object.keys(def.options);
    const chips = h('div', { class: 'chips' });
    opts.forEach((o) => {
      const c = h('button', { class: 'chip' + (choice[k] === o ? ' on' : '') }, def.options[o].real);
      c.onclick = () => { choice[k] = o; chips.querySelectorAll('.chip').forEach((x) => x.classList.remove('on')); c.classList.add('on'); };
      chips.append(c);
    });
    wrap.append(h('h2', {}, def.label), chips);
  }
  const notes = h('textarea', { placeholder: '任何想法：想呈現的感覺、不想要的元素、想帶的物品……' }, choice.notes || '');
  wrap.append(h('h2', {}, '補充'), notes);
  const refs = [...(g.reference_paths || [])];
  const refBox = h('div', { class: 'row wrap' });
  const drawRefs = () => {
    refBox.innerHTML = '';
    refs.forEach((pth, i) => { const img = h('img', { style: 'width:80px;height:80px;object-fit:cover;border-radius:8px' }); signedUrl(pth, 'gifts').then((u) => u && (img.src = u));
      refBox.append(h('div', { style: 'position:relative' }, img, h('button', { class: 'btn sm', style: 'position:absolute;top:0;right:0;min-height:24px;padding:0 6px', onclick: () => { refs.splice(i, 1); drawRefs(); } }, '×'))); });
  };
  drawRefs();
  const fin = h('input', { type: 'file', accept: 'image/*', multiple: true, class: 'hidden' });
  fin.onchange = async () => {
    for (const f of fin.files) {
      try { const blob = await shrinkImage(f, 1400); const pth = `${S.pid}/portrait/${Date.now()}-${Math.random().toString(36).slice(2, 6)}.jpg`; await upload('gifts', pth, blob, 'image/jpeg'); refs.push(pth); }
      catch (e) { toast(errText(e)); }
    }
    drawRefs();
  };
  wrap.append(h('h2', {}, '參考照片'), refBox, fin, h('button', { class: 'btn ghost', onclick: () => fin.click() }, '加入參考照片'));
  wrap.append(h('div', { style: 'height:14px' }), h('button', { class: 'btn primary block', onclick: async (e) => {
    e.target.disabled = true;
    try { choice.notes = notes.value; await rpc('save_portrait', { p: S.pid, choice, refs }); toast('已儲存。'); showInvitation(g, choice); }
    catch (err) { toast(errText(err)); }
    e.target.disabled = false;
  } }, '儲存並產生邀請卡'));
  shell('home', wrap);
}

function showInvitation(g, choice) {
  const c = document.createElement('canvas'); c.width = 1080; c.height = 1350;
  const x = c.getContext('2d');
  x.fillStyle = '#0b0d10'; x.fillRect(0, 0, 1080, 1350);
  x.strokeStyle = '#f2b84b'; x.lineWidth = 3; x.strokeRect(60, 60, 960, 1230);
  x.fillStyle = '#f2b84b'; x.font = '500 34px "IBM Plex Mono", monospace'; x.fillText('PROJECT 030 · INVITATION ' + g.invitation_no, 110, 150);
  x.fillStyle = '#e8eef2'; x.font = '700 76px "Noto Sans TC", sans-serif'; x.fillText('影像校正邀請函', 110, 280);
  x.font = '400 34px "Noto Sans TC", sans-serif'; x.fillStyle = '#9aa8b4';
  x.fillText('一場專業形象照拍攝，依照你的選擇進行。', 110, 350);
  let y = 470;
  for (const [k, label] of Object.entries(PORTRAIT_LABEL)) {
    const v = (PORTRAIT_MAP[k] && PORTRAIT_MAP[k].options[choice[k]] ? PORTRAIT_MAP[k].options[choice[k]].real : choice[k]) || '—';
    x.fillStyle = '#6fe3d2'; x.font = '500 30px "IBM Plex Mono", monospace'; x.fillText(label, 110, y);
    x.fillStyle = '#e8eef2'; x.font = '500 48px "Noto Sans TC", sans-serif'; x.fillText(v.slice(0, 18), 110, y + 66);
    y += 170;
  }
  x.fillStyle = '#5a6672'; x.font = '400 26px "IBM Plex Mono", monospace'; x.fillText('影像中的你，由你定義。', 110, 1230);
  const url = c.toDataURL('image/png');
  modal(h('div', {}, h('img', { class: 'invite', src: url }),
    h('div', { class: 'row', style: 'margin-top:10px' },
      h('a', { class: 'btn', href: url, download: `invitation-${g.invitation_no}.png` }, '儲存圖片'),
      navigator.share ? h('button', { class: 'btn primary spacer', onclick: async () => {
        try { const blob = await (await fetch(url)).blob(); await navigator.share({ files: [new File([blob], 'invitation.png', { type: 'image/png' })], title: '影像校正邀請函' }); } catch (_) {}
      } }, '分享') : null)));
}

// ── 終章：第030號檔案室 ──
async function finale() {
  let A;
  try { A = await rpc('finale_archive', { p: S.pid }); } catch (e) { toast(errText(e)); location.hash = '#/'; return; }
  const wrap = h('div', { class: 'fade-in' });
  wrap.append(h('div', { class: 'kicker' }, 'FILE 030'), h('h1', {}, '第030號檔案室'));
  const body = h('div');
  wrap.append(body);
  shell('home', wrap);
  const prog = A.progress || {};

  // 1. 回放十天
  body.append(h('h2', {}, '歸檔紀錄'));
  for (const d of A.days) {
    const el = h('div', { class: 'archive-day' + (d.status === 'COMPLETED' ? '' : ' void') });
    el.append(h('div', { class: 'mono', style: 'font-size:12px' }, `${d.code}・${d.title}${d.route_title ? '｜' + d.route_title : ''}`));
    if (d.status !== 'COMPLETED') el.append(h('div', {}, d.missed_at ? '［缺席］這一區在你抵達前關上了。' : '［未完成］'));
    d.symbols.forEach((s) => el.append(h('span', { style: 'display:inline-block;width:28px;color:' + (s.data.echo ? '#7d8e9c' : '#f2b84b'), html: glyphSVG(s.data.symbol) })));
    for (const e of d.evidence) {
      if (e.kind === 'text') el.append(h('p', { style: 'margin:4px 0' }, '「' + e.text + '」'));
      if (e.kind === 'photo') { const img = h('img', { style: 'width:100%;max-width:280px;border-radius:8px;display:block;margin:6px 0' }); signedUrl(e.path).then((u) => u && (img.src = u)); el.append(img); }
      if (e.kind === 'audio') { const a = h('audio', { controls: true, style: 'width:100%' }); signedUrl(e.path).then((u) => u && (a.src = u)); el.append(a); }
      if (e.kind === 'choice') el.append(h('div', { class: 'dim', style: 'font-size:13px' }, '選擇：' + e.payload.option));
    }
    body.append(el);
  }
  // 2. 樣本最終形態
  const cv = h('canvas');
  body.append(h('h2', {}, '樣本 030・最終形態'), h('div', { class: 'incubator' }, cv), h('p', { class: 'mono', style: 'text-align:center;color:var(--accent)' }, T(A.sample.form)));
  requestAnimationFrame(() => S.cleanup.push(mountSample(cv, A.sample)));
  // 3. 反轉
  const mono = h('div');
  body.append(h('h2', {}, '系統報告'), mono);
  const go = h('button', { class: 'btn primary block' }, prog.defined_at ? '重新閱讀' : '讀取系統報告');
  body.append(go);
  const after = h('div');
  body.append(after);
  go.onclick = async () => {
    go.remove();
    for (const line of A.monologue.map(T)) {
      const p = h('p', { class: 'mono-line typing' }); mono.append(p);
      for (const ch of line) { p.textContent += ch; await new Promise((r) => setTimeout(r, 38)); }
      p.classList.remove('typing'); await new Promise((r) => setTimeout(r, 650));
      p.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    defineStep(after, prog);
  };
  if (prog.defined_at) defineStep(after, prog);
}

function defineStep(box, prog) {
  box.innerHTML = '';
  const ta = h('textarea', { placeholder: '一句話、幾個詞，或什麼都不寫。' }, prog.definition || '');
  const msg = h('div', { class: 'msg' });
  const done = async (skipped, btn) => {
    btn.disabled = true;
    try {
      const r = await rpc('submit_definition', { p: S.pid, definition: ta.value, skipped });
      box.innerHTML = '';
      for (const l of r.lines) { box.append(h('div', { class: 'final-line fade-in' }, l)); await new Promise((res) => setTimeout(res, 1600)); }
      await planetFinale(box);
      hunt(box);
    } catch (e) { msg.className = 'msg bad'; msg.textContent = errText(e); btn.disabled = false; }
  };
  box.append(h('div', { class: 'card glow' }, h('div', { class: 'kicker' }, 'FIELD: DEFINITION'), h('p', {}, '請描述現在的你。'), ta,
    h('div', { class: 'row', style: 'margin-top:8px' },
      h('button', { class: 'btn ghost', onclick: (e) => done(true, e.target) }, '暫時沒有答案'),
      h('button', { class: 'btn primary spacer', onclick: (e) => done(false, e.target) }, '寫入')), msg));
}

async function planetFinale(box) {
  const states = layerStates(S.state.levels);
  const stage = h('div', { class: 'planet-stage fade-in' });
  const cv = h('canvas', { style: 'width:100%;height:100%;display:block' });
  const cap = h('div', { class: 'ps-cap' }, '星球 030・十層結構');
  stage.append(cv, cap);
  box.append(stage);
  stage.scrollIntoView({ behavior: 'smooth', block: 'center' });
  let stop = mountPlanet(cv, states, { size: stage.clientWidth });
  await new Promise((r) => setTimeout(r, 3500));
  let photo = null;
  try { photo = await rpc('finale_photo', { p: S.pid }); } catch (_) {}
  if (!photo) { cap.textContent = '檔案 030：持續更新中'; return; }
  cap.textContent = '正在重新定義……';
  sfx('sink');
  stop(); stop = null;
  const ok = await morphToPhoto(cv, photo);
  sfx('complete');
  cap.textContent = ok ? '檔案 030：這就是你。' : '檔案 030：持續更新中';
  await new Promise((r) => setTimeout(r, 2500));
}

async function hunt(box) {
  const H = await rpc('finale_hunt', { p: S.pid });
  const sec = h('div', { class: 'fade-in' });
  sec.append(h('h2', {}, '現實座標'));
  for (const s of H.steps) {
    const card = h('div', { class: 'card' + (s.done ? '' : ' glow') }, h('div', { class: 'kicker' }, `座標 ${s.index + 1} / ${H.total}`), h('b', {}, s.title || ''),
      h('p', { style: 'white-space:pre-wrap' }, s.clue || ''), s.location_hint ? h('p', { class: 'dim' }, s.location_hint) : null);
    if (!s.done) {
      const inp = h('input', { type: 'text', placeholder: s.needs_code ? '在現場找到的密碼' : '' });
      const m = h('div', { class: 'msg' });
      if (s.needs_code) card.append(inp);
      card.append(h('div', { style: 'height:8px' }), h('button', { class: 'btn primary block', onclick: async (e) => {
        e.target.disabled = true;
        try { const r = await rpc('submit_hunt', { p: S.pid, idx: s.index, code: inp.value }); if (!r.correct) { m.className = 'msg bad'; m.textContent = r.message; e.target.disabled = false; return; } box.querySelector('.fade-in:last-child')?.remove(); hunt(box); }
        catch (err) { m.className = 'msg bad'; m.textContent = errText(err); e.target.disabled = false; }
      } }, s.needs_code ? '確認' : '我已抵達'), m);
    }
    sec.append(card);
  }
  if (H.done && (H.final_title || H.final_body)) sec.append(h('div', { class: 'card glow' }, h('div', { class: 'final-line' }, H.final_title || ''), h('p', { style: 'white-space:pre-wrap' }, H.final_body || '')));
  box.append(sec);
}

boot();
