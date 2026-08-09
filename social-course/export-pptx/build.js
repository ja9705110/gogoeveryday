/* =========================================================================
   build.js — 用量測結果組出 PPTX
   背景 = 去掉可編輯文字後的整頁圖；文字 = 位置與字級照量測值放的真實文字框
   ========================================================================= */
const pptxgen = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

const HERE = path.join(__dirname);
const BUILD = path.join(HERE, 'build');
const BG = path.join(BUILD, 'bg');

const slides = JSON.parse(fs.readFileSync(path.join(BUILD, 'slides.json'), 'utf8'));

/* Canva／PowerPoint 都找得到的中文字型 */
const FONT = 'Noto Sans TC';

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';            // 13.333 x 7.5 吋 ＝ 1280 x 720 px @96dpi
pres.title = '社群平台操作入門｜西屯婦女培力 08/16';

/* 講師備忘：從原始投影片資料取出 */
const deckSrc = [
  fs.readFileSync(path.join(HERE, '..', 'src', 'art.js'), 'utf8'),
  fs.readFileSync(path.join(HERE, '..', 'src', 'slides-a.js'), 'utf8'),
  fs.readFileSync(path.join(HERE, '..', 'src', 'slides-b.js'), 'utf8')
].join('\n');
const { DECK } = new Function(deckSrc + '\n; return { DECK: DECK };')();

function notesFor(i) {
  const n = (DECK[i] && DECK[i].notes) || {};
  const part = (label, arr) => (arr && arr.length) ? `【${label}】\n` + arr.map(x => '· ' + x).join('\n') : '';
  return [part('講師說明', n.say), part('互動提問', n.ask), part('學員實作', n.do)]
    .filter(Boolean).join('\n\n');
}

slides.forEach((s, si) => {
  const slide = pres.addSlide();
  slide.background = { color: 'FBF7F1' };

  const bg = path.join(BG, String(s.index).padStart(2, '0') + '.jpg');
  slide.addImage({ path: bg, x: 0, y: 0, w: 13.333, h: 7.5 });

  s.boxes.forEach(b => {
    /* runs → pptxgenjs 的 rich text 陣列 */
    const text = [];
    b.runs.forEach(r => {
      if (r.br) {
        const prev = text[text.length - 1];
        if (prev) prev.options.breakLine = true;
        else text.push({ text: '', options: {} });
        return;
      }
      text.push({
        text: r.text,
        options: {
          color: r.color,
          bold: !!r.bold,
          italic: !!r.italic,
          fontSize: r.size || b.size,
          fontFace: FONT
        }
      });
    });
    if (!text.length) return;

    /* 留一點寬度餘裕：萬一 Canva 不套用負字距，文字才不會被擠到換行。
       依對齊方向擴張，視覺位置維持不變。 */
    const extra = Math.max(b.w * 0.06, 0.05);
    const bx = b.align === 'center' ? b.x - extra / 2
             : b.align === 'right'  ? b.x - extra
             : b.x;

    slide.addText(text, {
      x: +bx.toFixed(4), y: b.y, w: +(b.w + extra).toFixed(4), h: b.h,
      align: b.align,
      valign: 'top',
      margin: 0,
      fontSize: b.size,
      fontFace: FONT,
      lineSpacing: b.line || undefined,
      charSpacing: b.letter ? +(b.letter * 0.75).toFixed(2) : undefined,
      wrap: true,
      fit: 'none',
      isTextBox: true
    });
  });

  const notes = notesFor(si);
  if (notes) slide.addNotes(notes);
});

const out = path.join(HERE, '..', 'social-media-course-deck.pptx');
pres.writeFile({ fileName: out }).then(() => {
  const mb = (fs.statSync(out).size / 1024 / 1024).toFixed(1);
  console.log(`已產生 ${out}　（${slides.length} 頁，${mb} MB）`);
});
