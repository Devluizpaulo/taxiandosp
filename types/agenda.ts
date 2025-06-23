import { Timestamp } from 'firebase/firestore';

export type EventoAgenda = {
  id: string;
  uid: string;
  titulo: string;
  tipo: 'corrida' | 'pessoal' | 'manutencao' | 'outros';
  data: string;   // YYYY-MM-DD
  hora: string;   // HH:mm
  local?: string;
  notificarAntes?: number; // minutos
  recorrente?: 'nenhum' | 'semanal' | 'mensal';
  criadoEm: Timestamp;
  observacao?: string;
};

export interface AgendaState {
  eventos: EventoAgenda[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  addEvento: (evento: EventoAgenda) => void;
  updateEventoLocal: (id: string, data: Partial<EventoAgenda>) => void;
  removeEvento: (id: string) => void;
  fetchEventos: () => Promise<void>;
  eventosPorData: (date: string) => EventoAgenda[];
} 