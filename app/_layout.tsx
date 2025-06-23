// Polyfill para geração de UUID no React Native/Expo (deve vir antes de qualquer uso de uuid)
import { LoadingScreen } from '@/components/LoadingScreen';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import '@/services/databaseService'; // Garante a inicialização do DB
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { router, Stack } from 'expo-router';
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
import { profileSqliteService } from '@/services/sqlite/profileSqliteService';
import { Ionicons } from '@expo/vector-icons';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import * as Location from 'expo-location';
import { getAuth } from 'firebase/auth';
import { useState } from 'react';
import { Image, Text, View } from 'react-native';

financasSqliteService.init();
agendaSqliteService.init();
frotaSqliteService.init();
jornadaSqliteService.init();
combustivelSqliteService.init();

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  const [profile, setProfile] = useState(null);
  const [temperature, setTemperature] = useState(null);
  const [city, setCity] = useState('');

  useEffect(() => {
    // Buscar perfil local
    (async () => {
      const user = getAuth().currentUser;
      if (user) {
        const p = await profileSqliteService.getProfile(user.uid);
        setProfile(p);
      }
    })();
    // Buscar localização e temperatura
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      let location = await Location.getCurrentPositionAsync({});
      const lat = location.coords.latitude;
      const lon = location.coords.longitude;
      // Exemplo com OpenWeatherMap (substitua pela sua API_KEY)
      const API_KEY = 'SUA_API_KEY';
      try {
        const resp = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}&lang=pt_br`);
        const data = await resp.json();
        setTemperature(Math.round(data.main.temp));
        setCity(data.name);
      } catch {}
    })();
  }, []);

  return (
    <DrawerContentScrollView {...props}>
      <View style={{ alignItems: 'center', padding: 24, backgroundColor: '#f5f5f5' }}>
        <Image
          source={profile?.foto ? { uri: profile.foto } : require('@/assets/images/avatar-default.png')}
          style={{ width: 72, height: 72, borderRadius: 36, marginBottom: 8 }}
        />
        <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{profile?.nome || 'Usuário'}</Text>
        {temperature !== null && (
          <Text style={{ marginTop: 4, color: '#888' }}>
            {city ? `${city} • ` : ''}{temperature}°C
          </Text>
        )}
      </View>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

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
        <NavigationContainer>
          <Drawer.Navigator
            drawerContent={props => <CustomDrawerContent {...props} />}
            screenOptions={{
              headerShown: true,
              drawerActiveTintColor: '#007AFF',
              drawerLabelStyle: { fontWeight: 'bold' },
            }}
          >
            <Drawer.Screen name="Home" component={RootLayoutNav} options={{ drawerIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} /> }} />
            <Drawer.Screen name="Jornada" component={RootLayoutNav} options={{ drawerIcon: ({ color, size }) => <Ionicons name="car" size={size} color={color} /> }} />
            <Drawer.Screen name="Finanças" component={RootLayoutNav} options={{ drawerIcon: ({ color, size }) => <Ionicons name="wallet" size={size} color={color} /> }} />
            <Drawer.Screen name="Agenda" component={RootLayoutNav} options={{ drawerIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} /> }} />
            <Drawer.Screen name="Frota" component={RootLayoutNav} options={{ drawerIcon: ({ color, size }) => <Ionicons name="bus" size={size} color={color} /> }} />
            <Drawer.Screen name="Configurações" component={RootLayoutNav} options={{ drawerIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} /> }} />
          </Drawer.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}