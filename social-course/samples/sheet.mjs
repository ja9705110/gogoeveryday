import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs'; import path from 'path';
const OUT = path.resolve('out');
const files = fs.readdirSync(OUT).filter(f => f.endsWith('.jpg')).sort();
const card = f => {
  const m = f.match(/^(\w+-\d+)_(.+?)_(.+?)_(\d+)x(\d+)\.jpg$/);
  const b64 = fs.readFileSync(path.join(OUT, f)).toString('base64');
  const tone = f.startsWith('FB') ? '#1877f2' : f.startsWith('IG') ? '#c2185b' : '#03934a';
  return `<div class="c">
    <div class="th"><img src="data:image/jpeg;base64,${b64}"></div>
    <div class="id" style="background:${tone}">${m[1]}</div>
    <div class="u">${m[3]}</div>
    <div class="d">${m[4]} × ${m[5]}</div></div>`;
};
const html = `<html><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1600px;background:#fbf7f1;font-family:"Noto Sans CJK TC",sans-serif;padding:44px 40px}
h1{font-size:36px;color:#2b1f18;margin-bottom:6px}
p.s{font-size:19px;color:#7a6a5d;margin-bottom:26px}
.g{display:grid;grid-template-columns:repeat(5,1fr);gap:20px}
.c{background:#fff;border:1px solid #e4d7c6;border-radius:12px;padding:12px;position:relative}
.th{height:150px;display:flex;align-items:center;justify-content:center;
    background:#f6ecdd;border-radius:8px;overflow:hidden;margin-bottom:10px}
.th img{max-width:100%;max-height:100%;object-fit:contain}
.id{position:absolute;left:18px;top:18px;color:#fff;font-size:13px;font-weight:800;
    padding:3px 9px;border-radius:20px}
.u{font-size:17px;font-weight:800;color:#2b1f18}
.d{font-size:15px;font-weight:700;color:#b8552f;margin-top:2px}
</style></head><body>
<h1>示範圖片總覽　·　20 張</h1>
<p class="s">虛擬品牌「小芳手作果醬」　·　每一張都已是該用途的正確尺寸，可以直接上傳</p>
<div class="g">${files.map(card).join('')}</div></body></html>`;
const b = await chromium.launch();
const pg = await (await b.newContext({ viewport:{width:1600,height:800}, deviceScaleFactor:1 })).newPage();
await pg.setContent(html, { waitUntil:'load' });
await pg.screenshot({ path: path.join(OUT, '_總覽.png'), fullPage: true });
await b.close();
console.log('總覽已產生');
