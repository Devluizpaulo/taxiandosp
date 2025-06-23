import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { EventoAgenda } from '../../services/agendaService';

interface Props {
  evento: EventoAgenda;
  onPressEdit?: () => void;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const dia = d.getDate().toString().padStart(2, '0');
  const mes = d.toLocaleString('pt-BR', { month: 'short' });
  const ano = d.getFullYear();
  return { dia, mes, ano };
}

export const AgendaItem: React.FC<Props> = ({ evento, onPressEdit }) => {
  const { dia, mes, ano } = formatDate(evento.data);
  return (
    <View style={styles.cardWrap}>
      <View style={styles.card}>
        <View style={styles.circleDate}>
          <Text style={styles.circleDay}>{dia}</Text>
          <Text style={styles.circleMonth}>{mes}</Text>
          <Text style={styles.circleYear}>{ano}</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.hour}>{evento.hora}</Text>
          <Text style={styles.title}>{evento.titulo}</Text>
          {evento.local ? <Text style={styles.subtitle}>{evento.local}</Text> : null}
          {evento.observacao ? <Text style={styles.subtitle}>{evento.observacao}</Text> : null}
        </View>
        <TouchableOpacity onPress={onPressEdit} style={styles.editBtn}>
          <MaterialIcons name="edit" size={22} color="#888" />
        </TouchableOpacity>
      </View>
      <View style={styles.separator} />
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrap: { width: '100%' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
  },
  circleDate: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#b3baff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    backgroundColor: '#f7f9ff',
  },
  circleDay: { fontSize: 18, fontWeight: 'bold', color: '#6c63ff' },
  circleMonth: { fontSize: 13, color: '#6c63ff', textTransform: 'uppercase' },
  circleYear: { fontSize: 11, color: '#b3baff' },
  infoBox: { flex: 1 },
  hour: { fontSize: 18, fontWeight: 'bold', color: '#222' },
  title: { fontSize: 15, color: '#222', marginTop: 2 },
  subtitle: { fontSize: 13, color: '#6c63ff', marginTop: 1 },
  editBtn: { padding: 6, marginLeft: 8 },
  separator: { height: 1, backgroundColor: '#f0f0f0', marginLeft: 76 },
}); 