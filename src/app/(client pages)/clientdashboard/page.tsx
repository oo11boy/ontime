// src/app/(client pages)/clientdashboard/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Loading from "./components/Loading";
import Footer from "./components/Footer/Footer";

// Import all the new components
import { DashboardHeader } from "./components/DashboardHeader";
import { DashboardSmsStatus } from "./components/DashboardSmsStatus";
import { DashboardAddAppointmentButton } from "./components/DashboardAddAppointmentButton";
import { DashboardPlanStatus } from "./components/DashboardPlanStatus";
import { DashboardWelcomeModal } from "./components/DashboardWelcomeModal";
import { DashboardRecentAppointments } from "./components/DashboardRecentAppointments";

interface PurchasedPackage {
  id: number;
  sms_amount: number;
  remaining_sms: number;
  valid_from: string;
  expires_at: string;
  amount_paid: number;
  created_at: string;
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
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/client/dashboard", { 
        method: "GET", 
        credentials: "include" 
      });

      if (res.ok) {
        const result = await res.json();
        const userData = result.user as DashboardData;
        setData(userData);

        // Check for welcome modal flag
        const shouldShow = sessionStorage.getItem("show_welcome_modal");
        if (shouldShow) {
          setShowWelcomeModal(true);
          sessionStorage.removeItem("show_welcome_modal");
        }

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
  };

  // Fetch recent appointments
  const fetchRecentAppointments = async () => {
    try {
      const response = await fetch("/api/client/bookings/recent");
      const data = await response.json();
      
      if (data.success) {
        return data.appointments;
      } else {
        throw new Error(data.message || "خطا در دریافت نوبت‌ها");
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const closeWelcomeModal = () => {
    setShowWelcomeModal(false);
  };

  if (loading) {
    return <Loading />;
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#1D222A] flex flex-col items-center justify-center">
        <p className="text-white text-lg">خطا در بارگذاری اطلاعات</p>
        <button 
          onClick={fetchDashboardData}
          className="mt-4 px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  const purchasedSmsBalance = data.purchased_sms_credit ?? 0;
  const purchasedPackages = data.purchased_packages || [];
  const planInitialSms = data.sms_monthly_quota ?? 0;
  const planSmsBalance = data.sms_balance ?? 0;

  return (
    <>
      <div className="min-h-screen bg-[#1D222A] flex flex-col">
        <DashboardHeader />

        <div className="flex-1 overflow-y-auto pb-24">
          <div className="max-w-md mx-auto px-4 space-y-6">
            {/* Service Control Panel */}
            <div className="w-[95%] m-auto shadow-2xl flex flex-col items-center">
              <div className="bg-[#1B1F28] rounded-xl p-6 flex flex-col gap-6 justify-start items-center shadow-sm w-full mx-auto">
                <DashboardSmsStatus
                  planInitialSms={planInitialSms}
                  planSmsBalance={planSmsBalance}
                  purchasedPackages={purchasedPackages}
                />
              
                <DashboardAddAppointmentButton />
                
                <DashboardPlanStatus 
                  planTitle={data.plan_title}
                  trialEndsAt={data.trial_ends_at}
                />
              </div>
            </div>

            {/* Recent Appointments */}
            <DashboardRecentAppointments
              onFetchAppointments={fetchRecentAppointments}
            />
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-40">
          <div className="max-w-md mx-auto">
            <Footer />
          </div>
        </div>
      </div>

      <DashboardWelcomeModal
        isOpen={showWelcomeModal}
        onClose={closeWelcomeModal}
      />
    </>
  );
}