// Cliente HTTP simples que conversa com o backend NestJS
// Em produção, troque o baseURL pelo seu domínio

const API_BASE = '/api';

class ApiClient {
  constructor(storageKey) {
    this.storageKey = storageKey; // 'token_solicitante' ou 'token_prestador'
  }

  getToken() {
    return localStorage.getItem(this.storageKey);
  }

  setToken(token) {
    if (token) localStorage.setItem(this.storageKey, token);
    else localStorage.removeItem(this.storageKey);
  }

  async request(method, path, body) {
    const headers = { 'Content-Type': 'application/json' };
    const token = this.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

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

  // === AUTH ===
  signup(data) { return this.request('POST', '/auth/signup', data); }
  login(data)  { return this.request('POST', '/auth/login', data); }

  // === USERS ===
  me()                              { return this.request('GET', '/me'); }
  getPrestador(id)                  { return this.request('GET', `/prestadores/${id}`); }

  // === SOLICITANTE ===
  publicarServico(data)             { return this.request('POST', '/servicos', data); }
  meusServicos()                    { return this.request('GET', '/servicos/meus'); }
  getServico(id)                    { return this.request('GET', `/servicos/${id}`); }
  aprovarPrestador(id)              { return this.request('POST', `/servicos/${id}/aprovar`); }
  recusarPrestador(id, motivo)      { return this.request('POST', `/servicos/${id}/recusar`, { motivo }); }
  concluirServico(id)               { return this.request('POST', `/servicos/${id}/concluir`); }
  cancelarServico(id)               { return this.request('POST', `/servicos/${id}/cancelar`); }

  // === PRESTADOR ===
  feed()                            { return this.request('GET', '/feed'); }
  aceitarServico(id)                { return this.request('POST', `/feed/${id}/aceitar`); }
  recusarServicoSwipe(id)           { return this.request('POST', `/feed/${id}/recusar`); }
  meusAceites()                     { return this.request('GET', '/aceites/meus'); }

  // === NOTIF ===
  notificacoes()                    { return this.request('GET', '/notificacoes'); }
  notifUnread()                     { return this.request('GET', '/notificacoes/unread-count'); }
  notifMarcarLida(id)               { return this.request('POST', `/notificacoes/${id}/lida`); }
  notifMarcarTodasLidas()           { return this.request('POST', '/notificacoes/todas-lidas'); }
}

export const apiSolicitante = new ApiClient('token_solicitante');
export const apiPrestador = new ApiClient('token_prestador');
