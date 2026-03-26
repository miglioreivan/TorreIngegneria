import { Leaderboard } from '../game/Leaderboard.js';

/**
 * Classe UI - Gestisce l'interfaccia (Start, Game Over, HUD)
 */
export class UI {
  constructor() {
    this.overlay = document.getElementById('overlay');
  }

  showStartScreen(highScore) {
    this.overlay.innerHTML = `
      <div class="home-header">Quanto è alta la torre di Ingegneria?</div>
      
      <!-- Logo Torre Brutalista (SVG) -->
      <svg class="tower-logo" viewBox="0 0 80 120" width="120" height="180">
        <rect x="5" y="100" width="70" height="15" fill="#5d6d7e" rx="2" />
        <rect x="15" y="30" width="50" height="70" fill="#bdc3c7" />
        <rect x="15" y="30" width="10" height="70" fill="#95a5a6" /> 
        <g fill="#3498db" opacity="0.4">
          <rect x="24" y="35" width="6" height="6" />
          <rect x="37" y="35" width="6" height="6" />
          <rect x="50" y="35" width="6" height="6" />
          <rect x="24" y="50" width="6" height="6" />
          <rect x="37" y="50" width="6" height="6" />
          <rect x="50" y="50" width="6" height="6" />
          <rect x="24" y="65" width="6" height="6" />
          <rect x="37" y="65" width="6" height="6" />
          <rect x="50" y="65" width="6" height="6" />
          <rect x="24" y="80" width="6" height="6" />
          <rect x="37" y="80" width="6" height="6" />
          <rect x="50" y="80" width="6" height="6" />
        </g>
        <rect x="25" y="10" width="30" height="20" fill="#95a5a6" />
        <rect x="23" y="22" width="34" height="5" fill="#7f8c8d" />
        <g fill="#3498db" opacity="0.6">
          <rect x="28" y="13" width="6" height="6" />
          <rect x="44" y="13" width="6" height="6" />
        </g>
        <rect x="22" y="5" width="36" height="5" fill="#a60929" />
        <rect x="20" y="30" width="2" height="70" fill="rgba(0,0,0,0.1)" />
        <rect x="20" y="30" width="40" height="2" fill="rgba(255,255,255,0.2)" />
      </svg>

      <div class="title">TORRE INGEGNERIA</div>
      <div class="subtitle">ENDLESS CLIMB</div>
      <div class="highscore-display">RECORD: ${highScore}m</div>

      <div class="character-selector">
        <p>SCEGLI PERSONAGGIO</p>
        <div class="char-options">
          <div class="char-opt ${localStorage.getItem('torreIngegneriaSkin') === 'robot' || !localStorage.getItem('torreIngegneriaSkin') ? 'active' : ''}" data-skin="robot">
            <div class="char-preview robot"></div>
            <span>ROBOT</span>
          </div>
          <div class="char-opt ${localStorage.getItem('torreIngegneriaSkin') === 'boy' ? 'active' : ''}" data-skin="boy">
            <div class="char-preview boy"></div>
            <span>BOY</span>
          </div>
          <div class="char-opt ${localStorage.getItem('torreIngegneriaSkin') === 'girl' ? 'active' : ''}" data-skin="girl">
            <div class="char-preview girl"></div>
            <span>GIRL</span>
          </div>
        </div>
      </div>

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
      
      <div class="menu-buttons">
        <div id="startBtn" class="start-btn">GIOCA ORA</div>
        <div id="lbBtn" class="lb-btn secondary-btn">CLASSIFICA</div>
      </div>

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

    this.overlay.className = 'visible start-screen';
  }

  showGameOver(score, highScore) {
    this.overlay.innerHTML = `
      <div class="game-over-title">GAME OVER</div>
      
      <div class="result-stats">
        <p class="final-score">ALTEZZA: <span>${score}m</span></p>
        <p class="best-score">RECORD PERSONALE: ${highScore}m</p>
      </div>

      <div id="miniLb" class="mini-lb-container">
        <div class="mini-lb-title">TOP 3 GLOBALE</div>
        <div class="mini-lb-rows">
          <div class="mini-lb-row empty"><span>#1</span> <span>---</span> <span>0m</span></div>
          <div class="mini-lb-row empty"><span>#2</span> <span>---</span> <span>0m</span></div>
          <div class="mini-lb-row empty"><span>#3</span> <span>---</span> <span>0m</span></div>
        </div>
      </div>

      <div class="save-score-card">
        <h3>SALVA RECORD GLOBALE</h3>
        <div class="input-row">
          <input type="text" id="playerName" placeholder="NOME / NICKNAME" maxlength="15" />
          <div id="saveBtn" class="save-btn">INVIA</div>
        </div>
        <p id="saveStatus" class="save-status"></p>
      </div>

      <div class="menu-buttons horizontal">
        <div id="retryBtn" class="start-btn">RIPROVA</div>
        <div id="lbBtnInGame" class="lb-btn secondary-btn">CLASSIFICA</div>
      </div>

      <div class="retry-text">CLICCA PER RICOMINCIARE</div>
    `;
    this.overlay.className = 'visible game-over-screen';
  }

  /**
   * Aggiorna asincronamente i primi 3 record nella schermata finale
   */
  async updateMiniLeaderboard() {
    const container = document.querySelector('#miniLb .mini-lb-rows');
    if (!container) return;

    try {
      const scores = await Leaderboard.getTopScores(3);
      
      let html = '';
      for (let i = 0; i < 3; i++) {
        const s = scores[i];
        if (s) {
          html += `
            <div class="mini-lb-row">
              <span class="rank">#${i+1}</span>
              <span class="name">${s.name}</span>
              <span class="val">${s.score}m</span>
            </div>`;
        } else {
          html += `
            <div class="mini-lb-row empty">
              <span class="rank">#${i+1}</span>
              <span class="name">---</span>
              <span class="val">0m</span>
            </div>`;
        }
      }
      container.innerHTML = html;
    } catch (err) {
      console.warn('[UI] Errore caricamento mini-leaderboard');
    }
  }

  async showLeaderboard() {
    this.overlay.classList.add('loading');
    this.overlay.innerHTML = `<div class="loader-container"><div class="loader"></div><p>CARICAMENTO CLASSIFICA...</p></div>`;

    try {
      const scores = await Leaderboard.getTopScores(10);
      
      let rowsHtml = scores.map((s, i) => `
        <div class="lb-row ${i === 0 ? 'top-1' : ''}">
          <span class="lb-rank">#${i + 1}</span>
          <span class="lb-name">${s.name}</span>
          <span class="lb-val">${s.score}m</span>
        </div>
      `).join('');

      this.overlay.innerHTML = `
        <div class="leaderboard-modal">
          <div class="lb-header">
            <h3>TOP 10 MONDIALE</h3>
            <div id="closeLb" class="close-btn">×</div>
          </div>
          <div class="lb-body">
            ${rowsHtml || '<p class="empty-msg">NESSUN RECORD ANCORA</p>'}
          </div>
          <div class="lb-footer">👑 SCALA LA TORRE 👑</div>
        </div>
      `;
      this.overlay.className = 'visible leaderboard-view';
    } catch (err) {
      this.overlay.innerHTML = `
        <div class="error-msg">
          <p>ERRORE NEL RECUPERO DATI</p>
          <div id="closeLb" class="start-btn">TORNA AL MENU</div>
        </div>
      `;
    }
  }

  updateHUD(altitude, score) {
    const altEl = document.getElementById('altitude');
    const scoreEl = document.getElementById('score');
    if (altEl) altEl.textContent = altitude;
    if (scoreEl) scoreEl.textContent = score;
  }
}
