import * as SQLite from 'expo-sqlite';
import { ProfileForm } from '../../app/setup/profile';

const db = SQLite.openDatabaseSync('profile.db');

export const profileSqliteService = {
  init() {
    db.execSync(`CREATE TABLE IF NOT EXISTS profile (
      id TEXT PRIMARY KEY,
      nome TEXT,
      cnh TEXT,
      validadeDia TEXT,
      validadeMes TEXT,
      validadeAno TEXT,
      telefone TEXT,
      foto TEXT,
      alvara TEXT,
      licenca TEXT
    );`);
  },
  async saveProfile(uid: string, data: ProfileForm): Promise<void> {
    db.runSync(
      `REPLACE INTO profile (id, nome, cnh, validadeDia, validadeMes, validadeAno, telefone, foto, alvara, licenca)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uid,
        data.nome,
        data.cnh,
        data.validadeDia,
        data.validadeMes,
        data.validadeAno,
        data.telefone,
        data.foto ?? '',
        data.alvara ?? '',
        data.licenca ?? ''
      ]
    );
  },
  async getProfile(uid: string): Promise<ProfileForm | null> {
    const result = db.getAllSync('SELECT * FROM profile WHERE id = ?', [uid]);
    if (result && result.length > 0) {
      const row = result[0];
      return {
        nome: row.nome,
        cnh: row.cnh,
        validadeDia: row.validadeDia,
        validadeMes: row.validadeMes,
        validadeAno: row.validadeAno,
        telefone: row.telefone,
        foto: row.foto,
        alvara: row.alvara,
        licenca: row.licenca,
      };
    }
    return null;
  },
}; 