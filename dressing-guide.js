/**
 * Subjective clothing ideas, not a colour analysis or a prescription.
 * No personal information, storage, analytics, uploads, or API calls.
 * Photos are unchanged category references, not garment previews or try-ons.
 *
 * DRESSING_OPTIONS lists accepted input keys. buildDressingLook() returns fresh
 * palette/outfit arrays and normalized selections, so callers may safely retain
 * or modify a returned look without changing later results.
 */
export const DRESSING_OPTIONS = Object.freeze({
  audiences: Object.freeze(['women', 'men', 'children']),
  complexions: Object.freeze(['all', 'fair', 'light', 'medium', 'tan', 'deep', 'very-deep']),
  undertones: Object.freeze(['unsure', 'warm', 'cool', 'neutral']),
  occasions: Object.freeze(['everyday', 'smart', 'celebration']),
  paletteIndices: Object.freeze([0, 1, 2]),
});

const LABELS = {
  audience: { women: 'Women', men: 'Men', children: 'Children' },
  complexion: {
    all: 'All complexions', fair: 'Fair', light: 'Light', medium: 'Medium',
    tan: 'Tan', deep: 'Deep', 'very-deep': 'Very deep',
  },
  undertone: { unsure: 'Not sure', warm: 'Warm', cool: 'Cool', neutral: 'Neutral' },
  occasion: { everyday: 'Everyday', smart: 'Smart / work or school', celebration: 'Celebration' },
};

// Roles suggest where to try a colour, not rules about what anyone can wear.
const ROLES = ['Base', 'Layer', 'Accent', 'Finish'];
const PALETTES = {
  warm: [
    { title: 'Earth & rose', colours: [['Oat', '#E4D5BD'], ['Olive', '#6C7451'], ['Rose clay', '#BC7868'], ['Cocoa', '#624638']] },
    { title: 'Honey & plum', colours: [['Cream', '#F3E7D0'], ['Caramel', '#A96F3E'], ['Soft plum', '#805469'], ['Warm charcoal', '#514944']] },
    { title: 'Terracotta garden', colours: [['Sand', '#DCC5A5'], ['Moss', '#697457'], ['Terracotta', '#B75D46'], ['Rosewood', '#744552']] },
  ],
  cool: [
    { title: 'Berry & dusty blue', colours: [['Cream', '#F2EEE5'], ['Dusty blue', '#829EB7'], ['Berry', '#93465F'], ['Slate', '#465667']] },
    { title: 'Plum & mist', colours: [['Pearl cream', '#EEEDE5'], ['Blue mist', '#A4B7CC'], ['Plum', '#71465E'], ['Soft navy', '#35465D']] },
    { title: 'Rose & blue', colours: [['Soft cream', '#F5EFE6'], ['Dusty denim', '#6E8BA8'], ['Cool rose', '#BD8196'], ['Berry plum', '#663F5C']] },
  ],
  neutral: [
    { title: 'Sage & rose', colours: [['Ivory', '#F1E9DC'], ['Sage', '#8D9A83'], ['Rose', '#B47781'], ['Ink', '#37434E']] },
    { title: 'Blue & cinnamon', colours: [['Stone', '#D9D2C5'], ['Dusty blue', '#7D98B0'], ['Cinnamon', '#AC7152'], ['Espresso', '#55433E']] },
    { title: 'Olive & berry', colours: [['Cream', '#F2E8D6'], ['Soft olive', '#80805B'], ['Berry', '#92516B'], ['Charcoal', '#44494B']] },
  ],
};

const OUTFITS = {
  women: {
    everyday: {
      title: 'Easy layers, everyday',
      description: 'A simple top, an easy layer and comfortable shoes make a versatile starting point. Choose a skirt or trousers to suit your day.',
      outfit: [
        { category: 'Start with', pieces: 'Try a cotton tee in the base colour with straight-leg trousers or a relaxed midi skirt.' },
        { category: 'Layer', pieces: 'Add a soft cardigan or an open overshirt in the layer colour; leave it off in warm weather.' },
        { category: 'Finish', pieces: 'Choose secured sneakers or comfortable flats in the finish colour, with an accent-colour tote if useful.' },
      ],
    },
    smart: {
      title: 'A considered workday',
      description: 'A breathable top and a soft jacket bring a composed feel without sacrificing movement. Adapt these pieces to your workplace dress code.',
      outfit: [
        { category: 'Start with', pieces: 'Pair a base-colour blouse or fine-knit top with comfortable tailored trousers or a midi skirt.' },
        { category: 'Layer', pieces: 'Try a softly structured blazer or neat cardigan in the layer colour.' },
        { category: 'Finish', pieces: 'Add cushioned loafers or flats in the finish colour and an accent-colour bag or scarf.' },
      ],
    },
    celebration: {
      title: 'A relaxed celebration',
      description: 'Let one colour be the focal point, with simple layers around it. A dress or separates can both feel thoughtfully put together.',
      outfit: [
        { category: 'Start with', pieces: 'Try an accent-colour simple midi dress, or a base-colour blouse with flowing trousers.' },
        { category: 'Layer', pieces: 'Bring a lightweight cardigan, soft jacket or wrap in the layer colour for cooler moments.' },
        { category: 'Finish', pieces: 'Choose comfortable flats or loafers and a small bag in the finish colour; keep details as simple as you like.' },
      ],
    },
  },
  men: {
    everyday: {
      title: 'An easy everyday uniform',
      description: 'Start with comfortable basics and add an open layer for variety. The palette can appear in small details or larger pieces.',
      outfit: [
        { category: 'Start with', pieces: 'Pair a base-colour cotton tee with relaxed chinos or straight-leg jeans.' },
        { category: 'Layer', pieces: 'Add an open overshirt or light cardigan in the layer colour when the weather calls for it.' },
        { category: 'Finish', pieces: 'Choose comfortable sneakers in the finish colour; try an accent-colour cap or everyday bag if useful.' },
      ],
    },
    smart: {
      title: 'Smart, with room to move',
      description: 'A crisp shirt and a flexible layer make a versatile workday combination. Keep the level of formality suited to your workplace.',
      outfit: [
        { category: 'Start with', pieces: 'Choose a base-colour Oxford shirt or fine-knit polo with comfortable tailored trousers.' },
        { category: 'Layer', pieces: 'Try an unstructured blazer or neat cardigan in the layer colour, following your workplace dress code.' },
        { category: 'Finish', pieces: 'Add cushioned loafers or clean sneakers where appropriate, with an accent-colour pocket square or bag if wanted.' },
      ],
    },
    celebration: {
      title: 'Simple occasion dressing',
      description: 'A considered shirt, an easy jacket and comfortable footwear create an adaptable celebration look. Check the invitation for any dress code.',
      outfit: [
        { category: 'Start with', pieces: 'Pair a base-colour cotton or linen-blend shirt with tailored trousers; try the accent colour for the shirt if you prefer.' },
        { category: 'Layer', pieces: 'Add a soft blazer or lightweight jacket in the layer colour, suited to the venue and weather.' },
        { category: 'Finish', pieces: 'Choose cushioned loafers or smart lace-up shoes in the finish colour and an optional accent-colour pocket square.' },
      ],
    },
  },
  children: {
    everyday: {
      title: 'Ready for a school-age day',
      description: 'Soft, washable layers keep the focus on play and easy movement. Let the child choose favourite colours from any palette.',
      outfit: [
        { category: 'Start with', pieces: 'Try a base-colour cotton tee with soft trousers, or a simple cotton play dress.' },
        { category: 'Layer', pieces: 'Add a washable cardigan or soft zip-up layer in the layer colour for changing weather.' },
        { category: 'Finish', pieces: 'Use secured sneakers with grippy soles in the finish colour; an accent-colour backpack can carry essentials.' },
      ],
    },
    smart: {
      title: 'Comfortable school-day layers',
      description: 'A neat, soft outfit can still allow plenty of movement. Follow the school dress code before using these palette ideas.',
      outfit: [
        { category: 'Start with', pieces: 'Choose a soft school polo with comfortable chinos, or a cotton polo and easy pinafore, in permitted colours.' },
        { category: 'Layer', pieces: 'Add a comfortable cardigan in a school-approved layer colour, with easy fastenings.' },
        { category: 'Finish', pieces: 'Choose secured sneakers permitted by the school; use the accent colour on a backpack only if allowed.' },
      ],
    },
    celebration: {
      title: 'A celebration made for comfort',
      description: 'Keep occasion clothes simple, soft and easy to wear. Favourite colours can make the day feel special without elaborate styling.',
      outfit: [
        { category: 'Start with', pieces: 'Try a comfortable cotton shirt with soft trousers, or a simple cotton dress, in the base or accent colour.' },
        { category: 'Layer', pieces: 'Bring a soft cardigan in the layer colour, with easy fastenings and room to move.' },
        { category: 'Finish', pieces: 'Choose comfortable secured flats or sneakers with grippy soles in the finish colour.' },
      ],
    },
  },
};

const COMFORT = {
  women: 'Choose breathable fabrics and a comfortable fit that lets you sit, reach and walk easily. These pieces are adaptable ideas, not gender rules.',
  men: 'Choose breathable fabrics, easy shoulder movement and shoes you can walk in comfortably. These pieces are adaptable ideas, not gender rules.',
  children: 'Prioritise soft washable fabrics, room for play, easy fastenings and secured shoes. Check comfort with the child rather than appearance alone.',
};

const CONTRAST = {
  all: 'For any complexion, try nearby shades for a tonal look or a light-and-dark pairing for stronger contrast. Both are equally welcome.',
  fair: 'For a fair complexion, nearby shades can make a tonal look, while a deeper layer can add stronger contrast. Choose whichever feels enjoyable.',
  light: 'For a light complexion, try a soft tonal mix or a deeper accent for stronger contrast. There is no required or off-limits colour.',
  medium: 'For a medium complexion, try related shades for a tonal look or pair a light base with a deeper layer for stronger contrast. Either is a good option.',
  tan: 'For a tan complexion, a tonal earth or rose mix is one option; a cream-and-ink pairing offers stronger contrast. Follow your own preference.',
  deep: 'For a deep complexion, deeper related shades can make a tonal look, while a light layer offers stronger contrast. Both are equally worth exploring.',
  'very-deep': 'For a very deep complexion, deep related shades can make a tonal look, or a cream accent can add stronger contrast. Choose the mood you prefer.',
};

const CHILD_NOTE = 'For school-age children: keep choices child-led, practical and age-appropriate. No makeup or jewellery is needed; follow school and activity dress codes. No child identity is collected.';
const PHOTO_ROOT = '/manus-storage/async-images/pIlNLZ7IgAaTQTX0Hl8hg1';
const PHOTOS = {
  women: { src: `${PHOTO_ROOT}/image-1.webp`, alt: "AI-generated category reference photograph for women's outfit ideas; the photo stays unchanged as palettes and pieces change." },
  men: { src: `${PHOTO_ROOT}/image-2.webp`, alt: "AI-generated category reference photograph for men's outfit ideas; the photo stays unchanged as palettes and pieces change." },
  children: { src: `${PHOTO_ROOT}/image-3.webp`, alt: "AI-generated category reference photograph for school-age children's clothing ideas; the photo stays unchanged as palettes and pieces change." },
};

function normalizeKey(value, allowed, fallback) {
  const key = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return allowed.includes(key) ? key : fallback;
}

/**
 * @param {object} [options]
 * @returns {{audience: string, complexion: string, undertone: string,
 * occasion: string, paletteIndex: number, paletteFamily: string,
 * selectionSummary: string, summary: string, title: string,
 * description: string, paletteTitle: string, palette: Array,
 * paletteNote: string, outfit: Array, fitNote: string,
 * complexionNote: string, childNote: string, imageSrc: string, imageAlt: string}}
 *
 * Missing/invalid keys become women/all/unsure/everyday. Integer paletteIndex
 * wraps through 0–2 (including negative integers); other values become 0.
 * "unsure" uses the same three mixed palettes as "neutral".
 */
export function buildDressingLook(options = {}) {
  const input = options && typeof options === 'object' ? options : {};
  const audience = normalizeKey(input.audience, DRESSING_OPTIONS.audiences, 'women');
  const complexion = normalizeKey(input.complexion, DRESSING_OPTIONS.complexions, 'all');
  const undertone = normalizeKey(input.undertone, DRESSING_OPTIONS.undertones, 'unsure');
  const occasion = normalizeKey(input.occasion, DRESSING_OPTIONS.occasions, 'everyday');
  const paletteIndex = Number.isInteger(input.paletteIndex) ? ((input.paletteIndex % 3) + 3) % 3 : 0;
  const paletteFamily = undertone === 'unsure' ? 'neutral' : undertone;
  const palette = PALETTES[paletteFamily][paletteIndex];
  const outfit = OUTFITS[audience][occasion];
  const selectionSummary = `${LABELS.audience[audience]} · ${LABELS.occasion[occasion]} · ${LABELS.complexion[complexion]} · Undertone: ${LABELS.undertone[undertone]}`;
  const paletteIntro = undertone === 'unsure'
    ? 'Not sure about undertone? Start with this mixed palette and experiment with colours you enjoy.'
    : `This ${undertone} palette is a starting idea, not a rule or an assessment of your skin.`;

  return {
    audience, complexion, undertone, occasion, paletteIndex, paletteFamily,
    selectionSummary,
    summary: `${selectionSummary} · Palette ${paletteIndex + 1} of 3: ${palette.title}`,
    title: outfit.title,
    description: outfit.description,
    paletteTitle: palette.title,
    palette: palette.colours.map(([name, hex], index) => ({ name, hex, role: ROLES[index] })),
    paletteNote: `${paletteIntro} Every skin tone can wear any colour. Try these colours in any of the suggested roles, or swap them freely.`,
    outfit: outfit.outfit.map((piece) => ({ ...piece })),
    fitNote: COMFORT[audience],
    complexionNote: `${CONTRAST[complexion]} These are optional styling ideas, not a diagnosis or a colour restriction.`,
    childNote: audience === 'children' ? CHILD_NOTE : '',
    imageSrc: PHOTOS[audience].src,
    imageAlt: PHOTOS[audience].alt,
  };
}

function initializeDressingGuide() {
  const form = document.getElementById('dressing-form');
  if (!form) return;

  const get = (id) => document.getElementById(id);
  const nodes = {
    summary: get('dress-summary'), title: get('dress-look-title'),
    description: get('dress-description'), palette: get('dress-palette'),
    paletteNote: get('dress-palette-note'), outfit: get('dress-outfit'),
    fitNote: get('dress-fit-note'), complexionNote: get('dress-complexion-note'),
    childNote: get('dress-child-note'), image: get('dress-image'),
    imageError: get('dress-image-error'), status: get('dress-status'),
    saved: get('dress-saved'), savedEmpty: get('dress-saved-empty'),
    next: get('dress-next'), save: get('dress-save'), reset: get('dress-reset'),
  };
  let paletteIndex = 0;
  let currentLook;
  // Only this module instance retains snapshots; reloading clears them.
  const savedLooks = [];
  const text = (node, value) => { if (node) node.textContent = value; };
  const announce = (message) => text(nodes.status, message);
  if (nodes.status) {
    nodes.status.setAttribute('role', 'status');
    nodes.status.setAttribute('aria-live', 'polite');
    nodes.status.setAttribute('aria-atomic', 'true');
  }

  function readSelections() {
    return {
      audience: form.querySelector('input[name="dress-audience"]:checked')?.value,
      complexion: form.querySelector('#dress-complexion')?.value,
      undertone: form.querySelector('#dress-undertone')?.value,
      occasion: form.querySelector('#dress-occasion')?.value,
      paletteIndex,
    };
  }

  function signature(look) {
    return [look.audience, look.complexion, look.undertone, look.occasion, look.paletteIndex].join('|');
  }

  function isSaved() {
    return savedLooks.some((look) => signature(look) === signature(currentLook));
  }

  function updateSaveButton() {
    if (!nodes.save) return;
    const duplicate = isSaved();
    text(nodes.save, duplicate ? 'Saved' : 'Save this look');
    // aria-disabled preserves focus and allows another activation to announce why.
    nodes.save.disabled = false;
    nodes.save.setAttribute('aria-disabled', String(duplicate));
  }

  function makePaletteItem(colour) {
    const item = document.createElement('li');
    item.className = 'dress-palette-item';
    const swatch = document.createElement('span');
    swatch.className = 'dress-swatch';
    swatch.style.setProperty('--dress-colour', colour.hex);
    swatch.setAttribute('aria-hidden', 'true');
    const name = document.createElement('strong');
    name.textContent = colour.name;
    const role = document.createElement('span');
    role.className = 'dress-palette-role';
    role.textContent = colour.role;
    item.append(swatch, name, document.createTextNode(' '), role);
    return item;
  }

  function photoSucceeded() {
    if (nodes.image) nodes.image.hidden = false;
    if (nodes.imageError) nodes.imageError.hidden = true;
  }

  function photoFailed() {
    if (nodes.image) nodes.image.hidden = true;
    if (nodes.imageError) {
      text(nodes.imageError, 'The category reference photo is unavailable. Your palette and outfit ideas are still ready below.');
      nodes.imageError.hidden = false;
    }
  }

  if (nodes.image) {
    nodes.image.addEventListener('load', photoSucceeded);
    nodes.image.addEventListener('error', photoFailed);
  }

  function renderLook() {
    currentLook = buildDressingLook(readSelections());
    paletteIndex = currentLook.paletteIndex;
    text(nodes.summary, currentLook.summary);
    text(nodes.title, currentLook.title);
    text(nodes.description, currentLook.description);
    text(nodes.paletteNote, currentLook.paletteNote);
    text(nodes.fitNote, currentLook.fitNote);
    text(nodes.complexionNote, currentLook.complexionNote);
    text(nodes.childNote, currentLook.childNote);
    if (nodes.childNote) nodes.childNote.hidden = currentLook.audience !== 'children';
    if (nodes.palette) nodes.palette.replaceChildren(...currentLook.palette.map(makePaletteItem));
    if (nodes.outfit) {
      const items = currentLook.outfit.map((piece) => {
        const item = document.createElement('li');
        const heading = document.createElement('h4');
        heading.textContent = piece.category;
        const paragraph = document.createElement('p');
        paragraph.textContent = piece.pieces;
        item.append(heading, paragraph);
        return item;
      });
      nodes.outfit.replaceChildren(...items);
    }
    if (nodes.image) {
      nodes.image.alt = currentLook.imageAlt;
      // Only the audience changes the reference asset, never the palette or pieces.
      if (nodes.image.getAttribute('src') !== currentLook.imageSrc) {
        // A display:none lazy image may never start loading. Preserve its layout
        // while requesting the new reference; errors still show the fallback.
        nodes.image.hidden = false;
        if (nodes.imageError) nodes.imageError.hidden = true;
        nodes.image.setAttribute('src', currentLook.imageSrc);
      }
      // Covers a cached photo whose load/error occurred before initialization.
      if (nodes.image.complete) {
        if (nodes.image.naturalWidth > 0) photoSucceeded();
        else photoFailed();
      }
    }
    updateSaveButton();
  }

  function renderSaved() {
    if (nodes.savedEmpty) {
      nodes.savedEmpty.hidden = savedLooks.length > 0;
      text(nodes.savedEmpty, 'No saved looks yet. Keep up to three in this visit; reloading clears them.');
    }
    if (!nodes.saved) return;
    const cards = savedLooks.map((look, index) => {
      const card = document.createElement('li');
      card.className = 'dress-saved-card';
      const title = `${LABELS.audience[look.audience]} · ${LABELS.occasion[look.occasion]} · ${look.paletteTitle}`;
      const heading = document.createElement('h4');
      heading.className = 'dress-saved-title';
      heading.textContent = title;
      const summary = document.createElement('p');
      summary.className = 'dress-saved-summary';
      summary.textContent = look.selectionSummary;
      const colours = document.createElement('ul');
      colours.className = 'dress-saved-palette';
      colours.setAttribute('aria-label', `${look.paletteTitle} colours and suggested roles`);
      colours.append(...look.palette.map(makePaletteItem));
      const details = document.createElement('details');
      details.className = 'dress-saved-details';
      const detailsLabel = document.createElement('summary');
      detailsLabel.textContent = 'Outfit details';
      const pieces = document.createElement('ol');
      look.outfit.forEach((piece) => {
        const item = document.createElement('li');
        item.textContent = `${piece.category}: ${piece.pieces}`;
        pieces.append(item);
      });
      details.append(detailsLabel, pieces);
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'dress-saved-remove';
      remove.textContent = 'Remove';
      remove.setAttribute('aria-label', `Remove saved look: ${title}. ${look.selectionSummary}`);
      remove.addEventListener('click', () => {
        savedLooks.splice(index, 1);
        renderSaved();
        updateSaveButton();
        announce(`Removed ${look.paletteTitle}. ${savedLooks.length} of 3 looks saved for this visit.`);
        const remainingButtons = nodes.saved.querySelectorAll('button');
        const focusTarget = remainingButtons[Math.min(index, remainingButtons.length - 1)] || nodes.save || nodes.next;
        if (focusTarget) focusTarget.focus();
      });
      card.append(heading, summary, colours, details, remove);
      return card;
    });
    nodes.saved.replaceChildren(...cards);
  }

  form.addEventListener('submit', (event) => event.preventDefault());
  form.addEventListener('change', (event) => {
    if (!event.target.matches('input[name="dress-audience"], #dress-complexion, #dress-undertone, #dress-occasion')) return;
    paletteIndex = 0;
    renderLook();
    announce(`Look updated. ${currentLook.summary}.${isSaved() ? ' This look is already saved.' : ''}`);
  });

  if (nodes.next) {
    nodes.next.type = 'button';
    nodes.next.addEventListener('click', (event) => {
      event.preventDefault();
      paletteIndex = (paletteIndex + 1) % 3;
      renderLook();
      announce(`Palette ${paletteIndex + 1} of 3: ${currentLook.paletteTitle}.${isSaved() ? ' This look is already saved.' : ''}`);
    });
  }

  if (nodes.save) {
    nodes.save.type = 'button';
    nodes.save.addEventListener('click', (event) => {
      event.preventDefault();
      if (isSaved()) {
        announce('This look is already saved. Change a selection or try the next palette to save another look.');
        return;
      }
      if (savedLooks.length >= 3) {
        announce('Your three saved spaces are full. Remove a saved look first, then save this look.');
        return;
      }
      // Rebuild a fresh snapshot; later selection changes never alter saved looks.
      savedLooks.push(buildDressingLook(currentLook));
      renderSaved();
      updateSaveButton();
      announce(`Saved ${currentLook.paletteTitle}. ${savedLooks.length} of 3 looks saved in memory for this visit; reloading clears them.`);
    });
  }

  form.addEventListener('reset', () => {
    // Native reset values are applied after the reset event. The microtask then
    // ensures the documented defaults even if HTML defaults have been changed.
    queueMicrotask(() => {
      form.querySelectorAll('input[name="dress-audience"]').forEach((radio) => {
        radio.checked = radio.value === 'women';
      });
      [['dress-complexion', 'all'], ['dress-undertone', 'unsure'], ['dress-occasion', 'everyday']].forEach(([id, value]) => {
        const control = form.querySelector(`#${id}`);
        if (control) control.value = value;
      });
      paletteIndex = 0;
      renderLook();
      announce(`Selections reset to Women, All complexions, Not sure and Everyday; palette 1 of 3. Saved looks remain until you remove them or reload. ${savedLooks.length} of 3 saved.`);
    });
  });

  if (nodes.reset) {
    nodes.reset.type = 'button';
    nodes.reset.addEventListener('click', (event) => {
      event.preventDefault();
      form.reset();
    });
  }

  renderLook();
  renderSaved();
  announce('Your look is ready. All colours are welcome on every skin tone. Save up to three looks in memory for this visit.');
}

// Safe to import in Node or a test runner without a DOM. Loading in the head or
// as a deferred module both work; pages without the form have no side effects.
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDressingGuide, { once: true });
  } else {
    initializeDressingGuide();
  }
}
