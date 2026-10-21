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
