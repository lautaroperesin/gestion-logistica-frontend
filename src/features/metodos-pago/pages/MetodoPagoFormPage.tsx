import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useCreateMetodoPago, useUpdateMetodoPago, useMetodoPago } from "../hooks/useMetodosPago";
import type { MetodoPagoDto } from "@/api";

// Esquema de validación con Zod
const metodoPagoSchema = z.object({
  nombre: z.string()
    .min(1, "El nombre es requerido")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede tener más de 100 caracteres")
    .trim(),
});

type MetodoPagoFormData = z.infer<typeof metodoPagoSchema>;

export const MetodoPagoFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  
  const { data: metodoPago, isLoading: loadingData } = useMetodoPago(id ? parseInt(id) : 0);
  const createMetodoPagoMutation = useCreateMetodoPago();
  const updateMetodoPagoMutation = useUpdateMetodoPago();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    reset,
  } = useForm<MetodoPagoFormData>({
    resolver: zodResolver(metodoPagoSchema),
    mode: 'onBlur',
    defaultValues: {
      nombre: '',
    }
  });

  // Cargar datos del método de pago si estamos editando
  useEffect(() => {
    if (isEditing && metodoPago) {
      reset({
        nombre: metodoPago.nombre || '',
      });
    }
  }, [metodoPago, isEditing, reset]);

  const onSubmit = async (data: MetodoPagoFormData) => {
    try {
      if (isEditing && id) {
        const updateData: MetodoPagoDto = {
          id: parseInt(id),
          nombre: data.nombre.trim(),
        };
        
        await updateMetodoPagoMutation.mutateAsync({
          id: parseInt(id), 
          data: updateData
        });
      } else {
        const createData: MetodoPagoDto = {
          nombre: data.nombre.trim(),
        };
        
        await createMetodoPagoMutation.mutateAsync(createData);
      }
      navigate("/metodos-pago");
    } catch (error) {
      console.error('Error al guardar método de pago:', error);
    }
  };

  const handleBack = () => {
    navigate("/metodos-pago");
  };

  if (loadingData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
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
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Métodos de Pago
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-100 rounded-lg">
          <CreditCard className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? "Editar Método de Pago" : "Nuevo Método de Pago"}
          </h1>
          <p className="text-gray-600">
            {isEditing ? "Modifica los datos del método de pago" : "Completa la información del nuevo método de pago"}
          </p>
        </div>
      </div>

      {/* Error Alert de mutaciones */}
      {(createMetodoPagoMutation.error || updateMetodoPagoMutation.error) && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {createMetodoPagoMutation.error?.message || updateMetodoPagoMutation.error?.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {(createMetodoPagoMutation.isSuccess || updateMetodoPagoMutation.isSuccess) && (
        <Alert className="border-green-200 bg-green-50">
          <AlertTitle className="text-green-800">¡Éxito!</AlertTitle>
          <AlertDescription className="text-green-700">
            Método de pago {isEditing ? 'actualizado' : 'creado'} correctamente.
          </AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Información del Método de Pago
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="nombre">
                Nombre del Método de Pago <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nombre"
                {...register("nombre")}
                placeholder="Ej: Efectivo, Tarjeta de Crédito, Transferencia Bancaria"
                className="bg-white/50 border-white/30"
              />
              {errors.nombre && (
                <p className="text-red-500 text-sm">{errors.nombre.message}</p>
              )}
              <p className="text-sm text-gray-500">
                Ingresa un nombre descriptivo para el método de pago
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={!isValid || isSubmitting}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditing ? "Actualizar" : "Crear"} Método de Pago
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
