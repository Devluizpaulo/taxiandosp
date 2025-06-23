import { Stack } from 'expo-router';
import React from 'react';

export default function FrotaLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Frota', headerShown: true }} />
      <Stack.Screen name="cadastrar" options={{ title: 'Cadastrar Frota', presentation: 'modal' }} />
      <Stack.Screen name="diaria" options={{ title: 'Controle de Diárias' }} />
      <Stack.Screen name="pagamentos" options={{ title: 'Pagamentos' }} />
    </Stack>
  );
}