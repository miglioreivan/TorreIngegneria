import Game from './game/Game.js';

/**
 * Entry point dell'applicazione
 * Inizializza il gioco quando il DOM è pronto
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  new Game(canvas);
});
