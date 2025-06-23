import CalculatorKeyboard from '@/components/ui/CalculatorKeyboard';
import SelectionSheet from '@/components/ui/SelectionSheet';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { createTransacao } from '@/services/financasService';
import { useFinancasStore } from '@/store/financasStore';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function NovaTransacaoScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { addTransacao } = useFinancasStore();

  const [amount, setAmount] = useState('0');
  const [tipo, setTipo] = useState<'receita' | 'despesa'>('receita');
  const [categorias, setCategorias] = useState<any[]>([]);
  const [metodosPagamento, setMetodosPagamento] = useState<any[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<any>(null);
  const [selectedPagamento, setSelectedPagamento] = useState<any>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const [isCategoriaSheetVisible, setCategoriaSheetVisible] = useState(false);
  const [isPagamentoSheetVisible, setPagamentoSheetVisible] = useState(false);
  
  useEffect(() => {
    // Busca inicial de categorias e métodos de pagamento
    const fetchData = async () => {
      const user = getAuth().currentUser;
      if (!user) return;
      const db = getFirestore();
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const data = userDoc.data();
      if (data?.categories) setCategorias(data.categories);
      if (data?.payment) {
        const metodosAtivos = data.payment.filter((p: any) => p.ativo);
        setMetodosPagamento(metodosAtivos);
        if (metodosAtivos.length > 0) {
          setSelectedPagamento(metodosAtivos[0]);
        }
      }
    };
    fetchData();
  }, []);

  const handleKeyPress = (key: string) => {
    if (key === 'confirm') {
      handleSubmit();
      return;
    }
    if (key === 'backspace') {
      setAmount(prev => (prev.length > 1 ? prev.slice(0, -1) : '0'));
      return;
    }
    if (key === ',' && amount.includes(',')) return;
    
    setAmount(prev => {
      if (prev === '0' && key !== ',') return key;
      if (prev.length > 12) return prev; // Limite de dígitos
      return prev + key;
    });
  };
  
  const handleSubmit = async () => {
    const valor = parseFloat(amount.replace(',', '.'));
    if (valor <= 0) {
      Alert.alert('Valor inválido', 'O valor da transação deve ser maior que zero.');
      return;
    }
    if (!selectedCategoria) {
      Alert.alert('Categoria não selecionada', 'Por favor, escolha uma categoria para a transação.');
      return;
    }
    if (!selectedPagamento) {
      Alert.alert('Conta não selecionada', 'Por favor, escolha uma conta/método de pagamento.');
      return;
    }

    setLoading(true);
    try {
      const transacaoData = {
        titulo: description || selectedCategoria.nome,
        valor,
        tipo,
        categoriaId: selectedCategoria.id,
        metodoPagamentoId: selectedPagamento.id,
        data: new Date().toISOString(),
        observacao: description,
        categoria: { nome: selectedCategoria.nome, icone: selectedCategoria.icone, cor: selectedCategoria.cor },
        metodoPagamento: selectedPagamento.nome,
      };

      const novaTransacao = await createTransacao(transacaoData);
      addTransacao(novaTransacao);
      Alert.alert('Sucesso!', 'Transação salva.');
      router.back();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível salvar a transação.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCategoria = (categoria: any) => {
    setSelectedCategoria(categoria);
    setCategoriaSheetVisible(false);
  };
  
  const handleSelectPagamento = (pagamento: any) => {
    setSelectedPagamento(pagamento);
    setPagamentoSheetVisible(false);
  };

  const handleAddNewCategoria = () => {
    setCategoriaSheetVisible(false);
    router.push('/setup/categorias');
  };
  
  const handleAddNewPagamento = () => {
    setPagamentoSheetVisible(false);
    router.push('/setup/pagamentos');
  };

  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      {/* Top Section */}
      <View style={[styles.topSection, { backgroundColor: tipo === 'receita' ? colors.success : colors.error }]}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
                <MaterialIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            {/* Adicionar outros botões de header se necessário */}
        </View>
        <View style={styles.tipoSelector}>
          {['receita', 'despesa'].map((t) => (
            <TouchableOpacity key={t} onPress={() => setTipo(t as any)}>
              <Text style={[styles.tipoText, tipo === t && styles.tipoTextActive]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.amountText} numberOfLines={1} adjustsFontSizeToFit>R$ {amount}</Text>
        </View>
      </View>

      {/* Middle Section */}
      <View style={styles.middleSection}>
        <TouchableOpacity style={styles.selectorButton} onPress={() => setPagamentoSheetVisible(true)}>
            <FontAwesome5 name="wallet" size={20} color={selectedPagamento?.cor || colors.textMuted} />
            <Text style={[styles.selectorText, selectedPagamento && {color: colors.text, fontWeight: 'bold'}]}>
              {selectedPagamento?.nome || 'Escolha uma conta'}
            </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.selectorButton} onPress={() => setCategoriaSheetVisible(true)}>
            <MaterialIcons name={selectedCategoria?.icone || 'category'} size={20} color={selectedCategoria?.cor || colors.textMuted} />
            <Text style={[styles.selectorText, selectedCategoria && {color: colors.text, fontWeight: 'bold'}]}>
              {selectedCategoria?.nome || 'Escolha uma categoria'}
            </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.selectorButton}>
            <MaterialIcons name="edit" size={20} color={colors.textMuted} />
            <Text style={styles.selectorText}>{description || 'Adicione uma descrição'}</Text>
        </TouchableOpacity>
      </View>

      {/* Keyboard */}
      <CalculatorKeyboard onKeyPress={handleKeyPress} />

      {/* Selection Sheets */}
      <SelectionSheet 
        visible={isCategoriaSheetVisible}
        title="Categorias"
        items={categorias.filter(c => c.tipo === tipo || c.tipo === 'ambos')}
        onClose={() => setCategoriaSheetVisible(false)}
        onSelect={handleSelectCategoria}
        onAddNew={handleAddNewCategoria}
      />
      
      <SelectionSheet 
        visible={isPagamentoSheetVisible}
        title="Contas"
        items={metodosPagamento}
        onClose={() => setPagamentoSheetVisible(false)}
        onSelect={handleSelectPagamento}
        onAddNew={handleAddNewPagamento}
      />
    </View>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    topSection: {
      padding: 20,
      paddingTop: 50,
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    tipoSelector: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 20,
      marginVertical: 10,
    },
    tipoText: {
      color: '#fff',
      fontSize: 18,
      opacity: 0.7,
    },
    tipoTextActive: {
      opacity: 1,
      fontWeight: 'bold',
      borderBottomWidth: 2,
      borderBottomColor: '#fff',
    },
    amountContainer: {
      paddingVertical: 20,
      alignItems: 'center',
    },
    amountText: {
      fontSize: 56,
      fontWeight: 'bold',
      color: '#fff',
    },
    middleSection: {
      flex: 1,
      padding: 20,
      justifyContent: 'space-around',
    },
    selectorButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 15,
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    selectorText: {
      marginLeft: 15,
      fontSize: 16,
      color: colors.textMuted,
    },
  }); 