const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Theme ---------- */
const root = document.documentElement;
function currentTheme() {
  return root.dataset.theme === 'dark' ? 'dark' : 'light'; // light unless the visitor chose dark
}
const themeBtn = $('[data-theme-toggle]');
// Tooltip and label describe what a click will do.
function labelThemeButton() {
  const label = currentTheme() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  themeBtn.setAttribute('aria-label', label);
  themeBtn.dataset.tip = label;
}
themeBtn.addEventListener('click', () => {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch {}
  labelThemeButton();
});
labelThemeButton();

/* ---------- Nav: scrolled state, progress bar, current section ---------- */
const nav = $('[data-nav]');
const toTop = $('[data-to-top]');
const onScroll = () => {
  const y = scrollY;
  nav.classList.toggle('is-scrolled', y > 12);
  toTop.classList.toggle('is-on', y > innerHeight * 0.8);
  const max = document.documentElement.scrollHeight - innerHeight;
  root.style.setProperty('--progress', max > 0 ? (y / max).toFixed(4) : 0);
};
addEventListener('scroll', onScroll, { passive: true });
requestAnimationFrame(onScroll);

// Highlight the nav link for the last section whose top has passed the middle of the screen.
const navLinks = $$('.nav__links a, .mobile-menu a:not(.btn)');
const navTargets = ['experience', 'work', 'decisions', 'skills', 'about', 'contact']
  .map((id) => document.getElementById(id)).filter(Boolean);
let navRaf = 0;
function updateCurrent() {
  navRaf = 0;
  let current = '';
  for (const el of navTargets) if (el.getBoundingClientRect().top < innerHeight * 0.5) current = el.id;
  navLinks.forEach((a) => a.classList.toggle('is-current', a.getAttribute('href') === `#${current}`));
}
addEventListener('scroll', () => { if (!navRaf) navRaf = requestAnimationFrame(updateCurrent); }, { passive: true });
requestAnimationFrame(updateCurrent);

/* ---------- Mobile menu ---------- */
const menuBtn = $('[data-menu-toggle]');
const menu = $('#mobile-menu');
function setMenu(open) {
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  menu.hidden = !open;
  nav.classList.toggle('is-scrolled', open || scrollY > 12);
}
menuBtn.addEventListener('click', () => setMenu(menu.hidden));
menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });
matchMedia('(min-width: 1081px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

/* ---------- Reveal on scroll (staggered within groups) ---------- */
const revealObserver = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    e.target.classList.add('is-in');
    revealObserver.unobserve(e.target);
  }
}, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
$$('.reveal').forEach((el) => {
  const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
  const idx = siblings.indexOf(el);
  if (siblings.length > 2) el.style.setProperty('--d', `${Math.min(idx, 5) * 0.06}s`);
  revealObserver.observe(el);
});

/* ---------- Case study dialog ---------- */
const caseDialog = $('[data-case-dialog]');
const caseContent = $('[data-case-content]');
let lastTrigger = null;
$$('[data-case]').forEach((btn) => btn.addEventListener('click', () => {
  const tpl = document.getElementById(`case-${btn.dataset.case}`);
  if (!tpl) return;
  lastTrigger = btn;
  caseContent.replaceChildren(tpl.content.cloneNode(true));
  caseDialog.querySelector('.case__inner').scrollTop = 0;
  caseDialog.showModal();
  document.body.style.overflow = 'hidden';
  const hash = `#case-${btn.dataset.case}`;
  if (location.hash !== hash) history.replaceState(null, '', hash);
}));
function closeCase() { caseDialog.close(); }
$('[data-case-close]').addEventListener('click', closeCase);
caseDialog.addEventListener('click', (e) => { if (e.target === caseDialog) closeCase(); });
caseDialog.addEventListener('close', () => {
  document.body.style.overflow = '';
  if (location.hash.startsWith('#case-')) history.replaceState(null, '', location.pathname + location.search);
  lastTrigger?.focus({ preventScroll: true });
});
// Deep links like /#case-jammr open that case study.
function openFromHash() {
  const deep = location.hash.match(/^#case-(\w+)$/);
  if (deep && !caseDialog.open) $(`[data-case="${deep[1]}"]`)?.click();
}
addEventListener('hashchange', openFromHash);
openFromHash();

/* ---------- Lightbox for case study screenshots ---------- */
const lightbox = $('[data-lightbox]');
const lightboxImg = $('[data-lightbox-img]');
caseContent.addEventListener('click', (e) => {
  const img = e.target.closest('.case__gallery img');
  if (!img) return;
  lightboxImg.src = img.src; // full-size file, not the smaller srcset pick
  lightboxImg.alt = img.alt;
  lightbox.showModal();
});
$('[data-lightbox-close]').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', (e) => { if (e.target !== lightboxImg) lightbox.close(); });

/* ---------- Toast + copy email ---------- */
const toast = $('.toast');
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-on'), 2400);
}
$$('[data-copy]').forEach((btn) => btn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(btn.dataset.copy);
    showToast('Email copied to clipboard ✓');
  } catch {
    showToast(btn.dataset.copy);
  }
}));

/* ---------- Contact form → prefilled email ---------- */
const form = $('[data-contact-form]');
const formError = $('.form__error', form);
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(form);
  let firstBad = null;
  for (const el of $$('input[required], textarea[required]', form)) {
    const bad = !el.value.trim() || (el.type === 'email' && !el.checkValidity());
    el.setAttribute('aria-invalid', String(bad));
    if (bad && !firstBad) firstBad = el;
  }
  if (firstBad) {
    formError.hidden = false;
    formError.textContent = firstBad.type === 'email' && firstBad.value ? 'Please enter a valid email address.' : 'Please fill in your name, email and a short message.';
    firstBad.focus();
    return;
  }
  formError.hidden = true;
  const to = $('[data-email]').textContent.trim();
  const subject = `${data.get('type')} enquiry from ${data.get('name')}`;
  const body = `${data.get('message')}\n\n— ${data.get('name')} (${data.get('email')})`;
  location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  showToast('Opening your email app…');
});
form.addEventListener('input', (e) => {
  if (e.target.getAttribute('aria-invalid') === 'true' && e.target.value.trim()) e.target.setAttribute('aria-invalid', 'false');
});

/* ---------- Back to top ---------- */
toTop.addEventListener('click', (e) => {
  e.preventDefault();
  scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  history.replaceState(null, '', location.pathname + location.search);
  $('.brand').focus({ preventScroll: true });
});

/* ---------- Footer year ---------- */
$('[data-year]').textContent = new Date().getFullYear();
