import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useVehiculos } from "../hooks/useVehiculos";
import { fetchVehiculoById } from "../services/vehiculosService";
import type { CreateVehiculoDto, UpdateVehiculoDto, EstadoVehiculo } from "@/api";

export const VehiculoFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  
  const { createNewVehiculo, updateExistingVehiculo } = useVehiculos();
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    patente: '',
    capacidadCarga: '',
    estado: 1 as EstadoVehiculo,
    ultimaInspeccion: '',
    rtoVencimiento: ''
  });

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
      setFormData({
        marca: vehiculo.marca || '',
        modelo: vehiculo.modelo || '',
        patente: vehiculo.patente || '',
        capacidadCarga: vehiculo.capacidadCarga?.toString() || '',
        estado: vehiculo.estado || 1,
        ultimaInspeccion: vehiculo.ultimaInspeccion 
          ? new Date(vehiculo.ultimaInspeccion).toISOString().split('T')[0] 
          : '',
        rtoVencimiento: vehiculo.rtoVencimiento 
          ? new Date(vehiculo.rtoVencimiento).toISOString().split('T')[0] 
          : ''
      });
    } catch (err) {
      setError("Error al cargar los datos del vehículo");
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Limpiar error al empezar a escribir
    if (error) setError(null);
  };

  const validateForm = () => {
    if (!formData.marca.trim()) {
      setError("La marca es requerida");
      return false;
    }
    if (!formData.modelo.trim()) {
      setError("El modelo es requerido");
      return false;
    }
    if (!formData.patente.trim()) {
      setError("La patente es requerida");
      return false;
    }
    if (!formData.capacidadCarga.trim() || isNaN(Number(formData.capacidadCarga))) {
      setError("La capacidad de carga debe ser un número válido");
      return false;
    }
    if (Number(formData.capacidadCarga) <= 0) {
      setError("La capacidad de carga debe ser mayor a 0");
      return false;
    }
    if (!formData.ultimaInspeccion) {
      setError("La fecha de última inspección es requerida");
      return false;
    }
    if (!formData.rtoVencimiento) {
      setError("La fecha de vencimiento del RTO es requerida");
      return false;
    }
    if (new Date(formData.rtoVencimiento) <= new Date()) {
      setError("La fecha de vencimiento del RTO debe ser futura");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      if (isEditing && id) {
        const updateData: UpdateVehiculoDto = {
          idVehiculo: parseInt(id),
          marca: formData.marca.trim(),
          modelo: formData.modelo.trim(),
          patente: formData.patente.trim(),
          capacidadCarga: Number(formData.capacidadCarga),
          estado: formData.estado,
          ultimaInspeccion: new Date(formData.ultimaInspeccion),
          rtoVencimiento: new Date(formData.rtoVencimiento)
        };
        
        const success = await updateExistingVehiculo(parseInt(id), updateData);
        if (success) {
          navigate("/vehiculos");
        }
      } else {
        const createData: CreateVehiculoDto = {
          marca: formData.marca.trim(),
          modelo: formData.modelo.trim(),
          patente: formData.patente.trim(),
          capacidadCarga: Number(formData.capacidadCarga),
          estado: formData.estado,
          ultimaInspeccion: new Date(formData.ultimaInspeccion),
          rtoVencimiento: new Date(formData.rtoVencimiento)
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
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Marca */}
              <div className="space-y-2">
                <label htmlFor="marca" className="text-sm font-semibold text-gray-700">
                  Marca *
                </label>
                <input
                  id="marca"
                  type="text"
                  value={formData.marca}
                  onChange={(e) => handleInputChange("marca", e.target.value)}
                  placeholder="Ej: Ford, Chevrolet, etc."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                  required
                />
              </div>

              {/* Modelo */}
              <div className="space-y-2">
                <label htmlFor="modelo" className="text-sm font-semibold text-gray-700">
                  Modelo *
                </label>
                <input
                  id="modelo"
                  type="text"
                  value={formData.modelo}
                  onChange={(e) => handleInputChange("modelo", e.target.value)}
                  placeholder="Ej: Transit, Master, etc."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                  required
                />
              </div>

              {/* Patente */}
              <div className="space-y-2">
                <label htmlFor="patente" className="text-sm font-semibold text-gray-700">
                  Patente *
                </label>
                <input
                  id="patente"
                  type="text"
                  value={formData.patente}
                  onChange={(e) => handleInputChange("patente", e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all font-mono text-center"
                  required
                  maxLength={8}
                />
              </div>

              {/* Capacidad de Carga */}
              <div className="space-y-2">
                <label htmlFor="capacidadCarga" className="text-sm font-semibold text-gray-700">
                  Capacidad de Carga (kg) *
                </label>
                <input
                  id="capacidadCarga"
                  type="number"
                  value={formData.capacidadCarga}
                  onChange={(e) => handleInputChange("capacidadCarga", e.target.value)}
                  placeholder="1000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                  required
                  min="1"
                />
              </div>

              {/* Estado */}
              <div className="space-y-2">
                <label htmlFor="estado" className="text-sm font-semibold text-gray-700">
                  Estado *
                </label>
                <select
                  id="estado"
                  value={formData.estado}
                  onChange={(e) => handleInputChange("estado", Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                  required
                >
                  <option value={1}>🟢 Disponible</option>
                  <option value={2}>🔵 En servicio</option>
                  <option value={3}>🟡 En mantenimiento</option>
                  <option value={4}>🔴 Fuera de servicio</option>
                </select>
              </div>

              {/* Última Inspección */}
              <div className="space-y-2">
                <label htmlFor="ultimaInspeccion" className="text-sm font-semibold text-gray-700">
                  Última Inspección *
                </label>
                <input
                  id="ultimaInspeccion"
                  type="date"
                  value={formData.ultimaInspeccion}
                  onChange={(e) => handleInputChange("ultimaInspeccion", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                  required
                />
              </div>

              {/* RTO Vencimiento */}
              <div className="space-y-2">
                <label htmlFor="rtoVencimiento" className="text-sm font-semibold text-gray-700">
                  Vencimiento RTO *
                </label>
                <input
                  id="rtoVencimiento"
                  type="date"
                  value={formData.rtoVencimiento}
                  onChange={(e) => handleInputChange("rtoVencimiento", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
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
