import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FacturasTable } from '../components/FacturasTable';
import { useFacturas, useDeleteFactura } from '../hooks/useFacturas';
import { RegistrarPagoModal } from '@/features/movimientos-caja/components/RegistrarPagoModal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import type { FacturaDto } from '@/api';
import { FacturasStats } from '../components/FacturasStats';

export const FacturasPage = () => {
  const navigate = useNavigate();
  const { data: facturas, loading, error, refetch } = useFacturas();
  const { deleteFactura, loading: deleting } = useDeleteFactura();
  const [selectedFactura, setSelectedFactura] = useState<FacturaDto | null>(null);
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [facturaParaPago, setFacturaParaPago] = useState<FacturaDto | null>(null);

  const handleView = (factura: FacturaDto) => {
    setSelectedFactura(factura);
    // Aquí podrías abrir un modal de detalles similar al de envíos
  };

  const handleEdit = (factura: FacturaDto) => {
    navigate(`/facturas/editar/${factura.idFactura}`);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta factura?')) {
      const result = await deleteFactura(id);
      if (result.success) {
        refetch(); // Refrescar la lista
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
    refetch(); // Refrescar facturas después del pago
  };

  // Efecto para refrescar cuando se elimina una factura
  useEffect(() => {
    if (!deleting) {
      // La página se actualizará automáticamente cuando deleting cambie
    }
  }, [deleting]);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error al cargar facturas</h2>
          <p className="text-gray-600 mb-4">{error}</p>
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
      {!loading && facturas && <FacturasStats facturas={facturas} />}

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

      {/* Modal de detalles */}
      {selectedFactura && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              Detalles de Factura N° {selectedFactura.numeroFactura}
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Cliente</label>
                  <p className="font-medium">{selectedFactura.cliente?.nombre || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Envío</label>
                  <p className="font-medium">{selectedFactura.envio?.numeroSeguimiento || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Fecha Emisión</label>
                  <p className="font-medium">
                    {selectedFactura.fechaEmision 
                      ? new Date(selectedFactura.fechaEmision).toLocaleDateString('es-AR')
                      : '-'
                    }
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Fecha Vencimiento</label>
                  <p className="font-medium">
                    {selectedFactura.fechaVencimiento 
                      ? new Date(selectedFactura.fechaVencimiento).toLocaleDateString('es-AR')
                      : '-'
                    }
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Subtotal</label>
                  <p className="font-medium">
                    ${selectedFactura.subtotal?.toLocaleString('es-AR', { minimumFractionDigits: 2 }) || '0.00'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">IVA</label>
                  <p className="font-medium">
                    ${selectedFactura.iva?.toLocaleString('es-AR', { minimumFractionDigits: 2 }) || '0.00'}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-600">Total</label>
                  <p className="text-2xl font-bold text-green-600">
                    ${selectedFactura.total?.toLocaleString('es-AR', { minimumFractionDigits: 2 }) || '0.00'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button onClick={() => setSelectedFactura(null)} variant="outline">
                Cerrar
              </Button>
              <Button onClick={() => handleEdit(selectedFactura)}>
                Editar Factura
              </Button>
            </div>
          </Card>
        </div>
      )}

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
