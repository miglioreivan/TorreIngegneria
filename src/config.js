/**
 * Configurazione globale del gioco
 * Tutti i parametri modificabili in un unico punto
 */
export const CONFIG = {
  CANVAS_WIDTH: 400,
  CANVAS_HEIGHT: 650,

  // Fisica
  GRAVITY: 0.55,
  JUMP_VELOCITY: -13.5,
  MAX_FALL_SPEED: 16,
  HORIZONTAL_SPEED: 6,
  FRICTION: 0.9,

  // Gioco
  BASE_ALTITUDE: 160,      // Quota di partenza (m)
  PIXELS_PER_METER: 14,    // Conversione pixel -> metri
  GULLIVER_BOOST: 150,     // Boost in metri del bonus gulliver
  GULLIVER_SPEED: 18,      // Velocità del boost (pixel/frame)
  GULLIVER_MIN_DISTANCE: 100, // Distanza minima tra due bonus (m)
  PLANE_INTERVAL: 5,       // Ogni quanti metri mostrare la quota

  // Difficoltà Dinamica
  DIFF: {
    MAX_HEIGHT_DIFFICULTY: 2000, // Quota a cui si raggiunge la difficoltà massima
    START_WIDTH: 100,
    END_WIDTH: 65,
    START_GAP: 70,
    END_GAP: 140,
    SPECIAL_START_PROB: 0.1,
    SPECIAL_END_PROB: 0.5
  },

  // === A/B TEST ===
  // Imposta a false per disabilitare completamente il bonus Gulliver
  GULLIVER_ENABLED: true,

  // === DEBUG ===
  // Imposta a true per abilitare il logging in console degli eventi chiave
  DEBUG_MODE: false,

  // Colori - Tema UNIVPM
  COLORS: {
    primary: '#a60929',     // Rosso UNIVPM
    secondary: '#1a1a2e',   // Blu scuro
    accent: '#ffe66d',      // Giallo oro
    danger: '#ff6b6b',
    bgDark: '#1a1a2e',
    text: '#ffffff'
  },

  // Tipi di piattaforma con relativi colori
  PLATFORM_TYPES: {
    normal:    { fill: '#a60929', stroke: '#8a0720' },   // Rosso
    moving:    { fill: '#c41e3a', stroke: '#a01830' },   // Rosso chiaro
    crumbling: { fill: '#a60929', stroke: '#8a0720' },   // Rosso (UNIVPM style)
    bouncy:    { fill: '#a60929', stroke: '#8a0720' },   // Rosso
    gulliver:  { fill: '#9b59b6', stroke: '#8e44ad' }    // Viola - bonus speciale
  }
};

export default CONFIG;
