import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Pagination } from '../../../components/ui/pagination';
import { Settings } from 'lucide-react';
import { useMovimientos, useDeleteMovimiento } from '../hooks/useMovimientosCaja';
import { MovimientosCajaTable } from '../components/MovimientosCajaTable';
import { MovimientoDetailsModal } from '../components/MovimientoDetailsModal';
import { useConfirmation } from '@/contexts/ConfirmationContext';
import { showDeleteSuccessToast, showErrorToast } from '@/lib/toast-utils';
import type { MovimientoCajaDto } from '../../../api';

export const MovimientosCajaPage = () => {
  const navigate = useNavigate();
  const [selectedMovimiento, setSelectedMovimiento] = useState<MovimientoCajaDto | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { confirm } = useConfirmation();

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { 
    data: movimientosResult, 
    isLoading, 
    error, 
    refetch 
  } = useMovimientos(currentPage, pageSize);

  const deleteMovimiento = useDeleteMovimiento();
  
  // Extraer datos de la respuesta paginada
  const movimientos = movimientosResult?.items || [];
  const totalItems = movimientosResult?.totalItems || 0;
  const totalPages = movimientosResult?.totalPages || 1;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleView = (movimiento: MovimientoCajaDto) => {
    setSelectedMovimiento(movimiento);
    setShowDetailsModal(true);
  };

  const handleDelete = async (id: number) => {
    // Buscar el movimiento para obtener su información
    const movimiento = movimientos.find(m => m.idMovimiento === id);
    const movimientoName = movimiento?.observaciones || `Movimiento #${id}`;

    const confirmed = await confirm({
      title: '¿Estás seguro?',
      description: 'Esta acción eliminará permanentemente el movimiento de caja. Esta acción no se puede deshacer.',
      itemName: movimientoName,
      variant: 'destructive'
    });

    if (confirmed) {
      try {
        await deleteMovimiento.mutateAsync(id);
        showDeleteSuccessToast(movimientoName);
        refetch();
      } catch (error) {
        showErrorToast(
          error instanceof Error ? error.message : 'Error al eliminar movimiento',
          'Error al eliminar'
        );
      }
    }
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedMovimiento(null);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2 text-red-600">Error al cargar movimientos</h2>
          <p className="text-gray-600 mb-4">{String(error)}</p>
          <Button onClick={() => refetch()}>Reintentar</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Movimientos de Caja</h1>
          <p className="text-gray-600">Historial de pagos y movimientos</p>
        </div>
        <Button 
          onClick={() => navigate('/metodos-pago')}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          Gestionar Métodos de Pago
        </Button>
      </div>

      {/* Tabla de movimientos */}
      <div className="bg-white rounded-lg shadow">
        <MovimientosCajaTable
          movimientos={movimientos}
          loading={isLoading}
          onView={handleView}
          onDelete={handleDelete}
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

      {/* Modal de detalles */}
      {selectedMovimiento && (
        <MovimientoDetailsModal
          movimiento={selectedMovimiento}
          isOpen={showDetailsModal}
          onOpenChange={handleCloseModal}
        />
      )}
    </div>
  );
};
