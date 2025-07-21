import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useRegister } from '@/hooks/useAuth';

const registerSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(4, 'La contraseña debe tener al menos 4 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerMutation.mutateAsync({
        nombre: data.nombre,
        email: data.email,
        password: data.password,
        rol: 'Usuario', // Rol por defecto
      });
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Sistema de Logística
          </h1>
          <p className="text-gray-600 mt-2">
            Crea tu cuenta
          </p>
        </div>

        {/* Register Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Registro
            </CardTitle>
            <CardDescription>
              Completa los datos para crear tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre Completo</Label>
                <Input
                  id="nombre"
                  type="text"
                  placeholder="Tu nombre completo"
                  {...register('nombre')}
                  disabled={isSubmitting}
                />
                {errors.nombre && (
                  <p className="text-sm text-red-600">{errors.nombre.message}</p>
                )}
              </div>

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

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('confirmPassword')}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Error message */}
              {registerMutation.isError && (
                <Alert className="bg-red-50 border-red-200 text-red-800">
                  <div className="font-medium">
                    {registerMutation.error?.message || 'Error al registrar usuario'}
                  </div>
                </Alert>
              )}

              {/* Submit button */}
              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isSubmitting || registerMutation.isPending}
              >
                {(isSubmitting || registerMutation.isPending) ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creando cuenta...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Crear Cuenta
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Login link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            ¿Ya tienes una cuenta?{' '}
            <Link 
              to="/login" 
              className="font-medium text-green-600 hover:text-green-500"
            >
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
