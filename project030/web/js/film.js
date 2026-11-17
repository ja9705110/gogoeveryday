// 11/18 終章：回顧影片「11/08–11/18」與「我 30 歲了！」慶祝畫面
import { sfx, ambience, duck } from './audio.js';
import { mountCosmos } from './cosmos.js';

const wait = (ms, tok) => new Promise((r) => { const id = setTimeout(r, ms); if (tok) tok.timers.push(() => { clearTimeout(id); r(); }); });
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// iPhone：在使用者點擊的當下先「解鎖」之後要播放的音訊
// 靜音試播一下就停；如果在這之間真的開始播放（realPlay），就不去動它
export function primeAudio(a) {
  if (!a || !a.paused) return;
  const tok = {}; a._prime = tok;
  const stop = () => { if (a._prime !== tok) return; a._prime = null; try { a.pause(); a.currentTime = 0; } catch (_) {} a.muted = false; };
  try { a.muted = true; const pr = a.play(); if (pr) pr.then(stop).catch(() => { if (a._prime === tok) { a._prime = null; a.muted = false; } }); else stop(); } catch (_) { a._prime = null; a.muted = false; }
  setTimeout(stop, 1500); // 保險：無論如何 1.5 秒內停下來
}
const realPlay = (a) => { a._prime = null; a.muted = false; return a.play(); };

// chapters: [{ date, zone, title, hint, items: [{ type: 'photo', url } | { type: 'text', text }], audios: [HTMLAudioElement], missed, fav }]
// universe: 背景宇宙（所有情緒圍繞著他轉動，mountCosmos）
// ending: { voice: HTMLAudioElement|null, photo: url|null }
// 不替任何一天下定義：只放他當天的照片、聲音、日期和關卡名稱
// 沒有填「給他的話」時的備用結尾
const DEFAULT_LETTER = ['很多時候，我們會覺得自己停在原地。', '但其實每一分、每一秒，你的世界都一直在運轉。', '每一個好，每一個壞，都成了你宇宙的養分。', '所以，珍惜每一分、每一秒。'];

// letter：給他的話（每一行一段字幕）；memories：[{ kind: 'photo'|'video', url, caption }]
// note：他已經寫過的那句話（重播時）；onNote(text)：送出他寫給三十歲自己的話
// bgm：回憶段落的背景音樂（最好的時光）；都在他點按鈕的那一下開始，iPhone 才會出聲
export function playFilm({ chapters, universe, ending, letter = '', memories = [], bgm = null, note = null, onNote, onDone }) {
  const ov = el('div', 'film');
  const bg = el('div', 'film-bg');
  const img = el('div', 'film-img');
  const cap = el('div', 'film-cap');
  const bar = el('div', 'film-bar', '<i></i>');
  const mic = el('div', 'film-mic', '🎙 你的聲音');
  const skip = el('button', 'btn ghost sm film-skip', '略過');
  let activeVideo = null;
  const bgmPlay = () => { if (!bgm) return; try { bgm._prime = null; bgm.muted = false; duck(true); const pr = bgm.play(); if (pr && pr.catch) pr.catch(() => {}); } catch (_) {} };
  const bgmPause = () => { if (!bgm) return; try { bgm.pause(); } catch (_) {} };
  // 點一下才繼續（讓音樂在點擊的當下開始）
  const tapGate = (label) => new Promise((resolve) => { const b = el('button', 'btn primary film-gate', label); ov.append(b); b.onclick = () => { b.remove(); bgmPlay(); resolve(); }; });
  ov.append(bg, img, cap, bar, mic, skip);
  document.body.append(ov);
  const cos = universe ? mountCosmos(bg, { ...universe, mode: 'orbit', speed: 0.25, cy: 0.42 }) : null;
  const tok = { stop: false, timers: [] };
  const total = 1 + chapters.length + 1; let done = 0;
  const progress = () => { bar.firstChild.style.width = `${Math.min(100, (100 * done) / total)}%`; };
  const clearAll = () => { tok.timers.splice(0).forEach((f) => f()); };
  const stopAudio = () => { [ending.voice, ...chapters.flatMap((c) => c.audios || [])].forEach((a) => { try { a && a.pause(); } catch (_) {} }); duck(false); };
  const endCosmos = () => { if (cos) cos.stop(); };
  skip.onclick = () => { tok.stop = true; clearAll(); stopAudio(); clearImg(); if (activeVideo) activeVideo(); };
  ambience('ceremony', true);

  const caption = (html) => { cap.innerHTML = html; cap.classList.remove('on'); void cap.offsetWidth; cap.classList.add('on'); };
  // 照片：像一張相紙從宇宙深處浮現——細白邊、柔和陰影、微微傾斜，背後是同一張照片的模糊光暈
  let tilt = 1;
  const showImg = (url) => {
    const safe = url.replace(/"/g, '%22');
    const f = el('div', 'film-frame');
    const glow = el('div', 'ff-glow'); glow.style.backgroundImage = `url("${safe}")`;
    const print = el('div', 'ff-print'); const pic = new Image(); pic.alt = ''; pic.decoding = 'async';
    const shine = el('i', 'ff-shine');
    print.append(pic, shine); f.append(glow, print);
    tilt = -tilt; f.style.setProperty('--rot', `${(tilt * (1 + Math.random() * 1.8)).toFixed(2)}deg`);
    f.style.setProperty('--dx', `${(Math.random() * 2 - 1).toFixed(2)}%`);
    const place = () => {
      const iw = pic.naturalWidth || 4, ih = pic.naturalHeight || 3;
      const maxW = Math.min(innerWidth * 0.84, 560), maxH = innerHeight * 0.56;
      const k = Math.min(maxW / iw, maxH / ih);
      print.style.width = `${Math.round(iw * k)}px`; print.style.height = `${Math.round(ih * k)}px`;
      requestAnimationFrame(() => f.classList.add('on'));
    };
    pic.onload = place; pic.onerror = place; pic.src = url;
    img.append(f);
    [...img.children].slice(0, -1).forEach((o) => { o.classList.add('out'); setTimeout(() => o.remove(), 1300); });
  };
  const clearImg = () => { [...img.children].forEach((o) => { o.classList.add('out'); setTimeout(() => o.remove(), 1300); }); };
  const playClip = async (a, maxMs) => {
    if (!a || tok.stop) return;
    duck(true);
    try { a.currentTime = 0; await realPlay(a); } catch (_) { duck(false); return; }
    await Promise.race([new Promise((r) => (a.onended = r)), wait(maxMs, tok)]);
    try { a.pause(); } catch (_) {}
    duck(false);
  };

  // 家人的影片：點一下才播放（iPhone 要「點擊」才能有聲音）
  const playVideo = (m) => new Promise((resolve) => {
    const box = el('div', 'film-video');
    const v = document.createElement('video'); v.src = m.url; v.playsInline = true; v.setAttribute('playsinline', ''); v.preload = 'auto';
    const tap = el('button', 'btn primary film-vplay', '▶ 有人想對你說話');
    const cap2 = el('div', 'film-vcap', m.caption ? esc(m.caption) : '');
    const next = el('button', 'btn ghost sm film-vnext', '繼續 ›');
    box.append(v, cap2, tap, next); ov.append(box);
    let ended = false;
    const end = () => { if (ended) return; ended = true; activeVideo = null; clearTimeout(stall); try { v.pause(); } catch (_) {} duck(false); box.classList.add('out'); setTimeout(() => box.remove(), 500); resolve(); };
    // 這台裝置放不出這段影片（例如 iPhone 的 .mov 在電腦上）：說明一下，自動接下一段
    const fail = () => { if (ended) return; tap.remove(); cap2.textContent = '這段影片在這台裝置上無法播放'; setTimeout(() => { end(); bgmPlay(); }, 3000); };
    let stall = null;
    activeVideo = end;
    v.onerror = fail;
    tap.onclick = () => {
      tap.remove(); bgmPause(); duck(true);
      v.play().catch(fail);
      stall = setTimeout(() => { if (!ended && (v.currentTime || 0) < 0.2) fail(); }, 9000); // 9 秒都沒開始播
      setTimeout(() => next.classList.add('show'), 5000);
    };
    // 看完：有背景音樂的話，點「繼續」讓歌接著播
    v.onended = () => { if (!bgm) return end(); const c = el('button', 'btn primary film-vplay', '繼續 ▶'); box.append(c); c.onclick = () => { bgmPlay(); end(); }; };
    next.onclick = () => { bgmPlay(); end(); };
  });
  // 送三十歲的自己一句話
  const askNote = (prev) => new Promise((resolve) => {
    const box = el('div', 'film-note');
    box.innerHTML = '<div class="kicker">TO: JASPER, 30</div><h2>最後，送三十歲的自己一句話。</h2>' + (prev ? '<p class="dim" style="font-size:12px;margin:-4px 0 8px">你之前寫過這句話，可以改一改，或直接送出。</p>' : '');
    const ta = document.createElement('textarea'); ta.maxLength = 500; ta.placeholder = '寫給三十歲的你……'; if (prev) ta.value = prev;
    const msg = el('div', 'msg');
    const send = el('button', 'btn primary block', '送出');
    box.append(ta, msg, send); ov.append(box); setTimeout(() => ta.focus(), 300);
    send.onclick = async () => {
      const t = ta.value.trim(); if (!t) { msg.className = 'msg bad'; msg.textContent = '寫一句話給自己吧，一句就好。'; return; }
      send.disabled = true;
      try { onNote && (await onNote(t)); } catch (_) {}
      box.classList.add('out'); setTimeout(() => box.remove(), 500); resolve(t);
    };
  });

  (async () => {
    // 序幕
    for (const line of ['第 1118 號觀察員', '11/08 – 11/18', '這十天，其實是你的三十年。', '有些你經歷過，有些也許還沒有。<br>就當作，是給你的一面鏡子。']) {
      if (tok.stop) break; caption(`<div class="film-line">${line}</div>`); sfx('type'); await wait(2600, tok);
    }
    done++; progress();
    // 十章
    for (const c of chapters) {
      if (tok.stop) break;
      clearImg();
      const star = c.fav ? '<div class="film-fav">★ 你最喜歡的一關</div>' : '';
      caption(`<div class="film-date">${esc(c.date)}・${esc(c.zone)}</div><div class="film-word">${esc(c.title)}</div>${star}`);
      sfx('ping'); await wait(2600, tok); if (tok.stop) break;
      if (c.missed) {
        // 錯過的那一天：錯過了就不會再回來，它沉回海底，從宇宙裡消失
        ov.classList.add('missing');
        caption(`<div class="film-date">${esc(c.date)}・${esc(c.title)}</div><div class="film-line">這一段，你錯過了。<br>錯過的，就不會再回來——<br>它沉回了海底，從你的宇宙裡消失。</div>`);
        sfx('sink'); await wait(4200, tok);
        ov.classList.remove('missing');
      } else {
        // 這一天他留下的每一張照片、每一段文字；錄音同時一段一段播放
        const base = `<div class="film-date">${esc(c.date)}・${esc(c.title)}</div>`;
        caption(`${base}${c.hint ? `<div class="film-def">${esc(c.hint)}</div>` : ''}${star}`);
        const voices = (async () => { for (const a of c.audios || []) { if (tok.stop) break; ov.classList.add('talking'); await playClip(a, 30000); ov.classList.remove('talking'); await wait(400, tok); } })();
        const items = c.items || [];
        if (!items.length) await wait(3600, tok);
        let shownHint = true;
        for (const it of items) {
          if (tok.stop) break;
          if (it.type === 'photo') {
            if (!shownHint) { caption(`${base}${c.hint ? `<div class="film-def">${esc(c.hint)}</div>` : ''}${star}`); shownHint = true; }
            showImg(it.url); await wait(c.fav ? 3600 : 3000, tok);
          } else {
            caption(`${base}<div class="film-quote">「${esc(it.text)}」</div>`); shownHint = false;
            await wait(Math.min(9000, 3500 + it.text.length * 90), tok);
          }
        }
        await voices;
      }
      done++; progress();
    }
    // 尾聲
    clearImg();
    if (!tok.stop && ending.voice) {
      caption('<div class="film-date">11/18</div><div class="film-line">你對三十歲的自己說：</div><div class="film-wave"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>');
      await wait(1200, tok); await playClip(ending.voice, 90000);
    }
    // 尾聲一：給他的話。說著說著，宇宙開始崩離
    clearImg();
    const lines = String(letter || '').split(/\n+/).map((x) => x.trim()).filter(Boolean);
    if (!tok.stop) {
      if (cos) cos.collapse();
      for (const line of (lines.length ? lines : DEFAULT_LETTER)) {
        if (tok.stop) break;
        caption(`<div class="film-letter">${esc(line)}</div>`);
        await wait(Math.min(10000, 2800 + line.length * 120), tok);
      }
    }
    // 尾聲二：小時候的照片、家人朋友想對他說的話
    const mem = (memories || []).filter((m) => m && m.url);
    if (!tok.stop && mem.length) {
      caption('<div class="film-line">接下來，是一直站在你身後的人。</div>'); await wait(3400, tok);
      if (bgm && !tok.stop) { await tapGate('▶ 打開回憶'); }
      for (const m of mem) {
        if (tok.stop) break;
        if (m.kind === 'video') { clearImg(); caption(''); await playVideo(m); }
        else { showImg(m.url); caption(m.caption ? `<div class="film-def">${esc(m.caption)}</div>` : ''); await wait(4200, tok); }
      }
      clearImg();
    }
    stopAudio();
    skip.remove();
    // 尾聲三：送三十歲的自己一句話 → 原本要崩離的宇宙，再一次轉動
    if (cos) cos.collapse();
    const said = await askNote(note); // 每一次都讓他寫（寫過的話，先帶入上次的內容）
    const t2 = { stop: false, timers: [] };
    if (cos) cos.respin(); sfx('complete');
    caption(`<div class="film-line">你對三十歲的自己說：</div><div class="film-quote">「${esc(said)}」</div>`); await wait(Math.min(9000, 4200 + said.length * 80), t2);
    caption('<div class="film-line">不管你選了什麼，<br>家人和朋友，永遠是你背後的後盾。</div>'); await wait(4600, t2);
    caption('<div class="film-line">所以你的宇宙，<br>會再一次轉動。</div>'); await wait(3800, t2);
    if (ending.photo) { showImg(ending.photo); await wait(3200, t2); }
    done = total; progress();
    // 結尾按鈕
    const go = el('button', 'btn primary film-go', '我 30 歲了！');
    const again = el('button', 'btn ghost sm', '再看一次');
    const box = el('div', 'film-end'); box.append(go, again);
    caption(''); ov.append(box);
    again.onclick = () => { bgmPause(); endCosmos(); ov.remove(); onDone && onDone('replay'); };
    go.onclick = () => { bgmPause(); endCosmos(); ov.remove(); onDone && onDone('thirty'); };
  })();
}

// 生日快樂歌（音樂盒；旋律為公有領域）
const HB_PHRASES = (() => {
  const G = 67, A = 69, Cn = 72, Bn = 71, D = 74, E = 76, F = 77, G2 = 79;
  return [
    { line: 'Happy birthday to you', notes: [[G, 0.75], [G, 0.25], [A, 1], [G, 1], [Cn, 1], [Bn, 2]], chord: [48, 55, 43] },
    { line: 'Happy birthday to you', notes: [[G, 0.75], [G, 0.25], [A, 1], [G, 1], [D, 1], [Cn, 2]], chord: [43, 50, 48] },
    { line: 'Happy birthday, dear Jasper', notes: [[G, 0.75], [G, 0.25], [G2, 1], [E, 1], [Cn, 1], [Bn, 1], [A, 2]], chord: [48, 53, 53] },
    { line: 'Happy birthday to you', notes: [[F, 0.75], [F, 0.25], [E, 1], [Cn, 1], [D, 1], [Cn, 2]], chord: [53, 43, 48] },
  ];
})();
// 把整首歌排進任何一個 AudioContext（即時或離線），回傳每一句歌詞的時間與總長度
function scheduleHB(ac, dest, start) {
  const verb = ac.createConvolver(); const len = Math.floor(ac.sampleRate * 1.6); const ir = ac.createBuffer(2, len, ac.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
  verb.buffer = ir; const wet = ac.createGain(); wet.gain.value = 0.25; verb.connect(wet); wet.connect(dest);
  const hz = (n) => 440 * Math.pow(2, (n - 69) / 12);
  const bell = (t, n, dur, vol) => {
    for (const [mul, v] of [[1, 1], [2, 0.32], [3, 0.12], [4.2, 0.05]]) {
      const o = ac.createOscillator(); const g = ac.createGain();
      o.type = 'sine'; o.frequency.value = hz(n) * mul;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol * v, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0008, t + dur * (mul === 1 ? 1 : 0.5));
      o.connect(g); g.connect(dest); g.connect(verb); o.start(t); o.stop(t + dur + 0.05);
    }
  };
  const B = 0.52; let t = start; const lines = [];
  HB_PHRASES.forEach((ph) => {
    const t0 = t; lines.push({ t: t0 - start, line: ph.line });
    const beats = ph.notes.reduce((x, n) => x + n[1], 0);
    ph.notes.forEach(([n, b]) => { bell(t, n, Math.max(0.6, b * B * 1.8), 0.22); t += b * B; });
    for (let m = 0; m < Math.ceil(beats / 3); m++) bell(t0 + (0.25 + m * 3) * B, ph.chord[m % ph.chord.length], 1.6, 0.09);
    t += B * 0.5;
  });
  return { lines, duration: t - start + 1.4 };
}
// 先在背景把歌「錄」成一般音檔（WAV），用 <audio> 播放：iPhone 靜音模式下也聽得到
export async function renderBirthdaySong() {
  try {
    const OC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!OC) return null;
    const sr = 22050, secs = 18;
    const oc = new OC(1, sr * secs, sr);
    const master = oc.createGain(); master.gain.value = 0.9; master.connect(oc.destination);
    const { lines, duration } = scheduleHB(oc, master, 0.2);
    const buf = await new Promise((res, rej) => { const r = oc.startRendering(); if (r && r.then) r.then(res, rej); else oc.oncomplete = (e) => res(e.renderedBuffer); });
    const n = Math.min(buf.length, Math.ceil((duration + 0.2) * sr)); const data = buf.getChannelData(0);
    const out = new DataView(new ArrayBuffer(44 + n * 2));
    const str = (o, x) => { for (let i = 0; i < x.length; i++) out.setUint8(o + i, x.charCodeAt(i)); };
    str(0, 'RIFF'); out.setUint32(4, 36 + n * 2, true); str(8, 'WAVE'); str(12, 'fmt '); out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, 1, true);
    out.setUint32(24, sr, true); out.setUint32(28, sr * 2, true); out.setUint16(32, 2, true); out.setUint16(34, 16, true); str(36, 'data'); out.setUint32(40, n * 2, true);
    let peak = 0; for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(data[i]));
    const gain = peak > 0 ? 0.85 / peak : 1; // 音量調到跟 NEON 差不多
    for (let i = 0; i < n; i++) out.setInt16(44 + i * 2, Math.max(-1, Math.min(1, data[i] * gain)) * 0x7fff, true);
    const audio = new Audio(URL.createObjectURL(new Blob([out], { type: 'audio/wav' })));
    audio.preload = 'auto'; audio.setAttribute('playsinline', '');
    return { audio, lines: lines.map((l) => ({ ...l, t: l.t + 0.2 })), duration: n / sr };
  } catch (_) { return null; }
}
// 備用：沒辦法預先做成音檔時，直接即時合成
function liveBirthday(onLine) {
  const C = window.AudioContext || window.webkitAudioContext;
  if (!C) return { done: Promise.resolve(), mute() {}, stop() {} };
  const ac = new C(); try { ac.resume(); } catch (_) {}
  const master = ac.createGain(); master.gain.value = 0.9; master.connect(ac.destination);
  const { lines, duration } = scheduleHB(ac, master, ac.currentTime + 0.35);
  const timers = lines.map((l) => setTimeout(() => onLine && onLine(l.line), (l.t + 0.35) * 1000));
  let finish; const done = new Promise((r) => (finish = r));
  timers.push(setTimeout(() => { finish(); setTimeout(() => ac.close().catch(() => {}), 1500); }, (duration + 0.35) * 1000));
  return { done, mute: (m) => master.gain.setTargetAtTime(m ? 0 : 0.9, ac.currentTime, 0.05), stop: () => { timers.forEach(clearTimeout); try { ac.close(); } catch (_) {} finish(); } };
}
// 用預先做好的音檔播放，歌詞跟著 currentTime 換
// 用同一個播放器：點擊當下播生日快樂歌，播完「換歌」成 NEON
// iPhone 只允許「被點擊啟動過的播放器」在之後自己繼續播；另開一個播放器 15 秒後再播會被擋下
function fileBirthday(hb, player, onLine) {
  const a = player || hb.audio; let finish; const done = new Promise((r) => (finish = r)); let shown = -1, alive = true;
  const src = hb.audio.src;
  try { a._prime = null; a.onended = null; a.pause(); if (a.src !== src) a.src = src; a.currentTime = 0; a.muted = false; } catch (_) {}
  const pr = a.play(); if (pr && pr.catch) pr.catch(() => { alive = false; finish(); });
  const tick = () => { if (!alive) return; const t = a.currentTime || 0; let i = -1; hb.lines.forEach((l, k) => { if (t >= l.t) i = k; }); if (i !== shown && i >= 0) { shown = i; onLine && onLine(hb.lines[i].line); } requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  a.onended = () => { alive = false; a.onended = null; finish(); };
  const guard = setTimeout(() => { alive = false; finish(); }, (hb.duration + 3) * 1000);
  done.then(() => clearTimeout(guard));
  return { done, mute: (m) => { a.muted = m; }, stop: () => { alive = false; finish(); } };
}

// 「我 30 歲了！」：歌曲＋慶祝畫面；之後出現「出發去找禮物」
export function celebrate({ song, hb: hbFile, onHunt }) {
  const ov = el('div', 'party');
  const cv = el('canvas', 'party-cv');
  const big = el('div', 'party-30', '30');
  const t1 = el('div', 'party-t', '生日快樂');
  const t2 = el('div', 'party-s', '');
  const mute = el('button', 'btn ghost sm party-mute', '🔊');
  const next = el('div', 'party-next');
  ov.append(cv, big, t1, t2, mute, next);
  document.body.append(ov);
  duck(true);
  // 先唱生日快樂歌，唱完才播 NEON（同一個播放器換歌）
  const neonSrc = song ? (song.dataset.neon || (song.dataset.neon = song.src)) : null;
  let muted = false;
  const lyric = (line) => { t2.textContent = line; t2.classList.remove('on'); void t2.offsetWidth; t2.classList.add('on'); };
  const hb = hbFile && hbFile.audio ? fileBirthday(hbFile, song, lyric) : liveBirthday(lyric);
  if (!(hbFile && hbFile.audio) && song) { try { song.pause(); } catch (_) {} }
  mute.onclick = () => { muted = !muted; hb.mute(muted); if (song) song.muted = muted; mute.textContent = muted ? '🔇' : '🔊'; };
  let alive = true;
  hb.done.then(() => {
    if (!alive) return;
    lyric('第 1118 號觀察員，歡迎來到三十歲。');
    // 唱完生日快樂歌：按「領取我的生日禮物」才播 NEON（真的點一下，iPhone 一定放行）
    const gift = el('button', 'btn primary party-gift', '🎁 領取我的生日禮物');
    gift.onclick = () => {
      gift.remove();
      if (song && neonSrc) { try { song._prime = null; song.onended = null; if (song.src !== neonSrc) song.src = neonSrc; song.currentTime = 0; song.muted = muted; song.play().catch(() => {}); } catch (_) {} }
      burst(240); sfx('complete');
      setTimeout(() => {
        if (!alive) return;
        const b = el('button', 'btn primary', '出發去找禮物 →');
        b.onclick = () => { alive = false; hb.stop(); clearInterval(rain); removeEventListener('resize', resize); ov.classList.add('out'); setTimeout(() => ov.remove(), 500); onHunt && onHunt(); };
        next.append(el('div', 'party-q', '先猜猜看，你的禮物是什麼？'), b);
      }, 8000);
    };
    next.append(gift);
  });
  // 彩帶與星光
  const g = cv.getContext('2d'); const dpr = Math.min(devicePixelRatio || 1, 2);
  const W = () => innerWidth, Hh = () => innerHeight;
  const resize = () => { cv.width = W() * dpr; cv.height = Hh() * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); }; resize(); addEventListener('resize', resize);
  const COLORS = ['#3ff4ff', '#ffb547', '#ff6fae', '#b48cff', '#ffffff', '#7dffb2'];
  const bits = []; function burst(n) { for (let i = 0; i < n; i++) bits.push({ x: W() / 2, y: Hh() * 0.42, vx: (Math.random() - 0.5) * 12, vy: -Math.random() * 12 - 4, r: Math.random() * 4 + 2, c: COLORS[i % COLORS.length], s: Math.random() * 6.28, life: 1 }); }
  burst(220);
  const rain = setInterval(() => { for (let i = 0; i < 6; i++) bits.push({ x: Math.random() * W(), y: -10, vx: (Math.random() - 0.5) * 1.5, vy: Math.random() * 2 + 1.5, r: Math.random() * 3 + 2, c: COLORS[(Math.random() * COLORS.length) | 0], s: Math.random() * 6.28, life: 1 }); }, 140);
  const frame = () => {
    if (!alive) return;
    g.clearRect(0, 0, W(), Hh());
    for (let i = bits.length - 1; i >= 0; i--) {
      const b = bits[i]; b.vy += 0.18; b.vx *= 0.99; b.x += b.vx; b.y += b.vy; b.s += 0.2;
      if (b.y > Hh() + 20) { bits.splice(i, 1); continue; }
      g.save(); g.translate(b.x, b.y); g.rotate(b.s); g.fillStyle = b.c; g.fillRect(-b.r, -b.r / 2, b.r * 2, b.r); g.restore();
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  sfx('complete');
}
