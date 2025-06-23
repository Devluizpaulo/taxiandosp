export interface VehicleInfo {
  id: string;
  nome: string;
  marca: string;
  modelo: string;
  ano: string;
  placa: string;
  combustivel: string;
  combustivelSecundario?: string;
  volumeTanque: string;
  volumeTanqueSecundario?: string;
  apelido?: string;
  kmAtual?: number;
  ultimoAbastecimento?: {
    data: Date;
    km: number;
    litros: number;
    tipoCombustivel: string;
  };
}

export interface VehicleData {
  kmAtual: number;
  nivelCombustivel: number;
  nivelCombustivelSecundario?: number;
  ultimaJornada?: {
    kmInicial: number;
    kmFinal: number;
    data: Date;
  };
} 