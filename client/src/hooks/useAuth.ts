import { useCallback } from 'react';
import { authStore } from '../store/authStore';
import { authApi, LoginDto, RegisterDto } from '../api/authApi';
import { message } from 'antd';

export const useAuth = () => {
  const user = authStore((state) => state.user);
  const accessToken = authStore((state) => state.accessToken);
  const isAuthenticated = authStore((state) => state.isAuthenticated);
  const login = authStore((state) => state.login);
  const logout = authStore((state) => state.logout);
  const setUser = authStore((state) => state.setUser);

  const handleLogin = useCallback(
    async (credentials: LoginDto) => {
      try {
        const response = await authApi.login(credentials);
        login(response.user, response.accessToken, response.refreshToken);
        message.success('Вхід успішний!');
        return response;
      } catch (error: any) {
        message.error(error.response?.data?.message || 'Вхід не вдався');
        throw error;
      }
    },
    [login]
  );

  const handleRegister = useCallback(
    async (userData: RegisterDto) => {
      try {
        const response = await authApi.register(userData);
        login(response.user, response.accessToken, response.refreshToken);
        message.success('Реєстрація успішна!');
        return response;
      } catch (error: any) {
        message.error(error.response?.data?.message || 'Реєстрація не вдалася');
        throw error;
      }
    },
    [login]
  );

  const handleLogout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      logout();
      message.success('Вихід виконано успішно');
    }
  }, [logout]);

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await authApi.getProfile();
      setUser(profile);
      return profile;
    } catch (error) {
      console.error('Failed to refresh profile:', error);
      throw error;
    }
  }, [setUser]);

  return {
    user,
    accessToken,
    isAuthenticated,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    refreshProfile,
  };
};

