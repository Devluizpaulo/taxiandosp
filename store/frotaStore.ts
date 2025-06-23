import { create } from 'zustand';
import { frotaSqliteService } from '../services/sqlite/frota/frotaSqliteService';
import { Diaria, Frota, PagamentoFrota, VeiculoLocado } from '../types/frota';

interface FrotaState {
  frotas: Frota[];
  veiculosLocados: VeiculoLocado[];
  diarias: Diaria[];
  pagamentos: PagamentoFrota[];
  frotaSelecionadaId?: string;
  // Métodos
  adicionarFrota: (frota: Frota) => Promise<void>;
  editarFrota: (frota: Frota) => Promise<void>;
  removerFrota: (id: string) => Promise<void>;
  selecionarFrota: (id: string) => void;
  adicionarVeiculoLocado: (veiculo: VeiculoLocado) => Promise<void>;
  editarVeiculoLocado: (veiculo: VeiculoLocado) => Promise<void>;
  removerVeiculoLocado: (id: string) => Promise<void>;
  adicionarDiaria: (diaria: Diaria) => Promise<void>;
  editarDiaria: (diaria: Diaria) => Promise<void>;
  removerDiaria: (id: string) => Promise<void>;
  adicionarPagamento: (pagamento: PagamentoFrota) => Promise<void>;
  editarPagamento: (pagamento: PagamentoFrota) => Promise<void>;
  removerPagamento: (id: string) => Promise<void>;
  calcularSaldo: () => number;
  setFrotas: (frotas: Frota[]) => void;
  setDiarias: (diarias: Diaria[]) => void;
  setPagamentos: (pagamentos: PagamentoFrota[]) => void;
  carregarDadosLocais: () => Promise<void>;
}

export const useFrotaStore = create<FrotaState>((set, get) => ({
  frotas: [],
  veiculosLocados: [],
  diarias: [],
  pagamentos: [],
  frotaSelecionadaId: undefined,

  async carregarDadosLocais() {
    frotaSqliteService.init();
    const [frotas, veiculosLocados, diarias, pagamentos] = await Promise.all([
      frotaSqliteService.getAllFrotas(),
      frotaSqliteService.getAllVeiculosLocados(),
      frotaSqliteService.getAllDiarias(),
      frotaSqliteService.getAllPagamentos(),
    ]);
    set({ frotas, veiculosLocados, diarias, pagamentos });
  },

  setFrotas: (frotas) => set(() => ({ frotas })),
  setDiarias: (diarias) => set(() => ({ diarias })),
  setPagamentos: (pagamentos) => set(() => ({ pagamentos })),

  adicionarFrota: async (frota) => {
    await frotaSqliteService.saveFrota(frota);
    set((state) => ({ frotas: [...state.frotas, frota] }));
  },
  editarFrota: async (frota) => {
    await frotaSqliteService.saveFrota(frota);
    set((state) => ({ frotas: state.frotas.map(f => f.id === frota.id ? frota : f) }));
  },
  removerFrota: async (id) => {
    await frotaSqliteService.deleteFrota(id);
    set((state) => ({ frotas: state.frotas.filter(f => f.id !== id) }));
  },
  selecionarFrota: (id) => set(() => ({ frotaSelecionadaId: id })),

  adicionarVeiculoLocado: async (veiculo) => {
    await frotaSqliteService.saveVeiculoLocado(veiculo);
    set((state) => ({ veiculosLocados: [...state.veiculosLocados, veiculo] }));
  },
  editarVeiculoLocado: async (veiculo) => {
    await frotaSqliteService.saveVeiculoLocado(veiculo);
    set((state) => ({ veiculosLocados: state.veiculosLocados.map(v => v.id === veiculo.id ? veiculo : v) }));
  },
  removerVeiculoLocado: async (id) => {
    await frotaSqliteService.deleteVeiculoLocado(id);
    set((state) => ({ veiculosLocados: state.veiculosLocados.filter(v => v.id !== id) }));
  },

  adicionarDiaria: async (diaria) => {
    await frotaSqliteService.saveDiaria(diaria);
    set((state) => ({ diarias: [...state.diarias, diaria] }));
  },
  editarDiaria: async (diaria) => {
    await frotaSqliteService.saveDiaria(diaria);
    set((state) => ({ diarias: state.diarias.map(d => d.id === diaria.id ? diaria : d) }));
  },
  removerDiaria: async (id) => {
    await frotaSqliteService.deleteDiaria(id);
    set((state) => ({ diarias: state.diarias.filter(d => d.id !== id) }));
  },

  adicionarPagamento: async (pagamento) => {
    await frotaSqliteService.savePagamento(pagamento);
    set((state) => ({ pagamentos: [...state.pagamentos, pagamento] }));
  },
  editarPagamento: async (pagamento) => {
    await frotaSqliteService.savePagamento(pagamento);
    set((state) => ({ pagamentos: state.pagamentos.map(p => p.id === pagamento.id ? pagamento : p) }));
  },
  removerPagamento: async (id) => {
    await frotaSqliteService.deletePagamento(id);
    set((state) => ({ pagamentos: state.pagamentos.filter(p => p.id !== id) }));
  },

  calcularSaldo: () => {
    const { diarias, pagamentos } = get();
    const totalDiarias = diarias.filter(d => d.status !== 'paga').reduce((sum, d) => sum + d.valor, 0);
    const totalPagamentos = pagamentos.reduce((sum, p) => sum + p.valor, 0);
    return totalPagamentos - totalDiarias;
  },
})); 