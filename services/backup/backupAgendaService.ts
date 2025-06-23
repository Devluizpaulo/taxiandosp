import { getAuth } from 'firebase/auth';
import { AgendaItem } from '../../types/agenda';
import { createEvento, fetchEventos, updateEvento } from '../agendaService';
import { agendaSqliteService } from '../sqlite/agenda/agendaSqliteService';

export const backupAgendaService = {
  async validarDados(): Promise<{ ok: boolean; erros: string[] }> {
    const items = await agendaSqliteService.getAllAgendaItems();
    const erros: string[] = [];
    // Checar duplicidade de IDs
    const ids = items.map(i => i.id);
    const idSet = new Set(ids);
    if (idSet.size !== ids.length) erros.push('IDs duplicados encontrados.');
    // Checar campos obrigatórios
    items.forEach(i => {
      if (!i.data) erros.push(`Item ${i.id} sem data.`);
      if (!i.titulo) erros.push(`Item ${i.id} sem título.`);
    });
    return { ok: erros.length === 0, erros };
  },

  async sincronizarComFirestore(onProgress?: (p: number) => void): Promise<void> {
    const items = await agendaSqliteService.getAllAgendaItems();
    let total = items.length;
    let done = 0;
    const step = () => { done++; onProgress && onProgress(done / total); };
    const user = getAuth().currentUser;
    for (const i of items) {
      if (!user) continue;
      const eventosRemotos = await fetchEventos(user.uid);
      const existe = eventosRemotos.find(e => e.id === i.id);
      if (existe) {
        await updateEvento(i.id, i);
      } else {
        await createEvento({ ...i });
      }
      step();
    }
  },

  async restaurarDoFirestore(onProgress?: (p: number) => void): Promise<void> {
    const user = getAuth().currentUser;
    let items: AgendaItem[] = [];
    if (user) {
      items = await fetchEventos(user.uid);
    }
    let total = items.length;
    let done = 0;
    const step = () => { done++; onProgress && onProgress(done / total); };
    for (const i of items) { await agendaSqliteService.saveAgendaItem(i); step(); }
  },
}; 