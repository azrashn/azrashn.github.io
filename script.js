// ═══════════════════════════════════════════
// azrashn — portfolyo script v5
// Professional Landing Page
// ═══════════════════════════════════════════

(function () {
  'use strict';

  // ═══════════════════════════════════════════
  // NAVBAR — scroll state & active section
  // ═══════════════════════════════════════════
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.section, .hero-section');
  const navHamburger = document.getElementById('navHamburger');
  const navLinksContainer = document.getElementById('navLinks');

  // Scroll: add 'scrolled' class to navbar
  function updateNavScroll() {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', updateNavScroll, { passive: true });
  updateNavScroll();

  // IntersectionObserver: highlight active nav link
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.dataset.section === id);
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => sectionObserver.observe(section));

  // Hamburger menu toggle
  if (navHamburger) {
    navHamburger.addEventListener('click', () => {
      navHamburger.classList.toggle('open');
      navLinksContainer.classList.toggle('open');
    });
  }

  // Close mobile menu on link click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navHamburger) navHamburger.classList.remove('open');
      if (navLinksContainer) navLinksContainer.classList.remove('open');
    });
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (navHamburger) navHamburger.classList.remove('open');
      if (navLinksContainer) navLinksContainer.classList.remove('open');
    }
  });

  // ═══════════════════════════════════════════
  // SCROLL REVEAL — fade-in elements on scroll
  // ═══════════════════════════════════════════
  const revealElements = document.querySelectorAll(
    '.glass-card, .section-title, .section-eyebrow, .journey-track, .cert-list, .hero-content'
  );

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.1
  });

  revealElements.forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });

  // ═══════════════════════════════════════════
  // TYPEWRITER — write/delete loop
  // ═══════════════════════════════════════════
  const typedEl = document.getElementById('typed');
  const phrases = [
    'Oyun Geliştirici',
    'Yazılım Mühendisi',
    'Unity Enthusiast',
    'Problem Çözücü',
    'Arayüz Tasarımcısı'
  ];
  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function typeLoop() {
    if (!typedEl) return;

    const currentPhrase = phrases[phraseIndex];

    if (!isDeleting) {
      typedEl.textContent = currentPhrase.substring(0, charIndex + 1);
      charIndex++;

      if (charIndex === currentPhrase.length) {
        isDeleting = true;
        setTimeout(typeLoop, 1800);
        return;
      }
      setTimeout(typeLoop, 70 + Math.random() * 40);
    } else {
      typedEl.textContent = currentPhrase.substring(0, charIndex - 1);
      charIndex--;

      if (charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(typeLoop, 400);
        return;
      }
      setTimeout(typeLoop, 35 + Math.random() * 20);
    }
  }

  setTimeout(typeLoop, 600);

  // ═══════════════════════════════════════════
  // INTERACTIVE JOURNEY TIMELINE
  // ═══════════════════════════════════════════
  const journeyStops = document.querySelectorAll('.journey-stop');
  let activeStop = null;

  journeyStops.forEach(stop => {
    stop.addEventListener('mouseenter', () => {
      if (activeStop && activeStop !== stop) {
        activeStop.classList.remove('active');
      }
      stop.classList.add('active');
      activeStop = stop;
    });

    stop.addEventListener('click', (e) => {
      e.stopPropagation();
      if (activeStop === stop && stop.classList.contains('active')) {
        stop.classList.remove('active');
        activeStop = null;
      } else {
        if (activeStop) activeStop.classList.remove('active');
        stop.classList.add('active');
        activeStop = stop;
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (activeStop && !e.target.closest('.journey-stop')) {
      activeStop.classList.remove('active');
      activeStop = null;
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && activeStop) {
      activeStop.classList.remove('active');
      activeStop = null;
    }
  });

})();
