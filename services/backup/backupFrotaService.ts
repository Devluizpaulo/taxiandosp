import { frotaService } from '../frotaService';
import { frotaSqliteService } from '../sqlite/frota/frotaSqliteService';

export const backupFrotaService = {
  async validarDados(): Promise<{ ok: boolean; erros: string[] }> {
    // Exemplo simples: checar duplicidade de IDs e campos obrigatórios
    const frotas = await frotaSqliteService.getAllFrotas();
    const veiculos = await frotaSqliteService.getAllVeiculosLocados();
    const diarias = await frotaSqliteService.getAllDiarias();
    const pagamentos = await frotaSqliteService.getAllPagamentos();
    const erros: string[] = [];
    // Checar duplicidade de IDs
    const ids = [
      ...frotas.map(f => f.id),
      ...veiculos.map(v => v.id),
      ...diarias.map(d => d.id),
      ...pagamentos.map(p => p.id),
    ];
    const idSet = new Set(ids);
    if (idSet.size !== ids.length) erros.push('IDs duplicados encontrados.');
    // Checar campos obrigatórios
    frotas.forEach(f => {
      if (!f.nome) erros.push(`Frota ${f.id} sem nome.`);
      if (!f.telefone) erros.push(`Frota ${f.id} sem telefone.`);
    });
    // (Adicionar mais validações conforme necessário)
    return { ok: erros.length === 0, erros };
  },

  async sincronizarComFirestore(onProgress?: (p: number) => void): Promise<void> {
    const frotas = await frotaSqliteService.getAllFrotas();
    const veiculos = await frotaSqliteService.getAllVeiculosLocados();
    const diarias = await frotaSqliteService.getAllDiarias();
    const pagamentos = await frotaSqliteService.getAllPagamentos();
    let total = frotas.length + veiculos.length + diarias.length + pagamentos.length;
    let done = 0;
    const step = () => { done++; onProgress && onProgress(done / total); };
    for (const frota of frotas) { await frotaService.salvarFrota(frota); step(); }
    for (const v of veiculos) { await frotaService.salvarVeiculoLocado(v); step(); }
    for (const d of diarias) { await frotaService.salvarDiaria(d); step(); }
    for (const p of pagamentos) { await frotaService.salvarPagamento(p); step(); }
  },

  async restaurarDoFirestore(onProgress?: (p: number) => void): Promise<void> {
    const frotas = await frotaService.listarFrotas();
    const veiculos = await frotaService.listarVeiculosLocados();
    const diarias = await frotaService.listarDiarias();
    const pagamentos = await frotaService.listarPagamentos();
    let total = frotas.length + veiculos.length + diarias.length + pagamentos.length;
    let done = 0;
    const step = () => { done++; onProgress && onProgress(done / total); };
    for (const frota of frotas) { await frotaSqliteService.saveFrota(frota); step(); }
    for (const v of veiculos) { await frotaSqliteService.saveVeiculoLocado(v); step(); }
    for (const d of diarias) { await frotaSqliteService.saveDiaria(d); step(); }
    for (const p of pagamentos) { await frotaSqliteService.savePagamento(p); step(); }
  },
}; 