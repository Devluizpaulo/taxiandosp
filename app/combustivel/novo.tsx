import VehicleInfoCard from '@/components/VehicleInfoCard';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useFinancasStore } from '@/store/financasStore';
import { useCombustivelStore } from '@/stores/combustivelStore';
import { usePostoStore } from '@/stores/postoStore';
import { MaterialIcons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { z } from 'zod';

// Schema de validação com Zod - atualizado para suportar abastecimento duplo
const abastecimentoSchema = z.object({
  postoId: z.string().min(1, 'Posto é obrigatório'),
  postoNome: z.string().min(2, 'Nome do posto é obrigatório'),
  tipoCombustivel: z.enum(['gasolina', 'etanol', 'diesel', 'gnv'], {
    required_error: 'Tipo de combustível é obrigatório'
  }),
  tipoCombustivelSecundario: z.enum(['gasolina', 'etanol', 'diesel']).optional(),
  litros: z.string()
    .min(1, 'Quantidade de litros é obrigatória')
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Quantidade de litros deve ser maior que zero'
    }),
  litrosSecundario: z.string().optional(),
  precoLitro: z.string()
    .min(1, 'Preço por litro é obrigatório')
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Preço por litro deve ser maior que zero'
    }),
  precoLitroSecundario: z.string().optional(),
  valorTotal: z.string()
    .min(1, 'Valor total é obrigatório')
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Valor total deve ser maior que zero'
    }),
  valorTotalSecundario: z.string().optional(),
  kmAtual: z.string()
    .min(1, 'KM atual é obrigatório')
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'KM atual deve ser maior que zero'
    }),
  data: z.string().min(1, 'Data é obrigatória'),
  hora: z.string().optional(),
  tanqueCheio: z.boolean().optional(),
  observacoes: z.string().optional(),
}).refine(
  (data) => {
    // Se é GNV, o combustível secundário é obrigatório
    if (data.tipoCombustivel === 'gnv') {
      return data.tipoCombustivelSecundario && 
             data.litrosSecundario && 
             data.precoLitroSecundario && 
             data.valorTotalSecundario;
    }
    return true;
  },
  {
    message: 'Para GNV, é obrigatório abastecer também o combustível secundário',
    path: ['tipoCombustivelSecundario']
  }
);

type AbastecimentoForm = z.infer<typeof abastecimentoSchema>;

export default function NovoAbastecimentoScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const { addAbastecimento, loading } = useCombustivelStore();
  const { postos, fetchPostos } = usePostoStore();
  const { addTransacao } = useFinancasStore();
  
  const [showPostoSelector, setShowPostoSelector] = useState(false);
  const [buscandoKm, setBuscandoKm] = useState(false);
  const [vehicleData, setVehicleData] = useState<any>(null);
  const [ultimoKm, setUltimoKm] = useState<number | null>(null);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<AbastecimentoForm>({
    resolver: zodResolver(abastecimentoSchema),
    defaultValues: {
      postoId: '',
      postoNome: '',
      tipoCombustivel: 'gasolina',
      tipoCombustivelSecundario: undefined,
      litros: '',
      litrosSecundario: '',
      precoLitro: '',
      precoLitroSecundario: '',
      valorTotal: '',
      valorTotalSecundario: '',
      kmAtual: '',
      data: new Date().toISOString().split('T')[0],
      hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      tanqueCheio: false,
      observacoes: '',
    }
  });

  const litros = useWatch({ control, name: 'litros' });
  const precoLitro = useWatch({ control, name: 'precoLitro' });
  const litrosSecundario = useWatch({ control, name: 'litrosSecundario' });
  const precoLitroSecundario = useWatch({ control, name: 'precoLitroSecundario' });
  const tipoCombustivel = useWatch({ control, name: 'tipoCombustivel' });

  useEffect(() => {
    fetchPostos();
    fetchVehicleData();
    const { abastecimentos } = useCombustivelStore.getState();
    if (abastecimentos.length > 0) {
      setUltimoKm(abastecimentos[0].kmAtual);
    }
  }, []);

  // Buscar dados do veículo
  const fetchVehicleData = async () => {
    try {
      const authUser = getAuth().currentUser;
      if (!authUser) return;
      
      const db = getFirestore();
      const userRef = doc(db, 'users', authUser.uid);
      const docSnap = await getDoc(userRef);
      const data = docSnap.data();
      
      if (data?.vehicle) {
        setVehicleData(data.vehicle);
        // Configurar combustível baseado no veículo
        if (data.vehicle.combustivel === 'GNV') {
          setValue('tipoCombustivel', 'gnv');
          if (data.vehicle.combustivelSecundario) {
            const combustivelSecundario = data.vehicle.combustivelSecundario.toLowerCase();
            if (combustivelSecundario === 'gasolina' || combustivelSecundario === 'etanol' || combustivelSecundario === 'diesel') {
              setValue('tipoCombustivelSecundario', combustivelSecundario as 'gasolina' | 'etanol' | 'diesel');
            }
          }
        } else {
          const combustivel = data.vehicle.combustivel.toLowerCase();
          if (combustivel === 'gasolina' || combustivel === 'etanol' || combustivel === 'diesel') {
            setValue('tipoCombustivel', combustivel as 'gasolina' | 'etanol' | 'diesel');
          }
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados do veículo:', error);
    }
  };

  // Buscar KM atual do último abastecimento
  const buscarKmAtual = async () => {
    setBuscandoKm(true);
    try {
      const { abastecimentos } = useCombustivelStore.getState();
      if (abastecimentos.length > 0) {
        const ultimoAbastecimento = abastecimentos[0];
        setValue('kmAtual', ultimoAbastecimento.kmAtual.toString());
        Alert.alert('Sucesso', `KM atual carregado: ${ultimoAbastecimento.kmAtual}`);
      } else {
        Alert.alert('Aviso', 'Nenhum abastecimento anterior encontrado. Preencha manualmente.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível buscar o KM atual.');
    } finally {
      setBuscandoKm(false);
    }
  };

  // Calcular valor total automaticamente
  useEffect(() => {
    const litrosNum = parseFloat(litros) || 0;
    const precoNum = parseFloat(precoLitro) || 0;
    const total = litrosNum * precoNum;
    
    if (total > 0) {
      setValue('valorTotal', total.toFixed(2));
    }
  }, [litros, precoLitro, setValue]);

  // Calcular valor total secundário automaticamente
  useEffect(() => {
    const litrosNum = litrosSecundario ? parseFloat(litrosSecundario) : 0;
    const precoNum = precoLitroSecundario ? parseFloat(precoLitroSecundario) : 0;
    const total = litrosNum * precoNum;
    
    if (total > 0) {
      setValue('valorTotalSecundario', total.toFixed(2));
    }
  }, [litrosSecundario, precoLitroSecundario, setValue]);

  const onSubmit = async (data: AbastecimentoForm) => {
    try {
      const submitDate = new Date(`${data.data}T${data.hora || '00:00:00'}`);
      
      const abastecimentoData = {
        ...data,
        litros: parseFloat(data.litros),
        precoLitro: parseFloat(data.precoLitro),
        valorTotal: parseFloat(data.valorTotal),
        kmAtual: parseFloat(data.kmAtual),
        data: submitDate,
        tanqueCheio: data.tanqueCheio,
        // Dados do combustível secundário se aplicável
        litrosSecundario: data.litrosSecundario && data.litrosSecundario !== '' ? parseFloat(data.litrosSecundario) : undefined,
        precoLitroSecundario: data.precoLitroSecundario && data.precoLitroSecundario !== '' ? parseFloat(data.precoLitroSecundario) : undefined,
        valorTotalSecundario: data.valorTotalSecundario && data.valorTotalSecundario !== '' ? parseFloat(data.valorTotalSecundario) : undefined,
        tipoCombustivelSecundario: data.tipoCombustivelSecundario,
      };

      const novoAbastecimento = await addAbastecimento(abastecimentoData);

      // Adicionar transação financeira automaticamente
      const valorTotalTransacao = parseFloat(data.valorTotal) + (data.valorTotalSecundario && data.valorTotalSecundario !== '' ? parseFloat(data.valorTotalSecundario) : 0);
      
      await addTransacao({
        id: Date.now().toString(),
        uid: '',
        titulo: `Abastecimento - ${data.postoNome}`,
        valor: valorTotalTransacao,
        tipo: 'despesa',
        categoria: {
          nome: 'combustivel',
          icone: 'local-gas-station',
          cor: '#4CAF50'
        },
        metodoPagamento: 'dinheiro',
        data: submitDate.toISOString(),
        observacao: `Combustível: ${data.tipoCombustivel}${data.tipoCombustivelSecundario ? ` + ${data.tipoCombustivelSecundario}` : ''}, ${data.litros}L${data.litrosSecundario && data.litrosSecundario !== '' ? ` + ${data.litrosSecundario}L` : ''}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      Alert.alert(
        'Sucesso',
        'Abastecimento registrado com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o abastecimento. Tente novamente.');
    }
  };

  const handleSelectPosto = (posto: any) => {
    setValue('postoId', posto.id);
    setValue('postoNome', posto.nome);
    setShowPostoSelector(false);
  };

  const handleAddNewPosto = () => {
    setShowPostoSelector(false);
    Alert.alert('Em desenvolvimento', 'Funcionalidade de adicionar posto em breve!');
  };

  const isGNV = tipoCombustivel === 'gnv';

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Novo Abastecimento</Text>
          <View style={{ width: 40 }} />{/* Placeholder to balance the back button */}
        </View>

        {/* Informações do Veículo */}
        <VehicleInfoCard style={styles.vehicleInfo} />

        {/* Form */}
        <View style={styles.form}>
          {/* Data e Hora */}
          <View style={styles.row}>
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>Data *</Text>
              <View style={styles.inputIconRow}>
                <MaterialIcons name="event" size={20} color="#666" style={styles.inputIcon} />
                <Controller
                  control={control}
                  name="data"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={[styles.input, styles.flexInput, errors.data && styles.inputError]}
                      value={value}
                      onChangeText={onChange}
                      placeholder="YYYY-MM-DD"
                    />
                  )}
                />
              </View>
              {errors.data && <Text style={styles.errorText}>{errors.data.message}</Text>}
            </View>
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>Hora *</Text>
              <View style={styles.inputIconRow}>
                <MaterialIcons name="access-time" size={20} color="#666" style={styles.inputIcon} />
                <Controller
                  control={control}
                  name="hora"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={[styles.input, styles.flexInput, errors.hora && styles.inputError]}
                      value={value}
                      onChangeText={onChange}
                      placeholder="HH:MM"
                    />
                  )}
                />
              </View>
              {errors.hora && <Text style={styles.errorText}>{errors.hora.message}</Text>}
            </View>
          </View>

          {/* KM Atual */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Odômetro *</Text>
            <View style={styles.inputIconRow}>
              <MaterialIcons name="speed" size={20} color="#666" style={styles.inputIcon} />
              <Controller
                control={control}
                name="kmAtual"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, styles.flexInput, errors.kmAtual && styles.inputError]}
                    value={value}
                    onChangeText={onChange}
                    placeholder="0"
                    keyboardType="numeric"
                    returnKeyType="next"
                  />
                )}
              />
              <TouchableOpacity onPress={buscarKmAtual} style={styles.buscarBtn} disabled={buscandoKm}>
                <MaterialIcons name="search" size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>
            {ultimoKm && <Text style={styles.hintText}>Último odômetro: {ultimoKm} km</Text>}
            {errors.kmAtual && <Text style={styles.errorText}>{errors.kmAtual.message}</Text>}
          </View>
          
          {/* Tipo de Combustível Principal */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Tipo de Combustível Principal *</Text>
            <Controller
              control={control}
              name="tipoCombustivel"
              render={({ field: { onChange, value } }) => (
                <View style={styles.combustivelOptions}>
                  <TouchableOpacity
                    style={[
                      styles.combustivelOption,
                      value === 'gasolina' && styles.combustivelOptionActive
                    ]}
                    onPress={() => onChange('gasolina')}
                  >
                    <MaterialIcons 
                      name="local-gas-station" 
                      size={20} 
                      color={value === 'gasolina' ? '#fff' : '#4CAF50'} 
                    />
                    <Text style={[
                      styles.combustivelOptionText,
                      value === 'gasolina' && styles.combustivelOptionTextActive
                    ]}>
                      Gasolina
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.combustivelOption,
                      value === 'etanol' && styles.combustivelOptionActive
                    ]}
                    onPress={() => onChange('etanol')}
                  >
                    <MaterialIcons 
                      name="local-gas-station" 
                      size={20} 
                      color={value === 'etanol' ? '#fff' : '#FF9800'} 
                    />
                    <Text style={[
                      styles.combustivelOptionText,
                      value === 'etanol' && styles.combustivelOptionTextActive
                    ]}>
                      Etanol
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.combustivelOption,
                      value === 'diesel' && styles.combustivelOptionActive
                    ]}
                    onPress={() => onChange('diesel')}
                  >
                    <MaterialIcons 
                      name="local-gas-station" 
                      size={20} 
                      color={value === 'diesel' ? '#fff' : '#2196F3'} 
                    />
                    <Text style={[
                      styles.combustivelOptionText,
                      value === 'diesel' && styles.combustivelOptionTextActive
                    ]}>
                      Diesel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.combustivelOption,
                      value === 'gnv' && styles.combustivelOptionActive
                    ]}
                    onPress={() => onChange('gnv')}
                  >
                    <MaterialIcons 
                      name="local-gas-station" 
                      size={20} 
                      color={value === 'gnv' ? '#fff' : '#9C27B0'} 
                    />
                    <Text style={[
                      styles.combustivelOptionText,
                      value === 'gnv' && styles.combustivelOptionTextActive
                    ]}>
                      GNV
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.tipoCombustivel && <Text style={styles.errorText}>{errors.tipoCombustivel.message}</Text>}
          </View>

          {/* Combustível Secundário (apenas para GNV) */}
          {isGNV && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Combustível Secundário *</Text>
              <Controller
                control={control}
                name="tipoCombustivelSecundario"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.combustivelOptions}>
                    <TouchableOpacity
                      style={[
                        styles.combustivelOption,
                        value === 'gasolina' && styles.combustivelOptionActive
                      ]}
                      onPress={() => onChange('gasolina')}
                    >
                      <MaterialIcons 
                        name="local-gas-station" 
                        size={20} 
                        color={value === 'gasolina' ? '#fff' : '#4CAF50'} 
                      />
                      <Text style={[
                        styles.combustivelOptionText,
                        value === 'gasolina' && styles.combustivelOptionTextActive
                      ]}>
                        Gasolina
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.combustivelOption,
                        value === 'etanol' && styles.combustivelOptionActive
                      ]}
                      onPress={() => onChange('etanol')}
                    >
                      <MaterialIcons 
                        name="local-gas-station" 
                        size={20} 
                        color={value === 'etanol' ? '#fff' : '#FF9800'} 
                      />
                      <Text style={[
                        styles.combustivelOptionText,
                        value === 'etanol' && styles.combustivelOptionTextActive
                      ]}>
                        Etanol
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.combustivelOption,
                        value === 'diesel' && styles.combustivelOptionActive
                      ]}
                      onPress={() => onChange('diesel')}
                    >
                      <MaterialIcons 
                        name="local-gas-station" 
                        size={20} 
                        color={value === 'diesel' ? '#fff' : '#2196F3'} 
                      />
                      <Text style={[
                        styles.combustivelOptionText,
                        value === 'diesel' && styles.combustivelOptionTextActive
                      ]}>
                        Diesel
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
              {errors.tipoCombustivelSecundario && <Text style={styles.errorText}>{errors.tipoCombustivelSecundario.message}</Text>}
            </View>
          )}

          {/* Seção do Combustível Principal */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {isGNV ? 'GNV' : 'Combustível Principal'}
            </Text>
          </View>

          {/* Litros e Preço - Combustível Principal */}
          <View style={styles.row}>
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>{isGNV ? 'm³' : 'Litros'} *</Text>
              <View style={styles.inputIconRow}>
                <MaterialIcons name="water-drop" size={20} color="#666" style={styles.inputIcon} />
                <Controller
                  control={control}
                  name="litros"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={[styles.input, styles.flexInput, errors.litros && styles.inputError]}
                      value={value}
                      onChangeText={onChange}
                      placeholder="0.00"
                      keyboardType="numeric"
                      returnKeyType="next"
                    />
                  )}
                />
              </View>
              {errors.litros && <Text style={styles.errorText}>{errors.litros.message}</Text>}
            </View>
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>Preço por {isGNV ? 'm³' : 'Litro'} (R$) *</Text>
              <View style={styles.inputIconRow}>
                <MaterialIcons name="attach-money" size={20} color="#666" style={styles.inputIcon} />
                <Controller
                  control={control}
                  name="precoLitro"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={[styles.input, styles.flexInput, errors.precoLitro && styles.inputError]}
                      value={value}
                      onChangeText={onChange}
                      placeholder="0.000"
                      keyboardType="numeric"
                      returnKeyType="next"
                    />
                  )}
                />
              </View>
              {errors.precoLitro && <Text style={styles.errorText}>{errors.precoLitro.message}</Text>}
            </View>
          </View>

          {/* Valor Total - Combustível Principal */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Valor Total (R$)</Text>
            <View style={styles.inputIconRow}>
              <MaterialIcons name="receipt" size={20} color="#666" style={styles.inputIcon} />
              <Controller
                control={control}
                name="valorTotal"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, styles.flexInput, styles.totalInput]}
                    value={value}
                    onChangeText={onChange}
                    placeholder="0.00"
                    keyboardType="numeric"
                    editable={false}
                  />
                )}
              />
            </View>
            {errors.valorTotal && <Text style={styles.errorText}>{errors.valorTotal.message}</Text>}
          </View>

          {/* Seção do Combustível Secundário (apenas para GNV) */}
          {isGNV && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  Combustível Secundário ({watch('tipoCombustivelSecundario')})
                </Text>
              </View>

              {/* Litros e Preço - Combustível Secundário */}
              <View style={styles.row}>
                <View style={[styles.formGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Litros *</Text>
                  <View style={styles.inputIconRow}>
                    <MaterialIcons name="water-drop" size={20} color="#666" style={styles.inputIcon} />
                    <Controller
                      control={control}
                      name="litrosSecundario"
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          style={[styles.input, styles.flexInput, errors.litrosSecundario && styles.inputError]}
                          value={value}
                          onChangeText={onChange}
                          placeholder="0.00"
                          keyboardType="numeric"
                          returnKeyType="next"
                        />
                      )}
                    />
                  </View>
                  {errors.litrosSecundario && <Text style={styles.errorText}>{errors.litrosSecundario.message}</Text>}
                </View>
                <View style={[styles.formGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Preço por Litro (R$) *</Text>
                  <View style={styles.inputIconRow}>
                    <MaterialIcons name="attach-money" size={20} color="#666" style={styles.inputIcon} />
                    <Controller
                      control={control}
                      name="precoLitroSecundario"
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          style={[styles.input, styles.flexInput, errors.precoLitroSecundario && styles.inputError]}
                          value={value}
                          onChangeText={onChange}
                          placeholder="0.000"
                          keyboardType="numeric"
                          returnKeyType="next"
                        />
                      )}
                    />
                  </View>
                  {errors.precoLitroSecundario && <Text style={styles.errorText}>{errors.precoLitroSecundario.message}</Text>}
                </View>
              </View>

              {/* Valor Total - Combustível Secundário */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Valor Total (R$)</Text>
                <View style={styles.inputIconRow}>
                  <MaterialIcons name="receipt" size={20} color="#666" style={styles.inputIcon} />
                  <Controller
                    control={control}
                    name="valorTotalSecundario"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        style={[styles.input, styles.flexInput, styles.totalInput]}
                        value={value}
                        onChangeText={onChange}
                        placeholder="0.00"
                        keyboardType="numeric"
                        editable={false}
                      />
                    )}
                  />
                </View>
                {errors.valorTotalSecundario && <Text style={styles.errorText}>{errors.valorTotalSecundario.message}</Text>}
              </View>
            </>
          )}

          {/* Tanque Cheio */}
          <View style={styles.toggleRow}>
            <MaterialIcons name="local-gas-station" size={20} color="#666" style={styles.inputIcon} />
            <Text style={styles.label}>Está completando o tanque?</Text>
            <Controller
              control={control}
              name="tanqueCheio"
              render={({ field: { onChange, value } }) => (
                <Switch
                  value={value}
                  onValueChange={onChange}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={value ? '#f5dd4b' : '#f4f3f4'}
                />
              )}
            />
          </View>
          {errors.tanqueCheio && <Text style={styles.errorText}>{errors.tanqueCheio.message}</Text>}

          {/* Posto */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Posto de combustível *</Text>
            <TouchableOpacity 
              style={[styles.input, styles.postoInput, errors.postoNome && styles.inputError]} 
              onPress={() => setShowPostoSelector(true)}
            >
              <View style={styles.inputContent}>
                <MaterialIcons name="place" size={20} color="#666" />
                <Text style={watch('postoNome') ? styles.inputText : styles.placeholderText}>
                  {watch('postoNome') || 'Selecionar posto'}
                </Text>
              </View>
              <MaterialIcons name="arrow-drop-down" size={24} color="#666" />
            </TouchableOpacity>
            {errors.postoNome && <Text style={styles.errorText}>{errors.postoNome.message}</Text>}
          </View>

          {/* Mais Opções */}
          <TouchableOpacity onPress={() => setShowMoreOptions(!showMoreOptions)} style={styles.moreOptionsButton}>
            <MaterialIcons name={showMoreOptions ? 'remove' : 'add'} size={20} color="#007AFF" />
            <Text style={styles.moreOptionsText}>
              {showMoreOptions ? 'Menos opções' : 'Mais opções'}
            </Text>
          </TouchableOpacity>

          {showMoreOptions && (
            <>
              {/* Observações */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Observações</Text>
                <View style={styles.inputIconRow}>
                  <MaterialIcons name="note" size={20} color="#666" style={styles.inputIcon} />
                  <Controller
                    control={control}
                    name="observacoes"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        style={[styles.input, styles.flexInput, styles.textArea]}
                        value={value}
                        onChangeText={onChange}
                        placeholder="Observações sobre o abastecimento..."
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                      />
                    )}
                  />
                </View>
                {errors.observacoes && <Text style={styles.errorText}>{errors.observacoes.message}</Text>}
              </View>
            </>
          )}

        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity onPress={handleSubmit(onSubmit)} style={styles.saveButton} disabled={loading}>
          <MaterialIcons name="check" size={22} color="#fff" />
          <Text style={styles.saveButtonText}>{loading ? 'Salvando...' : 'Salvar Abastecimento'}</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de Seleção de Posto */}
      {showPostoSelector && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Posto</Text>
              <TouchableOpacity onPress={() => setShowPostoSelector(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.postosList}>
              {postos.map((posto) => (
                <TouchableOpacity
                  key={posto.id}
                  style={styles.postoItem}
                  onPress={() => handleSelectPosto(posto)}
                >
                  <MaterialIcons name="local-gas-station" size={24} color="#4CAF50" />
                  <View style={styles.postoInfo}>
                    <Text style={styles.postoNome}>{posto.nome}</Text>
                    <Text style={styles.postoEndereco}>{posto.endereco}</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color="#ccc" />
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.addPostoBtn} onPress={handleAddNewPosto}>
                <MaterialIcons name="add" size={24} color="#4CAF50" />
                <Text style={styles.addPostoText}>Adicionar Novo Posto</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  vehicleInfo: {
    marginHorizontal: 16,
    marginTop: 10,
  },
  form: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  sectionHeader: {
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    flexShrink: 1,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  postoInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  flexInput: {
    flex: 1,
  },
  inputError: {
    borderColor: '#f44336',
  },
  inputContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  inputText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
    marginLeft: 8,
  },
  totalInput: {
    backgroundColor: '#f8f9fa',
    fontWeight: 'bold',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#f44336',
    fontSize: 12,
    marginTop: 4,
  },
  hintText: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  inputIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    marginRight: 8,
  },
  buscarBtn: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#eaf4ff',
  },
  combustivelOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  combustivelOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginHorizontal: 2,
    marginBottom: 8,
    minWidth: '22%',
  },
  combustivelOptionActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  combustivelOptionText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 4,
  },
  combustivelOptionTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  moreOptionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#eaf4ff',
    marginTop: 10,
  },
  moreOptionsText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  postosList: {
    maxHeight: 400,
  },
  postoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  postoInfo: {
    flex: 1,
    marginLeft: 12,
  },
  postoNome: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  postoEndereco: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  addPostoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  addPostoText: {
    fontSize: 16,
    color: '#4CAF50',
    marginLeft: 12,
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
}); 