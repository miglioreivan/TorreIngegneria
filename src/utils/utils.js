/**
 * Utility functions comuni
 */

/**
 * Interpolazione lineare tra due colori esadecimali
 * @param {string} color1 - Colore iniziale (#RRGGBB)
 * @param {string} color2 - Colore finale (#RRGGBB)
 * @param {number} t - Fattore di interpolazione (0-1)
 * @returns {string} Colore RGB interpolato
 */
export function lerpColor(color1, color2, t) {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  
  const r = Math.round(c1.r + (c2.r - c1.r) * t);
  const g = Math.round(c1.g + (c2.g - c1.g) * t);
  const b = Math.round(c1.b + (c2.b - c1.b) * t);
  
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Converte colore esadecimale in RGB
 * @param {string} hex - Colore (#RRGGBB)
 * @returns {object} Oggetto {r, g, b}
 */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

/**
 * Genera un numero random in un range
 * @param {number} min - Valore minimo
 * @param {number} max - Valore massimo
 * @returns {number} Numero casuale
 */
export function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

/**
 * Limita un valore tra min e max
 * @param {number} value - Valore da limitare
 * @param {number} min - Valore minimo
 * @param {number} max - Valore massimo
 * @returns {number} Valore limitato
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Normalizza un valore in un nuovo range
 * @param {number} value - Valore da normalizzare
 * @param {number} inMin - Range input minimo
 * @param {number} inMax - Range input massimo
 * @param {number} outMin - Range output minimo
 * @param {number} outMax - Range output massimo
 * @returns {number} Valore normalizzato
 */
export function mapRange(value, inMin, inMax, outMin, outMax) {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}
