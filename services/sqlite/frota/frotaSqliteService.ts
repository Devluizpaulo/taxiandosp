import * as SQLite from 'expo-sqlite';
import { Diaria, Frota, PagamentoFrota, VeiculoLocado } from '../../../types/frota';

const db = SQLite.openDatabaseSync('frota.db');

export const frotaSqliteService = {
  // Inicialização das tabelas
  init() {
    db.transaction(tx => {
      tx.executeSql(`CREATE TABLE IF NOT EXISTS frotas (
        id TEXT PRIMARY KEY, nome TEXT, cnpj TEXT, telefone TEXT, telefoneEmergencia TEXT, email TEXT, pixChave TEXT,
        aceitaFeriado INTEGER, aceitaDomingo INTEGER, possuiGuincho INTEGER, estiloCobranca TEXT, observacoes TEXT, createdAt TEXT, updatedAt TEXT
      );`);
      tx.executeSql(`CREATE TABLE IF NOT EXISTS veiculosLocados (
        id TEXT PRIMARY KEY, veiculoId TEXT, nome TEXT, valorDiaria REAL, inicioContrato TEXT, ativo INTEGER
      );`);
      tx.executeSql(`CREATE TABLE IF NOT EXISTS diarias (
        id TEXT PRIMARY KEY, data TEXT, veiculoLocadoId TEXT, valor REAL, status TEXT, observacao TEXT
      );`);
      tx.executeSql(`CREATE TABLE IF NOT EXISTS pagamentosFrota (
        id TEXT PRIMARY KEY, data TEXT, valor REAL, metodo TEXT, comprovanteURL TEXT, observacao TEXT
      );`);
    });
  },

  // FROTAS
  getAllFrotas(): Promise<Frota[]> {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql('SELECT * FROM frotas', [], (_, { rows }) => {
          resolve(rows._array as Frota[]);
        }, (_, error) => { reject(error); return false; });
      });
    });
  },
  saveFrota(frota: Frota): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `REPLACE INTO frotas (id, nome, cnpj, telefone, telefoneEmergencia, email, pixChave, aceitaFeriado, aceitaDomingo, possuiGuincho, estiloCobranca, observacoes, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [frota.id, frota.nome, frota.cnpj, frota.telefone, frota.telefoneEmergencia, frota.email, frota.pixChave, frota.aceitaFeriado ? 1 : 0, frota.aceitaDomingo ? 1 : 0, frota.possuiGuincho ? 1 : 0, frota.estiloCobranca, frota.observacoes, frota.createdAt.toISOString(), frota.updatedAt.toISOString()],
          () => resolve(), (_, error) => { reject(error); return false; }
        );
      });
    });
  },
  deleteFrota(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql('DELETE FROM frotas WHERE id = ?', [id], () => resolve(), (_, error) => { reject(error); return false; });
      });
    });
  },

  // VEÍCULOS LOCADOS
  getAllVeiculosLocados(): Promise<VeiculoLocado[]> {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql('SELECT * FROM veiculosLocados', [], (_, { rows }) => {
          resolve(rows._array as VeiculoLocado[]);
        }, (_, error) => { reject(error); return false; });
      });
    });
  },
  saveVeiculoLocado(veiculo: VeiculoLocado): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `REPLACE INTO veiculosLocados (id, veiculoId, nome, valorDiaria, inicioContrato, ativo)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [veiculo.id, veiculo.veiculoId, veiculo.nome, veiculo.valorDiaria, veiculo.inicioContrato, veiculo.ativo ? 1 : 0],
          () => resolve(), (_, error) => { reject(error); return false; }
        );
      });
    });
  },
  deleteVeiculoLocado(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql('DELETE FROM veiculosLocados WHERE id = ?', [id], () => resolve(), (_, error) => { reject(error); return false; });
      });
    });
  },

  // DIÁRIAS
  getAllDiarias(): Promise<Diaria[]> {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql('SELECT * FROM diarias', [], (_, { rows }) => {
          resolve(rows._array as Diaria[]);
        }, (_, error) => { reject(error); return false; });
      });
    });
  },
  saveDiaria(diaria: Diaria): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `REPLACE INTO diarias (id, data, veiculoLocadoId, valor, status, observacao)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [diaria.id, diaria.data, diaria.veiculoLocadoId, diaria.valor, diaria.status, diaria.observacao],
          () => resolve(), (_, error) => { reject(error); return false; }
        );
      });
    });
  },
  deleteDiaria(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql('DELETE FROM diarias WHERE id = ?', [id], () => resolve(), (_, error) => { reject(error); return false; });
      });
    });
  },

  // PAGAMENTOS
  getAllPagamentos(): Promise<PagamentoFrota[]> {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql('SELECT * FROM pagamentosFrota', [], (_, { rows }) => {
          resolve(rows._array as PagamentoFrota[]);
        }, (_, error) => { reject(error); return false; });
      });
    });
  },
  savePagamento(pagamento: PagamentoFrota): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `REPLACE INTO pagamentosFrota (id, data, valor, metodo, comprovanteURL, observacao)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [pagamento.id, pagamento.data, pagamento.valor, pagamento.metodo, pagamento.comprovanteURL, pagamento.observacao],
          () => resolve(), (_, error) => { reject(error); return false; }
        );
      });
    });
  },
  deletePagamento(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql('DELETE FROM pagamentosFrota WHERE id = ?', [id], () => resolve(), (_, error) => { reject(error); return false; });
      });
    });
  },
};