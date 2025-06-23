import FloatingFuelButton from '@/components/FloatingFuelButton';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import '@/services/databaseService';
import { MaterialIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFinancasStore } from '../../store/financasStore';

// Tipos
type Transaction = {
  id: string;
  tipo: 'receita' | 'despesa';
  titulo: string;
  valor: number;
  data: string;
  categoria?: {
    nome: string;
    icone: any; // Ajustado para aceitar qualquer nome de ícone
    cor: string;
  };
  metodoPagamento: string;
};

type Resumos = {
  receitas: number;
  despesas: number;
  saldo: number;
};

// Componente Header
const FinancasHeader = ({ onAdd }: { onAdd: () => void }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.header, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.text }]}>Financeiro</Text>
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.tint }]}
        onPress={onAdd}
      >
        <MaterialIcons name="add" size={24} color={colors.card} />
      </TouchableOpacity>
    </View>
  );
};

// Componente Resumo
const ResumoCard = ({ label, valor, cor }: { label: string; valor: number; cor: string }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.resumoCard, { backgroundColor: colors.card }]}>
      <Text style={[styles.resumoLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.resumoValor, { colors }]}>
        R$ {valor.toFixed(2)}
      </Text>
    </View>
  );
};

// Componente Item da Transação
const TransactionItem = ({ item, onPress }: { item: Transaction; onPress: () => void }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isReceita = item.tipo === 'receita';

  return (
    <TouchableOpacity
      style={[styles.transacaoItem, { backgroundColor: colors.card }]}
      onPress={onPress}
    >
      <View style={[styles.transacaoIconContainer, { backgroundColor: item.categoria?.cor || colors.backgroundMuted }]}>
        <MaterialIcons
          name={item.categoria?.icone || 'receipt'}
          size={24}
          color="#fff"
        />
      </View>
      <View style={styles.transacaoInfo}>
        <Text style={[styles.transacaoTitulo, { color: colors.text }]}>{item.titulo}</Text>
        <Text style={[styles.transacaoDetalhe, { color: colors.textMuted }]}>{item.categoria?.nome}</Text>
      </View>
      <View style={styles.transacaoValor}>
        <Text style={[styles.valorText, { color: isReceita ? colors.success : colors.error }]}>
          {isReceita ? '+' : '-'} R$ {item.valor.toFixed(2)}
        </Text>
        <Text style={[styles.transacaoDetalhe, { color: colors.textMuted }]}>{new Date(item.data).toLocaleDateString('pt-BR')}</Text>
      </View>
    </TouchableOpacity>
  );
};

const TABS = [
  { key: 'todas', label: 'Todas' },
  { key: 'receitas', label: 'Receitas' },
  { key: 'despesas', label: 'Despesas' },
];

export default function FinancasIndexScreen() {
  const { transacoes, fetchTransacoes, loading } = useFinancasStore();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [tab, setTab] = useState('todas');

  useEffect(() => {
    fetchTransacoes();
  }, []);

  const transacoesFiltradas = useMemo(() => {
    if (tab === 'receitas') return transacoes.filter(t => t.tipo === 'receita');
    if (tab === 'despesas') return transacoes.filter(t => t.tipo === 'despesa');
    return transacoes;
  }, [transacoes, tab]);

  const resumos: Resumos = useMemo(() => {
    const receitas = transacoes.filter(t => t.tipo === 'receita').reduce((sum, t) => sum + t.valor, 0);
    const despesas = transacoes.filter(t => t.tipo === 'despesa').reduce((sum, t) => sum + t.valor, 0);
    return { receitas, despesas, saldo: receitas - despesas };
  }, [transacoes]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Financeiro',
          headerLargeTitle: true,
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/financas/nova-transacao')} style={{ marginRight: 15 }}>
              <MaterialIcons name="add" size={28} color={colors.tint} />
            </TouchableOpacity>
          ),
          headerStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
          headerTintColor: colors.text,
        }}
      />

      {/* Resumos */}
      <View style={styles.resumosContainer}>
        <ResumoCard label="Receitas" valor={resumos.receitas} cor={colors.success} />
        <ResumoCard label="Despesas" valor={resumos.despesas} cor={colors.error} />
        <ResumoCard label="Saldo" valor={resumos.saldo} cor={resumos.saldo >= 0 ? colors.success : colors.error} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { borderBottomColor: colors.border }]}>
        {TABS.map((tabItem) => (
          <TouchableOpacity
            key={tabItem.key}
            style={[styles.tab, { borderBottomColor: tab === tabItem.key ? colors.tint : 'transparent' }]}
            onPress={() => setTab(tabItem.key)}
          >
            <Text style={[styles.tabText, { color: tab === tabItem.key ? colors.tint : colors.textMuted }]}>
              {tabItem.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista de transações */}
      {loading ? (
        <ActivityIndicator size="large" color={colors.tint} style={{ marginTop: 50 }}/>
      ) : (
        <FlatList
          data={transacoesFiltradas}
          keyExtractor={(item) => item.id}
          renderItem={({item}) => <TransactionItem item={item as Transaction} onPress={() => router.push(`/financas/editar/${item.id}`)} />}
          contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="receipt" size={64} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>Nenhuma transação aqui</Text>
              <TouchableOpacity
                style={[styles.emptyButton, { backgroundColor: colors.tint }]}
                onPress={() => router.push('/financas/nova-transacao')}
              >
                <Text style={styles.emptyButtonText}>Adicionar primeira transação</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
      
      <FloatingFuelButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  title: { fontSize: 24, fontWeight: 'bold' },
  addButton: { 
    borderRadius: 25, 
    width: 50, 
    height: 50, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  resumosContainer: { 
    flexDirection: 'row', 
    padding: 10, 
    gap: 10,
  },
  resumoCard: { 
    flex: 1, 
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  resumoLabel: { fontSize: 14, marginBottom: 8 },
  resumoValor: { fontSize: 20, fontWeight: 'bold' },
  tabsContainer: { 
    flexDirection: 'row',
    marginHorizontal: 10,
    marginTop: 10,
    borderBottomWidth: 1,
  },
  tab: { 
    flex: 1, 
    paddingVertical: 12, 
    alignItems: 'center',
    borderBottomWidth: 2,
  },
  tabText: { fontSize: 14, fontWeight: 'bold' },
  transacaoItem: { 
    flexDirection: 'row', 
    padding: 12, 
    marginVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
  },
  transacaoIconContainer: {
    width: 45, 
    height: 45, 
    borderRadius: 22.5, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 12,
  },
  transacaoInfo: { flex: 1 },
  transacaoTitulo: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  transacaoDetalhe: { fontSize: 12 },
  transacaoValor: { alignItems: 'flex-end' },
  valorText: { fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  emptyContainer: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingTop: 80,
  },
  emptyText: { fontSize: 16, marginTop: 16, marginBottom: 24 },
  emptyButton: { 
    paddingHorizontal: 24, 
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: { color: '#fff', fontWeight: '600' },
});