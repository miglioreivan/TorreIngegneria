import { CONFIG } from '../config.js';

/**
 * Classe Player - Personaggio migliorato
 */
export class Player {
  constructor(x, y) {
    this.width = 36;
    this.height = 48;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.canJump = false;
    this.hasJumped = false;
    this.isFlying = false;
    this.rotation = 0;
    this.armPhase = 0;

    // Skin del personaggio
    this.skin = localStorage.getItem('torreIngegneriaSkin') || 'robot';

    // Particelle usate durante il bonus Gulliver
    this._flyParticles = Array.from({ length: 8 }, () => this._newParticle());
  }

  /** Crea una nuova particella di volo */
  _newParticle() {
    return {
      angle: Math.random() * Math.PI * 2,
      dist: 18 + Math.random() * 14,
      size: 1.5 + Math.random() * 2.5,
      speed: 0.03 + Math.random() * 0.04,
      alpha: 0.4 + Math.random() * 0.5,
      hue: Math.round(270 + Math.random() * 40) // viola/blu
    };
  }

  update(input) {
    // Movimento orizzontale con CONFIG.CANVAS_WIDTH (non hardcodato)
    if (input.left) {
      this.vx = -CONFIG.HORIZONTAL_SPEED;
    } else if (input.right) {
      this.vx = CONFIG.HORIZONTAL_SPEED;
    } else {
      this.vx *= CONFIG.FRICTION;
    }

    if (this.onGround && this.canJump) {
      this.jump();
    }

    this.vy += CONFIG.GRAVITY;
    if (this.vy > CONFIG.MAX_FALL_SPEED) this.vy = CONFIG.MAX_FALL_SPEED;

    this.x += this.vx;
    this.y += this.vy;

    this.x = Math.max(0, Math.min(CONFIG.CANVAS_WIDTH - this.width, this.x));
    this.rotation = Math.max(-25, Math.min(25, this.vy * 1.3));

    this.armPhase += 0.15;

    // Aggiorna le particelle durante il volo
    if (this.isFlying) {
      this._flyParticles.forEach(p => { p.angle += p.speed; });
    }
  }

  jump() {
    this.vy = CONFIG.JUMP_VELOCITY;
    this.onGround = false;
    this.canJump = false;
  }

  land(platform) {
    this.y = platform.y - this.height;
    this.onGround = true;
    this.canJump = true;

    if (platform.type === 'bouncy') {
      this.vy = CONFIG.JUMP_VELOCITY * 1.7;
      this.onGround = false;
    } else {
      this.vy = 0;
    }
  }

  startJumping() {
    this.hasJumped = true;
    this.canJump = true;
    this.isFlying = false;
  }

  /**
   * Abilita/disabilita lo stato di volo (bonus Gulliver)
   */
  setFlying(state) {
    this.isFlying = !!state;
    if (this.isFlying) {
      // Rinfresca le particelle quando inizia il volo
      this._flyParticles = Array.from({ length: 8 }, () => this._newParticle());
    }
  }

  draw(ctx, cameraY) {
    const screenY = this.y - cameraY;

    ctx.save();
    ctx.translate(this.x + this.width / 2, screenY + this.height / 2);

    // ====== EFFETTO VISIVO GULLIVER BOOST ======
    if (this.isFlying) {
      this._drawFlyEffect(ctx);
    } else {
      ctx.rotate(this.rotation * Math.PI / 180);
    }

    // === RENDERING BASATO SULLA SKIN ===
    if (this.skin === 'boy') {
      this._drawBoyModern(ctx);
    } else if (this.skin === 'girl') {
      this._drawGirlModern(ctx);
    } else {
      this._drawRobotModern(ctx);
    }

    ctx.restore();
  }

  /**
   * Disegna il personaggio Robot originale
   */
  _drawRobotModern(ctx) {
    const move = this.onGround ? 0 : Math.sin(this.armPhase) * 3;

    // Corpo
    ctx.fillStyle = "#9aa5b1";
    ctx.beginPath();
    ctx.roundRect(-14, -4, 28, 22, 8);
    ctx.fill();

    // Testa grande
    ctx.fillStyle = "#cfd6dd";
    ctx.beginPath();
    ctx.roundRect(-18, -32, 36, 30, 12);
    ctx.fill();

    // Visore
    ctx.fillStyle = "#2d3436";
    ctx.beginPath();
    ctx.roundRect(-12, -24, 24, 12, 6);
    ctx.fill();

    // Occhi LED
    ctx.fillStyle = "#74b9ff";
    ctx.beginPath(); ctx.arc(-6, -18, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(6, -18, 3, 0, Math.PI * 2); ctx.fill();

    // Braccia
    const armAngle = Math.sin(this.armPhase) * 0.25;

    ctx.fillStyle = "#cfd6dd";

    ctx.save();
    ctx.translate(-16, -2);
    ctx.rotate(-0.2 + armAngle);
    ctx.fillRect(-3, 0, 6, 14);
    ctx.restore();

    ctx.save();
    ctx.translate(16, -2);
    ctx.rotate(0.2 - armAngle);
    ctx.fillRect(-3, 0, 6, 14);
    ctx.restore();

    // Gambe
    ctx.fillStyle = "#6c7a89";
    ctx.fillRect(-10, 10 + move, 8, 14);
    ctx.fillRect(2, 10 - move, 8, 14);
  }

  /**
   * Disegna uno dei personaggi umani (Ragazzo/Ragazza)
   */
  _drawBoyModern(ctx) {
    const move = this.onGround ? 0 : Math.sin(this.armPhase) * 3;

    // Corpo
    ctx.fillStyle = "#3498db";
    ctx.beginPath();
    ctx.roundRect(-12, -4, 24, 22, 6);
    ctx.fill();

    // Fascia UNIVPM
    ctx.fillStyle = "#a60929";
    ctx.fillRect(-12, 2, 24, 4);

    // Testa grande
    ctx.fillStyle = "#ffeaa7";
    ctx.beginPath();
    ctx.arc(0, -18, 16, 0, Math.PI * 2);
    ctx.fill();

    // Capelli corti moderni
    ctx.fillStyle = "#2d3436";
    ctx.beginPath();
    ctx.arc(0, -22, 18, Math.PI, 0);
    ctx.fill();

    // Occhi grandi e carini
    ctx.fillStyle = "#2d3436";
    ctx.beginPath(); ctx.arc(-6, -18, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(6, -18, 3, 0, Math.PI * 2); ctx.fill();

    // Braccia
    const armAngle = Math.sin(this.armPhase) * 0.25;

    ctx.fillStyle = "#3498db";

    ctx.save();
    ctx.translate(-14, -2);
    ctx.rotate(-0.15 + armAngle);
    ctx.fillRect(-3, 0, 6, 14);
    ctx.restore();

    ctx.save();
    ctx.translate(14, -2);
    ctx.rotate(0.15 - armAngle);
    ctx.fillRect(-3, 0, 6, 14);
    ctx.restore();

    // Gambe
    ctx.fillStyle = "#2d3436";
    ctx.fillRect(-10, 10 + move, 8, 14);
    ctx.fillRect(2, 10 - move, 8, 14);

    // Scarpe
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-10, 22 + move, 10, 4);
    ctx.fillRect(2, 22 - move, 10, 4);
  }

  _drawGirlModern(ctx) {
    const move = this.onGround ? 0 : Math.sin(this.armPhase) * 3;

    // Corpo
    ctx.fillStyle = "#e84393";
    ctx.beginPath();
    ctx.roundRect(-12, -4, 24, 22, 6);
    ctx.fill();

    // Fascia UNIVPM
    ctx.fillStyle = "#a60929";
    ctx.fillRect(-12, 2, 24, 4);

    // Testa grande
    ctx.fillStyle = "#ffeaa7";
    ctx.beginPath();
    ctx.arc(0, -18, 16, 0, Math.PI * 2);
    ctx.fill();

    // Capelli lunghi morbidi
    ctx.fillStyle = "#2d3436";
    ctx.beginPath();
    ctx.arc(0, -22, 20, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(-20, -22, 10, 28);
    ctx.fillRect(10, -22, 10, 28);

    // Occhi grandi
    ctx.fillStyle = "#2d3436";
    ctx.beginPath(); ctx.arc(-6, -18, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(6, -18, 3, 0, Math.PI * 2); ctx.fill();

    // Braccia
    const armAngle = Math.sin(this.armPhase) * 0.25;

    ctx.fillStyle = "#e84393";

    ctx.save();
    ctx.translate(-14, -2);
    ctx.rotate(-0.15 + armAngle);
    ctx.fillRect(-3, 0, 6, 14);
    ctx.restore();

    ctx.save();
    ctx.translate(14, -2);
    ctx.rotate(0.15 - armAngle);
    ctx.fillRect(-3, 0, 6, 14);
    ctx.restore();

    // Gambe
    ctx.fillStyle = "#2d3436";
    ctx.fillRect(-10, 10 + move, 8, 14);
    ctx.fillRect(2, 10 - move, 8, 14);

    // Scarpe
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-10, 22 + move, 10, 4);
    ctx.fillRect(2, 22 - move, 10, 4);
  }

  /**
   * Disegna l'effetto visivo del bonus Gulliver:
   * - Bagliore viola attorno al giocatore
   * - Particelle orbitanti
   */
  _drawFlyEffect(ctx) {
    // Bagliore viola (shadow su tutta la figura)
    ctx.shadowColor = '#9b59b6';
    ctx.shadowBlur = 18 + Math.sin(this.armPhase * 2) * 6;

    // Particelle orbitanti
    this._flyParticles.forEach(p => {
      const px = Math.cos(p.angle) * p.dist;
      const py = Math.sin(p.angle) * p.dist * 0.6; // schiacciato verticalmente
      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 70%, 70%, ${p.alpha})`;
      ctx.fill();
    });

    // Scia verticale (linee che salgono)
    const trailAlpha = 0.25 + Math.sin(this.armPhase * 3) * 0.1;
    ctx.strokeStyle = `rgba(155, 89, 182, ${trailAlpha})`;
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const ox = -8 + i * 8;
      ctx.beginPath();
      ctx.moveTo(ox, this.height / 2);
      ctx.lineTo(ox, this.height / 2 + 18 + i * 4);
      ctx.stroke();
    }
  }
}

export default Player;
