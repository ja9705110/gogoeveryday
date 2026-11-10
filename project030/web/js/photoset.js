// 多張照片一起送審：每一格各拍一張（可分次、可重拍，會自動上傳保存），全部完成後合併成一張拼貼送出
import { sb, upload, signedUrl } from './api.js';
import { h } from './steps.js';
import { sfx } from './audio.js';

const CELL = 600;
const loadImg = (src) => new Promise((res, rej) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => res(i); i.onerror = rej; i.src = src; });

async function shrink(file, max = 1600) {
  try {
    const bmp = await createImageBitmap(file);
    const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    return await new Promise((r) => c.toBlob((b) => r(b || file), 'image/jpeg', 0.86));
  } catch (_) { return file; }
}

// 現場拍攝（不能從相簿選）：預設前鏡頭方便合照，可切換；照片右下角印上拍攝時間
function liveCamera(i, label, onShot) {
  const ov = h('div', { class: 'mz-cam pset-cam' });
  const video = h('video', { playsinline: '', muted: '', autoplay: '' });
  const tip = h('div', { class: 'mz-tip' }, `${label}：請把你和對方都放進畫面裡，按「拍下」。`);
  const shoot = h('button', { class: 'btn primary mz-shoot' }, '拍下');
  const flip = h('button', { class: 'btn' }, '切換鏡頭');
  const cancel = h('button', { class: 'btn ghost' }, '取消');
  ov.append(h('div', { class: 'mz-stage pset-stage' }, video), tip, h('div', { class: 'mz-bar' }, cancel, flip, shoot));
  document.body.append(ov);
  let stream = null, facing = 'user';
  const stop = () => stream && stream.getTracks().forEach((t) => t.stop());
  const start = async () => {
    stop(); shoot.disabled = true;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: facing, width: { ideal: 1600 }, height: { ideal: 1600 } } });
      video.srcObject = stream; video.style.transform = facing === 'user' ? 'scaleX(-1)' : 'none'; await video.play().catch(() => {}); shoot.disabled = false;
    } catch (e) {
      tip.innerHTML = '無法開啟相機。這一關只能現場拍攝：請到手機設定允許這個網頁使用相機，再回來重試。';
    }
  };
  const close = () => { stop(); ov.remove(); };
  cancel.onclick = close;
  flip.onclick = () => { facing = facing === 'user' ? 'environment' : 'user'; start(); };
  shoot.onclick = async () => {
    if (!video.videoWidth) return;
    const k = Math.min(1, 1600 / Math.max(video.videoWidth, video.videoHeight));
    const c = document.createElement('canvas'); c.width = Math.round(video.videoWidth * k); c.height = Math.round(video.videoHeight * k);
    const g = c.getContext('2d'); g.drawImage(video, 0, 0, c.width, c.height);
    const stamp = 'LIVE ' + new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', hour12: false }).replace(/:\d\d$/, '');
    const fs = Math.max(14, Math.round(c.width / 40)); g.font = `600 ${fs}px monospace`; g.textAlign = 'right'; g.textBaseline = 'bottom';
    const tw = g.measureText(stamp).width; g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(c.width - tw - fs * 1.2, c.height - fs * 1.9, tw + fs, fs * 1.5);
    g.fillStyle = '#3ff4ff'; g.fillText(stamp, c.width - fs * 0.7, c.height - fs * 0.6);
    const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.86));
    close(); onShot(blob);
  };
  if (!navigator.mediaDevices?.getUserMedia) tip.textContent = '這個瀏覽器無法開啟相機。請用手機的 Safari 或 Chrome 開啟遊戲。';
  else start();
}

export function photosetWidget({ step, pid, day, toast, onSubmit }) {
  const cfg = { count: 5, label: '第 {n} 張', ...(step.photoset || {}) };
  const n = cfg.count;
  const folder = `${pid}/${day}/set-${step.id}`;
  const shots = new Array(n).fill(null); // { path, url }
  const box = h('div', { class: 'pset' });
  const grid = h('div', { class: 'pset-grid' });
  const status = h('div', { class: 'dim', style: 'font-size:13px;margin:8px 0' });
  const send = h('button', { class: 'btn primary block', disabled: '' }, '合併送出審核');
  const cells = [];
  for (let i = 0; i < n; i++) {
    const inp = h('input', { type: 'file', accept: 'image/*', class: 'hidden' });
    const img = h('img', { class: 'pset-img', alt: '' });
    const cap = h('div', { class: 'pset-cap' }, cfg.label.replace('{n}', i + 1));
    const add = h('div', { class: 'pset-add' }, '＋', h('small', {}, '拍照或選照片'));
    if (cfg.live) add.lastChild.textContent = '開相機拍攝';
    const cell = h('button', { class: 'pset-cell', onclick: () => (cfg.live ? liveCamera(i, cfg.label.replace('{n}', i + 1), (b) => save(b)) : inp.click()) }, img, add, cap, cfg.live ? null : inp);
    const save = async (raw) => {
      cell.classList.add('busy'); add.lastChild.textContent = '上傳中…';
      try {
        const blob = cfg.live ? raw : await shrink(raw);
        const path = `${folder}/${i}-${Date.now()}.jpg`;
        await upload('evidence', path, blob, 'image/jpeg');
        shots[i] = { path, url: URL.createObjectURL(blob) }; sfx('ok'); paint();
      } catch (e) { toast('上傳失敗：' + (e.message || e)); }
      cell.classList.remove('busy'); add.lastChild.textContent = cfg.live ? '開相機拍攝' : '拍照或選照片';
    };
    inp.onchange = () => { const f = inp.files[0]; inp.value = ''; if (f) save(f); };
    grid.append(cell); cells.push({ cell, img });
  }
  const paint = () => {
    let k = 0;
    shots.forEach((s, i) => { if (s) { k++; cells[i].img.src = s.url; cells[i].cell.classList.add('shot'); } });
    status.textContent = k < n ? `已完成 ${k} / ${n} 張。點格子${cfg.live ? '開相機現場拍攝' : '拍照'}；點已拍的格子可以重拍。照片會自動保存，可以分次完成。` : `${n} 張都完成了。確認無誤後，一起送出審核。`;
    send.disabled = k < n;
  };
  // 讀回之前已上傳的照片（每一格取最新的一張）
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

  send.onclick = async () => {
    send.disabled = true; send.textContent = '合併中…';
    try {
      const cols = Math.min(3, n), rows = Math.ceil(n / cols);
      const c = document.createElement('canvas'); c.width = cols * CELL; c.height = rows * CELL;
      const g = c.getContext('2d'); g.fillStyle = '#05101a'; g.fillRect(0, 0, c.width, c.height);
      for (let i = 0; i < n; i++) {
        const im = await loadImg(shots[i].url);
        const x = (i % cols) * CELL, y = Math.floor(i / cols) * CELL, side = Math.min(im.width, im.height);
        g.drawImage(im, (im.width - side) / 2, (im.height - side) / 2, side, side, x + 6, y + 6, CELL - 12, CELL - 12);
        g.fillStyle = 'rgba(2,8,16,.72)'; g.fillRect(x + 6, y + 6, 74, 54);
        g.fillStyle = '#3ff4ff'; g.font = '700 34px monospace'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(i + 1), x + 43, y + 34);
      }
      for (let i = n; i < cols * rows; i++) { // 空格：標示張數
        const x = (i % cols) * CELL, y = Math.floor(i / cols) * CELL;
        g.fillStyle = '#3ff4ff'; g.font = '700 56px monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillText(`${n} / ${n}`, x + CELL / 2, y + CELL / 2 - 20); g.font = '24px monospace'; g.fillStyle = '#8fb8c8'; g.fillText(`ZONE ${String(day).padStart(2, '0')} · ${step.title || ''}`, x + CELL / 2, y + CELL / 2 + 40);
      }
      const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.88));
      await onSubmit(blob, shots.map((s) => s.path));
    } catch (e) { toast('送出失敗：' + (e.message || e)); send.disabled = false; send.textContent = '合併送出審核'; }
  };
  box.append(grid, status, send);
  return box;
}
