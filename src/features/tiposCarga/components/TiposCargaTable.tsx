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
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Pencil, Trash2 } from "lucide-react";
import type { TipoCargaDto } from "@/api";

interface TiposCargaTableProps {
  tiposCarga: TipoCargaDto[];
  onEditTipoCarga: (tipoCarga: TipoCargaDto) => void;
  onDeleteTipoCarga: (tipoCarga: TipoCargaDto) => void;
}

const TiposCargaTable = ({ tiposCarga, onEditTipoCarga, onDeleteTipoCarga }: TiposCargaTableProps) => {
  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm w-full">
      <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-green-50">
        <CardTitle className="text-xl font-bold text-gray-900">Tipos de Carga</CardTitle>
        <CardDescription className="text-gray-600">
          Lista de tipos de carga disponibles en el sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {tiposCarga.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No hay tipos de carga registrados</p>
            <p className="text-gray-400 text-sm mt-1">Comienza agregando tu primer tipo de carga</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="font-semibold text-gray-700 w-auto">ID</TableHead>
                  <TableHead className="font-semibold text-gray-700 w-auto">Nombre</TableHead>
                  <TableHead className="text-right font-semibold text-gray-700 w-auto">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tiposCarga.map((tipoCarga) => (
                  <TableRow key={tipoCarga.idTipoCarga} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-blue-100 to-green-100 p-2.5 rounded-xl">
                          <Package className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="font-semibold text-gray-900">#{tipoCarga.idTipoCarga}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="font-medium text-gray-800">
                        {tipoCarga.nombre || 'Sin nombre'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditTipoCarga(tipoCarga)}
                          className="h-9 w-9 p-0 hover:bg-blue-100 hover:text-blue-700"
                          title="Editar tipo de carga"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteTipoCarga(tipoCarga)}
                          className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-100"
                          title="Eliminar tipo de carga"
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

export default TiposCargaTable;
