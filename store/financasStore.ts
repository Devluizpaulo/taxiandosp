import { create } from 'zustand';
import { getResumosFinanceiros, getTransacoes } from '../services/financasService';
import { FinancasState } from '../types/financas';

export const useFinancasStore = create<FinancasState>((set, get) => ({
  transacoes: [],
  resumos: null,
  selectedPeriod: {
    dataInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    dataFim: new Date().toISOString().split('T')[0],
  },
  loading: false,

  fetchTransacoes: async (filtros) => {
    set({ loading: true });
    try {
      const transacoes = await getTransacoes(filtros);
      set({ transacoes });
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
    } finally {
      set({ loading: false });
    }
  },

  addTransacao: (transacao) => {
    set((state) => ({
      transacoes: [transacao, ...state.transacoes],
    }));
  },

  updateTransacao: (id, transacaoAtualizada) => {
    set((state) => ({
      transacoes: state.transacoes.map((t) =>
        t.id === id ? { ...t, ...transacaoAtualizada } : t
      ),
    }));
  },

  removeTransacao: (id) => {
    set((state) => ({
      transacoes: state.transacoes.filter((t) => t.id !== id),
    }));
  },

  fetchResumos: async (periodo) => {
    set({ loading: true });
    try {
      const resumos = await getResumosFinanceiros(periodo);
      set({ resumos });
    } catch (error) {
      console.error('Erro ao buscar resumos:', error);
    } finally {
      set({ loading: false });
    }
  },

  setSelectedPeriod: (periodo) => {
    set({ selectedPeriod: periodo });
  },

  clearState: () => {
    set({
      transacoes: [],
      resumos: null,
      selectedPeriod: {
        dataInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        dataFim: new Date().toISOString().split('T')[0],
      },
    });
  },
})); 