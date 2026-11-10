// 培養皿第二階段進化：進化後的外觀、預兆動畫、進化儀式動畫
import { sfx, ambience } from './audio.js';

// 分化印記（進化完成後取得的特殊符號；之後的密室會再出現）
export const EVO_GLYPH = '<svg viewBox="0 0 48 48" width="100%" height="100%"><circle cx="24" cy="24" r="17" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M24 6 V42 M11 31 Q24 13 37 31" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><circle cx="24" cy="24" r="3.6" fill="currentColor"/></svg>';

function hexHS(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || ''); if (!m) return [186, 90];
  const n = parseInt(m[1], 16), r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let h = 0; if (d) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  const l = (mx + mn) / 2, s = d ? d / (1 - Math.abs(2 * l - 1)) : 0;
  return [Math.round((h * 60 + 360) % 360), Math.round(s * 100)];
}

// 在 (cx, cy) 畫出進化後的外層結構；k = 0→1 生長程度
export function drawEvo(g, cx, cy, R, t, evo, k = 1) {
  if (!evo || k <= 0) return;
  const [hue, s0] = hexHS(evo.tint); const sat = Math.max(55, s0);
  const col = (l, a) => `hsla(${hue},${sat}%,${l}%,${a})`;
  const rr = R * (0.55 + 0.45 * k);
  g.save(); g.lineCap = 'round';
  const halo = g.createRadialGradient(cx, cy, 0, cx, cy, rr * 2.4);
  halo.addColorStop(0, col(70, 0.28 * k)); halo.addColorStop(1, col(50, 0));
  g.fillStyle = halo; g.fillRect(cx - rr * 2.5, cy - rr * 2.5, rr * 5, rr * 5);
  switch ((evo.shape || 0) % 4) {
    case 0: { // 綻放：花瓣
      const n = 7;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + t * 0.12, L = rr * (1.35 + 0.08 * Math.sin(t * 1.4 + i)) * k + rr * 0.4;
        g.beginPath(); g.moveTo(cx, cy);
        g.quadraticCurveTo(cx + Math.cos(a - 0.42) * L * 0.75, cy + Math.sin(a - 0.42) * L * 0.75, cx + Math.cos(a) * L, cy + Math.sin(a) * L);
        g.quadraticCurveTo(cx + Math.cos(a + 0.42) * L * 0.75, cy + Math.sin(a + 0.42) * L * 0.75, cx, cy);
        g.fillStyle = col(62, 0.16 * k); g.fill(); g.strokeStyle = col(76, 0.6 * k); g.lineWidth = 1.4; g.stroke();
      }
      break;
    }
    case 1: { // 晶格：多層六角＋光刺
      for (let l = 0; l < 3; l++) {
        const r1 = rr * (1.05 + l * 0.33) * k + rr * 0.2, rot = t * 0.1 * (l % 2 ? -1 : 1);
        g.beginPath();
        for (let i = 0; i <= 6; i++) { const a = rot + (i / 6) * Math.PI * 2; i ? g.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1) : g.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); }
        g.strokeStyle = col(72 - l * 6, (0.65 - l * 0.15) * k); g.lineWidth = 1.6; g.stroke();
      }
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 + t * 0.05, r0 = rr * 1.2 * k, r1 = rr * (1.65 + 0.12 * Math.sin(t * 2 + i)) * k;
        g.beginPath(); g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); g.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
        g.strokeStyle = col(80, 0.5 * k); g.lineWidth = 1.2; g.stroke();
      }
      break;
    }
    case 2: { // 光環：傾斜軌道＋衛星
      for (let i = 0; i < 4; i++) {
        const rot = t * 0.18 + i * 0.8, ax = rr * (1.25 + i * 0.2) * k + rr * 0.2, ay = rr * (0.42 + i * 0.07);
        g.beginPath(); g.ellipse(cx, cy, ax, ay, rot, 0, Math.PI * 2); g.strokeStyle = col(72, (0.55 - i * 0.08) * k); g.lineWidth = 1.3; g.stroke();
        const a = t * (0.7 + i * 0.25) + i;
        const x = Math.cos(a) * ax, y = Math.sin(a) * ay;
        g.beginPath(); g.arc(cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot), 2.6, 0, Math.PI * 2);
        g.fillStyle = col(85, 0.9 * k); g.fill();
      }
      break;
    }
    default: { // 流紗：流動的薄膜
      for (let i = 0; i < 6; i++) {
        g.beginPath();
        for (let j = 0; j <= 72; j++) {
          const th = (j / 72) * Math.PI * 2, r1 = (rr * (1.2 + 0.2 * Math.sin(3 * th + t * 1.1 + i * 0.9))) * k + rr * 0.25;
          const x = cx + Math.cos(th) * r1, y = cy + Math.sin(th) * r1 * 0.92; j ? g.lineTo(x, y) : g.moveTo(x, y);
        }
        g.strokeStyle = col(70 + i * 2, (0.42 - i * 0.05) * k); g.lineWidth = 1.2; g.stroke();
      }
    }
  }
  g.restore();
}

const overlay = (cls) => { const el = document.createElement('div'); el.className = 'evo-ov ' + cls; document.body.append(el); return el; };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// 預兆：培養皿出現反應（完成今天的任務之後）
export function playOmen({ onEnter, onLater }) {
  const ov = overlay('omen');
  const cv = document.createElement('canvas'); cv.className = 'evo-cv';
  const lines = document.createElement('div'); lines.className = 'evo-lines';
  const bar = document.createElement('div'); bar.className = 'evo-bar';
  ov.append(cv, lines, bar);
  const g = cv.getContext('2d'); const size = Math.min(innerWidth - 16, 420, Math.round(innerHeight * 0.42)); const dpr = Math.min(devicePixelRatio || 1, 2);
  cv.width = cv.height = size * dpr; cv.style.width = cv.style.height = size + 'px'; g.scale(dpr, dpr);
  let alive = true; const t0 = performance.now();
  const frame = (now) => {
    if (!alive) return; const t = (now - t0) / 1000;
    g.clearRect(0, 0, size, size);
    const shake = Math.min(1, t / 3) * (Math.random() - 0.5) * 6, cx = size / 2 + shake, cy = size / 2;
    const r = 34 + Math.sin(t * 6) * 3 + Math.min(1, t / 3) * 8;
    const gr = g.createRadialGradient(cx, cy, 0, cx, cy, r * 3); gr.addColorStop(0, `hsla(186,90%,70%,${0.35 + 0.25 * Math.sin(t * 9)})`); gr.addColorStop(1, 'hsla(186,90%,50%,0)');
    g.fillStyle = gr; g.fillRect(0, 0, size, size);
    g.fillStyle = 'hsla(186,70%,62%,.9)'; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
    if (Math.random() < 0.25) { g.strokeStyle = 'hsla(330,90%,70%,.7)'; g.lineWidth = 1.5; g.beginPath(); const a = Math.random() * 6.28; g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * r * 2.2, cy + Math.sin(a) * r * 2.2); g.stroke(); }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  sfx('static');
  (async () => {
    for (const s of ['未知進化反應已觸發。', '初始身分資料保留中……', '偵測到新的形態分化可能。']) {
      await wait(1100); if (!alive) return;
      const p = document.createElement('p'); p.textContent = s; lines.append(p); sfx('type');
    }
    await wait(900); if (!alive) return;
    const go = document.createElement('button'); go.className = 'btn primary'; go.textContent = '進入進化程序';
    const later = document.createElement('button'); later.className = 'btn ghost sm'; later.textContent = '稍後再處理';
    const close = () => { alive = false; ov.remove(); };
    go.onclick = () => { close(); onEnter && onEnter(); };
    later.onclick = () => { close(); onLater && onLater(); };
    bar.append(go, later); sfx('ping');
  })();
}

// 進化儀式：發光 → 分裂 → 重組 → 新形態
export function playEvolution({ evo, symbolName = '分化印記' }) {
  return new Promise((resolve) => {
    const ov = overlay('ritual');
    const cv = document.createElement('canvas'); cv.className = 'evo-cv';
    const lines = document.createElement('div'); lines.className = 'evo-lines';
    const bar = document.createElement('div'); bar.className = 'evo-bar';
    ov.append(cv, lines, bar);
    const g = cv.getContext('2d'); const size = Math.min(innerWidth - 16, 440, Math.round(innerHeight * 0.4)); const dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = cv.height = size * dpr; cv.style.width = cv.style.height = size + 'px'; g.scale(dpr, dpr);
    const cx = size / 2, cy = size / 2, [hue] = hexHS(evo.tint);
    let alive = true; const t0 = performance.now(); const daughters = 5;
    ambience('ceremony', true); sfx('ping');
    const cell = (x, y, r, h, a) => { const gr = g.createRadialGradient(x, y, 0, x, y, r * 2.6); gr.addColorStop(0, `hsla(${h},90%,72%,${0.45 * a})`); gr.addColorStop(1, `hsla(${h},90%,50%,0)`); g.fillStyle = gr; g.fillRect(x - r * 3, y - r * 3, r * 6, r * 6); g.fillStyle = `hsla(${h},75%,65%,${0.95 * a})`; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); };
    const frame = (now) => {
      if (!alive) return; const t = (now - t0) / 1000;
      g.clearRect(0, 0, size, size);
      const mix = (a, b, k) => a + (b - a) * Math.max(0, Math.min(1, k));
      const h = mix(186, hue, (t - 3.5) / 3);
      if (t < 2.2) { // 發光
        cell(cx, cy, 30 + t * 6 + Math.sin(t * 8) * 2, 186, 1);
      } else if (t < 4.4) { // 分裂
        const k = (t - 2.2) / 2.2, e = 1 - Math.pow(1 - k, 3);
        for (let i = 0; i < daughters; i++) { const a = (i / daughters) * Math.PI * 2 + t * 0.6; cell(cx + Math.cos(a) * e * size * 0.28, cy + Math.sin(a) * e * size * 0.28, 22 - e * 8, mix(186, h, k), 1); }
        cell(cx, cy, 40 * (1 - e) + 4, 186, 1 - e * 0.6);
      } else if (t < 6.4) { // 重組
        const k = (t - 4.4) / 2, e = k * k;
        for (let i = 0; i < daughters; i++) { const a = (i / daughters) * Math.PI * 2 + t * 1.4 + e * 3; const rr = size * 0.28 * (1 - e); cell(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 14 + e * 4, h, 1); }
        cell(cx, cy, 6 + e * 26, h, e);
      } else { // 新形態
        const k = Math.min(1, (t - 6.4) / 2.2);
        if (t < 6.8) { g.fillStyle = `rgba(255,255,255,${(6.8 - t) / 0.4 * 0.8})`; g.fillRect(0, 0, size, size); }
        drawEvo(g, cx, cy, size * 0.15, t, evo, k);
        cell(cx, cy, 24 + Math.sin(t * 2.2) * 1.5, hue, 1);
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
    (async () => {
      await wait(2200); sfx('static'); await wait(2200); sfx('sink'); await wait(2000); sfx('complete');
      for (const s of ['第二階段進化完成。', '核心身分：已保留。', '新形態：已建立。', '後續觀測程序已更新。']) {
        await wait(850); if (!alive) return; const p = document.createElement('p'); p.textContent = s; lines.append(p); sfx('type');
      }
      await wait(900);
      const code = document.createElement('div'); code.className = 'evo-code'; code.innerHTML = `<span>新識別碼</span><b>${evo.code || ''}</b>`; lines.append(code); sfx('unlock');
      await wait(1100);
      const sym = document.createElement('div'); sym.className = 'evo-sym'; sym.innerHTML = `<i>${EVO_GLYPH}</i><span>取得特殊符號<br><b>${symbolName}</b></span>`; lines.append(sym); sfx('find');
      await wait(900);
      const go = document.createElement('button'); go.className = 'btn primary'; go.textContent = '繼續';
      go.onclick = () => { alive = false; ov.remove(); ambience('base', true); resolve(); };
      bar.append(go);
    })();
  });
}
