// src/app/(admin pages)/admindashboard/settings/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Save, RefreshCw, Gift, MessageSquare, Calendar, Clock } from "lucide-react";

export default function SystemSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    free_trial_duration: "2",
    free_trial_duration_unit: "month",
    free_trial_sms_quota: "150",
    free_trial_sms_duration: "3",
    free_trial_sms_duration_unit: "month",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/system-settings");
      const data = await res.json();
      if (data.success) {
        setSettings({
          free_trial_duration: data.settings.free_trial_duration || "2",
          free_trial_duration_unit: data.settings.free_trial_duration_unit || "month",
          free_trial_sms_quota: data.settings.free_trial_sms_quota || "150",
          free_trial_sms_duration: data.settings.free_trial_sms_duration || "3",
          free_trial_sms_duration_unit: data.settings.free_trial_sms_duration_unit || "month",
        });
      } else {
        toast.error("خطا در دریافت تنظیمات");
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/system-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("تنظیمات با موفقیت ذخیره شد");
      } else {
        toast.error(data.message || "خطا در ذخیره تنظیمات");
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setSaving(false);
    }
  };

  // تابع نمایش متن واحد زمان به فارسی
  const formatUnitText = (unit: string, isPlural: boolean = false): string => {
    if (unit === 'week') {
      return isPlural ? 'هفته' : 'هفته';
    }
    return isPlural ? 'ماه' : 'ماه';
  };

  // تابع محاسبه توضیحات پیش‌نمایش
  const getPreviewText = () => {
    const duration = parseInt(settings.free_trial_duration);
    const unit = settings.free_trial_duration_unit;
    const unitText = formatUnitText(unit, duration > 1);
    
    const smsDuration = parseInt(settings.free_trial_sms_duration);
    const smsUnit = settings.free_trial_sms_duration_unit;
    const smsUnitText = formatUnitText(smsUnit, smsDuration > 1);
    
    return {
      trialText: `${duration} ${unitText}`,
      smsText: `${smsDuration} ${smsUnitText}`,
    };
  };

  const previewText = getPreviewText();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">تنظیمات سیستم</h1>
          <p className="text-gray-400 text-sm">
            مدیریت تنظیمات عمومی سیستم و پلن‌های رایگان
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all disabled:opacity-50"
        >
          {saving ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          ذخیره تغییرات
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* کارت تنظیمات پلن رایگان */}
        <div className="bg-[#242933] border border-emerald-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-emerald-500/20">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Gift className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">تنظیمات پلن رایگان</h2>
              <p className="text-xs text-gray-400">مدت زمان و امکانات پلن رایگان کاربران جدید</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                مدت زمان پلن رایگان
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  min="1"
                  max="52"
                  value={settings.free_trial_duration}
                  onChange={(e) => setSettings({ ...settings, free_trial_duration: e.target.value })}
                  className="flex-1 px-4 py-3 bg-[#1a1e26] border border-gray-700 rounded-xl text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                />
                <select
                  value={settings.free_trial_duration_unit}
                  onChange={(e) => setSettings({ ...settings, free_trial_duration_unit: e.target.value })}
                  className="w-32 px-4 py-3 bg-[#1a1e26] border border-gray-700 rounded-xl text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                >
                  <option value="month">ماه</option>
                  <option value="week">هفته</option>
                </select>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                تعداد {settings.free_trial_duration_unit === 'month' ? 'ماه' : 'هفته'}‌هایی که کاربر جدید از پلن رایگان استفاده می‌کند
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                پیامک رایگان ماهانه
              </label>
              <input
                type="number"
                min="0"
                max="1000"
                step="10"
                value={settings.free_trial_sms_quota}
                onChange={(e) => setSettings({ ...settings, free_trial_sms_quota: e.target.value })}
                className="w-full px-4 py-3 bg-[#1a1e26] border border-gray-700 rounded-xl text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">
                تعداد پیامک رایگان که هر ماه به کاربر تعلق می‌گیرد
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                مدت زمان دریافت پیامک رایگان
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  min="1"
                  max="52"
                  value={settings.free_trial_sms_duration}
                  onChange={(e) => setSettings({ ...settings, free_trial_sms_duration: e.target.value })}
                  className="flex-1 px-4 py-3 bg-[#1a1e26] border border-gray-700 rounded-xl text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                />
                <select
                  value={settings.free_trial_sms_duration_unit}
                  onChange={(e) => setSettings({ ...settings, free_trial_sms_duration_unit: e.target.value })}
                  className="w-32 px-4 py-3 bg-[#1a1e26] border border-gray-700 rounded-xl text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                >
                  <option value="month">ماه</option>
                  <option value="week">هفته</option>
                </select>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                تعداد {settings.free_trial_sms_duration_unit === 'month' ? 'ماه' : 'هفته'}‌هایی که کاربر پیامک رایگان دریافت می‌کند
              </p>
            </div>
          </div>
        </div>

        {/* کارت پیش‌نمایش */}
        <div className="bg-[#242933] border border-emerald-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-emerald-500/20">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">پیش‌نمایش پیام خوش‌آمدگویی</h2>
              <p className="text-xs text-gray-400">نحوه نمایش به کاربر جدید</p>
            </div>
          </div>

          <div className="bg-[#1a1e26] rounded-xl p-4 border border-emerald-500/20">
            <div className="space-y-3 text-sm">
              <p className="text-gray-300">
                ثبت‌نام شما با موفقیت انجام شد.
              </p>
              <p className="text-emerald-400 font-bold">
                شما {previewText.trialText} استفاده رایگان از تمام امکانات اپلیکیشن نوبت‌دهی دریافت کردید!
              </p>
              <p className="text-gray-300">
                همچنین هر ماه {" "}
                <span className="text-emerald-400 font-bold">
                  {parseInt(settings.free_trial_sms_quota).toLocaleString('fa-IR')} پیامک رایگان
                </span>{" "}
                به مدت {previewText.smsText} برایتان فعال شد.
              </p>
            </div>
          </div>

          {/* مثال‌های کاربردی */}
          <div className="mt-4 pt-4 border-t border-gray-700">
            <h3 className="text-xs font-bold text-gray-400 mb-2">مثال‌های کاربردی:</h3>
            <div className="space-y-2 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-emerald-400" />
                <span>مثال: "2 هفته" = 14 روز استفاده رایگان</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3 text-emerald-400" />
                <span>مثال: "3 ماه" = 90 روز استفاده رایگان</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* توضیحات */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <p className="text-sm text-blue-400">
          ⚠️ توجه: تغییر این تنظیمات فقط برای کاربرانی که بعد از این تاریخ ثبت‌نام می‌کنند اعمال می‌شود.
          کاربران قبلی تحت تأثیر قرار نمی‌گیرند.
        </p>
      </div>
    </div>
  );
}