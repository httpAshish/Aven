/* =====================================================
   NEXORA — UI Interactions (Vanilla JS)
   ===================================================== */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Sticky navbar on scroll ---------- */
  const navbar = document.querySelector('.navbar-nexora');
  const backToTop = document.querySelector('.back-to-top');
  const links = [...document.querySelectorAll('.navbar-nexora .nav-link')];
  const map = links.map(l => [l, document.querySelector(l.getAttribute('href'))]).filter(x => x[1]);

  let scrollTicking = false;
  const onScroll = () => {
    if (!scrollTicking) {
      window.requestAnimationFrame(() => {
        const sy = window.scrollY;
        // 1. Sticky navbar
        if (sy > 40) { navbar?.classList.add('scrolled'); } else { navbar?.classList.remove('scrolled'); }
        // 2. Back to top button
        if (backToTop) { backToTop.classList.toggle('show', sy > 400); }
        // 3. Active nav spy
        const y = sy + 140; let cur = null;
        map.forEach(([l, sec]) => { if (sec.offsetTop <= y) cur = l; });
        links.forEach(l => l.classList.toggle('active', l === cur));
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

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

  /* ---------- Back to top click handler ---------- */
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Form validation & Direct Email Delivery ---------- */
  document.querySelectorAll('.needs-validation').forEach(form => {
    const status = form.querySelector('.form-status');
    const say = (msg, cls) => {
      if (status) {
        status.innerHTML = msg;
        status.className = 'form-status mt-3 ' + cls;
      }
    };

    const buildGmailUrl = (dataObj) => {
      const to = 'teamaven2005@gmail.com';
      const cc = 'utsavvaja07@gmail.com';
      const subject = dataObj._subject || dataObj.Subject || 'New Enquiry | AVEN Website';
      const lines = [];
      Object.entries(dataObj).forEach(([k, v]) => {
        if (!k.startsWith('_') && k !== 'form-name' && v) {
          lines.push(`${k.replace(/_/g, ' ')}: ${v}`);
        }
      });
      const body = lines.join('\n') + '\n\n---\nSent via AVEN Website';
      return {
        gmail: `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&cc=${encodeURIComponent(cc)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
        mailto: `mailto:${to}?cc=${encodeURIComponent(cc)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      };
    };

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      form.classList.add('was-validated');
      if (!form.checkValidity()) {
        say('Please fill in all required fields correctly.', 'err');
        return;
      }

      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());
      const links = buildGmailUrl(payload);

      // Note: FormSubmit.co blocks requests coming from local file:// protocol (Origin: null).
      // If opened via file://, open pre-filled Gmail / Mail client directly so local testing works immediately.
      if (window.location.protocol === 'file:') {
        window.open(links.gmail, '_blank', 'noopener');
        say(
          '✅ Local <code>file://</code> mode detected — opened <strong>Gmail Compose</strong> pre-filled for <strong>teamaven2005@gmail.com</strong>! ' +
          '(Once pushed to <a href="https://avenpower.netlify.app" target="_blank">avenpower.netlify.app</a>, emails send automatically in the background). ' +
          '<a href="' + links.mailto + '" class="fw-semibold ms-1">Open Default Mail App</a>',
          'ok'
        );
        form.reset();
        form.classList.remove('was-validated');
        return;
      }

      const btn = form.querySelector('button[type="submit"]');
      const origText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Sending…';

      try {
        const endpoint = form.dataset.formEndpoint || 'https://formsubmit.co/ajax/teamaven2005@gmail.com';
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        const json = await res.json().catch(() => ({}));

        if (!res.ok || json.success === 'false' || json.success === false) {
          const msg = json.message || '';
          if (msg.toLowerCase().includes('activate') || msg.toLowerCase().includes('activation')) {
            say(
              '📩 <strong>One-Time Activation Required:</strong> FormSubmit has sent an <strong>"Activate Form"</strong> email to <strong>teamaven2005@gmail.com</strong> (check Inbox &amp; Spam folder). Click <em>Activate Form</em> in that email once to enable automatic emails! Meanwhile, <a href="' + links.gmail + '" target="_blank" class="fw-bold">click here to send via Gmail</a>.',
              'info'
            );
          } else {
            window.open(links.gmail, '_blank', 'noopener');
            say(
              '✅ Opened <strong>Gmail</strong> pre-filled to <strong>teamaven2005@gmail.com</strong>! (<a href="' + links.mailto + '">Or use Mail App</a>)',
              'ok'
            );
          }
          form.reset();
          form.classList.remove('was-validated');
          return;
        }

        say('✅ Thank you! Your message has been sent successfully to <strong>teamaven2005@gmail.com</strong>. We will get back to you shortly.', 'ok');
        form.reset();
        form.classList.remove('was-validated');
      } catch (err) {
        window.open(links.gmail, '_blank', 'noopener');
        say(
          '✅ Opened <strong>Gmail</strong> pre-filled to <strong>teamaven2005@gmail.com</strong>! (<a href="' + links.mailto + '">Or use Mail App</a>)',
          'ok'
        );
        form.reset();
        form.classList.remove('was-validated');
      } finally {
        btn.disabled = false;
        btn.innerHTML = origText;
      }
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
    const key = el.dataset.config;
    const v = ct[key];
    if (v) {
      el.textContent = v;
      el.classList.remove('placeholder-text');
      if (key === 'email' && el.tagName !== 'A') {
        el.innerHTML = `<a href="mailto:${v}" class="text-decoration-none">${v}</a>`;
      } else if (key === 'phone' && el.tagName !== 'A') {
        const tel = v.replace(/[^0-9+]/g, '');
        el.innerHTML = `<a href="tel:${tel}" class="text-decoration-none">${v}</a>`;
      }
    }
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
  const st = C.stats || {}, keys = ['stations', 'powerbanks', 'customers', 'partners'];
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

});
