"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Scissors,
  AlertCircle,
  ChevronLeft,
  X,
  RefreshCw,
  CheckCircle,
  Copy,
  Share2
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
  canCancel: boolean;
  canReschedule: boolean;
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
    setShareUrl(`${window.location.origin}/customer/booking/${token}`);
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
      console.error("Fetch booking error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking || !booking.canCancel) return;
    
    if (!confirm("آیا مطمئن هستید که می‌خواهید این نوبت را لغو کنید؟")) {
      return;
    }
    
    setIsCancelling(true);
    try {
      const response = await fetch("/api/customer-booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          action: "cancel"
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success("نوبت شما با موفقیت لغو شد");
        fetchBooking(); // بروزرسانی اطلاعات
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("خطا در لغو نوبت");
      console.error("Cancel booking error:", error);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReschedule = async (newDate: string, newTime: string) => {
    try {
      const response = await fetch("/api/customer-booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          action: "reschedule",
          data: { newDate, newTime }
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
      console.error("Reschedule error:", error);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl)
      .then(() => toast.success("لینک کپی شد!"))
      .catch(() => toast.error("خطا در کپی لینک"));
  };

  const shareBooking = () => {
    if (navigator.share) {
      navigator.share({
        title: `نوبت ${booking?.clientName}`,
        text: `اطلاعات نوبت ${booking?.clientName}`,
        url: shareUrl,
      });
    } else {
      copyToClipboard();
    }
  };
useEffect(() => {
  if (booking) {
    console.log("تاریخ میلادی دریافت‌شده از سرور:", booking.date);
    console.log("تاریخ شمسی با formatPersianDate:", formatPersianDate(booking.date));
    
    // تست مستقیم با moment-jalaali
    const m = require('moment-jalaali');
    const test = m(booking.date + ' 12:00', 'YYYY-MM-DD HH:mm');
    console.log("تست دستی jYear/jMonth/jDate:", test.jYear(), test.jMonth(), test.jDate());
  }
}, [booking]);
  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#1a1e26] to-[#242933] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p>در حال دریافت اطلاعات نوبت...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  const isPast = isTimeInPast(booking.date, booking.time);
  const persianDate = formatPersianDate(booking.date);

  return (
    <div className="min-h-screen bg-[#1a1e26] text-white selection:bg-emerald-500/30 flex flex-col">
   <Toaster position="top-center" />
       <div className="max-w-md mx-auto px-4 py-8">
      <header className="p-4 border-b border-white/10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="بازگشت"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">جزئیات نوبت</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        {/* وضعیت نوبت */}
        <div className={`p-4 rounded-xl mb-6 ${
          booking.status === 'active' && !isPast
            ? 'bg-emerald-500/10 border border-emerald-500/30' 
            : booking.status === 'cancelled'
            ? 'bg-red-500/10 border border-red-500/30'
            : booking.status === 'done' || isPast
            ? 'bg-blue-500/10 border border-blue-500/30'
            : 'bg-gray-500/10 border border-gray-500/30'
        }`}>
          <div className="flex items-center gap-3">
            {booking.status === 'active' && !isPast ? (
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            ) : booking.status === 'cancelled' ? (
              <X className="w-6 h-6 text-red-400" />
            ) : (
              <Clock className="w-6 h-6 text-blue-400" />
            )}
            <div>
              <p className="font-bold">
                {booking.status === 'active' && !isPast && 'نوبت فعال'}
                {booking.status === 'active' && isPast && 'نوبت گذشته'}
                {booking.status === 'cancelled' && 'نوبت لغو شده'}
                {booking.status === 'done' && 'نوبت انجام شده'}
              </p>
              <p className="text-sm text-gray-300">
                {booking.status === 'active' && !isPast && 'منتظر حضور شما هستیم'}
                {booking.status === 'active' && isPast && 'زمان این نوبت گذشته است'}
                {booking.status === 'cancelled' && 'این نوبت لغو شده است'}
                {booking.status === 'done' && 'این نوبت با موفقیت انجام شده'}
              </p>
            </div>
          </div>
        </div>

        {/* دکمه‌های اشتراک‌گذاری */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={copyToClipboard}
            className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Copy className="w-5 h-5" />
            کپی لینک
          </button>
          <button
            onClick={shareBooking}
            className="flex-1 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            اشتراک‌گذاری
          </button>
        </div>

        {/* اطلاعات نوبت */}
        <div className="space-y-4 mb-8">
          <div className="bg-white/5 rounded-xl p-4">
            <h2 className="font-bold mb-4 text-lg">اطلاعات نوبت</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="flex-1">تاریخ:</span>
                <span className="font-bold">{persianDate}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <span className="flex-1">ساعت:</span>
                <span className="font-bold">{booking.time}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <span className="flex-1">مدت زمان:</span>
                <span className="font-bold">{booking.duration} دقیقه</span>
              </div>
              
              {booking.services.length > 0 && (
                <div className="flex items-start gap-3">
                  <Scissors className="w-5 h-5 text-gray-400 mt-1" />
                  <span className="flex-1">خدمات:</span>
                  <div className="text-right">
                    {booking.services.map((service, idx) => (
                      <div key={idx} className="font-bold">{service}</div>
                    ))}
                  </div>
                </div>
              )}
              
              {booking.description && (
                <div className="pt-3 border-t border-white/10">
                  <p className="text-gray-300 text-sm">{booking.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* اطلاعات مشتری */}
          <div className="bg-white/5 rounded-xl p-4">
            <h2 className="font-bold mb-4 text-lg">اطلاعات شما</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <span className="flex-1">نام:</span>
                <span className="font-bold">{booking.clientName}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="flex-1">شماره تلفن:</span>
                <span className="font-bold">{booking.clientPhone}</span>
              </div>
            </div>
          </div>

          {/* اطلاعات کسب‌وکار */}
          <div className="bg-white/5 rounded-xl p-4">
            <h2 className="font-bold mb-4 text-lg">اطلاعات کسب‌وکار</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <span className="flex-1">نام کسب‌وکار:</span>
                <span className="font-bold">{booking.businessName}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="flex-1">تلفن تماس:</span>
                <span className="font-bold">{booking.businessPhone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* دکمه‌های اقدام */}
        {booking.status === 'active' && !isPast && (
          <div className="space-y-3 sticky bottom-4">
            {booking.canReschedule && (
              <button
                onClick={() => setShowRescheduleModal(true)}
                className="w-full py-4 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-colors"
              >
                <RefreshCw className="w-6 h-6" />
                تغییر زمان نوبت
                <span className="text-sm bg-blue-500/30 px-2 py-1 rounded">
                  {1 - booking.changeCount} تغییر باقیمانده
                </span>
              </button>
            )}
            
            {booking.canCancel && (
              <button
                onClick={handleCancelBooking}
                disabled={isCancelling}
                className="w-full py-4 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
              >
                <X className="w-6 h-6" />
                {isCancelling ? "در حال لغو..." : "لغو نوبت"}
              </button>
            )}
          </div>
        )}

        {/* هشدار انقضا */}
        <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold text-yellow-300">توجه:</p>
              <p className="text-gray-300 mt-1">
                این لینک تا {new Date(booking.expiresAt).toLocaleDateString('fa-IR')} معتبر است.
                برای مشاهده مجدد نوبت، این صفحه را ذخیره کنید.
              </p>
            </div>
          </div>
        </div>
      </main>
</div> 
      {/* مودال تغییر زمان */}
      {showRescheduleModal && booking && (
        <RescheduleModal
          currentDate={booking.date}
          currentTime={booking.time}
          customerToken={booking.token}  // ← اضافه کن
          onClose={() => setShowRescheduleModal(false)}
          onConfirm={handleReschedule}
        />
      )}
    </div>
  );
}