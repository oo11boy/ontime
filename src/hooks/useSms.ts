// hooks/useSms.ts
import { useApiQuery, useApiMutation } from "./useApi";

interface SmsPack {
  id: number;
  count: number;
  price: number;
  isActive: boolean;
}

interface SmsPacksResponse {
  success: boolean;
  sms_packs: SmsPack[];
}

export const useSmsPacks = () => {
  return useApiQuery<SmsPacksResponse>(
    ["sms-packs"],
    "/api/client/sms-packs-list",
    { staleTime: 30 * 60 * 1000 }
  );
};

export const useBuySms = () => {
  return useApiMutation("POST", "/api/client/buy-sms", [
    ["dashboard"],
  ]);
};