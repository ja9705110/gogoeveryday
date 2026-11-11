// 星海音效引擎：全部以 WebAudio 即時合成（無音檔），可隨時開關
const KEY = 'p030.sound';
let ctx = null, master = null, ambBus = null, sfxBus = null, noiseBuf = null;
let current = null, currentName = null;
const listeners = new Set();

let unlocked = false;      // 是否已在使用者手勢中解鎖（iOS 主畫面 App 必須）
let silentEl = null;

export const sound = {
  get pref() { try { return localStorage.getItem(KEY); } catch { return null; } }, // 'on' | 'off' | null
  get on() { return this.pref === 'on'; },
  set(onOff) {
    try { localStorage.setItem(KEY, onOff ? 'on' : 'off'); } catch {}
    if (onOff) { unlock(); if (ctx) { master.gain.setTargetAtTime(0.9, ctx.currentTime, 0.3); if (currentName) ambience(currentName, true); } }
    else if (master) master.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
    listeners.forEach((f) => f(onOff));
  },
  toggle() { this.set(!this.on); },
  onChange(f) { listeners.add(f); return () => listeners.delete(f); },
};

function ensure() {
  if (ctx) return;
  const C = window.AudioContext || window.webkitAudioContext;
  if (!C) return;
  ctx = new C({ latencyHint: 'playback' });
  master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
  const comp = ctx.createDynamicsCompressor(); comp.connect(master);
  ambBus = ctx.createGain(); ambBus.gain.value = 0.55; ambBus.connect(comp);
  sfxBus = ctx.createGain(); sfxBus.gain.value = 0.8; sfxBus.connect(comp);
  noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0); let last = 0;
  for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
  // 被系統中斷（來電、切到背景）後，在下一次手勢時恢復
  ctx.onstatechange = () => { if (ctx.state === 'running' && sound.on && currentName && !current) ambience(currentName, true); };
}

// 產生 0.2 秒靜音 WAV（給 <audio> 元素用，讓 iOS 切換到「播放」音訊模式）
function silentWavUrl() {
  const n = 8820, buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf);
  const w = (o, str) => [...str].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true);
  v.setUint16(22, 1, true); v.setUint32(24, 44100, true); v.setUint32(28, 88200, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  w(36, 'data'); v.setUint32(40, n * 2, true);
  return URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }));
}

// 必須在使用者手勢（click / touchend）當下同步呼叫
export function unlock() {
  if (!sound.on) return;
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch {}  // iOS 16.4+：不受靜音撥桿影響
  ensure(); if (!ctx) return;
  if (ctx.state !== 'running') ctx.resume().catch(() => {});
  try { // 經典 iOS 解鎖：播放一個極短的空白音
    const src = ctx.createBufferSource(); src.buffer = ctx.createBuffer(1, 1, 22050); src.connect(ctx.destination); src.start(0);
  } catch {}
  try {
    if (!silentEl) { silentEl = new Audio(silentWavUrl()); silentEl.setAttribute('playsinline', ''); silentEl.loop = true; silentEl.volume = 0.01; }
    silentEl.play().catch(() => {});
  } catch {}
  if (master && master.gain.value < 0.1) master.gain.setTargetAtTime(0.9, ctx.currentTime, 0.3);
  if (!unlocked) { unlocked = true; if (currentName && !current) ambience(currentName, true); }
}
['touchend', 'click', 'keydown'].forEach((ev) => addEventListener(ev, () => { if (sound.on && (!unlocked || !ctx || ctx.state !== 'running')) unlock(); }, { capture: true, passive: true }));

const noise = () => { const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true; return s; };
const osc = (type, f) => { const o = ctx.createOscillator(); o.type = type; o.frequency.value = f; return o; };
// 房間殘響的脈衝響應：雙聲道、指數衰減的噪音
const impulse = (sec) => {
  const len = Math.floor(ctx.sampleRate * sec), b = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
  return b;
};
const lfo = (rate, depth, target) => { const o = osc('sine', rate); const g = ctx.createGain(); g.gain.value = depth; o.connect(g); g.connect(target); o.start(); return o; };

document.addEventListener('visibilitychange', () => {
  if (!ctx || !sound.on) return;
  if (document.hidden) { ctx.suspend(); silentEl && silentEl.pause(); }
  else { ctx.resume().catch(() => {}); silentEl && silentEl.play().catch(() => {}); if (!current && currentName) ambience(currentName, true); }
});

// ── 環境音層 ──
const LAYERS = {
  music(out) { // 背景音樂：和弦鋪底 + 五聲音階水晶鈴 + 回音（手機喇叭可清楚聽見的中高頻）
    const bus = ctx.createGain(); bus.gain.value = 0.9; bus.connect(out);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400; lp.connect(bus);
    const delay = ctx.createDelay(1.5); delay.delayTime.value = 0.42;
    const fb = ctx.createGain(); fb.gain.value = 0.38; delay.connect(fb); fb.connect(delay); delay.connect(lp);
    const CHORDS = [[220, 261.6, 329.6, 392, 493.9], [174.6, 220, 261.6, 329.6, 440], [130.8, 196, 246.9, 329.6, 392], [196, 246.9, 293.7, 329.6, 440]];
    const SCALE = [523.3, 587.3, 659.3, 784, 880, 1046.5, 1174.7, 1318.5];
    let ci = 0, alive = true;
    const pad = () => {
      if (!alive) return;
      const t = ctx.currentTime, dur = 9;
      CHORDS[ci % CHORDS.length].forEach((fr, i) => {
        [fr, fr * 1.003].forEach((f2, j) => {
          const o = osc(j ? 'sine' : 'triangle', f2); const g = ctx.createGain();
          g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.022 / (1 + i * 0.25), t + 2.5); g.gain.linearRampToValueAtTime(0.0001, t + dur);
          o.connect(g); g.connect(lp); o.start(t); o.stop(t + dur + 0.1);
        });
      });
      ci++;
    };
    const bell = () => {
      if (!alive) return;
      const t = ctx.currentTime, fr = SCALE[Math.floor(Math.random() * SCALE.length)];
      [[fr, 0.05], [fr * 2.01, 0.012]].forEach(([f2, v]) => {
        const o = osc('sine', f2); const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.8);
        o.connect(g); g.connect(lp); g.connect(delay); o.start(t); o.stop(t + 3);
      });
    };
    pad();
    const padId = setInterval(pad, 8000);
    let bellId; const loop = () => { bell(); if (Math.random() < 0.35) setTimeout(bell, 220); bellId = setTimeout(loop, 1200 + Math.random() * 1800); }; loop();
    return [{ stop: () => { alive = false; clearInterval(padId); clearTimeout(bellId); setTimeout(() => bus.disconnect(), 4000); } }];
  },
  waves(out) { // 海浪：低通噪音 + 緩慢起伏
    const n = noise(); const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1100;
    const g = ctx.createGain(); g.gain.value = 0.32; n.connect(f); f.connect(g); g.connect(out); n.start();
    lfo(0.09, 0.26, g.gain); lfo(0.05, 600, f.frequency); return [n];
  },
  deep(out) { // 深空低鳴
    const g = ctx.createGain(); g.gain.value = 0.10; g.connect(out);
    return [55, 82.5, 110.2, 164.8].map((fr, i) => { const o = osc(i ? 'sine' : 'triangle', fr); const og = ctx.createGain(); og.gain.value = i ? 0.35 / i : 0.6; o.connect(og); og.connect(g); o.start(); lfo(0.03 + i * 0.01, fr * 0.004, o.frequency); return o; });
  },
  sonar(out) { // 聲納脈衝
    const id = setInterval(() => { if (!sound.on) return; ping(out, 1180, 0.08); setTimeout(() => ping(out, 1180, 0.03), 420); }, 7000);
    return [{ stop: () => clearInterval(id) }];
  },
  buzz(out) { // 緊急電力嗡鳴
    const o = osc('sawtooth', 60); const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 240;
    const g = ctx.createGain(); g.gain.value = 0.05; o.connect(f); f.connect(g); g.connect(out); o.start(); lfo(0.7, 0.03, g.gain); return [o];
  },
  static(out) { // 收音機雜訊
    const n = noise(); const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2400; f.Q.value = 0.7;
    const g = ctx.createGain(); g.gain.value = 0.05; n.connect(f); f.connect(g); g.connect(out); n.start(); lfo(0.3, 0.04, g.gain); return [n];
  },
  drips(out) { // 水滴
    const id = setInterval(() => { if (sound.on && Math.random() < 0.6) blip(out, 900 + Math.random() * 900, 0.06); }, 1400);
    return [{ stop: () => clearInterval(id) }];
  },
  shimmer(out) { // 玻璃泛音：偶爾響起、慢慢淡出的柔和玻璃聲（不再有持續的高頻長音）
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2200; lp.Q.value = 0.4;
    const g = ctx.createGain(); g.gain.value = 1; lp.connect(g); g.connect(out);
    const NOTES = [523.3, 659.3, 784, 880, 1046.5];
    let alive = true, id;
    const chime = () => {
      if (!alive) return;
      if (sound.on) {
        const t = ctx.currentTime, f = NOTES[Math.floor(Math.random() * NOTES.length)];
        [[f, 0.018], [f * 2, 0.004]].forEach(([fr, v]) => {
          const o = osc('sine', fr); const e = ctx.createGain();
          e.gain.setValueAtTime(0.0001, t); e.gain.linearRampToValueAtTime(v, t + 0.25); e.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);
          o.connect(e); e.connect(lp); o.start(t); o.stop(t + 3.3);
        });
      }
      id = setTimeout(chime, 3500 + Math.random() * 4000);
    };
    id = setTimeout(chime, 1500);
    return [{ stop: () => { alive = false; clearTimeout(id); setTimeout(() => g.disconnect(), 4000); } }];
  },
  rumble(out) { // 斷層低頻
    const n = noise(); const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 90;
    const g = ctx.createGain(); g.gain.value = 0.5; n.connect(f); f.connect(g); g.connect(out); n.start(); lfo(0.15, 0.35, g.gain); return [n];
  },
  pulse(out) { // 核心心跳
    const id = setInterval(() => { if (sound.on) { thump(out, 0.25); setTimeout(() => thump(out, 0.15), 260); } }, 1600);
    return [{ stop: () => clearInterval(id) }];
  },
  tick(out) { // 投影機轉動
    const id = setInterval(() => { if (sound.on) click(out, 0.015); }, 140);
    return [{ stop: () => clearInterval(id) }];
  },
  memory(out) { // 回顧儀式：鋼琴感分解和弦 + 簡單旋律 + 房間殘響（沒有持續單音，不會有共振嗡鳴）
    const bus = ctx.createGain(); bus.gain.value = 1.4; bus.connect(out);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3600; lp.Q.value = 0.5; lp.connect(bus);
    const rev = ctx.createConvolver(); rev.buffer = impulse(2.6); const wet = ctx.createGain(); wet.gain.value = 0.8; rev.connect(wet); wet.connect(bus);
    const dry = ctx.createGain(); dry.gain.value = 2.4; dry.connect(lp); dry.connect(rev);
    // 遠方海潮（很輕）
    const n = noise(); const nf = ctx.createBiquadFilter(); nf.type = 'lowpass'; nf.frequency.value = 650;
    const ng = ctx.createGain(); ng.gain.value = 0.06; n.connect(nf); nf.connect(ng); ng.connect(bus); n.start(); const nl = lfo(0.05, 0.035, ng.gain);
    // Fmaj7 → G → Em7 → Am7（C 大調，溫暖、帶一點懷舊）
    const CH = [
      { bass: 87.31, arp: [220, 261.63, 329.63, 349.23], mel: [[0, 659.25], [4, 523.25]] },
      { bass: 98.0, arp: [246.94, 293.66, 392.0, 329.63], mel: [[0, 587.33], [4, 493.88]] },
      { bass: 82.41, arp: [196.0, 246.94, 293.66, 329.63], mel: [[0, 493.88], [2, 523.25], [4, 587.33]] },
      { bass: 110.0, arp: [261.63, 329.63, 392.0, 440.0], mel: [[0, 659.25], [6, 523.25]] },
    ];
    const PAT = [0, 1, 2, 3, 1, 2, 3, 2];
    const E = 0.39; // 八分音符（約 77 BPM）
    const note = (f, t, vol, dec) => {
      const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dec); g.connect(dry);
      [[1, 1], [2, 0.22], [3, 0.06]].forEach(([m, a]) => { const o = osc('sine', f * m); const og = ctx.createGain(); og.gain.value = a; o.connect(og); og.connect(g); o.start(t); o.stop(t + dec + 0.05); });
    };
    const pad = (fs, t, len) => fs.forEach((f) => {
      const o = osc('sine', f); const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.007, t + 1.2); g.gain.linearRampToValueAtTime(0.0001, t + len + 1.5);
      o.connect(g); g.connect(dry); o.start(t); o.stop(t + len + 1.6);
    });
    let k = 0, next = ctx.currentTime + 0.15, alive = true;
    const sched = () => {
      if (!alive) return;
      if (next < ctx.currentTime) next = ctx.currentTime + 0.05;
      while (next < ctx.currentTime + 0.5) {
        const ci = Math.floor(k / 8) % 4, pos = k % 8, cycle = Math.floor(k / 32), c = CH[ci];
        if (pos === 0) { note(c.bass, next, 0.07, 3.6); pad(c.arp.slice(0, 3), next, E * 8); }
        note(c.arp[PAT[pos]], next, pos === 0 ? 0.04 : 0.03, 2.2);
        if (cycle % 2 === 1) for (const [p, f] of c.mel) if (p === pos) note(f, next, 0.045, 2.6);
        next += E; k++;
      }
    };
    sched(); const id = setInterval(sched, 120);
    return [n, nl, { stop: () => { alive = false; clearInterval(id); setTimeout(() => bus.disconnect(), 4000); } }];
  },
  choir(out) { // 檔案室：和聲墊
    const g = ctx.createGain(); g.gain.value = 0.05; g.connect(out);
    return [220, 277.2, 329.6, 440].map((fr) => { const o = osc('sine', fr); o.connect(g); o.start(); lfo(0.07, 1.5, o.frequency); return o; });
  },
};
const SCENES = {
  base: ['music', 'waves', 'deep', 'sonar'],
  intake: ['music', 'buzz', 'waves'], radio: ['music', 'static', 'waves'], vault: ['music', 'deep', 'buzz'], mirror: ['music', 'shimmer', 'waves'],
  greenhouse: ['music', 'drips', 'waves'], fault: ['music', 'rumble', 'deep'], gate: ['music', 'waves', 'sonar'], fork: ['music', 'deep', 'sonar'],
  playback: ['music', 'tick'], core: ['music', 'pulse', 'shimmer'], archive: ['memory'], prologue: ['music', 'waves', 'deep'], ceremony: ['memory'],
};

export function ambience(name, force) {
  if (!SCENES[name]) name = 'base';
  if (name === currentName && !force && current) return;
  currentName = name;
  if (!sound.on || !unlocked) return;   // 尚未在手勢中解鎖：等第一次點擊再開始
  ensure(); if (!ctx) return;
  const old = current;
  const bus = ctx.createGain(); bus.gain.value = 0; bus.connect(ambBus);
  const nodes = SCENES[name].flatMap((l) => LAYERS[l](bus));
  bus.gain.setTargetAtTime(1, ctx.currentTime, 0.8);
  current = { bus, nodes };
  if (old) {
    old.bus.gain.setTargetAtTime(0, ctx.currentTime, 0.5);
    setTimeout(() => { old.nodes.forEach((n) => { try { n.stop(); } catch {} }); old.bus.disconnect(); }, 2500);
  }
}

// ── 音效 ──
function env(out, dur, vol) { const g = ctx.createGain(); g.gain.setValueAtTime(vol, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur); g.connect(out); return g; }
function ping(out, f, vol) { const o = osc('sine', f); o.frequency.exponentialRampToValueAtTime(f * 0.92, ctx.currentTime + 1.2); o.connect(env(out, 1.4, vol)); o.start(); o.stop(ctx.currentTime + 1.5); }
function blip(out, f, vol) { const o = osc('sine', f); o.frequency.exponentialRampToValueAtTime(f * 1.8, ctx.currentTime + 0.08); o.connect(env(out, 0.12, vol)); o.start(); o.stop(ctx.currentTime + 0.15); }
function thump(out, vol) { const o = osc('sine', 70); o.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.2); o.connect(env(out, 0.25, vol)); o.start(); o.stop(ctx.currentTime + 0.3); }
function click(out, vol) { const s = ctx.createBufferSource(); s.buffer = noiseBuf; const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 3000; s.connect(f); f.connect(env(out, 0.03, vol)); s.start(); s.stop(ctx.currentTime + 0.04); }
function tone(f, dur, vol, type = 'sine', at = 0) { const o = osc(type, f); const g = ctx.createGain(); const t = ctx.currentTime + at; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + dur + 0.05); }

export function sfx(name) {
  if (!sound.on || !unlocked) return;
  ensure(); if (!ctx) return;
  switch (name) {
    case 'tap': tone(1600, 0.05, 0.05, 'square'); break;
    case 'type': tone(1300 + Math.random() * 400, 0.02, 0.025, 'square'); break;
    case 'ok': [660, 880, 1320].forEach((f, i) => tone(f, 0.25, 0.09, 'sine', i * 0.08)); break;
    case 'bad': tone(140, 0.32, 0.12, 'sawtooth'); tone(110, 0.32, 0.1, 'sawtooth', 0.05); break;
    case 'complete': [261.6, 329.6, 392, 523.3, 659.3].forEach((f, i) => tone(f, 1.6, 0.07, 'triangle', i * 0.12)); ping(sfxBus, 1568, 0.06); break;
    case 'unlock': [523.3, 784].forEach((f, i) => tone(f, 0.4, 0.08, 'sine', i * 0.1)); break;
    case 'find': tone(1046, 0.6, 0.07, 'sine'); tone(1568, 0.6, 0.05, 'sine', 0.08); break;
    case 'ping': ping(sfxBus, 1180, 0.1); break;
    case 'static': { const s = ctx.createBufferSource(); s.buffer = noiseBuf; const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1800; s.connect(f); f.connect(env(sfxBus, 0.8, 0.25)); s.start(); s.stop(ctx.currentTime + 0.9); break; }
    case 'match': tone(990, 0.4, 0.1, 'sine'); tone(1485, 0.6, 0.08, 'sine', 0.12); break;
    case 'sink': { const o = osc('sine', 600); o.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 1.6); o.connect(env(sfxBus, 1.8, 0.1)); o.start(); o.stop(ctx.currentTime + 1.9); break; }
    default: break;
  }
}

// 測試用：目前輸出音量（RMS）
export function outputLevel() {
  if (!ctx || !master) return 0;
  if (!master._an) { master._an = ctx.createAnalyser(); master._an.fftSize = 2048; master.connect(master._an); }
  const a = new Float32Array(2048); master._an.getFloatTimeDomainData(a);
  return Math.sqrt(a.reduce((s, v) => s + v * v, 0) / a.length);
}
export const needsUnlock = () => sound.on && !unlocked;
// 播放謎題音訊時，暫時把背景音壓低（避免干擾聆聽）
export function duck(on) { if (ctx && ambBus) ambBus.gain.setTargetAtTime(on ? 0.04 : 0.55, ctx.currentTime, 0.25); }
