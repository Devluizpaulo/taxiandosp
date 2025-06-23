import { Redirect } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';

export default function VehicleRegistrationGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      const user = getAuth().currentUser;
      if (!user) return setLoading(false);
      const db = getFirestore();
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);
      const data = docSnap.data();
      if (!docSnap.exists() || !data?.setupStatus) {
        setStatus({});
        setLoading(false);
        return;
      }
      setStatus(data.setupStatus);
      setLoading(false);
    };
    fetchStatus();
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  if (!status || (status && Object.keys(status).length === 0)) return <Redirect href="/setup/profile" />;
  if (!status.profile) return <Redirect href="/setup/profile" />;
  if (!status.vehicle) return <Redirect href="/setup/veiculo" />;
  if (!status.payment) return <Redirect href="/setup/pagamentos" />;
  if (!status.categories) return <Redirect href="/setup/categorias" />;
  if (!status.nickname) return <Redirect href="/setup/apelido" />;
  return <>{children}</>;
} 