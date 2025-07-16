import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Plus, Package } from 'lucide-react';
import { useEnvios, useDeleteEnvio } from '../hooks/useEnvios';
import { EnviosTable } from '../components/EnviosTable';
import { EnvioDetailsModal } from '../components/EnvioDetailsModal';
import type { EnvioDto } from '@/api';

export const EnviosPage = () => {
  const navigate = useNavigate();
  const { data: envios = [], isLoading: loading, error } = useEnvios();
  const deleteEnvioMutation = useDeleteEnvio();
  
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [selectedEnvio, setSelectedEnvio] = useState<EnvioDto | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

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

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Está seguro que desea eliminar este envío?')) {
      return;
    }

    try {
      setDeleteError(null);
      await deleteEnvioMutation.mutateAsync(id);
      setDeleteSuccess(true);
      setTimeout(() => setDeleteSuccess(false), 3000);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Error al eliminar envío');
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

      {/* Alerts */}
      {deleteSuccess && (
        <Alert className="bg-green-500/20 border-green-500/30 text-green-100">
          <div className="font-medium">Envío eliminado exitosamente</div>
        </Alert>
      )}

      {(error || deleteError) && (
        <Alert className="bg-red-500/20 border-red-500/30 text-red-100">
          <div className="font-medium">
            {error?.message || deleteError}
          </div>
        </Alert>
      )}

      {/* Table */}
      <EnviosTable
        envios={envios}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />
      
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
    </div>
  );
};