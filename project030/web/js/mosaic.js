// 集結之手：把一個形狀（♥1118♥）切成多格，每格請一個人把手放在發光的線上拍照，最後拼出形狀
import { sb, upload, signedUrl } from './api.js';
import { sfx } from './audio.js';

const TILE = 240; // 每格輸出像素

// 在畫布上畫出形狀：愛心 + 文字 + 愛心（線條要夠粗，手才放得上去）
function drawShape(g, W, H, cfg, color = '#fff') {
  const glyphs = [...(cfg.hearts ? ['♥'] : []), ...String(cfg.text || '1118'), ...(cfg.hearts ? ['♥'] : [])];
  const cw = W / glyphs.length;
  g.save();
  g.strokeStyle = color; g.fillStyle = color; g.lineCap = 'round'; g.lineJoin = 'round';
  const lw = Math.min(cw, H) * 0.16;
  glyphs.forEach((ch, i) => {
    const cx = cw * i + cw / 2, cy = H / 2, s = Math.min(cw, H) * 0.42;
    g.lineWidth = lw;
    if (ch === '♥') {
      g.beginPath();
      g.moveTo(cx, cy + s * 0.95);
      g.bezierCurveTo(cx - s * 1.25, cy + s * 0.1, cx - s * 0.75, cy - s * 0.95, cx, cy - s * 0.35);
      g.bezierCurveTo(cx + s * 0.75, cy - s * 0.95, cx + s * 1.25, cy + s * 0.1, cx, cy + s * 0.95);
      g.stroke();
    } else {
      g.font = `900 ${Math.min(H * 0.82, cw * 1.1)}px "Arial Black", "Helvetica Neue", sans-serif`;
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(ch, cx, cy + H * 0.03);
    }
  });
  g.restore();
}

function shapeCanvas(cfg) {
  const c = document.createElement('canvas');
  c.width = cfg.cols * TILE; c.height = cfg.rows * TILE;
  drawShape(c.getContext('2d'), c.width, c.height, cfg);
  return c;
}

// 取出某一格的形狀片段（透明背景、發光線條）
function tileGuide(shape, cfg, idx, size, color = 'rgba(63,244,255,.85)') {
  const c = document.createElement('canvas'); c.width = size; c.height = size;
  const g = c.getContext('2d');
  const col = idx % cfg.cols, row = Math.floor(idx / cfg.cols);
  g.drawImage(shape, col * TILE, row * TILE, TILE, TILE, 0, 0, size, size);
  g.globalCompositeOperation = 'source-in'; g.fillStyle = color; g.fillRect(0, 0, size, size);
  return c;
}

const loadImg = (src) => new Promise((res, rej) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => res(i); i.onerror = rej; i.src = src; });

export function mosaicWidget({ step, pid, day, onSubmit, toast }) {
  const cfg = { cols: 9, rows: 2, text: '1118', hearts: true, ...(step.mosaic || {}) };
  const n = cfg.cols * cfg.rows;
  const folder = `${pid}/${day}/mosaic`;
  const shape = shapeCanvas(cfg);
  const shots = new Array(n).fill(null); // { path, url }
  const box = document.createElement('div');
  box.className = 'mosaic';
  const grid = document.createElement('div'); grid.className = 'mz-grid'; grid.style.gridTemplateColumns = `repeat(${cfg.cols}, 1fr)`;
  const status = document.createElement('div'); status.className = 'dim'; status.style.cssText = 'font-size:13px;margin:6px 0';
  const doneBtn = document.createElement('button'); doneBtn.className = 'btn primary block'; doneBtn.textContent = '拼合影像'; doneBtn.disabled = true;
  box.append(grid, status, doneBtn);

  const cells = [];
  // 打亂顯示順序：單看格子拼不出形狀，拼合後才揭曉
  let seed = [...String(pid)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const order = [...Array(n).keys()];
  for (let k = n - 1; k > 0; k--) { const j = Math.floor(rnd() * (k + 1)); [order[k], order[j]] = [order[j], order[k]]; }
  const domCells = new Array(n);
  for (const i of order) {
    const cell = document.createElement('button'); cell.className = 'mz-cell';
    const guide = tileGuide(shape, cfg, i, 96); guide.className = 'mz-guide';
    const img = document.createElement('img'); img.className = 'mz-img';
    const num = document.createElement('span'); num.className = 'mz-n'; num.textContent = order.indexOf(i) + 1;
    cell.append(img, guide, num);
    cell.onclick = () => openCamera(i, order.indexOf(i) + 1);
    grid.append(cell); domCells[i] = { cell, img };
  }
  cells.push(...domCells);
  const paint = () => {
    let k = 0;
    shots.forEach((s, i) => { if (s) { k++; cells[i].img.src = s.url; cells[i].cell.classList.add('shot'); } });
    status.textContent = `已拍 ${k} / ${n} 格。點格子拍照（或重拍）。`;
    doneBtn.disabled = k < n;
  };

  // 讀回已上傳的格子（可分次完成）
  (async () => {
    try {
      const { data } = await sb.storage.from('evidence').list(folder, { limit: 200, sortBy: { column: 'name', order: 'desc' } });
      for (const f of data || []) {
        const m = f.name.match(/^(\d+)-/); if (!m) continue;
        const i = Number(m[1]); if (i >= n || shots[i]) continue;
        const path = `${folder}/${f.name}`; const url = await signedUrl(path);
        if (url) shots[i] = { path, url };
      }
    } catch (_) {}
    paint();
  })();

  async function saveShot(i, blob) {
    const path = `${folder}/${i}-${Date.now()}.jpg`;
    await upload('evidence', path, blob, 'image/jpeg');
    shots[i] = { path, url: URL.createObjectURL(blob) };
    sfx('ok'); paint();
  }

  function openCamera(i, label = i + 1) {
    const ov = document.createElement('div'); ov.className = 'mz-cam';
    ov.innerHTML = `<div class="mz-stage"><video playsinline muted autoplay></video><canvas class="mz-over"></canvas></div>
      <div class="mz-tip">第 ${label} 格：請一個人把<b>手</b>放在發光的線上，讓手蓋住線條。</div>
      <div class="mz-bar"><button class="btn ghost" data-a="x">取消</button><button class="btn primary mz-shoot" data-a="s">拍下</button><label class="btn" style="margin:0">選照片<input type="file" accept="image/*" capture="environment" hidden></label></div>`;
    document.body.append(ov);
    const video = ov.querySelector('video'), over = ov.querySelector('.mz-over'), stage = ov.querySelector('.mz-stage');
    let stream = null;
    const size = Math.min(innerWidth - 32, innerHeight * 0.62, 520);
    stage.style.width = stage.style.height = size + 'px';
    over.width = over.height = size;
    over.getContext('2d').drawImage(tileGuide(shape, cfg, i, size, 'rgba(63,244,255,.6)'), 0, 0);
    const close = () => { stream && stream.getTracks().forEach((t) => t.stop()); ov.remove(); };
    ov.querySelector('[data-a=x]').onclick = close;
    const finish = async (source, sw, sh) => {
      const c = document.createElement('canvas'); c.width = c.height = TILE * 2;
      const side = Math.min(sw, sh);
      c.getContext('2d').drawImage(source, (sw - side) / 2, (sh - side) / 2, side, side, 0, 0, c.width, c.height);
      const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.85));
      try { await saveShot(i, blob); close(); } catch (e) { toast('上傳失敗：' + (e.message || e)); }
    };
    ov.querySelector('[data-a=s]').onclick = () => { if (video.videoWidth) { sfx('tap'); finish(video, video.videoWidth, video.videoHeight); } };
    ov.querySelector('input[type=file]').onchange = async (e) => {
      const f = e.target.files[0]; if (!f) return;
      const bmp = await createImageBitmap(f); finish(bmp, bmp.width, bmp.height);
    };
    navigator.mediaDevices?.getUserMedia({ audio: false, video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 1280 } } })
      .then((s) => { stream = s; video.srcObject = s; video.play().catch(() => {}); })
      .catch(() => { ov.querySelector('.mz-shoot').style.display = 'none'; ov.querySelector('.mz-tip').innerHTML += '<br>無法開啟相機，請改用「選照片」。'; });
  }

  doneBtn.onclick = async () => {
    doneBtn.disabled = true; doneBtn.textContent = '拼合中…';
    try {
      const W = cfg.cols * TILE, H = cfg.rows * TILE;
      const out = document.createElement('canvas'); out.width = W; out.height = H;
      const g = out.getContext('2d');
      for (let i = 0; i < n; i++) {
        const img = await loadImg(shots[i].url);
        g.drawImage(img, (i % cfg.cols) * TILE, Math.floor(i / cfg.cols) * TILE, TILE, TILE);
      }
      await reveal(out, shape);
      const blob = await new Promise((r) => out.toBlob(r, 'image/jpeg', 0.88));
      await onSubmit(blob);
    } catch (e) { toast('拼合失敗：' + (e.message || e)); doneBtn.disabled = false; doneBtn.textContent = '拼合影像'; }
  };
  return box;
}

// 揭曉動畫：發光線條 → 淡出 → 只剩大家的手拼出的形狀
function reveal(collage, shape) {
  return new Promise((resolve) => {
    const ov = document.createElement('div'); ov.className = 'mz-reveal';
    const c = document.createElement('canvas'); c.width = collage.width; c.height = collage.height;
    const cap = document.createElement('div'); cap.className = 'mz-cap'; cap.textContent = '拼合中……';
    ov.append(c, cap); document.body.append(ov);
    const g = c.getContext('2d'); const t0 = performance.now();
    sfx('ping');
    const frame = (now) => {
      const t = (now - t0) / 1000;
      g.clearRect(0, 0, c.width, c.height);
      g.globalAlpha = Math.min(1, t / 1.2); g.drawImage(collage, 0, 0); g.globalAlpha = 1;
      const a = t < 2 ? Math.min(1, t / 1) : Math.max(0, 1 - (t - 2.5) / 1.5);
      if (a > 0) { g.globalAlpha = a * 0.75; const glow = tileGlow(shape); g.drawImage(glow, 0, 0); g.globalAlpha = 1; }
      if (t > 3.6 && !ov._done) { ov._done = true; cap.textContent = '門的形狀，被描出來了。'; sfx('complete'); }
      if (t < 6.5) requestAnimationFrame(frame);
      else { const b = document.createElement('button'); b.className = 'btn primary'; b.textContent = '送出影像'; b.onclick = () => { ov.remove(); resolve(); }; ov.append(b); }
    };
    requestAnimationFrame(frame);
  });
}
let glowCache = null;
function tileGlow(shape) {
  if (glowCache) return glowCache;
  const c = document.createElement('canvas'); c.width = shape.width; c.height = shape.height;
  const g = c.getContext('2d'); g.drawImage(shape, 0, 0);
  g.globalCompositeOperation = 'source-in'; g.fillStyle = '#3ff4ff'; g.fillRect(0, 0, c.width, c.height);
  return (glowCache = c);
}
