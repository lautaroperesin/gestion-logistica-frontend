import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2, AlertTriangle } from 'lucide-react';

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  itemName: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  icon?: React.ReactNode;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  itemName,
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default',
  icon,
}) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    onOpenChange(false);
  };

  const getIcon = () => {
    if (icon) return icon;
    if (variant === 'destructive') return <Trash2 className="h-6 w-6 text-red-600" />;
    return <AlertTriangle className="h-6 w-6 text-amber-600" />;
  };

  const getButtonClasses = () => {
    if (variant === 'destructive') {
      return 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white';
    }
    return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white';
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-4 mb-2">
            <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
              {getIcon()}
            </div>
            <div className="flex-1">
              <AlertDialogTitle className="text-lg font-semibold text-gray-900">
                {title}
              </AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="text-sm text-gray-600 leading-relaxed">
            {description}
          </AlertDialogDescription>
          {itemName && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md border">
              <div className="text-sm font-medium text-gray-900">Elemento a eliminar:</div>
              <div className="text-sm text-gray-700 truncate">{itemName}</div>
            </div>
          )}
        </AlertDialogHeader>
        
        <AlertDialogFooter className="gap-3 pt-4">
          <AlertDialogCancel 
            onClick={handleCancel}
            className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 focus:ring-gray-400"
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            className={getButtonClasses()}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Hook para manejar el estado del diálogo de confirmación
export const useConfirmationDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogProps, setDialogProps] = useState<Partial<ConfirmationDialogProps>>({});

  const showConfirmation = (props: Omit<ConfirmationDialogProps, 'open' | 'onOpenChange'>): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialogProps({
        ...props,
        onConfirm: () => {
          props.onConfirm();
          resolve(true);
        },
        onCancel: () => {
          if (props.onCancel) props.onCancel();
          resolve(false);
        },
      });
      setIsOpen(true);
    });
  };

  const ConfirmationDialogComponent = () => (
    <ConfirmationDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      title={dialogProps.title || ''}
      description={dialogProps.description || ''}
      itemName={dialogProps.itemName || ''}
      onConfirm={dialogProps.onConfirm || (() => {})}
      onCancel={dialogProps.onCancel}
      confirmText={dialogProps.confirmText}
      cancelText={dialogProps.cancelText}
      variant={dialogProps.variant}
      icon={dialogProps.icon}
    />
  );

  return {
    showConfirmation,
    ConfirmationDialog: ConfirmationDialogComponent,
  };
};
