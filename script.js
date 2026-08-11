// ═══════════════════════════════════════════
// azrashn — portfolyo script
// ═══════════════════════════════════════════

(function () {
  'use strict';

  // ── DOM references ──
  const files = document.querySelectorAll('.file');
  const tabs = document.querySelectorAll('.tab');
  const panes = document.querySelectorAll('.pane');
  const statusLang = document.getElementById('statusLang');
  const sidebar = document.getElementById('sidebar');
  const menuToggle = document.getElementById('menuToggle');
  const editor = document.getElementById('editor');

  // Language map for status bar
  const langMap = {
    hakkimda: 'Markdown',
    projeler: 'JSON',
    sertifikalar: 'Certificate',
    oyunlar: 'Video',
    iletisim: 'Plain Text'
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

    // Update status bar language
    if (statusLang && langMap[target]) {
      statusLang.textContent = langMap[target];
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
  const tabTargets = ['hakkimda', 'projeler', 'sertifikalar', 'oyunlar', 'iletisim'];

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

  // ── Hero typing effect ──
  const typedEl = document.getElementById('typed');
  const text = 'Yazılım Mühendisliği Öğrencisi & Oyun Geliştirici';
  let charIndex = 0;

  function typeWriter() {
    if (!typedEl) return;
    if (charIndex < text.length) {
      typedEl.textContent += text.charAt(charIndex);
      charIndex++;
      const delay = 55 + Math.random() * 35;
      setTimeout(typeWriter, delay);
    }
  }

  // Start typing after a brief pause
  setTimeout(typeWriter, 400);

})();
