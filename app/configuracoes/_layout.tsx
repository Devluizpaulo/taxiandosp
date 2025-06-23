import { Stack } from 'expo-router';
import React from 'react';

export default function ConfiguracoesLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen 
        name="perfil" 
        options={{ 
          title: 'Perfil',
          headerShown: true,
          headerBackTitleVisible: false,
        }} 
      />
      <Stack.Screen 
        name="veiculo" 
        options={{ 
          title: 'Veículo',
          headerShown: true,
          headerBackTitleVisible: false,
        }} 
      />
      <Stack.Screen 
        name="notificacoes" 
        options={{ 
          title: 'Notificações',
          headerShown: true,
          headerBackTitleVisible: false,
        }} 
      />
      <Stack.Screen 
        name="privacidade" 
        options={{ 
          title: 'Privacidade',
          headerShown: true,
          headerBackTitleVisible: false,
        }} 
      />
    </Stack>
  );
}