import { Posto } from '@/stores/postoStore';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PostoCardProps {
  posto: Posto;
  onPress?: () => void;
  onRoutePress?: () => void;
  showActions?: boolean;
}

export default function PostoCard({ 
  posto, 
  onPress, 
  onRoutePress,
  showActions = true 
}: PostoCardProps) {
  const renderAvaliacao = (avaliacao: number) => {
    const estrelas = [];
    for (let i = 1; i <= 5; i++) {
      estrelas.push(
        <MaterialIcons
          key={i}
          name={i <= avaliacao ? 'star' : 'star-border'}
          size={16}
          color={i <= avaliacao ? '#FFC107' : '#ccc'}
        />
      );
    }
    return <View style={styles.estrelasContainer}>{estrelas}</View>;
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={styles.postoNome}>{posto.nome}</Text>
          <Text style={styles.postoEndereco}>{posto.endereco}</Text>
          <View style={styles.avaliacaoContainer}>
            {renderAvaliacao(posto.avaliacaoMedia)}
            <Text style={styles.avaliacaoText}>
              {posto.avaliacaoMedia.toFixed(1)} ({posto.totalAvaliacoes} avaliações)
            </Text>
          </View>
        </View>
        {showActions && (
          <View style={styles.acoes}>
            <TouchableOpacity 
              style={styles.acaoBtn}
              onPress={onPress}
            >
              <MaterialIcons name="info" size={20} color="#2196F3" />
            </TouchableOpacity>
            {onRoutePress && (
              <TouchableOpacity 
                style={styles.acaoBtn}
                onPress={onRoutePress}
              >
                <MaterialIcons name="directions" size={20} color="#4CAF50" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <View style={styles.detalhes}>
        <View style={styles.detalheItem}>
          <MaterialIcons name="local-gas-station" size={16} color="#4CAF50" />
          <Text style={styles.detalheText}>
            {posto.tiposCombustivel.join(', ')}
          </Text>
        </View>
        <View style={styles.detalheItem}>
          <MaterialIcons name="schedule" size={16} color="#FF9800" />
          <Text style={styles.detalheText}>
            {posto.horarioFuncionamento}
          </Text>
        </View>
        {posto.telefone && (
          <View style={styles.detalheItem}>
            <MaterialIcons name="phone" size={16} color="#9C27B0" />
            <Text style={styles.detalheText}>
              {posto.telefone}
            </Text>
          </View>
        )}
      </View>

      {posto.ultimoPreco && (
        <View style={styles.precoInfo}>
          <Text style={styles.precoLabel}>Último preço:</Text>
          <Text style={styles.precoValor}>
            R$ {posto.ultimoPreco.valor.toFixed(3)}/{posto.ultimoPreco.tipo}
          </Text>
          <Text style={styles.precoData}>
            {new Date(posto.ultimoPreco.data).toLocaleDateString('pt-BR')}
          </Text>
        </View>
      )}

      {posto.ultimaVisita && (
        <View style={styles.visitaInfo}>
          <Text style={styles.visitaText}>
            Última visita: {new Date(posto.ultimaVisita).toLocaleDateString('pt-BR')}
          </Text>
        </View>
      )}

      {posto.servicos && Array.isArray(posto.servicos) && posto.servicos.length > 0 && (
        <View style={styles.servicosContainer}>
          <Text style={styles.servicosLabel}>Serviços:</Text>
          <Text style={styles.servicosText}>{posto.servicos.join(', ')}</Text>
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
  postoEndereco: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  avaliacaoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  estrelasContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  avaliacaoText: {
    fontSize: 12,
    color: '#666',
  },
  acoes: {
    flexDirection: 'row',
    gap: 8,
  },
  acaoBtn: {
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
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
  precoInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  precoLabel: {
    fontSize: 12,
    color: '#666',
  },
  precoValor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  precoData: {
    fontSize: 12,
    color: '#999',
  },
  visitaInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  visitaText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  servicosContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  servicosLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  servicosText: {
    fontSize: 12,
    color: '#666',
  },
}); 