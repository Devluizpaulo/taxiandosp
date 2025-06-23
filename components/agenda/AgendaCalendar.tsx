import { MaterialIcons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { EventoAgenda } from '../../services/agendaService';

interface Props {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  eventos: EventoAgenda[];
}

// Componente simples de calendário: mostra dias do mês atual
export const AgendaCalendar: React.FC<Props> = ({ selectedDate, onSelectDate, eventos }) => {
  // Gera lista de dias do mês atual
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(year, month, i + 1);
    return d.toISOString().slice(0, 10);
  });

  // Dias com eventos
  const eventosPorDia = useMemo(() => {
    const map: Record<string, number> = {};
    eventos.forEach(e => {
      map[e.data] = (map[e.data] || 0) + 1;
    });
    return map;
  }, [eventos]);

  return (
    <View style={styles.calendarBox}>
      <View style={styles.monthRow}>
        <TouchableOpacity style={styles.arrowBtn} disabled>
          <MaterialIcons name="chevron-left" size={28} color="#ccc" />
        </TouchableOpacity>
        <Text style={styles.monthText}>{today.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</Text>
        <TouchableOpacity style={styles.arrowBtn} disabled>
          <MaterialIcons name="chevron-right" size={28} color="#ccc" />
        </TouchableOpacity>
      </View>
      <FlatList
        horizontal
        data={days}
        keyExtractor={item => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.day, item === selectedDate && styles.selectedDay]}
            onPress={() => onSelectDate(item)}
            activeOpacity={0.8}
          >
            <Text style={item === selectedDate ? styles.selectedText : styles.dayText}>
              {item.slice(-2)}
            </Text>
            {eventosPorDia[item] ? (
              <View style={styles.dot} />
            ) : null}
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  calendarBox: { backgroundColor: '#fff', borderRadius: 16, margin: 16, marginBottom: 0, paddingVertical: 8, elevation: 2 },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  monthText: { fontSize: 18, fontWeight: 'bold', color: '#222', marginHorizontal: 12, textTransform: 'capitalize' },
  arrowBtn: { padding: 4 },
  day: {
    width: 40,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f2f4f8',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 3,
    marginVertical: 2,
    position: 'relative',
  },
  selectedDay: {
    backgroundColor: '#007AFF',
  },
  dayText: { color: '#333', fontSize: 17, fontWeight: '600' },
  selectedText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    position: 'absolute',
    bottom: 6,
    left: '50%',
    marginLeft: -3.5,
  },
}); 