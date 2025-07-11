import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useVehiculos } from "../hooks/useVehiculos";
import { fetchVehiculoById } from "../services/vehiculosService";
import type { CreateVehiculoDto, UpdateVehiculoDto, EstadoVehiculo } from "@/api";

// Esquema de validación con Zod
const vehiculoSchema = z.object({
  marca: z.string().min(1, "La marca es requerida").trim(),
  modelo: z.string().min(1, "El modelo es requerido").trim(),
  patente: z.string().min(1, "La patente es requerida").max(8, "La patente no puede exceder 8 caracteres").trim(),
  capacidadCarga: z.number().positive("La capacidad de carga debe ser mayor a 0"),
  estado: z.number().min(1).max(4),
  ultimaInspeccion: z.string().min(1, "La fecha de última inspección es requerida"),
  rtoVencimiento: z.string().min(1, "La fecha de vencimiento del RTO es requerida")
}).refine((data) => {
  const rtoDate = new Date(data.rtoVencimiento);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
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
  
  const { createNewVehiculo, updateExistingVehiculo } = useVehiculos();
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<VehiculoFormData>({
    resolver: zodResolver(vehiculoSchema),
    defaultValues: {
      marca: '',
      modelo: '',
      patente: '',
      capacidadCarga: 0,
      estado: 1 as EstadoVehiculo,
      ultimaInspeccion: '',
      rtoVencimiento: ''
    }
  });

  const { register, handleSubmit, formState: { errors }, setValue } = form;

  // Cargar datos del vehiculo si estamos editando
  useEffect(() => {
    if (isEditing && id) {
      loadVehiculoData(parseInt(id));
    }
  }, [id, isEditing]);

  const loadVehiculoData = async (vehiculoId: number) => {
    try {
      setLoadingData(true);
      const vehiculo = await fetchVehiculoById(vehiculoId);
      
      // Cargar datos en el formulario usando setValue
      setValue('marca', vehiculo.marca || '');
      setValue('modelo', vehiculo.modelo || '');
      setValue('patente', vehiculo.patente || '');
      setValue('capacidadCarga', vehiculo.capacidadCarga || 0);
      setValue('estado', vehiculo.estado || 1);
      setValue('ultimaInspeccion', vehiculo.ultimaInspeccion 
        ? new Date(vehiculo.ultimaInspeccion).toISOString().split('T')[0] 
        : '');
      setValue('rtoVencimiento', vehiculo.rtoVencimiento 
        ? new Date(vehiculo.rtoVencimiento).toISOString().split('T')[0] 
        : '');
    } catch (err) {
      setError("Error al cargar los datos del vehículo");
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data: VehiculoFormData) => {
    setLoading(true);
    setError(null);

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
        
        const success = await updateExistingVehiculo(parseInt(id), updateData);
        if (success) {
          navigate("/vehiculos");
        }
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
        
        const success = await createNewVehiculo(createData);
        if (success) {
          navigate("/vehiculos");
        }
      }
    } catch (err) {
      setError(isEditing ? "Error al actualizar el vehículo" : "Error al crear el vehículo");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/vehiculos")}>
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
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/vehiculos")} className="shadow-sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Vehículos
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-blue-100 to-green-100 rounded-xl">
          <Truck className="h-7 w-7 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? "Editar Vehículo" : "Nuevo Vehículo"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing ? "Modifica los datos del vehículo" : "Completa la información del nuevo vehículo"}
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="shadow-md">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50">
          <CardTitle className="text-xl font-bold text-gray-900">Información del Vehículo</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Marca */}
              <div className="space-y-2">
                <label htmlFor="marca" className="text-sm font-semibold text-gray-700">
                  Marca *
                </label>
                <input
                  id="marca"
                  type="text"
                  {...register("marca")}
                  placeholder="Ej: Ford, Chevrolet, etc."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                />
                {errors.marca && (
                  <p className="text-sm text-red-600">{errors.marca.message}</p>
                )}
              </div>

              {/* Modelo */}
              <div className="space-y-2">
                <label htmlFor="modelo" className="text-sm font-semibold text-gray-700">
                  Modelo *
                </label>
                <input
                  id="modelo"
                  type="text"
                  {...register("modelo")}
                  placeholder="Ej: Transit, Master, etc."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                />
                {errors.modelo && (
                  <p className="text-sm text-red-600">{errors.modelo.message}</p>
                )}
              </div>

              {/* Patente */}
              <div className="space-y-2">
                <label htmlFor="patente" className="text-sm font-semibold text-gray-700">
                  Patente *
                </label>
                <input
                  id="patente"
                  type="text"
                  {...register("patente", {
                    onChange: (e) => {
                      e.target.value = e.target.value.toUpperCase();
                    }
                  })}
                  placeholder="ABC123"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all font-mono text-center"
                  maxLength={8}
                />
                {errors.patente && (
                  <p className="text-sm text-red-600">{errors.patente.message}</p>
                )}
              </div>

              {/* Capacidad de Carga */}
              <div className="space-y-2">
                <label htmlFor="capacidadCarga" className="text-sm font-semibold text-gray-700">
                  Capacidad de Carga (kg) *
                </label>
                <input
                  id="capacidadCarga"
                  type="number"
                  {...register("capacidadCarga", { valueAsNumber: true })}
                  placeholder="1000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                  min="1"
                />
                {errors.capacidadCarga && (
                  <p className="text-sm text-red-600">{errors.capacidadCarga.message}</p>
                )}
              </div>

              {/* Estado */}
              <div className="space-y-2">
                <label htmlFor="estado" className="text-sm font-semibold text-gray-700">
                  Estado *
                </label>
                <select
                  id="estado"
                  {...register("estado", { valueAsNumber: true })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                >
                  <option value={1}>🟢 Disponible</option>
                  <option value={2}>🔵 En servicio</option>
                  <option value={3}>🟡 En mantenimiento</option>
                  <option value={4}>🔴 Fuera de servicio</option>
                </select>
                {errors.estado && (
                  <p className="text-sm text-red-600">{errors.estado.message}</p>
                )}
              </div>

              {/* Última Inspección */}
              <div className="space-y-2">
                <label htmlFor="ultimaInspeccion" className="text-sm font-semibold text-gray-700">
                  Última Inspección *
                </label>
                <input
                  id="ultimaInspeccion"
                  type="date"
                  {...register("ultimaInspeccion")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                />
                {errors.ultimaInspeccion && (
                  <p className="text-sm text-red-600">{errors.ultimaInspeccion.message}</p>
                )}
              </div>

              {/* RTO Vencimiento */}
              <div className="space-y-2">
                <label htmlFor="rtoVencimiento" className="text-sm font-semibold text-gray-700">
                  Vencimiento RTO *
                </label>
                <input
                  id="rtoVencimiento"
                  type="date"
                  {...register("rtoVencimiento")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.rtoVencimiento && (
                  <p className="text-sm text-red-600">{errors.rtoVencimiento.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-8 border-t border-gray-200">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/vehiculos")}
                disabled={loading}
                className="px-6 py-3 shadow-sm"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="px-6 py-3 shadow-md bg-green-500"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {isEditing ? "Actualizando..." : "Creando..."}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {isEditing ? "Actualizar Vehículo" : "Crear Vehículo"}
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
