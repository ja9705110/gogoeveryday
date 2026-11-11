// PROJECT 030 · 管理後台（所有權限檢查在伺服器端：RLS + assert_admin）
import { sb, rpc, errText, session, passwordLogin, accountToEmail, signOut, signedUrl, removeFile, isConfigured } from './api.js';
import { h } from './steps.js';
import { mountBackground } from './bg.js';
import { portraitFromChoices } from './portrait-map.js';
import { makeZip } from './zip.js';

const app = document.getElementById('app');
const A = { tab: 'overview', ov: null };
const toast = (m) => { const t = h('div', { class: 'toast fade-in' }, m); document.body.append(t); setTimeout(() => t.remove(), 2800); };
const fmt = (iso) => iso ? new Date(iso).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', hour12: false }) : '—';
const toLocalInput = (d) => { const t = new Date(new Date(d).getTime() + 8 * 3600000); return t.toISOString().slice(0, 16); };
const fromLocalInput = (v) => v ? new Date(v + ':00+08:00').toISOString() : null;
const STATUS_SHORT = { LOCKED: '·', AVAILABLE: '○', IN_PROGRESS: '◐', COMPLETED: '●', MISSED: '×', ALTERNATE: '◇' };

async function boot() {
  mountBackground();
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

const TABS = [['overview', '總覽'], ['settings', '壽星設定'], ['levels', '關卡內容'], ['review', '佐證審核'], ['files', '照片下載'], ['evo', '進化事件'], ['events', '特殊事件'], ['photos', '每日照片與留言'], ['finale', '終章尋寶'], ['test', '測試模式'], ['print', 'AR 卡片'], ['backup', '備份']];
async function render() {
  app.innerHTML = '';
  app.append(h('div', { class: 'topbar' }, h('span', { class: 'brand' }, 'PROJECT 030 · CONTROL'),
    h('div', { class: 'row' }, h('a', { class: 'btn sm', href: 'index.html' }, '玩家端'), h('button', { class: 'btn sm ghost', onclick: async () => { await signOut(); location.reload(); } }, '登出'))));
  const tabs = h('div', { class: 'admin-tabs' });
  TABS.forEach(([k, l]) => tabs.append(h('button', { class: 'btn sm' + (A.tab === k ? ' primary' : ''), onclick: () => { A.tab = k; render(); } }, l)));
  app.append(tabs);
  const body = h('div', {}, h('div', { class: 'loading' }, '載入中…'));
  app.append(body);
  try { await ({ overview, settings, levels, review, files, evo, events, photos, finale, test, print, backup })[A.tab](body); }
  catch (e) { body.innerHTML = ''; body.append(h('div', { class: 'card msg bad' }, errText(e))); }
}

// ── 照片下載：列出玩家上傳的所有檔案（照片、分格原圖、錄音），可單張下載或整包 ZIP ──
async function downloadOne(path, name) {
  const { data, error } = await sb.storage.from('evidence').createSignedUrl(path, 600, { download: name || true });
  if (error) { toast(errText(error)); return; }
  const a = document.createElement('a'); a.href = data.signedUrl; a.rel = 'noopener'; document.body.append(a); a.click(); setTimeout(() => a.remove(), 5000);
}
async function walkFiles(prefix, depth = 0) {
  const { data, error } = await sb.storage.from('evidence').list(prefix, { limit: 1000, sortBy: { column: 'name', order: 'asc' } });
  if (error) throw error;
  const out = [];
  for (const f of data || []) {
    if (f.name.startsWith('.')) continue;
    if (f.id === null) { if (depth < 4) out.push(...await walkFiles(`${prefix}/${f.name}`, depth + 1)); }
    else out.push({ path: `${prefix}/${f.name}`, size: f.metadata?.size || 0, mime: f.metadata?.mimetype || '', at: f.created_at });
  }
  return out;
}
const SUB_LABEL = (sub) => !sub ? '提交的檔案' : sub.startsWith('set-') ? `${sub.slice(4)}・分格原圖` : sub.startsWith('mosaic') ? '集結之手・分格原圖' : sub;
async function files(body) {
  const ov = await rpc('admin_overview');
  const profs = [...ov.profiles].sort((a, b) => a.is_test - b.is_test);
  body.innerHTML = '';
  if (!profs.length) { body.append(h('p', { class: 'dim' }, '還沒有任何檔案。')); return; }
  const pid = A.filesPid && profs.some((p) => p.id === A.filesPid) ? A.filesPid : profs[0].id;
  const kind = A.filesKind || 'all';
  const sel = h('select', { onchange: (e) => { A.filesPid = e.target.value; render(); } },
    ...profs.map((p) => h('option', { value: p.id, selected: p.id === pid ? 'selected' : null }, p.is_test ? '［測試］' + (p.label || p.id) : `${ov.settings.player_name || '壽星'}（正式檔案）`)));
  const ksel = h('select', { onchange: (e) => { A.filesKind = e.target.value; render(); } },
    ...[['all', '照片＋錄音'], ['image', '只有照片'], ['audio', '只有錄音']].map(([v, l]) => h('option', { value: v, selected: v === kind ? 'selected' : null }, l)));
  const zipBtn = h('button', { class: 'btn primary', disabled: '' }, '⬇ 全部打包下載（.zip）');
  const prog = h('div', { class: 'dim mono', style: 'font-size:12px;margin-top:6px' });
  body.append(h('div', { class: 'card' }, h('h2', {}, '照片下載'),
    h('p', { class: 'dim', style: 'font-size:13px' }, '壽星在遊戲中上傳的所有檔案：每一區提交的照片與錄音、分格拍攝的原圖（例如五隻貓、集結之手）。可以單張下載，或整包下載成 ZIP。'),
    h('div', { class: 'grid2' }, sel, ksel), h('div', { style: 'height:8px' }), zipBtn, prog));
  const listBox = h('div', {}, h('div', { class: 'loading' }, '讀取檔案中…'));
  body.append(listBox);
  const prof = profs.find((p) => p.id === pid);
  let all = await walkFiles(pid);
  const isImg = (f) => f.mime.startsWith('image/') || /\.(jpe?g|png|webp|heic)$/i.test(f.path);
  const isAud = (f) => f.mime.startsWith('audio/') || /\.(webm|m4a|mp3|wav|ogg|aac)$/i.test(f.path);
  all = all.filter((f) => kind === 'all' ? isImg(f) || isAud(f) : kind === 'image' ? isImg(f) : isAud(f));
  listBox.innerHTML = '';
  if (!all.length) { listBox.append(h('p', { class: 'dim' }, '這個檔案還沒有上傳任何照片或錄音。')); return; }
  const totalMB = all.reduce((a, f) => a + f.size, 0) / 1048576;
  prog.textContent = `共 ${all.length} 個檔案・約 ${totalMB.toFixed(1)} MB`;
  zipBtn.disabled = false;
  const nice = (f) => { const [, day, ...rest] = f.path.split('/'); const sub = rest.length > 1 ? rest[0] : ''; return { day: Number(day), sub, base: rest[rest.length - 1] }; };
  const { data: urls } = await sb.storage.from('evidence').createSignedUrls(all.filter(isImg).map((f) => f.path), 3600);
  const urlOf = new Map((urls || []).map((u) => [u.path, u.signedUrl]));
  const groups = new Map();
  for (const f of all) { const n = nice(f); const k = `${String(n.day).padStart(2, '0')}|${n.sub}`; if (!groups.has(k)) groups.set(k, []); groups.get(k).push({ ...f, ...n }); }
  for (const [k, items] of [...groups.entries()].sort()) {
    const [day, sub] = k.split('|');
    const grid = h('div', { class: 'dl-grid' });
    for (const f of items) {
      const name = `zone${day}_${sub ? sub + '_' : ''}${f.base}`;
      const media = isImg(f) ? h('img', { src: urlOf.get(f.path) || '', alt: '', loading: 'lazy' }) : h('div', { class: 'dl-aud' }, '🎧', h('small', {}, f.base.split('.').pop().toUpperCase()));
      grid.append(h('button', { class: 'dl-item', title: '下載 ' + name, onclick: () => downloadOne(f.path, name) }, media,
        h('span', { class: 'dl-cap' }, fmt(f.at).replace(/:\d\d$/, '')), h('span', { class: 'dl-btn' }, '⬇')));
    }
    listBox.append(h('div', { class: 'card' }, h('div', { class: 'row' }, h('b', {}, `第 ${day} 區・${SUB_LABEL(sub)}`), h('span', { class: 'spacer' }), h('span', { class: 'dim mono', style: 'font-size:12px' }, `${items.length} 個`)), grid));
  }
  zipBtn.onclick = async () => {
    zipBtn.disabled = true;
    try {
      const out = [];
      for (const [i, f] of all.entries()) {
        prog.textContent = `打包中 ${i + 1} / ${all.length}…`;
        const { data, error } = await sb.storage.from('evidence').download(f.path);
        if (error) throw error;
        const n = nice(f);
        out.push({ name: `第${String(n.day).padStart(2, '0')}區/${n.sub ? SUB_LABEL(n.sub) + '/' : ''}${n.base}`, data: new Uint8Array(await data.arrayBuffer()), date: f.at ? new Date(f.at) : new Date() });
      }
      const zip = makeZip(out);
      const a = document.createElement('a'); a.href = URL.createObjectURL(zip);
      a.download = `PROJECT030_${prof.is_test ? 'test' : 'player'}_${new Date().toISOString().slice(0, 10)}.zip`; // 外層檔名用英數，所有瀏覽器都能正確存檔
      document.body.append(a); a.click(); setTimeout(() => { a.remove(); URL.revokeObjectURL(a.href); }, 60000);
      prog.textContent = `完成：${out.length} 個檔案已打包下載。`;
    } catch (e) { prog.textContent = '打包失敗：' + errText(e); }
    zipBtn.disabled = false;
  };
}

// ── 第二階段進化事件：參考作品管理＋結果 ──
const EVO_CAT = { env: '進化環境', form: '形態' };
async function evoPrepare(file) { // 縮圖＋自動取主色
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, 1400 / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
  const g = c.getContext('2d'); g.drawImage(bmp, 0, 0, c.width, c.height);
  const s = document.createElement('canvas'); s.width = s.height = 24; const sg = s.getContext('2d'); sg.drawImage(c, 0, 0, 24, 24);
  const px = sg.getImageData(0, 0, 24, 24).data; let r = 0, gg = 0, b = 0, w = 0;
  for (let i = 0; i < px.length; i += 4) { const mx = Math.max(px[i], px[i + 1], px[i + 2]), mn = Math.min(px[i], px[i + 1], px[i + 2]); const wt = 1 + (mx - mn) / 32; r += px[i] * wt; gg += px[i + 1] * wt; b += px[i + 2] * wt; w += wt; }
  const hex = '#' + [r, gg, b].map((v) => Math.round(v / w).toString(16).padStart(2, '0')).join('');
  return { image: c.toDataURL('image/jpeg', 0.85), tint: hex };
}
const evoLabel = (cat, n) => cat === 'env' ? `環境 E-${String(n).padStart(2, '0')}` : `形態 ${n <= 26 ? String.fromCharCode(64 + n) : 'Z' + (n - 26)}`;
const safeName = (s) => String(s || 'work').replace(/[^\w.-]+/g, '_').slice(0, 40);
const saveDataUrl = (url, name) => { const a = document.createElement('a'); a.href = url; a.download = name; document.body.append(a); a.click(); setTimeout(() => a.remove(), 3000); };
async function evo(body) {
  const [{ data: works, error }, { data: cfgRows }, results] = await Promise.all([
    sb.from('evo_works').select('*').order('category').order('sort').order('created_at'),
    sb.from('evo_config').select('*').eq('id', 1),
    rpc('admin_evo_results')]);
  if (error) throw error;
  const cfg = (cfgRows || [])[0] || { open_day: 3, force_open: false };
  const ov = await rpc('admin_overview');
  body.innerHTML = '';
  const env = works.filter((w) => w.category === 'env' && w.active), form = works.filter((w) => w.category === 'form' && w.active);
  const openDate = new Date(new Date(ov.settings.birthday + 'T00:00:00+08:00').getTime() + (cfg.open_day - 11) * 86400000);
  const warn = [];
  if (form.length < 3) warn.push(`形態至少需要 3 張（目前 ${form.length} 張），進化才會開放。`);
  else if (form.length < 6) warn.push(`形態目前 ${form.length} 張：會直接進入最終首選／備選，沒有三輪比較。建議 9 張（三輪、每輪 3 選 1）。`);
  if (env.length < 2) warn.push(`進化環境目前 ${env.length} 張：少於 2 張會跳過第一階段。建議 4 張。`);
  // 狀態與開放設定
  const force = h('input', { type: 'checkbox', checked: cfg.force_open ? 'checked' : null, onchange: async (e) => {
    const { error: er } = await sb.from('evo_config').update({ force_open: e.target.checked, updated_at: new Date().toISOString() }).eq('id', 1);
    toast(er ? errText(er) : e.target.checked ? '已立即開放給所有檔案' : '已改回依日期開放'); } });
  body.append(h('div', { class: 'card' }, h('h2', {}, '第二階段進化事件'),
    h('p', { class: 'dim', style: 'font-size:13px' }, `開放：第 ${cfg.open_day} 天（${openDate.toLocaleDateString('zh-TW', { timeZone: 'Asia/Taipei' })}）完成當天任務後；若當天沒完成，隔天也會自動開放。玩家只會看到「形態 A」「環境 E-01」等代碼與圖片，看不到作品代碼、名稱、連結與備註。`),
    h('div', { class: 'grid2' }, h('div', {}, h('div', { class: 'dim', style: 'font-size:12px' }, '進化環境（啟用中）'), h('div', { class: 'mono', style: 'font-size:20px' }, `${env.length} 張`)),
      h('div', {}, h('div', { class: 'dim', style: 'font-size:12px' }, '形態（啟用中）'), h('div', { class: 'mono', style: 'font-size:20px' }, `${form.length} 張`))),
    ...warn.map((w) => h('div', { class: 'clue', style: 'border-color:var(--warn);font-size:13px' }, w)),
    h('label', { class: 'row', style: 'gap:8px;margin-top:8px' }, force, h('span', {}, '立即開放（不等第 3 天完成；測試或補救用）'))));
  // 上傳
  const cat = h('select', {}, h('option', { value: 'form' }, '形態（第二階段主要選擇）'), h('option', { value: 'env' }, '進化環境（第一階段兩兩比較）'));
  const files = h('input', { type: 'file', accept: 'image/*', multiple: true });
  const upMsg = h('div', { class: 'dim', style: 'font-size:12px' });
  body.append(h('div', { class: 'card' }, h('h2', {}, '上傳參考作品'),
    h('p', { class: 'dim', style: 'font-size:13px' }, '可以一次選多張。上傳後會自動編成「形態 A、B、C…」或「環境 E-01…」，並以檔名當作作品代碼；之後可在下面逐張修改作品代碼、名稱、原始連結與備註。請上傳實際作品照片，並先裁掉照片上的商標或浮水印。'),
    h('div', { class: 'grid2' }, cat, files),
    h('button', { class: 'btn primary', style: 'margin-top:8px', onclick: async (e) => {
      const list = [...files.files]; if (!list.length) { toast('請先選擇圖片'); return; }
      e.target.disabled = true;
      const c = cat.value; let n = works.filter((w) => w.category === c).length;
      let sort = Math.max(0, ...works.filter((w) => w.category === c).map((w) => w.sort || 0));
      try {
        for (const [i, f] of list.entries()) {
          upMsg.textContent = `處理中 ${i + 1} / ${list.length}…`;
          const { image, tint } = await evoPrepare(f);
          n++; sort++;
          const { error: er } = await sb.from('evo_works').insert({ category: c, game_label: evoLabel(c, n), work_code: f.name.replace(/\.[^.]+$/, ''), image, tint, sort });
          if (er) throw er;
        }
        toast(`已上傳 ${list.length} 張`); render();
      } catch (er) { upMsg.textContent = '上傳失敗：' + errText(er); e.target.disabled = false; }
    } }, '上傳'), upMsg));
  // 作品列表
  for (const c of ['form', 'env']) {
    const rows = works.filter((w) => w.category === c);
    const box = h('div', { class: 'card' }, h('h2', {}, `${EVO_CAT[c]}・${rows.length} 張`));
    if (!rows.length) box.append(h('p', { class: 'dim' }, '尚未上傳。'));
    for (const w of rows) {
      const f = {};
      const inp = (k, ph, type = 'text') => (f[k] = h('input', { type, placeholder: ph, value: w[k] ?? '' }));
      const act = h('input', { type: 'checkbox', checked: w.active ? 'checked' : null });
      box.append(h('div', { class: 'evo-adm' + (w.active ? '' : ' off') },
        h('img', { src: w.image, alt: '', onclick: () => saveDataUrl(w.image, `${safeName(w.work_code || w.game_label)}.jpg`), title: '點擊下載原圖' }),
        h('div', { class: 'evo-adm-f' },
          h('div', { class: 'grid2' }, h('label', { class: 'field' }, h('span', {}, '玩家看到的代碼'), inp('game_label', '形態 A')), h('label', { class: 'field' }, h('span', {}, '作品代碼'), inp('work_code', '例如作品集編號'))),
          h('label', { class: 'field' }, h('span', {}, '作品名稱／說明'), inp('title', '例如：自然光窗邊、雜誌感…')),
          h('label', { class: 'field' }, h('span', {}, '原始作品連結'), inp('source_url', 'https://…')),
          h('label', { class: 'field' }, h('span', {}, '備註（只有管理者看得到）'), inp('note', '')),
          h('div', { class: 'row wrap', style: 'gap:8px;align-items:center' }, h('span', { class: 'dim', style: 'font-size:12px' }, '主色'), inp('tint', '', 'color'), h('span', { class: 'dim', style: 'font-size:12px' }, '排序'), (() => { const x = inp('sort', '', 'number'); x.style.width = '70px'; return x; })(),
            h('label', { class: 'row', style: 'gap:4px' }, act, h('span', { style: 'font-size:12px' }, '啟用')), h('span', { class: 'spacer' }),
            h('button', { class: 'btn sm primary', onclick: async () => {
              const patch = { game_label: f.game_label.value.trim() || w.game_label, work_code: f.work_code.value.trim() || null, title: f.title.value.trim() || null,
                source_url: f.source_url.value.trim() || null, note: f.note.value.trim() || null, tint: f.tint.value, sort: Number(f.sort.value) || 0, active: act.checked, updated_at: new Date().toISOString() };
              const { error: er } = await sb.from('evo_works').update(patch).eq('id', w.id); toast(er ? errText(er) : '已儲存');
            } }, '儲存'),
            h('button', { class: 'btn sm ghost', onclick: async () => {
              if (!confirm(`刪除 ${w.game_label}？`)) return;
              const { error: er } = await sb.from('evo_works').delete().eq('id', w.id);
              if (er) { await sb.from('evo_works').update({ active: false }).eq('id', w.id); toast('這張已經被選過，改為停用（保留結果）。'); }
              render();
            } }, '刪除')))));
    }
    body.append(box);
  }
  // 結果
  const res = h('div', { class: 'card' }, h('h2', {}, '進化結果'));
  const pname = ov.settings.player_name || '壽星';
  if (!results.length) res.append(h('p', { class: 'dim' }, '尚無資料。'));
  for (const r of results) {
    const who = r.is_test ? `［測試］${r.label || ''}` : `${pname}（正式檔案）`;
    const st = { done: '已完成', active: `進行中（${r.phase}）`, ready: '已開放、尚未開始', locked: '尚未開放' }[r.status] || r.status;
    const sec = h('div', { class: 'evo-res' + (r.is_test ? ' test' : '') }, h('div', { class: 'row wrap' }, h('b', {}, who), h('span', { class: 'spacer' }), h('span', { class: `status-pill` }, st)));
    if (r.status === 'done' || r.status === 'active') {
      const idc = Object.fromEntries(Object.entries(r.identity || r.sample_choices || {}).map(([k, v]) => ['choice:' + k, v]));
      const pr = portraitFromChoices(idc);
      sec.append(h('div', { class: 'dim', style: 'font-size:12px' }, `開始 ${fmt(r.started_at)}${r.completed_at ? '・完成 ' + fmt(r.completed_at) : ''}${r.code ? '・識別碼 ' + r.code : ''}`),
        h('div', { style: 'margin:6px 0' }, h('b', { style: 'font-size:13px' }, '初始身分（第 1 天，已保留）'),
          Object.keys(pr).length ? h('table', { class: 't' }, ...Object.values(pr).map((x) => h('tr', {}, h('th', {}, x.label), h('td', {}, x.real), h('td', { class: 'faint' }, `遊戲中：${x.game}`)))) : h('div', { class: 'dim', style: 'font-size:12px' }, '（第 1 天身分建檔尚未完成）')));
      const pickCard = (title, w, tag) => !w ? null : h('div', { class: 'evo-pick' },
        h('div', { class: 'kicker' }, title), h('img', { src: w.image || '', alt: '' }),
        h('div', {}, h('b', {}, w.work_code || '（未填作品代碼）'), ` ・ 玩家看到：${w.game_label}`), w.title ? h('div', { style: 'font-size:13px' }, w.title) : null,
        w.source_url ? h('a', { href: w.source_url, target: '_blank', rel: 'noopener', style: 'font-size:12px;word-break:break-all' }, w.source_url) : null,
        w.note ? h('div', { class: 'dim', style: 'font-size:12px' }, '備註：' + w.note) : null,
        w.image ? h('button', { class: 'btn sm', onclick: () => saveDataUrl(w.image, `${tag}_${safeName(w.work_code || w.game_label)}.jpg`) }, '⬇ 下載照片') : null);
      sec.append(h('div', { class: 'evo-picks' }, pickCard('第一偏好（首選）', r.first, 'first'), pickCard('第二偏好（備選）', r.second, 'second'), pickCard('進化環境偏好', r.env, 'env')));
      if (r.status === 'done') {
        const txt = [`PROJECT 030 偏好結果（${who}）`, r.first && `首選：${r.first.work_code || ''} ${r.first.title || ''} ${r.first.source_url || ''}`.trim(),
          r.second && `備選：${r.second.work_code || ''} ${r.second.title || ''} ${r.second.source_url || ''}`.trim(),
          r.env && `環境偏好：${r.env.work_code || ''} ${r.env.title || ''} ${r.env.source_url || ''}`.trim(),
          ...Object.values(pr).map((x) => `${x.label}：${x.real}`)].filter(Boolean).join('\n');
        sec.append(h('button', { class: 'btn sm', onclick: async () => { try { await navigator.clipboard.writeText(txt); toast('已複製，可以直接貼給廠商'); } catch (_) { prompt('複製這段文字：', txt); } } }, '複製結果文字'));
      }
      const t = h('table', { class: 't', style: 'font-size:12px' }, h('tr', {}, ...['#', '階段', '出現的作品', '選擇'].map((x) => h('th', {}, x))));
      const PH = { env: '環境', form: '形態分化', final1: '首選', final2: '備選', redo_final: '重新選擇' };
      (r.log || []).forEach((e, i) => t.append(h('tr', {}, h('td', {}, String(i + 1)), h('td', {}, `${PH[e.phase] || e.phase}${e.round && e.phase !== 'final1' && e.phase !== 'final2' ? ' ' + e.round : ''}`),
        h('td', {}, (e.options_info || []).map((o) => `${o.game_label}（${o.work_code || '—'}）`).join('、')),
        h('td', {}, e.pick_info ? `${e.pick_info.game_label}（${e.pick_info.work_code || '—'}）` : '—'))));
      sec.append(h('details', {}, h('summary', { style: 'font-size:13px' }, `所有視覺比較紀錄（${(r.log || []).length} 筆）`), t));
    }
    res.append(sec);
  }
  body.append(res);
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
  for (const p of ov.profiles.filter((x) => !x.is_test)) {
    const pr = portraitFromChoices(p.stats.choices || {});
    if (!Object.keys(pr).length) continue;
    body.append(h('div', { class: 'card', style: 'border-color:rgba(255,181,71,.5)' }, h('h2', {}, `形象照方向・${ov.settings.player_name || '壽星'}`),
      h('p', { class: 'dim', style: 'font-size:12px' }, '壽星在第 1 天「身分建檔」中選的（他以為是在設定遊戲角色）。可直接拿去跟照相館溝通。'),
      h('table', { class: 't' }, ...Object.values(pr).map((x) => h('tr', {}, h('th', {}, x.label), h('td', {}, x.real), h('td', { class: 'faint' }, `遊戲中：${x.game}`))))));
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
  const { data: st, error } = await sb.from('settings').select('*').eq('id', 1).single();
  if (error) throw error;
  body.innerHTML = '';
  const name = h('input', { type: 'text', value: st.player_name || '', placeholder: '壽星的名字' });
  const bd = h('input', { type: 'date', value: st.birthday });
  const info = h('div', { class: 'dim', style: 'font-size:13px;margin-top:8px' });
  const paint = () => {
    if (!bd.value) { info.textContent = ''; return; }
    const [y, m, dd] = bd.value.split('-').map(Number);
    const d = new Date(Date.UTC(y, m - 1, dd));
    const start = new Date(d.getTime() - 10 * 86400000);
    const mmdd = bd.value.slice(5, 7) + bd.value.slice(8, 10);
    info.innerHTML = `遊戲開始：<b>${start.getUTCMonth() + 1}/${start.getUTCDate()}</b>　·　生日終章：<b>${d.getUTCMonth() + 1}/${d.getUTCDate()}</b><br>壽星登入：在遊戲首頁輸入 <b style="color:var(--accent2);font-size:18px">${mmdd}</b>（也是他的觀察員編號）`;
  };
  bd.oninput = paint; paint();
  const msg = h('div', { class: 'msg' });
  body.append(h('div', { class: 'card', style: 'max-width:520px' }, h('h2', {}, '壽星'),
    h('label', { class: 'field' }, h('span', {}, '名字'), name),
    h('label', { class: 'field' }, h('span', {}, '生日'), bd),
    info,
    h('div', { style: 'height:12px' }),
    h('button', { class: 'btn primary block', onclick: async (e) => {
      e.target.disabled = true; msg.className = 'msg'; msg.textContent = '儲存中…';
      try { const r = await rpc('admin_set_player', { p_name: name.value, p_birthday: bd.value }); msg.className = 'msg good'; msg.textContent = `已儲存。壽星輸入 ${r.login_code} 即可登入。`; }
      catch (err) { msg.className = 'msg bad'; msg.textContent = errText(err); }
      e.target.disabled = false;
    } }, '儲存'), msg,
    h('p', { class: 'faint', style: 'font-size:12px' }, '遊戲開始後再修改生日，已經開放或錯過的區域會依新日期重新計算；已錯過的紀錄不會恢復。')));
  // 管理者密碼
  const pw1 = h('input', { type: 'password', placeholder: '新密碼（至少 6 個字）', autocomplete: 'new-password' });
  const pw2 = h('input', { type: 'password', placeholder: '再輸入一次', autocomplete: 'new-password' });
  const pmsg = h('div', { class: 'msg' });
  body.append(h('div', { class: 'card', style: 'max-width:520px' }, h('h2', {}, '管理者密碼'),
    h('p', { class: 'dim', style: 'font-size:13px' }, `目前登入：${A.me?.email || ''}。修改後，下次在「管理者登入」改用新密碼。`),
    pw1, h('div', { style: 'height:8px' }), pw2, h('div', { style: 'height:10px' }),
    h('button', { class: 'btn block', onclick: async (e) => {
      pmsg.className = 'msg bad';
      if (pw1.value.length < 6) { pmsg.textContent = '密碼至少需要 6 個字。'; return; }
      if (pw1.value !== pw2.value) { pmsg.textContent = '兩次輸入的密碼不一樣。'; return; }
      e.target.disabled = true; pmsg.className = 'msg'; pmsg.textContent = '更新中…';
      try {
        const { error } = await sb.auth.updateUser({ password: pw1.value });
        if (error) throw error;
        pw1.value = pw2.value = ''; pmsg.className = 'msg good'; pmsg.textContent = '密碼已更新。';
      } catch (err) {
        pmsg.className = 'msg bad';
        pmsg.textContent = /same|different from the old/i.test(err.message || '') ? '新密碼不能和舊密碼一樣。'
          : /reauth|nonce|recent/i.test(err.message || '') ? '為了安全，請先登出再登入一次，然後馬上修改密碼。' : errText(err);
      }
      e.target.disabled = false;
    } }, '更新密碼'), pmsg));
  const rmsg = h('div', { class: 'msg' });
  body.append(h('div', { class: 'card', style: 'max-width:520px;border-color:rgba(255,79,109,.4)' }, h('h2', {}, '重置壽星進度'),
    h('p', { class: 'dim', style: 'font-size:13px' }, '清除壽星的所有遊戲進度（關卡、符號、樣本、照片紀錄、星球），下次登入會從前導影片重新開始。名字、生日和登入方式不變。'),
    h('button', { class: 'btn warn block', onclick: async () => {
      if (!confirm('確定要清除壽星的所有遊戲進度？這個動作無法復原。')) return;
      try { const n = await rpc('admin_reset_player'); rmsg.className = 'msg good'; rmsg.textContent = n ? '已重置。壽星下次打開就會重新開始。' : '目前沒有可重置的進度。'; }
      catch (err) { rmsg.className = 'msg bad'; rmsg.textContent = errText(err); }
    } }, '重置壽星進度'), rmsg));
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
        e.payload && e.payload.gate ? h('span', { class: 'status-pill', style: 'color:var(--accent2)' }, '關卡門檻：通過才算破關') : null,
        h('span', { class: `status-pill s-${e.status}` }, e.status), h('span', { class: 'mono dim', style: 'font-size:11px' }, fmt(e.submitted_at) + (e.on_time ? '' : '（替代路線）'))),
      media, e.storage_path ? h('div', { style: 'margin-top:6px' }, h('button', { class: 'btn sm ghost', onclick: () => downloadOne(e.storage_path, `zone${String(e.day).padStart(2, '0')}_${e.step_id}_${e.storage_path.split('/').pop()}`) }, '⬇ 下載檔案')) : null,
      h('div', { style: 'height:6px' }), note,
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

// ── 每關過關照片 ──
async function shrinkToDataUrl(file, max = 1000) {
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.85);
}
async function photos(body) {
  const [{ data: rows, error }, { data: lv }, { data: fc }] = await Promise.all([sb.from('reward_photos').select('*'), sb.from('levels').select('day,title').order('day'), sb.from('finale_config').select('final_title,final_body').eq('id', 1)]);
  if (error) throw error;
  body.innerHTML = '';
  body.append(h('p', { class: 'dim' }, '每天一段話（可以再加一張照片）。壽星完成當天全部三關、回收碎片後，照片會在回顧中「從碎片裡浮現」，這段話會在回顧的最後出現，標題是「給你的一段話」。當天沒完成前，玩家端拿不到。已經完成的日子之後才補上或修改，壽星的首頁會出現「封存的訊息」，可以重播那一天的回顧。'));
  const grid = h('div', { class: 'msg-list' });
  for (const l of (lv || []).filter((x) => x.day <= 10).sort((a, b) => a.day - b.day)) {
    const cur = (rows || []).filter((r) => r.day === l.day).sort((a, b) => a.stage - b.stage)[0];
    let photo = cur?.photo || null;
    const prev = h('div', { class: 'ph-prev' });
    const paintPrev = () => { prev.innerHTML = ''; prev.append(photo ? h('img', { src: photo }) : h('span', { class: 'faint', style: 'font-size:12px' }, '沒有照片（可不放）')); };
    paintPrev();
    const ta = h('textarea', { rows: 5, placeholder: '想在這一天完成後對他說的話……' }); ta.value = cur?.caption || '';
    const count = h('span', { class: 'faint mono', style: 'font-size:11px' });
    const upd = () => { count.textContent = `${ta.value.length} 字`; }; ta.oninput = upd; upd();
    const fin = h('input', { type: 'file', accept: 'image/*', class: 'hidden' });
    const m = h('div', { class: 'msg', style: 'font-size:12px' });
    const save = async () => {
      m.className = 'msg'; m.textContent = '儲存中…';
      try {
        await sb.from('reward_photos').delete().eq('day', l.day).neq('stage', 1);
        if (!photo && !ta.value.trim()) { const { error: e } = await sb.from('reward_photos').delete().eq('day', l.day); if (e) throw e; m.className = 'msg good'; m.textContent = '已清空'; return; }
        const { error: e } = await sb.from('reward_photos').upsert({ day: l.day, stage: 1, photo, caption: ta.value.trim(), updated_at: new Date().toISOString() });
        if (e) throw e;
        m.className = 'msg good'; m.textContent = '已儲存';
      } catch (e) { m.className = 'msg bad'; m.textContent = errText(e); }
    };
    fin.onchange = async () => { const f = fin.files[0]; if (!f) return; m.textContent = '處理照片中…'; try { photo = await shrinkToDataUrl(f); paintPrev(); await save(); } catch (e) { m.className = 'msg bad'; m.textContent = errText(e); } };
    grid.append(h('div', { class: 'card msg-day' },
      h('div', { class: 'row wrap', style: 'align-items:center;gap:8px' }, h('span', { class: 'mono', style: 'font-size:11px;color:var(--accent2)' }, `FRAGMENT ${String(l.day).padStart(2, '0')}`), h('b', {}, `第 ${l.day} 天・${l.title}`),
        h('span', { class: 'spacer' }), h('span', { class: 'status-pill' }, [ta.value.trim() ? '有留言' : '', photo ? '有照片' : ''].filter(Boolean).join('＋') || '未設定')),
      h('div', { class: 'msg-row' }, prev, h('div', { style: 'flex:1;min-width:0' }, ta, h('div', { class: 'row', style: 'justify-content:space-between' }, count, m))),
      fin,
      h('div', { class: 'row wrap', style: 'gap:6px;margin-top:6px' },
        h('button', { class: 'btn sm primary', onclick: save }, '儲存'),
        h('button', { class: 'btn sm', onclick: () => fin.click() }, photo ? '更換照片' : '加照片'),
        photo ? h('button', { class: 'btn sm ghost', onclick: async () => { if (!confirm('移除這張照片？（留言會保留）')) return; photo = null; paintPrev(); await save(); } }, '移除照片') : null)));
  }
  // 第 11 天：終章（尋寶完成後的最終訊息）
  const f0 = (fc || [])[0] || {};
  const ft = h('input', { type: 'text', placeholder: '最後一句標題，例如：檔案狀態：持續更新中', value: f0.final_title || '' });
  const fb = h('textarea', { rows: 6, placeholder: '生日當天，找到最後的禮物之後，想對他說的話……' }); fb.value = f0.final_body || '';
  const fm = h('div', { class: 'msg', style: 'font-size:12px' });
  grid.append(h('div', { class: 'card msg-day', style: 'border-color:rgba(255,181,71,.5)' },
    h('div', { class: 'row wrap', style: 'align-items:center;gap:8px' }, h('span', { class: 'mono', style: 'font-size:11px;color:var(--accent2)' }, 'FILE 030'), h('b', {}, '第 11 天・終章（11/18）')),
    h('p', { class: 'dim', style: 'font-size:12px;margin:4px 0' }, '在終章現實尋寶全部完成後顯示。這裡和「終章尋寶」分頁的最終訊息是同一段。'),
    ft, h('div', { style: 'height:6px' }), fb,
    h('div', { class: 'row', style: 'gap:6px;margin-top:6px' }, h('button', { class: 'btn sm primary', onclick: async () => {
      const { error: e } = await sb.from('finale_config').update({ final_title: ft.value, final_body: fb.value, updated_at: new Date().toISOString() }).eq('id', 1);
      fm.className = e ? 'msg bad' : 'msg good'; fm.textContent = e ? errText(e) : '已儲存';
    } }, '儲存'), fm)));
  body.append(grid);
}

// ── 終章尋寶 ──
async function finale(body) {
  const { data, error } = await sb.from('finale_config').select('*').eq('id', 1).single();
  if (error) throw error;
  body.innerHTML = '';
  // 最終照片：星球在終章會化為這張照片（只存在資料庫，生日當天才會送到玩家端）
  const prev = h('img', { style: 'max-width:220px;max-height:280px;display:' + (data.photo ? 'block' : 'none') + ';margin:8px 0;border:1px solid var(--line)' });
  if (data.photo) prev.src = data.photo;
  const pin = h('input', { type: 'file', accept: 'image/*', class: 'hidden' });
  const pmsg = h('div', { class: 'msg' });
  pin.onchange = async () => {
    const f = pin.files[0]; if (!f) return;
    pmsg.className = 'msg'; pmsg.textContent = '處理中…';
    try {
      const bmp = await createImageBitmap(f);
      const k = Math.min(1, 900 / Math.max(bmp.width, bmp.height));
      const c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
      c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
      const url = c.toDataURL('image/jpeg', 0.85);
      const { error: e } = await sb.from('finale_config').update({ photo: url, updated_at: new Date().toISOString() }).eq('id', 1);
      if (e) throw e;
      prev.src = url; prev.style.display = 'block'; pmsg.className = 'msg good'; pmsg.textContent = `已儲存（${Math.round(url.length / 1024)} KB）。生日當天之前，玩家端無法取得這張照片。`;
    } catch (e) { pmsg.className = 'msg bad'; pmsg.textContent = errText(e); }
  };
  body.append(h('div', { class: 'card' }, h('h2', {}, '最終照片'),
    h('p', { class: 'dim', style: 'font-size:13px' }, '終章時，重建完成的星球會化為光點，重新聚合成這張照片。建議直式、臉部清楚的照片。'),
    prev, pin, h('div', { class: 'row wrap' },
      h('button', { class: 'btn primary', onclick: () => pin.click() }, data.photo ? '更換照片' : '上傳照片'),
      data.photo ? h('button', { class: 'btn ghost', onclick: async () => { if (!confirm('移除照片？')) return; await sb.from('finale_config').update({ photo: null }).eq('id', 1); render(); } }, '移除') : null),
    pmsg));
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
  body.append(h('p', { class: 'dim' }, '管理者帳號沒有正式玩家檔案，只負責管理與測試；用管理者帳號登入遊戲頁時，一律進入測試檔案。測試檔案屬於你的管理者帳號，使用獨立的模擬時間，只產生站內訊息、不推播，也不會讀寫正式玩家的任何資料（伺服器端強制）。'));
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
      h('div', { class: 'row wrap', style: 'margin:8px 0;gap:6px;align-items:center' }, h('b', { style: 'font-size:13px' }, '選區測試：'),
        ...Array.from({ length: 11 }, (_, i) => h('a', { class: 'btn sm', href: `index.html?profile=${p.id}&jump=${i + 1}`, target: '_blank',
          onclick: (e) => { if (!confirm(`從${i === 10 ? '生日終章' : '第 ' + (i + 1) + ' 區'}開始測試？這份測試檔案的進度會清空，前面各區自動完成。`)) e.preventDefault(); } }, i === 10 ? '終章' : String(i + 1)))),
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
    h('ul', {}, h('li', {}, '卡片 A：第 5 區「保險箱」（目標索引 0）'), h('li', {}, '卡片 B：第 7 區「門」（目標索引 1）')),
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
