import { Trash2, Edit, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { UbicacionDto } from '@/api';

interface UbicacionesTableProps {
  ubicaciones: UbicacionDto[];
  onEdit: (ubicacion: UbicacionDto) => void;
  onDelete: (id: number) => void;
  loading?: boolean;
}

export default function UbicacionesTable({ ubicaciones, onEdit, onDelete, loading }: UbicacionesTableProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Cargando ubicaciones...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (ubicaciones.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium">No hay ubicaciones</h3>
            <p className="text-sm">Agrega tu primera ubicación para comenzar.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Ubicaciones
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Dirección</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Localidad</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Provincia</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">País</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Dirección Completa</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Descripción</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ubicaciones.map((ubicacion) => (
                <tr key={ubicacion.idUbicacion} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900">{ubicacion.direccion}</div>
                  </td>
                  <td className="py-4 px-4 text-gray-700">
                    {ubicacion.localidad?.nombre || '-'}
                  </td>
                  <td className="py-4 px-4 text-gray-700">
                    {ubicacion.localidad?.provincia?.nombre || '-'}
                  </td>
                  <td className="py-4 px-4 text-gray-700">
                    {ubicacion.localidad?.provincia?.pais?.nombre || '-'}
                  </td>
                  <td className="py-4 px-4 text-gray-700">
                    {ubicacion.direccionCompleta || '-'}
                  </td>
                  <td className="py-4 px-4 text-gray-700">
                    {ubicacion.descripcion || "-"}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(ubicacion)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(ubicacion.idUbicacion!)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
