// 11/18 終章：回顧影片「11/08–11/18」與「我 30 歲了！」慶祝畫面
import { sfx, ambience, duck } from './audio.js';

const wait = (ms, tok) => new Promise((r) => { const id = setTimeout(r, ms); if (tok) tok.timers.push(() => { clearTimeout(id); r(); }); });
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// iPhone：在使用者點擊的當下先「解鎖」之後要播放的音訊
export function primeAudio(a) {
  if (!a) return;
  try { a.muted = true; const pr = a.play(); if (pr) pr.then(() => { a.pause(); a.currentTime = 0; a.muted = false; }).catch(() => { a.muted = false; }); } catch (_) { a.muted = false; }
}

// chapters: [{ date, zone, word, def, photos: [url], audio: HTMLAudioElement|null, missed }]
// ending: { voice: HTMLAudioElement|null, photo: url|null }
export function playFilm({ chapters, ending, onDone }) {
  const ov = el('div', 'film');
  const bg = el('div', 'film-bg');
  const img = el('div', 'film-img');
  const cap = el('div', 'film-cap');
  const bar = el('div', 'film-bar', '<i></i>');
  const skip = el('button', 'btn ghost sm film-skip', '略過');
  ov.append(bg, img, cap, bar, skip);
  document.body.append(ov);
  const tok = { stop: false, timers: [] };
  const total = 1 + chapters.length + 1; let done = 0;
  const progress = () => { bar.firstChild.style.width = `${Math.min(100, (100 * done) / total)}%`; };
  const clearAll = () => { tok.timers.splice(0).forEach((f) => f()); };
  const stopAudio = () => { [ending.voice, ...chapters.map((c) => c.audio)].forEach((a) => { try { a && a.pause(); } catch (_) {} }); duck(false); };
  skip.onclick = () => { tok.stop = true; clearAll(); stopAudio(); };
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
      caption(`<div class="film-date">${esc(c.date)}・${esc(c.zone)}</div><div class="film-word">${esc(c.word)}</div>`);
      sfx('ping'); await wait(2600, tok); if (tok.stop) break;
      if (c.missed) {
        caption(`<div class="film-date">${esc(c.date)}・${esc(c.zone)}</div><div class="film-line">這一段，你沒有來。<br>但它一樣是你。</div>`);
        await wait(3600, tok);
      } else {
        caption(`<div class="film-date">${esc(c.date)}・${esc(c.word)}</div><div class="film-def">${esc(c.def)}</div>`);
        const clip = playClip(c.audio, 9000);
        const shots = c.photos.length ? c.photos.slice(0, 3) : [];
        if (!shots.length) await wait(4200, tok);
        for (const u of shots) { if (tok.stop) break; showImg(u); await wait(3400, tok); }
        await clip;
      }
      done++; progress();
    }
    // 尾聲
    clearImg();
    if (!tok.stop && ending.voice) {
      caption('<div class="film-date">11/18</div><div class="film-line">你對三十歲的自己說：</div><div class="film-wave"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>');
      await wait(1200, tok); await playClip(ending.voice, 90000);
    }
    if (!tok.stop && ending.photo) { showImg(ending.photo); await wait(800, tok); }
    if (!tok.stop) { caption('<div class="film-word">30｜未完成的我</div>'); sfx('complete'); await wait(3200, tok); }
    if (!tok.stop) { caption('<div class="film-line">定義權限已移交本人。<br>檔案狀態：持續更新中。</div>'); await wait(3200, tok); }
    done = total; progress();
    stopAudio();
    skip.remove();
    // 結尾按鈕
    const go = el('button', 'btn primary film-go', '我 30 歲了！');
    const again = el('button', 'btn ghost sm', '再看一次');
    const box = el('div', 'film-end'); box.append(go, again);
    caption(''); ov.append(box);
    again.onclick = () => { ov.remove(); onDone && onDone('replay'); };
    go.onclick = () => { ov.remove(); onDone && onDone('thirty'); };
  })();
}

// 「我 30 歲了！」：歌曲＋慶祝畫面；之後出現「出發去找禮物」
export function celebrate({ song, onHunt }) {
  const ov = el('div', 'party');
  const cv = el('canvas', 'party-cv');
  const big = el('div', 'party-30', '30');
  const t1 = el('div', 'party-t', '生日快樂');
  const t2 = el('div', 'party-s', '第 1118 號觀察員，歡迎來到三十歲。');
  const mute = el('button', 'btn ghost sm party-mute', '🔊');
  const next = el('div', 'party-next');
  ov.append(cv, big, t1, t2, mute, next);
  document.body.append(ov);
  duck(true);
  mute.onclick = () => { if (!song) return; song.muted = !song.muted; mute.textContent = song.muted ? '🔇' : '🔊'; };
  // 彩帶與星光
  const g = cv.getContext('2d'); const dpr = Math.min(devicePixelRatio || 1, 2);
  const W = () => innerWidth, Hh = () => innerHeight;
  const resize = () => { cv.width = W() * dpr; cv.height = Hh() * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); }; resize(); addEventListener('resize', resize);
  const COLORS = ['#3ff4ff', '#ffb547', '#ff6fae', '#b48cff', '#ffffff', '#7dffb2'];
  const bits = []; const burst = (n) => { for (let i = 0; i < n; i++) bits.push({ x: W() / 2, y: Hh() * 0.42, vx: (Math.random() - 0.5) * 12, vy: -Math.random() * 12 - 4, r: Math.random() * 4 + 2, c: COLORS[i % COLORS.length], s: Math.random() * 6.28, life: 1 }); };
  burst(220);
  const rain = setInterval(() => { for (let i = 0; i < 6; i++) bits.push({ x: Math.random() * W(), y: -10, vx: (Math.random() - 0.5) * 1.5, vy: Math.random() * 2 + 1.5, r: Math.random() * 3 + 2, c: COLORS[(Math.random() * COLORS.length) | 0], s: Math.random() * 6.28, life: 1 }); }, 140);
  let alive = true;
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
  setTimeout(() => burst(160), 1800);
  sfx('complete');
  setTimeout(() => {
    const b = el('button', 'btn primary', '出發去找禮物 →');
    b.onclick = () => { alive = false; clearInterval(rain); removeEventListener('resize', resize); ov.classList.add('out'); setTimeout(() => ov.remove(), 500); onHunt && onHunt(); };
    next.append(el('div', 'party-q', '先猜猜看，你的禮物是什麼？'), b);
  }, 9000);
}
