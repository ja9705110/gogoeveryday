/* =========================================================================
   art.js — 插畫與介面示意圖庫（全部為內嵌 SVG／HTML，離線可用）
   風格：溫暖手感線條 + 平塗色塊，與簡報同一套色票
   ========================================================================= */

const C = {
  clay:'#c05f3c', clay2:'#a94e2e', claySoft:'#f5ddd1', clayTint:'#fbeee6',
  sage:'#5f7a63', sageSoft:'#dfe8dc', gold:'#d99a4e', goldSoft:'#f8e6c9',
  plum:'#8a5a6d', plumSoft:'#f0dfe4',
  ink:'#241c17', ink2:'#4a3c33', ink3:'#7a6a5d', muted:'#9c8b7c',
  paper:'#fbf7f1', paper2:'#f4ece1', paper3:'#ece0d1', white:'#ffffff',
  fb:'#1877f2', ln:'#06c755', igA:'#f9a03f', igB:'#e1306c', igC:'#a02fbe'
};

/* SVG 外框 */
function svg(vb, inner, opt={}){
  const w = opt.w ? `width="${opt.w}"` : 'width="100%"';
  const h = opt.h ? `height="${opt.h}"` : '';
  return `<svg viewBox="${vb}" ${w} ${h} fill="none" xmlns="http://www.w3.org/2000/svg"
    style="${opt.style||''}" class="${opt.cls||''}" aria-hidden="true">${inner}</svg>`;
}
/* 柔和底圓 */
const blob = (cx,cy,r,fill,op=1) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" opacity="${op}"/>`;
/* 線條預設 */
const L = (d,c=C.ink,w=3) =>
  `<path d="${d}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const F = (d,c) => `<path d="${d}" fill="${c}"/>`;

/* =========================================================================
   一、物件插畫（240×240 視框，可直接放進卡片）
   ========================================================================= */
const ART = {};

/* 草莓果醬罐 */
ART.jar = (s=240)=> svg('0 0 240 240', `
  ${blob(120,124,92,C.clayTint)}
  <rect x="72" y="86" width="96" height="112" rx="20" fill="${C.white}" stroke="${C.ink}" stroke-width="3.4"/>
  <path d="M72 128h96v50a20 20 0 0 1-20 20H92a20 20 0 0 1-20-20v-50Z" fill="#e0573f"/>
  <rect x="66" y="66" width="108" height="30" rx="12" fill="${C.gold}" stroke="${C.ink}" stroke-width="3.4"/>
  <path d="M84 66c0-9 10-14 36-14s36 5 36 14" stroke="${C.ink}" stroke-width="3.4" stroke-linecap="round"/>
  <rect x="88" y="140" width="64" height="34" rx="9" fill="${C.white}" opacity=".92"/>
  <path d="M100 152h40M100 162h26" stroke="${C.clay}" stroke-width="3.4" stroke-linecap="round"/>
  <circle cx="150" cy="52" r="15" fill="#e0573f"/><path d="M150 40c6-8 14-8 14-8s-2 9-9 11" fill="${C.sage}"/>
  <circle cx="145" cy="49" r="1.8" fill="#fff"/><circle cx="155" cy="56" r="1.8" fill="#fff"/>
`, {w:s,h:s});

/* 手工餅乾 */
ART.cookie = (s=240)=> svg('0 0 240 240', `
  ${blob(120,122,92,C.goldSoft)}
  <circle cx="112" cy="128" r="62" fill="${C.gold}" stroke="${C.ink}" stroke-width="3.4"/>
  <circle cx="95" cy="112" r="9" fill="${C.clay2}"/><circle cx="130" cy="106" r="7" fill="${C.clay2}"/>
  <circle cx="120" cy="146" r="8.5" fill="${C.clay2}"/><circle cx="88" cy="150" r="6.5" fill="${C.clay2}"/>
  <circle cx="146" cy="140" r="6" fill="${C.clay2}"/>
  <path d="M168 76a44 44 0 0 1 0 84" stroke="${C.ink}" stroke-width="3.4" stroke-linecap="round" opacity=".35"/>
  <circle cx="176" cy="86" r="26" fill="${C.paper3}" stroke="${C.ink}" stroke-width="3.2"/>
  <circle cx="170" cy="80" r="4" fill="${C.clay2}"/><circle cx="184" cy="92" r="3.4" fill="${C.clay2}"/>
`, {w:s,h:s});

/* 鳳梨酥 */
ART.pineapple = (s=240)=> svg('0 0 240 240', `
  ${blob(120,122,92,C.goldSoft)}
  <rect x="60" y="92" width="120" height="76" rx="14" fill="${C.gold}" stroke="${C.ink}" stroke-width="3.4"/>
  <rect x="76" y="108" width="88" height="44" rx="8" fill="#f0c987"/>
  <path d="M60 130h120" stroke="${C.ink}" stroke-width="2.6" opacity=".3"/>
  <path d="M118 46c14 4 20 16 18 30-13 3-24-4-27-15" fill="${C.sage}"/>
  <path d="M124 44c-13 6-17 19-13 32 13 1 23-8 24-19" fill="#7a9a72"/>
  <ellipse cx="120" cy="84" rx="24" ry="15" fill="${C.gold}" stroke="${C.ink}" stroke-width="3"/>
  <path d="M108 80l6 6m10-8l6 6m-22 4l6 5" stroke="${C.clay2}" stroke-width="2.4" stroke-linecap="round"/>
`, {w:s,h:s});

/* 泡菜罐 */
ART.kimchi = (s=240)=> svg('0 0 240 240', `
  ${blob(120,124,92,C.clayTint)}
  <path d="M74 96h92v82a22 22 0 0 1-22 22H96a22 22 0 0 1-22-22V96Z" fill="${C.white}" stroke="${C.ink}" stroke-width="3.4"/>
  <path d="M74 122h92v56a22 22 0 0 1-22 22H96a22 22 0 0 1-22-22v-56Z" fill="#d9573d"/>
  <path d="M92 140c8-8 18-6 22 2m14-10c8 4 12 14 8 22" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".65"/>
  <rect x="66" y="72" width="108" height="28" rx="11" fill="${C.sage}" stroke="${C.ink}" stroke-width="3.4"/>
  <path d="M118 44c10 6 12 18 6 28-11-2-16-13-12-22" fill="${C.sage}"/>
  <rect x="90" y="150" width="60" height="30" rx="8" fill="#fff" opacity=".9"/>
  <path d="M102 162h36M102 171h22" stroke="${C.clay}" stroke-width="3.2" stroke-linecap="round"/>
`, {w:s,h:s});

/* 手作耳環 */
ART.earring = (s=240)=> svg('0 0 240 240', `
  ${blob(120,120,92,C.plumSoft)}
  <path d="M92 62a14 14 0 1 1 0 22" stroke="${C.ink}" stroke-width="3.4" stroke-linecap="round"/>
  <path d="M92 84v18" stroke="${C.ink}" stroke-width="3"/>
  <circle cx="92" cy="126" r="24" fill="${C.plum}" stroke="${C.ink}" stroke-width="3.4"/>
  <path d="M92 150v14" stroke="${C.ink}" stroke-width="3"/>
  <path d="M92 164l-16 26h32l-16-26Z" fill="${C.gold}" stroke="${C.ink}" stroke-width="3.4" stroke-linejoin="round"/>
  <path d="M154 66a13 13 0 1 1 0 20" stroke="${C.ink}" stroke-width="3.4" stroke-linecap="round"/>
  <path d="M154 86v16" stroke="${C.ink}" stroke-width="3"/>
  <path d="M154 102l-20 34a20 20 0 1 0 40 0l-20-34Z" fill="${C.claySoft}" stroke="${C.ink}" stroke-width="3.4" stroke-linejoin="round"/>
  <circle cx="154" cy="138" r="7" fill="${C.clay}"/>
  <circle cx="86" cy="118" r="4" fill="#fff" opacity=".7"/>
`, {w:s,h:s});

/* 瑜珈 */
ART.yoga = (s=240)=> svg('0 0 240 240', `
  ${blob(120,124,92,C.sageSoft)}
  <ellipse cx="120" cy="192" rx="76" ry="12" fill="${C.sage}" opacity=".28"/>
  <circle cx="120" cy="72" r="20" fill="${C.claySoft}" stroke="${C.ink}" stroke-width="3.4"/>
  <path d="M120 92v46" stroke="${C.ink}" stroke-width="3.6" stroke-linecap="round"/>
  <path d="M120 138c-26 0-44 16-46 42h92c-2-26-20-42-46-42Z" fill="${C.sage}" stroke="${C.ink}" stroke-width="3.4" stroke-linejoin="round"/>
  <path d="M120 106c-16-4-28 2-36 14m36-14c16-4 28 2 36 14" stroke="${C.ink}" stroke-width="3.4" stroke-linecap="round"/>
  <circle cx="82" cy="122" r="7" fill="${C.gold}" stroke="${C.ink}" stroke-width="3"/>
  <circle cx="158" cy="122" r="7" fill="${C.gold}" stroke="${C.ink}" stroke-width="3"/>
  <path d="M104 66c4-4 8-4 12 0m8 0c4-4 8-4 12 0" stroke="${C.ink}" stroke-width="2.8" stroke-linecap="round"/>
`, {w:s,h:s});

/* 市集攤位 */
ART.stall = (s=260)=> svg('0 0 260 220', `
  ${blob(130,116,96,C.goldSoft)}
  <path d="M40 78h180l-14-30H54L40 78Z" fill="${C.clay}" stroke="${C.ink}" stroke-width="3.4" stroke-linejoin="round"/>
  <path d="M62 48v30M92 48v30M122 48v30M152 48v30M182 48v30" stroke="${C.paper}" stroke-width="7"/>
  <path d="M40 78h180l-14-30H54L40 78Z" fill="none" stroke="${C.ink}" stroke-width="3.4" stroke-linejoin="round"/>
  <rect x="52" y="130" width="156" height="18" rx="6" fill="${C.paper3}" stroke="${C.ink}" stroke-width="3.2"/>
  <path d="M64 148v42M196 148v42" stroke="${C.ink}" stroke-width="3.4" stroke-linecap="round"/>
  <rect x="76" y="104" width="30" height="26" rx="7" fill="${C.white}" stroke="${C.ink}" stroke-width="3"/>
  <rect x="116" y="100" width="28" height="30" rx="7" fill="${C.sage}" stroke="${C.ink}" stroke-width="3"/>
  <rect x="154" y="108" width="30" height="22" rx="7" fill="${C.gold}" stroke="${C.ink}" stroke-width="3"/>
  <rect x="98" y="156" width="64" height="34" rx="8" fill="${C.white}" stroke="${C.ink}" stroke-width="3"/>
  <path d="M112 166h36M112 178h22" stroke="${C.clay}" stroke-width="3.2" stroke-linecap="round"/>
`, {w:s});

/* 店面（社區廣場） */
ART.plaza = (s=300)=> svg('0 0 300 220', `
  ${blob(150,116,100,C.clayTint)}
  <rect x="30" y="92" width="76" height="98" rx="8" fill="${C.white}" stroke="${C.ink}" stroke-width="3.2"/>
  <rect x="112" y="66" width="80" height="124" rx="8" fill="${C.claySoft}" stroke="${C.ink}" stroke-width="3.2"/>
  <rect x="198" y="100" width="72" height="90" rx="8" fill="${C.white}" stroke="${C.ink}" stroke-width="3.2"/>
  <path d="M44 110h20v18H44zM72 110h20v18H72zM44 140h20v18H44zM72 140h20v18H72z" fill="${C.paper3}"/>
  <path d="M212 118h18v16h-18zM238 118h18v16h-18zM212 146h18v16h-18zM238 146h18v16h-18z" fill="${C.paper3}"/>
  <rect x="130" y="86" width="44" height="30" rx="6" fill="${C.gold}" stroke="${C.ink}" stroke-width="3"/>
  <rect x="132" y="140" width="40" height="50" rx="6" fill="${C.clay}" stroke="${C.ink}" stroke-width="3"/>
  <ellipse cx="150" cy="196" rx="130" ry="10" fill="${C.ink}" opacity=".08"/>
  <circle cx="86" cy="176" r="11" fill="${C.sage}"/><path d="M75 190a11 11 0 0 1 22 0" fill="${C.sage}"/>
  <circle cx="216" cy="172" r="11" fill="${C.plum}"/><path d="M205 190a11 11 0 0 1 22 0" fill="${C.plum}"/>
  <circle cx="112" cy="172" r="10" fill="${C.gold}"/><path d="M102 190a10 10 0 0 1 20 0" fill="${C.gold}"/>
`, {w:s});

/* 櫥窗 */
ART.window = (s=300)=> svg('0 0 300 220', `
  ${blob(150,112,98,C.plumSoft)}
  <rect x="52" y="40" width="196" height="150" rx="14" fill="${C.white}" stroke="${C.ink}" stroke-width="3.4"/>
  <rect x="66" y="54" width="168" height="106" rx="8" fill="${C.paper2}"/>
  <rect x="86" y="76" width="52" height="64" rx="8" fill="${C.claySoft}" stroke="${C.ink}" stroke-width="3"/>
  <circle cx="112" cy="100" r="13" fill="${C.clay}"/>
  <rect x="160" y="90" width="52" height="50" rx="8" fill="${C.sageSoft}" stroke="${C.ink}" stroke-width="3"/>
  <path d="M172 126l14-16 12 14 8-8" stroke="${C.sage}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M52 172h196" stroke="${C.ink}" stroke-width="3.4" stroke-linecap="round"/>
  <path d="M74 40l-10-16h172l-10 16" fill="${C.plum}" stroke="${C.ink}" stroke-width="3.2" stroke-linejoin="round"/>
  <circle cx="150" cy="182" r="6" fill="${C.gold}"/>
  <path d="M104 172v18M196 172v18" stroke="${C.ink}" stroke-width="3" opacity=".25"/>
`, {w:s});

/* 服務櫃台 */
ART.counter = (s=300)=> svg('0 0 300 220', `
  ${blob(150,116,98,C.sageSoft)}
  <rect x="56" y="118" width="188" height="72" rx="12" fill="${C.white}" stroke="${C.ink}" stroke-width="3.4"/>
  <path d="M56 142h188" stroke="${C.ink}" stroke-width="3" opacity=".22"/>
  <rect x="76" y="152" width="44" height="26" rx="6" fill="${C.paper3}"/>
  <rect x="130" y="152" width="44" height="26" rx="6" fill="${C.paper3}"/>
  <rect x="184" y="152" width="44" height="26" rx="6" fill="${C.paper3}"/>
  <circle cx="112" cy="82" r="22" fill="${C.claySoft}" stroke="${C.ink}" stroke-width="3.2"/>
  <path d="M84 118a28 28 0 0 1 56 0" fill="${C.ln}" stroke="${C.ink}" stroke-width="3.2"/>
  <rect x="166" y="44" width="86" height="60" rx="14" fill="${C.ln}" stroke="${C.ink}" stroke-width="3.2"/>
  <path d="M186 104l-6 20 24-20" fill="${C.ln}" stroke="${C.ink}" stroke-width="3.2" stroke-linejoin="round"/>
  <path d="M186 66h46M186 82h30" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
  <path d="M100 76c3-3 7-3 10 0m6 0c3-3 7-3 10 0" stroke="${C.ink}" stroke-width="2.8" stroke-linecap="round"/>
`, {w:s});

/* 招牌 */
ART.sign = (txt='?', tone=C.clay, s=240)=> svg('0 0 240 180', `
  <rect x="34" y="26" width="172" height="90" rx="14" fill="${C.white}" stroke="${C.ink}" stroke-width="3.4"/>
  <rect x="34" y="26" width="172" height="24" rx="14" fill="${tone}"/>
  <rect x="34" y="38" width="172" height="12" fill="${tone}"/>
  <text x="120" y="90" text-anchor="middle" font-family="${'PingFang TC,Noto Sans TC,sans-serif'}"
        font-size="26" font-weight="800" fill="${C.ink}">${txt}</text>
  <path d="M70 116v34M170 116v34" stroke="${C.ink}" stroke-width="3.4" stroke-linecap="round"/>
  <path d="M46 150h148" stroke="${C.ink}" stroke-width="3.4" stroke-linecap="round"/>
`, {w:s});

/* 眼睛 / 愛心 / 握手 */
ART.eye = (s=90,c=C.clay)=> svg('0 0 64 64', `
  <path d="M4 32s10-16 28-16 28 16 28 16-10 16-28 16S4 32 4 32Z" fill="${c}" opacity=".16"/>
  <path d="M4 32s10-16 28-16 28 16 28 16-10 16-28 16S4 32 4 32Z" stroke="${c}" stroke-width="4" stroke-linejoin="round"/>
  <circle cx="32" cy="32" r="9" fill="${c}"/>`, {w:s,h:s});
ART.heart = (s=90,c=C.clay)=> svg('0 0 64 64', `
  <path d="M32 54S6 38 6 22a14 14 0 0 1 26-7 14 14 0 0 1 26 7c0 16-26 32-26 32Z" fill="${c}" opacity=".16"/>
  <path d="M32 54S6 38 6 22a14 14 0 0 1 26-7 14 14 0 0 1 26 7c0 16-26 32-26 32Z" stroke="${c}" stroke-width="4" stroke-linejoin="round"/>`, {w:s,h:s});
ART.hands = (s=90,c=C.clay)=> svg('0 0 64 64', `
  <path d="M6 34l12-10 14 8 14-8 12 10" stroke="${c}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M18 24l10 12a6 6 0 0 0 8 0l10-12" fill="${c}" opacity=".16"/>
  <path d="M22 40l8 8a6 6 0 0 0 8 0l8-8" stroke="${c}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`, {w:s,h:s});
/* 對話 / 購物袋 */
ART.chat = (s=90,c=C.sage)=> svg('0 0 64 64', `
  <path d="M8 14h48v30H26L14 54V44H8V14Z" fill="${c}" opacity=".16"/>
  <path d="M8 14h48v30H26L14 54V44H8V14Z" stroke="${c}" stroke-width="4" stroke-linejoin="round"/>
  <circle cx="24" cy="29" r="3.4" fill="${c}"/><circle cx="34" cy="29" r="3.4" fill="${c}"/><circle cx="44" cy="29" r="3.4" fill="${c}"/>`, {w:s,h:s});
ART.bag = (s=90,c=C.gold)=> svg('0 0 64 64', `
  <path d="M12 20h40l4 34H8l4-34Z" fill="${c}" opacity=".18"/>
  <path d="M12 20h40l4 34H8l4-34Z" stroke="${c}" stroke-width="4" stroke-linejoin="round"/>
  <path d="M24 26V16a8 8 0 0 1 16 0v10" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`, {w:s,h:s});

/* 放大鏡 */
ART.search = (s=90,c=C.clay)=> svg('0 0 64 64', `
  <circle cx="28" cy="28" r="17" fill="${c}" opacity=".14"/>
  <circle cx="28" cy="28" r="17" stroke="${c}" stroke-width="4"/>
  <path d="M41 41l14 14" stroke="${c}" stroke-width="5" stroke-linecap="round"/>`, {w:s,h:s});
/* 碼錶 */
ART.timer3 = (s=110,c=C.clay)=> svg('0 0 64 64', `
  <circle cx="32" cy="36" r="22" fill="${c}" opacity=".14"/>
  <circle cx="32" cy="36" r="22" stroke="${c}" stroke-width="4"/>
  <path d="M32 24v12l8 6" stroke="${c}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M25 8h14M32 8v6" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`, {w:s,h:s});
/* 擴音器 */
ART.megaphone = (s=110,c=C.clay)=> svg('0 0 64 64', `
  <path d="M8 26h12l24-14v40L20 38H8V26Z" fill="${c}" opacity=".16"/>
  <path d="M8 26h12l24-14v40L20 38H8V26Z" stroke="${c}" stroke-width="4" stroke-linejoin="round"/>
  <path d="M50 22a12 12 0 0 1 0 20M20 38v12h8V38" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`, {w:s,h:s});
/* 播放鍵 */
ART.play = (s=110,c=C.plum)=> svg('0 0 64 64', `
  <circle cx="32" cy="32" r="26" fill="${c}" opacity=".14"/>
  <circle cx="32" cy="32" r="26" stroke="${c}" stroke-width="4"/>
  <path d="M26 21l19 11-19 11V21Z" fill="${c}"/>`, {w:s,h:s});
/* QR */
ART.qr = (s=110,c=C.ink)=> svg('0 0 64 64', `
  <rect x="6" y="6" width="20" height="20" rx="4" stroke="${c}" stroke-width="4"/>
  <rect x="38" y="6" width="20" height="20" rx="4" stroke="${c}" stroke-width="4"/>
  <rect x="6" y="38" width="20" height="20" rx="4" stroke="${c}" stroke-width="4"/>
  <rect x="13" y="13" width="6" height="6" fill="${c}"/><rect x="45" y="13" width="6" height="6" fill="${c}"/>
  <rect x="13" y="45" width="6" height="6" fill="${c}"/>
  <path d="M38 38h8v8h-8zM52 38h6v6h-6zM38 52h6v6h-6zM50 50h8v8h-8z" fill="${c}"/>`, {w:s,h:s});
/* 相機 */
ART.camera = (s=90,c=C.plum)=> svg('0 0 64 64', `
  <rect x="5" y="18" width="54" height="34" rx="8" fill="${c}" opacity=".14"/>
  <rect x="5" y="18" width="54" height="34" rx="8" stroke="${c}" stroke-width="4"/>
  <path d="M22 18l4-7h12l4 7" stroke="${c}" stroke-width="4" stroke-linejoin="round"/>
  <circle cx="32" cy="35" r="10" stroke="${c}" stroke-width="4"/>`, {w:s,h:s});
/* 日曆 */
ART.calendar = (s=90,c=C.sage)=> svg('0 0 64 64', `
  <rect x="7" y="12" width="50" height="44" rx="8" fill="${c}" opacity=".14"/>
  <rect x="7" y="12" width="50" height="44" rx="8" stroke="${c}" stroke-width="4"/>
  <path d="M7 26h50M20 6v10M44 6v10" stroke="${c}" stroke-width="4" stroke-linecap="round"/>
  <circle cx="21" cy="38" r="3.5" fill="${c}"/><circle cx="32" cy="38" r="3.5" fill="${c}"/>
  <circle cx="43" cy="38" r="3.5" fill="${c}"/><circle cx="21" cy="48" r="3.5" fill="${c}"/>`, {w:s,h:s});
/* 筆記本 */
ART.note = (s=90,c=C.gold)=> svg('0 0 64 64', `
  <rect x="12" y="7" width="42" height="50" rx="7" fill="${c}" opacity=".16"/>
  <rect x="12" y="7" width="42" height="50" rx="7" stroke="${c}" stroke-width="4"/>
  <path d="M22 21h22M22 32h22M22 43h13" stroke="${c}" stroke-width="4" stroke-linecap="round"/>
  <path d="M12 16H6M12 32H6M12 48H6" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`, {w:s,h:s});
/* 標籤 */
ART.tagIcon = (s=90,c=C.clay)=> svg('0 0 64 64', `
  <path d="M32 6H10a4 4 0 0 0-4 4v22l26 26 26-26L32 6Z" fill="${c}" opacity=".14"/>
  <path d="M32 6H10a4 4 0 0 0-4 4v22l26 26 26-26L32 6Z" stroke="${c}" stroke-width="4" stroke-linejoin="round"/>
  <circle cx="19" cy="19" r="4.5" fill="${c}"/>`, {w:s,h:s});
/* 星星 / 禮物 */
ART.star = (s=90,c=C.gold)=> svg('0 0 64 64', `
  <path d="M32 6l8 17 19 2-14 13 4 19-17-10-17 10 4-19L5 25l19-2 8-17Z" fill="${c}" opacity=".18"/>
  <path d="M32 6l8 17 19 2-14 13 4 19-17-10-17 10 4-19L5 25l19-2 8-17Z" stroke="${c}" stroke-width="4" stroke-linejoin="round"/>`, {w:s,h:s});
ART.gift = (s=90,c=C.plum)=> svg('0 0 64 64', `
  <rect x="8" y="24" width="48" height="32" rx="6" fill="${c}" opacity=".16"/>
  <rect x="8" y="24" width="48" height="32" rx="6" stroke="${c}" stroke-width="4"/>
  <path d="M5 16h54v10H5zM32 16v40" stroke="${c}" stroke-width="4" stroke-linejoin="round"/>
  <path d="M32 16s-4-10-11-10-6 10 3 10m8 0s4-10 11-10 6 10-3 10" stroke="${c}" stroke-width="4" stroke-linejoin="round"/>`, {w:s,h:s});
/* 人群 */
ART.people = (s=110,c=C.sage)=> svg('0 0 80 64', `
  <circle cx="22" cy="22" r="10" fill="${c}" opacity=".2"/><circle cx="22" cy="22" r="10" stroke="${c}" stroke-width="4"/>
  <path d="M6 54a16 16 0 0 1 32 0" stroke="${c}" stroke-width="4" stroke-linecap="round"/>
  <circle cx="56" cy="26" r="9" fill="${c}" opacity=".2"/><circle cx="56" cy="26" r="9" stroke="${c}" stroke-width="4"/>
  <path d="M42 54a14 14 0 0 1 28 0" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`, {w:s});
/* 手指點擊 */
ART.tap = (s=100,c=C.clay)=> svg('0 0 64 64', `
  <path d="M26 34V14a5 5 0 0 1 10 0v18h4a12 12 0 0 1 12 12v8a10 10 0 0 1-10 10H36a12 12 0 0 1-10-6l-11-16a5 5 0 0 1 8-6l3 4Z"
        fill="${c}" opacity=".16"/>
  <path d="M26 34V14a5 5 0 0 1 10 0v18h4a12 12 0 0 1 12 12v8a10 10 0 0 1-10 10H36a12 12 0 0 1-10-6l-11-16a5 5 0 0 1 8-6l3 4Z"
        stroke="${c}" stroke-width="4" stroke-linejoin="round"/>`, {w:s,h:s});
/* 趨勢圖 */
ART.trend = (s=110,c=C.sage)=> svg('0 0 72 64', `
  <path d="M6 52h60" stroke="${c}" stroke-width="4" stroke-linecap="round"/>
  <path d="M10 42l14-14 10 9 14-19" stroke="${c}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M40 18h12v12" stroke="${c}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="10" y="42" width="0" height="0"/>`, {w:s});
/* 大腦 vs 眼睛的組合、時鐘 */
ART.clock = (s=90,c=C.gold)=> svg('0 0 64 64', `
  <circle cx="32" cy="32" r="24" fill="${c}" opacity=".15"/><circle cx="32" cy="32" r="24" stroke="${c}" stroke-width="4"/>
  <path d="M32 18v14l10 6" stroke="${c}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`, {w:s,h:s});
/* 燈泡 */
ART.bulb = (s=90,c=C.gold)=> svg('0 0 64 64', `
  <path d="M32 6a18 18 0 0 1 11 32v6H21v-6A18 18 0 0 1 32 6Z" fill="${c}" opacity=".18"/>
  <path d="M32 6a18 18 0 0 1 11 32v6H21v-6A18 18 0 0 1 32 6Z" stroke="${c}" stroke-width="4" stroke-linejoin="round"/>
  <path d="M25 52h14M27 58h10" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`, {w:s,h:s});
/* 警示 */
ART.warn = (s=90,c=C.clay)=> svg('0 0 64 64', `
  <path d="M32 8l26 46H6L32 8Z" fill="${c}" opacity=".16"/>
  <path d="M32 8l26 46H6L32 8Z" stroke="${c}" stroke-width="4" stroke-linejoin="round"/>
  <path d="M32 24v14" stroke="${c}" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="46" r="3" fill="${c}"/>`, {w:s,h:s});

/* 平台圖標 */
ART.fbIcon = (s=44)=> svg('0 0 40 40', `
  <circle cx="20" cy="20" r="20" fill="${C.fb}"/>
  <path d="M23.6 20.6h3.2l.6-4.2h-3.8v-2.6c0-1.2.4-2 2-2h2V8.1c-.4 0-1.6-.2-3-.2-3 0-5 1.8-5 5.2v3.3H16v4.2h3.6V32h4v-11.4Z" fill="#fff"/>`, {w:s,h:s});
ART.igIcon = (s=44)=> svg('0 0 40 40', `
  <defs><linearGradient id="ig${Math.random().toString(36).slice(2,7)}" x1="0" y1="1" x2="1" y2="0">
    <stop offset="0" stop-color="#fdcb5c"/><stop offset=".45" stop-color="${C.igB}"/><stop offset="1" stop-color="${C.igC}"/>
  </linearGradient></defs>
  <rect width="40" height="40" rx="12" fill="url(#ig${''})" style="fill:${C.igB}"/>
  <rect width="40" height="40" rx="12" fill="url(#igGrad)"/>
  <rect x="9" y="9" width="22" height="22" rx="7" stroke="#fff" stroke-width="2.6"/>
  <circle cx="20" cy="20" r="5.6" stroke="#fff" stroke-width="2.6"/><circle cx="27" cy="13" r="1.8" fill="#fff"/>`, {w:s,h:s});
ART.lnIcon = (s=44)=> svg('0 0 40 40', `
  <rect width="40" height="40" rx="10" fill="${C.ln}"/>
  <path d="M20 9c-6.6 0-12 4.2-12 9.4 0 4.6 4.3 8.5 10 9.3.4.1 1 .3 1.1.6.1.3.1.7 0 1l-.2 1c-.1.3-.3 1.2 1.1.7 1.4-.6 7.4-4.4 10.1-7.5 1.9-2 2.8-4.1 2.8-6.4C32.8 13.2 27.4 9 20 9Z" fill="#fff"/>`, {w:s,h:s});

/* IG 漸層（全域一次） */
const IG_DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <linearGradient id="igGrad" x1="0" y1="1" x2="1" y2="0">
    <stop offset="0" stop-color="#fdcb5c"/><stop offset=".28" stop-color="${C.igA}"/>
    <stop offset=".62" stop-color="${C.igB}"/><stop offset="1" stop-color="${C.igC}"/>
  </linearGradient></defs></svg>`;

/* =========================================================================
   二、貼文縮圖（給手機九宮格 / 卡片用）
   ========================================================================= */
const TH = {
  jam:   `<div class="thumb tr-1">${ART.jar(64)}</div>`,
  cookie:`<div class="thumb tr-5">${ART.cookie(64)}</div>`,
  cake:  `<div class="thumb tr-5">${ART.pineapple(64)}</div>`,
  ear:   `<div class="thumb tr-6">${ART.earring(64)}</div>`,
  yoga:  `<div class="thumb tr-4">${ART.yoga(64)}</div>`,
  kim:   `<div class="thumb tr-3">${ART.kimchi(64)}</div>`,
  stall: `<div class="thumb tr-2">${ART.stall(78)}</div>`,
  hand:  `<div class="thumb tr-2">${ART.tap(46)}</div>`,
  gift:  `<div class="thumb tr-6">${ART.gift(46)}</div>`
};
const thumbSet = (...k)=> k.map(x=>`<div class="ig-cell">${TH[x]||TH.jam}</div>`).join('');

/* 圓形頭像 */
const avatar = (art=ART.jar, bg=C.claySoft)=>
  `<span style="display:grid;place-items:center;width:100%;height:100%;background:${bg}">${art(26)}</span>`;

/* =========================================================================
   三、介面模擬（HTML + CSS）
   ========================================================================= */

/* 手機外框 */
function phone(inner, {sm=false, xs=false, style=''}={}){
  return `<div class="phone${xs?' xs':sm?' sm':''}" style="${style}">
    <div class="scr">
      <div class="stat"><span>9:41</span><span class="r">●●● ▮</span></div>
      ${inner}
    </div></div>`;
}

/* Facebook 粉專貼文畫面 */
function fbScreen({name='小芳手作果醬｜台中', text, thumb='jam', meta='2 小時前 · 台中市'}={}){
  return phone(`
    <div class="app-bar fb-bar"><span class="ttl">facebook</span>
      <span class="ic"><b style="font-size:13px">🔍</b><b style="font-size:13px">☰</b></span></div>
    <div class="app-body grey">
      <div class="fb-post">
        <div class="fb-head">
          <span style="width:34px;height:34px;border-radius:99px;overflow:hidden;flex:none">${avatar(ART.jar)}</span>
          <span><span class="fb-name">${name}</span><br><span class="fb-meta">${meta}</span></span>
        </div>
        <div class="fb-text">${text}</div>
      </div>
      <div style="height:118px;overflow:hidden">${TH[thumb]}</div>
      <div class="fb-post" style="border-bottom:none;padding-top:6px">
        <div class="fb-acts"><span>👍 讚</span><span>💬 留言</span><span>↗ 分享</span></div>
      </div>
    </div>`);
}

/* Instagram 個人檔案畫面 */
function igProfile({handle='xiaofang.jam', name='小芳手作果醬', bio, link='📍 台中西屯 · 週三出貨',
                    grid=['jam','cookie','cake','ear','stall','gift','kim','cake','yoga'], sm=false}={}){
  return phone(`
    <div class="app-bar ig-bar"><span class="ttl">${handle}</span>
      <span class="ic"><b style="font-size:13px">＋</b><b style="font-size:13px">☰</b></span></div>
    <div class="app-body">
      <div class="ig-prof">
        <div class="ig-top">
          <span class="ring"><span>${avatar(ART.jar)}</span></span>
          <span class="ig-stats">
            <div><b>132</b><span>貼文</span></div><div><b>1,284</b><span>粉絲</span></div><div><b>301</b><span>追蹤中</span></div>
          </span>
        </div>
        <div class="ig-bio"><b>${name}</b><br>${bio}<br><span class="lk">${link}</span></div>
        <div class="ig-grid">${thumbSet(...grid)}</div>
      </div>
    </div>`, {sm});
}

/* LINE 官方帳號對話畫面 */
function lnChat(bubbles, {title='小芳手作果醬', sm=false}={}){
  const b = bubbles.map(x=>`<div class="bub ${x.side}">${x.t}</div>`).join('');
  return phone(`
    <div class="app-bar ln-bar"><span class="ttl">${title}</span>
      <span class="ic"><b style="font-size:13px">☰</b></span></div>
    <div class="app-body" style="background:#8fb6d8;overflow:hidden">
      <div class="ln-body">
        <div class="ln-day"><span>今天</span></div>${b}
      </div>
    </div>`, {sm});
}

/* 搜尋列示意 */
function searchBar(q, {ph='搜尋', tone=C.ink3, results=[]}={}){
  const r = results.map(x=>`<div style="display:flex;gap:11px;align-items:center;padding:11px 16px;
      border-top:1px solid rgba(36,28,23,.07);font-size:16px;font-weight:650;color:${C.ink2}">
      <span style="opacity:.45">🔍</span>${x}</div>`).join('');
  return `<div style="background:#fff;border:1px solid rgba(36,28,23,.12);border-radius:16px;
      overflow:hidden;box-shadow:0 14px 34px -20px rgba(60,40,28,.45)">
    <div style="display:flex;gap:12px;align-items:center;padding:15px 18px">
      <span style="opacity:.4">${ART.search(20,tone)}</span>
      <span style="font-size:18px;font-weight:750;color:${C.ink}">${q}</span>
      <span style="margin-left:auto;font-size:13px;color:${C.muted};font-weight:700">${ph}</span>
    </div>${r}</div>`;
}

/* 圖文選單示意 */
function richMenu(){
  const cell = (t,i)=>`<div style="display:grid;place-items:center;gap:6px;background:${C.paper2};
    border-radius:10px;padding:14px 6px;font-size:12.5px;font-weight:800;color:${C.ink2}">
    <span style="font-size:19px">${i}</span>${t}</div>`;
  return `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:8px;background:#fff;
    border-radius:14px;border:1px solid rgba(36,28,23,.12)">
    ${cell('商品目錄','🧺')}${cell('我要預訂','📝')}${cell('營業時間','🕘')}
    ${cell('最新消息','📣')}${cell('取貨地點','📍')}${cell('聯絡我們','💬')}</div>`;
}

/* =========================================================================
   四、操作教學專用元件（建立流程、設定畫面、後台數據）
   ========================================================================= */

/* 一列小手機＋編號說明，用來示範「幾個步驟完成一件事」 */
function steps(list){
  return `<div style="display:flex;gap:18px;align-items:flex-start;justify-content:center">
    ${list.map((s,i)=>`
    <div style="width:198px;flex:none;text-align:center">
      <div style="position:relative;display:inline-block">
        ${phone(s.screen, {xs:true})}
        <span style="position:absolute;left:-15px;top:-15px;width:38px;height:38px;border-radius:99px;
          background:${C.clay};color:#fff;display:grid;place-items:center;
          font-size:20px;font-weight:900;border:3px solid ${C.paper};
          box-shadow:0 3px 8px rgba(60,40,28,.28)">${i+1}</span>
      </div>
      <p style="margin:10px 0 0;font-size:20px;font-weight:800;color:${C.ink};line-height:1.3">${s.t}</p>
      ${s.d?`<p style="margin:5px 0 0;font-size:20px;color:${C.ink3};font-weight:600;line-height:1.4">${s.d}</p>`:''}
    </div>`).join('')}
  </div>`;
}

/* 設定清單畫面（手機裡的一排設定項目，可指定highlight） */
function settingRows(rows, hi=-1){
  return rows.map(([t,v],i)=>`
    <div style="display:flex;align-items:center;gap:9px;background:#fff;border-radius:9px;
      padding:11px 12px;margin-bottom:6px;
      ${i===hi?`outline:2.5px solid ${C.clay};outline-offset:1px`:''}">
      <span style="font-size:13px;font-weight:750;color:#1c1e21">${t}</span>
      <span style="margin-left:auto;font-size:12px;color:#8a8d91;font-weight:650">${v||'›'}</span>
    </div>`).join('');
}

/* 大數字磚：後台數據用 */
function numTile(label, value, sub, tone=C.clay, bg=C.clayTint){
  return `<div class="card" style="padding:20px 22px;text-align:left">
    <p class="cap" style="color:${tone};margin-bottom:6px">${label}</p>
    <p style="margin:0;font-size:42px;font-weight:900;letter-spacing:-.02em;color:${C.ink};
      line-height:1.05">${value}</p>
    ${sub?`<p style="margin:6px 0 0;font-size:20px;font-weight:700;color:${C.ink3}">${sub}</p>`:''}
  </div>`;
}

/* 後台數據畫面（手機版，三個平台共用外框） */
function insightScreen({title, tone, rows, chart=true}){
  return phone(`
    <div class="app-bar" style="background:${tone};border-bottom:none">
      <span class="ttl" style="color:#fff">${title}</span>
      <span class="ic" style="color:rgba(255,255,255,.9)"><b style="font-size:13px">☰</b></span></div>
    <div class="app-body" style="padding:11px;background:#f6f7f8">
      ${chart?`<div style="background:#fff;border-radius:10px;padding:11px;margin-bottom:8px">
        <svg viewBox="0 0 200 60" width="100%" height="52">
          ${[12,26,20,38,32,48,44].map((v,i)=>
            `<rect x="${8+i*27}" y="${56-v}" width="16" height="${v}" rx="3" fill="${tone}" opacity="${.35+i*.09}"/>`).join('')}
        </svg>
        <p style="margin:6px 0 0;font-size:10px;color:#8a8d91;font-weight:700;text-align:center">最近 7 天</p>
      </div>`:''}
      ${rows.map(([t,v,d])=>`
        <div style="background:#fff;border-radius:10px;padding:10px 12px;margin-bottom:6px;
          display:flex;align-items:center">
          <span style="font-size:12px;font-weight:700;color:#1c1e21">${t}</span>
          <span style="margin-left:auto;text-align:right">
            <b style="display:block;font-size:15px;font-weight:900;color:#1c1e21">${v}</b>
            ${d?`<span style="font-size:10px;font-weight:800;color:${d[0]==='＋'?'#2f855a':'#c53030'}">${d}</span>`:''}
          </span></div>`).join('')}
    </div>`);
}

/* 三種數據情況的解讀卡 */
function readCard(sym, title, mean, act, tone, bg){
  return `<div class="card" style="padding:22px 22px">
    <div style="display:flex;align-items:center;gap:11px;margin-bottom:12px">
      <span style="width:40px;height:40px;border-radius:12px;background:${bg};color:${tone};
        display:grid;place-items:center;font-size:22px;font-weight:900;flex:none">${sym}</span>
      <p class="k" style="margin:0;font-size:21px;color:${tone}">${title}</p>
    </div>
    <p class="cap" style="margin-bottom:4px">代表什麼</p>
    <p class="v" style="margin-bottom:12px">${mean}</p>
    <p class="cap" style="margin-bottom:4px">下一篇怎麼改</p>
    <p class="v" style="font-weight:700;color:${C.ink}">${act}</p>
  </div>`;
}
