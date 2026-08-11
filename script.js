// ═══════════════════════════════════════════
// azrashn — portfolyo script v3
// ═══════════════════════════════════════════

(function () {
  'use strict';

  // ── DOM references ──
  const files = document.querySelectorAll('.file');
  const tabs = document.querySelectorAll('.tab');
  const panes = document.querySelectorAll('.pane');
  const statusFile = document.getElementById('statusFile');
  const statusLang = document.getElementById('statusLang');
  const sidebar = document.getElementById('sidebar');
  const menuToggle = document.getElementById('menuToggle');
  const editor = document.getElementById('editor');

  // File name + language map for status bar
  const fileMap = {
    hakkimda:    { file: 'hakkimda.md',    lang: 'Markdown' },
    projeler:    { file: 'projeler.json',  lang: 'JSON' },
    oyunlar:     { file: 'oyunlar.mp4',    lang: 'Video' },
    iletisim:    { file: 'iletisim.txt',   lang: 'Plain Text' }
  };

  // ── Tab / File switching ──
  function activate(target) {
    files.forEach(f => {
      const isActive = f.dataset.target === target;
      f.classList.toggle('active', isActive);
      f.setAttribute('aria-selected', isActive);
    });

    tabs.forEach(t => {
      const isActive = t.dataset.tab === target;
      t.classList.toggle('active', isActive);
      t.setAttribute('aria-selected', isActive);
    });

    panes.forEach(p => p.classList.toggle('active', p.id === target));

    // Update status bar
    const info = fileMap[target];
    if (info) {
      if (statusFile) statusFile.textContent = info.file;
      if (statusLang) statusLang.textContent = info.lang;
    }

    // Close mobile sidebar after selection
    closeMobileSidebar();
  }

  files.forEach(f => f.addEventListener('click', () => activate(f.dataset.target)));
  tabs.forEach(t => t.addEventListener('click', () => activate(t.dataset.tab)));

  // ── Keyboard navigation in file tree ──
  const fileArray = Array.from(files);

  document.addEventListener('keydown', (e) => {
    const activeEl = document.activeElement;
    const fileIndex = fileArray.indexOf(activeEl);

    if (fileIndex === -1) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = fileArray[fileIndex + 1] || fileArray[0];
      next.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = fileArray[fileIndex - 1] || fileArray[fileArray.length - 1];
      prev.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      activeEl.click();
    }
  });

  // ── Tab keyboard shortcuts (Ctrl+Tab / Ctrl+Shift+Tab) ──
  const tabTargets = ['hakkimda', 'projeler', 'oyunlar', 'iletisim'];

  document.addEventListener('keydown', (e) => {
    if (!e.ctrlKey || e.key !== 'Tab') return;
    e.preventDefault();

    const currentPane = document.querySelector('.pane.active');
    if (!currentPane) return;

    const currentIndex = tabTargets.indexOf(currentPane.id);
    let nextIndex;

    if (e.shiftKey) {
      nextIndex = currentIndex <= 0 ? tabTargets.length - 1 : currentIndex - 1;
    } else {
      nextIndex = currentIndex >= tabTargets.length - 1 ? 0 : currentIndex + 1;
    }

    activate(tabTargets[nextIndex]);
  });

  // ── Mobile sidebar ──
  let overlay = null;

  function createOverlay() {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    editor.parentNode.insertBefore(overlay, editor);
    overlay.addEventListener('click', closeMobileSidebar);
  }

  function openMobileSidebar() {
    createOverlay();
    sidebar.classList.add('open');
    requestAnimationFrame(() => {
      overlay.classList.add('visible');
    });
    menuToggle.setAttribute('aria-expanded', 'true');
  }

  function closeMobileSidebar() {
    if (!sidebar.classList.contains('open')) return;
    sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('visible');
    menuToggle.setAttribute('aria-expanded', 'false');
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      if (sidebar.classList.contains('open')) {
        closeMobileSidebar();
      } else {
        openMobileSidebar();
      }
    });
  }

  // Close sidebar on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileSidebar();
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
      // Writing
      typedEl.textContent = currentPhrase.substring(0, charIndex + 1);
      charIndex++;

      if (charIndex === currentPhrase.length) {
        // Finished writing — pause then start deleting
        isDeleting = true;
        setTimeout(typeLoop, 1800);
        return;
      }
      setTimeout(typeLoop, 70 + Math.random() * 40);
    } else {
      // Deleting
      typedEl.textContent = currentPhrase.substring(0, charIndex - 1);
      charIndex--;

      if (charIndex === 0) {
        // Finished deleting — move to next phrase
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(typeLoop, 400);
        return;
      }
      setTimeout(typeLoop, 35 + Math.random() * 20);
    }
  }

  // Start typing after a brief pause
  setTimeout(typeLoop, 500);

  // ═══════════════════════════════════════════
  // INTERACTIVE ROUTE — SVG path illumination
  // ═══════════════════════════════════════════
  const routeContainer = document.getElementById('routeContainer');
  const routePathBg = document.getElementById('routePathBg');
  const routePathActive = document.getElementById('routePathActive');
  const routeStops = document.querySelectorAll('.route-stop');
  const routeLabels = document.querySelectorAll('.route-stop-label');

  if (routePathActive && routePathBg && routeContainer) {
    const totalLength = routePathActive.getTotalLength();

    // Initialize: hide active path completely
    routePathActive.style.strokeDasharray = totalLength;
    routePathActive.style.strokeDashoffset = totalLength;

    let currentProgress = 0; // 0 to 1
    let tooltipEl = null;
    let hasCompletedOnce = false;

    // Create tooltip element
    tooltipEl = document.createElement('div');
    tooltipEl.className = 'route-tooltip';
    routeContainer.appendChild(tooltipEl);

    // Get closest point on path for a given mouse position
    function getProgressFromMouse(clientX) {
      const svgRect = routeContainer.getBoundingClientRect();
      const relX = clientX - svgRect.left;
      const ratio = Math.max(0, Math.min(1, relX / svgRect.width));
      return ratio;
    }

    function updateRoute(progress) {
      currentProgress = progress;
      const offset = totalLength * (1 - progress);
      routePathActive.style.strokeDashoffset = offset;

      // Light up stops that have been passed
      const svgRect = routeContainer.getBoundingClientRect();

      routeStops.forEach((stop, i) => {
        // Get stop position as ratio of SVG width
        const cx = parseFloat(stop.getAttribute('cx'));
        const svgWidth = 800; // viewBox width
        const stopRatio = cx / svgWidth;

        if (progress >= stopRatio) {
          stop.classList.add('lit');
          if (routeLabels[i]) routeLabels[i].classList.add('lit');
        } else {
          stop.classList.remove('lit');
          if (routeLabels[i]) routeLabels[i].classList.remove('lit');
        }
      });

      // Show tooltip for nearest stop
      let nearestStop = null;
      let nearestDist = Infinity;

      routeStops.forEach(stop => {
        const cx = parseFloat(stop.getAttribute('cx'));
        const stopRatio = cx / 800;
        const dist = Math.abs(progress - stopRatio);
        if (dist < 0.05 && dist < nearestDist) {
          nearestDist = dist;
          nearestStop = stop;
        }
      });

      if (nearestStop && tooltipEl) {
        const label = nearestStop.dataset.label;
        tooltipEl.textContent = label;
        tooltipEl.classList.add('visible');

        // Position tooltip
        const cx = parseFloat(nearestStop.getAttribute('cx'));
        const cy = parseFloat(nearestStop.getAttribute('cy'));
        const xPercent = (cx / 800) * 100;
        const svgH = routeContainer.querySelector('.route-svg').getBoundingClientRect().height;
        const yRatio = cy / 120;

        tooltipEl.style.left = xPercent + '%';
        tooltipEl.style.top = (yRatio * svgH + 16) + 'px';
        tooltipEl.style.transform = 'translateX(-50%)';
      } else if (tooltipEl) {
        tooltipEl.classList.remove('visible');
      }

      // Check if reached the end
      if (progress > 0.95 && !hasCompletedOnce) {
        hasCompletedOnce = true;
        spawnParticles();
      }
    }

    // Mouse events
    routeContainer.addEventListener('mousemove', (e) => {
      const progress = getProgressFromMouse(e.clientX);
      updateRoute(progress);
    });

    routeContainer.addEventListener('mouseleave', () => {
      if (tooltipEl) tooltipEl.classList.remove('visible');
    });

    // Touch events
    routeContainer.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const progress = getProgressFromMouse(touch.clientX);
      updateRoute(progress);
    }, { passive: false });

    routeContainer.addEventListener('touchend', () => {
      if (tooltipEl) tooltipEl.classList.remove('visible');
    });

    // ── Particle burst at route end ──
    function spawnParticles() {
      const lastStop = routeStops[routeStops.length - 1];
      if (!lastStop) return;

      const svgRect = routeContainer.getBoundingClientRect();
      const cx = parseFloat(lastStop.getAttribute('cx'));
      const cy = parseFloat(lastStop.getAttribute('cy'));

      // Convert SVG coordinates to container pixels
      const xPx = (cx / 800) * svgRect.width;
      const yPx = (cy / 120) * svgRect.height;

      const colors = [
        '#a855f7', '#f43f5e', '#58a6ff', '#3fb950',
        '#f59e0b', '#6366f1', '#e6edf3'
      ];

      for (let i = 0; i < 35; i++) {
        const particle = document.createElement('div');
        particle.className = 'route-particle';

        // Random direction and distance
        const angle = Math.random() * Math.PI * 2;
        const dist = 30 + Math.random() * 60;
        const px = Math.cos(angle) * dist;
        const py = Math.sin(angle) * dist;

        particle.style.left = xPx + 'px';
        particle.style.top = yPx + 'px';
        particle.style.setProperty('--px', px + 'px');
        particle.style.setProperty('--py', py + 'px');
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.width = (2 + Math.random() * 4) + 'px';
        particle.style.height = particle.style.width;
        particle.style.animationDuration = (0.5 + Math.random() * 0.5) + 's';

        routeContainer.appendChild(particle);

        // Cleanup after animation
        particle.addEventListener('animationend', () => {
          particle.remove();
        });
      }
    }

    // Reset route on click (allow re-exploration)
    routeContainer.addEventListener('click', () => {
      if (hasCompletedOnce) {
        hasCompletedOnce = false;
        routePathActive.style.strokeDashoffset = totalLength;
        routeStops.forEach((s, i) => {
          s.classList.remove('lit');
          if (routeLabels[i]) routeLabels[i].classList.remove('lit');
        });
        currentProgress = 0;
      }
    });
  }

})();
