import React, { createContext, useContext, useRef } from 'react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

interface ConfirmationOptions {
  title?: string;
  description?: string;
  itemName: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  icon?: React.ReactNode;
}

interface ConfirmationContextType {
  confirm: (options: ConfirmationOptions) => Promise<boolean>;
}

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);

export const useConfirmation = () => {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error('useConfirmation must be used within a ConfirmationProvider');
  }
  return context;
};

interface ConfirmationState {
  open: boolean;
  title: string;
  description: string;
  itemName: string;
  confirmText: string;
  cancelText: string;
  variant: 'default' | 'destructive';
  icon?: React.ReactNode;
  resolve?: (value: boolean) => void;
}

export const ConfirmationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = React.useState<ConfirmationState>({
    open: false,
    title: '',
    description: '',
    itemName: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    variant: 'default',
  });

  const resolveRef = useRef<((value: boolean) => void) | undefined>(undefined);

  const confirm = (options: ConfirmationOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      
      setState({
        open: true,
        title: options.title || '¿Confirmar eliminación?',
        description: options.description || 'Esta acción no se puede deshacer.',
        itemName: options.itemName,
        confirmText: options.confirmText || 'Eliminar',
        cancelText: options.cancelText || 'Cancelar',
        variant: options.variant || 'destructive',
        icon: options.icon,
      });
    });
  };

  const handleConfirm = () => {
    if (resolveRef.current) {
      resolveRef.current(true);
    }
    setState(prev => ({ ...prev, open: false }));
  };

  const handleCancel = () => {
    if (resolveRef.current) {
      resolveRef.current(false);
    }
    setState(prev => ({ ...prev, open: false }));
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleCancel();
    }
  };

  return (
    <ConfirmationContext.Provider value={{ confirm }}>
      {children}
      <ConfirmationDialog
        open={state.open}
        onOpenChange={handleOpenChange}
        title={state.title}
        description={state.description}
        itemName={state.itemName}
        confirmText={state.confirmText}
        cancelText={state.cancelText}
        variant={state.variant}
        icon={state.icon}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmationContext.Provider>
  );
};
