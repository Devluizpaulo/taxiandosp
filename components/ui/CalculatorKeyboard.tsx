import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  onKeyPress: (key: string) => void;
};

const keys = [
  ['1', '2', '3', '÷'],
  ['4', '5', '6', '×'],
  ['7', '8', '9', '-'],
  [',', '0', '+', 'backspace'],
];

export default function CalculatorKeyboard({ onKeyPress }: Props) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const styles = getStyles(colors);

  const renderKey = (key: string) => {
    const isNumber = /[0-9,]/.test(key);
    const isOperator = ['÷', '×', '-', '+'].includes(key);
    const isBackspace = key === 'backspace';

    let keyStyle = styles.key;
    let textStyle = styles.keyText;
    
    if (isOperator) {
      keyStyle = [keyStyle, styles.operatorKey];
      textStyle = [textStyle, styles.operatorText];
    }

    return (
      <TouchableOpacity
        key={key}
        style={keyStyle}
        onPress={() => onKeyPress(key)}
      >
        {isBackspace ? (
          <MaterialIcons name="backspace" size={24} color={colors.tint} />
        ) : (
          <Text style={textStyle}>{key}</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.keysGrid}>
        {keys.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map(renderKey)}
          </View>
        ))}
      </View>
      <TouchableOpacity
        style={styles.confirmButton}
        onPress={() => onKeyPress('confirm')}
      >
        <MaterialCommunityIcons name="check" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: colors.background,
    },
    keysGrid: {
      flex: 3,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    key: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 18,
      margin: 2,
    },
    keyText: {
      fontSize: 24,
      color: colors.text,
    },
    operatorKey: {
        // backgroundColor: colors.backgroundMuted,
    },
    operatorText: {
      fontSize: 28,
      color: colors.tint,
    },
    confirmButton: {
      flex: 1,
      backgroundColor: colors.success,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 12,
      margin: 4,
    },
  }); 