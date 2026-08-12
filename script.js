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
  // INTERACTIVE JOURNEY TIMELINE
  // ═══════════════════════════════════════════
  const journeyStops = document.querySelectorAll('.journey-stop');
  let activeStop = null;

  journeyStops.forEach(stop => {
    // Mouse enter — activate
    stop.addEventListener('mouseenter', () => {
      if (activeStop && activeStop !== stop) {
        activeStop.classList.remove('active');
      }
      stop.classList.add('active');
      activeStop = stop;
    });

    // Click — toggle (for mobile & accessibility)
    stop.addEventListener('click', () => {
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

  // Close active card when clicking outside
  document.addEventListener('click', (e) => {
    if (activeStop && !e.target.closest('.journey-stop')) {
      activeStop.classList.remove('active');
      activeStop = null;
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && activeStop) {
      activeStop.classList.remove('active');
      activeStop = null;
    }
  });

})();
