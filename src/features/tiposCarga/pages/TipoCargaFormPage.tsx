import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
      <div className="container min-h-screen">
        <Card className="max-w-4xl mx-auto shadow-xl border-0">
          <CardContent className="p-8">
            <div className="text-center text-black">Cargando tipo de carga...</div>
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
                onClick={() => navigate("/tipos-carga")}
                className="text-black hover:bg-blue-100 border-black/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg">
                  <Package className="w-8 h-8" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold">
                    {isEditing ? "Editar Tipo de Carga" : "Nuevo Tipo de Carga"}
                  </CardTitle>
                  <p className="text-gray-500 text-sm">
                    {isEditing ? "Modifica los datos del tipo de carga" : "Complete la información del nuevo tipo de carga"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Información Básica */}
            <div className="rounded-xl p-6 border border-gray-300 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Información Básica
              </h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Tipo de Carga *
                  </label>
                  <Input
                    {...register("nombre")}
                    type="text"
                    className="w-full p-3 pl-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm transition-all duration-200 hover:border-gray-400"
                    placeholder="Ej: Líquidos, Frágiles, Peligrosos, etc."
                  />
                  {errors.nombre && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.nombre.message}
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
                  onClick={() => navigate("/tipos-carga")}
                  disabled={loading}
                  className="px-8 py-3 text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform"
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
                        {isEditing ? "Actualizar Tipo de Carga" : "Crear Tipo de Carga"}
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
