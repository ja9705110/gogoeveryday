// 十枚原創符號（48×48 線條）
export const GLYPHS = {
  1: 'M24 8 a16 16 0 1 0 0.01 0 M30 16 m-3 0 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0',
  2: 'M10 18 Q24 8 38 18 M14 26 Q24 18 34 26 M18 34 Q24 29 30 34',
  3: 'M24 6 L42 24 L24 42 L6 24Z M24 24 L24 42',
  4: 'M24 6 L24 42 M18 12 Q8 24 18 36 M30 12 Q40 24 30 36',
  5: 'M24 42 V20 M24 28 Q14 24 12 13 Q22 15 24 28 M24 22 Q32 18 36 8 Q26 10 24 22',
  6: 'M8 8 H40 V40 H8Z M20 8 L26 18 L19 26 L27 33 L23 40',
  7: 'M12 42 V20 A12 12 0 0 1 36 20 V42 M24 30 L24 42',
  8: 'M24 42 V26 L12 10 M24 26 L36 10 M12 10 h0.01 M36 10 h0.01',
  9: 'M24 8 a16 16 0 1 0 0.01 0',
  10: 'M24 9 a15 15 0 1 0 0.01 0 M24 4 V12 M8 33 L14 29 M40 33 L34 29',
};
export const NAMES = { 1: '起', 2: '聲', 3: '鑰', 4: '鏡', 5: '芽', 6: '裂', 7: '門', 8: '岔', 9: '空', 10: '環' };

export function glyphSVG(id, opts = {}) {
  const d = GLYPHS[id];
  if (!d) return '<svg viewBox="0 0 48 48"></svg>';
  const dash = id === 9 ? ' stroke-dasharray="4 5"' : '';
  return `<svg viewBox="0 0 48 48" aria-label="${NAMES[id] || ''}" style="color:${opts.color || 'currentColor'}"><path class="glyph" d="${d}"${dash}/></svg>`;
}
