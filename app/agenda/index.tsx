import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AgendaItem } from '../../components/agenda/AgendaItem';
import { useAgendaStore } from '../../store/agendaStore';
import FloatingFuelButton from '@/components/FloatingFuelButton';

const TABS = [
  { key: 'proximos', label: 'Próximos' },
  { key: 'passados', label: 'Passados' },
  { key: 'cancelados', label: 'Cancelados' },
];

// Tela principal da agenda: mostra calendário e lista de eventos do dia selecionado
export default function AgendaIndexScreen() {
  const { eventos, fetchEventos, selectedDate, setSelectedDate } = useAgendaStore();
  const router = useRouter();
  const [tab, setTab] = useState('proximos');

  useEffect(() => {
    fetchEventos();
  }, []);

  // Filtros
  const eventosFiltrados = useMemo(() => {
    const now = new Date();
    if (tab === 'proximos') {
      return eventos.filter(e => new Date(e.data + 'T' + e.hora) >= now && e.recorrente !== 'cancelado');
    }
    if (tab === 'passados') {
      return eventos.filter(e => new Date(e.data + 'T' + e.hora) < now && e.recorrente !== 'cancelado');
    }
    if (tab === 'cancelados') {
      return eventos.filter(e => e.recorrente === 'cancelado');
    }
    return eventos;
  }, [eventos, tab]);

  // Contadores
  const counts = useMemo(() => {
    const now = new Date();
    return {
      proximos: eventos.filter(e => new Date(e.data + 'T' + e.hora) >= now && e.recorrente !== 'cancelado').length,
      passados: eventos.filter(e => new Date(e.data + 'T' + e.hora) < now && e.recorrente !== 'cancelado').length,
      cancelados: eventos.filter(e => e.recorrente === 'cancelado').length,
    };
  }, [eventos]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Agenda</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/agenda/novo')}>
          <MaterialIcons name="add-circle" size={36} color="#007AFF" />
        </TouchableOpacity>
      </View>
      {/* Tabs de filtro */}
      <View style={styles.tabsRow}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}
            onPress={() => setTab(t.key)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabLabel, tab === t.key && styles.tabLabelActive]}>{t.label}</Text>
            <View style={[styles.tabCount, tab === t.key && styles.tabCountActive]}>
              <Text style={[styles.tabCountText, tab === t.key && styles.tabCountTextActive]}>{counts[t.key]}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      {/* Lista de eventos filtrados */}
      <FlatList
        data={eventosFiltrados}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <AgendaItem evento={item} />}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <MaterialIcons name="event-busy" size={64} color="#ccc" style={{ marginBottom: 8 }} />
            <Text style={styles.empty}>Nenhum compromisso nesta categoria.</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 80 }}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/agenda/novo')}
        activeOpacity={0.8}
      >
        <MaterialIcons name="add" size={32} color="#fff" />
      </TouchableOpacity>
      
      {/* Botão Flutuante de Combustível */}
      <FloatingFuelButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 0, backgroundColor: '#f7f9fb' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingBottom: 0 },
  header: { fontSize: 26, fontWeight: 'bold', color: '#222' },
  addBtn: { marginLeft: 8 },
  tabsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 12, marginBottom: 8 },
  tabBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20, marginHorizontal: 4, backgroundColor: '#f2f4f8' },
  tabBtnActive: { backgroundColor: '#e0e7ff' },
  tabLabel: { fontSize: 15, color: '#555', fontWeight: '500' },
  tabLabelActive: { color: '#007AFF', fontWeight: 'bold' },
  tabCount: { backgroundColor: '#e0e7ff', borderRadius: 10, marginLeft: 6, paddingHorizontal: 7, paddingVertical: 2 },
  tabCountActive: { backgroundColor: '#007AFF' },
  tabCountText: { color: '#007AFF', fontWeight: 'bold', fontSize: 13 },
  tabCountTextActive: { color: '#fff' },
  emptyBox: { alignItems: 'center', marginTop: 48 },
  empty: { color: '#888', textAlign: 'center', fontSize: 16 },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    backgroundColor: '#007AFF',
    borderRadius: 32,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    ...Platform.select({ ios: { shadowColor: '#007AFF' } }),
  },
}); 