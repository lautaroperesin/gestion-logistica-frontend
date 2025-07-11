import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useConductores } from "../hooks/useConductores";
import { fetchConductorById } from "../services/conductoresService";
import type { CreateConductorDto, UpdateConductorDto } from "@/api";

export const ConductorFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  
  const { createNewConductor, updateExistingConductor } = useConductores();
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    dni: '',
    nombre: '',
    claseLicencia: 'B',
    vencimientoLicencia: '',
    telefono: '',
    email: ''
  });

  // Cargar datos del conductor si estamos editando
  useEffect(() => {
    if (isEditing && id) {
      loadConductorData(parseInt(id));
    }
  }, [id, isEditing]);

  const loadConductorData = async (conductorId: number) => {
    try {
      setLoadingData(true);
      const conductor = await fetchConductorById(conductorId);
      setFormData({
        dni: conductor.dni || '',
        nombre: conductor.nombre || '',
        claseLicencia: conductor.claseLicencia || 'B',
        vencimientoLicencia: conductor.vencimientoLicencia 
          ? new Date(conductor.vencimientoLicencia).toISOString().split('T')[0] 
          : '',
        telefono: conductor.telefono || '',
        email: conductor.email || ''
      });
    } catch (err) {
      setError("Error al cargar los datos del conductor");
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Limpiar error al empezar a escribir
    if (error) setError(null);
  };

  const validateForm = () => {
    if (!formData.nombre.trim()) {
      setError("El nombre es requerido");
      return false;
    }
    if (!formData.dni.trim()) {
      setError("El DNI es requerido");
      return false;
    }
    if (formData.dni.trim().length < 7 || formData.dni.trim().length > 8) {
      setError("El DNI debe tener entre 7 y 8 dígitos");
      return false;
    }
    if (!/^\d+$/.test(formData.dni.trim())) {
      setError("El DNI debe contener solo números");
      return false;
    }
    if (formData.email.trim() && !isValidEmail(formData.email.trim())) {
      setError("El email no es válido");
      return false;
    }
    if (!formData.claseLicencia.trim()) {
      setError("La clase de licencia es requerida");
      return false;
    }
    if (!formData.vencimientoLicencia) {
      setError("La fecha de vencimiento de la licencia es requerida");
      return false;
    }
    if (new Date(formData.vencimientoLicencia) <= new Date()) {
      setError("La fecha de vencimiento debe ser futura");
      return false;
    }
    return true;
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      if (isEditing && id) {
        const updateData: UpdateConductorDto = {
          idConductor: parseInt(id),
          nombre: formData.nombre.trim(),
          dni: formData.dni.trim(),
          email: formData.email.trim() || "",
          telefono: formData.telefono.trim() || "",
          claseLicencia: formData.claseLicencia.trim(),
          vencimientoLicencia: new Date(formData.vencimientoLicencia)
        };
        
        const success = await updateExistingConductor(parseInt(id), updateData);
        if (success) {
          navigate("/conductores");
        }
      } else {
        const createData: CreateConductorDto = {
          nombre: formData.nombre.trim(),
          dni: formData.dni.trim(),
          email: formData.email.trim() || "",
          telefono: formData.telefono.trim() || "",
          claseLicencia: formData.claseLicencia.trim(),
          vencimientoLicencia: new Date(formData.vencimientoLicencia)
        };
        
        const success = await createNewConductor(createData);
        if (success) {
          navigate("/conductores");
        }
      }
    } catch (err) {
      setError(isEditing ? "Error al actualizar el conductor" : "Error al crear el conductor");
    } finally {
      setLoading(false);
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

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Conductor</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Nombre */}
              <div className="space-y-2">
                <label htmlFor="nombre" className="text-sm font-medium text-gray-700">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  id="nombre"
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange("nombre", e.target.value)}
                  placeholder="Ingrese el nombre del conductor"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="conductor@ejemplo.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* DNI */}
              <div className="space-y-2">
                <label htmlFor="dni" className="text-sm font-medium text-gray-700">
                  DNI <span className="text-red-500">*</span>
                </label>
                <input
                  id="dni"
                  type="text"
                  value={formData.dni}
                  onChange={(e) => {
                    // Solo permitir números
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 8) {
                      handleInputChange("dni", value);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  maxLength={8}
                />
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <label htmlFor="telefono" className="text-sm font-medium text-gray-700">
                  Teléfono
                </label>
                <input
                  id="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => handleInputChange("telefono", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Clase Licencia */}
              <div className="space-y-2">
                <label htmlFor="claseLicencia" className="text-sm font-medium text-gray-700">
                  Clase de Licencia <span className="text-red-500">*</span>
                </label>
                <select
                  id="claseLicencia"
                  value={formData.claseLicencia}
                  onChange={(e) => handleInputChange("claseLicencia", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleccionar clase de licencia</option>
                  <option value="A">Clase A - Motocicletas</option>
                  <option value="B">Clase B - Automóviles</option>
                  <option value="C">Clase C - Camiones pequeños</option>
                  <option value="D">Clase D - Transporte de pasajeros</option>
                  <option value="E">Clase E - Camiones grandes</option>
                </select>
              </div>              {/* Vencimiento Licencia */}
              <div className="space-y-2">
                <label htmlFor="vencimientoLicencia" className="text-sm font-medium text-gray-700">
                  Vencimiento de Licencia <span className="text-red-500">*</span>
                </label>
                
                {/* Sugerencias de fechas comunes */}
                {!formData.vencimientoLicencia && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-500 mb-2">Fechas comunes:</p>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 5].map(years => {
                        const futureDate = new Date();
                        futureDate.setFullYear(futureDate.getFullYear() + years);
                        const dateString = futureDate.toISOString().split('T')[0];
                        return (
                          <button
                            key={years}
                            type="button"
                            onClick={() => handleInputChange("vencimientoLicencia", dateString)}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                          >
                            +{years} año{years > 1 ? 's' : ''}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="relative">
                  <input
                    id="vencimientoLicencia"
                    type="date"
                    value={formData.vencimientoLicencia}
                    onChange={(e) => handleInputChange("vencimientoLicencia", e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer hover:border-gray-400 transition-colors ${
                      formData.vencimientoLicencia ? getLicenseStatusBadge(formData.vencimientoLicencia) : ''
                    }`}
                    style={{
                      colorScheme: 'light',
                      WebkitAppearance: 'none',
                      appearance: 'none'
                    }}
                    required
                  />
                  {/* Ícono de calendario personalizado */}
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                
                {/* Indicador visual de fecha seleccionada */}
                {formData.vencimientoLicencia && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm text-blue-800">
                      <strong>Fecha seleccionada:</strong> {new Date(formData.vencimientoLicencia).toLocaleDateString('es-AR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                )}

                {formData.vencimientoLicencia && (
                  <div className="mt-2">
                    {new Date(formData.vencimientoLicencia) < new Date() ? (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                        La licencia está vencida
                      </div>
                    ) : isLicenseExpiringSoon(formData.vencimientoLicencia) ? (
                      <div className="flex items-center gap-2 text-yellow-600 text-sm">
                        <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>
                        La licencia vence en {Math.ceil((new Date(formData.vencimientoLicencia).getTime() - new Date().getTime()) / (1000 * 3600 * 24))} días
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-green-600 text-sm">
                        <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                        Licencia vigente hasta {new Date(formData.vencimientoLicencia).toLocaleDateString('es-AR')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/conductores")}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  "Guardando..."
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
