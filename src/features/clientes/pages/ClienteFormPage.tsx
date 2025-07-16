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
import { useCliente, useCreateCliente, useUpdateCliente } from "../hooks/useClientes";
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
    reset,
    setValue
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
      } else {
        const createData: CreateClienteDto = {
          nombre: data.nombre.trim(),
          email: data.email?.trim() || "",
          telefono: data.telefono?.trim() || ""
        };
        
        await createClienteMutation.mutateAsync(createData);
      }
      navigate("/clientes");
    } catch (error) {
      console.error('Error al guardar cliente:', error);
    }
  };

  if (loadingData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/clientes")}>
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
        <Button variant="ghost" onClick={() => navigate("/clientes")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Clientes
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <User className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? "Editar Cliente" : "Nuevo Cliente"}
          </h1>
          <p className="text-gray-600">
            {isEditing ? "Modifica los datos del cliente" : "Completa la información del nuevo cliente"}
          </p>
        </div>
      </div>

      {/* Error Alert de mutaciones */}
      {(createClienteMutation.error || updateClienteMutation.error) && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {createClienteMutation.error?.message || updateClienteMutation.error?.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {(createClienteMutation.isSuccess || updateClienteMutation.isSuccess) && (
        <Alert className="border-green-200 bg-green-50">
          <AlertTitle className="text-green-800">¡Éxito!</AlertTitle>
          <AlertDescription className="text-green-700">
            Cliente {isEditing ? 'actualizado' : 'creado'} correctamente.
          </AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información del Cliente
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
                  placeholder="Ingrese el nombre del cliente"
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
                  placeholder="cliente@ejemplo.com"
                  className="bg-white/50 border-white/30"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>

              {/* Teléfono */}
              <div className="space-y-2 md:col-span-2">
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
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/clientes")}
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
                    {isEditing ? "Actualizar" : "Crear"} Cliente
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
