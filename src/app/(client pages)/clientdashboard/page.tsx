"use client";

import React, { useState, useEffect } from "react";
import Loading from "./components/Loading";
import Footer from "./components/Footer/Footer";

// Import Unified Components
import { DashboardHeader } from "./components/DashboardHeader";
import { DashboardAddAppointmentButton } from "./components/DashboardAddAppointmentButton";
import { DashboardStatusWidget } from "./components/DashboardStatusWidget"; // کامپوننت ادغام شده جدید
import { DashboardWelcomeModal } from "./components/DashboardWelcomeModal";
import { DashboardRecentAppointments } from "./components/DashboardRecentAppointments";
import DashboardQuickActions from "./components/DashboardQuickActions";

// Import Utils & Hooks
import { useDashboard } from "@/hooks/useDashboard";
import InstallPWA from "./components/InstallPWA";
import IosInstallPrompt from "./components/IosInstallPrompt";

export default function DashboardPage() {
  const { data: dashboardData, isLoading, error, refetch } = useDashboard();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // مدیریت نمایش مودال خوش‌آمدگویی
  useEffect(() => {
    const shouldShow = sessionStorage.getItem("show_welcome_modal");
    if (shouldShow && dashboardData?.user) {
      setShowWelcomeModal(true);
      sessionStorage.removeItem("show_welcome_modal");
    }
  }, [dashboardData?.user]);

  if (isLoading) return <Loading />;

  if (error || !dashboardData?.user) {
    return (
      <div className="min-h-screen bg-[#1D222A] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-500/10 p-4 rounded-full mb-4">
           <p className="text-red-400 font-bold">خطا در بارگذاری اطلاعات</p>
        </div>
        <button
          onClick={() => refetch()}
          className="px-8 py-3 bg-emerald-500 text-[#1D222A] font-bold rounded-2xl hover:bg-emerald-400 transition-all active:scale-95"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  const { user: userData } = dashboardData;

  return (
    <>
      <div className="min-h-screen bg-[#14181f] text-white flex flex-col font-sans">
        {/* هدر اپلیکیشن */}
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto pb-32 pt-4 px-4">
          <div className="max-w-md mx-auto space-y-6">
            
            {/* اعلان‌های نصب PWA */}
            <div className="space-y-2">
              <InstallPWA />
              <IosInstallPrompt />
            </div>

            {/* بخش وضعیت (ادغام شده و مدرن) */}
            <DashboardStatusWidget
              planTitle={userData.plan_title}
              endedAt={userData.ended_at}
              planInitialSms={userData.sms_monthly_quota ?? 0}
              planSmsBalance={userData.sms_balance ?? 0}
              purchasedPackages={userData.purchased_packages ?? []}
            />

            {/* دکمه اصلی فراخوان (CTA) */}
            <div className="px-2">
               <DashboardAddAppointmentButton />
            </div>

            {/* دسترسی سریع (Quick Actions) */}
            <DashboardQuickActions />

            {/* لیست نوبت‌های اخیر */}
            <div className="mt-8">
               <DashboardRecentAppointments />
            </div>
          </div>
        </main>

        {/* فوتر ثابت پایین صفحه (استایل موبایل اپلیکیشن) */}
          <div className="max-w-md mx-auto">
            <Footer />
          </div>
   
      </div>

      <DashboardWelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
      />
    </>
  );
}