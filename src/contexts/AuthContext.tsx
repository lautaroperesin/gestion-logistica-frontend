import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Usuario } from '@/api';

interface AuthContextType {
  user: Usuario | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string, user: Usuario) => void;
  logout: () => void;
  updateTokens: (accessToken: string, refreshToken: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos del localStorage al inicializar
  useEffect(() => {
    const loadStoredAuth = () => {
      try {
        const storedAccessToken = localStorage.getItem('accessToken');
        const storedRefreshToken = localStorage.getItem('refreshToken');
        const storedUser = localStorage.getItem('user');

        if (storedAccessToken && storedRefreshToken && storedUser) {
          setAccessToken(storedAccessToken);
          setRefreshToken(storedRefreshToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error loading stored auth data:', error);
        // Limpiar datos corruptos
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  const login = (newAccessToken: string, newRefreshToken: string, newUser: Usuario) => {
    try {
      setAccessToken(newAccessToken);
      setRefreshToken(newRefreshToken);
      setUser(newUser);

      // Guardar en localStorage
      localStorage.setItem('accessToken', newAccessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      localStorage.setItem('user', JSON.stringify(newUser));
    } catch (error) {
      console.error('Error saving auth data:', error);
    }
  };

  const logout = () => {
    try {
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);

      // Limpiar localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const updateTokens = (newAccessToken: string, newRefreshToken: string) => {
    try {
      setAccessToken(newAccessToken);
      setRefreshToken(newRefreshToken);

      // Actualizar localStorage
      localStorage.setItem('accessToken', newAccessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
    } catch (error) {
      console.error('Error updating tokens:', error);
    }
  };

  const isAuthenticated = !!accessToken && !!user;

  const value: AuthContextType = {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateTokens,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
