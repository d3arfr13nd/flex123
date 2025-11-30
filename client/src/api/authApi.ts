import { axiosClient } from './axiosClient';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: 'User' | 'Admin';
  };
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: 'User' | 'Admin';
  createdAt: string;
  updatedAt: string;
}

export const authApi = {
  login: async (credentials: LoginDto): Promise<AuthResponse> => {
    const { data } = await axiosClient.post<AuthResponse>('/api/auth/login', credentials);
    return data;
  },

  register: async (userData: RegisterDto): Promise<AuthResponse> => {
    const { data } = await axiosClient.post<AuthResponse>('/api/auth/register', userData);
    return data;
  },

  getProfile: async (): Promise<UserProfile> => {
    const { data } = await axiosClient.get<UserProfile>('/api/auth/profile');
    return data;
  },

  logout: async (): Promise<void> => {
    await axiosClient.post('/api/auth/logout');
  },

  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    const { data } = await axiosClient.post<AuthResponse>('/api/auth/refresh', {
      refreshToken,
    });
    return data;
  },
};

