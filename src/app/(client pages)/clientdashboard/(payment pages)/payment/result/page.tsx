"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, ArrowRight, ReceiptText } from "lucide-react";
import Link from "next/link";
import Footer from "../../../components/Footer/Footer";
import { DashboardHeader } from "../../../components/DashboardHeader";

export default function PaymentResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const status = searchParams.get("status");
  const trackId = searchParams.get("trackId");
  const isSuccess = status === "success";

  return (
    <div className="min-h-screen text-white max-w-md mx-auto relative">
     <DashboardHeader/>
      <div className=" bg-[#1a1e26] flex items-center justify-center p-4 ">
        <div className="max-w-md w-full bg-[#242933] rounded-3xl p-8 border border-white/5 shadow-2xl text-center">
          {isSuccess ? (
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-[#07A375] rounded-full flex items-center justify-center mb-6 animate-bounce">
                <CheckCircle className="text-white w-12 h-12" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                پرداخت با موفقیت انجام شد
              </h1>
              <p className="text-gray-400 text-sm mb-8">
                سرویس شما فعال شد و هم‌اکنون قابل استفاده است.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                <XCircle className="text-white w-12 h-12" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                پرداخت ناموفق بود
              </h1>
              <p className="text-gray-400 text-sm mb-8">
                اگر مبلغی از حساب شما کسر شده، ظرف ۷۲ ساعت آینده بازگشت داده
                خواهد شد.
              </p>
            </div>
          )}

          <div className="bg-[#1a1e26] rounded-2xl p-4 mb-8 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">شماره پیگیری:</span>
              <span className="text-gray-200 font-mono">
                {trackId || "---"}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">وضعیت تراکنش:</span>
              <span className={isSuccess ? "text-[#07A375]" : "text-red-500"}>
                {isSuccess ? "موفق" : "ناموفق / لغو شده"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <Link
              href="/clientdashboard"
              className="flex items-center justify-center gap-2 w-full bg-[#07A375]  text-white py-4 rounded-2xl font-bold transition-all"
            >
              ورود به میز کار
              <ArrowRight size={18} />
            </Link>

            {!isSuccess && (
              <button
                onClick={() => router.back()}
                className="text-gray-400 text-sm hover:text-white transition-colors py-2"
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
