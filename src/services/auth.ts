import api from "./api";

export interface AuthUser {
  id: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  email: string;
  phoneNumber: string;
  position: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export const authService = {
  async login(payload: { email: string; password: string }) {
    const response = await api.post<AuthResponse>("/auth/login", payload);
    return response.data;
  },

  async register(payload: {
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
    position: string;
    role: string;
  }) {
    const response = await api.post<AuthUser>("/auth/register", payload);
    return response.data;
  },
};
