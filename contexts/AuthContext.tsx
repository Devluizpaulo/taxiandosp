import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    createUserWithEmailAndPassword,
    EmailAuthProvider,
    onAuthStateChanged,
    reauthenticateWithCredential,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    updatePassword,
    updateProfile,
    User
} from 'firebase/auth';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { auth } from '../firebase.config';

// Função para validar email
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Função para validar senha
const isValidPassword = (password: string): boolean => {
  return password && typeof password === 'string' && password.length >= 6;
};

// Função para traduzir mensagens de erro do Firebase
const getFirebaseErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'Usuário não encontrado';
    case 'auth/wrong-password':
      return 'Senha incorreta';
    case 'auth/email-already-in-use':
      return 'Este email já está em uso';
    case 'auth/weak-password':
      return 'A senha deve ter pelo menos 6 caracteres';
    case 'auth/invalid-email':
      return 'Email inválido';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Tente novamente mais tarde';
    case 'auth/network-request-failed':
      return 'Erro de conexão. Verifique sua internet';
    case 'auth/invalid-credential':
      return 'Credenciais inválidas';
    case 'auth/requires-recent-login':
      return 'Por segurança, faça login novamente para continuar';
    case 'auth/operation-not-allowed':
      return 'Operação não permitida';
    case 'auth/user-disabled':
      return 'Esta conta foi desabilitada';
    default:
      return 'Erro de autenticação. Tente novamente';
  }
};

// Tipos para estados de loading específicos
type LoadingStates = {
  signIn: boolean;
  signUp: boolean;
  logout: boolean;
  resetPassword: boolean;
  updateProfile: boolean;
  changePassword: boolean;
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loadingStates: LoadingStates;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  isEmailValid: (email: string) => boolean;
  isPasswordValid: (password: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    signIn: false,
    signUp: false,
    logout: false,
    resetPassword: false,
    updateProfile: false,
    changePassword: false,
  });

  // Função para atualizar estados de loading específicos
  const updateLoadingState = useCallback((key: keyof LoadingStates, value: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Checa a preferência de login recorrente
      const remember = await AsyncStorage.getItem('rememberMe');
      if (user && remember !== 'true') {
        // Se não for para lembrar, faz logout automático
        await signOut(auth);
        setUser(null);
        setLoading(false);
        return;
      }
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isValidEmail(email)) {
      throw new Error('Email inválido');
    }
    if (!isValidPassword(password)) {
      throw new Error('A senha deve ter pelo menos 6 caracteres');
    }

    updateLoadingState('signIn', true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      throw new Error(getFirebaseErrorMessage(error.code));
    } finally {
      updateLoadingState('signIn', false);
    }
  }, [updateLoadingState]);

  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    if (!isValidEmail(email)) {
      throw new Error('Email inválido');
    }
    if (!isValidPassword(password)) {
      throw new Error('A senha deve ter pelo menos 6 caracteres');
    }

    updateLoadingState('signUp', true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Atualizar perfil com displayName se fornecido
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }
    } catch (error: any) {
      throw new Error(getFirebaseErrorMessage(error.code));
    } finally {
      updateLoadingState('signUp', false);
    }
  }, [updateLoadingState]);

  const logout = useCallback(async () => {
    updateLoadingState('logout', true);
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(getFirebaseErrorMessage(error.code));
    } finally {
      updateLoadingState('logout', false);
    }
  }, [updateLoadingState]);

  const resetPassword = useCallback(async (email: string) => {
    if (!isValidEmail(email)) {
      throw new Error('Email inválido');
    }

    updateLoadingState('resetPassword', true);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(getFirebaseErrorMessage(error.code));
    } finally {
      updateLoadingState('resetPassword', false);
    }
  }, [updateLoadingState]);

  const updateUserProfile = useCallback(async (displayName: string) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }
    if (!displayName.trim()) {
      throw new Error('Nome não pode estar vazio');
    }

    updateLoadingState('updateProfile', true);
    try {
      await updateProfile(user, { displayName: displayName.trim() });
    } catch (error: any) {
      throw new Error(getFirebaseErrorMessage(error.code));
    } finally {
      updateLoadingState('updateProfile', false);
    }
  }, [user, updateLoadingState]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    if (!user || !user.email) {
      throw new Error('Usuário não autenticado');
    }
    if (!isValidPassword(newPassword)) {
      throw new Error('A nova senha deve ter pelo menos 6 caracteres');
    }

    updateLoadingState('changePassword', true);
    try {
      // Reautenticar usuário antes de alterar senha
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Alterar senha
      await updatePassword(user, newPassword);
    } catch (error: any) {
      throw new Error(getFirebaseErrorMessage(error.code));
    } finally {
      updateLoadingState('changePassword', false);
    }
  }, [user, updateLoadingState]);

  // Memoizar o valor do contexto para evitar re-renders desnecessários
  const value = useMemo(() => ({
    user,
    loading,
    loadingStates,
    signIn,
    signUp,
    logout,
    resetPassword,
    updateUserProfile,
    changePassword,
    isEmailValid: isValidEmail,
    isPasswordValid: isValidPassword,
  }), [
    user,
    loading,
    loadingStates,
    signIn,
    signUp,
    logout,
    resetPassword,
    updateUserProfile,
    changePassword,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};