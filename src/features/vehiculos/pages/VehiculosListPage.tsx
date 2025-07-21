import { Plus, Search, Truck } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useVehiculos, useDeleteVehiculo } from "../hooks/useVehiculos";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import VehiculosTable from "../components/VehiculosTable";
import { showDeleteSuccessToast, showErrorToast } from '@/lib/toast-utils';
import { useConfirmation } from '@/contexts/ConfirmationContext';
import type { VehiculoDto } from "@/api";

export const VehiculosPage = () => {
  const navigate = useNavigate();
  const { confirm } = useConfirmation();
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: vehiculos = [], isLoading: loading, error, refetch } = useVehiculos();
  const deleteVehiculoMutation = useDeleteVehiculo();

  const filteredVehiculos = vehiculos.filter((vehiculo: VehiculoDto) => 
    vehiculo.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehiculo.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehiculo.patente?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: number, descripcion: string) => {
    const confirmed = await confirm({
      title: "¿Confirmar eliminación?",
      description: "Esta acción no se puede deshacer.",
      itemName: descripcion,
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      variant: "destructive"
    });

    if (confirmed) {
      try {
        await deleteVehiculoMutation.mutateAsync(id);
        showDeleteSuccessToast(descripcion);
      } catch (error) {
        showErrorToast(
          error instanceof Error ? error.message : 'Error al eliminar vehículo',
          'Error al eliminar'
        );
      }
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  if (loading) {
    return (
      <div className="space-y-6">
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
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTitle>Error al cargar vehiculos</AlertTitle>
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
            <Truck className="h-7 w-7 text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vehículos</h1>
            <p className="text-gray-600 mt-1">Gestiona tu flota de vehículos</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6">
        <Card className="shadow-md border-0">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-800 rounded-xl">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-700">Total Vehículos</p>
                <p className="text-2xl font-bold text-green-900">{vehiculos.length}</p>
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
                <p className="text-2xl font-bold text-blue-900">{filteredVehiculos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-0 bg-gradient-to-br from-emerald-50 to-emerald-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-emerald-500 rounded-xl">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-emerald-700">Disponibles</p>
                <p className="text-2xl font-bold text-emerald-900">
                  {vehiculos.filter((v: VehiculoDto) => v.estado === 1).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-0 bg-gradient-to-br from-amber-50 to-amber-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-amber-500 rounded-xl">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-amber-700">En Servicio</p>
                <p className="text-2xl font-bold text-amber-900">
                  {vehiculos.filter((v: VehiculoDto) => v.estado === 2).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-0 bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-500 rounded-xl">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-red-700">Mantenimiento</p>
                <p className="text-2xl font-bold text-red-900">
                  {vehiculos.filter((v: VehiculoDto) => v.estado === 3 || v.estado === 4).length}
                </p>
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
            placeholder="Buscar vehículos por marca, modelo o patente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />
        </div>
        
        {searchTerm && (
          <div className="text-sm text-gray-600 font-medium">
            {filteredVehiculos.length} de {vehiculos.length} vehículos
          </div>
        )}

        <div className="flex gap-3">
          <Button asChild className="shadow-md bg-green-500 hover:to-green-600">
            <Link to="/vehiculos/nuevo">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Vehículo
            </Link>
          </Button>
        </div>
      </div>

      {/* Vehiculos Grid */}
      {filteredVehiculos.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? "No se encontraron vehículos" : "No hay vehículos registrados"}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? "Intenta con otros términos de búsqueda" 
                : "Comienza agregando tu primer vehículo"
              }
            </p>
            {!searchTerm && (
              <Button asChild>
                <Link to="/vehiculos/nuevo">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Vehículo
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <VehiculosTable 
          vehiculos={filteredVehiculos}
          onEditVehiculo={(vehiculo) => navigate(`/vehiculos/editar/${vehiculo.idVehiculo}`)}
          onDeactivateVehiculo={(vehiculo) => handleDelete(vehiculo.idVehiculo!, `${vehiculo.marca} ${vehiculo.modelo} - ${vehiculo.patente}` || 'Vehículo sin identificación')}
        />
      )}
    </div>
  );
};