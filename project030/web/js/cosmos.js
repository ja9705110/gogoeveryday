// 11/18 終章：他選的關卡分裂成情緒 → 每一關都分裂成情緒 → 所有情緒圍繞著「Jasper」這顆星球轉動
// 「每分每秒，你的世界都在運轉；每個好、每個壞，都是你宇宙的養分。」
// 中心的星球就是「重建中的星球」（planet.js），依他十天的完成狀態長出每一層
//
// mountCosmos(host, { levels: [{ day, title, thumb, color, missed }], emotions: { day: [詞] }, states, name, labels, mode })
//   mode 'story'：一步一步來（focus → split → showLevels → splitAll → gather）
//   mode 'orbit'：一開始就是所有情緒圍繞著他（回顧影片的背景）
import { mountPlanet } from './planet.js';

const TILT = -0.35; // 跟星球的星環同一個傾斜角度

export function mountCosmos(host, opts) {
  const { levels = [], emotions = {}, states = {}, name = 'Jasper', tint = null } = opts;
  const labels = opts.labels !== false;
  const wrap = document.createElement('div'); wrap.className = 'cosmos-wrap';
  const mk = (cls) => { const c = document.createElement('canvas'); c.className = 'cosmos-cv ' + cls; wrap.append(c); return c; };
  const back = mk('back'); const pc = document.createElement('canvas'); pc.className = 'cosmos-planet'; wrap.append(pc); const fore = mk('fore');
  host.append(wrap);
  const gb = back.getContext('2d'), gf = fore.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let W = 0, H = 0;
  const resize = () => {
    W = host.clientWidth || innerWidth; H = host.clientHeight || innerHeight;
    for (const [c, g] of [[back, gb], [fore, gf]]) { c.width = W * dpr; c.height = H * dpr; c.style.width = W + 'px'; c.style.height = H + 'px'; g.setTransform(dpr, 0, 0, dpr, 0, 0); }
  };
  resize(); addEventListener('resize', resize);
  const load = (u) => { if (!u) return null; const im = new Image(); im.src = u; return im; };
  const cyOf = () => H * (opts.cy ?? 0.44);

  // 中心：重建中的星球 = Jasper
  const PS = Math.round(Math.min(W, H) * 0.8);
  pc.style.width = PS + 'px'; pc.style.height = PS + 'px';
  pc.style.left = (W / 2 - PS / 2) + 'px'; pc.style.top = (cyOf() - PS / 2) + 'px';
  // 最後的成果：星球用他選的代表色；旁邊的衛星不出現
  const stopPlanet = mountPlanet(pc, states, { size: PS, tint, noMoon: true });
  const PR = PS * 0.27; // 星球半徑（planet.js 的比例）

  const stars = Array.from({ length: 160 }, () => ({ x: Math.random(), y: Math.random(), s: Math.random() * 1.3 + 0.3, tw: Math.random() * 6.28 }));
  const L = levels.map((l, i) => ({ ...l, img: load(l.thumb), i, alpha: 0, split: false, flash: 0, x: 0, y: 0 }));
  const byDay = Object.fromEntries(L.map((l) => [l.day, l]));
  const P = [];
  L.forEach((l) => (emotions[l.day] || []).forEach((w, j) => P.push({ l, word: w, j, state: 'held', x: 0, y: 0, z: 0, alpha: 0, br: 0.5 + Math.random() * 0.5 })));
  // 情緒排在幾圈傾斜的軌道上；內圈轉得快
  P.forEach((p, k) => { p.ring = 0.52 + ((k * 7) % P.length) / Math.max(1, P.length - 1) * 0.5; p.a0 = (k * 2.39996) % 6.283; p.w = 0.3 / (0.3 + p.ring); });
  let focusDay = null, levelsOn = false, meOn = false, meAlpha = 0;
  let k = opts.speed ?? 1, target = k, rot = 0, last = performance.now(), alive = true;

  const levelPos = (l, cx, cy, R) => {
    if (l.day === focusDay && !levelsOn) return [cx, cy];
    const idx = L.indexOf(l);
    const a = (idx / L.length) * 6.283 + rot * 0.15 - 1.57;
    return [cx + Math.cos(a) * R * 0.66, cy + Math.sin(a) * R * 0.66 * 0.85];
  };
  // 傾斜的橢圓軌道（跟星環同角度）；z<0 在星球後面
  const orbitPos = (p, cx, cy) => {
    const a = p.a0 + rot * p.w; const rx = W * 0.5 * p.ring * 1.02, ry = Math.min(H * 0.3, W * 0.62) * p.ring * 0.62;
    const ox = Math.cos(a) * rx, oy = Math.sin(a) * ry;
    return [cx + ox * Math.cos(TILT) - oy * Math.sin(TILT), cy + ox * Math.sin(TILT) + oy * Math.cos(TILT), Math.sin(a)];
  };
  if (opts.mode === 'orbit') { P.forEach((p) => { p.state = 'orbit'; p.alpha = 1; }); meOn = true; meAlpha = 1; }
  let placed = opts.mode !== 'orbit';

  const circleImg = (g, im, x, y, r, col, a) => {
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
  const drawEmotion = (g, p) => {
    if (p.alpha < 0.02) return;
    const depth = p.state === 'orbit' ? 0.7 + 0.3 * (p.z + 1) / 2 : 1;
    g.globalAlpha = p.alpha * depth * (p.l.missed ? 0.65 : 1);
    const r = 3.2 * depth;
    const gr = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4); gr.addColorStop(0, p.l.color); gr.addColorStop(1, p.l.color + '00');
    g.fillStyle = gr; g.beginPath(); g.arc(p.x, p.y, r * 4, 0, 6.283); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(p.x, p.y, r * 0.7, 0, 6.283); g.fill();
    if (labels) { g.fillStyle = '#f2f0ff'; g.font = `500 ${Math.round(12.5 * depth)}px "Noto Sans TC", system-ui, sans-serif`; g.textAlign = 'center'; g.shadowColor = 'rgba(10,8,40,.9)'; g.shadowBlur = 6; g.fillText(p.word, p.x, p.y - r * 2.2); g.shadowBlur = 0; }
    g.globalAlpha = 1;
  };

  const frame = (now) => {
    if (!alive) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    k += (target - k) * Math.min(1, dt * 1.4); rot += dt * k;
    const cx = W / 2, cy = cyOf(), R = Math.min(W, H * 0.9) * 0.5, m = Math.min(W, H);
    // 背景：靛紫色漸層＋慢慢轉動的光芒（跟「重建中的星球」同一種風格）
    let g = gb;
    const bg = g.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.75);
    bg.addColorStop(0, '#3b3c7e'); bg.addColorStop(0.45, '#1f2152'); bg.addColorStop(1, '#070818');
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    g.save(); g.translate(cx, cy); g.rotate(rot * 0.04);
    for (let i = 0; i < 8; i++) {
      g.rotate(Math.PI / 4);
      const len = Math.max(W, H) * 0.9;
      const ray = g.createLinearGradient(0, 0, 0, -len); ray.addColorStop(0, 'rgba(190,170,255,0)'); ray.addColorStop(0.3, 'rgba(190,170,255,.16)'); ray.addColorStop(1, 'rgba(190,170,255,0)');
      g.fillStyle = ray; g.beginPath(); g.moveTo(-3, 0); g.lineTo(3, 0); g.lineTo(14, -len); g.lineTo(-14, -len); g.fill();
    }
    g.restore();
    for (const s of stars) {
      s.tw += dt * 1.5; g.globalAlpha = 0.25 + 0.45 * Math.abs(Math.sin(s.tw)); g.fillStyle = '#e6e2ff';
      const sx = (s.x * W + rot * 2 * s.s) % W, sy = s.y * H;
      if (k > 2.5) { g.strokeStyle = '#e6e2ff'; g.lineWidth = s.s; g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx - k * 3 * s.s, sy); g.stroke(); } else g.fillRect(sx, sy, s.s, s.s);
    }
    g.globalAlpha = 1;
    gf.clearRect(0, 0, W, H);
    // 軌道線（淡）
    meAlpha += ((meOn ? 1 : 0) - meAlpha) * Math.min(1, dt * 1.1);
    pc.style.opacity = meAlpha.toFixed(3);
    if (meAlpha > 0.02) {
      g.save(); g.translate(cx, cy); g.rotate(TILT); g.globalAlpha = 0.5 * meAlpha;
      for (const rr of [0.6, 0.78, 0.96]) { g.strokeStyle = 'rgba(190,170,255,.22)'; g.lineWidth = 1; g.beginPath(); g.ellipse(0, 0, W * 0.5 * rr * 1.02, Math.min(H * 0.3, W * 0.62) * rr * 0.62, 0, 0, 6.283); g.stroke(); }
      g.restore(); g.globalAlpha = 1;
    }
    // 關卡（分裂之前）
    for (const l of L) {
      const on = !l.split && (l.day === focusDay || levelsOn);
      l.alpha += ((on ? 1 : 0) - l.alpha) * Math.min(1, dt * (l.split ? 3 : 1.6));
      l.flash = Math.max(0, l.flash - dt * 1.6);
      const [x, y] = levelPos(l, cx, cy, R); l.x = x; l.y = y;
      const big = l.day === focusDay && !levelsOn;
      const r = (big ? 0.15 : 0.06) * m * (1 + (1 - l.alpha) * (l.split ? 0.6 : 0));
      if (l.alpha > 0.02) {
        circleImg(gf, l.img, x, y, r, l.color, l.alpha * (l.missed ? 0.5 : 1));
        if (labels && l.alpha > 0.4) { gf.globalAlpha = l.alpha; gf.fillStyle = '#eaf4ff'; gf.font = `${big ? 600 : 400} ${big ? 15 : 11}px "Noto Sans TC", system-ui, sans-serif`; gf.textAlign = 'center'; gf.fillText(l.title, x, y + r + (big ? 22 : 14)); gf.globalAlpha = 1; }
      }
      // 他選的那一關：在圈上用金色光圈標出來
      if (levelsOn && l.day === focusDay && !l.split && l.alpha > 0.3) { const pr = r * (1.45 + 0.12 * Math.sin(now / 260)); gf.globalAlpha = l.alpha; gf.strokeStyle = 'rgba(255,215,154,.95)'; gf.lineWidth = 2.5; gf.shadowColor = 'rgba(255,190,110,.9)'; gf.shadowBlur = 14; gf.beginPath(); gf.arc(x, y, pr, 0, 6.283); gf.stroke(); gf.shadowBlur = 0; gf.globalAlpha = 1; }
      if (l.flash > 0) { gf.globalAlpha = l.flash; const gr = gf.createRadialGradient(x, y, 0, x, y, r * 3); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, l.color + '00'); gf.fillStyle = gr; gf.beginPath(); gf.arc(x, y, r * 3, 0, 6.283); gf.fill(); gf.globalAlpha = 1; }
    }
    // 情緒：在星球後面的畫在後層，前面的畫在前層
    for (const p of P) {
      let tx, ty, z = 0;
      if (p.state === 'held') { tx = p.l.x; ty = p.l.y; }
      else if (p.state === 'free') { const n = (emotions[p.l.day] || []).length || 1; const big = p.l.day === focusDay && !levelsOn; const rr = (big ? 0.3 : 0.12 + p.br * 0.05) * m; const a = p.l.i * 0.9 + rot * 0.35 + (p.j * 6.283) / n; tx = p.l.x + Math.cos(a) * rr; ty = p.l.y + Math.sin(a) * rr * (big ? 1.1 : 0.85); }
      else { [tx, ty, z] = orbitPos(p, cx, cy); }
      if (!placed) { p.x = tx; p.y = ty; }
      const f = Math.min(1, dt * (p.state === 'orbit' ? 1.3 : 2.4));
      p.x += (tx - p.x) * f; p.y += (ty - p.y) * f; p.z = z;
      p.alpha += ((p.state === 'held' ? 0 : 1) - p.alpha) * Math.min(1, dt * 2);
      // 在星球正後方的會被星球擋住
      const behind = p.state === 'orbit' && z < 0;
      if (behind && meAlpha > 0.5 && Math.hypot(p.x - cx, p.y - cy) < PR * 0.95) continue;
      drawEmotion(behind ? gb : gf, p);
    }
    placed = true;
    // 名字
    if (meAlpha > 0.02 && name) {
      gf.globalAlpha = meAlpha; gf.fillStyle = '#fff1d6'; gf.font = `700 ${Math.round(Math.max(18, PR * 0.32))}px "Noto Sans TC", system-ui, sans-serif`; gf.textAlign = 'center';
      gf.shadowColor = 'rgba(255,190,120,.85)'; gf.shadowBlur = 16; gf.fillText(name, cx, cy + PR + PR * 0.62); gf.shadowBlur = 0; gf.globalAlpha = 1;
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  const splitLevel = (l) => { if (!l || l.split) return; l.split = true; l.flash = 1; P.filter((p) => p.l === l).forEach((p) => { p.x = l.x; p.y = l.y; p.state = 'free'; }); };
  return {
    el: wrap,
    speed: (v) => { target = v; },
    focus: (day) => { focusDay = day; },
    split: (day) => splitLevel(byDay[day]),
    showLevels: () => { levelsOn = true; },
    splitAll: (stagger = 260) => new Promise((done) => { const rest = L.filter((l) => !l.split); rest.forEach((l, i) => setTimeout(() => { splitLevel(l); if (i === rest.length - 1) done(); }, i * stagger)); if (!rest.length) done(); }),
    gather: () => { meOn = true; P.forEach((p) => { p.state = 'orbit'; }); },
    stop: () => { alive = false; stopPlanet(); removeEventListener('resize', resize); wrap.remove(); },
  };
}

// ── 終章開場：十個片段從海底浮上海面，再一起升上天空 ──
// levels: [{ day, title, missed }]；回傳 { play(say), fadeOut(), stop() }
export function mountSeaRise(host, levels) {
  const cv = document.createElement('canvas'); cv.className = 'cosmos-cv sea-rise';
  host.append(cv);
  const g = cv.getContext('2d'); const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let W = 0, H = 0;
  const resize = () => { W = host.clientWidth || innerWidth; H = host.clientHeight || innerHeight; cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px'; g.setTransform(dpr, 0, 0, dpr, 0, 0); };
  resize(); addEventListener('resize', resize);
  const seed = (i) => { const x = Math.sin(i * 999) * 10000; return x - Math.floor(x); };
  const stars = Array.from({ length: 150 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.4 + 0.2, p: Math.random() * 6 }));
  const motes = Array.from({ length: 60 }, () => ({ x: Math.random(), y: Math.random(), s: 0.2 + Math.random() * 0.6 }));
  const F = levels.map((l, i) => ({ ...l, i, depth: 0.25 + seed(i + 3) * 0.6, x: 0, y: 0, risen: 0, sky: 0, ripple: -1 }));
  let phase = 'deep', t0 = performance.now(), pan = 0, alive = true, last = t0;
  const ringPos = (i, cx, cy) => { const R = Math.min(W, H * 0.9) * 0.5; const a = (i / F.length) * 6.283 - 1.57; return [cx + Math.cos(a) * R * 0.66, cy + Math.sin(a) * R * 0.66 * 0.85]; };
  const orb = (x, y, r, color, a = 1) => { const gr = g.createRadialGradient(x, y, 0, x, y, r * 3); gr.addColorStop(0, `rgba(${color},${a})`); gr.addColorStop(0.3, `rgba(${color},${a * 0.4})`); gr.addColorStop(1, `rgba(${color},0)`); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r * 3, 0, 7); g.fill(); };
  const frame = (now) => {
    if (!alive) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (phase === 'sky') pan = Math.min(1, pan + dt / 3.2);
    const ease = pan * pan * (3 - 2 * pan);
    const hz = H * (0.46 + ease * 0.75); // 升空時海平面往下退出畫面
    // 天空：從深夜藍漸漸轉成宇宙的靛紫
    const sky = g.createLinearGradient(0, 0, 0, Math.max(hz, 1));
    sky.addColorStop(0, ease > 0 ? `rgb(${2 + 29 * ease},${3 + 30 * ease},${11 + 70 * ease})` : '#02030b'); sky.addColorStop(1, `rgb(${10 + 21 * ease},${30 + 3 * ease},${70 + 30 * ease})`);
    g.fillStyle = sky; g.fillRect(0, 0, W, H);
    for (const s of stars) { const tw = 0.4 + 0.6 * Math.abs(Math.sin(now * 0.0012 + s.p)); g.fillStyle = `rgba(220,235,255,${tw})`; g.beginPath(); g.arc(s.x * W, s.y * hz * 0.95, s.r, 0, 7); g.fill(); }
    // 海
    if (hz < H) {
      const ocean = g.createLinearGradient(0, hz, 0, H + H * 0.4); ocean.addColorStop(0, 'rgba(8,40,80,1)'); ocean.addColorStop(1, '#010409');
      g.fillStyle = ocean; g.fillRect(0, hz, W, H - hz);
      for (let j = 0; j < 6; j++) { g.strokeStyle = `rgba(63,244,255,${0.2 - j * 0.028})`; g.lineWidth = 1; g.beginPath(); for (let x = 0; x <= W; x += 6) { const y = hz + j * j * 6 + Math.sin(x * 0.012 + now * 0.0012 + j) * (2 + j); x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
      g.fillStyle = 'rgba(160,230,255,.05)'; g.fillRect(W * 0.45, hz, W * 0.1, H - hz);
      for (const m of motes) { m.y -= m.s * 0.0008; if (m.y < 0) m.y = 1; const my = hz + m.y * (H - hz); g.fillStyle = 'rgba(63,244,255,.3)'; g.fillRect(m.x * W + Math.sin(now * 0.001 + m.s * 10) * 4, my, 1.5, 1.5); }
    }
    // 片段
    for (const f of F) {
      const bx = W * (0.08 + (f.i / Math.max(1, F.length - 1)) * 0.84);
      const deepY = hz + 40 + f.depth * (H * 0.34 - 40);
      const surfY = hz - 14;
      let x = bx, y = deepY + (surfY - deepY) * f.risen;
      if (f.sky > 0) { const [tx, ty] = ringPos(f.i, W / 2, H * 0.44); const k = f.sky * f.sky * (3 - 2 * f.sky); x = bx + (tx - bx) * k; y = surfY + (ty - surfY) * k; f.sky = Math.min(1, f.sky + dt / 2.6); }
      y += Math.sin(now * 0.002 + f.i) * 3 * (1 - f.sky);
      const col = f.missed ? '180,140,255' : '255,181,71';
      const lit = f.risen >= 1;
      orb(x, y, lit ? 9 + f.sky * 6 : 6, lit ? col : '63,244,255', lit ? 1 : 0.7);
      // 浮出水面時的漣漪
      if (f.ripple >= 0 && f.ripple < 1) { f.ripple += dt / 1.4; g.strokeStyle = `rgba(${col},${0.6 * (1 - f.ripple)})`; g.lineWidth = 1.2; g.beginPath(); g.ellipse(bx, hz, f.ripple * 60, f.ripple * 12, 0, 0, 7); g.stroke(); }
      g.font = '10px "Share Tech Mono", monospace'; g.textAlign = 'center'; g.fillStyle = 'rgba(225,245,255,.85)';
      g.fillText(f.sky > 0.6 ? f.title : String(f.day).padStart(2, '0'), x, y + 24 + f.sky * 6);
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  const rise = (f) => new Promise((done) => { const s = performance.now(); const step = (now) => { if (!alive) return done(); f.risen = Math.min(1, (now - s) / 1500); if (f.risen < 1) requestAnimationFrame(step); else { f.ripple = 0; done(); } }; requestAnimationFrame(step); });
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  return {
    async play(say, sfx) {
      say('<div class="film-line">十天前，檔案 030 碎成十個片段，<br>沉入了深海。</div>');
      await wait(3400);
      say('<div class="film-line">每完成一天，<br>就有一個片段浮上海面。</div>');
      for (const f of F) { if (!alive) return; rise(f).then(() => sfx && sfx('ping')); await wait(520); }
      await wait(1900);
      say('<div class="film-line">現在，它們一起升上了天空。</div>');
      phase = 'sky'; F.forEach((f, i) => setTimeout(() => { f.sky = 0.001; }, i * 90));
      await wait(3400);
    },
    fadeOut: () => new Promise((done) => { cv.style.transition = 'opacity 1.2s'; cv.style.opacity = '0'; setTimeout(() => { alive = false; removeEventListener('resize', resize); cv.remove(); done(); }, 1250); }),
    stop: () => { alive = false; removeEventListener('resize', resize); cv.remove(); },
  };
}
