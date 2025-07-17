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
import { Alert } from '@/components/ui/alert';
import { Loader2, RotateCcw } from 'lucide-react';
import { EstadoEnvioSelector } from './EstadoEnvioSelector';
import { useUpdateEnvioEstado } from '../hooks/useEnvios';
import type { EnvioDto } from '@/api';

interface CambiarEstadoModalProps {
  envio: EnvioDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const CambiarEstadoModal: React.FC<CambiarEstadoModalProps> = ({
  envio,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const updateEnvioEstadoMutation = useUpdateEnvioEstado();
  const [selectedEstado, setSelectedEstado] = useState<number>(0);
  const [error, setError] = useState<string>('');

  // Reset form when envio changes
  React.useEffect(() => {
    if (envio) {
      setSelectedEstado(envio.estado?.idEstado || 0);
      setError('');
    }
  }, [envio]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!envio?.idEnvio) return;
    
    if (!selectedEstado || selectedEstado === 0) {
      setError('Debe seleccionar un estado');
      return;
    }

    try {
      setError('');
      await updateEnvioEstadoMutation.mutateAsync({
        idEnvio: envio.idEnvio,
        newEstadoId: selectedEstado,
    });

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      setError('Error al cambiar el estado del envío');
    }
  };

  const handleClose = () => {
    setSelectedEstado(0);
    setError('');
    onOpenChange(false);
  };

  if (!envio) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-blue-600" />
            Cambiar Estado del Envío
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Información del envío */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Envío:</span>
              <span className="font-mono text-sm">{envio.numeroSeguimiento}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Cliente:</span>
              <span className="text-sm">{envio.cliente?.nombre}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Estado actual:</span>
              <span className="text-sm font-medium text-blue-600">
                {envio.estado?.nombre || 'Sin estado'}
              </span>
            </div>
          </div>

          {/* Selector de nuevo estado */}
          <div className="space-y-2">
            <Label>Nuevo Estado</Label>
            <EstadoEnvioSelector
              value={selectedEstado}
              onValueChange={setSelectedEstado}
              error={error}
            />
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>

          {/* Error del mutation */}
          {updateEnvioEstadoMutation.isError && (
            <Alert className="bg-red-50 border-red-200 text-red-800">
              <div className="font-medium">
                Error al cambiar el estado del envío
              </div>
            </Alert>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={updateEnvioEstadoMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={updateEnvioEstadoMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {updateEnvioEstadoMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cambiando...
                </>
              ) : (
                'Cambiar Estado'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
