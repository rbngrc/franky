export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = {
  username: string;
  rol: string;
  nombreCompleto: string;
  token?: string;
};

export type AuthUser = {
  username: string;
  rol: string;
  nombreCompleto: string;
  token?: string;
};
