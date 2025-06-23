import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Modal, SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ICON_SECTIONS = [
  {
    title: 'Finanças e Compras',
    data: ['attach-money', 'credit-card', 'shopping-cart', 'receipt', 'account-balance-wallet', 'trending-up', 'trending-down'],
  },
  {
    title: 'Transporte',
    data: ['directions-car', 'local-gas-station', 'local-shipping', 'train', 'flight', 'motorcycle', 'build'],
  },
  {
    title: 'Casa e Contas',
    data: ['home', 'lightbulb', 'water-drop', 'phone', 'wifi', 'local-fire-department'],
  },
  {
    title: 'Comida e Bebida',
    data: ['restaurant', 'fastfood', 'local-cafe', 'local-bar', 'icecream', 'lunch-dining'],
  },
  {
    title: 'Lazer e Esportes',
    data: ['theaters', 'sports-esports', 'fitness-center', 'pool', 'beach-access', 'music-note', 'movie'],
  },
  {
    title: 'Saúde e Cuidados',
    data: ['local-hospital', 'healing', 'local-pharmacy', 'spa', 'content-cut'],
  },
  {
    title: 'Educação e Trabalho',
    data: ['school', 'business-center', 'work', 'book', 'computer'],
  },
];

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (iconName: string) => void;
};

export default function IconPicker({ visible, onClose, onSelect }: Props) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const styles = getStyles(colors);

  const renderItem = ({ item }: { item: string }) => (
    <TouchableOpacity style={styles.iconOption} onPress={() => onSelect(item)}>
      <MaterialIcons name={item as any} size={30} color={colors.text} />
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
    <Text style={styles.sectionTitle}>{title}</Text>
  );

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Escolha um Ícone</Text>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={28} color={colors.text} />
          </TouchableOpacity>
        </View>
        <SectionList
          sections={ICON_SECTIONS}
          keyExtractor={(item, index) => item + index}
          renderItem={({ item, section }) => (
            // O SectionList renderiza um FlatList interno por seção, então precisamos garantir
            // que os itens sejam envolvidos em uma View para o `columnWrapperStyle` funcionar.
            <View>
              <TouchableOpacity style={styles.iconOption} onPress={() => onSelect(item)}>
                <MaterialIcons name={item as any} size={30} color={colors.text} />
              </TouchableOpacity>
            </View>
          )}
          renderSectionHeader={renderSectionHeader}
          numColumns={5}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
        />
      </View>
    </Modal>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 50, paddingHorizontal: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingHorizontal: 10, },
  title: { fontSize: 22, fontWeight: 'bold', color: colors.text },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textMuted, marginVertical: 15, paddingHorizontal: 10 },
  row: {
    justifyContent: 'space-around',
  },
  iconOption: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
}); 