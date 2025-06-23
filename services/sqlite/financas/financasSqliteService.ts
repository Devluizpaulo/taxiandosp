import * as SQLite from 'expo-sqlite';
import { Categoria, Transacao } from '../../../types/financas';

const db = SQLite.openDatabaseSync('financas.db');

export const financasSqliteService = {
  init() {
    db.execSync(`CREATE TABLE IF NOT EXISTS transacoes (
      id TEXT PRIMARY KEY, data TEXT, valor REAL, tipo TEXT, categoriaId TEXT, descricao TEXT, observacao TEXT
    );`);
    db.execSync(`CREATE TABLE IF NOT EXISTS categorias (
      id TEXT PRIMARY KEY, nome TEXT, cor TEXT, icone TEXT
    );`);
  },
  getAllTransacoes(): Promise<Transacao[]> {
    return new Promise((resolve, reject) => {
      try {
        const result = db.getAllSync('SELECT * FROM transacoes');
        resolve(result as Transacao[]);
      } catch (error) {
        reject(error);
      }
    });
  },
  getAllCategorias(): Promise<Categoria[]> {
    return new Promise((resolve, reject) => {
      try {
        const result = db.getAllSync('SELECT * FROM categorias');
        resolve(result as Categoria[]);
      } catch (error) {
        reject(error);
      }
    });
  },
  saveTransacao(transacao: Transacao): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        db.runSync(
          `REPLACE INTO transacoes (id, data, valor, tipo, categoriaId, descricao, observacao)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            transacao.id,
            transacao.data,
            transacao.valor,
            transacao.tipo,
            transacao.categoria?.id || '',
            transacao.titulo || '',
            transacao.observacao || '',
          ]
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
  saveCategoria(categoria: Categoria): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        db.runSync(
          `REPLACE INTO categorias (id, nome, cor, icone)
           VALUES (?, ?, ?, ?)`,
          [categoria.id, categoria.nome, categoria.cor, categoria.icone]
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
  deleteTransacao(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        db.runSync('DELETE FROM transacoes WHERE id = ?', [id]);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
  deleteCategoria(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        db.runSync('DELETE FROM categorias WHERE id = ?', [id]);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};