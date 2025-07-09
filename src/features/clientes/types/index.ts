// Re-exportar los tipos del API generado para facilitar su uso
export type {
  ClienteDto,
  CreateClienteDto,
  UpdateClienteDto,
  ClienteDtoPagedResult,
} from '@/api/models';

// Alias para mantener compatibilidad
export type { ClienteDto as Cliente } from '@/api/models';

// Tipos adicionales para el estado local si es necesario
export interface ClientesState {
  clientes: ClienteDto[];
  loading: boolean;
  error: string | null;
  totalCount?: number;
  currentPage: number;
  pageSize: number;
}

// Importar el tipo principal para compatibilidad
import type { ClienteDto } from '@/api/models';
