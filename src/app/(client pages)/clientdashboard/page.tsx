"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "./components/Loading";
import Footer from "./components/Footer/Footer";

// Import all the new components
import { DashboardHeader } from "./components/DashboardHeader";
import { DashboardSmsStatus } from "./components/DashboardSmsStatus";
import { DashboardAddAppointmentButton } from "./components/DashboardAddAppointmentButton";
import { DashboardPlanStatus } from "./components/DashboardPlanStatus";
import { DashboardWelcomeModal } from "./components/DashboardWelcomeModal";
import { DashboardRecentAppointments } from "./components/DashboardRecentAppointments";

// Import React Query Hooks
import { useDashboard } from "@/hooks/useDashboard";
import { useRecentBookings } from "@/hooks/useBookings";

export default function DashboardPage() {
  const router = useRouter();

  // React Query Hooks
  const { data: dashboardData, isLoading, error, refetch } = useDashboard();
  const { data: recentBookingsData } = useRecentBookings();

  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // Check for welcome modal flag
  React.useEffect(() => {
    const shouldShow = sessionStorage.getItem("show_welcome_modal");
    if (shouldShow && dashboardData?.user) {
      setShowWelcomeModal(true);
      sessionStorage.removeItem("show_welcome_modal");
    }
  }, [dashboardData?.user]);

  const handleRefresh = () => {
    refetch();
  };

  const closeWelcomeModal = () => {
    setShowWelcomeModal(false);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error || !dashboardData?.user) {
    return (
      <div className="min-h-screen bg-[#1D222A] flex flex-col items-center justify-center">
        <p className="text-white text-lg">خطا در بارگذاری اطلاعات</p>
        <button
          onClick={handleRefresh}
          className="mt-4 px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  const userData = dashboardData.user;
  const purchasedPackages = userData.purchased_packages ?? [];
  const planInitialSms = userData.sms_monthly_quota ?? 0;
  const planSmsBalance = userData.sms_balance ?? 0;

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
                  planTitle={userData.plan_title}
                  trialEndsAt={userData.trial_ends_at}
                />
              </div>
            </div>

            {/* Recent Appointments */}
            <DashboardRecentAppointments
              onFetchAppointments={async () => {
                if (recentBookingsData?.success) {
                  return recentBookingsData.appointments ?? [];
                }
                return [];
              }}
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