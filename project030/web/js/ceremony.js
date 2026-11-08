// 每日回顧儀式：片段浮上海面 → 當天的紀錄 → 符號 → 星球新層 → 結語
import { glyphSVG } from './glyphs.js';
import { signedUrl } from './api.js';
import { mountPlanet, layerStates, LAYERS } from './planet.js';
import { sfx } from './audio.js';

const EPILOGUE = {
  1: { main: ['電力恢復。培養艙開始運轉。', '你取得了第一個符號。它的用途尚未解鎖。'], alt: ['備用通道已關閉。', '符號留下來了——但不是原本那一個。'] },
  2: { main: ['頻率已鎖定。', '訊號源，原來一直在你的世界裡。'], alt: ['你沒有見到守夜人。', '但你知道他等過。'] },
  3: { main: ['保險箱已歸檔。', '照片背面那行字，你會在第 7 天想起來。'], alt: ['你得到的不是原本的東西。', '但形狀還在。'] },
  4: { main: ['鏡廳已歸檔。', '一封邀請函已送達「禮物」頁。'], alt: ['邀請函沒有消失。', '它只是換了一條路來找你。'] },
  5: { main: ['溫室已歸檔。', '有些東西，要在夜裡才會打開。'], alt: ['有兩株長出了新葉。', '和原本的不一樣。'] },
  6: { main: ['斷層已固定。', '修補過的地方，留下了痕跡。'], alt: ['你從另一個方向離開了斷層。'] },
  7: { main: ['門已歸檔。', '門後的門，在你的世界裡。'], alt: ['有些門只開一次。', '有些門會在別處再出現。'] },
  8: { main: ['岔路已歸檔。', '另一扇門並沒有消失。只是你沒有走進去。'], alt: ['選擇已被覆寫——或被保留。', '兩者都記錄在案。'] },
  9: { main: ['回放結束。', '你取得了第九個符號。它是空白的。'], alt: ['回放中斷。'] },
  10: { main: ['所有區域已歸檔。', '明天，第 030 號檔案室將會開啟。'], alt: ['環沒有完全閉合。', '也許它本來就不需要。'] },
};
const ACTION = { explore: '探索', preserve: '保存', adjust: '調整環境', rest: '靜置' };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const fmtT = (iso) => (iso ? new Date(iso).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }) : '');

export function ceremonyKey(pid, day) { return `p030.ceremony.${pid}.${day}`; }

export function playCeremony({ L, state, photos = [], onClose }) {
  const day = L.day;
  const alt = L.outcome === 'ALTERNATE';
  const layer = LAYERS.find((x) => x.day === day);
  const symbols = state.inventory.filter((i) => i.kind === 'symbol' && i.source_day === day);
  const items = state.inventory.filter((i) => i.kind === 'item' && i.source_day === day);
  const memories = [];
  for (const s of L.steps) {
    if (s.type === 'evidence') for (const e of (s.submissions || []).filter((x) => x.status !== 'REPLACED')) memories.push({ ...e, title: s.title });
    if (s.type === 'choice' && s.done) {
      const v = state.stats.choices?.['choice:' + s.flag];
      const opt = (s.options || []).find((o) => o.id === v);
      if (opt) memories.push({ kind: 'choice', title: s.title, text: opt.label });
    }
  }
  const obs = state.sample.history.find((h) => h.day === day);
  const hints = L.steps.reduce((a, s) => a + (s.hints ? s.hints.length : 0), 0);
  const mins = L.started_at && L.completed_at ? Math.max(1, Math.round((new Date(L.completed_at) - new Date(L.started_at)) / 60000)) : null;

  const root = document.createElement('div');
  root.className = 'ceremony';
  root.innerHTML = `<canvas class="cer-bg"></canvas><div class="cer-body"></div>
    <button class="btn ghost sm cer-skip">略過</button>`;
  document.body.append(root);
  const body = root.querySelector('.cer-body');
  let alive = true, stopPlanet = null;
  const close = () => { if (!alive) return; alive = false; stopPlanet && stopPlanet(); root.classList.add('cer-out'); setTimeout(() => root.remove(), 600); onClose && onClose(); };
  root.querySelector('.cer-skip').onclick = () => { if (body.querySelector('.cer-end')) close(); else showAll(); };

  // 背景：海平面 + 浮起的光球
  const cv = root.querySelector('.cer-bg'), g = cv.getContext('2d');
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const W = innerWidth, H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
  const t0 = performance.now(), hz = H * 0.34;
  const bg = (now) => {
    if (!alive) return; requestAnimationFrame(bg);
    const t = (now - t0) / 1000;
    const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#01020a'); sky.addColorStop(0.34, '#06264a'); sky.addColorStop(1, '#00040c');
    g.fillStyle = sky; g.fillRect(0, 0, W, H);
    for (let j = 0; j < 6; j++) { g.strokeStyle = `rgba(63,244,255,${0.16 - j * 0.02})`; g.beginPath(); for (let x = 0; x <= W; x += 8) { const y = hz + j * j * 6 + Math.sin(x * 0.012 + t * 1.2 + j) * (2 + j); x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
    const oy = Math.max(hz - 60, H * 0.8 - t * 120) + Math.sin(t * 2) * 3;
    const col = alt ? '180,140,255' : '255,181,71';
    const gr = g.createRadialGradient(W / 2, oy, 0, W / 2, oy, 60); gr.addColorStop(0, `rgba(${col},.95)`); gr.addColorStop(0.3, `rgba(${col},.35)`); gr.addColorStop(1, `rgba(${col},0)`);
    g.fillStyle = gr; g.beginPath(); g.arc(W / 2, oy, 60, 0, 7); g.fill();
    if (oy <= hz - 59) for (let i = 0; i < 3; i++) { const p = ((t * 0.5 + i / 3) % 1); g.strokeStyle = `rgba(${col},${0.5 * (1 - p)})`; g.beginPath(); g.ellipse(W / 2, hz, p * 180, p * 40, 0, 0, 7); g.stroke(); }
  };
  requestAnimationFrame(bg);

  const add = (el) => { body.append(el); el.scrollIntoView({ behavior: 'smooth', block: 'end' }); return el; };
  const div = (cls, html) => { const d = document.createElement('div'); d.className = cls; if (html !== undefined) d.innerHTML = html; return d; };

  function memoryCard(m, i) {
    const c = div('cer-mem');
    c.style.setProperty('--tilt', `${(i % 2 ? 1 : -1) * (1 + (i % 3))}deg`);
    c.append(div('cer-mem-t', m.title || ''));
    if (m.kind === 'photo') { const img = document.createElement('img'); signedUrl(m.path).then((u) => u && (img.src = u)); c.classList.add('photo'); c.append(img); }
    else if (m.kind === 'audio') { const a = document.createElement('audio'); a.controls = true; a.preload = 'none'; signedUrl(m.path).then((u) => u && (a.src = u)); c.append(div('cer-wave', '<i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>'), a); }
    else if (m.kind === 'choice') c.append(div('cer-quote', `你選擇了：${m.text}`));
    else c.append(div('cer-quote', `「${m.text || ''}」`));
    if (m.submitted_at) c.append(div('cer-mem-d', fmtT(m.submitted_at)));
    return c;
  }

  function photoCard(ph, i) {
    const c = div('cer-mem photo');
    c.style.setProperty('--tilt', `${(i % 2 ? -1 : 1) * (1 + (i % 3))}deg`);
    c.append(div('cer-mem-t', `FRAGMENT ${String(day).padStart(2, '0')}`));
    const img = document.createElement('img'); img.src = ph.photo; c.append(img);
    if (ph.caption) c.append(div('cer-quote', ph.caption));
    return c;
  }

  let all = false;
  async function sequence() {
    sfx('ping');
    await wait(2200); if (!alive || all) return;
    add(div('cer-k', `FRAGMENT ${String(day).padStart(2, '0')} · RECOVERED`)); sfx('unlock');
    await wait(700); if (!alive || all) return;
    add(div('cer-title', `${L.title}${L.route_title ? `｜${L.route_title}` : ''}`));
    add(div('cer-meta', [alt ? '以替代路線歸檔' : '準時歸檔', fmtT(L.completed_at), mins ? `用時 ${mins} 分鐘` : '', hints ? `提示 ${hints} 次` : '無提示'].filter(Boolean).join('　·　')));
    await wait(1600); if (!alive || all) return;
    if (photos.length) {
      add(div('cer-h', '碎片裡封存的影像'));
      const pw = add(div('cer-mems cer-sealed'));
      for (const [i, ph] of photos.entries()) { if (!alive || all) return; pw.append(photoCard(ph, i)); sfx('complete'); await wait(2600); }
    }
    if (memories.length) {
      add(div('cer-h', '今日的紀錄'));
      const wrap = add(div('cer-mems'));
      for (const [i, m] of memories.entries()) { if (!alive || all) return; wrap.append(memoryCard(m, i)); sfx('type'); await wait(1100); }
    }
    if (obs) { add(div('cer-line', `樣本今日的觀察：${ACTION[obs.action] || obs.action}`)); await wait(900); }
    if (!alive || all) return;
    for (const s of symbols) {
      const c = add(div('cer-sym', `<div class="g" style="color:${s.data.echo ? '#b48cff' : '#ffb547'}">${glyphSVG(s.data.symbol)}</div><div><div class="n">取得符號：${s.name}</div><div class="d">頻率 ${s.digit}</div></div>`));
      sfx('find'); await wait(1400); if (!alive || all) return; void c;
    }
    for (const it of items) { add(div('cer-line', `取得物品：${it.name}`)); await wait(600); }
    if (layer) {
      const pc = div('cer-planet'); const pcv = document.createElement('canvas'); pcv.style.cssText = 'width:200px;height:200px;display:block;margin:0 auto';
      pc.append(pcv, div('cer-pl-t', `星球第 ${layer.day} 層結構已重建`), div('cer-pl-n', `${layer.name} · ${layer.en}${alt ? '（殘響）' : ''}`));
      add(pc); stopPlanet = mountPlanet(pcv, layerStates(state.levels), { highlight: day, size: 200 }); sfx('complete');
      await wait(3000); if (!alive || all) return;
    }
    for (const line of (EPILOGUE[day] || {})[alt ? 'alt' : 'main'] || []) { add(div('cer-epi', line)); await wait(1100); if (!alive || all) return; }
    end();
  }
  function end() {
    if (body.querySelector('.cer-end')) return;
    const e = div('cer-end');
    const b1 = document.createElement('button'); b1.className = 'btn primary block'; b1.textContent = '返回終端'; b1.onclick = close;
    e.append(div('dim', '這段回顧已收進「紀錄」→「每日回顧」，隨時可以重播。'), b1);
    add(e);
  }
  function showAll() { // 略過動畫：一次顯示全部
    all = true; body.innerHTML = '';
    body.append(div('cer-k', `FRAGMENT ${String(day).padStart(2, '0')} · RECOVERED`), div('cer-title', L.title), div('cer-meta', [alt ? '以替代路線歸檔' : '準時歸檔', fmtT(L.completed_at)].join('　·　')));
    if (photos.length) { body.append(div('cer-h', '碎片裡封存的影像')); const w = div('cer-mems cer-sealed'); photos.forEach((ph, i) => w.append(photoCard(ph, i))); body.append(w); }
    if (memories.length) { body.append(div('cer-h', '今日的紀錄')); const w = div('cer-mems'); memories.forEach((m, i) => w.append(memoryCard(m, i))); body.append(w); }

    symbols.forEach((s) => body.append(div('cer-sym', `<div class="g" style="color:${s.data.echo ? '#b48cff' : '#ffb547'}">${glyphSVG(s.data.symbol)}</div><div><div class="n">取得符號：${s.name}</div><div class="d">頻率 ${s.digit}</div></div>`)));
    if (layer) { const pc = div('cer-planet'); const pcv = document.createElement('canvas'); pcv.style.cssText = 'width:200px;height:200px;display:block;margin:0 auto'; pc.append(pcv, div('cer-pl-t', `星球第 ${layer.day} 層：${layer.name}`)); body.append(pc); stopPlanet && stopPlanet(); stopPlanet = mountPlanet(pcv, layerStates(state.levels), { size: 200 }); }
    ((EPILOGUE[day] || {})[alt ? 'alt' : 'main'] || []).forEach((l) => body.append(div('cer-epi', l)));
    end();
  }
  sequence();
}

// 每一關（stage）完成的小儀式；若管理者有上傳照片，接著展示照片
export function stageClear(n, total, title, photo) {
  const el = document.createElement('div');
  el.className = 'stage-clear' + (photo ? ' with-photo' : '');
  el.innerHTML = `<div class="sc-k">STAGE ${n}/${total}</div><div class="sc-t">CLEAR</div><div class="sc-n">${title || ''}</div>`;
  document.body.append(el);
  sfx('unlock');
  if (!photo) return new Promise((r) => setTimeout(() => { el.classList.add('out'); setTimeout(() => { el.remove(); r(); }, 400); }, 1700));
  return new Promise((r) => setTimeout(() => {
    const card = document.createElement('div'); card.className = 'sc-photo';
    const img = document.createElement('img'); img.src = photo.photo; card.append(img);
    if (photo.caption) { const c = document.createElement('div'); c.className = 'sc-cap'; c.textContent = photo.caption; card.append(c); }
    const b = document.createElement('button'); b.className = 'btn primary'; b.textContent = '繼續';
    b.onclick = () => { el.classList.add('out'); setTimeout(() => { el.remove(); r(); }, 400); };
    el.append(card, b); sfx('find');
  }, 1300));
}
