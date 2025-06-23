import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDjibXEZvmKACNMI_3K9x6D4lXkiS2YxNg",
  authDomain: "fenix-solutionsbuild.firebaseapp.com",
  projectId: "fenix-solutionsbuild",
  storageBucket: "fenix-solutionsbuild.firebasestorage.app",
  messagingSenderId: "189588020641",
  appId: "1:189588020641:web:e7b70fe4b4820ed824ffe0",
  measurementId: "G-S9Z3C789LH"
};

const apps = getApps();
const app = apps.length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth;
if (
  typeof navigator !== 'undefined' &&
  navigator.product === 'ReactNative'
) {
  // Só importa no React Native
  const { initializeAuth, getReactNativePersistence } = require('firebase/auth');
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} else {
  // Web
  auth = getAuth(app);
}

export { auth };

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);