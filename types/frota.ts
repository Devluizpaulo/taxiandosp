// Tipos do módulo Frota

export interface Frota {
  id: string;
  nome: string;
  cnpj?: string;
  telefone: string;
  telefoneEmergencia?: string;
  email?: string;
  pixChave: string;
  aceitaFeriado: boolean;
  aceitaDomingo: boolean;
  possuiGuincho: boolean;
  estiloCobranca: 'segunda-a-sabado' | 'todos-os-dias' | 'dias-uteis' | 'personalizado';
  observacoes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VeiculoLocado {
  id: string;
  veiculoId: string;        // Referência ao carro cadastrado
  nome: string;             // Ex: "Fiat Cronos 1.3 GNV"
  valorDiaria: number;
  inicioContrato: string;   // YYYY-MM-DD
  ativo: boolean;
}

export interface Diaria {
  id: string;
  data: string; // YYYY-MM-DD
  veiculoLocadoId: string;
  valor: number;
  status: 'pendente' | 'paga' | 'descontada';
  observacao?: string;
}

export interface PagamentoFrota {
  id: string;
  data: string; // YYYY-MM-DD
  valor: number;
  metodo: 'pix' | 'dinheiro' | 'transferencia' | 'outro';
  comprovanteURL?: string;
  observacao?: string;
} 