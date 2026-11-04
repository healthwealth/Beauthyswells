// Run from the project root: node scripts/test-dressing.mjs
// DOM checks use a test-only dependency outside the production site:
// npm install --prefix /tmp/beauthy-dom-tests --ignore-scripts jsdom@26.1.0
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

const root = process.cwd();
const source = await readFile(path.join(root, 'dressing-guide.js'), 'utf8');
const html = await readFile(path.join(root, 'index.html'), 'utf8');
const css = await readFile(path.join(root, 'dressing-guide.css'), 'utf8');
const shop = await readFile(path.join(root, 'shopify-store.js'), 'utf8');
const { DRESSING_OPTIONS, buildDressingLook } = await import(
  `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
);
let count = 0;
for (const audience of DRESSING_OPTIONS.audiences) {
  for (const complexion of DRESSING_OPTIONS.complexions) {
    for (const undertone of DRESSING_OPTIONS.undertones) {
      for (const occasion of DRESSING_OPTIONS.occasions) {
        for (const paletteIndex of DRESSING_OPTIONS.paletteIndices) {
          const look = buildDressingLook({ audience, complexion, undertone, occasion, paletteIndex });
          assert.equal(look.audience, audience);
          assert.equal(look.complexion, complexion);
          assert.equal(look.outfit.length, 3);
          assert.equal(look.palette.length, 4);
          assert.ok(look.palette.every(c => /^#[0-9A-F]{6}$/i.test(c.hex) && c.name && c.role));
          assert.ok(look.outfit.every(p => p.category && p.pieces));
          assert.equal(Boolean(look.childNote), audience === 'children');
          assert.match(look.paletteNote, /Every skin tone can wear any colour/);
          count += 1;
        }
      }
    }
  }
}
assert.equal(buildDressingLook(null).audience, 'women');
assert.equal(buildDressingLook({ audience: 'invalid', complexion: 'invalid' }).complexion, 'all');
assert.equal(buildDressingLook({ paletteIndex: -1 }).paletteIndex, 2);
const original = buildDressingLook();
original.palette[0].name = 'changed';
assert.notEqual(buildDressingLook().palette[0].name, 'changed');
assert.match(shop, /SHOPPING_ENABLED\s*=\s*false/);
assert.ok(!source.includes('localStorage') && !source.includes('sessionStorage'));
assert.match(css, /\.dressing-palette \.dress-swatch/);
assert.match(css, /\.dress-saved-palette/);
assert.match(css, /prefers-reduced-motion/);

const domTestRoot = process.env.DRESSING_DOM_TEST_ROOT || '/tmp/beauthy-dom-tests';
const require = createRequire(path.join(domTestRoot, 'package.json'));
let JSDOM;
try { ({ JSDOM } = require('jsdom')); }
catch { throw new Error('Install the test-only jsdom dependency using the command at the top of this file.'); }

function setup() {
  const dom = new JSDOM(html, { runScripts: 'outside-only', url: 'https://example.test/' });
  dom.window.fetch = () => { throw new Error('The dressing guide must not make network requests.'); };
  dom.window.eval(source.replace(/^export\s+/gm, ''));
  dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
  return dom;
}
const dom = setup();
const { window } = dom;
const doc = window.document;
const get = id => doc.getElementById(id);
function change(id, value) {
  get(id).value = value;
  get(id).dispatchEvent(new window.Event('change', { bubbles: true }));
}
function chooseAudience(value) {
  const radio = doc.querySelector(`input[name="dress-audience"][value="${value}"]`);
  radio.checked = true;
  radio.dispatchEvent(new window.Event('change', { bubbles: true }));
}
const ids = Array.from(doc.querySelectorAll('[id]'), el => el.id);
assert.equal(new Set(ids).size, ids.length);
assert.equal(get('dress-palette').children.length, 4);
assert.equal(get('dress-outfit').children.length, 3);
assert.ok(get('dress-child-note').hidden);
const photoSrc = get('dress-image').getAttribute('src');
const palette0 = get('dress-palette').textContent;
get('dress-next').click();
assert.notEqual(get('dress-palette').textContent, palette0);
assert.equal(get('dress-image').getAttribute('src'), photoSrc, 'Palettes must not imply a photo recolour.');

get('dress-save').focus();
get('dress-save').click();
assert.equal(get('dress-saved').children.length, 1);
assert.equal(get('dress-save').getAttribute('aria-disabled'), 'true');
assert.equal(doc.activeElement.id, 'dress-save');
assert.equal(get('dress-saved').querySelectorAll('details ol li').length, 3);
const firstSnapshot = get('dress-saved').textContent;
get('dress-save').click();
assert.equal(get('dress-saved').children.length, 1);
assert.match(get('dress-status').textContent, /already saved/);
for (let i = 0; i < 2; i++) { get('dress-next').click(); get('dress-save').click(); }
assert.equal(get('dress-saved').children.length, 3);
chooseAudience('children');
change('dress-complexion', 'very-deep');
change('dress-undertone', 'warm');
change('dress-occasion', 'celebration');
assert.ok(!get('dress-child-note').hidden);
assert.match(get('dress-complexion-note').textContent, /very deep/);
assert.match(get('dress-description').textContent, /soft/);
assert.match(get('dress-image').getAttribute('src'), /image-3\.webp$/);
assert.ok(get('dress-saved').textContent.includes(firstSnapshot));
get('dress-save').click();
assert.equal(get('dress-saved').children.length, 3);
assert.match(get('dress-status').textContent, /full/);
get('dress-saved').querySelector('button').click();
assert.equal(get('dress-saved').children.length, 2);
assert.equal(doc.activeElement.className, 'dress-saved-remove');
get('dress-save').click();
assert.equal(get('dress-saved').children.length, 3);

get('dress-image').dispatchEvent(new window.Event('error'));
assert.ok(get('dress-image').hidden && !get('dress-image-error').hidden);
get('dress-image').dispatchEvent(new window.Event('load'));
assert.ok(!get('dress-image').hidden && get('dress-image-error').hidden);
get('dress-reset').click();
await new Promise(resolve => queueMicrotask(resolve));
assert.equal(doc.querySelector('input[name="dress-audience"]:checked').value, 'women');
assert.equal(get('dress-complexion').value, 'all');
assert.equal(get('dress-undertone').value, 'unsure');
assert.equal(get('dress-occasion').value, 'everyday');
assert.ok(get('dress-child-note').hidden);
assert.equal(get('dress-saved').children.length, 3);
assert.match(get('dress-status').textContent, /Saved looks remain/);
while (get('dress-saved').children.length) get('dress-saved').querySelector('button').click();
assert.ok(!get('dress-saved-empty').hidden);
assert.equal(doc.activeElement.id, 'dress-save');
const reloaded = setup();
assert.equal(reloaded.window.document.getElementById('dress-saved').children.length, 0);
assert.equal(window.localStorage.length, 0);
reloaded.window.close();
window.close();
console.log(`Passed ${count} outfit combinations, real-markup DOM interactions, snapshot/limit/reset/focus checks, image fallback, and unchanged Coming soon guard.`);
