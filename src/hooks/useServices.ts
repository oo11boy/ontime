// hooks/useServices.ts
import { useApiQuery, useApiMutation } from "./useApi";

interface Service {
  id: number;
  name: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
}

interface ServicesResponse {
  success: boolean;
  services: Service[];
}

export const useServices = () => {
  return useApiQuery<ServicesResponse>(
    ["services"],
    "/api/client/services",
    { staleTime: 10 * 60 * 1000 }
  );
};

export const useCreateService = () => {
  return useApiMutation("POST", "/api/client/services", [["services"]]);
};

// برای update, delete و toggle → endpoint رو در mutate می‌گیریم (نه در hook)
export const useUpdateService = () => {
  return useApiMutation("PUT", "", [["services"]]); // base url خالی → endpoint در mutate
};

export const useDeleteService = () => {
  return useApiMutation("DELETE", "", [["services"]]);
};

export const useToggleService = () => {
  return useApiMutation("PATCH", "", [["services"]]);
};