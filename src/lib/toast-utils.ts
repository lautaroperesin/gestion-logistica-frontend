import { toast } from "@/hooks/useToast";

// Toast de éxito
export const showSuccessToast = (message: string, title?: string) => {
  toast({
    variant: "success",
    title: title || "¡Éxito!",
    description: message,
    duration: 4000,
  });
};

// Toast de error
export const showErrorToast = (message: string, title?: string) => {
  toast({
    variant: "destructive",
    title: title || "Error",
    description: message,
    duration: 5000,
  });
};

// Toast informativo
export const showInfoToast = (message: string, title?: string) => {
  toast({
    title: title || "Información",
    description: message,
    duration: 4000,
  });
};

// Función helper para mostrar toast de eliminación exitosa
export const showDeleteSuccessToast = (itemName: string) => {
  showSuccessToast(`"${itemName}" ha sido eliminado exitosamente`, "¡Eliminado!");
};

// Función helper para mostrar toast de creación exitosa
export const showCreateSuccessToast = (itemName: string) => {
  showSuccessToast(`"${itemName}" ha sido creado exitosamente`, "¡Creado!");
};

// Función helper para mostrar toast de actualización exitosa
export const showUpdateSuccessToast = (itemName: string) => {
  showSuccessToast(`"${itemName}" ha sido actualizado exitosamente`, "¡Actualizado!");
};

// Hook personalizado que debe ser usado en componentes que necesitan confirmación
// La implementación real se debe hacer usando useConfirmation() en cada componente
export const createConfirmationHelper = (confirmFn: any) => {
  return async (
    itemName: string,
    onConfirm: () => void,
    onCancel?: () => void
  ): Promise<boolean> => {
    const confirmed = await confirmFn({
      title: "¿Confirmar eliminación?",
      description: `¿Está seguro que desea eliminar "${itemName}"? Esta acción no se puede deshacer.`,
      itemName,
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      variant: "destructive" as const,
    });

    if (confirmed) {
      onConfirm();
      return true;
    } else {
      if (onCancel) onCancel();
      return false;
    }
  };
};
