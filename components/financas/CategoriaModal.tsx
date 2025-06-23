import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import IconPicker from './IconPicker';

const CORES = [
  '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3',
  '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
  '#FFEB3B', '#FFC107', '#FF9800', '#FF5722', '#795548', '#607D8B',
];

type Categoria = {
  id: string;
  nome: string;
  tipo: 'receita' | 'despesa';
  cor: string;
  icone: any;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (categoria: Omit<Categoria, 'id'>, id?: string) => Promise<void>;
  categoriaToEdit: Categoria | null;
  tipo: 'receita' | 'despesa';
};

export default function CategoriaModal({ visible, onClose, onSave, categoriaToEdit, tipo }: Props) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [nome, setNome] = useState('');
  const [cor, setCor] = useState(CORES[0]);
  const [icone, setIcone] = useState('category');
  const [loading, setLoading] = useState(false);
  const [isIconPickerVisible, setIconPickerVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      if (categoriaToEdit) {
        setNome(categoriaToEdit.nome);
        setCor(categoriaToEdit.cor);
        setIcone(categoriaToEdit.icone);
      } else {
        setNome('');
        setCor(CORES[Math.floor(Math.random() * CORES.length)]);
        setIcone('category');
      }
    }
  }, [categoriaToEdit, visible]);

  const handleSave = async () => {
    if (!nome.trim()) {
      alert('Por favor, insira um nome para a categoria.');
      return;
    }
    setLoading(true);
    const categoriaData = { nome: nome.trim(), cor, icone, tipo };
    await onSave(categoriaData, categoriaToEdit?.id);
    setLoading(false);
  };

  const handleSelectIcon = (selectedIcon: string) => {
    setIcone(selectedIcon);
    setIconPickerVisible(false);
  };

  const styles = getStyles(colors);

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
          <TouchableOpacity style={styles.modalContainer} activeOpacity={1} onPress={e => e.stopPropagation()}>
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.headerButton}>
                <MaterialIcons name="close" size={28} color={colors.textMuted} />
              </TouchableOpacity>
              <Text style={styles.title}>{categoriaToEdit ? 'Editar' : 'Adicionar'} Categoria</Text>
              <TouchableOpacity onPress={handleSave} disabled={loading} style={styles.headerButton}>
                {loading ? <ActivityIndicator color={colors.tint} /> : <MaterialIcons name="check" size={28} color={colors.tint} />}
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formContainer}>
                <TouchableOpacity style={[styles.iconPreview, { backgroundColor: cor }]} onPress={() => setIconPickerVisible(true)}>
                  <MaterialIcons name={icone as any} size={48} color="#fff" />
                </TouchableOpacity>
                
                <TextInput
                  style={styles.input}
                  placeholder="Nome da categoria"
                  placeholderTextColor={colors.textMuted}
                  value={nome}
                  onChangeText={setNome}
                />

                <Text style={styles.sectionTitle}>Cor</Text>
                <View style={styles.gridContainer}>
                  {CORES.map(c => (
                    <TouchableOpacity key={c} style={[styles.colorOption, { backgroundColor: c, borderColor: cor === c ? colors.tint : 'transparent' }]} onPress={() => setCor(c)} />
                  ))}
                </View>
              </View>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <IconPicker 
        visible={isIconPickerVisible}
        onClose={() => setIconPickerVisible(false)}
        onSelect={handleSelectIcon}
      />
    </>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContainer: { height: '70%', width: '90%', backgroundColor: colors.background, borderRadius: 20, padding: 15 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerButton: { padding: 5 },
  title: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  formContainer: { alignItems: 'center', paddingTop: 20 },
  iconPreview: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 20, elevation: 5, shadowColor: '#000' },
  input: { width: '100%', backgroundColor: colors.card, borderRadius: 12, padding: 15, fontSize: 16, color: colors.text, marginBottom: 20, borderWidth: 1, borderColor: colors.border },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text, alignSelf: 'flex-start', marginBottom: 10 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', marginBottom: 20, },
  colorOption: { width: 40, height: 40, borderRadius: 20, margin: 5, borderWidth: 3 },
});
