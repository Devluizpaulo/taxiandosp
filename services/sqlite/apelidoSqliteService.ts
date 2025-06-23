import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('apelido.db');

export const apelidoSqliteService = {
  init() {
    db.execSync(`CREATE TABLE IF NOT EXISTS apelido (
      userId TEXT PRIMARY KEY,
      apelido TEXT
    );`);
  },
  async saveApelido(uid: string, apelido: string): Promise<void> {
    db.runSync(
      `REPLACE INTO apelido (userId, apelido) VALUES (?, ?)`,
      [uid, apelido]
    );
  },
  async getApelido(uid: string): Promise<string | null> {
    const result = db.getAllSync('SELECT apelido FROM apelido WHERE userId = ?', [uid]);
    if (result && result.length > 0) {
      return result[0].apelido;
    }
    return null;
  },
}; 