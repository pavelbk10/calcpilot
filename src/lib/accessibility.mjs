export const accessibilityDefaults = Object.freeze({
  textSize: 100, lineHeight: 1.75, font: 'default', theme: 'default',
  grayscale: false, underlineLinks: false, highlightHeadings: false,
  strongFocus: false, largeCursor: false, reduceMotion: false,
  hideDecorations: false, readingGuide: false, readingMask: false,
  speechRate: 1,
});
export function normalizeAccessibility(value) {
  const result = { ...accessibilityDefaults };
  if (!value || typeof value !== 'object' || Array.isArray(value)) return result;
  for (const key of Object.keys(result)) {
    if (typeof result[key] === 'boolean' && typeof value[key] === 'boolean') result[key] = value[key];
  }
  for (const [key, min, max] of [['textSize', 100, 180], ['lineHeight', 1.5, 2.5], ['speechRate', .5, 1.5]]) {
    if (typeof value[key] === 'number' && Number.isFinite(value[key])) result[key] = Math.max(min, Math.min(max, value[key]));
  }
  if (['default', 'readable', 'serif', 'mono'].includes(value.font)) result.font = value.font;
  if (['default', 'dark', 'contrast', 'light'].includes(value.theme)) result.theme = value.theme;
  return result;
}
export function speechChunks(text, limit = 220) {
  const words = String(text).replace(/\s+/g, ' ').trim().split(' ');
  const chunks = [];
  let current = '';
  for (const word of words) {
    if (!word) continue;
    if (current && current.length + word.length + 1 > limit) { chunks.push(current); current = ''; }
    if (word.length > limit) {
      if (current) { chunks.push(current); current = ''; }
      for (let offset = 0; offset < word.length; offset += limit) chunks.push(word.slice(offset, offset + limit));
    } else current += (current ? ' ' : '') + word;
  }
  if (current) chunks.push(current);
  return chunks;
}