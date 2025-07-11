
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, Pencil, Trash2, Calendar, Weight, Activity } from "lucide-react";
import type { VehiculoDto } from "@/api";

interface VehiculosTableProps {
  vehiculos: VehiculoDto[];
  onEditVehiculo: (vehiculo: VehiculoDto) => void;
  onDeactivateVehiculo: (vehiculo: VehiculoDto) => void;
}

const VehiculosTable = ({ vehiculos, onEditVehiculo, onDeactivateVehiculo }: VehiculosTableProps) => {
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-ES');
  };

  const getEstadoLabel = (estado: number | undefined) => {
    switch (estado) {
      case 1: return 'Disponible';
      case 2: return 'En servicio';
      case 3: return 'En mantenimiento';
      case 4: return 'Fuera de servicio';
      default: return 'N/A';
    }
  };

  const getEstadoColor = (estado: number | undefined) => {
    switch (estado) {
      case 1: return 'text-green-600 bg-green-100';
      case 2: return 'text-blue-600 bg-blue-100';
      case 3: return 'text-yellow-600 bg-yellow-100';
      case 4: return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm w-full">
      <CardContent className="p-0">
        {vehiculos.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No hay vehículos registrados</p>
            <p className="text-gray-400 text-sm mt-1">Comienza agregando tu primer vehículo</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="font-semibold text-gray-700 w-auto">Vehículo</TableHead>
                  <TableHead className="font-semibold text-gray-700 w-auto">Patente</TableHead>
                  <TableHead className="font-semibold text-gray-700 w-auto">Estado</TableHead>
                  <TableHead className="font-semibold text-gray-700 w-auto">Capacidad</TableHead>
                  <TableHead className="font-semibold text-gray-700 w-auto">Última Inspección</TableHead>
                  <TableHead className="font-semibold text-gray-700 w-auto">RTO Vencimiento</TableHead>
                  <TableHead className="text-right font-semibold text-gray-700 w-auto">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {vehiculos.map((vehiculo) => (
                <TableRow key={vehiculo.idVehiculo} className="hover:bg-gray-50/50 transition-colors">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl">
                        <Truck className="h-4 w-4 text-gray-500" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{vehiculo.marca || 'Sin marca'}</div>
                        <div className="text-sm text-gray-500">{vehiculo.modelo || 'Sin modelo'}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <span className="font-mono font-semibold text-gray-800 bg-gray-100 px-2 py-1 rounded-md">
                      {vehiculo.patente || 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell className="py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getEstadoColor(vehiculo.estado)}`}>
                      {getEstadoLabel(vehiculo.estado)}
                    </span>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <Weight className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{vehiculo.capacidadCarga ? `${vehiculo.capacidadCarga} kg` : 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{formatDate(vehiculo.ultimaInspeccion)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{formatDate(vehiculo.rtoVencimiento)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditVehiculo(vehiculo)}
                        className="h-9 w-9 p-0 hover:bg-blue-100 hover:text-blue-700"
                        title="Editar vehículo"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeactivateVehiculo(vehiculo)}
                        className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-100"
                        title="Eliminar vehículo"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VehiculosTable;
