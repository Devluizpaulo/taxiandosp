export interface Posto {
  id: string;
  nome: string;
  endereco: string;
  telefone?: string;
  horarioFuncionamento: string;
  tiposCombustivel: string[];
  servicos?: string[];
  avaliacaoMedia: number;
  totalAvaliacoes: number;
  avaliacoes: AvaliacaoPosto[];
  precos?: PrecoCombustivel[];
  ultimaVisita?: Date;
  coordenadas?: {
    latitude: number;
    longitude: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AvaliacaoPosto {
  id: string;
  postoId: string;
  autor: string;
  nota: number;
  comentario: string;
  categoria: 'geral' | 'preco' | 'atendimento' | 'limpeza' | 'localizacao';
  data: Date;
}

export interface PrecoCombustivel {
  id: string;
  postoId: string;
  tipo: string;
  valor: number;
  data: Date;
}

export interface PostoState {
  postos: Posto[];
  loading: boolean;
  error: string | null;
  fetchPostos: () => Promise<void>;
  addPosto: (data: Omit<Posto, 'id' | 'avaliacaoMedia' | 'totalAvaliacoes' | 'avaliacoes' | 'createdAt' | 'updatedAt'>) => Promise<Posto>;
  updatePosto: (id: string, data: Partial<Posto>) => Promise<void>;
  deletePosto: (id: string) => Promise<void>;
  getPostoById: (id: string) => Posto | null;
  addAvaliacao: (postoId: string, avaliacao: Omit<AvaliacaoPosto, 'id'>) => Promise<void>;
  addPreco: (postoId: string, preco: Omit<PrecoCombustivel, 'id'>) => Promise<void>;
  buscarPostosProximos: (latitude: number, longitude: number, raioKm: number) => Posto[];
} 