import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
    Animated,
    LayoutChangeEvent,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';

interface CombustivelSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  maxValue: number;
  fuelType: string;
  unit: string;
  error?: boolean;
}

export default function CombustivelSlider({
  value,
  onValueChange,
  maxValue,
  fuelType,
  unit,
  error = false,
}: CombustivelSliderProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [sliderWidth, setSliderWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const [isDragging, setIsDragging] = useState(false);

  // Calcular porcentagem para a barra
  const percentage = maxValue > 0 ? Math.min((value / maxValue) * 100, 100) : 0;
  
  // Determinar cor baseada no nível de combustível
  const getFuelColor = (percent: number) => {
    if (percent <= 15) return '#e74c3c'; // Vermelho - crítico
    if (percent <= 30) return '#f39c12'; // Laranja - baixo
    if (percent <= 60) return '#f1c40f'; // Amarelo - médio
    return '#2ecc71'; // Verde - bom
  };

  const fuelColor = getFuelColor(percentage);

  // Ícones baseados no tipo de combustível
  const getFuelIcon = () => {
    const iconName = () => {
        switch (fuelType.toLowerCase()) {
          case 'gasolina':
            return 'gas-station';
          case 'etanol':
            return 'leaf';
          case 'flex':
            return 'gas-station-outline';
          case 'diesel':
            return 'truck';
          case 'gnv':
            return 'cloud-outline';
          case 'elétrico':
          case 'híbrido (phev)':
          case 'híbrido (hev)':
            return 'flash';
          default:
            return 'gas-station';
        }
    }
    return <MaterialCommunityIcons name={iconName() as any} size={20} color={fuelColor} />
  };

  // Texto de status baseado no nível
  const getStatusText = () => {
    if (percentage <= 15) return 'Crítico';
    if (percentage <= 30) return 'Baixo';
    if (percentage <= 60) return 'Médio';
    return 'Bom';
  };

  // Emoji baseado no nível
  const getStatusEmoji = () => {
    if (percentage <= 15) return '⚠️';
    if (percentage <= 30) return '😰';
    if (percentage <= 60) return '😐';
    return '😊';
  };

  const handleSliderPress = (event: any) => {
    if (sliderWidth === 0) return;
    
    const { locationX } = event.nativeEvent;
    const newPercentage = Math.max(0, Math.min(100, (locationX / sliderWidth) * 100));
    const newValue = Math.round((newPercentage / 100) * maxValue);
    onValueChange(newValue);
  };

  const handleInputChange = (text: string) => {
    const numValue = parseFloat(text) || 0;
    const clampedValue = Math.max(0, Math.min(maxValue, numValue));
    onValueChange(clampedValue);
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setSliderWidth(width);
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: false }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.BEGAN) {
      setIsDragging(true);
    } else if (event.nativeEvent.state === State.ACTIVE) {
      const translationX = event.nativeEvent.translationX;
      const currentPosition = (percentage / 100) * sliderWidth;
      const newPosition = currentPosition + translationX;
      const newPercentage = Math.max(0, Math.min(100, (newPosition / sliderWidth) * 100));
      const newValue = Math.round((newPercentage / 100) * maxValue);
      onValueChange(newValue);
    } else if (event.nativeEvent.state === State.END) {
      setIsDragging(false);
      translateX.setValue(0);
    }
  };

  const quickSetButtons = [
    { label: '1/4', value: Math.round(maxValue * 0.25) },
    { label: '1/2', value: Math.round(maxValue * 0.5) },
    { label: '3/4', value: Math.round(maxValue * 0.75) },
    { label: 'Cheio', value: maxValue },
  ];

  // Marcadores de referência
  const referenceMarkers = [
    { label: '1/4', percentage: 25, value: Math.round(maxValue * 0.25) },
    { label: '1/2', percentage: 50, value: Math.round(maxValue * 0.5) },
    { label: '3/4', percentage: 75, value: Math.round(maxValue * 0.75) },
    { label: '4/4', percentage: 100, value: maxValue },
  ];

  return (
    <GestureHandlerRootView>
      <View style={styles.container}>
        {/* Header com ícone e tipo de combustível */}
        <View style={styles.header}>
          {getFuelIcon()}
          <Text style={[styles.fuelType, { color: colors.text }]}>{fuelType}</Text>
          <View style={styles.statusContainer}>
            <Text style={styles.statusEmoji}>{getStatusEmoji()}</Text>
            <Text style={[styles.status, { color: fuelColor }]}>{getStatusText()}</Text>
          </View>
        </View>

        {/* Barra de combustível com arraste */}
        <View
          style={[
            styles.sliderContainer,
            { borderColor: error ? '#e74c3c' : colors.text }
          ]}
          onLayout={handleLayout}
        >
          <TouchableOpacity
            style={styles.sliderTrack}
            onPress={handleSliderPress}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.sliderFill,
                {
                  width: `${percentage}%`,
                  backgroundColor: fuelColor,
                },
              ]}
            />
            
            {/* Marcadores de referência na barra */}
            {referenceMarkers.map((marker) => (
              <View
                key={marker.label}
                style={[
                  styles.referenceMarker,
                  {
                    left: `${marker.percentage}%`,
                    transform: [{ translateX: -1 }],
                  },
                ]}
              >
                <View style={[styles.markerDot, { backgroundColor: fuelColor }]} />
                <Text style={[styles.markerLabel, { color: fuelColor }]}>
                  {marker.label}
                </Text>
              </View>
            ))}
          </TouchableOpacity>

          {/* Thumb arrastável */}
          <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
          >
            <Animated.View
              style={[
                styles.sliderThumb,
                {
                  left: `${percentage}%`,
                  backgroundColor: fuelColor,
                  transform: [{ translateX: -8 }],
                  zIndex: 10,
                },
              ]}
            />
          </PanGestureHandler>
          
          {/* Marcadores de porcentagem */}
          <View style={styles.markers}>
            {[0, 25, 50, 75, 100].map((mark) => (
              <View key={mark} style={styles.marker}>
                <Text style={[styles.markerText, { color: colors.icon }]}>{mark}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Input numérico */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.numericInput,
              {
                borderColor: error ? '#e74c3c' : fuelColor,
                color: colors.text,
                backgroundColor: colors.background,
              },
            ]}
            value={value.toString()}
            onChangeText={handleInputChange}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={colors.icon}
          />
          <Text style={[styles.unit, { color: colors.text }]}>{unit}</Text>
          <Text style={[styles.maxValue, { color: colors.icon }]}>/ {maxValue}</Text>
        </View>

        {/* Botões rápidos */}
        <View style={styles.quickButtons}>
          {quickSetButtons.map((button) => (
            <TouchableOpacity
              key={button.label}
              style={[
                styles.quickButton,
                {
                  backgroundColor: value === button.value ? fuelColor : colors.card,
                  borderColor: fuelColor,
                },
              ]}
              onPress={() => onValueChange(button.value)}
            >
              <Text
                style={[
                  styles.quickButtonText,
                  {
                    color: value === button.value ? 'white' : fuelColor,
                  },
                ]}
              >
                {button.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Informações adicionais */}
        <View style={styles.infoContainer}>
          <Text style={[styles.infoText, { color: colors.icon }]}>
            {percentage.toFixed(1)}% do tanque • {value.toFixed(1)} {unit} de {maxValue} {unit}
          </Text>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  fuelType: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  sliderContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    position: 'relative',
  },
  sliderTrack: {
    height: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    position: 'relative',
    overflow: 'visible',
  },
  sliderFill: {
    height: '100%',
    borderRadius: 10,
  },
  sliderThumb: {
    position: 'absolute',
    top: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  referenceMarker: {
    position: 'absolute',
    top: -15,
    alignItems: 'center',
  },
  markerDot: {
    width: 2,
    height: 20,
    borderRadius: 1,
  },
  markerLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
  },
  markers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  marker: {
    alignItems: 'center',
  },
  markerText: {
    fontSize: 10,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  numericInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: 'center',
    marginRight: 8,
  },
  unit: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  maxValue: {
    fontSize: 14,
  },
  quickButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  quickButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  quickButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoContainer: {
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    textAlign: 'center',
  },
}); 