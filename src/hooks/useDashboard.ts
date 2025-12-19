// hooks/useDashboard.ts
import { useApiQuery } from "./useApi";

export interface PurchasedPackage {
  id: number;
  sms_amount: number;
  remaining_sms: number;
  valid_from: string;
  expires_at: string;
  amount_paid: number;
  created_at: string;
}

interface DashboardData {
  user: {
    name: string;
    phone: string;
    job_title: string;
    sms_balance: number;
    purchased_sms_credit: number;
    total_sms_balance: number;
    sms_monthly_quota: number;
    plan_title: string;
    plan_key: string;
    trial_ends_at: string | null;
    price_per_100_sms: number;
    purchased_packages?: PurchasedPackage[] | null; // ← اضافه شد
  };
}

export const useDashboard = () => {
  return useApiQuery<DashboardData>(["dashboard"], "/api/client/dashboard", {
    staleTime: 2 * 60 * 1000,
  });
};

export const useSmsBalance = () => {
  const { data } = useDashboard();

  const balance = data?.user
    ? data.user.total_sms_balance ||
      (data.user.sms_balance || 0) + (data.user.purchased_sms_credit || 0)
    : 0;

  return { balance, isLoading: !data };
};