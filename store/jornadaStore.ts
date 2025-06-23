import { create } from 'zustand';
import { fetchJornadas } from '../services/jornadaService';
import { Jornada, JornadaState } from '../types/jornada';

interface JornadaState {
  jornadaAtiva?: Jornada;
  jornadas: Jornada[];
  iniciar: (jornada: Jornada) => void;
  finalizar: () => void;
  fetchJornadas: () => Promise<void>;
}

export const useJornadaStore = create<JornadaState>((set, get) => ({
  jornadaAtiva: undefined,
  jornadas: [],
  iniciar: (jornada) => set({ jornadaAtiva: jornada, jornadas: [...get().jornadas, jornada] }),
  finalizar: () => set({ jornadaAtiva: undefined }),
  fetchJornadas: async () => {
    const jornadas = await fetchJornadas();
    set({ jornadas });
  },
})); 