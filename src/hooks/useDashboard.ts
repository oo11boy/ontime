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
    id?: number;
    name: string;
    phone: string;
    job_title?: string;
    sms_balance: number;
    sms_used?: number;
    purchased_sms_credit: number;
    total_sms_balance: number;
    sms_monthly_quota: number;
    plan_title: string;
    plan_key: string;
    ended_at: string | null;
    quota_ends_at: string | null;
    trial_ends_at: string | null;
    price_per_100_sms: number;
    purchased_packages?: PurchasedPackage[] | null;
    has_used_free_trial?: boolean;
    role?: string;
    staff_id?: number;
    owner_id?: number;
    owner_name?: string;
    business_name?: string;
    calendar_type?: string;
    can_see_all_clients?: boolean;
    service_ids?: string | null;
  };
}

export const useDashboard = () => {
  return useApiQuery<DashboardData>(["dashboard"], "/api/client/dashboard", {
    staleTime: 2 * 60 * 1000,
  });
};
