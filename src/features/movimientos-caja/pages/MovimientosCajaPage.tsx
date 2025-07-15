import { useState } from 'react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { useMovimientos, useDeleteMovimiento, useMovimientosStats } from '../hooks/useMovimientosCaja';
import { MovimientosCajaTable } from '../components/MovimientosCajaTable';
import { MovimientosCajaStats } from '../components/MovimientosCajaStats';
import { MovimientoDetailsModal } from '../components/MovimientoDetailsModal';
import type { MovimientoCajaDto } from '../../../api';

export const MovimientosCajaPage = () => {
  const [selectedMovimiento, setSelectedMovimiento] = useState<MovimientoCajaDto | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const { 
    data: movimientosResult, 
    isLoading, 
    error, 
    refetch 
  } = useMovimientos();

  const deleteMovimiento = useDeleteMovimiento();
  const movimientos = movimientosResult?.items || [];
  const stats = useMovimientosStats(movimientos);

  const handleView = (movimiento: MovimientoCajaDto) => {
    setSelectedMovimiento(movimiento);
    setShowDetailsModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este movimiento de caja?')) {
      try {
        await deleteMovimiento.mutateAsync(id);
        refetch();
      } catch (error) {
        console.error('Error al eliminar movimiento:', error);
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
          <p className="text-gray-600">Historial de pagos y movimientos de efectivo</p>
        </div>
      </div>

      {/* Estadísticas */}
      <MovimientosCajaStats stats={stats} />

      {/* Tabla de movimientos */}
      <MovimientosCajaTable
        movimientos={movimientos}
        loading={isLoading}
        onView={handleView}
        onDelete={handleDelete}
      />

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
