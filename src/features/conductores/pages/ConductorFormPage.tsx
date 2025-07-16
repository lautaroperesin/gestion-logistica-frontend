import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateConductor, useUpdateConductor, useConductor } from "../hooks/useConductores";
import type { CreateConductorDto, UpdateConductorDto } from "@/api";

// Esquema de validación con Zod
const conductorSchema = z.object({
  nombre: z.string()
    .min(1, "El nombre es requerido")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede tener más de 100 caracteres")
    .trim(),
  dni: z.string()
    .min(1, "El DNI es requerido")
    .regex(/^\d{7,8}$/, "El DNI debe tener entre 7 y 8 dígitos")
    .trim(),
  email: z.string()
    .optional()
    .refine((email) => !email || z.string().email().safeParse(email).success, {
      message: "El email no es válido"
    }),
  telefono: z.string().optional(),
  claseLicencia: z.string()
    .min(1, "La clase de licencia es requerida"),
  vencimientoLicencia: z.string()
    .min(1, "La fecha de vencimiento es requerida")
    .refine((date) => new Date(date) > new Date(), {
      message: "La fecha de vencimiento debe ser futura"
    })
});

type ConductorFormData = z.infer<typeof conductorSchema>;

export const ConductorFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  
  const { data: conductor, isLoading: loadingData } = useConductor(id ? parseInt(id) : 0);
  const createConductorMutation = useCreateConductor();
  const updateConductorMutation = useUpdateConductor();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    reset,
    setValue,
    watch
  } = useForm<ConductorFormData>({
    resolver: zodResolver(conductorSchema),
    mode: 'onBlur',
    defaultValues: {
      nombre: '',
      dni: '',
      email: undefined,
      telefono: undefined,
      claseLicencia: '',
      vencimientoLicencia: ''
    }
  });

  const watchedVencimiento = watch('vencimientoLicencia');
  const watchedClaseLicencia = watch('claseLicencia');

  // Cargar datos del conductor si estamos editando
  useEffect(() => {
    if (isEditing && conductor) {
      reset({
        nombre: conductor.nombre || '',
        dni: conductor.dni || '',
        email: conductor.email || undefined,
        telefono: conductor.telefono || undefined,
        claseLicencia: conductor.claseLicencia || '',
        vencimientoLicencia: conductor.vencimientoLicencia 
          ? new Date(conductor.vencimientoLicencia).toISOString().split('T')[0] 
          : ''
      });
    }
  }, [conductor, isEditing, reset]);

  const onSubmit = async (data: ConductorFormData) => {
    try {
      if (isEditing && id) {
        const updateData: UpdateConductorDto = {
          idConductor: parseInt(id),
          nombre: data.nombre.trim(),
          dni: data.dni.trim(),
          email: data.email?.trim() || "",
          telefono: data.telefono?.trim() || "",
          claseLicencia: data.claseLicencia,
          vencimientoLicencia: new Date(data.vencimientoLicencia)
        };
        
        await updateConductorMutation.mutateAsync({
          id: parseInt(id), 
          data: updateData
        });
      } else {
        const createData: CreateConductorDto = {
          nombre: data.nombre.trim(),
          dni: data.dni.trim(),
          email: data.email?.trim() || "",
          telefono: data.telefono?.trim() || "",
          claseLicencia: data.claseLicencia,
          vencimientoLicencia: new Date(data.vencimientoLicencia)
        };
        
        await createConductorMutation.mutateAsync(createData);
      }
      navigate("/conductores");
    } catch (error) {
      console.error('Error al guardar conductor:', error);
    }
  };

  const isLicenseExpiringSoon = (vencimiento: string) => {
    if (!vencimiento) return false;
    const today = new Date();
    const expiryDate = new Date(vencimiento);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const getLicenseStatusBadge = (vencimiento: string) => {
    if (!vencimiento) return '';
    const today = new Date();
    const expiryDate = new Date(vencimiento);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (daysUntilExpiry < 0) {
      return 'border-red-300 bg-red-50';
    } else if (daysUntilExpiry <= 30) {
      return 'border-yellow-300 bg-yellow-50';
    } else {
      return 'border-green-300 bg-green-50';
    }
  };

  const setQuickDate = (years: number) => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + years);
    const dateString = futureDate.toISOString().split('T')[0];
    setValue('vencimientoLicencia', dateString, { shouldValidate: true });
  };

  if (loadingData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/conductores")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/conductores")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Conductores
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <User className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? "Editar Conductor" : "Nuevo Conductor"}
          </h1>
          <p className="text-gray-600">
            {isEditing ? "Modifica los datos del conductor" : "Completa la información del nuevo conductor"}
          </p>
        </div>
      </div>

      {/* Error Alert de mutaciones */}
      {(createConductorMutation.error || updateConductorMutation.error) && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {createConductorMutation.error?.message || updateConductorMutation.error?.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {(createConductorMutation.isSuccess || updateConductorMutation.isSuccess) && (
        <Alert className="border-green-200 bg-green-50">
          <AlertTitle className="text-green-800">¡Éxito!</AlertTitle>
          <AlertDescription className="text-green-700">
            Conductor {isEditing ? 'actualizado' : 'creado'} correctamente.
          </AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información del Conductor
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="nombre">
                  Nombre <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nombre"
                  {...register("nombre")}
                  placeholder="Ingrese el nombre del conductor"
                  className="bg-white/50 border-white/30"
                />
                {errors.nombre && (
                  <p className="text-red-500 text-sm">{errors.nombre.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="conductor@ejemplo.com"
                  className="bg-white/50 border-white/30"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>

              {/* DNI */}
              <div className="space-y-2">
                <Label htmlFor="dni">
                  DNI <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="dni"
                  {...register("dni")}
                  placeholder="12345678"
                  maxLength={8}
                  className="bg-white/50 border-white/30"
                  onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.value = target.value.replace(/\D/g, '');
                  }}
                />
                {errors.dni && (
                  <p className="text-red-500 text-sm">{errors.dni.message}</p>
                )}
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  type="tel"
                  {...register("telefono")}
                  placeholder="+54 11 1234-5678"
                  className="bg-white/50 border-white/30"
                />
                {errors.telefono && (
                  <p className="text-red-500 text-sm">{errors.telefono.message}</p>
                )}
              </div>

              {/* Clase Licencia */}
              <div className="space-y-2">
                <Label htmlFor="claseLicencia">
                  Clase de Licencia <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={watchedClaseLicencia} 
                  onValueChange={(value) => setValue('claseLicencia', value, { shouldValidate: true })}
                >
                  <SelectTrigger className="bg-white/50 border-white/30">
                    <SelectValue placeholder="Seleccionar clase de licencia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Clase A - Motocicletas</SelectItem>
                    <SelectItem value="B">Clase B - Automóviles</SelectItem>
                    <SelectItem value="C">Clase C - Camiones pequeños</SelectItem>
                    <SelectItem value="D">Clase D - Transporte de pasajeros</SelectItem>
                    <SelectItem value="E">Clase E - Camiones grandes</SelectItem>
                  </SelectContent>
                </Select>
                <input
                  type="hidden"
                  {...register("claseLicencia")}
                />
                {errors.claseLicencia && (
                  <p className="text-red-500 text-sm">{errors.claseLicencia.message}</p>
                )}
              </div>

              {/* Vencimiento Licencia */}
              <div className="space-y-2">
                <Label htmlFor="vencimientoLicencia">
                  Vencimiento de Licencia <span className="text-red-500">*</span>
                </Label>
                
                {/* Sugerencias de fechas comunes */}
                {!watchedVencimiento && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-500 mb-2">Fechas comunes:</p>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 5].map(years => (
                        <button
                          key={years}
                          type="button"
                          onClick={() => setQuickDate(years)}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        >
                          +{years} año{years > 1 ? 's' : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="relative">
                  <Input
                    id="vencimientoLicencia"
                    type="date"
                    {...register("vencimientoLicencia")}
                    min={new Date().toISOString().split('T')[0]}
                    className={`bg-white/50 border-white/30 ${
                      watchedVencimiento ? getLicenseStatusBadge(watchedVencimiento) : ''
                    }`}
                  />
                </div>
                
                {/* Indicador visual de fecha seleccionada */}
                {watchedVencimiento && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm text-blue-800">
                      <strong>Fecha seleccionada:</strong> {new Date(watchedVencimiento).toLocaleDateString('es-AR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                )}

                {watchedVencimiento && (
                  <div className="mt-2">
                    {new Date(watchedVencimiento) < new Date() ? (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                        La licencia está vencida
                      </div>
                    ) : isLicenseExpiringSoon(watchedVencimiento) ? (
                      <div className="flex items-center gap-2 text-yellow-600 text-sm">
                        <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>
                        La licencia vence en {Math.ceil((new Date(watchedVencimiento).getTime() - new Date().getTime()) / (1000 * 3600 * 24))} días
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-green-600 text-sm">
                        <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                        Licencia vigente hasta {new Date(watchedVencimiento).toLocaleDateString('es-AR')}
                      </div>
                    )}
                  </div>
                )}

                {errors.vencimientoLicencia && (
                  <p className="text-red-500 text-sm">{errors.vencimientoLicencia.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/conductores")}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={!isValid || isSubmitting}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditing ? "Actualizar" : "Crear"} Conductor
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
