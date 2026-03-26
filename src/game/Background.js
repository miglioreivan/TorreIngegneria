export class Background {
  constructor() {
    this.stars = [];
    for (let i = 0; i < 80; i++) {
      this.stars.push({
        x: Math.random() * 400,
        y: Math.random() * 650,
        size: 0.5 + Math.random() * 2,
        twinkle: Math.random() * Math.PI * 2
      });
    }

    // Nuvole procedurali
    this.clouds = [];
    for (let i = 0; i < 6; i++) {
      this.clouds.push({
        x: Math.random() * 400,
        y: Math.random() * 400,
        w: 100 + Math.random() * 80,
        h: 40 + Math.random() * 30,
        speed: 0.2 + Math.random() * 0.4,
        opacity: 0.3 + Math.random() * 0.4
      });
    }

    // Particelle meteo (Pioggia/Neve)
    this.particles = [];
    for (let i = 0; i < 100; i++) {
      this.particles.push({
        x: Math.random() * 400,
        y: Math.random() * 650,
        vx: -1 + Math.random() * 2,
        vy: 5 + Math.random() * 5,
        size: 1 + Math.random() * 2
      });
    }

    this.weatherType = 'clear'; // clear, rain, snow
    this.lastWeatherChange = 0;
  }

  update(cameraY, altitude) {
    this.stars.forEach(star => star.twinkle += 0.03);
    
    // Movimento nuvole
    this.clouds.forEach(c => {
      c.x += c.speed;
      if (c.x > 400 + 100) c.x = -150;
    });

    // Gestione meteo randomica
    if (Date.now() - this.lastWeatherChange > 15000) {
      const r = Math.random();
      if (altitude < 500) {
        if (r < 0.6) this.weatherType = 'clear';
        else if (r < 0.85) this.weatherType = 'rain';
        else this.weatherType = 'snow';
      } else {
        this.weatherType = 'clear'; // Niente meteo nello spazio
      }
      this.lastWeatherChange = Date.now();
    }

    // Aggiornamento particelle
    this.particles.forEach(p => {
      if (this.weatherType === 'rain') {
        p.vy = 10 + Math.random() * 5;
        p.vx = -1;
      } else if (this.weatherType === 'snow') {
        p.vy = 1 + Math.random() * 2;
        p.vx = Math.sin(Date.now() * 0.002 + p.x) * 1;
      }

      p.y += p.vy;
      p.x += p.vx;

      if (p.y > 650) { p.y = -10; p.x = Math.random() * 400; }
      if (p.x < -10) p.x = 410;
      if (p.x > 410) p.x = -10;
    });
  }

  draw(ctx, cameraY, altitude) {
    // altNorm: 0 (terra) -> 1 (spazio profondo a 1000m)
    const altNorm = Math.min(altitude / 1000, 1);

    // Gradiente Cielo (Giorno -> Sunset -> Notte)
    let skyTop, skyBottom;
    if (altNorm < 0.3) {
      // Giorno (Azzurro chiaro)
      skyTop    = this.lerpColor('#a8d8ea', '#fc9d9d', altNorm / 0.3);
      skyBottom = this.lerpColor('#ffffff', '#ffecd2', altNorm / 0.3);
    } else if (altNorm < 0.6) {
      // Tramonto (Arancione -> Viola)
      skyTop    = this.lerpColor('#fc9d9d', '#4b0082', (altNorm - 0.3) / 0.3);
      skyBottom = this.lerpColor('#ffecd2', '#000000', (altNorm - 0.3) / 0.3);
    } else {
      // Spazio (Nero/Blu profondo)
      skyTop    = this.lerpColor('#4b0082', '#050510', (altNorm - 0.6) / 0.4);
      skyBottom = this.lerpColor('#000000', '#0a0a20', (altNorm - 0.6) / 0.4);
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, 650);
    gradient.addColorStop(0, skyTop);
    gradient.addColorStop(1, skyBottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 650);

    // Sole e Luna
    this.drawAstro(ctx, altNorm);

    // Nuvole (scompaiono salendo)
    if (altNorm < 0.5) {
      const cloudAlpha = 1 - (altNorm / 0.5);
      this.drawClouds(ctx, cloudAlpha);
    }

    // Stelle (compaiono salendo)
    if (altNorm > 0.4) {
      const starIntensity = (altNorm - 0.4) / 0.6;
      this.drawStars(ctx, starIntensity);
    }

    // Meteo
    if (this.weatherType !== 'clear') {
      this.drawWeather(ctx);
    }

    this.drawInfiniteTower(ctx, cameraY);
  }

  drawAstro(ctx, altNorm) {
    ctx.save();
    // Sole (scende salendo di quota)
    if (altNorm < 0.6) {
      const sunY = 100 + altNorm * 800;
      const sunAlpha = 1 - (altNorm / 0.6);
      ctx.globalAlpha = sunAlpha;
      
      const sunGrad = ctx.createRadialGradient(300, sunY, 0, 300, sunY, 40);
      sunGrad.addColorStop(0, '#fffbe6');
      sunGrad.addColorStop(0.5, '#ffe66d');
      sunGrad.addColorStop(1, 'rgba(255, 230, 109, 0)');
      
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(300, sunY, 80, 0, Math.PI * 2);
      ctx.fill();
    }

    // Luna (sale salendo di quota)
    if (altNorm > 0.4) {
      const moonY = 800 - altNorm * 750;
      const moonAlpha = (altNorm - 0.4) / 0.6;
      ctx.globalAlpha = moonAlpha;
      
      ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#f5f5f5';
      ctx.beginPath();
      ctx.arc(80, moonY, 30, 0, Math.PI * 2);
      ctx.fill();
      
      // Crateri
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.beginPath(); ctx.arc(70, moonY-5, 5, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(90, moonY+10, 8, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }

  drawClouds(ctx, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.clouds.forEach(c => {
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, c.w/2, c.h/2, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  drawWeather(ctx) {
    ctx.save();
    if (this.weatherType === 'rain') {
      ctx.strokeStyle = 'rgba(174, 194, 224, 0.5)';
      ctx.lineWidth = 1;
      this.particles.forEach(p => {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.vx, p.y + 10);
        ctx.stroke();
      });
    } else if (this.weatherType === 'snow') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      this.particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    ctx.restore();
  }

  drawStars(ctx, intensity) {
    this.stars.forEach(star => {
      const a = intensity * (0.5 + Math.sin(star.twinkle) * 0.5);
      ctx.fillStyle = `rgba(255, 255, 255, ${a})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  drawInfiniteTower(ctx, cameraY) {
    const towerX      = 200;
    const towerWidth  = 180;
    const stripeHeight = 120;
    const parallaxFactor = 0.15;

    ctx.save();
    const offset = -cameraY * parallaxFactor;
    const startY = 650 + (offset % stripeHeight);

    for (let i = -2; i < 8; i++) {
      const sectionY = startY - i * stripeHeight;
      const worldY   = Math.floor((cameraY + (650 - sectionY)) / stripeHeight);
      this.drawTowerStripe(ctx, towerX, sectionY, towerWidth, worldY, stripeHeight);
    }
    ctx.restore();
  }

  drawTowerStripe(ctx, towerX, sectionY, width, worldY, stripeHeight) {
    const x = towerX - width / 2;
    const noise   = Math.sin(worldY * 0.3) * 5 + Math.sin(worldY * 0.17) * 3;
    const baseGray = 72 + noise;

    // Ombra
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(x + 5, sectionY + 3, width, stripeHeight);

    // Cemento
    const cementGradient = ctx.createLinearGradient(x, sectionY, x + width, sectionY);
    cementGradient.addColorStop(0, `rgb(${baseGray}, ${baseGray - 4}, ${baseGray - 9})`);
    cementGradient.addColorStop(0.5, `rgb(${baseGray + 2}, ${baseGray - 2}, ${baseGray - 7})`);
    cementGradient.addColorStop(1, `rgb(${baseGray - 3}, ${baseGray - 7}, ${baseGray - 12})`);
    ctx.fillStyle = cementGradient;
    ctx.fillRect(x, sectionY, width, stripeHeight);

    // Sporcizia
    const dirtAmount = 0.25 + Math.sin(worldY * 0.5) * 0.1;
    ctx.fillStyle = `rgba(45, 40, 35, ${dirtAmount})`;
    for (let i = 0; i < 8; i++) {
      const dx = x + ((worldY * 17 + i * 23) % (width - 15));
      const dy = sectionY + ((worldY * 11 + i * 19) % (stripeHeight - 10));
      ctx.fillRect(dx, dy, 3 + (i % 3), 2 + (i % 2));
    }

    // Bordi scuri
    ctx.fillStyle = 'rgba(25, 22, 20, 0.25)';
    ctx.fillRect(x + width - 10, sectionY, 10, stripeHeight);
    ctx.fillRect(x, sectionY + stripeHeight - 15, width, 15);

    // Finestre
    const windowRows = 2;
    const windowCols = 4;
    const bandHeight = stripeHeight / (windowRows + 0.5);

    for (let row = 0; row < windowRows; row++) {
      const bandY = sectionY + row * bandHeight + bandHeight * 0.3;
      ctx.fillStyle = `rgb(${baseGray - 15}, ${baseGray - 20}, ${baseGray - 25})`;
      ctx.fillRect(x - 6, bandY - 4, width + 12, 4);

      for (let col = 0; col < windowCols; col++) {
        const windowWidth = (width - 50) / windowCols;
        const windowX     = x + 22 + col * (windowWidth + 2);
        const lit         = Math.sin(worldY * 0.4 + col * 0.5) > 0.3;

        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(windowX - 1, bandY, windowWidth + 2, bandHeight * 0.6);

        if (lit) {
          const glassGrad = ctx.createLinearGradient(windowX, bandY, windowX + windowWidth, bandY);
          glassGrad.addColorStop(0, '#1a3045');
          glassGrad.addColorStop(0.3, '#2a5070');
          glassGrad.addColorStop(0.7, '#1a3045');
          glassGrad.addColorStop(1, '#0f2030');
          ctx.fillStyle = glassGrad;
        } else {
          ctx.fillStyle = '#0a1520';
        }
        ctx.fillRect(windowX, bandY + 1, windowWidth, bandHeight * 0.6 - 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.fillRect(windowX + 2, bandY + 3, windowWidth * 0.3, bandHeight * 0.4);
      }
    }

    // Cornicione
    ctx.fillStyle = `rgb(${baseGray - 10}, ${baseGray - 15}, ${baseGray - 20})`;
    ctx.fillRect(x - 10, sectionY - 6, width + 20, 8);

    // Fascia rossa UNIVPM ogni 8 sezioni
    if (worldY > 0 && worldY % 8 === 0) {
      ctx.fillStyle = '#a60929';
      ctx.fillRect(x - 10, sectionY - 3, width + 20, 3);
    }
  }

  lerpColor(color1, color2, t) {
    const c1 = this.hexToRgb(color1);
    const c2 = this.hexToRgb(color2);
    return `rgb(${Math.round(c1.r + (c2.r - c1.r) * t)}, ${Math.round(c1.g + (c2.g - c1.g) * t)}, ${Math.round(c1.b + (c2.b - c1.b) * t)})`;
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
      : { r: 0, g: 0, b: 0 };
  }
}

export default Background;
