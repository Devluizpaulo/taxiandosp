import { MaterialIcons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, Controller, useForm } from 'react-hook-form';
import { Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { z } from 'zod';
import { deleteTransacao, getTransacao, updateTransacao } from '../../../services/financasService';
import { useFinancasStore } from '../../../store/financasStore';

const transacaoSchema = z.object({
  titulo: z.string().min(2, 'Título obrigatório'),
  valor: z.coerce.number().min(0.01, 'Valor deve ser maior que zero'),
  tipo: z.enum(['receita', 'despesa']),
  categoria: z.string().min(1, 'Categoria obrigatória'),
  metodoPagamento: z.string().min(1, 'Método de pagamento obrigatório'),
  data: z.string().min(1, 'Data obrigatória'),
  observacao: z.string().optional(),
});

type TransacaoForm = z.infer<typeof transacaoSchema>;

export default function EditarTransacaoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { control, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<TransacaoForm>({
    resolver: zodResolver(transacaoSchema),
  });
  
  const [loading, setLoading] = useState(false);
  const [transacao, setTransacao] = useState<any>(null);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [metodosPagamento, setMetodosPagamento] = useState<any[]>([]);
  const router = useRouter();
  const tipo = watch('tipo');

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // Buscar transação
        const transacaoData = await getTransacao(id);
        if (!transacaoData) {
          Alert.alert('Erro', 'Transação não encontrada');
          router.back();
          return;
        }
        setTransacao(transacaoData);
        
        // Preencher formulário
        reset({
          titulo: transacaoData.titulo,
          valor: transacaoData.valor,
          tipo: transacaoData.tipo,
          categoria: transacaoData.categoria.nome,
          metodoPagamento: transacaoData.metodoPagamento,
          data: transacaoData.data,
          observacao: transacaoData.observacao,
        });
        
        // Buscar categorias e métodos de pagamento
        const user = getAuth().currentUser;
        if (user) {
          const db = getFirestore();
          const docSnap = await getDoc(doc(db, 'users', user.uid));
          const data = docSnap.data();
          
          if (data?.categories) {
            setCategorias(data.categories);
          }
          if (data?.payment) {
            setMetodosPagamento(data.payment.filter((p: any) => p.ativo));
          }
        }
      } catch (error: any) {
        Alert.alert('Erro', error.message || 'Erro ao carregar transação');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, reset, router]);

  const onSubmit = async (data: TransacaoForm) => {
    if (!id) return;
    
    setLoading(true);
    try {
      await updateTransacao(id, data);
      useFinancasStore.getState().updateTransacao(id, data);
      Alert.alert('Sucesso', 'Transação atualizada com sucesso!');
      router.back();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao atualizar transação');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir esta transação?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            if (!id) return;
            
            setLoading(true);
            try {
              await deleteTransacao(id);
              useFinancasStore.getState().removeTransacao(id);
              Alert.alert('Sucesso', 'Transação excluída com sucesso!');
              router.back();
            } catch (error: any) {
              Alert.alert('Erro', error.message || 'Erro ao excluir transação');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const categoriasFiltradas = categorias.filter(c => c.tipo === tipo);

  if (loading && !transacao) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Editar Transação</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <MaterialIcons name="delete" size={24} color="#F44336" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Tipo de transação */}
        <View style={styles.tipoContainer}>
          <TouchableOpacity 
            style={[styles.tipoButton, tipo === 'receita' && styles.tipoButtonAtivo]}
            onPress={() => setValue('tipo', 'receita')}
          >
            <MaterialIcons name="trending-up" size={24} color={tipo === 'receita' ? '#fff' : '#4CAF50'} />
            <Text style={[styles.tipoText, tipo === 'receita' && styles.tipoTextAtivo]}>
              Receita
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tipoButton, tipo === 'despesa' && styles.tipoButtonAtivo]}
            onPress={() => setValue('tipo', 'despesa')}
          >
            <MaterialIcons name="trending-down" size={24} color={tipo === 'despesa' ? '#fff' : '#F44336'} />
            <Text style={[styles.tipoText, tipo === 'despesa' && styles.tipoTextAtivo]}>
              Despesa
            </Text>
          </TouchableOpacity>
        </View>

        {/* Título */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Título</Text>
          <Controller
            control={control}
            name="titulo"
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder="Ex: Corrida Uber, Abastecimento..."
                value={value}
                onChangeText={onChange}
                style={styles.input}
              />
            )}
          />
          {errors.titulo && <Text style={styles.error}>{errors.titulo.message}</Text>}
        </View>

        {/* Valor */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Valor (R$)</Text>
          <Controller
            control={control}
            name="valor"
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder="0,00"
                value={value?.toString()}
                onChangeText={onChange}
                style={styles.input}
                keyboardType="numeric"
              />
            )}
          />
          {errors.valor && <Text style={styles.error}>{errors.valor.message}</Text>}
        </View>

        {/* Categoria */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Categoria</Text>
          <Controller
            control={control}
            name="categoria"
            render={({ field: { onChange, value } }) => (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={value}
                  onValueChange={onChange}
                  style={styles.picker}
                >
                  <Picker.Item label="Selecione uma categoria" value="" />
                  {categoriasFiltradas.map((cat) => (
                    <Picker.Item key={cat.nome} label={cat.nome} value={cat.nome} />
                  ))}
                </Picker>
              </View>
            )}
          />
          {errors.categoria && <Text style={styles.error}>{errors.categoria.message}</Text>}
        </View>

        {/* Método de pagamento */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Método de pagamento</Text>
          <Controller
            control={control}
            name="metodoPagamento"
            render={({ field: { onChange, value } }) => (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={value}
                  onValueChange={onChange}
                  style={styles.picker}
                >
                  <Picker.Item label="Selecione um método" value="" />
                  {metodosPagamento.map((metodo) => (
                    <Picker.Item key={metodo.nome} label={metodo.nome} value={metodo.nome} />
                  ))}
                </Picker>
              </View>
            )}
          />
          {errors.metodoPagamento && <Text style={styles.error}>{errors.metodoPagamento.message}</Text>}
        </View>

        {/* Data */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Data</Text>
          <Controller
            control={control}
            name="data"
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder="YYYY-MM-DD"
                value={value}
                onChangeText={onChange}
                style={styles.input}
              />
            )}
          />
          {errors.data && <Text style={styles.error}>{errors.data.message}</Text>}
        </View>

        {/* Observação */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Observação (opcional)</Text>
          <Controller
            control={control}
            name="observacao"
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder="Detalhes adicionais..."
                value={value}
                onChangeText={onChange}
                style={[styles.input, styles.textArea]}
                multiline
                numberOfLines={3}
              />
            )}
          />
        </View>

        {/* Botão salvar */}
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: { padding: 4 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  deleteButton: { padding: 4 },
  content: { padding: 20 },
  tipoContainer: { 
    flexDirection: 'row', 
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
  },
  tipoButton: { 
    flex: 1, 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  tipoButtonAtivo: { 
    backgroundColor: tipo => tipo === 'receita' ? '#4CAF50' : '#F44336',
  },
  tipoText: { 
    marginLeft: 8, 
    fontSize: 16, 
    fontWeight: '600',
    color: '#666',
  },
  tipoTextAtivo: { color: '#fff' },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: { 
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: { 
    height: 80, 
    textAlignVertical: 'top',
  },
  pickerContainer: { 
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
  },
  picker: { 
    backgroundColor: 'transparent',
  },
  error: { color: '#F44336', fontSize: 12, marginTop: 4 },
  saveButton: { 
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonDisabled: { backgroundColor: '#ccc' },
  saveButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
}); 