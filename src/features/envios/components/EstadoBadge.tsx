import React from 'react';
import { RotateCcw } from 'lucide-react';
import type { EnvioDto, EstadoEnvioDto } from '@/api';

interface EstadoBadgeProps {
  envio: EnvioDto;
  onClick?: (envio: EnvioDto) => void;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const EstadoBadge: React.FC<EstadoBadgeProps> = ({
  envio,
  onClick,
  interactive = false,
  size = 'md',
}) => {
  const getEstadoBadgeVariant = (estado?: EstadoEnvioDto | null) => {
    const estadoNombre = estado?.nombre?.toLowerCase();
    
    switch (estadoNombre) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200';
      case 'en transito':
      case 'en tránsito':
        return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200';
      case 'entregado':
        return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
      case 'cancelado':
        return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-xs';
      case 'lg':
        return 'px-4 py-1 text-sm';
      default:
        return 'px-2.5 py-0.5 text-xs';
    }
  };

  const badgeClasses = `
    ${getEstadoBadgeVariant(envio.estado)}
    ${getSizeClasses()}
    inline-flex items-center gap-1 rounded-full font-medium border transition-colors
    ${interactive ? 'cursor-pointer select-none' : ''}
  `;

  const content = (
    <>
      {envio.estado?.nombre || 'Sin estado'}
      {interactive && <RotateCcw className="h-3 w-3 opacity-60" />}
    </>
  );

  if (interactive && onClick) {
    return (
      <button
        onClick={() => onClick(envio)}
        className={badgeClasses}
        title={`Cambiar estado - Actual: ${envio.estado?.nombre || 'Sin estado'}`}
      >
        {content}
      </button>
    );
  }

  return (
    <span className={badgeClasses}>
      {content}
    </span>
  );
};
