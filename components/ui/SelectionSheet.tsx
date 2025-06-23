import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Item = {
  id: string;
  nome: string;
  icone?: any;
  cor?: string;
};

type Props = {
  visible: boolean;
  title: string;
  items: Item[];
  onClose: () => void;
  onSelect: (item: Item) => void;
  onAddNew: () => void;
};

export default function SelectionSheet({ visible, title, items, onClose, onSelect, onAddNew }: Props) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = items.filter(item =>
    item.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const styles = getStyles(colors);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={`Buscar ${title.toLowerCase()}...`}
              placeholderTextColor={colors.textMuted}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>

          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={[styles.itemButton, { backgroundColor: item.cor || colors.card }]} onPress={() => onSelect(item)}>
                {item.icone && <MaterialIcons name={item.icone} size={20} color={item.cor ? '#fff' : colors.text} style={styles.itemIcon} />}
                <Text style={[styles.itemText, { color: item.cor ? '#fff' : colors.text }]}>{item.nome}</Text>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />
          
          <TouchableOpacity style={styles.addNewButton} onPress={onAddNew}>
            <MaterialIcons name="add" size={20} color={colors.tint} />
            <Text style={styles.addNewButtonText}>Criar nova categoria</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContainer: {
        height: '75%',
        backgroundColor: colors.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: 12,
        paddingHorizontal: 10,
        marginBottom: 20,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        color: colors.text,
    },
    itemButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
    },
    itemIcon: {
        marginRight: 15,
    },
    itemText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    addNewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        marginTop: 10,
    },
    addNewButtonText: {
        marginLeft: 10,
        fontSize: 16,
        color: colors.tint,
        fontWeight: 'bold',
    }
}); 