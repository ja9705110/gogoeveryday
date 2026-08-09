/* =========================================================================
   export-canva.js — 產生給 Canva 匯入用的靜態 HTML
   每一頁都是獨立的頂層元素，並帶上 Canva 匯入需要的標記：
     data-document-role="page"   這是一頁
     data-label                  頁面名稱
     data-speaker-notes          講師備忘（說明／提問／實作）

   用法：node export-canva.js   → 產生 canva-import.html
   ========================================================================= */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'src');
const read = f => fs.readFileSync(path.join(SRC, f), 'utf8');

/* 在同一個 scope 裡依序執行三個檔案，取得 DECK 與 IG_DEFS */
const sandbox = {};
const code = [read('art.js'), read('slides-a.js'), read('slides-b.js')].join('\n');
const run = new Function(code + '\n; return { DECK: DECK, IG_DEFS: IG_DEFS };');
const { DECK, IG_DEFS } = run.call(sandbox);

const esc = s => String(s)
  .replace(/&/g, '&amp;').replace(/"/g, '&quot;')
  .replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* 把講師備忘壓成一段純文字 */
function notesText(d) {
  const n = d.notes || {};
  const part = (label, arr) => (arr && arr.length) ? label + '：' + arr.join(' ') : '';
  return [part('講師說明', n.say), part('互動提問', n.ask), part('學員實作', n.do)]
    .filter(Boolean).join('\n\n');
}

/* 匯出專用樣式：拿掉動畫與舞台外框，讓每頁變成固定 1280×720 的靜態版面 */
const EXPORT_CSS = `
html,body{ height:auto; overflow:visible; background:#e8e1d6; }
body{ margin:0; padding:0; }
.pg{
  position:relative; width:1280px; height:720px; overflow:hidden;
  background:var(--paper); margin:0 auto; display:block;
}
.pg + .pg{ margin-top:28px; }
.pg::before{
  content:""; position:absolute; inset:-10%; pointer-events:none; z-index:0;
  background:
    radial-gradient(560px 420px at 12% 8%,  rgba(217,154,78,.16), transparent 62%),
    radial-gradient(620px 480px at 92% 22%, rgba(192,95,60,.13),  transparent 64%),
    radial-gradient(700px 520px at 70% 104%,rgba(95,122,99,.12),  transparent 62%);
  animation:none;
}
.pg .slide{ position:absolute; inset:0; view-transition-name:none; animation:none; }
.pg .slide [data-r]{ opacity:1; transform:none; filter:none; animation:none; }
.pg .pg-foot{
  position:absolute; bottom:24px; left:84px; right:84px; z-index:9;
  display:flex; justify-content:space-between;
  font-size:20px; color:var(--muted); font-weight:650; letter-spacing:.04em;
}
.pg.dark .pg-foot{ color:rgba(255,255,255,.5); }
.pg .pg-defs{ position:absolute; width:0; height:0; }

/* 輸出 PDF 時：一個 .pg 就是一頁，不留任何邊界 */
@page{ size:1280px 720px; margin:0; }
@media print{
  html,body{ background:#fff; }
  .pg{ margin:0 !important; page-break-after:always; break-after:page; }
  .pg:last-child{ page-break-after:auto; break-after:auto; }
}
`;

const pages = DECK.map((d, i) => {
  const dark = d.kind === 'divider';
  const cls = ['slide',
    dark ? 'divider' : '',
    d.kind === 'cover' ? 'cover' : '',
    /pad-tight/.test(d.html) ? 'pad-tight' : ''].filter(Boolean).join(' ');

  const tag = d.tag
    ? `<span class="act-tag ${d.tag.type || ''}">${d.tag.label}</span>`
    : '';

  const label = `${String(i + 1).padStart(2, '0')}｜${d.title.replace(/^Slide \d+｜/, '')}`;

  return `<div class="pg${dark ? ' dark' : ''}"
     data-document-role="page"
     data-label="${esc(label)}"
     data-speaker-notes="${esc(notesText(d))}">
  <div class="pg-defs">${IG_DEFS}</div>
  <section class="${cls}">${d.html}${tag}</section>
  <div class="pg-foot"><span>${esc(d.part)}　·　${esc(d.time)}</span><span>${i + 1} / ${DECK.length}</span></div>
</div>`;
}).join('\n\n');

const html = `<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<title>社群平台操作入門｜西屯婦女培力 08/16</title>
<style>
${read('styles.css')}
${EXPORT_CSS}
</style>
</head>
<body>
${pages}
</body>
</html>
`;

const out = path.join(__dirname, 'canva-import.html');
fs.writeFileSync(out, html, 'utf8');
console.log(`已產生 ${out}　（${DECK.length} 頁，${(html.length / 1024).toFixed(0)} KB）`);
