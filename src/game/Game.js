import { CONFIG } from '../config.js';
import { Player } from './Player.js';
import { Platform, createRandomPlatform, loadGulliverImage } from './Platform.js';
import { Background } from './Background.js';
import { UI } from '../ui/UI.js';
import { Leaderboard } from './Leaderboard.js';

/**
 * Classe Game - Controller principale del gioco
 * Movimento solo orizzontale - salto completamente automatico
 */
export class Game {
  constructor(canvas) {
    if (!canvas) throw new Error('[Game] canvas è null o undefined.');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('[Game] Impossibile ottenere il contesto 2d dal canvas.');

    this.canvas = canvas;
    this.ctx    = ctx;
    this.canvas.width  = CONFIG.CANVAS_WIDTH;
    this.canvas.height = CONFIG.CANVAS_HEIGHT;

    this.state = 'start';
    this.player    = null;
    this.platforms = [];

    this.cameraY       = 0;
    this.targetCameraY = 0;
    this.cameraSmoothness = 0.08;

    this.playerZoneTop    = 0.35;
    this.playerZoneBottom = 0.70;

    this.score       = 0;
    this.highScore   = parseInt(localStorage.getItem('torreIngegneriaHighScore')) || 0;
    this.currentAltitude = CONFIG.BASE_ALTITUDE;
    this.lastGulliverAltitude = -Infinity;

    this.input = { left: false, right: false };
    this.background = new Background();
    this.ui         = new UI();

    this.gulliverBoost = {
      active:        false,
      progress:      0,
      totalPixels:   0,
      currentPixels: 0,
      speed:         9
    };

    loadGulliverImage();
    this.setupEventListeners();
    this.ui.showStartScreen(this.highScore);
    this.initGame();
    this.gameLoop();
  }

  debugLog(...args) {
    if (CONFIG.DEBUG_MODE) console.log('[Game]', ...args);
  }

  initGame() {
    this.player = new Player(
      CONFIG.CANVAS_WIDTH / 2 - 16,
      CONFIG.CANVAS_HEIGHT - 130
    );
    this.platforms = [];
    this.platforms.push(
      new Platform(CONFIG.CANVAS_WIDTH / 2 - 45, CONFIG.CANVAS_HEIGHT - 80, 'normal', 90)
    );
    this.generateInitialPlatforms();

    this.cameraY       = 0;
    this.targetCameraY = 0;
    this.score         = 0;
    this.currentAltitude = CONFIG.BASE_ALTITUDE;
    this.lastGulliverAltitude = -Infinity;
    this.lastGulliverAlt = -Infinity; // Reset for new platform generation

    this.gulliverBoost = {
      active:        false,
      progress:      0,
      totalPixels:   0,
      currentPixels: 0,
      speed:         CONFIG.GULLIVER_SPEED
    };
  }

  getAltitude() {
    return CONFIG.BASE_ALTITUDE + Math.abs(this.cameraY) / CONFIG.PIXELS_PER_METER;
  }

  canAddGulliver(alt) {
    return alt - this.lastGulliverAlt >= CONFIG.GULLIVER_MIN_ALTITUDE_GAP;
  }

  createPlatform(y, type = null) {
    const alt = this.getAltitude();
    const diffFactor = Math.min(alt / CONFIG.DIFF.MAX_HEIGHT_DIFFICULTY, 1);

    // Larghezza progressivamente minore
    const width = CONFIG.DIFF.START_WIDTH - (CONFIG.DIFF.START_WIDTH - CONFIG.DIFF.END_WIDTH) * diffFactor;
    
    // Tipi speciali più frequenti salendo
    if (!type) {
      const prob = CONFIG.DIFF.SPECIAL_START_PROB + (CONFIG.DIFF.SPECIAL_END_PROB - CONFIG.DIFF.SPECIAL_START_PROB) * diffFactor;
      if (Math.random() < prob) {
        const types = ['moving', 'crumbling', 'bouncy'];
        type = types[Math.floor(Math.random() * types.length)];
      } else {
        type = 'normal';
      }
    }

    // BONUS GULLIVER: Meno frequente salendo (non troppo, ma ridotto)
    const gulliverProb = 0.2 - (0.12 * diffFactor);
    if (this.canAddGulliver(alt) && Math.random() < gulliverProb) {
      type = 'gulliver';
      this.lastGulliverAlt = alt;
    }

    return new Platform(
      Math.random() * (CONFIG.CANVAS_WIDTH - width),
      y,
      type,
      width
    );
  }

  generateInitialPlatforms() {
    let y = CONFIG.CANVAS_HEIGHT - 50;
    // The first platform is already added in initGame, so we start generating from above it.
    // We need to ensure there's enough platforms to fill the screen initially.
    while (y > -CONFIG.CANVAS_HEIGHT * 2) { // Generate enough to fill a few screens
      const alt = this.getAltitude(); // This will be CONFIG.BASE_ALTITUDE initially
      const diffFactor = Math.min(alt / CONFIG.DIFF.MAX_HEIGHT_DIFFICULTY, 1);
      const gap = CONFIG.DIFF.START_GAP + (CONFIG.DIFF.END_GAP - CONFIG.DIFF.START_GAP) * diffFactor;
      
      y -= gap + Math.random() * 30;
      this.platforms.push(this.createPlatform(y));
    }
  }

  updatePlatforms() {
    // Generate new platforms above
    const highestPlatformY = this.platforms.length > 0 ? Math.min(...this.platforms.map(p => p.y)) : this.cameraY;

    if (highestPlatformY > this.cameraY - CONFIG.CANVAS_HEIGHT) {
      const alt = this.getAltitude();
      const diffFactor = Math.min(alt / CONFIG.DIFF.MAX_HEIGHT_DIFFICULTY, 1);
      const gap = CONFIG.DIFF.START_GAP + (CONFIG.DIFF.END_GAP - CONFIG.DIFF.START_GAP) * diffFactor;
      
      const newY = highestPlatformY - (gap + Math.random() * 30);
      this.platforms.push(this.createPlatform(newY));
    }

    this.platforms = this.platforms.filter(p =>
      p.opacity > 0 && p.y < this.cameraY + CONFIG.CANVAS_HEIGHT + 400
    );
  }

  update() {
    if (this.state !== 'playing') return;

    if (this.gulliverBoost.active) {
      if (this.gulliverBoost.currentPixels < this.gulliverBoost.totalPixels) {
        const remaining = this.gulliverBoost.totalPixels - this.gulliverBoost.currentPixels;
        const move = Math.min(this.gulliverBoost.speed, remaining);
        this.player.y -= move;
        this.player.vy = -8;
        this.player.onGround = false;
        this.gulliverBoost.currentPixels += move;
        this.cameraY -= move;
        this.targetCameraY = this.cameraY;
        this.gulliverBoost.progress = this.gulliverBoost.currentPixels / this.gulliverBoost.totalPixels;
      } else {
        this.gulliverBoost.active  = false;
        this.player.onGround = false;
        this.player.isFlying = false;
        this.player.vy       = 0;
      }

      if (this.input.left) this.player.vx = -CONFIG.HORIZONTAL_SPEED;
      else if (this.input.right) this.player.vx = CONFIG.HORIZONTAL_SPEED;
      else this.player.vx *= CONFIG.FRICTION;
      
      this.player.x += this.player.vx;
      this.player.x = Math.max(0, Math.min(CONFIG.CANVAS_WIDTH - this.player.width, this.player.x));
      this.player.armPhase += 0.15;
      this.player._flyParticles.forEach(p => { p.angle += p.speed; });

    } else {
      this.player.update(this.input);
      this.platforms.forEach(p => p.update());
      this.checkCollisions();

      const playerScreenY = this.player.y - this.cameraY;
      const minScreenY    = CONFIG.CANVAS_HEIGHT * this.playerZoneTop;

      if (playerScreenY < minScreenY) {
        this.targetCameraY = this.player.y - minScreenY;
      }

      const playerScreenBottom = (this.player.y + this.player.height) - this.cameraY;
      if (playerScreenBottom > CONFIG.CANVAS_HEIGHT) {
        this.endGame();
        return;
      }

      this.cameraY += (this.targetCameraY - this.cameraY) * this.cameraSmoothness;
    }

    this.currentAltitude = CONFIG.BASE_ALTITUDE + Math.abs(this.cameraY) / CONFIG.PIXELS_PER_METER;
    const rawScore = this.currentAltitude - CONFIG.BASE_ALTITUDE;
    this.score = Math.floor(rawScore / CONFIG.PLANE_INTERVAL) * CONFIG.PLANE_INTERVAL;

    const displayAltitude = Math.floor(this.currentAltitude / CONFIG.PLANE_INTERVAL) * CONFIG.PLANE_INTERVAL;
    this.generatePlatforms();
    this.background.update(this.cameraY, this.currentAltitude);
    this.ui.updateHUD(displayAltitude, this.score);
  }

  checkCollisions() {
    this.platforms.forEach(platform => {
      if (platform.checkCollision(this.player)) {
        this.player.land(platform);
        if (platform.type === 'crumbling') platform.startCrumble();
        
        if (platform.type === 'gulliver' && CONFIG.GULLIVER_ENABLED) {
          const altitudeNow = CONFIG.BASE_ALTITUDE + Math.abs(this.cameraY) / CONFIG.PIXELS_PER_METER;
          if (altitudeNow - this.lastGulliverAltitude >= 75) {
            this.activateGulliverBoost(platform);
            this.lastGulliverAltitude = altitudeNow;
          }
        }
      }
    });
  }

  activateGulliverBoost(platform) {
    const boostPixels = CONFIG.GULLIVER_BOOST * CONFIG.PIXELS_PER_METER;
    this.gulliverBoost = {
      active:        true,
      progress:      0,
      totalPixels:   boostPixels,
      currentPixels: 0,
      speed:         9
    };
    this.player.setFlying(true);
    platform.opacity = 0;
  }

  draw() {
    this.ctx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    this.background.draw(this.ctx, this.cameraY, this.currentAltitude);
    this.platforms.forEach(p => p.draw(this.ctx, this.cameraY));
    if (this.player) this.player.draw(this.ctx, this.cameraY);
  }

  gameLoop() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.gameLoop());
  }

  startGame() {
    this.state = 'playing';
    const overlay = document.getElementById('overlay');
    if (overlay) overlay.className = 'hidden';
    this.initGame();
    this.player.startJumping();
  }

  endGame() {
    this.state = 'ended';
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('torreIngegneriaHighScore', this.highScore);
    }
    this.ui.showGameOver(this.score, this.highScore);
    this.ui.updateMiniLeaderboard();
  }

  setupEventListeners() {
    document.addEventListener('keydown', e => {
      if (e.code === 'ArrowLeft'  || e.code === 'KeyA') this.input.left  = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') this.input.right = true;
    });
    document.addEventListener('keyup', e => {
      if (e.code === 'ArrowLeft'  || e.code === 'KeyA') this.input.left  = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') this.input.right = false;
    });

    const handleTouch = (e) => {
      e.preventDefault();
      const touch  = e.touches[0];
      const rect   = this.canvas.getBoundingClientRect();
      const x      = touch.clientX - rect.left;
      const scaleX = CONFIG.CANVAS_WIDTH / rect.width;
      const screenX = x * scaleX;
      if (screenX < CONFIG.CANVAS_WIDTH / 2) {
        this.input.left = true; this.input.right = false;
      } else {
        this.input.right = true; this.input.left = false;
      }
    };

    const resetTouchInput = (e) => {
      if (e) e.preventDefault();
      this.input.left = false; this.input.right = false;
    };

    this.canvas.addEventListener('touchstart', handleTouch, { passive: false });
    this.canvas.addEventListener('touchend',    resetTouchInput, { passive: false });
    this.canvas.addEventListener('touchcancel', resetTouchInput, { passive: false });

    // Click delegato
    const overlay = document.getElementById('overlay');
    if (overlay) {
      overlay.addEventListener('click', async (e) => {
        const target = e.target;
        if (target.id === 'startBtn' || target.id === 'retryBtn') {
          this.startGame();
        }
        if (target.id === 'lbBtn' || target.id === 'lbBtnInGame' || target.closest('.lb-btn')) {
          this.ui.showLeaderboard();
        }
        if (target.id === 'closeLb') {
          if (this.state === 'start' || this.state === 'ended') {
            if (this.state === 'start') this.ui.showStartScreen(this.highScore);
            else {
              this.ui.showGameOver(this.score, this.highScore);
              this.ui.updateMiniLeaderboard();
            }
          }
        }
        if (target.closest('.char-opt')) {
          const opt = target.closest('.char-opt');
          const skin = opt.getAttribute('data-skin');
          localStorage.setItem('torreIngegneriaSkin', skin);
          if (this.player) this.player.skin = skin;
          
          // Aggiorna UI visiva
          document.querySelectorAll('.char-opt').forEach(el => el.classList.remove('active'));
          opt.classList.add('active');
        }
        if (target.id === 'saveBtn') {
          const nameInput = document.getElementById('playerName');
          const statusEl = document.getElementById('saveStatus');
          if (!nameInput || !statusEl) return;
          const name = nameInput.value.trim();
          if (name.length < 2) {
            statusEl.textContent = 'MINIMO 2 CARATTERI';
            statusEl.style.color = '#e74c3c';
            return;
          }
          try {
            target.style.pointerEvents = 'none';
            target.style.opacity = '0.5';
            statusEl.textContent = 'SALVATAGGIO...';
            await Leaderboard.saveScore(name, this.score);
            statusEl.textContent = 'RECORD SALVATO!';
            statusEl.style.color = '#2ecc71';
            nameInput.disabled = true;
          } catch (err) {
            statusEl.textContent = 'ERRORE';
            statusEl.style.color = '#e74c3c';
            target.style.pointerEvents = 'auto';
            target.style.opacity = '1';
          }
        }
      });
    }
  }
}

export default Game;
