import { Plus, MapPin } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { useNavigate } from 'react-router-dom';
import UbicacionesTable from '../components/UbicacionesTable';
import { useUbicaciones, useDeleteUbicacion } from '../hooks/useUbicaciones';
import { useConfirmation } from '@/contexts/ConfirmationContext';
import { showDeleteSuccessToast, showErrorToast } from '@/lib/toast-utils';
import type { UbicacionDto } from '@/api';

export default function UbicacionesPage() {
  const navigate = useNavigate();
  const { confirm } = useConfirmation();
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const { data: ubicacionesResult, isLoading: loading, error } = useUbicaciones(currentPage, pageSize);
  const deleteUbicacionMutation = useDeleteUbicacion();
  
  // Extraer datos de la respuesta paginada
  const ubicaciones = ubicacionesResult?.items || [];
  const totalItems = ubicacionesResult?.totalItems || 0;
  const totalPages = ubicacionesResult?.totalPages || 1;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleEdit = (ubicacion: UbicacionDto) => {
    navigate(`/ubicaciones/editar/${ubicacion.idUbicacion}`);
  };

  const handleDelete = async (id: number) => {
    // Buscar la ubicación para obtener su descripción
    const ubicacion = ubicaciones.find(u => u.idUbicacion === id);
    const ubicacionName = ubicacion?.descripcion || ubicacion?.direccion || `Ubicación #${id}`;

    const confirmed = await confirm({
      title: '¿Estás seguro?',
      description: 'Esta acción eliminará permanentemente la ubicación. Esta acción no se puede deshacer.',
      itemName: ubicacionName,
      variant: 'destructive'
    });

    if (confirmed) {
      try {
        await deleteUbicacionMutation.mutateAsync(id);
        showDeleteSuccessToast(ubicacionName);
      } catch (error) {
        showErrorToast(
          error instanceof Error ? error.message : 'Error al eliminar ubicación',
          'Error al eliminar'
        );
      }
    }
  };

  const handleCreate = () => {
    navigate('/ubicaciones/nuevo');
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <MapPin className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error al cargar ubicaciones</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error?.message}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <MapPin className="h-8 w-8 text-blue-600" />
            Ubicaciones
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona las ubicaciones del sistema
          </p>
        </div>
        <Button 
          onClick={handleCreate}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Ubicación
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow">
        <UbicacionesTable
          ubicaciones={ubicaciones}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
        />
        
        {/* Paginación */}
        {totalItems > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </div>
    </div>
  );
}
