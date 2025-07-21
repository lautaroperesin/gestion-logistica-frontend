import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { Plus, Package } from 'lucide-react';
import { useEnvios, useDeleteEnvio } from '../hooks/useEnvios';
import { EnviosTable } from '../components/EnviosTable';
import { EnviosFilters, type EnviosFiltersData } from '../components/EnviosFilters';
import { EnvioDetailsModal } from '../components/EnvioDetailsModal';
import { CambiarEstadoModal } from '../components/CambiarEstadoModal';
import { showDeleteSuccessToast, showErrorToast } from '@/lib/toast-utils';
import { useConfirmation } from '@/contexts/ConfirmationContext';
import type { EnvioDto } from '@/api';

export const EnviosPage = () => {
  const navigate = useNavigate();
  const { confirm } = useConfirmation();
  
  // Estados para filtros y paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<EnviosFiltersData>({});
  
  const { data: enviosData, isLoading: loading, error } = useEnvios(currentPage, pageSize, filters);
  const deleteEnvioMutation = useDeleteEnvio();
  
  // Extraer datos de la respuesta paginada
  const envios = enviosData?.items || [];
  const totalItems = enviosData?.totalItems || 0;
  const totalPages = enviosData?.totalPages || 1;
  
  const [selectedEnvio, setSelectedEnvio] = useState<EnvioDto | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showChangeStatusModal, setShowChangeStatusModal] = useState(false);

  const handleCreate = () => {
    navigate('/envios/nuevo');
  };

  const handleEdit = (envio: EnvioDto) => {
    if (envio.idEnvio) {
      navigate(`/envios/editar/${envio.idEnvio}`);
    }
  };

  const handleView = (envio: EnvioDto) => {
    setSelectedEnvio(envio);
    setShowDetailsModal(true);
  };

  const handleChangeStatus = (envio: EnvioDto) => {
    setSelectedEnvio(envio);
    setShowChangeStatusModal(true);
  };

  const handleModalSuccess = () => {
    // Los modales internos ya manejan sus propios toasts
  };

  // Funciones para filtros y paginación
  const handleFiltersChange = (newFilters: EnviosFiltersData) => {
    setFilters(newFilters);
    setCurrentPage(1); // Resetear a la primera página cuando se cambian los filtros
  };

  const handleClearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleDelete = async (id: number) => {
    // Buscar el envío para obtener su número de seguimiento
    const envio = envios.find(e => e.idEnvio === id);
    const envioName = envio?.numeroSeguimiento || `Envío #${id}`;

    // Mostrar confirmación usando el nuevo modal
    const confirmed = await confirm({
      title: "¿Confirmar eliminación?",
      description: "Esta acción no se puede deshacer.",
      itemName: envioName,
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      variant: "destructive"
    });

    if (confirmed) {
      try {
        await deleteEnvioMutation.mutateAsync(id);
        showDeleteSuccessToast(envioName);
      } catch (err) {
        showErrorToast(
          err instanceof Error ? err.message : 'Error al eliminar envío',
          'Error al eliminar'
        );
      }
    }
  };


  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-black">
          <Package className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Gestión de Envíos</h1>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Envío
          </Button>
        </div>
      </div>

       {/* Loading */}
      {loading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-8 shadow-xl">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin">
                  <div className=" border-blue-600 rounded-full"></div>
                </div>
              <p className="text-gray-600 font-medium">Cargando envíos...</p>
            </div>
          </div>
        </div>
      )}

      {/* Alerts - Mostrar solo errores de carga */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <div className="font-medium">
            {error?.message || 'Error al cargar los envíos'}
          </div>
        </div>
      )}

      {/* Filtros */}
      <EnviosFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
      />

      {/* Table */}
      <div className="bg-white rounded-lg shadow">
        <EnviosTable
          envios={envios}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          onChangeStatus={handleChangeStatus}
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
      
      {/* Loading overlay for delete */}
      {deleteEnvioMutation.isPending && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <div className="flex items-center gap-3 text-black">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              <span>Eliminando envío...</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalles */}
      <EnvioDetailsModal
        envio={selectedEnvio}
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
      />

      {/* Modal de cambio de estado */}
      <CambiarEstadoModal
        envio={selectedEnvio}
        open={showChangeStatusModal}
        onOpenChange={setShowChangeStatusModal}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};