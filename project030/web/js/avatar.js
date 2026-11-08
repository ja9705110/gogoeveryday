// 觀察員識別影像：依第 1 天「身分建檔」的選擇（色調／輪廓／表情／背景）即時生成的虛擬人物（SVG）
let uid = 0;

const BG = {
  studio: () => `<defs><radialGradient id="bgS" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="#f4f1ea"/><stop offset="1" stop-color="#b9b3a8"/></radialGradient></defs>
    <rect width="240" height="300" fill="url(#bgS)"/><ellipse cx="120" cy="296" rx="110" ry="14" fill="rgba(0,0,0,.15)"/>`,
  city: () => `<rect width="240" height="300" fill="#0d1838"/><circle cx="196" cy="44" r="14" fill="#fff6d8" opacity=".85"/>
    ${[[0, 150, 34], [30, 120, 30], [58, 165, 26], [168, 130, 30], [196, 105, 44]].map(([x, y, w]) => `<rect x="${x}" y="${y}" width="${w}" height="${300 - y}" fill="#1b2a52"/>
      ${Array.from({ length: 8 }, (_, i) => `<rect x="${x + 5 + (i % 2) * (w / 2 - 2)}" y="${y + 10 + Math.floor(i / 2) * 22}" width="5" height="7" fill="#ffd27a" opacity="${(i * 37 + x) % 3 ? .9 : .25}"/>`).join('')}`).join('')}
    <path d="M20 300 V190 q0 -10 12 -10 h14" stroke="#3a4a6e" stroke-width="4" fill="none"/><circle cx="48" cy="182" r="7" fill="#ffe7a3"/><circle cx="48" cy="182" r="22" fill="#ffe7a3" opacity=".15"/>`,
  retro: () => `<rect width="240" height="300" fill="#7a4b33"/>${Array.from({ length: 12 }, (_, i) => `<rect x="${i * 20}" y="0" width="10" height="300" fill="#8d5a3e"/>`).join('')}
    <rect x="0" y="230" width="240" height="70" fill="#4a2c1e"/><rect x="10" y="200" width="220" height="50" rx="18" fill="#9c3f2e"/>
    <path d="M200 70 l18 0 l8 22 l-34 0z" fill="#f2c26b"/><rect x="207" y="92" width="4" height="60" fill="#3a2418"/><circle cx="209" cy="92" r="30" fill="#ffd98a" opacity=".2"/>`,
  light: () => `<rect width="240" height="300" fill="#0b0b10"/>
    <polygon points="40,0 110,0 240,300 150,300" fill="#fff4d6" opacity=".18"/><polygon points="150,0 180,0 240,140 240,220" fill="#fff4d6" opacity=".12"/>
    <polygon points="0,90 60,0 90,0 0,170" fill="#fff4d6" opacity=".08"/>`,
};

const OUTFIT = {
  formal: () => `<path d="M30 300 C34 240 60 222 120 218 C180 222 206 240 210 300Z" fill="#1d2230"/>
    <path d="M104 218 L120 262 L136 218Z" fill="#f4f4f4"/><path d="M116 226 L124 226 L127 270 L120 282 L113 270Z" fill="#8b1e2d"/>
    <path d="M104 218 L92 236 L112 262 L120 262Z" fill="#2b3245"/><path d="M136 218 L148 236 L128 262 L120 262Z" fill="#2b3245"/>`,
  smart: () => `<path d="M32 300 C36 242 62 222 120 218 C178 222 204 242 208 300Z" fill="#a9c7e8"/>
    <path d="M102 216 L120 236 L138 216 L132 232 L120 246 L108 232Z" fill="#ffffff"/><path d="M120 240 V300" stroke="#8fb0d4" stroke-width="2"/>
    ${[256, 274, 292].map((y) => `<circle cx="120" cy="${y}" r="2.2" fill="#e8f0fa"/>`).join('')}`,
  self: () => `<path d="M30 300 C34 244 60 224 120 220 C180 224 206 244 210 300Z" fill="#2f8f88"/>
    <path d="M86 226 C96 252 144 252 154 226" fill="none" stroke="#25736e" stroke-width="6"/>
    <path d="M110 244 V270 M130 244 V270" stroke="#e6f3f1" stroke-width="2"/><rect x="92" y="272" width="56" height="22" rx="6" fill="#28807a"/>`,
  bold: () => `<defs><pattern id="pt${uid}" width="18" height="18" patternUnits="userSpaceOnUse"><rect width="18" height="18" fill="#e23d7c"/><circle cx="9" cy="9" r="4" fill="#ffcc33"/><path d="M0 18 L18 0" stroke="#6a2bd9" stroke-width="3"/></pattern></defs>
    <path d="M28 300 C32 240 58 220 120 216 C182 220 208 240 212 300Z" fill="url(#pt${uid})"/>
    <path d="M100 216 L82 250 L112 238Z M140 216 L158 250 L128 238Z" fill="#111"/><path d="M106 220 L120 300 L134 220Z" fill="#111"/>`,
  none: () => `<path d="M34 300 C38 244 62 224 120 220 C178 224 202 244 206 300Z" fill="#4a5966"/>`,
};

const FACE = {
  confident: `<circle cx="104" cy="148" r="4" fill="#2a1d14"/><circle cx="136" cy="148" r="4" fill="#2a1d14"/>
    <path d="M96 136 l14 -3 M130 133 l14 3" stroke="#2a1d14" stroke-width="3" stroke-linecap="round"/>
    <path d="M106 174 Q120 184 134 174" fill="none" stroke="#8a3b2e" stroke-width="3.5" stroke-linecap="round"/>`,
  gentle: `<path d="M98 150 q6 -6 12 0 M130 150 q6 -6 12 0" fill="none" stroke="#2a1d14" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="96" cy="164" rx="8" ry="4" fill="#f29a9a" opacity=".55"/><ellipse cx="144" cy="164" rx="8" ry="4" fill="#f29a9a" opacity=".55"/>
    <path d="M108 172 Q120 180 132 172" fill="none" stroke="#8a3b2e" stroke-width="3" stroke-linecap="round"/>`,
  calm: `<path d="M98 149 h12 M130 149 h12" stroke="#2a1d14" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M97 138 h14 M129 138 h14" stroke="#2a1d14" stroke-width="2.5" stroke-linecap="round" opacity=".7"/>
    <path d="M110 176 h20" stroke="#8a3b2e" stroke-width="3" stroke-linecap="round"/>`,
  playful: `<circle cx="104" cy="148" r="4.5" fill="#2a1d14"/><path d="M130 150 q6 -7 12 0" fill="none" stroke="#2a1d14" stroke-width="3" stroke-linecap="round"/>
    <path d="M100 168 Q120 190 140 168Z" fill="#8a3b2e"/><path d="M114 178 q6 10 12 0" fill="#f07c86"/>`,
  none: `<circle cx="120" cy="160" r="14" fill="none" stroke="#2a1d14" stroke-width="3" opacity=".25"/><text x="120" y="166" text-anchor="middle" font-size="18" fill="#2a1d14" opacity=".35">?</text>`,
};

const TONE = {
  mono: (id) => `<filter id="tn${id}"><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncR type="linear" slope="1.25" intercept="-.08"/><feFuncG type="linear" slope="1.25" intercept="-.08"/><feFuncB type="linear" slope="1.25" intercept="-.08"/></feComponentTransfer></filter>`,
  film: (id) => `<filter id="tn${id}"><feColorMatrix type="matrix" values=".95 .25 .05 0 .04  .25 .8 .1 0 .02  .15 .2 .55 0 0  0 0 0 1 0"/>
    <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" result="n"/><feColorMatrix in="n" type="saturate" values="0" result="ng"/>
    <feComponentTransfer in="ng" result="ga"><feFuncA type="linear" slope=".12"/></feComponentTransfer><feComposite in="ga" in2="SourceGraphic" operator="over"/></filter>`,
  cool: (id) => `<filter id="tn${id}"><feColorMatrix type="matrix" values=".55 .1 .2 0 0  .1 .75 .3 0 .02  .2 .3 1.05 0 .06  0 0 0 1 0"/></filter>`,
  cover: (id) => `<filter id="tn${id}"><feColorMatrix type="saturate" values="1.7"/><feComponentTransfer><feFuncR type="linear" slope="1.08"/><feFuncG type="linear" slope="1.08"/><feFuncB type="linear" slope="1.08"/></feComponentTransfer></filter>`,
  none: (id) => `<filter id="tn${id}"><feColorMatrix type="saturate" values=".35"/></filter>`,
};

export const AVATAR_STEPS = ['p_tone', 'p_outfit', 'p_mood', 'p_scene'];

// choices: { p_tone, p_outfit, p_mood, p_scene }（值為選項 id）
export function avatarSVG(choices = {}, { size = 240, label = true } = {}) {
  const id = ++uid;
  const tone = choices.p_tone || 'none', outfit = choices.p_outfit || 'none', mood = choices.p_mood || 'none', scene = choices.p_scene || null;
  const bg = scene ? BG[scene]() : `<rect width="240" height="300" fill="#1a2430"/>${Array.from({ length: 15 }, (_, i) => `<path d="M0 ${i * 20} H240" stroke="#3ff4ff" stroke-opacity=".08"/>`).join('')}`;
  const done = AVATAR_STEPS.filter((k) => choices[k]).length;
  const extra = tone === 'cool' ? `<path d="M64 300 C68 250 84 230 120 226 C156 230 172 250 176 300" fill="none" stroke="#3ff4ff" stroke-width="2.5" opacity=".9"/>
      <circle cx="120" cy="150" r="47" fill="none" stroke="#3ff4ff" stroke-width="2" opacity=".75"/>`
    : tone === 'cover' ? `<text x="14" y="40" font-family="Georgia,serif" font-size="38" font-weight="700" fill="#ff2d55" letter-spacing="2">030</text>
      <text x="16" y="56" font-family="Arial" font-size="8" fill="#fff" letter-spacing="3">THE OBSERVER ISSUE</text>
      <text x="226" y="270" text-anchor="end" font-family="Arial" font-size="9" font-weight="700" fill="#ffe600">NO.1118</text>` : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 300" width="${size}" height="${size * 1.25}">
    <defs>${TONE[tone](id)}<clipPath id="cp${id}"><rect width="240" height="300" rx="10"/></clipPath></defs>
    <g clip-path="url(#cp${id})"><g filter="url(#tn${id})">
      ${bg}
      ${OUTFIT[outfit]()}
      <rect x="108" y="190" width="24" height="32" rx="8" fill="#e9b892"/>
      <ellipse cx="120" cy="150" rx="42" ry="48" fill="#f2c7a1"/>
      <path d="M76 148 C70 98 100 88 120 90 C146 88 172 100 164 150 C160 124 148 112 120 112 C96 112 82 122 76 148Z" fill="#2b1c14"/>
      <ellipse cx="78" cy="154" rx="6" ry="10" fill="#e9b892"/><ellipse cx="162" cy="154" rx="6" ry="10" fill="#e9b892"/>
      ${FACE[mood]}
    </g>${extra}</g>
    ${label ? `<rect x="0" y="272" width="240" height="28" fill="rgba(2,8,16,.72)"/><text x="12" y="290" font-family="monospace" font-size="10" fill="#3ff4ff" letter-spacing="1">ID IMAGE · ${done < 4 ? `CALIBRATING ${done}/4` : 'WRITTEN TO FILE 030'}</text>` : ''}
  </svg>`;
  // 以圖片輸出：只點陣化一次，iOS Safari 捲動或背景動畫時不會反覆重畫濾鏡而閃爍
  return `<img class="avatar-svg" width="${size}" height="${size * 1.25}" alt="觀察員識別影像" decoding="sync" src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}">`;
}

export function choicesFromStats(choices = {}) {
  const out = {};
  for (const k of AVATAR_STEPS) if (choices['choice:' + k]) out[k] = choices['choice:' + k];
  return out;
}
