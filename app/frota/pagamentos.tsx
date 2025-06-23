import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Alert, Button, FlatList, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { z } from 'zod';
import { frotaService } from '../../services/frotaService';
import { useFrotaStore } from '../../store/frotaStore';
import { PagamentoFrota } from '../../types/frota';

const pagamentoSchema = z.object({
  valor: z.string().min(1, 'Valor obrigatório'),
  metodo: z.enum(['pix', 'dinheiro', 'transferencia', 'outro'], { required_error: 'Método obrigatório' }),
});

type PagamentoForm = z.infer<typeof pagamentoSchema>;

export default function PagamentosFrota() {
  const { pagamentos, setPagamentos, adicionarPagamento, removerPagamento } = useFrotaStore();
  const { control, handleSubmit, formState: { errors }, reset } = useForm<PagamentoForm>({
    resolver: zodResolver(pagamentoSchema),
    defaultValues: { valor: '', metodo: 'pix' },
  });
  const [comprovante, setComprovante] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  // Carregar pagamentos do Firestore ao abrir a tela
  useEffect(() => {
    async function fetchPagamentos() {
      setLoading(true);
      try {
        const pagamentosFirestore = await frotaService.listarPagamentos();
        setPagamentos(pagamentosFirestore);
      } catch (e) {
        Alert.alert('Erro', 'Não foi possível carregar os pagamentos.');
      } finally {
        setLoading(false);
      }
    }
    fetchPagamentos();
  }, [setPagamentos]);

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets && result.assets[0].uri) {
      setComprovante(result.assets[0].uri);
    }
  }

  async function onSubmit(data: PagamentoForm) {
    setLoading(true);
    try {
      const novoPagamento: PagamentoFrota = {
        id: Date.now().toString(),
        data: new Date().toISOString().slice(0, 10),
        valor: Number(data.valor),
        metodo: data.metodo,
        comprovanteURL: comprovante,
      };
      await frotaService.salvarPagamento(novoPagamento);
      adicionarPagamento(novoPagamento);
      reset();
      setComprovante(undefined);
      Alert.alert('Sucesso', 'Pagamento adicionado!');
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível adicionar o pagamento.');
    } finally {
      setLoading(false);
    }
  }

  async function excluirPagamento(id: string) {
    setLoading(true);
    try {
      await frotaService.removerPagamento(id);
      removerPagamento(id);
      Alert.alert('Sucesso', 'Pagamento removido!');
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível remover o pagamento.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2980b9" />
        <Text style={{ marginTop: 12 }}>Carregando pagamentos...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Pagamentos</Text>
      <FlatList
        data={pagamentos}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 8, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center' }}>
            {item.comprovanteURL && (
              <Image source={{ uri: item.comprovanteURL }} style={{ width: 40, height: 40, marginRight: 8, borderRadius: 4 }} />
            )}
            <View style={{ flex: 1 }}>
              <Text>{item.data} - R$ {item.valor} ({item.metodo})</Text>
            </View>
            <TouchableOpacity onPress={() => excluirPagamento(item.id)}>
              <Text style={{ color: 'red', marginLeft: 8 }}>Excluir</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <Text style={{ marginTop: 16 }}>Novo pagamento</Text>
      <Controller
        control={control}
        name="valor"
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="Valor"
            value={value}
            onChangeText={onChange}
            keyboardType="numeric"
            style={{ borderWidth: 1, marginBottom: 4 }}
          />
        )}
      />
      {errors.valor && <Text style={{ color: 'red' }}>{errors.valor.message}</Text>}
      <Text>Método</Text>
      <Controller
        control={control}
        name="metodo"
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="pix, dinheiro, transferencia, outro"
            value={value}
            onChangeText={onChange}
            style={{ borderWidth: 1, marginBottom: 4 }}
          />
        )}
      />
      {errors.metodo && <Text style={{ color: 'red' }}>{errors.metodo.message}</Text>}
      <Button title="Selecionar comprovante" onPress={pickImage} />
      {comprovante && (
        <Image source={{ uri: comprovante }} style={{ width: 80, height: 80, marginVertical: 8, borderRadius: 6 }} />
      )}
      <Button title="Adicionar" onPress={handleSubmit(onSubmit)} />
    </View>
  );
} 