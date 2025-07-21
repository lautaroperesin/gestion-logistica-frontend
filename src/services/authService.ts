import { AuthApi } from '@/api/apis/AuthApi';
import { apiConfig } from '@/api/config';
import type { UsuarioDto, CreateUsuarioDto, TokenResponseDto, Usuario, RefreshTokenRequestDto } from '@/api';

const api = new AuthApi(apiConfig);

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  nombre: string;
  email: string;
  password: string;
  rol?: string;
}

export interface LoginResponse {
  tokens: TokenResponseDto;
  user: Usuario;
}

export const authService = {
  // Iniciar sesión
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const usuarioDto: UsuarioDto = {
        email: credentials.email,
        password: credentials.password,
      };

      const tokens = await api.apiAuthLoginPost({ usuarioDto });
      
      // El endpoint de login debería devolver información del usuario
      // Por ahora, creamos un usuario básico con los datos mínimos requeridos
      const user: Usuario = {
        email: credentials.email,
        nombre: '', // Se actualizará cuando tengamos endpoint de perfil
        passwordHash: '', // No se debe exponer en frontend
        rolUsuario: 'Usuario', // Valor por defecto
        fechaAlta: new Date(),
        activo: true,
      };

      return { tokens, user };
    } catch (error) {
      console.error('Error during login:', error);
      throw new Error('Error al iniciar sesión. Verifica tus credenciales.');
    }
  },

  // Registrar usuario
  register: async (userData: RegisterData): Promise<Usuario> => {
    try {
      const createUsuarioDto: CreateUsuarioDto = {
        nombre: userData.nombre,
        email: userData.email,
        password: userData.password,
        rol: userData.rol || 'Usuario',
      };

      const user = await api.apiAuthRegisterPost({ createUsuarioDto });
      return user;
    } catch (error) {
      console.error('Error during registration:', error);
      throw new Error('Error al registrar usuario. Verifica los datos.');
    }
  },

  // Renovar token
  refreshToken: async (refreshToken: string): Promise<TokenResponseDto> => {
    try {
      const refreshTokenRequestDto: RefreshTokenRequestDto = {
        refreshToken,
      };

      return await api.apiAuthRefreshTokenPost({ refreshTokenRequestDto });
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw new Error('Error al renovar token. Inicia sesión nuevamente.');
    }
  },

  // Validar token (función helper)
  isTokenValid: (token: string | null): boolean => {
    if (!token) return false;
    
    try {
      // Decodificar JWT para verificar expiración
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  },
};

// Funciones de conveniencia
export const login = (credentials: LoginCredentials) => authService.login(credentials);
export const register = (userData: RegisterData) => authService.register(userData);
export const refreshToken = (refreshToken: string) => authService.refreshToken(refreshToken);
