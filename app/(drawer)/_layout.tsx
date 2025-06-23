import { profileSqliteService } from '@/services/sqlite/profileSqliteService';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { Stack } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { useEffect, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';

function CustomDrawerContent(props: any) {
  const [profile, setProfile] = useState<any>(null);
  const [temperature, setTemperature] = useState<number | null>(null);
  const [city, setCity] = useState('');

  useEffect(() => {
    (async () => {
      const user = { uid: 'local' }; // Ajuste para buscar o UID real se necessário
      const p = await profileSqliteService.getProfile(user.uid);
      setProfile(p);
    })();
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      let location = await Location.getCurrentPositionAsync({});
      const lat = location.coords.latitude;
      const lon = location.coords.longitude;
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
    <View style={{ flex: 1 }}>
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
      {props.children}
    </View>
  );
}

function MenuButton() {
  const navigation = useNavigation();
  return (
    <Pressable
      onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      style={{ marginLeft: 16 }}
    >
      <Ionicons name="menu" size={28} color="#222" />
    </Pressable>
  );
}

export default function DrawerStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
      <Drawer
        drawerContent={props => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerActiveTintColor: '#007AFF',
          drawerLabelStyle: { fontWeight: 'bold' },
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            title: 'Home',
            drawerIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
          }}
        />
        <Drawer.Screen
          name="jornada/index"
          options={{
            title: 'Jornada',
            drawerIcon: ({ color, size }) => <Ionicons name="car" size={size} color={color} />,
          }}
        />
        <Drawer.Screen
          name="financas/index"
          options={{
            title: 'Finanças',
            drawerIcon: ({ color, size }) => <Ionicons name="wallet" size={size} color={color} />,
          }}
        />
        <Drawer.Screen
          name="agenda/index"
          options={{
            title: 'Agenda',
            drawerIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} />,
          }}
        />
        <Drawer.Screen
          name="frota/index"
          options={{
            title: 'Frota',
            drawerIcon: ({ color, size }) => <Ionicons name="bus" size={size} color={color} />,
          }}
        />
        <Drawer.Screen
          name="configuracoes/index"
          options={{
            title: 'Configurações',
            drawerIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} />,
          }}
        />
        <Drawer.Screen
          name="(tabs)"
          options={{
            title: 'Início',
            drawerIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
          }}
        />
      </Drawer>
    </Stack>
  );
} 