import { Plus, Search, Package } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTiposCarga, useDeleteTipoCarga } from "../hooks/useTiposCarga";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import TiposCargaTable from "../components/TiposCargaTable";

export const TiposCargaListPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: tiposCarga = [], isLoading: loading, error, refetch } = useTiposCarga();
  const deleteTipoCargaMutation = useDeleteTipoCarga();

  const filteredTiposCarga = tiposCarga.filter((tipoCarga: any) => 
    tipoCarga.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tipoCarga.idTipoCarga?.toString().includes(searchTerm)
  );

  const handleDelete = async (id: number, nombre: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el tipo de carga "${nombre}"?`)) {
      try {
        await deleteTipoCargaMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting tipo de carga:', error);
      }
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  if (loading) {
    return (
      <div className="w-full space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full space-y-4">
        <Alert variant="destructive">
          <AlertTitle>Error al cargar tipos de carga</AlertTitle>
          <AlertDescription>{error?.message}</AlertDescription>
        </Alert>
        <Button onClick={handleRefresh} variant="outline">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl">
            <Package className="h-7 w-7 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tipos de Carga</h1>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6">
        <Card className="shadow-md border-0 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-500 rounded-xl">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-700">Total Tipos de Carga</p>
                <p className="text-2xl font-bold text-green-900">{tiposCarga.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md border-0 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-500 rounded-xl">
                <Search className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-700">Resultados</p>
                <p className="text-2xl font-bold text-blue-900">{filteredTiposCarga.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

       {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar tipos de carga por nombre o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />
        </div>
        
        {searchTerm && (
          <div className="text-sm text-gray-600 font-medium">
            {filteredTiposCarga.length} de {tiposCarga.length} tipos de carga
          </div>
        )}

        <div className="flex gap-3">
          <Button asChild className="shadow-md bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600">
            <Link to="/tipos-carga/nuevo">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Tipo de Carga
            </Link>
          </Button>
        </div>
      </div>

      {/* Tipos de Carga Table */}
      {filteredTiposCarga.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? "No se encontraron tipos de carga" : "No hay tipos de carga registrados"}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? "Intenta con otros términos de búsqueda" 
                : "Comienza agregando tu primer tipo de carga"
              }
            </p>
            {!searchTerm && (
              <Button asChild>
                <Link to="/tipos-carga/nuevo">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Tipo de Carga
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <TiposCargaTable 
          tiposCarga={filteredTiposCarga}
          onEditTipoCarga={(tipoCarga) => navigate(`/tipos-carga/editar/${tipoCarga.idTipoCarga}`)}
          onDeleteTipoCarga={(tipoCarga) => handleDelete(tipoCarga.idTipoCarga!, tipoCarga.nombre || 'Tipo de carga sin nombre')}
        />
      )}
    </div>
  );
};