import { v4 as uuidv4 } from 'uuid';
import { AgendaItem } from '../types/agenda';
import { agendaSqliteService } from './sqlite/agenda/agendaSqliteService';

export async function createEvento(data: Omit<AgendaItem, 'id'>): Promise<AgendaItem> {
  const novoEvento: AgendaItem = {
    ...data,
    id: uuidv4(),
  };
  await agendaSqliteService.saveAgendaItem(novoEvento);
  return novoEvento;
}

export async function updateEvento(id: string, data: Partial<AgendaItem>): Promise<void> {
  const eventos = await agendaSqliteService.getAllAgendaItems();
  const evento = eventos.find(e => e.id === id);
  if (!evento) throw new Error('Evento não encontrado');
  const atualizado = { ...evento, ...data };
  await agendaSqliteService.saveAgendaItem(atualizado);
}

export async function deleteEvento(id: string): Promise<void> {
  await agendaSqliteService.deleteAgendaItem(id);
}

export async function fetchEventos(): Promise<AgendaItem[]> {
  return agendaSqliteService.getAllAgendaItems();
} 