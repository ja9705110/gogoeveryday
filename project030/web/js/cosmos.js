// 11/18 終章：他選的關卡分裂成情緒 → 每一關都分裂成情緒 → 所有情緒圍繞著「他」轉動
// 「每分每秒，你的世界都在運轉；每個好、每個壞，都是你宇宙的養分。」
//
// mountCosmos(host, { levels: [{ day, title, thumb, color, missed }], emotions: { day: [詞] }, me: url|null, labels, mode })
//   mode 'story'：一步一步來（focus → split → showLevels → splitAll → gather）
//   mode 'orbit'：一開始就是所有情緒圍繞著他（回顧影片的背景）
export function mountCosmos(host, opts) {
  const { levels = [], emotions = {}, me = null, name = '你' } = opts;
  const labels = opts.labels !== false;
  const cv = document.createElement('canvas');
  cv.className = 'cosmos-cv';
  host.append(cv);
  const g = cv.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let W = 0, H = 0;
  const resize = () => { W = host.clientWidth || innerWidth; H = host.clientHeight || innerHeight; cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px'; g.setTransform(dpr, 0, 0, dpr, 0, 0); };
  resize(); addEventListener('resize', resize);
  const load = (u) => { if (!u) return null; const im = new Image(); im.src = u; return im; };
  const meImg = load(me);

  const dust = Array.from({ length: 200 }, () => ({ a: Math.random() * 6.283, r: Math.random(), s: Math.random() * 1.4 + 0.3, tw: Math.random() * 6.28 }));
  // 關卡
  const L = levels.map((l, i) => ({ ...l, img: load(l.thumb), i, alpha: 0, scale: 1, split: false, flash: 0, x: 0, y: 0 }));
  const byDay = Object.fromEntries(L.map((l) => [l.day, l]));
  // 情緒粒子
  const P = [];
  L.forEach((l) => (emotions[l.day] || []).forEach((w, j) => P.push({ l, word: w, j, state: 'held', x: 0, y: 0, alpha: 0, ba: Math.random() * 6.283, br: 0.5 + Math.random() * 0.5, ring: 0, a0: 0 })));
  P.forEach((p, k) => { p.ring = 0.34 + ((k * 7) % P.length) / Math.max(1, P.length - 1) * 0.64; p.a0 = (k * 2.39996) % 6.283; p.w = 0.32 / (0.35 + p.ring); });
  let focusDay = null, levelsOn = false, meAlpha = 0, meOn = false;
  let k = opts.speed ?? 1, target = k, rot = 0, last = performance.now(), alive = true;

  const levelPos = (l, cx, cy, R) => {
    if (l.day === focusDay && !levelsOn) return [cx, cy];
    const others = L.filter((x) => x.day !== focusDay || levelsOn);
    const idx = others.indexOf(l);
    const a = (idx / others.length) * 6.283 + rot * 0.15 - 1.57;
    return [cx + Math.cos(a) * R * 0.62, cy + Math.sin(a) * R * 0.62 * 0.8];
  };
  const orbitPos = (p, cx, cy) => { const a = p.a0 + rot * p.w; const rx = W * 0.47, ry = Math.min(H * 0.34, W * 0.8); return [cx + Math.cos(a) * p.ring * rx, cy + Math.sin(a) * p.ring * ry, Math.sin(a)]; };

  if (opts.mode === 'orbit') { P.forEach((p) => { p.state = 'orbit'; p.alpha = 1; }); meOn = true; meAlpha = 1; }
  let placed = opts.mode === 'orbit' ? false : true;

  const circleImg = (im, x, y, r, col, a) => {
    g.save(); g.globalAlpha = a;
    const gr = g.createRadialGradient(x, y, r * 0.3, x, y, r * 2.6); gr.addColorStop(0, col + '99'); gr.addColorStop(1, col + '00');
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r * 2.6, 0, 6.283); g.fill();
    g.beginPath(); g.arc(x, y, r, 0, 6.283); g.closePath(); g.save(); g.clip();
    if (im && im.complete && im.naturalWidth) { const s = Math.max((2 * r) / im.naturalWidth, (2 * r) / im.naturalHeight); g.drawImage(im, x - (im.naturalWidth * s) / 2, y - (im.naturalHeight * s) / 2, im.naturalWidth * s, im.naturalHeight * s); }
    else { g.fillStyle = col; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
    g.restore();
    g.strokeStyle = col; g.lineWidth = 1.5; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.stroke();
    g.restore();
  };

  const frame = (now) => {
    if (!alive) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    k += (target - k) * Math.min(1, dt * 1.4); rot += dt * k;
    const cx = W / 2, cy = H * (opts.cy ?? 0.44), R = Math.min(W, H * 0.9) * 0.5;
    const m = Math.min(W, H);
    g.fillStyle = '#05070f'; g.fillRect(0, 0, W, H);
    // 星塵
    for (const d of dust) {
      d.a += dt * k * 0.04 * (0.4 + d.r); d.tw += dt * 2;
      const rr = (0.15 + d.r * 0.95) * Math.max(W, H) * 0.62, x = cx + Math.cos(d.a) * rr, y = cy + Math.sin(d.a) * rr * 0.7;
      g.globalAlpha = 0.2 + 0.3 * Math.abs(Math.sin(d.tw)); g.fillStyle = '#cfe6ff';
      if (k > 2.5) { g.strokeStyle = '#cfe6ff'; g.lineWidth = d.s; g.beginPath(); g.moveTo(x, y); g.lineTo(cx + Math.cos(d.a - 0.025 * k) * rr, cy + Math.sin(d.a - 0.025 * k) * rr * 0.7); g.stroke(); }
      else g.fillRect(x, y, d.s, d.s);
    }
    g.globalAlpha = 1;
    // 他（中心）
    meAlpha += ((meOn ? 1 : 0) - meAlpha) * Math.min(1, dt * 1.2);
    // 關卡
    for (const l of L) {
      const on = !l.split && (l.day === focusDay || levelsOn);
      l.alpha += ((on ? 1 : 0) - l.alpha) * Math.min(1, dt * (l.split ? 3 : 1.6));
      l.flash = Math.max(0, l.flash - dt * 1.6);
      const [x, y] = levelPos(l, cx, cy, R); l.x = x; l.y = y;
      const big = l.day === focusDay && !levelsOn;
      const r = (big ? 0.15 : 0.06) * m * (1 + (1 - l.alpha) * (l.split ? 0.6 : 0));
      if (l.alpha > 0.02) {
        circleImg(l.img, x, y, r, l.color, l.alpha * (l.missed ? 0.5 : 1));
        if (labels && l.alpha > 0.4) { g.globalAlpha = l.alpha; g.fillStyle = '#eaf4ff'; g.font = `${big ? 600 : 400} ${big ? 15 : 11}px "Noto Sans TC", system-ui, sans-serif`; g.textAlign = 'center'; g.fillText(l.title, x, y + r + (big ? 22 : 14)); g.globalAlpha = 1; }
      }
      if (l.flash > 0) { g.globalAlpha = l.flash; const gr = g.createRadialGradient(x, y, 0, x, y, r * 3); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, l.color + '00'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r * 3, 0, 6.283); g.fill(); g.globalAlpha = 1; }
    }
    // 情緒
    const front = [];
    for (const p of P) {
      let tx, ty, z = 0;
      if (p.state === 'held') { tx = p.l.x; ty = p.l.y; }
      else if (p.state === 'free') { const n = (emotions[p.l.day] || []).length || 1; const big = p.l.day === focusDay && !levelsOn; const rr = (big ? 0.3 : 0.12 + p.br * 0.05) * m; const a = p.l.i * 0.9 + rot * 0.35 + (p.j * 6.283) / n; tx = p.l.x + Math.cos(a) * rr; ty = p.l.y + Math.sin(a) * rr * (big ? 1.1 : 0.85); }
      else { [tx, ty, z] = orbitPos(p, cx, cy); }
      if (!placed) { p.x = tx; p.y = ty; }
      const f = Math.min(1, dt * (p.state === 'orbit' ? 1.3 : 2.4));
      p.x += (tx - p.x) * f; p.y += (ty - p.y) * f; p.z = z;
      p.alpha += ((p.state === 'held' ? 0 : 1) - p.alpha) * Math.min(1, dt * 2);
      (z < 0 ? drawEmotion : (q) => front.push(q))(p);
    }
    placed = true;
    if (meAlpha > 0.02) {
      const r = 0.1 * m * (1 + 0.03 * Math.sin(now / 500));
      if (meImg) {
        circleImg(meImg, cx, cy, r, '#ffd79a', meAlpha);
        g.globalAlpha = meAlpha; g.fillStyle = '#ffe7b8'; g.font = `700 ${Math.round(r * 0.36)}px "Noto Sans TC", system-ui, sans-serif`; g.textAlign = 'center';
        g.shadowColor = 'rgba(255,181,71,.8)'; g.shadowBlur = 12; g.fillText(name, cx, cy + r + r * 0.5); g.shadowBlur = 0; g.globalAlpha = 1;
      }
      else {
        g.globalAlpha = meAlpha; const gr = g.createRadialGradient(cx, cy, 0, cx, cy, r * 1.8); gr.addColorStop(0, '#fff6dc'); gr.addColorStop(0.5, '#ffd79a'); gr.addColorStop(1, '#ffd79a00');
        g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, r * 1.8, 0, 6.283); g.fill();
        g.fillStyle = '#2a1a05'; g.font = `700 ${Math.round(r * (name.length > 2 ? 0.42 : 0.62))}px "Noto Sans TC", system-ui, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(name, cx, cy); g.textBaseline = 'alphabetic'; g.globalAlpha = 1;
      }
    }
    front.forEach(drawEmotion);
    requestAnimationFrame(frame);
  };
  function drawEmotion(p) {
    if (p.alpha < 0.02) return;
    const depth = p.state === 'orbit' ? 0.75 + 0.25 * (p.z + 1) / 2 : 1;
    g.globalAlpha = p.alpha * depth * (p.l.missed ? 0.65 : 1);
    const r = 3.2 * depth;
    const gr = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4); gr.addColorStop(0, p.l.color); gr.addColorStop(1, p.l.color + '00');
    g.fillStyle = gr; g.beginPath(); g.arc(p.x, p.y, r * 4, 0, 6.283); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(p.x, p.y, r * 0.7, 0, 6.283); g.fill();
    if (labels) { g.fillStyle = '#f2f7ff'; g.font = `500 ${Math.round(12.5 * depth)}px "Noto Sans TC", system-ui, sans-serif`; g.textAlign = 'center'; g.fillText(p.word, p.x, p.y - r * 2.2); }
    g.globalAlpha = 1;
  }
  requestAnimationFrame(frame);

  const splitLevel = (l) => { if (!l || l.split) return; l.split = true; l.flash = 1; P.filter((p) => p.l === l).forEach((p) => { p.x = l.x; p.y = l.y; p.state = 'free'; }); };
  return {
    el: cv,
    speed: (v) => { target = v; },
    focus: (day) => { focusDay = day; },
    split: (day) => splitLevel(byDay[day]),
    showLevels: () => { levelsOn = true; },
    splitAll: (stagger = 260) => new Promise((done) => { const rest = L.filter((l) => !l.split); rest.forEach((l, i) => setTimeout(() => { splitLevel(l); if (i === rest.length - 1) done(); }, i * stagger)); if (!rest.length) done(); }),
    gather: () => { meOn = true; P.forEach((p) => { p.state = 'orbit'; }); },
    stop: () => { alive = false; removeEventListener('resize', resize); cv.remove(); },
  };
}
