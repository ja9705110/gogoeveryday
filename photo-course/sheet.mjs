import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs'; import path from 'path';
const D='shots';
const files=fs.readdirSync(D).filter(f=>/^p\d+\.png$/.test(f)).sort();
const cell=f=>`<div class="c"><img src="file://${path.resolve(D,f)}"><span>${f.match(/\d+/)[0]}</span></div>`;
const html=`<html><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1720px;background:#2a221c;padding:30px;font-family:"Noto Sans CJK TC",sans-serif}
h1{color:#f4ece1;font-size:26px;margin-bottom:18px}
.g{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.c{position:relative;border-radius:8px;overflow:hidden;background:#000}
.c img{width:100%;display:block}
.c span{position:absolute;left:8px;top:8px;background:#c05f3c;color:#fff;font-size:15px;
  font-weight:800;padding:2px 9px;border-radius:20px}
</style></head><body><h1>手機拍攝商品與影像編修基礎（1）　·　全 ${files.length} 頁</h1>
<div class="g">${files.map(cell).join('')}</div></body></html>`;
const b=await chromium.launch();
const pg=await (await b.newContext({viewport:{width:1720,height:900},deviceScaleFactor:1})).newPage();
fs.writeFileSync('_sheet.html', html, 'utf8');
await pg.goto('file://'+path.resolve('_sheet.html'),{waitUntil:'load',timeout:120000});
await pg.waitForTimeout(1500);
await pg.screenshot({path:'preview-all.png',fullPage:true});
await b.close(); console.log('sheet ok');
