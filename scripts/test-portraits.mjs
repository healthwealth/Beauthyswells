// Run from the project root: node scripts/test-portraits.mjs
// Test-only dependency: npm install --prefix /tmp/beauthy-dom-tests --ignore-scripts jsdom@26.1.0
// Image and canvas APIs are mocked: these are interaction tests, not pixel or model acceptance.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
const root = process.cwd();
const html = await readFile(path.join(root, 'index.html'), 'utf8');
const source = await readFile(path.join(root, 'script.js'), 'utf8');
const css = await readFile(path.join(root, 'sample-portraits.css'), 'utf8');
const require = createRequire(path.join(process.env.DRESSING_DOM_TEST_ROOT || '/tmp/beauthy-dom-tests', 'package.json'));
const { JSDOM } = require('jsdom');
const dom = new JSDOM(html, { runScripts: 'outside-only', url: 'https://example.test/' });
const { window } = dom;
const doc = window.document;
const get = id => doc.getElementById(id);
const cards = Array.from(doc.querySelectorAll('[data-sample-portrait]'));
const behaviors = new Map();
const draws = [];
let modelImports = 0;
let modelImportBehavior = () => Promise.reject(new Error('Model loading is outside this interaction test.'));
window.__portraitTestImport = () => { modelImports++; return modelImportBehavior(); };
const context = new Proxy({
  drawImage(image) { draws.push(image.src); },
  createRadialGradient() { return { addColorStop() {} }; },
}, { get(target, prop) { return prop in target ? target[prop] : () => {}; } });
window.HTMLCanvasElement.prototype.getContext = () => context;
window.Image = class MockImage extends window.EventTarget {
  constructor() { super(); this.complete = true; this.naturalWidth = 768; this.naturalHeight = 1024; }
  set src(value) { this._src = value; }
  get src() { return this._src; }
  decode() {
    const behavior = behaviors.get(this.src);
    if (behavior) return behavior();
    return Promise.resolve();
  }
};
window.URL.createObjectURL = () => 'blob:test-selfie';
window.URL.revokeObjectURL = () => {};
window.eval(source.replace('import(mediaPipeModuleUrl)', 'window.__portraitTestImport()'));
const tick = () => new Promise(resolve => setImmediate(resolve));
const card = id => cards.find(el => el.dataset.samplePortrait === id);
const imgUrl = id => card(id).querySelector('img').getAttribute('src');
const focusMap = { lip: 'lip', eyes: 'eye', skin: 'cheek', hair: 'hair' };
assert.equal(cards.length, 4);
assert.equal(new Set(cards.map(c => c.querySelector('img').getAttribute('src'))).size, 4);
assert.ok(cards.every(c => c.type === 'button' && c.getAttribute('aria-label')));
assert.match(css, /prefers-reduced-motion/);
assert.match(css, /repeat\(2, minmax\(0, 1fr\)\)/);
assert.match(css, /aria-pressed/);
const ids = Array.from(doc.querySelectorAll('[id]'), n => n.id);
assert.equal(new Set(ids).size, ids.length);
for (const id of Object.keys(focusMap)) {
  const button = card(id);
  button.focus();
  button.click();
  assert.equal(button.getAttribute('aria-busy'), 'true');
  await tick();
  assert.equal(button.getAttribute('aria-busy'), 'false');
  assert.equal(button.getAttribute('aria-pressed'), 'true');
  assert.equal(doc.activeElement, button);
  assert.equal(cards.filter(c => c.getAttribute('aria-pressed') === 'true').length, 1);
  assert.equal(doc.querySelector('[data-makeup-area][aria-pressed="true"]').dataset.makeupArea, focusMap[id]);
  assert.equal(get('makeup-canvas').hidden, false);
  assert.equal(get('makeup-start').disabled, true, 'A sample must not bypass metrics opt-in.');
  assert.equal(draws.at(-1), imgUrl(id));
}
assert.equal(modelImports, 0);
assert.equal(get('makeup-metrics-consent').checked, false);
// Every sample still allows selection of any existing preview area.
get('makeup-hair-size').value = '120';
get('makeup-hair-size').dispatchEvent(new window.Event('input', { bubbles: true }));
card('skin').click(); await tick();
assert.equal(get('makeup-hair-size').value, '100');
assert.match(get('makeup-status').textContent, /does not change your complexion/);
doc.querySelector('[data-makeup-area="hair"]').click();
const bob = Array.from(get('makeup-swatches').querySelectorAll('button')).find(b => b.getAttribute('aria-label') === 'Sleek bob');
bob.click();
assert.equal(get('makeup-compare').disabled, false);
get('makeup-compare').click();
assert.equal(get('makeup-compare').getAttribute('aria-pressed'), 'true');
get('makeup-reset').click();
assert.equal(get('makeup-hair-size').value, '100');
assert.equal(modelImports, 0);
// A slower earlier request must not replace a later sample.
let resolveSlow;
behaviors.set(imgUrl('lip'), () => new Promise(resolve => { resolveSlow = resolve; }));
card('lip').click();
card('eyes').click(); await tick();
resolveSlow(); await tick();
assert.equal(card('eyes').getAttribute('aria-pressed'), 'true');
assert.equal(card('lip').getAttribute('aria-pressed'), 'false');
assert.equal(draws.at(-1), imgUrl('eyes'));
assert.ok(cards.every(c => c.getAttribute('aria-busy') === 'false'));
behaviors.delete(imgUrl('lip'));
// Error feedback permits the original portrait as a fallback.
behaviors.set(imgUrl('skin'), () => Promise.reject(new Error('Unavailable sample')));
card('skin').click(); await tick();
assert.equal(get('makeup-canvas').hidden, true);
assert.ok(cards.every(c => c.getAttribute('aria-pressed') === 'false' && c.getAttribute('aria-busy') === 'false'));
assert.match(get('makeup-status').textContent, /Try the original portrait/);
get('makeup-sample').click(); await tick();
assert.equal(get('makeup-sample').getAttribute('aria-pressed'), 'true');
assert.equal(get('makeup-canvas').hidden, false);
behaviors.delete(imgUrl('skin'));
card('skin').querySelector('img').dispatchEvent(new window.Event('error'));
assert.ok(card('skin').classList.contains('has-image-error'));
card('skin').click(); await tick();
assert.ok(!card('skin').classList.contains('has-image-error'));
assert.equal(card('skin').querySelector('img').loading, 'eager');
// Clearing while a decode is pending must prevent the photo from coming back.
behaviors.set(imgUrl('hair'), () => new Promise(resolve => { resolveSlow = resolve; }));
card('hair').click();
get('makeup-clear').click();
resolveSlow(); await tick();
assert.equal(get('makeup-canvas').hidden, true);
assert.ok(cards.every(c => c.getAttribute('aria-busy') === 'false' && c.getAttribute('aria-pressed') === 'false'));
assert.equal(get('makeup-start').disabled, true);
behaviors.delete(imgUrl('hair'));
// A local selfie still resets the sample selection and never gets uploaded.
const file = new window.File(['sample'], 'selfie.png', { type: 'image/png' });
Object.defineProperty(get('makeup-photo'), 'files', { configurable: true, value: [file] });
get('makeup-photo').dispatchEvent(new window.Event('change', { bubbles: true }));
await tick();
assert.equal(draws.at(-1), 'blob:test-selfie');
assert.ok(cards.every(c => c.getAttribute('aria-pressed') === 'false'));
assert.equal(get('makeup-sample').getAttribute('aria-pressed'), 'false');
assert.equal(modelImports, 0);
assert.equal(window.localStorage.length, 0);
// A stale face-model failure cannot replace a newer sample's ready message.
const consent = get('makeup-metrics-consent');
consent.checked = true;
consent.dispatchEvent(new window.Event('change', { bubbles: true }));
let rejectModel;
modelImportBehavior = () => new Promise((resolve, reject) => { rejectModel = reject; });
get('makeup-start').click();
card('lip').click(); await tick();
let newestStatus = get('makeup-status').textContent;
rejectModel(new Error('Old network failure')); await tick();
assert.equal(get('makeup-status').textContent, newestStatus);
assert.equal(card('lip').getAttribute('aria-pressed'), 'true');
// Clearing during model loading preserves the clear-photo state and feedback.
get('makeup-start').click();
get('makeup-clear').click();
newestStatus = get('makeup-status').textContent;
rejectModel(new Error('Old network failure')); await tick();
assert.equal(get('makeup-status').textContent, newestStatus);
assert.equal(get('makeup-canvas').hidden, true);
// Consent withdrawal also takes priority over a pending failure.
card('eyes').click(); await tick();
get('makeup-start').click();
consent.checked = false;
consent.dispatchEvent(new window.Event('change', { bubbles: true }));
newestStatus = get('makeup-status').textContent;
rejectModel(new Error('Old network failure')); await tick();
assert.equal(get('makeup-status').textContent, newestStatus);
assert.equal(get('makeup-start').disabled, true);
// A model that resolves after BOTH photo replacement and withdrawal must close.
card('hair').click(); await tick();
consent.checked = true;
consent.dispatchEvent(new window.Event('change', { bubbles: true }));
let resolveModel;
let closedModels = 0;
modelImportBehavior = () => new Promise(resolve => { resolveModel = resolve; });
get('makeup-start').click();
card('skin').click(); await tick();
consent.checked = false;
consent.dispatchEvent(new window.Event('change', { bubbles: true }));
newestStatus = get('makeup-status').textContent;
resolveModel({
  FilesetResolver: { forVisionTasks: async () => ({}) },
  FaceLandmarker: { createFromOptions: async () => ({ close() { closedModels++; }, detect() { throw new Error('No detection is allowed after withdrawal.'); } }) },
});
await tick();
assert.equal(closedModels, 1);
assert.equal(get('makeup-status').textContent, newestStatus);
assert.equal(get('makeup-start').disabled, true);
assert.equal(window.localStorage.length, 0);
const shop = await readFile(path.join(root, 'shopify-store.js'), 'utf8');
assert.match(shop, /SHOPPING_ENABLED\s*=\s*false/);
window.close();
console.log('Passed four portrait/area mappings, selected/busy/focus states, sample/clear races, image fallback/retry, selfie support, stale model failures, and consent withdrawal/close guards. Images, canvas and model were mocked.');
