import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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
import { finalizarJornada } from '../../services/jornadaService';
import { useJornadaStore } from '../../store/jornadaStore';

const schema = z.object({
  kmFinal: z.coerce.number().min(0, 'KM final deve ser maior que 0'),
  lucro: z.coerce.number(),
  observacao: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function FinalizarJornadaScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { jornadaAtiva, finalizar } = useJornadaStore();
  
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
      kmFinal: jornadaAtiva?.kmInicial || 0,
      lucro: 0,
      observacao: ''
    },
    mode: 'onChange'
  });

  // Cálculos automáticos
  const kmFinal = watch('kmFinal');
  const kmInicial = jornadaAtiva?.kmInicial || 0;
  const kmPercorrido = kmFinal - kmInicial;
  
  const horaInicial = jornadaAtiva ? new Date(jornadaAtiva.horaInicial) : new Date();
  const horaFinal = new Date();
  const tempoTotal = (horaFinal.getTime() - horaInicial.getTime()) / 3600000; // em horas

  const onSubmit = async (data: FormData) => {
    if (!jornadaAtiva) {
      Alert.alert('Erro', 'Nenhuma jornada ativa encontrada.');
      return;
    }

    setLoading(true);
    try {
      await finalizarJornada(jornadaAtiva.id, {
        ...data,
        horaFinal: horaFinal.toISOString(),
      });
      finalizar();
      Alert.alert('Sucesso', 'Jornada finalizada com sucesso!');
      router.back();
    } catch (error) {
      Alert.alert('Erro', 'Erro ao finalizar jornada. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}min`;
  };

  if (!jornadaAtiva) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Finalizar Jornada</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#e74c3c" />
          <Text style={[styles.errorText, { color: colors.text }]}>
            Nenhuma jornada ativa encontrada
          </Text>
          <TouchableOpacity 
            style={[styles.errorButton, { backgroundColor: colors.tint }]}
            onPress={() => router.back()}
          >
            <Text style={styles.errorButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Finalizar Jornada</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Resumo da Jornada */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle" size={24} color="#3498db" />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Resumo da Jornada</Text>
          </View>
          
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Ionicons name="time" size={20} color="#f39c12" />
              <Text style={[styles.summaryLabel, { color: colors.text }]}>Tempo Total</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {formatDuration(tempoTotal)}
              </Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Ionicons name="speedometer" size={20} color="#2ecc71" />
              <Text style={[styles.summaryLabel, { color: colors.text }]}>KM Percorridos</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {kmPercorrido} km
              </Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Ionicons name="trending-up" size={20} color="#9b59b6" />
              <Text style={[styles.summaryLabel, { color: colors.text }]}>KM Inicial</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {kmInicial} km
              </Text>
            </View>
          </View>
        </View>

        {/* Card de KM Final */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="flag" size={24} color="#e74c3c" />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Quilometragem Final</Text>
          </View>
          
          <Controller
            control={control}
            name="kmFinal"
            render={({ field: { value, onChange } }) => (
              <View style={styles.inputContainer}>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      borderColor: errors.kmFinal ? '#e74c3c' : colors.text,
                      color: colors.text,
                      backgroundColor: colors.background
                    }
                  ]}
                  value={value.toString()}
                  onChangeText={onChange}
                  placeholder="Digite a quilometragem final"
                  placeholderTextColor={colors.icon}
                  keyboardType="numeric"
                />
                <Text style={styles.unit}>km</Text>
              </View>
            )}
          />
          {errors.kmFinal && (
            <Text style={styles.errorText}>{errors.kmFinal.message}</Text>
          )}
          
          {kmPercorrido < 0 && (
            <Text style={styles.warningText}>
              ⚠️ A quilometragem final não pode ser menor que a inicial
            </Text>
          )}
        </View>

        {/* Card de Lucro */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="cash" size={24} color="#27ae60" />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Lucro da Jornada</Text>
          </View>
          
          <Controller
            control={control}
            name="lucro"
            render={({ field: { value, onChange } }) => (
              <View style={styles.inputContainer}>
                <Text style={styles.currencySymbol}>R$</Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      borderColor: colors.text,
                      color: colors.text,
                      backgroundColor: colors.background,
                      marginLeft: 10
                    }
                  ]}
                  value={value.toString()}
                  onChangeText={onChange}
                  placeholder="0,00"
                  placeholderTextColor={colors.icon}
                  keyboardType="numeric"
                />
              </View>
            )}
          />
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
                placeholder="Adicione observações sobre o final da jornada..."
                placeholderTextColor={colors.icon}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            )}
          />
        </View>

        {/* Botão de Finalizar */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            { 
              backgroundColor: isValid && kmPercorrido >= 0 ? '#e74c3c' : '#bdc3c7',
              opacity: loading ? 0.7 : 1
            }
          ]}
          onPress={handleSubmit(onSubmit)}
          disabled={!isValid || kmPercorrido < 0 || loading}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Ionicons name="stop-circle" size={24} color="white" />
              <Text style={styles.submitButtonText}>Finalizar Jornada</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
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
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#888',
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
    fontSize: 14,
    marginTop: 5,
    marginLeft: 5,
  },
  warningText: {
    color: '#f39c12',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 15,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  errorButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 