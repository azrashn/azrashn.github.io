/**
 * Torre di Pasta Balance - V2.2 (Time-Based Survival & Wind Nerf)
 */

(function () {
  'use strict';

  // --- EGG TRIGGER LOGIC ---
  let eggClicks = 0;
  let isResetting = false;

  document.addEventListener('DOMContentLoaded', () => {
    const eggImg = document.getElementById('eggTriggerImg');
    const gameModal = document.getElementById('pastaGameModal');
    const eggWrapper = document.getElementById('eggTrigger');

    if (eggImg && eggWrapper) {
      eggWrapper.addEventListener('click', () => {
        if (isResetting) return;
        eggClicks++;
        eggWrapper.classList.add('shake');
        setTimeout(() => eggWrapper.classList.remove('shake'), 200);

        if (eggClicks === 1) eggImg.src = 'assets/crack.png';
        else if (eggClicks === 2) eggImg.src = 'assets/opened.png';
        else if (eggClicks >= 3) {
          openGameModal();
          isResetting = true;
          setTimeout(() => {
            eggClicks = 0;
            eggImg.src = 'assets/start.png';
            isResetting = false;
          }, 1000);
        }
      });
    }

    // --- GAME ENGINE ---
    const canvas = document.getElementById('pastaGameCanvas');
    if (!canvas || !gameModal) return;
    const ctx = canvas.getContext('2d');
    const closeBtn = document.getElementById('pastaGameCloseBtn');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        gameModal.classList.remove('active');
        document.body.style.overflow = '';
        gameOver();
      });
    }

    function openGameModal() {
      gameModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      resizeCanvas();
      showStartScreen();
    }

    function resizeCanvas() {
      const panel = document.getElementById('gamePanel');
      if (!panel) return;
      canvas.width = panel.clientWidth;
      canvas.height = panel.clientHeight;
    }
    window.addEventListener('resize', resizeCanvas);

    // ── GAME STATE & LEVEL MANAGER ──
    let gameState = 'IDLE';
    let currentLevel = 1;
    let survivalTime = 0; // Skor yerine saniye bazlı hayatta kalma süresi
    let lastTime = null;
    let timeTimer = 0;
    let bestTime = parseInt(localStorage.getItem('pastaBalanceBestTime') || '0', 10);

    // Fizik ve Rüzgar (Wind)
    let angle = 0;
    let angularVelocity = 0;
    let angularAcceleration = 0;
    const gravity = 0.001;
    const damping = 0.95;
    let difficultyMultiplier = 1;
    let windForce = 0;

    // DOM Elements (Skor yazılarını Süre'ye çeviriyoruz)
    const scoreEl = document.getElementById('scoreVal') || document.getElementById('pastaScoreVal');
    const bestEl = document.getElementById('bestVal') || document.getElementById('pastaBestVal');
    const actionsOverlay = document.getElementById('pastaGameActions');
    const titleEl = document.getElementById('pastaGameTitle');
    const descEl = document.getElementById('pastaGameDesc');
    const startBtn = document.getElementById('pastaGameStartBtn');

    // UI Etiketlerini Dinamik Olarak Güncelleme ("Skor" -> "Süre")
    const hudLabels = document.querySelectorAll('.hud-label');
    if (hudLabels.length >= 2) {
      hudLabels[0].textContent = "Süre";
      hudLabels[1].textContent = "En İyi";
    }

    if (bestEl) bestEl.textContent = bestTime + "s";
    if (scoreEl) scoreEl.textContent = survivalTime + "s";

    // --- RENDER FUNCTIONS ---
    function drawBackground() {
      const grd = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grd.addColorStop(0, '#0c0e18');
      grd.addColorStop(0.4, '#10131e');
      grd.addColorStop(1, '#080a12');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const lightGrd = ctx.createRadialGradient(
        canvas.width / 2, -50, 10,
        canvas.width / 2, 150, 400
      );
      lightGrd.addColorStop(0, 'rgba(255, 200, 80, 0.06)');
      lightGrd.addColorStop(0.5, 'rgba(255, 180, 60, 0.02)');
      lightGrd.addColorStop(1, 'transparent');
      ctx.fillStyle = lightGrd;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const dustParticles = [];
    for (let i = 0; i < 20; i++) {
      dustParticles.push({
        x: Math.random() * 860,
        y: Math.random() * 480,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.3 + 0.1,
        opacity: Math.random() * 0.3 + 0.1,
        wobble: Math.random() * Math.PI * 2
      });
    }

    function drawDustParticles(time) {
      dustParticles.forEach(p => {
        p.y -= p.speed;
        let visualWind = (currentLevel >= 2) ? Math.sin(time * 0.001) * 1.5 : 0;
        p.x += Math.sin(time * 0.001 + p.wobble) * 0.3 + visualWind;
        p.opacity = 0.1 + Math.sin(time * 0.002 + p.wobble) * 0.1;

        if (p.y < 0) {
          p.y = canvas.height - 160;
          p.x = Math.random() * canvas.width;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 168, 67, ${p.opacity})`;
        ctx.fill();
      });
    }

    // ── CORE SYSTEMS: COUNTDOWN & LEVEL TRANSITION ──
    function startCountdown() {
      gameState = 'COUNTDOWN';
      survivalTime = 0;
      currentLevel = 1;
      angle = 0;
      angularVelocity = 0;
      angularAcceleration = 0;
      difficultyMultiplier = 1;
      timeTimer = 0;
      windForce = 0;

      if (scoreEl) scoreEl.textContent = "0s";
      applyTowerWobble();
      updateBalanceMeter();

      if (actionsOverlay) {
        actionsOverlay.style.display = 'flex';
        if (startBtn) startBtn.style.display = 'none';
      }

      let count = 3;
      if (titleEl) {
        titleEl.textContent = count;
        titleEl.style.fontSize = "72px";
      }
      if (descEl) descEl.textContent = "Hazırlan...";

      const countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
          if (titleEl) titleEl.textContent = count;
        } else if (count === 0) {
          if (titleEl) titleEl.textContent = "MANGIA!";
        } else {
          clearInterval(countdownInterval);
          if (actionsOverlay) actionsOverlay.style.display = 'none';
          if (titleEl) titleEl.style.fontSize = "42px";

          gameState = 'PLAYING';
          lastTime = null;
          angle = (Math.random() > 0.5 ? 0.01 : -0.01);
        }
      }, 1000);
    }

    function checkLevelProgress() {
      // 10. Saniyede Level 2 (Rüzgar)
      if (currentLevel === 1 && survivalTime === 10) {
        startLevelTransition(2, "Rüzgarlı Teras! Dikkatli Ol 💨");
      }
      // 25. Saniyede Level 3 (Köfte Yağmuru)
      if (currentLevel === 2 && survivalTime === 25) {
        startLevelTransition(3, "Mamma Mia! Köfte Yağmuru Başlıyor ☄️");
      }
    }

    function startLevelTransition(level, message) {
      gameState = 'LEVEL_TRANSITION';
      currentLevel = level;

      if (actionsOverlay) {
        if (titleEl) titleEl.textContent = `LEVEL ${level}`;
        if (descEl) descEl.textContent = message;
        if (startBtn) startBtn.style.display = 'none';
        actionsOverlay.style.display = 'flex';
      }

      setTimeout(() => {
        if (gameState !== 'LEVEL_TRANSITION') return;
        if (actionsOverlay) actionsOverlay.style.display = 'none';
        lastTime = null;
        gameState = 'PLAYING';
      }, 2000);
    }

    function gameOver() {
      gameState = 'GAME_OVER';

      if (survivalTime > bestTime) {
        bestTime = survivalTime;
        localStorage.setItem('pastaBalanceBestTime', bestTime);
        if (bestEl) bestEl.textContent = bestTime + "s";
      }

      if (actionsOverlay) {
        if (titleEl) titleEl.textContent = 'Eyvah, Kule Yıkıldı! 💥';
        if (descEl) descEl.textContent = `Dayanılan Süre: ${survivalTime} Saniye`;
        if (startBtn) {
          startBtn.textContent = 'Tekrar Dene';
          startBtn.style.display = 'block';
        }
        actionsOverlay.style.display = 'flex';
      }
    }

    function showStartScreen() {
      gameState = 'IDLE';
      angle = 0;
      angularVelocity = 0;
      applyTowerWobble();
      updateBalanceMeter();

      if (actionsOverlay) {
        if (titleEl) titleEl.textContent = 'Torre di Pasta 🍝';
        if (descEl) descEl.textContent = 'Kule devrilirken onu tutmak istediğin yöne tıklayarak dengele!';
        if (startBtn) {
          startBtn.textContent = 'Başla';
          startBtn.style.display = 'block';
        }
        actionsOverlay.style.display = 'flex';
      }
    }

    if (startBtn) {
      startBtn.addEventListener('click', startCountdown);
    }

    // ── GAME LOGIC ──
    function updateGameLogic(dt) {
      if (gameState !== 'PLAYING') return;

      let timeStep = dt / 16.666;
      difficultyMultiplier += dt * 0.00001;

      let effectiveGravity = gravity * difficultyMultiplier;
      angularAcceleration = effectiveGravity * Math.sin(angle);

      // ZAYIFLATILMIŞ RÜZGAR (Eski değer 0.0003, yeni değer 0.00006)
      if (currentLevel >= 2) {
        windForce = Math.sin(Date.now() * 0.001) * 0.00006;
        angularAcceleration += windForce;
      }

      angularVelocity += angularAcceleration * timeStep;
      angularVelocity *= Math.pow(damping, timeStep);
      angle += angularVelocity * timeStep;

      if (Math.abs(angle) > 1.0) {
        gameOver();
      }

      // SÜRE SİSTEMİ GÜNCELLENDİ (Tam saniye bazlı artış)
      timeTimer += dt;
      if (timeTimer >= 1000) {
        survivalTime++;
        if (scoreEl) scoreEl.textContent = survivalTime + "s";
        timeTimer -= 1000;
        checkLevelProgress();
      }
    }

    function applyTowerWobble() {
      const tower = document.getElementById('pastaTower');
      if (tower) {
        tower.style.animation = 'none';
        tower.style.transform = "translateX(-50%) rotate(" + (angle * 180 / Math.PI) + "deg)";
      }
    }

    function updateBalanceMeter() {
      const normalizedAngle = (angle + 1.0) / 2.0;
      const leftFill = document.querySelector('.meter-fill-left');
      const rightFill = document.querySelector('.meter-fill-right');

      if (leftFill && rightFill) {
        let leftWidth = Math.max(0, (0.5 - normalizedAngle) * 100);
        let rightWidth = Math.max(0, (normalizedAngle - 0.5) * 100);
        leftFill.style.width = leftWidth + '%';
        rightFill.style.width = rightWidth + '%';
      }
    }

    // ── USER INPUT ──
    const panel = document.getElementById('gamePanel');
    if (panel) {
      panel.addEventListener('mousedown', (e) => {
        if (gameState !== 'PLAYING') return;

        if (e.target.closest('#pastaGameActions') || e.target.closest('.chef-mascot')) return;

        const rect = panel.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const panelCenter = rect.width / 2;
        const normalizedX = (clickX - panelCenter) / panelCenter;

        const baseForce = 0.005;
        const edgeBonus = 0.005;
        const appliedForce = baseForce + (edgeBonus * Math.abs(normalizedX));

        if (clickX > panelCenter) {
          angularVelocity += appliedForce;
        } else {
          angularVelocity -= appliedForce;
        }

        const tower = document.getElementById('pastaTower');
        if (tower) {
          tower.style.filter = 'brightness(1.3)';
          setTimeout(() => { tower.style.filter = ''; }, 100);
        }
      });
    }

    // ── RENDER LOOP ──
    function render(time) {
      if (lastTime === null) lastTime = time;

      let dt = time - lastTime;
      lastTime = time;
      if (dt > 100) dt = 100;

      if (gameModal.classList.contains('active')) {
        drawBackground();
        drawDustParticles(time);

        if (gameState === 'PLAYING') {
          updateGameLogic(dt);
        }

        applyTowerWobble();
        updateBalanceMeter();
      } else {
        lastTime = null;
      }

      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

  });
})();