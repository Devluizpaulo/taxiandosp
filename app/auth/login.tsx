import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [rememberMe, setRememberMe] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }
    setLoading(true);
    try {
      await AsyncStorage.setItem('rememberMe', rememberMe ? 'true' : 'false');
      if (isSignUp) {
        await signUp(email, password);
        Alert.alert('Sucesso', 'Conta criada com sucesso!');
        router.replace('/setup/profile');
      } else {
        await signIn(email, password);
        // Após login, buscar status do setup
        const user = getAuth().currentUser;
        if (user) {
          const db = getFirestore();
          const docSnap = await getDoc(doc(db, 'users', user.uid));
          const status = docSnap.data()?.setupStatus || {};
          if (!status.profile) return router.replace('/setup/profile');
          if (!status.vehicle) return router.replace('/setup/veiculo');
          if (!status.payment) return router.replace('/setup/pagamentos');
          if (!status.categories) return router.replace('/setup/categorias');
          if (!status.nickname) return router.replace('/setup/apelido');
          router.replace('/(tabs)');
        }
      }
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Image
              source={require('@/assets/images/taxiando-logo.png')}
              style={styles.logo}
            />
            <Text style={[styles.title, { color: colors.text }]}> {isSignUp ? 'Criar Conta' : 'Entrar'} </Text>
            <Text style={[styles.subtitle, { color: colors.text }]}> {isSignUp ? 'Crie sua conta para começar' : 'Entre com sua conta'} </Text>
          </View>
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Email</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: colors.text + '30',
                    backgroundColor: colors.background,
                    color: colors.text,
                  },
                ]}
                value={email}
                onChangeText={setEmail}
                placeholder="seu@email.com"
                placeholderTextColor={colors.text + '60'}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Senha</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: colors.text + '30',
                    backgroundColor: colors.background,
                    color: colors.text,
                  },
                ]}
                value={password}
                onChangeText={text => setPassword(text.replace(/[^0-9]/g, ''))}
                placeholder="Sua senha"
                placeholderTextColor={colors.text + '60'}
                secureTextEntry
                autoCapitalize="none"
                keyboardType="numeric"
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <TouchableOpacity
                onPress={() => setRememberMe(!rememberMe)}
                style={{ marginRight: 8 }}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: rememberMe }}
              >
                <View style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  borderWidth: 2,
                  borderColor: colors.tint,
                  backgroundColor: rememberMe ? colors.tint : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {rememberMe && (
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>✓</Text>
                  )}
                </View>
              </TouchableOpacity>
              <Text style={{ color: colors.text, fontSize: 16 }} onPress={() => setRememberMe(!rememberMe)}>
                Lembrar de mim
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.tint }]}
              onPress={handleAuth}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Carregando...' : isSignUp ? 'Criar Conta' : 'Entrar'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setIsSignUp(!isSignUp)}
            >
              <Text style={[styles.switchText, { color: colors.tint }]}> {isSignUp ? 'Já tem uma conta? Entre aqui' : 'Não tem conta? Crie uma aqui'} </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    padding: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  button: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  switchButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  switchText: {
    fontSize: 14,
    fontWeight: '500',
  },
}); 