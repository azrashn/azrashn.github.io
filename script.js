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

  // Global Escape Key Listener implemented below

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
      } else {
        entry.target.classList.remove('visible');
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
    'Yazılım Mühendisliği Öğrencisi',
    'Grafik Tasarım Öğrencisi',
    'Oyun Geliştirici (Unity)'
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


// --- VIDEO MODAL LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
  const videoBtns = document.querySelectorAll('.video-btn');
  const videoModal = document.getElementById('videoModal');
  const videoModalClose = document.querySelector('.video-modal-close');
  const videoModalBackdrop = document.querySelector('.video-modal-backdrop');
  const modalIframe = document.getElementById('modalIframe');

  if (!videoModal || !modalIframe) return;

  function openVideoModal(videoId) {
    modalIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    videoModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeVideoModal() {
    videoModal.classList.remove('active');
    modalIframe.src = '';
    document.body.style.overflow = '';
  }

  videoBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const videoId = btn.getAttribute('data-video');
      if (videoId) {
        openVideoModal(videoId);
      }
    });
  });

  videoModalClose.addEventListener('click', closeVideoModal);
  videoModalBackdrop.addEventListener('click', closeVideoModal);

  // Escape listener handled globally
  
  // ═══════════════════════════════════════════
  // GLOBAL - Interactive Spotlight
  // ═══════════════════════════════════════════
  const globalSpotlight = document.getElementById('globalSpotlight');
  if (globalSpotlight) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let isTicking = false;

    const updateSpotlight = () => {
      globalSpotlight.style.setProperty('--mouse-x', `${mouseX}px`);
      globalSpotlight.style.setProperty('--mouse-y', `${mouseY}px`);
      isTicking = false;
    };

    const onPointerMove = (e) => {
      mouseX = e.clientX || (e.touches && e.touches[0].clientX);
      mouseY = e.clientY || (e.touches && e.touches[0].clientY);
      
      if (!isTicking) {
        requestAnimationFrame(updateSpotlight);
        isTicking = true;
      }
    };

    document.addEventListener('mousemove', onPointerMove, { passive: true });
    document.addEventListener('touchmove', onPointerMove, { passive: true });
  }
})();

// --- DETAILS MODAL LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
  const detailsBtns = document.querySelectorAll('.details-btn');
  
  detailsBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const modalId = btn.getAttribute('data-modal');
      if (modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
          modal.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      }
    });
  });

  const detailModals = document.querySelectorAll('.details-modal');
  detailModals.forEach(modal => {
    const closeBtn = modal.querySelector('.details-modal-close');
    const backdrop = modal.querySelector('.details-modal-backdrop');

    const closeModal = () => {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);
  });

  // Global Event Listeners
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeVideoModal = document.querySelector('.video-modal.active');
      const activeDetailModal = document.querySelector('.details-modal.active');
      
      if (activeVideoModal) {
        activeVideoModal.classList.remove('active');
        const modalIframe = document.getElementById('modalIframe');
        if (modalIframe) modalIframe.src = '';
        document.body.style.overflow = '';
        return;
      }
      if (activeDetailModal) {
        activeDetailModal.classList.remove('active');
        document.body.style.overflow = '';
        return; 
      }
      
      const navHamburger = document.getElementById('navHamburger');
      const navLinksContainer = document.getElementById('navLinks');
      if (navHamburger && navHamburger.classList.contains('open')) {
        navHamburger.classList.remove('open');
        if (navLinksContainer) navLinksContainer.classList.remove('open');
      }
    }
  });
});
