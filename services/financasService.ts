import { v4 as uuidv4 } from 'uuid';
import { Transacao, TransacaoForm } from '../types/financas';
import { financasSqliteService } from './sqlite/financas/financasSqliteService';

export const getTransacoes = async (): Promise<Transacao[]> => {
  return financasSqliteService.getAllTransacoes();
};

export const createTransacao = async (data: TransacaoForm): Promise<Transacao> => {
  const novaTransacao: Transacao = {
    ...data,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await financasSqliteService.saveTransacao(novaTransacao);
  return novaTransacao;
};

export const updateTransacao = async (id: string, data: Partial<TransacaoForm>): Promise<void> => {
  const transacoes = await financasSqliteService.getAllTransacoes();
  const transacao = transacoes.find(t => t.id === id);
  if (!transacao) throw new Error('Transação não encontrada');
  const atualizada = { ...transacao, ...data, updatedAt: new Date().toISOString() };
  await financasSqliteService.saveTransacao(atualizada);
};

export const deleteTransacao = async (id: string): Promise<void> => {
  await financasSqliteService.deleteTransacao(id);
};

export const getResumosFinanceiros = async (): Promise<{
  receitas: number;
  despesas: number;
  saldo: number;
  totalTransacoes: number;
  porCategoria: Record<string, number>;
  porMetodoPagamento: Record<string, number>;
}> => {
  const transacoes = await financasSqliteService.getAllTransacoes();
  const receitas = transacoes.filter(t => t.tipo === 'receita');
  const despesas = transacoes.filter(t => t.tipo === 'despesa');
  const porCategoria: Record<string, number> = {};
  const porMetodoPagamento: Record<string, number> = {};
  transacoes.forEach(t => {
    const categoriaNome = t.categoria?.nome || 'Sem categoria';
    const catKey = `${t.tipo}_${categoriaNome}`;
    porCategoria[catKey] = (porCategoria[catKey] || 0) + t.valor;
    const metodoPagamento = t.metodoPagamento || 'Sem método';
    porMetodoPagamento[metodoPagamento] = (porMetodoPagamento[metodoPagamento] || 0) + t.valor;
  });
  return {
    receitas: receitas.reduce((acc, t) => acc + t.valor, 0),
    despesas: despesas.reduce((acc, t) => acc + t.valor, 0),
    saldo: receitas.reduce((acc, t) => acc + t.valor, 0) - despesas.reduce((acc, t) => acc + t.valor, 0),
    totalTransacoes: transacoes.length,
    porCategoria,
    porMetodoPagamento,
  };
};

// Categorias
export const getCategorias = async () => {
  return financasSqliteService.getAllCategorias();
};

export const createCategoria = async (categoria) => {
  await financasSqliteService.saveCategoria(categoria);
};

export const deleteCategoria = async (id: string) => {
  await financasSqliteService.deleteCategoria(id);
}; 