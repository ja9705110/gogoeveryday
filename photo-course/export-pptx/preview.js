/* preview.js — 用 slides.json 重建畫面，模擬 PPTX 的組成，用來檢查有沒有掉東西 */
const fs=require('fs'), path=require('path');
const B=path.join(__dirname,'build');
const slides=JSON.parse(fs.readFileSync(path.join(B,'slides.json'),'utf8'));
const I=n=>96*n;
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const pages=slides.map(s=>{
  const bg=path.join(B,'bg',String(s.index).padStart(2,'0')+'.jpg');
  let h=`<div class="pg"><img class="bg" src="file://${bg}">`;
  for(const it of s.items){
    const st=`left:${I(it.x)}px;top:${I(it.y)}px;width:${I(it.w)}px;height:${I(it.h)}px`;
    if(it.kind==='shape'){
      const fill=it.fill?`background:#${it.fill};opacity:${it.fillAlpha}`:'background:none';
      const line=it.line?`border:${it.lineW/0.75}px solid #${it.line}`:'';
      h+=`<div class="sh" style="${st};${fill};${line};border-radius:${I(it.radius)}px;
          ${it.shadow?'box-shadow:0 3px 10px rgba(60,42,28,.18)':''}"></div>`;
    } else if(it.kind==='image'){
      h+=`<img class="im" style="${st}" src="file://${path.join(B,'img',it.id+'.png')}">`;
    } else {
      const runs=it.runs.map(r=>r.br?'<br>':
        `<span style="color:#${r.color};font-weight:${r.bold?800:500};font-size:${(r.size||it.size)/0.75}px">${esc(r.text)}</span>`).join('');
      h+=`<div class="tx" style="${st};font-size:${it.size/0.75}px;line-height:${(it.line||it.size*1.3)/0.75}px;
          text-align:${it.align};letter-spacing:${it.letter}px">${runs}</div>`;
    }
  }
  return h+'</div>';
}).join('\n');
fs.writeFileSync(path.join(__dirname,'preview.html'),
`<meta charset="utf-8"><style>
body{margin:0;background:#333;font-family:"Noto Sans CJK TC","Noto Sans TC",sans-serif}
.pg{position:relative;width:1280px;height:720px;margin:16px auto;background:#FBF7F1;overflow:hidden}
.bg{position:absolute;left:0;top:0;width:1280px;height:720px}
.sh,.im,.tx{position:absolute}
.tx{white-space:normal;overflow:visible}
</style>${pages}`);
console.log('preview.html');
