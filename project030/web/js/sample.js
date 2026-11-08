// 030 號樣本：完全由伺服器回傳的觀測資料（參數、歷程、中斷）繪製，不是固定圖片
const ACTION_HUE = { explore: 172, preserve: 38, adjust: 268, rest: 128 };
export const ACTION_LABEL = { explore: '探索', preserve: '保存', adjust: '調整環境', rest: '靜置' };
export const ACTION_DESC = {
  explore: '讓樣本接觸未知的刺激。', preserve: '維持現狀，記錄它目前的樣子。',
  adjust: '改變光、溫度與濕度。', rest: '什麼都不做，只是看著它。',
};
export const PARAM_LABEL = { lum: '光度', branch: '分岔', shell: '殼層', depth: '根深', drift: '偏移', rhythm: '節律' };

function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

export function mountSample(canvas, state) {
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const size = canvas.clientWidth || 300;
  canvas.width = size * dpr; canvas.height = size * dpr;
  ctx.scale(dpr, dpr);
  const p = state?.params || { lum: 10, branch: 10, shell: 10, depth: 10, drift: 0, rhythm: 0 };
  const hist = state?.history || [];
  const scars = state?.scars || [];
  const total = state?.total || 0;
  const cx = size / 2, cy = size * 0.48;

  // 色相：所有觀測行動的加權平均（每一次選擇都留下顏色）
  let hx = 0, hy = 0;
  hist.forEach((h, i) => { const a = (ACTION_HUE[h.action] / 180) * Math.PI; const w = 1 + i * 0.25; hx += Math.cos(a) * w; hy += Math.sin(a) * w; });
  const hue = hist.length ? ((Math.atan2(hy, hx) / Math.PI) * 180 + 360) % 360 : 190;
  const sym = Math.min(1, p.rhythm / 40);            // 規律 → 旋轉對稱
  const wobble = Math.min(1, p.drift / 40);          // 偏移 → 不對稱
  const base = 8 + total * 3.2;
  const arms = Math.max(0, Math.round((p.branch - 10) / 9));
  const rings = Math.max(0, Math.round((p.shell - 10) / 10));
  const roots = Math.max(0, Math.round((p.depth - 10) / 9));
  const glow = 10 + p.lum * 0.9;
  const steady = p.rhythm >= p.drift;

  let t0 = performance.now(), raf;
  const frame = (now) => {
    const t = (now - t0) / 1000;
    const r = rng(state?.seed || 30);
    const beat = steady ? Math.sin(t * 2.2) : Math.sin(t * 1.3 + Math.sin(t * 0.7) * 2);
    ctx.clearRect(0, 0, size, size);
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, glow * 2.4);
    g.addColorStop(0, `hsla(${hue},80%,70%,${0.18 + p.lum / 400})`);
    g.addColorStop(1, 'hsla(0,0%,0%,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);

    // 根：靜置
    ctx.strokeStyle = `hsla(${(hue + 40) % 360},40%,55%,.55)`; ctx.lineWidth = 1.4;
    for (let i = 0; i < roots; i++) {
      const a = Math.PI / 2 + (r() - 0.5) * 1.6;
      ctx.beginPath(); ctx.moveTo(cx, cy + base * 0.6);
      let x = cx, y = cy + base * 0.6;
      for (let k = 0; k < 5; k++) { x += Math.cos(a + (r() - 0.5) * 0.8) * (8 + p.depth * 0.12); y += Math.sin(a) * (8 + p.depth * 0.12); ctx.lineTo(x, y); }
      ctx.stroke();
    }
    // 殼層：保存
    for (let i = 0; i < rings; i++) {
      ctx.beginPath();
      ctx.strokeStyle = `hsla(${hue},60%,${60 - i * 4}%,${0.5 - i * 0.04})`;
      ctx.lineWidth = 1.2;
      const rr = base + 8 + i * 7 + beat * 1.2;
      ctx.ellipse(cx + wobble * (r() - 0.5) * 8, cy, rr, rr * (0.86 + sym * 0.14), 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    // 分岔：探索（節律高時呈旋轉對稱）
    for (let i = 0; i < arms; i++) {
      const a0 = sym > 0.5 ? (i / arms) * Math.PI * 2 + t * 0.05 : r() * Math.PI * 2;
      let x = cx, y = cy, a = a0, len = base + 10 + p.branch * 0.3;
      ctx.strokeStyle = `hsla(${(hue + 20) % 360},75%,65%,.75)`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x, y);
      for (let k = 0; k < 4; k++) {
        a += (r() - 0.5) * (0.3 + wobble * 1.2) + Math.sin(t + i) * 0.03;
        x += Math.cos(a) * len / 4; y += Math.sin(a) * len / 4; ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.fillStyle = `hsla(${(hue + 20) % 360},90%,75%,.9)`;
      ctx.beginPath(); ctx.arc(x, y, 2 + p.lum / 40, 0, Math.PI * 2); ctx.fill();
    }
    // 中斷留下的痕跡（不是死亡，是另一種生長）
    scars.forEach((s) => {
      const a = (s.day / 11) * Math.PI * 2;
      const rr = base + 4;
      ctx.strokeStyle = 'hsla(8,80%,65%,.8)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, rr, a, a + 0.25 + s.gap * 0.12); ctx.stroke();
      ctx.strokeStyle = 'hsla(8,60%,60%,.5)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
      ctx.lineTo(cx + Math.cos(a) * (rr + 14 + s.gap * 6), cy + Math.sin(a) * (rr + 14 + s.gap * 6)); ctx.stroke();
    });
    // 核心：每一次觀測一層
    for (let i = hist.length; i >= 0; i--) {
      const rr = Math.max(3, (base * (i + 1)) / (hist.length + 1)) + beat * (steady ? 1.5 : 2.5);
      const h = hist[i - 1] ? ACTION_HUE[hist[i - 1].action] : hue;
      ctx.fillStyle = `hsla(${h},70%,${45 + (i / (hist.length + 1)) * 25}%,${i === 0 ? 0.95 : 0.35})`;
      ctx.beginPath();
      ctx.ellipse(cx + wobble * Math.sin(i * 1.7) * 3, cy, rr, rr * 0.92, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    if (total === 0) {
      ctx.fillStyle = 'rgba(200,230,230,.5)'; ctx.beginPath(); ctx.arc(cx, cy, 4 + beat, 0, Math.PI * 2); ctx.fill();
    }
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(raf);
}
