// 星海背景：星空、極光霧、海平面波紋與上升的光點（背景層，不影響操作）
export function mountBackground() {
  if (document.getElementById('p030-bg')) return;
  const cv = document.createElement('canvas'); cv.id = 'p030-bg';
  document.body.prepend(cv);
  const g = cv.getContext('2d');
  let W, H;
  const resize = () => { const dpr = Math.min(devicePixelRatio || 1, 1.5); W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); };
  resize(); addEventListener('resize', resize);
  const stars = Array.from({ length: 140 }, () => ({ x: Math.random(), y: Math.random() * 0.7, r: Math.random() * 1.2 + 0.2, p: Math.random() * 6 }));
  const motes = Array.from({ length: 45 }, () => ({ x: Math.random(), y: Math.random(), s: 0.15 + Math.random() * 0.5, r: Math.random() * 1.6 + 0.4 }));
  let last = 0;
  const frame = (now) => {
    requestAnimationFrame(frame);
    if (document.hidden || now - last < 33) return; last = now;
    const hz = H * 0.72;
    const sky = g.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#01020a'); sky.addColorStop(0.5, '#03112a'); sky.addColorStop(0.72, '#06264a'); sky.addColorStop(1, '#010612');
    g.fillStyle = sky; g.fillRect(0, 0, W, H);
    const neb = g.createRadialGradient(W * 0.75, H * 0.2, 0, W * 0.75, H * 0.2, W * 0.7);
    neb.addColorStop(0, 'rgba(120,70,220,.14)'); neb.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = neb; g.fillRect(0, 0, W, H);
    for (const s of stars) { const a = 0.3 + 0.7 * Math.abs(Math.sin(now * 0.0009 + s.p)); g.fillStyle = `rgba(210,240,255,${a})`; g.beginPath(); g.arc(s.x * W, s.y * hz, s.r, 0, 7); g.fill(); }
    for (let j = 0; j < 7; j++) {
      g.strokeStyle = `rgba(63,244,255,${0.13 - j * 0.015})`; g.beginPath();
      for (let x = 0; x <= W; x += 8) { const y = hz + j * j * 5 + Math.sin(x * 0.01 + now * 0.0008 + j * 0.7) * (2 + j * 0.8); x ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.stroke();
    }
    for (const m of motes) {
      m.y -= m.s * 0.0004; if (m.y < 0) { m.y = 1; m.x = Math.random(); }
      g.fillStyle = `rgba(120,240,255,${0.15 + 0.25 * Math.sin(now * 0.002 + m.x * 20) ** 2})`;
      g.beginPath(); g.arc(m.x * W + Math.sin(now * 0.0006 + m.s * 9) * 10, m.y * H, m.r, 0, 7); g.fill();
    }
  };
  requestAnimationFrame(frame);
}
