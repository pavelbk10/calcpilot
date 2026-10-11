import test from 'node:test';
import assert from 'node:assert/strict';
import { accessibilityDefaults, normalizeAccessibility, speechChunks } from '../src/lib/accessibility.mjs';
test('accessibility preferences reject unknown values and clamp valid numeric ranges', () => {
  assert.deepEqual(normalizeAccessibility(null), accessibilityDefaults);
  const result = normalizeAccessibility({ textSize: 999, lineHeight: 0, speechRate: NaN, theme: 'injected', font: 'serif', grayscale: 'true', strongFocus: true });
  assert.equal(result.textSize, 180);
  assert.equal(result.lineHeight, 1.5);
  assert.equal(result.speechRate, 1);
  assert.equal(result.theme, 'default');
  assert.equal(result.font, 'serif');
  assert.equal(result.grayscale, false);
  assert.equal(result.strongFocus, true);
});
test('speech splits content into bounded chunks without dropping words', () => {
  const text = 'A short sentence. '.repeat(70).trim();
  const chunks = speechChunks(text);
  assert.ok(chunks.length > 1);
  assert.ok(chunks.every(chunk => chunk.length <= 220));
  assert.equal(chunks.join(' '), text);
  assert.deepEqual(speechChunks('   '), []);
  assert.ok(speechChunks('a'.repeat(500)).every(chunk => chunk.length <= 220));
});