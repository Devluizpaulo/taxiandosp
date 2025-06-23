import { MaterialIcons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { z } from 'zod';

const cnhRegex = /^\d{11}$/;

const profileSchema = z.object({
  nome: z.string().min(2, 'Nome obrigatório'),
  cnh: z.string().regex(cnhRegex, 'CNH deve ter 11 dígitos numéricos'),
  telefone: z.string().min(8, 'Telefone obrigatório'),
  foto: z.string().optional(),
  alvara: z.string().optional(),
  licenca: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ConfiguracoesPerfilScreen() {
  const { control, handleSubmit, setValue, formState: { errors }, reset, watch } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const foto = watch('foto');

  useEffect(() => {
    const fetchProfile = async () => {
      const user = getAuth().currentUser;
      if (!user) return;
      const db = getFirestore();
      const docSnap = await getDoc(doc(db, 'users', user.uid));
      const data = docSnap.data();
      if (data?.profile) {
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
      const cleanData = {
        ...data,
        foto: data.foto ?? '',
        alvara: data.alvara ?? '',
        licenca: data.licenca ?? '',
      };
      await setDoc(userRef, {
        profile: cleanData,
        setupStatus: { ...prevStatus, profile: true },
      }, { merge: true });
      alert('Perfil salvo!');
      router.back();
    } catch (err: any) {
      alert('Erro ao salvar perfil: ' + (err?.message || err));
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Editar Perfil</Text>
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
      <TouchableOpacity style={styles.saveButton} onPress={handleSubmit(onSubmit)} disabled={uploading}>
        <Text style={styles.saveButtonText}>{uploading ? 'Salvando...' : 'Salvar Alterações'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#f5f5f5' },
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
  saveButton: { backgroundColor: '#007AFF', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
}); 