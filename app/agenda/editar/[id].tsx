import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';
import { deleteEvento, updateEvento } from '../../../services/agendaService';
import { useAgendaStore } from '../../../store/agendaStore';

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

export default function EditarEventoScreen({ route, navigation }) {
  const { id } = route.params;
  const { eventos, updateEventoLocal, removeEvento } = useAgendaStore();
  const evento = eventos.find(e => e.id === id);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: evento,
  });

  useEffect(() => {
    if (evento) {
      Object.entries(evento).forEach(([key, value]) => setValue(key, value));
    }
  }, [evento]);

  const onSubmit = async (data: FormData) => {
    await updateEvento(id, data);
    updateEventoLocal(id, data);
    navigation.goBack();
  };

  const onDelete = async () => {
    await deleteEvento(id);
    removeEvento(id);
    navigation.goBack();
  };

  if (!evento) return <Text>Evento não encontrado.</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Editar Compromisso</Text>
      {/* Campos do formulário conforme NovoEventoScreen */}
      <Button title="Salvar Alterações" onPress={handleSubmit(onSubmit)} />
      <Button title="Remover" color="red" onPress={onDelete} />
      {Object.values(errors).map((err, i) => <Text key={i} style={styles.error}>{err.message}</Text>)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  error: { color: 'red', marginTop: 4 },
}); 