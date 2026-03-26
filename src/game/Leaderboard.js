import { supabase } from '../supabase.js';

export class Leaderboard {
  /**
   * Salva un nuovo punteggio nel database Supabase
   * @param {string} name - Nome utente
   * @param {number} score - Punteggio finale (m)
   */
  static async saveScore(name, score) {
    if (!name || name.trim() === '') {
      throw new Error('Il nome non può essere vuoto.');
    }

    try {
      const { data, error, status } = await supabase
        .from('scores')
        .insert([
          { name: name.trim().toUpperCase(), score: Math.round(score) }
        ])
        .select();

      if (error) {
        console.error(`[Leaderboard] Errore salvataggio (Status: ${status}):`, error.message, error.details, error.hint);
        throw error;
      }
      return data;
    } catch (err) {
      console.error('[Leaderboard] Eccezione durante salvataggio:', err);
      throw err;
    }
  }

  /**
   * Recupera i migliori punteggi
   * @param {number} limit - Massimo numero di risultati (default 100)
   */
  static async getTopScores(limit = 100) {
    try {
      const { data, error, status } = await supabase
        .from('scores')
        .select('name, score') // Rimosso created_at
        .order('score', { ascending: false })
        .limit(limit);

      if (error) {
        console.error(`[Leaderboard] Errore fetch (Status: ${status}):`, error.message, error.details, error.hint);
        throw error;
      }
      return data || [];
    } catch (err) {
      console.error('[Leaderboard] Eccezione durante fetch:', err);
      throw err;
    }
  }
}
