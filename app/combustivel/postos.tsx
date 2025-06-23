import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { usePostoStore } from '@/stores/postoStore';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function PostosScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const { postos, loading, fetchPostos } = usePostoStore();
  
  const [filtros, setFiltros] = useState({
    busca: '',
    avaliacao: 'todos',
    distancia: 'todos',
  });
  
  const [postosFiltrados, setPostosFiltrados] = useState<any[]>([]);
  const [showFiltros, setShowFiltros] = useState(false);

  useEffect(() => {
    fetchPostos();
  }, []);

  useEffect(() => {
    filtrarPostos();
  }, [postos, filtros]);

  const filtrarPostos = () => {
    let filtrados = [...postos];

    // Filtro por busca
    if (filtros.busca.trim()) {
      filtrados = filtrados.filter(posto => 
        posto.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
        posto.endereco.toLowerCase().includes(filtros.busca.toLowerCase())
      );
    }

    // Filtro por avaliação
    if (filtros.avaliacao !== 'todos') {
      const minAvaliacao = parseInt(filtros.avaliacao);
      filtrados = filtrados.filter(posto => posto.avaliacaoMedia >= minAvaliacao);
    }

    // Filtro por distância (simulado)
    if (filtros.distancia !== 'todos') {
      // Aqui seria implementada a lógica de distância real
      // Por enquanto, apenas simula
    }

    setPostosFiltrados(filtrados);
  };

  const renderAvaliacao = (avaliacao: number) => {
    const estrelas = [];
    for (let i = 1; i <= 5; i++) {
      estrelas.push(
        <MaterialIcons
          key={i}
          name={i <= avaliacao ? 'star' : 'star-border'}
          size={16}
          color={i <= avaliacao ? '#FFC107' : '#ccc'}
        />
      );
    }
    return <View style={styles.estrelasContainer}>{estrelas}</View>;
  };

  const renderPostoItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.postoItem}
      onPress={() => router.push(`/combustivel/posto/${item.id}`)}
    >
      <View style={styles.postoHeader}>
        <View style={styles.postoInfo}>
          <Text style={styles.postoNome}>{item.nome}</Text>
          <Text style={styles.postoEndereco}>{item.endereco}</Text>
          <View style={styles.postoAvaliacao}>
            {renderAvaliacao(item.avaliacaoMedia)}
            <Text style={styles.avaliacaoText}>
              {item.avaliacaoMedia.toFixed(1)} ({item.totalAvaliacoes} avaliações)
            </Text>
          </View>
        </View>
        <View style={styles.postoAcoes}>
          <TouchableOpacity 
            style={styles.acaoBtn}
            onPress={() => router.push(`/combustivel/posto/${item.id}`)}
          >
            <MaterialIcons name="info" size={20} color="#2196F3" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.acaoBtn}
            onPress={() => Alert.alert('Em desenvolvimento', 'Funcionalidade de rota em breve!')}
          >
            <MaterialIcons name="directions" size={20} color="#4CAF50" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.postoDetalhes}>
        <View style={styles.detalheItem}>
          <MaterialIcons name="local-gas-station" size={16} color="#4CAF50" />
          <Text style={styles.detalheText}>
            {item.tiposCombustivel.join(', ')}
          </Text>
        </View>
        <View style={styles.detalheItem}>
          <MaterialIcons name="schedule" size={16} color="#FF9800" />
          <Text style={styles.detalheText}>
            {item.horarioFuncionamento}
          </Text>
        </View>
        <View style={styles.detalheItem}>
          <MaterialIcons name="phone" size={16} color="#9C27B0" />
          <Text style={styles.detalheText}>
            {item.telefone || 'Não informado'}
          </Text>
        </View>
      </View>

      {item.ultimoPreco && (
        <View style={styles.precoInfo}>
          <Text style={styles.precoLabel}>Último preço registrado:</Text>
          <Text style={styles.precoValor}>
            R$ {item.ultimoPreco.valor.toFixed(3)}/{item.ultimoPreco.tipo}
          </Text>
          <Text style={styles.precoData}>
            {new Date(item.ultimoPreco.data).toLocaleDateString('pt-BR')}
          </Text>
        </View>
      )}

      {item.ultimaVisita && (
        <View style={styles.visitaInfo}>
          <Text style={styles.visitaText}>
            Última visita: {new Date(item.ultimaVisita).toLocaleDateString('pt-BR')}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const handleAddPosto = () => {
    Alert.alert('Em desenvolvimento', 'Funcionalidade de adicionar posto em breve!');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Postos de Combustível</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setShowFiltros(!showFiltros)} style={styles.filterButton}>
            <MaterialIcons name="filter-list" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleAddPosto} style={styles.addButton}>
            <MaterialIcons name="add" size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Busca */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={filtros.busca}
            onChangeText={(text) => setFiltros(prev => ({ ...prev, busca: text }))}
            placeholder="Buscar postos..."
          />
        </View>
      </View>

      {/* Filtros */}
      {showFiltros && (
        <View style={styles.filtrosContainer}>
          {/* Avaliação */}
          <View style={styles.filtroGroup}>
            <Text style={styles.filtroLabel}>Avaliação Mínima</Text>
            <View style={styles.filtroOptions}>
              {['todos', '4', '3', '2', '1'].map((avaliacao) => (
                <TouchableOpacity
                  key={avaliacao}
                  style={[
                    styles.filtroOption,
                    filtros.avaliacao === avaliacao && styles.filtroOptionActive
                  ]}
                  onPress={() => setFiltros(prev => ({ ...prev, avaliacao }))}
                >
                  <Text style={[
                    styles.filtroOptionText,
                    filtros.avaliacao === avaliacao && styles.filtroOptionTextActive
                  ]}>
                    {avaliacao === 'todos' ? 'Todos' : `${avaliacao}+ estrelas`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Distância */}
          <View style={styles.filtroGroup}>
            <Text style={styles.filtroLabel}>Distância</Text>
            <View style={styles.filtroOptions}>
              {['todos', 'proximo', 'medio', 'longe'].map((distancia) => (
                <TouchableOpacity
                  key={distancia}
                  style={[
                    styles.filtroOption,
                    filtros.distancia === distancia && styles.filtroOptionActive
                  ]}
                  onPress={() => setFiltros(prev => ({ ...prev, distancia }))}
                >
                  <Text style={[
                    styles.filtroOptionText,
                    filtros.distancia === distancia && styles.filtroOptionTextActive
                  ]}>
                    {distancia === 'todos' ? 'Todos' : 
                     distancia === 'proximo' ? 'Próximo' :
                     distancia === 'medio' ? 'Médio' : 'Longe'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Lista de Postos */}
      <FlatList
        data={postosFiltrados}
        keyExtractor={(item) => item.id}
        renderItem={renderPostoItem}
        style={styles.lista}
        contentContainerStyle={styles.listaContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="local-gas-station" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>Nenhum posto encontrado</Text>
            <Text style={styles.emptyStateSubtext}>
              Tente ajustar os filtros ou adicionar um novo posto
            </Text>
            <TouchableOpacity style={styles.emptyStateBtn} onPress={handleAddPosto}>
              <Text style={styles.emptyStateBtnText}>Adicionar Primeiro Posto</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    padding: 8,
    marginRight: 8,
  },
  addButton: {
    padding: 8,
  },
  searchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  filtrosContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filtroGroup: {
    marginBottom: 16,
  },
  filtroLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  filtroOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filtroOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  filtroOptionActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  filtroOptionText: {
    fontSize: 12,
    color: '#666',
  },
  filtroOptionTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  lista: {
    flex: 1,
  },
  listaContent: {
    padding: 16,
  },
  postoItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  postoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  postoInfo: {
    flex: 1,
  },
  postoNome: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  postoEndereco: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  postoAvaliacao: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  estrelasContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  avaliacaoText: {
    fontSize: 12,
    color: '#666',
  },
  postoAcoes: {
    flexDirection: 'row',
    gap: 8,
  },
  acaoBtn: {
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  postoDetalhes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  detalheItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detalheText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  precoInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  precoLabel: {
    fontSize: 12,
    color: '#666',
  },
  precoValor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  precoData: {
    fontSize: 12,
    color: '#999',
  },
  visitaInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  visitaText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
    textAlign: 'center',
  },
  emptyStateBtn: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  emptyStateBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
}); 