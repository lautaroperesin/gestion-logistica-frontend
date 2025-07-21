import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, LogIn, Eye, EyeOff } from 'lucide-react';
import { useLogin } from '@/hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(4, 'La contraseña debe tener al menos 4 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const location = useLocation();
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await loginMutation.mutateAsync(data);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  // Mensaje de registro exitoso
  const registrationMessage = location.state?.message;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Sistema de Logística
          </h1>
          <p className="text-gray-600 mt-2">
            Inicia sesión en tu cuenta
          </p>
        </div>

        {/* Mensaje de registro exitoso */}
        {registrationMessage && (
          <Alert className="bg-green-50 border-green-200 text-green-800">
            <div className="font-medium">{registrationMessage}</div>
          </Alert>
        )}

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogIn className="h-5 w-5" />
              Iniciar Sesión
            </CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  {...register('email')}
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password')}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              {/* Error message */}
              {loginMutation.isError && (
                <Alert className="bg-red-50 border-red-200 text-red-800">
                  <div className="font-medium">
                    {loginMutation.error?.message || 'Error al iniciar sesión'}
                  </div>
                </Alert>
              )}

              {/* Submit button */}
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting || loginMutation.isPending}
              >
                {(isSubmitting || loginMutation.isPending) ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Iniciar Sesión
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Register link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            ¿No tienes una cuenta?{' '}
            <Link 
              to="/register" 
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
