/**
 * Torre di Pasta Balance - Easter Egg Game
 * Sitenin sol altındaki yumurtaya 3 kez tıklandığında açılır.
 */

(function () {
  'use strict';

  // --- EGG TRIGGER LOGIC ---
  let eggClicks = 0;
  let isResetting = false;

  // Wait for DOM to be fully loaded
  document.addEventListener('DOMContentLoaded', () => {
    const eggImg = document.getElementById('eggTriggerImg');
    const gameModal = document.getElementById('pastaGameModal');
    const eggWrapper = document.getElementById('eggTrigger');

    if (!eggImg || !eggWrapper) return;

    eggWrapper.addEventListener('click', () => {
      if (isResetting) return;
      eggClicks++;

      // Shake effect
      eggWrapper.classList.add('shake');
      setTimeout(() => eggWrapper.classList.remove('shake'), 200);

      if (eggClicks === 1) {
        eggImg.src = 'crack.png';
      } else if (eggClicks === 2) {
        eggImg.src = 'opened.png';
      } else if (eggClicks >= 3) {
        openGameModal();
        // Reset egg for next time after a short delay
        isResetting = true;
        setTimeout(() => {
          eggClicks = 0;
          eggImg.src = 'start.png';
          isResetting = false;
        }, 1000);
      }
    });

    // --- GAME ENGINE ---
    const canvas = document.getElementById('pastaGameCanvas');
    if (!canvas || !gameModal) return;
    const ctx = canvas.getContext('2d');

    const closeBtn = document.getElementById('pastaGameCloseBtn');

    // Close button logic
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        gameModal.classList.remove('active');
        document.body.style.overflow = '';
        gameOver(); // Stop game if closed
      });
    }

    function openGameModal() {
      gameModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      resizeCanvas();
      showStartScreen();
    }

    // Resize canvas
    function resizeCanvas() {
      const panel = document.getElementById('gamePanel');
      if (!panel) return;
      canvas.width = panel.clientWidth;
      canvas.height = panel.clientHeight;
    }

    window.addEventListener('resize', resizeCanvas);

    // ── GAME STATE ──
    let gameState = 'IDLE'; // 'IDLE', 'READY', 'PLAYING', 'GAME_OVER'
    let score = 0;
    let lastTime = 0;
    let scoreTimer = 0;
    let best = parseInt(localStorage.getItem('pastaBalanceBest') || '0', 10);

    // Inverted Pendulum Physics Variables
    let angle = 0;
    let angularVelocity = 0;
    let angularAcceleration = 0;

    // GÜNCELLENEN DEĞERLER (Daha yavaş düşüş, daha yüksek sürtünme)
    const gravity = 0.001;
    const damping = 0.95;
    let difficultyMultiplier = 1;

    const scoreEl = document.getElementById('pastaScoreVal');
    const bestEl = document.getElementById('pastaBestVal');
    const actionsOverlay = document.getElementById('pastaGameActions');
    const titleEl = document.getElementById('pastaGameTitle');
    const descEl = document.getElementById('pastaGameDesc');
    const startBtn = document.getElementById('pastaGameStartBtn');

    if (bestEl) bestEl.textContent = best;

    // Background rendering (dark gradient with subtle warm light)
    function drawBackground() {
      // Deep dark gradient
      const grd = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grd.addColorStop(0, '#0c0e18');
      grd.addColorStop(0.4, '#10131e');
      grd.addColorStop(1, '#080a12');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Warm light cone from top center
      const lightGrd = ctx.createRadialGradient(
        canvas.width / 2, -50, 10,
        canvas.width / 2, 150, 400
      );
      lightGrd.addColorStop(0, 'rgba(255, 200, 80, 0.06)');
      lightGrd.addColorStop(0.5, 'rgba(255, 180, 60, 0.02)');
      lightGrd.addColorStop(1, 'transparent');
      ctx.fillStyle = lightGrd;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle circuit board pattern
      ctx.strokeStyle = 'rgba(212, 168, 67, 0.02)';
      ctx.lineWidth = 0.5;
      const gridSize = 40;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height - 140);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height - 140; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }

    // Floating golden dust particles
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
        p.x += Math.sin(time * 0.001 + p.wobble) * 0.3;
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

    function startGame() {
      // 1. TAM SIFIRLAMA (STATE RESET)
      gameState = 'READY';
      score = 0;
      angle = 0;
      angularVelocity = 0;
      angularAcceleration = 0;
      difficultyMultiplier = 1;
      scoreTimer = 0;

      if (scoreEl) scoreEl.textContent = score;
      if (actionsOverlay) actionsOverlay.style.display = 'none';

      const speechBubble = document.getElementById('speechBubble');
      if (speechBubble) {
        speechBubble.innerHTML = '<span>Hazırlan...</span>' +
          '<svg class="swirl-tail" viewBox="0 0 30 24" fill="none"><path d="M15 0 C18 8, 25 10, 20 16 C18 20, 12 22, 15 24" stroke="rgba(212, 168, 67, 0.3)" stroke-width="1.5" stroke-linecap="round"/><path d="M12 4 C10 12, 5 14, 10 18" stroke="rgba(212, 168, 67, 0.2)" stroke-width="1" stroke-linecap="round"/></svg>';
      }

      // 2. HAZIRLIK SÜRESİ (GRACE PERIOD)
      applyTowerWobble(); // Kuleyi dik konuma sıfırla
      updateBalanceMeter();

      // DeltaTime sıçramasını önlemek için lastTime'ı şimdiden sıfırla
      lastTime = performance.now();

      setTimeout(() => {
        if (!gameModal.classList.contains('active')) return; // Modal kapandıysa başlama
        if (gameState !== 'READY') return;

        gameState = 'PLAYING';
        angle = (Math.random() > 0.5 ? 0.01 : -0.01); // Başlangıç açısı

        // METİN GÜNCELLENDİ (İçgüdüsel kontrole uygun)
        if (speechBubble) {
          speechBubble.innerHTML = '<span>Dengele! Kuleyi tutmak istediğin yöne tıkla! 👉</span>' +
            '<svg class="swirl-tail" viewBox="0 0 30 24" fill="none"><path d="M15 0 C18 8, 25 10, 20 16 C18 20, 12 22, 15 24" stroke="rgba(212, 168, 67, 0.3)" stroke-width="1.5" stroke-linecap="round"/><path d="M12 4 C10 12, 5 14, 10 18" stroke="rgba(212, 168, 67, 0.2)" stroke-width="1" stroke-linecap="round"/></svg>';
        }
      }, 1500); // 1.5 saniye hazırlık süresi
    }

    function gameOver() {
      gameState = 'GAME_OVER';

      if (score > best) {
        best = score;
        localStorage.setItem('pastaBalanceBest', best);
        if (bestEl) bestEl.textContent = best;
      }

      if (actionsOverlay) {
        titleEl.textContent = 'Eyvah, Kule Yıkıldı! 💥';
        descEl.textContent = `Skorun: ${score}. Gizli malzemeyi düşürdün!`;
        startBtn.textContent = 'Tekrar Dene';
        actionsOverlay.style.display = 'flex';
      }

      const speechBubble = document.getElementById('speechBubble');
      if (speechBubble) {
        speechBubble.innerHTML = '<span>Mamma mia! Kule devrildi... 🥺</span>' +
          '<svg class="swirl-tail" viewBox="0 0 30 24" fill="none"><path d="M15 0 C18 8, 25 10, 20 16 C18 20, 12 22, 15 24" stroke="rgba(212, 168, 67, 0.3)" stroke-width="1.5" stroke-linecap="round"/><path d="M12 4 C10 12, 5 14, 10 18" stroke="rgba(212, 168, 67, 0.2)" stroke-width="1" stroke-linecap="round"/></svg>';
      }
    }

    function showStartScreen() {
      gameState = 'IDLE';
      angle = 0;
      angularVelocity = 0;
      angularAcceleration = 0;
      applyTowerWobble();
      updateBalanceMeter();

      if (actionsOverlay) {
        titleEl.textContent = 'Torre di Pasta 🍝';
        // METİN GÜNCELLENDİ
        descEl.textContent = 'Kule devrilirken onu tutmak istediğin yöne (sağa veya sola) tıklayarak dengele!';
        startBtn.textContent = 'Başla';
        actionsOverlay.style.display = 'flex';
      }
    }

    if (startBtn) {
      startBtn.addEventListener('click', startGame);
    }

    // ── GAME LOGIC ──
    function updateGameLogic(dt) {
      if (gameState !== 'PLAYING') return;

      // 1. DeltaTime'ı FPS'e (frame) göre normalize et (60 FPS = 1 birim zaman)
      let timeStep = dt / 16.666;

      // Zorluğu biraz daha yavaş artırmak stabilite için daha iyidir
      difficultyMultiplier += dt * 0.00001;

      // 2. İvmeyi yerçekimine göre hesapla (Ters Sarkaç Fiziği)
      let effectiveGravity = gravity * difficultyMultiplier;
      angularAcceleration = effectiveGravity * Math.sin(angle);

      // 3. Hıza ivmeyi ekle
      angularVelocity += angularAcceleration * timeStep;

      // 4. Hıza sürtünme uygula (Damping'i frame hızından bağımsız hale getiriyoruz)
      angularVelocity *= Math.pow(damping, timeStep);

      // 5. Açıyı güncelle
      angle += angularVelocity * timeStep;

      // Bitiş koşulu: Yıkılma sınırı (1.0 radyan ~ 57 derece)
      if (Math.abs(angle) > 1.0) {
        gameOver();
      }

      // Update score (1 point per second balanced)
      scoreTimer += dt;
      if (scoreTimer > 1000) {
        score++;
        if (scoreEl) scoreEl.textContent = score;
        scoreTimer -= 1000;
      }
    }

    // Update tower wobble from CSS
    function applyTowerWobble() {
      const tower = document.getElementById('pastaTower');
      if (tower) {
        tower.style.animation = 'none';
        // 6. Kulenin CSS transform özelliğini güncelle
        tower.style.transform = "translateX(-50%) rotate(" + (angle * 180 / Math.PI) + "deg)";
      }
    }

    // Balance meter animation
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

    // ── User Interaction (Balancing) ──
    const panel = document.getElementById('gamePanel');
    if (panel) {
      panel.addEventListener('mousedown', (e) => {
        if (gameState !== 'PLAYING') return;

        // Don't register clicks on UI elements
        if (e.target.closest('.pasta-game-actions') || e.target.closest('.chef-mascot') || e.target.closest('.pasta-game-close')) return;

        const rect = panel.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const panelCenter = rect.width / 2;

        const normalizedX = (clickX - panelCenter) / panelCenter;

        // KUVVET GÜNCELLENDİ
        const baseForce = 0.005;
        const edgeBonus = 0.005;

        const appliedForce = baseForce + (edgeBonus * Math.abs(normalizedX));

        // MANTIK GÜNCELLENDİ (Sağa tıkla -> Sağa çek)
        if (clickX > panelCenter) {
          angularVelocity += appliedForce;
        } else {
          angularVelocity -= appliedForce;
        }

        // Visual feedback on click
        const tower = document.getElementById('pastaTower');
        if (tower) {
          tower.style.filter = 'brightness(1.3)';
          setTimeout(() => { tower.style.filter = ''; }, 100);
        }
      });
    }

    // ── Main render loop ──
    let animFrame;
    function render(time) {
      // 1. Delta time hesaplama
      let dt = time - lastTime;
      lastTime = time;

      // Delta time'ı sınırla (Sıçramaları önlemek için)
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
        lastTime = time;
      }

      animFrame = requestAnimationFrame(render);
    }

    animFrame = requestAnimationFrame(render);

    // ── Mascot hover interaction ──
    const mascot = document.getElementById('chefMascot');
    if (mascot) {
      mascot.addEventListener('mouseenter', () => {
        mascot.style.transform = 'scale(1.05) translateY(-4px)';
        mascot.style.transition = 'transform 0.3s ease';
      });
      mascot.addEventListener('mouseleave', () => {
        mascot.style.transform = '';
      });
    }
  });

})();