import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { useVehiculo, useCreateVehiculo, useUpdateVehiculo } from "../hooks/useVehiculos";
import { showCreateSuccessToast, showUpdateSuccessToast, showErrorToast } from "@/lib/toast-utils";
import type { CreateVehiculoDto, UpdateVehiculoDto, EstadoVehiculo } from "@/api";

// Esquema de validación con Zod
const vehiculoSchema = z.object({
  marca: z.string().min(1, "La marca es requerida").trim(),
  modelo: z.string().min(1, "El modelo es requerido").trim(),
  patente: z.string().min(1, "La patente es requerida").max(8, "La patente no puede exceder 8 caracteres").trim(),
  capacidadCarga: z.number().positive("La capacidad de carga debe ser mayor a 0"),
  estado: z.number().min(1).max(4),
  ultimaInspeccion: z.date({
    message: "La fecha de última inspección es requerida"
  }),
  rtoVencimiento: z.date({
    message: "La fecha de vencimiento del RTO es requerida"
  })
}).refine((data) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const rtoDate = new Date(data.rtoVencimiento);
  rtoDate.setHours(0, 0, 0, 0);
  return rtoDate > today;
}, {
  message: "La fecha de vencimiento del RTO debe ser futura",
  path: ["rtoVencimiento"]
});

type VehiculoFormData = z.infer<typeof vehiculoSchema>;

export const VehiculoFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  
  const { data: vehiculo, isLoading: loadingData } = useVehiculo(id ? parseInt(id) : 0);
  const createVehiculoMutation = useCreateVehiculo();
  const updateVehiculoMutation = useUpdateVehiculo();

  const form = useForm<VehiculoFormData>({
    resolver: zodResolver(vehiculoSchema),
    defaultValues: {
      marca: '',
      modelo: '',
      patente: '',
      capacidadCarga: 0,
      estado: 1 as EstadoVehiculo,
      ultimaInspeccion: new Date(),
      rtoVencimiento: new Date()
    }
  });

  const { register, handleSubmit, formState: { errors }, reset, control } = form;
  
  const loading = createVehiculoMutation.isPending || updateVehiculoMutation.isPending;

  // Pre-llenar el formulario cuando se está editando
  useEffect(() => {
    if (isEditing && vehiculo) {
      reset({
        marca: vehiculo.marca || '',
        modelo: vehiculo.modelo || '',
        patente: vehiculo.patente || '',
        capacidadCarga: vehiculo.capacidadCarga || 0,
        estado: vehiculo.estado || 1,
        ultimaInspeccion: vehiculo.ultimaInspeccion 
          ? new Date(vehiculo.ultimaInspeccion)
          : new Date(),
        rtoVencimiento: vehiculo.rtoVencimiento 
          ? new Date(vehiculo.rtoVencimiento)
          : new Date()
      });
    }
  }, [vehiculo, isEditing, reset]);

  const onSubmit = async (data: VehiculoFormData) => {
    try {
      if (isEditing && id) {
        const updateData: UpdateVehiculoDto = {
          idVehiculo: parseInt(id),
          marca: data.marca,
          modelo: data.modelo,
          patente: data.patente.toUpperCase(),
          capacidadCarga: data.capacidadCarga,
          estado: data.estado as EstadoVehiculo,
          ultimaInspeccion: new Date(data.ultimaInspeccion),
          rtoVencimiento: new Date(data.rtoVencimiento)
        };
        
        await updateVehiculoMutation.mutateAsync({
          id: parseInt(id),
          data: updateData
        });
        
        // Toast de actualización exitosa
        showUpdateSuccessToast(`${data.marca} ${data.modelo} - ${data.patente}`);
        
        setTimeout(() => {
          navigate("/vehiculos");
        }, 1500);
      } else {
        const createData: CreateVehiculoDto = {
          marca: data.marca,
          modelo: data.modelo,
          patente: data.patente.toUpperCase(),
          capacidadCarga: data.capacidadCarga,
          estado: data.estado as EstadoVehiculo,
          ultimaInspeccion: new Date(data.ultimaInspeccion),
          rtoVencimiento: new Date(data.rtoVencimiento)
        };
        
        await createVehiculoMutation.mutateAsync(createData);
        
        // Toast de creación exitosa
        showCreateSuccessToast(`${data.marca} ${data.modelo} - ${data.patente}`);
        
        setTimeout(() => {
          navigate("/vehiculos");
        }, 1500);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado';
      
      // Toast de error
      showErrorToast(
        errorMessage,
        isEditing ? 'Error al actualizar vehículo' : 'Error al crear vehículo'
      );
    }
  };

  if (loadingData) {
    return (
      <div className="container min-h-screen">
        <Card className="max-w-6xl mx-auto shadow-xl border-0">
          <CardContent className="p-8">
            <div className="text-center text-black">Cargando vehículo...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container min-h-screen">
      <Card className="max-w-6xl mx-auto shadow-xl border-0">
        <CardHeader className="text-black rounded-t-lg py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/vehiculos")}
                className="text-black hover:bg-orange-100 border-black/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg">
                  <Truck className="w-8 h-8" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold">
                    {isEditing ? "Editar Vehículo" : "Nuevo Vehículo"}
                  </CardTitle>
                  <p className="text-gray-500 text-sm">
                    {isEditing ? "Modifica los datos del vehículo" : "Complete la información del nuevo vehículo"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Información Básica del Vehículo */}
            <div className="rounded-xl p-6 border border-gray-300 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Información Básica
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marca *
                  </label>
                  <Input
                    {...register("marca")}
                    type="text"
                    className="w-full p-3 pl-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm transition-all duration-200 hover:border-gray-400"
                    placeholder="Ej: Ford, Chevrolet, etc."
                  />
                  {errors.marca && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.marca.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modelo *
                  </label>
                  <Input
                    {...register("modelo")}
                    type="text"
                    className="w-full p-3 pl-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm transition-all duration-200 hover:border-gray-400"
                    placeholder="Ej: Transit, Master, etc."
                  />
                  {errors.modelo && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.modelo.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patente *
                  </label>
                  <Input
                    {...register("patente", {
                      onChange: (e) => {
                        e.target.value = e.target.value.toUpperCase();
                      }
                    })}
                    type="text"
                    className="w-full p-3 pl-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm transition-all duration-200 hover:border-gray-400 font-mono text-center"
                    placeholder="ABC123"
                    maxLength={8}
                  />
                  {errors.patente && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.patente.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Capacidad y Estado */}
            <div className="rounded-xl p-6 border border-gray-300 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Capacidad y Estado
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacidad de Carga (kg) *
                  </label>
                  <div className="relative">
                    <Input
                      {...register("capacidadCarga", { valueAsNumber: true })}
                      type="number"
                      className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm transition-all duration-200 hover:border-gray-400"
                      placeholder="1000"
                      min="1"
                    />
                    <span className="absolute right-3 top-3 text-gray-500 text-sm">kg</span>
                  </div>
                  {errors.capacidadCarga && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.capacidadCarga.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado *
                  </label>
                  <select
                    {...register("estado", { valueAsNumber: true })}
                    className="w-full p-3 pl-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm transition-all duration-200 hover:border-gray-400"
                  >
                    <option value={1}>🟢 Disponible</option>
                    <option value={2}>🔵 En servicio</option>
                    <option value={3}>🟡 En mantenimiento</option>
                    <option value={4}>🔴 Fuera de servicio</option>
                  </select>
                  {errors.estado && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.estado.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Documentación y Mantenimiento */}
            <div className="rounded-xl p-6 border border-gray-300 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Documentación y Mantenimiento
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Última Inspección *
                  </label>
                  <Controller
                    name="ultimaInspeccion"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        date={field.value}
                        onDateChange={field.onChange}
                        placeholder="Selecciona una fecha"
                        className="w-full"
                      />
                    )}
                  />
                  {errors.ultimaInspeccion && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.ultimaInspeccion.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vencimiento RTO *
                  </label>
                  <Controller
                    name="rtoVencimiento"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        date={field.value}
                        onDateChange={field.onChange}
                        placeholder="Selecciona una fecha"
                        className="w-full"
                      />
                    )}
                  />
                  {errors.rtoVencimiento && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.rtoVencimiento.message}
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
                  onClick={() => navigate("/vehiculos")}
                  disabled={loading}
                  className="px-8 py-3 text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform"
                >
                  {loading ? (
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
                        {isEditing ? "Actualizar Vehículo" : "Crear Vehículo"}
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
