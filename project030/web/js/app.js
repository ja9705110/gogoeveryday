// PROJECT 030 · 玩家端
import { sb, rpc, errText, session, sendCode, verifyCode, signOut, upload, signedUrl, isConfigured, vapidKey } from './api.js';
import { renderScene } from './scene.js';
import { mountSample, ACTION_LABEL, ACTION_DESC, PARAM_LABEL } from './sample.js';
import { renderWidget, renderClue, renderRevealed, h } from './steps.js';
import { glyphSVG, NAMES } from './glyphs.js';
import { startAR } from './ar.js';
import { playPrologue } from './prologue.js';

const app = document.getElementById('app');
const S = { boot: null, pid: null, state: null, skew: 0, cleanup: [] };
const STATUS = { LOCKED: '未開放', AVAILABLE: '可進入', IN_PROGRESS: '進行中', COMPLETED: '已歸檔', MISSED: '已錯過', ALTERNATE: '替代路線' };
const EVENT_TEXT = {
  STARTED: '進入區域', COMPLETED: '區域歸檔', MISSED: '區域關閉（錯過）', OBSERVE: '觀測樣本', EVIDENCE: '提交紀錄', CHOICE: '做出選擇',
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
async function boot() {
  if (!isConfigured()) {
    app.innerHTML = '<div class="card" style="margin-top:40px"><div class="kicker">PROJECT 030</div><h1>系統尚未設定</h1><p class="dim">管理者需要在部署設定中填入 Supabase 專案資訊（請見 project030/README.md）。</p></div>';
    return;
  }
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
  window.addEventListener('hashchange', route);
  route().then(() => {
    const k = 'p030.prologue.' + S.pid;
    if (!localStorage.getItem(k) && S.state) {
      playPrologue({ startDate: S.state.start_date, onDone: () => { localStorage.setItem(k, '1'); if (!location.hash || location.hash === '#/') route(); } });
    }
  });
}

function renderLogin() {
  app.innerHTML = '';
  const email = h('input', { type: 'email', placeholder: 'you@example.com', autocomplete: 'email' });
  const code = h('input', { type: 'text', inputmode: 'numeric', placeholder: '6 位數驗證碼', autocomplete: 'one-time-code' });
  const msg = h('div', { class: 'msg' });
  const step2 = h('div', { class: 'hidden' }, h('label', { class: 'field' }, h('span', {}, '驗證碼'), code),
    h('button', { class: 'btn primary block', onclick: async (e) => {
      e.target.disabled = true; msg.textContent = '驗證中…';
      try { await verifyCode(email.value.trim(), code.value); location.reload(); }
      catch (err) { msg.className = 'msg bad'; msg.textContent = errText(err); e.target.disabled = false; }
    } }, '接入'));
  app.append(h('div', { style: 'margin-top:12vh' },
    h('div', { class: 'kicker' }, 'PROJECT 030'),
    h('h1', {}, '觀測者驗證'),
    h('p', { class: 'dim' }, '你收到了一份邀請。請以受邀的電子郵件接入。'),
    h('div', { class: 'card' },
      h('label', { class: 'field' }, h('span', {}, '電子郵件'), email),
      h('button', { class: 'btn block', onclick: async (e) => {
        if (!email.value.includes('@')) { msg.textContent = '請輸入電子郵件。'; return; }
        e.target.disabled = true; msg.className = 'msg'; msg.textContent = '傳送中…';
        try { await sendCode(email.value.trim()); msg.className = 'msg good'; msg.textContent = '驗證碼已寄出。也可以直接點信中的連結。'; step2.classList.remove('hidden'); }
        catch (err) { msg.className = 'msg bad'; msg.textContent = errText(err); }
        e.target.disabled = false;
      } }, '寄送驗證碼'),
      step2, msg)));
}
function renderNotInvited() {
  app.innerHTML = '';
  app.append(h('div', { class: 'card', style: 'margin-top:20vh' }, h('div', { class: 'kicker' }, 'ACCESS DENIED'),
    h('h1', {}, '這個信箱不在觀測名單上'), h('p', { class: 'dim' }, S.boot.email),
    h('button', { class: 'btn', onclick: async () => { await signOut(); location.reload(); } }, '換一個信箱')));
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
function shell(active, content) {
  cleanup();
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
    h('div', { class: 'row' }, clock, h('a', { href: '#/settings', 'aria-label': '設定', style: 'color:var(--dim);margin-left:10px', html: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/></svg>' }))));
  if (st?.is_test) app.append(h('div', { class: 'banner' }, `測試模式・模擬時間 ${fmtTime(st.server_now, { year: 'numeric' })}・不影響正式玩家`));
  app.append(content);
  const tabs = h('nav', { class: 'tabbar' });
  [['home', '#/', '終端'], ['lab', '#/lab', '培養艙'], ['items', '#/items', '物品'], ['log', '#/log', '紀錄'], ['inbox', '#/inbox', '訊息']].forEach(([k, href, label]) => {
    const a = h('a', { href, class: active === k ? 'on' : '', html: ICONS[k] + label });
    if (k === 'inbox' && st?.unread) a.append(h('span', { class: 'badge' }, String(st.unread)));
    tabs.append(a);
  });
  app.append(tabs);
}

async function loadState() {
  const t0 = Date.now();
  S.state = await rpc('get_state', { p: S.pid });
  S.skew = new Date(S.state.server_now).getTime() - (t0 + Date.now()) / 2;
  return S.state;
}

async function route() {
  const hash = location.hash.replace(/^#/, '') || '/';
  app.innerHTML = '<div class="loading">連線中…</div>';
  try {
    await loadState();
    const [, page, arg] = hash.split('/');
    if (!page) return home();
    if (page === 'zone') return zone(Number(arg));
    if (page === 'lab') return lab();
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
    { ok: st.observed_today, text: '在「培養艙」觀測樣本一次' },
  ];
  if (alts.length) list.push({ ok: false, text: `（可選）替代路線：${alts.map((a) => '第 ' + a.day + ' 區').join('、')}` });
  if (st.portrait && !st.portrait.saved) list.push({ ok: false, text: '（可選）打開「影像校正邀請函」' });
  if (t.status === 'AVAILABLE') return { goal: `進入${zoneLabel(t)}`, desc: '今天 23:59:59 前完成。區域關閉後，不會以原本的樣子回來。', href: `#/zone/${d}`, cta: '進入區域', list };
  if (t.status === 'IN_PROGRESS') return { goal: `繼續${zoneLabel(t)}`, desc: '你上次停在這裡。進度已保存在伺服器上。', href: `#/zone/${d}`, cta: '繼續', list };
  if (!st.observed_today) return { goal: '觀測樣本 030', desc: '今天還沒有觀測。選擇一種方式，它會記住。', href: '#/lab', cta: '前往培養艙', list };
  if (alts.length) return { goal: `走替代路線：${zoneLabel(alts[0])}`, desc: '原本的區域已經關閉，但還有另一條路。', href: `#/zone/${alts[0].day}`, cta: '前往', list };
  if (st.portrait && !st.portrait.saved) return { goal: '打開影像校正邀請函', desc: '鏡面系統在等你的回覆。', href: '#/gift', cta: '查看邀請函', list };
  return { goal: '今天的任務已完成', desc: d < 10 ? '下一個區域將在午夜 00:00 開啟。' : '明天，第030號檔案室將會開啟。', href: '#/lab', cta: '看看樣本', list };
}

function showManual() {
  modal(h('div', { class: 'manual' },
    h('div', { class: 'kicker' }, 'OBSERVER MANUAL'), h('h2', { style: 'color:var(--text);margin-top:4px' }, '觀測手冊'),
    h('ol', {},
      h('li', {}, '每天 00:00 會開啟一個新的「區域」，當天 23:59:59 關閉。首頁上方的「下一步」會告訴你現在該做什麼。'),
      h('li', {}, '進入區域後，閱讀畫面上的訊息與線索，操作機關（開關、密碼鎖、旋鈕……）。卡住時可以按「請求提示」。'),
      h('li', {}, '場景畫面裡偶爾閃一下的光點可以點，可能藏著東西。'),
      h('li', {}, '有些區域會要你拍照、錄音、寫一句話，或用相機掃描藏在你現實世界裡的卡片。'),
      h('li', {}, '每天到「培養艙」觀測樣本 030 一次。觀測方式由你決定，它會依你的選擇長成不同的樣子。'),
      h('li', {}, '取得的符號放在「物品」，每個符號都有一個頻率數字，之後會再用到。'),
      h('li', {}, '錯過的區域會永久改變，但會開啟另一條替代路線。故事不會因此結束。'),
      h('li', {}, '到右上角「設定」開啟通知，系統會在新區域開啟、即將關閉時提醒你。')),
    h('button', { class: 'btn block', onclick: () => { document.querySelector('.modal')?.remove(); playPrologue({ startDate: S.state.start_date }); } }, '▶ 重播前導影片')));
}

// ── 終端（首頁） ──
function home() {
  const st = S.state;
  const wrap = h('div', { class: 'fade-in' });
  const d = st.game_day;
  const before = d < 1;
  wrap.append(h('div', { class: 'kicker' }, before ? 'STANDBY' : d <= 10 ? `DAY ${String(d).padStart(2, '0')} / 10` : 'FILE 030'),
    h('h1', {}, before ? '等待訊號' : d <= 10 ? '觀測進行中' : '第030號檔案室'));
  const ob = nextObjective(st);
  wrap.append(h('div', { class: 'objective fade-in' },
    h('div', { class: 'row' }, h('span', { class: 'kicker' }, '下一步'), h('span', { class: 'spacer' }), h('button', { class: 'btn ghost sm', onclick: showManual }, '觀測手冊')),
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
}

// ── 區域 ──
async function zone(day) {
  let L;
  try { L = await rpc('open_level', { p: S.pid, d: day }); } catch (e) { toast(errText(e)); location.hash = '#/'; return; }
  const wrap = h('div', { class: 'fade-in' });
  const isMissed = L.status === 'MISSED';
  wrap.append(h('div', { class: 'kicker' }, `${L.code} · ${L.subtitle || ''}`),
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
  wrap.append(renderScene(L.scene, L.found, async (spot, btn) => {
    try {
      const r = await rpc('explore', { p: S.pid, d: day, spot: spot.id });
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
  if (!localStorage.getItem(seenKey)) { await typeLines(intro, L.intro); localStorage.setItem(seenKey, '1'); }
  else (L.intro || []).forEach((t) => intro.append(h('p', {}, t)));
  drawSteps(L, stepsBox);
}

function drawSteps(L, box) {
  box.innerHTML = '';
  let activeShown = false;
  for (const s of L.steps) {
    const done = s.done;
    if (!done && activeShown && !s.optional) break;
    const el = h('div', { class: 'step ' + (done ? 'done' : 'active') });
    el.append(h('div', { class: 'st-title' }, s.title || (s.type === 'story' ? '' : s.type)));
    if (s.speaker) el.append(h('div', { class: 'speaker' }, s.speaker));
    if (s.text) el.append(h('div', { class: 'lines' }, ...[].concat(s.text).map((t) => h('p', {}, t))));
    if (s.injected) el.append(injected(s.injected));
    if (s.options && done && s.type === 'choice') el.append(h('div', { class: 'dim', style: 'font-size:13px' }, '已選擇。'));
    if (!done) {
      (s.clue || []).forEach((c) => el.append(renderClue(c)));
      if (s.prompt) el.append(h('div', { class: 'prompt' }, s.prompt));
      if (s.window) el.append(h('div', { class: 'dim mono', style: 'font-size:12px' }, `僅限 ${s.window.from}–${s.window.to.slice(0, 5)}`));
      const msg = h('div', { class: 'msg' });
      const ctx = makeCtx(L, s, el, msg, box);
      el.append(renderWidget(s, ctx));
      if (s.type !== 'story' && s.type !== 'evidence') el.append(hintBox(L, s));
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
    async send(answer, btn, opts = {}) {
      if (btn) btn.disabled = true;
      msg.className = 'msg'; msg.textContent = '…';
      try {
        const r = await rpc('submit_step', { p: S.pid, d: L.day, step_id: s.id, answer });
        if (r.correct) {
          msg.className = 'msg good'; msg.textContent = r.success_text || '……';
          await afterSuccess(L, r);
          return r;
        }
        msg.className = r.started ? 'msg' : 'msg bad'; msg.textContent = r.message || '沒有反應。';
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
    const c = r.completion || {};
    const gained = (c.gained || []).filter((g) => g.kind !== 'lost');
    modal(h('div', {},
      h('div', { class: 'kicker' }, c.outcome === 'ALTERNATE' ? 'ARCHIVED · ALTERNATE' : 'ARCHIVED'),
      h('div', { class: 'lines' }, ...(c.epilogue || []).map((t) => h('p', {}, t))),
      ...gained.map((g) => h('div', { class: 'row card' },
        g.kind === 'symbol' ? h('div', { style: 'width:48px;color:' + (g.echo ? '#7d8e9c' : '#f2b84b'), html: glyphSVG(g.symbol) }) : null,
        h('div', {}, h('div', {}, g.kind === 'gift' ? '影像校正邀請函' : (g.echo ? '殘響・' : '') + (g.name || g.key)),
          g.kind === 'symbol' ? h('div', { class: 'dim mono', style: 'font-size:12px' }, '頻率 ' + g.digit) : null))),
      h('a', { class: 'btn primary block', href: '#/', onclick: () => document.querySelector('.modal')?.remove() }, '返回終端')), { onClose: route });
  } else {
    route();
  }
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
      msg.className = 'msg good'; msg.textContent = '已提交，等待比對。';
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
  wrap.append(h('div', { class: 'kicker' }, 'SAMPLE 030'), h('h1', {}, sm.form));
  const inc = h('div', { class: 'incubator' }); const cv = h('canvas');
  inc.append(cv); wrap.append(inc);
  const params = h('div', { class: 'params' });
  for (const [k, v] of Object.entries(sm.params)) {
    params.append(h('div', { class: 'param' }, h('span', {}, PARAM_LABEL[k]), h('div', { class: 'bar' }, h('i', { style: `width:${Math.min(100, v)}%` })), h('span', {}, String(Math.round(v)))));
  }
  wrap.append(params);
  wrap.append(h('div', { class: 'grid2' },
    h('div', { class: 'card', style: 'margin:0' }, h('div', { class: 'dim', style: 'font-size:12px' }, '累積觀測'), h('div', { class: 'mono', style: 'font-size:22px' }, `${sm.total} 天`)),
    h('div', { class: 'card', style: 'margin:0' }, h('div', { class: 'dim', style: 'font-size:12px' }, '連續觀測／中斷'), h('div', { class: 'mono', style: 'font-size:22px' }, `${sm.streak} ／ ${sm.breaks}`))));
  const hist = h('div', { class: 'history' });
  for (let d = 1; d <= Math.min(Math.max(st.game_day, 1), 11); d++) {
    const o = sm.history.find((x) => x.day === d);
    hist.append(h('span', { class: o ? '' : 'gap', title: o ? ACTION_LABEL[o.action] : '未觀測' }, o ? ACTION_LABEL[o.action][0] : '·'));
  }
  wrap.append(h('h2', {}, '觀測歷程'), hist);
  if (st.game_day >= 1 && st.game_day <= 11) {
    if (st.observed_today) wrap.append(h('div', { class: 'card' }, h('div', { class: 'dim' }, '今天的觀測已記錄。樣本需要時間反應。')));
    else {
      const acts = h('div', { class: 'obs-actions' });
      for (const a of ['explore', 'preserve', 'adjust', 'rest']) {
        acts.append(h('button', { class: 'btn', onclick: async (e) => {
          acts.querySelectorAll('button').forEach((b) => (b.disabled = true));
          try { await rpc('observe', { p: S.pid, action: a }); toast('觀測已記錄。'); route(); }
          catch (err) { toast(errText(err)); acts.querySelectorAll('button').forEach((b) => (b.disabled = false)); }
        } }, h('div', {}, h('b', {}, ACTION_LABEL[a]), h('small', {}, ACTION_DESC[a]))));
      }
      wrap.append(h('h2', {}, '今天的觀測方式'), acts);
    }
  }
  if (sm.dormant > 0) wrap.append(h('p', { class: 'dim', style: 'font-size:13px' }, `樣本已有 ${sm.dormant} 天沒有被觀測。它沒有停止生長，只是長往別的方向。`));
  shell('lab', wrap);
  requestAnimationFrame(() => S.cleanup.push(mountSample(cv, sm)));
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
  others.forEach((i) => wrap.append(h('div', { class: 'card' }, h('div', {}, i.name), i.description ? h('div', { class: 'dim', style: 'font-size:13px' }, i.description) : null,
    h('div', { class: 'faint mono', style: 'font-size:11px' }, `第 ${i.source_day || '?'} 區・${fmtTime(i.acquired_at)}`))));
  shell('items', wrap);
}

// ── 紀錄 ──
function log() {
  const st = S.state;
  const wrap = h('div', { class: 'fade-in' });
  wrap.append(h('div', { class: 'kicker' }, 'LOG'), h('h1', {}, '觀測紀錄'));
  wrap.append(h('div', { class: 'grid2' },
    stat('完成（準時）', st.stats.ontime), stat('完成（全部）', st.stats.completed),
    stat('錯過的區域', st.stats.missed), stat('發現的隱藏物', st.stats.exploration)));
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
  wrap.append(h('button', { class: 'btn block', onclick: () => playPrologue({ startDate: S.state.start_date }) }, '▶ 重播前導影片'), h('div', { style: 'height:8px' }));
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
const PORTRAIT_OPTIONS = {
  style: ['自然紀實', '雜誌時尚', '黑白經典', '電影感', '極簡商務', '藝術概念'],
  outfit: ['正式西裝／套裝', '俐落襯衫', '日常休閒', '個人風格穿搭', '還沒想好'],
  mood: ['自信', '溫柔', '安靜', '玩心', '堅定', '神祕'],
  scene: ['攝影棚純色背景', '城市街景', '自然戶外', '室內生活感', '工作場景'],
};
const PORTRAIT_LABEL = { style: '攝影風格', outfit: '服裝方向', mood: '拍攝氛圍', scene: '拍攝場景' };
async function gift() {
  const g = await rpc('get_portrait', { p: S.pid });
  const wrap = h('div', { class: 'fade-in' });
  wrap.append(h('div', { class: 'kicker', style: 'color:var(--accent2)' }, 'INVITATION'), h('h1', {}, '影像校正邀請函'));
  if (!g) { wrap.append(h('p', { class: 'dim' }, '邀請函尚未送達。')); return shell('home', wrap); }
  wrap.append(h('p', { class: 'dim' }, '鏡面系統需要一份真正的影像。由你決定，影像中的你應該是什麼樣子。'),
    h('p', { class: 'mono', style: 'font-size:12px;color:var(--accent2)' }, `邀請編號 ${g.invitation_no}・送達途徑 ${{ 'complete:4': '鏡廳', 'alternate:4': '碎鏡', admin: '守夜人轉交' }[g.unlocked_via] || g.unlocked_via}`));
  const choice = { ...(g.choice || {}) };
  for (const [k, opts] of Object.entries(PORTRAIT_OPTIONS)) {
    const chips = h('div', { class: 'chips' });
    const multi = k === 'mood';
    opts.forEach((o) => {
      const on = multi ? (choice[k] || []).includes(o) : choice[k] === o;
      const c = h('button', { class: 'chip' + (on ? ' on' : '') }, o);
      c.onclick = () => {
        if (multi) { const arr = new Set(choice[k] || []); arr.has(o) ? arr.delete(o) : arr.add(o); choice[k] = [...arr]; c.classList.toggle('on'); }
        else { choice[k] = o; chips.querySelectorAll('.chip').forEach((x) => x.classList.remove('on')); c.classList.add('on'); }
      };
      chips.append(c);
    });
    wrap.append(h('h2', {}, PORTRAIT_LABEL[k] + (multi ? '（可複選）' : '')), chips);
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
    const v = Array.isArray(choice[k]) ? choice[k].join('、') : choice[k] || '—';
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
  body.append(h('h2', {}, '樣本 030・最終形態'), h('div', { class: 'incubator' }, cv), h('p', { class: 'mono', style: 'text-align:center;color:var(--accent)' }, A.sample.form));
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
    for (const line of A.monologue) {
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
      hunt(box);
    } catch (e) { msg.className = 'msg bad'; msg.textContent = errText(e); btn.disabled = false; }
  };
  box.append(h('div', { class: 'card glow' }, h('div', { class: 'kicker' }, 'FIELD: DEFINITION'), h('p', {}, '請描述現在的你。'), ta,
    h('div', { class: 'row', style: 'margin-top:8px' },
      h('button', { class: 'btn ghost', onclick: (e) => done(true, e.target) }, '暫時沒有答案'),
      h('button', { class: 'btn primary spacer', onclick: (e) => done(false, e.target) }, '寫入')), msg));
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
