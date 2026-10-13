const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ---------- Theme ---------- */
const root = document.documentElement;
function currentTheme() {
  return root.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}
$('[data-theme-toggle]').addEventListener('click', () => {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch {}
});

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
const navLinks = $$('.nav__links a');
const navTargets = ['work', 'skills', 'solved', 'process', 'about', 'experience', 'contact']
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

/* ---------- Word rotator ---------- */
const rotator = $('[data-rotator]');
if (rotator && !reduceMotion) {
  const words = $$('.rotator__word', rotator);
  let i = 0;
  setInterval(() => {
    if (document.hidden) return;
    const cur = words[i];
    i = (i + 1) % words.length;
    cur.classList.remove('is-on');
    cur.classList.add('is-out');
    words[i].classList.remove('is-out');
    words[i].classList.add('is-on');
    setTimeout(() => cur.classList.remove('is-out'), 650);
  }, 2400);
}

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
  if (siblings.length > 2) el.style.setProperty('--d', `${Math.min(idx, 5) * 0.08}s`);
  revealObserver.observe(el);
});

/* ---------- Count-up stats ---------- */
const countObserver = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    countObserver.unobserve(e.target);
    const end = Number(e.target.dataset.count);
    if (reduceMotion) continue;
    const start = performance.now();
    const dur = 1200;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur);
      e.target.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    e.target.textContent = '0';
    requestAnimationFrame(tick);
  }
}, { threshold: 0.6 });
$$('[data-count]').forEach((el) => countObserver.observe(el));

/* ---------- Hero parallax ---------- */
const stage = $('[data-parallax]');
if (stage && finePointer && !reduceMotion) {
  const layers = $$('[data-depth]', stage);
  let raf = 0;
  let tx = 0, ty = 0;
  addEventListener('pointermove', (e) => {
    tx = (e.clientX / innerWidth - 0.5) * 2;
    ty = (e.clientY / innerHeight - 0.5) * 2;
    if (!raf) raf = requestAnimationFrame(apply);
  });
  function apply() {
    raf = 0;
    for (const l of layers) {
      const d = Number(l.dataset.depth);
      l.style.translate = `${(-tx * d * 10).toFixed(1)}px ${(-ty * d * 8).toFixed(1)}px`;
    }
  }
}

/* ---------- Magnetic buttons ---------- */
if (finePointer && !reduceMotion) {
  $$('.magnetic').forEach((btn) => {
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.18}px, ${y * 0.3}px)`;
    });
    btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
  });
}

/* ---------- Project filters ---------- */
const filters = $$('[data-filter]');
const projects = $$('.project');
filters.forEach((btn) => btn.addEventListener('click', () => {
  const kind = btn.dataset.filter;
  filters.forEach((b) => {
    const on = b === btn;
    b.classList.toggle('is-active', on);
    b.setAttribute('aria-pressed', String(on));
  });
  projects.forEach((p) => {
    const show = kind === 'all' || p.dataset.kind === kind;
    p.classList.toggle('is-hidden', !show);
    if (show && !reduceMotion) {
      p.animate([{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }], { duration: 500, easing: 'cubic-bezier(.2,.7,.2,1)' });
    }
  });
}));

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
