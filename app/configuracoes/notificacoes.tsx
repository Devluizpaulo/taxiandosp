import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

export default function ConfiguracoesNotificacoesScreen() {
  const [eventos, setEventos] = useState(true);
  const [jornada, setJornada] = useState(true);
  const [promocoes, setPromocoes] = useState(false);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Notificações</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Notificações de eventos</Text>
        <Switch value={eventos} onValueChange={setEventos} />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Notificações de jornada</Text>
        <Switch value={jornada} onValueChange={setJornada} />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Promoções e novidades</Text>
        <Switch value={promocoes} onValueChange={setPromocoes} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  label: { fontSize: 16, color: '#333' },
}); 