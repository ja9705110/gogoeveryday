/* =========================================================================
   extract.mjs — 從 canva-import.html 量測每一頁的文字與版面
   產出：
     build/slides.json   每頁的文字框（位置、字級、行高、顏色、對齊）
     build/bg/NN.png     該頁「把可編輯文字隱藏後」的背景圖（插畫、卡片、手機介面）
   ========================================================================= */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BUILD = path.join(HERE, 'build');
const BG = path.join(BUILD, 'bg');
fs.mkdirSync(BG, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1320, height: 760 }, deviceScaleFactor: 2 });
await page.goto('file://' + path.join(HERE, '..', 'canva-import.html'), { waitUntil: 'load' });
await page.addStyleTag({
  content: `*{ font-family:"Noto Sans CJK TC","Noto Sans TC",sans-serif !important; }`
});
await page.waitForTimeout(1200);

/* 這些容器裡的文字屬於「示意圖」的一部分，烘進背景圖，不做成文字框 */
const BAKED = '.phone, .post, svg, .thumb, .ig-grid, .richmenu, .slot';

const slides = await page.evaluate((BAKED) => {
  const px2pt = v => +(v * 0.75).toFixed(2);
  const px2in = v => +(v / 96).toFixed(4);
  const hex = c => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return '241C17';
    const [r, g, b] = m[1].split(',').map(s => parseFloat(s));
    return [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
  };

  const out = [];
  document.querySelectorAll('.pg').forEach((pg, pi) => {
    const pr = pg.getBoundingClientRect();
    const boxes = [];

    /* 找出「文字葉節點」：本身直接含有非空白文字的元素 */
    const all = pg.querySelectorAll('*');
    for (const el of all) {
      if (el.closest(BAKED)) continue;
      const hasOwnText = [...el.childNodes].some(
        n => n.nodeType === 3 && n.textContent.trim().length
      );
      if (!hasOwnText) continue;

      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue;

      /* 用 Range 量真正的文字範圍，才能處理 flex 置中、padding 等情況 */
      const range = document.createRange();
      range.selectNodeContents(el);
      const rects = [...range.getClientRects()].filter(r => r.width > 0.5 && r.height > 0.5);
      if (!rects.length) continue;
      const L = Math.min(...rects.map(r => r.left));
      const R = Math.max(...rects.map(r => r.right));
      const T = Math.min(...rects.map(r => r.top));
      const B = Math.max(...rects.map(r => r.bottom));

      /* 把子節點拆成 runs，保留粗體與強調色 */
      const runs = [];
      const walk = (node, inherited) => {
        for (const n of node.childNodes) {
          if (n.nodeType === 3) {
            const t = n.textContent.replace(/\s+/g, ' ');
            if (t.trim()) runs.push({ text: t, ...inherited });
          } else if (n.nodeType === 1) {
            if (n.tagName === 'BR') { runs.push({ br: true }); continue; }
            if (n.matches(BAKED) || n.closest(BAKED) !== el.closest(BAKED)) continue;
            const s = getComputedStyle(n);
            walk(n, {
              color: hex(s.color),
              bold: parseInt(s.fontWeight, 10) >= 600,
              italic: s.fontStyle === 'italic',
              size: px2pt(parseFloat(s.fontSize))
            });
          }
        }
      };
      walk(el, {
        color: hex(cs.color),
        bold: parseInt(cs.fontWeight, 10) >= 600,
        italic: cs.fontStyle === 'italic',
        size: px2pt(parseFloat(cs.fontSize))
      });
      if (!runs.some(r => r.text && r.text.trim())) continue;

      const lh = parseFloat(cs.lineHeight);
      boxes.push({
        x: px2in(L - pr.left - 4),
        y: px2in(T - pr.top - 1),
        w: px2in(R - L + 9),
        h: px2in(B - T + 2),
        size: px2pt(parseFloat(cs.fontSize)),
        line: Number.isFinite(lh) ? px2pt(lh) : null,
        align: cs.textAlign === 'center' ? 'center' : cs.textAlign === 'right' ? 'right' : 'left',
        letter: parseFloat(cs.letterSpacing) || 0,
        runs
      });

      el.classList.add('__notext');
    }

    out.push({ index: pi + 1, boxes });
  });
  return out;
}, BAKED);

/* 把要做成文字框的文字藏起來（保留卡片、邊框、陰影），再截圖當背景 */
await page.addStyleTag({
  content: `.__notext, .__notext *{ color:transparent !important;
             -webkit-text-fill-color:transparent !important; text-shadow:none !important; }`
});
await page.waitForTimeout(400);

const pgs = await page.$$('.pg');
for (let i = 0; i < pgs.length; i++) {
  const n = String(i + 1).padStart(2, '0');
  await pgs[i].screenshot({ path: path.join(BG, `${n}.jpg`), type: 'jpeg', quality: 92 });
}

fs.writeFileSync(path.join(BUILD, 'slides.json'), JSON.stringify(slides, null, 1), 'utf8');

const boxCount = slides.reduce((a, s) => a + s.boxes.length, 0);
const bgBytes = fs.readdirSync(BG).reduce((a, f) => a + fs.statSync(path.join(BG, f)).size, 0);
console.log(`${slides.length} 頁　·　${boxCount} 個文字框　·　背景圖共 ${(bgBytes / 1024 / 1024).toFixed(1)} MB`);

await browser.close();
