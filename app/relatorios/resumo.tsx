import { Ionicons } from '@expo/vector-icons';
import { differenceInDays, endOfDay, endOfMonth, format, startOfDay, startOfMonth, subMonths } from 'date-fns';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Button, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useFinancasStore } from '../../store/financasStore';
import { useCombustivelStore } from '../../stores/combustivelStore';

const TABS = ["Geral", "Abastecimento", "Despesa", "Receita"];

const capitalizar = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

// Componente para a aba de Abastecimento
const AbastecimentoTab = ({ period }: { period: { startDate: Date, endDate: Date } }) => {
  const abastecimentos = useCombustivelStore(state => state.abastecimentos);
  const loading = useCombustivelStore(state => state.loading);

  const dadosRelatorio = useMemo(() => {
    const abastecimentosFiltrados = abastecimentos
      .filter(a => {
        const dataAbastecimento = new Date(a.data);
        return dataAbastecimento >= period.startDate && dataAbastecimento <= period.endDate;
      })
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

    if (abastecimentosFiltrados.length < 2) {
      return null;
    }

    let custoTotal = 0;
    let volumeTotal = 0;
    let distanciaTotal = 0;
    const mediasConsumo: number[] = [];
    const relatoriosPorCombustivel: { [key: string]: { custo: number, volume: number, distancia: number, medias: number[] } } = {};

    for (let i = 1; i < abastecimentosFiltrados.length; i++) {
      const atual = abastecimentosFiltrados[i];
      const anterior = abastecimentosFiltrados[i-1];
      
      const distancia = atual.kmAtual - anterior.kmAtual;
      if (distancia <= 0) continue;

      distanciaTotal += distancia;
      custoTotal += atual.valorTotal;
      volumeTotal += atual.litros;
      const media = distancia / atual.litros;
      mediasConsumo.push(media);

      const tipo = capitalizar(atual.tipoCombustivel);
      if (!relatoriosPorCombustivel[tipo]) {
        relatoriosPorCombustivel[tipo] = { custo: 0, volume: 0, distancia: 0, medias: [] };
      }
      relatoriosPorCombustivel[tipo].custo += atual.valorTotal;
      relatoriosPorCombustivel[tipo].volume += atual.litros;
      relatoriosPorCombustivel[tipo].distancia += distancia;
      relatoriosPorCombustivel[tipo].medias.push(media);
    }

    const diasNoPeriodo = differenceInDays(period.endDate, period.startDate) + 1;
    const custoPorDia = custoTotal / diasNoPeriodo;
    const custoPorKm = custoTotal / distanciaTotal;
    const mediaGeral = distanciaTotal / volumeTotal;
    
    const ultimaMedia = mediasConsumo[mediasConsumo.length - 1];
    const maiorMedia = Math.max(...mediasConsumo);
    const menorMedia = Math.min(...mediasConsumo);

    return {
      numRegistros: abastecimentosFiltrados.length,
      custoTotal,
      custoPorDia,
      custoPorKm,
      volumeTotal,
      mediaGeral,
      ultimaMedia,
      maiorMedia,
      menorMedia,
      relatoriosPorCombustivel
    };
  }, [abastecimentos, period]);

  if (loading) return <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }}/>;
  if (!dadosRelatorio) return <Text style={styles.emptyText}>Dados insuficientes para gerar relatório de abastecimento.</Text>;

  const { numRegistros, custoTotal, custoPorDia, custoPorKm, volumeTotal, mediaGeral, ultimaMedia, maiorMedia, menorMedia, relatoriosPorCombustivel } = dadosRelatorio;

  return (
    <View style={styles.tabContent}>
      <Text style={styles.periodoLabel}>
        {numRegistros} registros ({format(period.startDate, 'dd/MM/yyyy')} - {format(period.endDate, 'dd/MM/yyyy')})
      </Text>

      {/* Custo */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Custo</Text>
        <View style={styles.row}>
          <Metric label="Total" value={`R$ ${custoTotal.toFixed(2)}`} />
          <Metric label="Por dia" value={`R$ ${custoPorDia.toFixed(2)}`} />
          <Metric label="Por km" value={`R$ ${custoPorKm.toFixed(2)}`} />
        </View>
      </View>

      {/* Combustível */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Combustível</Text>
         <View style={styles.row}>
          <Metric label="Volume total" value={`${volumeTotal.toFixed(2)} L`} />
          <Metric label="Média geral" value={`${mediaGeral.toFixed(2)} km/L`} />
        </View>
        <View style={[styles.row, { marginTop: 16 }]}>
            <Metric label="ÚLTIMA" value={`${ultimaMedia.toFixed(2)} km/L`} />
            <Metric label="MAIOR" value={`${maiorMedia.toFixed(2)} km/L`} color="#4CAF50" />
            <Metric label="MENOR" value={`${menorMedia.toFixed(2)} km/L`} color="#F44336" />
        </View>
      </View>

      {/* Por Combustível */}
      {Object.entries(relatoriosPorCombustivel).map(([tipo, dados]) => (
        <View style={styles.card} key={tipo}>
          <Text style={styles.cardTitle}>{tipo}</Text>
          <View style={styles.row}>
            <Metric label="Custo total" value={`R$ ${dados.custo.toFixed(2)}`} />
            <Metric label="Volume total" value={`${dados.volume.toFixed(2)} L`} />
          </View>
           <View style={[styles.row, { marginTop: 16 }]}>
            <Metric label="ÚLTIMA" value={`${dados.medias[dados.medias.length - 1].toFixed(2)} km/L`} />
            <Metric label="MÉDIA" value={`${(dados.distancia / dados.volume).toFixed(2)} km/L`} />
          </View>
        </View>
      ))}
    </View>
  );
};

// Componente para a aba de Despesas
const DespesaTab = ({ period }: { period: { startDate: Date, endDate: Date } }) => {
  const { transacoes, fetchTransacoes, loading } = useFinancasStore(state => ({
    transacoes: state.transacoes,
    fetchTransacoes: state.fetchTransacoes,
    loading: state.loading,
  }));

  useEffect(() => {
    fetchTransacoes({
      tipo: 'despesa',
      dataInicio: format(period.startDate, 'yyyy-MM-dd'),
      dataFim: format(period.endDate, 'yyyy-MM-dd'),
    });
  }, [period, fetchTransacoes]);

  const dadosRelatorio = useMemo(() => {
    if (transacoes.length === 0) return null;

    const despesas = transacoes.filter(t => t.tipo === 'despesa');
    const totalDespesas = despesas.reduce((acc, t) => acc + t.valor, 0);
    const qtdDespesas = despesas.length;
    const mediaDespesas = qtdDespesas > 0 ? totalDespesas / qtdDespesas : 0;
    
    const porCategoria = despesas.reduce((acc, t) => {
      const categoria = t.categoria?.nome || 'Sem Categoria';
      acc[categoria] = (acc[categoria] || 0) + t.valor;
      return acc;
    }, {} as Record<string, number>);

    return { totalDespesas, qtdDespesas, mediaDespesas, porCategoria };
  }, [transacoes]);

  if (loading) return <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }}/>;
  if (!dadosRelatorio) return <Text style={styles.emptyText}>Nenhuma despesa encontrada no período.</Text>;
  
  const { totalDespesas, qtdDespesas, mediaDespesas, porCategoria } = dadosRelatorio;

  return (
    <View style={styles.tabContent}>
       <Text style={styles.periodoLabel}>
        {qtdDespesas} despesas ({format(period.startDate, 'dd/MM/yyyy')} - {format(period.endDate, 'dd/MM/yyyy')})
      </Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Resumo das Despesas</Text>
        <View style={styles.row}>
          <Metric label="Total Gasto" value={`R$ ${totalDespesas.toFixed(2)}`} color="#F44336" />
          <Metric label="Quantidade" value={`${qtdDespesas}`} />
          <Metric label="Valor Médio" value={`R$ ${mediaDespesas.toFixed(2)}`} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Despesas por Categoria</Text>
        {Object.entries(porCategoria).sort(([, a], [, b]) => b - a).map(([categoria, valor]) => (
          <View key={categoria} style={styles.categoriaRow}>
            <Text style={styles.categoriaNome}>{categoria}</Text>
            <Text style={styles.categoriaValor}>R$ {valor.toFixed(2)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// Componente para a aba de Receitas
const ReceitaTab = ({ period }: { period: { startDate: Date, endDate: Date } }) => {
  const { transacoes, fetchTransacoes, loading } = useFinancasStore(state => ({
    transacoes: state.transacoes,
    fetchTransacoes: state.fetchTransacoes,
    loading: state.loading,
  }));

  useEffect(() => {
    fetchTransacoes({
      tipo: 'receita',
      dataInicio: format(period.startDate, 'yyyy-MM-dd'),
      dataFim: format(period.endDate, 'yyyy-MM-dd'),
    });
  }, [period, fetchTransacoes]);

  const dadosRelatorio = useMemo(() => {
    if (transacoes.length === 0) return null;

    const receitas = transacoes.filter(t => t.tipo === 'receita');
    const totalReceitas = receitas.reduce((acc, t) => acc + t.valor, 0);
    const qtdReceitas = receitas.length;
    const mediaReceitas = qtdReceitas > 0 ? totalReceitas / qtdReceitas : 0;
    
    const porCategoria = receitas.reduce((acc, t) => {
      const categoria = t.categoria?.nome || 'Sem Categoria';
      acc[categoria] = (acc[categoria] || 0) + t.valor;
      return acc;
    }, {} as Record<string, number>);

    return { totalReceitas, qtdReceitas, mediaReceitas, porCategoria };
  }, [transacoes]);

  if (loading) return <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }}/>;
  if (!dadosRelatorio) return <Text style={styles.emptyText}>Nenhuma receita encontrada no período.</Text>;
  
  const { totalReceitas, qtdReceitas, mediaReceitas, porCategoria } = dadosRelatorio;

  return (
    <View style={styles.tabContent}>
       <Text style={styles.periodoLabel}>
        {qtdReceitas} receitas ({format(period.startDate, 'dd/MM/yyyy')} - {format(period.endDate, 'dd/MM/yyyy')})
      </Text>
      
      <View style={styles.card}>
        <Text style={[styles.cardTitle, {color: '#4CAF50'}]}>Resumo das Receitas</Text>
        <View style={styles.row}>
          <Metric label="Total Recebido" value={`R$ ${totalReceitas.toFixed(2)}`} color="#4CAF50" />
          <Metric label="Quantidade" value={`${qtdReceitas}`} />
          <Metric label="Valor Médio" value={`R$ ${mediaReceitas.toFixed(2)}`} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={[styles.cardTitle, {color: '#4CAF50'}]}>Receitas por Categoria</Text>
        {Object.entries(porCategoria).sort(([, a], [, b]) => b - a).map(([categoria, valor]) => (
          <View key={categoria} style={styles.categoriaRow}>
            <Text style={styles.categoriaNome}>{categoria}</Text>
            <Text style={[styles.categoriaValor, {color: '#4CAF50'}]}>R$ {valor.toFixed(2)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// Componente para a aba Geral
const GeralTab = ({ period }: { period: { startDate: Date, endDate: Date } }) => {
  const { resumos, fetchResumos, loading } = useFinancasStore(state => ({
    resumos: state.resumos,
    fetchResumos: state.fetchResumos,
    loading: state.loading,
  }));

  useEffect(() => {
    fetchResumos({
      dataInicio: format(period.startDate, 'yyyy-MM-dd'),
      dataFim: format(period.endDate, 'yyyy-MM-dd'),
    });
  }, [period, fetchResumos]);

  if (loading) return <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }}/>;
  if (!resumos) return <Text style={styles.emptyText}>Não há dados para o resumo geral.</Text>;
  
  const { receitas, despesas, saldo, porCategoria } = resumos;

  const despesasCategorias = Object.entries(porCategoria)
    .filter(([key]) => key.startsWith('despesa_'))
    .sort(([, a], [, b]) => b - a);

  const receitasCategorias = Object.entries(porCategoria)
    .filter(([key]) => key.startsWith('receita_'))
    .sort(([, a], [, b]) => b - a);

  return (
    <View style={styles.tabContent}>
      <Text style={styles.periodoLabel}>
        Resumo de {format(period.startDate, 'dd/MM/yyyy')} a {format(period.endDate, 'dd/MM/yyyy')}
      </Text>
      
      <View style={styles.card}>
        <Text style={[styles.cardTitle, {color: '#007AFF'}]}>Balanço Financeiro</Text>
        <View style={styles.row}>
          <Metric label="Receitas" value={`R$ ${receitas.toFixed(2)}`} color="#4CAF50" />
          <Metric label="Despesas" value={`R$ ${despesas.toFixed(2)}`} color="#F44336" />
          <Metric label="Saldo" value={`R$ ${saldo.toFixed(2)}`} color={saldo >= 0 ? '#4CAF50' : '#F44336'} />
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.card, {flex: 1, marginRight: 8}]}>
          <Text style={[styles.cardTitle, {color: '#4CAF50'}]}>Principais Receitas</Text>
          {receitasCategorias.length > 0 ? receitasCategorias.map(([categoria, valor]) => (
            <View key={categoria} style={styles.categoriaRow}>
              <Text style={styles.categoriaNome}>{categoria.replace('receita_', '')}</Text>
              <Text style={[styles.categoriaValor, {color: '#4CAF50'}]}>R$ {valor.toFixed(2)}</Text>
            </View>
          )) : <Text style={styles.emptyText}>Nenhuma receita</Text>}
        </View>
        <View style={[styles.card, {flex: 1, marginLeft: 8}]}>
          <Text style={[styles.cardTitle, {color: '#F44336'}]}>Principais Despesas</Text>
          {despesasCategorias.length > 0 ? despesasCategorias.map(([categoria, valor]) => (
            <View key={categoria} style={styles.categoriaRow}>
              <Text style={styles.categoriaNome}>{categoria.replace('despesa_', '')}</Text>
              <Text style={styles.categoriaValor}>R$ {valor.toFixed(2)}</Text>
            </View>
          )) : <Text style={styles.emptyText}>Nenhuma despesa</Text>}
        </View>
      </View>
    </View>
  );
};

const Metric = ({ label, value, color = '#333' }: { label: string; value: string; color?: string }) => (
  <View style={styles.metric}>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={[styles.metricValue, { color }]}>{value}</Text>
  </View>
);

export default function RelatoriosResumoScreen() {
  const [activeTab, setActiveTab] = useState(TABS[1]);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  
  // Estados para o filtro customizado
  const [customStartDate, setCustomStartDate] = useState(new Date());
  const [customEndDate, setCustomEndDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [datePickerFor, setDatePickerFor] = useState<'start' | 'end'>('start');

  const [period, setPeriod] = useState({
    startDate: startOfMonth(new Date()),
    endDate: endOfDay(new Date()),
  });

  const fetchAbastecimentos = useCombustivelStore(state => state.fetchAbastecimentos);
  const fetchResumosFinanceiros = useFinancasStore(state => state.fetchResumos);

  useEffect(() => {
    fetchAbastecimentos();
  }, [fetchAbastecimentos]);

  const handleSetPeriod = (start: Date, end: Date) => {
    setPeriod({ startDate: startOfDay(start), endDate: endOfDay(end) });
    setIsFilterVisible(false);
  };
  
  const showDatePicker = (pickerFor: 'start' | 'end') => {
    setDatePickerFor(pickerFor);
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirmDate = (date: Date) => {
    if (datePickerFor === 'start') {
      setCustomStartDate(date);
    } else {
      setCustomEndDate(date);
    }
    hideDatePicker();
  };

  const applyCustomPeriod = () => {
    handleSetPeriod(customStartDate, customEndDate);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Abastecimento":
        return <AbastecimentoTab period={period} />;
      case "Despesa":
        return <DespesaTab period={period} />;
      case "Receita":
        return <ReceitaTab period={period} />;
      case "Geral":
      default:
        return <GeralTab period={period} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Relatórios</Text>
        <TouchableOpacity onPress={() => setIsFilterVisible(true)}>
          <Ionicons name="filter" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabItem, activeTab === tab && styles.activeTabItem]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView>
        {renderContent()}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isFilterVisible}
        onRequestClose={() => setIsFilterVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setIsFilterVisible(false)}>
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Filtrar Período</Text>
            
            {/* Opções Predefinidas */}
            <TouchableOpacity style={styles.modalOption} onPress={() => handleSetPeriod(startOfMonth(new Date()), new Date())}>
              <Text style={styles.modalOptionText}>Este Mês</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={() => {
              const lastMonth = subMonths(new Date(), 1);
              handleSetPeriod(startOfMonth(lastMonth), endOfMonth(lastMonth));
            }}>
              <Text style={styles.modalOptionText}>Mês Passado</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={() => handleSetPeriod(subMonths(new Date(), 3), new Date())}>
              <Text style={styles.modalOptionText}>Últimos 3 Meses</Text>
            </TouchableOpacity>

            {/* Período Customizado */}
            <View style={styles.customPeriodContainer}>
              <Text style={styles.customPeriodTitle}>Período Customizado</Text>
              <View style={styles.datePickerRow}>
                <TouchableOpacity onPress={() => showDatePicker('start')} style={styles.datePickerInput}>
                  <Text>De: {format(customStartDate, 'dd/MM/yy')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => showDatePicker('end')} style={styles.datePickerInput}>
                  <Text>Até: {format(customEndDate, 'dd/MM/yy')}</Text>
                </TouchableOpacity>
              </View>
              <Button title="Aplicar Período" onPress={applyCustomPeriod} />
            </View>

            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setIsFilterVisible(false)}>
              <Text style={styles.modalCloseButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmDate}
        onCancel={hideDatePicker}
        date={datePickerFor === 'start' ? customStartDate : customEndDate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7f9',
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabItem: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  tabContent: {
    padding: 16,
  },
  periodoLabel: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 16,
    fontSize: 13,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF8C00',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  metric: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    color: '#888',
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#888',
  },
  // Estilos do Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    alignItems: 'stretch',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalCloseButton: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalOptionText: {
    fontSize: 16,
  },
  customPeriodContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  customPeriodTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
    color: '#555',
  },
  datePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  datePickerInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
  },
  categoriaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoriaNome: {
    fontSize: 16,
    color: '#333',
  },
  categoriaValor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F44336',
  },
}); 