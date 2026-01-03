"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  User,
  Scissors,
  ChevronRight,
  X,
  RefreshCw,
  Copy,
  Share2,
  MapPin,
  Building2,
  Info,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { formatPersianDate, isTimeInPast } from "@/lib/date-utils";
import RescheduleModal from "./components/RescheduleModal";

interface BookingData {
  id: number;
  clientName: string;
  clientPhone: string;
  date: string;
  time: string;
  duration: number;
  description: string;
  services: string[];
  status: string;
  changeCount: number;
  token: string;
  expiresAt: string;
  createdAt: string;
  businessName: string;
  businessPhone: string;
  businessAddress?: string;
  canCancel: boolean;
  canReschedule: boolean;
  offDays: number[]; // اضافه شده برای هماهنگی با تنظیمات پنل
}

export default function CustomerBookingPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    fetchBooking();
    if (typeof window !== "undefined") {
      setShareUrl(`${window.location.origin}/customer/booking/${token}`);
    }
  }, [token]);

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/customer-booking?token=${token}`);
      const data = await response.json();

      if (data.success) {
        setBooking(data.booking);
      } else {
        toast.error(data.message || "نوبت یافت نشد");
        setTimeout(() => {
          router.push("/");
        }, 3000);
      }
    } catch (error) {
      toast.error("خطا در دریافت اطلاعات نوبت");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking || !booking.canCancel) return;

    if (!confirm("آیا مطمئن هستید که می‌خواهید این نوبت را لغو کنید؟")) return;

    setIsCancelling(true);
    try {
      const response = await fetch("/api/customer-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, action: "cancel" }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("نوبت شما با موفقیت لغو شد");
        fetchBooking();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("خطا در لغو نوبت");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReschedule = async (newDate: string, newTime: string) => {
    try {
      const response = await fetch("/api/customer-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          action: "reschedule",
          data: { newDate, newTime },
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("زمان نوبت با موفقیت تغییر یافت");
        setShowRescheduleModal(false);
        fetchBooking();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("خطا در تغییر زمان نوبت");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => toast.success("لینک کپی شد!"))
      .catch(() => toast.error("خطا در کپی لینک"));
  };

  const shareBooking = () => {
    if (navigator.share) {
      navigator.share({
        title: `نوبت ${booking?.clientName}`,
        text: `نوبت در ${booking?.businessName}`,
        url: shareUrl,
      });
    } else {
      copyToClipboard();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1115] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="mt-6 text-gray-400 font-medium animate-pulse text-lg">
          در حال دریافت اطلاعات نوبت...
        </p>
      </div>
    );
  }

  if (!booking) return null;

  const isPast = isTimeInPast(booking.date, booking.time);
  const persianDate = formatPersianDate(booking.date);

  return (
    <div
      className="min-h-screen bg-[#0f1115] text-white selection:bg-emerald-500/30 pb-10"
      dir="rtl"
    >
      <Toaster position="top-center" reverseOrder={false} />

      {/* Header Profile Section */}
      <div className="relative h-48 bg-gradient-to-b from-emerald-600/20 to-transparent">
        <div className="max-w-md mx-auto px-4 pt-6 flex justify-between items-center">
          <button
            onClick={() => router.push("/")}
            className="w-10 h-10 flex items-center justify-center bg-white/10 backdrop-blur-md rounded-xl border border-white/10 transition-transform active:scale-90"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold opacity-80 text-white">
            جزئیات رزرو نوبت
          </h1>
          <div className="w-10"></div>
        </div>

        {/* Business Card */}
        <div className="absolute -bottom-10 left-0 right-0 px-4">
          <div className="max-w-md mx-auto bg-[#1a1d24] border border-white/10 rounded-3xl p-5 shadow-2xl flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">
                {booking.businessName || "نام کسب‌وکار"}
              </h2>
              <div className="flex items-center gap-1 text-gray-400 text-sm mt-1">
                <MapPin className="w-3.5 h-3.5" />
                <span className="truncate max-w-[200px]">
                  {booking.businessAddress || "آدرس ثبت نشده"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-md mx-auto px-4 mt-16 space-y-5">
        {/* Status Badge */}
        <div className="flex flex-col gap-4">
          <div
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border backdrop-blur-sm ${
              booking.status === "active" && !isPast
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : booking.status === "cancelled"
                ? "bg-red-500/10 border-red-500/20 text-red-400"
                : "bg-gray-500/10 border-gray-500/20 text-gray-400"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                booking.status === "active" && !isPast
                  ? "bg-emerald-500 animate-pulse"
                  : "bg-current"
              }`}
            />
            <span className="text-sm font-bold">
              {booking.status === "active" &&
                !isPast &&
                "نوبت فعال و تایید شده"}
              {booking.status === "active" && isPast && "نوبت منقضی شده"}
              {booking.status === "cancelled" && "این نوبت لغو شده است"}
              {booking.status === "done" && "با موفقیت انجام شد"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={shareBooking}
              className="flex items-center justify-center gap-2 h-14 bg-[#1a1d24] border border-white/5 rounded-2xl hover:bg-white/5 transition-all active:scale-95 group"
            >
              <Share2 className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-bold">اشتراک‌گذاری</span>
            </button>
            <button
              onClick={copyToClipboard}
              className="flex items-center justify-center gap-2 h-14 bg-[#1a1d24] border border-white/5 rounded-2xl hover:bg-white/5 transition-all active:scale-95 group"
            >
              <Copy className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-bold">کپی لینک نوبت</span>
            </button>
          </div>
        </div>

        {/* DateTime Card */}
        <section className="bg-[#1a1d24] rounded-[2.5rem] p-6 border border-white/5 relative overflow-hidden">
          <h3 className="text-gray-500 text-sm font-bold mb-6 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> زمان‌بندی مراجعه
          </h3>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 bg-white/[0.03] rounded-3xl p-4 text-center border border-white/5">
              <p className="text-gray-400 text-xs mb-1">تاریخ</p>
              <p className="text-lg font-black text-emerald-400 leading-tight">
                {persianDate}
              </p>
            </div>
            <div className="flex-1 bg-white/[0.03] rounded-3xl p-4 text-center border border-white/5">
              <p className="text-gray-400 text-xs mb-1">ساعت حضور</p>
              <p className="text-lg font-black text-emerald-400 leading-tight">
                {booking.time}
              </p>
            </div>
          </div>
          <div className="mt-4 py-3 px-5 bg-emerald-500/5 rounded-2xl flex items-center justify-between border border-emerald-500/10">
            <span className="text-sm text-gray-400">مدت زمان تخمینی</span>
            <span className="font-bold text-sm text-white">
              {booking.duration} دقیقه
            </span>
          </div>
        </section>

        {/* Services */}
        <section className="bg-[#1a1d24] rounded-[2.5rem] p-6 border border-white/5">
          <h3 className="text-gray-500 text-sm font-bold mb-6 flex items-center gap-2">
            <Scissors className="w-4 h-4" /> جزئیات خدمات
          </h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {booking.services.length > 0 ? (
              booking.services.map((service, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-xl text-xs font-bold"
                >
                  {service}
                </span>
              ))
            ) : (
              <span className="text-gray-500 text-sm italic">
                خدمات خاصی ذکر نشده
              </span>
            )}
          </div>
          {booking.description && (
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
              <p className="text-gray-400 text-sm leading-relaxed text-justify italic font-light">
                {booking.description}
              </p>
            </div>
          )}
        </section>

        {/* Client Details */}
        <section className="bg-[#1a1d24] rounded-[2.5rem] p-6 border border-white/5">
          <h3 className="text-gray-500 text-sm font-bold mb-6 flex items-center gap-2">
            <User className="w-4 h-4" /> اطلاعات مشتری
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">نام رزرو کننده:</span>
              <span className="font-bold text-white">{booking.clientName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">شماره همراه:</span>
              <span className="font-bold tracking-widest text-white" dir="ltr">
                {booking.clientPhone}
              </span>
            </div>
          </div>
        </section>

        {/* Expiry Warning */}
        <div className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-[2rem] flex gap-4 items-start">
          <Info className="w-5 h-5 text-amber-500 shrink-0 mt-1" />
          <div>
            <p className="text-amber-500 text-sm font-bold mb-1">انقضای لینک</p>
            <p className="text-gray-400 text-xs leading-relaxed">
              این لینک به دلایل امنیتی تا تاریخ{" "}
              <span className="font-bold text-amber-200/80">
                {new Date(booking.expiresAt).toLocaleDateString("fa-IR")}
              </span>{" "}
              معتبر است.
            </p>
          </div>
        </div>

        {/* Action Buttons (Sticky at bottom) */}
        {booking.status === "active" && !isPast && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0f1115] via-[#0f1115]/95 to-transparent backdrop-blur-sm z-50">
            <div className="max-w-md mx-auto flex flex-col gap-3">
              {booking.canReschedule && (
                <button
                  onClick={() => setShowRescheduleModal(true)}
                  className="w-full h-16 bg-white text-black rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-transform"
                >
                  <RefreshCw className="w-5 h-5" />
                  تغییر زمان حضور
                  <span className="text-[10px] bg-black/10 px-2 py-0.5 rounded-full">
                    {1 - booking.changeCount} فرصت باقی‌مانده
                  </span>
                </button>
              )}

              {booking.canCancel && (
                <button
                  onClick={handleCancelBooking}
                  disabled={isCancelling}
                  className="w-full h-14 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                  {isCancelling ? "در حال لغو..." : "لغو این نوبت"}
                </button>
              )}
            </div>
          </div>
        )}

        <div className="h-32" />
      </main>

      {/* Modal Integration */}
      {showRescheduleModal && booking && (
        <RescheduleModal
          currentDate={booking.date}
          currentTime={booking.time}
          customerToken={booking.token}
       offDays={booking.offDays} // ارسال روزهای تعطیل به مدال تقویم
          onClose={() => setShowRescheduleModal(false)}
          onConfirm={handleReschedule}
        />
      )}
    </div>
  );
}
