import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { AuthProvider } from '@/contexts/AuthContext';
import '@/services/databaseService'; // Inicialização do DB global

// Inicialização dos bancos locais
import { agendaSqliteService } from '@/services/sqlite/agenda/agendaSqliteService';
import { combustivelSqliteService } from '@/services/sqlite/combustivel/combustivelSqliteService';
import { financasSqliteService } from '@/services/sqlite/financas/financasSqliteService';
import { frotaSqliteService } from '@/services/sqlite/frota/frotaSqliteService';
import { jornadaSqliteService } from '@/services/sqlite/jornada/jornadaSqliteService';

// Polyfills
import 'react-native-get-random-values';
import 'react-native-reanimated';

// Função para inicializar todos os bancos
function initDatabases() {
  financasSqliteService.init();
  agendaSqliteService.init();
  frotaSqliteService.init();
  jornadaSqliteService.init();
  combustivelSqliteService.init();
}
initDatabases();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <Stack />
        <StatusBar style="auto" />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}