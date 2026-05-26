"use client";

import { useState, useEffect } from "react";
import { Bell, Send, RefreshCw, CreditCard, Loader2, AlertCircle, MessageCircle, ThumbsUp } from "lucide-react";
import { toast } from "react-hot-toast";

interface SmsNotificationSettings {
  new_booking_sms_enabled: boolean;
  reschedule_sms_enabled: boolean;
  approval_sms_enabled: boolean;
}

interface SmsNotificationBoxProps {
  linkId: number;
  slug: string;
}

export function SmsNotificationBox({ linkId, slug }: SmsNotificationBoxProps) {
  const [settings, setSettings] = useState<SmsNotificationSettings>({
    new_booking_sms_enabled: true,
    reschedule_sms_enabled: true,
    approval_sms_enabled: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/client/customer-link/sms-settings?slug=${slug}`);
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings({
          new_booking_sms_enabled: data.settings.new_booking_sms_enabled ?? true,
          reschedule_sms_enabled: data.settings.reschedule_sms_enabled ?? true,
          approval_sms_enabled: data.settings.approval_sms_enabled ?? true,
        });
      }
    } catch (error) {
      console.error("Error fetching SMS settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchSettings();
    }
  }, [slug]);

  const handleToggle = async (key: keyof SmsNotificationSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    setIsSaving(true);
    try {
      const res = await fetch("/api/client/customer-link/sms-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          settings: newSettings,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("تنظیمات با موفقیت ذخیره شد");
      } else {
        toast.error(data.message || "خطا در ذخیره تنظیمات");
        setSettings(settings);
      }
    } catch (error) {
      console.error("Error saving SMS settings:", error);
      toast.error("خطا در ذخیره تنظیمات");
      setSettings(settings);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#1a1e26] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
              <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white">تنظیمات پیامک</h3>
          </div>
          <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
        </div>
        <div className="p-5 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1a1e26] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
            <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-white">تنظیمات پیامک</h3>
        </div>
        {isSaving && (
          <div className="flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span className="text-xs text-slate-400">در حال ذخیره...</span>
          </div>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* باکس اطلاع‌رسانی کسر اعتبار (اجباری) */}
        <div className="bg-amber-50 dark:bg-amber-500/10 rounded-xl p-3 border border-amber-200 dark:border-amber-500/30">
          <div className="flex items-start gap-2">
            <CreditCard className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-800 dark:text-amber-400">
                ⚡ هزینه هر درخواست: ۲ واحد پیامک
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                به ازای هر درخواست (ثبت نوبت جدید، تغییر نوبت یا تایید/رد)، ۲ واحد از اعتبار پیامک شما 
                <span className="font-bold"> کسر می‌شود</span> و این قابلیت غیرفعال شدنی نیست.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl p-3">
          <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            تعیین کنید که در کدام مرحله پیامک برای شما ارسال شود
          </p>
        </div>

        {/* تنظیم 1: ارسال پیامک برای نوبت جدید */}
        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <p className="font-medium text-slate-800 dark:text-white text-sm">
                پیامک درخواست نوبت جدید
              </p>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              پس از ثبت نوبت جدید توسط مشتری، پیامک برای شما ارسال شود
            </p>
          </div>
          <button
            onClick={() => handleToggle("new_booking_sms_enabled", !settings.new_booking_sms_enabled)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              settings.new_booking_sms_enabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                settings.new_booking_sms_enabled ? "right-1 translate-x-6" : "left-1"
              }`}
            />
          </button>
        </div>

        {/* تنظیم 2: ارسال پیامک برای تغییر نوبت */}
        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <p className="font-medium text-slate-800 dark:text-white text-sm">
                پیامک درخواست تغییر نوبت
              </p>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              پس از درخواست تغییر نوبت توسط مشتری، پیامک برای شما ارسال شود
            </p>
          </div>
          <button
            onClick={() => handleToggle("reschedule_sms_enabled", !settings.reschedule_sms_enabled)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              settings.reschedule_sms_enabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                settings.reschedule_sms_enabled ? "right-1 translate-x-6" : "left-1"
              }`}
            />
          </button>
        </div>

        {/* تنظیم 3: ارسال پیامک برای تایید/رد درخواست */}
        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <ThumbsUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <p className="font-medium text-slate-800 dark:text-white text-sm">
                پیامک نتیجه تایید/رد درخواست
              </p>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              پس از تایید یا رد درخواست مشتری، پیامک نتیجه برای او ارسال شود
            </p>
          </div>
          <button
            onClick={() => handleToggle("approval_sms_enabled", !settings.approval_sms_enabled)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              settings.approval_sms_enabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                settings.approval_sms_enabled ? "right-1 translate-x-6" : "left-1"
              }`}
            />
          </button>
        </div>

        {/* خلاصه وضعیت */}
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-500">وضعیت نهایی:</span>
            <div className="flex flex-wrap gap-2">
              {settings.new_booking_sms_enabled ? (
                <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full">
                  پیامک نوبت جدید ✓
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-500/20 text-slate-500 rounded-full">
                  پیامک نوبت جدید ✗
                </span>
              )}
              {settings.reschedule_sms_enabled ? (
                <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 rounded-full">
                  پیامک تغییر ✓
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-500/20 text-slate-500 rounded-full">
                  پیامک تغییر ✗
                </span>
              )}
              {settings.approval_sms_enabled ? (
                <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 rounded-full">
                  پیامک تایید/رد ✓
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-500/20 text-slate-500 rounded-full">
                  پیامک تایید/رد ✗
                </span>
              )}
              <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-full">
                -۲ واحد (اجباری)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}