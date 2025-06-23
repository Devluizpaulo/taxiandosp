import * as SQLite from 'expo-sqlite';
import { Abastecimento, Posto } from '../../../types/combustivel';

const db = SQLite.openDatabaseSync('combustivel.db');

export const combustivelSqliteService = {
  init() {
    db.execSync(`CREATE TABLE IF NOT EXISTS abastecimentos (
      id TEXT PRIMARY KEY, data TEXT, valor REAL, litros REAL, kmRodado REAL, postoId TEXT, veiculoId TEXT, comprovanteURL TEXT, observacao TEXT
    );`);
    db.execSync(`CREATE TABLE IF NOT EXISTS postos (
      id TEXT PRIMARY KEY, nome TEXT, endereco TEXT, bandeira TEXT, favorito INTEGER
    );`);
  },
  getAllAbastecimentos(): Promise<Abastecimento[]> {
    return new Promise((resolve, reject) => {
      try {
        const result = db.getAllSync('SELECT * FROM abastecimentos');
        resolve(result as Abastecimento[]);
      } catch (error) {
        reject(error);
      }
    });
  },
  saveAbastecimento(a: Abastecimento): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        db.runSync(
          `REPLACE INTO abastecimentos (id, data, valor, litros, kmRodado, postoId, veiculoId, comprovanteURL, observacao)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [a.id, a.data, a.valor, a.litros, a.kmRodado, a.postoId, a.veiculoId, a.comprovanteURL, a.observacao]
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
  deleteAbastecimento(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        db.runSync('DELETE FROM abastecimentos WHERE id = ?', [id]);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
  getAllPostos(): Promise<Posto[]> {
    return new Promise((resolve, reject) => {
      try {
        const result = db.getAllSync('SELECT * FROM postos');
        resolve(result as Posto[]);
      } catch (error) {
        reject(error);
      }
    });
  },
  savePosto(p: Posto): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        db.runSync(
          `REPLACE INTO postos (id, nome, endereco, bandeira, favorito)
           VALUES (?, ?, ?, ?, ?)`,
          [p.id, p.nome, p.endereco, p.bandeira, p.favorito ? 1 : 0]
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
  deletePosto(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        db.runSync('DELETE FROM postos WHERE id = ?', [id]);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};