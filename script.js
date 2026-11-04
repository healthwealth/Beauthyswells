const menuButton = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');

function closeMenu() {
  if (!menuButton || !siteNav) return;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open menu');
  siteNav.classList.remove('is-open');
}

menuButton?.addEventListener('click', () => {
  const willOpen = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(willOpen));
  menuButton.setAttribute('aria-label', willOpen ? 'Close menu' : 'Open menu');
  siteNav?.classList.toggle('is-open', willOpen);
});

siteNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
document.querySelector('#year').textContent = new Date().getFullYear();

const beautyGuides = {
  skin: {
    label: '01 / SKIN BEAUTY',
    title: 'Skin beauty, made simple.',
    description: 'A few thoughtful makeup techniques for a fresh, comfortable finish—adapt each one to your own routine.',
    steps: [
      { title: 'Prep, then pause', text: 'Apply the moisturizer you enjoy and let it settle before makeup, to help your base apply smoothly.' },
      { title: 'Start at the center', text: 'Use a small amount of base and blend outward in light layers, adding only where you want coverage.' },
      { title: 'Soften the edges', text: 'Tap concealer only where you want it, then blend the edges with a clean finger or tool.' }
    ]
  },
  body: {
    label: '02 / BODY BEAUTY',
    title: 'A little care, a little glow.',
    description: 'Easy finishing touches for the moments you want to feel especially polished and lovely in your body.',
    steps: [
      { title: 'Seal in moisture', text: 'After bathing, smooth on a body moisturizer you enjoy while your skin is still slightly damp.' },
      { title: 'Choose where to glow', text: 'For a dressed-up sheen, tap a little highlight or shimmer on shoulders, collarbones, or shins.' },
      { title: 'Let the finish settle', text: 'Give lotion or body color a moment to settle before dressing; follow the product directions.' }
    ]
  },
  style: {
    label: '03 / ELEGANT DRESSING',
    title: 'Dress with a little intention.',
    description: 'Simple styling choices that make an outfit feel considered, comfortable, and completely your own.',
    steps: [
      { title: 'Lead with one focal piece', text: 'Choose a color, texture, or accessory to anchor your outfit; let the other pieces support it.' },
      { title: 'Balance your proportions', text: 'Pair a relaxed silhouette with a more structured detail, choosing shapes that feel comfortable in motion.' },
      { title: 'Polish the final details', text: 'Check the fall of hems and collars, tidy your shoes, and add one personal finishing touch.' }
    ]
  },
  hair: {
    label: '04 / HAIR FOR YOUR FACE',
    title: 'A hairstyle that frames you.',
    description: 'Simple ways to choose and shape a hairstyle around your face—then preview a few looks in the virtual studio below.',
    steps: [
      { title: 'Find your face’s best frame', text: 'Pull your hair back in a mirror and notice your forehead, cheekbones, and jaw; choose a length that highlights the feature you love most.' },
      { title: 'Balance with shape', text: 'Soft waves or curls add width and softness; sleek, longer lines add length. Side parts and face-framing pieces gently open up the face.' },
      { title: 'Try it before you change it', text: 'Preview a bob, waves, curls, or an updo on your own selfie in the virtual studio, then take the look you like to your stylist.' }
    ]
  }
};

const beautyTablist = document.querySelector('.beauty-tabs');
const beautyTabs = Array.from(document.querySelectorAll('[data-beauty-focus]'));
const beautyPanel = document.querySelector('#beauty-guide-panel');

if (beautyTablist && beautyTabs.length && beautyPanel) {
  const categoryLabel = document.querySelector('#beauty-guide-category');
  const guideTitle = document.querySelector('#beauty-guide-title');
  const guideDescription = document.querySelector('#beauty-guide-description');
  const guideSteps = document.querySelector('#beauty-guide-steps');
  const progressBar = document.querySelector('#beauty-guide-progress');
  const progressFill = document.querySelector('#beauty-guide-progress-fill');
  const progressCopy = document.querySelector('#beauty-guide-progress-copy');
  const resetButton = document.querySelector('#beauty-guide-reset');
  const completedByFocus = {
    skin: new Set(),
    body: new Set(),
    style: new Set(),
    hair: new Set()
  };
  let activeBeautyFocus = 'skin';

  function updateBeautyProgress() {
    const total = beautyGuides[activeBeautyFocus].steps.length;
    const completed = completedByFocus[activeBeautyFocus].size;
    const status = `${completed} of ${total} skills tried`;
    progressCopy.textContent = status;
    progressBar.setAttribute('aria-valuenow', String(completed));
    progressBar.setAttribute('aria-valuetext', status);
    progressBar.setAttribute('aria-label', `${beautyGuides[activeBeautyFocus].label} progress`);
    progressFill.style.width = `${(completed / total) * 100}%`;
    resetButton.disabled = completed === 0;
  }

  function createBeautyStep(step, index) {
    const isComplete = completedByFocus[activeBeautyFocus].has(index);
    const item = document.createElement('li');
    item.className = 'beauty-step';

    const number = document.createElement('span');
    number.className = 'beauty-step__number';
    number.textContent = String(index + 1).padStart(2, '0');

    const copy = document.createElement('div');
    copy.className = 'beauty-step__copy';
    const heading = document.createElement('h4');
    heading.textContent = step.title;
    const description = document.createElement('p');
    description.textContent = step.text;
    copy.append(heading, description);

    const toggle = document.createElement('button');
    toggle.className = 'beauty-step__toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-pressed', String(isComplete));
    toggle.setAttribute('aria-label', `${isComplete ? 'Unmark' : 'Mark'} ${step.title} ${isComplete ? 'as not tried' : 'as tried'}`);
    const actionText = document.createElement('span');
    actionText.textContent = isComplete ? 'Done' : 'Try it';
    const symbol = document.createElement('span');
    symbol.setAttribute('aria-hidden', 'true');
    symbol.textContent = isComplete ? '✓' : '＋';
    toggle.append(actionText, symbol);

    toggle.addEventListener('click', () => {
      const completed = completedByFocus[activeBeautyFocus];
      const isNowComplete = !completed.has(index);
      if (isNowComplete) completed.add(index);
      else completed.delete(index);
      toggle.setAttribute('aria-pressed', String(isNowComplete));
      toggle.setAttribute('aria-label', `${isNowComplete ? 'Unmark' : 'Mark'} ${step.title} ${isNowComplete ? 'as not tried' : 'as tried'}`);
      actionText.textContent = isNowComplete ? 'Done' : 'Try it';
      symbol.textContent = isNowComplete ? '✓' : '＋';
      updateBeautyProgress();
    });

    item.append(number, copy, toggle);
    return item;
  }

  function renderBeautyGuide(focus) {
    const guide = beautyGuides[focus];
    if (!guide) return;
    activeBeautyFocus = focus;
    const activeTab = beautyTabs.find((tab) => tab.dataset.beautyFocus === focus);

    beautyTabs.forEach((tab) => {
      const selected = tab === activeTab;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    beautyPanel.setAttribute('aria-labelledby', activeTab.id);
    categoryLabel.textContent = guide.label;
    guideTitle.textContent = guide.title;
    guideDescription.textContent = guide.description;
    guideSteps.replaceChildren(...guide.steps.map(createBeautyStep));
    updateBeautyProgress();
  }

  beautyTabs.forEach((tab) => tab.addEventListener('click', () => {
    renderBeautyGuide(tab.dataset.beautyFocus);
  }));

  beautyTablist.addEventListener('keydown', (event) => {
    const current = beautyTabs.indexOf(event.target.closest('[data-beauty-focus]'));
    if (current < 0) return;

    let next = current;
    if (event.key === 'ArrowRight') next = (current + 1) % beautyTabs.length;
    else if (event.key === 'ArrowLeft') next = (current - 1 + beautyTabs.length) % beautyTabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = beautyTabs.length - 1;
    else return;

    event.preventDefault();
    const nextTab = beautyTabs[next];
    renderBeautyGuide(nextTab.dataset.beautyFocus);
    nextTab.focus();
  });

  resetButton.addEventListener('click', () => {
    completedByFocus[activeBeautyFocus].clear();
    renderBeautyGuide(activeBeautyFocus);
  });

  renderBeautyGuide(activeBeautyFocus);
}

const ritualBuilder = document.querySelector('#ritual-builder');

if (ritualBuilder) {
  const ritualForm = ritualBuilder.querySelector('#ritual-form');
  const focusInputs = Array.from(ritualBuilder.querySelectorAll('[name="ritual-focus"]'));
  const buildButton = ritualBuilder.querySelector('#ritual-build');
  const builderStatus = ritualBuilder.querySelector('#ritual-builder-status');
  const emptyMessage = ritualBuilder.querySelector('#ritual-result-empty');
  const resultContent = ritualBuilder.querySelector('#ritual-result-content');
  const resultSteps = ritualBuilder.querySelector('#ritual-result-steps');
  const progressCopy = ritualBuilder.querySelector('#ritual-progress-copy');
  const progressBar = ritualBuilder.querySelector('#ritual-progress');
  const progressFill = ritualBuilder.querySelector('#ritual-progress-fill');
  const resetButton = ritualBuilder.querySelector('#ritual-reset');
  let currentRitual = [];
  const completedRitualSteps = new Set();

  function updateRitualChoices() {
    const selected = focusInputs.filter((input) => input.checked);
    focusInputs.forEach((input) => input.closest('.ritual-focus-option')?.classList.toggle('is-selected', input.checked));
    buildButton.disabled = selected.length === 0;
    if (selected.length === 0) {
      builderStatus.textContent = 'Choose one or more focuses to begin.';
      return;
    }
    const noun = selected.length === 1 ? 'focus' : 'focuses';
    builderStatus.textContent = `${selected.length} ${noun} selected. Make your ritual whenever you are ready.`;
  }

  function updateRitualProgress() {
    const total = currentRitual.length;
    const complete = completedRitualSteps.size;
    const status = `${complete} of ${total} ${total === 1 ? 'step' : 'steps'} complete`;
    progressCopy.textContent = status;
    progressBar.setAttribute('aria-valuemax', String(total));
    progressBar.setAttribute('aria-valuenow', String(complete));
    progressBar.setAttribute('aria-valuetext', status);
    progressFill.style.width = `${total ? (complete / total) * 100 : 0}%`;
  }

  function renderRitualSteps() {
    resultSteps.replaceChildren();
    currentRitual.forEach((step, index) => {
      const item = document.createElement('li');
      item.className = 'ritual-step';

      const number = document.createElement('span');
      number.className = 'ritual-step__number';
      number.textContent = String(index + 1).padStart(2, '0');

      const copy = document.createElement('div');
      copy.className = 'ritual-step__copy';
      const category = document.createElement('span');
      category.className = 'ritual-step__category';
      category.textContent = step.category;
      const title = document.createElement('h5');
      title.textContent = step.title;
      const description = document.createElement('p');
      description.textContent = step.text;
      copy.append(category, title, description);

      const complete = completedRitualSteps.has(index);
      const toggle = document.createElement('button');
      toggle.className = 'ritual-step__toggle';
      toggle.type = 'button';
      toggle.setAttribute('aria-pressed', String(complete));
      toggle.setAttribute('aria-label', `${complete ? 'Unmark' : 'Mark'} ${step.title} ${complete ? 'as not complete' : 'complete'}`);
      toggle.textContent = complete ? 'Done ✓' : 'Try this';
      toggle.addEventListener('click', () => {
        const isComplete = !completedRitualSteps.has(index);
        if (isComplete) completedRitualSteps.add(index);
        else completedRitualSteps.delete(index);
        toggle.setAttribute('aria-pressed', String(isComplete));
        toggle.setAttribute('aria-label', `${isComplete ? 'Unmark' : 'Mark'} ${step.title} ${isComplete ? 'as not complete' : 'complete'}`);
        toggle.textContent = isComplete ? 'Done ✓' : 'Try this';
        item.classList.toggle('is-complete', isComplete);
        updateRitualProgress();
      });

      item.append(number, copy, toggle);
      resultSteps.append(item);
    });
  }

  ritualForm.addEventListener('change', updateRitualChoices);
  ritualForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const focuses = focusInputs.filter((input) => input.checked).map((input) => input.value);
    if (!focuses.length) return;

    const size = Number(ritualBuilder.querySelector('[name="ritual-size"]:checked')?.value || 1);
    const usedSteps = new Map(focuses.map((focus) => [focus, 0]));
    currentRitual = Array.from({ length: Math.min(3, Math.max(1, size)) }, (_, index) => {
      const focus = focuses[index % focuses.length];
      const guide = beautyGuides[focus];
      const stepIndex = usedSteps.get(focus) || 0;
      usedSteps.set(focus, stepIndex + 1);
      const source = guide.steps[stepIndex % guide.steps.length];
      return { category: guide.label.replace(/^\d+\s*\/\s*/, ''), ...source };
    });

    completedRitualSteps.clear();
    emptyMessage.hidden = true;
    resultContent.hidden = false;
    renderRitualSteps();
    updateRitualProgress();
    builderStatus.textContent = `Your ${currentRitual.length}-step ritual is ready. Mark each idea as you try it.`;
  });

  resetButton.addEventListener('click', () => {
    currentRitual = [];
    completedRitualSteps.clear();
    focusInputs.forEach((input) => {
      input.checked = false;
      input.closest('.ritual-focus-option')?.classList.remove('is-selected');
    });
    emptyMessage.hidden = false;
    resultContent.hidden = true;
    resultSteps.replaceChildren();
    updateRitualChoices();
    resetButton.blur();
    builderStatus.textContent = 'Your ritual is clear. Choose a focus whenever you are ready.';
    focusInputs[0]?.focus();
  });

  updateRitualChoices();
}

const makeupStudio = document.querySelector('#makeup-tryon');

if (makeupStudio) {
  const makeupCanvas = makeupStudio.querySelector('#makeup-canvas');
  const makeupContext = makeupCanvas.getContext('2d');
  const makeupPlaceholder = makeupStudio.querySelector('#makeup-placeholder');
  const makeupPhotoInput = makeupStudio.querySelector('#makeup-photo');
  const makeupSampleButton = makeupStudio.querySelector('#makeup-sample');
  const makeupSampleCards = Array.from(makeupStudio.querySelectorAll('[data-sample-portrait]'));
  const makeupClearButton = makeupStudio.querySelector('#makeup-clear');
  const makeupStatus = makeupStudio.querySelector('#makeup-status');
  const makeupConsent = makeupStudio.querySelector('#makeup-metrics-consent');
  const makeupStartButton = makeupStudio.querySelector('#makeup-start');
  const makeupAreaButtons = Array.from(makeupStudio.querySelectorAll('[data-makeup-area]'));
  const makeupSwatches = makeupStudio.querySelector('#makeup-swatches');
  const makeupShadeLabel = makeupStudio.querySelector('#makeup-shade-label');
  const makeupIntensity = makeupStudio.querySelector('#makeup-intensity');
  const makeupIntensityValue = makeupStudio.querySelector('#makeup-intensity-value');
  const makeupCompareButton = makeupStudio.querySelector('#makeup-compare');
  const makeupResetButton = makeupStudio.querySelector('#makeup-reset');
  const maximumPhotoBytes = 12 * 1024 * 1024;
  const maximumCanvasDimension = 1400;
  const mediaPipeModuleUrl = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.1/vision_bundle.mjs';
  const mediaPipeWasmUrl = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.1/wasm';
  const faceLandmarkerModelUrl = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
  const samplePortraitUrl = '/manus-storage/async-images/3Ow18FyHR0jI7cuoIJ9Yqw/image-1.webp';
  const samplePortraits = [
    { id: 'lip', label: 'Lip colour sample', area: 'lip', url: '/manus-storage/async-images/IYcji4lW7hEXqeKTK1rU98/image-1.webp' },
    { id: 'eyes', label: 'Eye colour sample', area: 'eye', url: '/manus-storage/async-images/IYcji4lW7hEXqeKTK1rU98/image-2.webp' },
    { id: 'skin', label: 'Skin and cheek colour sample', area: 'cheek', url: '/manus-storage/async-images/IYcji4lW7hEXqeKTK1rU98/image-3.webp' },
    { id: 'hair', label: 'Hairstyle sample', area: 'hair', url: '/manus-storage/async-images/IYcji4lW7hEXqeKTK1rU98/image-4.webp' }
  ];
  // Each hairstyle overlay is a transparent image with an empty face opening.
  // `face` describes that opening as fractions of the image: its horizontal
  // center, width, and the y position of its hairline (top of the opening).
  const hairStyles = [
    { name: 'No hairstyle', url: '', face: null },
    { name: 'Sleek bob', url: '/manus-storage/async-images/4C6EJjW99YaTLDybFqAKFl/image-1.webp', face: { cx: .513, width: .39, top: .293 } },
    { name: 'Long waves', url: '/manus-storage/async-images/4C6EJjW99YaTLDybFqAKFl/image-2.webp', face: { cx: .503, width: .31, top: .127 } },
    { name: 'Soft curls', url: '/manus-storage/async-images/4C6EJjW99YaTLDybFqAKFl/image-3.webp', face: { cx: .51, width: .31, top: .26 } },
    { name: 'Elegant updo', url: '/manus-storage/async-images/4C6EJjW99YaTLDybFqAKFl/image-4.webp', face: { cx: .5, width: .44, top: .37 } }
  ];
  const hairImages = new Map();
  const makeupPalettes = {
    lip: {
      label: 'Choose a lip shade',
      name: 'lip color',
      shades: [
        { name: 'Rose', color: '#b85d77' },
        { name: 'Petal', color: '#d88391' },
        { name: 'Berry', color: '#8e174f' },
        { name: 'Plum', color: '#66354f' }
      ]
    },
    cheek: {
      label: 'Choose a cheek shade',
      name: 'cheek color',
      shades: [
        { name: 'Petal', color: '#dc8593' },
        { name: 'Peach', color: '#e79a7e' },
        { name: 'Rose', color: '#c95d77' },
        { name: 'Berry', color: '#a63d64' }
      ]
    },
    eye: {
      label: 'Choose an eye shade',
      name: 'eye color',
      shades: [
        { name: 'Rose taupe', color: '#a7777f' },
        { name: 'Soft plum', color: '#875269' },
        { name: 'Cocoa', color: '#795a50' },
        { name: 'Berry', color: '#753852' }
      ]
    },
    hair: {
      label: 'Choose a hairstyle',
      name: 'hairstyle',
      shades: hairStyles
    }
  };
  const initialShades = Object.fromEntries(
    Object.entries(makeupPalettes).map(([area, palette]) => [area, palette.shades[0]])
  );
  const lipOuterContour = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146];
  const lipInnerContour = [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95];
  let activeMakeupArea = 'lip';
  let selectedShades = { ...initialShades };
  let currentPhoto = null;
  let photoObjectUrl = null;
  let faceLandmarks = null;
  let faceLandmarker = null;
  let faceLandmarkerPromise = null;
  let makeupIntensityLevel = Number(makeupIntensity.value) / 100;
  let showingOriginal = false;
  let isLoadingMakeup = false;
  let photoRevision = 0;
  let consentRevision = 0;
  const makeupHairFit = makeupStudio.querySelector('#makeup-hair-fit');
  const makeupIntensityGroup = makeupStudio.querySelector('#makeup-intensity-group');
  const makeupHairSize = makeupStudio.querySelector('#makeup-hair-size');
  const makeupHairSizeValue = makeupStudio.querySelector('#makeup-hair-size-value');
  const makeupHairLift = makeupStudio.querySelector('#makeup-hair-lift');
  const makeupHairLiftValue = makeupStudio.querySelector('#makeup-hair-lift-value');
  const makeupHairShift = makeupStudio.querySelector('#makeup-hair-shift');
  const makeupHairShiftValue = makeupStudio.querySelector('#makeup-hair-shift-value');
  let hairSizeLevel = 1;
  let hairLiftLevel = 0;
  let hairShiftLevel = 0;
  // Extra placement from dragging the hairstyle on the portrait, in canvas pixels.
  let hairDrag = { x: 0, y: 0 };
  let hairDragStart = null;
  let usingSamplePortrait = false;
  let selectedSamplePortraitId = null;
  let loadingSamplePortraitId = null;
  // Key face points for the sample portrait (measured once with the on-device model),
  // so hairstyles fit it immediately, even before the visitor opts in.
  const samplePortraitFacePoints = {
    10: { x: .72, y: .1567 },
    152: { x: .7782, y: .4248 },
    234: { x: .6646, y: .3393 },
    454: { x: .8678, y: .2482 },
    33: { x: .6754, y: .2767 },
    263: { x: .8122, y: .2158 }
  };

  function hasHairstyle() {
    return Boolean(selectedShades.hair?.face);
  }

  function loadHairImage(style) {
    if (!style.url) return null;
    if (!hairImages.has(style.url)) {
      const image = new Image();
      image.decoding = 'async';
      image.addEventListener('load', () => {
        if (selectedShades.hair === style) drawMakeupOverlay();
      });
      image.src = style.url;
      hairImages.set(style.url, image);
    }
    const image = hairImages.get(style.url);
    return image.complete && image.naturalWidth ? image : null;
  }

  // Where the face sits on the portrait: from detected landmarks when available,
  // otherwise a centered estimate that visitors can drag and resize.
  function hairFaceGeometry() {
    const width = makeupCanvas.width;
    const height = makeupCanvas.height;
    const hasLandmarks = faceLandmarks && faceLandmarks.length >= 468;
    const points = hasLandmarks ? faceLandmarks : (usingSamplePortrait ? samplePortraitFacePoints : null);
    if (!points) {
      const faceWidth = Math.min(width, height * .75) * .36;
      return { faceWidth, faceLength: faceWidth * 1.3, angle: 0, foreheadX: width / 2, foreheadY: height * .24, fitted: false };
    }
    const point = (index) => ({ x: points[index].x * width, y: points[index].y * height });
    const leftFace = point(234);
    const rightFace = point(454);
    const forehead = point(10);
    const chin = point(152);
    const leftEye = point(33);
    const rightEye = point(263);
    return {
      faceWidth: Math.hypot(rightFace.x - leftFace.x, rightFace.y - leftFace.y),
      faceLength: Math.hypot(chin.x - forehead.x, chin.y - forehead.y),
      angle: Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x),
      foreheadX: forehead.x,
      foreheadY: forehead.y,
      fitted: true
    };
  }

  function drawHairOverlay() {
    const style = selectedShades.hair;
    if (!style?.face || !currentPhoto) return;
    const image = loadHairImage(style);
    if (!image) return;

    const { faceWidth, faceLength, angle, foreheadX, foreheadY } = hairFaceGeometry();
    // The natural hairline usually sits a little above the top forehead landmark.
    const hairlineOffset = faceLength * (.12 + hairLiftLevel * .01);
    const sideOffset = faceWidth * hairShiftLevel * .01;
    const anchorX = foreheadX + Math.sin(angle) * hairlineOffset + Math.cos(angle) * sideOffset + hairDrag.x;
    const anchorY = foreheadY - Math.cos(angle) * hairlineOffset + Math.sin(angle) * sideOffset + hairDrag.y;

    const scale = (faceWidth * 1.08 * hairSizeLevel) / (style.face.width * image.naturalWidth);
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;

    makeupContext.save();
    makeupContext.translate(anchorX, anchorY);
    makeupContext.rotate(angle);
    makeupContext.drawImage(image, -style.face.cx * drawWidth, -style.face.top * drawHeight, drawWidth, drawHeight);
    makeupContext.restore();
  }

  function updateHairControls() {
    const isHair = activeMakeupArea === 'hair';
    makeupHairFit.hidden = !isHair;
    makeupIntensityGroup.hidden = isHair;
    makeupCanvas.classList.toggle('is-hair-draggable', isHair && hasHairstyle());
  }

  function updateLookButtons() {
    const hasLook = Boolean(currentPhoto && (faceLandmarks || hasHairstyle()));
    makeupCompareButton.disabled = !hasLook;
    makeupResetButton.disabled = !hasLook;
  }

  function resetHairPlacement() {
    hairSizeLevel = 1;
    hairLiftLevel = 0;
    hairShiftLevel = 0;
    hairDrag = { x: 0, y: 0 };
    makeupHairSize.value = '100';
    makeupHairSizeValue.value = '100%';
    makeupHairSizeValue.textContent = '100%';
    makeupHairLift.value = '0';
    makeupHairLiftValue.value = '0';
    makeupHairLiftValue.textContent = '0';
    makeupHairShift.value = '0';
    makeupHairShiftValue.value = '0';
    makeupHairShiftValue.textContent = '0';
  }

  function setMakeupStatus(message) {
    makeupStatus.textContent = message;
  }

  function updateSamplePortraitButtons() {
    makeupSampleCards.forEach((button) => {
      const id = button.dataset.samplePortrait;
      button.setAttribute('aria-pressed', String(Boolean(currentPhoto) && selectedSamplePortraitId === id));
      button.setAttribute('aria-busy', String(loadingSamplePortraitId === id));
    });
    makeupSampleButton.setAttribute('aria-pressed', String(Boolean(currentPhoto) && usingSamplePortrait));
    makeupSampleButton.setAttribute('aria-busy', String(loadingSamplePortraitId === 'original'));
  }

  function updateMakeupStartButton() {
    makeupStartButton.disabled = !currentPhoto || !makeupConsent.checked || isLoadingMakeup;
  }

  function resizeMakeupCanvas(image) {
    const scale = Math.min(1, maximumCanvasDimension / Math.max(image.naturalWidth, image.naturalHeight));
    makeupCanvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    makeupCanvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  }

  function drawOriginalPhoto() {
    if (!currentPhoto) return;
    makeupContext.clearRect(0, 0, makeupCanvas.width, makeupCanvas.height);
    makeupContext.drawImage(currentPhoto, 0, 0, makeupCanvas.width, makeupCanvas.height);
    makeupCanvas.hidden = false;
    makeupPlaceholder.hidden = true;
    makeupCanvas.setAttribute('aria-label', 'Selected portrait, without makeup preview');
  }

  function addLandmarkPolygon(landmarks, indexes) {
    if (!indexes.every((index) => landmarks[index])) return false;
    const first = landmarks[indexes[0]];
    makeupContext.moveTo(first.x * makeupCanvas.width, first.y * makeupCanvas.height);
    indexes.slice(1).forEach((index) => {
      const point = landmarks[index];
      makeupContext.lineTo(point.x * makeupCanvas.width, point.y * makeupCanvas.height);
    });
    makeupContext.closePath();
    return true;
  }

  function colorChannels(hexColor) {
    const value = hexColor.replace('#', '');
    return [0, 2, 4].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16));
  }

  function drawSoftColorSpot(x, y, radiusX, radiusY, angle, hexColor, strength) {
    const [red, green, blue] = colorChannels(hexColor);
    makeupContext.save();
    makeupContext.translate(x, y);
    makeupContext.rotate(angle);
    makeupContext.scale(Math.max(1, radiusX), Math.max(1, radiusY));
    const gradient = makeupContext.createRadialGradient(0, 0, 0, 0, 0, 1);
    gradient.addColorStop(0, `rgba(${red}, ${green}, ${blue}, ${strength})`);
    gradient.addColorStop(.58, `rgba(${red}, ${green}, ${blue}, ${strength * .42})`);
    gradient.addColorStop(1, `rgba(${red}, ${green}, ${blue}, 0)`);
    makeupContext.globalCompositeOperation = 'multiply';
    makeupContext.fillStyle = gradient;
    makeupContext.beginPath();
    makeupContext.arc(0, 0, 1, 0, Math.PI * 2);
    makeupContext.fill();
    makeupContext.restore();
  }

  function drawMakeupOverlay() {
    if (!currentPhoto) return;
    drawOriginalPhoto();
    if (showingOriginal) return;
    if (!faceLandmarks) {
      drawHairOverlay();
      if (hasHairstyle()) makeupCanvas.setAttribute('aria-label', `Portrait with a ${selectedShades.hair.name.toLowerCase()} hairstyle preview`);
      return;
    }

    const width = makeupCanvas.width;
    const height = makeupCanvas.height;

    if (makeupIntensityLevel > 0 && faceLandmarks.length > 467) {
      const intensity = makeupIntensityLevel;
      const leftEye = faceLandmarks[33];
      const leftInnerEye = faceLandmarks[133];
      const leftUpperLid = faceLandmarks[159];
      const rightEye = faceLandmarks[263];
      const rightInnerEye = faceLandmarks[362];
      const rightUpperLid = faceLandmarks[386];
      const eyeSpan = Math.hypot((rightEye.x - leftEye.x) * width, (rightEye.y - leftEye.y) * height);

      if (activeMakeupArea === 'cheek') {
        const leftMouth = faceLandmarks[61];
        const rightMouth = faceLandmarks[291];
        const cheeks = [
          { eye: leftEye, mouth: leftMouth },
          { eye: rightEye, mouth: rightMouth }
        ];
        cheeks.forEach(({ eye, mouth }) => {
          const x = ((eye.x + mouth.x) / 2) * width;
          const y = ((eye.y + mouth.y) / 2) * height + eyeSpan * .06;
          const angle = Math.atan2((mouth.y - eye.y) * height, (mouth.x - eye.x) * width);
          drawSoftColorSpot(x, y, eyeSpan * .17, eyeSpan * .1, angle, selectedShades.cheek.color, .44 * intensity);
        });
      }

      if (activeMakeupArea === 'eye') {
        [
          { outer: leftEye, inner: leftInnerEye, upper: leftUpperLid },
          { outer: rightEye, inner: rightInnerEye, upper: rightUpperLid }
        ].forEach(({ outer, inner, upper }) => {
          const dx = (inner.x - outer.x) * width;
          const dy = (inner.y - outer.y) * height;
          const eyeWidth = Math.hypot(dx, dy);
          const centerX = ((outer.x + inner.x) / 2) * width;
          const centerY = (((outer.y + inner.y) / 2 + upper.y) / 2) * height - eyeWidth * .035;
          drawSoftColorSpot(centerX, centerY, eyeWidth * .58, eyeWidth * .2, Math.atan2(dy, dx), selectedShades.eye.color, .36 * intensity);
        });
      }
    }

    if (activeMakeupArea === 'lip' && makeupIntensityLevel > 0) {
      makeupContext.save();
      makeupContext.globalAlpha = .62 * makeupIntensityLevel;
      makeupContext.globalCompositeOperation = 'multiply';
      makeupContext.fillStyle = selectedShades.lip.color;
      makeupContext.beginPath();
      const outerReady = addLandmarkPolygon(faceLandmarks, lipOuterContour);
      const innerReady = addLandmarkPolygon(faceLandmarks, lipInnerContour);
      if (outerReady && innerReady) makeupContext.fill('evenodd');
      makeupContext.restore();
    }

    drawHairOverlay();

    if (faceLandmarks.length && !showingOriginal) {
      const hairName = selectedShades.hair?.face ? ` and a ${selectedShades.hair.name.toLowerCase()} hairstyle` : '';
      if (activeMakeupArea === 'hair') {
        makeupCanvas.setAttribute('aria-label', hairName ? `Portrait with${hairName.replace(' and', '')} preview` : 'Portrait without a hairstyle preview');
      } else {
        const areaName = makeupPalettes[activeMakeupArea].name;
        const shadeName = selectedShades[activeMakeupArea].name;
        makeupCanvas.setAttribute('aria-label', `Portrait with a ${shadeName.toLowerCase()} ${areaName} preview${hairName}`);
      }
    }
  }

  function renderMakeupSwatches() {
    const palette = makeupPalettes[activeMakeupArea];
    makeupShadeLabel.textContent = palette.label;
    const buttons = palette.shades.map((shade) => {
      const button = document.createElement('button');
      button.className = activeMakeupArea === 'hair' ? 'makeup-swatch makeup-swatch--hair' : 'makeup-swatch';
      button.type = 'button';
      button.setAttribute('aria-label', activeMakeupArea === 'hair' ? shade.name : `${shade.name} ${palette.name}`);
      button.setAttribute('aria-pressed', String(selectedShades[activeMakeupArea].name === shade.name));

      const chip = document.createElement('span');
      chip.className = 'makeup-swatch__chip';
      if (activeMakeupArea === 'hair') {
        chip.classList.add('makeup-swatch__chip--hair');
        if (shade.url) chip.style.backgroundImage = `url("${shade.url}")`;
        else chip.textContent = '∅';
      } else {
        chip.style.setProperty('--swatch', shade.color);
      }
      chip.setAttribute('aria-hidden', 'true');
      const label = document.createElement('span');
      label.textContent = shade.name;
      button.append(chip, label);
      button.addEventListener('click', () => {
        selectedShades[activeMakeupArea] = shade;
        if (activeMakeupArea === 'hair') loadHairImage(shade);
        renderMakeupSwatches();
        updateHairControls();
        updateLookButtons();
        drawMakeupOverlay();
        if (activeMakeupArea !== 'hair') {
          setMakeupStatus(`${shade.name} ${palette.name} selected. Your photo stays in this browser.`);
        } else if (!shade.url) {
          setMakeupStatus('Hairstyle preview removed. Your photo stays in this browser.');
        } else if (!currentPhoto) {
          setMakeupStatus(`${shade.name} selected. Choose the sample portrait or your selfie to see it on a face.`);
        } else if (faceLandmarks || usingSamplePortrait) {
          setMakeupStatus(`${shade.name} hairstyle framed to your face. Drag it or adjust size, hairline, and side to fine-tune.`);
        } else if (makeupConsent.checked && !isLoadingMakeup) {
          startMakeupPreview();
        } else {
          setMakeupStatus(`${shade.name} is on your portrait. Drag it into place and adjust its size—or tick the privacy note below and choose “Preview this look” to fit it to your face automatically.`);
        }
      });
      return button;
    });
    makeupSwatches.replaceChildren(...buttons);
  }

  function setMakeupArea(area) {
    if (!makeupPalettes[area]) return;
    activeMakeupArea = area;
    makeupAreaButtons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.makeupArea === area));
    });
    updateHairControls();
    renderMakeupSwatches();
    drawMakeupOverlay();
  }

  async function setMakeupPhoto(source, label) {
    const requestRevision = ++photoRevision;
    const sample = samplePortraits.find((portrait) => portrait.url === source);
    currentPhoto = null;
    faceLandmarks = null;
    usingSamplePortrait = source === samplePortraitUrl;
    selectedSamplePortraitId = null;
    loadingSamplePortraitId = sample?.id || (usingSamplePortrait ? 'original' : null);
    updateSamplePortraitButtons();
    showingOriginal = false;
    if (photoObjectUrl) URL.revokeObjectURL(photoObjectUrl);
    photoObjectUrl = null;
    makeupCanvas.hidden = true;
    makeupPlaceholder.hidden = false;
    makeupClearButton.hidden = true;
    makeupCompareButton.disabled = true;
    makeupCompareButton.setAttribute('aria-pressed', 'false');
    makeupCompareButton.textContent = 'Show original';
    makeupResetButton.disabled = true;
    setMakeupStatus('Preparing your photo in this browser…');
    updateMakeupStartButton();

    let newPhotoObjectUrl = null;
    try {
      const image = new Image();
      if (source instanceof File) {
        newPhotoObjectUrl = URL.createObjectURL(source);
        image.src = newPhotoObjectUrl;
      } else {
        image.src = source;
      }
      await image.decode();
      if (requestRevision !== photoRevision) {
        if (newPhotoObjectUrl) URL.revokeObjectURL(newPhotoObjectUrl);
        return;
      }
      currentPhoto = image;
      photoObjectUrl = newPhotoObjectUrl;
      selectedSamplePortraitId = sample?.id || null;
      loadingSamplePortraitId = null;
      updateSamplePortraitButtons();
      if (sample) {
        const card = makeupSampleCards.find((button) => button.dataset.samplePortrait === sample.id);
        const thumbnail = card?.querySelector('img');
        if (thumbnail) {
          thumbnail.loading = 'eager';
          if (card.classList.contains('has-image-error')) thumbnail.src = sample.url;
          card.classList.remove('has-image-error');
          const fallback = card.querySelector('.makeup-sample-card__fallback');
          if (fallback) fallback.hidden = true;
        }
      }
      resizeMakeupCanvas(image);
      makeupCanvas.hidden = false;
      makeupPlaceholder.hidden = true;
      makeupClearButton.hidden = false;
      resetHairPlacement();
      updateLookButtons();
      drawMakeupOverlay();
      const skinNote = sample?.id === 'skin' ? ' Skin uses cheek tint; it does not change your complexion.' : '';
      const nextStep = activeMakeupArea === 'hair'
        ? 'Choose a hairstyle, then drag or adjust it. Opt in and select Preview this look for an automatic face fit.'
        : 'Choose a colour, opt in to the metrics notice, then select Preview this look to apply it.';
      setMakeupStatus(`${label} is ready.${skinNote} ${nextStep}`);
    } catch {
      if (newPhotoObjectUrl) URL.revokeObjectURL(newPhotoObjectUrl);
      if (requestRevision !== photoRevision) return;
      currentPhoto = null;
      usingSamplePortrait = false;
      selectedSamplePortraitId = null;
      loadingSamplePortraitId = null;
      updateSamplePortraitButtons();
      makeupCanvas.hidden = true;
      makeupPlaceholder.hidden = false;
      makeupClearButton.hidden = true;
      setMakeupStatus(sample
        ? 'This sample could not load. Try the original portrait below, or choose a clear selfie. You can also retry this sample.'
        : 'We could not read that image. Choose a clear JPEG, PNG, or WebP photo and try again.');
    }
    updateMakeupStartButton();
  }

  function clearMakeupPhoto() {
    photoRevision += 1;
    currentPhoto = null;
    faceLandmarks = null;
    usingSamplePortrait = false;
    selectedSamplePortraitId = null;
    loadingSamplePortraitId = null;
    updateSamplePortraitButtons();
    showingOriginal = false;
    if (photoObjectUrl) URL.revokeObjectURL(photoObjectUrl);
    photoObjectUrl = null;
    makeupPhotoInput.value = '';
    makeupCanvas.width = 1;
    makeupCanvas.height = 1;
    makeupCanvas.hidden = true;
    makeupPlaceholder.hidden = false;
    makeupClearButton.hidden = true;
    makeupCompareButton.disabled = true;
    makeupCompareButton.setAttribute('aria-pressed', 'false');
    makeupCompareButton.textContent = 'Show original';
    makeupResetButton.disabled = true;
    setMakeupStatus('Photo cleared. Choose the sample portrait or a new selfie to begin.');
    updateMakeupStartButton();
  }

  function renderMakeupAreaButtons() {
    makeupAreaButtons.forEach((button) => button.addEventListener('click', () => {
      setMakeupArea(button.dataset.makeupArea);
    }));
  }

  async function loadFaceLandmarker() {
    if (faceLandmarker) return faceLandmarker;
    if (!faceLandmarkerPromise) {
      faceLandmarkerPromise = (async () => {
        const vision = await import(mediaPipeModuleUrl);
        const files = await vision.FilesetResolver.forVisionTasks(mediaPipeWasmUrl);
        return vision.FaceLandmarker.createFromOptions(files, {
          baseOptions: { modelAssetPath: faceLandmarkerModelUrl },
          runningMode: 'IMAGE',
          numFaces: 1
        });
      })().catch((error) => {
        faceLandmarkerPromise = null;
        throw error;
      });
    }
    faceLandmarker = await faceLandmarkerPromise;
    return faceLandmarker;
  }

  async function startMakeupPreview() {
    if (!currentPhoto || !makeupConsent.checked || isLoadingMakeup) return;
    isLoadingMakeup = true;
    let previewStage = 'loading';
    const startingPhotoRevision = photoRevision;
    const startingConsentRevision = consentRevision;
    setMakeupStatus('Loading the on-device face model. This may take a moment the first time.');
    updateMakeupStartButton();

    try {
      const landmarker = await loadFaceLandmarker();
      if (startingConsentRevision !== consentRevision || !makeupConsent.checked) {
        landmarker.close();
        faceLandmarker = null;
        faceLandmarkerPromise = null;
        if (startingPhotoRevision === photoRevision) {
          faceLandmarks = null;
          drawMakeupOverlay();
        }
        return;
      }
      if (startingPhotoRevision !== photoRevision) return;

      setMakeupStatus('Finding facial landmarks on this device…');
      previewStage = 'detecting';
      const result = landmarker.detect(makeupCanvas);
      if (startingPhotoRevision !== photoRevision) return;
      if (startingConsentRevision !== consentRevision || !makeupConsent.checked) {
        faceLandmarks = null;
        drawMakeupOverlay();
        return;
      }

      faceLandmarks = result.faceLandmarks?.[0] || null;
      if (!faceLandmarks || faceLandmarks.length < 468) {
        faceLandmarks = null;
        drawMakeupOverlay();
        updateLookButtons();
        setMakeupStatus(hasHairstyle()
          ? 'We could not find a clear, front-facing face, so the hairstyle stays where you place it—drag it into position. The photo was not uploaded.'
          : 'We could not find a clear, front-facing face. Try a well-lit portrait with the face unobstructed. The photo was not uploaded.');
        return;
      }

      showingOriginal = false;
      makeupCompareButton.setAttribute('aria-pressed', 'false');
      makeupCompareButton.textContent = 'Show original';
      hairDrag = { x: 0, y: 0 };
      updateLookButtons();
      drawMakeupOverlay();
      setMakeupStatus(hasHairstyle()
        ? `Your ${selectedShades.hair.name.toLowerCase()} is fitted to your face. All image analysis happened in this browser.`
        : 'Your look is ready. All image analysis and color rendering happened in this browser.');
    } catch {
      // An earlier request must not overwrite a newer portrait or withdrawn consent.
      if (startingPhotoRevision !== photoRevision || startingConsentRevision !== consentRevision || !makeupConsent.checked) return;
      faceLandmarks = null;
      drawMakeupOverlay();
      updateLookButtons();
      setMakeupStatus(previewStage === 'loading'
        ? 'The on-device face model could not load. Check your connection or browser support; your photo was not uploaded.'
        : 'We could not apply this preview. Try again with a clear, front-facing portrait; your photo was not uploaded.');
    } finally {
      isLoadingMakeup = false;
      updateMakeupStartButton();
    }
  }

  makeupSampleButton.addEventListener('click', () => {
    setMakeupPhoto(samplePortraitUrl, 'Sample portrait');
  });

  makeupSampleCards.forEach((button) => {
    const sample = samplePortraits.find((portrait) => portrait.id === button.dataset.samplePortrait);
    if (!sample) return;
    button.addEventListener('click', () => {
      setMakeupArea(sample.area);
      setMakeupPhoto(sample.url, sample.label);
    });
    const thumbnail = button.querySelector('img');
    const fallback = button.querySelector('.makeup-sample-card__fallback');
    const showThumbnailState = (failed) => {
      button.classList.toggle('has-image-error', failed);
      if (fallback) fallback.hidden = !failed;
    };
    thumbnail?.addEventListener('load', () => showThumbnailState(false));
    thumbnail?.addEventListener('error', () => showThumbnailState(true));
    if (thumbnail?.complete) showThumbnailState(thumbnail.naturalWidth === 0);
  });

  makeupPhotoInput.addEventListener('change', () => {
    const photo = makeupPhotoInput.files?.[0];
    if (!photo) return;
    const supportedImageType = ['image/jpeg', 'image/png', 'image/webp'].includes(photo.type);
    if (!supportedImageType || photo.size > maximumPhotoBytes) {
      setMakeupStatus(photo.size > maximumPhotoBytes
        ? 'Choose an image smaller than 12 MB. The image has not been uploaded.'
        : 'Choose a JPEG, PNG, or WebP image file to continue.');
      makeupPhotoInput.value = '';
      return;
    }
    setMakeupPhoto(photo, 'Your selfie');
  });

  makeupClearButton.addEventListener('click', clearMakeupPhoto);
  makeupStartButton.addEventListener('click', startMakeupPreview);

  makeupIntensity.addEventListener('input', () => {
    makeupIntensityLevel = Number(makeupIntensity.value) / 100;
    makeupIntensityValue.value = `${makeupIntensity.value}%`;
    makeupIntensityValue.textContent = `${makeupIntensity.value}%`;
    drawMakeupOverlay();
  });

  makeupHairSize.addEventListener('input', () => {
    hairSizeLevel = Number(makeupHairSize.value) / 100;
    makeupHairSizeValue.value = `${makeupHairSize.value}%`;
    makeupHairSizeValue.textContent = `${makeupHairSize.value}%`;
    drawMakeupOverlay();
  });

  makeupHairLift.addEventListener('input', () => {
    hairLiftLevel = Number(makeupHairLift.value);
    const label = hairLiftLevel > 0 ? `+${hairLiftLevel}` : String(hairLiftLevel);
    makeupHairLiftValue.value = label;
    makeupHairLiftValue.textContent = label;
    drawMakeupOverlay();
  });

  makeupHairShift.addEventListener('input', () => {
    hairShiftLevel = Number(makeupHairShift.value);
    const label = hairShiftLevel > 0 ? `+${hairShiftLevel}` : String(hairShiftLevel);
    makeupHairShiftValue.value = label;
    makeupHairShiftValue.textContent = label;
    drawMakeupOverlay();
  });

  // Drag the hairstyle directly on the portrait (mouse, pen, or touch).
  function canvasScale() {
    const rect = makeupCanvas.getBoundingClientRect();
    return { x: makeupCanvas.width / Math.max(1, rect.width), y: makeupCanvas.height / Math.max(1, rect.height) };
  }

  makeupCanvas.addEventListener('pointerdown', (event) => {
    if (activeMakeupArea !== 'hair' || !hasHairstyle() || !currentPhoto || showingOriginal) return;
    hairDragStart = { pointerX: event.clientX, pointerY: event.clientY, x: hairDrag.x, y: hairDrag.y };
    makeupCanvas.setPointerCapture(event.pointerId);
    makeupCanvas.classList.add('is-hair-dragging');
    event.preventDefault();
  });

  makeupCanvas.addEventListener('pointermove', (event) => {
    if (!hairDragStart) return;
    const scale = canvasScale();
    hairDrag = {
      x: hairDragStart.x + (event.clientX - hairDragStart.pointerX) * scale.x,
      y: hairDragStart.y + (event.clientY - hairDragStart.pointerY) * scale.y
    };
    drawMakeupOverlay();
  });

  function endHairDrag(event) {
    if (!hairDragStart) return;
    hairDragStart = null;
    makeupCanvas.classList.remove('is-hair-dragging');
    if (makeupCanvas.hasPointerCapture?.(event.pointerId)) makeupCanvas.releasePointerCapture(event.pointerId);
  }

  makeupCanvas.addEventListener('pointerup', endHairDrag);
  makeupCanvas.addEventListener('pointercancel', endHairDrag);

  makeupCompareButton.addEventListener('click', () => {
    if (!currentPhoto || (!faceLandmarks && !hasHairstyle())) return;
    showingOriginal = !showingOriginal;
    makeupCompareButton.setAttribute('aria-pressed', String(showingOriginal));
    makeupCompareButton.textContent = showingOriginal ? 'Show my look' : 'Show original';
    drawMakeupOverlay();
  });

  makeupResetButton.addEventListener('click', () => {
    if (!currentPhoto) return;
    selectedShades = { ...initialShades };
    activeMakeupArea = 'lip';
    showingOriginal = false;
    makeupIntensity.value = '50';
    makeupIntensityLevel = .5;
    makeupIntensityValue.value = '50%';
    makeupIntensityValue.textContent = '50%';
    resetHairPlacement();
    makeupAreaButtons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.makeupArea === activeMakeupArea));
    });
    updateHairControls();
    renderMakeupSwatches();
    makeupCompareButton.setAttribute('aria-pressed', 'false');
    makeupCompareButton.textContent = 'Show original';
    updateLookButtons();
    drawMakeupOverlay();
    setMakeupStatus('Look reset—hairstyle removed and lip color back to rose. Your photo remains in this browser.');
  });

  makeupConsent.addEventListener('change', () => {
    consentRevision += 1;
    if (!makeupConsent.checked) {
      faceLandmarks = null;
      showingOriginal = false;
      if (faceLandmarker) {
        faceLandmarker.close();
        faceLandmarker = null;
        faceLandmarkerPromise = null;
      }
      if (currentPhoto) drawMakeupOverlay();
      makeupCompareButton.setAttribute('aria-pressed', 'false');
      makeupCompareButton.textContent = 'Show original';
      updateLookButtons();
      setMakeupStatus('Try-on stopped because metrics consent was withdrawn. Your photo stays in this browser and was not uploaded.');
    }
    updateMakeupStartButton();
  });

  renderMakeupAreaButtons();
  renderMakeupSwatches();
  updateSamplePortraitButtons();
  updateMakeupStartButton();
  window.addEventListener('pagehide', () => {
    if (photoObjectUrl) URL.revokeObjectURL(photoObjectUrl);
    faceLandmarker?.close();
  });
}

const inquiryForm = document.querySelector('#inquiry-form');
const formStatus = document.querySelector('#form-status');
inquiryForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!inquiryForm.reportValidity()) return;

  const formData = new FormData(inquiryForm);
  const subject = `A note for Beauthy Swells from ${formData.get('name')}`;
  const body = [
    'Hi Beauthy Swells,',
    '',
    String(formData.get('message')),
    '',
    `You can write back to me at ${formData.get('email')}.`,
    '',
    'Please choose the recipient in this draft, then press Send.'
  ].join('\n');
  window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  formStatus.textContent = 'Your email draft is ready. Choose the recipient and press Send to reach Beauthy Swells.';
});
