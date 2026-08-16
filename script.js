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
  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function typeLoop() {
    if (!typedEl) return;

    // Dinamik dil dizisini al
    let currentLangStr = typeof currentLang !== 'undefined' ? currentLang : (localStorage.getItem('lang') || 'tr');
    let phrases = ['...', '...', '...'];
    if (typeof translations !== 'undefined' && translations[currentLangStr]) {
      phrases = [
        translations[currentLangStr].typewriter_1,
        translations[currentLangStr].typewriter_2,
        translations[currentLangStr].typewriter_3
      ];
    }
    
    if (phraseIndex >= phrases.length) phraseIndex = 0;
    const currentPhrase = phrases[phraseIndex] || "";

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

  let activeVideoId = null;
  let videoStartTime = 0;

  function openVideoModal(videoId) {
    modalIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    videoModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    activeVideoId = videoId;
    videoStartTime = Date.now();
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'video_view_start', { video_id: videoId });
    }
  }

  function closeVideoModal() {
    videoModal.classList.remove('active');
    modalIframe.src = '';
    document.body.style.overflow = '';

    if (activeVideoId && videoStartTime > 0) {
      const duration = Math.round((Date.now() - videoStartTime) / 1000);
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'video_view_duration', { video_id: activeVideoId, duration_seconds: duration });
      }
      activeVideoId = null;
      videoStartTime = 0;
    }
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
});

// --- DETAILS MODAL LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
  const detailsBtns = document.querySelectorAll('.details-btn');
  let activeDetailId = null;
  let detailStartTime = 0;
  
  detailsBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const modalId = btn.getAttribute('data-modal');
      if (modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
          modal.classList.add('active');
          document.body.style.overflow = 'hidden';

          activeDetailId = modalId;
          detailStartTime = Date.now();
          if (typeof window.gtag === 'function') {
            window.gtag('event', 'project_details_view_start', { project_id: modalId });
          }
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

      if (activeDetailId === modal.id && detailStartTime > 0) {
        const duration = Math.round((Date.now() - detailStartTime) / 1000);
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'project_details_view_duration', { project_id: modal.id, duration_seconds: duration });
        }
        activeDetailId = null;
        detailStartTime = 0;
      }
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
        
        if (typeof window.gtag === 'function') {
           window.gtag('event', 'modal_closed_via_escape');
        }
        return;
      }
      if (activeDetailModal) {
        activeDetailModal.classList.remove('active');
        document.body.style.overflow = '';
        
        if (typeof window.gtag === 'function') {
           window.gtag('event', 'modal_closed_via_escape');
        }
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

  // ═══════════════════════════════════════════
  // THEME TOGGLE
  // ═══════════════════════════════════════════
  const themeToggle = document.getElementById('themeToggle');
  const sunIcon = document.querySelector('.sun-icon');
  const moonIcon = document.querySelector('.moon-icon');
  
  let currentTheme = localStorage.getItem('theme');
  if (!currentTheme) {
    currentTheme = 'dark';
    localStorage.setItem('theme', 'dark');
  }

  if (currentTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    if (sunIcon && moonIcon) {
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
    }
  } else {
    document.documentElement.removeAttribute('data-theme');
    if (sunIcon && moonIcon) {
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
    }
  }
  
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      if (isLight) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'dark');
        if (sunIcon && moonIcon) {
          sunIcon.style.display = 'block';
          moonIcon.style.display = 'none';
        }
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        if (sunIcon && moonIcon) {
          sunIcon.style.display = 'none';
          moonIcon.style.display = 'block';
        }
      }
    });
  }

  // ═══════════════════════════════════════════
  // LANGUAGE TOGGLE
  // ═══════════════════════════════════════════
  const langToggle = document.getElementById('langToggle');
  let currentLang = localStorage.getItem('lang');
  if (!currentLang) {
    currentLang = 'tr';
    localStorage.setItem('lang', 'tr');
  }
  
  function applyLanguage(lang) {
    if (typeof translations === 'undefined') return;
    const dict = translations[lang];
    if (!dict) return;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = dict[key];
        } else {
          el.innerHTML = dict[key];
        }
      }
    });
    if (langToggle) {
      langToggle.textContent = lang === 'tr' ? 'EN' : 'TR';
    }
    
    // Reset typewriter to show new language immediately
    if (typeof charIndex !== 'undefined') {
      charIndex = 0;
      phraseIndex = 0;
      isDeleting = false;
      const typedEl = document.getElementById('typed');
      if(typedEl) typedEl.textContent = '';
    }
  }
  
  if (langToggle) {
    langToggle.addEventListener('click', () => {
      currentLang = currentLang === 'tr' ? 'en' : 'tr';
      localStorage.setItem('lang', currentLang);
      applyLanguage(currentLang);
    });
  }
  
  if (typeof translations !== 'undefined') {
    applyLanguage(currentLang);
  }
  
  // ═══════════════════════════════════════════
  // MASCOT — State Machine (idle / waving / pointing)
  // ═══════════════════════════════════════════
  const mascotContainer = document.getElementById('mascotContainer');
  const mascotSpeech = document.getElementById('mascotSpeech');

  if (mascotContainer && mascotSpeech) {
    // ── State ──
    let mascotState = 'idle'; // 'idle' | 'waving' | 'pointing'
    let waveTimeout = null;
    let activeSection = null; // 'projeler' | 'oyunlar' | null

    // ── Wave function ──
    function triggerWave() {
      // Don't wave if already pointing (pointing has priority)
      if (mascotState === 'pointing') return;

      mascotContainer.classList.add('waving');
      mascotState = 'waving';

      // Set speech text for waving
      mascotSpeech.setAttribute('data-i18n', 'mascot_speech');
      if (typeof applyLanguage === 'function' && typeof currentLang !== 'undefined') {
        applyLanguage(currentLang);
      } else if (typeof translations !== 'undefined') {
        // Fallback if currentLang isn't directly accessible but translations is
        const lang = localStorage.getItem('lang') || 'tr';
        mascotSpeech.innerHTML = translations[lang]['mascot_speech'];
      }

      // Clear any previous wave timeout
      if (waveTimeout) clearTimeout(waveTimeout);

      // Return to idle after wave animation completes (1.6s)
      waveTimeout = setTimeout(() => {
        mascotContainer.classList.remove('waving');
        mascotState = 'idle';
      }, 1600);
    }

    // ── Pointing function ──
    function enterPointing(sectionId) {
      // Clean up waving state if active
      if (waveTimeout) clearTimeout(waveTimeout);
      mascotContainer.classList.remove('waving');

      activeSection = sectionId;
      mascotState = 'pointing';
      mascotContainer.classList.add('pointing');

      // Update speech bubble text with i18n keys
      const key = sectionId === 'projeler' ? 'mascot_speech_projects' : 'mascot_speech_games';
      mascotSpeech.setAttribute('data-i18n', key);
      
      if (typeof applyLanguage === 'function' && typeof currentLang !== 'undefined') {
        applyLanguage(currentLang);
      } else if (typeof translations !== 'undefined') {
        const lang = localStorage.getItem('lang') || 'tr';
        mascotSpeech.innerHTML = translations[lang][key];
      }
    }

    function exitPointing() {
      mascotContainer.classList.remove('pointing');
      mascotState = 'idle';
      activeSection = null;
    }

    // ── Eye Tracking (Optimized with requestAnimationFrame) ──
    let mouseX = 0;
    let mouseY = 0;
    let isTracking = false;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isTracking) {
        requestAnimationFrame(updateEyes);
        isTracking = true;
      }
    });

    function updateEyes() {
      if (mascotState === 'hurt') {
        isTracking = false;
        return;
      }

      document.querySelectorAll('.mascot-eye').forEach(eye => {
        const rect = eye.getBoundingClientRect();
        // Calculate separate center for each eye
        const eyeCenterX = rect.left + rect.width / 2;
        const eyeCenterY = rect.top + rect.height / 2;

        const dx = mouseX - eyeCenterX;
        const dy = mouseY - eyeCenterY;
        const angle = Math.atan2(dy, dx);
        
        // Strict boundary to keep pupil inside eye white (max radius 4px)
        const distance = Math.min(4, Math.hypot(dx, dy) / 40);

        const pupilX = Math.cos(angle) * distance;
        const pupilY = Math.sin(angle) * distance;

        const pupilGroup = eye.querySelector('.pupil-group');
        if (pupilGroup) {
          pupilGroup.style.transform = `translate(${pupilX}px, ${pupilY}px)`;
        }
      });
      isTracking = false;
    }

    // ── Hover → wave ──
    mascotContainer.addEventListener('mouseenter', () => {
      if (mascotState !== 'hurt') {
        triggerWave();
      }
    });

    // ── Click → Hurt ──
    let hurtTimeout = null;
    let nextHurtType = 1; // 1, 2, 3 cycle

    mascotContainer.addEventListener('click', () => {
      if (mascotState === 'hurt') return;

      // Clean up previous animations
      if (waveTimeout) clearTimeout(waveTimeout);
      mascotContainer.classList.remove('waving');

      mascotState = 'hurt';
      
      // Select sequential hurt type (1 -> 2 -> 3 -> 1)
      const hurtClass = `hurt-${nextHurtType}`;
      nextHurtType = nextHurtType >= 3 ? 1 : nextHurtType + 1;
      
      mascotContainer.classList.add(hurtClass);

      if (hurtTimeout) clearTimeout(hurtTimeout);
      hurtTimeout = setTimeout(() => {
        mascotContainer.classList.remove(hurtClass);
        // Return to appropriate state
        if (activeSection) {
          mascotState = 'pointing';
        } else {
          mascotState = 'idle';
        }
      }, 1500);
    });

    // ── IntersectionObserver for Projeler & Oyunlar ──
    const mascotSections = {
      projeler: document.getElementById('projeler'),
      oyunlar: document.getElementById('oyunlar')
    };

    const mascotObserverOptions = {
      root: null,
      rootMargin: '-15% 0px -35% 0px',
      threshold: 0
    };

    const mascotSectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const sectionId = entry.target.id;

        if (entry.isIntersecting) {
          enterPointing(sectionId);
        } else {
          // Only exit if this was the active section
          if (activeSection === sectionId) {
            exitPointing();
          }
        }
      });
    }, mascotObserverOptions);

    // Observe target sections
    Object.values(mascotSections).forEach(section => {
      if (section) mascotSectionObserver.observe(section);
    });
  }
});
