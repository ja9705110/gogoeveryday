// 重建星球：十層結構依每日完成狀態點亮；終章時星球化為光點，重組成照片
export const LAYERS = [
  { day: 1, name: '核心', en: 'CORE' }, { day: 2, name: '地函', en: 'MANTLE' }, { day: 3, name: '地殼', en: 'CRUST' },
  { day: 4, name: '海洋', en: 'OCEAN' }, { day: 5, name: '雲層', en: 'CLOUDS' }, { day: 6, name: '大氣', en: 'ATMOSPHERE' },
  { day: 7, name: '衛星', en: 'MOON' }, { day: 8, name: '星環', en: 'RINGS' }, { day: 9, name: '極光', en: 'AURORA' },
  { day: 10, name: '星芒', en: 'HALO' },
];

// levels: 伺服器回傳的關卡狀態 → 每層狀態 full / alt / none
export function layerStates(levels) {
  const out = {};
  for (const l of levels || []) {
    if (l.day > 10) continue;
    out[l.day] = l.status === 'COMPLETED' ? (l.outcome === 'ALTERNATE' ? 'alt' : 'full') : 'none';
  }
  return out;
}

const rnd = (seed) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

// 代表色：保留每一層原本的明暗，只把色相換成他選的顏色
const parseCol = (c) => {
  if (c[0] === '#') { const n = c.length === 4 ? c.slice(1).split('').map((x) => x + x).join('') : c.slice(1); return { r: parseInt(n.slice(0, 2), 16), g: parseInt(n.slice(2, 4), 16), b: parseInt(n.slice(4, 6), 16), a: 1 }; }
  const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const v = m[1].split(',').map(Number); return { r: v[0], g: v[1], b: v[2], a: v.length > 3 ? v[3] : 1 };
};
const toHsl = ({ r, g, b }) => { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2; const d = mx - mn;
  if (d) { s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; } return { h, s: s * 100, l: l * 100 }; };
export function tintColor(tint, c) {
  const o = parseCol(c), t = parseCol(tint); if (!o || !t) return c;
  const oh = toHsl(o), th = toHsl(t);
  const l = Math.max(8, Math.min(88, oh.l * 0.7 + th.l * 0.3));
  const sat = Math.min(100, th.s * (0.55 + 0.45 * oh.s / 100));
  return `hsla(${th.h.toFixed(0)},${sat.toFixed(0)}%,${l.toFixed(0)}%,${o.a})`;
}

export function mountPlanet(canvas, states, { highlight = null, size = null, tint = null, noMoon = false } = {}) {
  const g = canvas.getContext('2d');
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const SW = canvas.clientWidth || size || 300, SH = canvas.clientHeight || SW;
  canvas.width = SW * dpr; canvas.height = SH * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
  const S = Math.min(SW, SH), cx = SW / 2, cy = SH / 2, R = S * 0.27;
  const r = rnd(1118);
  const continents = Array.from({ length: 9 }, () => ({ lon: r() * Math.PI * 2, lat: (r() - 0.5) * 2.2, w: 0.25 + r() * 0.45, h: 0.15 + r() * 0.3 }));
  const clouds = Array.from({ length: 12 }, () => ({ lon: r() * Math.PI * 2, lat: (r() - 0.5) * 2.4, w: 0.3 + r() * 0.6 }));
  const t0 = performance.now();
  let raf;
  const st = (d) => states[d] || 'none';
  const col = (d, full, alt) => (tint ? tintColor(tint, full) : st(d) === 'alt' ? alt : full);
  const appear = (d) => (highlight === d ? Math.max(0.001, Math.min(1, (performance.now() - t0 - 600) / 1800)) : 1);

  function wire(radius, alpha) {
    g.strokeStyle = `rgba(63,244,255,${alpha})`; g.lineWidth = 0.7; g.setLineDash([2, 4]);
    g.beginPath(); g.arc(cx, cy, radius, 0, 7); g.stroke();
    for (let i = -2; i <= 2; i++) { g.beginPath(); g.ellipse(cx, cy + (i * radius) / 3, Math.sqrt(1 - (i / 3) ** 2) * radius, radius * 0.08, 0, 0, 7); g.stroke(); }
    g.beginPath(); g.ellipse(cx, cy, radius * 0.4, radius, 0, 0, 7); g.stroke();
    g.setLineDash([]);
  }
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const t = (now - t0) / 1000, rot = t * 0.15;
    g.clearRect(0, 0, SW, SH);
    // 10 星芒
    if (st(10) !== 'none') {
      const a = appear(10);
      const gr = g.createRadialGradient(cx, cy, R, cx, cy, R * 2.3);
      gr.addColorStop(0, col(10, `rgba(255,220,150,${0.35 * a})`, `rgba(180,140,255,${0.3 * a})`)); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, R * 2.3, 0, 7); g.fill();
      g.save(); g.translate(cx, cy); g.rotate(t * 0.05);
      for (let i = 0; i < 8; i++) { g.rotate(Math.PI / 4); g.fillStyle = col(10, `rgba(255,230,180,${0.18 * a})`, `rgba(190,150,255,${0.15 * a})`); g.beginPath(); g.moveTo(0, -R * 1.05); g.lineTo(4, -R * 2.1 * a); g.lineTo(-4, -R * 2.1 * a); g.fill(); }
      g.restore();
    }
    // 8 星環（後半）
    const ring = (front) => {
      if (st(8) === 'none') return;
      const a = appear(8);
      g.save(); g.translate(cx, cy); g.rotate(-0.35);
      for (let i = 0; i < 4; i++) {
        g.strokeStyle = col(8, `rgba(255,200,140,${(0.55 - i * 0.1) * a})`, `rgba(180,140,255,${(0.5 - i * 0.1) * a})`); g.lineWidth = 2.2 - i * 0.4;
        g.beginPath(); g.ellipse(0, 0, R * (1.5 + i * 0.12) * a, R * (0.32 + i * 0.03) * a, 0, front ? 0 : Math.PI, front ? Math.PI : Math.PI * 2); g.stroke();
      }
      g.restore();
    };
    ring(false);
    // 星球本體
    g.save(); g.beginPath(); g.arc(cx, cy, R, 0, 7); g.clip();
    if (st(3) !== 'none' || st(4) !== 'none') {
      g.fillStyle = st(4) !== 'none' ? col(4, '#0b4f8a', '#3b2f7a') : col(3, '#3a2b20', '#2c2440'); g.fillRect(cx - R, cy - R, R * 2, R * 2);
      if (st(4) !== 'none') { const gr = g.createRadialGradient(cx - R * 0.3, cy - R * 0.3, 0, cx, cy, R); gr.addColorStop(0, col(4, 'rgba(90,200,255,.6)', 'rgba(170,140,255,.5)')); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(cx - R, cy - R, R * 2, R * 2); }
      if (st(3) !== 'none') {
        const a = appear(3);
        for (const c of continents) {
          const lon = ((c.lon + rot) % (Math.PI * 2)) - Math.PI; if (Math.abs(lon) > Math.PI / 2) continue;
          const x = cx + Math.sin(lon) * R, y = cy + c.lat * R * 0.42, sq = Math.cos(lon);
          g.fillStyle = col(3, `rgba(${st(4) !== 'none' ? '70,160,90' : '120,90,60'},${0.95 * a})`, `rgba(140,110,200,${0.9 * a})`);
          g.beginPath(); g.ellipse(x, y, c.w * R * 0.5 * sq + 1, c.h * R * 0.5, 0, 0, 7); g.fill();
        }
      }
    }
    // 1 核心 / 2 地函（沒有地殼時可見）
    if (st(3) === 'none' && st(4) === 'none') {
      if (st(2) !== 'none') { const a = appear(2); const gr = g.createRadialGradient(cx, cy, 0, cx, cy, R * 0.75 * a); gr.addColorStop(0, col(2, 'rgba(255,140,60,.95)', 'rgba(200,120,255,.9)')); gr.addColorStop(1, col(2, 'rgba(120,30,10,.2)', 'rgba(60,30,120,.2)')); g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, R * 0.75 * a, 0, 7); g.fill(); }
      if (st(1) !== 'none') { const a = appear(1); const p = 1 + Math.sin(t * 2.4) * 0.06; const gr = g.createRadialGradient(cx, cy, 0, cx, cy, R * 0.38 * a * p); gr.addColorStop(0, '#fffbe6'); gr.addColorStop(0.5, col(1, 'rgba(255,200,90,.9)', 'rgba(190,150,255,.9)')); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, R * 0.38 * a * p, 0, 7); g.fill(); }
    }
    // 5 雲層
    if (st(5) !== 'none') {
      const a = appear(5);
      for (const c of clouds) {
        const lon = ((c.lon + rot * 1.6) % (Math.PI * 2)) - Math.PI; if (Math.abs(lon) > Math.PI / 2) continue;
        g.fillStyle = `rgba(255,255,255,${0.32 * a * Math.cos(lon)})`;
        g.beginPath(); g.ellipse(cx + Math.sin(lon) * R, cy + c.lat * R * 0.4, c.w * R * 0.45 * Math.cos(lon) + 1, R * 0.05, 0, 0, 7); g.fill();
      }
    }
    // 球體陰影
    if (st(3) !== 'none' || st(4) !== 'none') { const sh = g.createRadialGradient(cx - R * 0.4, cy - R * 0.4, R * 0.2, cx, cy, R * 1.1); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,10,.75)'); g.fillStyle = sh; g.fillRect(cx - R, cy - R, R * 2, R * 2); }
    g.restore();
    // 6 大氣光暈
    if (st(6) !== 'none') { const a = appear(6); g.strokeStyle = col(6, `rgba(120,230,255,${0.7 * a})`, `rgba(190,150,255,${0.6 * a})`); g.lineWidth = 3; g.shadowColor = g.strokeStyle; g.shadowBlur = 18; g.beginPath(); g.arc(cx, cy, R + 2, 0, 7); g.stroke(); g.shadowBlur = 0; }
    // 9 極光
    if (st(9) !== 'none') {
      const a = appear(9);
      for (const pole of [-1, 1]) for (let k = 0; k < 3; k++) {
        g.strokeStyle = col(9, `rgba(${k % 2 ? '120,255,170' : '170,120,255'},${0.45 * a})`, `rgba(200,150,255,${0.4 * a})`); g.lineWidth = 2;
        g.beginPath();
        for (let x = -R * 0.6; x <= R * 0.6; x += 4) { const y = cy + pole * (R * 0.82 + k * 4) + Math.sin(x * 0.08 + t * 2 + k) * 3; x === -R * 0.6 ? g.moveTo(cx + x, y) : g.lineTo(cx + x, y); }
        g.stroke();
      }
    }
    ring(true);
    // 7 衛星
    if (st(7) !== 'none' && !noMoon) {
      const a = appear(7), ang = t * 0.6;
      const mx = cx + Math.cos(ang) * R * 1.9, my = cy + Math.sin(ang) * R * 0.55;
      g.fillStyle = col(7, '#d8d4c8', '#b9a8e8'); g.globalAlpha = a; g.beginPath(); g.arc(mx, my, R * 0.16, 0, 7); g.fill(); g.globalAlpha = 1;
    }
    // 尚未重建的層：線框
    if (st(1) === 'none' && st(2) === 'none' && st(3) === 'none' && st(4) === 'none') wire(R, 0.35);
    else if (st(3) === 'none' && st(4) === 'none') wire(R, 0.25);
    if (st(8) === 'none') { g.setLineDash([2, 5]); g.strokeStyle = 'rgba(63,244,255,.18)'; g.beginPath(); g.ellipse(cx, cy, R * 1.55, R * 0.34, -0.35, 0, 7); g.stroke(); g.setLineDash([]); }
    // 新層登場光環
    if (highlight) { const k = (now - t0) / 1000; if (k < 3) { g.strokeStyle = `rgba(255,181,71,${Math.max(0, 1 - k / 3)})`; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, R * (1 + k * 0.6), 0, 7); g.stroke(); } }
  }
  raf = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(raf);
}

// 星球 → 光點 → 照片
export function morphToPhoto(canvas, photoUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const g = canvas.getContext('2d');
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const W = canvas.clientWidth, H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const k = Math.min((W * 0.86) / img.width, (H * 0.8) / img.height);
      const iw = img.width * k, ih = img.height * k, ix = (W - iw) / 2, iy = (H - ih) / 2;
      const step = Math.max(3, Math.round(Math.sqrt((iw * ih) / 5200)));
      const off = document.createElement('canvas'); off.width = Math.ceil(iw / step); off.height = Math.ceil(ih / step);
      const og = off.getContext('2d'); og.drawImage(img, 0, 0, off.width, off.height);
      const px = og.getImageData(0, 0, off.width, off.height).data;
      const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.22;
      const parts = [];
      for (let y = 0; y < off.height; y++) for (let x = 0; x < off.width; x++) {
        const i = (y * off.width + x) * 4;
        const a = Math.random() * Math.PI * 2, rr = Math.sqrt(Math.random()) * R;
        parts.push({ sx: cx + Math.cos(a) * rr, sy: cy + Math.sin(a) * rr, ex: ix + x * step, ey: iy + y * step,
          vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2, c: `rgb(${px[i]},${px[i + 1]},${px[i + 2]})`, d: Math.random() * 0.6 });
      }
      const t0 = performance.now();
      const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
      const frame = (now) => {
        const t = (now - t0) / 1000;
        g.fillStyle = 'rgba(1,3,12,.35)'; g.fillRect(0, 0, W, H);
        for (const p of parts) {
          let x, y;
          if (t < 1.6) { // 星球聚集、發光
            const w = Math.sin(t * 6 + p.d * 10) * 2; x = p.sx + w; y = p.sy + w;
            g.fillStyle = `rgba(120,230,255,${0.4 + 0.5 * Math.min(1, t)})`;
          } else if (t < 2.6) { // 爆散
            const q = t - 1.6; x = p.sx + p.vx * q * 160; y = p.sy + p.vy * q * 160;
            g.fillStyle = p.c;
          } else { // 重組成照片
            const q = ease(Math.min(1, Math.max(0, (t - 2.6 - p.d) / 2.6)));
            const bx = p.sx + p.vx * 160, by = p.sy + p.vy * 160;
            x = bx + (p.ex - bx) * q; y = by + (p.ey - by) * q;
            g.fillStyle = p.c;
          }
          g.fillRect(x, y, step * 0.9, step * 0.9);
        }
        if (t > 6) { g.globalAlpha = Math.min(1, (t - 6) / 1.5); g.drawImage(img, ix, iy, iw, ih); g.globalAlpha = 1; }
        if (t < 7.6) requestAnimationFrame(frame); else { g.drawImage(img, ix, iy, iw, ih); resolve(true); }
      };
      requestAnimationFrame(frame);
    };
    img.onerror = () => resolve(false);
    img.src = photoUrl;
  });
}
