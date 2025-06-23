import { Abastecimento, Posto } from '../../types/combustivel';
import { combustivelService } from '../combustivelService';
import { postoService } from '../postoService';
import { combustivelSqliteService } from '../sqlite/combustivel/combustivelSqliteService';

export const backupCombustivelService = {
  async validarDados(): Promise<{ ok: boolean; erros: string[] }> {
    const abastecimentos = await combustivelSqliteService.getAllAbastecimentos();
    const postos = await combustivelSqliteService.getAllPostos();
    const erros: string[] = [];
    // Checar duplicidade de IDs
    const ids = [
      ...abastecimentos.map(a => a.id),
      ...postos.map(p => p.id),
    ];
    const idSet = new Set(ids);
    if (idSet.size !== ids.length) erros.push('IDs duplicados encontrados.');
    // Checar campos obrigatórios
    abastecimentos.forEach(a => {
      if (!a.data) erros.push(`Abastecimento ${a.id} sem data.`);
      if (!a.valorTotal) erros.push(`Abastecimento ${a.id} sem valor.`);
    });
    postos.forEach(p => {
      if (!p.nome) erros.push(`Posto ${p.id} sem nome.`);
    });
    return { ok: erros.length === 0, erros };
  },

  async sincronizarComFirestore(onProgress?: (p: number) => void): Promise<void> {
    const abastecimentos = await combustivelSqliteService.getAllAbastecimentos();
    const postos = await combustivelSqliteService.getAllPostos();
    let total = abastecimentos.length + postos.length;
    let done = 0;
    const step = () => { done++; onProgress && onProgress(done / total); };
    for (const a of abastecimentos) {
      // Se existir, atualiza, senão cria
      const exists = (await combustivelService.getAbastecimentos()).find(x => x.id === a.id);
      if (exists) {
        await combustivelService.updateAbastecimento(a.id, a);
      } else {
        await combustivelService.addAbastecimento({ ...a });
      }
      step();
    }
    for (const p of postos) {
      const exists = (await postoService.getPostos()).find(x => x.id === p.id);
      if (exists) {
        await postoService.updatePosto(p.id, p);
      } else {
        await postoService.addPosto({ ...p });
      }
      step();
    }
  },

  async restaurarDoFirestore(onProgress?: (p: number) => void): Promise<void> {
    const abastecimentos: Abastecimento[] = await combustivelService.getAbastecimentos();
    const postos: Posto[] = await postoService.getPostos();
    let total = abastecimentos.length + postos.length;
    let done = 0;
    const step = () => { done++; onProgress && onProgress(done / total); };
    for (const a of abastecimentos) { await combustivelSqliteService.saveAbastecimento(a); step(); }
    for (const p of postos) { await combustivelSqliteService.savePosto(p); step(); }
  },
}; 