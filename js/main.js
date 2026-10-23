/* ALXZ// — 03:00 — somewhere between code & imagination. */
(function () {
  'use strict';

  // La clase .js ya la pone un script en el <head>, antes de pintar.

  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduced = motionQuery.matches;
  motionQuery.addEventListener('change', function (e) {
    reduced = e.matches;
    if (reduced && heroImg) heroImg.style.translate = '';
  });
  var nav = document.getElementById('nav');
  var toggle = document.getElementById('navToggle');
  var links = document.querySelectorAll('.nav__links a');
  var behindMenu = [document.getElementById('main'), document.querySelector('.footer')];

  /* ---------- Nav: fondo al hacer scroll ---------- */
  function onScrollNav() {
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
  }

  /* ---------- Menú móvil ---------- */
  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    // Con el menú a pantalla completa, el teclado no debe llegar al contenido de detrás.
    behindMenu.forEach(function (el) { if (el) el.inert = open; });
  }
  // Por encima de 860px el botón desaparece (CSS): si el menú quedó abierto al
  // girar la tablet o agrandar la ventana, la página se quedaría sin scroll.
  window.matchMedia('(min-width: 861px)').addEventListener('change', function (e) {
    if (e.matches && nav.classList.contains('is-open')) setMenu(false);
  });
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
  function parallax() {
    var y = window.scrollY;
    if (heroImg && y < window.innerHeight * 1.2) {
      heroImg.style.translate = '0 ' + (y * 0.12).toFixed(1) + 'px';
    }
  }

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
  // Cada sección enciende su enlace del nav; las que no tienen uno propio lo
  // indican con data-nav (Services → Projects; Process y Quote → Contact).
  var sections = Array.prototype.filter.call(
    document.querySelectorAll('main > section[id]'),
    function (s) { return map[s.dataset.nav || s.id]; }
  );

  // La última sección cuyo inicio ya pasó la mitad de la pantalla.
  var current = null;
  function spy() {
    var mid = window.innerHeight * 0.45;
    var active = sections[0];
    sections.forEach(function (s) { if (s.getBoundingClientRect().top <= mid) active = s; });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
      active = sections[sections.length - 1];
    }
    var link = map[active.dataset.nav || active.id];
    if (link === current) return;
    current = link;
    links.forEach(function (a) { a.classList.remove('is-active'); a.removeAttribute('aria-current'); });
    link.classList.add('is-active');
    link.setAttribute('aria-current', 'true');
  }

  /* ---------- Un solo manejador de scroll, una vez por fotograma ---------- */
  var ticking = false;
  function onFrame() {
    onScrollNav();
    if (!reduced) parallax();
    spy();
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onFrame); }
  }, { passive: true });
  onScrollNav();
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

  /* ---------- Cotizador: arma el mensaje de WhatsApp en vivo ---------- */
  var form = document.getElementById('quoteForm');
  var msgBox = document.getElementById('quoteMsg');
  var send = document.getElementById('quoteSend');
  if (form && msgBox && send) {
    var waBase = send.href.split('?')[0];
    var buildMessage = function () {
      var f = form.elements;
      var checked = function (name) {
        return Array.prototype.filter.call(form.querySelectorAll('input[name="' + name + '"]'),
          function (i) { return i.checked; }).map(function (i) { return i.value; });
      };
      var negocio = checked('negocio')[0];
      var nombre = f.nombre.value.trim();
      var lines = ['Hola, vengo de la web de ALXZ// y quiero cotizar un proyecto.', ''];
      if (negocio || nombre) lines.push('• Negocio: ' + [negocio, nombre && '«' + nombre + '»'].filter(Boolean).join(' '));
      if (checked('tipo')[0]) lines.push('• Necesito: ' + checked('tipo')[0]);
      if (checked('extra').length) lines.push('• Que tenga: ' + checked('extra').join(', '));
      if (checked('cuando')[0]) lines.push('• Para: ' + checked('cuando')[0]);
      if (f.detalle.value.trim()) lines.push('', f.detalle.value.trim());
      return lines.join('\n').trim();
    };
    var update = function () {
      var text = buildMessage();
      msgBox.textContent = text;
      send.href = waBase + '?text=' + encodeURIComponent(text);
    };
    form.addEventListener('input', update);
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    update();
  }

  /* ---------- Enlaces aún sin definir (demos, WhatsApp, email) ---------- */
  document.querySelectorAll('a[href="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); });
  });
})();
