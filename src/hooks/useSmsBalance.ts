// src/hooks/useSmsBalance.ts
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
    sms_balance: number; // اعتبار طرح اصلی
    purchased_sms_credit: number; // مجموع خریدهای اعتباری
    total_sms_balance: number; // کل موجودی
    sms_monthly_quota: number;
    plan_title: string;
    plan_key: string;
    trial_ends_at: string | null;
    price_per_100_sms: number;
    purchased_packages?: PurchasedPackage[] | null;
  };
}

export const useSmsBalance = () => {
  const { data, isLoading, error } = useApiQuery<DashboardData>(
    ["dashboard"],
    "/api/client/dashboard",
    {
      staleTime: 2 * 60 * 1000, // 2 دقیقه
    }
  );

  // محاسبه مجموع پیامک‌های باقی‌مانده از بسته‌های خریداری شده
  const remainingFromPackages = data?.user?.purchased_packages?.reduce(
    (sum, pkg) => sum + (pkg.remaining_sms || 0),
    0
  ) || 0;

  // اعتبار طرح اصلی
  const planBalance = data?.user?.sms_balance || 0;

  // جمع کل: اعتبار طرح اصلی + مجموع باقی‌مانده بسته‌ها
  const totalBalance = planBalance + remainingFromPackages;

  console.log("🧮 محاسبه موجودی:", {
    planBalance,
    remainingFromPackages,
    totalBalance,
    purchasedPackages: data?.user?.purchased_packages
  });

  return {
    balance: totalBalance,
    planBalance,
    remainingFromPackages,
    isLoading,
    error,
    purchasedPackages: data?.user?.purchased_packages || []
  };
};