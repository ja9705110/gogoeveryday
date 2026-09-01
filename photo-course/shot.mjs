import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs'; import path from 'path';
const only = process.argv[2] ? process.argv[2].split(',').map(Number) : null;
const OUT='shots'; fs.mkdirSync(OUT,{recursive:true});
const b = await chromium.launch();
const pg = await (await b.newContext({viewport:{width:1280,height:720},deviceScaleFactor:1})).newPage();
await pg.goto('file://'+path.resolve('index.html'),{waitUntil:'load'});
await pg.evaluate(()=>{ document.startViewTransition = null; });
await pg.addStyleTag({content:`*,*::before,*::after{transition:none!important;animation:none!important}
  .slide [data-r]{opacity:1!important;transform:none!important;filter:none!important}
  #hint{display:none!important}`});
const n = await pg.evaluate(()=>DECK.length);
const list = only || Array.from({length:n},(_,i)=>i+1);
for(const p of list){
  await pg.evaluate(i=>{location.hash='#'+i;},p);
  await pg.waitForTimeout(260);
  await pg.screenshot({path:path.join(OUT,`p${String(p).padStart(2,'0')}.png`)});
}
await b.close();
console.log('shots:',list.length,'of',n);
