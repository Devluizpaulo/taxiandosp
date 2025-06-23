import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { frotaService } from '../../services/frotaService';
import { useFrotaStore } from '../../store/frotaStore';

export default function FrotaIndex() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { frotas, setFrotas, frotaSelecionadaId, diarias, calcularSaldo, removerFrota, selecionarFrota, carregarDadosLocais, veiculosLocados, pagamentos } = useFrotaStore();
  const [loading, setLoading] = useState(false);
  const [backupModal, setBackupModal] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    carregarDadosLocais().finally(() => setLoading(false));
  }, [carregarDadosLocais]);

  async function excluirFrota(id: string) {
    setLoading(true);
    try {
      await removerFrota(id);
      Alert.alert('Sucesso', 'Frota removida!');
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível remover a frota.');
    } finally {
      setLoading(false);
    }
  }

  async function handleBackup() {
    setBackupModal(true);
    setBackupProgress(0.1);
    try {
      setBackupProgress(0.3);
      for (const frota of frotas) {
        await frotaService.salvarFrota(frota);
      }
      setBackupProgress(0.5);
      for (const v of veiculosLocados) {
        await frotaService.salvarVeiculoLocado(v);
      }
      setBackupProgress(0.7);
      for (const d of diarias) {
        await frotaService.salvarDiaria(d);
      }
      setBackupProgress(0.9);
      for (const p of pagamentos) {
        await frotaService.salvarPagamento(p);
      }
      setBackupProgress(1);
      setTimeout(() => {
        setBackupModal(false);
        Alert.alert('Backup concluído!', 'Seus dados foram salvos na nuvem.');
      }, 800);
    } catch (e) {
      setBackupModal(false);
      Alert.alert('Erro', 'Não foi possível fazer backup na nuvem.');
    }
  }

  const frota = frotas.find(f => f.id === frotaSelecionadaId) || frotas[0];

  function handleSelecionarFrota(id: string) {
    selecionarFrota(id);
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2980b9" />
        <Text style={{ marginTop: 12 }}>Carregando frotas...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#34495e", "#2c3e50"]} style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="bus" size={32} color="#fff" style={{ marginRight: 10 }} />
          <View>
            <Text style={styles.headerTitle}>Frota</Text>
            <Text style={styles.headerSubtitle}>Gerencie suas frotas e obrigações</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity style={styles.addButton} onPress={handleBackup}>
            <MaterialIcons name="cloud-upload" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={() => router.push('./frota/cadastrar.tsx')}>
            <MaterialIcons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Modal de backup */}
      <Modal visible={backupModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#2980b9" />
            <Text style={{ marginTop: 16, fontWeight: 'bold' }}>Realizando backup na nuvem...</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBar, { width: `${backupProgress * 100}%` }]} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Card de Resumo */}
      {frota && (
        <View style={styles.resumoCard}>
          <Text style={styles.cardTitle}>{frota.nome}</Text>
          <View style={styles.resumoGrid}>
            <View style={styles.resumoItem}>
              <Ionicons name="wallet" size={24} color="#2ecc71" />
              <Text style={styles.resumoValor}>R$ {calcularSaldo()}</Text>
              <Text style={styles.resumoLabel}>Saldo</Text>
            </View>
            <View style={styles.resumoItem}>
              <Ionicons name="calendar" size={24} color="#f1c40f" />
              <Text style={styles.resumoValor}>{diarias.filter(d => d.status !== 'paga').length}</Text>
              <Text style={styles.resumoLabel}>Diárias em aberto</Text>
            </View>
            <View style={styles.resumoItem}>
              <Ionicons name="call" size={24} color="#2980b9" />
              <Text style={styles.resumoValor}>{frota.telefone}</Text>
              <Text style={styles.resumoLabel}>Contato</Text>
            </View>
            <View style={styles.resumoItem}>
              <Ionicons name="cash" size={24} color="#27ae60" />
              <Text style={styles.resumoValor}>{frota.pixChave}</Text>
              <Text style={styles.resumoLabel}>Pix</Text>
            </View>
          </View>
        </View>
      )}

      {/* Ações Rápidas */}
      <View style={styles.acoesCard}>
        <Text style={styles.cardTitle}>Ações Rápidas</Text>
        <View style={styles.acoesGrid}>
          <TouchableOpacity style={styles.acaoBtn} onPress={() => router.push('./pagamentos')}>
            <MaterialIcons name="payments" size={32} color="#2980b9" />
            <Text style={styles.acaoText}>Pagamentos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.acaoBtn} onPress={() => router.push('./diaria')}>
            <Ionicons name="calendar" size={32} color="#f1c40f" />
            <Text style={styles.acaoText}>Diárias</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.acaoBtn} onPress={() => router.push('./cadastrar')}>
            <MaterialIcons name="add-business" size={32} color="#27ae60" />
            <Text style={styles.acaoText}>Nova Frota</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.acaoBtn} onPress={() => Alert.alert('Em breve', 'Funcionalidade de relatórios em breve!')}>
            <MaterialIcons name="analytics" size={32} color="#9C27B0" />
            <Text style={styles.acaoText}>Relatórios</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista de Frotas */}
      <View style={styles.listaCard}>
        <View style={styles.listaHeader}>
          <Text style={styles.cardTitle}>Minhas Frotas</Text>
        </View>
        <FlatList
          data={frotas}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.frotaCard, frota?.id === item.id && styles.frotaCardSelected]}
              onPress={() => handleSelecionarFrota(item.id)}
              activeOpacity={0.85}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.frotaCardNome}>{item.nome}</Text>
                <Text style={styles.frotaCardContato}>{item.telefone}</Text>
              </View>
              <TouchableOpacity onPress={() => excluirFrota(item.id)} style={styles.deleteBtn}>
                <MaterialIcons name="delete" size={22} color="#e74c3c" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          scrollEnabled={false}
          contentContainerStyle={{ paddingBottom: 16 }}
        />
      </View>

      {/* Botão Flutuante */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('./cadastrar')}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#fff',
    opacity: 0.8,
  },
  addButton: {
    backgroundColor: '#27ae60',
    borderRadius: 20,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  resumoCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    margin: 16,
    marginBottom: 0,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#222',
  },
  resumoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 4,
  },
  resumoItem: {
    alignItems: 'center',
    flex: 1,
    minWidth: 120,
    marginBottom: 8,
  },
  resumoValor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 2,
  },
  resumoLabel: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  acoesCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    margin: 16,
    marginTop: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  acoesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
    marginTop: 10,
  },
  acaoBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7f7f7',
    borderRadius: 12,
    padding: 16,
    minWidth: 110,
    flex: 1,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  acaoText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
  },
  listaCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    margin: 16,
    marginTop: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  listaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  frotaCard: {
    backgroundColor: '#f7f7f7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  frotaCardSelected: {
    borderWidth: 2,
    borderColor: '#2980b9',
  },
  frotaCardNome: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  frotaCardContato: {
    color: '#888',
    fontSize: 13,
    marginTop: 2,
  },
  deleteBtn: {
    marginLeft: 12,
    padding: 6,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    backgroundColor: '#27ae60',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  progressBarBg: {
    width: 180,
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    marginTop: 18,
    overflow: 'hidden',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#2980b9',
    borderRadius: 4,
  },
}); 