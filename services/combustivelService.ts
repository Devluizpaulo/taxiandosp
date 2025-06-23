import { Abastecimento, Posto } from '@/types/combustivel';
import { v4 as uuidv4 } from 'uuid';
import { combustivelSqliteService } from './sqlite/combustivel/combustivelSqliteService';

export const combustivelService = {
  async getAbastecimentos(): Promise<Abastecimento[]> {
    return combustivelSqliteService.getAllAbastecimentos();
  },
  async addAbastecimento(data: Omit<Abastecimento, 'id'>): Promise<Abastecimento> {
    const novo: Abastecimento = { ...data, id: uuidv4() };
    await combustivelSqliteService.saveAbastecimento(novo);
    return novo;
  },
  async updateAbastecimento(id: string, data: Partial<Abastecimento>): Promise<void> {
    const abastecimentos = await combustivelSqliteService.getAllAbastecimentos();
    const abastecimento = abastecimentos.find(a => a.id === id);
    if (!abastecimento) throw new Error('Abastecimento não encontrado');
    const atualizado = { ...abastecimento, ...data };
    await combustivelSqliteService.saveAbastecimento(atualizado);
  },
  async deleteAbastecimento(id: string): Promise<void> {
    await combustivelSqliteService.deleteAbastecimento(id);
  },
  async getAllPostos(): Promise<Posto[]> {
    return combustivelSqliteService.getAllPostos();
  },
  async addPosto(data: Omit<Posto, 'id'>): Promise<Posto> {
    const novo: Posto = { ...data, id: uuidv4() };
    await combustivelSqliteService.savePosto(novo);
    return novo;
  },
  async updatePosto(id: string, data: Partial<Posto>): Promise<void> {
    const postos = await combustivelSqliteService.getAllPostos();
    const posto = postos.find(p => p.id === id);
    if (!posto) throw new Error('Posto não encontrado');
    const atualizado = { ...posto, ...data };
    await combustivelSqliteService.savePosto(atualizado);
  },
  async deletePosto(id: string): Promise<void> {
    await combustivelSqliteService.deletePosto(id);
  },
}; 