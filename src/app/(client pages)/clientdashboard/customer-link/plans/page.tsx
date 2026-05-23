// src/app/clientdashboard/customer-link/plans/page.tsx
"use client";

import { useState } from "react";
import { 
  Crown, 
  Zap, 
  Calendar, 
  BarChart3, 
  MessageSquare, 
  Users, 
  Link as LinkIcon,
  Check,
  X,
  Sparkles,
  Gift,
  Shield,
  Clock,
  Star,
  Heart,
  TrendingUp,
  Smartphone,
  Eye,
  Lock
} from "lucide-react";

export default function PlansPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "quarterly">("quarterly");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const plans = {
    free: {
      name: "رایگان",
      icon: Zap,
      color: "gray",
      price: 0,
      quarterlyPrice: 0,
      description: "مناسب برای شروع کار",
      features: [
        { text: "لینک اختصاصی", included: true, limit: "1 عدد" },
        { text: "مشاهده پروفایل", included: true, limit: "نامحدود" },
        { text: "دریافت نظرات", included: true, limit: "تا ۲۰ نظر" },
        { text: "ثبت نوبت", included: false, tooltip: "برای فعال‌سازی نیاز به ارتقا دارید" },
        { text: "آمار پیشرفته", included: false, tooltip: "دسترسی به آمار بازدید و رفتار کاربران" },
        { text: "پیامک خودکار", included: false, tooltip: "ارسال پیامک یادآوری نوبت" },
        { text: "پشتیبانی اختصاصی", included: false, tooltip: "پشتیبانی تلفنی و آنلاین" },
      ],
      badge: null,
    },
    pro: {
      name: "ویژه",
      icon: Crown,
      color: "purple",
      price: 87000,
      quarterlyPrice: 258000,
      description: "همه چیز برای رشد کسب‌وکار شما",
      savings: "۶۳,۰۰۰ تومان",
      features: [
        { text: "لینک اختصاصی", included: true, limit: "نامحدود" },
        { text: "مشاهده پروفایل", included: true, limit: "نامحدود" },
        { text: "دریافت نظرات", included: true, limit: "نامحدود" },
        { text: "ثبت نوبت آنلاین", included: true, highlight: true },
        { text: "آمار پیشرفته", included: true, highlight: true },
        { text: "پیامک خودکار", included: true, limit: "۵۰۰ عدد/ماه" },
        { text: "پشتیبانی ۲۴/۷", included: true },
        { text: "گزارش‌های تحلیلی", included: true },
        { text: "بدون تبلیغات", included: true },
      ],
      badge: "پرفروش‌ترین",
      popular: true,
    },
  };

  const currentPlan = "free"; // از API میاد
  const currentPlanData = plans[currentPlan as keyof typeof plans];

  const handleUpgrade = (planId: string) => {
    setSelectedPlan(planId);
    setShowPaymentModal(true);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 px-4 py-2 rounded-full mb-3">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
            قیمت‌ها مناسب و مقرون‌به‌صرفه
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          پلن‌های عضویت
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
          با تهیه پلن ویژه، از همه امکانات پیشرفته استفاده کنید
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-1 flex">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              billingCycle === "monthly"
                ? "bg-white dark:bg-gray-700 shadow-sm text-purple-600"
                : "text-gray-500"
            }`}
          >
            ماهانه
          </button>
          <button
            onClick={() => setBillingCycle("quarterly")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1 ${
              billingCycle === "quarterly"
                ? "bg-white dark:bg-gray-700 shadow-sm text-purple-600"
                : "text-gray-500"
            }`}
          >
            ۳ ماهه
            <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
              ۲۴٪ تخفیف
            </span>
          </button>
        </div>
      </div>

      {/* Current Plan Card */}
      {currentPlan === "free" && (
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Zap className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-400">
                شما در حال حاضر از پلن رایگان استفاده می‌کنید
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
                برای دسترسی به امکانات پیشرفته مانند ثبت نوبت و آمار، پلن خود را ارتقا دهید
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid gap-4">
        {/* Free Plan */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                    {plans.free.name}
                  </h3>
                </div>
                <p className="text-gray-500 text-sm">{plans.free.description}</p>
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  رایگان
                </p>
                <p className="text-xs text-gray-500">همیشه رایگان</p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {plans.free.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  {feature.included ? (
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                  ) : (
                    <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                  )}
                  <span className={`text-gray-600 dark:text-gray-300 ${!feature.included && "opacity-60"}`}>
                    {feature.text}
                  </span>
                  {feature.limit && (
                    <span className="text-xs text-gray-400 mr-auto">
                      {feature.limit}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pro Plan - Highlighted */}
        <div className={`relative bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl overflow-hidden shadow-lg border-2 border-purple-300 dark:border-purple-700`}>
          {plans.pro.popular && (
            <div className="absolute top-0 right-0">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-4 py-1 rounded-bl-2xl">
                <Sparkles className="w-3 h-3 inline ml-1" />
                پرفروش‌ترین
              </div>
            </div>
          )}
          
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                    <Crown className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                    {plans.pro.name}
                  </h3>
                </div>
                <p className="text-gray-600 text-sm">{plans.pro.description}</p>
              </div>
              <div className="text-left">
                <div className="flex items-baseline gap-1">
                  <p className="text-3xl font-bold text-purple-700 dark:text-purple-400">
                    {billingCycle === "monthly" 
                      ? `${plans.pro.price.toLocaleString()}`
                      : `${(plans.pro.quarterlyPrice / 3).toLocaleString()}`
                    }
                  </p>
                  <span className="text-gray-500">هزار تومان</span>
                </div>
                <p className="text-xs text-gray-500">
                  {billingCycle === "monthly" ? "ماهانه" : "ماهانه (دوره ۳ ماهه)"}
                </p>
                {billingCycle === "quarterly" && (
                  <p className="text-xs text-green-600 mt-1">
                    ✨ صرفه‌جویی {plans.pro.savings} تومانی
                  </p>
                )}
              </div>
            </div>

            {/* Price Comparison */}
            {billingCycle === "quarterly" && (
              <div className="mt-3 flex items-center gap-2 text-sm">
                <span className="text-gray-400 line-through">
                  {Math.round(plans.pro.price * 3).toLocaleString()} هزار تومان
                </span>
                <span className="text-green-600 font-medium">
                  {plans.pro.quarterlyPrice.toLocaleString()} هزار تومان
                </span>
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">
                  ذخیره {plans.pro.savings} تومان
                </span>
              </div>
            )}

            <div className="mt-4 space-y-2">
              {plans.pro.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500 shrink-0" />
                  <span className={`text-gray-700 dark:text-gray-300 ${feature.highlight && "font-medium text-purple-700 dark:text-purple-400"}`}>
                    {feature.text}
                  </span>
                  {feature.limit && (
                    <span className="text-xs text-gray-400 mr-auto">
                      {feature.limit}
                    </span>
                  )}
                  {feature.highlight && (
                    <Sparkles className="w-3 h-3 text-purple-500 mr-1" />
                  )}
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={() => handleUpgrade("pro")}
              className="w-full mt-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
            >
              <Crown className="w-4 h-4" />
              ارتقا به پلن ویژه
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                فقط {billingCycle === "monthly" ? "۸۷" : "۸۷"} هزار/ماه
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* What You Get Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5">
        <h3 className="font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
          <Gift className="w-5 h-5 text-purple-600" />
          با پلن ویژه چه چیزهایی دریافت می‌کنید؟
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Check className="w-4 h-4 text-green-500" /> ثبت نوبت آنلاین
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Check className="w-4 h-4 text-green-500" /> آمار پیشرفته
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Check className="w-4 h-4 text-green-500" /> پیامک خودکار
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Check className="w-4 h-4 text-green-500" /> پشتیبانی اختصاصی
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Check className="w-4 h-4 text-green-500" /> حذف تبلیغات
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Check className="w-4 h-4 text-green-500" /> لینک نامحدود
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5">
        <h3 className="font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
          <Heart className="w-5 h-5 text-purple-600" />
          سوالات متداول
        </h3>
        <div className="space-y-3">
          <div>
            <p className="font-medium text-gray-800 dark:text-white text-sm">
              ❓ آیا می‌توانم هر زمانی پلن خود را لغو کنم؟
            </p>
            <p className="text-xs text-gray-500 mt-1">
              بله، شما می‌توانید در هر زمان اشتراک خود را لغو کنید. در این صورت تا پایان دوره از امکانات استفاده می‌کنید.
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-800 dark:text-white text-sm">
              ❓ هزینه پلن ویژه چقدر است؟
            </p>
            <p className="text-xs text-gray-500 mt-1">
              ماهانه ۸۷ هزار تومان یا دوره ۳ ماهه ۲۵۸ هزار تومان (معادل ۸۶ هزار تومان در ماه)
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-800 dark:text-white text-sm">
              ❓ آیا ضمانت بازگشت وجه دارید؟
            </p>
            <p className="text-xs text-gray-500 mt-1">
              بله، اگر در ۷ روز اول از پلن راضی نبودید، وجه شما عودت داده می‌شود.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
          <div className="w-full sm:max-w-md bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl overflow-hidden">
            <div className="p-5 border-b dark:border-gray-700">
              <h3 className="font-bold text-gray-800 dark:text-white text-center">
                تکمیل خرید
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center">
                <Crown className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="font-bold text-gray-800 dark:text-white">
                  پلن ویژه (۳ ماهه)
                </p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  ۲۵۸,۰۰۰ تومان
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  معادل ۸۶,۰۰۰ تومان در ماه
                </p>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl font-medium">
                  انصراف
                </button>
                <button className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4" />
                  پرداخت امن
                </button>
              </div>

              <p className="text-center text-xs text-gray-500">
                پرداخت شما کاملاً امن است و اطلاعات شما محفوظ می‌ماند
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}