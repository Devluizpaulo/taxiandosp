import { useCombustivelStore } from '@/stores/combustivelStore';
import { getAuth } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, getFirestore, limit, orderBy, query, where } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { VehicleData, VehicleInfo } from '../types/vehicle';

export function useVehicleInfo() {
  const [vehicles, setVehicles] = useState<VehicleInfo[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleInfo | null>(null);
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { buscarKmAtual, abastecimentos } = useCombustivelStore();

  // Função para carregar dados específicos do veículo
  const loadVehicleData = useCallback(async (vehicleId: string) => {
    if (!vehicleId) return;

    try {
      const user = getAuth().currentUser;
      if (!user) return;

      const db = getFirestore();
      
      // Buscar KM atual do último abastecimento deste veículo
      const abastecimentosRef = collection(db, 'abastecimentos');
      const q = query(
        abastecimentosRef,
        where('vehicleId', '==', vehicleId),
        orderBy('data', 'desc'),
        limit(1)
      );
      
      const abastecimentosSnap = await getDocs(q);
      let kmAtual = 0;
      let ultimoAbastecimento = null;

      if (!abastecimentosSnap.empty) {
        const ultimo = abastecimentosSnap.docs[0].data();
        kmAtual = ultimo.kmAtual || 0;
        ultimoAbastecimento = {
          data: ultimo.data.toDate(),
          km: ultimo.kmAtual,
          litros: ultimo.litros,
          tipoCombustivel: ultimo.tipoCombustivel,
        };
      }

      // Buscar última jornada deste veículo
      const jornadasRef = collection(db, 'jornadas');
      const jornadasQuery = query(
        jornadasRef,
        where('vehicleId', '==', vehicleId),
        orderBy('horaInicial', 'desc'),
        limit(1)
      );

      const jornadasSnap = await getDocs(jornadasQuery);
      let ultimaJornada = null;

      if (!jornadasSnap.empty) {
        const jornada = jornadasSnap.docs[0].data();
        if (jornada.kmFinal) {
          ultimaJornada = {
            kmInicial: jornada.kmInicial,
            kmFinal: jornada.kmFinal,
            data: jornada.horaFinal.toDate(),
          };
        }
      }

      // Calcular nível de combustível estimado
      const nivelCombustivel = ultimoAbastecimento ? ultimoAbastecimento.litros : 0;
      const nivelCombustivelSecundario = ultimoAbastecimento?.tipoCombustivel === 'gnv' ? 0 : undefined;

      setVehicleData({
        kmAtual,
        nivelCombustivel,
        nivelCombustivelSecundario,
        ultimaJornada,
      });

    } catch (err) {
      console.error('Erro ao carregar dados do veículo:', err);
    }
  }, []);

  // Função para carregar veículos
  const fetchVehicles = useCallback(async () => {
    try {
      const user = getAuth().currentUser;
      if (!user) {
        setError('Usuário não autenticado');
        setLoading(false);
        return;
      }

      const db = getFirestore();
      const docSnap = await getDoc(doc(db, 'users', user.uid));
      const data = docSnap.data();
      
      let vehiclesList: VehicleInfo[] = [];
      
      if (data?.vehicles && Array.isArray(data.vehicles)) {
        vehiclesList = data.vehicles;
      } else if (data?.vehicle) {
        // Compatibilidade com formato antigo (um só veículo)
        const singleVehicle: VehicleInfo = {
          id: 'default',
          nome: data.vehicle.nome || 'Meu Carro',
          marca: data.vehicle.marca || 'Marca',
          modelo: data.vehicle.modelo || 'Modelo',
          ano: data.vehicle.ano || '2024',
          placa: data.vehicle.placa || 'ABC-1234',
          combustivel: data.vehicle.combustivel || 'Gasolina',
          combustivelSecundario: data.vehicle.combustivelSecundario,
          volumeTanque: data.vehicle.volumeTanque || '60',
          volumeTanqueSecundario: data.vehicle.volumeTanqueSecundario,
          apelido: data.vehicle.apelido,
        };
        vehiclesList = [singleVehicle];
      } else {
        // Usar valores padrão se não houver dados do veículo
        const defaultVehicle: VehicleInfo = {
          id: 'default',
          nome: 'Meu Carro',
          marca: 'Marca',
          modelo: 'Modelo',
          ano: '2024',
          placa: 'ABC-1234',
          combustivel: 'Gasolina',
          volumeTanque: '60',
        };
        vehiclesList = [defaultVehicle];
      }

      setVehicles(vehiclesList);
      
      // Selecionar o primeiro veículo por padrão
      if (vehiclesList.length > 0) {
        setSelectedVehicle(vehiclesList[0]);
        // Carregar dados específicos do veículo selecionado
        await loadVehicleData(vehiclesList[0].id);
      }

    } catch (err: any) {
      console.error('Erro ao buscar informações do veículo:', err);
      // Usar valores padrão em caso de erro
      const defaultVehicle: VehicleInfo = {
        id: 'default',
        nome: 'Meu Carro',
        marca: 'Marca',
        modelo: 'Modelo',
        ano: '2024',
        placa: 'ABC-1234',
        combustivel: 'Gasolina',
        volumeTanque: '60',
      };
      setVehicles([defaultVehicle]);
      setSelectedVehicle(defaultVehicle);
    } finally {
      setLoading(false);
    }
  }, [loadVehicleData]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // Função para selecionar um veículo
  const selectVehicle = useCallback(async (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      setSelectedVehicle(vehicle);
      // Carregar dados específicos do veículo selecionado
      await loadVehicleData(vehicleId);
    }
  }, [vehicles, loadVehicleData]);

  // Função para obter KM atual (com fallback para dados locais)
  const getCurrentKm = useCallback(() => {
    if (vehicleData?.kmAtual) {
      return vehicleData.kmAtual;
    }
    // Fallback para dados do store local
    return buscarKmAtual();
  }, [vehicleData, buscarKmAtual]);

  // Função para obter a unidade baseada no tipo de combustível
  const getFuelUnit = (fuelType: string): string => {
    switch (fuelType.toLowerCase()) {
      case 'elétrico':
      case 'híbrido (hev)':
      case 'híbrido (phev)':
        return 'kWh';
      case 'gnv':
        return 'm³';
      default:
        return 'L';
    }
  };

  // Função para obter a capacidade máxima baseada no tipo de combustível
  const getMaxCapacity = (fuelType: string, volumeTanque: string): number => {
    const volume = parseFloat(volumeTanque) || 60; // Valor padrão de 60L
    
    switch (fuelType.toLowerCase()) {
      case 'híbrido (phev)':
        // Para PHEV, usar o tanque principal (gasolina/etanol)
        return volume;
      case 'gnv':
        // Para GNV, usar o tanque principal (gasolina/etanol)
        return volume;
      case 'elétrico':
      case 'híbrido (hev)':
        return volume;
      default:
        return volume;
    }
  };

  // Função para obter o tipo de combustível principal
  const getPrimaryFuelType = (): string => {
    if (!selectedVehicle) return 'Gasolina';
    
    const fuelType = selectedVehicle.combustivel;
    
    // Para híbridos, mostrar o combustível líquido
    if (fuelType.includes('Híbrido')) {
      return selectedVehicle.combustivelSecundario || 'Gasolina';
    }
    
    // Para GNV, mostrar o combustível líquido
    if (fuelType === 'GNV') {
      return selectedVehicle.combustivelSecundario || 'Gasolina';
    }
    
    return fuelType;
  };

  // Função para obter nível de combustível estimado
  const getEstimatedFuelLevel = (): number => {
    if (vehicleData?.nivelCombustivel && selectedVehicle) {
      const maxCapacity = getMaxCapacity(getPrimaryFuelType(), selectedVehicle.volumeTanque);
      return Math.min(vehicleData.nivelCombustivel, maxCapacity);
    }
    return 0;
  };

  // Função para recarregar dados do veículo
  const refreshVehicleData = useCallback(async () => {
    if (selectedVehicle) {
      await loadVehicleData(selectedVehicle.id);
    }
  }, [selectedVehicle, loadVehicleData]);

  return {
    vehicles,
    selectedVehicle,
    vehicleData,
    loading,
    error,
    selectVehicle,
    getCurrentKm,
    getFuelUnit,
    getMaxCapacity,
    getPrimaryFuelType,
    getEstimatedFuelLevel,
    refreshVehicleData,
  };
} 