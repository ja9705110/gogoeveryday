// 11/18 終章：十個關卡化成星球，開始繞著轉動——「每分每秒，你的世界都在運轉」
// bodies: [{ day, title, thumb, color, fav, missed }]
// 回傳 { stop(), speed(k), el }
export function mountCosmos(host, bodies, opts = {}) {
  const cv = document.createElement('canvas');
  cv.className = 'cosmos-cv';
  host.append(cv);
  const g = cv.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let W = 0, H = 0;
  const resize = () => { W = host.clientWidth || innerWidth; H = host.clientHeight || innerHeight; cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px'; g.setTransform(dpr, 0, 0, dpr, 0, 0); };
  resize(); addEventListener('resize', resize);

  // 背景星塵
  const dust = Array.from({ length: 220 }, () => ({ a: Math.random() * Math.PI * 2, r: Math.random(), s: Math.random() * 1.4 + 0.3, tw: Math.random() * 6.28 }));
  // 星球：最喜歡的那一關在中心；其他關卡在不同軌道上
  const imgs = {};
  bodies.forEach((b) => { if (b.thumb) { const im = new Image(); im.crossOrigin = 'anonymous'; im.src = b.thumb; imgs[b.day] = im; } });
  const fav = bodies.find((b) => b.fav);
  const rest = bodies.filter((b) => !b.fav);
  const orbits = rest.map((b, i) => ({ b, ring: 0.26 + (i / Math.max(1, rest.length - 1)) * 0.62, a: (i * 2.39996) % (Math.PI * 2), w: 0.55 / (0.6 + i * 0.22), size: b.missed ? 0.035 : 0.05 }));
  let k = opts.speed ?? 1; let target = k; let t0 = performance.now(); let last = t0; let alive = true; let rot = 0;
  const label = opts.labels !== false;

  const planet = (x, y, r, b, glow) => {
    const col = b.color || '#3ff4ff';
    const gr = g.createRadialGradient(x, y, r * 0.2, x, y, r * (glow ? 3.2 : 2.2));
    gr.addColorStop(0, col + (b.missed ? '55' : 'aa')); gr.addColorStop(1, col + '00');
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r * (glow ? 3.2 : 2.2), 0, 6.283); g.fill();
    g.save(); g.beginPath(); g.arc(x, y, r, 0, 6.283); g.closePath(); g.clip();
    const im = imgs[b.day];
    if (im && im.complete && im.naturalWidth && !b.missed) {
      const s = Math.max((2 * r) / im.naturalWidth, (2 * r) / im.naturalHeight);
      g.drawImage(im, x - (im.naturalWidth * s) / 2, y - (im.naturalHeight * s) / 2, im.naturalWidth * s, im.naturalHeight * s);
      g.fillStyle = 'rgba(10,16,30,.18)'; g.fillRect(x - r, y - r, 2 * r, 2 * r);
    } else { g.fillStyle = b.missed ? '#2a3442' : col; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
    g.restore();
    g.strokeStyle = col; g.globalAlpha = b.missed ? 0.4 : 0.9; g.lineWidth = glow ? 2 : 1.2; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.stroke(); g.globalAlpha = 1;
    if (label) {
      g.fillStyle = b.missed ? 'rgba(200,210,225,.45)' : 'rgba(235,245,255,.9)';
      g.font = `${glow ? 600 : 400} ${glow ? 13 : 11}px "Noto Sans TC", system-ui, sans-serif`; g.textAlign = 'center';
      g.fillText(b.title, x, y + r + (glow ? 18 : 14));
    }
  };

  const frame = (now) => {
    if (!alive) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    k += (target - k) * Math.min(1, dt * 1.6);
    rot += dt * k;
    const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.5;
    g.fillStyle = '#05070f'; g.fillRect(0, 0, W, H);
    // 星塵（隨速度拉出拖尾）
    for (const d of dust) {
      d.a += dt * k * 0.05 * (0.4 + d.r); d.tw += dt * 2;
      const rr = (0.15 + d.r * 0.95) * Math.max(W, H) * 0.62;
      const x = cx + Math.cos(d.a) * rr, y = cy + Math.sin(d.a) * rr * 0.62;
      g.globalAlpha = 0.25 + 0.35 * Math.abs(Math.sin(d.tw));
      g.fillStyle = '#cfe6ff';
      if (k > 3) { g.strokeStyle = '#cfe6ff'; g.lineWidth = d.s; g.beginPath(); g.moveTo(x, y); g.lineTo(cx + Math.cos(d.a - 0.02 * k) * rr, cy + Math.sin(d.a - 0.02 * k) * rr * 0.62); g.stroke(); }
      else g.fillRect(x, y, d.s, d.s);
    }
    g.globalAlpha = 1;
    // 軌道
    for (const o of orbits) {
      g.strokeStyle = 'rgba(120,180,255,.10)'; g.lineWidth = 1;
      g.beginPath(); g.ellipse(cx, cy, o.ring * R, o.ring * R * 0.62, 0, 0, 6.283); g.stroke();
    }
    // 星球（依 y 排序，前面的蓋住後面的）
    const pts = orbits.map((o) => { const a = o.a + rot * o.w; return { o, x: cx + Math.cos(a) * o.ring * R, y: cy + Math.sin(a) * o.ring * R * 0.62, z: Math.sin(a) }; });
    const draw = (p) => planet(p.x, p.y, Math.max(10, o2r(p.o) * (0.85 + 0.25 * (p.z + 1) / 2)), p.o.b, false);
    const o2r = (o) => o.size * Math.min(W, H) * (opts.planetScale || 1);
    pts.filter((p) => p.z < 0).sort((a, b) => a.y - b.y).forEach(draw);
    if (fav) {
      const pulse = 1 + 0.04 * Math.sin(now / 420);
      planet(cx, cy, Math.min(W, H) * 0.1 * pulse * (opts.planetScale || 1), fav, true);
    }
    pts.filter((p) => p.z >= 0).sort((a, b) => a.y - b.y).forEach(draw);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  return {
    el: cv,
    speed: (v) => { target = v; },
    stop: () => { alive = false; removeEventListener('resize', resize); cv.remove(); },
  };
}
