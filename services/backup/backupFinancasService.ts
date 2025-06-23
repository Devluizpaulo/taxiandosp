import { getAuth } from 'firebase/auth';
import { doc, getDoc, getFirestore, updateDoc } from 'firebase/firestore';
import { Categoria, Transacao } from '../../types/financas';
import * as financasService from '../financasService';
import { financasSqliteService } from '../sqlite/financas/financasSqliteService';

export const backupFinancasService = {
  async validarDados(): Promise<{ ok: boolean; erros: string[] }> {
    const transacoes = await financasSqliteService.getAllTransacoes();
    const categorias = await financasSqliteService.getAllCategorias();
    const erros: string[] = [];
    // Checar duplicidade de IDs
    const ids = [
      ...transacoes.map(t => t.id),
      ...categorias.map(c => c.id),
    ];
    const idSet = new Set(ids);
    if (idSet.size !== ids.length) erros.push('IDs duplicados encontrados.');
    // Checar campos obrigatórios
    transacoes.forEach(t => {
      if (!t.data) erros.push(`Transação ${t.id} sem data.`);
      if (!t.valor) erros.push(`Transação ${t.id} sem valor.`);
    });
    categorias.forEach(c => {
      if (!c.nome) erros.push(`Categoria ${c.id} sem nome.`);
    });
    return { ok: erros.length === 0, erros };
  },

  async sincronizarComFirestore(onProgress?: (p: number) => void): Promise<void> {
    const transacoes = await financasSqliteService.getAllTransacoes();
    const categorias = await financasSqliteService.getAllCategorias();
    let total = transacoes.length + 1; // 1 passo para categorias
    let done = 0;
    const step = () => { done++; onProgress && onProgress(done / total); };
    for (const t of transacoes) {
      const existentes = await financasService.getTransacoes();
      const existe = existentes.find(x => x.id === t.id);
      if (existe) {
        await financasService.updateTransacao(t.id, t);
      } else {
        await financasService.createTransacao(t);
      }
      step();
    }
    // Salvar categorias no campo do usuário
    const user = getAuth().currentUser;
    if (user) {
      const db = getFirestore();
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { categories: categorias });
    }
    step();
  },

  async restaurarDoFirestore(onProgress?: (p: number) => void): Promise<void> {
    const transacoes: Transacao[] = await financasService.getTransacoes();
    let total = transacoes.length + 1; // 1 passo para categorias
    let done = 0;
    const step = () => { done++; onProgress && onProgress(done / total); };
    for (const t of transacoes) { await financasSqliteService.saveTransacao(t); step(); }
    // Restaurar categorias do campo do usuário
    const user = getAuth().currentUser;
    if (user) {
      const db = getFirestore();
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const categorias: Categoria[] = userSnap.data()?.categories || [];
      for (const c of categorias) { await financasSqliteService.saveCategoria(c); }
    }
    step();
  },
}; 