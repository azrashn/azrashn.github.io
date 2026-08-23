/**
 * Torre di Pasta Balance - V6.2 (Bağımsız sayfa modu + GDD güncellemesi + fizik düzeltmeleri)
 *
 * DEĞİŞİKLİKLER (V6.1 -> V6.2):
 * 1. [KRİTİK FIX] Artık #pastaGameModal aramıyor — bu dosya bağımsız bir sayfa
 *    (pasta-game.html) olarak çalışacak şekilde yeniden düzenlendi. index.html'den
 *    iframe ile açılması önerilir (aşağıdaki entegrasyon dosyasına bak).
 * 2. [FIX] Rüzgar interpolasyonu artık timeStep ile ölçekleniyor (FPS'e bağımlı değil).
 * 3. [GÜNCELLEME] Seviye eşikleri yeni GDD'ye göre: L2=30sn, L3=70sn, L4=120sn.
 * 4. [GÜNCELLEME] Seviye geçiş duraklaması 2000ms -> 1500ms (GDD: "1.5 saniyeliğine duraklatılır").
 * 5. [GÜNCELLEME] Level 4 mesajı GDD metnine göre güncellendi.
 */

(function () {
  'use strict';

  // ── AUDIO MANAGER ──
  const sfx = {
    bgm: new Audio('assets/bgm.mp3'),
    wind: new Audio('assets/wind.mp3'),
    hit: new Audio('assets/hit.mp3'),
    squirt: new Audio('assets/squirt.mp3'),
    combo: new Audio('assets/combo.mp3')
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

  // ── LEVEL / GDD SABİTLERİ ──
  const LEVEL_THRESHOLDS = { 2: 10, 3: 70, 4: 120 }; // saniye (skor) — L1 test için kısaltıldı
  const TRANSITION_PAUSE_MS = 1500; // GDD: "1.5 saniyeliğine duraklatılır"

  document.addEventListener('DOMContentLoaded', () => {
    // --- GAME ENGINE ---
    const canvas = document.getElementById('pastaGameCanvas');
    const gamePanel = document.getElementById('gamePanel');
    if (!canvas || !gamePanel) {
      console.error('pasta-game.js: #pastaGameCanvas veya #gamePanel bulunamadı.');
      return;
    }
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
      canvas.width = gamePanel.clientWidth;
      canvas.height = gamePanel.clientHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // ── GAME STATE ──
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
    const WIND_LERP_SPEED = 0.02; // 60fps baz alınarak ayarlandı, artık timeStep ile çarpılıyor

    let meatballs = [];
    let meatballTimer = 0;
    let windStreaks = [];

    // ── COMBO SİSTEMİ ──
    let comboCount = 0;
    let comboDisplay = null; // {text, timer, opacity}
    let comboParticles = [];
    const COMBO_THRESHOLDS = [3, 5, 10, 15, 20, 30];
    const COMBO_DISPLAY_DURATION = 1500; // ms

    for (let i = 0; i < 15; i++) {
      windStreaks.push({
        x: Math.random() * canvas.width,
        y: 50 + Math.random() * (canvas.height - 250),
        length: 80 + Math.random() * 150,
        speed: 1.5 + Math.random() * 3,
        opacity: Math.random() * 0.5
      });
    }

    const scoreEl = document.getElementById('pastaScoreVal');
    const bestEl = document.getElementById('pastaBestVal');
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
          ctx.save();
          ctx.beginPath();
          ctx.arc(mb.x, mb.y, mb.size, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();

          ctx.drawImage(imgMeatball, mb.x - mb.size, mb.y - mb.size, mb.size * 2, mb.size * 2);
          ctx.restore();

          ctx.beginPath();
          ctx.arc(mb.x - mb.size * 0.3, mb.y - mb.size * 0.3, mb.size * 0.25, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(mb.x, mb.y, mb.size, 0, Math.PI * 2);
          ctx.fillStyle = '#8b4513';
          ctx.fill();
        }
      });
    }

    function drawWindStreaks(dt) {
      if (currentLevel < 2) return;

      let maxWind = 0.00030;
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
      comboCount = 0;
      comboDisplay = null;
      comboParticles = [];

      // Paylaşım butonlarını temizle
      const oldShare = document.getElementById('shareButtons');
      if (oldShare) oldShare.remove();

      // Combo HUD'ı sıfırla
      const comboHud = document.getElementById('comboHud');
      if (comboHud) { comboHud.style.display = 'none'; }
      const comboVal = document.getElementById('comboVal');
      if (comboVal) comboVal.textContent = '0';

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
      if (currentLevel === 1 && survivalTime === LEVEL_THRESHOLDS[2]) {
        startLevelTransition(2, "Level 2: Rüzgarlı Teras! Dikkatli Ol 💨");
      }
      if (currentLevel === 2 && survivalTime === LEVEL_THRESHOLDS[3]) {
        startLevelTransition(3, "Level 3: Mamma Mia! Köfte Yağmuru Başlıyor ☄️");
      }
      if (currentLevel === 3 && survivalTime === LEVEL_THRESHOLDS[4]) {
        startLevelTransition(4, "Level 4: Şefin Şaheseri! Ağırlık Merkezi Kayıyor ⚖️");
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
      }, TRANSITION_PAUSE_MS);
    }

    function gameOver() {
      gameState = 'GAME_OVER';

      sfx.bgm.pause();
      sfx.wind.pause();

      const isNewRecord = survivalTime > bestTime;
      if (isNewRecord) {
        bestTime = survivalTime;
        localStorage.setItem('pastaBalanceBestTime', bestTime);
        if (bestEl) bestEl.textContent = bestTime + "s";
      }

      if (actionsOverlay) {
        if (titleEl) titleEl.textContent = isNewRecord ? 'Yeni Rekor! 🏆' : 'Eyvah, Kule Yıkıldı! 💥';
        if (descEl) descEl.textContent = `Dayanılan Süre: ${survivalTime} Saniye`;
        if (startBtn) {
          startBtn.textContent = 'Tekrar Dene';
          startBtn.style.display = 'block';
        }

        // Paylaşım butonları
        const oldShare = document.getElementById('shareButtons');
        if (oldShare) oldShare.remove();

        const shareDiv = document.createElement('div');
        shareDiv.id = 'shareButtons';
        shareDiv.className = 'share-buttons';

        const siteUrl = 'https://azrashn.github.io';
        const shareText = isNewRecord
          ? `Yeni rekorumu kırdım: ${survivalTime} saniye! 🏆🍝 Torre di Pasta Balance'da beni geçebilir misin?`
          : `Torre di Pasta Balance'da ${survivalTime} saniye dayandım! 🍝 Sen benden iyisini yapabilir misin?`;

        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(siteUrl)}`;
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(siteUrl)}`;
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + siteUrl)}`;
        const instagramShareScript = `navigator.clipboard.writeText('${shareText.replace(/'/g, "\\'")} ${siteUrl}').then(() => alert('Metin panoya kopyalandı! Instagram\\'da yapıştırabilirsiniz.')); return false;`;

        shareDiv.innerHTML = `
          <span class="share-label">Skorunu Paylaş</span>
          <div class="share-btn-row">
            <a href="${twitterUrl}" target="_blank" rel="noopener" class="share-btn share-btn-twitter" title="Twitter/X'te Paylaş">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="${linkedinUrl}" target="_blank" rel="noopener" class="share-btn share-btn-linkedin" title="LinkedIn'de Paylaş">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            <a href="${whatsappUrl}" target="_blank" rel="noopener" class="share-btn share-btn-whatsapp" title="WhatsApp'ta Paylaş">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </a>
            <a href="#" onclick="${instagramShareScript}" class="share-btn share-btn-instagram" title="Instagram'da Paylaş">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
          </div>
        `;

        actionsOverlay.appendChild(shareDiv);
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

      if (currentLevel >= 2) {
        windChangeTimer += dt;

        if (windChangeTimer > 1500 + Math.random() * 2000) {
          targetWind = (Math.random() - 0.5) * 0.00060;
          windChangeTimer = 0;
        }

        // [FIX] Artık timeStep ile ölçekleniyor, FPS'e bağımlı değil
        windForce += (targetWind - windForce) * Math.min(WIND_LERP_SPEED * timeStep, 1);

        // Rüzgar fiziği: Rüzgar yönü kulenin yatma yönüyle aynıysa daha çok devirir,
        // ters yöndeyse kuleyi destekler (stabize eder)
        // windForce > 0 = sağa esiyor, angle > 0 = sağa yatık
        let windEffect = windForce;
        if (Math.sign(windForce) !== 0 && Math.sign(angle) !== 0) {
          if (Math.sign(windForce) === Math.sign(angle)) {
            // Rüzgar kulenin yattığı yöne esiyor → daha fazla devirir
            windEffect = windForce * 1.5;
          } else {
            // Rüzgar kulenin ters yönüne esiyor → kuleyi güçlü şekilde destekler
            windEffect = windForce * 1.8;
          }
        }
        angularAcceleration += windEffect;

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
              comboCount = 0;
              updateComboHud();
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
            // Köfte çarpmadan geçtiyse → combo artır
            if (!mb.hit) {
              comboCount++;
              updateComboHud();
              if (COMBO_THRESHOLDS.includes(comboCount)) {
                triggerComboEffect(comboCount);
              }
            }
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
    gamePanel.addEventListener('mousedown', (e) => {
      if (gameState !== 'PLAYING') return;
      if (e.target.closest('#pastaGameActions') || e.target.closest('.chef-mascot')) return;

      const rect = gamePanel.getBoundingClientRect();
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

    // ── COMBO FONKSİYONLARI ──
    function updateComboHud() {
      const comboHud = document.getElementById('comboHud');
      const comboValEl = document.getElementById('comboVal');
      if (comboHud && comboValEl) {
        if (comboCount > 0 && currentLevel >= 3) {
          comboHud.style.display = '';
          comboValEl.textContent = comboCount;
        } else {
          comboHud.style.display = 'none';
        }
      }
    }

    function triggerComboEffect(count) {
      playSound('combo');

      // Combo yazısı
      let emoji = count >= 15 ? '🔥🔥' : count >= 10 ? '🔥' : '⭐';
      comboDisplay = {
        text: `COMBO x${count}! ${emoji}`,
        timer: COMBO_DISPLAY_DURATION,
        opacity: 1
      };

      // Konfeti parçacıkları
      const cx = canvas.width / 2;
      const cy = 130;
      for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 2 / 12) * i + (Math.random() - 0.5) * 0.3;
        const speed = 1.5 + Math.random() * 2.5;
        comboParticles.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1,
          size: 3 + Math.random() * 4,
          life: 800 + Math.random() * 400,
          maxLife: 800 + Math.random() * 400,
          color: ['#ffd700', '#ff6b35', '#d4a843', '#ff4d4d', '#4ade80'][Math.floor(Math.random() * 5)]
        });
      }
    }

    function drawComboDisplay(dt) {
      if (!comboDisplay) return;

      comboDisplay.timer -= dt;
      if (comboDisplay.timer <= 0) {
        comboDisplay = null;
        return;
      }

      // Fade out in last 400ms
      if (comboDisplay.timer < 400) {
        comboDisplay.opacity = comboDisplay.timer / 400;
      }

      ctx.save();
      ctx.globalAlpha = comboDisplay.opacity;
      ctx.font = "bold 28px 'Inter', sans-serif";
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffd700';
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 15;
      ctx.fillText(comboDisplay.text, canvas.width / 2, 130);
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    function drawComboParticles(dt) {
      for (let i = comboParticles.length - 1; i >= 0; i--) {
        const p = comboParticles[i];
        p.life -= dt;
        if (p.life <= 0) {
          comboParticles.splice(i, 1);
          continue;
        }
        p.x += p.vx * (dt / 16);
        p.y += p.vy * (dt / 16);
        p.vy += 0.08 * (dt / 16); // gravity

        const alpha = p.life / p.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // ── RENDER LOOP ──
    function render(time) {
      if (lastTime === null) lastTime = time;

      let dt = time - lastTime;
      lastTime = time;
      if (dt > 100) dt = 100;

      drawBackground();
      drawDustParticles(time);

      if (currentLevel >= 3) drawMeatballs();
      if (currentLevel >= 2) {
        drawWindStreaks(dt);
        drawWindIndicator();
      }

      if (gameState === 'PLAYING') updateGameLogic(dt);

      // Combo efektleri (canvas üzerine)
      drawComboDisplay(dt);
      drawComboParticles(dt);

      applyTowerWobble();
      updateBalanceMeter();

      requestAnimationFrame(render);
    }

    // Sayfa (iframe) yüklendiği anda oyun hazır ekranı gösterilir
    showStartScreen();
    requestAnimationFrame(render);
  });
})();
