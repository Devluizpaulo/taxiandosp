import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { Stack } from 'expo-router';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import HomeScreen from './(tabs)/index';

function CustomHeader() {
  const navigation = useNavigation();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Pressable onPress={() => navigation.dispatch(DrawerActions.openDrawer())} style={{ marginRight: 12 }}>
        <Ionicons name="menu" size={28} color="#222" />
      </Pressable>
      <Image source={require('@/assets/images/avatar-default.png')} style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }} />
      <View>
        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Olá, Usuário!</Text>
        <Text style={{ fontSize: 12, color: '#888' }}>Bem-vindo ao Taxiando</Text>
      </View>
    </View>
  );
}

export default function DrawerHome() {
  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => <CustomHeader />,
        }}
      />
      <HomeScreen />
    </>
  );
}         
