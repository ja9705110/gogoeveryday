// 前導影片：以 canvas 動畫 + 字幕 + WebAudio 音效即時演出（約 60 秒，可略過、可重播）

let audio = null;
function sound() {
  if (audio) return audio;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  const ctx = new Ctx();
  const master = ctx.createGain(); master.gain.value = 0.5; master.connect(ctx.destination);
  const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  audio = {
    ctx, master,
    drone() {
      const g = ctx.createGain(); g.gain.value = 0; g.connect(master);
      [55, 82.4, 110.3].forEach((f, i) => { const o = ctx.createOscillator(); o.type = i ? 'sine' : 'triangle'; o.frequency.value = f; o.connect(g); o.start(); });
      g.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 4);
      return g;
    },
    static(dur = 0.6, vol = 0.25) {
      const s = ctx.createBufferSource(); s.buffer = noiseBuf;
      const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1800;
      const g = ctx.createGain(); g.gain.value = vol; g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      s.connect(f); f.connect(g); g.connect(master); s.start(); s.stop(ctx.currentTime + dur);
    },
    beep(freq = 880, dur = 0.08, vol = 0.12) {
      const o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = freq;
      const g = ctx.createGain(); g.gain.value = vol; g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      o.connect(g); g.connect(master); o.start(); o.stop(ctx.currentTime + dur);
    },
    pulse() { this.beep(220, 0.5, 0.15); },
  };
  return audio;
}

const SCENES = [
  { t: 4500, v: 'noise', lines: ['偵測到未登記的訊號……'], sfx: 'static' },
  { t: 6000, v: 'noise', lines: ['{date}', '時序檔案館・緊急廣播'], sfx: 'beep' },
  { t: 4500, v: 'logo', lines: [], sfx: 'static' },
  { t: 8000, v: 'file', lines: ['這裡保存著每一個人的檔案。', '其中一份——編號 030——正在崩解。'], sfx: 'type' },
  { t: 8500, v: 'zones', lines: ['它碎成了十個片段，散落在接下來的十天裡。', '每個片段只會浮現 24 小時，然後沉回深處。'], sfx: 'type' },
  { t: 9500, v: 'id', lines: ['系統比對了所有觀測員。', '只有一個人的訊號頻率，和檔案 030 完全一致。', '那個人，是你。'], sfx: 'scan' },
  { t: 8500, v: 'zones-solve', lines: ['你的任務：在每個片段消失前進入它，', '解開機關，回收裡面的符號。', '有些線索，藏在你的現實世界裡。'], sfx: 'type' },
  { t: 8000, v: 'sample', lines: ['檔案的核心，會以「樣本」的形式交給你。', '每天觀測它一次——它會依照你的方式成長。'], sfx: 'pulse' },
  { t: 7500, v: 'missed', lines: ['錯過的片段，不會再以原本的樣子出現。', '但檔案不會因此消失，它會長成另一種樣子。'], sfx: 'static' },
  { t: 7000, v: 'final', lines: ['第十一天，所有片段將匯集到第 030 號檔案室。', '屆時，檔案 030 將被重新定義。'], sfx: 'type' },
  { t: 0, v: 'ready', lines: ['第 030 號觀測員，連線已建立。', '你的第一個片段，正在浮現。'], sfx: 'beep' },
];

export function playPrologue({ startDate, onDone }) {
  const root = document.createElement('div');
  root.className = 'prologue';
  root.innerHTML = `<canvas></canvas><div class="pl-text"></div>
    <div class="pl-start"><div class="kicker">INCOMING TRANSMISSION</div><button class="btn primary">▶ 點擊接收訊號</button><p class="dim" style="font-size:12px">建議開啟聲音</p></div>
    <button class="pl-skip btn ghost sm hidden">略過</button><button class="pl-mute btn ghost sm hidden">🔊</button>
    <div class="pl-bar"><i></i></div>`;
  document.body.append(root);
  const cv = root.querySelector('canvas'), g = cv.getContext('2d');
  const text = root.querySelector('.pl-text'), bar = root.querySelector('.pl-bar i');
  let W, H, raf, scene = -1, sceneStart = 0, alive = true, drone, muted = false;
  const total = SCENES.reduce((a, s) => a + s.t, 0);
  const resize = () => { const dpr = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); };
  resize(); addEventListener('resize', resize);
  const date = (() => { try { return new Date(startDate + 'T00:00:00+08:00').toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }) + '  00:00'; } catch { return ''; } })();

  const finish = () => {
    if (!alive) return; alive = false;
    cancelAnimationFrame(raf); removeEventListener('resize', resize);
    if (drone && audio) drone.gain.linearRampToValueAtTime(0, audio.ctx.currentTime + 1);
    root.classList.add('pl-out'); setTimeout(() => root.remove(), 700);
    onDone && onDone();
  };
  root.querySelector('.pl-skip').onclick = finish;
  root.querySelector('.pl-mute').onclick = (e) => { muted = !muted; if (audio) audio.master.gain.value = muted ? 0 : 0.5; e.target.textContent = muted ? '🔇' : '🔊'; };

  async function showLines(lines, sfx) {
    text.innerHTML = '';
    for (const raw of lines) {
      const line = raw.replace('{date}', date);
      const p = document.createElement('p'); text.append(p);
      for (const ch of line) {
        if (!alive) return;
        p.textContent += ch;
        if (sfx === 'type' && audio && ch.trim()) audio.beep(1400 + Math.random() * 300, 0.02, 0.03);
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
    if (audio) { if (s.sfx === 'static') audio.static(0.8); if (s.sfx === 'beep') audio.beep(660, 0.15); if (s.sfx === 'pulse') audio.pulse(); if (s.sfx === 'scan') audio.static(1.6, 0.12); }
    showLines(s.lines, s.sfx);
    if (s.v === 'ready') {
      const brief = document.createElement('div'); brief.className = 'pl-brief';
      brief.innerHTML = `<div class="kicker">MISSION BRIEF</div>
        <dl><dt>身分</dt><dd>第 030 號觀測員</dd><dt>任務</dt><dd>回收檔案 030 的 10 個片段與符號</dd>
        <dt>期限</dt><dd>每個片段只存在當天 00:00–23:59</dd><dt>每日</dt><dd>進入片段區域・觀測樣本一次</dd>
        <dt>終點</dt><dd>第 11 天，第 030 號檔案室</dd></dl>`;
      const btn = document.createElement('button'); btn.className = 'btn primary pl-go'; btn.textContent = '接受任務';
      setTimeout(() => { if (alive) { text.innerHTML = ''; brief.append(btn); root.append(brief); btn.onclick = finish; } }, 4200);
    } else setTimeout(next, s.t);
  }

  const seed = (i) => { const x = Math.sin(i * 999) * 10000; return x - Math.floor(x); };
  function draw(now) {
    raf = requestAnimationFrame(draw);
    const s = SCENES[Math.max(0, scene)] || SCENES[0];
    const k = scene < 0 ? 0 : (now - sceneStart) / 1000;
    const elapsed = SCENES.slice(0, Math.max(0, scene)).reduce((a, x) => a + x.t, 0) + Math.min(k * 1000, s.t || 0);
    bar.style.width = Math.min(100, (elapsed / total) * 100) + '%';
    g.fillStyle = 'rgba(5,7,10,0.35)'; g.fillRect(0, 0, W, H);
    const cx = W / 2, cy = H * 0.36;
    if (scene < 0 || s.v === 'noise') {
      for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(160,220,215,${Math.random() * 0.25})`; g.fillRect(Math.random() * W, Math.random() * H, 2, 1); }
      g.strokeStyle = 'rgba(111,227,210,.6)'; g.beginPath();
      for (let x = 0; x < W; x += 4) { const y = cy + Math.sin(x * 0.03 + now * 0.004) * 20 * Math.sin(now * 0.001) + (Math.random() - 0.5) * 18; x ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.stroke();
    }
    if (s.v === 'logo') {
      g.fillStyle = '#05070a'; g.fillRect(0, 0, W, H);
      const j = Math.random() < 0.15 ? (Math.random() - 0.5) * 14 : 0;
      g.font = `600 ${Math.min(W * 0.12, 64)}px "IBM Plex Mono", monospace`; g.textAlign = 'center';
      g.fillStyle = 'rgba(255,60,90,.7)'; g.fillText('PROJECT 030', cx + j + 3, cy);
      g.fillStyle = 'rgba(60,200,255,.7)'; g.fillText('PROJECT 030', cx - j - 3, cy);
      g.fillStyle = '#e8f6f4'; g.fillText('PROJECT 030', cx + j, cy);
      g.fillRect(cx - 120, cy + 24, 240 * Math.min(1, k / 3), 2);
    }
    if (s.v === 'file') {
      const w = Math.min(W * 0.6, 240), h = w * 1.3;
      g.strokeStyle = 'rgba(111,227,210,.7)'; g.lineWidth = 1.5; g.strokeRect(cx - w / 2, cy - h / 2, w, h);
      g.font = '14px "IBM Plex Mono", monospace'; g.textAlign = 'left'; g.fillStyle = '#6fe3d2'; g.fillText('FILE 030', cx - w / 2 + 14, cy - h / 2 + 26);
      for (let i = 0; i < 9; i++) {
        const y = cy - h / 2 + 50 + i * 20, broken = seed(i) < 0.4 && k > 2.5;
        g.fillStyle = broken ? `rgba(255,122,107,${0.4 + Math.random() * 0.5})` : 'rgba(215,226,234,.35)';
        g.fillRect(cx - w / 2 + 14 + (broken ? (Math.random() - 0.5) * 8 : 0), y, (w - 28) * (0.4 + seed(i + 3) * 0.6) * Math.min(1, k / 1.5), 6);
      }
    }
    if (s.v === 'zones' || s.v === 'zones-solve') {
      const n = 10, size = Math.min((W - 60) / 5 - 10, 54), gap = 10;
      for (let i = 0; i < n; i++) {
        const col = i % 5, row = Math.floor(i / 5);
        const x = cx - (5 * size + 4 * gap) / 2 + col * (size + gap), y = cy - size - gap / 2 + row * (size + gap);
        const shown = s.v === 'zones-solve' || k * 1.6 > i;
        if (!shown) continue;
        const lit = s.v === 'zones-solve' ? seed(i + Math.floor(now / 500)) > 0.55 : (Math.floor(k * 1.6) === i);
        g.strokeStyle = lit ? '#f2b84b' : 'rgba(111,227,210,.5)'; g.lineWidth = lit ? 2 : 1;
        g.strokeRect(x, y, size, size);
        g.fillStyle = lit ? 'rgba(242,184,75,.15)' : 'rgba(111,227,210,.04)'; g.fillRect(x, y, size, size);
        g.fillStyle = lit ? '#f2b84b' : 'rgba(215,226,234,.6)'; g.font = '11px "IBM Plex Mono", monospace'; g.textAlign = 'center';
        g.fillText(String(i + 1).padStart(2, '0'), x + size / 2, y + size / 2 + 4);
      }
      if (s.v === 'zones' && audio && Math.floor(k * 1.6) !== s._last && k * 1.6 < 10) { s._last = Math.floor(k * 1.6); audio.beep(500 + s._last * 60, 0.06, 0.06); }
    }
    if (s.v === 'sample') {
      const r = 50 + Math.sin(now * 0.003) * 6;
      g.strokeStyle = 'rgba(111,227,210,.5)'; g.beginPath(); g.ellipse(cx, cy, 70, 110, 0, 0, Math.PI * 2); g.stroke();
      const gr = g.createRadialGradient(cx, cy, 0, cx, cy, r);
      gr.addColorStop(0, 'rgba(111,227,210,.9)'); gr.addColorStop(1, 'rgba(111,227,210,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
      for (let i = 0; i < Math.min(6, k * 1.5); i++) {
        const a = i * 1.05 + now * 0.0004; g.strokeStyle = 'rgba(183,156,255,.7)'; g.beginPath(); g.moveTo(cx, cy);
        g.quadraticCurveTo(cx + Math.cos(a) * 30, cy + Math.sin(a) * 30, cx + Math.cos(a + 0.4) * 60, cy + Math.sin(a + 0.4) * 60); g.stroke();
      }
    }
    if (s.v === 'id') {
      const r0 = 64;
      for (let i = 0; i < 7; i++) { g.strokeStyle = `rgba(63,244,255,${0.15 + i * 0.08})`; g.beginPath(); g.ellipse(cx, cy, r0 - i * 8, (r0 - i * 8) * 1.25, 0, Math.PI * (0.15 + i * 0.05), Math.PI * (1.85 - i * 0.04)); g.stroke(); }
      const sy = cy - 80 + ((k * 60) % 160);
      g.fillStyle = 'rgba(63,244,255,.25)'; g.fillRect(cx - 90, sy, 180, 2);
      const pct = Math.min(100, Math.floor(k * 22));
      g.font = '600 14px "Share Tech Mono", monospace'; g.textAlign = 'center';
      g.fillStyle = pct >= 100 ? '#ffb547' : '#3ff4ff'; g.fillText(pct >= 100 ? 'MATCH 100% · OBSERVER 030' : `MATCHING ${pct}%`, cx, cy + 110);
      if (pct >= 100 && !s._done && audio) { s._done = true; audio.beep(990, 0.25, 0.12); }
    }
    if (s.v === 'missed') {
      const size = 54;
      g.strokeStyle = 'rgba(255,122,107,.8)'; g.strokeRect(cx - size / 2, cy - size / 2, size, size);
      if (k > 1) { g.beginPath(); g.moveTo(cx - size / 2, cy - size / 2); g.lineTo(cx + size / 2, cy + size / 2); g.stroke(); }
      if (k > 3) {
        g.strokeStyle = 'rgba(183,156,255,.9)'; g.setLineDash([5, 5]); g.beginPath();
        g.moveTo(cx - size / 2 - 30, cy); g.quadraticCurveTo(cx, cy + 90 * Math.min(1, (k - 3) / 2), cx + size / 2 + 30, cy); g.stroke(); g.setLineDash([]);
      }
    }
    if (s.v === 'final' || s.v === 'ready') {
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2 + now * 0.0003, rr = s.v === 'final' ? 110 - Math.min(80, k * 18) : 30;
        g.fillStyle = '#f2b84b'; g.beginPath(); g.arc(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 3, 0, Math.PI * 2); g.fill();
      }
      g.strokeStyle = 'rgba(111,227,210,.6)'; g.beginPath(); g.arc(cx, cy, 44, 0, Math.PI * 2); g.stroke();
      g.font = '13px "IBM Plex Mono", monospace'; g.textAlign = 'center'; g.fillStyle = '#6fe3d2'; g.fillText('030', cx, cy + 5);
    }
  }
  raf = requestAnimationFrame(draw);

  root.querySelector('.pl-start button').onclick = () => {
    const a = sound();
    if (a) { a.ctx.resume(); drone = a.drone(); }
    root.querySelector('.pl-start').remove();
    root.querySelector('.pl-skip').classList.remove('hidden');
    root.querySelector('.pl-mute').classList.remove('hidden');
    next();
  };
}
