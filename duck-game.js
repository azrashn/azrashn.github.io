/**
 * Balance Duck Easter Egg - Tower Builder Game
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
    const gameModal = document.getElementById('duckGameModal');
    
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
    const canvas = document.getElementById('duckGameCanvas');
    if (!canvas || !gameModal) return;
    
    const ctx = canvas.getContext('2d');
    const closeBtn = document.getElementById('duckGameCloseBtn');
    const scoreEl = document.getElementById('duckGameScoreVal');
    const bestScoreEl = document.getElementById('duckGameBestVal');
    const startBtn = document.getElementById('duckGameStartBtn');
    const retryBtn = document.getElementById('duckGameRetryBtn');
    const actionsContainer = document.querySelector('.duck-game-actions');
    const messageEl = document.getElementById('duckGameMessage');

    // Game States
    const STATE_READY = 0;
    const STATE_PLAYING = 1;
    const STATE_DROPPING = 2;
    const STATE_SETTLING = 3;
    const STATE_GAMEOVER = 4;

    let gameState = STATE_READY;
    let score = 0;
    let bestScore = localStorage.getItem('balanceDuckBestScore') || 0;
    if(bestScoreEl) bestScoreEl.textContent = bestScore;

    // Constants
    const BLOCK_HEIGHT = 30;
    const INITIAL_WIDTH = 200;
    const MIN_WIDTH = 10;
    const FALL_SPEED = 15;
    const PAN_SPEED = 2;
    
    // Dynamic settings
    let currentSpeed = 3;
    let cameraY = 0;
    let targetCameraY = 0;
    
    // Game Objects
    let blocks = []; // Array of {x, y, w, h, color, offset}
    let currentBlock = null;
    let particles = [];
    let debris = []; // Pieces that fall off
    
    // Colors (Theme matching)
    const colors = [
      '#7dd3fc', '#38bdf8', '#0284c7', // Blues
      '#818cf8', '#6366f1', // Indigos
      '#fb7185', '#e11d48', // Roses
      '#34d399', '#059669', // Emeralds
      '#fbbf24', '#d97706'  // Ambers
    ];

    let reqId = null;

    function resizeCanvas() {
      const container = document.querySelector('.duck-game-container');
      if (!container) return;
      const rect = container.getBoundingClientRect();
      
      // Set display size
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      
      // Set actual size in memory (scaled to account for extra pixel density)
      const scale = window.devicePixelRatio || 1;
      canvas.width = rect.width * scale;
      canvas.height = rect.height * scale;
      
      // Normalize coordinate system to use css pixels
      ctx.scale(scale, scale);
      
      // Render once to prevent flickering
      if (gameState === STATE_READY) {
        render();
      }
    }

    window.addEventListener('resize', () => {
      if (gameModal.classList.contains('active')) {
        resizeCanvas();
      }
    });

    function initGame() {
      score = 0;
      currentSpeed = 3;
      cameraY = 0;
      targetCameraY = 0;
      blocks = [];
      particles = [];
      debris = [];
      
      updateScoreDisplay();
      if(messageEl) messageEl.textContent = '';
      
      // Base block
      const scale = window.devicePixelRatio || 1;
      blocks.push({
        x: (canvas.width / scale) / 2 - INITIAL_WIDTH / 2,
        y: (canvas.height / scale) - BLOCK_HEIGHT * 2,
        w: INITIAL_WIDTH,
        h: BLOCK_HEIGHT * 2,
        color: '#1e2a36',
        offset: 0
      });
      
      spawnBlock();
      gameState = STATE_READY;
      if(actionsContainer) actionsContainer.style.display = 'flex';
      if(startBtn) startBtn.style.display = 'block';
      if(retryBtn) retryBtn.style.display = 'none';
      
      render();
    }

    function spawnBlock() {
      const lastBlock = blocks[blocks.length - 1];
      const width = currentBlock ? currentBlock.w : INITIAL_WIDTH;
      
      // Calculate new Y position
      const startY = lastBlock.y - BLOCK_HEIGHT - 100;
      
      currentBlock = {
        x: 0,
        y: startY,
        w: width,
        h: BLOCK_HEIGHT,
        color: colors[blocks.length % colors.length],
        dir: Math.random() > 0.5 ? 1 : -1,
        velocity: currentSpeed + (blocks.length * 0.1) // Speed increases slowly
      };
    }

    function updateScoreDisplay() {
      if(scoreEl) scoreEl.textContent = score;
      if (score > bestScore) {
        bestScore = score;
        if(bestScoreEl) bestScoreEl.textContent = bestScore;
        localStorage.setItem('balanceDuckBestScore', bestScore);
      }
    }

    function spawnParticles(x, y, color, count = 20) {
      for (let i = 0; i < count; i++) {
        particles.push({
          x: x,
          y: y,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 1) * 8,
          size: Math.random() * 4 + 2,
          color: color,
          life: 1,
          decay: Math.random() * 0.02 + 0.01
        });
      }
    }

    function spawnDebris(x, y, w, h, color) {
      debris.push({
        x: x,
        y: y,
        w: w,
        h: h,
        vx: (Math.random() - 0.5) * 2,
        vy: 0,
        rotation: 0,
        vRotation: (Math.random() - 0.5) * 0.2,
        color: color
      });
    }

    function showMessage(text, color = 'var(--text)') {
      if(!messageEl) return;
      messageEl.textContent = text;
      messageEl.style.color = color;
      messageEl.style.transform = 'translate(-50%, -50%) scale(1.2)';
      messageEl.style.opacity = '1';
      
      setTimeout(() => {
        messageEl.style.transform = 'translate(-50%, -50%) scale(1)';
        setTimeout(() => {
          if (gameState !== STATE_GAMEOVER) {
            messageEl.style.opacity = '0';
          }
        }, 500);
      }, 150);
    }

    function dropBlock() {
      if (gameState !== STATE_PLAYING) return;
      gameState = STATE_DROPPING;
    }

    function handleInput(e) {
      if (e.type === 'keydown' && e.code !== 'Space') return;
      if (e.type === 'keydown') e.preventDefault();
      
      if (gameState === STATE_READY) {
        gameState = STATE_PLAYING;
        if(actionsContainer) actionsContainer.style.display = 'none';
      } else if (gameState === STATE_PLAYING) {
        dropBlock();
      } else if (gameState === STATE_GAMEOVER) {
        // Don't auto-restart on click to prevent accidental clicks on buttons
        if (e.type === 'keydown') {
          initGame();
          gameState = STATE_PLAYING;
          if(actionsContainer) actionsContainer.style.display = 'none';
        }
      }
    }

    function update() {
      const scale = window.devicePixelRatio || 1;
      const cssWidth = canvas.width / scale;
      const cssHeight = canvas.height / scale;

      // Camera panning
      if (cameraY < targetCameraY) {
        cameraY += PAN_SPEED;
      }

      if (gameState === STATE_PLAYING) {
        // Move current block side to side
        currentBlock.x += currentBlock.velocity * currentBlock.dir;
        
        // Bounce off walls
        if (currentBlock.x <= 0) {
          currentBlock.x = 0;
          currentBlock.dir = 1;
        } else if (currentBlock.x + currentBlock.w >= cssWidth) {
          currentBlock.x = cssWidth - currentBlock.w;
          currentBlock.dir = -1;
        }
      } else if (gameState === STATE_DROPPING) {
        // Fall down
        currentBlock.y += FALL_SPEED;
        
        const lastBlock = blocks[blocks.length - 1];
        
        // Check collision
        if (currentBlock.y + currentBlock.h >= lastBlock.y) {
          currentBlock.y = lastBlock.y - currentBlock.h;
          gameState = STATE_SETTLING;
        }
      } else if (gameState === STATE_SETTLING) {
        const lastBlock = blocks[blocks.length - 1];
        
        // Calculate overlap
        const diff = currentBlock.x - lastBlock.x;
        const absDiff = Math.abs(diff);
        
        if (absDiff > currentBlock.w) {
          // Complete miss
          gameState = STATE_GAMEOVER;
          spawnDebris(currentBlock.x, currentBlock.y, currentBlock.w, currentBlock.h, currentBlock.color);
          currentBlock = null;
          
          if(actionsContainer) actionsContainer.style.display = 'flex';
          if(startBtn) startBtn.style.display = 'none';
          if(retryBtn) retryBtn.style.display = 'block';
          
          // Trigger Mascot Reaction (Sad)
          triggerMascotReaction('hurt-3');
          
          const isTr = localStorage.getItem('lang') === 'tr' || !localStorage.getItem('lang');
          showMessage(isTr ? 'Oyun Bitti!' : 'Game Over!', 'var(--rose)');
        } else {
          // Successful hit
          let perfectHit = false;
          
          if (absDiff < 5) {
            // Perfect hit tolerance
            currentBlock.x = lastBlock.x; // Snap to align perfectly
            perfectHit = true;
            spawnParticles(currentBlock.x + currentBlock.w/2, currentBlock.y + currentBlock.h, '#fff', 30);
            
            const isTr = localStorage.getItem('lang') === 'tr' || !localStorage.getItem('lang');
            showMessage(isTr ? 'Mükemmel!' : 'Perfect!', 'var(--amber)');
            
            // Trigger Mascot Reaction (Happy)
            triggerMascotReaction('normal', true); // Open mouth happy
            
          } else {
            // Partial hit - chop the block
            let choppedW = absDiff;
            let choppedX = diff > 0 ? currentBlock.x + currentBlock.w - choppedW : currentBlock.x;
            
            // Spawn debris for chopped part
            spawnDebris(choppedX, currentBlock.y, choppedW, currentBlock.h, currentBlock.color);
            
            // Update current block
            currentBlock.w -= absDiff;
            if (diff < 0) {
              currentBlock.x = lastBlock.x;
            }
            
            spawnParticles(currentBlock.x + currentBlock.w/2, currentBlock.y + currentBlock.h, currentBlock.color, 10);
            triggerMascotReaction('normal');
          }
          
          if (currentBlock.w < MIN_WIDTH) {
            // Too small
            gameState = STATE_GAMEOVER;
            if(actionsContainer) actionsContainer.style.display = 'flex';
            if(startBtn) startBtn.style.display = 'none';
            if(retryBtn) retryBtn.style.display = 'block';
            
            triggerMascotReaction('hurt-2');
            
            const isTr = localStorage.getItem('lang') === 'tr' || !localStorage.getItem('lang');
            showMessage(isTr ? 'Çok Küçük!' : 'Too Small!', 'var(--rose)');
          } else {
            // Add to tower
            blocks.push({...currentBlock});
            score++;
            updateScoreDisplay();
            
            // Adjust camera if tower is getting high
            if (blocks.length > 5) {
              targetCameraY += BLOCK_HEIGHT;
            }
            
            spawnBlock();
            gameState = STATE_PLAYING;
          }
        }
      }

      // Update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2; // gravity
        p.life -= p.decay;
        if (p.life <= 0) particles.splice(i, 1);
      }
      
      // Update debris
      for (let i = debris.length - 1; i >= 0; i--) {
        const d = debris[i];
        d.x += d.vx;
        d.y += d.vy;
        d.vy += 0.5; // gravity
        d.rotation += d.vRotation;
        if (d.y > cssHeight + cameraY + 100) debris.splice(i, 1); // Remove when far below screen
      }
    }

    function render() {
      const scale = window.devicePixelRatio || 1;
      const cssWidth = canvas.width / scale;
      const cssHeight = canvas.height / scale;
      
      ctx.clearRect(0, 0, cssWidth, cssHeight);
      
      ctx.save();
      // Apply camera transform
      ctx.translate(0, cameraY);
      
      // Draw base
      const baseBlock = blocks[0];
      if (baseBlock) {
        ctx.fillStyle = baseBlock.color;
        ctx.fillRect(baseBlock.x, baseBlock.y, baseBlock.w, baseBlock.h);
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 2;
        ctx.strokeRect(baseBlock.x, baseBlock.y, baseBlock.w, baseBlock.h);
      }
      
      // Draw tower blocks
      for (let i = 1; i < blocks.length; i++) {
        const b = blocks[i];
        // Create gradient for block
        const grad = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.h);
        grad.addColorStop(0, b.color);
        grad.addColorStop(1, adjustColor(b.color, -30)); // slightly darker at bottom
        
        ctx.fillStyle = grad;
        ctx.fillRect(b.x, b.y, b.w, b.h);
        
        // Top highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(b.x, b.y, b.w, 3);
      }
      
      // Draw current block
      if (currentBlock && gameState !== STATE_GAMEOVER) {
        const b = currentBlock;
        const grad = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.h);
        grad.addColorStop(0, b.color);
        grad.addColorStop(1, adjustColor(b.color, -30));
        
        ctx.fillStyle = grad;
        ctx.fillRect(b.x, b.y, b.w, b.h);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(b.x, b.y, b.w, 3);
      }
      
      // Draw debris
      for (const d of debris) {
        ctx.save();
        ctx.translate(d.x + d.w/2, d.y + d.h/2);
        ctx.rotate(d.rotation);
        
        const grad = ctx.createLinearGradient(-d.w/2, -d.h/2, -d.w/2, d.h/2);
        grad.addColorStop(0, d.color);
        grad.addColorStop(1, adjustColor(d.color, -30));
        
        ctx.fillStyle = grad;
        ctx.fillRect(-d.w/2, -d.h/2, d.w, d.h);
        ctx.restore();
      }
      
      // Draw particles
      for (const p of particles) {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    }

    function loop() {
      if (!gameModal.classList.contains('active')) return;
      
      update();
      render();
      reqId = requestAnimationFrame(loop);
    }

    // Utility to slightly darken/lighten hex colors
    function adjustColor(color, amount) {
      return '#' + color.replace(/^#/, '').replace(/../g, color => ('0'+Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
    }

    // --- MASCOT REACTIONS ---
    let duckSvgCached = false;
    
    function triggerMascotReaction(pose, mouthOpen = false) {
      const mascotSvg = document.getElementById('duckGameMascotSvg');
      if (!mascotSvg) return;
      
      // Reset all eye poses
      mascotSvg.querySelectorAll('.eye-pose').forEach(el => el.style.display = 'none');
      // Reset all mouth poses
      mascotSvg.querySelectorAll('.mouth-pose').forEach(el => el.style.display = 'none');
      
      if (pose === 'normal') {
        const normalEyes = mascotSvg.querySelectorAll('.eye-normal');
        if(normalEyes.length) normalEyes.forEach(el => el.style.display = 'block');
        
        if (mouthOpen) {
          const mouthOpenEl = mascotSvg.querySelector('.mouth-open');
          if(mouthOpenEl) mouthOpenEl.style.display = 'block';
        } else {
          const mouthIdleEl = mascotSvg.querySelector('.mouth-idle');
          if(mouthIdleEl) mouthIdleEl.style.display = 'block';
        }
      } else {
        // hurt-1, hurt-2, hurt-3
        const hurtEye = mascotSvg.querySelector(`.eye-${pose}`);
        if(hurtEye) hurtEye.style.display = 'block';
        
        const hurtMouth = mascotSvg.querySelector(`.mouth-${pose}`);
        if(hurtMouth) hurtMouth.style.display = 'block';
      }
      
      // Auto reset after 2s if it was a reaction
      if (pose !== 'normal') {
        setTimeout(() => {
          triggerMascotReaction('normal');
        }, 2000);
      }
    }

    // --- MODAL CONTROLS ---
    function openGameModal() {
      gameModal.classList.add('active');
      document.body.style.overflow = 'hidden'; // prevent bg scroll
      resizeCanvas();
      initGame();
      
      // Copy the mascot SVG if not already copied
      if (!duckSvgCached) {
        const mascotContainer = document.querySelector('.duck-game-mascot');
        const originalMascot = document.getElementById('mascotSvg');
        if (mascotContainer && originalMascot) {
          // deep clone
          const clone = originalMascot.cloneNode(true);
          clone.id = 'duckGameMascotSvg';
          // Make sure it looks forward initially
          clone.querySelectorAll('.eye-pose').forEach(el => el.style.display = 'none');
          clone.querySelectorAll('.mouth-pose').forEach(el => el.style.display = 'none');
          
          const normalEye = clone.querySelectorAll('.eye-normal');
          if(normalEye.length) normalEye.forEach(el => el.style.display = 'block');
          const mouthIdle = clone.querySelector('.mouth-idle');
          if(mouthIdle) mouthIdle.style.display = 'block';
          
          mascotContainer.appendChild(clone);
          duckSvgCached = true;
        }
      }
      
      if (reqId) cancelAnimationFrame(reqId);
      reqId = requestAnimationFrame(loop);
    }

    function closeGameModal() {
      gameModal.classList.remove('active');
      document.body.style.overflow = '';
      if (reqId) cancelAnimationFrame(reqId);
    }

    // Event Listeners
    if(startBtn) {
      startBtn.addEventListener('click', () => {
        gameState = STATE_PLAYING;
        actionsContainer.style.display = 'none';
      });
    }
    
    if(retryBtn) {
      retryBtn.addEventListener('click', () => {
        initGame();
        gameState = STATE_PLAYING;
        actionsContainer.style.display = 'none';
      });
    }
    
    if(closeBtn) {
      closeBtn.addEventListener('click', closeGameModal);
    }
    
    // Game input listeners
    canvas.addEventListener('mousedown', handleInput);
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault(); // Prevent scrolling/zooming while playing
      handleInput(e);
    }, { passive: false });
    
    document.addEventListener('keydown', (e) => {
      if (gameModal.classList.contains('active')) {
        if (e.code === 'Space') {
          handleInput(e);
        } else if (e.key === 'Escape') {
          closeGameModal();
        }
      }
    });
  });

})();
