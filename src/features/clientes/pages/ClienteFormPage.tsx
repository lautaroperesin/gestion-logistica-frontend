import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCliente, useCreateCliente, useUpdateCliente } from "../hooks/useClientes";
import { showCreateSuccessToast, showUpdateSuccessToast, showErrorToast } from "@/lib/toast-utils";
import type { CreateClienteDto, UpdateClienteDto } from "@/api";

// Esquema de validación con Zod
const clienteSchema = z.object({
  nombre: z.string()
    .min(1, "El nombre es requerido")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede tener más de 100 caracteres")
    .trim(),
  email: z.string()
    .optional()
    .refine((email) => !email || z.string().email().safeParse(email).success, {
      message: "El email no es válido"
    }),
  telefono: z.string().optional()
});

type ClienteFormData = z.infer<typeof clienteSchema>;

export const ClienteFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  
  // React Query hooks
  const { data: cliente, isLoading: loadingData } = useCliente(id ? parseInt(id) : 0);
  const createClienteMutation = useCreateCliente();
  const updateClienteMutation = useUpdateCliente();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    reset
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nombre: "",
      email: "",
      telefono: ""
    }
  });

  // Cargar datos del cliente si estamos editando
  useEffect(() => {
    if (isEditing && cliente) {
      reset({
        nombre: cliente.nombre || "",
        email: cliente.email || "",
        telefono: cliente.telefono || ""
      });
    }
  }, [cliente, isEditing, reset]);

  const onSubmit = async (data: ClienteFormData) => {
    try {
      if (isEditing && id) {
        const updateData: UpdateClienteDto = {
          idCliente: parseInt(id),
          nombre: data.nombre.trim(),
          email: data.email?.trim() || "",
          telefono: data.telefono?.trim() || ""
        };
        
        await updateClienteMutation.mutateAsync({
          id: parseInt(id),
          data: updateData
        });
        
        // Toast de actualización exitosa
        showUpdateSuccessToast(data.nombre);
      } else {
        const createData: CreateClienteDto = {
          nombre: data.nombre.trim(),
          email: data.email?.trim() || "",
          telefono: data.telefono?.trim() || ""
        };
        
        await createClienteMutation.mutateAsync(createData);
        
        // Toast de creación exitosa
        showCreateSuccessToast(data.nombre);
      }
      
      setTimeout(() => {
        navigate("/clientes");
      }, 1500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error inesperado';
      
      // Toast de error
      showErrorToast(
        errorMessage,
        isEditing ? 'Error al actualizar cliente' : 'Error al crear cliente'
      );
    }
  };

  if (loadingData) {
    return (
      <div className="container min-h-screen">
        <Card className="max-w-4xl mx-auto shadow-xl border-0">
          <CardContent className="p-8">
            <div className="text-center text-black">Cargando cliente...</div>
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
                onClick={() => navigate("/clientes")}
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
                    {isEditing ? "Editar Cliente" : "Nuevo Cliente"}
                  </CardTitle>
                  <p className="text-gray-500 text-sm">
                    {isEditing ? "Modifica los datos del cliente" : "Complete la información del nuevo cliente"}
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
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo *
                  </label>
                  <div className="relative">
                    <Input
                      {...register("nombre")}
                      type="text"
                      className="w-full p-3 pl-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm transition-all duration-200 hover:border-gray-400"
                      placeholder="Ingrese el nombre completo del cliente"
                    />
                  </div>
                  {errors.nombre && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.nombre.message}
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
                  <div className="relative">
                    <Input
                      {...register("email")}
                      type="email"
                      className="w-full p-3 pl-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm transition-all duration-200 hover:border-gray-400"
                      placeholder="cliente@ejemplo.com"
                    />
                  </div>
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
                  <div className="relative">
                    <Input
                      {...register("telefono")}
                      type="tel"
                      className="w-full p-3 pl-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm transition-all duration-200 hover:border-gray-400"
                      placeholder="+54 11 1234-5678"
                    />
                  </div>
                  {errors.telefono && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.telefono.message}
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
                  onClick={() => navigate("/clientes")}
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
                        {isEditing ? "Actualizar Cliente" : "Crear Cliente"}
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
