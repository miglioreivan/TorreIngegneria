import { CONFIG } from '../config.js';

/**
 * Classe Player - Personaggio migliorato
 */
export class Player {
  constructor(x, y) {
    this.width  = 36;
    this.height = 48;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.canJump  = false;
    this.hasJumped = false;
    this.isFlying  = false;
    this.rotation  = 0;
    this.armPhase  = 0;

    // Particelle usate durante il bonus Gulliver
    this._flyParticles = Array.from({ length: 8 }, () => this._newParticle());
  }

  /** Crea una nuova particella di volo */
  _newParticle() {
    return {
      angle:    Math.random() * Math.PI * 2,
      dist:     18 + Math.random() * 14,
      size:     1.5 + Math.random() * 2.5,
      speed:    0.03 + Math.random() * 0.04,
      alpha:    0.4 + Math.random() * 0.5,
      hue:      Math.round(270 + Math.random() * 40) // viola/blu
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
    this.vy       = CONFIG.JUMP_VELOCITY;
    this.onGround = false;
    this.canJump  = false;
  }

  land(platform) {
    this.y        = platform.y - this.height;
    this.onGround = true;
    this.canJump  = true;

    if (platform.type === 'bouncy') {
      this.vy       = CONFIG.JUMP_VELOCITY * 1.7;
      this.onGround = false;
    } else {
      this.vy = 0;
    }
  }

  startJumping() {
    this.hasJumped = true;
    this.canJump   = true;
    this.isFlying  = false;
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

    // ====== EFFETTO VISIVO GULLIVER BONUS ======
    if (this.isFlying) {
      this._drawFlyEffect(ctx);
    } else {
      ctx.rotate(this.rotation * Math.PI / 180);
    }

    // === OMBRA ===
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(2, this.height / 2 + 5, 12, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // === GAMBE ===
    const legOffset = this.onGround ? 0 : Math.sin(this.armPhase) * 3;

    ctx.fillStyle = '#2c3e50';
    ctx.save();
    ctx.translate(-6, 8);
    ctx.rotate(legOffset * 0.1);
    ctx.fillRect(-4, 0, 8, 16);
    ctx.restore();

    ctx.save();
    ctx.translate(6, 8);
    ctx.rotate(-legOffset * 0.1);
    ctx.fillRect(-4, 0, 8, 16);
    ctx.restore();

    // === CORPO ===
    ctx.fillStyle = '#922b21';
    ctx.beginPath();
    ctx.roundRect(-14, -8, 28, 24, 4);
    ctx.fill();

    const bodyGradient = ctx.createLinearGradient(-14, -8, 14, -8);
    bodyGradient.addColorStop(0, '#a60929');
    bodyGradient.addColorStop(0.5, '#c0392b');
    bodyGradient.addColorStop(1, '#a60929');
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.roundRect(-13, -7, 26, 22, 3);
    ctx.fill();

    // === DISTINTIVO ===
    ctx.fillStyle = '#ffe66d';
    ctx.beginPath();
    ctx.moveTo(0, -2);
    ctx.lineTo(4, 4);
    ctx.lineTo(-4, 4);
    ctx.closePath();
    ctx.fill();

    // === BRACCIA ===
    // Durante il volo: braccia aperte in orizzontale con glow viola
    const armAngle = this.isFlying
      ? Math.PI / 2                              // braccia aperte (90°)
      : (this.onGround ? 0 : Math.sin(this.armPhase) * 0.4);

    if (this.isFlying) {
      // Braccio sinistro — aperto
      ctx.save();
      ctx.translate(-14, 0);
      ctx.rotate(Math.PI / 2);
      ctx.fillStyle = '#f39c12';
      ctx.fillRect(-3, -14, 6, 14);
      ctx.fillStyle = '#ffeaa7';
      ctx.beginPath();
      ctx.arc(0, -15, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Braccio destro — aperto
      ctx.save();
      ctx.translate(14, 0);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = '#f39c12';
      ctx.fillRect(-3, -14, 6, 14);
      ctx.fillStyle = '#ffeaa7';
      ctx.beginPath();
      ctx.arc(0, -15, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      // Braccio sinistro — normale
      ctx.save();
      ctx.translate(-14, 0);
      ctx.rotate(-0.3 + armAngle);
      ctx.fillStyle = '#f39c12';
      ctx.fillRect(-3, -3, 6, 14);
      ctx.fillStyle = '#ffeaa7';
      ctx.beginPath();
      ctx.arc(0, 12, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Braccio destro — normale
      ctx.save();
      ctx.translate(14, 0);
      ctx.rotate(0.3 - armAngle);
      ctx.fillStyle = '#f39c12';
      ctx.fillRect(-3, -3, 6, 14);
      ctx.fillStyle = '#ffeaa7';
      ctx.beginPath();
      ctx.arc(0, 12, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // === CASCO ===
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.arc(0, -18, 16, 0, Math.PI);
    ctx.fill();

    const helmetGradient = ctx.createRadialGradient(0, -22, 0, 0, -20, 18);
    helmetGradient.addColorStop(0, '#e74c3c');
    helmetGradient.addColorStop(0.7, '#c0392b');
    helmetGradient.addColorStop(1, '#a60929');
    ctx.fillStyle = helmetGradient;
    ctx.beginPath();
    ctx.arc(0, -20, 16, Math.PI, 0);
    ctx.fill();

    // Visiera
    ctx.fillStyle = '#ffeaa7';
    ctx.beginPath();
    ctx.arc(0, -16, 11, 0, Math.PI * 2);
    ctx.fill();

    // Cinturino
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(-12, -11, 24, 3);

    // === OCCHI ===
    ctx.fillStyle = '#2d3436';
    ctx.beginPath();
    ctx.arc(-4, -17, 2.5, 0, Math.PI * 2);
    ctx.arc(4, -17, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-3, -18, 1, 0, Math.PI * 2);
    ctx.arc(5, -18, 1, 0, Math.PI * 2);
    ctx.fill();

    // === GUANCE ===
    ctx.fillStyle = 'rgba(231, 76, 60, 0.4)';
    ctx.beginPath();
    ctx.ellipse(-10, -12, 4, 3, 0, 0, Math.PI * 2);
    ctx.ellipse(10, -12, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // === SORRISO ===
    ctx.strokeStyle = '#2d3436';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -13, 5, 0.2, Math.PI - 0.2);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Disegna l'effetto visivo del bonus Gulliver:
   * - Bagliore viola attorno al giocatore
   * - Particelle orbitanti
   */
  _drawFlyEffect(ctx) {
    // Bagliore viola (shadow su tutta la figura)
    ctx.shadowColor = '#9b59b6';
    ctx.shadowBlur  = 18 + Math.sin(this.armPhase * 2) * 6;

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
