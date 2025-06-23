import { Stack } from 'expo-router';
import React from 'react';

export default function FinancasLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen 
        name="nova-transacao" 
        options={{ 
          title: 'Nova Transação',
          presentation: 'modal',
          headerBackTitleVisible: false,
        }} 
      />
      <Stack.Screen 
        name="editar/[id]" 
        options={{ 
          title: 'Editar Transação',
          presentation: 'modal',
          headerBackTitleVisible: false,
        }} 
      />
    </Stack>
  );
}