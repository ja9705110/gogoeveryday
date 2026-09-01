import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import path from 'path';
const b=await chromium.launch();
const pg=await (await b.newContext({viewport:{width:1300,height:760},deviceScaleFactor:1})).newPage();
await pg.goto('file://'+path.resolve('export-pptx/preview.html'),{waitUntil:'load'});
const pages=await pg.$$('.pg');
console.log('preview pages:',pages.length);
for(const i of [0,5,10,12]){ if(pages[i]) await pages[i].screenshot({path:`shots/prev${String(i+1).padStart(2,'0')}.png`}); }
await b.close();
