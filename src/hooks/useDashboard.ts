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
    quota_ends_at: any;
    has_used_free_trial: boolean;
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