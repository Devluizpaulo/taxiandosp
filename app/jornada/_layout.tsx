import { Stack } from 'expo-router';
import React from 'react';

export default function JornadaLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen 
        name="iniciar" 
        options={{ 
          title: 'Iniciar Jornada',
          headerShown: true,
          headerBackTitleVisible: false,
        }} 
      />
      <Stack.Screen 
        name="finalizar" 
        options={{ 
          title: 'Finalizar Jornada',
          headerShown: true,
          headerBackTitleVisible: false,
        }} 
      />
    </Stack>
  );
}