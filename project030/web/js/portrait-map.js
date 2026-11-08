// 第 1 天「身分建檔」的選項 ↔ 形象照實際方向（遊戲內稱呼 / 真實拍攝說明）
export const PORTRAIT_MAP = {
  p_tone: { label: '攝影風格', game: '識別色調', options: {
    mono: { game: '黑白・永恆', real: '黑白經典' }, film: { game: '暖色・膠片', real: '暖調膠片感' },
    cool: { game: '冷光・未來', real: '冷調時尚／霓虹' }, cover: { game: '高彩・封面', real: '高彩雜誌封面' } } },
  p_outfit: { label: '服裝方向', game: '輪廓', options: {
    formal: { game: '正式', real: '西裝／套裝' }, smart: { game: '俐落', real: '襯衫、簡約剪裁' },
    self: { game: '本色', real: '平常最像自己的穿搭' }, bold: { game: '大膽', real: '一直想嘗試的風格' } } },
  p_mood: { label: '拍攝氛圍', game: '表情模組', options: {
    confident: { game: '自信', real: '自信' }, gentle: { game: '溫柔', real: '溫柔' }, calm: { game: '冷靜', real: '冷靜沉穩' }, playful: { game: '玩心', real: '活潑玩心' } } },
  p_scene: { label: '拍攝場景', game: '背景場域', options: {
    studio: { game: '純色空間', real: '純色背景棚' }, city: { game: '城市街角', real: '城市街景' },
    retro: { game: '復古房間', real: '復古室內' }, light: { game: '光影抽象', real: '光影藝術' } } },
};
export function portraitFromChoices(choices = {}) {
  const out = {};
  for (const [k, def] of Object.entries(PORTRAIT_MAP)) {
    const v = choices['choice:' + k];
    if (v && def.options[v]) out[k] = { id: v, ...def.options[v], label: def.label };
  }
  return out;
}
