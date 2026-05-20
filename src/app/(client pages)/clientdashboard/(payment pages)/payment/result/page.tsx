// src/app/clientdashboard/payment/result/page.tsx
"use client";

import { CheckCircle, XCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardHeader } from "../../../components/DashboardHeader";
import Footer from "../../../components/Footer/Footer";

export default function PaymentResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const status = searchParams.get("status");
  const trackId = searchParams.get("trackId");
  const isSuccess = status === "success";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#1a1e26] text-slate-800 dark:text-white max-w-md mx-auto relative transition-colors">
      <DashboardHeader />
      <div className="flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-[#242933] rounded-3xl p-8 border border-slate-200 dark:border-white/5 shadow-lg dark:shadow-2xl text-center">
          {isSuccess ? (
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <CheckCircle className="text-emerald-600 dark:text-white w-12 h-12" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                پرداخت با موفقیت انجام شد
              </h1>
              <p className="text-slate-500 dark:text-gray-400 text-sm mb-8">
                سرویس شما فعال شد و هم‌اکنون قابل استفاده است.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                <XCircle className="text-red-600 dark:text-red-500 w-12 h-12" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                پرداخت ناموفق بود
              </h1>
              <p className="text-slate-500 dark:text-gray-400 text-sm mb-8">
                اگر مبلغی از حساب شما کسر شده، ظرف ۷۲ ساعت آینده بازگشت داده خواهد شد.
              </p>
            </div>
          )}

          <div className="bg-slate-100 dark:bg-[#1a1e26] rounded-2xl p-4 mb-8 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 dark:text-gray-500">شماره پیگیری:</span>
              <span className="text-slate-700 dark:text-gray-200 font-mono">
                {trackId || "---"}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 dark:text-gray-500">وضعیت تراکنش:</span>
              <span className={isSuccess ? "text-emerald-600 dark:text-emerald-500" : "text-red-600 dark:text-red-500"}>
                {isSuccess ? "موفق" : "ناموفق / لغو شده"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <Link
              href="/clientdashboard"
              className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white py-4 rounded-2xl font-bold transition-all"
            >
              ورود به میز کار
              <ArrowRight size={18} />
            </Link>

            {!isSuccess && (
              <button
                onClick={() => router.back()}
                className="text-slate-500 dark:text-gray-400 text-sm hover:text-slate-700 dark:hover:text-white transition-colors py-2"
              >
                تلاش مجدد
              </button>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}