import { create } from 'zustand';
import { fetchEventos } from '../services/agendaService';
import { AgendaState } from '../types/agenda';

export const useAgendaStore = create<AgendaState>((set, get) => ({
  eventos: [],
  selectedDate: new Date().toISOString().slice(0, 10),
  setSelectedDate: (date) => set({ selectedDate: date }),
  addEvento: (evento) => set(state => ({ eventos: [...state.eventos, evento] })),
  updateEventoLocal: (id, data) => set(state => ({
    eventos: state.eventos.map(e => e.id === id ? { ...e, ...data } : e)
  })),
  removeEvento: (id) => set(state => ({ eventos: state.eventos.filter(e => e.id !== id) })),
  fetchEventos: async () => {
    const eventos = await fetchEventos();
    set({ eventos });
  },
  eventosPorData: (date) => get().eventos.filter(e => e.data === date),
})); 