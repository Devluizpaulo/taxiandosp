import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { frotaService, gerarDiarias } from '../../services/frotaService';
import { useFrotaStore } from '../../store/frotaStore';

const statusInfo = {
  pendente: { color: '#f1c40f', icon: 'time' },
  paga: { color: '#2ecc71', icon: 'checkmark-circle' },
  descontada: { color: '#e67e22', icon: 'remove-circle' },
};

export default function DiariaFrota() {
  const { diarias, setDiarias, editarDiaria, adicionarDiaria, veiculosLocados, frotaSelecionadaId, frotas } = useFrotaStore();
  const [diasGerar, setDiasGerar] = useState('7');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [novoValor, setNovoValor] = useState('');
  const [novaObs, setNovaObs] = useState('');
  const [loading, setLoading] = useState(false);
  const frota = frotas.find(f => f.id === frotaSelecionadaId);
  const veiculo = veiculosLocados.find(v => v.ativo);

  // Carregar diárias do Firestore ao abrir a tela
  useEffect(() => {
    async function fetchDiarias() {
      if (!veiculo) return;
      setLoading(true);
      try {
        const diariasFirestore = await frotaService.listarDiarias(veiculo.id);
        setDiarias(diariasFirestore);
      } catch (e) {
        Alert.alert('Erro', 'Não foi possível carregar as diárias.');
      } finally {
        setLoading(false);
      }
    }
    fetchDiarias();
  }, [veiculo, setDiarias]);

  async function gerar() {
    if (!frota || !veiculo) return alert('Selecione frota e veículo');
    setLoading(true);
    try {
      const novas = gerarDiarias({
        inicioContrato: veiculo.inicioContrato,
        valorDiaria: veiculo.valorDiaria,
        veiculoLocadoId: veiculo.id,
        dias: Number(diasGerar),
        estiloCobranca: frota.estiloCobranca,
        aceitaDomingo: frota.aceitaDomingo,
        aceitaFeriado: frota.aceitaFeriado,
        feriados: [],
      });
      for (const diaria of novas) {
        await frotaService.salvarDiaria(diaria);
        adicionarDiaria(diaria);
      }
      Alert.alert('Sucesso', 'Diárias geradas!');
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível gerar as diárias.');
    } finally {
      setLoading(false);
    }
  }

  function confirmarAcao(msg: string, acao: () => void) {
    Alert.alert('Confirmação', msg, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', onPress: acao },
    ]);
  }

  async function marcarComoPaga(id: string) {
    confirmarAcao('Marcar esta diária como paga?', async () => {
      const diaria = diarias.find(d => d.id === id);
      if (diaria) {
        const atualizada = { ...diaria, status: 'paga' };
        await frotaService.salvarDiaria(atualizada);
        editarDiaria(atualizada);
      }
    });
  }

  async function isentar(id: string) {
    confirmarAcao('Isentar esta diária?', async () => {
      const diaria = diarias.find(d => d.id === id);
      if (diaria) {
        const atualizada = { ...diaria, status: 'descontada' };
        await frotaService.salvarDiaria(atualizada);
        editarDiaria(atualizada);
      }
    });
  }

  function iniciarEdicao(id: string, valor: number, obs?: string) {
    setEditandoId(id);
    setNovoValor(valor.toString());
    setNovaObs(obs || '');
  }

  async function salvarEdicao(id: string) {
    const diaria = diarias.find(d => d.id === id);
    if (diaria) {
      const atualizada = { ...diaria, valor: Number(novoValor), observacao: novaObs };
      await frotaService.salvarDiaria(atualizada);
      editarDiaria(atualizada);
    }
    setEditandoId(null);
    setNovoValor('');
    setNovaObs('');
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setNovoValor('');
    setNovaObs('');
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2980b9" />
        <Text style={{ marginTop: 12 }}>Carregando diárias...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#fafbfc' }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 10 }}>Controle de Diárias</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <TextInput
          placeholder="Dias a gerar"
          value={diasGerar}
          onChangeText={setDiasGerar}
          keyboardType="numeric"
          style={{ borderWidth: 1, width: 80, marginRight: 8, borderRadius: 6, padding: 6, backgroundColor: '#fff' }}
        />
        <Button title="Gerar diárias" onPress={gerar} />
      </View>
      <FlatList
        data={diarias}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => {
          const info = statusInfo[item.status];
          const editando = editandoId === item.id;
          return (
            <View style={[styles.card, { borderLeftColor: info.color }]}>  
              <View style={styles.row}>
                <Ionicons name={info.icon as any} size={24} color={info.color} style={{ marginRight: 8 }} />
                <Text style={[styles.data, { color: info.color }]}>{item.data}</Text>
                <Text style={styles.valor}>R$ {item.valor}</Text>
                <View style={{ flex: 1 }} />
                {item.status === 'pendente' && !editando && (
                  <TouchableOpacity onPress={() => marcarComoPaga(item.id)} style={styles.actionBtn}>
                    <MaterialIcons name="check-circle" size={22} color="#2ecc71" />
                  </TouchableOpacity>
                )}
                {item.status !== 'paga' && !editando && (
                  <TouchableOpacity onPress={() => isentar(item.id)} style={styles.actionBtn}>
                    <MaterialIcons name="remove-circle" size={22} color="#e67e22" />
                  </TouchableOpacity>
                )}
                {!editando && (
                  <TouchableOpacity onPress={() => iniciarEdicao(item.id, item.valor, item.observacao)} style={styles.actionBtn}>
                    <MaterialIcons name="edit" size={22} color="#2980b9" />
                  </TouchableOpacity>
                )}
              </View>
              {editando ? (
                <View style={styles.editArea}>
                  <TextInput
                    value={novoValor}
                    onChangeText={setNovoValor}
                    keyboardType="numeric"
                    style={styles.input}
                  />
                  <TextInput
                    value={novaObs}
                    onChangeText={setNovaObs}
                    placeholder="Observação"
                    style={[styles.input, { flex: 2 }]}
                  />
                  <TouchableOpacity onPress={() => salvarEdicao(item.id)} style={styles.saveBtn}>
                    <MaterialIcons name="save" size={22} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={cancelarEdicao} style={styles.cancelBtn}>
                    <MaterialIcons name="close" size={22} color="#fff" />
                  </TouchableOpacity>
                </View>
              ) : (
                item.observacao ? <Text style={styles.obs}>Obs: {item.observacao}</Text> : null
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 12,
    padding: 12,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  data: {
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 10,
  },
  valor: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginRight: 10,
  },
  actionBtn: {
    marginLeft: 6,
    padding: 4,
  },
  editArea: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 6,
    marginRight: 8,
    minWidth: 60,
    backgroundColor: '#f7f7f7',
  },
  saveBtn: {
    backgroundColor: '#27ae60',
    borderRadius: 6,
    padding: 6,
    marginRight: 4,
  },
  cancelBtn: {
    backgroundColor: '#e74c3c',
    borderRadius: 6,
    padding: 6,
  },
  obs: {
    marginTop: 4,
    color: '#888',
    fontStyle: 'italic',
    fontSize: 13,
  },
}); 