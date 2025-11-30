import { axiosClient } from './axiosClient';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'User' | 'Admin';
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  role?: 'User' | 'Admin';
}

export interface UsersListResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
}

export const usersApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    role?: 'User' | 'Admin';
    search?: string;
  }): Promise<UsersListResponse> => {
    const { data } = await axiosClient.get<UsersListResponse>('/api/users', { params });
    return data;
  },

  getById: async (id: number): Promise<User> => {
    const { data } = await axiosClient.get<User>(`/api/users/${id}`);
    return data;
  },

  update: async (id: number, updateDto: UpdateUserDto): Promise<User> => {
    const { data } = await axiosClient.patch<User>(`/api/users/${id}`, updateDto);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosClient.delete(`/api/users/${id}`);
  },

  getMe: async (): Promise<User> => {
    const { data } = await axiosClient.get<User>('/api/users/me');
    return data;
  },

  updateMe: async (updateDto: UpdateUserDto): Promise<User> => {
    const { data } = await axiosClient.patch<User>('/api/users/me', updateDto);
    return data;
  },

  updatePassword: async (updatePasswordDto: {
    oldPassword: string;
    newPassword: string;
  }): Promise<void> => {
    await axiosClient.patch('/api/users/me/password', updatePasswordDto);
  },
};

