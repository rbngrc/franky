import { ApiClient } from '../../../lib/apiClient';
import type { LoginResponse } from '../types/auth.types';

export const AuthApiService = {
  login: (data: { username: string; password: string }) => {
    return ApiClient.post<LoginResponse>('/auth/login', data);
  },
};
