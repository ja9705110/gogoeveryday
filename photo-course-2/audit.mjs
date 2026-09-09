import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import path from 'path';
const b=await chromium.launch();
const pg=await (await b.newContext({viewport:{width:1280,height:720},deviceScaleFactor:1})).newPage();
await pg.goto('file://'+path.resolve('index.html'),{waitUntil:'load'});
await pg.evaluate(()=>{ document.startViewTransition=null; });
await pg.addStyleTag({content:`*,*::before,*::after{transition:none!important;animation:none!important}
 .slide [data-r]{opacity:1!important;transform:none!important;filter:none!important}`});
const n=await pg.evaluate(()=>DECK.length);
const bad=[];
for(let i=1;i<=n;i++){
  await pg.evaluate(j=>{location.hash='#'+j;},i);
  await pg.waitForTimeout(120);
  const r=await pg.evaluate(()=>{
    const s=document.querySelector('.slide'); if(!s) return null;
    const cs=getComputedStyle(s);
    const padT=parseFloat(cs.paddingTop), padB=parseFloat(cs.paddingBottom);
    const avail=720-padT-padB;
    let maxB=0, minT=1e9;
    s.querySelectorAll('*').forEach(el=>{
      if(!el.offsetParent && el.tagName!=='SECTION') return;
      const b=el.getBoundingClientRect();
      if(b.height===0) return;
      maxB=Math.max(maxB,b.bottom); minT=Math.min(minT,b.top);
    });
    return { over: Math.max(0, Math.round(maxB-(720-padB))), above: Math.max(0, Math.round(padT-minT)) };
  });
  if(r && (r.over>2 || r.above>2)) bad.push({p:i,...r});
}
await b.close();
console.log('overflow pages:', bad.length);
bad.forEach(x=>console.log(`  p${x.p}  底部超出 ${x.over}px　頂部超出 ${x.above}px`));
