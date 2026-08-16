/* =========================================================================
   generate.mjs — 產生課堂上可直接上傳的示範圖片（成品，非示意圖）
   虛擬品牌：小芳手作果醬
   ========================================================================= */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(DIR, 'out');
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const BRAND = {
  name: '小芳手作果醬',
  short: '小芳',
  tag: '每一罐都是當季現熬',
  tel: '0912-345-678',
  addr: '台中市西屯區'
};

/* ── 色 ─────────────────────────────────────────────────────────── */
const K = {
  paper:'#fbf7f1', cream:'#f6ecdd', ink:'#2b1f18', ink2:'#5a4638',
  clay:'#b8552f', clayD:'#8d3f22', gold:'#d99a4e', goldL:'#f0c982',
  sage:'#5f7a63', plum:'#8a5a6d', line:'#e4d7c6'
};

/* ── 插圖 ───────────────────────────────────────────────────────── */
const jar = (s, body = K.gold, lid = K.clay) => `
<svg width="${s}" height="${s}" viewBox="0 0 100 100" fill="none">
  <ellipse cx="50" cy="90" rx="26" ry="4" fill="#000" opacity=".07"/>
  <rect x="31" y="9" width="38" height="11" rx="4" fill="${lid}"/>
  <rect x="34.5" y="6" width="31" height="5" rx="2.5" fill="${lid}" opacity=".75"/>
  <path d="M33 20h34v58a9 9 0 0 1-9 9H42a9 9 0 0 1-9-9V20Z" fill="#fff"
        stroke="${lid}" stroke-width="2.6"/>
  <path d="M36 47h28v31a6 6 0 0 1-6 6H42a6 6 0 0 1-6-6V47Z" fill="${body}"/>
  <path d="M36 47h28v6H36z" fill="${body}" opacity=".55"/>
  <circle cx="45" cy="35" r="3.6" fill="${lid}" opacity=".85"/>
  <circle cx="57" cy="29" r="2.6" fill="${lid}" opacity=".7"/>
  <circle cx="53" cy="39" r="2.2" fill="${lid}" opacity=".6"/>
  <rect x="39" y="57" width="22" height="13" rx="3" fill="#fff" opacity=".92"/>
</svg>`;

const berry = (s, c = '#c0392b') => `
<svg width="${s}" height="${s}" viewBox="0 0 100 100" fill="none">
  <path d="M50 26c16 0 27 12 27 26 0 17-14 30-27 34-13-4-27-17-27-34 0-14 11-26 27-26Z" fill="${c}"/>
  <path d="M50 26c-6-8-14-11-22-11 2 8 8 14 15 16" fill="${K.sage}"/>
  <path d="M50 26c6-8 14-11 22-11-2 8-8 14-15 16" fill="${K.sage}" opacity=".85"/>
  <g fill="#fff" opacity=".55">
    <circle cx="43" cy="45" r="2"/><circle cx="56" cy="42" r="2"/><circle cx="50" cy="55" r="2"/>
    <circle cx="40" cy="60" r="2"/><circle cx="60" cy="58" r="2"/><circle cx="50" cy="70" r="2"/>
  </g>
</svg>`;

const leaf = (s, c = K.sage, o = 1) => `
<svg width="${s}" height="${s}" viewBox="0 0 100 100" fill="none" opacity="${o}">
  <path d="M84 16C48 16 20 38 20 68c0 6 1 11 3 16 22-2 40-11 50-25 9-13 11-28 11-43Z" fill="${c}"/>
  <path d="M78 22C56 34 38 52 27 80" stroke="#fff" stroke-width="2.6" opacity=".5"/>
</svg>`;

const ICON = {
  bag:'M7 8V6a5 5 0 0 1 10 0v2h3l1.5 13h-19L4 8h3Zm2 0h6V6a3 3 0 1 0-6 0v2Z',
  cart:'M3 4h3l2.6 11.6A2 2 0 0 0 10.6 17h8.2a2 2 0 0 0 2-1.6L22.4 8H7M10 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm9 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z',
  tag:'M11 2 2 11l11 11 9-9V2h-11Zm6.5 5.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z',
  help:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 16a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Zm1.6-6.2c-.7.5-.9.8-.9 1.4v.3h-1.6v-.5c0-1.2.5-1.8 1.3-2.4.7-.5 1-.8 1-1.4 0-.7-.5-1.1-1.3-1.1-.7 0-1.3.4-1.5 1.2l-1.5-.5C9.5 7.6 10.6 7 12 7c1.7 0 2.9.9 2.9 2.3 0 1-.5 1.7-1.3 2.3Z',
  pin:'M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z',
  chat:'M4 3h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H9l-5 4V5a2 2 0 0 1 2-2Z',
  clock:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 10.6V6h-2v7.4l5 3 1-1.7-4-2.1Z',
  gift:'M20 8h-2.2a3 3 0 0 0-4.3-4L12 5.3 10.5 4A3 3 0 0 0 6.2 8H4v5h1v8h14v-8h1V8Zm-7 11h-2v-6h2v6Z'
};
const icon = (d, s, c) =>
  `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="${c}"><path d="${d}"/></svg>`;

/* ── 共用 CSS ───────────────────────────────────────────────────── */
const base = (w, h, u, bg) => `
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${w}px;height:${h}px;overflow:hidden}
body{font-family:"Noto Sans CJK TC","Noto Sans TC",sans-serif;color:${K.ink};
     position:relative;background:${bg}}
.grain{position:absolute;inset:0;pointer-events:none;
  background:radial-gradient(70% 55% at 18% 14%, rgba(255,255,255,.55) 0%, rgba(255,255,255,0) 60%),
             radial-gradient(60% 50% at 86% 88%, rgba(217,154,78,.20) 0%, rgba(255,255,255,0) 62%)}
.wrap{position:absolute;inset:0;display:flex;flex-direction:column;
      align-items:center;justify-content:center;text-align:center}
.deco{position:absolute;pointer-events:none}
`;

/* 品牌小標（含細線） */
const rule = (u, c = K.clay, w = 14) =>
  `<div style="width:${u*w}px;height:${u*0.45}px;background:${c};border-radius:${u}px;opacity:.55"></div>`;

/* =========================================================================
   版型
   ========================================================================= */
const TPL = {

  /* 大頭貼：圓形安全，圖案與字都收在中央圓內 */
  avatar(s) {
    const { w, h } = s, u = Math.min(w, h) / 100;
    return `<style>${base(w, h, u, `
      radial-gradient(90% 90% at 50% 42%, ${K.cream} 0%, ${K.paper} 70%)`)}
      .ring{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
        width:${u*76}px;height:${u*76}px;border-radius:50%;
        border:${u*1.6}px solid ${K.clay}33}
    </style>
    <div class="grain"></div><div class="ring"></div>
    <div class="wrap" style="gap:${u*1.4}px">
      ${jar(u * 34)}
      <div style="font-size:${u*13}px;font-weight:900;letter-spacing:${u*0.2}px;
                  color:${K.clayD};margin-top:${u*0.6}px">${BRAND.short}</div>
      <div style="font-size:${u*6.4}px;font-weight:800;color:${K.clay};
                  letter-spacing:${u*0.8}px">手作果醬</div>
    </div>`;
  },

  /* 封面橫幅：重要內容全部收在中央 62% */
  banner(s) {
    const { w, h } = s, u = Math.min(w, h) / 100;
    return `<style>${base(w, h, u, `
      linear-gradient(105deg, ${K.cream} 0%, ${K.paper} 45%, ${K.cream} 100%)`)}
      .safe{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
        width:${w*0.60}px;display:flex;flex-direction:column;align-items:center;
        gap:${u*2.2}px;text-align:center}
    </style>
    <div class="grain"></div>
    <div class="deco" style="left:${-u*6}px;top:${-u*10}px">${leaf(u*46, K.sage, .16)}</div>
    <div class="deco" style="right:${-u*8}px;bottom:${-u*14}px;transform:scaleX(-1)">
      ${leaf(u*52, K.gold, .18)}</div>
    <div class="deco" style="left:${u*8}px;bottom:${u*6}px">${jar(u*30)}</div>
    <div class="deco" style="right:${u*9}px;top:${u*8}px">${berry(u*20)}</div>
    <div class="safe">
      <div style="display:flex;gap:${u*1.6}px;align-items:center">
        ${rule(u, K.gold, 8)}
        <span style="font-size:${u*5.4}px;font-weight:800;color:${K.gold};
                     letter-spacing:${u*1.2}px">HANDMADE JAM</span>
        ${rule(u, K.gold, 8)}
      </div>
      <div style="font-size:${u*17}px;font-weight:900;color:${K.clayD};
                  letter-spacing:${u*0.6}px;line-height:1.1">${BRAND.name}</div>
      <div style="font-size:${u*6.6}px;font-weight:700;color:${K.ink2};
                  letter-spacing:${u*0.4}px">${BRAND.tag}</div>
      <div style="display:flex;gap:${u*3}px;align-items:center;margin-top:${u*0.6}px">
        <span style="display:flex;align-items:center;gap:${u*1}px;font-size:${u*5.6}px;
              font-weight:800;color:${K.clay}">${icon(ICON.chat, u*6, K.clay)} ${BRAND.tel}</span>
        <span style="width:${u*0.5}px;height:${u*6}px;background:${K.line}"></span>
        <span style="display:flex;align-items:center;gap:${u*1}px;font-size:${u*5.6}px;
              font-weight:800;color:${K.clay}">${icon(ICON.pin, u*6, K.clay)} ${BRAND.addr}</span>
      </div>
    </div>`;
  },

  /* 一般貼文 */
  post(s) {
    const { w, h } = s, u = Math.min(w, h) / 100;
    const wide = w / h > 1.4;
    const c = s.copy;
    const shell = `<style>${base(w, h, u, `
      radial-gradient(85% 70% at 50% 32%, #fff 0%, ${K.cream} 68%, ${K.paper} 100%)`)}
      .card{position:absolute;inset:${u*4.5}px;border:${u*0.7}px solid ${K.clay}2e;
        border-radius:${u*3}px}
    </style>
    <div class="grain"></div><div class="card"></div>
    <div class="deco" style="left:${-u*8}px;bottom:${-u*8}px">${leaf(u*38, K.sage, .13)}</div>`;

    if (wide) {                                    // 橫式：左圖右字
      return `${shell}
      <div class="deco" style="right:${u*5}px;top:${u*6}px">${berry(u*9, c.berry)}</div>
      <div class="wrap" style="flex-direction:row;gap:${u*7}px;padding:0 ${u*11}px;
           align-items:center;justify-content:center">
        ${jar(u * 42, c.body)}
        <div style="display:flex;flex-direction:column;align-items:flex-start;
             text-align:left;gap:${u*2}px;max-width:${w - u*30 - u*42}px">
          <div style="font-size:${u*5.6}px;font-weight:800;color:${K.gold};
               letter-spacing:${u*1.6}px">${c.eyebrow}</div>
          <div style="font-size:${u*13}px;font-weight:900;color:${K.clayD};
               line-height:1.2">${c.title}</div>
          <div style="width:${u*14}px;height:${u*0.7}px;background:${K.gold};
               border-radius:${u}px"></div>
          <div style="font-size:${u*6}px;font-weight:700;color:${K.ink2};
               line-height:1.5">${c.sub}</div>
          <div style="margin-top:${u*1}px;font-size:${u*5.4}px;font-weight:800;color:#fff;
               background:${K.clay};padding:${u*1.8}px ${u*4}px;border-radius:${u*9}px">
            ${c.cta}</div>
        </div>
      </div>
      <div style="position:absolute;right:${u*8}px;bottom:${u*6}px;font-size:${u*4.6}px;
           font-weight:800;color:${K.clay};letter-spacing:${u*0.5}px">${BRAND.name}</div>`;
    }

    return `${shell}
    <div class="deco" style="right:${u*7}px;top:${u*8}px">${berry(u*11, c.berry)}</div>
    <div class="wrap" style="gap:${u*1.7}px;padding:${u*7}px ${u*10}px">
      <div style="font-size:${u*4.6}px;font-weight:800;color:${K.gold};
                  letter-spacing:${u*1.5}px">${c.eyebrow}</div>
      ${jar(u * 31, c.body)}
      <div style="font-size:${u*10.8}px;font-weight:900;color:${K.clayD};
                  line-height:1.22;letter-spacing:${u*0.2}px">${c.title}</div>
      <div style="width:${u*15}px;height:${u*0.6}px;background:${K.gold};border-radius:${u}px"></div>
      <div style="font-size:${u*5}px;font-weight:700;color:${K.ink2};line-height:1.5">${c.sub}</div>
      <div style="margin-top:${u*1.2}px;font-size:${u*4.8}px;font-weight:800;color:#fff;
                  background:${K.clay};padding:${u*1.6}px ${u*3.8}px;border-radius:${u*9}px">
        ${c.cta}</div>
      <div style="margin-top:${u*1.4}px;font-size:${u*4.2}px;font-weight:800;color:${K.clay};
                  letter-spacing:${u*0.6}px">${BRAND.name}</div>
    </div>`;
  },

  /* 限時動態 / Reels 封面：上下各留 250px */
  story(s) {
    const { w, h } = s, u = w / 100;
    const pad = h * (260 / 1920);
    const c = s.copy;
    return `<style>${base(w, h, u, `
      linear-gradient(170deg, ${K.cream} 0%, ${K.paper} 40%, #f7e8d2 100%)`)}
      .safe{position:absolute;left:0;right:0;top:${pad}px;bottom:${pad}px;
        display:flex;flex-direction:column;align-items:center;justify-content:center;
        gap:${u*3}px;text-align:center;padding:0 ${u*11}px}
    </style>
    <div class="grain"></div>
    <div class="deco" style="left:${-u*14}px;top:${h*0.18}px">${leaf(u*62, K.sage, .13)}</div>
    <div class="deco" style="right:${-u*12}px;bottom:${h*0.16}px;transform:scaleX(-1)">
      ${leaf(u*58, K.gold, .16)}</div>
    <div class="safe">
      <div style="font-size:${u*5}px;font-weight:800;color:${K.gold};
                  letter-spacing:${u*1.6}px">${c.eyebrow}</div>
      ${jar(u * 34, c.body)}
      <div style="font-size:${u*12}px;font-weight:900;color:${K.clayD};line-height:1.25">
        ${c.title}</div>
      <div style="width:${u*16}px;height:${u*0.7}px;background:${K.gold};border-radius:${u}px"></div>
      <div style="font-size:${u*5.6}px;font-weight:700;color:${K.ink2};line-height:1.55">${c.sub}</div>
      <div style="margin-top:${u*1.4}px;font-size:${u*5.2}px;font-weight:800;color:#fff;
                  background:${K.clay};padding:${u*2}px ${u*4.6}px;border-radius:${u*10}px">
        ${c.cta}</div>
      <div style="margin-top:${u*1.4}px;font-size:${u*4.6}px;font-weight:800;color:${K.clay};
                  letter-spacing:${u*0.6}px">${BRAND.name}</div>
    </div>`;
  },

  /* 精選限動封面：只看得到正中央的小圓 */
  highlight(s) {
    const { w, h } = s, u = w / 100;
    return `<style>${base(w, h, u, `
      linear-gradient(160deg, ${K.cream} 0%, ${K.paper} 100%)`)}</style>
    <div class="grain"></div>
    <div class="wrap" style="gap:${u*2.4}px">
      <div style="width:${u*40}px;height:${u*40}px;border-radius:50%;background:#fff;
            border:${u*1.2}px solid ${K.clay}33;display:flex;align-items:center;
            justify-content:center">${jar(u*26)}</div>
      <div style="font-size:${u*8}px;font-weight:900;color:${K.clayD};
                  letter-spacing:${u*1}px">商品</div>
    </div>`;
  },

  /* LINE 封面：主體壓低，上方 30% 讓給大頭貼與名稱 */
  lineCover(s) {
    const { w, h } = s, u = Math.min(w, h) / 100;
    return `<style>${base(w, h, u, `
      linear-gradient(165deg, #eaf6ee 0%, ${K.paper} 42%, ${K.cream} 100%)`)}
      .safe{position:absolute;left:0;right:0;top:${h*0.34}px;bottom:0;
        display:flex;flex-direction:column;align-items:center;justify-content:center;
        gap:${u*2.2}px;text-align:center;padding:0 ${u*10}px}
    </style>
    <div class="grain"></div>
    <div class="deco" style="left:${-u*8}px;top:${h*0.30}px">${leaf(u*40, K.sage, .15)}</div>
    <div class="deco" style="right:${-u*6}px;bottom:${-u*6}px;transform:scaleX(-1)">
      ${leaf(u*44, K.gold, .16)}</div>
    <div class="safe">
      ${jar(u * 30)}
      <div style="font-size:${u*11}px;font-weight:900;color:${K.clayD}">${BRAND.name}</div>
      <div style="font-size:${u*5.6}px;font-weight:700;color:${K.ink2}">${BRAND.tag}</div>
      <div style="display:flex;gap:${u*2.4}px;margin-top:${u*1}px">
        <span style="font-size:${u*4.8}px;font-weight:800;color:#fff;background:${K.sage};
              padding:${u*1.2}px ${u*3}px;border-radius:${u*8}px">加入好友享首購優惠</span>
      </div>
    </div>`;
  },

  /* 圖文選單 */
  menu(s) {
    const { w, h } = s, u = Math.min(w, h) / 100;
    const cols = 3, rows = s.rows;
    const cw = w / cols, ch = h / rows;
    const cells = s.cells.map((c, i) => {
      const x = cw * (i % cols), y = ch * Math.floor(i / cols);
      return `<div style="position:absolute;left:${x}px;top:${y}px;width:${cw}px;height:${ch}px;
        display:flex;flex-direction:column;align-items:center;justify-content:center;
        gap:${u*(rows===1?2.4:2.8)}px;
        border-right:${i % cols === cols-1 ? 0 : u*0.5}px solid ${K.line};
        border-bottom:${Math.floor(i/cols) === rows-1 ? 0 : u*0.5}px solid ${K.line}">
        <div style="width:${u*(rows===1?26:24)}px;height:${u*(rows===1?26:24)}px;border-radius:50%;
             background:${c.bg};display:flex;align-items:center;justify-content:center">
          ${icon(ICON[c.i], u*(rows===1?13:12), c.c)}</div>
        <div style="font-size:${u*(rows===1?9:8)}px;font-weight:900;color:${K.ink};
             letter-spacing:${u*0.4}px">${c.t}</div>
      </div>`;
    }).join('');
    return `<style>${base(w, h, u, `
      linear-gradient(120deg, #fff 0%, ${K.paper} 58%, ${K.cream} 100%)`)}</style>
      <div class="grain"></div>${cells}`;
  },

  /* 圖文訊息（新品公告） */
  notice(s) {
    const { w, h } = s, u = Math.min(w, h) / 100;
    return `<style>${base(w, h, u, `
      radial-gradient(80% 70% at 50% 30%, #fff 0%, ${K.cream} 70%, ${K.paper} 100%)`)}
      .card{position:absolute;inset:${u*5}px;border:${u*0.8}px solid ${K.sage}40;
        border-radius:${u*3}px}
    </style>
    <div class="grain"></div><div class="card"></div>
    <div class="deco" style="right:${u*8}px;top:${u*9}px">${berry(u*13, '#7b3f9d')}</div>
    <div class="deco" style="left:${-u*7}px;bottom:${-u*7}px">${leaf(u*38, K.sage, .14)}</div>
    <div class="wrap" style="gap:${u*1.7}px;padding:${u*7}px ${u*10}px">
      <div style="font-size:${u*4.6}px;font-weight:800;color:#fff;background:${K.sage};
            padding:${u*1.1}px ${u*3.2}px;border-radius:${u*8}px;letter-spacing:${u*1}px">
            新品上市</div>
      ${jar(u * 31, "#8e6bb0")}
      <div style="font-size:${u*10.8}px;font-weight:900;color:${K.clayD};line-height:1.22">
        藍莓果醬<br>本週開賣</div>
      <div style="width:${u*15}px;height:${u*0.6}px;background:${K.gold};border-radius:${u}px"></div>
      <div style="font-size:${u*5}px;font-weight:700;color:${K.ink2};line-height:1.5">
        每罐 220 元　·　限量 40 罐<br>直接回訊息就可以預訂</div>
      <div style="margin-top:${u*1.2}px;font-size:${u*4.8}px;font-weight:800;color:#fff;
            background:${K.clay};padding:${u*1.6}px ${u*3.8}px;border-radius:${u*9}px">
        我要預訂</div>
      <div style="margin-top:${u*1.4}px;font-size:${u*4.2}px;font-weight:800;color:${K.clay};
            letter-spacing:${u*0.6}px">${BRAND.name}</div>
    </div>`;
  },

  /* 優惠券 */
  coupon(s) {
    const { w, h } = s, u = Math.min(w, h) / 100;
    return `<style>${base(w, h, u, `
      linear-gradient(150deg, ${K.cream} 0%, ${K.paper} 55%, #fdf3e2 100%)`)}
      .ticket{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
        width:${u*80}px;height:${u*66}px;background:#fff;border-radius:${u*3}px;
        border:${u*0.8}px dashed ${K.clay}77;display:flex;flex-direction:column;
        align-items:center;justify-content:center;gap:${u*1.8}px;text-align:center}
      .notch{position:absolute;width:${u*7}px;height:${u*7}px;border-radius:50%;
        background:${K.paper};top:50%;transform:translateY(-50%)}
    </style>
    <div class="grain"></div>
    <div class="ticket">
      <div class="notch" style="left:${-u*3.5}px"></div>
      <div class="notch" style="right:${-u*3.5}px"></div>
      <div style="font-size:${u*4.8}px;font-weight:800;color:#fff;background:${K.gold};
            padding:${u*1}px ${u*3}px;border-radius:${u*8}px;letter-spacing:${u*1}px">
            新朋友專屬</div>
      <div style="display:flex;align-items:flex-end;gap:${u*1.2}px">
        <span style="font-size:${u*9}px;font-weight:900;color:${K.clayD};padding-bottom:${u*2.4}px">折</span>
        <span style="font-size:${u*26}px;font-weight:900;color:${K.clay};line-height:.9;
              letter-spacing:${-u*0.6}px">50</span>
        <span style="font-size:${u*9}px;font-weight:900;color:${K.clayD};padding-bottom:${u*2.4}px">元</span>
      </div>
      <div style="width:${u*22}px;height:${u*0.5}px;background:${K.line}"></div>
      <div style="font-size:${u*5}px;font-weight:700;color:${K.ink2};line-height:1.6">
        購買任一口味即可使用<br>結帳時出示本券</div>
      <div style="font-size:${u*4.2}px;font-weight:800;color:${K.clay};letter-spacing:${u*0.4}px">
        ${BRAND.name}　·　使用期限 12/31</div>
    </div>`;
  },

  /* 活動封面 */
  event(s) {
    const { w, h } = s, u = Math.min(w, h) / 100;
    return `<style>${base(w, h, u, `
      linear-gradient(110deg, #f3e6d2 0%, ${K.paper} 48%, ${K.cream} 100%)`)}
      .safe{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
        width:${w*0.68}px;display:flex;flex-direction:column;align-items:center;
        gap:${u*2.4}px;text-align:center}
    </style>
    <div class="grain"></div>
    <div class="deco" style="left:${u*6}px;bottom:${u*5}px">${jar(u*32)}</div>
    <div class="deco" style="right:${u*7}px;bottom:${u*7}px">${jar(u*26, '#8e6bb0')}</div>
    <div class="deco" style="right:${u*10}px;top:${u*8}px">${berry(u*16)}</div>
    <div class="deco" style="left:${-u*8}px;top:${-u*8}px">${leaf(u*44, K.sage, .15)}</div>
    <div class="safe">
      <div style="font-size:${u*5.4}px;font-weight:800;color:${K.gold};
            letter-spacing:${u*2}px">MARKET DAY</div>
      <div style="font-size:${u*16}px;font-weight:900;color:${K.clayD};line-height:1.15">
        西屯手作市集</div>
      <div style="display:flex;gap:${u*2.4}px;align-items:center">
        <span style="font-size:${u*6.4}px;font-weight:900;color:#fff;background:${K.clay};
              padding:${u*1.4}px ${u*3.4}px;border-radius:${u*2}px">9 / 14（六）</span>
        <span style="font-size:${u*6.4}px;font-weight:800;color:${K.ink2}">10:00 – 17:00</span>
      </div>
      <div style="font-size:${u*5.6}px;font-weight:700;color:${K.ink2}">
        台中市西屯區　·　${BRAND.name}　攤位 B12</div>
    </div>`;
  }
};

/* =========================================================================
   清單
   ========================================================================= */
const COPY = {
  strawberry: { eyebrow:'當季限定', body:'#d94f4f', berry:'#c0392b',
    title:'草莓果醬<br>今天開賣', sub:'一罐用掉 18 顆草莓<br>不加香料，冷藏可放三個月',
    cta:'私訊我訂購' },
  process: { eyebrow:'今天在做什麼', body:K.gold, berry:'#c0392b',
    title:'一早就在<br>熬果醬', sub:'小火慢熬兩個半小時<br>攪到不能離手的那種',
    cta:'看更多過程' },
  pineapple: { eyebrow:'本週推薦', body:'#e0a83c', berry:'#d98f2b',
    title:'鳳梨果醬<br>回來了', sub:'酸甜剛剛好，配吐司最對味',
    cta:'立即訂購' }
};

const SPECS = [
  /* ── Facebook ─────────────────────────────────────────────── */
  { id:'FB-01', p:'Facebook', use:'大頭貼',       w:360,  h:360,  t:'avatar' },
  { id:'FB-02', p:'Facebook', use:'封面橫幅',     w:1640, h:624,  t:'banner' },
  { id:'FB-03', p:'Facebook', use:'貼文-正方形',  w:1080, h:1080, t:'post', copy:COPY.strawberry },
  { id:'FB-04', p:'Facebook', use:'貼文-直式',    w:1080, h:1350, t:'post', copy:COPY.process },
  { id:'FB-05', p:'Facebook', use:'貼文-橫式',    w:1200, h:630,  t:'post', copy:COPY.pineapple },
  { id:'FB-06', p:'Facebook', use:'限時動態',     w:1080, h:1920, t:'story', copy:COPY.strawberry },
  { id:'FB-07', p:'Facebook', use:'活動封面',     w:1920, h:1005, t:'event' },

  /* ── Instagram ────────────────────────────────────────────── */
  { id:'IG-01', p:'Instagram', use:'大頭貼',        w:320,  h:320,  t:'avatar' },
  { id:'IG-02', p:'Instagram', use:'貼文-直式',     w:1080, h:1350, t:'post', copy:COPY.strawberry },
  { id:'IG-03', p:'Instagram', use:'貼文-正方形',   w:1080, h:1080, t:'post', copy:COPY.pineapple },
  { id:'IG-04', p:'Instagram', use:'貼文-橫式',     w:1080, h:566,  t:'post', copy:COPY.process },
  { id:'IG-05', p:'Instagram', use:'限時動態',      w:1080, h:1920, t:'story', copy:COPY.process },
  { id:'IG-06', p:'Instagram', use:'Reels封面',     w:1080, h:1920, t:'story', copy:COPY.pineapple },
  { id:'IG-07', p:'Instagram', use:'精選限動封面',  w:1080, h:1920, t:'highlight' },

  /* ── LINE 官方帳號 ────────────────────────────────────────── */
  { id:'LN-01', p:'LINE官方帳號', use:'大頭貼',        w:640,  h:640,  t:'avatar' },
  { id:'LN-02', p:'LINE官方帳號', use:'封面背景圖',    w:1080, h:878,  t:'lineCover' },
  { id:'LN-03', p:'LINE官方帳號', use:'圖文選單-大',   w:2500, h:1686, t:'menu', rows:2,
    cells:[
      { i:'bag',  t:'最新商品', bg:'#fdeee6', c:K.clay },
      { i:'cart', t:'我要訂購', bg:'#eaf3ec', c:K.sage },
      { i:'tag',  t:'本月優惠', bg:'#fbf0dc', c:'#b8862f' },
      { i:'help', t:'常見問題', bg:'#f2ecf5', c:K.plum },
      { i:'pin',  t:'店家位置', bg:'#eaf0f8', c:'#3a6ea8' },
      { i:'chat', t:'聯絡小芳', bg:'#fdeee6', c:K.clay }
    ]},
  { id:'LN-04', p:'LINE官方帳號', use:'圖文選單-小',   w:2500, h:843,  t:'menu', rows:1,
    cells:[
      { i:'bag',  t:'看商品',   bg:'#fdeee6', c:K.clay },
      { i:'cart', t:'我要訂購', bg:'#eaf3ec', c:K.sage },
      { i:'chat', t:'聯絡小芳', bg:'#fbf0dc', c:'#b8862f' }
    ]},
  { id:'LN-05', p:'LINE官方帳號', use:'圖文訊息',      w:1040, h:1040, t:'notice' },
  { id:'LN-06', p:'LINE官方帳號', use:'優惠券',        w:1040, h:1040, t:'coupon' }
];

/* ── 執行 ─────────────────────────────────────────────────────── */
const browser = await chromium.launch();
const rows = [];

for (const s of SPECS) {
  const ctx = await browser.newContext({
    viewport: { width: s.w, height: s.h }, deviceScaleFactor: 1
  });
  const pg = await ctx.newPage();
  await pg.setContent(
    `<!doctype html><html><head><meta charset="utf-8"></head><body>${TPL[s.t](s)}</body></html>`,
    { waitUntil: 'load' });

  const name = `${s.id}_${s.p}_${s.use}_${s.w}x${s.h}.jpg`;
  const file = path.join(OUT, name);
  let q = 92;
  for (;;) {
    await pg.screenshot({ path: file, type: 'jpeg', quality: q });
    const kb = fs.statSync(file).size / 1024;
    if (!/LN-03|LN-04/.test(s.id) || kb < 950 || q <= 55) break;   // 圖文選單 1 MB 上限
    q -= 10;
  }
  await ctx.close();
  const kb = fs.statSync(file).size / 1024;
  rows.push({ ...s, name, kb });
  console.log(`${s.id}  ${String(s.w).padStart(4)}×${String(s.h).toString().padEnd(4)}  ${kb.toFixed(0).padStart(4)} KB  ${s.p} ${s.use}`);
}

await browser.close();
fs.writeFileSync(path.join(OUT, '_檔案清單.txt'),
  '示範圖片清單　·　虛擬品牌「小芳手作果醬」\n' +
  '每一張都已經是該用途的正確尺寸，可以直接上傳。\n\n' +
  rows.map(r => `${r.id}\t${r.p}\t${r.use}\t${r.w} × ${r.h}\t${Math.round(r.kb)} KB`).join('\n'),
  'utf8');
console.log('\n共 ' + rows.length + ' 張 → samples/out/');
