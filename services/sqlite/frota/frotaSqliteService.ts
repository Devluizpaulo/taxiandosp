import * as SQLite from 'expo-sqlite';
import { Diaria, Frota, PagamentoFrota, VeiculoLocado } from '../../../types/frota';

const db = SQLite.openDatabaseSync('frota.db');

export const frotaSqliteService = {
  // Inicialização das tabelas
  init() {
    db.execSync(`CREATE TABLE IF NOT EXISTS frotas (
        id TEXT PRIMARY KEY, nome TEXT, cnpj TEXT, telefone TEXT, telefoneEmergencia TEXT, email TEXT, pixChave TEXT,
        aceitaFeriado INTEGER, aceitaDomingo INTEGER, possuiGuincho INTEGER, estiloCobranca TEXT, observacoes TEXT, createdAt TEXT, updatedAt TEXT
      );`);
    db.execSync(`CREATE TABLE IF NOT EXISTS veiculosLocados (
        id TEXT PRIMARY KEY, veiculoId TEXT, nome TEXT, valorDiaria REAL, inicioContrato TEXT, ativo INTEGER
      );`);
    db.execSync(`CREATE TABLE IF NOT EXISTS diarias (
        id TEXT PRIMARY KEY, data TEXT, veiculoLocadoId TEXT, valor REAL, status TEXT, observacao TEXT
      );`);
    db.execSync(`CREATE TABLE IF NOT EXISTS pagamentosFrota (
        id TEXT PRIMARY KEY, data TEXT, valor REAL, metodo TEXT, comprovanteURL TEXT, observacao TEXT
      );`);
  },

  // FROTAS
  getAllFrotas(): Promise<Frota[]> {
    return new Promise((resolve, reject) => {
      try {
        const result = db.getAllSync('SELECT * FROM frotas');
        resolve(result as Frota[]);
      } catch (error) {
        reject(error);
      }
    });
  },
  saveFrota(frota: Frota): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        db.runSync(
          `REPLACE INTO frotas (id, nome, cnpj, telefone, telefoneEmergencia, email, pixChave, aceitaFeriado, aceitaDomingo, possuiGuincho, estiloCobranca, observacoes, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            frota.id,
            frota.nome ?? '',
            frota.cnpj ?? '',
            frota.telefone ?? '',
            frota.telefoneEmergencia ?? '',
            frota.email ?? '',
            frota.pixChave ?? '',
            frota.aceitaFeriado ? 1 : 0,
            frota.aceitaDomingo ? 1 : 0,
            frota.possuiGuincho ? 1 : 0,
            frota.estiloCobranca ?? '',
            frota.observacoes ?? '',
            frota.createdAt ? frota.createdAt.toISOString() : '',
            frota.updatedAt ? frota.updatedAt.toISOString() : ''
          ]
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
  deleteFrota(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        db.runSync('DELETE FROM frotas WHERE id = ?', [id]);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  // VEÍCULOS LOCADOS
  getAllVeiculosLocados(): Promise<VeiculoLocado[]> {
    return new Promise((resolve, reject) => {
      try {
        const result = db.getAllSync('SELECT * FROM veiculosLocados');
        resolve(result as VeiculoLocado[]);
      } catch (error) {
        reject(error);
      }
    });
  },
  saveVeiculoLocado(veiculo: VeiculoLocado): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        db.runSync(
          `REPLACE INTO veiculosLocados (id, veiculoId, nome, valorDiaria, inicioContrato, ativo)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            veiculo.id,
            veiculo.veiculoId ?? '',
            veiculo.nome ?? '',
            veiculo.valorDiaria ?? 0,
            veiculo.inicioContrato ?? '',
            veiculo.ativo ? 1 : 0
          ]
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
  deleteVeiculoLocado(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        db.runSync('DELETE FROM veiculosLocados WHERE id = ?', [id]);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  // DIÁRIAS
  getAllDiarias(): Promise<Diaria[]> {
    return new Promise((resolve, reject) => {
      try {
        const result = db.getAllSync('SELECT * FROM diarias');
        resolve(result as Diaria[]);
      } catch (error) {
        reject(error);
      }
    });
  },
  saveDiaria(diaria: Diaria): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        db.runSync(
          `REPLACE INTO diarias (id, data, veiculoLocadoId, valor, status, observacao)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            diaria.id,
            diaria.data ?? '',
            diaria.veiculoLocadoId ?? '',
            diaria.valor ?? 0,
            diaria.status ?? '',
            diaria.observacao ?? ''
          ]
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
  deleteDiaria(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        db.runSync('DELETE FROM diarias WHERE id = ?', [id]);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  // PAGAMENTOS
  getAllPagamentos(): Promise<PagamentoFrota[]> {
    return new Promise((resolve, reject) => {
      try {
        const result = db.getAllSync('SELECT * FROM pagamentosFrota');
        resolve(result as PagamentoFrota[]);
      } catch (error) {
        reject(error);
      }
    });
  },
  savePagamento(pagamento: PagamentoFrota): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        db.runSync(
          `REPLACE INTO pagamentosFrota (id, data, valor, metodo, comprovanteURL, observacao)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            pagamento.id,
            pagamento.data ?? '',
            pagamento.valor ?? 0,
            pagamento.metodo ?? '',
            pagamento.comprovanteURL ?? '',
            pagamento.observacao ?? ''
          ]
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
  deletePagamento(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        db.runSync('DELETE FROM pagamentosFrota WHERE id = ?', [id]);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};