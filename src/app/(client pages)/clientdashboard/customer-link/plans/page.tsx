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
  AlertCircle,
  Star,
  Gift,
  Flame,
  Award
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { usePayment } from "@/hooks/usePayment";

export default function PlansPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { startPayment, isPending } = usePayment();
  
  const [hasLink, setHasLink] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  // تغییر پیش‌فرض به "quarterly" (سه‌ماهه)
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "quarterly">("quarterly");
  const [bookingFeatureStatus, setBookingFeatureStatus] = useState<{
    isEnabled: boolean;
    expiryDate: string | null;
    daysRemaining: number;
  }>({ isEnabled: false, expiryDate: null, daysRemaining: 0 });
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number }>({ days: 0, hours: 0, minutes: 0 });
  
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

  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    
    if (paymentStatus === "success" && !toastShownRef.current) {
      toastShownRef.current = true;
      toast.dismiss();
      toast.success("🎉 تبریک! ثبت نوبت مشتریان فعال شد!", { 
        duration: 2000,
        id: "payment-success"
      });
      
      const url = new URL(window.location.href);
      url.searchParams.delete("payment");
      window.history.replaceState({}, "", url.toString());
      
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
      
      const url = new URL(window.location.href);
      url.searchParams.delete("payment");
      window.history.replaceState({}, "", url.toString());
    }
    
    return () => {
      toastShownRef.current = false;
    };
  }, [searchParams]);

const handlePurchase = async (plan: "monthly" | "quarterly") => {
  if (!hasLink) {
    toast.error("اول لینک اختصاصی بساز");
    router.push("/clientdashboard/customer-link");
    return;
  }
  
  const amount = plan === "monthly" ? 87000 : 258000;
  const itemId = plan === "monthly" ? "pro_monthly" : "pro_3months";
  const description = plan === "monthly" 
    ? "فعال‌سازی ثبت نوبت مشتریان - ۱ ماهه" 
    : "فعال‌سازی ثبت نوبت مشتریان - ۳ ماهه";
  
  await startPayment(amount, "plan", itemId, description);
};



  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  const isBookingEnabled = bookingFeatureStatus.isEnabled;

  // محاسبه تخفیف ۳ ماهه
  const monthlyPrice = 87000;
  const quarterlyPrice = 258000;
  const saveAmount = (monthlyPrice * 3) - quarterlyPrice;
  const savePercent = Math.round((saveAmount / (monthlyPrice * 3)) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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
        <button onClick={() => router.back()} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition text-sm">
          <ArrowLeft className="w-4 h-4" /> بازگشت
        </button>

        {/* ========== وضعیت فعال (اگر قبلاً خریده) ========== */}
        {isBookingEnabled && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5 border-2 border-emerald-300 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                <Crown className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-emerald-800 text-lg">✅ ثبت نوبت فعال است</p>
                <p className="text-sm text-emerald-600">مشتریان شما آنلاین نوبت می‌گیرند</p>
              </div>
            </div>
            
            {/* تایمر باقیمانده */}
            <div className="mt-4 p-4 bg-white/70 rounded-xl text-center">
              <p className="text-xs text-emerald-600 mb-2 flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" />
                زمان باقیمانده از اشتراک
              </p>
              <div className="flex justify-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-700 bg-white px-4 py-2 rounded-lg min-w-[60px] shadow-sm">{timeLeft.days}</div>
                  <p className="text-xs text-emerald-600 mt-1">روز</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-700 bg-white px-4 py-2 rounded-lg min-w-[60px] shadow-sm">{timeLeft.hours}</div>
                  <p className="text-xs text-emerald-600 mt-1">ساعت</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-700 bg-white px-4 py-2 rounded-lg min-w-[60px] shadow-sm">{timeLeft.minutes}</div>
                  <p className="text-xs text-emerald-600 mt-1">دقیقه</p>
                </div>
              </div>
            </div>
            
            {/* بخش تمدید */}
            <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4 text-amber-600" />
                <p className="text-xs font-bold text-amber-700">تمدید اشتراک</p>
              </div>
              <p className="text-xs text-amber-600 mb-3">
                با تمدید اشتراک، تاریخ جدید از <span className="font-bold">امروز</span> محاسبه می‌شود
              </p>
   
<div className="flex gap-2">
  <button
    onClick={() => handlePurchase("monthly")}  // مستقیم ماهانه
    className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold transition"
  >
    تمدید ۱ ماهه (۸۷ هزار)
  </button>
  <button
    onClick={() => handlePurchase("quarterly")}  // مستقیم سه‌ماهه
    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition"
  >
    تمدید ۳ ماهه (۲۵۸ هزار)
  </button>
</div>
            </div>
            
            <div className="mt-4 flex gap-3">
              <button onClick={() => router.push("/clientdashboard/customer-link")} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition">لینک من</button>
              <button onClick={() => router.push("/clientdashboard/customer-link/bookings")} className="flex-1 py-2.5 border-2 border-emerald-400 text-emerald-700 rounded-xl text-sm font-medium hover:bg-emerald-50 transition">مدیریت نوبت‌ها</button>
            </div>
          </div>
        )}

        {/* ========== هدر (وقتی فعال نیست) ========== */}
        {!isBookingEnabled && (
          <>
            <div className="text-center">
              <div className="inline-flex items-center gap-1 bg-emerald-100 px-4 py-1.5 rounded-full mb-3 shadow-sm">
                <Rocket className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-700">پیشنهاد ویژه</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">
                مشتریانت <span className="text-emerald-600">آنلاین</span> نوبت بگیرن
              </h1>
              <p className="text-gray-500 text-sm mt-2">یک لینک بده به مشتریهات، بقیه با ما!</p>
            </div>

            {/* بنر آماری */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-3 text-center border border-amber-200">
              <p className="text-amber-700 text-sm flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" />
                <span>کسب‌وکارهای دارای نوبت‌دهی آنلاین، <span className="font-bold">۳ برابر</span> مشتری بیشتر جذب می‌کنن</span>
              </p>
            </div>
          </>
        )}

        {/* ========== انتخاب پلن (وقتی فعال نیست) ========== */}
        {!isBookingEnabled && (
          <>
            {/* تب‌های انتخاب پلن */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-2xl">
              <button
                onClick={() => setSelectedPlan("monthly")}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                  selectedPlan === "monthly"
                    ? "bg-white text-emerald-600 shadow-md"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                ماهانه
              </button>
              <button
                onClick={() => setSelectedPlan("quarterly")}
                className={`flex-1 py-3 rounded-xl font-bold transition-all relative ${
                  selectedPlan === "quarterly"
                    ? "bg-white text-emerald-600 shadow-md"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                سه‌ماهه
                <span className="absolute -top-2 -right-1 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                 % تخفیف
                </span>
              </button>
            </div>

            {/* کارت پلن انتخابی */}
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100">
              {/* نشان ویژه برای پلن سه‌ماهه */}
              {selectedPlan === "quarterly" && (
                <div className="absolute top-0 right-0">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                    بهترین ارزش
                  </div>
                </div>
              )}

              <div className="p-6">
                {/* قیمت */}
                <div className="text-center mb-5">
                  {selectedPlan === "monthly" ? (
                    <>
                      <div className="inline-flex items-baseline gap-1">
                        <span className="text-5xl font-bold text-emerald-600">۸۷</span>
                        <span className="text-gray-500">هزار تومان</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">برای یک ماه کامل</p>
                    </>
                  ) : (
                    <>
                      <div className="inline-flex items-baseline gap-1">
                        <span className="text-5xl font-bold text-emerald-600">۲۵۸</span>
                        <span className="text-gray-500">هزار تومان</span>
                      </div>
                      <p className="text-sm text-emerald-600 font-bold mt-1">
                        ✨ فقط ۸۶ هزار تومان در ماه ✨
                      </p>
                      <p className="text-xs text-gray-400 line-through mt-0.5">
                        قیمت عادی: {(monthlyPrice * 3).toLocaleString()} هزار تومان
                      </p>
                 
                    </>
                  )}
                </div>

                {/* مزایا (لیست تمیز و مرتب) */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">📅 ثبت نوبت آنلاین</p>
                      <p className="text-xs text-gray-500">مشتری ۲۴ ساعته نوبت ثبت می‌کنه</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <Bell className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">🔔 اعلان فوری</p>
                      <p className="text-xs text-gray-500">همون لحظه از نوبت جدید باخبر شو</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <AlertCircle className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">🚫 جلوگیری از تداخل</p>
                      <p className="text-xs text-gray-500">سیستم اجازه نوبت همزمان نمی‌ده</p>
                    </div>
                  
                  </div>


                   
                  
                  <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <ListTodo className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">📋 مدیریت نوبت‌ها</p>
                      <p className="text-xs text-gray-500">مشتری نوبت‌هاش رو می‌بینه و مدیریت می‌کنه</p>
                    </div>
                  </div>
                </div>
     <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <AlertCircle className="w-4 h-4 text-emerald-600" />
                    </div>
                   <div>
                      <p className="font-bold text-gray-800 text-sm">💢 حدف تگ آنتایم</p>
                      <p className="text-xs text-gray-500">تگ مربوط به آنتایم از صفحه اختصاصی حذف میشود.</p>
                    </div>
                  
                  </div>
                {/* جمع‌بندی هزینه روزانه */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-3 mb-5">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">هزینه روزانه:</span>
                    <span className="font-bold text-emerald-700 text-lg">
                      {selectedPlan === "monthly" 
                        ? "۲,۹۰۰ تومان" 
                        : "۲,۸۶۰ تومان"}
                    </span>
                  </div>
             
                </div>

                {/* دکمه خرید */}
                <button
                  onClick={() => handlePurchase(selectedPlan)} 
                  disabled={isPending}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition transform hover:scale-[1.02] active:scale-95 shadow-lg"
                >
                  {isPending ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> در حال اتصال به درگاه...</>
                  ) : (
                    <>
                      <Rocket className="w-5 h-5" />
                      {selectedPlan === "monthly" ? "شروع ماهانه" : "شروع سه‌ماهه (اقتصادی‌تر)"}
                    </>
                  )}
                </button>

                {/* گارانتی */}
                <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-2">
                  <Shield className="w-3 h-3" />
                  پرداخت امن
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  ۷ روز ضمانت بازگشت وجه
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  پشتیبانی ۲۴/۷
                </p>
              </div>
            </div>
          </>
        )}

        {/* ========== برای مشتری (امکانات از دید مشتری) ========== */}
        {!isBookingEnabled && (
          <div className="bg-white rounded-xl p-5 shadow-md">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-base">
              <Users className="w-5 h-5 text-emerald-600" />
              مشتریانت چه امکاناتی دارن؟
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-2 p-2">
                <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-gray-800 text-sm">مشاهده لیست نوبت‌ها</p>
                  <p className="text-xs text-gray-500">گذشته و آینده</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2">
                <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-gray-800 text-sm">ثبت نوبت جدید</p>
                  <p className="text-xs text-gray-500">بدون تماس تلفنی</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2">
                <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-gray-800 text-sm">درخواست تغییر نوبت</p>
                  <p className="text-xs text-gray-500">با ذکر دلیل</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2">
                <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-gray-800 text-sm">لغو نوبت</p>
                  <p className="text-xs text-gray-500">سریع و آسان</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========== چرا نیاز داری؟ ========== */}
        {!isBookingEnabled && (
          <div className="bg-white rounded-xl p-5 shadow-md">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-base">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              چرا به این قابلیت نیاز داری؟
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">⏰</div>
                <p className="text-gray-700 text-sm">دیگه وقتت رو برای هماهنگی نوبت تلف نکن</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">🌙</div>
                <p className="text-gray-700 text-sm">مشتریات حتی ساعت ۳ صبح هم می‌تونن نوبت بگیرن</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">📈</div>
                <p className="text-gray-700 text-sm">تا ۴۰٪ افزایش پر شدن وقت‌های کاری</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">🔄</div>
                <p className="text-gray-700 text-sm">مدیریت خودکار تغییرات و لغو نوبت‌ها</p>
              </div>
            </div>
          </div>
        )}

        {/* ========== اگر لینک نداره ========== */}
        {!hasLink && !isBookingEnabled && (
          <div className="bg-amber-50 rounded-xl p-4 flex items-center justify-between gap-3 flex-wrap border border-amber-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center">
                <Lock className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-800">اول لینک اختصاصی بساز!</p>
                <p className="text-xs text-amber-600">کمتر از ۲ دقیقه زمان می‌بره</p>
              </div>
            </div>
            <button onClick={() => router.push("/clientdashboard/customer-link")} className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold transition">ساخت لینک رایگان</button>
          </div>
        )}

        {/* ========== سوالات متداول ========== */}
        <div className="bg-white rounded-xl p-5 shadow-md">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-base">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            سوالات متداول
          </h3>
          <div className="space-y-4">
            <div>
              <p className="font-bold text-gray-700 text-sm">❓ مشتری چطور نوبت می‌گیره؟</p>
              <p className="text-xs text-gray-500 mt-1">کافیه لینک رو بهش بدی، کلیک کنه و نوبتش رو رزرو کنه. سیستم خودش تداخل نوبت‌ها رو چک می‌کنه.</p>
            </div>
            <div>
              <p className="font-bold text-gray-700 text-sm">❓ مشتری چطور نوبتش رو عوض کنه؟</p>
              <p className="text-xs text-gray-500 mt-1">مشتری می‌تونه از صفحه نوبت‌هاش، درخواست تغییر یا لغو بده و دلیلش رو بنویسه. تو هم اعلان می‌گیری.</p>
            </div>
            <div>
              <p className="font-bold text-gray-700 text-sm">❓ بعد از اتمام اشتراک چی میشه؟</p>
              <p className="text-xs text-gray-500 mt-1">قابلیت ثبت نوبت غیرفعال میشه، ولی صفحه اختصاصی و لینکت همیشه فعال میمونه (رایگان). می‌تونی هر وقت خواستی تمدید کنی.</p>
            </div>
            <div>
              <p className="font-bold text-gray-700 text-sm">❓ میتونم بعداً به پلن سه‌ماهه ارتقا بدم؟</p>
              <p className="text-xs text-gray-500 mt-1">بله، هر زمان خواستی می‌تونی پلن بالاتر بخری. تاریخ جدید از روز خرید محاسبه میشه.</p>
            </div>
          </div>
        </div>

        {/* اعتماد اجتماعی */}
        <div className="text-center py-2">
          <div className="flex items-center justify-center gap-1 text-amber-500 mb-2">
            <Star className="w-4 h-4 fill-amber-500" />
            <Star className="w-4 h-4 fill-amber-500" />
            <Star className="w-4 h-4 fill-amber-500" />
            <Star className="w-4 h-4 fill-amber-500" />
            <Star className="w-4 h-4 fill-amber-500" />
          </div>
          <p className="text-xs text-gray-400">بیش از ۱۰۰۰ کسب‌وکار از آنتایم استفاده می‌کنن • رضایت ۹۸٪</p>
        </div>
      </div>
    </div>
  );
}