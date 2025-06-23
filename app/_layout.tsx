// Polyfill para geração de UUID no React Native/Expo (deve vir antes de qualquer uso de uuid)
import { LoadingScreen } from '@/components/LoadingScreen';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import '@/services/databaseService'; // Garante a inicialização do DB
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-get-random-values';
import 'react-native-reanimated';
// Inicialização global dos bancos locais (garante que todas as tabelas existem)
import { agendaSqliteService } from '@/services/sqlite/agenda/agendaSqliteService';
import { combustivelSqliteService } from '@/services/sqlite/combustivel/combustivelSqliteService';
import { financasSqliteService } from '@/services/sqlite/financas/financasSqliteService';
import { frotaSqliteService } from '@/services/sqlite/frota/frotaSqliteService';
import { jornadaSqliteService } from '@/services/sqlite/jornada/jornadaSqliteService';

financasSqliteService.init();
agendaSqliteService.init();
frotaSqliteService.init();
jornadaSqliteService.init();
combustivelSqliteService.init();

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/auth/login');
      }
    }
  }, [user, loading]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
        
        {/* Setup Screens */}
        <Stack.Screen name="setup/index" options={{ headerShown: false }} />
        <Stack.Screen name="setup/profile" options={{ headerShown: false }} />
        <Stack.Screen name="setup/veiculo" options={{ headerShown: false }} />
        <Stack.Screen name="setup/pagamentos" options={{ headerShown: false }} />
        <Stack.Screen name="setup/categorias" options={{ headerShown: false }} />
        <Stack.Screen name="setup/apelido" options={{ headerShown: false }} />
        
        {/* Nested Stacks */}
        <Stack.Screen name="agenda" options={{ headerShown: false }} />
        <Stack.Screen name="combustivel" options={{ headerShown: false }} />
        <Stack.Screen name="financas" options={{ headerShown: false }} />
        <Stack.Screen name="frota" options={{ headerShown: false }} />
        <Stack.Screen name="jornada" options={{ headerShown: false }} />
        <Stack.Screen name="configuracoes" options={{ headerShown: false }} />
        
        {/* Relatórios */}
        <Stack.Screen name="relatorios/resumo" options={{ title: 'Resumo', headerShown: true }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}