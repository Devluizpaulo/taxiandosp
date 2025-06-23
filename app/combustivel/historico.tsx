import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useCombustivelStore } from '@/stores/combustivelStore';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function HistoricoCombustivelScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const { abastecimentos, loading, fetchAbastecimentos } = useCombustivelStore();
  
  const [filtros, setFiltros] = useState({
    periodo: 'todos',
    tipoCombustivel: 'todos',
    posto: '',
  });
  
  const [abastecimentosFiltrados, setAbastecimentosFiltrados] = useState<any[]>([]);
  const [showFiltros, setShowFiltros] = useState(false);

  useEffect(() => {
    fetchAbastecimentos();
  }, []);

  useEffect(() => {
    filtrarAbastecimentos();
  }, [abastecimentos, filtros]);

  const filtrarAbastecimentos = () => {
    let filtrados = [...abastecimentos];

    // Filtro por período
    if (filtros.periodo !== 'todos') {
      const hoje = new Date();
      const inicioPeriodo = new Date();
      
      switch (filtros.periodo) {
        case 'semana':
          inicioPeriodo.setDate(hoje.getDate() - 7);
          break;
        case 'mes':
          inicioPeriodo.setMonth(hoje.getMonth() - 1);
          break;
        case 'trimestre':
          inicioPeriodo.setMonth(hoje.getMonth() - 3);
          break;
        case 'ano':
          inicioPeriodo.setFullYear(hoje.getFullYear() - 1);
          break;
      }
      
      filtrados = filtrados.filter(item => new Date(item.data) >= inicioPeriodo);
    }

    // Filtro por tipo de combustível
    if (filtros.tipoCombustivel !== 'todos') {
      filtrados = filtrados.filter(item => item.tipoCombustivel === filtros.tipoCombustivel);
    }

    // Filtro por posto
    if (filtros.posto.trim()) {
      filtrados = filtrados.filter(item => 
        item.postoNames.toLowerCase().includes(filtros.posto.toLowerCase())
      );
    }

    setAbastecimentosFiltrados(filtrados);
  };

  const calcularEstatisticas = () => {
    if (abastecimentosFiltrados.length === 0) return null;

    const totalGasto = abastecimentosFiltrados.reduce((sum, item) => sum + item.valorTotal, 0);
    const totalLitros = abastecimentosFiltrados.reduce((sum, item) => sum + item.litros, 0);
    const mediaPreco = totalGasto / totalLitros;
    
    // Calcular km percorridos (diferença entre km atual e anterior)
    let kmPercorridos = 0;
    for (let i = 1; i < abastecimentosFiltrados.length; i++) {
      const kmAtual = abastecimentosFiltrados[i].kmAtual;
      const kmAnterior = abastecimentosFiltrados[i-1].kmAtual;
      if (kmAtual > kmAnterior) {
        kmPercorridos += (kmAtual - kmAnterior);
      }
    }

    const consumoMedio = kmPercorridos > 0 ? kmPercorridos / totalLitros : 0;
    const custoKm = kmPercorridos > 0 ? totalGasto / kmPercorridos : 0;

    return {
      totalAbastecimentos: abastecimentosFiltrados.length,
      totalGasto,
      totalLitros,
      mediaPreco,
      kmPercorridos,
      consumoMedio,
      custoKm,
    };
  };

  const renderAbastecimentoItem = ({ item, index }: { item: any; index: number }) => {
    const kmAnterior = index < abastecimentosFiltrados.length - 1 
      ? abastecimentosFiltrados[index + 1].kmAtual 
      : null;
    const kmPercorrido = kmAnterior ? item.kmAtual - kmAnterior : null;
    const consumo = kmPercorrido ? kmPercorrido / item.litros : null;

    return (
      <TouchableOpacity style={styles.abastecimentoItem}>
        <View style={styles.abastecimentoHeader}>
          <View style={styles.abastecimentoInfo}>
            <Text style={styles.postoNome}>{item.postoNames}</Text>
            <Text style={styles.abastecimentoData}>
              {new Date(item.data).toLocaleDateString('pt-BR')}
            </Text>
          </View>
          <View style={styles.abastecimentoValores}>
            <Text style={styles.litros}>{item.litros}L</Text>
            <Text style={styles.valor}>R$ {item.valorTotal.toFixed(2)}</Text>
          </View>
        </View>
        
        <View style={styles.abastecimentoDetalhes}>
          <View style={styles.detalheItem}>
            <MaterialIcons name="local-gas-station" size={16} color="#4CAF50" />
            <Text style={styles.detalheText}>
              {item.tipoCombustivel.charAt(0).toUpperCase() + item.tipoCombustivel.slice(1)}
            </Text>
          </View>
          <View style={styles.detalheItem}>
            <MaterialIcons name="speed" size={16} color="#2196F3" />
            <Text style={styles.detalheText}>KM: {item.kmAtual}</Text>
          </View>
          <View style={styles.detalheItem}>
            <MaterialIcons name="attach-money" size={16} color="#FF9800" />
            <Text style={styles.detalheText}>R$ {item.precoLitro.toFixed(3)}/L</Text>
          </View>
        </View>

        {kmPercorrido && consumo && (
          <View style={styles.consumoInfo}>
            <Text style={styles.consumoText}>
              KM percorrido: {kmPercorrido.toFixed(0)} | 
              Consumo: {consumo.toFixed(1)} km/L
            </Text>
          </View>
        )}

        {item.observacoes && (
          <View style={styles.observacoesContainer}>
            <Text style={styles.observacoesText}>{item.observacoes}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const estatisticas = calcularEstatisticas();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Histórico de Abastecimentos</Text>
        <TouchableOpacity onPress={() => setShowFiltros(!showFiltros)} style={styles.filterButton}>
          <MaterialIcons name="filter-list" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Filtros */}
      {showFiltros && (
        <View style={styles.filtrosContainer}>
          {/* Período */}
          <View style={styles.filtroGroup}>
            <Text style={styles.filtroLabel}>Período</Text>
            <View style={styles.filtroOptions}>
              {['todos', 'semana', 'mes', 'trimestre', 'ano'].map((periodo) => (
                <TouchableOpacity
                  key={periodo}
                  style={[
                    styles.filtroOption,
                    filtros.periodo === periodo && styles.filtroOptionActive
                  ]}
                  onPress={() => setFiltros(prev => ({ ...prev, periodo }))}
                >
                  <Text style={[
                    styles.filtroOptionText,
                    filtros.periodo === periodo && styles.filtroOptionTextActive
                  ]}>
                    {periodo.charAt(0).toUpperCase() + periodo.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Tipo de Combustível */}
          <View style={styles.filtroGroup}>
            <Text style={styles.filtroLabel}>Combustível</Text>
            <View style={styles.filtroOptions}>
              {['todos', 'gasolina', 'etanol', 'diesel'].map((tipo) => (
                <TouchableOpacity
                  key={tipo}
                  style={[
                    styles.filtroOption,
                    filtros.tipoCombustivel === tipo && styles.filtroOptionActive
                  ]}
                  onPress={() => setFiltros(prev => ({ ...prev, tipoCombustivel: tipo }))}
                >
                  <Text style={[
                    styles.filtroOptionText,
                    filtros.tipoCombustivel === tipo && styles.filtroOptionTextActive
                  ]}>
                    {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Busca por Posto */}
          <View style={styles.filtroGroup}>
            <Text style={styles.filtroLabel}>Buscar por Posto</Text>
            <TextInput
              style={styles.searchInput}
              value={filtros.posto}
              onChangeText={(text) => setFiltros(prev => ({ ...prev, posto: text }))}
              placeholder="Digite o nome do posto..."
            />
          </View>
        </View>
      )}

      {/* Estatísticas */}
      {estatisticas && (
        <View style={styles.estatisticasCard}>
          <Text style={styles.estatisticasTitle}>Resumo do Período</Text>
          <View style={styles.estatisticasGrid}>
            <View style={styles.estatisticaItem}>
              <Text style={styles.estatisticaValor}>{estatisticas.totalAbastecimentos}</Text>
              <Text style={styles.estatisticaLabel}>Abastecimentos</Text>
            </View>
            <View style={styles.estatisticaItem}>
              <Text style={styles.estatisticaValor}>R$ {estatisticas.totalGasto.toFixed(2)}</Text>
              <Text style={styles.estatisticaLabel}>Total Gasto</Text>
            </View>
            <View style={styles.estatisticaItem}>
              <Text style={styles.estatisticaValor}>{estatisticas.totalLitros.toFixed(1)}L</Text>
              <Text style={styles.estatisticaLabel}>Total Litros</Text>
            </View>
            <View style={styles.estatisticaItem}>
              <Text style={styles.estatisticaValor}>{estatisticas.consumoMedio.toFixed(1)}</Text>
              <Text style={styles.estatisticaLabel}>Km/L</Text>
            </View>
          </View>
        </View>
      )}

      {/* Lista de Abastecimentos */}
      <FlatList
        data={abastecimentosFiltrados}
        keyExtractor={(item) => item.id}
        renderItem={renderAbastecimentoItem}
        style={styles.lista}
        contentContainerStyle={styles.listaContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="local-gas-station" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>Nenhum abastecimento encontrado</Text>
            <Text style={styles.emptyStateSubtext}>
              Tente ajustar os filtros ou adicionar um novo abastecimento
            </Text>
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
  filterButton: {
    padding: 8,
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
  searchInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  estatisticasCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  estatisticasTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  estatisticasGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  estatisticaItem: {
    alignItems: 'center',
    flex: 1,
  },
  estatisticaValor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  estatisticaLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  lista: {
    flex: 1,
  },
  listaContent: {
    padding: 16,
  },
  abastecimentoItem: {
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
  abastecimentoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  abastecimentoInfo: {
    flex: 1,
  },
  postoNome: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  abastecimentoData: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  abastecimentoValores: {
    alignItems: 'flex-end',
  },
  litros: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  valor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  abastecimentoDetalhes: {
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
  },
  detalheText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  consumoInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  consumoText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
  },
  observacoesContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  observacoesText: {
    fontSize: 12,
    color: '#666',
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
}); 