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
