'use strict';
document.documentElement.classList.add('js');

document.querySelectorAll('[data-lang]').forEach((link) => {
  link.addEventListener('click', () => {
    const lang = link.getAttribute('data-lang');
    if (lang !== 'en' && lang !== 'es') return;
    try { localStorage.setItem('seivol-lang', lang); } catch (e) {}
  });
});

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() { menuButton.setAttribute('aria-expanded', 'false'); navigation.classList.remove('is-open'); }
menuButton.addEventListener('click', (event) => {
  event.preventDefault();
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('is-open', open);
});
navigation.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') { closeMenu(); menuButton.focus(); } });
window.matchMedia('(min-width: 801px)').addEventListener('change', closeMenu);

const media = {
  hero: { src: '', type: 'image', alt: 'Seivol app on a phone: English practice with corrections and progress', caption: 'The Seivol experience' },
  practice: { src: '', type: 'image', alt: 'Seivol practice activity with contextual feedback', caption: 'Guided practice' },
  review: { src: '', type: 'image', alt: 'Seivol adaptive vocabulary review', caption: 'Adaptive review' },
  support: { src: '', type: 'image', alt: 'Seivol contextual hint and explanation', caption: 'Support when needed' },
  activities: { src: '', type: 'image', alt: 'Learning activities available in Seivol', caption: 'Connected learning activities' }
};

Object.entries(media).forEach(([key, item]) => {
  if (!item.src) return;
  const slot = document.querySelector(`[data-media="${key}"]`);
  if (!slot) return;

  if (item.type === 'video' && key === 'hero') {
    const wrap = document.createElement('div');
    wrap.className = 'hero-video';
    const element = document.createElement('video');
    element.src = item.src;
    element.muted = true;
    element.defaultMuted = true;
    element.autoplay = true;
    element.loop = true;
    element.playsInline = true;
    element.preload = 'auto';
    element.setAttribute('aria-label', item.alt);
    if (item.poster) element.poster = item.poster;

    const soundBtn = document.createElement('button');
    soundBtn.type = 'button';
    soundBtn.className = 'hero-sound';
    soundBtn.setAttribute('aria-pressed', 'false');
    soundBtn.textContent = 'Activar sonido';

    const caption = document.createElement('figcaption');
    caption.textContent = item.caption;

    soundBtn.addEventListener('click', () => {
      const on = element.muted;
      element.muted = !on;
      soundBtn.setAttribute('aria-pressed', String(on));
      soundBtn.textContent = on ? 'Silenciar' : 'Activar sonido';
      if (on) element.play().catch(() => {});
    });

    wrap.append(element, soundBtn);
    slot.replaceChildren(wrap, caption);
    slot.classList.add('is-loaded');
    element.play().catch(() => {});
    return;
  }

  const element = document.createElement(item.type === 'video' ? 'video' : 'img');
  const caption = document.createElement('figcaption');
  caption.textContent = item.caption;
  let installed = false;
  const install = () => { if (installed) return; installed = true; slot.replaceChildren(element, caption); slot.classList.add('is-loaded'); };
  if (item.type === 'video') {
    element.controls = true; element.preload = 'metadata'; element.playsInline = true;
    element.setAttribute('aria-label', item.alt);
    if (item.poster) element.poster = item.poster;
    if (item.captions) { const track = document.createElement('track'); track.kind = 'captions'; track.srclang = 'es'; track.label = 'Español'; track.src = item.captions; track.default = true; element.append(track); }
    element.addEventListener('loadedmetadata', install, { once: true });
  } else { element.alt = item.alt; element.addEventListener('load', install, { once: true }); }
  element.src = item.src;
});

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const revealTargets = [
  ...document.querySelectorAll('[data-reveal]'),
  ...document.querySelectorAll('.section-heading, .cycle-compose, .principles, .cycle, .support-example, .speaking-copy, .experience-shot, .contact-panel, .app-copy')
];

revealTargets.forEach((el) => { el.classList.add('reveal'); });

if (!reduceMotion.matches && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-inview');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
  revealTargets.forEach((el) => io.observe(el));
} else {
  revealTargets.forEach((el) => el.classList.add('is-inview'));
}

const heroVisual = document.querySelector('.hero-bleed .hero-visual');
const heroCopy = document.querySelector('.hero-bleed .hero-copy');
const desktopMotion = window.matchMedia('(min-width: 801px)');
if (heroVisual && heroCopy && !reduceMotion.matches && desktopMotion.matches) {
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = Math.min(window.scrollY, 480);
      heroVisual.style.transform = `translate3d(0, ${y * 0.1}px, 0)`;
      heroCopy.style.transform = `translate3d(0, ${y * 0.04}px, 0)`;
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

const earlyAccessForm = document.querySelector('#early-access-form');
if (earlyAccessForm) {
  const captchaQuestion = earlyAccessForm.querySelector('#contact-captcha-question');
  const captchaInput = earlyAccessForm.querySelector('#contact-captcha');
  const formError = earlyAccessForm.querySelector('#contact-form-error');
  const a = 2 + Math.floor(Math.random() * 7);
  const b = 1 + Math.floor(Math.random() * 8);
  const captchaAnswer = a + b;
  if (captchaQuestion) captchaQuestion.textContent = `${a} + ${b}`;

  earlyAccessForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const honeypot = earlyAccessForm.querySelector('#contact-company')?.value.trim() || '';
    if (honeypot) return;

    const answered = Number.parseInt(captchaInput?.value.trim() || '', 10);
    if (answered !== captchaAnswer) {
      if (formError) formError.hidden = false;
      captchaInput?.focus();
      return;
    }
    if (formError) formError.hidden = true;

    const name = earlyAccessForm.querySelector('#contact-name')?.value.trim() || '';
    const email = earlyAccessForm.querySelector('#contact-email')?.value.trim() || '';
    const role = earlyAccessForm.querySelector('#contact-role')?.value.trim() || '';
    const message = earlyAccessForm.querySelector('#contact-message')?.value.trim() || '';
    if (!name || !email) return;

    const lines = [
      `Name: ${name}`,
      `Email: ${email}`,
      role ? `Role / Institution: ${role}` : null,
      message ? `Message: ${message}` : null
    ].filter(Boolean);
    const body = encodeURIComponent(lines.join('\n'));
    const subject = encodeURIComponent('Seivol early access');
    window.location.href = `mailto:jmpmonge@gmail.com?subject=${subject}&body=${body}`;
  });
}
