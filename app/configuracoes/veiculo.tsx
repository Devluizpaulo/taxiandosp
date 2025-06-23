import { FontAwesome } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { z } from 'zod';

const placaRegex = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$|^[A-Z]{3}[0-9]{4}$/i;
const combustiveis = [
  'Etanol', 'Gasolina', 'Flex', 'Híbrido (HEV)', 'Híbrido (PHEV)', 'GNV', 'Diesel', 'Elétrico'
];
const gnvSecondaryFuels = [
  'Etanol', 'Gasolina', 'Flex', 'Diesel'
];
const hybridLiquidFuels = ['Gasolina', 'Etanol', 'Flex'];
const cores = [
  'Preto', 'Prata', 'Branco', 'Cinza', 'Vermelho', 'Azul', 'Verde', 'Amarelo', 'Dourado', 'Outra'
];

const vehicleSchema = z.object({
  nomeVeiculo: z.string().optional(),
  marca: z.string().min(2, 'Marca obrigatória'),
  modelo: z.string().min(2, 'Modelo obrigatório'),
  ano: z.string().min(4, 'Ano obrigatório'),
  placa: z.string().regex(placaRegex, 'Placa inválida (AAA0A00 ou ABC1234)'),
  volumeTanque: z.string().optional(),
  volumeTanqueSecundario: z.string().optional(),
  chassi: z.string().optional(),
  renavam: z.string().optional(),
  cor: z.string().min(2, 'Cor obrigatória'),
  combustivel: z.string().min(2, 'Combustível obrigatório'),
  combustivelSecundario: z.string().optional(),
  foto: z.string().optional(),
  alvara: z.string().optional(),
  validade: z.string().optional(),
}).refine(
  (data) => data.combustivel !== 'GNV' || (data.combustivelSecundario && data.combustivelSecundario.length > 1),
  { message: 'Combustível secundário obrigatório para GNV', path: ['combustivelSecundario'] }
).refine(
  (data) => !data.combustivel.includes('Híbrido') || (data.combustivelSecundario && data.combustivelSecundario.length > 1),
  { message: 'Especifique o combustível líquido (Gasolina/Etanol)', path: ['combustivelSecundario'] }
);

type VehicleForm = z.infer<typeof vehicleSchema>;

const Field = ({ label, children, iconName }: { label: string, children: React.ReactNode, iconName: React.ComponentProps<typeof FontAwesome>['name'] }) => (
  <View style={styles.fieldGroup}>
    <View style={styles.fieldLabelContainer}>
      <FontAwesome name={iconName} size={14} color="#555" style={styles.icon} />
      <Text style={styles.fieldLabel}>{label}</Text>
    </View>
    {children}
  </View>
);

export default function ConfiguracoesVeiculoScreen() {
  const { control, handleSubmit, formState: { errors }, reset } = useForm<VehicleForm>({
    resolver: zodResolver(vehicleSchema),
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const combustivel = useWatch({ control, name: 'combustivel' });

  useEffect(() => {
    const fetchVehicle = async () => {
      const user = getAuth().currentUser;
      if (!user) return;
      const db = getFirestore();
      const docSnap = await getDoc(doc(db, 'users', user.uid));
      const data = docSnap.data();
      if (data?.vehicle) {
        reset(data.vehicle);
      }
      setLoading(false);
    };
    fetchVehicle();
  }, [reset]);

  const onSubmit = async (data: VehicleForm) => {
    setLoading(true);
    try {
      const user = getAuth().currentUser;
      if (!user) throw new Error('Usuário não autenticado');
      const db = getFirestore();
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);
      const prevStatus = docSnap.data()?.setupStatus || {};
      const cleanData = {
        ...data,
        nomeVeiculo: data.nomeVeiculo ?? '',
        volumeTanque: data.volumeTanque ?? '',
        volumeTanqueSecundario: data.volumeTanqueSecundario ?? '',
        chassi: data.chassi ?? '',
        combustivelSecundario: data.combustivelSecundario ?? '',
        foto: data.foto ?? '',
        renavam: data.renavam ?? '',
        alvara: data.alvara ?? '',
        validade: data.validade ?? '',
      };
      await setDoc(userRef, {
        vehicle: cleanData,
        setupStatus: { ...prevStatus, vehicle: true },
      }, { merge: true });
      alert('Veículo salvo!');
      router.replace('/');
    } catch (err: any) {
      alert('Erro ao salvar veículo: ' + (err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  const renderCapacityFields = () => {
    switch (combustivel) {
      case 'Híbrido (PHEV)':
        return (
          <View style={styles.row}>
            <Field label="Tanque (L)" iconName="tint">
              <Controller control={control} name="volumeTanque" render={({ field: { onChange, value } }) => (<TextInput value={value} onChangeText={onChange} style={styles.fieldValue} placeholder="45" keyboardType="numeric" />)} />
              {errors.volumeTanque && <Text style={styles.error}>{errors.volumeTanque.message}</Text>}
            </Field>
            <Field label="Bateria (kWh)" iconName="bolt">
              <Controller control={control} name="volumeTanqueSecundario" render={({ field: { onChange, value } }) => (<TextInput value={value} onChangeText={onChange} style={styles.fieldValue} placeholder="8.8" keyboardType="numeric" />)} />
              {errors.volumeTanqueSecundario && <Text style={styles.error}>{errors.volumeTanqueSecundario.message}</Text>}
            </Field>
          </View>
        );
      case 'Híbrido (HEV)':
        return (
          <View style={styles.row}>
            <Field label="Tanque (L)" iconName="tint">
              <Controller control={control} name="volumeTanque" render={({ field: { onChange, value } }) => (<TextInput value={value} onChangeText={onChange} style={styles.fieldValue} placeholder="45" keyboardType="numeric" />)} />
              {errors.volumeTanque && <Text style={styles.error}>{errors.volumeTanque.message}</Text>}
            </Field>
          </View>
        );
      case 'GNV':
        return (
          <View style={styles.row}>
            <Field label="Tanque Principal (L)" iconName="tint">
              <Controller control={control} name="volumeTanque" render={({ field: { onChange, value } }) => (<TextInput value={value} onChangeText={onChange} style={styles.fieldValue} placeholder="55" keyboardType="numeric" />)} />
              {errors.volumeTanque && <Text style={styles.error}>{errors.volumeTanque.message}</Text>}
            </Field>
            <Field label="GNV (m³)" iconName="cloud">
              <Controller control={control} name="volumeTanqueSecundario" render={({ field: { onChange, value } }) => (<TextInput value={value} onChangeText={onChange} style={styles.fieldValue} placeholder="15" keyboardType="numeric" />)} />
              {errors.volumeTanqueSecundario && <Text style={styles.error}>{errors.volumeTanqueSecundario.message}</Text>}
            </Field>
          </View>
        );
      case 'Elétrico':
        return (
          <View style={styles.row}>
            <Field label="Bateria (kWh)" iconName="bolt">
              <Controller control={control} name="volumeTanque" render={({ field: { onChange, value } }) => (<TextInput value={value} onChangeText={onChange} style={styles.fieldValue} placeholder="75" keyboardType="numeric" />)} />
              {errors.volumeTanque && <Text style={styles.error}>{errors.volumeTanque.message}</Text>}
            </Field>
          </View>
        );
      case 'Etanol':
      case 'Gasolina':
      case 'Flex':
      case 'Diesel':
        return (
          <View style={styles.row}>
            <Field label="Tanque (L)" iconName="tint">
              <Controller control={control} name="volumeTanque" render={({ field: { onChange, value } }) => (<TextInput value={value} onChangeText={onChange} style={styles.fieldValue} placeholder="60" keyboardType="numeric" />)} />
              {errors.volumeTanque && <Text style={styles.error}>{errors.volumeTanque.message}</Text>}
            </Field>
          </View>
        );
      default:
        return null;
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Dados do Veículo</Text>

      <View style={styles.card}>
        <Field label="Nome do veículo" iconName="car">
          <Controller
            control={control}
            name="nomeVeiculo"
            render={({ field: { onChange, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                style={styles.fieldValue}
                placeholder="Ex: Prius Prata"
              />
            )}
          />
          {errors.nomeVeiculo && <Text style={styles.error}>{errors.nomeVeiculo.message}</Text>}
        </Field>

        <View style={styles.row}>
          <Field label="Marca" iconName="copyright">
            <Controller
              control={control}
              name="marca"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  style={styles.fieldValue}
                  placeholder="Toyota"
                />
              )}
            />
            {errors.marca && <Text style={styles.error}>{errors.marca.message}</Text>}
          </Field>
          <Field label="Modelo" iconName="star">
            <Controller
              control={control}
              name="modelo"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  style={styles.fieldValue}
                  placeholder="Prius"
                />
              )}
            />
            {errors.modelo && <Text style={styles.error}>{errors.modelo.message}</Text>}
          </Field>
        </View>

        <View style={styles.row}>
          <Field label="Placa" iconName="id-card-o">
            <Controller
              control={control}
              name="placa"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  style={styles.fieldValue}
                  placeholder="ABC1234"
                  autoCapitalize="characters"
                />
              )}
            />
            {errors.placa && <Text style={styles.error}>{errors.placa.message}</Text>}
          </Field>
          <Field label="Ano" iconName="calendar">
            <Controller
              control={control}
              name="ano"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  style={styles.fieldValue}
                  placeholder="2017"
                  keyboardType="numeric"
                  maxLength={4}
                />
              )}
            />
            {errors.ano && <Text style={styles.error}>{errors.ano.message}</Text>}
          </Field>
        </View>

        {renderCapacityFields()}

        <View style={styles.row}>
          <Field label="Chassi" iconName="barcode">
            <Controller
              control={control}
              name="chassi"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  style={styles.fieldValue}
                  placeholder="9AB CDE FGH 123 456"
                />
              )}
            />
            {errors.chassi && <Text style={styles.error}>{errors.chassi.message}</Text>}
          </Field>
          <Field label="Renavam" iconName="file-text-o">
            <Controller
              control={control}
              name="renavam"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  style={styles.fieldValue}
                  placeholder="12345678901"
                  keyboardType="numeric"
                />
              )}
            />
            {errors.renavam && <Text style={styles.error}>{errors.renavam.message}</Text>}
          </Field>
        </View>
      </View>


      <Text style={styles.subtitle}>Outras Informações</Text>

      <Controller
        control={control}
        name="cor"
        render={({ field: { onChange, value } }) => (
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={value}
              onValueChange={onChange}
              style={styles.picker}
              prompt="Selecione a cor"
            >
              <Picker.Item label="Selecione a cor" value="" />
              {cores.map((c) => (
                <Picker.Item key={c} label={c} value={c} />
              ))}
            </Picker>
          </View>
        )}
      />
      {errors.cor && <Text style={styles.error}>{errors.cor.message}</Text>}

      <Controller
        control={control}
        name="combustivel"
        render={({ field: { onChange, value } }) => (
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={value}
              onValueChange={onChange}
              style={styles.picker}
              prompt="Selecione o combustível principal"
            >
              <Picker.Item label="Selecione o combustível" value="" />
              {combustiveis.map((c) => (
                <Picker.Item key={c} label={c} value={c} />
              ))}
            </Picker>
          </View>
        )}
      />
      {errors.combustivel && <Text style={styles.error}>{errors.combustivel.message}</Text>}

      {combustivel === 'GNV' && (
        <Controller
          control={control}
          name="combustivelSecundario"
          render={({ field: { onChange, value } }) => (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={value}
                onValueChange={onChange}
                style={styles.picker}
                prompt="Selecione o combustível secundário"
              >
                <Picker.Item label="Selecione o combustível secundário" value="" />
                {gnvSecondaryFuels.map((c) => (
                  <Picker.Item key={c} label={c} value={c} />
                ))}
              </Picker>
            </View>
          )}
        />
      )}
      {combustivel.includes('Híbrido') && (
        <Controller
          control={control}
          name="combustivelSecundario"
          render={({ field: { onChange, value } }) => (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={value}
                onValueChange={onChange}
                style={styles.picker}
                prompt="Selecione o combustível líquido"
              >
                <Picker.Item label="Selecione o combustível líquido" value="" />
                {hybridLiquidFuels.map((c) => (
                  <Picker.Item key={c} label={c} value={c} />
                ))}
              </Picker>
            </View>
          )}
        />
      )}
      {errors.combustivelSecundario && <Text style={styles.error}>{errors.combustivelSecundario.message}</Text>}
      
      <Controller
        control={control}
        name="alvara"
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="Alvará"
            value={value}
            onChangeText={onChange}
            style={styles.input}
          />
        )}
      />
      {errors.alvara && <Text style={styles.error}>{errors.alvara.message}</Text>}
      
      <Controller
        control={control}
        name="validade"
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="Validade do alvará (MM/AAAA)"
            value={value}
            onChangeText={onChange}
            style={styles.input}
          />
        )}
      />
      {errors.validade && <Text style={styles.error}>{errors.validade.message}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
        <Text style={styles.buttonText}>Salvar Alterações</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f4f7f9',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#2c3e50',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 12,
    color: '#34495e',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 1,
  },
  fieldGroup: {
    flex: 1,
    marginHorizontal: 5,
    marginBottom: 18,
  },
  fieldLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  icon: {
    marginRight: 8,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#555',
    fontWeight: '600',
  },
  fieldValue: {
    fontSize: 16,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#dfe6e9',
    paddingBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#dfe6e9',
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginTop: 6,
    marginHorizontal: 5,
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#dfe6e9',
    justifyContent: 'center',
  },
  picker: {
    height: 52,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
