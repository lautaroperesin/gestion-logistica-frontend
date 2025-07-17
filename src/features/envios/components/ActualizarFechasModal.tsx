import React from 'react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { Loader2, Calendar, Clock } from 'lucide-react';
import { useUpdateEnvio } from '../hooks/useEnvios';
import type { EnvioDto } from '@/api';

interface ActualizarFechasModalProps {
  envio: EnvioDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const ActualizarFechasModal: React.FC<ActualizarFechasModalProps> = ({
  envio,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const updateEnvioMutation = useUpdateEnvio();
  const [fechaSalidaReal, setFechaSalidaReal] = useState<string>('');
  const [fechaEntregaReal, setFechaEntregaReal] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Reset form when envio changes
  React.useEffect(() => {
    if (envio) {
      setFechaSalidaReal(
        envio.fechaSalidaReal ? 
        new Date(envio.fechaSalidaReal).toISOString().slice(0, 16) : 
        ''
      );
      setFechaEntregaReal(
        envio.fechaEntregaReal ? 
        new Date(envio.fechaEntregaReal).toISOString().slice(0, 16) : 
        ''
      );
      setError('');
    }
  }, [envio]);

  const formatDate = (dateValue?: Date | string | null) => {
    if (!dateValue) return 'No establecida';
    try {
      const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!envio?.idEnvio) return;

    // Validar que al menos una fecha esté establecida
    if (!fechaSalidaReal && !fechaEntregaReal) {
      setError('Debe establecer al menos una fecha real');
      return;
    }

    // Validar que la fecha de entrega no sea anterior a la de salida
    if (fechaSalidaReal && fechaEntregaReal) {
      const salidaDate = new Date(fechaSalidaReal);
      const entregaDate = new Date(fechaEntregaReal);
      
      if (entregaDate < salidaDate) {
        setError('La fecha de entrega no puede ser anterior a la fecha de salida');
        return;
      }
    }

    try {
      setError('');
      await updateEnvioMutation.mutateAsync({
        id: envio.idEnvio,
        data: {
          // Mantener campos requeridos
          idEstado: envio.estado?.idEstado || 0,
          idCliente: envio.cliente?.idCliente || 0,
          idConductor: envio.conductor?.idConductor || 0,
          idVehiculo: envio.vehiculo?.idVehiculo || 0,
          idOrigen: envio.origen?.idUbicacion || 0,
          idDestino: envio.destino?.idUbicacion || 0,
          idTipoCarga: envio.tipoCarga?.idTipoCarga || 0,
          numeroSeguimiento: envio.numeroSeguimiento || '',
          descripcion: envio.descripcion,
          pesoKg: envio.pesoKg || 0,
          volumenM3: envio.volumenM3 || 0,
          costoTotal: envio.costoTotal || 0,
          fechaSalidaProgramada: envio.fechaSalidaProgramada,
          fechaEntregaEstimada: envio.fechaEntregaEstimada || new Date(),
          // Actualizar fechas reales
          fechaSalidaReal: fechaSalidaReal ? new Date(fechaSalidaReal) : envio.fechaSalidaReal,
          fechaEntregaReal: fechaEntregaReal ? new Date(fechaEntregaReal) : envio.fechaEntregaReal,
        },
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error al actualizar fechas:', error);
      setError('Error al actualizar las fechas del envío');
    }
  };

  const handleClose = () => {
    setFechaSalidaReal('');
    setFechaEntregaReal('');
    setError('');
    onOpenChange(false);
  };

  const setCurrentDateTime = (type: 'salida' | 'entrega') => {
    const now = new Date().toISOString().slice(0, 16);
    if (type === 'salida') {
      setFechaSalidaReal(now);
    } else {
      setFechaEntregaReal(now);
    }
  };

  if (!envio) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" />
            Actualizar Fechas Reales
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Información del envío */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Envío:</span>
              <span className="font-mono text-sm">{envio.numeroSeguimiento}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Cliente:</span>
              <span className="text-sm">{envio.cliente?.nombre}</span>
            </div>
          </div>

          {/* Fechas programadas vs reales */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Fechas Programadas</h3>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Salida programada:</span>
                <span>{formatDate(envio.fechaSalidaProgramada)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Entrega estimada:</span>
                <span>{formatDate(envio.fechaEntregaEstimada)}</span>
              </div>
            </div>
          </div>

          {/* Fecha de Salida Real */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Fecha de Salida Real</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCurrentDateTime('salida')}
                className="h-8 text-xs"
              >
                <Clock className="h-3 w-3 mr-1" />
                Ahora
              </Button>
            </div>
            <Input
              type="datetime-local"
              value={fechaSalidaReal}
              onChange={(e) => setFechaSalidaReal(e.target.value)}
            />
            {envio.fechaSalidaReal && (
              <p className="text-xs text-gray-600">
                Actual: {formatDate(envio.fechaSalidaReal)}
              </p>
            )}
          </div>

          {/* Fecha de Entrega Real */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Fecha de Entrega Real</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCurrentDateTime('entrega')}
                className="h-8 text-xs"
              >
                <Clock className="h-3 w-3 mr-1" />
                Ahora
              </Button>
            </div>
            <Input
              type="datetime-local"
              value={fechaEntregaReal}
              onChange={(e) => setFechaEntregaReal(e.target.value)}
            />
            {envio.fechaEntregaReal && (
              <p className="text-xs text-gray-600">
                Actual: {formatDate(envio.fechaEntregaReal)}
              </p>
            )}
          </div>

          {/* Error messages */}
          {error && (
            <Alert className="bg-red-50 border-red-200 text-red-800">
              <div className="font-medium">{error}</div>
            </Alert>
          )}

          {updateEnvioMutation.isError && (
            <Alert className="bg-red-50 border-red-200 text-red-800">
              <div className="font-medium">
                Error al actualizar las fechas del envío
              </div>
            </Alert>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={updateEnvioMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={updateEnvioMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {updateEnvioMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Actualizando...
                </>
              ) : (
                'Actualizar Fechas'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
