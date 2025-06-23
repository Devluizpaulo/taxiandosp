import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { usePostoStore } from '@/stores/postoStore';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function PostoDetalhesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { id } = useLocalSearchParams();
  
  const { getPostoById, addAvaliacao, loading } = usePostoStore();
  
  const [posto, setPosto] = useState<any>(null);
  const [showAvaliacaoForm, setShowAvaliacaoForm] = useState(false);
  const [avaliacaoForm, setAvaliacaoForm] = useState({
    nota: 5,
    comentario: '',
    categoria: 'geral',
  });

  useEffect(() => {
    if (id) {
      const postoData = getPostoById(id as string);
      setPosto(postoData);
    }
  }, [id]);

  const handleAddAvaliacao = async () => {
    if (!avaliacaoForm.comentario.trim()) {
      Alert.alert('Erro', 'Por favor, adicione um comentário.');
      return;
    }

    try {
      await addAvaliacao(id as string, {
        ...avaliacaoForm,
        data: new Date(),
      });

      Alert.alert('Sucesso', 'Avaliação adicionada com sucesso!');
      setShowAvaliacaoForm(false);
      setAvaliacaoForm({
        nota: 5,
        comentario: '',
        categoria: 'geral',
      });

      // Recarregar dados do posto
      const postoData = getPostoById(id as string);
      setPosto(postoData);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível adicionar a avaliação. Tente novamente.');
    }
  };

  const renderAvaliacao = (avaliacao: number) => {
    const estrelas = [];
    for (let i = 1; i <= 5; i++) {
      estrelas.push(
        <TouchableOpacity
          key={i}
          onPress={() => setAvaliacaoForm(prev => ({ ...prev, nota: i }))}
        >
          <MaterialIcons
            name={i <= avaliacao ? 'star' : 'star-border'}
            size={24}
            color={i <= avaliacao ? '#FFC107' : '#ccc'}
          />
        </TouchableOpacity>
      );
    }
    return <View style={styles.estrelasContainer}>{estrelas}</View>;
  };

  const renderAvaliacaoItem = ({ item }: { item: any }) => (
    <View style={styles.avaliacaoItem}>
      <View style={styles.avaliacaoHeader}>
        <View style={styles.avaliacaoInfo}>
          <Text style={styles.avaliacaoAutor}>{item.autor}</Text>
          <Text style={styles.avaliacaoData}>
            {new Date(item.data).toLocaleDateString('pt-BR')}
          </Text>
        </View>
        <View style={styles.avaliacaoNota}>
          {renderAvaliacao(item.nota)}
        </View>
      </View>
      <Text style={styles.avaliacaoComentario}>{item.comentario}</Text>
      {item.categoria && (
        <View style={styles.avaliacaoCategoria}>
          <Text style={styles.categoriaText}>{item.categoria}</Text>
        </View>
      )}
    </View>
  );

  if (!posto) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{posto.nome}</Text>
          <TouchableOpacity 
            onPress={() => Alert.alert('Em desenvolvimento', 'Funcionalidade de rota em breve!')}
            style={styles.routeButton}
          >
            <MaterialIcons name="directions" size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        {/* Informações Principais */}
        <View style={styles.infoCard}>
          <View style={styles.postoHeader}>
            <MaterialIcons name="local-gas-station" size={32} color="#4CAF50" />
            <View style={styles.postoInfo}>
              <Text style={styles.postoNome}>{posto.nome}</Text>
              <Text style={styles.postoEndereco}>{posto.endereco}</Text>
            </View>
          </View>

          <View style={styles.avaliacaoGeral}>
            <View style={styles.avaliacaoNotaGeral}>
              {renderAvaliacao(posto.avaliacaoMedia)}
              <Text style={styles.avaliacaoMedia}>{posto.avaliacaoMedia.toFixed(1)}</Text>
            </View>
            <Text style={styles.totalAvaliacoes}>
              {posto.totalAvaliacoes} avaliações
            </Text>
          </View>
        </View>

        {/* Detalhes do Posto */}
        <View style={styles.detalhesCard}>
          <Text style={styles.cardTitle}>Informações do Posto</Text>
          
          <View style={styles.detalheItem}>
            <MaterialIcons name="schedule" size={20} color="#FF9800" />
            <View style={styles.detalheInfo}>
              <Text style={styles.detalheLabel}>Horário de Funcionamento</Text>
              <Text style={styles.detalheValor}>{posto.horarioFuncionamento}</Text>
            </View>
          </View>

          <View style={styles.detalheItem}>
            <MaterialIcons name="phone" size={20} color="#9C27B0" />
            <View style={styles.detalheInfo}>
              <Text style={styles.detalheLabel}>Telefone</Text>
              <Text style={styles.detalheValor}>
                {posto.telefone || 'Não informado'}
              </Text>
            </View>
          </View>

          <View style={styles.detalheItem}>
            <MaterialIcons name="local-gas-station" size={20} color="#4CAF50" />
            <View style={styles.detalheInfo}>
              <Text style={styles.detalheLabel}>Tipos de Combustível</Text>
              <Text style={styles.detalheValor}>
                {posto.tiposCombustivel.join(', ')}
              </Text>
            </View>
          </View>

          {posto.servicos && posto.servicos.length > 0 && (
            <View style={styles.detalheItem}>
              <MaterialIcons name="build" size={20} color="#2196F3" />
              <View style={styles.detalheInfo}>
                <Text style={styles.detalheLabel}>Serviços</Text>
                <Text style={styles.detalheValor}>
                  {posto.servicos.join(', ')}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Mapa */}
        <View style={styles.mapaCard}>
          <Text style={styles.cardTitle}>Localização</Text>
          <View style={styles.mapaPlaceholder}>
            <MaterialIcons name="map" size={48} color="#ccc" />
            <Text style={styles.mapaPlaceholderText}>Mapa do Posto</Text>
            <Text style={styles.mapaPlaceholderSubtext}>Em desenvolvimento</Text>
          </View>
        </View>

        {/* Preços */}
        {posto.precos && posto.precos.length > 0 && (
          <View style={styles.precosCard}>
            <Text style={styles.cardTitle}>Últimos Preços</Text>
            {posto.precos.map((preco: any, index: number) => (
              <View key={index} style={styles.precoItem}>
                <View style={styles.precoInfo}>
                  <Text style={styles.precoTipo}>{preco.tipo}</Text>
                  <Text style={styles.precoData}>
                    {new Date(preco.data).toLocaleDateString('pt-BR')}
                  </Text>
                </View>
                <Text style={styles.precoValor}>R$ {preco.valor.toFixed(3)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Avaliações */}
        <View style={styles.avaliacoesCard}>
          <View style={styles.avaliacoesHeader}>
            <Text style={styles.cardTitle}>Avaliações</Text>
            <TouchableOpacity 
              onPress={() => setShowAvaliacaoForm(true)}
              style={styles.addAvaliacaoBtn}
            >
              <MaterialIcons name="add" size={20} color="#4CAF50" />
              <Text style={styles.addAvaliacaoText}>Avaliar</Text>
            </TouchableOpacity>
          </View>

          {posto.avaliacoes && Array.isArray(posto.avaliacoes) && posto.avaliacoes.length > 0 ? (
            <FlatList
              data={posto.avaliacoes}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderAvaliacaoItem}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyAvaliacoes}>
              <MaterialIcons name="star-border" size={48} color="#ccc" />
              <Text style={styles.emptyAvaliacoesText}>Nenhuma avaliação ainda</Text>
              <Text style={styles.emptyAvaliacoesSubtext}>
                Seja o primeiro a avaliar este posto
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal de Avaliação */}
      {showAvaliacaoForm && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Avaliar Posto</Text>
              <TouchableOpacity onPress={() => setShowAvaliacaoForm(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.avaliacaoForm}>
              <Text style={styles.formLabel}>Sua Avaliação</Text>
              <View style={styles.notaContainer}>
                {renderAvaliacao(avaliacaoForm.nota)}
                <Text style={styles.notaText}>{avaliacaoForm.nota} estrelas</Text>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Categoria</Text>
                <View style={styles.categoriaOptions}>
                  {['geral', 'preco', 'atendimento', 'limpeza', 'localizacao'].map((categoria) => (
                    <TouchableOpacity
                      key={categoria}
                      style={[
                        styles.categoriaOption,
                        avaliacaoForm.categoria === categoria && styles.categoriaOptionActive
                      ]}
                      onPress={() => setAvaliacaoForm(prev => ({ ...prev, categoria }))}
                    >
                      <Text style={[
                        styles.categoriaOptionText,
                        avaliacaoForm.categoria === categoria && styles.categoriaOptionTextActive
                      ]}>
                        {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Comentário *</Text>
                <TextInput
                  style={styles.comentarioInput}
                  value={avaliacaoForm.comentario}
                  onChangeText={(text) => setAvaliacaoForm(prev => ({ ...prev, comentario: text }))}
                  placeholder="Compartilhe sua experiência..."
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.formActions}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowAvaliacaoForm(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.submitButton}
                  onPress={handleAddAvaliacao}
                  disabled={loading}
                >
                  <Text style={styles.submitButtonText}>
                    {loading ? 'Enviando...' : 'Enviar Avaliação'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  routeButton: {
    padding: 8,
  },
  infoCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  postoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  postoInfo: {
    marginLeft: 12,
    flex: 1,
  },
  postoNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  postoEndereco: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  avaliacaoGeral: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  avaliacaoNotaGeral: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  estrelasContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  avaliacaoMedia: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAvaliacoes: {
    fontSize: 14,
    color: '#666',
  },
  detalhesCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  detalheItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detalheInfo: {
    flex: 1,
    marginLeft: 12,
  },
  detalheLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  detalheValor: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  mapaCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mapaPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  mapaPlaceholderText: {
    fontSize: 16,
    color: '#999',
    marginTop: 8,
  },
  mapaPlaceholderSubtext: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 4,
  },
  precosCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  precoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  precoInfo: {
    flex: 1,
  },
  precoTipo: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  precoData: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  precoValor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  avaliacoesCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avaliacoesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addAvaliacaoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addAvaliacaoText: {
    fontSize: 14,
    color: '#4CAF50',
    marginLeft: 4,
    fontWeight: '500',
  },
  avaliacaoItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avaliacaoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  avaliacaoInfo: {
    flex: 1,
  },
  avaliacaoAutor: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  avaliacaoData: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  avaliacaoNota: {
    flexDirection: 'row',
  },
  avaliacaoComentario: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  avaliacaoCategoria: {
    marginTop: 8,
  },
  categoriaText: {
    fontSize: 12,
    color: '#4CAF50',
    backgroundColor: '#f0f8f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  emptyAvaliacoes: {
    alignItems: 'center',
    padding: 32,
  },
  emptyAvaliacoesText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyAvaliacoesSubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  avaliacaoForm: {
    padding: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  notaContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  notaText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  formGroup: {
    marginBottom: 20,
  },
  categoriaOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoriaOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  categoriaOptionActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  categoriaOptionText: {
    fontSize: 12,
    color: '#666',
  },
  categoriaOptionTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  comentarioInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    height: 100,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
}); 