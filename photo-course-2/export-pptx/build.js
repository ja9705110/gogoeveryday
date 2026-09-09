/* =========================================================================
   build.js — 依 items 順序組出 PPTX
   每個卡片／色塊 = 可編輯圖形；每張插畫／手機介面 = 獨立圖片；文字 = 文字框
   ========================================================================= */
const pptxgen = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

const HERE = __dirname;
const BUILD = path.join(HERE, 'build');
const slides = JSON.parse(fs.readFileSync(path.join(BUILD, 'slides.json'), 'utf8'));

const FONT = 'Noto Sans TC';
const W = 13.333, H = 7.5;

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.title = '手機拍攝商品與影像編修基礎（2）｜商品短影音腳本、拍攝與剪輯';

/* 講師備忘 */
const deckSrc = ['art.js', 'slides-a.js', 'slides-b.js', 'slides-c.js']
  .map(f => fs.readFileSync(path.join(HERE, '..', 'src', f), 'utf8')).join('\n');
const { DECK } = new Function(deckSrc + '\n; return { DECK: DECK };')();
const notesFor = i => {
  const n = (DECK[i] && DECK[i].notes) || {};
  const part = (l, a) => (a && a.length) ? `【${l}】\n` + a.map(x => '· ' + x).join('\n') : '';
  return [part('講師說明', n.say), part('互動提問', n.ask), part('學員實作', n.do),
          part('預期看到的差異', n.diff), part('進度快：可以補充', n.more),
          part('進度慢：可以刪掉', n.less)].filter(Boolean).join('\n\n');
};

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

slides.forEach((s, si) => {
  const slide = pres.addSlide();
  slide.background = { color: 'FBF7F1' };

  /* 底圖：只剩漸層與 CSS 裝飾線，其餘都是獨立物件 */
  const bg = path.join(BUILD, 'bg', String(s.index).padStart(2, '0') + '.jpg');
  if (fs.existsSync(bg)) slide.addImage({ path: bg, x: 0, y: 0, w: W, h: H });

  s.items.forEach(it => {
    const x = clamp(it.x, -1, W), y = clamp(it.y, -1, H);
    const w = clamp(it.w, 0.02, W + 1), h = clamp(it.h, 0.02, H + 1);

    if (it.kind === 'shape') {
      const opt = { x, y, w, h, line: { type: 'none' } };
      if (it.fill) opt.fill = { color: it.fill, transparency: Math.round((1 - it.fillAlpha) * 100) };
      else opt.fill = { color: 'FFFFFF', transparency: 100 };  /* 只有框線、沒有底色 */
      if (it.line) opt.line = { color: it.line, width: Math.max(0.5, it.lineW),
                                dashType: it.dash ? 'dash' : 'solid' };
      if (it.shadow) opt.shadow = { type: 'outer', color: '3C2A1C', opacity: 0.18,
                                    blur: 10, offset: 3, angle: 90 };
      if (it.radius > 0.01) {
        opt.rectRadius = Math.min(it.radius, Math.min(w, h) / 2);
        slide.addShape(pres.ShapeType.roundRect, opt);
      } else {
        slide.addShape(pres.ShapeType.rect, opt);
      }
      return;
    }

    if (it.kind === 'image') {
      const p = path.join(BUILD, 'img', it.id + '.png');
      if (fs.existsSync(p)) slide.addImage({ path: p, x, y, w, h });
      return;
    }

    /* text */
    const text = [];
    it.runs.forEach(r => {
      if (r.br) {
        const prev = text[text.length - 1];
        if (prev) prev.options.breakLine = true; else text.push({ text: '', options: {} });
        return;
      }
      text.push({ text: r.text, options: {
        color: r.color, bold: !!r.bold, italic: !!r.italic,
        fontSize: r.size || it.size, fontFace: FONT } });
    });
    if (!text.length) return;

    const extra = Math.max(w * 0.06, 0.05);
    const bx = it.align === 'center' ? x - extra / 2 : it.align === 'right' ? x - extra : x;

    slide.addText(text, {
      x: +bx.toFixed(4), y, w: +(w + extra).toFixed(4), h,
      align: it.align, valign: 'top', margin: 0,
      fontSize: it.size, fontFace: FONT,
      lineSpacing: it.line || undefined,
      charSpacing: it.letter ? +(it.letter * 0.75).toFixed(2) : undefined,
      wrap: true, fit: 'none', isTextBox: true
    });
  });

  const n = notesFor(si);
  if (n) slide.addNotes(n);
});

const out = path.join(HERE, '..', '手機拍攝商品與影像編修基礎2_商品短影音.pptx');
pres.writeFile({ fileName: out }).then(() => {
  const c = { shape: 0, image: 0, text: 0 };
  slides.forEach(s => s.items.forEach(i => c[i.kind]++));
  console.log(`已產生 ${out}　（${slides.length} 頁，${(fs.statSync(out).size / 1048576).toFixed(1)} MB）`);
  console.log(`物件：圖形 ${c.shape}　圖片 ${c.image}　文字 ${c.text}`);
});
