import * as SQLite from 'expo-sqlite';
import { Jornada } from '../../../types/jornada';

const db = SQLite.openDatabaseSync('jornada.db');

export const jornadaSqliteService = {
  init() {
    db.execSync(`CREATE TABLE IF NOT EXISTS jornadas (
      id TEXT PRIMARY KEY, dataInicio TEXT, dataFim TEXT, status TEXT, veiculoId TEXT, observacao TEXT
    );`);
  },
  getAllJornadas(): Promise<Jornada[]> {
    return new Promise((resolve, reject) => {
      try {
        const result = db.getAllSync('SELECT * FROM jornadas');
        resolve(result as Jornada[]);
      } catch (error) {
        reject(error);
      }
    });
  },
  saveJornada(j: Jornada): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        db.runSync(
          `REPLACE INTO jornadas (id, dataInicio, dataFim, status, veiculoId, observacao)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [j.id, j.dataInicio, j.dataFim, j.status, j.veiculoId, j.observacao]
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
  deleteJornada(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        db.runSync('DELETE FROM jornadas WHERE id = ?', [id]);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};