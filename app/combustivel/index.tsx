import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useCombustivelStore } from '@/stores/combustivelStore';
import { usePostoStore } from '@/stores/postoStore';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CombustivelScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const { abastecimentos, loading, fetchAbastecimentos, resumo } = useCombustivelStore();
  const { postos, fetchPostos } = usePostoStore();
  
  const [selectedPeriod, setSelectedPeriod] = useState('mes');

  useEffect(() => {
    fetchAbastecimentos();
    fetchPostos();
  }, []);

  const handleNovoAbastecimento = () => {
    router.push('/combustivel/novo');
  };

  const handleVerHistorico = () => {
    router.push('/combustivel/historico');
  };

  const handleVerPostos = () => {
    router.push('/combustivel/postos');
  };

  const renderAbastecimentoItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.abastecimentoItem}>
      <View style={styles.abastecimentoHeader}>
        <MaterialIcons 
          name="local-gas-station" 
          size={24} 
          color={item.tipoCombustivel === 'gasolina' ? '#4CAF50' : '#FF9800'} 
        />
        <View style={styles.abastecimentoInfo}>
          <Text style={styles.postoNome}>{item.postoNames}</Text>
          <Text style={styles.abastecimentoData}>{item.data}</Text>
        </View>
        <View style={styles.abastecimentoValores}>
          <Text style={styles.litros}>{item.litros}L</Text>
          <Text style={styles.valor}>R$ {item.valorTotal.toFixed(2)}</Text>
        </View>
      </View>
      <View style={styles.abastecimentoDetalhes}>
        <Text style={styles.kmInfo}>KM: {item.kmAtual}</Text>
        <Text style={styles.precoLitro}>R$ {item.precoLitro.toFixed(3)}/L</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#4CAF50", "#2E7D32"]} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Combustível</Text>
          <Text style={styles.headerSubtitle}>Gerencie seus abastecimentos</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleNovoAbastecimento}>
          <MaterialIcons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Resumo Geral */}
      <View style={styles.resumoCard}>
        <Text style={styles.cardTitle}>Resumo do Mês</Text>
        <View style={styles.resumoGrid}>
          <View style={styles.resumoItem}>
            <MaterialIcons name="local-gas-station" size={24} color="#4CAF50" />
            <Text style={styles.resumoValor}>{resumo.totalAbastecimentos}</Text>
            <Text style={styles.resumoLabel}>Abastecimentos</Text>
          </View>
          <View style={styles.resumoItem}>
            <MaterialIcons name="attach-money" size={24} color="#FF9800" />
            <Text style={styles.resumoValor}>R$ {resumo.totalGasto.toFixed(2)}</Text>
            <Text style={styles.resumoLabel}>Total Gasto</Text>
          </View>
          <View style={styles.resumoItem}>
            <MaterialIcons name="speed" size={24} color="#2196F3" />
            <Text style={styles.resumoValor}>{resumo.mediaConsumo.toFixed(1)}</Text>
            <Text style={styles.resumoLabel}>Km/L</Text>
          </View>
          <View style={styles.resumoItem}>
            <MaterialIcons name="trending-up" size={24} color="#9C27B0" />
            <Text style={styles.resumoValor}>R$ {resumo.custoKm.toFixed(2)}</Text>
            <Text style={styles.resumoLabel}>Custo/Km</Text>
          </View>
        </View>
      </View>

      {/* Gráfico de Consumo */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.cardTitle}>Consumo por Período</Text>
          <View style={styles.periodSelector}>
            <TouchableOpacity 
              style={[styles.periodBtn, selectedPeriod === 'semana' && styles.periodBtnActive]}
              onPress={() => setSelectedPeriod('semana')}
            >
              <Text style={[styles.periodText, selectedPeriod === 'semana' && styles.periodTextActive]}>Semana</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.periodBtn, selectedPeriod === 'mes' && styles.periodBtnActive]}
              onPress={() => setSelectedPeriod('mes')}
            >
              <Text style={[styles.periodText, selectedPeriod === 'mes' && styles.periodTextActive]}>Mês</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.periodBtn, selectedPeriod === 'ano' && styles.periodBtnActive]}
              onPress={() => setSelectedPeriod('ano')}
            >
              <Text style={[styles.periodText, selectedPeriod === 'ano' && styles.periodTextActive]}>Ano</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.chartPlaceholder}>
          <MaterialIcons name="bar-chart" size={48} color="#ccc" />
          <Text style={styles.chartPlaceholderText}>Gráfico de Consumo</Text>
          <Text style={styles.chartPlaceholderSubtext}>Em desenvolvimento</Text>
        </View>
      </View>

      {/* Ações Rápidas */}
      <View style={styles.acoesCard}>
        <Text style={styles.cardTitle}>Ações Rápidas</Text>
        <View style={styles.acoesGrid}>
          <TouchableOpacity style={styles.acaoBtn} onPress={handleNovoAbastecimento}>
            <MaterialIcons name="add-circle" size={32} color="#4CAF50" />
            <Text style={styles.acaoText}>Novo Abastecimento</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.acaoBtn} onPress={handleVerHistorico}>
            <MaterialIcons name="history" size={32} color="#2196F3" />
            <Text style={styles.acaoText}>Ver Histórico</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.acaoBtn} onPress={handleVerPostos}>
            <MaterialIcons name="local-gas-station" size={32} color="#FF9800" />
            <Text style={styles.acaoText}>Postos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.acaoBtn} onPress={() => Alert.alert('Em desenvolvimento', 'Funcionalidade em breve!')}>
            <MaterialIcons name="analytics" size={32} color="#9C27B0" />
            <Text style={styles.acaoText}>Relatórios</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Últimos Abastecimentos */}
      <View style={styles.historicoCard}>
        <View style={styles.historicoHeader}>
          <Text style={styles.cardTitle}>Últimos Abastecimentos</Text>
          <TouchableOpacity onPress={handleVerHistorico}>
            <Text style={styles.verTodosText}>Ver todos</Text>
          </TouchableOpacity>
        </View>
        {(!abastecimentos || !Array.isArray(abastecimentos) || abastecimentos.length === 0) ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="local-gas-station" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>Nenhum abastecimento registrado</Text>
            <TouchableOpacity style={styles.emptyStateBtn} onPress={handleNovoAbastecimento}>
              <Text style={styles.emptyStateBtnText}>Adicionar Primeiro Abastecimento</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={abastecimentos.slice(0, 5)}
            keyExtractor={(item) => item.id}
            renderItem={renderAbastecimentoItem}
            scrollEnabled={false}
          />
        )}
      </View>

      {/* Próximo Abastecimento Sugerido */}
      {resumo.proximoAbastecimento && (
        <View style={styles.sugestaoCard}>
          <Text style={styles.cardTitle}>Próximo Abastecimento Sugerido</Text>
          <View style={styles.sugestaoContent}>
            <MaterialIcons name="lightbulb" size={24} color="#FFC107" />
            <View style={styles.sugestaoInfo}>
              <Text style={styles.sugestaoText}>
                Baseado no seu consumo médio, sugere-se abastecer em aproximadamente{' '}
                <Text style={styles.sugestaoKm}>{resumo.proximoAbastecimento.kmRestante} km</Text>
              </Text>
              <Text style={styles.sugestaoSubtext}>
                KM atual: {resumo.proximoAbastecimento.kmAtual} | 
                Autonomia: {resumo.proximoAbastecimento.autonomia} km
              </Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resumoCard: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  resumoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resumoItem: {
    alignItems: 'center',
    flex: 1,
  },
  resumoValor: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  resumoLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  chartCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
  },
  periodBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  periodBtnActive: {
    backgroundColor: '#4CAF50',
  },
  periodText: {
    fontSize: 12,
    color: '#666',
  },
  periodTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  chartPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  chartPlaceholderText: {
    fontSize: 16,
    color: '#999',
    marginTop: 8,
  },
  chartPlaceholderSubtext: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 4,
  },
  acoesCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  acoesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  acaoBtn: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  acaoText: {
    fontSize: 12,
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  historicoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  historicoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  verTodosText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
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
  abastecimentoItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  abastecimentoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  abastecimentoInfo: {
    flex: 1,
    marginLeft: 12,
  },
  postoNome: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  abastecimentoData: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  abastecimentoValores: {
    alignItems: 'flex-end',
  },
  litros: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  valor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },
  abastecimentoDetalhes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  kmInfo: {
    fontSize: 12,
    color: '#666',
  },
  precoLitro: {
    fontSize: 12,
    color: '#666',
  },
  sugestaoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sugestaoContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  sugestaoInfo: {
    flex: 1,
    marginLeft: 12,
  },
  sugestaoText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  sugestaoKm: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  sugestaoSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
}); 