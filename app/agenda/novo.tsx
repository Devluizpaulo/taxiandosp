import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';
import { createEvento } from '../../services/agendaService';
import { useAgendaStore } from '../../store/agendaStore';

const schema = z.object({
  titulo: z.string().min(2, 'Informe o título'),
  tipo: z.enum(['corrida', 'pessoal', 'manutencao', 'outros']),
  data: z.string(),
  hora: z.string(),
  local: z.string().optional(),
  notificarAntes: z.coerce.number().optional(),
  recorrente: z.enum(['nenhum', 'semanal', 'mensal']).optional(),
  observacao: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NovoEventoScreen({ navigation }) {
  const { addEvento } = useAgendaStore();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { tipo: 'corrida', recorrente: 'nenhum' },
  });

  const onSubmit = async (data: FormData) => {
    const evento = await createEvento(data);
    addEvento(evento);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Novo Compromisso</Text>
      {/* Campos do formulário: título, tipo, data, hora, local, notificarAntes, recorrente, observação */}
      {/* Implemente campos controlados conforme padrão do React Hook Form */}
      {/* Exemplo: */}
      {/* <TextInput ... {...register('titulo')} /> */}
      {/* <Picker ... {...register('tipo')} /> */}
      {/* ... */}
      <Button title="Salvar" onPress={handleSubmit(onSubmit)} />
      {Object.values(errors).map((err, i) => <Text key={i} style={styles.error}>{err.message}</Text>)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  error: { color: 'red', marginTop: 4 },
}); 