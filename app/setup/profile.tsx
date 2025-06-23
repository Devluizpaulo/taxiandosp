import { profileSqliteService } from '@/services/sqlite/profileSqliteService';
import { MaterialIcons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Button, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { z } from 'zod';

const cnhRegex = /^\d{11}$/;
const validadeRegex = /^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/; // MM/AA ou MM/AAAA

const profileSchema = z.object({
  nome: z.string().min(2, 'Nome obrigatório'),
  cnh: z.string().regex(cnhRegex, 'CNH deve ter 11 dígitos numéricos'),
  validadeDia: z.string().min(1, 'Dia obrigatório'),
  validadeMes: z.string().min(1, 'Mês obrigatório'),
  validadeAno: z.string().min(2, 'Ano obrigatório'),
  telefone: z.string().min(8, 'Telefone obrigatório'),
  foto: z.string().optional(),
  alvara: z.string().optional(),
  licenca: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function SetupProfileScreen() {
  const { control, handleSubmit, setValue, formState: { errors }, reset, watch } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const foto = watch('foto');

  useEffect(() => {
    profileSqliteService.init(); // Inicializa tabela local
    const fetchProfile = async () => {
      const user = getAuth().currentUser;
      if (!user) return;
      // 1. Tenta buscar localmente
      const localProfile = await profileSqliteService.getProfile(user.uid);
      if (localProfile) {
        reset(localProfile);
        setLoading(false);
        return;
      }
      // 2. Se não houver local, busca do Firestore e sincroniza local
      const db = getFirestore();
      const docSnap = await getDoc(doc(db, 'users', user.uid));
      const data = docSnap.data();
      if (data?.profile) {
        await profileSqliteService.saveProfile(user.uid, data.profile);
        reset(data.profile);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [reset]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets.length > 0) {
      setValue('foto', result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets.length > 0) {
      setValue('foto', result.assets[0].uri);
    }
  };

  const onSubmit = async (data: ProfileForm) => {
    setUploading(true);
    try {
      const user = getAuth().currentUser;
      if (!user) throw new Error('Usuário não autenticado');
      const db = getFirestore();
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);
      const prevStatus = docSnap.data()?.setupStatus || {};
      // Garante que campos opcionais não sejam undefined
      const cleanData = {
        ...data,
        foto: data.foto ?? '',
        alvara: data.alvara ?? '',
        licenca: data.licenca ?? '',
      };
      // Salva no Firestore
      await setDoc(userRef, {
        profile: cleanData,
        setupStatus: { ...prevStatus, profile: true },
      }, { merge: true });
      // Salva localmente
      await profileSqliteService.saveProfile(user.uid, cleanData);
      alert('Perfil salvo!');
      router.replace('/setup/veiculo');
    } catch (err: any) {
      alert('Erro ao salvar perfil: ' + (err?.message || err));
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil do Taxista</Text>
      <View style={styles.fotoContainer}>
        {foto ? (
          <Image source={{ uri: foto }} style={styles.fotoPreview} />
        ) : (
          <MaterialIcons name="account-circle" size={80} color="#ccc" />
        )}
        <View style={styles.fotoBtns}>
          <TouchableOpacity style={styles.fotoBtn} onPress={pickImage}>
            <MaterialIcons name="photo-library" size={24} color="#007AFF" />
            <Text style={styles.fotoBtnText}>Galeria</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.fotoBtn} onPress={takePhoto}>
            <MaterialIcons name="photo-camera" size={24} color="#007AFF" />
            <Text style={styles.fotoBtnText}>Selfie</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Controller
        control={control}
        name="nome"
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputIconRow}>
            <MaterialIcons name="person" size={22} color="#888" style={styles.inputIcon} />
            <TextInput
              placeholder="Nome completo"
              value={value}
              onChangeText={onChange}
              style={styles.input}
            />
          </View>
        )}
      />
      {errors.nome && <Text style={styles.error}>{errors.nome.message}</Text>}
      <Controller
        control={control}
        name="telefone"
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputIconRow}>
            <MaterialIcons name="phone" size={22} color="#888" style={styles.inputIcon} />
            <TextInput
              placeholder="Telefone com WhatsApp"
              value={value}
              onChangeText={onChange}
              style={styles.input}
              keyboardType="phone-pad"
            />
          </View>
        )}
      />
      {errors.telefone && <Text style={styles.error}>{errors.telefone.message}</Text>}
      <Controller
        control={control}
        name="cnh"
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputIconRow}>
            <MaterialIcons name="credit-card" size={22} color="#888" style={styles.inputIcon} />
            <TextInput
              placeholder="Número da CNH (11 dígitos)"
              value={value}
              onChangeText={onChange}
              style={styles.input}
              keyboardType="numeric"
              maxLength={11}
            />
          </View>
        )}
      />
      {errors.cnh && <Text style={styles.error}>{errors.cnh.message}</Text>}
      <Text style={styles.label}>Validade da CNH</Text>
      <View style={styles.validadeRow}>
        <Controller
          control={control}
          name="validadeDia"
          render={({ field: { onChange, value } }) => (
            <TextInput
              placeholder="DD"
              value={value}
              onChangeText={onChange}
              style={[styles.input, styles.validadeInput]}
              keyboardType="numeric"
              maxLength={2}
            />
          )}
        />
        <Text style={styles.validadeSep}>/</Text>
        <Controller
          control={control}
          name="validadeMes"
          render={({ field: { onChange, value } }) => (
            <TextInput
              placeholder="MM"
              value={value}
              onChangeText={onChange}
              style={[styles.input, styles.validadeInput]}
              keyboardType="numeric"
              maxLength={2}
            />
          )}
        />
        <Text style={styles.validadeSep}>/</Text>
        <Controller
          control={control}
          name="validadeAno"
          render={({ field: { onChange, value } }) => (
            <TextInput
              placeholder="AAAA"
              value={value}
              onChangeText={onChange}
              style={[styles.input, styles.validadeInputAno]}
              keyboardType="numeric"
              maxLength={4}
            />
          )}
        />
      </View>
      {(errors.validadeDia || errors.validadeMes || errors.validadeAno) && (
        <Text style={styles.error}>
          {errors.validadeDia?.message || errors.validadeMes?.message || errors.validadeAno?.message}
        </Text>
      )}
      <Controller
        control={control}
        name="alvara"
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputIconRow}>
            <MaterialIcons name="verified-user" size={22} color="#888" style={styles.inputIcon} />
            <TextInput
              placeholder="Alvará (opcional)"
              value={value}
              onChangeText={onChange}
              style={styles.input}
            />
          </View>
        )}
      />
      <Controller
        control={control}
        name="licenca"
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputIconRow}>
            <MaterialIcons name="badge" size={22} color="#888" style={styles.inputIcon} />
            <TextInput
              placeholder="Licença profissional (opcional)"
              value={value}
              onChangeText={onChange}
              style={styles.input}
            />
          </View>
        )}
      />
      <Button title={uploading ? 'Salvando...' : 'Salvar e continuar'} onPress={handleSubmit(onSubmit)} disabled={uploading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  fotoContainer: { alignItems: 'center', marginBottom: 16 },
  fotoPreview: { width: 100, height: 100, borderRadius: 50, marginBottom: 8 },
  fotoBtns: { flexDirection: 'row', gap: 12 },
  fotoBtn: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 8 },
  fotoBtnText: { marginLeft: 4, color: '#007AFF', fontWeight: 'bold' },
  inputIconRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, fontSize: 16, backgroundColor: '#fff' },
  error: { color: 'red', marginBottom: 8 },
  label: { fontWeight: 'bold', marginBottom: 4, marginTop: 8 },
  validadeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  validadeInput: { width: 40, textAlign: 'center', marginRight: 4 },
  validadeInputAno: { width: 60, textAlign: 'center' },
  validadeSep: { fontSize: 18, marginHorizontal: 2 },
}); 