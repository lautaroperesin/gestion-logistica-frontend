import { Plus, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import UbicacionesTable from '../components/UbicacionesTable';
import { useUbicaciones } from '../hooks/useUbicaciones';
import type { UbicacionDto } from '@/api';

export default function UbicacionesPage() {
  const navigate = useNavigate();
  const { ubicaciones, loading, error, deleteUbicacion } = useUbicaciones();

  const handleEdit = (ubicacion: UbicacionDto) => {
    navigate(`/ubicaciones/editar/${ubicacion.idUbicacion}`);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta ubicación?')) {
      return;
    }

    try {
      await deleteUbicacion(id);
    } catch (error) {
      console.error('Error al eliminar ubicación:', error);
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
                <p>{error}</p>
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
      <UbicacionesTable
        ubicaciones={ubicaciones}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />
    </div>
  );
}
