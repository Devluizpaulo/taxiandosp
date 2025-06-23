import React from 'react';
// Home do Drawer - reutilize o conteúdo da antiga Home
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { Pressable } from 'react-native';
import HomeScreen from './(tabs)/index';

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

export default function DrawerHome() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Início',
          headerLeft: () => <MenuButton />,
        }}
      />
      <HomeScreen />
    </>
  );
} 