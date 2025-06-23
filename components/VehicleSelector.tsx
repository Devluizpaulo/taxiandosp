import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface VehicleInfo {
  id: string;
  nome: string;
  marca: string;
  modelo: string;
  ano: string;
  placa: string;
  combustivel: string;
  combustivelSecundario?: string;
  volumeTanque: string;
  volumeTanqueSecundario?: string;
  apelido?: string;
}

interface VehicleSelectorProps {
  vehicles: VehicleInfo[];
  selectedVehicle: VehicleInfo | null;
  onSelectVehicle: (vehicleId: string) => void;
  error?: boolean;
}

export default function VehicleSelector({
  vehicles,
  selectedVehicle,
  onSelectVehicle,
  error = false,
}: VehicleSelectorProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [showModal, setShowModal] = useState(false);

  const handleVehicleSelect = (vehicleId: string) => {
    onSelectVehicle(vehicleId);
    setShowModal(false);
  };

  const getVehicleDisplayName = (vehicle: VehicleInfo) => {
    if (vehicle.apelido) {
      return vehicle.apelido;
    }
    return `${vehicle.marca} ${vehicle.modelo}`;
  };

  const getVehicleSubtitle = (vehicle: VehicleInfo) => {
    return `${vehicle.ano} • ${vehicle.placa}`;
  };

  const getFuelIcon = (fuelType: string) => {
    switch (fuelType.toLowerCase()) {
      case 'gasolina':
        return 'water';
      case 'etanol':
        return 'leaf';
      case 'diesel':
        return 'flame';
      case 'gnv':
        return 'cloud';
      case 'elétrico':
      case 'híbrido':
        return 'flash';
      default:
        return 'car';
    }
  };

  return (
    <View style={styles.container}>
      {/* Seletor de veículo */}
      <TouchableOpacity
        style={[
          styles.vehicleSelector,
          { 
            borderColor: error ? '#e74c3c' : colors.text,
            backgroundColor: colors.card 
          }
        ]}
        onPress={() => setShowModal(true)}
        activeOpacity={0.8}
      >
        {selectedVehicle ? (
          <View style={styles.selectedVehicle}>
            <View style={styles.vehicleIcon}>
              <Ionicons 
                name={getFuelIcon(selectedVehicle.combustivel) as any} 
                size={24} 
                color={colors.tint} 
              />
            </View>
            <View style={styles.vehicleInfo}>
              <Text style={[styles.vehicleName, { color: colors.text }]}>
                {getVehicleDisplayName(selectedVehicle)}
              </Text>
              <Text style={[styles.vehicleSubtitle, { color: colors.icon }]}>
                {getVehicleSubtitle(selectedVehicle)}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={20} color={colors.text} />
          </View>
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="car" size={24} color={colors.icon} />
            <Text style={[styles.placeholderText, { color: colors.icon }]}>
              Selecione um veículo
            </Text>
            <Ionicons name="chevron-down" size={20} color={colors.icon} />
          </View>
        )}
      </TouchableOpacity>

      {/* Modal de seleção */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Selecione o Veículo
              </Text>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.vehicleList}>
              {vehicles.map((vehicle) => (
                <TouchableOpacity
                  key={vehicle.id}
                  style={[
                    styles.vehicleItem,
                    {
                      backgroundColor: selectedVehicle?.id === vehicle.id ? colors.tint : colors.card,
                      borderColor: colors.text,
                    },
                  ]}
                  onPress={() => handleVehicleSelect(vehicle.id)}
                >
                  <View style={styles.vehicleItemIcon}>
                    <Ionicons 
                      name={getFuelIcon(vehicle.combustivel) as any} 
                      size={20} 
                      color={selectedVehicle?.id === vehicle.id ? 'white' : colors.tint} 
                    />
                  </View>
                  <View style={styles.vehicleItemInfo}>
                    <Text 
                      style={[
                        styles.vehicleItemName, 
                        { color: selectedVehicle?.id === vehicle.id ? 'white' : colors.text }
                      ]}
                    >
                      {getVehicleDisplayName(vehicle)}
                    </Text>
                    <Text 
                      style={[
                        styles.vehicleItemSubtitle, 
                        { color: selectedVehicle?.id === vehicle.id ? 'rgba(255,255,255,0.8)' : colors.icon }
                      ]}
                    >
                      {getVehicleSubtitle(vehicle)}
                    </Text>
                    <Text 
                      style={[
                        styles.vehicleItemFuel, 
                        { color: selectedVehicle?.id === vehicle.id ? 'rgba(255,255,255,0.8)' : colors.icon }
                      ]}
                    >
                      {vehicle.combustivel} • {vehicle.volumeTanque}L
                    </Text>
                  </View>
                  {selectedVehicle?.id === vehicle.id && (
                    <Ionicons name="checkmark-circle" size={24} color="white" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {vehicles.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="car-outline" size={48} color={colors.icon} />
                <Text style={[styles.emptyStateText, { color: colors.icon }]}>
                  Nenhum veículo cadastrado
                </Text>
                <Text style={[styles.emptyStateSubtext, { color: colors.icon }]}>
                  Cadastre um veículo nas configurações
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  vehicleSelector: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  selectedVehicle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  vehicleSubtitle: {
    fontSize: 14,
  },
  placeholder: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  vehicleList: {
    padding: 20,
  },
  vehicleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  vehicleItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  vehicleItemInfo: {
    flex: 1,
  },
  vehicleItemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  vehicleItemSubtitle: {
    fontSize: 14,
    marginBottom: 2,
  },
  vehicleItemFuel: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
}); 