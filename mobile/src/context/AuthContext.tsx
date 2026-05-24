import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../lib/api';

export interface User {
  id: string;
  nome: string;
  email: string;
  cidade: string;
  whatsapp: string;
  categorias?: string[];
  bairros?: string[];
  descricao?: string;
  servicosConcluidos?: number;
  statusVerificacao?: 'PENDENTE' | 'EM_REVISAO' | 'APROVADO' | 'REPROVADO';
  role: 'solicitante' | 'prestador';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, senha: string, role: 'solicitante' | 'prestador') => Promise<void>;
  signup: (data: Record<string, unknown>) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [token, userStr] = await AsyncStorage.multiGet(['token', 'user']);
        if (token[1] && userStr[1]) setUser(JSON.parse(userStr[1]));
      } catch {}
      setLoading(false);
    })();
  }, []);

  const login = async (email: string, senha: string, role: 'solicitante' | 'prestador') => {
    const res = await api.login({ email, senha, tipo: role });
    const userData: User = { ...res.user, role };
    await AsyncStorage.multiSet([['token', res.token], ['user', JSON.stringify(userData)]]);
    setUser(userData);
  };

  const signup = async (data: Record<string, unknown>) => {
    const role = data.tipo as 'solicitante' | 'prestador';
    const res = await api.signup(data);
    const userData: User = { ...res.user, role };
    await AsyncStorage.multiSet([['token', res.token], ['user', JSON.stringify(userData)]]);
    setUser(userData);
  };

  const refreshUser = async () => {
    try {
      const fresh = await api.me();
      const role = user?.role ?? (fresh.tipo as 'solicitante' | 'prestador');
      const userData: User = { ...fresh, role };
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch {}
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['token', 'user']);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
