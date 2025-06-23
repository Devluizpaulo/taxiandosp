export type Transacao = {
  id: string;
  uid: string;
  titulo: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  categoria: {
    nome: string;
    icone: string;
    cor: string;
  };
  metodoPagamento: string;
  data: string; // YYYY-MM-DD
  observacao?: string;
  createdAt: string;
  updatedAt: string;
};

export type TransacaoForm = Omit<Transacao, 'id' | 'uid' | 'createdAt' | 'updatedAt'>;

export interface FinancasState {
  transacoes: Transacao[];
  resumos: {
    receitas: number;
    despesas: number;
    saldo: number;
    totalTransacoes: number;
    porCategoria: Record<string, number>;
    porMetodoPagamento: Record<string, number>;
  } | null;
  selectedPeriod: {
    dataInicio: string;
    dataFim: string;
  };
  loading: boolean;
  fetchTransacoes: (filtros?: {
    tipo?: 'receita' | 'despesa';
    dataInicio?: string;
    dataFim?: string;
    categoria?: string;
  }) => Promise<void>;
  addTransacao: (transacao: Transacao) => void;
  updateTransacao: (id: string, transacao: Partial<Transacao>) => void;
  removeTransacao: (id: string) => void;
  fetchResumos: (periodo: {
    dataInicio: string;
    dataFim: string;
  }) => Promise<void>;
  setSelectedPeriod: (periodo: {
    dataInicio: string;
    dataFim: string;
  }) => void;
  clearState: () => void;
} 