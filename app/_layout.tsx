import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useColorScheme } from 'react-native';
import '@/services/databaseService';

import { agendaSqliteService } from '@/services/sqlite/agenda/agendaSqliteService';
import { combustivelSqliteService } from '@/services/sqlite/combustivel/combustivelSqliteService';
import { financasSqliteService } from '@/services/sqlite/financas/financasSqliteService';
import { frotaSqliteService } from '@/services/sqlite/frota/frotaSqliteService';
import { jornadaSqliteService } from '@/services/sqlite/jornada/jornadaSqliteService';

import 'react-native-get-random-values';
import 'react-native-reanimated';

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
  const colorScheme = useColorScheme();

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthProvider>
          <Stack />
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}