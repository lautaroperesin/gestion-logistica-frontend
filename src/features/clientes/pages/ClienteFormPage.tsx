import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useClientes } from "../hooks/useClientes";
import { fetchClienteById } from "../services/clientesService";
import type { CreateClienteDto, UpdateClienteDto } from "@/api";

// Esquema de validación con Zod
const clienteSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido").trim(),
  email: z.string().email("El email no es válido").optional().or(z.literal("")),
  telefono: z.string().optional()
});

type ClienteFormData = z.infer<typeof clienteSchema>;

export const ClienteFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  
  const { createNewCliente, updateExistingCliente } = useClientes();
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nombre: "",
      email: "",
      telefono: ""
    }
  });

  const { register, handleSubmit, formState: { errors }, setValue } = form;

  // Cargar datos del cliente si estamos editando
  useEffect(() => {
    if (isEditing && id) {
      loadClienteData(parseInt(id));
    }
  }, [id, isEditing]);

  const loadClienteData = async (clienteId: number) => {
    try {
      setLoadingData(true);
      const cliente = await fetchClienteById(clienteId);
      
      // Cargar datos en el formulario usando setValue
      setValue("nombre", cliente.nombre || "");
      setValue("email", cliente.email || "");
      setValue("telefono", cliente.telefono || "");
    } catch (err) {
      setError("Error al cargar los datos del cliente");
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data: ClienteFormData) => {
    setLoading(true);
    setError(null);

    try {
      if (isEditing && id) {
        const updateData: UpdateClienteDto = {
          idCliente: parseInt(id),
          nombre: data.nombre,
          email: data.email || "",
          telefono: data.telefono || "",
        };
        
        const success = await updateExistingCliente(parseInt(id), updateData);
        if (success) {
          navigate("/clientes");
        }
      } else {
        const createData: CreateClienteDto = {
          nombre: data.nombre,
          email: data.email || "",
          telefono: data.telefono || "",
        };
        
        const success = await createNewCliente(createData);
        if (success) {
          navigate("/clientes");
        }
      }
    } catch (err) {
      setError(isEditing ? "Error al actualizar el cliente" : "Error al crear el cliente");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="w-full space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/clientes")} className="shadow-sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Clientes
          </Button>
        </div>
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
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
        <Button variant="ghost" onClick={() => navigate("/clientes")} className="shadow-sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Clientes
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-blue-100 to-green-100 rounded-xl">
          <User className="h-7 w-7 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? "Editar Cliente" : "Nuevo Cliente"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing ? "Modifica los datos del cliente" : "Completa la información del nuevo cliente"}
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
          <CardTitle className="text-xl font-bold text-gray-900">Información del Cliente</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Nombre */}
              <div className="space-y-2">
                <label htmlFor="nombre" className="text-sm font-semibold text-gray-700">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  id="nombre"
                  type="text"
                  {...register("nombre")}
                  placeholder="Ingrese el nombre del cliente"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                />
                {errors.nombre && (
                  <p className="text-sm text-red-600">{errors.nombre.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="cliente@ejemplo.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Teléfono */}
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="telefono" className="text-sm font-semibold text-gray-700">
                  Teléfono
                </label>
                <input
                  id="telefono"
                  type="tel"
                  {...register("telefono")}
                  placeholder="+54 11 1234-5678"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                />
                {errors.telefono && (
                  <p className="text-sm text-red-600">{errors.telefono.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-8 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/clientes")}
                disabled={loading}
                className="px-6 py-3 shadow-sm"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="px-6 py-3 shadow-md bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {isEditing ? "Actualizando..." : "Creando..."}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {isEditing ? "Actualizar" : "Crear"} Cliente
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
