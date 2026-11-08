// WebAR 影像追蹤（MindAR）：只有真正辨識到實體卡片時才會回報 targetIndex
import { glyphSVG } from './glyphs.js';

let mindar = null;
async function loadMind() {
  if (!mindar) mindar = await import('../vendor/mindar/mindar-image.prod.js');
  return mindar;
}

const CARD_ASPECT = 840 / 600;

function overlayHTML(reveal) {
  if (!reveal) return '<div style="font:600 14px var(--mono);color:#6fe3d2;text-shadow:0 0 8px #000">訊號鎖定中…</div>';
  if (reveal.overlay === 'safe') {
    return `<svg viewBox="0 0 200 200" width="220" height="220" style="filter:drop-shadow(0 0 18px rgba(111,227,210,.6))">
      <rect x="20" y="20" width="160" height="160" rx="10" fill="rgba(20,30,40,.85)" stroke="#6fe3d2" stroke-width="3"/>
      <circle cx="100" cy="100" r="46" fill="none" stroke="#f2b84b" stroke-width="3"/>
      ${[...String(reveal.digits)].map((d, i, a) => {
        const ang = -90 + (360 / a.length) * i; const x = 100 + Math.cos(ang * Math.PI / 180) * 64; const y = 106 + Math.sin(ang * Math.PI / 180) * 64;
        return `<text x="${x}" y="${y}" text-anchor="middle" font-family="monospace" font-size="26" fill="#f2b84b">${d}</text>`; }).join('')}
      <text x="100" y="108" text-anchor="middle" font-family="monospace" font-size="12" fill="#6fe3d2">↻ 順時針</text></svg>`;
  }
  if (reveal.overlay === 'totem') {
    return `<div style="display:flex;flex-direction:column;gap:6px;padding:10px;border:2px solid #f2b84b;border-radius:40px;background:rgba(30,20,10,.82);color:#f2b84b;filter:drop-shadow(0 0 16px rgba(242,184,75,.6))">
      ${(reveal.glyphs || []).map((g) => `<div style="width:64px;height:64px">${glyphSVG(g)}</div>`).join('')}</div>`;
  }
  return '';
}

/**
 * 開啟相機掃描。expected 為這一步要求的 target index（只用來顯示 HUD；驗證在伺服器端）。
 * onDetect(targetIndex) 需回傳 Promise<{correct, reveal}>
 */
export async function startAR({ cardLabel, onDetect }) {
  const root = document.createElement('div');
  root.className = 'ar';
  root.innerHTML = `<video playsinline muted autoplay></video>
    <div class="frame"></div><div class="overlay hidden"></div>
    <div class="hud">掃描投影卡 ${cardLabel}<br><span class="dim" id="arStatus">啟動相機中…</span></div>
    <button class="btn close">關閉</button>`;
  document.body.appendChild(root);
  const video = root.querySelector('video');
  const status = root.querySelector('#arStatus');
  const ov = root.querySelector('.overlay');
  let controller, stream, closed = false, reported = false, reveal = null;

  const close = () => {
    closed = true;
    try { controller && controller.stopProcessVideo(); controller && controller.dispose(); } catch (_) {}
    stream && stream.getTracks().forEach((t) => t.stop());
    root.remove();
  };
  root.querySelector('.close').onclick = close;

  try {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('這個瀏覽器不支援相機。請改用 iPhone Safari，或請管理者啟用備用驗證。');
    stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } });
    video.srcObject = stream;
    await new Promise((r) => (video.readyState >= 2 ? r() : (video.onloadedmetadata = r)));
    await video.play().catch(() => {});
    status.textContent = '載入辨識模型…（第一次需要幾秒）';
    const { Controller } = await loadMind();
    if (closed) return;
    const W = video.videoWidth, H = video.videoHeight;
    controller = new Controller({
      inputWidth: W, inputHeight: H, maxTrack: 1, warmupTolerance: 3, missTolerance: 6,
      onUpdate: (d) => {
        if (d.type !== 'updateMatrix' || closed) return;
        if (!d.worldMatrix) { root.classList.remove('found'); ov.classList.add('hidden'); status.textContent = '請把卡片放進框內'; return; }
        root.classList.add('found');
        place(d.targetIndex, d.worldMatrix);
        if (!reported) {
          reported = true;
          status.textContent = '已辨識卡片，比對中…';
          onDetect(d.targetIndex).then((res) => {
            if (res && res.correct) { reveal = res.reveal; status.textContent = '投影已顯示。記下你看到的東西。'; ov.innerHTML = overlayHTML(reveal); }
            else { status.textContent = '這不是這一區需要的卡片。'; setTimeout(() => { reported = false; }, 2500); }
          }).catch((e) => { status.textContent = String(e.message || e); reported = false; });
        }
      },
    });
    const { dimensions } = await controller.addImageTargets('ar/targets.mind');
    controller.dummyRun(video);
    if (closed) return;
    status.textContent = '請把卡片放進框內';
    ov.innerHTML = overlayHTML(null);
    controller.processVideo(video);

    const proj = controller.getProjectionMatrix();
    // 把卡片中心投影到螢幕座標（video 以 cover 方式填滿）
    function place(idx, m) {
      const [w, h] = dimensions[idx];
      const pt = [w / 2, h / 2, 0, 1];
      const mv = [0, 1, 2, 3].map((r) => m[r] * pt[0] + m[4 + r] * pt[1] + m[8 + r] * pt[2] + m[12 + r] * pt[3]);
      const cl = [0, 1, 2, 3].map((r) => proj[r] * mv[0] + proj[4 + r] * mv[1] + proj[8 + r] * mv[2] + proj[12 + r] * mv[3]);
      const nx = cl[0] / cl[3], ny = cl[1] / cl[3];
      const vx = ((nx + 1) / 2) * W, vy = ((1 - ny) / 2) * H;
      const vw = root.clientWidth, vh = root.clientHeight;
      const s = Math.max(vw / W, vh / H);
      const ox = (vw - W * s) / 2, oy = (vh - H * s) / 2;
      ov.style.left = ox + vx * s + 'px';
      ov.style.top = oy + vy * s + 'px';
      ov.classList.remove('hidden');
    }
  } catch (e) {
    status.textContent = (e && e.name === 'NotAllowedError') ? '相機權限被拒絕。請到設定允許相機，或請管理者啟用備用驗證。' : String(e.message || e);
  }
  return { close, aspect: CARD_ASPECT };
}
