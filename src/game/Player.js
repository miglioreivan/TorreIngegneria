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

    // Skin del personaggio
    this.skin = localStorage.getItem('torreIngegneriaSkin') || 'robot';

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
    // === OMBRA ===
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, this.height / 2 + 6, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // === GAMBE / STIVALI MECCANICI ===
    const legMove = this.onGround ? 0 : Math.sin(this.armPhase) * 4;
    ctx.fillStyle = '#2c3e50';
    
    // Gamba SX
    ctx.save();
    ctx.translate(-7, 8 + legMove);
    ctx.fillRect(-5, 0, 10, 14); // Pantalone
    ctx.fillStyle = '#7f8c8d'; 
    ctx.fillRect(-6, 10, 12, 6);  // Stivale tech
    ctx.restore();

    // Gamba DX
    ctx.save();
    ctx.translate(7, 8 - legMove);
    ctx.fillRect(-5, 0, 10, 14);
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(-6, 10, 12, 6);
    ctx.restore();

    // === CORPO / TECH VEST ===
    ctx.fillStyle = '#7f8c8d';
    ctx.beginPath();
    ctx.roundRect(-15, -10, 30, 26, 6);
    ctx.fill();

    const vestGrad = ctx.createLinearGradient(-15, -10, 15, -10);
    vestGrad.addColorStop(0, '#a60929');
    vestGrad.addColorStop(0.5, '#c0392b');
    vestGrad.addColorStop(1, '#a60929');
    ctx.fillStyle = vestGrad;
    ctx.beginPath();
    ctx.roundRect(-14, -8, 28, 22, 5);
    ctx.fill();

    // === BRACCIA ===
    const armAngle = this.isFlying ? Math.PI / 2 : (this.onGround ? 0 : Math.sin(this.armPhase) * 0.4);
    
    // SX
    ctx.save();
    ctx.translate(-15, -2);
    ctx.rotate(-0.4 + armAngle);
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(-3, 0, 6, 15);
    ctx.fillStyle = '#ffeaa7'; 
    ctx.beginPath(); ctx.arc(0, 14, 4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // DX
    ctx.save();
    ctx.translate(15, -2);
    ctx.rotate(0.4 - armAngle);
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(-3, 0, 6, 15);
    ctx.fillStyle = '#ffeaa7';
    ctx.beginPath(); ctx.arc(0, 14, 4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // === CASCO ===
    const helmetGrad = ctx.createLinearGradient(0, -38, 0, -18);
    helmetGrad.addColorStop(0, '#a60929');
    helmetGrad.addColorStop(1, '#7b061e');
    ctx.fillStyle = helmetGrad;
    ctx.beginPath();
    ctx.arc(0, -22, 18, Math.PI, 0);
    ctx.fill();

    const visorGrad = ctx.createLinearGradient(-14, -28, 14, -28);
    visorGrad.addColorStop(0, '#2d3436');
    visorGrad.addColorStop(0.5, '#34495e');
    visorGrad.addColorStop(1, '#2d3436');
    ctx.fillStyle = visorGrad;
    ctx.beginPath();
    ctx.roundRect(-14, -28, 28, 12, 4);
    ctx.fill();
  }

  /**
   * Disegna uno dei personaggi umani (Ragazzo/Ragazza)
   */
  _drawHuman(ctx, suitColor, hairColor, isGirl) {
    // === OMBRA ===
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(0, this.height/2 + 5, 12, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    const move = this.onGround ? 0 : Math.sin(this.armPhase) * 4;

    // === GAMBE ===
    ctx.fillStyle = '#2d3436';
    ctx.fillRect(-10, 8 + move, 8, 14); // Gamba SX
    ctx.fillRect(2, 8 - move, 8, 14);  // Gamba DX

    // Scarpe
    ctx.fillStyle = '#fff';
    ctx.fillRect(-11, 20 + move, 10, 4);
    ctx.fillRect(1, 20 - move, 10, 4);

    // === CORPO (Tuta UNIVPM Style) ===
    ctx.fillStyle = suitColor;
    ctx.beginPath();
    ctx.roundRect(-14, -8, 28, 20, 4);
    ctx.fill();

    // Dettaglio UNIVPM (stropcia rossa)
    ctx.fillStyle = '#a60929';
    ctx.fillRect(-14, -2, 28, 4);

    // === TESTA ===
    ctx.fillStyle = '#ffeaa7'; // pelle
    ctx.beginPath();
    ctx.arc(0, -20, 14, 0, Math.PI * 2);
    ctx.fill();

    // Capelli
    ctx.fillStyle = hairColor;
    if (isGirl) {
      // Capelli lunghi ragazza
      ctx.beginPath();
      ctx.arc(0, -24, 16, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(-16, -24, 8, 25);
      ctx.fillRect(8, -24, 8, 25);
    } else {
      // Capelli ragazzo
      ctx.beginPath();
      ctx.arc(0, -24, 15, Math.PI, 0);
      ctx.fill();
    }

    // Occhi
    ctx.fillStyle = '#2d3436';
    ctx.beginPath(); ctx.arc(-5, -20, 1.5, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(5, -20, 1.5, 0, Math.PI*2); ctx.fill();

    // === BRACCIA ===
    const armAngle = this.onGround ? 0 : Math.sin(this.armPhase) * 0.4;
    ctx.fillStyle = suitColor;
    
    ctx.save();
    ctx.translate(-14, -4);
    ctx.rotate(-0.2 + armAngle);
    ctx.fillRect(-5, 0, 6, 14);
    ctx.restore();

    ctx.save();
    ctx.translate(14, -4);
    ctx.rotate(0.2 - armAngle);
    ctx.fillRect(-1, 0, 6, 14);
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
