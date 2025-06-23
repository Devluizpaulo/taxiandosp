import VehicleRegistrationGuard from '@/app/layout/VehicleRegistrationGuard';
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { Stack, Tabs } from 'expo-router';
import React from 'react';
import { Platform, Pressable } from 'react-native';

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

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <VehicleRegistrationGuard>
      <Stack
        screenOptions={{
          headerTitle: 'Início',
          headerLeft: () => <MenuButton />,
        }}
      >
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: colors.tint,
            tabBarInactiveTintColor: colors.icon,
            headerShown: false,
            tabBarButton: HapticTab,
            tabBarBackground: TabBarBackground,
            tabBarStyle: Platform.select({
              ios: {
                position: 'absolute',
                backgroundColor: colors.background,
                borderTopColor: colors.card,
                borderTopWidth: 1,
              },
              android: {
                backgroundColor: colors.background,
                borderTopColor: colors.card,
                borderTopWidth: 1,
                elevation: 8,
              },
              default: {
                backgroundColor: colors.background,
                borderTopColor: colors.card,
                borderTopWidth: 1,
              },
            }),
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '500',
            },
          }}>
          
          {/* Home */}
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              tabBarIcon: ({ color, focused }) => (
                <Ionicons 
                  name={focused ? "home" : "home-outline"} 
                  size={24} 
                  color={color} 
                />
              ),
            }}
          />

          {/* Jornada */}
          <Tabs.Screen
            name="jornada"
            options={{
              title: 'Jornada',
              tabBarIcon: ({ color, focused }) => (
                <Ionicons 
                  name={focused ? "car" : "car-outline"} 
                  size={24} 
                  color={color} 
                />
              ),
            }}
          />

          {/* Finanças */}
          <Tabs.Screen
            name="financas"
            options={{
              title: 'Finanças',
              tabBarIcon: ({ color, focused }) => (
                <Ionicons 
                  name={focused ? "wallet" : "wallet-outline"} 
                  size={24} 
                  color={color} 
                />
              ),
            }}
          />

          {/* Agenda */}
          <Tabs.Screen
            name="agenda"
            options={{
              title: 'Agenda',
              tabBarIcon: ({ color, focused }) => (
                <Ionicons 
                  name={focused ? "calendar" : "calendar-outline"} 
                  size={24} 
                  color={color} 
                />
              ),
            }}
          />

          {/* Frota */}
          <Tabs.Screen
            name="frota"
            options={{
              title: 'Frota',
              tabBarIcon: ({ color, focused }) => (
                <Ionicons 
                  name={focused ? "bus" : "bus-outline"} 
                  size={24} 
                  color={color} 
                />
              ),
            }}
          />

          {/* Configurações */}
          <Tabs.Screen
            name="configuracoes"
            options={{
              title: 'Config',
              tabBarIcon: ({ color, focused }) => (
                <Ionicons 
                  name={focused ? "settings" : "settings-outline"} 
                  size={24} 
                  color={color} 
                />
              ),
            }}
          />

        </Tabs>
      </Stack>
    </VehicleRegistrationGuard>
  );
}
