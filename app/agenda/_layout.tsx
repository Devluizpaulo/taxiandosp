import { Stack } from 'expo-router';
import React from 'react';

export default function AgendaLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen 
        name="novo" 
        options={{ 
          title: 'Novo Evento',
          presentation: 'modal',
          headerBackTitleVisible: false,
        }} 
      />
      <Stack.Screen 
        name="editar/[id]" 
        options={{ 
          title: 'Editar Evento',
          presentation: 'modal',
          headerBackTitleVisible: false,
        }} 
      />
    </Stack>
  );
}