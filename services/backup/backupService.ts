import AsyncStorage from '@react-native-async-storage/async-storage';
import { BackupHistoricoItem } from '../../types/backup';
import { backupAgendaService } from './backupAgendaService';
import { backupCombustivelService } from './backupCombustivelService';
import { backupFinancasService } from './backupFinancasService';
import { backupFrotaService } from './backupFrotaService';
import { backupJornadaService } from './backupJornadaService';
// import { backupCombustivelService } from './backupCombustivelService';
// import { backupFinancasService } from './backupFinancasService';
// import { backupAgendaService } from './backupAgendaService';
// import { backupJornadaService } from './backupJornadaService';

const HISTORICO_KEY = 'backup_historico';

export async function registrarHistorico(item: Omit<BackupHistoricoItem, 'id'>) {
  const historico = await listarHistorico();
  const novo: BackupHistoricoItem = {
    ...item,
    id: Date.now().toString(),
  };
  await AsyncStorage.setItem(HISTORICO_KEY, JSON.stringify([novo, ...historico]));
}

export async function listarHistorico(): Promise<BackupHistoricoItem[]> {
  const data = await AsyncStorage.getItem(HISTORICO_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export const backupService = {
  async validarDados(): Promise<{ ok: boolean; erros: string[] }> {
    // Chama validação de todos os módulos
    const resultados = await Promise.all([
      backupFrotaService.validarDados(),
      backupCombustivelService.validarDados(),
      backupFinancasService.validarDados(),
      backupAgendaService.validarDados(),
      backupJornadaService.validarDados(),
      // backupCombustivelService.validarDados(),
      // backupFinancasService.validarDados(),
      // backupAgendaService.validarDados(),
      // backupJornadaService.validarDados(),
    ]);
    const erros = resultados.flatMap(r => r.erros);
    return { ok: erros.length === 0, erros };
  },

  async sincronizarComFirestore(onProgress?: (p: number) => void): Promise<void> {
    // Sincroniza todos os módulos em sequência, somando progresso
    let progresso = 0;
    const steps = 5;
    await backupFrotaService.sincronizarComFirestore(p => {
      onProgress && onProgress((progresso + p) / steps);
    });
    progresso++;
    await backupCombustivelService.sincronizarComFirestore(p => {
      onProgress && onProgress((progresso + p) / steps);
    });
    progresso++;
    await backupFinancasService.sincronizarComFirestore(p => {
      onProgress && onProgress((progresso + p) / steps);
    });
    progresso++;
    await backupAgendaService.sincronizarComFirestore(p => {
      onProgress && onProgress((progresso + p) / steps);
    });
    progresso++;
    await backupJornadaService.sincronizarComFirestore(p => {
      onProgress && onProgress((progresso + p) / steps);
    });
    progresso++;
    // await backupCombustivelService.sincronizarComFirestore(p => { onProgress && onProgress((progresso + p) / steps); });
    // ...
  },

  async restaurarDoFirestore(onProgress?: (p: number) => void): Promise<void> {
    let progresso = 0;
    const steps = 5;
    await backupFrotaService.restaurarDoFirestore(p => {
      onProgress && onProgress((progresso + p) / steps);
    });
    progresso++;
    await backupCombustivelService.restaurarDoFirestore(p => {
      onProgress && onProgress((progresso + p) / steps);
    });
    progresso++;
    await backupFinancasService.restaurarDoFirestore(p => {
      onProgress && onProgress((progresso + p) / steps);
    });
    progresso++;
    await backupAgendaService.restaurarDoFirestore(p => {
      onProgress && onProgress((progresso + p) / steps);
    });
    progresso++;
    await backupJornadaService.restaurarDoFirestore(p => {
      onProgress && onProgress((progresso + p) / steps);
    });
    progresso++;
    // await backupCombustivelService.restaurarDoFirestore(p => { onProgress && onProgress((progresso + p) / steps); });
    // ...
  },
}; 