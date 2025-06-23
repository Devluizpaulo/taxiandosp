import * as SQLite from 'expo-sqlite';
import { VehicleForm } from '../../app/setup/veiculo';

const db = SQLite.openDatabaseSync('vehicle.db');

export const vehicleSqliteService = {
  init() {
    db.execSync(`CREATE TABLE IF NOT EXISTS vehicle (
      id TEXT PRIMARY KEY,
      nomeVeiculo TEXT,
      marca TEXT,
      modelo TEXT,
      ano TEXT,
      placa TEXT,
      volumeTanque TEXT,
      volumeTanqueSecundario TEXT,
      chassi TEXT,
      renavam TEXT,
      cor TEXT,
      combustivel TEXT,
      combustivelSecundario TEXT,
      foto TEXT,
      alvara TEXT,
      validade TEXT
    );`);
  },
  async saveVehicle(uid: string, data: VehicleForm): Promise<void> {
    db.runSync(
      `REPLACE INTO vehicle (id, nomeVeiculo, marca, modelo, ano, placa, volumeTanque, volumeTanqueSecundario, chassi, renavam, cor, combustivel, combustivelSecundario, foto, alvara, validade)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uid,
        data.nomeVeiculo ?? '',
        data.marca,
        data.modelo,
        data.ano,
        data.placa,
        data.volumeTanque ?? '',
        data.volumeTanqueSecundario ?? '',
        data.chassi ?? '',
        data.renavam ?? '',
        data.cor,
        data.combustivel,
        data.combustivelSecundario ?? '',
        data.foto ?? '',
        data.alvara ?? '',
        data.validade ?? ''
      ]
    );
  },
  async getVehicle(uid: string): Promise<VehicleForm | null> {
    const result = db.getAllSync('SELECT * FROM vehicle WHERE id = ?', [uid]);
    if (result && result.length > 0) {
      const row = result[0];
      return {
        nomeVeiculo: row.nomeVeiculo,
        marca: row.marca,
        modelo: row.modelo,
        ano: row.ano,
        placa: row.placa,
        volumeTanque: row.volumeTanque,
        volumeTanqueSecundario: row.volumeTanqueSecundario,
        chassi: row.chassi,
        renavam: row.renavam,
        cor: row.cor,
        combustivel: row.combustivel,
        combustivelSecundario: row.combustivelSecundario,
        foto: row.foto,
        alvara: row.alvara,
        validade: row.validade,
      };
    }
    return null;
  },
}; 