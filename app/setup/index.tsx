import { useRouter } from 'expo-router';
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function SetupIndex() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo ao TaxiandoSP!</Text>
      <Text style={styles.subtitle}>
        Antes de começar a usar o app, precisamos configurar algumas informações essenciais do seu perfil profissional.
      </Text>
      <Button title="Iniciar configuração" onPress={() => router.replace('/setup/profile')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 32 },
}); 