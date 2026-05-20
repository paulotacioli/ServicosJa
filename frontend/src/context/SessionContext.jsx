import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiPrestador, apiSolicitante } from '../lib/api';

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [solicitante, setSolicitante] = useState(null);
  const [prestador, setPrestador] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restaura sessão dos dois apps no mount
  useEffect(() => {
    (async () => {
      try {
        if (apiSolicitante.getToken()) {
          const u = await apiSolicitante.me();
          if (u.tipo === 'solicitante') setSolicitante(u);
          else apiSolicitante.setToken(null);
        }
      } catch { apiSolicitante.setToken(null); }
      try {
        if (apiPrestador.getToken()) {
          const u = await apiPrestador.me();
          if (u.tipo === 'prestador') setPrestador(u);
          else apiPrestador.setToken(null);
        }
      } catch { apiPrestador.setToken(null); }
      setLoading(false);
    })();
  }, []);

  const loginSolicitante = useCallback(async (email, senha) => {
    const r = await apiSolicitante.login({ email, senha });
    if (r.user.tipo !== 'solicitante') throw new Error('Esta conta não é de solicitante');
    apiSolicitante.setToken(r.token);
    setSolicitante(r.user);
  }, []);

  const loginPrestador = useCallback(async (email, senha) => {
    const r = await apiPrestador.login({ email, senha });
    if (r.user.tipo !== 'prestador') throw new Error('Esta conta não é de prestador');
    apiPrestador.setToken(r.token);
    setPrestador(r.user);
  }, []);

  const signupSolicitante = useCallback(async (data) => {
    const r = await apiSolicitante.signup({ ...data, tipo: 'solicitante' });
    apiSolicitante.setToken(r.token);
    setSolicitante(r.user);
  }, []);

  const signupPrestador = useCallback(async (data) => {
    const r = await apiPrestador.signup({ ...data, tipo: 'prestador' });
    apiPrestador.setToken(r.token);
    setPrestador(r.user);
  }, []);

  const logoutSolicitante = useCallback(() => {
    apiSolicitante.setToken(null);
    setSolicitante(null);
  }, []);

  const logoutPrestador = useCallback(() => {
    apiPrestador.setToken(null);
    setPrestador(null);
  }, []);

  return (
    <SessionContext.Provider
      value={{
        solicitante,
        prestador,
        loading,
        loginSolicitante,
        loginPrestador,
        signupSolicitante,
        signupPrestador,
        logoutSolicitante,
        logoutPrestador,
        setSolicitante,
        setPrestador,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
