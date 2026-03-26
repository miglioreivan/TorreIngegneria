import { CONFIG } from '../config.js';
import { Player } from './Player.js';
import { Platform, createRandomPlatform, loadGulliverImage } from './Platform.js';
import { Background } from './Background.js';
import { UI } from '../ui/UI.js';

/**
 * Classe Game - Controller principale del gioco
 * Movimento solo orizzontale - salto completamente automatico
 */
export class Game {
  constructor(canvas) {
    // ===== Guard robustezza canvas =====
    if (!canvas) throw new Error('[Game] canvas è null o undefined.');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('[Game] Impossibile ottenere il contesto 2d dal canvas.');

    this.canvas = canvas;
    this.ctx    = ctx;
    this.canvas.width  = CONFIG.CANVAS_WIDTH;
    this.canvas.height = CONFIG.CANVAS_HEIGHT;

    // Stato del gioco
    this.state = 'start';

    // Entità
    this.player    = null;
    this.platforms = [];

    // Camera con SMOOTH FOLLOW
    this.cameraY       = 0;
    this.targetCameraY = 0;
    this.cameraSmoothness = 0.08;

    // Fascia del giocatore (percentuale dello schermo)
    this.playerZoneTop    = 0.35;
    this.playerZoneBottom = 0.70;

    // Scoring
    this.score       = 0;
    this.highScore   = parseInt(localStorage.getItem('torreIngegneriaHighScore')) || 0;
    this.currentAltitude = CONFIG.BASE_ALTITUDE;

    // Frequenza Gulliver: gating a 100 metri
    this.lastGulliverAltitude = -Infinity;

    // Input — solo movimento orizzontale
    this.input = { left: false, right: false };

    // Componenti
    this.background = new Background();
    this.ui         = new UI();

    // Effetti visivi boost
    this.gulliverBoost = {
      active:        false,
      progress:      0,
      totalPixels:   0,
      currentPixels: 0,
      speed:         9
    };

    // Carica immagine Gulliver solo se il bonus è abilitato
    loadGulliverImage();

    this.setupEventListeners();
    this.ui.showStartScreen(this.highScore);
    this.initGame();
    this.gameLoop();
  }

  // ===== DEBUG HELPER =====
  /**
   * Log condizionale — attivo solo se CONFIG.DEBUG_MODE è true.
   * @param {...*} args
   */
  debugLog(...args) {
    if (CONFIG.DEBUG_MODE) console.log('[Game]', ...args);
  }

  /** Inizializza/reset del gioco */
  initGame() {
    this.player = new Player(
      CONFIG.CANVAS_WIDTH / 2 - 16,
      CONFIG.CANVAS_HEIGHT - 130
    );

    this.platforms = [];

    // Prima piattaforma sotto il giocatore
    this.platforms.push(
      new Platform(CONFIG.CANVAS_WIDTH / 2 - 45, CONFIG.CANVAS_HEIGHT - 80, 'normal', 90)
    );

    // Genera piattaforme iniziali
    let y = CONFIG.CANVAS_HEIGHT - 150;
    for (let i = 0; i < 25; i++) {
      const platform = createRandomPlatform(i);
      platform.y = y;
      this.platforms.push(platform);
      y -= 50 + Math.random() * 30;
    }

    // Reset camera e score
    this.cameraY       = 0;
    this.targetCameraY = 0;
    this.score         = 0;
    this.currentAltitude = CONFIG.BASE_ALTITUDE;

    // [BUG FIX] Reset threshold Gulliver ad ogni nuova partita
    this.lastGulliverAltitude = -Infinity;

    // Reset boost
    this.gulliverBoost = {
      active:        false,
      progress:      0,
      totalPixels:   0,
      currentPixels: 0,
      speed:         CONFIG.GULLIVER_SPEED
    };

    this.debugLog('Partita inizializzata. HighScore attuale:', this.highScore);
  }

  /** Genera nuove piattaforme */
  generatePlatforms() {
    if (this.platforms.length === 0) {
      this.debugLog('WARN: array piattaforme vuoto, generazione di emergenza.');
    }

    const minY = this.platforms.length > 0
      ? Math.min(...this.platforms.map(p => p.y))
      : this.cameraY;

    if (minY > this.cameraY - CONFIG.CANVAS_HEIGHT) {
      const newPlatform = createRandomPlatform(this.platforms.length);
      newPlatform.y = minY - (50 + Math.random() * 30);
      this.platforms.push(newPlatform);
    }

    // Rimuovi piattaforme fuori schermo (in basso)
    this.platforms = this.platforms.filter(p =>
      p.opacity > 0 && p.y < this.cameraY + CONFIG.CANVAS_HEIGHT + 400
    );
  }

  /** Update principale */
  update() {
    if (this.state !== 'playing') return;

    // ========== GULLIVER BOOST GRADUALE ==========
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

        this.gulliverBoost.progress =
          this.gulliverBoost.currentPixels / this.gulliverBoost.totalPixels;
      } else {
        this.debugLog('Boost Gulliver terminato. Altitudine:', Math.floor(this.currentAltitude));
        this.gulliverBoost.active  = false;
        this.player.onGround = false;
        this.player.isFlying = false;
        this.player.vy       = 0;
      }

      // Movimento orizzontale durante boost
      if (this.input.left) {
        this.player.vx = -CONFIG.HORIZONTAL_SPEED;
      } else if (this.input.right) {
        this.player.vx = CONFIG.HORIZONTAL_SPEED;
      } else {
        this.player.vx *= CONFIG.FRICTION;
      }
      this.player.x += this.player.vx;
      this.player.x = Math.max(0, Math.min(CONFIG.CANVAS_WIDTH - this.player.width, this.player.x));

      // Aggiorna animazione particelle anche durante il boost
      this.player.armPhase += 0.15;
      this.player._flyParticles.forEach(p => { p.angle += p.speed; });

    } else {
      // Normale gameplay
      this.player.update(this.input);
      this.platforms.forEach(p => p.update());
      this.checkCollisions();

      // ========== CAMERA ==========
      const playerScreenY = this.player.y - this.cameraY;
      const screenHeight  = CONFIG.CANVAS_HEIGHT;
      const minScreenY    = screenHeight * this.playerZoneTop;
      const maxScreenY    = screenHeight * this.playerZoneBottom;

      if (playerScreenY < minScreenY) {
        this.targetCameraY = this.player.y - minScreenY;
      }

      // Game over: il piede del giocatore esce dal bordo inferiore del canvas
      const playerScreenBottom = (this.player.y + this.player.height) - this.cameraY;
      if (playerScreenBottom > CONFIG.CANVAS_HEIGHT) {
        this.endGame();
        return;
      }

      this.cameraY += (this.targetCameraY - this.cameraY) * this.cameraSmoothness;
    }

    // ========== SCORE ==========
    this.currentAltitude =
      CONFIG.BASE_ALTITUDE + Math.abs(this.cameraY) / CONFIG.PIXELS_PER_METER;

    const rawScore = this.currentAltitude - CONFIG.BASE_ALTITUDE;
    this.score = Math.floor(rawScore / CONFIG.PLANE_INTERVAL) * CONFIG.PLANE_INTERVAL;

    const displayAltitude =
      Math.floor(this.currentAltitude / CONFIG.PLANE_INTERVAL) * CONFIG.PLANE_INTERVAL;

    this.generatePlatforms();
    this.background.update(this.cameraY, this.currentAltitude);
    this.ui.updateHUD(displayAltitude, this.score);
  }

  /** Controlla le collisioni */
  checkCollisions() {
    this.platforms.forEach(platform => {
      if (platform.checkCollision(this.player)) {
        this.player.land(platform);

        if (platform.type === 'crumbling') {
          platform.startCrumble();
        }

        // Bonus GULLIVER — rispetta il flag A/B
        if (platform.type === 'gulliver' && CONFIG.GULLIVER_ENABLED) {
          const altitudeNow =
            CONFIG.BASE_ALTITUDE + Math.abs(this.cameraY) / CONFIG.PIXELS_PER_METER;
          if (altitudeNow - this.lastGulliverAltitude >= 75) {
            this.activateGulliverBoost(platform);
            this.lastGulliverAltitude = altitudeNow;
          } else {
            this.debugLog(
              `Gulliver ignorato (cooldown): ${Math.floor(altitudeNow - this.lastGulliverAltitude)}m / 75m`
            );
          }
        }
      }
    });
  }

  /**
   * Attiva il boost Gulliver graduale
   * @param {Platform} platform - Piattaforma Gulliver colpita
   */
  activateGulliverBoost(platform) {
    const boostPixels = CONFIG.GULLIVER_BOOST * CONFIG.PIXELS_PER_METER;

    this.debugLog(`Gulliver attivato! +${CONFIG.GULLIVER_BOOST}m (${boostPixels}px)`);

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

  /** Renderizza tutto */
  draw() {
    this.ctx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    this.background.draw(this.ctx, this.cameraY, this.currentAltitude);
    this.platforms.forEach(p => p.draw(this.ctx, this.cameraY));

    if (this.player) {
      this.player.draw(this.ctx, this.cameraY);
    }
  }

  /** Game loop — ~60fps */
  gameLoop() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.gameLoop());
  }

  /** Avvia una nuova partita */
  startGame() {
    this.debugLog('startGame()');
    this.state = 'playing';
    this.ui.hideOverlay();
    this.initGame();
    this.player.startJumping();
  }

  /** Termina la partita */
  endGame() {
    this.state = 'ended';

    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('torreIngegneriaHighScore', this.highScore);
      this.debugLog('Nuovo record!', this.highScore);
    }

    this.debugLog(`Game over — score: ${this.score}, highScore: ${this.highScore}`);
    this.ui.showGameOver(this.score, this.highScore);
  }

  /** Setup degli event listener */
  setupEventListeners() {
    // ===== Tastiera =====
    document.addEventListener('keydown', e => {
      if (e.code === 'ArrowLeft'  || e.code === 'KeyA') this.input.left  = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') this.input.right = true;
    });

    document.addEventListener('keyup', e => {
      if (e.code === 'ArrowLeft'  || e.code === 'KeyA') this.input.left  = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') this.input.right = false;
    });

    // ===== Touch =====
    const handleTouch = (e) => {
      e.preventDefault();
      const touch  = e.touches[0];
      const rect   = this.canvas.getBoundingClientRect();
      const x      = touch.clientX - rect.left;
      const scaleX = CONFIG.CANVAS_WIDTH / rect.width;
      const screenX = x * scaleX;

      if (screenX < CONFIG.CANVAS_WIDTH / 2) {
        this.input.left  = true;
        this.input.right = false;
      } else {
        this.input.right = true;
        this.input.left  = false;
      }
    };

    const resetTouchInput = (e) => {
      if (e) e.preventDefault();
      this.input.left  = false;
      this.input.right = false;
    };

    this.canvas.addEventListener('touchstart', handleTouch, { passive: false });
    this.canvas.addEventListener('touchend',    resetTouchInput, { passive: false });
    this.canvas.addEventListener('touchcancel', resetTouchInput, { passive: false });

    // ===== Click delegato per i pulsanti nell'overlay =====
    const overlay = document.getElementById('overlay');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        // Controlla se il click è avvenuto su un pulsante specifico
        const btn = e.target.closest('#startBtn, #retryBtn');
        if (btn && (this.state === 'start' || this.state === 'ended')) {
          this.startGame();
        }
      });
    } else {
      console.warn('[Game] Elemento #overlay non trovato nel DOM.');
    }
  }
}

export default Game;
