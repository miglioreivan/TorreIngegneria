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
      this._drawHuman(ctx, '#3498db', '#f1c40f', false); // Tuta blu, capelli biondi
    } else if (this.skin === 'girl') {
      this._drawHuman(ctx, '#e84393', '#2d3436', true);  // Tuta rosa, capelli neri
    } else {
      this._drawRobot(ctx);
    }

    ctx.restore();
  }

  /**
   * Disegna il personaggio Robot originale
   */
  _drawRobot(ctx) {
    // Ombra
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(0, this.height / 2 + 6, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    const move = this.onGround ? 0 : Math.sin(this.armPhase) * 4;

    // Corpo principale (forma più morbida)
    ctx.fillStyle = '#8e9eab';
    ctx.beginPath();
    ctx.roundRect(-14, -6, 28, 26, 8);
    ctx.fill();

    // Dettaglio centrale luminoso
    const core = ctx.createRadialGradient(0, 4, 2, 0, 4, 10);
    core.addColorStop(0, '#ff7675');
    core.addColorStop(1, '#d63031');
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(0, 4, 6, 0, Math.PI * 2);
    ctx.fill();

    // Testa più grande (stile cartoon)
    ctx.fillStyle = '#b2bec3';
    ctx.beginPath();
    ctx.roundRect(-16, -32, 32, 24, 10);
    ctx.fill();

    // Visore
    ctx.fillStyle = '#2d3436';
    ctx.beginPath();
    ctx.roundRect(-12, -26, 24, 12, 6);
    ctx.fill();

    // Occhi LED
    ctx.fillStyle = '#74b9ff';
    ctx.beginPath(); ctx.arc(-6, -20, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(6, -20, 3, 0, Math.PI * 2); ctx.fill();

    // Braccia
    const armAngle = this.isFlying ? Math.PI / 2 : Math.sin(this.armPhase) * 0.3;

    ctx.fillStyle = '#b2bec3';

    // SX
    ctx.save();
    ctx.translate(-16, -2);
    ctx.rotate(-0.3 + armAngle);
    ctx.fillRect(-3, 0, 6, 16);
    ctx.restore();

    // DX
    ctx.save();
    ctx.translate(16, -2);
    ctx.rotate(0.3 - armAngle);
    ctx.fillRect(-3, 0, 6, 16);
    ctx.restore();

    // Gambe
    ctx.fillStyle = '#636e72';
    ctx.fillRect(-10, 10 + move, 8, 14);
    ctx.fillRect(2, 10 - move, 8, 14);
  }

  /**
   * Disegna uno dei personaggi umani (Ragazzo/Ragazza)
   */
  _drawHuman(ctx, suitColor, hairColor, isGirl) {
    // Ombra
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(0, this.height / 2 + 5, 12, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    const move = this.onGround ? 0 : Math.sin(this.armPhase) * 4;

    // Corpo
    ctx.fillStyle = suitColor;
    ctx.beginPath();
    ctx.roundRect(-12, -6, 24, 22, 6);
    ctx.fill();

    // Fascia UNIVPM
    ctx.fillStyle = '#a60929';
    ctx.fillRect(-12, 0, 24, 4);

    // Testa più grande (stile cartoon)
    ctx.fillStyle = '#ffeaa7';
    ctx.beginPath();
    ctx.arc(0, -20, 16, 0, Math.PI * 2);
    ctx.fill();

    // Capelli
    ctx.fillStyle = hairColor;
    if (isGirl) {
      ctx.beginPath();
      ctx.arc(0, -24, 18, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(-18, -24, 8, 26);
      ctx.fillRect(10, -24, 8, 26);
    } else {
      ctx.beginPath();
      ctx.arc(0, -26, 18, Math.PI, 0);
      ctx.fill();
    }

    // Occhi più grandi
    ctx.fillStyle = '#2d3436';
    ctx.beginPath(); ctx.arc(-6, -20, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(6, -20, 2.5, 0, Math.PI * 2); ctx.fill();

    // Braccia
    const armAngle = Math.sin(this.armPhase) * 0.3;

    ctx.fillStyle = suitColor;

    ctx.save();
    ctx.translate(-14, -4);
    ctx.rotate(-0.2 + armAngle);
    ctx.fillRect(-4, 0, 6, 14);
    ctx.restore();

    ctx.save();
    ctx.translate(14, -4);
    ctx.rotate(0.2 - armAngle);
    ctx.fillRect(-2, 0, 6, 14);
    ctx.restore();

    // Gambe
    ctx.fillStyle = '#2d3436';
    ctx.fillRect(-10, 10 + move, 8, 14);
    ctx.fillRect(2, 10 - move, 8, 14);

    // Scarpe
    ctx.fillStyle = '#fff';
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
