/* ALXZ// — 03:00 — somewhere between code & imagination. */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var nav = document.getElementById('nav');
  var toggle = document.getElementById('navToggle');
  var links = document.querySelectorAll('.nav__links a');

  /* ---------- Nav: fondo al hacer scroll ---------- */
  function onScrollNav() {
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
  }

  /* ---------- Menú móvil ---------- */
  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }
  toggle.addEventListener('click', function () {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });
  links.forEach(function (a) {
    a.addEventListener('click', function () { setMenu(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
  });

  /* ---------- Parallax muy leve en el hero ---------- */
  var heroImg = document.querySelector('[data-parallax]');
  var ticking = false;
  function parallax() {
    var y = window.scrollY;
    if (heroImg && y < window.innerHeight * 1.2) {
      heroImg.style.translate = '0 ' + (y * 0.12).toFixed(1) + 'px';
    }
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    onScrollNav();
    if (!reduced && !ticking) { ticking = true; requestAnimationFrame(parallax); }
  }, { passive: true });
  onScrollNav();

  /* ---------- Reveal al hacer scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Estado activo de la navegación ---------- */
  var map = {};
  links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
  var sections = ['home', 'about', 'projects', 'contact'] // orden del DOM
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  // La última sección del nav cuyo inicio ya pasó la mitad de la pantalla
  // (Identity y Services quedan bajo Projects).
  var current = null;
  function spy() {
    var mid = window.innerHeight * 0.45;
    var active = sections[0];
    sections.forEach(function (s) { if (s.getBoundingClientRect().top <= mid) active = s; });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
      active = sections[sections.length - 1];
    }
    if (active === current) return;
    current = active;
    links.forEach(function (a) { a.classList.remove('is-active'); a.removeAttribute('aria-current'); });
    map[active.id].classList.add('is-active');
    map[active.id].setAttribute('aria-current', 'true');
  }
  window.addEventListener('scroll', spy, { passive: true });
  spy();

  /* ---------- Email: además de abrir Gmail, copia la dirección ---------- */
  document.querySelectorAll('[data-copy]').forEach(function (a) {
    var label = a.querySelector('small');
    var text = label ? label.textContent : '';
    a.addEventListener('click', function () {
      if (!navigator.clipboard || !label) return;
      navigator.clipboard.writeText(a.getAttribute('data-copy')).then(function () {
        label.textContent = text + ' — copiado ✓';
        setTimeout(function () { label.textContent = text; }, 2500);
      }).catch(function () {});
    });
  });

  /* ---------- Enlaces aún sin definir (demos, WhatsApp, email) ---------- */
  document.querySelectorAll('a[href="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); });
  });
})();
