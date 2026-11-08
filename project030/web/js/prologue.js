// 前導影片：星海檔案館（canvas 動畫 + 字幕 + 即時合成音效），約 80 秒，可略過、可重播
import { sound, sfx, ambience } from './audio.js';

const SCENES = [
  { t: 5000, v: 'abyss', lines: ['偵測到來自深處的訊號……'], fx: 'static' },
  { t: 6000, v: 'abyss', lines: ['{date}', '星海檔案館・緊急廣播'], fx: 'ping' },
  { t: 4500, v: 'logo', lines: [], fx: 'static' },
  { t: 8500, v: 'file', lines: ['在星空與深海的交界，漂浮著每一個人的檔案。', '其中一份——編號 030——正在下沉。'], fx: 'type' },
  { t: 9000, v: 'zones', lines: ['它碎成十個片段，沉入不同的深度。', '每個片段，只會浮上海面 24 小時。'], fx: 'type' },
  { t: 10000, v: 'id', lines: ['系統比對了所有觀察員。', '只有一個人的頻率，與檔案 030 完全一致。', '第 1118 號觀察員——是你。'], fx: 'scan' },
  { t: 9000, v: 'rise', lines: ['你的任務：在片段沉沒之前找到它，', '解開機關，回收藏在裡面的符號。', '有些線索，藏在你的現實世界裡。'], fx: 'type' },
  { t: 8500, v: 'sample', lines: ['檔案的核心，會以「樣本」的形態交到你手上。', '每天觀察它一次——它會依照你的方式成長。'], fx: 'ping' },
  { t: 8000, v: 'missed', lines: ['錯過的片段，會沉入更深的海。', '它不會消失，只會長成另一種樣子。'], fx: 'sink' },
  { t: 7500, v: 'final', lines: ['第十一天，所有片段將浮上同一片海面——', '第 030 號檔案室。屆時，檔案將被重新定義。'], fx: 'type' },
  { t: 0, v: 'ready', lines: ['第 1118 號觀察員，連線已建立。', '你的第一個片段，正在浮上海面。'], fx: 'match' },
];

export function playPrologue({ startDate, onDone }) {
  const root = document.createElement('div');
  root.className = 'prologue';
  root.innerHTML = `<canvas></canvas><div class="pl-text"></div>
    <div class="pl-start"><div class="kicker">INCOMING TRANSMISSION</div>
      <h1 style="margin:6px 0 2px">星海檔案館</h1><p class="dim" style="margin:0 0 10px">一段來自深處的訊號正在等待接收</p>
      <button class="btn primary" data-s="on">🔊 開啟聲音・接收訊號</button>
      <button class="btn ghost" data-s="off">🔇 靜音接收</button></div>
    <button class="pl-skip btn ghost sm hidden">略過</button><button class="pl-mute btn ghost sm hidden"></button>
    <div class="pl-bar"><i></i></div>`;
  document.body.append(root);
  const cv = root.querySelector('canvas'), g = cv.getContext('2d');
  const text = root.querySelector('.pl-text'), bar = root.querySelector('.pl-bar i'), muteBtn = root.querySelector('.pl-mute');
  let W, H, raf, scene = -1, sceneStart = 0, alive = true;
  const total = SCENES.reduce((a, s) => a + s.t, 0);
  const resize = () => { const dpr = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); };
  resize(); addEventListener('resize', resize);
  const date = (() => { try { return new Date(startDate + 'T00:00:00+08:00').toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }) + '  00:00'; } catch { return ''; } })();
  const paintMute = () => { muteBtn.textContent = sound.on ? '🔊 聲音開' : '🔇 靜音'; };
  muteBtn.onclick = () => { sound.toggle(); if (sound.on) ambience('prologue', true); paintMute(); };

  const stars = Array.from({ length: 160 }, () => ({ x: Math.random(), y: Math.random() * 0.55, r: Math.random() * 1.4 + 0.2, p: Math.random() * 6 }));
  const motes = Array.from({ length: 60 }, () => ({ x: Math.random(), y: 0.6 + Math.random() * 0.4, s: 0.2 + Math.random() * 0.6 }));

  const finish = () => {
    if (!alive) return; alive = false;
    cancelAnimationFrame(raf); removeEventListener('resize', resize);
    root.classList.add('pl-out'); setTimeout(() => root.remove(), 700);
    ambience('base');
    onDone && onDone();
  };
  root.querySelector('.pl-skip').onclick = finish;

  async function showLines(lines, fx) {
    text.innerHTML = '';
    for (const raw of lines) {
      const p = document.createElement('p'); text.append(p);
      for (const ch of raw.replace('{date}', date)) {
        if (!alive) return;
        p.textContent += ch;
        if (fx === 'type' && ch.trim()) sfx('type');
        await new Promise((r) => setTimeout(r, 55));
      }
      await new Promise((r) => setTimeout(r, 420));
    }
  }
  function next() {
    scene++;
    if (scene >= SCENES.length || !alive) return;
    const s = SCENES[scene];
    sceneStart = performance.now();
    if (s.fx === 'static' || s.fx === 'scan') sfx('static');
    if (s.fx === 'ping') sfx('ping');
    if (s.fx === 'sink') sfx('sink');
    if (s.fx === 'match') sfx('match');
    showLines(s.lines, s.fx);
    if (s.v === 'ready') {
      const brief = document.createElement('div'); brief.className = 'pl-brief';
      brief.innerHTML = `<div class="kicker">MISSION BRIEF</div>
        <dl><dt>身分</dt><dd>第 1118 號觀察員</dd><dt>任務</dt><dd>在十天內，回收檔案 030 沉入深海的 10 個片段與符號</dd>
        <dt>期限</dt><dd>每個片段只在當天 00:00–23:59 浮上海面</dd><dt>每日</dt><dd>進入片段區域・觀察樣本一次</dd>
        <dt>終點</dt><dd>第 11 天，第 030 號檔案室</dd></dl>`;
      const btn = document.createElement('button'); btn.className = 'btn primary pl-go'; btn.textContent = '接受任務';
      setTimeout(() => { if (alive) { text.innerHTML = ''; brief.append(btn); root.append(brief); btn.onclick = () => { sfx('unlock'); finish(); }; } }, 4200);
    } else setTimeout(next, s.t);
  }

  const seed = (i) => { const x = Math.sin(i * 999) * 10000; return x - Math.floor(x); };
  function sea(now, horizon, dark = 0) {
    const sky = g.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0, '#02030b'); sky.addColorStop(1, `rgba(10,30,70,${1 - dark})`);
    g.fillStyle = sky; g.fillRect(0, 0, W, horizon);
    for (const st of stars) {
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(now * 0.0012 + st.p));
      g.fillStyle = `rgba(200,235,255,${tw * (1 - dark)})`; g.beginPath(); g.arc(st.x * W, st.y * horizon * 1.6, st.r, 0, 7); g.fill();
    }
    const ocean = g.createLinearGradient(0, horizon, 0, H);
    ocean.addColorStop(0, `rgba(8,40,80,${1 - dark * 0.5})`); ocean.addColorStop(1, '#010409');
    g.fillStyle = ocean; g.fillRect(0, horizon, W, H - horizon);
    for (let j = 0; j < 6; j++) {
      g.strokeStyle = `rgba(63,244,255,${0.18 - j * 0.025})`; g.lineWidth = 1; g.beginPath();
      for (let x = 0; x <= W; x += 6) { const y = horizon + j * j * 6 + Math.sin(x * 0.012 + now * 0.0012 + j) * (2 + j); x ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.stroke();
    }
    g.fillStyle = 'rgba(160,230,255,.05)'; g.fillRect(W * 0.45, horizon, W * 0.1, H - horizon);
    for (const m of motes) { m.y -= m.s * 0.0006; if (m.y < 0.62) m.y = 1; g.fillStyle = 'rgba(63,244,255,.35)'; g.fillRect(m.x * W + Math.sin(now * 0.001 + m.s * 10) * 4, m.y * H, 1.5, 1.5); }
  }
  function orb(x, y, r, color, a = 1) {
    const gr = g.createRadialGradient(x, y, 0, x, y, r * 3);
    gr.addColorStop(0, `rgba(${color},${a})`); gr.addColorStop(0.3, `rgba(${color},${a * 0.4})`); gr.addColorStop(1, `rgba(${color},0)`);
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r * 3, 0, 7); g.fill();
  }
  function sonar(x, y, now, color = '63,244,255') {
    for (let i = 0; i < 3; i++) { const p = ((now * 0.0005 + i / 3) % 1); g.strokeStyle = `rgba(${color},${0.5 * (1 - p)})`; g.beginPath(); g.ellipse(x, y, p * 140, p * 40, 0, 0, 7); g.stroke(); }
  }

  function draw(now) {
    raf = requestAnimationFrame(draw);
    const s = SCENES[Math.max(0, scene)] || SCENES[0];
    const k = scene < 0 ? 0 : (now - sceneStart) / 1000;
    const elapsed = SCENES.slice(0, Math.max(0, scene)).reduce((a, x) => a + x.t, 0) + Math.min(k * 1000, s.t || 0);
    bar.style.width = Math.min(100, (elapsed / total) * 100) + '%';
    const hz = H * 0.42, cx = W / 2;
    g.clearRect(0, 0, W, H);
    if (scene < 0 || s.v === 'abyss') {
      sea(now, hz, 0.4);
      sonar(cx, hz + 120, now);
      for (let i = 0; i < 120; i++) { g.fillStyle = `rgba(160,220,255,${Math.random() * 0.12})`; g.fillRect(Math.random() * W, Math.random() * H, 2, 1); }
    }
    if (s.v === 'logo') {
      sea(now, hz, 0.6);
      const j = Math.random() < 0.12 ? (Math.random() - 0.5) * 12 : 0, y = hz - 30;
      g.font = `700 ${Math.min(W * 0.11, 60)}px Orbitron, monospace`; g.textAlign = 'center';
      g.fillStyle = 'rgba(255,60,120,.6)'; g.fillText('PROJECT 030', cx + j + 3, y);
      g.fillStyle = 'rgba(60,200,255,.6)'; g.fillText('PROJECT 030', cx - j - 3, y);
      g.fillStyle = '#eafcff'; g.fillText('PROJECT 030', cx + j, y);
      g.globalAlpha = 0.25; g.save(); g.scale(1, -0.6); g.fillText('PROJECT 030', cx, -(hz + 40) / 0.6); g.restore(); g.globalAlpha = 1;
    }
    if (s.v === 'file') {
      sea(now, hz);
      const y = hz - 10 + Math.min(80, k * 12) + Math.sin(now * 0.002) * 4;
      orb(cx, y, 22, '255,181,71', 0.9);
      g.strokeStyle = 'rgba(255,240,200,.8)'; g.strokeRect(cx - 14, y - 18, 28, 36);
      g.font = '10px "Share Tech Mono", monospace'; g.textAlign = 'center'; g.fillStyle = '#fff'; g.fillText('030', cx, y + 4);
      if (k > 3) for (let i = 0; i < 6; i++) { g.strokeStyle = `rgba(255,120,120,${Math.random()})`; g.beginPath(); g.moveTo(cx, y); g.lineTo(cx + (seed(i) - 0.5) * 50, y + (seed(i + 9) - 0.5) * 60); g.stroke(); }
    }
    if (s.v === 'zones' || s.v === 'rise') {
      sea(now, hz);
      for (let i = 0; i < 10; i++) {
        const x = W * (0.1 + i * 0.09);
        const depth = hz + 40 + seed(i) * (H - hz - 140);
        const shown = s.v === 'rise' || k * 1.5 > i;
        if (!shown) continue;
        let y = s.v === 'zones' ? hz + Math.min(1, (k * 1.5 - i) / 1.5) * (depth - hz) : depth - Math.max(0, Math.min(1, (k - 1 - i * 0.4) / 2)) * (depth - hz + 30);
        y += Math.sin(now * 0.002 + i) * 3;
        const lit = s.v === 'rise' && y < hz;
        orb(x, y, lit ? 9 : 6, lit ? '255,181,71' : '63,244,255', lit ? 1 : 0.75);
        g.font = '9px "Share Tech Mono", monospace'; g.textAlign = 'center'; g.fillStyle = 'rgba(220,250,255,.8)'; g.fillText(String(i + 1).padStart(2, '0'), x, y + 22);
      }
      if (s.v === 'zones' && Math.floor(k * 1.5) !== s._last && k * 1.5 < 10) { s._last = Math.floor(k * 1.5); sfx('type'); }
    }
    if (s.v === 'id') {
      sea(now, hz, 0.5);
      const cy = hz - 10, r0 = 60;
      for (let i = 0; i < 7; i++) { g.strokeStyle = `rgba(63,244,255,${0.15 + i * 0.08})`; g.beginPath(); g.ellipse(cx, cy, r0 - i * 8, (r0 - i * 8) * 1.25, 0, Math.PI * (0.15 + i * 0.05), Math.PI * (1.85 - i * 0.04)); g.stroke(); }
      g.fillStyle = 'rgba(63,244,255,.25)'; g.fillRect(cx - 90, cy - 80 + ((k * 60) % 160), 180, 2);
      const pct = Math.min(100, Math.floor(k * 18));
      g.font = '600 14px "Share Tech Mono", monospace'; g.textAlign = 'center';
      g.fillStyle = pct >= 100 ? '#ffb547' : '#3ff4ff'; g.fillText(pct >= 100 ? 'MATCH 100% · OBSERVER 1118' : `MATCHING ${pct}%`, cx, cy + 108);
      if (pct >= 100 && !s._done) { s._done = true; sfx('match'); }
    }
    if (s.v === 'sample') {
      sea(now, hz);
      const cy = hz - 20, r = 26 + Math.sin(now * 0.003) * 4;
      g.strokeStyle = 'rgba(63,244,255,.5)'; g.beginPath(); g.ellipse(cx, cy, 60, 92, 0, 0, 7); g.stroke();
      orb(cx, cy, r / 2, '63,244,255', 0.95);
      for (let i = 0; i < Math.min(6, k * 1.4); i++) { const a = i * 1.05 + now * 0.0004; g.strokeStyle = 'rgba(180,140,255,.7)'; g.beginPath(); g.moveTo(cx, cy); g.quadraticCurveTo(cx + Math.cos(a) * 26, cy + Math.sin(a) * 26, cx + Math.cos(a + 0.4) * 52, cy + Math.sin(a + 0.4) * 52); g.stroke(); }
      for (let i = 0; i < 8; i++) { const by = cy + 80 - ((now * 0.03 + i * 30) % 160); g.strokeStyle = 'rgba(200,250,255,.4)'; g.beginPath(); g.arc(cx - 40 + seed(i) * 80, by, 2 + seed(i + 3) * 3, 0, 7); g.stroke(); }
    }
    if (s.v === 'missed') {
      sea(now, hz, Math.min(0.7, k * 0.12));
      const y = hz + 10 + k * 40;
      orb(cx, y, 7, '255,79,109', Math.max(0.2, 1 - k * 0.1));
      if (k > 3.5) { g.setLineDash([5, 5]); g.strokeStyle = 'rgba(180,140,255,.9)'; g.beginPath(); g.moveTo(cx, y); g.quadraticCurveTo(cx + 90, y - 30, cx + 70, hz + 20); g.stroke(); g.setLineDash([]); orb(cx + 70, hz + 20, 6, '180,140,255', 0.9); }
    }
    if (s.v === 'final' || s.v === 'ready') {
      sea(now, hz);
      const cy = hz - 30;
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2 + now * 0.0003, rr = s.v === 'final' ? 120 - Math.min(80, k * 16) : 40;
        orb(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.5, 4, '255,181,71', 0.9);
      }
      orb(cx, cy, 12, '63,244,255', 0.8);
      sonar(cx, hz + 10, now, '255,181,71');
    }
  }
  raf = requestAnimationFrame(draw);

  root.querySelectorAll('.pl-start button').forEach((b) => (b.onclick = () => {
    sound.set(b.dataset.s === 'on');
    ambience('prologue', true);
    root.querySelector('.pl-start').remove();
    root.querySelector('.pl-skip').classList.remove('hidden');
    muteBtn.classList.remove('hidden'); paintMute();
    next();
  }));
}
