import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateConductor, useUpdateConductor, useConductor } from "../hooks/useConductores";
import { showCreateSuccessToast, showUpdateSuccessToast, showErrorToast } from "@/lib/toast-utils";
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
        
        // Toast de actualización exitosa
        showUpdateSuccessToast(data.nombre);
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
        
        // Toast de creación exitosa
        showCreateSuccessToast(data.nombre);
      }
      
      setTimeout(() => {
        navigate("/conductores");
      }, 1500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error inesperado';
      
      // Toast de error
      showErrorToast(
        errorMessage,
        isEditing ? 'Error al actualizar conductor' : 'Error al crear conductor'
      );
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
      <div className="container min-h-screen">
        <Card className="max-w-4xl mx-auto shadow-xl border-0">
          <CardContent className="p-8">
            <div className="text-center text-black">Cargando conductor...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container min-h-screen">
      <Card className="max-w-4xl mx-auto shadow-xl border-0">
        <CardHeader className="text-black rounded-t-lg py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/conductores")}
                className="text-black hover:bg-blue-100 border-black/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold">
                    {isEditing ? "Editar Conductor" : "Nuevo Conductor"}
                  </CardTitle>
                  <p className="text-gray-500 text-sm">
                    {isEditing ? "Modifica los datos del conductor" : "Complete la información del nuevo conductor"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Información Personal */}
            <div className="rounded-xl p-6 border border-gray-300 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Información Personal
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo *
                  </label>
                  <Input
                    {...register("nombre")}
                    type="text"
                    className="w-full p-3 pl-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm transition-all duration-200 hover:border-gray-400"
                    placeholder="Ingrese el nombre completo del conductor"
                  />
                  {errors.nombre && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.nombre.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    DNI *
                  </label>
                  <Input
                    {...register("dni")}
                    type="text"
                    maxLength={8}
                    className="w-full p-3 pl-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm transition-all duration-200 hover:border-gray-400"
                    placeholder="12345678"
                    onInput={(e) => {
                      const target = e.target as HTMLInputElement;
                      target.value = target.value.replace(/\D/g, '');
                    }}
                  />
                  {errors.dni && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.dni.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Información de Contacto */}
            <div className="rounded-xl p-6 border border-gray-300 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Información de Contacto
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico
                  </label>
                  <Input
                    {...register("email")}
                    type="email"
                    className="w-full p-3 pl-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm transition-all duration-200 hover:border-gray-400"
                    placeholder="conductor@ejemplo.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Teléfono
                  </label>
                  <Input
                    {...register("telefono")}
                    type="tel"
                    className="w-full p-3 pl-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm transition-all duration-200 hover:border-gray-400"
                    placeholder="+54 11 1234-5678"
                  />
                  {errors.telefono && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.telefono.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Información de Licencia */}
            <div className="rounded-xl p-6 border border-gray-300 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                Información de Licencia
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Clase de Licencia *
                  </label>
                  <Select 
                    value={watchedClaseLicencia} 
                    onValueChange={(value) => setValue('claseLicencia', value, { shouldValidate: true })}
                  >
                    <SelectTrigger className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm transition-all duration-200 hover:border-gray-400">
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
                  <input type="hidden" {...register("claseLicencia")} />
                  {errors.claseLicencia && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.claseLicencia.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vencimiento de Licencia *
                  </label>
                  
                  {/* Sugerencias de fechas comunes */}
                  {!watchedVencimiento && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-2">Fechas comunes:</p>
                      <div className="flex flex-wrap gap-2">
                        {[1, 2, 3, 5].map(years => (
                          <button
                            key={years}
                            type="button"
                            onClick={() => setQuickDate(years)}
                            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors border border-blue-200"
                          >
                            +{years} año{years > 1 ? 's' : ''}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <Input
                    {...register("vencimientoLicencia")}
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full p-3 pl-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm transition-all duration-200 hover:border-gray-400 ${
                      watchedVencimiento ? getLicenseStatusBadge(watchedVencimiento) : ''
                    }`}
                  />
                  
                  {/* Indicador visual de fecha seleccionada */}
                  {watchedVencimiento && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-sm text-blue-800">
                        <strong>Fecha seleccionada:</strong> {new Date(watchedVencimiento).toLocaleDateString('es-AR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
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
                    </div>
                  )}

                  {errors.vencimientoLicencia && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.vencimientoLicencia.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/conductores")}
                  disabled={isSubmitting}
                  className="px-8 py-3 text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={!isValid || isSubmitting}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span className="font-medium">
                        {isEditing ? 'Actualizando...' : 'Creando...'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="w-5 h-5" />
                      <span className="font-medium">
                        {isEditing ? "Actualizar Conductor" : "Crear Conductor"}
                      </span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
