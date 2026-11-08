// 謎題元件：只負責操作介面；正確與否一律由伺服器判定
import { glyphSVG, NAMES } from './glyphs.js';
import { signedUrl } from './api.js';

export const h = (tag, attrs = {}, ...kids) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on')) el[k] = v;
    else if (v !== undefined && v !== null && v !== false) el.setAttribute(k, v);
  }
  for (const k of kids.flat()) if (k !== null && k !== undefined && k !== false) el.append(k.nodeType ? k : document.createTextNode(k));
  return el;
};

// ── 線索 ──
export function renderClue(c) {
  switch (c.type) {
    case 'note': return h('div', { class: 'clue note' }, c.text);
    case 'letter': return h('div', { class: 'clue letter' }, c.lines.join('\n'));
    case 'log': return h('div', { class: 'clue mono' }, c.lines.join('\n'));
    case 'clock': {
      const ha = ((c.h % 12) + c.m / 60) * 30, ma = c.m * 6;
      return h('div', { class: 'clue', html: `<svg viewBox="-60 -60 120 120" width="150" height="150" style="display:block;margin:auto;${c.mirror ? 'transform:scaleX(-1);filter:drop-shadow(0 0 10px rgba(160,255,240,.5))' : ''}">
        <circle r="54" fill="#e9e1cf" stroke="#3a3328" stroke-width="4"/>
        ${Array.from({ length: 12 }, (_, i) => `<line x1="0" y1="-46" x2="0" y2="${i % 3 ? -42 : -38}" stroke="#222" stroke-width="${i % 3 ? 1.5 : 3}" transform="rotate(${i * 30})"/>`).join('')}
        <line x1="0" y1="6" x2="0" y2="-26" stroke="#111" stroke-width="4.5" stroke-linecap="round" transform="rotate(${ha})"/>
        <line x1="0" y1="8" x2="0" y2="-42" stroke="#111" stroke-width="2.5" stroke-linecap="round" transform="rotate(${ma})"/>
        <circle r="3" fill="#a33"/></svg><div class="cap">${c.caption || ''}</div>` });
    }
    case 'mirror': return h('div', { class: 'clue' }, h('div', { class: 'mirror-text' }, c.text), h('div', { class: 'cap' }, c.caption || ''));
    case 'glyphs': return h('div', { class: 'clue' },
      h('div', { class: 'row', style: 'justify-content:center;gap:6px;color:#f2b84b', html: c.ids.map((g) => `<div style="width:46px">${glyphSVG(g)}</div>`).join('') }),
      h('div', { class: 'cap' }, c.caption || ''));
    case 'imprint': return h('div', { class: 'clue', html: keySVG(c.heights, '#8792a0', true) + `<div class="cap">${c.caption || ''}</div>` });
    case 'roots': return h('div', { class: 'clue', html: `<svg viewBox="0 0 250 90" width="100%">${c.has.map((r, i) => `<g transform="translate(${25 + i * 50} 10)">
        <text x="0" y="0" text-anchor="middle" fill="#7d8e9c" font-size="10" font-family="monospace">${'ⅠⅡⅢⅣⅤ'[i]}</text>
        <rect x="-14" y="8" width="28" height="70" fill="#3a2a1c"/>${r ? `<path d="M0 10 L0 40 M0 30 L-8 52 M0 34 L9 60 M0 40 L-3 70" stroke="#c9b48a" stroke-width="1.6" fill="none"/>` : `<path d="M0 10 L0 18" stroke="#6a5a40" stroke-width="1.6"/>`}</g>`).join('')}</svg><div class="cap">${c.caption || ''}</div>` });
    case 'slit': return slitClue(c.text);
    default: return h('div', { class: 'clue' }, JSON.stringify(c));
  }
}

function keySVG(heights, color, imprint) {
  const pts = heights.map((v, i) => `L${40 + i * 30} ${50 - v * 9} L${55 + i * 30} ${50 - v * 9}`).join(' ');
  return `<svg viewBox="0 0 220 80" width="100%" style="max-width:320px;display:block;margin:auto"><path d="M10 50 L40 50 ${pts} L200 50 L200 66 L10 66Z" fill="${imprint ? 'none' : '#c9a34a'}" stroke="${color}" stroke-width="2" ${imprint ? 'stroke-dasharray="4 3"' : ''}/></svg>`;
}

function slitClue(text) {
  const box = h('div', { class: 'slit' }, h('div', { class: 'txt' }, text));
  const mask = h('canvas', { class: 'mask' });
  box.append(mask);
  let x = 0.15;
  const draw = () => {
    const w = box.clientWidth, hh = box.clientHeight;
    mask.width = w; mask.height = hh;
    const g = mask.getContext('2d');
    g.fillStyle = '#050608'; g.fillRect(0, 0, w, hh);
    g.clearRect(x * w - 7, 0, 14, hh);
  };
  const move = (e) => { const r = box.getBoundingClientRect(); x = Math.min(1, Math.max(0, ((e.touches ? e.touches[0].clientX : e.clientX) - r.left) / r.width)); draw(); };
  box.addEventListener('pointermove', move); box.addEventListener('touchmove', move, { passive: true });
  requestAnimationFrame(draw);
  return h('div', { class: 'clue' }, box, h('div', { class: 'cap' }, '左右拖動，透過縫隙看。'));
}

// ── 元件 ──
const W = {};

W.story = (s, ctx) => h('div', {},
  h('button', { class: 'btn primary', onclick: (e) => ctx.send({}, e.target) }, s.optional ? '嘗試' : '繼續'));

W.switches = (s, ctx) => {
  const state = (s.initial || '0'.repeat(s.count)).split('').map(Number);
  const row = h('div', { class: 'switches' });
  state.forEach((v, i) => {
    const b = h('button', { class: 'sw' + (v ? ' on' : ''), 'aria-label': '開關 ' + (s.labels?.[i] || i + 1) }, h('span', {}, s.labels?.[i] || String(i + 1)));
    b.onclick = () => { state[i] = state[i] ? 0 : 1; b.classList.toggle('on', !!state[i]); };
    row.append(b);
  });
  return h('div', {}, row, h('div', { style: 'height:20px' }),
    h('button', { class: 'btn primary block', onclick: (e) => ctx.send({ value: state.join('') }, e.target) }, '拉下主閘'));
};

W.keypad = (s, ctx) => {
  let v = '';
  const disp = h('div', { class: 'keypad-display' + (s.length > 6 ? ' long' : '') }, '');
  const upd = () => { disp.textContent = v.padEnd(s.length, '·'); };
  const pad = h('div', { class: 'keypad' });
  [1, 2, 3, 4, 5, 6, 7, 8, 9, '⌫', 0, '⏎'].forEach((k) => pad.append(h('button', {
    onclick: (e) => {
      if (k === '⌫') v = v.slice(0, -1);
      else if (k === '⏎') { if (v.length === s.length) ctx.send({ value: v }, e.target).then((r) => { if (!r?.correct) { v = ''; upd(); } }); }
      else if (v.length < s.length) v += k;
      upd();
    },
  }, String(k))));
  upd();
  return h('div', {}, disp, pad);
};

W.letters = (s, ctx) => { // A–D 選項密碼
  let v = '';
  const letters = s.letters || ['A', 'B', 'C', 'D'];
  const disp = h('div', { class: 'keypad-display long' }, '');
  const upd = () => { disp.textContent = v.padEnd(s.length, '·'); };
  const pad = h('div', { class: 'keypad', style: 'grid-template-columns:repeat(4,1fr)' });
  letters.forEach((k) => pad.append(h('button', { onclick: () => { if (v.length < s.length) v += k; upd(); } }, k)));
  pad.append(h('button', { style: 'grid-column:span 2', onclick: () => { v = v.slice(0, -1); upd(); } }, '⌫'),
    h('button', { style: 'grid-column:span 2', onclick: (e) => { if (v.length === s.length) ctx.send({ value: v }, e.target).then((r) => { if (!r?.correct) { v = ''; upd(); } }); } }, '⏎'));
  upd();
  return h('div', {}, disp, pad);
};

W.dial = (s, ctx) => {
  const digits = s.digits || [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const idx = Array(s.dials).fill(0);
  const fmt = s.format || '#'.repeat(s.dials);
  const row = h('div', { class: 'dials' });
  let di = 0;
  for (const ch of fmt) {
    if (ch !== '#') { row.append(h('span', { class: 'dot' }, ch)); continue; }
    const i = di++;
    const val = h('div', { class: 'v' }, String(digits[0]));
    const set = (d) => { idx[i] = (idx[i] + d + digits.length) % digits.length; val.textContent = digits[idx[i]]; };
    row.append(h('div', { class: 'dial' }, h('button', { onclick: () => set(1), 'aria-label': '上' }, '▲'), val, h('button', { onclick: () => set(-1), 'aria-label': '下' }, '▼')));
  }
  if (s.clue?.some?.((c) => c.type === 'imprint')) {
    const preview = h('div', {});
    const draw = () => { preview.innerHTML = keySVG(idx.map((i) => digits[i]), '#c9a34a', false); };
    row.querySelectorAll('button').forEach((b) => b.addEventListener('click', draw)); draw();
    return h('div', {}, row, preview, h('button', { class: 'btn primary block', onclick: (e) => ctx.send({ value: idx.map((i) => digits[i]).join('') }, e.target) }, '確認'));
  }
  return h('div', {}, row, h('button', { class: 'btn primary block', onclick: (e) => ctx.send({ value: idx.map((i) => digits[i]).join('') }, e.target) }, '確認'));
};

function plantSVG(stage) {
  const hgt = 8 + stage * 8;
  return `<svg viewBox="0 0 48 64"><rect x="14" y="50" width="20" height="12" fill="#5a3a22"/>
    ${stage >= 2 ? `<path d="M24 50 V${50 - hgt}" stroke="#4caf6a" stroke-width="2.5"/>` : '<ellipse cx="24" cy="48" rx="3" ry="2" fill="#a07c4c"/>'}
    ${stage >= 3 ? `<ellipse cx="18" cy="${50 - hgt * 0.5}" rx="6" ry="3" fill="#5cc47a"/>` : ''}
    ${stage >= 4 ? `<ellipse cx="30" cy="${50 - hgt * 0.7}" rx="6" ry="3" fill="#5cc47a"/>` : ''}
    ${stage >= 5 ? `<circle cx="24" cy="${50 - hgt}" r="5" fill="#f2b84b"/>` : ''}</svg>`;
}

W.sequence = (s, ctx) => {
  const order = [];
  const slots = h('div', { class: 'slots' });
  const grid = h('div', { class: 'pickgrid' });
  const btns = {};
  const draw = () => {
    slots.innerHTML = '';
    for (let i = 0; i < s.pick; i++) slots.append(h('div', { class: 'slot' }, order[i] ? String(i + 1) : ''));
    Object.entries(btns).forEach(([id, b]) => b.classList.toggle('used', order.includes(id)));
  };
  for (const it of s.items) {
    const b = h('button', { class: 'pick', html: s.render === 'plant' ? plantSVG(it.stage) : `<div style="font-size:20px;letter-spacing:-2px">${it.label}</div>` });
    b.onclick = () => { if (!order.includes(it.id) && order.length < s.pick) { order.push(it.id); draw(); } };
    btns[it.id] = b; grid.append(b);
  }
  draw();
  return h('div', {}, grid, slots, h('div', { class: 'row' },
    h('button', { class: 'btn ghost', onclick: () => { order.length = 0; draw(); } }, '重來'),
    h('button', { class: 'btn primary spacer', onclick: (e) => { if (order.length === s.pick) ctx.send({ value: order.join(',') }, e.target).then((r) => { if (!r?.correct) { order.length = 0; draw(); } }); } }, '確認')));
};

W.symbols = (s, ctx) => {
  const owned = new Map();
  for (const it of ctx.inventory.filter((i) => i.kind === 'symbol')) {
    const id = it.data.symbol;
    if (!owned.has(id) || !it.data.echo) owned.set(id, it);
  }
  const seq = [];
  const slots = h('div', { class: 'slots' });
  const draw = () => {
    slots.innerHTML = '';
    for (let i = 0; i < s.slots; i++) slots.append(h('div', { class: 'slot', html: seq[i] ? glyphSVG(seq[i]) : '' }));
  };
  const grid = h('div', { class: 'pickgrid' });
  if (!owned.size) grid.append(h('p', { class: 'dim' }, '你目前沒有任何符號。'));
  [...owned.entries()].sort((a, b) => a[0] - b[0]).forEach(([id, it]) => {
    grid.append(h('button', { class: 'pick' + (it.data.echo ? ' echo' : ''), html: glyphSVG(id) + `<span>${it.name}</span>`,
      onclick: () => { if (seq.length < s.slots) { seq.push(id); draw(); } } }));
  });
  draw();
  return h('div', {}, slots, grid, h('div', { class: 'row' },
    h('button', { class: 'btn ghost', onclick: () => { seq.length = 0; draw(); } }, '清除'),
    h('button', { class: 'btn primary spacer', onclick: (e) => { if (seq.length === s.slots) ctx.send({ value: seq.map((x) => 'sym' + x).join(',') }, e.target).then((r) => { if (!r?.correct) { seq.length = 0; draw(); } }); } }, '放入')));
};

W.text = (s, ctx) => {
  const inp = h('input', { type: 'text', placeholder: s.placeholder || '', autocomplete: 'off' });
  return h('div', {}, inp, h('div', { style: 'height:8px' }), h('button', { class: 'btn primary block', onclick: (e) => ctx.send({ value: inp.value }, e.target) }, '送出'));
};

W.choice = (s, ctx) => {
  let sel = null;
  const box = h('div', { class: 'choice' });
  const confirm = h('button', { class: 'btn primary block', disabled: true, onclick: (e) => sel && ctx.send({ option: sel }, e.target) }, '確定（無法反悔）');
  for (const o of s.options) {
    const b = h('button', {}, o.label, o.desc ? h('small', {}, o.desc) : null);
    b.onclick = () => { sel = o.id; box.querySelectorAll('button').forEach((x) => x.classList.remove('sel')); b.classList.add('sel'); confirm.disabled = false; };
    box.append(b);
  }
  return h('div', {}, box, confirm);
};

W.observe = (s, ctx) => h('div', { class: 'row' },
  h('a', { class: 'btn', href: '#/lab' }, '前往培養艙'),
  h('button', { class: 'btn primary spacer', onclick: (e) => ctx.send({}, e.target) }, '我已完成觀察'));

W.find = (s, ctx) => {
  const box = h('div', { class: 'find' });
  const marks = { glyph: '<svg width="44" height="44" viewBox="0 0 48 48"><circle cx="24" cy="24" r="16" fill="none" stroke="#9fffe0" stroke-width="3"/></svg>',
    w1: '<svg width="40" height="20"><path d="M2 10 L38 12" stroke="#777" stroke-width="2"/></svg>',
    w2: '<svg width="30" height="30"><path d="M4 4 L26 26 M26 4 L4 26" stroke="#6a6a6a" stroke-width="2"/></svg>',
    w3: '<svg width="30" height="30"><rect x="4" y="4" width="22" height="22" fill="none" stroke="#666" stroke-width="2"/></svg>' };
  for (const sp of s.spots) {
    const m = h('button', { class: 'mark', style: `left:${sp.x}%;top:${sp.y}%;background:none;border:0;padding:6px`, html: marks[sp.id] || marks.w1, 'aria-label': '牆上的記號' });
    m.onclick = (e) => ctx.send({ value: sp.id }, e.currentTarget);
    box.append(m);
  }
  const light = h('canvas', { class: 'light' });
  box.append(light);
  let lx = 0.5, ly = 0.5;
  const draw = () => {
    const w = box.clientWidth, hh = box.clientHeight; light.width = w; light.height = hh;
    const g = light.getContext('2d');
    g.fillStyle = 'rgba(0,0,0,.97)'; g.fillRect(0, 0, w, hh);
    g.globalCompositeOperation = 'destination-out';
    const gr = g.createRadialGradient(lx * w, ly * hh, 0, lx * w, ly * hh, 70);
    gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(lx * w, ly * hh, 70, 0, Math.PI * 2); g.fill();
    g.globalCompositeOperation = 'source-over';
  };
  box.addEventListener('pointermove', (e) => { const r = box.getBoundingClientRect(); lx = (e.clientX - r.left) / r.width; ly = (e.clientY - r.top) / r.height; draw(); });
  box.addEventListener('pointerdown', (e) => { const r = box.getBoundingClientRect(); lx = (e.clientX - r.left) / r.width; ly = (e.clientY - r.top) / r.height; draw(); });
  requestAnimationFrame(draw);
  return h('div', {}, box, h('p', { class: 'dim', style: 'font-size:13px' }, '移動手指照亮牆面，點選你要找的記號。'));
};

W.rotate = (s, ctx) => {
  const rot = [...s.start];
  const quarters = [
    '<rect x="20" y="40" width="80" height="60" fill="#e9e1cf"/><path d="M20 40 L100 90" stroke="#a33" stroke-width="4"/>',
    '<rect x="0" y="40" width="80" height="60" fill="#e9e1cf"/><path d="M80 40 L0 90" stroke="#a33" stroke-width="4"/>',
    '<rect x="20" y="0" width="80" height="60" fill="#e9e1cf"/><path d="M20 0 L100 50" stroke="#a33" stroke-width="4" opacity=".3"/><text x="80" y="40" font-size="16" fill="#3a3328">邀</text>',
    '<rect x="0" y="0" width="80" height="60" fill="#e9e1cf"/><text x="10" y="40" font-size="16" fill="#3a3328">請</text>',
  ];
  const grid = h('div', { class: 'tiles' });
  const tiles = quarters.map((q, i) => {
    const t = h('div', { class: 'tile', html: `<svg viewBox="0 0 100 100"><rect width="100" height="100" fill="#141b26"/>${q}<path d="M0 0 L100 100" stroke="#cfe" stroke-opacity=".15"/></svg>` });
    t.style.transform = `rotate(${rot[i] * 90}deg)`;
    t.onclick = () => { rot[i] = (rot[i] + 1) % 4; t.style.transform = `rotate(${rot[i] * 90}deg)`; };
    grid.append(t); return t;
  });
  return h('div', {}, grid, h('button', { class: 'btn primary block', onclick: (e) => ctx.send({ value: rot.join('') }, e.target) }, '確認'));
};

W.rings = (s, ctx) => {
  const idx = s.rings.map(() => 0);
  const row = h('div', { class: 'rings' });
  s.rings.forEach((opts, i) => {
    const g = h('div', { class: 'g', html: glyphSVG(opts[0]) });
    row.append(h('div', { class: 'ring' }, h('button', { class: 'btn sm', onclick: () => { idx[i] = (idx[i] + 1) % opts.length; g.innerHTML = glyphSVG(opts[idx[i]]); } }, '轉動'), g));
  });
  return h('div', {}, row, h('button', { class: 'btn primary block', onclick: (e) => ctx.send({ value: s.rings.map((o, i) => o[idx[i]]).join(',') }, e.target) }, '推開'));
};

W.wait = (s, ctx) => {
  const out = h('div', { class: 'keypad-display' }, String(s.seconds));
  let timer = null, left = s.seconds;
  const btn = h('button', { class: 'btn primary block' }, '開始停留');
  const stop = () => { clearInterval(timer); timer = null; };
  btn.onclick = async (e) => {
    const r = await ctx.send({}, e.target, { silentFail: true });
    if (r?.correct) return;
    left = s.seconds + 1; btn.disabled = true; stop();
    timer = setInterval(async () => {
      left -= 1; out.textContent = String(Math.max(0, left));
      if (left <= 0) { stop(); btn.disabled = false; await ctx.send({}, btn); }
    }, 1000);
  };
  document.addEventListener('visibilitychange', () => { if (document.hidden && timer) { stop(); btn.disabled = false; out.textContent = '你離開了。'; } }, { once: false });
  return h('div', {}, out, h('div', { style: 'height:8px' }), btn);
};

W.timeline = (s, ctx) => {
  const order = [];
  const grid = h('div', { class: 'tl-cards' });
  const els = {};
  s.cards.forEach((c) => {
    const el = h('div', { class: 'tl-card' + (c.kind === 'void' ? ' void' : '') });
    if (c.kind === 'void') el.append('［空白］');
    else if (c.kind === 'text') el.append(h('div', {}, '「' + (c.text || '') + '」'));
    else if (c.kind === 'photo') { const img = h('img', { alt: '' }); signedUrl(c.path).then((u) => u && (img.src = u)); el.append(img); }
    else if (c.kind === 'audio') { const a = h('audio', { controls: true, preload: 'none', style: 'width:100%' }); signedUrl(c.path).then((u) => u && (a.src = u)); el.append(h('div', { class: 'dim' }, '一段聲音'), a); }
    else el.append(h('div', { style: 'width:44px;margin:auto;color:' + (c.echo ? '#7d8e9c' : '#f2b84b'), html: glyphSVG(c.symbol) }));
    const n = h('div', { class: 'n' }, '');
    el.append(n);
    el.onclick = (e) => {
      if (e.target.tagName === 'AUDIO') return;
      const i = order.indexOf(c.id);
      if (i >= 0) order.splice(i, 1); else order.push(c.id);
      Object.entries(els).forEach(([id, x]) => { const k = order.indexOf(id); x.n.textContent = k >= 0 ? k + 1 : ''; x.el.classList.toggle('picked', k >= 0); });
    };
    els[c.id] = { el, n };
    grid.append(el);
  });
  return h('div', {}, grid, h('button', { class: 'btn primary block', onclick: (e) => {
    if (order.length !== s.cards.length) { ctx.toast('還有片段沒有排進去。'); return; }
    ctx.send({ value: order.join(',') }, e.target);
  } }, '播放'));
};

W.ar = (s, ctx) => {
  const box = h('div', {});
  box.append(h('button', { class: 'btn primary block', onclick: () => ctx.openAR(s) }, '開啟相機掃描'));
  if (s.fallback_enabled) {
    const inp = h('input', { type: 'text', placeholder: '備用驗證碼', autocomplete: 'off' });
    box.append(h('div', { class: 'card' }, h('div', { class: 'dim', style: 'font-size:13px' }, '備用驗證已啟用：輸入卡片背面或管理者提供的驗證碼。'), inp,
      h('div', { style: 'height:8px' }), h('button', { class: 'btn block', onclick: (e) => ctx.send({ code: inp.value }, e.target) }, '驗證')));
  }
  return box;
};

W.evidence = (s, ctx) => ctx.evidenceWidget(s);

export function renderRevealed(step) {
  const r = step.reveal;
  if (!r) return null;
  if (r.overlay === 'safe') return h('div', { class: 'clue mono', style: 'text-align:center;font-size:22px;color:#f2b84b' }, '投影紀錄：' + r.digits.split('').join(' · '));
  if (r.overlay === 'totem') return h('div', { class: 'clue', html: `<div class="dim" style="font-size:12px">投影紀錄：圖騰</div><div class="row" style="justify-content:center;color:#f2b84b">${r.glyphs.map((g) => `<div style="width:44px">${glyphSVG(g)}</div>`).join('')}</div>` });
  return null;
}

export function renderWidget(step, ctx) {
  const f = W[step.type];
  return f ? f(step, ctx) : h('div', { class: 'dim' }, '未知的機關：' + step.type);
}
export { NAMES };
