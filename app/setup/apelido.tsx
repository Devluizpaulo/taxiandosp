import { apelidoSqliteService } from '@/services/sqlite/apelidoSqliteService';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { z } from 'zod';

const nicknameSchema = z.object({
  apelido: z.string().optional(),
});

type NicknameForm = z.infer<typeof nicknameSchema>;

export default function SetupApelidoScreen() {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<NicknameForm>({
    resolver: zodResolver(nicknameSchema),
  });
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    apelidoSqliteService.init();
    const fetchApelido = async () => {
      const user = getAuth().currentUser;
      if (!user) return;
      const localApelido = await apelidoSqliteService.getApelido(user.uid);
      if (localApelido) {
        reset({ apelido: localApelido });
        setLoading(false);
        return;
      }
      const db = getFirestore();
      const docSnap = await getDoc(doc(db, 'users', user.uid));
      const data = docSnap.data();
      if (data?.nickname) {
        await apelidoSqliteService.saveApelido(user.uid, data.nickname);
        reset({ apelido: data.nickname });
      }
      setLoading(false);
    };
    fetchApelido();
  }, [reset]);

  const onSubmit = async (data: NicknameForm) => {
    const user = getAuth().currentUser;
    if (!user) return;
    const db = getFirestore();
    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);
    const prevStatus = docSnap.data()?.setupStatus || {};
    await setDoc(userRef, {
      nickname: data.apelido ?? '',
      setupStatus: { ...prevStatus, nickname: true },
    }, { merge: true });
    await apelidoSqliteService.saveApelido(user.uid, data.apelido ?? '');
    alert('Apelido salvo!');
    router.replace('/(tabs)');
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Apelido</Text>
      <Controller
        control={control}
        name="apelido"
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="Seu apelido (opcional)"
            value={value}
            onChangeText={onChange}
            style={styles.input}
          />
        )}
      />
      {errors.apelido && <Text style={styles.error}>{errors.apelido.message}</Text>}
      <Button title="Salvar e acessar o app" onPress={handleSubmit(onSubmit)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginBottom: 8 },
  error: { color: 'red', marginBottom: 8 },
}); 