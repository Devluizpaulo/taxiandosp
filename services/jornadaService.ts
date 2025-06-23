import { v4 as uuidv4 } from 'uuid';
import { Jornada } from '../types/jornada';
import { jornadaSqliteService } from './sqlite/jornada/jornadaSqliteService';

export async function iniciarJornada(data: Omit<Jornada, 'id'>): Promise<Jornada> {
  const novaJornada: Jornada = {
    ...data,
    id: uuidv4(),
  };
  await jornadaSqliteService.saveJornada(novaJornada);
  return novaJornada;
}

export async function finalizarJornada(id: string, data: Partial<Jornada>): Promise<void> {
  const jornadas = await jornadaSqliteService.getAllJornadas();
  const jornada = jornadas.find(j => j.id === id);
  if (!jornada) throw new Error('Jornada não encontrada');
  const atualizada = { ...jornada, ...data };
  await jornadaSqliteService.saveJornada(atualizada);
}

export async function fetchJornadas(): Promise<Jornada[]> {
  return jornadaSqliteService.getAllJornadas();
} 