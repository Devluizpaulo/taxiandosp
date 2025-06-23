import { Stack } from 'expo-router';
import React from 'react';

export default function CombustivelLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Combustível',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="novo"
        options={{
          title: 'Novo Abastecimento',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="historico"
        options={{
          title: 'Histórico',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="postos"
        options={{
          title: 'Postos',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="posto/[id]"
        options={{
          title: 'Detalhes do Posto',
          headerShown: false,
        }}
      />
    </Stack>
  );
}