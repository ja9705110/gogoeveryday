/* =========================================================================
   art.js — 手機拍攝商品課　插畫與模擬元件庫
   全部內嵌 SVG／CSS，不連外。
   核心是 ART.scene()：同一件商品，換光線／背景／角度／構圖，畫面真的會變。
   ========================================================================= */
const C = {
  paper:'#fbf7f1', paper2:'#f4ece1', paper3:'#ece0d1', white:'#ffffff',
  ink:'#241c17', ink2:'#4a3c33', ink3:'#7a6a5d', muted:'#9c8b7c',
  clay:'#c05f3c', clayD:'#a94e2e', claySoft:'#f5ddd1', clayTint:'#fbeee6',
  sage:'#5f7a63', sageSoft:'#dfe8dc', gold:'#d99a4e', goldSoft:'#f8e6c9',
  plum:'#8a5a6d', plumSoft:'#f0dfe4', red:'#d63b2f',
  warm:'#c9743f', clean:'#4a7fa5', fresh:'#6a9160', lux:'#7b5a86'
};

const ART = {};

/* ── 商品：果醬罐，三種視角 ──────────────────────────────────────── */

/* 側面（平拍） */
ART.jarSide = (s, body = C.gold, lid = C.clay) => `
<svg width="${s}" height="${s}" viewBox="0 0 100 100" fill="none">
  <rect x="31" y="11" width="38" height="10" rx="3.5" fill="${lid}"/>
  <rect x="34.5" y="7.5" width="31" height="5" rx="2.5" fill="${lid}" opacity=".72"/>
  <path d="M33 21h34v56a8 8 0 0 1-8 8H41a8 8 0 0 1-8-8V21Z"
        fill="#fff" fill-opacity=".93" stroke="${lid}" stroke-width="2.4"/>
  <path d="M36 46h28v31a5 5 0 0 1-5 5H41a5 5 0 0 1-5-5V46Z" fill="${body}"/>
  <path d="M36 46h28v5H36z" fill="${body}" opacity=".5"/>
  <circle cx="45" cy="33" r="3.4" fill="${lid}" opacity=".8"/>
  <circle cx="57" cy="28" r="2.4" fill="${lid}" opacity=".62"/>
  <circle cx="53" cy="38" r="2" fill="${lid}" opacity=".55"/>
  <rect x="39" y="55" width="22" height="12" rx="2.5" fill="#fff" opacity=".9"/>
</svg>`;

/* 45 度（略帶透視，看得到罐口與側面） */
ART.jar45 = (s, body = C.gold, lid = C.clay) => `
<svg width="${s}" height="${s}" viewBox="0 0 100 100" fill="none">
  <ellipse cx="50" cy="19" rx="19" ry="7" fill="${lid}"/>
  <ellipse cx="50" cy="16.5" rx="19" ry="7" fill="${lid}" opacity=".72"/>
  <path d="M31 19v6a8 8 0 0 0 8 8h22a8 8 0 0 0 8-8v-6" fill="${lid}"/>
  <path d="M33 27c0 4 7.6 7 17 7s17-3 17-7v50a8 8 0 0 1-8 8H41a8 8 0 0 1-8-8V27Z"
        fill="#fff" fill-opacity=".93" stroke="${lid}" stroke-width="2.4"/>
  <path d="M36 48c0 3 6.3 5.4 14 5.4S64 51 64 48v29a5 5 0 0 1-5 5H41a5 5 0 0 1-5-5V48Z" fill="${body}"/>
  <ellipse cx="50" cy="48" rx="14" ry="5" fill="${body}" opacity=".55"/>
  <circle cx="44" cy="38" r="3.2" fill="${lid}" opacity=".8"/>
  <circle cx="57" cy="41" r="2.3" fill="${lid}" opacity=".6"/>
  <rect x="39" y="58" width="22" height="12" rx="2.5" fill="#fff" opacity=".9"/>
</svg>`;

/* 俯拍（正上方，看得到蓋子圓面） */
ART.jarTop = (s, body = C.gold, lid = C.clay) => `
<svg width="${s}" height="${s}" viewBox="0 0 100 100" fill="none">
  <circle cx="50" cy="50" r="34" fill="#fff" fill-opacity=".9" stroke="${lid}" stroke-width="2"/>
  <circle cx="50" cy="50" r="28" fill="${lid}"/>
  <circle cx="50" cy="50" r="23" fill="${lid}" opacity=".7"/>
  <circle cx="50" cy="50" r="15" fill="${body}" opacity=".9"/>
  ${Array.from({length:16},(_,i)=>{
    const a=i*22.5*Math.PI/180, r1=24, r2=28;
    return `<line x1="${50+r1*Math.cos(a)}" y1="${50+r1*Math.sin(a)}"
                  x2="${50+r2*Math.cos(a)}" y2="${50+r2*Math.sin(a)}"
                  stroke="#fff" stroke-width="1.6" opacity=".35"/>`;}).join('')}
</svg>`;

/* ── 配角小物（做雜亂背景與情境用） ─────────────────────────────── */
ART.berry = (s, c = '#c0392b') => `
<svg width="${s}" height="${s}" viewBox="0 0 100 100" fill="none">
  <path d="M50 28c15 0 26 11 26 25 0 16-13 29-26 33-13-4-26-17-26-33 0-14 11-25 26-25Z" fill="${c}"/>
  <path d="M50 28c-6-8-13-10-21-10 2 8 8 13 14 15" fill="${C.sage}"/>
  <path d="M50 28c6-8 13-10 21-10-2 8-8 13-14 15" fill="${C.sage}" opacity=".85"/>
</svg>`;

ART.spoon = (s, c = '#b9a894') => `
<svg width="${s}" height="${s}" viewBox="0 0 100 100" fill="none">
  <ellipse cx="30" cy="28" rx="15" ry="19" fill="${c}"/>
  <rect x="26" y="44" width="8" height="46" rx="4" fill="${c}"/>
</svg>`;

ART.cup = (s, c = '#cfc3b2') => `
<svg width="${s}" height="${s}" viewBox="0 0 100 100" fill="none">
  <path d="M24 34h44v34a18 18 0 0 1-18 18H42a18 18 0 0 1-18-18V34Z" fill="${c}"/>
  <path d="M68 44h7a10 10 0 0 1 0 20h-7" stroke="${c}" stroke-width="6" fill="none"/>
  <ellipse cx="46" cy="34" rx="22" ry="6" fill="#fff" opacity=".55"/>
</svg>`;

ART.keys = (s, c = '#9aa0a6') => `
<svg width="${s}" height="${s}" viewBox="0 0 100 100" fill="none">
  <circle cx="32" cy="34" r="15" stroke="${c}" stroke-width="8" fill="none"/>
  <rect x="42" y="42" width="42" height="8" rx="4" fill="${c}"/>
  <rect x="68" y="50" width="8" height="12" rx="3" fill="${c}"/>
</svg>`;

ART.paperSheet = (s, c = '#ffffff') => `
<svg width="${s}" height="${s}" viewBox="0 0 100 100" fill="none">
  <path d="M14 16h72v68H14z" fill="${c}" stroke="#d9cebc" stroke-width="2"/>
  <path d="M14 16h72v68" stroke="#fff" stroke-width="4" opacity=".7"/>
</svg>`;

ART.leaf = (s, c = C.sage, o = 1) => `
<svg width="${s}" height="${s}" viewBox="0 0 100 100" fill="none" opacity="${o}">
  <path d="M84 16C48 16 20 38 20 68c0 6 1 11 3 16 22-2 40-11 50-25 9-13 11-28 11-43Z" fill="${c}"/>
  <path d="M78 22C56 34 38 52 27 80" stroke="#fff" stroke-width="2.6" opacity=".5"/>
</svg>`;

/* ── 通用圖示 ────────────────────────────────────────────────────── */
const IC = {
  sun:'M12 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-13a1 1 0 0 1-1-1V2a1 1 0 0 1 2 0v1a1 1 0 0 1-1 1Zm0 18a1 1 0 0 1-1-1v-1a1 1 0 0 1 2 0v1a1 1 0 0 1-1 1ZM4 13H3a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2Zm17 0h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2ZM6.3 7.7 5.6 7a1 1 0 0 1 1.4-1.4l.7.7a1 1 0 0 1-1.4 1.4Zm11.4 11.4-.7-.7a1 1 0 0 1 1.4-1.4l.7.7a1 1 0 0 1-1.4 1.4Zm0-11.4a1 1 0 0 1 0-1.4l.7-.7A1 1 0 0 1 19.8 7l-.7.7a1 1 0 0 1-1.4 0ZM6.3 19.1a1 1 0 0 1-1.4-1.4l.7-.7A1 1 0 0 1 7 18.4l-.7.7Z',
  win:'M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm7 2H5v6h6V5Zm2 0v6h6V5h-6Zm-2 8H5v6h6v-6Zm2 0v6h6v-6h-6Z',
  cam:'M9 4h6l1.5 2H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.5L9 4Zm3 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z',
  hand:'M8 12V5a2 2 0 1 1 4 0v6h1V3a2 2 0 1 1 4 0v8h1V6a2 2 0 1 1 4 0v10a6 6 0 0 1-6 6h-3a6 6 0 0 1-6-6v-4a2 2 0 1 1 4 0Z',
  grid:'M3 3h18v18H3V3Zm2 6h4V5H5v4Zm6 0h2V5h-2v4Zm4 0h4V5h-4v4ZM5 15h4v-4H5v4Zm6 0h2v-4h-2v4Zm4 0h4v-4h-4v4ZM5 19h4v-2H5v2Zm6 0h2v-2h-2v2Zm4 0h4v-2h-4v2Z',
  crop:'M7 2v3H2v2h5v10h10v5h2v-5h3v-2h-3V5H7V2Zm10 5v10H9V7h8Z',
  wand:'M14 2l1.5 3.5L19 7l-3.5 1.5L14 12l-1.5-3.5L9 7l3.5-1.5L14 2ZM6 12l1 2.2L9 15l-2 .8L6 18l-1-2.2L3 15l2-.8L6 12Zm12.5 1.5 1 2.3 2.3 1-2.3 1-1 2.3-1-2.3-2.3-1 2.3-1 1-2.3ZM2 21 12.5 10.5l1 1L3 22l-1-1Z',
  eye:'M12 5c5 0 9 4.5 9 7s-4 7-9 7-9-4.5-9-7 4-7 9-7Zm0 2c-3.5 0-6.4 3-6.9 5 .5 2 3.4 5 6.9 5s6.4-3 6.9-5C18.4 10 15.5 7 12 7Zm0 1.8a3.2 3.2 0 1 1 0 6.4 3.2 3.2 0 0 1 0-6.4Z',
  warn:'M12 2 1 21h22L12 2Zm0 5 7.5 12.9h-15L12 7Zm-1 4v5h2v-5h-2Zm0 6.5V19h2v-1.5h-2Z',
  ok:'M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2Z',
  no:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2a8 8 0 0 1 4.9 1.7L5.7 16.9A8 8 0 0 1 12 4Zm0 16a8 8 0 0 1-4.9-1.7L18.3 7.1A8 8 0 0 1 12 20Z',
  phone:'M7 1h10a2 2 0 0 1 2 2v18a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2Zm0 4v14h10V5H7Zm5 15.2a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2Z',
  bulb:'M12 2a7 7 0 0 1 4 12.7V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.3A7 7 0 0 1 12 2ZM9 19h6v1a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-1Z',
  paint:'M19 3H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h8v3h-2a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1h6a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z',
  cloud:'M6.5 19A4.5 4.5 0 0 1 6 10.1 6 6 0 0 1 17.7 9 4.5 4.5 0 0 1 17 19H6.5Z',
  clock:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 10.6V6h-2v7.4l5 3 1-1.7-4-2.1Z',
  tag:'M11 2 2 11l11 11 9-9V2h-11Zm6.5 5.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z'
};
ART.icon = (k, s = 30, c = C.clay) =>
  `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="${c}"><path d="${IC[k]}"/></svg>`;

/* ── 背景樣式 ────────────────────────────────────────────────────── */
const BG = {
  wood:`repeating-linear-gradient(91deg,
          rgba(120,80,48,.16) 0 3px, rgba(120,80,48,0) 3px 13px),
        linear-gradient(#c9a271,#b98f5c)`,
  white:`radial-gradient(120% 110% at 50% 20%, #ffffff 0%, #f3f0ea 100%)`,
  gray :`radial-gradient(120% 110% at 50% 20%, #eceae6 0%, #ddd9d2 100%)`,
  cloth:`repeating-linear-gradient(45deg, rgba(255,255,255,.20) 0 2px, rgba(255,255,255,0) 2px 5px),
         repeating-linear-gradient(-45deg, rgba(0,0,0,.045) 0 2px, rgba(0,0,0,0) 2px 5px),
         linear-gradient(#ded3c2,#cfc2ae)`,
  dark :`radial-gradient(130% 110% at 30% 12%, #4a3f45 0%, #241d22 70%)`,
  flour:`radial-gradient(60% 50% at 22% 76%, rgba(255,255,255,.85) 0%, rgba(255,255,255,0) 60%),
         repeating-linear-gradient(89deg, rgba(120,80,48,.14) 0 3px, rgba(120,80,48,0) 3px 12px),
         linear-gradient(#c9a271,#b98f5c)`
};

/* ── 核心：場景模擬器 ─────────────────────────────────────────────
   opts = { w,h, bg, light, angle, pos, zoom, clutter, sim, cap, mark, cls }
   bg    : wood | white | gray | cloth | dark | flour
   light : front | side | back | harsh | flat（flat＝無方向性）
   angle : side | a45 | top
   pos   : center | third | low | edge
   zoom  : 0.6 – 1.4（畫面中商品的相對大小）
   clutter: 0–3（背景雜物數量）
   sim   : blur | dark | bright | warmcast | flat | soft
   ------------------------------------------------------------------ */
ART.scene = (o = {}) => {
  const w = o.w || 300, h = o.h || 210;
  const bg = BG[o.bg || 'wood'];
  const zoom = o.zoom == null ? 1 : o.zoom;
  const jarFn = o.angle === 'top' ? ART.jarTop : o.angle === 'a45' ? ART.jar45 : ART.jarSide;
  const js = Math.round(o.px != null ? o.px : Math.min(w, h) * 0.62 * zoom);

  const posCss = {
    center: `left:50%; top:52%; transform:translate(-50%,-50%);`,
    third:  `left:34%; top:54%; transform:translate(-50%,-50%);`,
    low:    `left:50%; top:74%; transform:translate(-50%,-50%);`,
    edge:   `left:82%; top:60%; transform:translate(-50%,-50%);`
  }[o.pos || 'center'];

  /* 投影方向跟著光線走 */
  const shadow = {
    front: `filter:drop-shadow(0 ${js*0.05}px ${js*0.07}px rgba(40,24,12,.30));`,
    side:  `filter:drop-shadow(${js*0.13}px ${js*0.05}px ${js*0.08}px rgba(40,24,12,.42));`,
    back:  `filter:drop-shadow(0 ${js*0.03}px ${js*0.05}px rgba(40,24,12,.20));`,
    harsh: `filter:drop-shadow(${js*0.2}px ${js*0.07}px ${js*0.02}px rgba(20,10,4,.62));`,
    flat:  `filter:drop-shadow(0 ${js*0.04}px ${js*0.09}px rgba(40,24,12,.22));`
  }[o.light || 'flat'];

  const clutterN = o.clutter || 0;
  const bits = [
    `<div style="position:absolute;left:6%;top:8%">${ART.keys(js*0.34)}</div>`,
    `<div style="position:absolute;right:5%;bottom:9%">${ART.cup(js*0.44)}</div>`,
    `<div style="position:absolute;right:16%;top:6%">${ART.spoon(js*0.32,'#a8968a')}</div>`
  ].slice(0, clutterN).join('');

  const simCls = o.sim ? ` sim-${o.sim}` : '';
  const litCls = (o.light && o.light !== 'flat') ? `<div class="lit lit-${o.light}"></div>` : '';

  return `<div class="fr${o.cls ? ' ' + o.cls : ''}${simCls}"
      style="width:${w}px;height:${h}px">
    <div class="fr-in" style="background:${bg}">
      ${bits}
      <div style="position:absolute;${posCss}${shadow}">${jarFn(js, o.body, o.lid)}</div>
      ${litCls}
    </div>
    ${o.mark ? `<span class="fr-mark">${o.mark}</span>` : ''}
    ${o.cap ? `<span class="fr-cap">${o.cap}</span>` : ''}
  </div>`;
};

/* ── 可替換照片版位 ───────────────────────────────────────────────
   講師要換成實拍照時，把整塊 .slot-ph 換成 <img> 即可。 */
ART.slot = (o = {}) => `
<div class="slot-ph" style="width:${o.w || 300}px;height:${o.h || 210}px${o.style ? ';' + o.style : ''}">
  ${o.tag ? `<span class="sp-tag">${o.tag}</span>` : ''}
  <span class="sp-ic">${ART.icon('cam', o.ic || 34, C.muted)}</span>
  <span class="sp-t">${o.t || '放實拍照'}</span>
  ${o.s ? `<span class="sp-s">${o.s}</span>` : ''}
</div>`;

/* ── 手機外框 ────────────────────────────────────────────────────── */
ART.phone = (inner, o = {}) => {
  const w = o.w || 232, h = o.h || 464;
  return `<div class="baked" style="width:${w}px;height:${h}px;border-radius:30px;background:#1b1512;
    padding:9px 7px;box-shadow:0 20px 44px -22px rgba(40,26,16,.6);flex:0 0 auto">
    <div style="position:relative;width:100%;height:100%;border-radius:23px;
      background:${o.bg || C.white};overflow:hidden;text-align:left">${inner}</div>
  </div>`;
};

/* 相機取景畫面（含格線、對焦框、太陽圖示） */
ART.camView = (o = {}) => {
  const grid = o.grid ? `
    <div style="position:absolute;inset:0;pointer-events:none">
      <div style="position:absolute;left:33.33%;top:0;bottom:0;width:1px;background:rgba(255,255,255,.55)"></div>
      <div style="position:absolute;left:66.66%;top:0;bottom:0;width:1px;background:rgba(255,255,255,.55)"></div>
      <div style="position:absolute;top:33.33%;left:0;right:0;height:1px;background:rgba(255,255,255,.55)"></div>
      <div style="position:absolute;top:66.66%;left:0;right:0;height:1px;background:rgba(255,255,255,.55)"></div>
    </div>` : '';
  const focus = o.focus ? `
    <div style="position:absolute;left:${o.focus[0]}%;top:${o.focus[1]}%;
      transform:translate(-50%,-50%);width:66px;height:66px;
      border:2px solid ${C.gold};border-radius:6px">
      ${o.sun ? `<div style="position:absolute;left:100%;top:50%;transform:translate(6px,-50%)">
        ${ART.icon('sun', 22, C.gold)}</div>` : ''}
    </div>` : '';
  return `
  <div style="position:relative;width:100%;height:100%;background:#12100e">
    <div style="position:absolute;left:0;right:0;top:0;height:54px;background:#12100e;
      display:flex;align-items:center;justify-content:space-between;padding:0 14px">
      <span style="font-size:16px;font-weight:800;color:rgba(255,255,255,.55)">${o.ratio || '4:3'}</span>
      <span style="font-size:16px;font-weight:800;color:rgba(255,255,255,.55)">${o.top || ''}</span>
    </div>
    <div style="position:absolute;left:0;right:0;top:54px;bottom:96px;overflow:hidden">
      ${o.view || ''}${grid}${focus}
    </div>
    <div style="position:absolute;left:0;right:0;bottom:0;height:96px;background:#12100e;
      display:flex;align-items:center;justify-content:center;gap:22px">
      <span style="font-size:15px;font-weight:800;color:rgba(255,255,255,.5)">0.5x</span>
      <span style="width:52px;height:52px;border-radius:50%;background:#fff;
        box-shadow:0 0 0 3px #12100e,0 0 0 5px rgba(255,255,255,.85)"></span>
      <span style="font-size:15px;font-weight:800;color:rgba(255,255,255,.5)">2x</span>
    </div>
  </div>`;
};

/* ── 感覺卡 ──────────────────────────────────────────────────────── */
ART.feelCard = (f, mini) => `
<div class="feel-card">
  <div class="fc-top" style="background:${f.c}"></div>
  ${mini ? ART.scene(Object.assign({ w:mini, h:Math.round(mini*0.66), px:Math.round(mini*0.42) }, f.sim)) : ''}
  <h5 style="color:${f.c}">${f.name}</h5>
  ${[['光線',f.light],['背景',f.bg],['角度',f.angle],['構圖',f.comp]]
    .map(([k,v])=>`<div class="fc-r"><span class="fc-k">${k}</span><span class="fc-v">${v}</span></div>`).join('')}
</div>`;

/* 頁尾呼應帶 */
ART.feelStrip = (label, items) => `
<div class="feel-strip" data-r>
  <span class="fs-lab">${ART.icon('bulb', 24, C.gold)} ${label}</span>
  <span class="fs-items">
    ${items.map(([n,v,cls])=>`<span class="fs-i ${cls}"><b>${n}</b> → ${v}</span>`).join('')}
  </span>
</div>`;

/* 四種感覺的定義（全課共用） */
ART.FEEL = [
  { key:'warm',  name:'溫暖手作', c:C.warm,  cls:'f-warm',
    light:'側光',        bg:'木質、素色布',      angle:'45 度',        comp:'留一點手的動作',
    sim:{ bg:'wood',  light:'side',  angle:'a45',  pos:'center' } },
  { key:'clean', name:'乾淨專業', c:C.clean, cls:'f-clean',
    light:'順光',        bg:'白或淺灰',          angle:'平拍或正俯拍', comp:'置中、不加濾鏡',
    sim:{ bg:'white', light:'front', angle:'side', pos:'center' } },
  { key:'fresh', name:'新鮮現做', c:C.fresh, cls:'f-fresh',
    light:'窗邊自然光',  bg:'有製作痕跡的檯面',  angle:'俯拍或 45 度', comp:'加肢體動作',
    sim:{ bg:'flour', light:'front', angle:'top',  pos:'center' } },
  { key:'lux',   name:'高級精緻', c:C.lux,   cls:'f-lux',
    light:'側光或逆光',  bg:'深色',              angle:'特寫',         comp:'大量留白',
    sim:{ bg:'dark',  light:'back',  angle:'a45',  pos:'center', zoom:1.15 } }
];

/* ── OX 判讀題頭 ─────────────────────────────────────────────────── */
ART.oxQ = (n, q, tip) => `
<div class="ox-q" data-r>
  <span class="oq-n">Q${n}</span>
  <span><span class="oq-t">${q}</span>${tip ? `<br><span class="oq-tip">提示：${tip}</span>` : ''}</span>
</div>`;

/* ── 修圖滑桿 ────────────────────────────────────────────────────── */
ART.slider = (t, pct, val) => `
<div class="slider">
  <span class="sl-t">${t}</span>
  <span class="sl-bar"><span class="sl-fill" style="width:${pct}%"></span>
    <span class="sl-dot" style="left:${pct}%"></span></span>
  <span class="sl-v">${val}</span>
</div>`;

/* ── 紅線卡 ──────────────────────────────────────────────────────── */
ART.redline = (n, h, p) => `
<div class="redline" data-r>
  <span class="rl-n">${n}</span>
  <span><h5>${h}</h5><p>${p}</p></span>
</div>`;

/* ── 步驟列 ──────────────────────────────────────────────────────── */
ART.steps = (list) => `
<div style="display:flex;gap:14px;align-items:stretch">
  ${list.map((s,i)=>`
    <div style="flex:1;background:#fff;border:1px solid rgba(36,28,23,.12);
      border-radius:16px;padding:16px 15px;display:flex;flex-direction:column;gap:8px">
      <span style="width:30px;height:30px;border-radius:50%;background:${C.clay};color:#fff;
        font-size:18px;font-weight:900;display:flex;align-items:center;justify-content:center">${i+1}</span>
      <span style="font-size:22px;font-weight:900;color:${C.ink};line-height:1.3">${s[0]}</span>
      <span style="font-size:20px;font-weight:700;color:${C.ink2};line-height:1.4">${s[1]}</span>
    </div>`).join('')}
</div>`;
