// hooks/usePlans.ts
import { useApiQuery, useApiMutation } from "./useApi";

interface Plan {
  id: number;
  plan_key: string;
  title: string;
  monthly_fee: number;
  free_sms_month: number;
  price_per_100_sms: number;
}

interface PlansResponse {
  success: boolean;
  plans: Plan[];
}

export const usePlans = () => {
  return useApiQuery<PlansResponse>(
    ["plans"],
    "/api/client/plans/list",
    { staleTime: 60 * 60 * 1000 }
  );
};

export const usePurchasePlan = () => {
  return useApiMutation("POST", "/api/client/plans/purchase", [
    ["dashboard"],
    ["plans"],
  ]);
};