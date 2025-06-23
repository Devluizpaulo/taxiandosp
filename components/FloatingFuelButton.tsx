import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

interface MenuOption {
  id: string;
  icon: string;
  route: string;
  color: string;
}

const MENU_OPTIONS: MenuOption[] = [
  { id: 'novo', icon: 'add-circle', route: '/combustivel/novo', color: '#2ecc71' },
  { id: 'postos', icon: 'business', route: '/combustivel/postos', color: '#3498db' },
  { id: 'historico', icon: 'receipt-outline', route: '/combustivel/historico', color: '#f39c12' },
];

export default function FloatingFuelButton() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [isOpen, setIsOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;

    Animated.spring(animation, {
      toValue,
      useNativeDriver: true,
      friction: 8,
      tension: 60,
    }).start();

    setIsOpen(!isOpen);
  };

  const handleOptionPress = (option: MenuOption) => {
    toggleMenu();
    setTimeout(() => {
      router.push(option.route as any);
    }, 250);
  };

  const renderMenuOption = (option: MenuOption, index: number) => {
    const angle = -80 - (index * 65);
    const radius = 65;

    const translateX = animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, radius * Math.cos(angle * Math.PI / 180)],
    });

    const translateY = animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, radius * Math.sin(angle * Math.PI / 180)],
    });

    const scale = animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <Animated.View
        key={option.id}
        style={[
          styles.menuOption,
          {
            transform: [{ translateX }, { translateY }, { scale }],
            opacity: animation
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.optionButton, { backgroundColor: option.color }]}
          onPress={() => handleOptionPress(option)}
          activeOpacity={0.8}
        >
          <Ionicons name={option.icon as any} size={22} color="white" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const backgroundScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.backgroundArc, {
        transform: [{ scale: backgroundScale }],
        backgroundColor: colors.tint,
        opacity: animation.interpolate({ inputRange: [0, 1], outputRange: [0, 0.15] })
      }]} />

      {MENU_OPTIONS.map((option, index) => renderMenuOption(option, index))}

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.tint }]}
        onPress={toggleMenu}
        activeOpacity={0.9}
      >
        <MaterialIcons name="local-gas-station" size={32} color={colors.background} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    right: 17,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  backgroundArc: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 120,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    zIndex: 1,
  },
  menuOption: {
    position: 'absolute',
  },
  optionButton: {
    width: 44,
    height: 44,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
}); 