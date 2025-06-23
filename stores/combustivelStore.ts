import { combustivelService } from '@/services/combustivelService';
import { z } from 'zod';
import { create } from 'zustand';
import { Abastecimento, CombustivelState, ResumoCombustivel } from '../types/combustivel';

// Schema de validação para abastecimento
export const abastecimentoSchema = z.object({
  postoId: z.string().min(1, 'Posto é obrigatório'),
  postoNome: z.string().min(2, 'Nome do posto é obrigatório'),
  tipoCombustivel: z.enum(['gasolina', 'etanol', 'diesel', 'gnv'], {
    required_error: 'Tipo de combustível é obrigatório'
  }),
  tipoCombustivelSecundario: z.enum(['gasolina', 'etanol', 'diesel']).optional(),
  litros: z.number().positive('Quantidade de litros deve ser maior que zero'),
  litrosSecundario: z.number().positive('Quantidade de litros deve ser maior que zero').optional(),
  precoLitro: z.number().positive('Preço por litro deve ser maior que zero'),
  precoLitroSecundario: z.number().positive('Preço por litro deve ser maior que zero').optional(),
  valorTotal: z.number().positive('Valor total deve ser maior que zero'),
  valorTotalSecundario: z.number().positive('Valor total deve ser maior que zero').optional(),
  kmAtual: z.number().positive('KM atual deve ser maior que zero'),
  data: z.date(),
  tanqueCheio: z.boolean().optional(),
  observacoes: z.string().optional(),
}).refine(
  (data) => {
    // Se é GNV, o combustível secundário é obrigatório
    if (data.tipoCombustivel === 'gnv') {
      return data.tipoCombustivelSecundario && 
             data.litrosSecundario && 
             data.precoLitroSecundario && 
             data.valorTotalSecundario;
    }
    return true;
  },
  {
    message: 'Para GNV, é obrigatório abastecer também o combustível secundário',
    path: ['tipoCombustivelSecundario']
  }
);

export type AbastecimentoFormData = z.infer<typeof abastecimentoSchema>;

export interface Abastecimento {
  id: string;
  postoId: string;
  postoNome: string;
  tipoCombustivel: 'gasolina' | 'etanol' | 'diesel' | 'gnv';
  tipoCombustivelSecundario?: 'gasolina' | 'etanol' | 'diesel';
  litros: number;
  litrosSecundario?: number;
  precoLitro: number;
  precoLitroSecundario?: number;
  valorTotal: number;
  valorTotalSecundario?: number;
  kmAtual: number;
  data: Date;
  tanqueCheio?: boolean;
  observacoes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResumoCombustivel {
  totalAbastecimentos: number;
  totalGasto: number;
  totalLitros: number;
  mediaConsumo: number;
  custoKm: number;
  proximoAbastecimento?: {
    kmAtual: number;
    kmRestante: number;
    autonomia: number;
  };
  estatisticasMes: {
    abastecimentos: number;
    gasto: number;
    litros: number;
    mediaPreco: number;
  };
  estatisticasAno: {
    abastecimentos: number;
    gasto: number;
    litros: number;
    mediaPreco: number;
  };
}

interface CombustivelState {
  abastecimentos: Abastecimento[];
  resumo: ResumoCombustivel;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchAbastecimentos: () => Promise<void>;
  addAbastecimento: (data: Omit<Abastecimento, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Abastecimento>;
  updateAbastecimento: (id: string, data: Partial<Abastecimento>) => Promise<void>;
  deleteAbastecimento: (id: string) => Promise<void>;
  calcularResumo: () => void;
  calcularProximoAbastecimento: () => void;
  buscarKmAtual: () => number | null;
  validarAbastecimento: (data: any) => { success: boolean; errors?: any };
}

export const useCombustivelStore = create<CombustivelState>((set, get) => ({
  abastecimentos: [],
  resumo: {
    totalAbastecimentos: 0,
    totalGasto: 0,
    totalLitros: 0,
    mediaConsumo: 0,
    custoKm: 0,
    estatisticasMes: {
      abastecimentos: 0,
      gasto: 0,
      litros: 0,
      mediaPreco: 0,
    },
    estatisticasAno: {
      abastecimentos: 0,
      gasto: 0,
      litros: 0,
      mediaPreco: 0,
    },
  },
  loading: false,
  error: null,

  fetchAbastecimentos: async () => {
    set({ loading: true, error: null });
    try {
      const abastecimentos = await combustivelService.getAbastecimentos();
      set({ abastecimentos });
      get().calcularResumo();
      get().calcularProximoAbastecimento();
    } catch (error) {
      set({ error: 'Erro ao carregar abastecimentos' });
    } finally {
      set({ loading: false });
    }
  },

  addAbastecimento: async (data) => {
    set({ loading: true, error: null });
    try {
      const novoAbastecimento = await combustivelService.addAbastecimento(data);
      set(state => ({
        abastecimentos: [novoAbastecimento, ...state.abastecimentos],
      }));
      get().calcularResumo();
      get().calcularProximoAbastecimento();
      return novoAbastecimento;
    } catch (error) {
      set({ error: 'Erro ao adicionar abastecimento' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateAbastecimento: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await combustivelService.updateAbastecimento(id, data);
      set(state => ({
        abastecimentos: state.abastecimentos.map(item =>
          item.id === id ? { ...item, ...data, updatedAt: new Date() } : item
        ),
      }));
      get().calcularResumo();
      get().calcularProximoAbastecimento();
    } catch (error) {
      set({ error: 'Erro ao atualizar abastecimento' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteAbastecimento: async (id) => {
    set({ loading: true, error: null });
    try {
      await combustivelService.deleteAbastecimento(id);
      set(state => ({
        abastecimentos: state.abastecimentos.filter(item => item.id !== id),
      }));
      get().calcularResumo();
      get().calcularProximoAbastecimento();
    } catch (error) {
      set({ error: 'Erro ao deletar abastecimento' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  validarAbastecimento: (data) => {
    try {
      abastecimentoSchema.parse(data);
      return { success: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: any = {};
        error.errors.forEach((err) => {
          if (err.path) {
            errors[err.path[0]] = err.message;
          }
        });
        return { success: false, errors };
      }
      return { success: false, errors: { general: 'Erro de validação' } };
    }
  },

  buscarKmAtual: () => {
    const { abastecimentos } = get();
    if (abastecimentos && Array.isArray(abastecimentos) && abastecimentos.length > 0) {
      return abastecimentos[0].kmAtual; // Retorna o KM do último abastecimento
    }
    return null;
  },

  calcularResumo: () => {
    const { abastecimentos } = get();
    
    if (!abastecimentos || !Array.isArray(abastecimentos) || abastecimentos.length === 0) {
      set({
        resumo: {
          totalAbastecimentos: 0,
          totalGasto: 0,
          totalLitros: 0,
          mediaConsumo: 0,
          custoKm: 0,
          estatisticasMes: {
            abastecimentos: 0,
            gasto: 0,
            litros: 0,
            mediaPreco: 0,
          },
          estatisticasAno: {
            abastecimentos: 0,
            gasto: 0,
            litros: 0,
            mediaPreco: 0,
          },
        },
      });
      return;
    }

    // Filtrar abastecimentos do mês atual
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const inicioAno = new Date(hoje.getFullYear(), 0, 1);
    
    const abastecimentosMes = abastecimentos.filter(
      item => new Date(item.data) >= inicioMes
    );
    
    const abastecimentosAno = abastecimentos.filter(
      item => new Date(item.data) >= inicioAno
    );

    // Estatísticas do mês
    const estatisticasMes = {
      abastecimentos: abastecimentosMes.length,
      gasto: abastecimentosMes.reduce((sum, item) => sum + item.valorTotal, 0),
      litros: abastecimentosMes.reduce((sum, item) => sum + item.litros, 0),
      mediaPreco: abastecimentosMes.length > 0 
        ? abastecimentosMes.reduce((sum, item) => sum + item.valorTotal, 0) / 
          abastecimentosMes.reduce((sum, item) => sum + item.litros, 0)
        : 0,
    };

    // Estatísticas do ano
    const estatisticasAno = {
      abastecimentos: abastecimentosAno.length,
      gasto: abastecimentosAno.reduce((sum, item) => sum + item.valorTotal, 0),
      litros: abastecimentosAno.reduce((sum, item) => sum + item.litros, 0),
      mediaPreco: abastecimentosAno.length > 0 
        ? abastecimentosAno.reduce((sum, item) => sum + item.valorTotal, 0) / 
          abastecimentosAno.reduce((sum, item) => sum + item.litros, 0)
        : 0,
    };

    const totalAbastecimentos = abastecimentosMes.length;
    const totalGasto = estatisticasMes.gasto;
    const totalLitros = estatisticasMes.litros;

    // Calcular km percorridos e consumo médio
    let kmPercorridos = 0;
    let litrosConsumidos = 0;
    
    for (let i = 1; i < abastecimentos.length; i++) {
      const kmAtual = abastecimentos[i].kmAtual;
      const kmAnterior = abastecimentos[i-1].kmAtual;
      if (kmAtual > kmAnterior) {
        kmPercorridos += (kmAtual - kmAnterior);
        litrosConsumidos += abastecimentos[i-1].litros;
      }
    }

    const mediaConsumo = litrosConsumidos > 0 ? kmPercorridos / litrosConsumidos : 0;
    const custoKm = kmPercorridos > 0 ? totalGasto / kmPercorridos : 0;

    set({
      resumo: {
        totalAbastecimentos,
        totalGasto,
        totalLitros,
        mediaConsumo,
        custoKm,
        estatisticasMes,
        estatisticasAno,
      },
    });
  },

  calcularProximoAbastecimento: () => {
    const { abastecimentos, resumo } = get();
    
    if (!abastecimentos || !Array.isArray(abastecimentos) || abastecimentos.length === 0 || resumo.mediaConsumo === 0) {
      set(state => ({
        resumo: {
          ...state.resumo,
          proximoAbastecimento: undefined,
        },
      }));
      return;
    }

    const ultimoAbastecimento = abastecimentos[0]; // Assumindo que está ordenado por data
    const kmAtual = ultimoAbastecimento.kmAtual;
    const litrosRestantes = 50; // Capacidade média do tanque
    const autonomia = litrosRestantes * resumo.mediaConsumo;
    const kmRestante = autonomia * 0.2; // Sugere abastecer quando restar 20% da autonomia

    set(state => ({
      resumo: {
        ...state.resumo,
        proximoAbastecimento: {
          kmAtual,
          kmRestante,
          autonomia,
        },
      },
    }));
  },
})); 