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



    </div>
  );
}