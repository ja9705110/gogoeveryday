// 每日回顧儀式：片段浮上海面 → 當天的紀錄 → 符號 → 星球新層 → 結語
import { glyphSVG } from './glyphs.js';
import { signedUrl } from './api.js';
import { mountPlanet, layerStates, LAYERS } from './planet.js';
import { sfx, sound, ambience, unlock } from './audio.js';

// 每天的結尾：呼應當天做過的事 ＋ 明天的預告（next）
const PM = { p_tone: { mono: '黑白・永恆', film: '暖色・膠片', cool: '冷光・未來', cover: '高彩・封面' },
  p_outfit: { formal: '正式', smart: '俐落', self: '本色', bold: '大膽' },
  p_mood: { confident: '自信', gentle: '溫柔', calm: '冷靜', playful: '玩心' },
  p_scene: { studio: '純色空間', city: '城市街角', retro: '復古房間', light: '光影抽象' } };
const pick = (c, k) => PM[k][c['choice:' + k]];
const EPILOGUE = {
  1: { main: (c) => ['身分檔案：已建立。',
      ...(pick(c, 'p_tone') ? [`識別影像：${[pick(c, 'p_tone'), pick(c, 'p_outfit'), pick(c, 'p_mood'), pick(c, 'p_scene')].filter(Boolean).join('・')}。系統記住了你想被看見的樣子。`] : []),
      '停電的那一刻，你沒有停下。你找回了電，也找回了遺落在床邊的東西。',
      '時間同步完成。從今天起，這裡的時間和你的世界一起前進。'],
    alt: () => ['主電源沒有回來。但你在黑暗裡，自己找到了路。', '符號留下來了——只是換成了它的殘響。'],
    next: '明天，一段從深海傳來的訊號會抵達。裡面藏著的聲音，比你以為的還要多。' },
  2: { main: () => ['你把一段混在一起的訊號，拆成了六種聲音。',
      '印表機的耗材序號，一直印在你每天都會用完的東西上。', '那行亂碼不是亂碼——只是換了一種鍵盤說話。五隻貓咪，都留在那張照片裡了。', '你讓另一個人笑了。觀察站說，那是今天最清楚的頻率。'],
    alt: (c) => ['你沒有見到守夜人。但他把訊號抄下來，留給了你。', '等待，也是一種回應。'],
    next: '明天，溫室裡有一株植物病了。解藥，藏在你家的廚房。' },
  3: { main: () => ['你從廚房那本書裡，找到了調配的方法。', '六個數字，是六種用法與肌膚。照顧一個人，從來都需要細節。', '三個不同的人，陪你一起扮了鬼臉。植物喝下了歡樂，又長出了新的葉子。'],
    alt: () => ['溫室枯了，但根還在。', '你澆了水。新長出來的葉子，和原本的不一樣——也沒有比較差。'],
    next: '明天，鏡子裡會出現一個房間——比外面多一盞燈。' },
  4: { main: () => ['鏡子裡的數字，要翻過來讀才是真的。別人對你的看法也是——那是他們那一側的樣子，不是全部的你。', '房間裡沒有時鐘，只有鏡子裡有。你不需要一直照著別人的時間走。', '你拍下了鏡子裡的自己。有人說你很棒時，你不太相信；有人說了不同的話，你就假裝很堅強。', '原來「自信」不是從來不動搖，而是動搖的時候，也不用假裝沒事。一封邀請函到了——你本來的樣子，值得被好好看見。'],
    alt: () => ['鏡子碎了，但你把它拼回來了。', '邀請函有一點刮痕——它還是找到了你。'],
    next: '明天，守夜人藏起的投影卡，會在這個家的「電的源頭」附近。' },
  5: { main: () => ['卡片藏在你每天都會打開、卻很少注意的地方——是守夜人替你放的。', '保險箱不是真的在這裡，密碼也只出現在投影上。打開它的方法，一直只有你知道。', '裡面只有一張舊照片：「第 7 天，再用一次。」有些過去不是包袱，而是之後會派上用場的東西。', '原來「守護」不只是把東西鎖好，而是有人在你沒注意的地方替你看著；而你也願意，在對的時候把它打開。'],
    alt: () => ['你沒有拿到照片，只拿到它的形狀。', '有時候，形狀就足夠記住一件事。'],
    next: '明天，第一天的紀錄，會出現在一個不該出現的地方。' },
  6: { main: (c) => ['最早的紀錄出現了裂縫，你把起點的符號一個一個放回原位。', '那張考卷上答錯的十題，你一題一題改回了正確答案。答錯過，不代表你不夠好。',
      c['choice:fault'] === 'keep' ? '你選擇保留那道裂縫，它會提醒你曾經走過哪裡。' : c['choice:fault'] === 'repair' ? '你選擇修復最早的紀錄，留下來的變得更完整。' : '你走進了裂縫裡面。那裡沒有地圖，你還是走出來了。',
      '你拍下了一個修補過的東西。原來「接納」不是假裝沒有裂痕，而是帶著裂痕，依然被好好地使用——人也是。'],
    alt: () => ['裂縫比原本更深了。', '你沿著它走了一段，從另一個方向離開。'],
    next: '明天，一扇門會出現。它需要的，不只一雙手。' },
  7: { main: () => ['那扇門沒有門把，一個人怎麼推都推不開。', '你帶著一路收集的東西，又去找了很多雙手——三十格的手，一起描出了 ♥1118♥。', '原來「連結」是：你以為只能自己推開的門，一直有人願意把手借給你。'],
    alt: () => ['門消失了，只剩一道縫。', '你從縫隙裡看見了它——有些門會在別處再出現。'],
    next: '明天，你會站在一個岔路口。只能選一扇門。' },
  8: { main: (c) => [
      ({ keep: '你在兩扇門之間選了「保存」，把最厚的檔案先放回架上——有些重量，值得一直帶著。', release: '你在兩扇門之間選了「放手」，只留下第一天點亮的那盞燈——放下很多之後，最初的那一盞更亮。', stay: '你走進了那扇沒有名字的門。', system: '你保留了系統替你做的選擇。那也是一種選擇。' })[c['choice:fork']] || '你在兩扇門之間做了選擇。',
      '沒有走的那條路，你用聲音說了出來。它沒有消失，只是變成了你記得的樣子。', '原來「取捨」不是要選對，而是選了之後好好走下去；沒選的那條，也可以溫柔地記得。'],
    alt: () => ['岔路沒有等你。系統替你選了一扇門。', '但你把它改寫了——或者決定不改。兩者都算數。'],
    next: '明天，這八天的片段，會被倒回來播放一次。' },
  9: { main: () => ['投影機播放的，全是你這幾天親手留下的東西：照片、聲音、笑聲、那些合照。', '你把它們一段一段排回原來的順序，連空白的那一格，也有它的位置。', '你對三十歲的自己說了一句話，系統會在那一天替你播放。', '原來「肯定」不是等別人說你很好，而是回頭看見：這些，都是你自己走過來的。'],
    alt: () => ['回放中斷了。這一段，不會再播放。'],
    next: '明天，是最後一個片段。所有符號，會一起發出聲音。' },
  10: { main: () => ['核心的頻率是裂、聲、起、聲、門——由你走過的挫折、對話、開始和陪伴組成。', '核心顯示：030。這個數字，從一開始就是你。', '你放進核心的最後一樣東西，會跟著你，一起走進三十歲。', '原來「成為」不是變成另一個人，而是帶著走過的一切，繼續成為自己。'],
    alt: () => ['環沒有完全閉合。', '也許它本來就不需要閉合。'],
    next: '明天，第 030 號檔案室將會開啟。' },
};
const ACTION = { explore: '探索', preserve: '保存', adjust: '調整環境', rest: '靜置' };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const fmtT = (iso) => (iso ? new Date(iso).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }) : '');

export function ceremonyKey(pid, day) { return `p030.ceremony.${pid}.${day}`; }

export function playCeremony({ L, state, photos = [], onClose }) {
  const day = L.day;
  const alt = L.outcome === 'ALTERNATE';
  const layer = LAYERS.find((x) => x.day === day);
  const symbols = state.inventory.filter((i) => i.kind === 'symbol' && i.source_day === day);
  const items = state.inventory.filter((i) => i.kind === 'item' && i.source_day === day);
  const memories = [];
  for (const s of L.steps) {
    if (s.type === 'evidence') for (const e of (s.submissions || []).filter((x) => x.status !== 'REPLACED')) memories.push({ ...e, title: s.title });
    if (s.type === 'choice' && s.done) {
      const v = state.stats.choices?.['choice:' + s.flag];
      const opt = (s.options || []).find((o) => o.id === v);
      if (opt) memories.push({ kind: 'choice', title: s.title, text: opt.label });
    }
  }
  const obs = state.sample.history.find((h) => h.day === day);
  const hints = L.steps.reduce((a, s) => a + (s.hints ? s.hints.length : 0), 0);
  const mins = L.started_at && L.completed_at ? Math.max(1, Math.round((new Date(L.completed_at) - new Date(L.started_at)) / 60000)) : null;

  const root = document.createElement('div');
  root.className = 'ceremony';
  root.innerHTML = `<canvas class="cer-bg"></canvas><div class="cer-body"></div>
    <button class="btn ghost sm cer-skip hidden">略過</button><button class="btn ghost sm cer-mute hidden"></button>
    <div class="cer-gate"><div class="kicker">FRAGMENT ${String(L.day).padStart(2, '0')}</div>
      <div class="cer-gate-t">一個碎片正在浮上海面</div>
      <button class="btn primary cer-go">▶ 接收碎片</button>
      <div class="dim" style="font-size:12px">建議開啟聲音</div></div>`;
  document.body.append(root);
  const body = root.querySelector('.cer-body');
  let alive = true, stopPlanet = null;
  const close = () => { if (!alive) return; alive = false; stopPlanet && stopPlanet(); ambience('base'); root.classList.add('cer-out'); setTimeout(() => root.remove(), 600); onClose && onClose(); };
  const muteBtn = root.querySelector('.cer-mute');
  const paintMute = () => { muteBtn.textContent = sound.on ? '🔊' : '🔇'; };
  muteBtn.onclick = () => { sound.toggle(); if (sound.on) { unlock(); ambience('ceremony', true); } paintMute(); };
  root.querySelector('.cer-skip').onclick = () => { if (body.querySelector('.cer-end')) close(); else showAll(); };

  // 背景：海平面 + 浮起的光球
  const cv = root.querySelector('.cer-bg'), g = cv.getContext('2d');
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const W = innerWidth, H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
  const t0 = performance.now(), hz = H * 0.34;
  const bg = (now) => {
    if (!alive) return; requestAnimationFrame(bg);
    const t = (now - t0) / 1000;
    const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#01020a'); sky.addColorStop(0.34, '#06264a'); sky.addColorStop(1, '#00040c');
    g.fillStyle = sky; g.fillRect(0, 0, W, H);
    for (let j = 0; j < 6; j++) { g.strokeStyle = `rgba(63,244,255,${0.16 - j * 0.02})`; g.beginPath(); for (let x = 0; x <= W; x += 8) { const y = hz + j * j * 6 + Math.sin(x * 0.012 + t * 1.2 + j) * (2 + j); x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
    const oy = Math.max(hz - 60, H * 0.8 - t * 120) + Math.sin(t * 2) * 3;
    const col = alt ? '180,140,255' : '255,181,71';
    const gr = g.createRadialGradient(W / 2, oy, 0, W / 2, oy, 60); gr.addColorStop(0, `rgba(${col},.95)`); gr.addColorStop(0.3, `rgba(${col},.35)`); gr.addColorStop(1, `rgba(${col},0)`);
    g.fillStyle = gr; g.beginPath(); g.arc(W / 2, oy, 60, 0, 7); g.fill();
    if (oy <= hz - 59) for (let i = 0; i < 3; i++) { const p = ((t * 0.5 + i / 3) % 1); g.strokeStyle = `rgba(${col},${0.5 * (1 - p)})`; g.beginPath(); g.ellipse(W / 2, hz, p * 180, p * 40, 0, 0, 7); g.stroke(); }
  };
  requestAnimationFrame(bg);

  const add = (el) => { body.append(el); el.scrollIntoView({ behavior: 'smooth', block: 'end' }); return el; };
  const div = (cls, html) => { const d = document.createElement('div'); d.className = cls; if (html !== undefined) d.innerHTML = html; return d; };

  function memoryCard(m, i) {
    const c = div('cer-mem');
    c.style.setProperty('--tilt', `${(i % 2 ? 1 : -1) * (1 + (i % 3))}deg`);
    c.append(div('cer-mem-t', m.title || ''));
    if (m.kind === 'photo') { const img = document.createElement('img'); signedUrl(m.path).then((u) => u && (img.src = u)); c.classList.add('photo'); c.append(img); }
    else if (m.kind === 'audio') { const a = document.createElement('audio'); a.controls = true; a.preload = 'none'; signedUrl(m.path).then((u) => u && (a.src = u)); c.append(div('cer-wave', '<i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>'), a); }
    else if (m.kind === 'choice') c.append(div('cer-quote', `你選擇了：${m.text}`));
    else c.append(div('cer-quote', `「${m.text || ''}」`));
    if (m.submitted_at) c.append(div('cer-mem-d', fmtT(m.submitted_at)));
    return c;
  }

  function photoCard(ph, i) {
    const c = div('cer-mem photo');
    c.style.setProperty('--tilt', `${(i % 2 ? -1 : 1) * (1 + (i % 3))}deg`);
    c.append(div('cer-mem-t', `FRAGMENT ${String(day).padStart(2, '0')}`));
    const img = document.createElement('img'); img.src = ph.photo; c.append(img);
    if (ph.caption) c.append(div('cer-quote', ph.caption));
    return c;
  }

  let all = false;
  async function sequence() {
    sfx('ping');
    await wait(2200); if (!alive || all) return;
    add(div('cer-k', `FRAGMENT ${String(day).padStart(2, '0')} · RECOVERED`)); sfx('unlock');
    await wait(700); if (!alive || all) return;
    add(div('cer-title', `${L.title}${L.route_title ? `｜${L.route_title}` : ''}`));
    add(div('cer-meta', [alt ? '以替代路線歸檔' : '準時歸檔', fmtT(L.completed_at), mins ? `用時 ${mins} 分鐘` : '', hints ? `提示 ${hints} 次` : '無提示'].filter(Boolean).join('　·　')));
    await wait(1600); if (!alive || all) return;
    if (photos.length) {
      add(div('cer-h', '碎片裡封存的影像'));
      const pw = add(div('cer-mems cer-sealed'));
      for (const [i, ph] of photos.entries()) { if (!alive || all) return; pw.append(photoCard(ph, i)); sfx('complete'); await wait(2600); }
    }
    if (memories.length) {
      add(div('cer-h', '今日的紀錄'));
      const wrap = add(div('cer-mems'));
      for (const [i, m] of memories.entries()) { if (!alive || all) return; wrap.append(memoryCard(m, i)); sfx('type'); await wait(1100); }
    }
    if (obs) { add(div('cer-line', `樣本今日的觀察：${ACTION[obs.action] || obs.action}`)); await wait(900); }
    if (!alive || all) return;
    for (const s of symbols) {
      const c = add(div('cer-sym', `<div class="g" style="color:${s.data.echo ? '#b48cff' : '#ffb547'}">${glyphSVG(s.data.symbol)}</div><div><div class="n">取得符號：${s.name}</div><div class="d">頻率 ${s.digit}</div></div>`));
      sfx('find'); await wait(1400); if (!alive || all) return; void c;
    }
    for (const it of items) { add(div('cer-line', `取得物品：${it.name}`)); await wait(600); }
    if (layer) {
      const pc = div('cer-planet'); const pcv = document.createElement('canvas'); pcv.style.cssText = 'width:200px;height:200px;display:block;margin:0 auto';
      pc.append(pcv, div('cer-pl-t', `星球第 ${layer.day} 層結構已重建`), div('cer-pl-n', `${layer.name} · ${layer.en}${alt ? '（殘響）' : ''}`));
      add(pc); stopPlanet = mountPlanet(pcv, layerStates(state.levels), { highlight: day, size: 200 }); sfx('complete');
      await wait(3000); if (!alive || all) return;
    }
    const ep = EPILOGUE[day] || {};
    const lines = (ep[alt ? 'alt' : 'main'] || (() => []))(state.stats.choices || {});
    add(div('cer-h', '檔案 030 · 今日紀錄'));
    for (const line of lines) { add(div('cer-epi', line)); sfx('type'); await wait(1700); if (!alive || all) return; }
    if (ep.next) { await wait(600); add(div('cer-next', `<span>NEXT SIGNAL</span>${ep.next}`)); sfx('ping'); await wait(1500); }
    end();
  }
  function end() {
    if (body.querySelector('.cer-end')) return;
    const e = div('cer-end');
    const b1 = document.createElement('button'); b1.className = 'btn primary block'; b1.textContent = '返回終端'; b1.onclick = close;
    e.append(div('dim', '這段回顧已收進「紀錄」→「每日回顧」，隨時可以重播。'), b1);
    add(e);
  }
  function showAll() { // 略過動畫：一次顯示全部
    all = true; body.innerHTML = '';
    body.append(div('cer-k', `FRAGMENT ${String(day).padStart(2, '0')} · RECOVERED`), div('cer-title', L.title), div('cer-meta', [alt ? '以替代路線歸檔' : '準時歸檔', fmtT(L.completed_at)].join('　·　')));
    if (photos.length) { body.append(div('cer-h', '碎片裡封存的影像')); const w = div('cer-mems cer-sealed'); photos.forEach((ph, i) => w.append(photoCard(ph, i))); body.append(w); }
    if (memories.length) { body.append(div('cer-h', '今日的紀錄')); const w = div('cer-mems'); memories.forEach((m, i) => w.append(memoryCard(m, i))); body.append(w); }

    symbols.forEach((s) => body.append(div('cer-sym', `<div class="g" style="color:${s.data.echo ? '#b48cff' : '#ffb547'}">${glyphSVG(s.data.symbol)}</div><div><div class="n">取得符號：${s.name}</div><div class="d">頻率 ${s.digit}</div></div>`)));
    if (layer) { const pc = div('cer-planet'); const pcv = document.createElement('canvas'); pcv.style.cssText = 'width:200px;height:200px;display:block;margin:0 auto'; pc.append(pcv, div('cer-pl-t', `星球第 ${layer.day} 層：${layer.name}`)); body.append(pc); stopPlanet && stopPlanet(); stopPlanet = mountPlanet(pcv, layerStates(state.levels), { size: 200 }); }
    const ep = EPILOGUE[day] || {};
    body.append(div('cer-h', '檔案 030 · 今日紀錄'));
    ((ep[alt ? 'alt' : 'main'] || (() => []))(state.stats.choices || {})).forEach((l) => body.append(div('cer-epi', l)));
    if (ep.next) body.append(div('cer-next', `<span>NEXT SIGNAL</span>${ep.next}`));
    end();
  }
  // 點擊後才開始：iPhone 必須在手勢中啟動聲音
  root.querySelector('.cer-go').onclick = () => {
    if (sound.pref === null) sound.set(true); else unlock();
    ambience('ceremony', true);
    root.querySelector('.cer-gate').remove();
    root.querySelector('.cer-skip').classList.remove('hidden');
    muteBtn.classList.remove('hidden'); paintMute();
    sequence();
  };
}

// 每一關（stage）完成的小儀式；若管理者有上傳照片，接著展示照片
export function stageClear(n, total, title, photo) {
  const el = document.createElement('div');
  el.className = 'stage-clear' + (photo ? ' with-photo' : '');
  el.innerHTML = `<div class="sc-k">STAGE ${n}/${total}</div><div class="sc-t">CLEAR</div><div class="sc-n">${title || ''}</div>`;
  document.body.append(el);
  sfx('unlock');
  if (!photo) return new Promise((r) => setTimeout(() => { el.classList.add('out'); setTimeout(() => { el.remove(); r(); }, 400); }, 1700));
  return new Promise((r) => setTimeout(() => {
    const card = document.createElement('div'); card.className = 'sc-photo';
    const img = document.createElement('img'); img.src = photo.photo; card.append(img);
    if (photo.caption) { const c = document.createElement('div'); c.className = 'sc-cap'; c.textContent = photo.caption; card.append(c); }
    const b = document.createElement('button'); b.className = 'btn primary'; b.textContent = '繼續';
    b.onclick = () => { el.classList.add('out'); setTimeout(() => { el.remove(); r(); }, 400); };
    el.append(card, b); sfx('find');
  }, 1300));
}
