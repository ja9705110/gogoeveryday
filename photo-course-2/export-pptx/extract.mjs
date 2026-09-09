/* =========================================================================
   extract.mjs — 量測每一頁，並把版面拆成可編輯的物件
   產出：
     build/slides.json  每頁一個依繪製順序排好的 items 陣列
                        kind='shape' 卡片／色塊／標籤（→ PPT 圖形，可改色改大小）
                        kind='image' 插畫／手機介面／貼文卡（→ 各自獨立的圖片）
                        kind='text'  文字（→ 可編輯文字框）
     build/img/*.png    每個圖片物件自己的去背圖
     build/bg/NN.jpg    只剩下漸層與 CSS 裝飾線的底圖
   ========================================================================= */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BUILD = path.join(HERE, 'build');
const BG = path.join(BUILD, 'bg');
const IMG = path.join(BUILD, 'img');
fs.mkdirSync(BG, { recursive: true });
fs.mkdirSync(IMG, { recursive: true });

/* 這些整塊當成一張圖片輸出，內部不再拆解 */
const IMG_SEL = 'svg, .fr, .slot-ph, .baked';
/* 文字不獨立成文字框的容器（其文字屬於圖片的一部分） */
const BAKED = '.fr, .slot-ph, .baked, svg';
const MIN_PX = 20;   /* 字級下限：15pt */

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1320, height: 760 }, deviceScaleFactor: 2 });
await page.goto('file://' + path.join(HERE, '..', 'canva-import.html'), { waitUntil: 'load' });
await page.addStyleTag({
  content: `*{ font-family:"Noto Sans CJK TC","Noto Sans TC",sans-serif !important; }`
});
await page.waitForTimeout(1200);

/* ── 1. 先套字級下限，讓整頁重新排版 ─────────────────────────────────── */
await page.evaluate(({ BAKED, MIN_PX }) => {
  document.querySelectorAll('.pg *').forEach(el => {
    if (el.closest(BAKED)) return;
    if (![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length)) return;
    const cs = getComputedStyle(el);
    const fs = parseFloat(cs.fontSize);
    if (!(fs < MIN_PX)) return;
    const lh = parseFloat(cs.lineHeight);
    const ratio = Number.isFinite(lh) && fs ? lh / fs : 1.5;
    el.style.fontSize = MIN_PX + 'px';
    el.style.lineHeight = (MIN_PX * Math.max(ratio, 1.35)).toFixed(1) + 'px';
  });
}, { BAKED, MIN_PX });
await page.waitForTimeout(500);

/* ── 2. 依繪製順序把每頁拆成 shape / image / text ─────────────────────── */
const slides = await page.evaluate(({ IMG_SEL, BAKED }) => {
  const pt = v => +(v * 0.75).toFixed(2);
  const inch = v => +(v / 96).toFixed(4);
  const rgba = c => {
    const m = String(c).match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(',').map(parseFloat);
    return { hex: p.slice(0, 3).map(v => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase(),
             a: p.length > 3 ? p[3] : 1 };
  };

  const out = [];
  document.querySelectorAll('.pg').forEach((pg, pi) => {
    const pr = pg.getBoundingClientRect();
    const items = [];
    let imgSeq = 0;

    const rel = q => ({ x: inch(q.left - pr.left), y: inch(q.top - pr.top),
                        w: inch(q.width), h: inch(q.height) });

    const walk = el => {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return;
      const q = el.getBoundingClientRect();
      if (q.width < 1 || q.height < 1) return;

      const ownText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length);
      const anyText = el.textContent.trim().length > 0;
      const grad = cs.backgroundImage && cs.backgroundImage !== 'none';

      /* (a) 整塊圖片：插畫、手機介面、貼文卡，或沒有文字的漸層色塊 */
      if (el.matches(IMG_SEL) || (grad && !anyText)) {
        const id = `p${pi + 1}-${++imgSeq}`;
        el.setAttribute('data-imgid', id);
        el.classList.add('__isimg');
        items.push({ kind: 'image', id, ...rel(q) });
        return;                                   /* 內部不再往下拆 */
      }

      /* (b) 圖形：有底色或框線的方塊 */
      const bg = rgba(cs.backgroundColor);
      const hasFill = bg && bg.a > 0.02;
      /* 四邊分別讀：像 callout 只有左側粗色條，不能當成整圈框線 */
      const sides = ['Top', 'Right', 'Bottom', 'Left'].map(k => {
        const w = parseFloat(cs['border' + k + 'Width']) || 0;
        const c = rgba(cs['border' + k + 'Color']);
        return { k: k.toLowerCase(), w, c, on: w > 0.4 && c && c.a > 0.05 };
      });
      const on = sides.filter(s2 => s2.on);
      const uniform = on.length === 4 &&
        on.every(s2 => Math.abs(s2.w - on[0].w) < .3 && s2.c.hex === on[0].c.hex);
      if (hasFill || on.length) {
        const r = parseFloat(cs.borderTopLeftRadius) || 0;
        items.push({
          kind: 'shape', ...rel(q),
          fill: hasFill ? bg.hex : null,
          fillAlpha: hasFill ? bg.a : 0,
          line: uniform ? on[0].c.hex : null,
          lineW: uniform ? pt(on[0].w) : 0,
          dash: cs.borderTopStyle === 'dashed',
          radius: inch(Math.min(r, Math.min(q.width, q.height) / 2)),
          shadow: cs.boxShadow && cs.boxShadow !== 'none'
        });
        /* 非四邊一致：每一條邊各自輸出成細長方塊，才不會遺失 */
        if (!uniform) for (const s2 of on) {
          const b = { top:    { x: q.left, y: q.top,               w: q.width, h: s2.w },
                      bottom: { x: q.left, y: q.bottom - s2.w,     w: q.width, h: s2.w },
                      left:   { x: q.left, y: q.top,               w: s2.w,    h: q.height },
                      right:  { x: q.right - s2.w, y: q.top,       w: s2.w,    h: q.height } }[s2.k];
          items.push({ kind: 'shape',
            x: inch(b.x - pr.left), y: inch(b.y - pr.top), w: inch(b.w), h: inch(b.h),
            fill: s2.c.hex, fillAlpha: s2.c.a, line: null, lineW: 0,
            radius: 0, shadow: false, edge: true });
        }
        el.classList.add('__isshape');
      }

      /* (b2) ::before / ::after 的純色裝飾（例如卡片頂端的色條）。
         底圖會被上面的圖形蓋住，所以要另外輸出成物件。 */
      for (const pe of ['::before', '::after']) {
        const ps = getComputedStyle(el, pe);
        if (!ps || ps.content === 'none' || ps.position !== 'absolute') continue;
        const pc = rgba(ps.backgroundColor);
        if (!pc || pc.a < 0.05) continue;
        const num = v => { const n = parseFloat(v); return Number.isFinite(n) ? n : null; };
        const t = num(ps.top), l = num(ps.left), r = num(ps.right), bm = num(ps.bottom);
        let pw = num(ps.width), ph = num(ps.height);
        if (pw === null && l !== null && r !== null) pw = q.width - l - r;
        if (ph === null && t !== null && bm !== null) ph = q.height - t - bm;
        if (!pw || !ph || pw < 1 || ph < 1) continue;
        const px = l !== null ? q.left + l : (r !== null ? q.right - r - pw : q.left);
        const py = t !== null ? q.top + t : (bm !== null ? q.bottom - bm - ph : q.top);
        items.push({ kind: 'shape',
          x: inch(px - pr.left), y: inch(py - pr.top), w: inch(pw), h: inch(ph),
          fill: pc.hex, fillAlpha: pc.a, line: null, lineW: 0,
          radius: 0, shadow: false, edge: true });
      }

      /* (c) 文字：取最外層含文字的元素 */
      if (ownText && !el.closest(BAKED)) {
        const rects = [];
        const collect = node => {
          for (const n of node.childNodes) {
            if (n.nodeType === 3) {
              if (!n.textContent.trim()) continue;
              const rr = document.createRange();
              rr.selectNodeContents(n);
              rects.push(...[...rr.getClientRects()].filter(z => z.width > .5 && z.height > .5));
            } else if (n.nodeType === 1 && n.tagName !== 'BR'
                       && !n.matches(IMG_SEL) && !n.closest(IMG_SEL)) collect(n);
          }
        };
        collect(el);
        if (rects.length) {
          const L = Math.min(...rects.map(r => r.left)), R = Math.max(...rects.map(r => r.right));
          const T = Math.min(...rects.map(r => r.top)),  B = Math.max(...rects.map(r => r.bottom));
          const runs = [];
          const rd = (node, inh) => {
            for (const n of node.childNodes) {
              if (n.nodeType === 3) {
                const t = n.textContent.replace(/\s+/g, ' ');
                if (t.trim()) runs.push({ text: t, ...inh });
              } else if (n.nodeType === 1) {
                if (n.tagName === 'BR') { runs.push({ br: true }); continue; }
                if (n.matches(IMG_SEL) || n.closest(IMG_SEL)) continue;
                const s2 = getComputedStyle(n);
                rd(n, { color: (rgba(s2.color) || {}).hex || '241C17',
                        bold: parseInt(s2.fontWeight, 10) >= 600,
                        italic: s2.fontStyle === 'italic',
                        size: pt(parseFloat(s2.fontSize)) });
              }
            }
          };
          rd(el, { color: (rgba(cs.color) || {}).hex || '241C17',
                   bold: parseInt(cs.fontWeight, 10) >= 600,
                   italic: cs.fontStyle === 'italic',
                   size: pt(parseFloat(cs.fontSize)) });
          if (runs.some(r => r.text && r.text.trim())) {
            const lh = parseFloat(cs.lineHeight);
            items.push({
              kind: 'text',
              x: inch(L - pr.left - 4), y: inch(T - pr.top - 1),
              w: inch(R - L + 9),      h: inch(B - T + 2),
              size: pt(parseFloat(cs.fontSize)),
              line: Number.isFinite(lh) ? pt(lh) : null,
              align: cs.textAlign === 'center' ? 'center' : cs.textAlign === 'right' ? 'right' : 'left',
              letter: parseFloat(cs.letterSpacing) || 0,
              runs
            });
            el.classList.add('__notext');
            return;   /* 子層文字已收進 runs，不再往下 */
          }
        }
      }

      for (const c of el.children) walk(c);
    };

    pg.querySelectorAll(':scope > .slide, :scope > .pg-foot').forEach(root => {
      for (const c of root.children) walk(c);
      /* 章節頁的 .wrap 之外，頁尾本身也可能直接含文字 */
      if ([...root.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) walk(root);
    });

    out.push({ index: pi + 1, items });
  });
  return out;
}, { IMG_SEL, BAKED });

/* ── 3. 每個圖片物件各自去背輸出 ──────────────────────────────────────── */
let nImg = 0;
for (const s of slides) {
  for (const it of s.items) {
    if (it.kind !== 'image') continue;
    const h = await page.$(`[data-imgid="${it.id}"]`);
    if (!h) continue;
    await h.screenshot({ path: path.join(IMG, it.id + '.png'), omitBackground: true });
    nImg++;
  }
}

/* ── 4. 底圖：只保留漸層與 ::before/::after 這類 CSS 裝飾 ─────────────── */
await page.addStyleTag({
  content: `
    .__notext, .__notext *{ color:transparent !important;
      -webkit-text-fill-color:transparent !important; text-shadow:none !important; }
    .__isimg{ visibility:hidden !important; }
    .__isshape{ background:none !important; border-color:transparent !important;
      box-shadow:none !important; }
  `
});
await page.waitForTimeout(500);
const pgs = await page.$$('.pg');
for (let i = 0; i < pgs.length; i++) {
  await pgs[i].screenshot({ path: path.join(BG, String(i + 1).padStart(2, '0') + '.jpg'),
                            type: 'jpeg', quality: 88 });
}

fs.writeFileSync(path.join(BUILD, 'slides.json'), JSON.stringify(slides), 'utf8');

const c = { shape: 0, image: 0, text: 0 };
slides.forEach(s => s.items.forEach(i => c[i.kind]++));
const mb = d => (fs.readdirSync(d).reduce((a, f) => a + fs.statSync(path.join(d, f)).size, 0) / 1048576).toFixed(1);
console.log(`${slides.length} 頁　·　圖形 ${c.shape}　圖片 ${c.image}　文字 ${c.text}`);
console.log(`圖片檔 ${nImg} 個（${mb(IMG)} MB）　底圖 ${mb(BG)} MB`);

await browser.close();
