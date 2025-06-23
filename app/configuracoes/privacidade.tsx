import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

export default function ConfiguracoesPrivacidadeScreen() {
  const [compartilharDados, setCompartilharDados] = useState(false);
  const [localizacao, setLocalizacao] = useState(true);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Privacidade</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Compartilhar dados para melhorias</Text>
        <Switch value={compartilharDados} onValueChange={setCompartilharDados} />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Permitir uso da localização</Text>
        <Switch value={localizacao} onValueChange={setLocalizacao} />
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