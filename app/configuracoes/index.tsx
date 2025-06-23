import FloatingFuelButton from '@/components/FloatingFuelButton';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { BackupHistoricoItem, backupService, listarHistorico, registrarHistorico } from '@/services/backup/backupService';
import { agendaSqliteService } from '@/services/sqlite/agenda/agendaSqliteService';
import { apelidoSqliteService } from '@/services/sqlite/apelidoSqliteService';
import { categoriasSqliteService } from '@/services/sqlite/categoriasSqliteService';
import { combustivelSqliteService } from '@/services/sqlite/combustivel/combustivelSqliteService';
import { financasSqliteService } from '@/services/sqlite/financas/financasSqliteService';
import { frotaSqliteService } from '@/services/sqlite/frota/frotaSqliteService';
import { jornadaSqliteService } from '@/services/sqlite/jornada/jornadaSqliteService';
import { pagamentosSqliteService } from '@/services/sqlite/pagamentosSqliteService';
import { profileSqliteService } from '@/services/sqlite/profileSqliteService';
import { vehicleSqliteService } from '@/services/sqlite/vehicleSqliteService';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as SQLite from 'expo-sqlite';
import { deleteUser, getAuth } from 'firebase/auth';
import { deleteDoc, doc, getFirestore } from 'firebase/firestore';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    ToastAndroid,
    TouchableOpacity,
    View
} from 'react-native';

export default function ConfiguracoesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [modalVisible, setModalVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [modalText, setModalText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [log, setLog] = useState<string>('');
  const [showLog, setShowLog] = useState(false);
  const [historicoVisible, setHistoricoVisible] = useState(false);
  const [historico, setHistorico] = useState<BackupHistoricoItem[]>([]);

  function showToast(message: string) {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.LONG);
    } else {
      Alert.alert('', message);
    }
  }

  async function abrirHistorico() {
    const h = await listarHistorico();
    setHistorico(h);
    setHistoricoVisible(true);
  }

  async function handleBackup() {
    setModalText('Realizando backup na nuvem...');
    setModalVisible(true);
    setProgress(0);
    setError(null);
    setLog('');
    setShowLog(false);
    try {
      await backupService.sincronizarComFirestore(p => setProgress(p));
      setModalText('Backup concluído!');
      await registrarHistorico({
        data: new Date().toISOString(),
        tipo: 'backup',
        status: 'sucesso',
        mensagem: 'Backup realizado com sucesso',
      });
      setTimeout(() => {
        setModalVisible(false);
        showToast('Backup realizado com sucesso!');
      }, 1200);
    } catch (e: any) {
      setError('Erro ao realizar backup');
      setLog(e?.message || String(e));
      setModalText('Ocorreu um erro durante o backup.');
      await registrarHistorico({
        data: new Date().toISOString(),
        tipo: 'backup',
        status: 'erro',
        mensagem: 'Erro ao realizar backup',
        log: e?.message || String(e),
      });
    }
  }
  async function handleRestore() {
    setModalText('Restaurando dados da nuvem...');
    setModalVisible(true);
    setProgress(0);
    setError(null);
    setLog('');
    setShowLog(false);
    try {
      await backupService.restaurarDoFirestore(p => setProgress(p));
      setModalText('Restauração concluída!');
      await registrarHistorico({
        data: new Date().toISOString(),
        tipo: 'restauracao',
        status: 'sucesso',
        mensagem: 'Restauração concluída com sucesso',
      });
      setTimeout(() => {
        setModalVisible(false);
        showToast('Restauração concluída com sucesso!');
      }, 1200);
    } catch (e: any) {
      setError('Erro ao restaurar dados');
      setLog(e?.message || String(e));
      setModalText('Ocorreu um erro durante a restauração.');
      await registrarHistorico({
        data: new Date().toISOString(),
        tipo: 'restauracao',
        status: 'erro',
        mensagem: 'Erro ao restaurar dados',
        log: e?.message || String(e),
      });
    }
  }

  async function clearAllSQLiteData() {
    // Inicialize e limpe todas as tabelas relevantes
    profileSqliteService.init();
    vehicleSqliteService.init();
    pagamentosSqliteService.init();
    categoriasSqliteService.init();
    apelidoSqliteService.init();
    financasSqliteService.init();
    agendaSqliteService.init();
    frotaSqliteService.init();
    jornadaSqliteService.init();
    combustivelSqliteService.init();
    SQLite.openDatabaseSync('profile.db').execSync('DELETE FROM profile');
    SQLite.openDatabaseSync('vehicle.db').execSync('DELETE FROM vehicle');
    SQLite.openDatabaseSync('pagamentos.db').execSync('DELETE FROM pagamentos');
    SQLite.openDatabaseSync('categorias.db').execSync('DELETE FROM categorias');
    SQLite.openDatabaseSync('apelido.db').execSync('DELETE FROM apelido');
    SQLite.openDatabaseSync('financas.db').execSync('DELETE FROM transacoes');
    SQLite.openDatabaseSync('financas.db').execSync('DELETE FROM categorias');
    SQLite.openDatabaseSync('agenda.db').execSync('DELETE FROM agenda');
    SQLite.openDatabaseSync('frota.db').execSync('DELETE FROM frotas');
    SQLite.openDatabaseSync('frota.db').execSync('DELETE FROM veiculosLocados');
    SQLite.openDatabaseSync('frota.db').execSync('DELETE FROM diarias');
    SQLite.openDatabaseSync('frota.db').execSync('DELETE FROM pagamentosFrota');
    SQLite.openDatabaseSync('jornada.db').execSync('DELETE FROM jornadas');
    SQLite.openDatabaseSync('combustivel.db').execSync('DELETE FROM abastecimentos');
    SQLite.openDatabaseSync('combustivel.db').execSync('DELETE FROM postos');
  }

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Excluir Conta',
      'Tem certeza que deseja excluir sua conta? Esta ação é irreversível!',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir', style: 'destructive', onPress: async () => {
            try {
              const auth = getAuth();
              const user = auth.currentUser;
              if (!user) throw new Error('Usuário não autenticado');
              const db = getFirestore();
              // 1. Remover do Firestore
              await deleteDoc(doc(db, 'users', user.uid));
              // 2. Remover do Auth
              await deleteUser(user);
              // 3. Limpar dados locais
              await clearAllSQLiteData();
              await AsyncStorage.clear();
              // 4. Redirecionar para login
              router.replace('/auth/login');
            } catch (err) {
              Alert.alert('Erro ao excluir conta', err?.message || String(err));
            }
          }
        }
      ]
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Configurações</Text>
          <Text style={[styles.headerSubtitle, { color: colors.icon }]}>
            Gerencie suas preferências
          </Text>
        </View>

        <View style={styles.content}>
          {/* Perfil */}
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card }]}
            onPress={() => router.push('/configuracoes/perfil')}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(52, 152, 219, 0.1)' }]}>
                <Ionicons name="person" size={32} color="#3498db" />
              </View>
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Perfil</Text>
                <Text style={[styles.cardSubtitle, { color: colors.icon }]}>
                  Edite suas informações pessoais
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.icon} />
            </View>
          </TouchableOpacity>

          {/* Veículo */}
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card }]}
            onPress={() => router.push('/configuracoes/veiculo')}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(155, 89, 182, 0.1)' }]}>
                <Ionicons name="car" size={32} color="#9b59b6" />
              </View>
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Veículo</Text>
                <Text style={[styles.cardSubtitle, { color: colors.icon }]}>
                  Configure seus veículos
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.icon} />
            </View>
          </TouchableOpacity>

          {/* Notificações */}
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card }]}
            onPress={() => router.push('/configuracoes/notificacoes')}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(241, 196, 15, 0.1)' }]}>
                <Ionicons name="notifications" size={32} color="#f1c40f" />
              </View>
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Notificações</Text>
                <Text style={[styles.cardSubtitle, { color: colors.icon }]}>
                  Gerencie suas notificações
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.icon} />
            </View>
          </TouchableOpacity>

          {/* Privacidade */}
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card }]}
            onPress={() => router.push('/configuracoes/privacidade')}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(231, 76, 60, 0.1)' }]}>
                <Ionicons name="shield-checkmark" size={32} color="#e74c3c" />
              </View>
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Privacidade</Text>
                <Text style={[styles.cardSubtitle, { color: colors.icon }]}>
                  Configurações de privacidade e segurança
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.icon} />
            </View>
          </TouchableOpacity>

          {/* Frota */}
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card }]}
            onPress={() => router.push('/(tabs)/frota')}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(52, 73, 94, 0.1)' }]}> 
                <Ionicons name="bus" size={32} color="#34495e" />
              </View>
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Frota</Text>
                <Text style={[styles.cardSubtitle, { color: colors.icon }]}>Gerencie sua frota, diárias e pagamentos</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.icon} />
            </View>
          </TouchableOpacity>

          {/* Card de Backup/Restauracao */}
          <View style={[styles.card, { backgroundColor: colors.card }]}> 
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(39, 174, 96, 0.1)' }]}> 
                <Ionicons name="cloud-upload" size={32} color="#27ae60" />
              </View>
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Backup Manual</Text>
                <Text style={[styles.cardSubtitle, { color: colors.icon }]}>Salve ou restaure todos os dados do app manualmente</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', marginTop: 16 }}>
              <TouchableOpacity style={{ flex: 1, marginRight: 8, backgroundColor: '#27ae60', borderRadius: 8, padding: 12, alignItems: 'center' }} onPress={handleBackup}>
                <Ionicons name="cloud-upload" size={20} color="#fff" />
                <Text style={{ color: '#fff', fontWeight: 'bold', marginTop: 4 }}>Backup</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 1, marginLeft: 8, backgroundColor: '#2980b9', borderRadius: 8, padding: 12, alignItems: 'center' }} onPress={handleRestore}>
                <Ionicons name="cloud-download" size={20} color="#fff" />
                <Text style={{ color: '#fff', fontWeight: 'bold', marginTop: 4 }}>Restaurar</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={{ marginTop: 12, alignSelf: 'center' }} onPress={abrirHistorico}>
              <Text style={{ color: '#2980b9', fontSize: 14, textDecorationLine: 'underline' }}>Ver histórico de backups</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      {/* Botão Flutuante de Combustível */}
      <FloatingFuelButton />

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 32, alignItems: 'center', width: 300, minHeight: 180 }}>
            {!error ? (
              <>
                <ActivityIndicator size="large" color="#27ae60" style={{ marginBottom: 16 }} />
                <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>{modalText}</Text>
                <View style={{ width: '100%', height: 8, backgroundColor: '#eee', borderRadius: 4, marginTop: 8 }}>
                  <View style={{ width: `${Math.round(progress * 100)}%`, height: 8, backgroundColor: '#27ae60', borderRadius: 4 }} />
                </View>
              </>
            ) : (
              <>
                <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#e74c3c', marginBottom: 8 }}>{error}</Text>
                <Text style={{ color: '#888', fontSize: 14, marginBottom: 12 }}>{modalText}</Text>
                {!showLog && (
                  <Pressable style={{ marginBottom: 8 }} onPress={() => setShowLog(true)}>
                    <Text style={{ color: '#2980b9', fontSize: 13, textDecorationLine: 'underline' }}>Ver detalhes do erro</Text>
                  </Pressable>
                )}
                {showLog && (
                  <Text style={{ color: '#b2bec3', fontSize: 12, marginBottom: 16, maxWidth: 240 }}>{log}</Text>
                )}
                <Pressable style={{ backgroundColor: '#e74c3c', borderRadius: 8, padding: 10, marginTop: 8 }} onPress={() => {
                  setModalVisible(false);
                  if (error) showToast(error + (log ? `: ${log}` : ''));
                }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Fechar</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={historicoVisible} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', width: 340, maxHeight: 420 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Histórico de Backups</Text>
            {historico.length === 0 ? (
              <Text style={{ color: '#888', fontSize: 14 }}>Nenhum backup/restauração registrado.</Text>
            ) : (
              <ScrollView style={{ width: '100%' }}>
                {historico.map(item => (
                  <View key={item.id} style={{ marginBottom: 14, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 8 }}>
                    <Text style={{ fontWeight: 'bold', color: item.status === 'sucesso' ? '#27ae60' : '#e74c3c' }}>
                      {item.tipo === 'backup' ? 'Backup' : 'Restauração'} - {item.status === 'sucesso' ? 'Sucesso' : 'Erro'}
                    </Text>
                    <Text style={{ fontSize: 13, color: '#636e72' }}>{new Date(item.data).toLocaleString()}</Text>
                    <Text style={{ fontSize: 14, color: '#222', marginTop: 2 }}>{item.mensagem}</Text>
                    {item.log && (
                      <Text style={{ color: '#b2bec3', fontSize: 12, marginTop: 2 }}>{item.log}</Text>
                    )}
                  </View>
                ))}
              </ScrollView>
            )}
            <Pressable style={{ backgroundColor: '#2980b9', borderRadius: 8, padding: 10, marginTop: 16 }} onPress={() => setHistoricoVisible(false)}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Fechar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        style={{ backgroundColor: 'red', padding: 16, borderRadius: 8, marginTop: 32 }}
        onPress={handleDeleteAccount}
      >
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>Excluir Conta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  content: {
    padding: 20,
  },
  card: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
  },
}); 