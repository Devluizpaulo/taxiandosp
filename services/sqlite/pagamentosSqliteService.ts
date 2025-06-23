import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('pagamentos.db');

export const pagamentosSqliteService = {
  init() {
    db.execSync(`CREATE TABLE IF NOT EXISTS pagamentos (
      userId TEXT,
      nome TEXT,
      ativo INTEGER,
      PRIMARY KEY (userId, nome)
    );`);
  },
  async savePagamentos(uid: string, pagamentos: { nome: string; ativo: boolean }[]): Promise<void> {
    db.execSync('DELETE FROM pagamentos WHERE userId = ?', [uid]);
    for (const p of pagamentos) {
      db.runSync(
        `INSERT INTO pagamentos (userId, nome, ativo) VALUES (?, ?, ?)`,
        [uid, p.nome, p.ativo ? 1 : 0]
      );
    }
  },
  async getPagamentos(uid: string): Promise<{ nome: string; ativo: boolean }[]> {
    const result = db.getAllSync('SELECT * FROM pagamentos WHERE userId = ?', [uid]);
    return result.map((row: any) => ({ nome: row.nome, ativo: !!row.ativo }));
  },
}; 