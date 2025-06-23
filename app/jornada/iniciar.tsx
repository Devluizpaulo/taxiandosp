import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useCombustivelStore } from '@/stores/combustivelStore';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { z } from 'zod';
import CombustivelSlider from '../../components/CombustivelSlider';
import VehicleSelector from '../../components/VehicleSelector';
import { useVehicleInfo } from '../../hooks/useVehicleInfo';
import { iniciarJornada } from '../../services/jornadaService';
import { useJornadaStore } from '../../store/jornadaStore';

const schema = z.object({
  horaInicial: z.date(),
  kmInicial: z.coerce.number().min(0, 'KM inicial deve ser maior que 0'),
  combustivel: z.coerce.number().min(0, 'Combustível deve ser maior que 0'),
  combustivelSecundario: z.coerce.number().optional(),
  observacao: z.string().optional(),
}).refine(
  (data) => {
    // Se houver campo secundário, ele deve ser >= 0
    if (data.combustivelSecundario !== undefined && data.combustivelSecundario < 0) return false;
    return true;
  },
  { message: 'Combustível secundário inválido', path: ['combustivelSecundario'] }
);

type FormData = z.infer<typeof schema>;

export default function IniciarJornadaScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { iniciar } = useJornadaStore();
  const { buscarKmAtual } = useCombustivelStore();
  const { 
    vehicles, 
    selectedVehicle, 
    vehicleData,
    loading: loadingVehicle, 
    selectVehicle,
    getCurrentKm,
    getFuelUnit, 
    getMaxCapacity,
    getPrimaryFuelType,
    getEstimatedFuelLevel,
    refreshVehicleData
  } = useVehicleInfo();
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const { 
    control, 
    handleSubmit, 
    setValue, 
    formState: { errors, isValid },
    watch
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { 
      horaInicial: new Date(),
      kmInicial: 0,
      combustivel: 0,
      combustivelSecundario: 0,
      observacao: ''
    },
    mode: 'onChange'
  });

  const watchedKmInicial = watch('kmInicial');

  // Recuperar KM atual automaticamente quando veículo for selecionado
  useEffect(() => {
    if (selectedVehicle && vehicleData) {
      const kmAtual = getCurrentKm();
      if (kmAtual !== null && kmAtual > 0) {
        setValue('kmInicial', kmAtual);
      }
    }
  }, [selectedVehicle, vehicleData, getCurrentKm, setValue]);

  // Atualizar valor do combustível quando veículo for selecionado
  useEffect(() => {
    if (selectedVehicle && vehicleData) {
      const nivelEstimado = getEstimatedFuelLevel();
      if (nivelEstimado > 0) {
        setValue('combustivel', nivelEstimado);
      }
      
      const max = getMaxCapacity(getPrimaryFuelType(), selectedVehicle.volumeTanque);
      setValue('combustivel', Math.min(watch('combustivel'), max));
      
      if (selectedVehicle.volumeTanqueSecundario) {
        const max2 = getMaxCapacity(selectedVehicle.combustivelSecundario || '', selectedVehicle.volumeTanqueSecundario);
        setValue('combustivelSecundario', Math.min(watch('combustivelSecundario'), max2));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVehicle, vehicleData]);

  const onSubmit = async (data: FormData) => {
    if (!selectedVehicle) {
      Alert.alert('Erro', 'Selecione um veículo para iniciar a jornada.');
      return;
    }

    setLoading(true);
    try {
      const jornada = await iniciarJornada({
        ...data,
        horaInicial: data.horaInicial.toISOString(),
        vehicleId: selectedVehicle.id,
      });
      iniciar(jornada);
      Alert.alert('Sucesso', 'Jornada iniciada com sucesso!');
      router.back();
    } catch (error) {
      Alert.alert('Erro', 'Erro ao iniciar jornada. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setValue('horaInicial', selectedDate);
    }
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Dados do combustível baseados no veículo selecionado
  const isGnv = selectedVehicle?.combustivel === 'GNV';
  
  const fuelType = selectedVehicle 
    ? (isGnv ? selectedVehicle.combustivelSecundario : selectedVehicle.combustivel) || 'Gasolina'
    : 'Gasolina';
  const unit = selectedVehicle ? getFuelUnit(fuelType) : 'L';
  const maxValue = selectedVehicle ? getMaxCapacity(fuelType, selectedVehicle.volumeTanque) : 60;

  const hasSecundario = !!(selectedVehicle && selectedVehicle.volumeTanqueSecundario);
  
  const fuelTypeSec = selectedVehicle 
    ? (isGnv ? 'GNV' : selectedVehicle.combustivelSecundario) || ''
    : '';
  const unitSec = selectedVehicle ? getFuelUnit(fuelTypeSec) : 'L';
  const maxValueSec = selectedVehicle ? getMaxCapacity(fuelTypeSec, selectedVehicle.volumeTanqueSecundario || '') : 0;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Card de Seleção de Veículo */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="car" size={24} color="#3498db" />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Veículo</Text>
            <TouchableOpacity 
              onPress={refreshVehicleData}
              style={styles.refreshButton}
            >
              <Ionicons name="refresh" size={20} color={colors.tint} />
            </TouchableOpacity>
          </View>
          
          {loadingVehicle ? (
            <ActivityIndicator color={colors.tint} />
          ) : (
            <VehicleSelector
              vehicles={vehicles}
              selectedVehicle={selectedVehicle}
              onSelectVehicle={selectVehicle}
              error={!selectedVehicle}
            />
          )}

          {/* Informações do veículo selecionado */}
          {selectedVehicle && vehicleData && (
            <View style={styles.vehicleInfo}>
              <View style={styles.infoRow}>
                <Ionicons name="speedometer" size={16} color={colors.icon} />
                <Text style={[styles.infoText, { color: colors.text }]}>
                  KM Atual: {vehicleData.kmAtual.toLocaleString()} km
                </Text>
              </View>
              {vehicleData.ultimaJornada && (
                <View style={styles.infoRow}>
                  <Ionicons name="time" size={16} color={colors.icon} />
                  <Text style={[styles.infoText, { color: colors.text }]}>
                    Última jornada: {vehicleData.ultimaJornada.kmFinal.toLocaleString()} km 
                    ({vehicleData.ultimaJornada.data.toLocaleDateString()})
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Card de Data/Hora */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="time" size={24} color="#3498db" />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Data e Hora de Início</Text>
          </View>
          
          <Controller
            control={control}
            name="horaInicial"
            render={({ field: { value, onChange } }) => (
              <TouchableOpacity 
                style={[styles.dateButton, { borderColor: colors.text }]}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar" size={20} color={colors.text} />
                <Text style={[styles.dateButtonText, { color: colors.text }]}>
                  {formatDateTime(value)}
                </Text>
                <Ionicons name="chevron-down" size={20} color={colors.text} />
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Card de KM Inicial */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="speedometer" size={24} color="#2ecc71" />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Quilometragem Inicial</Text>
            {vehicleData?.kmAtual && (
              <TouchableOpacity 
                onPress={() => setValue('kmInicial', vehicleData.kmAtual)}
                style={styles.useCurrentButton}
              >
                <Text style={[styles.useCurrentText, { color: colors.tint }]}>
                  Usar Atual
                </Text>
              </TouchableOpacity>
            )}
          </View>
          
          <Controller
            control={control}
            name="kmInicial"
            render={({ field: { value, onChange } }) => (
              <View style={styles.inputContainer}>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      borderColor: errors.kmInicial ? '#e74c3c' : colors.text,
                      color: colors.text,
                      backgroundColor: colors.background
                    }
                  ]}
                  value={value.toString()}
                  onChangeText={onChange}
                  placeholder="Digite a quilometragem"
                  placeholderTextColor={colors.icon}
                  keyboardType="numeric"
                />
                <Text style={styles.unit}>km</Text>
              </View>
            )}
          />
          {errors.kmInicial && (
            <Text style={styles.errorText}>{errors.kmInicial.message}</Text>
          )}
        </View>

        {/* Card de Combustível com Slider(s) */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="water" size={24} color="#f39c12" />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Nível de Combustível</Text>
            {vehicleData?.nivelCombustivel && (
              <TouchableOpacity 
                onPress={() => setValue('combustivel', getEstimatedFuelLevel())}
                style={styles.useCurrentButton}
              >
                <Text style={[styles.useCurrentText, { color: colors.tint }]}>
                  Usar Estimado
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {loadingVehicle ? (
            <ActivityIndicator color={colors.tint} />
          ) : (
            <>
              <Controller
                control={control}
                name="combustivel"
                render={({ field: { value, onChange } }) => (
                  <CombustivelSlider
                    value={value}
                    onValueChange={onChange}
                    maxValue={maxValue}
                    fuelType={fuelType}
                    unit={unit}
                    error={!!errors.combustivel}
                  />
                )}
              />
              {hasSecundario && (
                <Controller
                  control={control}
                  name="combustivelSecundario"
                  render={({ field: { value, onChange } }) => (
                    <CombustivelSlider
                      value={value}
                      onValueChange={onChange}
                      maxValue={maxValueSec}
                      fuelType={fuelTypeSec}
                      unit={unitSec}
                      error={!!errors.combustivelSecundario}
                    />
                  )}
                />
              )}
            </>
          )}
          {errors.combustivel && (
            <Text style={styles.errorText}>{errors.combustivel.message}</Text>
          )}
          {errors.combustivelSecundario && (
            <Text style={styles.errorText}>{errors.combustivelSecundario.message}</Text>
          )}
        </View>

        {/* Card de Observações */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text" size={24} color="#9b59b6" />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Observações (Opcional)</Text>
          </View>
          
          <Controller
            control={control}
            name="observacao"
            render={({ field: { value, onChange } }) => (
              <TextInput
                style={[
                  styles.textArea,
                  { 
                    borderColor: colors.text,
                    color: colors.text,
                    backgroundColor: colors.background
                  }
                ]}
                value={value}
                onChangeText={onChange}
                placeholder="Adicione observações sobre a jornada..."
                placeholderTextColor={colors.icon}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            )}
          />
        </View>

        {/* Botão de Iniciar */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            { 
              backgroundColor: isValid && selectedVehicle ? '#2ecc71' : '#bdc3c7',
              opacity: loading ? 0.7 : 1
            }
          ]}
          onPress={handleSubmit(onSubmit)}
          disabled={!isValid || !selectedVehicle || loading}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Ionicons name="play-circle" size={24} color="white" />
              <Text style={styles.submitButtonText}>Iniciar Jornada</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={watch('horaInicial')}
          mode="datetime"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  card: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    flex: 1,
  },
  refreshButton: {
    padding: 5,
  },
  vehicleInfo: {
    marginTop: 15,
    padding: 15,
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    borderRadius: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 8,
  },
  useCurrentButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
  },
  useCurrentText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderWidth: 1,
    borderRadius: 10,
    borderStyle: 'dashed',
  },
  dateButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginRight: 10,
  },
  unit: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#888',
    minWidth: 30,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    minHeight: 100,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 5,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
}); 