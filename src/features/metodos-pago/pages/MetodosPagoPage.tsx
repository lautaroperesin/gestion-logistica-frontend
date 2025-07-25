import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, Plus, CreditCard } from 'lucide-react';
import { useMetodosPago, useDeleteMetodoPago } from '../hooks/useMetodosPago';
import { MetodosPagoTable } from '../components/MetodosPagoTable';
import { useConfirmation } from '@/contexts/ConfirmationContext';
import { showDeleteSuccessToast, showErrorToast } from '@/lib/toast-utils';
import type { MetodoPagoDto } from '@/api';

export const MetodosPagoPage = () => {
  const navigate = useNavigate();
  const { confirm } = useConfirmation();
  
  const { data: metodosPago = [], isLoading, error, refetch } = useMetodosPago();
  const deleteMetodoPagoMutation = useDeleteMetodoPago();

  const handleCreate = () => {
    navigate('/metodos-pago/nuevo');
  };

  const handleEdit = (metodoPago: MetodoPagoDto) => {
    navigate(`/metodos-pago/editar/${metodoPago.id}`);
  };

  const handleDelete = async (metodoPago: MetodoPagoDto) => {
    if (!metodoPago.id) return;
    
    const metodoPagoName = metodoPago.nombre || `Método de Pago #${metodoPago.id}`;
    
    const confirmed = await confirm({
      title: '¿Estás seguro?',
      description: 'Esta acción eliminará permanentemente el método de pago. Esta acción no se puede deshacer.',
      itemName: metodoPagoName,
      variant: 'destructive'
    });

    if (confirmed) {
      try {
        await deleteMetodoPagoMutation.mutateAsync(metodoPago.id!);
        showDeleteSuccessToast(metodoPagoName);
        refetch();
      } catch (error) {
        showErrorToast(
          error instanceof Error ? error.message : 'Error al eliminar método de pago',
          'Error al eliminar'
        );
      }
    }
  };

  const handleBack = () => {
    navigate('/movimientos-caja');
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Movimientos de Caja
          </Button>
        </div>
        
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Error al cargar métodos de pago: {error?.message || 'Error desconocido'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Movimientos de Caja
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <CreditCard className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Métodos de Pago</h1>
            <p className="text-gray-600">Gestiona los métodos de pago disponibles en el sistema</p>
          </div>
        </div>
        
        <Button onClick={handleCreate} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Método de Pago
        </Button>
      </div>

      {/* Loading and Error States */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <div className="font-medium">
            Error al cargar métodos de pago
          </div>
        </div>
      )}

      {/* Success Alert - se maneja ahora con toasts */}
      {deleteMetodoPagoMutation.isSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <AlertTitle className="text-green-800">¡Éxito!</AlertTitle>
          <AlertDescription className="text-green-700">
            Método de pago eliminado correctamente.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabla de métodos de pago */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Métodos de Pago ({metodosPago.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MetodosPagoTable
            metodosPago={metodosPago}
            loading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
    </div>
  );
};
