// 場景繪製：依伺服器回傳的 scene（主題、燈光、道具、NPC、隱藏點）組成畫面
const THEMES = {
  intake: ['#0c1a1f', '#071014'], radio: ['#1a140c', '#0d0a06'], vault: ['#14161b', '#0a0b0e'],
  mirror: ['#10141e', '#080a10'], greenhouse: ['#0d1a10', '#060d07'], fault: ['#1a0e10', '#0b0607'],
  gate: ['#16120c', '#0b0906'], fork: ['#101418', '#08090b'], playback: ['#0c0c14', '#05050a'],
  core: ['#0b1018', '#04060a'], archive: ['#14110c', '#070604'],
};

const P = {
  incubator: `<g transform="translate(250 70)"><rect x="0" y="0" width="56" height="96" rx="26" fill="rgba(111,227,210,.08)" stroke="#6fe3d2" stroke-opacity=".6"/>
    <circle cx="28" cy="52" r="7" fill="#6fe3d2" opacity=".8" class="pulse"/><rect x="-4" y="94" width="64" height="14" rx="3" fill="#1d2a33"/></g>`,
  panel: `<g transform="translate(40 60)"><rect width="44" height="62" rx="3" fill="#1b2630" stroke="#3a4b59"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${5 + (i % 3) * 13}" y="${10 + Math.floor(i / 3) * 24}" width="8" height="16" rx="2" fill="#3a4b59"/>`).join('')}</g>`,
  terminal: `<g transform="translate(140 110)"><rect width="70" height="44" rx="3" fill="#0b1513" stroke="#2c4a44"/><rect x="6" y="6" width="58" height="26" fill="#08221d"/>
    <text x="10" y="23" font-family="monospace" font-size="9" fill="#6fe3d2">030_</text><rect x="20" y="44" width="30" height="8" fill="#1d2a33"/></g>`,
  clock: `<g transform="translate(176 46)"><circle r="18" fill="#e9e1cf" stroke="#3a3328" stroke-width="2"/><path d="M0 0 L-9 -5 M0 0 L0 15" stroke="#222" stroke-width="2"/></g>`,
  desk: `<g transform="translate(30 150)"><rect width="110" height="10" fill="#2b2219"/><rect x="6" y="10" width="6" height="40" fill="#2b2219"/><rect x="98" y="10" width="6" height="40" fill="#2b2219"/></g>`,
  radio: `<g transform="translate(140 100)"><rect width="90" height="52" rx="6" fill="#3b2a1a" stroke="#6a4e30"/><circle cx="22" cy="26" r="13" fill="#1c140c" stroke="#a07c4c"/>
    <rect x="44" y="12" width="38" height="10" fill="#e9d7b0" opacity=".8"/><circle cx="62" cy="38" r="6" fill="#1c140c" stroke="#a07c4c"/></g>`,
  antenna: `<path d="M210 100 L240 40 M240 40 l-6 0 l12 0" stroke="#8b7a5c" stroke-width="2" fill="none"/>`,
  window: `<g transform="translate(40 40)"><rect width="60" height="70" fill="#0d1a2a" stroke="#4a5966"/><path d="M30 0 V70 M0 35 H60" stroke="#4a5966"/><circle cx="44" cy="18" r="5" fill="#e9e1cf" opacity=".6"/></g>`,
  safe: `<g transform="translate(140 80)"><rect width="80" height="80" rx="4" fill="#2a2f38" stroke="#5a6472"/><circle cx="40" cy="40" r="16" fill="#1a1d22" stroke="#8792a0" stroke-width="2"/>
    <path d="M40 24 V30" stroke="#f2b84b" stroke-width="2"/></g>`,
  safe_open: `<g transform="translate(140 80)"><rect width="80" height="80" rx="4" fill="#0c0d10" stroke="#5a6472"/><path d="M80 0 L104 10 L104 90 L80 80Z" fill="#2a2f38" stroke="#5a6472"/>
    <path d="M30 40 h20 v4 h-6 v4 h-4 v-4 h-10z" fill="none" stroke="#8792a0" stroke-dasharray="2 2"/></g>`,
  shelf: `<g transform="translate(250 60)"><rect width="70" height="6" fill="#3a3328"/><rect y="40" width="70" height="6" fill="#3a3328"/><rect x="6" y="-20" width="12" height="20" fill="#5a4a36"/><rect x="40" y="22" width="20" height="18" fill="#4a3d2c"/></g>`,
  mirror: `<g transform="translate(130 30)"><rect width="100" height="150" rx="50" fill="#1b2433" stroke="#9fb3c8" stroke-width="2"/><path d="M20 30 L40 120" stroke="#fff" stroke-opacity=".12" stroke-width="10"/>
    <circle cx="70" cy="40" r="6" fill="#f2b84b" opacity=".9"/></g>`,
  mirror_cracked: `<g transform="translate(130 30)"><rect width="100" height="150" rx="50" fill="#1b2433" stroke="#9fb3c8" stroke-width="2"/>
    <path d="M50 0 L44 50 L60 80 L40 110 L52 150 M44 50 L20 60 M60 80 L90 74" stroke="#cfe" stroke-width="1.5" fill="none"/><circle cx="70" cy="40" r="6" fill="#f2b84b" opacity=".6"/></g>`,
  mirror2: `<g transform="translate(40 50)"><rect width="50" height="110" rx="25" fill="#141b26" stroke="#5a6b80"/></g><g transform="translate(270 50)"><rect width="50" height="110" rx="25" fill="#141b26" stroke="#5a6b80"/></g>`,
  lamp: `<g transform="translate(180 0)"><path d="M0 0 V20" stroke="#555"/><path d="M-12 20 h24 l-6 10 h-12z" fill="#3a3328"/><circle cy="32" r="5" fill="#f2b84b" class="lampglow"/></g>`,
  shards: `<g fill="#9fb3c8" fill-opacity=".25" stroke="#cfe" stroke-opacity=".5">
    <path d="M90 170 l30 -20 l10 28z"/><path d="M160 180 l26 -30 l20 34z"/><path d="M230 168 l18 -14 l24 22z"/><path d="M120 196 l40 -6 l-12 18z"/><path d="M200 200 l34 -8 l6 14z"/></g>`,
  plants: `<g>${[60, 120, 180, 240, 300].map((x, i) => `<g transform="translate(${x} 170)"><rect x="-14" y="0" width="28" height="22" fill="#5a3a22"/>
    <path d="M0 0 V-${20 + i * 12}" stroke="#4caf6a" stroke-width="3"/><ellipse cx="-8" cy="-${14 + i * 9}" rx="9" ry="4" fill="#4caf6a"/><ellipse cx="8" cy="-${20 + i * 10}" rx="9" ry="4" fill="#5cc47a"/></g>`).join('')}</g>`,
  plants_dry: `<g>${[60, 120, 180, 240, 300].map((x, i) => `<g transform="translate(${x} 170)"><rect x="-14" y="0" width="28" height="22" fill="#4a3322"/>
    <path d="M0 0 Q${i % 2 ? 8 : -8} -14 ${i % 2 ? 14 : -14} -${16 + i * 4}" stroke="#7a6a4a" stroke-width="2" fill="none"/></g>`).join('')}</g>`,
  crack: `<path d="M180 0 L170 40 L190 80 L172 130 L186 180 L176 220" stroke="#ff7a6b" stroke-width="2" fill="none" opacity=".8" class="flicker"/>`,
  crack_wide: `<path d="M180 0 L160 40 L196 80 L164 130 L194 180 L170 220 L190 220 L210 180 L180 130 L214 80 L178 40 L196 0Z" fill="#000" stroke="#ff7a6b" stroke-opacity=".5"/>`,
  gate: `<g transform="translate(130 30)"><path d="M0 170 V60 A50 50 0 0 1 100 60 V170" fill="#1f1810" stroke="#a07c4c" stroke-width="3"/>
    <rect x="38" y="70" width="24" height="32" fill="none" stroke="#f2b84b" stroke-dasharray="3 2"/><circle cx="50" cy="130" r="10" fill="none" stroke="#a07c4c"/></g>`,
  pillars: `<rect x="60" y="20" width="22" height="200" fill="#2b241a"/><rect x="278" y="20" width="22" height="200" fill="#2b241a"/>`,
  wall_slit: `<rect x="0" y="0" width="360" height="220" fill="#1a1510"/><rect x="176" y="40" width="6" height="140" fill="#000" stroke="#f2b84b" stroke-opacity=".4"/>`,
  door_left: `<g transform="translate(60 40)"><rect width="80" height="150" fill="#1d2731" stroke="#6fe3d2" stroke-opacity=".6"/><text x="40" y="30" text-anchor="middle" font-size="14" fill="#6fe3d2">保存</text><circle cx="66" cy="80" r="4" fill="#6fe3d2"/></g>`,
  door_right: `<g transform="translate(220 40)"><rect width="80" height="150" fill="#2a1f1d" stroke="#f2b84b" stroke-opacity=".6"/><text x="40" y="30" text-anchor="middle" font-size="14" fill="#f2b84b">放手</text><circle cx="14" cy="80" r="4" fill="#f2b84b"/></g>`,
  door_mid: `<g transform="translate(155 60)"><rect width="50" height="130" fill="#0a0a0a" stroke="#b79cff" stroke-opacity=".6" stroke-dasharray="4 3"/></g>`,
  relay: `<g transform="translate(160 150)"><rect width="40" height="30" fill="#222" stroke="#666"/>${[0, 1, 2, 3].map((i) => `<rect x="${4 + i * 9}" y="8" width="6" height="14" fill="#555"/>`).join('')}</g>`,
  projector: `<g transform="translate(40 150)"><rect width="50" height="30" rx="4" fill="#2a2a34"/><circle cx="50" cy="15" r="9" fill="#ccd" opacity=".8"/></g>
    <path d="M98 165 L320 40 L320 190Z" fill="#cfe" opacity=".05"/>`,
  screen: `<rect x="200" y="30" width="130" height="150" fill="#d8dbe6" opacity=".14" stroke="#aab"/>`,
  core: `<g transform="translate(180 110)"><circle r="48" fill="none" stroke="#6fe3d2" stroke-opacity=".5"/><circle r="32" fill="none" stroke="#f2b84b" stroke-opacity=".6" stroke-dasharray="6 4"/>
    <circle r="16" fill="#6fe3d2" class="pulse corepulse"/></g>`,
  shelves: `<g fill="#3a3328">${[30, 80, 130, 180].map((y) => `<rect x="20" y="${y}" width="320" height="5"/>`).join('')}</g>`,
};

const NPC = {
  watcher: `<g transform="translate(300 96)" opacity=".85"><circle cx="0" cy="0" r="9" fill="#151a20"/><path d="M-14 74 L-12 14 Q0 6 12 14 L14 74Z" fill="#151a20"/>
    <path d="M-12 14 L-18 50 M12 14 L18 50" stroke="#151a20" stroke-width="5"/><circle cx="3" cy="-1" r="1.4" fill="#f2b84b"/></g>`,
  note: `<g transform="translate(296 120) rotate(6)"><rect width="34" height="40" fill="#e9e1cf"/><path d="M5 10 h24 M5 18 h20 M5 26 h22" stroke="#3a3328"/></g>`,
};

export function renderScene(scene = {}, found = {}, onSpot) {
  const [c1, c2] = THEMES[scene.theme] || THEMES.intake;
  const light = scene.light || 'on';
  const props = (scene.props || []).map((p) => P[p] || '').join('');
  const npc = scene.npc ? NPC[scene.npc] || '' : '';
  const tint = { on: 0, dim: 0.45, off: 0.82, emergency: 0.35, flicker: 0.2 }[light] ?? 0;
  const tintColor = light === 'emergency' ? '120,0,0' : '0,0,0';
  const hidden = scene.hidden_room ? `<rect x="330" y="80" width="22" height="110" fill="#000" stroke="#b79cff" stroke-opacity=".5"/>` : '';
  const wrap = document.createElement('div');
  wrap.className = 'scene';
  wrap.innerHTML = `<svg viewBox="0 0 360 220" class="${light === 'flicker' ? 'flicker' : ''}">
    <defs><radialGradient id="sg" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient></defs>
    <rect width="360" height="220" fill="url(#sg)"/>
    <path d="M0 190 L360 190 M40 220 L90 190 M320 220 L270 190" stroke="#ffffff" stroke-opacity=".06"/>
    ${props}${hidden}${npc}
    <rect width="360" height="220" fill="rgba(${tintColor},${tint})" ${light === 'emergency' ? 'class="pulse"' : ''}/>
    ${light === 'off' ? '<circle cx="180" cy="110" r="70" fill="rgba(255,255,230,.05)"/>' : ''}
  </svg>`;
  if (scene.pulse === 'irregular') wrap.querySelectorAll('.corepulse').forEach((e) => e.classList.add('irregular'));
  for (const h of scene.hotspots || []) {
    const b = document.createElement('button');
    b.className = 'hs' + (found[h.id] ? ' found' : '');
    b.style.left = h.x + '%'; b.style.top = h.y + '%';
    b.setAttribute('aria-label', h.label || '調查');
    b.onclick = () => onSpot && onSpot(h, b);
    wrap.appendChild(b);
  }
  return wrap;
}
