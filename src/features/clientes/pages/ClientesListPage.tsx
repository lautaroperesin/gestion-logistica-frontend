import { Plus, Search, Users } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useClientes } from "../hooks/useClientes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ClienteCard } from "../components/ClienteCard";

export const ClientesPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  
  const {
    clientes,
    loading,
    error,
    totalCount,
    refresh,
    removeCliente,
    setError
  } = useClientes(10);

  const filteredClientes = clientes.filter(cliente => 
    cliente.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.telefono?.includes(searchTerm)
  );

  const handleDelete = async (id: number, nombre: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar al cliente "${nombre}"?`)) {
      const success = await removeCliente(id);
      if (success) {
        // El hook ya actualiza la lista automáticamente
      }
    }
  };

  const handleRefresh = () => {
    setError(null);
    refresh();
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
          <AlertTitle>Error al cargar clientes</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={handleRefresh} variant="outline">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/clientes/nuevo">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Cliente
            </Link>
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar clientes por nombre, email o teléfono..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-2">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Clientes</p>
                <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-2">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Search className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resultados</p>
                <p className="text-2xl font-bold text-gray-900">{filteredClientes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clientes Grid */}
      {filteredClientes.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? "No se encontraron clientes" : "No hay clientes registrados"}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? "Intenta con otros términos de búsqueda" 
                : "Comienza agregando tu primer cliente"
              }
            </p>
            {!searchTerm && (
              <Button asChild>
                <Link to="/clientes/nuevo">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Cliente
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClientes.map((cliente) => (
            <ClienteCard 
              key={cliente.idCliente} 
              cliente={cliente} 
              onEdit={() => navigate(`/clientes/editar/${cliente.idCliente}`)}
              onDelete={() => handleDelete(cliente.idCliente!, cliente.nombre || 'Cliente sin nombre')}
            />
          ))}
        </div>
      )}
    </div>
  );
};