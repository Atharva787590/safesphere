'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CityData, CITIES_DATA } from './demo-data';

export type UserRole = 'citizen' | 'researcher' | 'gov_officer' | 'admin';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

interface SettingsContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  currentCity: CityData;
  setCurrentCity: (city: CityData) => void;
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  googleMapsApiKey: string;
  setGoogleMapsApiKey: (key: string) => void;
  firebaseConfig: FirebaseConfig;
  setFirebaseConfig: (config: FirebaseConfig) => void;
  isFirebaseActive: boolean;
  isGeminiActive: boolean;
}

const DEFAULT_FIREBASE_CONFIG: FirebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: ''
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [userRole, setUserRoleState] = useState<UserRole>('citizen');
  const [currentCity, setCurrentCityState] = useState<CityData>(CITIES_DATA[0]); // Default to Phoenix
  const [geminiApiKey, setGeminiApiKeyState] = useState<string>('');
  const [googleMapsApiKey, setGoogleMapsApiKeyState] = useState<string>('');
  const [firebaseConfig, setFirebaseConfigState] = useState<FirebaseConfig>(DEFAULT_FIREBASE_CONFIG);

  // Load from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('safesphere_theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      // Default to dark mode for premium look
      document.documentElement.classList.add('dark');
    }

    const savedRole = localStorage.getItem('safesphere_role') as UserRole;
    if (savedRole) setUserRoleState(savedRole);

    const savedCityId = localStorage.getItem('safesphere_city_id');
    if (savedCityId) {
      const city = CITIES_DATA.find(c => c.id === savedCityId);
      if (city) {
        setCurrentCityState(city);
      } else {
        const savedCustomCity = localStorage.getItem('safesphere_custom_city');
        if (savedCustomCity) {
          try {
            setCurrentCityState(JSON.parse(savedCustomCity));
          } catch (e) {
            console.error('Error parsing custom city', e);
          }
        }
      }
    }

    const savedGeminiKey = localStorage.getItem('safesphere_gemini_key');
    if (savedGeminiKey) setGeminiApiKeyState(savedGeminiKey);

    const savedMapsKey = localStorage.getItem('safesphere_maps_key');
    if (savedMapsKey) setGoogleMapsApiKeyState(savedMapsKey);

    const savedFirebase = localStorage.getItem('safesphere_firebase');
    if (savedFirebase) {
      try {
        setFirebaseConfigState(JSON.parse(savedFirebase));
      } catch (e) {
        console.error('Error parsing saved firebase config', e);
      }
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('safesphere_theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    localStorage.setItem('safesphere_role', role);
  };

  const setCurrentCity = (city: CityData) => {
    setCurrentCityState(city);
    localStorage.setItem('safesphere_city_id', city.id);
    const isPreconfigured = CITIES_DATA.some(c => c.id === city.id);
    if (!isPreconfigured) {
      localStorage.setItem('safesphere_custom_city', JSON.stringify(city));
    } else {
      localStorage.removeItem('safesphere_custom_city');
    }
  };

  const setGeminiApiKey = (key: string) => {
    setGeminiApiKeyState(key);
    localStorage.setItem('safesphere_gemini_key', key);
  };

  const setGoogleMapsApiKey = (key: string) => {
    setGoogleMapsApiKeyState(key);
    localStorage.setItem('safesphere_maps_key', key);
  };

  const setFirebaseConfig = (config: FirebaseConfig) => {
    setFirebaseConfigState(config);
    localStorage.setItem('safesphere_firebase', JSON.stringify(config));
  };

  const isFirebaseActive = !!(firebaseConfig.apiKey && firebaseConfig.projectId);
  const isGeminiActive = !!geminiApiKey;

  return (
    <SettingsContext.Provider
      value={{
        theme,
        toggleTheme,
        userRole,
        setUserRole,
        currentCity,
        setCurrentCity,
        geminiApiKey,
        setGeminiApiKey,
        googleMapsApiKey,
        setGoogleMapsApiKey,
        firebaseConfig,
        setFirebaseConfig,
        isFirebaseActive,
        isGeminiActive
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
