import CategoriaModal from '@/components/financas/CategoriaModal';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { categoriasSqliteService } from '@/services/sqlite/categoriasSqliteService';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Categoria = {
  id: string;
  nome: string;
  tipo: 'receita' | 'despesa';
  cor: string;
  icone: any;
};

export default function GerenciarCategoriasScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [tipoFiltro, setTipoFiltro] = useState<'receita' | 'despesa'>('receita');
  
  const [isModalVisible, setModalVisible] = useState(false);
  const [categoriaToEdit, setCategoriaToEdit] = useState<Categoria | null>(null);

  useEffect(() => {
    categoriasSqliteService.init();
    const fetchCategorias = async () => {
      const user = getAuth().currentUser;
      if (!user) return;
      const localCategorias = await categoriasSqliteService.getCategorias(user.uid);
      if (localCategorias && localCategorias.length > 0) {
        setCategorias(localCategorias);
        setLoading(false);
        return;
      }
      const db = getFirestore();
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);
      const data = docSnap.data();
      if (data?.categories) {
        await categoriasSqliteService.saveCategorias(user.uid, data.categories);
        setCategorias(data.categories);
      }
      setLoading(false);
    };
    fetchCategorias();
  }, []);

  // useFocusEffect para recarregar os dados quando a tela recebe foco
  useFocusEffect(
    useCallback(() => {
      fetchCategorias();
    }, [fetchCategorias])
  );

  const handleOpenModal = (categoria?: Categoria) => {
    setCategoriaToEdit(categoria || null);
    setModalVisible(true);
  };

  const handleSaveCategoria = async (data: Omit<Categoria, 'id'>, id?: string) => {
    const user = getAuth().currentUser;
    if (!user) return;

    let novasCategorias;
    if (id) {
      // Editando
      novasCategorias = categorias.map(c => c.id === id ? { ...c, ...data } : c);
    } else {
      // Adicionando
      const novaCategoria = { ...data, id: new Date().getTime().toString() };
      novasCategorias = [...categorias, novaCategoria];
    }

    setCategorias(novasCategorias);

    const db = getFirestore();
    try {
      await setDoc(doc(db, 'users', user.uid), { categories: novasCategorias }, { merge: true });
      setModalVisible(false);
      setCategoriaToEdit(null);
      await categoriasSqliteService.saveCategorias(user.uid, novasCategorias);
      alert('Categorias salvas!');
      router.replace('/setup/apelido');
    } catch (error) {
      alert('Erro ao salvar categoria.');
      // Reverter o estado se o save falhar
      fetchCategorias();
    }
  };

  const filteredCategorias = categorias.filter(c => c.tipo === tipoFiltro);

  const styles = getStyles(colors);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        headerShown: true, 
        title: 'Categorias', 
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerRight: () => (
          <TouchableOpacity onPress={() => {}} style={{ marginRight: 15 }}>
            <MaterialIcons name="search" size={24} color={colors.text} />
          </TouchableOpacity>
        )
      }} />

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, tipoFiltro === 'receita' && styles.tabActive]}
          onPress={() => setTipoFiltro('receita')}
        >
          <Text style={[styles.tabText, tipoFiltro === 'receita' && styles.tabTextActive]}>Receitas</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, tipoFiltro === 'despesa' && styles.tabActive]}
          onPress={() => setTipoFiltro('despesa')}
        >
          <Text style={[styles.tabText, tipoFiltro === 'despesa' && styles.tabTextActive]}>Despesas</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredCategorias}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.itemContainer} onPress={() => handleOpenModal(item)}>
            <View style={[styles.iconContainer, { backgroundColor: item.cor }]}>
              <MaterialIcons name={item.icone} size={24} color="#fff" />
            </View>
            <Text style={styles.itemText}>{item.nome}</Text>
            <MaterialIcons name="edit" size={22} color={colors.textMuted} />
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="category" size={64} color={colors.textMuted} />
            <Text style={styles.emptyText}>Nenhuma categoria de {tipoFiltro} encontrada.</Text>
          </View>
        }
      />

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => handleOpenModal()}
      >
        <MaterialIcons name="add" size={32} color="#fff" />
      </TouchableOpacity>
      
      <CategoriaModal 
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveCategoria}
        categoriaToEdit={categoriaToEdit}
        tipo={tipoFiltro}
      />
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    margin: 20,
    backgroundColor: colors.card,
    borderRadius: 12,
  },
  tabButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: colors.tint,
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textMuted,
  },
  tabTextActive: {
    color: '#fff',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textMuted,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.tint,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  }
});