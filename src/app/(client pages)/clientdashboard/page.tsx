"use client";

import React, { useState, useEffect } from "react";
import Loading from "./components/Loading";
import Footer from "./components/Footer/Footer";

import { DashboardHeader } from "./components/DashboardHeader";
import { DashboardAddAppointmentButton } from "./components/DashboardAddAppointmentButton";
import { DashboardStatusWidget } from "./components/DashboardStatusWidget";
import { DashboardWelcomeModal } from "./components/DashboardWelcomeModal";
import { DashboardRecentAppointments } from "./components/DashboardRecentAppointments";
import DashboardQuickActions from "./components/DashboardQuickActions";

import { useDashboard } from "@/hooks/useDashboard";
import InstallPWA from "./components/InstallPWA";
import IosInstallPrompt from "./components/IosInstallPrompt";
import { useUserType } from "@/hooks/useUserType";
import AnnouncementBanner from "./components/AnnouncementBanner";
import DownloadAppBanner from "./components/DownloadAppBanner";
import VideoTrainings from "./components/VideoTrainings";
import { CustomerLinkWidget } from "./components/CustomerLinkWidget";
import { NotificationChannel } from "./components/NotificationChannel";

export default function DashboardPage() {
  const { data: dashboardData, isLoading, error, refetch } = useDashboard();
  const { userType } = useUserType();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  // جلوگیری از hydration mismatch برای تم
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const shouldShow = sessionStorage.getItem("show_welcome_modal");
    if (shouldShow && dashboardData?.user) {
      setShowWelcomeModal(true);
      sessionStorage.removeItem("show_welcome_modal");
    }
  }, [dashboardData?.user]);

  if (!mounted) {
    return null; // یا یک placeholder ساده
  }

  if (isLoading) return <Loading />;

  if (error || !dashboardData?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#14181f] dark:to-[#0f1218] flex flex-col items-center justify-center p-6 text-center transition-colors duration-300">
        <div className="bg-rose-50 dark:bg-red-500/10 p-4 rounded-full mb-4">
          <p className="text-rose-600 dark:text-red-400 font-bold">
            خطا در بارگذاری اطلاعات
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-[#1D222A] font-bold rounded-2xl transition-all active:scale-95"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  const { user: userData } = dashboardData;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#14181f] dark:to-[#0f1218] text-slate-800 dark:text-white flex flex-col font-sans transition-colors duration-300">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto pb-32 pt-4 px-4">
          <div className="max-w-md mx-auto space-y-6">
        <NotificationChannel/>
            <DownloadAppBanner />

            <div className="space-y-2">
              <InstallPWA />
              <IosInstallPrompt />
            </div>

            <DashboardStatusWidget
              userType={userType}
              planTitle={userData.plan_title}
              endedAt={userData.ended_at}
              planInitialSms={userData.sms_monthly_quota ?? 0}
              planSmsBalance={userData.sms_balance ?? 0}
              purchasedPackages={userData.purchased_packages ?? []}
            />

            <div>
              <DashboardAddAppointmentButton />
            </div>
            <CustomerLinkWidget />
            <DashboardQuickActions userType={userType} />

            <div className="mt-8">
              <VideoTrainings />
            </div>
            <div className="mt-8">
              <DashboardRecentAppointments />
            </div>
          </div>
        </main>

        <div className="max-w-md mx-auto">
          <Footer userType={userType} />
        </div>
      </div>

      <DashboardWelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
      />
    </>
  );
}
