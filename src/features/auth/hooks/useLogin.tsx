import { useState } from 'react';
import { AuthApiService } from '../api/AuthApiService';
import { useAuth } from '../context/AuthContext';
import type { AuthUser } from '../types/auth.types';

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const doLogin = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await AuthApiService.login({ username, password });
      const user: AuthUser = {
        username: res.username,
        rol: res.rol,
        nombreCompleto: res.nombreCompleto,
        token: res.token,
      };
      login(user);
      return user;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error de login');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { doLogin, loading, error };
}
