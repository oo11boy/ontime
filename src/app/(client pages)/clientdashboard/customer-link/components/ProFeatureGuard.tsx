// src/app/clientdashboard/customer-link/components/ProFeatureGuard.tsx
"use client";

import { useState } from "react";
import { Crown, Sparkles, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ProFeatureGuardProps {
  children: React.ReactNode;
  featureName: string;
  currentPlan: "free" | "pro";
  onUpgrade?: () => void;
}

export function ProFeatureGuard({ 
  children, 
  featureName, 
  currentPlan, 
  onUpgrade 
}: ProFeatureGuardProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (currentPlan === "pro") {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Blur effect on content */}
      <div className="filter blur-sm opacity-50 pointer-events-none">
        {children}
      </div>

      {/* Upgrade overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl p-6 max-w-sm mx-4 text-center shadow-xl border border-purple-200 dark:border-purple-800">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
            دسترسی به {featureName}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
            برای استفاده از این قابلیت، نیاز به ارتقا به پلن ویژه دارید
          </p>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">هزینه ماهانه</span>
              <span className="font-bold text-purple-600">۸۷,۰۰۰ تومان</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">دوره ۳ ماهه</span>
              <div>
                <span className="text-gray-400 line-through text-sm ml-1">
                  ۲۶۱,۰۰۰
                </span>
                <span className="font-bold text-purple-600">۲۵۸,۰۰۰ تومان</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href="/clientdashboard/customer-link/plans"
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 hover:shadow-lg transition-all"
            >
              <Sparkles className="w-4 h-4" />
              ارتقا به پلن ویژه
            </Link>
          </div>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="mt-3 text-xs text-gray-500 hover:text-purple-600 transition-colors"
          >
            {showDetails ? "بستن جزئیات" : "مشاهده جزئیات بیشتر"}
          </button>

          {showDetails && (
            <div className="mt-3 text-right text-xs text-gray-500 space-y-1 pt-3 border-t">
              <p>✨ با پلن ویژه به این امکانات دسترسی دارید:</p>
              <p>• ثبت نوبت آنلاین مشتریان</p>
              <p>• آمار پیشرفته بازدید و رفتار</p>
              <p>• پیامک یادآوری نوبت</p>
              <p>• پشتیبانی اختصاصی</p>
              <p>• حذف تبلیغات</p>
              <p>• لینک اختصاصی نامحدود</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}