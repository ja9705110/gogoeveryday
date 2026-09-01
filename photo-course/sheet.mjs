import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs'; import path from 'path';
const D='shots';
const files=fs.readdirSync(D).filter(f=>/^p\d+\.png$/.test(f)).sort();
const cell=f=>{const b64=fs.readFileSync(path.join(D,f)).toString('base64');
  return `<div class="c"><img src="data:image/png;base64,${b64}"><span>${f.match(/\d+/)[0]}</span></div>`;};
const html=`<html><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1560px;background:#2a221c;padding:30px;font-family:"Noto Sans CJK TC",sans-serif}
h1{color:#f4ece1;font-size:26px;margin-bottom:18px}
.g{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.c{position:relative;border-radius:8px;overflow:hidden;background:#000}
.c img{width:100%;display:block}
.c span{position:absolute;left:8px;top:8px;background:#c05f3c;color:#fff;font-size:15px;
  font-weight:800;padding:2px 9px;border-radius:20px}
</style></head><body><h1>手機拍攝商品與影像編修基礎（1）　·　第 1–${files.length} 頁</h1>
<div class="g">${files.map(cell).join('')}</div></body></html>`;
const b=await chromium.launch();
const pg=await (await b.newContext({viewport:{width:1560,height:900},deviceScaleFactor:1})).newPage();
await pg.setContent(html,{waitUntil:'load'});
await pg.screenshot({path:'preview-1-17.png',fullPage:true});
await b.close(); console.log('sheet ok');
