import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useFinancasStore } from '@/store/financasStore';
import { useJornadaStore } from '@/store/jornadaStore';
import { useCombustivelStore } from '@/stores/combustivelStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

// PieChartPlaceholder definido fora do componente
const PieChartPlaceholder: React.FC<{ data: { key: string; value: number; color: string }[] }> = ({ data }) => (
  <View style={{ alignItems: 'center', justifyContent: 'center', height: 160 }}>
    <Text style={{ color: '#888' }}>[Gráfico de Pizza aqui]</Text>
    {data.map((cat, i) => (
      <View key={cat.key} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
        <View style={{ width: 12, height: 12, backgroundColor: cat.color, borderRadius: 6, marginRight: 4 }} />
        <Text>{cat.key}: R$ {cat.value.toFixed(2)}</Text>
      </View>
    ))}
  </View>
);

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Hooks das stores - todos no top level
  const { jornadaAtiva, iniciar: iniciarJornada, finalizar: finalizarJornada } = useJornadaStore();
  const { resumos: resumoFinanceiro, fetchResumos: fetchFinanceiro, loading: loadingFinancas, transacoes, fetchTransacoes } = useFinancasStore();
  const { resumo: resumoCombustivel, fetchAbastecimentos, loading: loadingCombustivel } = useCombustivelStore();
  
  // Estado de loading combinado
  const loading = loadingFinancas || loadingCombustivel;

  // Estado de data selecionada
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // Função para mudar a data
  const changeDate = (direction: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + direction);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  // Efeito para carregar dados
  useEffect(() => {
    fetchFinanceiro({ dataInicio: selectedDate, dataFim: selectedDate });
    fetchAbastecimentos();
    fetchTransacoes();
  }, [selectedDate]);

  // Dados do gráfico de pizza
  const pieData = useMemo(() => {
    if (!resumoFinanceiro?.porCategoria) return [];
    return Object.entries(resumoFinanceiro.porCategoria).map(([nome, total], index) => ({
      value: total as number,
      color: ["#2ecc71", "#e74c3c", "#3498db", "#f39c12", "#9b59b6"][index % 5],
      key: nome,
    }));
  }, [resumoFinanceiro]);

  // Formatação de data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Função de refresh
  const onRefresh = () => {
    fetchFinanceiro({ dataInicio: selectedDate, dataFim: selectedDate });
    fetchAbastecimentos();
    fetchTransacoes();
  };

  return (
      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background }]}
        refreshControl={
        <RefreshControl refreshing={loading} onRefresh={onRefresh} />
      }
    >
      {/* Seletor de Data */}
      <PanGestureHandler>
        <Animated.View style={[styles.dateSelector, { backgroundColor: colors.card }]}>
          <TouchableOpacity onPress={() => changeDate(-1)}>
            <Ionicons name="chevron-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.dateText, { color: colors.text }]}>
            {formatDate(selectedDate)}
          </Text>
          <TouchableOpacity onPress={() => changeDate(1)}>
            <Ionicons name="chevron-forward" size={24} color={colors.primary} />
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>

      {/* Status da Jornada */}
      <View style={[styles.jornadaCard, { backgroundColor: colors.card }]}>
        <View style={styles.jornadaHeader}>
          <Ionicons 
            name={jornadaAtiva ? "car" : "car-outline"} 
            size={24} 
            color={jornadaAtiva ? colors.success : colors.textSecondary} 
          />
          <Text style={[styles.jornadaTitle, { color: colors.text }]}>
            {jornadaAtiva ? 'Jornada Ativa' : 'Jornada Inativa'}
          </Text>
          </View>
        
        {jornadaAtiva ? (
          <TouchableOpacity 
            style={[styles.jornadaButton, { backgroundColor: colors.error }]}
            onPress={() => finalizarJornada()}
          >
            <Text style={[styles.jornadaButtonText, { color: colors.background }]}>
              Finalizar Jornada
            </Text>
          </TouchableOpacity>
        ) : (
              <TouchableOpacity 
            style={[styles.jornadaButton, { backgroundColor: colors.success }]}
            onPress={() => iniciarJornada && iniciarJornada({})}
          >
            <Text style={[styles.jornadaButtonText, { color: colors.background }]}>
              Iniciar Jornada
                </Text>
              </TouchableOpacity>
        )}
            </View>

      {/* Resumo Financeiro */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Resumo Financeiro</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loading} />
        ) : (
          <View style={styles.financialSummary}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Receitas</Text>
                <Text style={[styles.summaryValue, { color: colors.success }]}>R$ {resumoFinanceiro?.receitas?.toFixed(2) || '0,00'}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Despesas</Text>
                <Text style={[styles.summaryValue, { color: colors.error }]}>R$ {resumoFinanceiro?.despesas?.toFixed(2) || '0,00'}</Text>
              </View>
            </View>
            
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Saldo</Text>
                <Text style={[
                  styles.summaryValue, 
                  { color: (resumoFinanceiro?.saldo || 0) >= 0 ? colors.success : colors.error }
                ]}>
                  R$ {resumoFinanceiro?.saldo?.toFixed(2) || '0,00'}
                </Text>
              </View>
            </View>

            {/* Gráfico de Pizza */}
            {pieData.length > 0 && (
              <View style={styles.chartContainer}>
                <Text style={[styles.chartTitle, { color: colors.text }]}>Gastos por Categoria</Text>
                <PieChartPlaceholder data={pieData} />
              </View>
            )}
          </View>
        )}
      </View>

      {/* Resumo de Combustível */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Combustível</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loading} />
        ) : (
          <View style={styles.fuelSummary}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Gasto</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>R$ {resumoCombustivel?.totalGasto?.toFixed(2) || '0,00'}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Litros</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}> {resumoCombustivel?.totalLitros?.toFixed(2) || '0,00'}L</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Ações Rápidas */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Ações Rápidas</Text>
        
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/financas/nova-transacao')}
          >
            <Ionicons name="add" size={24} color={colors.background} />
            <Text style={[styles.actionButtonText, { color: colors.background }]}>
              Nova Transação
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/combustivel/novo')}
          >
            <Ionicons name="car" size={24} color={colors.background} />
            <Text style={[styles.actionButtonText, { color: colors.background }]}>
              Abastecer
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/agenda/novo')}
          >
            <Ionicons name="calendar" size={24} color={colors.background} />
            <Text style={[styles.actionButtonText, { color: colors.background }]}>
              Agendar
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Transações Recentes */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Transações Recentes</Text>
          <TouchableOpacity onPress={() => router.push('/financas')}>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>Ver todas</Text>
          </TouchableOpacity>
        </View>
        
        {transacoes && transacoes.length > 0 ? (
          <FlatList
            data={transacoes.slice(0, 5)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={[styles.transactionItem, { borderBottomColor: colors.border }]}>
                <View style={styles.transactionInfo}>
                  <Text style={[styles.transactionTitle, { color: colors.text }]}>
                    {item.titulo || item.categoria?.nome}
                  </Text>
                  <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>
                    {new Date(item.data).toLocaleDateString('pt-BR')}
                  </Text>
                </View>
                <Text style={[
                  styles.transactionAmount,
                  { color: item.tipo === 'receita' ? colors.success : colors.error }
                ]}>
                  {item.tipo === 'receita' ? '+' : '-'}R$ {item.valor.toFixed(2)}
                </Text>
              </View>
            )}
            scrollEnabled={false}
          />
        ) : (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Nenhuma transação encontrada
          </Text>
        )}
    </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    flex: 1,
  },
  jornadaCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  jornadaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  jornadaTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  jornadaButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  jornadaButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loading: {
    marginVertical: 20,
  },
  financialSummary: {
    gap: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  chartContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  chart: {
    height: 160,
    width: 160,
  },
  fuelSummary: {
    gap: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    gap: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: 14,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginVertical: 20,
  },
});
