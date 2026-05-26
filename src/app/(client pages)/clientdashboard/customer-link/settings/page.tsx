"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Settings, Bell, CreditCard, Info, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { SmsNotificationBox } from "../components/SmsNotificationBox";

interface LinkData {
  id: number;
  slug: string;
  business_name: string;
}

export default function CustomerLinkSettingsPage() {
  const router = useRouter();
  const [linkData, setLinkData] = useState<LinkData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLinkData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/client/customer-link");
      const data = await res.json();
      
      if (data.success && data.hasLink && data.link) {
        setLinkData({
          id: data.link.id,
          slug: data.link.slug,
          business_name: data.link.business_name || "",
        });
      } else {
        // اگر لینکی وجود نداشت، به صفحه اصلی هدایت کن
        router.push("/clientdashboard/customer-link");
      }
    } catch (error) {
      console.error("Error fetching link data:", error);
      toast.error("خطا در دریافت اطلاعات");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLinkData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (!linkData) {
    return null;
  }

  return (
    <div className="space-y-5">
      {/* هدر صفحه */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
          <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            تنظیمات صفحه
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            مدیریت تنظیمات صفحه اختصاصی و پیامک‌ها
          </p>
        </div>
      </div>

      {/* باکس تنظیمات پیامک */}
      <SmsNotificationBox 
        linkId={linkData.id} 
        slug={linkData.slug} 
      />

      {/* اطلاع‌رسانی کسر اعتبار (تکرار برای تاکید) */}
      <div className="bg-amber-50 dark:bg-amber-500/10 rounded-xl p-4 border border-amber-200 dark:border-amber-500/30">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center shrink-0">
            <CreditCard className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-800 dark:text-amber-400">
              ⚡ نکته مهم: هزینه هر درخواست
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              به ازای هر درخواست (ثبت نوبت جدید، تغییر نوبت یا تایید/رد درخواست)، 
              <span className="font-bold"> ۲ واحد از اعتبار پیامک شما کسر می‌شود</span>.
              این هزینه به صورت خودکار اعمال می‌گردد و قابل غیرفعال کردن نیست.
            </p>
          </div>
        </div>
      </div>

      {/* توضیحات اضافی */}
      <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center shrink-0">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-blue-800 dark:text-blue-400">
              ℹ️ درباره تنظیمات پیامک
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              • <strong>پیامک درخواست نوبت جدید:</strong> زمانی که مشتری از طریق لینک شما نوبت جدید ثبت می‌کند، پیامک دریافت می‌کنید.
              <br />
              • <strong>پیامک درخواست تغییر نوبت:</strong> زمانی که مشتری درخواست تغییر زمان نوبت خود را ثبت می‌کند، پیامک دریافت می‌کنید.
              <br />
              • <strong>پیامک نتیجه تایید/رد:</strong> زمانی که شما درخواست مشتری را تایید یا رد می‌کنید، پیامک نتیجه برای مشتری ارسال می‌شود.
              <br />
              • <strong>هزینه هر درخواست ۲ واحد پیامک است</strong> و این هزینه به صورت خودکار از اعتبار شما کسر می‌شود.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}