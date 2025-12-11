"use client";

import React, { useEffect, useState } from "react";
import ServiceControlPanel from "./components/ServiceControlPanel/ServiceControlPanel";
import RecentAppointmentsList from "./components/RecentAppointmentsList/RecentAppointmentsList";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import toast from "react-hot-toast";
import Loading from "./components/Loading";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X } from "lucide-react";

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

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const res = await fetch("/api/client/dashboard", { 
          method: "GET", 
          credentials: "include" 
        });

        if (res.ok) {
          const result = await res.json();
          const userData = result.user as DashboardData;
          setData(userData);

          // بررسی فلگ مودال از sessionStorage
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
    }

    fetchDashboardData();
  }, []);

  const closeWelcomeModal = () => {
    setShowWelcomeModal(false);
  };

  if (loading) {
    return <Loading />;
  }

  if (!data) return null;

  const purchasedSmsBalance = data.purchased_sms_credit ?? 0;
  const purchasedPackages = data.purchased_packages || [];
  const planInitialSms = data.sms_monthly_quota ?? 0;
  const planSmsBalance = data.sms_balance ?? 0;

  return (
    <>
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

        <div className="fixed bottom-0 left-0 right-0 z-40">
          <div className="max-w-md mx-auto">
            <Footer />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showWelcomeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 max-w-md m-auto flex items-center justify-center p-4"
            onClick={closeWelcomeModal}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-linear-to-br from-[#1a1e26] to-[#242933] rounded-3xl shadow-2xl border border-emerald-500/30 max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative p-8 text-center">
                <button
                  onClick={closeWelcomeModal}
                  className="absolute top-4 left-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="mb-6">
                  <div className="w-20 h-20 mx-auto rounded-full bg-linear-to-r from-emerald-400 to-emerald-600 flex items-center justify-center shadow-xl">
                    <CheckCircle className="w-12 h-12 text-black" />
                  </div>
                </div>

                <h2 className="text-2xl text-white font-bold mb-4">خوش آمدید! 🎉</h2>
                
                <div className="space-y-4 text-lg leading-relaxed text-gray-200">
                  <p>
                    ثبت‌نام شما با موفقیت انجام شد.
                  </p>
                  <p className="text-emerald-400 font-bold text-xl">
                    شما ۳ ماه استفاده رایگان از تمام امکانات اپلیکیشن نوبت‌دهی دریافت کردید!
                  </p>
                  <p>
                    همچنین هر ماه <span className="text-emerald-400 font-bold">۱۵۰ پیامک رایگان</span> به مدت سه ماه برایتان فعال شد.
                  </p>
                </div>

                <button
                  onClick={closeWelcomeModal}
                  className="mt-8 w-full py-4 rounded-2xl bg-linear-to-r from-emerald-500 to-emerald-600 font-bold text-lg shadow-lg hover:shadow-emerald-500/50 transition-all active:scale-95"
                >
                  شروع استفاده از پنل
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}