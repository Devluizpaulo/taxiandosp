import { AvaliacaoPosto, Posto, PrecoCombustivel } from '@/stores/postoStore';

const POSTOS_COLLECTION = 'postos';
const AVALIACOES_COLLECTION = 'avaliacoes_postos';
const PRECOS_COLLECTION = 'precos_combustivel';

// Dados mock para desenvolvimento
const MOCK_POSTOS: Posto[] = [
  {
    id: 'posto1',
    nome: 'Posto Shell - Centro',
    endereco: 'Rua das Flores, 123 - Centro',
    telefone: '(11) 99999-9999',
    horarioFuncionamento: '24h',
    tiposCombustivel: ['gasolina', 'etanol', 'diesel'],
    servicos: ['Lavagem', 'Ar condicionado', 'Wi-Fi'],
    avaliacaoMedia: 4.5,
    totalAvaliacoes: 12,
    avaliacoes: [
      {
        id: 'av1',
        postoId: 'posto1',
        autor: 'João Silva',
        nota: 5,
        comentario: 'Excelente atendimento e preços justos',
        categoria: 'geral',
        data: new Date('2024-01-10'),
      },
      {
        id: 'av2',
        postoId: 'posto1',
        autor: 'Maria Santos',
        nota: 4,
        comentario: 'Bom posto, mas poderia ter mais opções de pagamento',
        categoria: 'atendimento',
        data: new Date('2024-01-08'),
      },
    ],
    precos: [
      {
        id: 'preco1',
        postoId: 'posto1',
        tipo: 'gasolina',
        valor: 5.89,
        data: new Date('2024-01-15'),
      },
      {
        id: 'preco2',
        postoId: 'posto1',
        tipo: 'etanol',
        valor: 3.99,
        data: new Date('2024-01-15'),
      },
    ],
    ultimaVisita: new Date('2024-01-15'),
    coordenadas: {
      latitude: -23.5505,
      longitude: -46.6333,
    },
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'posto2',
    nome: 'Posto Ipiranga - Zona Sul',
    endereco: 'Av. Paulista, 1000 - Zona Sul',
    telefone: '(11) 88888-8888',
    horarioFuncionamento: '06h às 22h',
    tiposCombustivel: ['gasolina', 'etanol'],
    servicos: ['Lavagem'],
    avaliacaoMedia: 4.2,
    totalAvaliacoes: 8,
    avaliacoes: [
      {
        id: 'av3',
        postoId: 'posto2',
        autor: 'Pedro Costa',
        nota: 4,
        comentario: 'Preços competitivos',
        categoria: 'preco',
        data: new Date('2024-01-12'),
      },
    ],
    precos: [
      {
        id: 'preco3',
        postoId: 'posto2',
        tipo: 'etanol',
        valor: 3.99,
        data: new Date('2024-01-10'),
      },
    ],
    ultimaVisita: new Date('2024-01-10'),
    coordenadas: {
      latitude: -23.5630,
      longitude: -46.6544,
    },
    createdAt: new Date('2023-02-01'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: 'posto3',
    nome: 'Posto Petrobras - Norte',
    endereco: 'Rua do Comércio, 500 - Zona Norte',
    telefone: '(11) 77777-7777',
    horarioFuncionamento: '24h',
    tiposCombustivel: ['gasolina', 'etanol', 'diesel'],
    servicos: ['Lavagem', 'Ar condicionado', 'Wi-Fi', 'Restaurante'],
    avaliacaoMedia: 4.8,
    totalAvaliacoes: 15,
    avaliacoes: [
      {
        id: 'av4',
        postoId: 'posto3',
        autor: 'Ana Oliveira',
        nota: 5,
        comentario: 'Melhor posto da região!',
        categoria: 'geral',
        data: new Date('2024-01-14'),
      },
    ],
    precos: [
      {
        id: 'preco4',
        postoId: 'posto3',
        tipo: 'gasolina',
        valor: 5.95,
        data: new Date('2024-01-05'),
      },
    ],
    ultimaVisita: new Date('2024-01-05'),
    coordenadas: {
      latitude: -23.5200,
      longitude: -46.6200,
    },
    createdAt: new Date('2023-03-01'),
    updatedAt: new Date('2024-01-05'),
  },
];

export const postoService = {
  async getPostos(): Promise<Posto[]> {
    try {
      // Para desenvolvimento, retornar dados mock
      return MOCK_POSTOS;
      
      // Código original comentado para desenvolvimento
      /*
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('Usuário não autenticado');

      const db = getFirestore();
      const q = query(
        collection(db, POSTOS_COLLECTION),
        where('userId', '==', user.uid),
        orderBy('nome')
      );

      const querySnapshot = await getDocs(q);
      const postos: Posto[] = [];

      for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data();
        const posto: Posto = {
          id: docSnapshot.id,
          nome: data.nome,
          endereco: data.endereco,
          telefone: data.telefone,
          horarioFuncionamento: data.horarioFuncionamento,
          tiposCombustivel: data.tiposCombustivel || [],
          servicos: data.servicos || [],
          avaliacaoMedia: data.avaliacaoMedia || 0,
          totalAvaliacoes: data.totalAvaliacoes || 0,
          avaliacoes: [],
          precos: [],
          ultimaVisita: data.ultimaVisita ? data.ultimaVisita.toDate() : undefined,
          coordenadas: data.coordenadas,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        };

        // Buscar avaliações do posto
        const avaliacoesQuery = query(
          collection(db, AVALIACOES_COLLECTION),
          where('postoId', '==', docSnapshot.id),
          orderBy('data', 'desc')
        );
        const avaliacoesSnapshot = await getDocs(avaliacoesQuery);
        posto.avaliacoes = avaliacoesSnapshot.docs.map(doc => ({
          id: doc.id,
          postoId: doc.data().postoId,
          autor: doc.data().autor,
          nota: doc.data().nota,
          comentario: doc.data().comentario,
          categoria: doc.data().categoria,
          data: doc.data().data.toDate(),
        }));

        // Buscar preços do posto
        const precosQuery = query(
          collection(db, PRECOS_COLLECTION),
          where('postoId', '==', docSnapshot.id),
          orderBy('data', 'desc')
        );
        const precosSnapshot = await getDocs(precosQuery);
        posto.precos = precosSnapshot.docs.map(doc => ({
          id: doc.id,
          postoId: doc.data().postoId,
          tipo: doc.data().tipo,
          valor: doc.data().valor,
          data: doc.data().data.toDate(),
        }));

        postos.push(posto);
      }

      return postos;
      */
    } catch (error) {
      console.error('Erro ao buscar postos:', error);
      throw error;
    }
  },

  async addPosto(data: Omit<Posto, 'id' | 'avaliacaoMedia' | 'totalAvaliacoes' | 'avaliacoes' | 'createdAt' | 'updatedAt'>): Promise<Posto> {
    try {
      // Para desenvolvimento, simular adição
      const novoPosto: Posto = {
        id: Date.now().toString(),
        ...data,
        avaliacaoMedia: 0,
        totalAvaliacoes: 0,
        avaliacoes: [],
        precos: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      MOCK_POSTOS.unshift(novoPosto);
      return novoPosto;
      
      // Código original comentado para desenvolvimento
      /*
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('Usuário não autenticado');

      const db = getFirestore();
      const now = Timestamp.now();

      const postoData = {
        ...data,
        userId: user.uid,
        avaliacaoMedia: 0,
        totalAvaliacoes: 0,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(db, POSTOS_COLLECTION), postoData);

      return {
        id: docRef.id,
        ...data,
        avaliacaoMedia: 0,
        totalAvaliacoes: 0,
        avaliacoes: [],
        precos: [],
        createdAt: now.toDate(),
        updatedAt: now.toDate(),
      };
      */
    } catch (error) {
      console.error('Erro ao adicionar posto:', error);
      throw error;
    }
  },

  async updatePosto(id: string, data: Partial<Posto>): Promise<void> {
    try {
      // Para desenvolvimento, simular atualização
      const index = MOCK_POSTOS.findIndex(item => item.id === id);
      if (index !== -1) {
        MOCK_POSTOS[index] = {
          ...MOCK_POSTOS[index],
          ...data,
          updatedAt: new Date(),
        };
      }
      
      // Código original comentado para desenvolvimento
      /*
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('Usuário não autenticado');

      const db = getFirestore();
      const docRef = doc(db, POSTOS_COLLECTION, id);

      const updateData: any = {
        ...data,
        updatedAt: Timestamp.now(),
      };

      // Converter datas se fornecidas
      if (data.ultimaVisita) {
        updateData.ultimaVisita = Timestamp.fromDate(data.ultimaVisita);
      }

      await updateDoc(docRef, updateData);
      */
    } catch (error) {
      console.error('Erro ao atualizar posto:', error);
      throw error;
    }
  },

  async deletePosto(id: string): Promise<void> {
    try {
      // Para desenvolvimento, simular exclusão
      const index = MOCK_POSTOS.findIndex(item => item.id === id);
      if (index !== -1) {
        MOCK_POSTOS.splice(index, 1);
      }
      
      // Código original comentado para desenvolvimento
      /*
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('Usuário não autenticado');

      const db = getFirestore();
      const docRef = doc(db, POSTOS_COLLECTION, id);

      // Deletar avaliações relacionadas
      const avaliacoesQuery = query(
        collection(db, AVALIACOES_COLLECTION),
        where('postoId', '==', id)
      );
      const avaliacoesSnapshot = await getDocs(avaliacoesQuery);
      for (const docSnapshot of avaliacoesSnapshot.docs) {
        await deleteDoc(docSnapshot.ref);
      }

      // Deletar preços relacionados
      const precosQuery = query(
        collection(db, PRECOS_COLLECTION),
        where('postoId', '==', id)
      );
      const precosSnapshot = await getDocs(precosQuery);
      for (const docSnapshot of precosSnapshot.docs) {
        await deleteDoc(docSnapshot.ref);
      }

      // Deletar o posto
      await deleteDoc(docRef);
      */
    } catch (error) {
      console.error('Erro ao deletar posto:', error);
      throw error;
    }
  },

  async addAvaliacao(postoId: string, avaliacao: Omit<AvaliacaoPosto, 'id'>): Promise<AvaliacaoPosto> {
    try {
      // Para desenvolvimento, simular adição de avaliação
      const novaAvaliacao: AvaliacaoPosto = {
        id: Date.now().toString(),
        ...avaliacao,
      };
      
      const posto = MOCK_POSTOS.find(p => p.id === postoId);
      if (posto) {
        posto.avaliacoes = posto.avaliacoes || [];
        posto.avaliacoes.push(novaAvaliacao);
        posto.totalAvaliacoes = posto.avaliacoes.length;
        posto.avaliacaoMedia = posto.avaliacoes.length > 0 
          ? posto.avaliacoes.reduce((sum, av) => sum + av.nota, 0) / posto.avaliacoes.length
          : 0;
        posto.updatedAt = new Date();
      }
      
      return novaAvaliacao;
      
      // Código original comentado para desenvolvimento
      /*
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('Usuário não autenticado');

      const db = getFirestore();
      const now = Timestamp.now();

      const avaliacaoData = {
        ...avaliacao,
        postoId,
        autor: user.displayName || user.email || 'Usuário',
        data: Timestamp.fromDate(avaliacao.data),
        createdAt: now,
      };

      const docRef = await addDoc(collection(db, AVALIACOES_COLLECTION), avaliacaoData);

      // Atualizar média de avaliação do posto
      await this.atualizarMediaAvaliacao(postoId);

      return {
        id: docRef.id,
        ...avaliacao,
        data: avaliacao.data,
      };
      */
    } catch (error) {
      console.error('Erro ao adicionar avaliação:', error);
      throw error;
    }
  },

  async addPreco(postoId: string, preco: Omit<PrecoCombustivel, 'id'>): Promise<PrecoCombustivel> {
    try {
      // Para desenvolvimento, simular adição de preço
      const novoPreco: PrecoCombustivel = {
        id: Date.now().toString(),
        ...preco,
      };
      
      const posto = MOCK_POSTOS.find(p => p.id === postoId);
      if (posto) {
        posto.precos = posto.precos || [];
        posto.precos.unshift(novoPreco);
        posto.updatedAt = new Date();
      }
      
      return novoPreco;
      
      // Código original comentado para desenvolvimento
      /*
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('Usuário não autenticado');

      const db = getFirestore();
      const now = Timestamp.now();

      const precoData = {
        ...preco,
        postoId,
        data: Timestamp.fromDate(preco.data),
        createdAt: now,
      };

      const docRef = await addDoc(collection(db, PRECOS_COLLECTION), precoData);

      return {
        id: docRef.id,
        ...preco,
        data: preco.data,
      };
      */
    } catch (error) {
      console.error('Erro ao adicionar preço:', error);
      throw error;
    }
  },

  async atualizarMediaAvaliacao(postoId: string): Promise<void> {
    try {
      // Para desenvolvimento, já atualizado no addAvaliacao
      return;
      
      // Código original comentado para desenvolvimento
      /*
      const db = getFirestore();
      
      // Buscar todas as avaliações do posto
      const avaliacoesQuery = query(
        collection(db, AVALIACOES_COLLECTION),
        where('postoId', '==', postoId)
      );
      const avaliacoesSnapshot = await getDocs(avaliacoesQuery);
      
      if (avaliacoesSnapshot.empty) {
        // Se não há avaliações, definir média como 0
        const postoRef = doc(db, POSTOS_COLLECTION, postoId);
        await updateDoc(postoRef, {
          avaliacaoMedia: 0,
          totalAvaliacoes: 0,
          updatedAt: Timestamp.now(),
        });
        return;
      }

      // Calcular média
      let somaNotas = 0;
      avaliacoesSnapshot.forEach(doc => {
        somaNotas += doc.data().nota;
      });

      const media = somaNotas / avaliacoesSnapshot.size;
      const totalAvaliacoes = avaliacoesSnapshot.size;

      // Atualizar posto
      const postoRef = doc(db, POSTOS_COLLECTION, postoId);
      await updateDoc(postoRef, {
        avaliacaoMedia: media,
        totalAvaliacoes,
        updatedAt: Timestamp.now(),
      });
      */
    } catch (error) {
      console.error('Erro ao atualizar média de avaliação:', error);
      throw error;
    }
  },

  async buscarPostosPorNome(nome: string): Promise<Posto[]> {
    try {
      // Para desenvolvimento, filtrar dados mock
      return MOCK_POSTOS.filter(posto => 
        posto.nome.toLowerCase().includes(nome.toLowerCase()) ||
        posto.endereco.toLowerCase().includes(nome.toLowerCase())
      );
      
      // Código original comentado para desenvolvimento
      /*
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('Usuário não autenticado');

      const db = getFirestore();
      const q = query(
        collection(db, POSTOS_COLLECTION),
        where('userId', '==', user.uid),
        where('nome', '>=', nome),
        where('nome', '<=', nome + '\uf8ff'),
        orderBy('nome')
      );

      const querySnapshot = await getDocs(q);
      const postos: Posto[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        postos.push({
          id: doc.id,
          nome: data.nome,
          endereco: data.endereco,
          telefone: data.telefone,
          horarioFuncionamento: data.horarioFuncionamento,
          tiposCombustivel: data.tiposCombustivel || [],
          servicos: data.servicos || [],
          avaliacaoMedia: data.avaliacaoMedia || 0,
          totalAvaliacoes: data.totalAvaliacoes || 0,
          avaliacoes: [],
          precos: [],
          ultimaVisita: data.ultimaVisita ? data.ultimaVisita.toDate() : undefined,
          coordenadas: data.coordenadas,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        });
      });

      return postos;
      */
    } catch (error) {
      console.error('Erro ao buscar postos por nome:', error);
      throw error;
    }
  },

  async getPostosComMelhorAvaliacao(limite: number = 5): Promise<Posto[]> {
    try {
      // Para desenvolvimento, filtrar dados mock
      return MOCK_POSTOS
        .filter(posto => posto.avaliacaoMedia >= 4)
        .sort((a, b) => b.avaliacaoMedia - a.avaliacaoMedia)
        .slice(0, limite);
      
      // Código original comentado para desenvolvimento
      /*
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('Usuário não autenticado');

      const db = getFirestore();
      const q = query(
        collection(db, POSTOS_COLLECTION),
        where('userId', '==', user.uid),
        where('avaliacaoMedia', '>=', 4),
        orderBy('avaliacaoMedia', 'desc'),
        orderBy('totalAvaliacoes', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const postos: Posto[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        postos.push({
          id: doc.id,
          nome: data.nome,
          endereco: data.endereco,
          telefone: data.telefone,
          horarioFuncionamento: data.horarioFuncionamento,
          tiposCombustivel: data.tiposCombustivel || [],
          servicos: data.servicos || [],
          avaliacaoMedia: data.avaliacaoMedia || 0,
          totalAvaliacoes: data.totalAvaliacoes || 0,
          avaliacoes: [],
          precos: [],
          ultimaVisita: data.ultimaVisita ? data.ultimaVisita.toDate() : undefined,
          coordenadas: data.coordenadas,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        });
      });

      return postos.slice(0, limite);
      */
    } catch (error) {
      console.error('Erro ao buscar postos com melhor avaliação:', error);
      throw error;
    }
  },
};

// Função auxiliar para calcular distância entre dois pontos
function calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
} 