import { toast } from "sonner";

export const handleAsyncThunkError = (errorMessage: string, action?: { label: string, onClick: () => void }) => {
    toast.error(errorMessage, {
      description: "Quelque chose a mal tourné. Veuillez réessayer plus tard.",
      action: action,
    });
  
    throw new Error(errorMessage);
  
  }