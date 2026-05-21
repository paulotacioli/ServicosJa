import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Altere este endereço para o IP do seu servidor em produção.
// Android Emulator → 10.0.2.2 | iOS Simulator → localhost
const API_BASE = Platform.OS === 'android'
  ? 'http://10.0.2.2:3000/api'
  : 'http://localhost:3000/api';

async function request(method: string, path: string, body?: unknown): Promise<any> {
  const token = await AsyncStorage.getItem('token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let msg = 'Erro na requisição';
    try {
      const j = await res.json();
      msg = j.message || msg;
      if (Array.isArray(msg)) msg = msg.join(', ');
    } catch {}
    throw new Error(msg);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  // Auth
  signup: (data: unknown) => request('POST', '/auth/signup', data),
  login: (data: unknown) => request('POST', '/auth/login', data),

  // Users
  me: () => request('GET', '/me'),
  getPrestador: (id: string) => request('GET', `/prestadores/${id}`),

  // Solicitante
  publicarServico: (data: unknown) => request('POST', '/servicos', data),
  meusServicos: () => request('GET', '/servicos/meus'),
  getServico: (id: string) => request('GET', `/servicos/${id}`),
  aprovarPrestador: (id: string) => request('POST', `/servicos/${id}/aprovar`),
  recusarPrestador: (id: string) => request('POST', `/servicos/${id}/recusar`),
  concluirServico: (id: string) => request('POST', `/servicos/${id}/concluir`),
  cancelarServico: (id: string) => request('POST', `/servicos/${id}/cancelar`),

  // Prestador
  feed: () => request('GET', '/feed'),
  aceitarServico: (id: string) => request('POST', `/feed/${id}/aceitar`),
  recusarServicoSwipe: (id: string) => request('POST', `/feed/${id}/recusar`),
  meusAceites: () => request('GET', '/aceites/meus'),

  // Notificações
  notificacoes: () => request('GET', '/notificacoes'),
  notifUnread: () => request('GET', '/notificacoes/unread-count'),
  notifMarcarLida: (id: string) => request('POST', `/notificacoes/${id}/lida`),
  notifMarcarTodasLidas: () => request('POST', '/notificacoes/todas-lidas'),
};
