// 11/18 終章：回顧影片「11/08–11/18」與「我 30 歲了！」慶祝畫面
import { sfx, ambience, duck } from './audio.js';
import { mountCosmos } from './cosmos.js';

const wait = (ms, tok) => new Promise((r) => { const id = setTimeout(r, ms); if (tok) tok.timers.push(() => { clearTimeout(id); r(); }); });
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// iPhone：在使用者點擊的當下先「解鎖」之後要播放的音訊
export function primeAudio(a) {
  if (!a) return;
  try { a.muted = true; const pr = a.play(); if (pr) pr.then(() => { a.pause(); a.currentTime = 0; a.muted = false; }).catch(() => { a.muted = false; }); } catch (_) { a.muted = false; }
}

// chapters: [{ date, zone, title, hint, items: [{ type: 'photo', url } | { type: 'text', text }], audios: [HTMLAudioElement], missed, fav }]
// universe: 背景宇宙（所有情緒圍繞著他轉動，mountCosmos）
// ending: { voice: HTMLAudioElement|null, photo: url|null }
// 不替任何一天下定義：只放他當天的照片、聲音、日期和關卡名稱
export function playFilm({ chapters, universe, ending, onDone }) {
  const ov = el('div', 'film');
  const bg = el('div', 'film-bg');
  const img = el('div', 'film-img');
  const cap = el('div', 'film-cap');
  const bar = el('div', 'film-bar', '<i></i>');
  const mic = el('div', 'film-mic', '🎙 你的聲音');
  const skip = el('button', 'btn ghost sm film-skip', '略過');
  ov.append(bg, img, cap, bar, mic, skip);
  document.body.append(ov);
  const cos = universe ? mountCosmos(bg, { ...universe, mode: 'orbit', speed: 0.25, cy: 0.42 }) : null;
  const tok = { stop: false, timers: [] };
  const total = 1 + chapters.length + 1; let done = 0;
  const progress = () => { bar.firstChild.style.width = `${Math.min(100, (100 * done) / total)}%`; };
  const clearAll = () => { tok.timers.splice(0).forEach((f) => f()); };
  const stopAudio = () => { [ending.voice, ...chapters.flatMap((c) => c.audios || [])].forEach((a) => { try { a && a.pause(); } catch (_) {} }); duck(false); };
  const endCosmos = () => { if (cos) cos.stop(); };
  skip.onclick = () => { tok.stop = true; clearAll(); stopAudio(); clearImg(); if (ending.photo) setTimeout(() => showImg(ending.photo), 1250); };
  ambience('ceremony', true);

  const caption = (html) => { cap.innerHTML = html; cap.classList.remove('on'); void cap.offsetWidth; cap.classList.add('on'); };
  const showImg = (url) => {
    const f = el('div', 'film-frame'); f.style.backgroundImage = `url("${url.replace(/"/g, '%22')}")`;
    f.style.setProperty('--kx', `${Math.random() * 6 - 3}%`); f.style.setProperty('--ky', `${Math.random() * 6 - 3}%`);
    img.append(f); requestAnimationFrame(() => f.classList.add('on'));
    const old = [...img.children].slice(0, -1); setTimeout(() => old.forEach((o) => o.remove()), 1400);
  };
  const clearImg = () => { [...img.children].forEach((o) => o.classList.remove('on')); setTimeout(() => (img.innerHTML = ''), 1200); };
  const playClip = async (a, maxMs) => {
    if (!a || tok.stop) return;
    duck(true);
    try { a.currentTime = 0; await a.play(); } catch (_) { duck(false); return; }
    await Promise.race([new Promise((r) => (a.onended = r)), wait(maxMs, tok)]);
    try { a.pause(); } catch (_) {}
    duck(false);
  };

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
        caption(`<div class="film-date">${esc(c.date)}・${esc(c.title)}</div><div class="film-line">這一段，你沒有來。<br>但它一樣在你的宇宙裡轉動。</div>`);
        await wait(3600, tok);
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
    // 尾聲：宇宙一直在轉
    clearImg(); if (cos) cos.speed(0.6);
    for (const line of ['很多時候，我們會覺得自己停在原地。', '但其實每一分、每一秒，<br>你的世界都一直在運轉。', '每一個好，每一個壞，<br>都成了你宇宙的養分。', '讓你的宇宙，越來越豐富。', '所以，珍惜每一分、每一秒。']) {
      if (tok.stop) break; caption(`<div class="film-line">${line}</div>`); await wait(3400, tok);
    }
    if (!tok.stop && cos) cos.speed(1.6);
    if (!tok.stop && ending.photo) { showImg(ending.photo); sfx('complete'); await wait(3200, tok); }
    done = total; progress();
    stopAudio();
    skip.remove();
    // 結尾按鈕
    const go = el('button', 'btn primary film-go', '我 30 歲了！');
    const again = el('button', 'btn ghost sm', '再看一次');
    const box = el('div', 'film-end'); box.append(go, again);
    caption(''); ov.append(box);
    again.onclick = () => { endCosmos(); ov.remove(); onDone && onDone('replay'); };
    go.onclick = () => { endCosmos(); ov.remove(); onDone && onDone('thirty'); };
  })();
}

// 生日快樂歌（音樂盒，瀏覽器即時合成；旋律為公有領域）
// 回傳 { done: Promise, mute(bool), stop() }
export function happyBirthday(onLine) {
  const C = window.AudioContext || window.webkitAudioContext;
  if (!C) return { done: Promise.resolve(), mute() {}, stop() {} };
  const ac = new C(); try { ac.resume(); } catch (_) {}
  const master = ac.createGain(); master.gain.value = 0.9; master.connect(ac.destination);
  const verb = ac.createConvolver(); const len = ac.sampleRate * 1.6; const ir = ac.createBuffer(2, len, ac.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
  verb.buffer = ir; const wet = ac.createGain(); wet.gain.value = 0.25; verb.connect(wet); wet.connect(master);
  const hz = (n) => 440 * Math.pow(2, (n - 69) / 12);
  const bell = (t, n, dur, vol) => {
    for (const [mul, v] of [[1, 1], [2, 0.32], [3, 0.12], [4.2, 0.05]]) {
      const o = ac.createOscillator(); const g = ac.createGain();
      o.type = 'sine'; o.frequency.value = hz(n) * mul;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol * v, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0008, t + dur * (mul === 1 ? 1 : 0.5));
      o.connect(g); g.connect(master); g.connect(verb); o.start(t); o.stop(t + dur + 0.05);
    }
  };
  // 3/4 拍；每一拍 0.5 秒
  const B = 0.52;
  const G = 67, A = 69, Cn = 72, Bn = 71, D = 74, E = 76, F = 77, G2 = 79;
  const phrases = [
    { line: 'Happy birthday to you', notes: [[G, 0.75], [G, 0.25], [A, 1], [G, 1], [Cn, 1], [Bn, 2]], chord: [48, 55, 43] },
    { line: 'Happy birthday to you', notes: [[G, 0.75], [G, 0.25], [A, 1], [G, 1], [D, 1], [Cn, 2]], chord: [43, 50, 48] },
    { line: 'Happy birthday, dear Jasper', notes: [[G, 0.75], [G, 0.25], [G2, 1], [E, 1], [Cn, 1], [Bn, 1], [A, 2]], chord: [48, 53, 53] },
    { line: 'Happy birthday to you', notes: [[F, 0.75], [F, 0.25], [E, 1], [Cn, 1], [D, 1], [Cn, 2]], chord: [53, 43, 48] },
  ];
  let t = ac.currentTime + 0.35; const timers = [];
  phrases.forEach((ph, pi) => {
    const t0 = t;
    timers.push(setTimeout(() => onLine && onLine(ph.line, pi), Math.max(0, (t0 - ac.currentTime) * 1000)));
    const beats = ph.notes.reduce((x, n) => x + n[1], 0);
    ph.notes.forEach(([n, b]) => { bell(t, n, Math.max(0.6, b * B * 1.8), 0.22); t += b * B; });
    // 伴奏：每小節一個低音
    for (let m = 0; m < Math.ceil(beats / 3); m++) bell(t0 + (0.25 + m * 3) * B, ph.chord[m % ph.chord.length], 1.6, 0.09);
    t += B * 0.5;
  });
  const total = (t - ac.currentTime + 1.2) * 1000;
  let finish; const done = new Promise((r) => (finish = r));
  timers.push(setTimeout(() => { finish(); setTimeout(() => ac.close().catch(() => {}), 1500); }, total));
  return {
    done,
    mute: (m) => master.gain.setTargetAtTime(m ? 0 : 0.9, ac.currentTime, 0.05),
    stop: () => { timers.forEach(clearTimeout); try { ac.close(); } catch (_) {} finish(); },
  };
}

// 「我 30 歲了！」：歌曲＋慶祝畫面；之後出現「出發去找禮物」
export function celebrate({ song, onHunt }) {
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
  if (song) { try { song.pause(); song.currentTime = 0; } catch (_) {} }
  // 先唱生日快樂歌，唱完才播 NEON
  let muted = false;
  const lyric = (line) => { t2.textContent = line; t2.classList.remove('on'); void t2.offsetWidth; t2.classList.add('on'); };
  const hb = happyBirthday(lyric);
  mute.onclick = () => { muted = !muted; hb.mute(muted); if (song) song.muted = muted; mute.textContent = muted ? '🔇' : '🔊'; };
  let alive = true;
  hb.done.then(() => {
    if (!alive) return;
    lyric('第 1118 號觀察員，歡迎來到三十歲。');
    if (song) { try { song.currentTime = 0; song.muted = muted; song.play().catch(() => {}); } catch (_) {} }
    burst(200);
    setTimeout(() => {
      if (!alive) return;
      const b = el('button', 'btn primary', '出發去找禮物 →');
      b.onclick = () => { alive = false; hb.stop(); clearInterval(rain); removeEventListener('resize', resize); ov.classList.add('out'); setTimeout(() => ov.remove(), 500); onHunt && onHunt(); };
      next.append(el('div', 'party-q', '先猜猜看，你的禮物是什麼？'), b);
    }, 8000);
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
