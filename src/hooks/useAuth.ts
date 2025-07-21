import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { authService, type LoginCredentials, type RegisterData } from '@/services/authService';
import { useNavigate } from 'react-router-dom';

// Hook para login
export const useLogin = () => {
  const { login: setAuthData } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: ({ tokens, user }) => {
      if (tokens.accessToken && tokens.refreshToken) {
        setAuthData(tokens.accessToken, tokens.refreshToken, user);
        // Limpiar cache de queries al hacer login
        queryClient.clear();
        navigate('/dashboard');
      }
    },
    onError: (error) => {
      console.error('Login error:', error);
    },
  });
};

// Hook para registro
export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (userData: RegisterData) => authService.register(userData),
    onSuccess: () => {
      // Después del registro exitoso, redirigir al login
      navigate('/login', { 
        state: { 
          message: 'Registro exitoso. Por favor, inicia sesión con tus credenciales.' 
        } 
      });
    },
    onError: (error) => {
      console.error('Registration error:', error);
    },
  });
};

// Hook para logout
export const useLogout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Aquí podrías llamar a un endpoint de logout si existe
      // await authService.logout();
      return Promise.resolve();
    },
    onSuccess: () => {
      logout();
      // Limpiar cache de queries al hacer logout
      queryClient.clear();
      navigate('/login');
    },
    onError: (error) => {
      console.error('Logout error:', error);
      // Forzar logout incluso si hay error
      logout();
      queryClient.clear();
      navigate('/login');
    },
  });
};

// Hook para refresh token
export const useRefreshToken = () => {
  const { refreshToken, updateTokens, logout } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => {
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      return authService.refreshToken(refreshToken);
    },
    onSuccess: (tokens) => {
      if (tokens.accessToken && tokens.refreshToken) {
        updateTokens(tokens.accessToken, tokens.refreshToken);
      }
    },
    onError: (error) => {
      console.error('Refresh token error:', error);
      // Si no se puede renovar el token, hacer logout
      logout();
      navigate('/login');
    },
  });
};

// Hook para verificar autenticación
export const useAuthStatus = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  return {
    isAuthenticated,
    isLoading,
    user,
    isAdmin: user?.rolUsuario === 'Admin',
    isUser: user?.rolUsuario === 'Usuario',
  };
};
