import { getAuth } from 'firebase/auth';
import { Jornada } from '../../types/jornada';
import { fetchJornadas, finalizarJornada, iniciarJornada } from '../jornadaService';
import { jornadaSqliteService } from '../sqlite/jornada/jornadaSqliteService';

export const backupJornadaService = {
  async validarDados(): Promise<{ ok: boolean; erros: string[] }> {
    const jornadas = await jornadaSqliteService.getAllJornadas();
    const erros: string[] = [];
    // Checar duplicidade de IDs
    const ids = jornadas.map(j => j.id);
    const idSet = new Set(ids);
    if (idSet.size !== ids.length) erros.push('IDs duplicados encontrados.');
    // Checar campos obrigatórios
    jornadas.forEach(j => {
      if (!j.dataInicio) erros.push(`Jornada ${j.id} sem data de início.`);
    });
    return { ok: erros.length === 0, erros };
  },

  async sincronizarComFirestore(onProgress?: (p: number) => void): Promise<void> {
    const jornadas = await jornadaSqliteService.getAllJornadas();
    let total = jornadas.length;
    let done = 0;
    const step = () => { done++; onProgress && onProgress(done / total); };
    const user = getAuth().currentUser;
    for (const j of jornadas) {
      if (!user) continue;
      const jornadasRemotas = await fetchJornadas(user.uid);
      const existe = jornadasRemotas.find(e => e.id === j.id);
      if (existe) {
        await finalizarJornada(j.id, j);
      } else {
        await iniciarJornada({ ...j });
      }
      step();
    }
  },

  async restaurarDoFirestore(onProgress?: (p: number) => void): Promise<void> {
    const user = getAuth().currentUser;
    let jornadas: Jornada[] = [];
    if (user) {
      jornadas = await fetchJornadas(user.uid);
    }
    let total = jornadas.length;
    let done = 0;
    const step = () => { done++; onProgress && onProgress(done / total); };
    for (const j of jornadas) { await jornadaSqliteService.saveJornada(j); step(); }
  },
}; 