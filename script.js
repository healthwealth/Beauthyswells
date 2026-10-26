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
    style: new Set()
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

const makeupStudio = document.querySelector('#makeup-tryon');

if (makeupStudio) {
  const makeupCanvas = makeupStudio.querySelector('#makeup-canvas');
  const makeupContext = makeupCanvas.getContext('2d');
  const makeupPlaceholder = makeupStudio.querySelector('#makeup-placeholder');
  const makeupPhotoInput = makeupStudio.querySelector('#makeup-photo');
  const makeupSampleButton = makeupStudio.querySelector('#makeup-sample');
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

  function setMakeupStatus(message) {
    makeupStatus.textContent = message;
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
    if (!faceLandmarks || showingOriginal || makeupIntensityLevel <= 0) return;

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

    if (activeMakeupArea === 'lip') {
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

    if (faceLandmarks.length && !showingOriginal) {
      const areaName = makeupPalettes[activeMakeupArea].name;
      const shadeName = selectedShades[activeMakeupArea].name;
      makeupCanvas.setAttribute('aria-label', `Portrait with a ${shadeName.toLowerCase()} ${areaName} preview`);
    }
  }

  function renderMakeupSwatches() {
    const palette = makeupPalettes[activeMakeupArea];
    makeupShadeLabel.textContent = palette.label;
    const buttons = palette.shades.map((shade) => {
      const button = document.createElement('button');
      button.className = 'makeup-swatch';
      button.type = 'button';
      button.setAttribute('aria-label', `${shade.name} ${palette.name}`);
      button.setAttribute('aria-pressed', String(selectedShades[activeMakeupArea].name === shade.name));

      const chip = document.createElement('span');
      chip.className = 'makeup-swatch__chip';
      chip.style.setProperty('--swatch', shade.color);
      chip.setAttribute('aria-hidden', 'true');
      const label = document.createElement('span');
      label.textContent = shade.name;
      button.append(chip, label);
      button.addEventListener('click', () => {
        selectedShades[activeMakeupArea] = shade;
        renderMakeupSwatches();
        drawMakeupOverlay();
        setMakeupStatus(`${shade.name} ${palette.name} selected. Your photo stays in this browser.`);
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
    renderMakeupSwatches();
    drawMakeupOverlay();
  }

  async function setMakeupPhoto(source, label) {
    const requestRevision = ++photoRevision;
    currentPhoto = null;
    faceLandmarks = null;
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
      resizeMakeupCanvas(image);
      makeupCanvas.hidden = false;
      makeupPlaceholder.hidden = true;
      makeupClearButton.hidden = false;
      makeupCompareButton.disabled = true;
      makeupResetButton.disabled = true;
      drawOriginalPhoto();
      setMakeupStatus(`${label} is ready. Check the metrics notice and choose Preview this look.`);
    } catch {
      if (newPhotoObjectUrl) URL.revokeObjectURL(newPhotoObjectUrl);
      if (requestRevision !== photoRevision) return;
      currentPhoto = null;
      makeupCanvas.hidden = true;
      makeupPlaceholder.hidden = false;
      makeupClearButton.hidden = true;
      setMakeupStatus('We could not read that image. Choose a clear JPEG, PNG, or WebP photo and try again.');
    }
    updateMakeupStartButton();
  }

  function clearMakeupPhoto() {
    photoRevision += 1;
    currentPhoto = null;
    faceLandmarks = null;
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
      if (startingPhotoRevision !== photoRevision) return;
      if (startingConsentRevision !== consentRevision || !makeupConsent.checked) {
        landmarker.close();
        faceLandmarker = null;
        faceLandmarkerPromise = null;
        faceLandmarks = null;
        drawOriginalPhoto();
        return;
      }

      setMakeupStatus('Finding facial landmarks on this device…');
      previewStage = 'detecting';
      const result = landmarker.detect(makeupCanvas);
      if (startingPhotoRevision !== photoRevision) return;
      if (startingConsentRevision !== consentRevision || !makeupConsent.checked) {
        faceLandmarks = null;
        drawOriginalPhoto();
        return;
      }

      faceLandmarks = result.faceLandmarks?.[0] || null;
      if (!faceLandmarks || faceLandmarks.length < 468) {
        faceLandmarks = null;
        drawOriginalPhoto();
        makeupCompareButton.disabled = true;
        makeupResetButton.disabled = true;
        setMakeupStatus('We could not find a clear, front-facing face. Try a well-lit portrait with the face unobstructed. The photo was not uploaded.');
        return;
      }

      showingOriginal = false;
      makeupCompareButton.disabled = false;
      makeupCompareButton.setAttribute('aria-pressed', 'false');
      makeupCompareButton.textContent = 'Show original';
      makeupResetButton.disabled = false;
      drawMakeupOverlay();
      setMakeupStatus('Your look is ready. All image analysis and color rendering happened in this browser.');
    } catch {
      faceLandmarks = null;
      drawOriginalPhoto();
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

  makeupCompareButton.addEventListener('click', () => {
    if (!faceLandmarks) return;
    showingOriginal = !showingOriginal;
    makeupCompareButton.setAttribute('aria-pressed', String(showingOriginal));
    makeupCompareButton.textContent = showingOriginal ? 'Show makeup look' : 'Show original';
    drawMakeupOverlay();
  });

  makeupResetButton.addEventListener('click', () => {
    if (!faceLandmarks) return;
    selectedShades = { ...initialShades };
    activeMakeupArea = 'lip';
    showingOriginal = false;
    makeupIntensity.value = '50';
    makeupIntensityLevel = .5;
    makeupIntensityValue.value = '50%';
    makeupIntensityValue.textContent = '50%';
    makeupAreaButtons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.makeupArea === activeMakeupArea));
    });
    renderMakeupSwatches();
    makeupCompareButton.setAttribute('aria-pressed', 'false');
    makeupCompareButton.textContent = 'Show original';
    drawMakeupOverlay();
    setMakeupStatus('Look reset to the original rose lip preview. Your photo remains in this browser.');
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
      if (currentPhoto) drawOriginalPhoto();
      makeupCompareButton.disabled = true;
      makeupCompareButton.setAttribute('aria-pressed', 'false');
      makeupCompareButton.textContent = 'Show original';
      makeupResetButton.disabled = true;
      setMakeupStatus('Try-on stopped because metrics consent was withdrawn. Your photo stays in this browser and was not uploaded.');
    }
    updateMakeupStartButton();
  });

  renderMakeupAreaButtons();
  renderMakeupSwatches();
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
