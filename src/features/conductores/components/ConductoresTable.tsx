
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
import { Phone, Mail, User, Pencil, Trash2, CreditCard, Calendar } from "lucide-react";
import type { ConductorDto } from "@/api";

interface ConductoresTableProps {
  conductores: ConductorDto[];
  onEditConductor: (conductor: ConductorDto) => void;
  onDeactivateConductor: (conductor: ConductorDto) => void;
}

const ConductoresTable = ({ conductores, onEditConductor, onDeactivateConductor }: ConductoresTableProps) => {
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-ES');
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Conductores</CardTitle>
        <CardDescription>
          Lista de conductores disponibles en tu flota
        </CardDescription>
      </CardHeader>
      <CardContent>
        {conductores.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No hay conductores registrados</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>DNI</TableHead>
                <TableHead>Licencia</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conductores.map((conductor) => (
                <TableRow key={conductor.idConductor}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 p-2 rounded-full">
                        <User className="h-4 w-4 text-gray-500" />
                      </div>
                      <span className="font-medium">{conductor.nombre || 'Sin nombre'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      {conductor.telefono && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {conductor.telefono}
                        </div>
                      )}
                      {conductor.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {conductor.email}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <CreditCard className="h-3 w-3" />
                      <span>{conductor.dni || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell>{conductor.claseLicencia || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(conductor.vencimientoLicencia)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditConductor(conductor)}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeactivateConductor(conductor)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default ConductoresTable;
