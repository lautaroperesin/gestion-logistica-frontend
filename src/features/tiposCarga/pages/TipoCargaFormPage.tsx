import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTipoCarga, useCreateTipoCarga, useUpdateTipoCarga } from "../hooks/useTiposCarga";
import { showCreateSuccessToast, showUpdateSuccessToast, showErrorToast } from '@/lib/toast-utils';

// Esquema de validación con Zod
const tipoCargaSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido").trim()
});

type TipoCargaFormData = z.infer<typeof tipoCargaSchema>;

export const TipoCargaFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  
  const { data: tipoCarga, isLoading: loadingData } = useTipoCarga(id ? parseInt(id) : 0);
  const createTipoCargaMutation = useCreateTipoCarga();
  const updateTipoCargaMutation = useUpdateTipoCarga();
  
  const form = useForm<TipoCargaFormData>({
    resolver: zodResolver(tipoCargaSchema),
    defaultValues: {
      nombre: ""
    }
  });

  const { register, handleSubmit, formState: { errors }, reset } = form;
  
  const loading = createTipoCargaMutation.isPending || updateTipoCargaMutation.isPending;

  // Pre-llenar el formulario cuando se está editando
  useEffect(() => {
    if (isEditing && tipoCarga) {
      reset({
        nombre: tipoCarga.nombre || ''
      });
    }
  }, [tipoCarga, isEditing, reset]);

  const onSubmit = async (data: TipoCargaFormData) => {
    try {
      if (isEditing && id) {
        await updateTipoCargaMutation.mutateAsync({
          id: parseInt(id),
          data: { nombre: data.nombre }
        });
        
        // Toast de actualización exitosa
        showUpdateSuccessToast(data.nombre);
      } else {
        await createTipoCargaMutation.mutateAsync({ nombre: data.nombre });
        
        // Toast de creación exitosa
        showCreateSuccessToast(data.nombre);
      }
      
      setTimeout(() => {
        navigate("/tipos-carga");
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado';
      
      // Toast de error
      showErrorToast(
        errorMessage,
        isEditing ? 'Error al actualizar tipo de carga' : 'Error al crear tipo de carga'
      );
      }
  };

  if (loadingData) {
    return (
      <div className="w-full space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/tipos-carga")} className="shadow-sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Tipos de Carga
          </Button>
        </div>
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="animate-pulse space-y-6">
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
        <Button variant="ghost" onClick={() => navigate("/tipos-carga")} className="shadow-sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Tipos de Carga
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-blue-100 to-green-100 rounded-xl">
          <Package className="h-7 w-7 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? "Editar Tipo de Carga" : "Nuevo Tipo de Carga"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing ? "Modifica los datos del tipo de carga" : "Completa la información del nuevo tipo de carga"}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50">
          <CardTitle className="text-xl font-bold text-gray-900">Información del Tipo de Carga</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6">
              {/* Nombre */}
              <div className="space-y-2">
                <label htmlFor="nombre" className="text-sm font-semibold text-gray-700">
                  Nombre del Tipo de Carga <span className="text-red-500">*</span>
                </label>
                <input
                  id="nombre"
                  type="text"
                  {...register("nombre")}
                  placeholder="Ej: Líquidos, Frágiles, Peligrosos, etc."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                />
                {errors.nombre && (
                  <p className="text-sm text-red-600">{errors.nombre.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-8 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/tipos-carga")}
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
                    {isEditing ? "Actualizar" : "Crear"} Tipo de Carga
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
