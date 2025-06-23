import { postoService } from '@/services/postoService';
import { create } from 'zustand';
import { AvaliacaoPosto, Posto, PostoState, PrecoCombustivel } from '../types/posto';

interface PostoState {
  postos: Posto[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchPostos: () => Promise<void>;
  addPosto: (data: Omit<Posto, 'id' | 'avaliacaoMedia' | 'totalAvaliacoes' | 'avaliacoes' | 'createdAt' | 'updatedAt'>) => Promise<Posto>;
  updatePosto: (id: string, data: Partial<Posto>) => Promise<void>;
  deletePosto: (id: string) => Promise<void>;
  getPostoById: (id: string) => Posto | null;
  addAvaliacao: (postoId: string, avaliacao: Omit<AvaliacaoPosto, 'id'>) => Promise<void>;
  addPreco: (postoId: string, preco: Omit<PrecoCombustivel, 'id'>) => Promise<void>;
  buscarPostosProximos: (latitude: number, longitude: number, raioKm: number) => Posto[];
}

export const usePostoStore = create<PostoState>((set, get) => ({
  postos: [],
  loading: false,
  error: null,

  fetchPostos: async () => {
    set({ loading: true, error: null });
    try {
      const postos = await postoService.getPostos();
      set({ postos });
    } catch (error) {
      set({ error: 'Erro ao carregar postos' });
    } finally {
      set({ loading: false });
    }
  },

  addPosto: async (data) => {
    set({ loading: true, error: null });
    try {
      const novoPosto = await postoService.addPosto(data);
      set(state => ({
        postos: [novoPosto, ...state.postos],
      }));
      return novoPosto;
    } catch (error) {
      set({ error: 'Erro ao adicionar posto' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updatePosto: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await postoService.updatePosto(id, data);
      set(state => ({
        postos: state.postos.map(item =>
          item.id === id ? { ...item, ...data, updatedAt: new Date() } : item
        ),
      }));
    } catch (error) {
      set({ error: 'Erro ao atualizar posto' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deletePosto: async (id) => {
    set({ loading: true, error: null });
    try {
      await postoService.deletePosto(id);
      set(state => ({
        postos: state.postos.filter(item => item.id !== id),
      }));
    } catch (error) {
      set({ error: 'Erro ao deletar posto' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  getPostoById: (id) => {
    const { postos } = get();
    return postos.find(posto => posto.id === id) || null;
  },

  addAvaliacao: async (postoId, avaliacao) => {
    set({ loading: true, error: null });
    try {
      const novaAvaliacao = await postoService.addAvaliacao(postoId, avaliacao);
      
      set(state => ({
        postos: state.postos.map(posto => {
          if (posto.id === postoId) {
            const avaliacoesExistentes = posto.avaliacoes || [];
            const novasAvaliacoes = [...avaliacoesExistentes, novaAvaliacao];
            const totalAvaliacoes = novasAvaliacoes.length;
            const avaliacaoMedia = totalAvaliacoes > 0 
              ? novasAvaliacoes.reduce((sum, av) => sum + av.nota, 0) / totalAvaliacoes 
              : 0;
            
            return {
              ...posto,
              avaliacoes: novasAvaliacoes,
              avaliacaoMedia,
              totalAvaliacoes,
              updatedAt: new Date(),
            };
          }
          return posto;
        }),
      }));
    } catch (error) {
      set({ error: 'Erro ao adicionar avaliação' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  addPreco: async (postoId, preco) => {
    set({ loading: true, error: null });
    try {
      const novoPreco = await postoService.addPreco(postoId, preco);
      
      set(state => ({
        postos: state.postos.map(posto => {
          if (posto.id === postoId) {
            return {
              ...posto,
              precos: [novoPreco, ...(posto.precos || [])],
              updatedAt: new Date(),
            };
          }
          return posto;
        }),
      }));
    } catch (error) {
      set({ error: 'Erro ao adicionar preço' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  buscarPostosProximos: (latitude, longitude, raioKm) => {
    const { postos } = get();
    
    return postos.filter(posto => {
      if (!posto.coordenadas) return false;
      
      const distancia = calcularDistancia(
        latitude,
        longitude,
        posto.coordenadas.latitude,
        posto.coordenadas.longitude
      );
      
      return distancia <= raioKm;
    });
  },
}));

// Função auxiliar para calcular distância entre dois pontos
function calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
} 