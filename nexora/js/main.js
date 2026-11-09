/* =====================================================
   NEXORA — UI Interactions (Vanilla JS)
   ===================================================== */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Sticky navbar on scroll ---------- */
  const navbar = document.querySelector('.navbar-nexora');
  const handleScroll = () => {
    if (window.scrollY > 40) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll);
  handleScroll();

  /* ---------- Mobile menu toggle animation ---------- */
  const toggler = document.querySelector('.navbar-toggler-custom');
  const navCollapse = document.getElementById('mainNav');

  if (toggler && navCollapse) {
    navCollapse.addEventListener('show.bs.collapse', () => toggler.classList.add('active'));
    navCollapse.addEventListener('hide.bs.collapse', () => toggler.classList.remove('active'));

    // Close menu on link click (mobile)
    navCollapse.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        if (navCollapse.classList.contains('show')) {
          bootstrap.Collapse.getOrCreateInstance(navCollapse).hide();
        }
      });
    });
  }

  /* ---------- Smooth scroll for in-page anchors ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId.length > 1) {
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          const offset = 90;
          const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
    });
  });

  /* ---------- Scroll reveal (lightweight IntersectionObserver) ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach((el, i) => {
      el.style.transitionDelay = `${(i % 4) * 0.08}s`;
      observer.observe(el);
    });
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- Back to top button ---------- */
  const backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('show', window.scrollY > 400);
    });
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Form validation (no backend: never fakes a success) ---------- */
  document.querySelectorAll('.needs-validation').forEach(form => {
    const status = form.querySelector('.form-status');
    const say = (msg, cls) => { if (status) { status.textContent = msg; status.className = 'form-status mt-3 ' + cls; } };
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      form.classList.add('was-validated');
      if (!form.checkValidity()) { say('Please fix the highlighted fields.', 'err'); return; }
      const endpoint = form.dataset.formEndpoint;
      if (!endpoint) { say('This form is not connected to a backend yet, so nothing was sent. Please use the contact details above once they are published.', 'info'); return; }
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      try {
        const res = await fetch(endpoint, { method: 'POST', headers: { 'Accept': 'application/json' }, body: new FormData(form) });
        if (!res.ok) throw new Error(res.status);
        say('Thank you — your message has been sent.', 'ok'); form.reset(); form.classList.remove('was-validated');
      } catch (err) { say('Sorry, we could not send your message. Please try again later.', 'err'); }
      btn.disabled = false;
    });
  });

  /* ---------- AVEN config: images, placeholders, optional items ---------- */
  document.querySelectorAll('.img-slot img').forEach(img => {
    const slot = img.parentElement;
    const miss = () => slot.classList.add('missing');
    img.addEventListener('error', miss);
    if (img.complete && img.naturalWidth === 0) miss();
  });
  const C = window.AVEN_CONFIG || {};
  const ct = C.contact || {};
  document.querySelectorAll('[data-config]').forEach(el => {
    const v = ct[el.dataset.config];
    if (v) { el.textContent = v; el.classList.remove('placeholder-text'); }
  });
  document.querySelectorAll('[data-social]').forEach(a => {
    const v = (C.social || {})[a.dataset.social];
    if (v) { a.href = v; a.target = '_blank'; a.rel = 'noopener'; a.hidden = false; }
  });
  Object.entries(C.teamPhotos || {}).forEach(([slug, src]) => {
    const ph = src && document.querySelector('[data-member="' + slug + '"] .team-photo');
    if (ph) { const m = new Image(); m.src = src; m.alt = (ph.parentElement.querySelector('h3') || {}).textContent || ''; m.loading = 'lazy'; m.onload = () => { ph.innerHTML = ''; ph.appendChild(m); }; }
  });
  const cap = document.querySelector('[data-spec="capacity"]');
  if (cap && C.batteryCapacity) cap.textContent = C.batteryCapacity;
  const st = C.stats || {}, keys = ['stations','powerbanks','customers','partners'];
  if (keys.every(k => st[k])) {
    keys.forEach(k => { const el = document.querySelector('[data-stat="' + k + '"]'); if (el) el.textContent = st[k]; });
    const sec = document.getElementById('stats'); if (sec) sec.hidden = false;
  }
  if (C.whatsapp) {
    const w = document.createElement('a');
    w.href = 'https://wa.me/' + C.whatsapp.replace(/\D/g, ''); w.target = '_blank'; w.rel = 'noopener';
    w.className = 'back-to-top show'; w.style.cssText = 'right:auto;left:1.5rem;background:#25D366;opacity:1;visibility:visible;transform:none';
    w.setAttribute('aria-label', 'Chat on WhatsApp'); w.innerHTML = '<i class="bi bi-whatsapp"></i>';
    document.body.appendChild(w);
  }

  /* ---------- Active nav link via scroll position ---------- */
  const links = [...document.querySelectorAll('.navbar-nexora .nav-link')];
  const map = links.map(l => [l, document.querySelector(l.getAttribute('href'))]).filter(x => x[1]);
  const spy = () => {
    const y = window.scrollY + 140; let cur = null;
    map.forEach(([l, sec]) => { if (sec.offsetTop <= y) cur = l; });
    links.forEach(l => l.classList.toggle('active', l === cur));
  };
  window.addEventListener('scroll', spy, { passive: true }); spy();

});
