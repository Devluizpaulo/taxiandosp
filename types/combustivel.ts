import { z } from 'zod';

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

export interface CombustivelState {
  abastecimentos: Abastecimento[];
  resumo: ResumoCombustivel;
  loading: boolean;
  error: string | null;
  fetchAbastecimentos: () => Promise<void>;
  addAbastecimento: (data: Omit<Abastecimento, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Abastecimento>;
  updateAbastecimento: (id: string, data: Partial<Abastecimento>) => Promise<void>;
  deleteAbastecimento: (id: string) => Promise<void>;
  calcularResumo: () => void;
  calcularProximoAbastecimento: () => void;
  buscarKmAtual: () => number | null;
  validarAbastecimento: (data: any) => { success: boolean; errors?: any };
} 