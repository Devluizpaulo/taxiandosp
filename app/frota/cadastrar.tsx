import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Alert, Button, Text, TextInput, View } from 'react-native';
import { z } from 'zod';
import { frotaService } from '../../services/frotaService';
import { useFrotaStore } from '../../store/frotaStore';
import { Frota } from '../../types/frota';

const frotaSchema = z.object({
  nome: z.string().min(2, 'Nome obrigatório'),
  telefone: z.string().min(8, 'Telefone obrigatório'),
  pixChave: z.string().min(3, 'Pix obrigatório'),
});

type FrotaForm = z.infer<typeof frotaSchema>;

export default function CadastrarFrota() {
  const { adicionarFrota } = useFrotaStore();
  const { control, handleSubmit, formState: { errors } } = useForm<FrotaForm>({
    resolver: zodResolver(frotaSchema),
    defaultValues: { nome: '', telefone: '', pixChave: '' },
  });
  const [loading, setLoading] = useState(false);

  async function onSubmit(data: FrotaForm) {
    setLoading(true);
    try {
      const novaFrota: Frota = {
        id: Date.now().toString(),
        nome: data.nome,
        telefone: data.telefone,
        pixChave: data.pixChave,
        aceitaFeriado: false,
        aceitaDomingo: false,
        possuiGuincho: false,
        estiloCobranca: 'segunda-a-sabado',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await frotaService.salvarFrota(novaFrota);
      adicionarFrota(novaFrota);
      Alert.alert('Sucesso', 'Frota cadastrada!');
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível cadastrar a frota.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2980b9" />
        <Text style={{ marginTop: 12 }}>Salvando frota...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Cadastrar Frota</Text>
      <Text>Nome</Text>
      <Controller
        control={control}
        name="nome"
        render={({ field: { onChange, value } }) => (
          <TextInput value={value} onChangeText={onChange} style={{ borderWidth: 1, marginBottom: 4 }} />
        )}
      />
      {errors.nome && <Text style={{ color: 'red' }}>{errors.nome.message}</Text>}
      <Text>Telefone</Text>
      <Controller
        control={control}
        name="telefone"
        render={({ field: { onChange, value } }) => (
          <TextInput value={value} onChangeText={onChange} style={{ borderWidth: 1, marginBottom: 4 }} keyboardType="phone-pad" />
        )}
      />
      {errors.telefone && <Text style={{ color: 'red' }}>{errors.telefone.message}</Text>}
      <Text>Pix</Text>
      <Controller
        control={control}
        name="pixChave"
        render={({ field: { onChange, value } }) => (
          <TextInput value={value} onChangeText={onChange} style={{ borderWidth: 1, marginBottom: 4 }} />
        )}
      />
      {errors.pixChave && <Text style={{ color: 'red' }}>{errors.pixChave.message}</Text>}
      <Button title="Salvar" onPress={handleSubmit(onSubmit)} />
    </View>
  );
} 