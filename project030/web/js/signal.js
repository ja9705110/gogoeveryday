// 第 2 區「訊號分離」：在瀏覽器裡離線合成一段深海錄音（不需要音檔），輸出成 WAV 給 <audio> 播放
// 內容：聲納、氣泡、心跳、鯨歌、貓叫、音樂盒（部分重複出現），背景是很輕的海潮
const SR = 22050, LEN = 31;

function rng(seed) { return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296); }

function env(ctx, t, peak, attack, decay, dest) {
  const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay); g.connect(dest); return g;
}
function tone(ctx, dest, type, f, t, dur) { const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); o.connect(dest); o.start(t); o.stop(t + dur); return o; }

const SOUNDS = {
  ping(ctx, out, t) { // 聲納
    [[0, 0.5], [0.42, 0.18]].forEach(([dt, v]) => { const o = tone(ctx, env(ctx, t + dt, v, 0.005, 1.3, out), 'sine', 1180, t + dt, 1.4); o.frequency.exponentialRampToValueAtTime(1090, t + dt + 1.3); });
  },
  bubbles(ctx, out, t, r) { // 氣泡
    for (let i = 0; i < 9; i++) {
      const tt = t + i * 0.13 + r() * 0.08, f = 380 + r() * 420;
      const o = tone(ctx, env(ctx, tt, 0.32, 0.004, 0.09, out), 'sine', f, tt, 0.12); o.frequency.exponentialRampToValueAtTime(f * 2.3, tt + 0.06);
    }
  },
  heart(ctx, out, t, r, beats = 4) { // 心跳（三角波帶泛音，手機喇叭也聽得到）
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 520; lp.connect(out);
    for (let i = 0; i < beats; i++) {
      [[0, 0.9], [0.24, 0.6]].forEach(([dt, v]) => { const tt = t + i * 0.85 + dt; const o = tone(ctx, env(ctx, tt, v, 0.006, 0.18, lp), 'triangle', 95, tt, 0.25); o.frequency.exponentialRampToValueAtTime(55, tt + 0.18); });
    }
  },
  whale(ctx, out, t) { // 鯨歌：緩慢上下滑動的長音
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.28, t + 0.6); g.gain.setValueAtTime(0.28, t + 2.4); g.gain.exponentialRampToValueAtTime(0.0001, t + 3.4); g.connect(out);
    [[1, 1], [2, 0.35], [3, 0.12]].forEach(([m, a]) => {
      const og = ctx.createGain(); og.gain.value = a; og.connect(g);
      const o = tone(ctx, og, 'sine', 300 * m, t, 3.5);
      o.frequency.linearRampToValueAtTime(620 * m, t + 1.3); o.frequency.linearRampToValueAtTime(520 * m, t + 2.0); o.frequency.linearRampToValueAtTime(360 * m, t + 3.4);
      const v = ctx.createOscillator(); v.frequency.value = 5; const vg = ctx.createGain(); vg.gain.value = 6 * m; v.connect(vg); vg.connect(o.frequency); v.start(t); v.stop(t + 3.5);
    });
  },
  meow(ctx, out, t, r, pitch = 1) { // 貓叫：鋸齒波＋兩個移動的共振峰（m-e-ow）
    const dur = 0.85;
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.5, t + 0.09); g.gain.setValueAtTime(0.45, t + 0.45); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); g.connect(out);
    const src = ctx.createOscillator(); src.type = 'sawtooth';
    src.frequency.setValueAtTime(430 * pitch, t); src.frequency.linearRampToValueAtTime(720 * pitch, t + 0.28); src.frequency.linearRampToValueAtTime(600 * pitch, t + 0.55); src.frequency.linearRampToValueAtTime(420 * pitch, t + dur);
    [[700, 1100, 650, 1], [1300, 2000, 950, 0.6]].forEach(([a, b, c, amp]) => {
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 6;
      bp.frequency.setValueAtTime(a, t); bp.frequency.linearRampToValueAtTime(b, t + 0.3); bp.frequency.linearRampToValueAtTime(c, t + dur);
      const ag = ctx.createGain(); ag.gain.value = amp * 2.2; src.connect(bp); bp.connect(ag); ag.connect(g);
    });
    src.start(t); src.stop(t + dur + 0.05);
  },
  musicbox(ctx, out, t) { // 音樂盒：五個清脆的音
    [1318.5, 1046.5, 1174.7, 784, 1046.5].forEach((f, i) => {
      const tt = t + i * 0.34; const g = env(ctx, tt, 0.22, 0.003, 1.3, out);
      tone(ctx, g, 'sine', f, tt, 1.4); const h = ctx.createGain(); h.gain.value = 0.18; h.connect(g); tone(ctx, h, 'sine', f * 3.01, tt, 0.6);
    });
  },
};

// 時間軸：同一種聲音會重複出現（總共 6 種）
const SCORE = [
  [1.0, 'ping'], [2.6, 'bubbles'], [4.6, 'heart', 4], [8.6, 'whale'], [12.6, 'ping'], [13.8, 'meow', 1],
  [15.9, 'musicbox'], [19.4, 'bubbles'], [21.2, 'meow', 1.12], [23.0, 'heart', 3], [26.2, 'ping'], [28.0, 'bubbles'],
];

function wav(buf) {
  const d = buf.getChannelData(0), n = d.length, ab = new ArrayBuffer(44 + n * 2), v = new DataView(ab);
  const w = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, SR, true); v.setUint32(28, SR * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * 2, true);
  let peak = 0; for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(d[i]));
  const k = peak > 0 ? 0.9 / peak : 1;
  for (let i = 0; i < n; i++) v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, d[i] * k)) * 32767, true);
  return new Blob([ab], { type: 'audio/wav' });
}

let cached = null;
export async function signalUrl() {
  if (cached) return cached;
  const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  const ctx = new OAC(1, SR * LEN, SR);
  const out = ctx.createGain(); out.gain.value = 0.9; out.connect(ctx.destination);
  // 背景海潮（很輕，不計入）
  const nb = ctx.createBuffer(1, SR * LEN, SR), nd = nb.getChannelData(0); let last = 0; const r0 = rng(7);
  for (let i = 0; i < nd.length; i++) { last = (last + 0.02 * (r0() * 2 - 1)) / 1.02; nd[i] = last * 3.5; }
  const ns = ctx.createBufferSource(); ns.buffer = nb; const nf = ctx.createBiquadFilter(); nf.type = 'lowpass'; nf.frequency.value = 600;
  const ng = ctx.createGain(); ng.gain.value = 0.05; ns.connect(nf); nf.connect(ng); ng.connect(out); ns.start(0);
  const r = rng(1118);
  for (const [t, name, arg] of SCORE) SOUNDS[name](ctx, out, t, r, arg);
  const buf = await ctx.startRendering();
  cached = URL.createObjectURL(wav(buf));
  return cached;
}
