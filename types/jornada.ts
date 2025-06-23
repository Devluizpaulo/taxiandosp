export type Jornada = {
  id: string;
  uid: string;
  vehicleId: string;
  horaInicial: string; // ISO string
  kmInicial: number;
  combustivel: number;
  combustivelSecundario?: number;
  observacao?: string;
  horaFinal?: string;
  kmFinal?: number;
  lucro?: number;
  finalizada?: boolean;
};

export interface JornadaState {
  jornadaAtiva?: Jornada;
  jornadas: Jornada[];
  iniciar: (jornada: Jornada) => void;
  finalizar: () => void;
  fetchJornadas: () => Promise<void>;
} 