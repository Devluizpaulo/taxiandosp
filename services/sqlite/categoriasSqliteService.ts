import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('categorias.db');

export const categoriasSqliteService = {
  init() {
    db.execSync(`CREATE TABLE IF NOT EXISTS categorias (
      userId TEXT,
      id TEXT,
      nome TEXT,
      tipo TEXT,
      cor TEXT,
      icone TEXT,
      PRIMARY KEY (userId, id)
    );`);
  },
  async saveCategorias(uid: string, categorias: any[]): Promise<void> {
    db.execSync('DELETE FROM categorias WHERE userId = ?', [uid]);
    for (const c of categorias) {
      db.runSync(
        `INSERT INTO categorias (userId, id, nome, tipo, cor, icone) VALUES (?, ?, ?, ?, ?, ?)`,
        [uid, c.id, c.nome, c.tipo, c.cor, c.icone]
      );
    }
  },
  async getCategorias(uid: string): Promise<any[]> {
    const result = db.getAllSync('SELECT * FROM categorias WHERE userId = ?', [uid]);
    return result.map((row: any) => ({
      id: row.id,
      nome: row.nome,
      tipo: row.tipo,
      cor: row.cor,
      icone: row.icone,
    }));
  },
}; 