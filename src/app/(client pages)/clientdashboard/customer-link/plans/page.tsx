// src/app/clientdashboard/customer-link/plans/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Crown, 
  Calendar,
  Check,
  Sparkles,
  Shield,
  Loader2,
  Lock,
  Clock,
  Users,
  Bell,
  TrendingUp,
  Rocket,
  Zap,
  ArrowLeft,
  ListTodo,
  XCircle,
  Edit2,
  AlertCircle
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { usePayment } from "@/hooks/usePayment";

export default function PlansPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { startPayment, isPending } = usePayment();
  
  const [hasLink, setHasLink] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [bookingFeatureStatus, setBookingFeatureStatus] = useState<{
    isEnabled: boolean;
    expiryDate: string | null;
    daysRemaining: number;
  }>({ isEnabled: false, expiryDate: null, daysRemaining: 0 });
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number }>({ days: 0, hours: 0, minutes: 0 });
  
  // ref برای جلوگیری از اجرای دوباره toast
  const toastShownRef = useRef(false);

  useEffect(() => {
    const fetchUserStatus = async () => {
      setLoading(true);
      try {
        const [linkRes, featureRes] = await Promise.all([
          fetch("/api/client/customer-link"),
          fetch("/api/client/customer-link/booking-feature-status")
        ]);
        
        const linkData = await linkRes.json();
        const featureData = await featureRes.json();
        
        if (linkData.success && linkData.hasLink) {
          setHasLink(true);
        }
        
        if (featureData.success) {
          setBookingFeatureStatus({
            isEnabled: featureData.isEnabled,
            expiryDate: featureData.expiryDate,
            daysRemaining: featureData.daysRemaining || 0
          });
        }
      } catch (error) {
        console.error("Error fetching user status:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserStatus();
  }, []);

  useEffect(() => {
    if (bookingFeatureStatus.isEnabled && bookingFeatureStatus.expiryDate) {
      const updateTimer = () => {
        const now = new Date().getTime();
        const expiry = new Date(bookingFeatureStatus.expiryDate!).getTime();
        const diff = expiry - now;
        
        if (diff <= 0) {
          setTimeLeft({ days: 0, hours: 0, minutes: 0 });
          return;
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        setTimeLeft({ days, hours, minutes });
      };
      
      updateTimer();
      const interval = setInterval(updateTimer, 60000);
      return () => clearInterval(interval);
    }
  }, [bookingFeatureStatus.isEnabled, bookingFeatureStatus.expiryDate]);

  // حل مشکل دوبار تودیس و پاک نشدن خودکار
  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    
    // فقط یکبار اجرا بشه و اگر قبلاً نشون داده شده تکرار نشه
    if (paymentStatus === "success" && !toastShownRef.current) {
      toastShownRef.current = true;
      
      // پاک کردن تودیس‌های قبلی قبل از نمایش جدید
      toast.dismiss();
      
      toast.success("🎉 تبریک! ثبت نوبت مشتریان فعال شد!", { 
        duration: 5000,
        id: "payment-success" // id یکتا برای جلوگیری از داپلیکیت
      });
      
      // پاک کردن پارامتر از URL بدون رفرش صفحه
      const url = new URL(window.location.href);
      url.searchParams.delete("payment");
      window.history.replaceState({}, "", url.toString());
      
      // رفرش کردن دیتا بعد از پرداخت موفق
      const refreshData = async () => {
        try {
          const featureRes = await fetch("/api/client/customer-link/booking-feature-status");
          const featureData = await featureRes.json();
          if (featureData.success) {
            setBookingFeatureStatus({
              isEnabled: featureData.isEnabled,
              expiryDate: featureData.expiryDate,
              daysRemaining: featureData.daysRemaining || 0
            });
          }
        } catch (error) {
          console.error("Error refreshing data:", error);
        }
      };
      
      refreshData();
      
    } else if (paymentStatus === "failed" && !toastShownRef.current) {
      toastShownRef.current = true;
      toast.dismiss();
      toast.error("پرداخت ناموفق بود. دوباره تلاش کن.", { 
        duration: 4000,
        id: "payment-failed"
      });
      
      // پاک کردن پارامتر از URL
      const url = new URL(window.location.href);
      url.searchParams.delete("payment");
      window.history.replaceState({}, "", url.toString());
    }
    
    // ریست ref وقتی کامپوننت unmount میشه
    return () => {
      toastShownRef.current = false;
    };
  }, [searchParams]);

  const handlePurchase = async () => {
    if (!hasLink) {
      toast.error("اول لینک اختصاصی بساز");
      router.push("/clientdashboard/customer-link");
      return;
    }
    
    await startPayment(258000, "plan", "pro_3months", "فعال‌سازی ثبت نوبت مشتریان");
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  const isBookingEnabled = bookingFeatureStatus.isEnabled;

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-5 pb-28">
      <Toaster 
        position="top-center" 
        toastOptions={{
          duration: 4000,
          style: {
            direction: "rtl",
          },
        }}
      />
      
      {/* دکمه بازگشت */}
      <button onClick={() => router.back()} className="flex items-center gap-1 text-gray-500 text-sm">
        <ArrowLeft className="w-4 h-4" /> بازگشت
      </button>

      {/* ========== وضعیت فعال ========== */}
      {isBookingEnabled && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-emerald-800">✅ ثبت نوبت فعال است</p>
              <p className="text-sm text-emerald-600">مشتریات آنلاین نوبت می‌گیرن</p>
            </div>
          </div>
          
          {/* تایمر */}
          <div className="mt-4 p-3 bg-white/60 rounded-xl text-center">
            <p className="text-xs text-emerald-600 mb-2">⏳ زمان باقیمانده از اشتراک</p>
            <div className="flex justify-center gap-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-700 bg-white px-3 py-1 rounded-lg min-w-[55px]">{timeLeft.days}</div>
                <p className="text-xs text-emerald-600 mt-1">روز باقی مانده</p>
              </div>
            </div>
          </div>
          
          {/* بخش تمدید اشتراک */}
          <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <p className="text-xs font-bold text-amber-700">تمدید اشتراک</p>
            </div>
            <p className="text-xs text-amber-600 mb-3">
              با تمدید اشتراک، تاریخ جدید از <span className="font-bold">امروز</span> محاسبه می‌شود و 
              {bookingFeatureStatus.expiryDate && (
                <span> ۳ ماه به تاریخ فعلی اضافه می‌گردد</span>
              )}
            </p>
            <button
              onClick={handlePurchase}
              disabled={isPending}
              className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition"
            >
              {isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> در حال اتصال...</>
              ) : (
                <><Rocket className="w-4 h-4" /> تمدید اشتراک (۲۵۸ هزار تومان)</>
              )}
            </button>
          </div>
          
          <div className="mt-4 flex gap-3">
            <button onClick={() => router.push("/clientdashboard/customer-link")} className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium">لینک من</button>
            <button onClick={() => router.push("/clientdashboard/customer-link/bookings")} className="flex-1 py-2 border-2 border-emerald-400 text-emerald-700 rounded-xl text-sm font-medium">مدیریت نوبت‌ها</button>
          </div>
        </div>
      )}

      {/* ========== هدر ========== */}
      {!isBookingEnabled && (
        <>
          <div className="text-center">
            <div className="inline-flex items-center gap-1 bg-emerald-100 px-3 py-1 rounded-full mb-2">
              <Rocket className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-700">حرفه‌ای شو!</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
              مشتریات <span className="text-emerald-600">آنلاین</span> نوبت بگیرن
            </h1>
            <p className="text-gray-500 text-sm mt-1">یک لینک بده به مشتریهات، بقیه با ما!</p>
          </div>

          {/* بنر کوتاه */}
          <div className="bg-amber-50 rounded-xl p-3 text-center">
            <p className="text-amber-700 text-sm flex items-center justify-center gap-1">
              <Zap className="w-4 h-4" />
              <span>کسب‌وکارهای دارای نوبت‌دهی آنلاین، <span className="font-bold">۳ برابر</span> مشتری بیشتر جذب می‌کنن</span>
            </p>
          </div>
        </>
      )}

      {/* ========== کارت اصلی پلن ========== */}
      {!isBookingEnabled && (
        <div className="relative bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl overflow-hidden border-2 border-emerald-300">
          <div className="p-5">
            {/* قیمت */}
            <div className="text-center mb-4">
              <div className="inline-flex items-baseline gap-1">
                <span className="text-4xl font-bold text-emerald-700">۲۵۸</span>
                <span className="text-gray-500">هزار تومان</span>
                <span className="text-4xl font-bold text-emerald-700">۳ ماهه</span>
              </div>
              <p className="text-sm text-emerald-600 font-bold mt-1">✨ فقط ۸۶ هزار تومان در ماه</p>
              <p className="text-xs text-gray-400 line-through">قبلاً ۳۲۴ هزار تومان</p>
            </div>

            {/* توضیح تمدید برای کسانی که قبلاً خرید داشتند */}
            {bookingFeatureStatus.expiryDate && (
              <div className="mb-3 p-2 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-[10px] text-amber-700 text-center flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" />
                  با خرید مجدد، تاریخ اشتراک از امروز محاسبه می‌شود
                </p>
              </div>
            )}

            {/* مزایا */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 p-2 bg-white/50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-sm">📅 ثبت نوبت آنلاین</p>
                  <p className="text-xs text-gray-500">مشتری می‌تونه نوبت ثبت کنه، فقط نوبت‌های بدون تداخل</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-white/50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <ListTodo className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-sm">📋 لیست نوبت‌ها</p>
                  <p className="text-xs text-gray-500">مشتری نوبت‌های گذشته و آینده‌ش رو می‌بینه</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-white/50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <Edit2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-sm">✏️ درخواست تغییر نوبت</p>
                  <p className="text-xs text-gray-500">مشتری می‌تونه درخواست تغییر زمان نوبت بده</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-white/50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <XCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-sm">❌ لغو نوبت با دلیل</p>
                  <p className="text-xs text-gray-500">مشتری می‌تونه نوبت رو با ذکر دلیل کنسل کنه</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-white/50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-sm">🚫 جلوگیری از تداخل</p>
                  <p className="text-xs text-gray-500">سیستم اجازه ثبت نوبت همزمان رو نمی‌ده</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-white/50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-sm">🔔 اعلان فوری</p>
                  <p className="text-xs text-gray-500">همون لحظه از نوبت جدید باخبر شو</p>
                </div>
              </div>
            </div>

            {/* جمع‌بندی سریع */}
            <div className="bg-white/50 rounded-xl p-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">هزینه روزانه:</span>
                <span className="font-bold text-emerald-700">فقط ۲,۸۶۰ تومان!</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>📱 کمتر از یه قهوه روزانه</span>
                <span>✨ سرمایه‌گذاری برای رشد</span>
              </div>
            </div>

            {/* دکمه خرید */}
            <button
              onClick={handlePurchase}
              disabled={isPending}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"
            >
              {isPending ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> در حال اتصال...</>
              ) : (
                <><Rocket className="w-5 h-5" /> {bookingFeatureStatus.expiryDate ? "تمدید اشتراک" : "همین الان شروع کن!"}</>
              )}
            </button>

            <p className="text-center text-xs text-gray-500 mt-3 flex items-center justify-center gap-2">
              <Shield className="w-3 h-3" /> پرداخت امن • ۷ روز گارانتی بازگشت وجه
            </p>
          </div>
        </div>
      )}

      {/* ========== توضیحات کامل قابلیت‌ها برای مشتری ========== */}
      {!isBookingEnabled && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-1 text-sm">
            <Users className="w-4 h-4 text-emerald-600" />
            مشتریات چه امکاناتی دارن؟
          </h3>
          <div className="space-y-3 text-sm">
            <div className="border-b border-gray-100 pb-2">
              <p className="font-medium text-gray-800 text-xs flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-500" /> مشاهده لیست نوبت‌ها
              </p>
              <p className="text-xs text-gray-500 mt-0.5 pr-5">مشتری می‌تونه لیست نوبت‌های گذشته و آینده‌ش رو در همان صفحه ببینه</p>
            </div>
            <div className="border-b border-gray-100 pb-2">
              <p className="font-medium text-gray-800 text-xs flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-500" /> ثبت نوبت جدید
              </p>
              <p className="text-xs text-gray-500 mt-0.5 pr-5">مشتری می‌تونه درخواست نوبت بده، سیستم تداخل با نوبت‌های دیگه رو چک می‌کنه</p>
            </div>
            <div className="border-b border-gray-100 pb-2">
              <p className="font-medium text-gray-800 text-xs flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-500" /> درخواست تغییر نوبت
              </p>
              <p className="text-xs text-gray-500 mt-0.5 pr-5">اگه مشتری نتونه بیاد، می‌تونه درخواست تغییر زمان بده</p>
            </div>
            <div>
              <p className="font-medium text-gray-800 text-xs flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-500" /> لغو نوبت با دلیل
              </p>
              <p className="text-xs text-gray-500 mt-0.5 pr-5">مشتری می‌تونه نوبتش رو با ذکر دلیل کنسل کنه</p>
            </div>
          </div>
        </div>
      )}

      {/* ========== چرا نیاز داری؟ ========== */}
      {!isBookingEnabled && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-1 text-sm">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            چرا نیاز داری؟
          </h3>
          <div className="space-y-2 text-sm">
            <p className="flex items-start gap-2 text-gray-600">⏰ <span>دیگه وقتت رو برای هماهنگی نوبت تلف نکن</span></p>
            <p className="flex items-start gap-2 text-gray-600">🌙 <span>مشتریات حتی ساعت ۳ صبح هم می‌تونن نوبت بگیرن</span></p>
            <p className="flex items-start gap-2 text-gray-600">📈 <span>تا ۴۰٪ افزایش پر شدن وقت‌های کاری</span></p>
            <p className="flex items-start gap-2 text-gray-600">🔄 <span>مدیریت خودکار تغییرات و لغو نوبت‌ها</span></p>
          </div>
        </div>
      )}

      {/* ========== نیاز به لینک ========== */}
      {!hasLink && !isBookingEnabled && (
        <div className="bg-amber-50 rounded-xl p-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">اول لینک بساز!</p>
              <p className="text-xs text-amber-600">کمتر از ۵ دقیقه</p>
            </div>
          </div>
          <button onClick={() => router.push("/clientdashboard/customer-link")} className="px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-medium">ساختن لینک</button>
        </div>
      )}

      {/* ========== سوالات متداول ========== */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-1 text-sm">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          سوالات سریع
        </h3>
        <div className="space-y-2 text-sm">
          <div>
            <p className="font-medium text-gray-700 text-xs">❓ مشتری چطور نوبت می‌گیره؟</p>
            <p className="text-xs text-gray-500">کافیه لینک رو بهش بدی، کلیک کنه و نوبتش رو رزرو کنه. سیستم خودش تداخل نوبت‌ها رو چک می‌کنه.</p>
          </div>
          <div>
            <p className="font-medium text-gray-700 text-xs">❓ مشتری چطور نوبتش رو عوض کنه؟</p>
            <p className="text-xs text-gray-500">مشتری می‌تونه از صفحه نوبت‌هاش، درخواست تغییر یا لغو بده و دلیلش رو بنویسه.</p>
          </div>
          <div>
            <p className="font-medium text-gray-700 text-xs">❓ بعد ۳ ماه چی؟</p>
            <p className="text-xs text-gray-500">می‌تونی تمدید کنی یا بمونه همون حالت رایگان (فقط صفحه اختصاصی).</p>
          </div>
        </div>
      </div>

      {/* اعتماد */}
      <p className="text-center text-xs text-gray-400 py-2">بیش از 1000 کسب‌وکار از آنتایم استفاده می‌کنن</p>
    </div>
  );
}