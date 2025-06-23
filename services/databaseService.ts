import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

// expo-sqlite não exporta mais tipos como SQLTransaction ou SQLResultSet.
// Por isso, usamos 'any' nos callbacks de transação e resultado.
// A partir da versão 15.x, use openDatabaseSync para abrir o banco fora de componentes React.

function openDatabase() {
  if (Platform.OS === 'web') {
    // No web, expo-sqlite não é suportado (a não ser com fallback wasm, que não está configurado aqui)
    return null;
  }
  return SQLite.openDatabaseSync('taxiando.db');
}

const db = openDatabase();

export type CategoriaDTO = {
  id: string; // UUID
  nome: string;
  tipo: 'receita' | 'despesa';
  cor: string;
  icone: string;
  visivel: boolean;
  user_id: string;
  sincronizado: boolean;
  deletado: boolean;
};

const DATABASE_VERSION = 1;

export const DatabaseService = {
  // Inicializa o banco de dados e cria as tabelas se necessário
  async initDB() {
    if (!db) {
      console.warn('SQLite não está disponível nesta plataforma.');
      return;
    }
    // Cria tabela de versionamento
    await db.execAsync(`CREATE TABLE IF NOT EXISTS version (
      id INTEGER PRIMARY KEY NOT NULL,
      version INTEGER NOT NULL
    );`);

    // Verifica versão atual
    let currentVersion = 0;
    try {
      const statement = await db.prepareAsync('SELECT * FROM version');
      const result = await statement.executeAsync();
      const rows = await result.getAllAsync();
      await statement.finalizeAsync();
      currentVersion = Array.isArray(rows) && rows.length > 0 && typeof (rows[0] as any).version === 'number' ? (rows[0] as any).version : 0;
    } catch (e) {
      // Primeira execução, tabela pode estar vazia
      currentVersion = 0;
    }
    if (currentVersion >= DATABASE_VERSION) {
      console.log('Banco de dados já está atualizado.');
      return;
    }
    // Cria tabela de categorias
    await db.execAsync(`CREATE TABLE IF NOT EXISTS categorias (
      id TEXT PRIMARY KEY NOT NULL,
      nome TEXT NOT NULL,
      tipo TEXT NOT NULL,
      cor TEXT NOT NULL,
      icone TEXT NOT NULL,
      visivel INTEGER NOT NULL DEFAULT 1,
      user_id TEXT NOT NULL,
      sincronizado INTEGER NOT NULL DEFAULT 0,
      deletado INTEGER NOT NULL DEFAULT 0
    );`);
    // Atualiza versão
    const stmt = await db.prepareAsync('INSERT OR REPLACE INTO version (id, version) VALUES (1, ?)');
    await stmt.executeAsync([DATABASE_VERSION]);
    await stmt.finalizeAsync();
    console.log('Tabela de categorias criada e versão do DB atualizada.');
  },

  // Busca todas as categorias não deletadas
  async getCategorias(): Promise<CategoriaDTO[]> {
    if (!db) {
      console.warn('SQLite não está disponível nesta plataforma.');
      return [];
    }
    const statement = await db.prepareAsync('SELECT * FROM categorias WHERE deletado = 0');
    const result = await statement.executeAsync();
    const rows = await result.getAllAsync();
    await statement.finalizeAsync();
    return rows as CategoriaDTO[];
  },

  // Adiciona ou atualiza uma categoria
  async addOrUpdateCategoria(categoria: Omit<CategoriaDTO, 'sincronizado' | 'deletado'>): Promise<void> {
    if (!db) {
      console.warn('SQLite não está disponível nesta plataforma.');
      return;
    }
    const stmt = await db.prepareAsync(
      `INSERT OR REPLACE INTO categorias (id, nome, tipo, cor, icone, visivel, user_id, sincronizado, deletado)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0);`
    );
    await stmt.executeAsync([
      categoria.id,
      categoria.nome,
      categoria.tipo,
      categoria.cor,
      categoria.icone,
      categoria.visivel ? 1 : 0,
      categoria.user_id,
    ]);
    await stmt.finalizeAsync();
    console.log('Categoria salva localmente com sucesso');
  },

  // Marca uma categoria como deletada
  async marcarCategoriaDeletada(id: string): Promise<void> {
    if (!db) {
      console.warn('SQLite não está disponível nesta plataforma.');
      return;
    }
    const stmt = await db.prepareAsync(
      'UPDATE categorias SET deletado = 1, sincronizado = 0 WHERE id = ?;'
    );
    await stmt.executeAsync([id]);
    await stmt.finalizeAsync();
    console.log('Categoria marcada como deletada localmente');
  }
};

// Inicializa o banco de dados assim que o app carrega o serviço
DatabaseService.initDB(); 