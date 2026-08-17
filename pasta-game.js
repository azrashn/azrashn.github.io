/**
 * Torre di Pasta Balance - V5 (Visual Wind Curves & Level 4 Fix)
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
    let survivalTime = 0;
    let lastTime = null;
    let timeTimer = 0;
    let gameTime = 0; // YENİ: Rüzgarın aniden tokat atmamasını sağlayan oyun içi saat
    let bestTime = parseInt(localStorage.getItem('pastaBalanceBestTime') || '0', 10);

    // Fizik ve Rüzgar
    let angle = 0;
    let angularVelocity = 0;
    let angularAcceleration = 0;
    const gravity = 0.001;
    const damping = 0.95;
    let difficultyMultiplier = 1;
    let windForce = 0;

    // Köfte Havuzu
    let meatballs = [];
    let meatballTimer = 0;

    const scoreEl = document.getElementById('scoreVal') || document.getElementById('pastaScoreVal');
    const bestEl = document.getElementById('bestVal') || document.getElementById('pastaBestVal');
    const actionsOverlay = document.getElementById('pastaGameActions');
    const titleEl = document.getElementById('pastaGameTitle');
    const descEl = document.getElementById('pastaGameDesc');
    const startBtn = document.getElementById('pastaGameStartBtn');

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
        let visualWind = (currentLevel >= 2) ? Math.sin(gameTime * 0.001) * 1.5 : 0;
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

    function drawMeatballs() {
      meatballs.forEach(mb => {
        if (mb.hit) return;

        ctx.beginPath();
        ctx.arc(mb.x, mb.y, mb.size, 0, Math.PI * 2);
        ctx.fillStyle = '#8b4513';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(mb.x - mb.size * 0.3, mb.y - mb.size * 0.3, mb.size * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fill();
      });
    }

    // YENİ: Senin çizdiğin tasarıma uygun rüzgar çizgileri (Wind Swirls)
    function drawWindLines(time) {
      if (currentLevel < 2) return;

      let maxWind = 0.00006;
      let normalizedWind = windForce / maxWind;

      // Rüzgar çok yavaşken (dalga dönüş noktasındayken) çizgileri gizle
      if (Math.abs(normalizedWind) < 0.2) return;

      ctx.save();
      ctx.lineWidth = 4;
      ctx.lineCap = "round";

      let isBlowingRight = normalizedWind > 0;
      // Rüzgar sağa esiyorsa soldan (x=50) başlar, sola esiyorsa sağdan (x=canvas.width-50) başlar.
      let originX = isBlowingRight ? 50 : canvas.width - 50;
      let dir = isBlowingRight ? 1 : -1;

      // Rüzgarın şiddetine göre opaklık ayarı
      let alpha = Math.abs(normalizedWind) * 0.4;
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`; // Tatlı beyaz/saydam bir rüzgar

      let baseY = canvas.height - 350; // Kule hizası

      // 3 adet kıvrımlı rüzgar çizgisi çizelim
      for (let i = 0; i < 3; i++) {
        let y = baseY + (i * 70) - 50;
        let speed = (time * 0.003) + (i * 100);

        ctx.beginPath();
        // Çizginin başlangıcı
        ctx.moveTo(originX, y + Math.sin(speed) * 15);

        // Çizgiyi uzat ve kıvır (Senin sketch'teki gibi uçları döngülü)
        ctx.quadraticCurveTo(
          originX + (120 * dir), y - 40 + Math.cos(speed) * 20, // Kontrol noktası
          originX + (180 * dir), y + Math.sin(speed + 1) * 30   // Bitiş noktası
        );

        // Ucuna ufak bir kıvrım (swirl) ekle
        ctx.quadraticCurveTo(
          originX + (220 * dir), y + 40 + Math.cos(speed) * 10,
          originX + (160 * dir), y + 20 + Math.sin(speed) * 10
        );

        ctx.stroke();
      }
      ctx.restore();
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
      gameTime = 0; // Oyun içi saati sıfırla
      windForce = 0;
      meatballs = [];
      meatballTimer = 0;

      // Varsa Level 4 domatesini sil (Yeniden başlarken)
      const lvl4Item = document.getElementById('level4Item');
      if (lvl4Item) lvl4Item.remove();

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
      if (currentLevel === 1 && survivalTime === 10) {
        startLevelTransition(2, "Rüzgarlı Teras! Dikkatli Ol 💨");
      }
      if (currentLevel === 2 && survivalTime === 25) {
        startLevelTransition(3, "Mamma Mia! Köfte Yağmuru Başlıyor ☄️");
      }
      if (currentLevel === 3 && survivalTime === 45) {
        startLevelTransition(4, "Şefin Şaheseri! Ağırlık Merkezi Kaydı 🍅");
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

      // LEVEL 4 DOMATESİNİ KULEYE EKLEME MANTIĞI
      if (level === 4) {
        const stack = document.querySelector('.tower-stack');
        if (stack && !document.getElementById('level4Item')) {
          const tomatoHtml = `
             <div class="pasta-piece" id="level4Item" style="animation: gentleBob 2s ease-in-out infinite; transform: scale(0); transition: transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 10;">
               <div style="width: 55px; height: 50px; background: radial-gradient(circle at 30% 30%, #ff6b6b, #c0392b, #8b0000); border-radius: 50%; box-shadow: 0 4px 8px rgba(0,0,0,0.4), inset 0 -3px 6px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.4); border: 2px solid rgba(139,0,0,0.5); position:relative; bottom: -8px;">
                  <div style="position: absolute; top: -4px; left: 50%; transform: translateX(-50%); width: 14px; height: 12px; background: #27ae60; border-radius: 50% 50% 0 0; box-shadow: inset 0 -2px 4px rgba(0,0,0,0.3);"></div>
               </div>
             </div>
           `;
          stack.insertAdjacentHTML('afterbegin', tomatoHtml);
          setTimeout(() => {
            const item = document.getElementById('level4Item');
            if (item) item.style.transform = 'scale(1)';
          }, 50);
        }
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

      gameTime += dt; // Rüzgar için kesintisiz oyun saati akışı
      let timeStep = dt / 16.666;
      difficultyMultiplier += dt * 0.00001;

      let effectiveGravity = gravity * difficultyMultiplier;
      angularAcceleration = effectiveGravity * Math.sin(angle);

      // RÜZGAR: Artık 'Date.now()' değil, duraksamaları tolere eden 'gameTime' kullanılıyor
      if (currentLevel >= 2) {
        windForce = Math.sin(gameTime * 0.001) * 0.00006;
        angularAcceleration += windForce;
      }

      // LEVEL 3 ve 4 MEKANİĞİ: Yağan Köfteler ve DINAMIK ÇARPIŞMA (Hitbox)
      if (currentLevel >= 3) {
        meatballTimer += dt;

        if (meatballTimer > 1000 + Math.random() * 1000) {
          meatballs.push({
            x: Math.random() * canvas.width,
            y: -30,
            size: 15 + Math.random() * 10,
            speed: 0.2 + Math.random() * 0.3,
            hit: false
          });
          meatballTimer = 0;
        }

        const pivotY = canvas.height - 140;

        for (let i = meatballs.length - 1; i >= 0; i--) {
          let mb = meatballs[i];
          mb.y += mb.speed * dt;

          if (!mb.hit && mb.y > pivotY - 280 && mb.y < pivotY) {
            let distanceY = pivotY - mb.y;
            let currentTowerX = (canvas.width / 2) + Math.tan(angle) * distanceY;

            if (Math.abs(mb.x - currentTowerX) < 55) {
              mb.hit = true;
              let impact = mb.x > currentTowerX ? -0.015 : 0.015;
              angularVelocity += impact;

              const tower = document.getElementById('pastaTower');
              if (tower) {
                tower.style.filter = 'brightness(1.5) sepia(1) hue-rotate(-50deg)';
                setTimeout(() => { tower.style.filter = ''; }, 150);
              }
            }
          }

          if (mb.y > canvas.height) {
            meatballs.splice(i, 1);
          }
        }
      }

      angularVelocity += angularAcceleration * timeStep;
      angularVelocity *= Math.pow(damping, timeStep);
      angle += angularVelocity * timeStep;

      if (Math.abs(angle) > 1.0) {
        gameOver();
      }

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

        // LEVEL 4'te oyuncunun kontrol gücü zayıflar
        let currentBaseForce = 0.005;
        let currentEdgeBonus = 0.005;
        if (currentLevel >= 4) {
          currentBaseForce = 0.0035;
          currentEdgeBonus = 0.0035;
        }

        const appliedForce = currentBaseForce + (currentEdgeBonus * Math.abs(normalizedX));

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

        if (currentLevel >= 3) {
          drawMeatballs();
        }

        // YENİ: Canvas üzeri Rüzgar animasyonları
        if (currentLevel >= 2) {
          drawWindLines(time);
        }

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