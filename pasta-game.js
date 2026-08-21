/**
 * Torre di Pasta Balance - V6.1 (Stronger Wind, Ketchup on Top & Auto-Round Meatballs)
 */

(function () {
  'use strict';

  // ── AUDIO MANAGER ──
  const sfx = {
    bgm: new Audio('assets/bgm.mp3'),
    wind: new Audio('assets/wind.mp3'),
    hit: new Audio('assets/hit.mp3'),
    squirt: new Audio('assets/squirt.mp3')
  };

  sfx.bgm.loop = true;
  sfx.bgm.volume = 0.3;
  sfx.wind.loop = true;
  sfx.wind.volume = 0.0;

  function playSound(name) {
    if (sfx[name]) {
      sfx[name].currentTime = 0;
      sfx[name].play().catch(e => { console.log("Ses çalınamadı:", e); });
    }
  }

  // ── ASSET MANAGER ──
  const imgMeatball = new Image();
  imgMeatball.src = 'assets/meatball.png';

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
    let gameTime = 0;
    let bestTime = parseInt(localStorage.getItem('pastaBalanceBestTime') || '0', 10);

    // Fizik ve Rüzgar
    let angle = 0;
    let angularVelocity = 0;
    let angularAcceleration = 0;
    const gravity = 0.001;
    const damping = 0.95;
    let difficultyMultiplier = 1;

    let windForce = 0;
    let targetWind = 0;
    let windChangeTimer = 0;

    let meatballs = [];
    let meatballTimer = 0;
    let windStreaks = [];

    for (let i = 0; i < 15; i++) {
      windStreaks.push({
        x: Math.random() * canvas.width,
        y: 50 + Math.random() * (canvas.height - 250),
        length: 80 + Math.random() * 150,
        speed: 1.5 + Math.random() * 3,
        opacity: Math.random() * 0.5
      });
    }

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
        // Rüzgar gücü artırıldığı için görsel etki katsayısı ayarlandı
        let visualWind = (currentLevel >= 2) ? windForce * 3000 : 0;
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

        if (imgMeatball.complete && imgMeatball.naturalHeight !== 0) {
          // YENİ: Beyaz arka planlı kare resimleri kusursuz yuvarlağa çeviren maske (Clip)
          ctx.save();
          ctx.beginPath();
          ctx.arc(mb.x, mb.y, mb.size, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip(); // Sınırları belirle

          ctx.drawImage(imgMeatball, mb.x - mb.size, mb.y - mb.size, mb.size * 2, mb.size * 2);
          ctx.restore(); // Maskeyi kaldır

          // Yuvarlağın üstüne tatlı bir parlama
          ctx.beginPath();
          ctx.arc(mb.x - mb.size * 0.3, mb.y - mb.size * 0.3, mb.size * 0.25, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.fill();
        } else {
          // Görsel yoksa veya hata verirse kahverengi top çizmeye devam
          ctx.beginPath();
          ctx.arc(mb.x, mb.y, mb.size, 0, Math.PI * 2);
          ctx.fillStyle = '#8b4513';
          ctx.fill();
        }
      });
    }

    function drawWindStreaks(dt) {
      if (currentLevel < 2) return;

      let maxWind = 0.00030; // Görsel şiddet limiti
      let windIntensity = Math.abs(windForce) / maxWind;
      if (windIntensity < 0.1) return;

      let windDir = windForce > 0 ? 1 : -1;

      ctx.save();
      ctx.lineCap = "round";
      ctx.lineWidth = 2;

      windStreaks.forEach(streak => {
        streak.x += streak.speed * windDir * windIntensity * dt;

        if (windDir > 0 && streak.x > canvas.width + streak.length) {
          streak.x = -streak.length;
          streak.y = 50 + Math.random() * (canvas.height - 250);
        } else if (windDir < 0 && streak.x < -streak.length) {
          streak.x = canvas.width + streak.length;
          streak.y = 50 + Math.random() * (canvas.height - 250);
        }

        ctx.beginPath();
        ctx.moveTo(streak.x, streak.y);
        ctx.lineTo(streak.x + (streak.length * windDir), streak.y);
        ctx.strokeStyle = `rgba(255, 255, 255, ${streak.opacity * windIntensity})`;
        ctx.stroke();
      });
      ctx.restore();
    }

    function drawWindIndicator() {
      if (currentLevel < 2) return;
      ctx.save();
      ctx.translate(canvas.width / 2, 80);

      let maxWind = 0.00030;
      let normalizedWind = windForce / maxWind;
      if (normalizedWind > 1) normalizedWind = 1;
      if (normalizedWind < -1) normalizedWind = -1;

      ctx.font = "bold 13px 'Inter', sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.textAlign = "center";
      ctx.fillText("RÜZGAR YÖNÜ", 0, -15);

      ctx.beginPath();
      ctx.moveTo(-70, 0);
      ctx.lineTo(70, 0);
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(normalizedWind * 70, 0);
      ctx.lineWidth = 4;
      ctx.strokeStyle = normalizedWind > 0 ? "#f39c12" : "#3498db";
      ctx.stroke();

      if (Math.abs(normalizedWind) > 0.1) {
        let arrowX = normalizedWind * 70;
        ctx.beginPath();
        if (normalizedWind > 0) {
          ctx.moveTo(arrowX + 2, 0);
          ctx.lineTo(arrowX - 8, -6);
          ctx.lineTo(arrowX - 8, 6);
        } else {
          ctx.moveTo(arrowX - 2, 0);
          ctx.lineTo(arrowX + 8, -6);
          ctx.lineTo(arrowX + 8, 6);
        }
        ctx.fillStyle = normalizedWind > 0 ? "#f39c12" : "#3498db";
        ctx.fill();
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
      gameTime = 0;
      windForce = 0;
      targetWind = 0;
      meatballs = [];
      meatballTimer = 0;

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
          playSound('bgm');
          playSound('wind');
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
      if (currentLevel === 3 && survivalTime === 40) {
        startLevelTransition(4, "Şefin Şaheseri! Sos Yağmuru! 🍅");
      }
    }

    function startLevelTransition(level, message) {
      gameState = 'LEVEL_TRANSITION';
      currentLevel = level;

      angle = 0;
      angularVelocity = 0;
      applyTowerWobble();
      updateBalanceMeter();

      if (actionsOverlay) {
        if (titleEl) titleEl.textContent = `LEVEL ${level}`;
        if (descEl) descEl.textContent = message;
        if (startBtn) startBtn.style.display = 'none';
        actionsOverlay.style.display = 'flex';
      }

      if (level === 4) {
        const gamePanel = document.getElementById('gamePanel');

        const bottle = document.createElement('div');
        bottle.id = "ketchupBottleAnim";
        bottle.style = "position:absolute; top:-150px; left:50%; transform:translateX(-50%) rotate(180deg); width:100px; height:150px; background:url('assets/ketchup.png') center/contain no-repeat; z-index:100; transition: top 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);";

        if (!imgMeatball.complete) {
          bottle.style.background = "#c0392b";
          bottle.style.borderRadius = "10px";
          bottle.innerHTML = "<div style='color:white;text-align:center;margin-top:60px;font-weight:bold;'>Ketchup</div>";
        }
        gamePanel.appendChild(bottle);

        setTimeout(() => {
          bottle.style.top = "100px";

          setTimeout(() => {
            playSound('squirt');

            // YENİ: KETÇAP ARTIK KULENİN TEPESİNE EKLENİYOR
            const stack = document.querySelector('.tower-stack');
            if (stack && !document.getElementById('level4Item')) {
              const ketchupBlobHtml = `
                   <div class="pasta-piece" id="level4Item" style="animation: gentleBob 2s ease-in-out infinite; transform: scale(0); transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 10;">
                     <div style="width: 70px; height: 35px; background: radial-gradient(ellipse at 50% 30%, #ff4d4d, #d32f2f, #8b0000); border-radius: 50% 50% 40% 40% / 70% 70% 30% 30%; box-shadow: 0 4px 8px rgba(0,0,0,0.4), inset 0 2px 5px rgba(255,255,255,0.4); position:relative; bottom: -5px;">
                        <div style="position: absolute; bottom: -12px; left: 15px; width: 8px; height: 18px; background: #c0392b; border-radius: 10px;"></div>
                        <div style="position: absolute; bottom: -8px; left: 45px; width: 6px; height: 12px; background: #8b0000; border-radius: 10px;"></div>
                     </div>
                   </div>
                 `;
              stack.insertAdjacentHTML('afterbegin', ketchupBlobHtml);
              setTimeout(() => {
                const item = document.getElementById('level4Item');
                if (item) item.style.transform = 'scale(1)';
              }, 50);
            }

            bottle.style.top = "-150px";
            setTimeout(() => bottle.remove(), 500);

          }, 500);
        }, 100);
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

      sfx.bgm.pause();
      sfx.wind.pause();

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

      gameTime += dt;
      let timeStep = dt / 16.666;
      difficultyMultiplier += dt * 0.00001;

      let effectiveGravity = gravity * difficultyMultiplier;
      angularAcceleration = effectiveGravity * Math.sin(angle);

      // YENİ: RÜZGAR ÇOK DAHA GÜÇLÜ (Destek mekaniği belirginleşti)
      if (currentLevel >= 2) {
        windChangeTimer += dt;

        if (windChangeTimer > 1500 + Math.random() * 2000) {
          // Rüzgar gücü 0.00030'dan 0.00060'a çıkarıldı (Yerçekimi ile yarışabilir güçte)
          targetWind = (Math.random() - 0.5) * 0.00060;
          windChangeTimer = 0;
        }

        windForce += (targetWind - windForce) * 0.02;
        angularAcceleration += windForce;

        // YENİ: Rüzgar sesi %80'e kadar çıkabiliyor
        let windVol = Math.abs(windForce) / 0.00040;
        if (windVol > 1) windVol = 1;
        sfx.wind.volume = windVol * 0.8;
      }

      if (currentLevel >= 3) {
        meatballTimer += dt;

        if (meatballTimer > 2000 + Math.random() * 1500) {
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

              playSound('hit');

              let impact = mb.x > currentTowerX ? -0.010 : 0.010;
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

        if (currentLevel >= 2) {
          drawWindStreaks(dt);
          drawWindIndicator();
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