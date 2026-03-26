import { CONFIG } from '../config.js';

/**
 * Classe UI - Gestisce l'interfaccia utente
 * Responsabilità: HUD, schermate start/game over
 */
export class UI {
  constructor() {
    // Elemento DOM con null-check e warning
    this.altitudeEl = document.getElementById('altitude');
    this.scoreEl    = document.getElementById('score');
    this.overlay    = document.getElementById('overlay');

    if (!this.altitudeEl) console.warn('[UI] Elemento #altitude non trovato nel DOM.');
    if (!this.scoreEl)    console.warn('[UI] Elemento #score non trovato nel DOM.');
    if (!this.overlay)    console.warn('[UI] Elemento #overlay non trovato nel DOM.');
  }

  /**
   * Aggiorna l'HUD durante il gioco
   * @param {number} altitude - Altitudine attuale
   * @param {number} score    - Punteggio (multipli di PLANE_INTERVAL)
   */
  updateHUD(altitude, score) {
    if (this.altitudeEl) this.altitudeEl.textContent = Math.floor(altitude);
    if (this.scoreEl)    this.scoreEl.textContent    = score;
  }

  /**
   * Mostra la schermata iniziale
   * @param {number} highScore - Record attuale
   */
  showStartScreen(highScore) {
    if (!this.overlay) return;

    this.overlay.innerHTML = `
      <div class="home-header">Quanto è alta la torre di Ingegneria?</div>
      
      <!-- Logo Torre SVG Brutalista -->
      <svg class="tower-logo" viewBox="0 0 80 120">
        <!-- Fondamenta / Scala (Base brutalista ampia) -->
        <path d="M10 110 L70 110 L60 95 L20 95 Z" fill="#7f8c8d" />
        
        <!-- Piani in cemento (blocchi sovrapposti) -->
        <!-- Corpo principale -->
        <rect x="20" y="30" width="40" height="70" fill="#95a5a6" />
        
        <!-- Piani sporgenti modularmente (stile brutalista) -->
        <rect x="18" y="90" width="44" height="6" fill="#7f8c8d" />
        <rect x="18" y="75" width="44" height="6" fill="#7f8c8d" />
        <rect x="18" y="60" width="44" height="6" fill="#7f8c8d" />
        <rect x="18" y="45" width="44" height="6" fill="#7f8c8d" />
        
        <!-- Griglia di finestre in vetro blu -->
        <g fill="#3498db" opacity="0.6">
          <!-- Riga 1 -->
          <rect x="24" y="35" width="6" height="6" />
          <rect x="37" y="35" width="6" height="6" />
          <rect x="50" y="35" width="6" height="6" />
          <!-- Riga 2 -->
          <rect x="24" y="50" width="6" height="6" />
          <rect x="37" y="50" width="6" height="6" />
          <rect x="50" y="50" width="6" height="6" />
          <!-- Riga 3 -->
          <rect x="24" y="65" width="6" height="6" />
          <rect x="37" y="65" width="6" height="6" />
          <rect x="50" y="65" width="6" height="6" />
          <!-- Riga 4 -->
          <rect x="24" y="80" width="6" height="6" />
          <rect x="37" y="80" width="6" height="6" />
          <rect x="50" y="80" width="6" height="6" />
        </g>

        <!-- Sommità / Terrazza tecnica (Ora parte integrante con finestre) -->
        <rect x="25" y="10" width="30" height="20" fill="#95a5a6" />
        <rect x="23" y="22" width="34" height="5" fill="#7f8c8d" />
        <g fill="#3498db" opacity="0.6">
          <rect x="28" y="13" width="6" height="6" />
          <rect x="44" y="13" width="6" height="6" />
        </g>
        <rect x="22" y="5" width="36" height="5" fill="#a60929" />
        
        <!-- Dettagli ombre cemento -->
        <rect x="20" y="30" width="2" height="70" fill="rgba(0,0,0,0.1)" />
        <rect x="20" y="30" width="40" height="2" fill="rgba(255,255,255,0.2)" />
      </svg>

      <div class="title">TORRE INGEGNERIA</div>
      <div class="subtitle">ENDLESS CLIMB</div>
      <div class="highscore-display">RECORD: ${highScore}m</div>

      <div class="controls-info">
        <div class="control-item">
          <span class="key-badge">PC</span>
          <span>Frecce o A-D</span>
        </div>
        <div class="control-item">
          <span class="key-badge">MOBILE</span>
          <span>Tocca i lati</span>
        </div>
      </div>
      
      <div id="startBtn" class="start-btn">GIOCA ORA</div>

      <div class="social-links">
        <a href="https://www.instagram.com/acu_gulliver/" target="_blank" class="social-item instagram">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" stroke-width="2" fill="none"/>
            <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2" fill="none"/>
            <circle cx="18" cy="6" r="1.5" fill="currentColor"/>
          </svg>
          <span>@acu_gulliver</span>
        </a>
        <a href="https://linktr.ee/divanetto" target="_blank" class="social-item linktree">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M12 2L4 10H8V22H16V10H20L12 2Z" fill="currentColor"/>
          </svg>
          <span>Linktree</span>
        </a>
        <a href="https://github.com/miglioreivan/TorreIngegneria" target="_blank" class="social-item github">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.372.79 1.102.79 2.222v3.293c0 .319.2.694.825.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" fill="currentColor"/>
          </svg>
          <span>GitHub</span>
        </a>
      </div>
    `;

    this.overlay.classList.remove('hidden');
  }

  /**
   * Mostra la schermata di game over
   * @param {number} score     - Punteggio ottenuto
   * @param {number} highScore - Record
   */
  showGameOver(score, highScore) {
    if (!this.overlay) return;

    this.overlay.innerHTML = `
      <div class="game-over-title">CADUTA!</div>
      <div class="result-stats">
        <div class="final-score">Quota raggiunta: <span>Q${CONFIG.BASE_ALTITUDE + score}</span></div>
        <div class="best-score">Record: Q${CONFIG.BASE_ALTITUDE + highScore}m</div>
      </div>
      <div id="retryBtn" class="start-btn">RIPROVA</div>
    `;
    this.overlay.classList.remove('hidden');
  }

  /** Nasconde l'overlay */
  hideOverlay() {
    if (this.overlay) this.overlay.classList.add('hidden');
  }
}

export default UI;
