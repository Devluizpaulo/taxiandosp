import { Abastecimento } from '@/stores/combustivelStore';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AbastecimentoCardProps {
  abastecimento: Abastecimento;
  onPress?: () => void;
  showConsumo?: boolean;
  kmAnterior?: number;
}

export default function AbastecimentoCard({ 
  abastecimento, 
  onPress, 
  showConsumo = false,
  kmAnterior 
}: AbastecimentoCardProps) {
  const kmPercorrido = kmAnterior ? abastecimento.kmAtual - kmAnterior : null;
  const consumo = kmPercorrido && abastecimento.litros ? kmPercorrido / abastecimento.litros : null;

  const getCombustivelColor = (tipo: string) => {
    switch (tipo) {
      case 'gasolina':
        return '#4CAF50';
      case 'etanol':
        return '#FF9800';
      case 'diesel':
        return '#2196F3';
      default:
        return '#666';
    }
  };

  const getCombustivelIcon = (tipo: string) => {
    switch (tipo) {
      case 'gasolina':
        return 'local-gas-station';
      case 'etanol':
        return 'local-gas-station';
      case 'diesel':
        return 'local-gas-station';
      default:
        return 'local-gas-station';
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={styles.postoNome}>{abastecimento.postoNome}</Text>
          <Text style={styles.data}>
            {new Date(abastecimento.data).toLocaleDateString('pt-BR')}
          </Text>
        </View>
        <View style={styles.valores}>
          <Text style={styles.litros}>{abastecimento.litros}L</Text>
          <Text style={styles.valorTotal}>R$ {abastecimento.valorTotal.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.detalhes}>
        <View style={styles.detalheItem}>
          <MaterialIcons 
            name={getCombustivelIcon(abastecimento.tipoCombustivel)} 
            size={16} 
            color={getCombustivelColor(abastecimento.tipoCombustivel)} 
          />
          <Text style={styles.detalheText}>
            {abastecimento.tipoCombustivel.charAt(0).toUpperCase() + abastecimento.tipoCombustivel.slice(1)}
          </Text>
        </View>

        <View style={styles.detalheItem}>
          <MaterialIcons name="speed" size={16} color="#2196F3" />
          <Text style={styles.detalheText}>KM: {abastecimento.kmAtual}</Text>
        </View>

        <View style={styles.detalheItem}>
          <MaterialIcons name="attach-money" size={16} color="#FF9800" />
          <Text style={styles.detalheText}>R$ {abastecimento.precoLitro.toFixed(3)}/L</Text>
        </View>
      </View>

      {showConsumo && kmPercorrido && consumo && (
        <View style={styles.consumoInfo}>
          <Text style={styles.consumoText}>
            KM percorrido: {kmPercorrido.toFixed(0)} | 
            Consumo: {consumo.toFixed(1)} km/L
          </Text>
        </View>
      )}

      {abastecimento.observacoes && (
        <View style={styles.observacoesContainer}>
          <Text style={styles.observacoesText}>{abastecimento.observacoes}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  info: {
    flex: 1,
  },
  postoNome: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  data: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  valores: {
    alignItems: 'flex-end',
  },
  litros: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  valorTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  detalhes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  detalheItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detalheText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  consumoInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  consumoText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
  },
  observacoesContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  observacoesText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
}); 