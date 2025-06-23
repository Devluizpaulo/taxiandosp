import { MaterialIcons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface VehicleData {
  marca: string;
  modelo: string;
  ano: string;
  placa: string;
  cor: string;
  combustivel: string;
  combustivelSecundario?: string;
  foto?: string;
  renavam?: string;
  alvara?: string;
  validade?: string;
}

interface VehicleInfoCardProps {
  showDetails?: boolean;
  style?: any;
}

export default function VehicleInfoCard({ showDetails = false, style }: VehicleInfoCardProps) {
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicleData();
  }, []);

  const fetchVehicleData = async () => {
    try {
      const authUser = getAuth().currentUser;
      if (!authUser) return;
      
      const db = getFirestore();
      const userRef = doc(db, 'users', authUser.uid);
      const docSnap = await getDoc(userRef);
      const data = docSnap.data();
      
      if (data?.vehicle) {
        setVehicleData(data.vehicle);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do veículo:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loading, style]}>
        <Text style={styles.loadingText}>Carregando dados do veículo...</Text>
      </View>
    );
  }

  if (!vehicleData) {
    return (
      <View style={[styles.container, styles.noData, style]}>
        <MaterialIcons name="directions-car" size={24} color="#999" />
        <Text style={styles.noDataText}>Veículo não cadastrado</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <MaterialIcons name="directions-car" size={20} color="#4CAF50" />
        <Text style={styles.vehicleTitle}>
          {vehicleData.marca} {vehicleData.modelo}
        </Text>
      </View>
      
      <View style={styles.basicInfo}>
        <Text style={styles.placa}>{vehicleData.placa}</Text>
        <Text style={styles.year}>{vehicleData.ano}</Text>
      </View>

      {showDetails && (
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <MaterialIcons name="palette" size={16} color="#666" />
            <Text style={styles.detailText}>Cor: {vehicleData.cor}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <MaterialIcons name="local-gas-station" size={16} color="#666" />
            <Text style={styles.detailText}>
              Combustível: {vehicleData.combustivel}
              {vehicleData.combustivelSecundario && ` / ${vehicleData.combustivelSecundario}`}
            </Text>
          </View>

          {vehicleData.renavam && (
            <View style={styles.detailRow}>
              <MaterialIcons name="confirmation-number" size={16} color="#666" />
              <Text style={styles.detailText}>RENAVAM: {vehicleData.renavam}</Text>
            </View>
          )}

          {vehicleData.alvara && (
            <View style={styles.detailRow}>
              <MaterialIcons name="description" size={16} color="#666" />
              <Text style={styles.detailText}>Alvará: {vehicleData.alvara}</Text>
            </View>
          )}

          {vehicleData.validade && (
            <View style={styles.detailRow}>
              <MaterialIcons name="event" size={16} color="#666" />
              <Text style={styles.detailText}>Validade: {vehicleData.validade}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  loadingText: {
    color: '#666',
    fontSize: 14,
  },
  noData: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
    backgroundColor: '#f5f5f5',
  },
  noDataText: {
    color: '#999',
    fontSize: 14,
    marginTop: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  vehicleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginLeft: 8,
  },
  basicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  placa: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1b5e20',
    marginRight: 12,
  },
  year: {
    fontSize: 14,
    color: '#666',
  },
  details: {
    borderTopWidth: 1,
    borderTopColor: '#c8e6c9',
    paddingTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 6,
  },
}); 