import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FacturasTable } from '../components/FacturasTable';
import { FacturaDetailsModal } from '../components/FacturaDetailsModal';
import { useFacturas, useAllFacturas, useDeleteFactura } from '../hooks/useFacturas';
import { RegistrarPagoModal } from '@/features/movimientos-caja/components/RegistrarPagoModal';
import { Card } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import { AlertTriangle } from 'lucide-react';
import { useConfirmation } from '@/contexts/ConfirmationContext';
import { showDeleteSuccessToast, showErrorToast } from '@/lib/toast-utils';
import type { FacturaDto } from '@/api';
import { FacturasStats } from '../components/FacturasStats';

export const FacturasPage = () => {
  const navigate = useNavigate();
  const { confirm } = useConfirmation();
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const { data: facturasData, isLoading: loading, error } = useFacturas(currentPage, pageSize);
  const { data: allFacturas = [] } = useAllFacturas(); // Para estadísticas
  const deleteFacturaMutation = useDeleteFactura();
  
  // Extraer datos de la respuesta paginada
  const facturas = facturasData?.items || [];
  const totalItems = facturasData?.totalItems || 0;
  const totalPages = facturasData?.totalPages || 1;
  
  const [selectedFactura, setSelectedFactura] = useState<FacturaDto | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [facturaParaPago, setFacturaParaPago] = useState<FacturaDto | null>(null);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleView = (factura: FacturaDto) => {
    setSelectedFactura(factura);
    setShowDetailsModal(true);
  };

  const handleEdit = (factura: FacturaDto) => {
    navigate(`/facturas/editar/${factura.idFactura}`);
  };

  const handleDelete = async (id: number) => {
    // Buscar la factura para obtener su número
    const factura = facturas.find(f => f.idFactura === id);
    const facturaName = factura?.numeroFactura || `Factura #${id}`;

    const confirmed = await confirm({
      title: '¿Estás seguro?',
      description: 'Esta acción eliminará permanentemente la factura. Esta acción no se puede deshacer.',
      itemName: facturaName,
      variant: 'destructive'
    });

    if (confirmed) {
      try {
        await deleteFacturaMutation.mutateAsync(id);
        showDeleteSuccessToast(facturaName);
      } catch (error) {
        showErrorToast(
          error instanceof Error ? error.message : 'Error al eliminar factura',
          'Error al eliminar'
        );
      }
    }
  };

  const handleAdd = () => {
    navigate('/facturas/nueva');
  };

  const handlePagar = (factura: FacturaDto) => {
    setFacturaParaPago(factura);
    setShowPagoModal(true);
  };

  const handleClosePagoModal = (open: boolean) => {
    if (!open) {
      setShowPagoModal(false);
      setFacturaParaPago(null);
    }
  };

  const handlePagoExitoso = () => {
    // La refetch se hace automáticamente con React Query
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error al cargar facturas</h2>
          <p className="text-gray-600 mb-4">{error?.message || 'Error desconocido'}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Título */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Facturas</h1>
          <p className="text-gray-600">Administra las facturas del sistema</p>
        </div>
      </div>

      {/* Estadísticas */}
      {!loading && allFacturas && <FacturasStats facturas={allFacturas} />}

      {/* Tabla de facturas */}
        <FacturasTable
          facturas={facturas || []}
          loading={loading}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={handleAdd}
          onPagar={handlePagar}
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

      {/* Modal de detalles */}
      <FacturaDetailsModal
        factura={selectedFactura}
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
      />

      {/* Modal de Registro de Pago */}
      {facturaParaPago && (
        <RegistrarPagoModal
          factura={facturaParaPago}
          isOpen={showPagoModal}
          onOpenChange={handleClosePagoModal}
          onSuccess={handlePagoExitoso}
        />
      )}
    </div>
  );
};
