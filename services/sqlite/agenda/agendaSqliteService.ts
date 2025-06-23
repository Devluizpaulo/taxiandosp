import * as SQLite from 'expo-sqlite';
import { AgendaItem } from '../../../types/agenda';

const db = SQLite.openDatabaseSync('agenda.db');

export const agendaSqliteService = {
  init() {
    db.transaction(tx => {
      tx.executeSql(`CREATE TABLE IF NOT EXISTS agenda (
        id TEXT PRIMARY KEY, data TEXT, titulo TEXT, descricao TEXT, status TEXT, veiculoId TEXT, observacao TEXT
      );`);
    });
  },
  getAllAgendaItems(): Promise<AgendaItem[]> {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql('SELECT * FROM agenda', [], (_, { rows }) => {
          resolve(rows._array as AgendaItem[]);
        }, (_, error) => { reject(error); return false; });
      });
    });
  },
  saveAgendaItem(item: AgendaItem): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `REPLACE INTO agenda (id, data, titulo, descricao, status, veiculoId, observacao)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [item.id, item.data, item.titulo, item.descricao, item.status, item.veiculoId, item.observacao],
          () => resolve(), (_, error) => { reject(error); return false; }
        );
      });
    });
  },
  deleteAgendaItem(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql('DELETE FROM agenda WHERE id = ?', [id], () => resolve(), (_, error) => { reject(error); return false; });
      });
    });
  },
};