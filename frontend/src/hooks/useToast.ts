import { useNotifications } from "@/contexts/NotificationContext";

export const useToast = () => {
  const { showToast, showError } = useNotifications();
  return { showToast, showError };
};
