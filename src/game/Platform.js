import { CONFIG } from '../config.js';

// Immagine del bonus Gulliver (caricata una volta sola)
let gulliverImage = null;

/**
 * Carica l'immagine Gulliver.
 * Viene chiamata dal Game al bootstrap; se la feature è disabilitata non fa nulla.
 */
export function loadGulliverImage() {
  if (CONFIG.GULLIVER_ENABLED && !gulliverImage) {
    gulliverImage = new Image();
    gulliverImage.src = '/gulliver.png';
    gulliverImage.onerror = () => {
      console.warn('[Platform] Impossibile caricare gulliver.png — verrà mostrata solo la sfera viola.');
      gulliverImage = null;
    };
  }
}

/**
 * Classe Platform - Piattaforme su cui il giocatore atterra
 */
export class Platform {
  constructor(x, y, type = 'normal', width = 75) {
    // Robustezza: tipo sconosciuto → fallback su 'normal'
    if (!CONFIG.PLATFORM_TYPES[type]) {
      console.warn(`[Platform] Tipo sconosciuto "${type}" — ripristinato su "normal".`);
      type = 'normal';
    }

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = 14;
    this.type = type;

    // Per piattaforme mobili
    this.originalX = x;
    this.moveDir = 1;

    // Per piattaforme che si sgretolano
    this.crumbling = false;
    this.crumbleStart = 0;
    this.opacity = 1;

    // Per piattaforme bounce
    this.bouncePhase = Math.random() * Math.PI * 2;

    // Per piattaforme gulliver (oscillazione sfera)
    this.gulliverPhase = Math.random() * Math.PI * 2;
  }

  update() {
    if (this.type === 'moving') {
      this.x += 2 * this.moveDir;
      if (this.x <= this.originalX - 50 || this.x >= this.originalX + 50) {
        this.moveDir *= -1;
      }
    }

    if (this.type === 'bouncy') {
      this.bouncePhase += 0.08;
    }

    if (this.type === 'crumbling' && this.crumbling && Date.now() - this.crumbleStart > 500) {
      this.opacity -= 0.1;
      this.y += 5;
    }

    // Oscillazione per piattaforme gulliver
    if (this.type === 'gulliver') {
      this.gulliverPhase += 0.06;
    }
  }

  getScreenY() {
    if (this.type === 'bouncy') {
      return this.y + Math.sin(this.bouncePhase) * 3;
    }
    return this.y;
  }

  startCrumble() {
    if (!this.crumbling) {
      this.crumbling = true;
      this.crumbleStart = Date.now();
    }
  }

  checkCollision(player) {
    // Durante il volo Gulliver, le collisioni non devono ostacolare il boost
    if (player.isFlying) return false;
    if (this.opacity < 0.3) return false;
    if (player.vy < 0) return false;

    const playerBottom  = player.y + player.height;
    const playerCenterX = player.x + player.width / 2;
    const platformTop   = this.getScreenY();

    return (
      playerCenterX > this.x &&
      playerCenterX < this.x + this.width &&
      playerBottom  > platformTop &&
      playerBottom  < platformTop + this.height + player.vy + 10
    );
  }

  draw(ctx, cameraY) {
    const screenY = this.getScreenY() - cameraY;

    if (screenY < -50 || screenY > CONFIG.CANVAS_HEIGHT + 50) return;

    ctx.save();
    ctx.globalAlpha = this.opacity;

    // Robustezza: fallback se tipo non trovato nella config
    const colors = CONFIG.PLATFORM_TYPES[this.type] || CONFIG.PLATFORM_TYPES['normal'];

    // Ombra sotto la piattaforma
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.roundRect(this.x + 3, screenY + 5, this.width, this.height, 3);
    ctx.fill();

    // Gradiente per la piattaforma
    const platformGradient = ctx.createLinearGradient(this.x, screenY, this.x, screenY + this.height);
    platformGradient.addColorStop(0, colors.fill);
    platformGradient.addColorStop(1, colors.stroke);

    ctx.fillStyle = platformGradient;
    ctx.beginPath();
    ctx.roundRect(this.x, screenY, this.width, this.height, 4);
    ctx.fill();

    // Highlight superiore luminoso
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.roundRect(this.x + 3, screenY + 2, this.width - 6, 4, 2);
    ctx.fill();

    // Bordi
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Effetti speciali per tipo
    if (this.type === 'gulliver')   this.drawGulliverEffect(ctx, screenY);
    if (this.type === 'crumbling')  this.drawCrumblingEffect(ctx, screenY);
    if (this.type === 'bouncy')     this.drawBouncyEffect(ctx, screenY);

    ctx.restore();
  }

  /**
   * Disegna la sfera con l'immagine Gulliver
   */
  drawGulliverEffect(ctx, screenY) {
    const centerX = this.x + this.width / 2;
    const centerY = screenY - 18; // Sopra la piattaforma
    const radius  = 16;

    // Oscillazione verticale
    const bounce = Math.sin(this.gulliverPhase) * 3;
    const finalY = centerY + bounce;

    ctx.save();

    // Glow effect viola
    ctx.shadowColor = '#9b59b6';
    ctx.shadowBlur  = 12 + Math.sin(this.gulliverPhase * 2) * 4;

    // Sfera
    ctx.beginPath();
    ctx.arc(centerX, finalY, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#9b59b6';
    ctx.fill();

    // Bordino chiaro
    ctx.strokeStyle = '#b370cf';
    ctx.lineWidth   = 2;
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Immagine dentro la sfera (clipping)
    if (gulliverImage && gulliverImage.complete && gulliverImage.naturalWidth > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, finalY, radius - 2, 0, Math.PI * 2);
      ctx.clip();

      const imgSize = (radius - 2) * 2;
      ctx.drawImage(gulliverImage, centerX - imgSize / 2, finalY - imgSize / 2, imgSize, imgSize);
      ctx.restore();
    }

    // Highlight lucido sulla sfera
    ctx.beginPath();
    ctx.arc(centerX - 5, finalY - 5, 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fill();

    ctx.restore();
  }

  /**
   * Disegna crepe sulla piattaforma che si sgretola (crumbling)
   */
  drawCrumblingEffect(ctx, screenY) {
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';

    // Crepa principale — da sinistra in diagonale
    const x0 = this.x + this.width * 0.2;
    ctx.beginPath();
    ctx.moveTo(x0,            screenY + 2);
    ctx.lineTo(x0 + 5,        screenY + 7);
    ctx.lineTo(x0 + 2,        screenY + 12);
    ctx.stroke();

    // Crepa secondaria — a destra
    const x1 = this.x + this.width * 0.6;
    ctx.beginPath();
    ctx.moveTo(x1,            screenY + 1);
    ctx.lineTo(x1 - 4,        screenY + 5);
    ctx.lineTo(x1 + 3,        screenY + 10);
    ctx.lineTo(x1 - 1,        screenY + 13);
    ctx.stroke();

    // Micro-crepe sparse
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
    const mx = this.x + this.width * 0.42;
    ctx.beginPath();
    ctx.moveTo(mx,     screenY + 3);
    ctx.lineTo(mx + 3, screenY + 8);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Disegna una molla sopra la piattaforma bouncy
   */
  drawBouncyEffect(ctx, screenY) {
    const cx = this.x + this.width / 2;
    const springTop    = screenY - 14;  // punta superiore molla
    const springBottom = screenY;       // base della molla (tocca la piattaforma)
    const springHeight = springBottom - springTop;  // 14px
    const coils        = 4;             // numero di spire
    const halfW        = 5;             // semi-larghezza spira

    ctx.save();
    ctx.strokeStyle = '#c0392b';   // rosso leggermente più scuro
    ctx.lineWidth   = 1.8;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';

    // Piastrella superiore (cappello molla)
    ctx.fillStyle = '#8a0720';
    ctx.fillRect(cx - 6, springTop - 3, 12, 3);

    // Spirale molla
    ctx.beginPath();
    ctx.moveTo(cx, springTop);
    const steps = coils * 2;
    for (let i = 0; i <= steps; i++) {
      const t  = i / steps;
      const y  = springTop + t * springHeight;
      const xOff = (i % 2 === 0 ? halfW : -halfW);
      if (i === 0) ctx.moveTo(cx + xOff, y);
      else         ctx.lineTo(cx + xOff, y);
    }
    ctx.stroke();

    ctx.restore();
  }
}

/**
 * Factory per generare piattaforme casuali.
 * Se GULLIVER_ENABLED è false, non genera mai piattaforme di tipo 'gulliver'.
 */
export function createRandomPlatform(index) {
  const x     = 40 + Math.random() * (CONFIG.CANVAS_WIDTH - 130);
  const y     = -(index * (50 + Math.random() * 30));
  const width = 65 + Math.random() * 35;

  let type = 'normal';

  if (index > 3) {
    const rand = Math.random();
    if (CONFIG.GULLIVER_ENABLED && rand > 0.97) {
      type = 'gulliver';
      if (CONFIG.DEBUG_MODE) console.log(`[Platform] Gulliver generato (index=${index})`);
    } else if (rand > 0.88) {
      type = 'bouncy';
    } else if (rand > 0.75) {
      type = 'moving';
    } else if (rand > 0.5) {
      type = 'crumbling';
    }
  }

  return new Platform(x, y, type, width);
}

export default Platform;
