import { pagamentosSqliteService } from '@/services/sqlite/pagamentosSqliteService';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import React, { useEffect } from 'react';
import { ActivityIndicator, Button, FlatList, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

const METODOS_FIXOS = [
  { nome: 'Pix', icone: 'pix' },
  { nome: 'Dinheiro', icone: 'attach-money' },
  { nome: 'Débito', icone: 'credit-card' },
  { nome: 'Crédito', icone: 'credit-card' },
  { nome: '99', icone: 'local-taxi' },
  { nome: 'Uber', icone: 'directions-car' },
  { nome: 'InDriver', icone: 'commute' },
  { nome: 'Outras', icone: 'more-horiz' },
];

type MetodoPagamento = {
  nome: string;
  ativo: boolean;
};

type PaymentList = MetodoPagamento[];

export default function SetupPagamentosScreen() {
  const [loading, setLoading] = React.useState(true);
  const [payments, setPayments] = React.useState<PaymentList>([]);

  useEffect(() => {
    pagamentosSqliteService.init();
    const fetchPagamentos = async () => {
      const user = getAuth().currentUser;
      if (!user) return;
      const localPayments = await pagamentosSqliteService.getPagamentos(user.uid);
      if (localPayments && localPayments.length > 0) {
        setPayments(localPayments);
        setLoading(false);
        return;
      }
      const db = getFirestore();
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);
      const data = docSnap.data();
      if (data?.payment) {
        await pagamentosSqliteService.savePagamentos(user.uid, data.payment);
        setPayments(data.payment);
      }
      setLoading(false);
    };
    fetchPagamentos();
  }, []);

  const toggleAtivo = (nome: string) => {
    setPayments(payments.map(p => p.nome === nome ? { ...p, ativo: !p.ativo } : p));
  };

  const removePayment = (nome: string) => {
    setPayments(payments.filter(p => p.nome !== nome));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newPayments = [...payments];
    [newPayments[index - 1], newPayments[index]] = [newPayments[index], newPayments[index - 1]];
    setPayments(newPayments);
  };

  const moveDown = (index: number) => {
    if (index === payments.length - 1) return;
    const newPayments = [...payments];
    [newPayments[index + 1], newPayments[index]] = [newPayments[index], newPayments[index + 1]];
    setPayments(newPayments);
  };

  const onSubmit = async () => {
    if (payments.filter(p => p.ativo).length === 0) {
      alert('Adicione pelo menos um método ativo!');
      return;
    }
    const user = getAuth().currentUser;
    if (!user) return;
    const db = getFirestore();
    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);
    const prevStatus = docSnap.data()?.setupStatus || {};
    await setDoc(userRef, {
      payment: payments,
      setupStatus: { ...prevStatus, payment: true },
    }, { merge: true });
    await pagamentosSqliteService.savePagamentos(user.uid, payments);
    alert('Métodos de pagamento salvos!');
    router.replace('/setup/categorias');
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Métodos de Pagamento</Text>
      <FlatList
        data={payments}
        keyExtractor={item => item.nome}
        renderItem={({ item, index }) => {
          const icone = METODOS_FIXOS.find(m => m.nome === item.nome)?.icone || 'payment';
          return (
            <View style={styles.paymentItem}>
              <MaterialIcons name={icone as any} size={24} color={item.ativo ? '#007AFF' : '#888'} style={{ marginRight: 8 }} />
              <Switch value={item.ativo} onValueChange={() => toggleAtivo(item.nome)} />
              <Text style={{ flex: 1, marginLeft: 8 }}>{item.nome}</Text>
              <TouchableOpacity onPress={() => moveUp(index)}><Text style={styles.moveBtn}>↑</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => moveDown(index)}><Text style={styles.moveBtn}>↓</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => removePayment(item.nome)}>
                <Text style={{ color: 'red', marginLeft: 8 }}>Remover</Text>
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={{ color: '#888' }}>Nenhum método adicionado</Text>}
      />
      <Button title="Salvar e continuar" onPress={onSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginBottom: 8 },
  error: { color: 'red', marginBottom: 8 },
  paymentItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  moveBtn: { fontSize: 18, marginHorizontal: 4 },
}); 