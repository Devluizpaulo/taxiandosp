import { vehicleSqliteService } from '@/services/sqlite/vehicleSqliteService';
import { MaterialIcons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import React, { useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { ActivityIndicator, Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { z } from 'zod';

const placaRegex = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$|^[A-Z]{3}[0-9]{4}$/i;
const combustiveis = [
  'Álcool', 'Gasolina', 'Flex', 'Híbrido', 'GNV', 'Diesel'
];
const combustiveisSecundarios = [
  'Álcool', 'Gasolina', 'Flex', 'Híbrido', 'Diesel'
];

const vehicleSchema = z.object({
  marca: z.string().min(2, 'Marca obrigatória'),
  modelo: z.string().min(2, 'Modelo obrigatório'),
  ano: z.string().min(4, 'Ano obrigatório'),
  cor: z.string().min(2, 'Cor obrigatória'),
  placa: z.string().regex(placaRegex, 'Placa inválida (AAA0A00 ou ABC1234)'),
  combustivel: z.string().min(2, 'Combustível obrigatório'),
  combustivelSecundario: z.string().optional(),
  foto: z.string().optional(),
  renavam: z.string().optional(),
  alvara: z.string().optional(),
  validade: z.string().optional(),
}).refine(
  (data) => data.combustivel !== 'GNV' || (data.combustivelSecundario && data.combustivelSecundario.length > 1),
  { message: 'Combustível secundário obrigatório para GNV', path: ['combustivelSecundario'] }
);

type VehicleForm = z.infer<typeof vehicleSchema>;

// Lista de montadoras e modelos
const montadoras = [
  {
    nome: 'Chevrolet',
    modelos: ['Onix', 'Onix Plus', 'Prisma', 'Cruze', 'Tracker', 'Equinox', 'Spin', 'S10', 'Trailblazer', 'Bolt EV', 'Colorado']
  },
  {
    nome: 'Fiat',
    modelos: ['Argo', 'Cronos', 'Mobi', 'Uno', 'Palio', 'Punto', 'Siena', 'Toro', 'Strada', 'Fiorino', 'Doblò', 'Ducato', 'Fastback', 'Linea', 'Grand Siena']
  },
  {
    nome: 'Volkswagen',
    modelos: ['Gol', 'Up!', 'Fox', 'Polo', 'Virtus', 'Nivus', 'T-Cross', 'Tiguan', 'Taos', 'Amarok', 'Saveiro']
  },
  {
    nome: 'Ford',
    modelos: ['Ka', 'Ka+', 'Fiesta', 'EcoSport', 'Territory', 'Ranger', 'Maverick', 'Bronco Sport', 'F-150', 'Transit', 'Mustang', 'Mustang Mach-E']
  },
  {
    nome: 'Toyota',
    modelos: ['Etios', 'Yaris', 'Corolla', 'Corolla Cross', 'Hilux', 'SW4', 'Yaris Cross', 'Hyryder']
  },
  {
    nome: 'Honda',
    modelos: ['Fit', 'City', 'WR-V', 'HR-V', 'Civic', 'CR-V']
  },
  {
    nome: 'Renault',
    modelos: ['Kwid', 'Sandero', 'Logan', 'Stepway', 'Duster', 'Captur', 'Koleos']
  },
  {
    nome: 'Hyundai',
    modelos: ['HB20', 'HB20S', 'Creta', 'Tucson', 'Santa Fe', 'Kona']
  },
  {
    nome: 'Nissan',
    modelos: ['March', 'Versa', 'Kicks', 'Sentra', 'X-Trail', 'Frontier']
  },
  {
    nome: 'Peugeot',
    modelos: ['208', '2008', '3008', '5008', 'Partner']
  },
  {
    nome: 'Citroën',
    modelos: ['C3', 'C4 Cactus', 'AirCross', 'C5 AirCross', 'Berlingo', 'C3 Aircross']
  },
  {
    nome: 'Jeep',
    modelos: ['Renegade', 'Compass', 'Commander', 'Avenger']
  },
  {
    nome: 'Caoa Chery',
    modelos: ['Tiggo 2', 'Tiggo 5x', 'Tiggo 7', 'Tiggo 8', 'Arrizo 6', 'Arrizo 5e']
  },
  {
    nome: 'BYD',
    modelos: ['Dolphin', 'Dolphin Mini', 'Song Plus', 'Seal', 'Yuan Plus', 'Tan', 'Atto 3']
  },
  {
    nome: 'GWM',
    modelos: ['Haval H6', 'Haval H6 GT', 'Haval H2', 'Ora 03', 'Tank 300', 'Poer']
  }
];


export default function SetupVeiculoScreen() {
  const { control, handleSubmit, reset, formState: { errors }, watch, setValue } = useForm<VehicleForm>({
    resolver: zodResolver(vehicleSchema),
  });
  const [loading, setLoading] = React.useState(true);
  const [buscando, setBuscando] = React.useState(false);
  const [novaMontadora, setNovaMontadora] = React.useState('');
  const [novoModelo, setNovoModelo] = React.useState('');
  const router = useRouter();
  const combustivel = useWatch({ control, name: 'combustivel' });
  const placaValue = watch('placa');
  const marcaValue = watch('marca');
  const modeloValue = watch('modelo');

  useEffect(() => {
    vehicleSqliteService.init();
    const fetchVehicle = async () => {
      const user = getAuth().currentUser;
      if (!user) return;
      const localVehicle = await vehicleSqliteService.getVehicle(user.uid);
      if (localVehicle) {
        reset(localVehicle);
        setLoading(false);
        return;
      }
      const db = getFirestore();
      const docSnap = await getDoc(doc(db, 'users', user.uid));
      const data = docSnap.data();
      if (data?.vehicle) {
        await vehicleSqliteService.saveVehicle(user.uid, data.vehicle);
        reset(data.vehicle);
      }
      setLoading(false);
    };
    fetchVehicle();
  }, [reset]);

  const onSubmit = async (data: VehicleForm) => {
    setUploading(true);
    try {
      const user = getAuth().currentUser;
      if (!user) throw new Error('Usuário não autenticado');
      const db = getFirestore();
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);
      const prevStatus = docSnap.data()?.setupStatus || {};
      await setDoc(userRef, {
        vehicle: data,
        setupStatus: { ...prevStatus, vehicle: true },
      }, { merge: true });
      await vehicleSqliteService.saveVehicle(user.uid, data);
      alert('Veículo salvo!');
      router.replace('/setup/pagamentos');
    } catch (err: any) {
      alert('Erro ao salvar veículo: ' + (err?.message || err));
    } finally {
      setUploading(false);
    }
  };

  // Função para buscar dados pela placa
  const buscarPorPlaca = async () => {
    if (!placaValue || placaValue.length < 7) {
      alert('Digite uma placa válida');
      return;
    }
    setBuscando(true);
    try {
      const res = await fetch(`https://brasilapi.com.br/api/placa/v1/${placaValue}`);
      if (!res.ok) throw new Error('Placa não encontrada');
      const data = await res.json();
      const { modelo, marca, cor, ano } = data;
      setValue('modelo', modelo || '');
      setValue('marca', marca || '');
      setValue('cor', cor || '');
      setValue('ano', ano ? String(ano) : '');
    } catch (err) {
      alert('Não foi possível encontrar dados para esta placa.');
    } finally {
      setBuscando(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastro do Veículo</Text>
      {/* Montadora */}
      <View style={styles.inputIconRow}>
        <MaterialIcons name="directions-car" size={22} color="#888" style={styles.inputIcon} />
        <Controller
          control={control}
          name="marca"
          render={({ field: { onChange, value } }) => (
            <View style={[styles.pickerContainer, { flex: 1 }]}>
              <Picker
                selectedValue={value}
                onValueChange={val => {
                  onChange(val);
                  setValue('modelo', ''); // Limpa modelo ao trocar montadora
                  setNovaMontadora('');
                }}
                style={styles.picker}
              >
                <Picker.Item label="Selecione a montadora" value="" />
                {montadoras.map(m => (
                  <Picker.Item key={m.nome} label={m.nome} value={m.nome} />
                ))}
                <Picker.Item label="Outra (cadastrar nova)" value="__outra__" />
              </Picker>
              {value === '__outra__' && (
                <TextInput
                  placeholder="Digite a montadora"
                  value={novaMontadora}
                  onChangeText={text => {
                    setNovaMontadora(text);
                    onChange(text);
                  }}
                  style={styles.input}
                  autoFocus
                />
              )}
            </View>
          )}
        />
      </View>
      {errors.marca && <Text style={styles.error}>{errors.marca.message}</Text>}
      {/* Modelo */}
      <View style={styles.inputIconRow}>
        <MaterialIcons name="commute" size={22} color="#888" style={styles.inputIcon} />
        <Controller
          control={control}
          name="modelo"
          render={({ field: { onChange, value } }) => (
            <View style={[styles.pickerContainer, { flex: 1 }]}>
              <Picker
                selectedValue={value}
                onValueChange={val => {
                  onChange(val);
                  setNovoModelo('');
                }}
                style={styles.picker}
                enabled={!!marcaValue}
              >
                <Picker.Item label={marcaValue ? 'Selecione o modelo' : 'Escolha a montadora primeiro'} value="" />
                {marcaValue && montadoras.find(m => m.nome === marcaValue)?.modelos.map(modelo => (
                  <Picker.Item key={modelo} label={modelo} value={modelo} />
                ))}
                {marcaValue && <Picker.Item label="Outro (cadastrar novo)" value="__outro__" />}
              </Picker>
              {value === '__outro__' && (
                <TextInput
                  placeholder="Digite o modelo"
                  value={novoModelo}
                  onChangeText={text => {
                    setNovoModelo(text);
                    onChange(text);
                  }}
                  style={styles.input}
                  autoFocus
                />
              )}
            </View>
          )}
        />
      </View>
      {errors.modelo && <Text style={styles.error}>{errors.modelo.message}</Text>}
      {/* Ano */}
      <Controller
        control={control}
        name="ano"
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputIconRow}>
            <MaterialIcons name="event" size={22} color="#888" style={styles.inputIcon} />
            <TextInput
              placeholder="Ano"
              value={value}
              onChangeText={onChange}
              style={styles.input}
              keyboardType="numeric"
              maxLength={4}
            />
          </View>
        )}
      />
      {errors.ano && <Text style={styles.error}>{errors.ano.message}</Text>}
      {/* Cor */}
      <Controller
        control={control}
        name="cor"
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputIconRow}>
            <MaterialIcons name="palette" size={22} color="#888" style={styles.inputIcon} />
            <TextInput
              placeholder="Cor"
              value={value}
              onChangeText={onChange}
              style={styles.input}
            />
          </View>
        )}
      />
      {errors.cor && <Text style={styles.error}>{errors.cor.message}</Text>}
      {/* Placa + Botão Buscar */}
      <View style={styles.inputIconRow}>
        <MaterialIcons name="confirmation-number" size={22} color="#888" style={styles.inputIcon} />
        <Controller
          control={control}
          name="placa"
          render={({ field: { onChange, value } }) => (
            <TextInput
              placeholder="Placa (AAA0A00 ou ABC1234)"
              value={value}
              onChangeText={onChange}
              style={[styles.input, { flex: 1 }]}
              autoCapitalize="characters"
              maxLength={8}
            />
          )}
        />
        <TouchableOpacity onPress={buscarPorPlaca} style={styles.buscarBtn} disabled={buscando}>
          <MaterialIcons name="search" size={22} color="#007AFF" />
        </TouchableOpacity>
      </View>
      {errors.placa && <Text style={styles.error}>{errors.placa.message}</Text>}
      {/* Combustível */}
      <View style={styles.inputIconRow}>
        <MaterialIcons name="local-gas-station" size={22} color="#888" style={styles.inputIcon} />
        <Controller
          control={control}
          name="combustivel"
          render={({ field: { onChange, value } }) => (
            <View style={[styles.pickerContainer, { flex: 1 }]}>
              <Picker
                selectedValue={value}
                onValueChange={onChange}
                style={styles.picker}
              >
                <Picker.Item label="Selecione" value="" />
                {combustiveis.map((c) => (
                  <Picker.Item key={c} label={c} value={c} />
                ))}
              </Picker>
            </View>
          )}
        />
      </View>
      {errors.combustivel && <Text style={styles.error}>{errors.combustivel.message}</Text>}
      {/* Combustível Secundário */}
      {combustivel === 'GNV' && (
        <View style={styles.inputIconRow}>
          <MaterialIcons name="local-gas-station" size={22} color="#888" style={styles.inputIcon} />
          <Controller
            control={control}
            name="combustivelSecundario"
            render={({ field: { onChange, value } }) => (
              <View style={[styles.pickerContainer, { flex: 1 }]}>
                <Picker
                  selectedValue={value}
                  onValueChange={onChange}
                  style={styles.picker}
                >
                  <Picker.Item label="Selecione" value="" />
                  {combustiveisSecundarios.map((c) => (
                    <Picker.Item key={c} label={c} value={c} />
                  ))}
                </Picker>
              </View>
            )}
          />
        </View>
      )}
      {errors.combustivelSecundario && <Text style={styles.error}>{errors.combustivelSecundario.message}</Text>}
      {/* Foto */}
      <Controller
        control={control}
        name="foto"
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="URL da foto do veículo (opcional)"
            value={value}
            onChangeText={onChange}
            style={styles.input}
          />
        )}
      />
      {/* Renavam */}
      <Controller
        control={control}
        name="renavam"
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="RENAVAM (opcional)"
            value={value}
            onChangeText={onChange}
            style={styles.input}
          />
        )}
      />
      {/* Alvará */}
      <Controller
        control={control}
        name="alvara"
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="Alvará (opcional)"
            value={value}
            onChangeText={onChange}
            style={styles.input}
          />
        )}
      />
      {/* Validade */}
      <Controller
        control={control}
        name="validade"
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="Validade (opcional)"
            value={value}
            onChangeText={onChange}
            style={styles.input}
          />
        )}
      />
      <Button title="Salvar e continuar" onPress={handleSubmit(onSubmit)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginBottom: 8, backgroundColor: '#fff', fontSize: 16 },
  error: { color: 'red', marginBottom: 8 },
  pickerContainer: { marginBottom: 8 },
  picker: { backgroundColor: '#f5f5f5', borderRadius: 8 },
  label: { fontWeight: 'bold', marginBottom: 4 },
  inputIconRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  inputIcon: { marginRight: 8 },
  buscarBtn: { marginLeft: 8, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: '#eaf4ff' },
}); 