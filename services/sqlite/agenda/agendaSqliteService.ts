import * as SQLite from 'expo-sqlite';
import { AgendaItem } from '../../../types/agenda';

const db = SQLite.openDatabaseSync('agenda.db');

export const agendaSqliteService = {
  init() {
    db.execSync(`CREATE TABLE IF NOT EXISTS agenda (
      id TEXT PRIMARY KEY, data TEXT, titulo TEXT, descricao TEXT, status TEXT, veiculoId TEXT, observacao TEXT
    );`);
  },
  getAllAgendaItems(): Promise<AgendaItem[]> {
    return new Promise((resolve, reject) => {
      try {
        const result = db.getAllSync('SELECT * FROM agenda');
        resolve(result as AgendaItem[]);
      } catch (error) {
        reject(error);
      }
    });
  },
  saveAgendaItem(item: AgendaItem): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        db.runSync(
          `REPLACE INTO agenda (id, data, titulo, descricao, status, veiculoId, observacao)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [item.id, item.data, item.titulo, item.descricao, item.status, item.veiculoId, item.observacao]
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
  deleteAgendaItem(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        db.runSync('DELETE FROM agenda WHERE id = ?', [id]);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};