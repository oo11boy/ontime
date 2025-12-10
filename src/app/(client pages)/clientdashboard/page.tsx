"use client";

import React, { useEffect, useState } from "react";
import ServiceControlPanel from "./components/ServiceControlPanel/ServiceControlPanel";
import RecentAppointmentsList from "./components/RecentAppointmentsList/RecentAppointmentsList";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import toast from "react-hot-toast";
import Loading from "./components/Loading";

interface PurchasedPackage {
  id: number;
  sms_amount: number;
  remaining_sms: number;
  valid_from: string;
  expires_at: string;
  amount_paid: number;
  created_at:string;
}

interface DashboardData {
  name: string;
  phone: string;
  job_title: string;
  sms_balance: number | null | undefined;
  purchased_sms_credit: number | null | undefined;
  purchased_packages?: PurchasedPackage[] | null;
  sms_monthly_quota: number;
  plan_title: string;
  plan_key: string;
  trial_ends_at: string | null | undefined;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const res = await fetch("/api/dashboard", { 
          method: "GET", 
          credentials: "include" 
        });

        if (res.ok) {
          const result = await res.json();
          setData(result.user as DashboardData);
        } else if (res.status === 401 || res.status === 403) {
          toast.error("جلسه شما منقضی شده. لطفاً دوباره وارد شوید.");
        } else {
          toast.error("خطا در بارگذاری اطلاعات داشبورد.");
        }
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("خطا در ارتباط با سرور.");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
         <Loading/>
    );
  }

  if (!data) return null;

  const purchasedSmsBalance = data.purchased_sms_credit ?? 0;
  const purchasedPackages = data.purchased_packages || [];
const planInitialSms = data.sms_monthly_quota ?? 0;  // مقدار اولیه پلن
const planSmsBalance = data.sms_balance ?? 0;        // باقیمانده پلن
  return (
    <div className="min-h-screen bg-[#1D222A] flex flex-col">
    
      <div className="sticky top-0 z-50 w-full bg-[#1E222B] shadow-lg">
        <div className="max-w-md mx-auto px-4 pt-4 pb-2">
          <Header />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-md mx-auto px-4 space-y-6">
          <ServiceControlPanel
            planSmsBalance={planSmsBalance}
            purchasedSmsBalance={purchasedSmsBalance}
            purchasedPackages={purchasedPackages}
            planTitle={data.plan_title}
            trialEndsAt={data.trial_ends_at}
            planInitialSms={planInitialSms}
          />
          <RecentAppointmentsList />
        </div>
      </div>

      {/* فوتر ثابت در پایین */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <div className="max-w-md mx-auto">
          <Footer />
        </div>
      </div>
    </div>
  );
}