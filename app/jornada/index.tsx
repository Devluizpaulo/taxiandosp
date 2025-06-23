import FloatingFuelButton from '@/components/FloatingFuelButton';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function JornadaScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Jornada</Text>
          <Text style={[styles.headerSubtitle, { color: colors.icon }]}>
            Gerencie suas jornadas de trabalho
          </Text>
        </View>

        <View style={styles.content}>
          {/* Card Iniciar Jornada */}
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card }]}
            onPress={() => router.push('/jornada/iniciar')}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(46, 204, 113, 0.1)' }]}>
                <Ionicons name="play-circle" size={32} color="#2ecc71" />
              </View>
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Iniciar Jornada</Text>
                <Text style={[styles.cardSubtitle, { color: colors.icon }]}>
                  Comece uma nova jornada de trabalho
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.icon} />
            </View>
          </TouchableOpacity>

          {/* Card Finalizar Jornada */}
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card }]}
            onPress={() => router.push('/jornada/finalizar')}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(231, 76, 60, 0.1)' }]}>
                <Ionicons name="stop-circle" size={32} color="#e74c3c" />
              </View>
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Finalizar Jornada</Text>
                <Text style={[styles.cardSubtitle, { color: colors.icon }]}>
                  Encerre sua jornada atual
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.icon} />
            </View>
          </TouchableOpacity>

          {/* Card Histórico */}
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card }]}
            onPress={() => router.push('/relatorios/resumo')}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(52, 152, 219, 0.1)' }]}>
                <Ionicons name="bar-chart" size={32} color="#3498db" />
              </View>
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Histórico</Text>
                <Text style={[styles.cardSubtitle, { color: colors.icon }]}>
                  Visualize suas jornadas anteriores
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.icon} />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Botão Flutuante de Combustível */}
      <FloatingFuelButton />
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