import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const context = { window: {} };
vm.runInNewContext(readFileSync(resolve(root, 'dist/review-data.js'), 'utf8'), context);
const { items, chapters } = context.window.REVIEW_DATA;
assert.equal(items.length, 65);
assert.equal(chapters.length, 11);
assert.equal(items.reduce((sum, item) => sum + item.copy.length, 0), 295);
assert.equal(new Set(items.map(item => item.id)).size, items.length);
assert.equal(chapters.flatMap(chapter => chapter.items).length, items.length);
for (const item of items) {
  assert(item.title && item.review && item.copy.length);
  assert(chapters.some(chapter => chapter.id === item.chapter && chapter.items.includes(item.id)));
  assert(item.copy.every(block => block.role && block.text));
  for (const suggestion of item.suggestions) assert(suggestion.text && suggestion.reason);
}
const html = readFileSync(resolve(root, 'dist/index.html'), 'utf8');
for (const match of html.matchAll(/(?:src|href)="\.\/([^"]+)"/g)) assert(existsSync(resolve(root, 'dist', match[1])), `Missing asset ${match[1]}`);
assert(html.includes('name="robots" content="noindex,nofollow"'));
const manifest = JSON.parse(readFileSync(resolve(root, '.openai/hosting.json'), 'utf8'));
assert.equal(manifest.static.directory, 'dist');
assert(manifest.project_id);
console.log('Verified 65 review items, 295 text elements, 11 chapters, static assets, and hosting manifest.');
