// File Path: src\app\(admin pages)\admindashboard\settings\page.tsx

"use client";
import React, { useState } from "react";
import {
  Settings,
  User,
  Bell,
  Shield,
  CreditCard,
  Globe,
  Save,
  UploadCloud,
  Smartphone,
  Mail,
  Lock,
  Camera
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  // --- محتوای تب‌ها ---
  const renderContent = () => {
    switch (activeTab) {
      case "general":
        return <GeneralSettings />;
      case "account":
        return <AccountSettings />;
      case "notifications":
        return <NotificationSettings />;
      case "security":
        return <SecuritySettings />;
      default:
        return <GeneralSettings />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* --- Header --- */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="text-emerald-400 w-7 h-7" />
          تنظیمات سیستم
        </h1>
        <p className="text-gray-400 text-sm mt-1">مدیریت پیکربندی‌های اصلی پنل و حساب کاربری</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* --- Sidebar Tabs --- */}
        <div className="w-full lg:w-64 shrink-0">
          <div className="bg-[#242933] border border-emerald-500/20 rounded-2xl p-2 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
            <TabItem 
              id="general" 
              label="عمومی" 
              icon={Globe} 
              isActive={activeTab === "general"} 
              onClick={setActiveTab} 
            />
            <TabItem 
              id="account" 
              label="حساب کاربری" 
              icon={User} 
              isActive={activeTab === "account"} 
              onClick={setActiveTab} 
            />
            <TabItem 
              id="notifications" 
              label="اعلانات و پیامک" 
              icon={Bell} 
              isActive={activeTab === "notifications"} 
              onClick={setActiveTab} 
            />
            <TabItem 
              id="financial" 
              label="تنظیمات مالی" 
              icon={CreditCard} 
              isActive={activeTab === "financial"} 
              onClick={setActiveTab} 
            />
            <TabItem 
              id="security" 
              label="امنیت و دسترسی" 
              icon={Shield} 
              isActive={activeTab === "security"} 
              onClick={setActiveTab} 
            />
          </div>
        </div>

        {/* --- Main Content Area --- */}
        <div className="flex-1">
          <div className="bg-[#242933] border border-emerald-500/20 rounded-2xl p-6 shadow-xl min-h-[500px]">
            {renderContent()}
          </div>
        </div>

      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// --- زیرمجموعه: تنظیمات عمومی (اصلاح شده) ---
function GeneralSettings() {
  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div>
        <h3 className="text-lg font-bold text-white mb-4 border-b border-emerald-500/20 pb-2">اطلاعات پایه سیستم</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">نام سیستم (عنوان سایت)</label>
            <input defaultValue="نوبت دات‌کام" className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-3 text-sm focus:border-emerald-400 outline-none text-white transition" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-400">ایمیل پشتیبانی</label>
            <input defaultValue="support@nobat.com" className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-3 text-sm focus:border-emerald-400 outline-none text-white transition" />
          </div>
          <div className="col-span-full space-y-2">
            <label className="text-sm text-gray-400">توضیحات کوتاه (Meta Description)</label>
            {/* --- اصلاح شده: استفاده از defaultValue --- */}
            <textarea 
              rows={3} 
              className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-3 text-sm focus:border-emerald-400 outline-none text-white transition resize-none"
              defaultValue="سامانه جامع نوبت‌دهی آنلاین برای آرایشگاه‌ها، پزشکان و خدمات خودرویی."
            />
          </div>
        </div>
      </div>

      <div>
         <h3 className="text-lg font-bold text-white mb-4 border-b border-emerald-500/20 pb-2">لوگو و هویت بصری</h3>
         <div className="border-2 border-dashed border-gray-600 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-emerald-500/50 hover:bg-[#1a1e26] transition cursor-pointer group">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <UploadCloud className="w-8 h-8 text-emerald-400" />
            </div>
            <p className="text-gray-300 font-medium">برای آپلود لوگو کلیک کنید یا فایل را اینجا رها کنید</p>
            <p className="text-xs text-gray-500 mt-2">فرمت‌های مجاز: PNG, JPG (حداکثر 2MB)</p>
         </div>
      </div>

      <div className="flex items-center justify-between bg-[#1a1e26] p-4 rounded-xl border border-white/5">
        <div>
           <p className="text-white font-bold text-sm">حالت تعمیرات (Maintenance Mode)</p>
           <p className="text-xs text-gray-400 mt-1">با فعال کردن این گزینه، سایت برای کاربران عادی غیرقابل دسترس می‌شود.</p>
        </div>
        <ToggleSwitch />
      </div>

      <div className="pt-4 flex justify-end">
        <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition">
          <Save className="w-4 h-4" />
          ذخیره تغییرات
        </button>
      </div>
    </div>
  );
}
// --- زیرمجموعه: حساب کاربری ---
function AccountSettings() {
  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center gap-6">
        <div className="relative group cursor-pointer">
          <div className="w-24 h-24 rounded-full bg-linear-to-tr from-emerald-400 to-teal-600 p-1">
             <div className="w-full h-full rounded-full bg-[#242933] flex items-center justify-center overflow-hidden">
                <span className="text-3xl font-bold text-white">A</span>
             </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition backdrop-blur-sm">
             <Camera className="w-6 h-6 text-white" />
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">مدیر سیستم</h3>
          <p className="text-gray-400 text-sm">Super Admin</p>
          <button className="text-emerald-400 text-xs mt-2 hover:underline">تغییر تصویر پروفایل</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="space-y-2">
            <label className="text-sm text-gray-400">نام کامل</label>
            <input defaultValue="مدیر سیستم" className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-3 text-sm focus:border-emerald-400 outline-none text-white transition" />
         </div>
         <div className="space-y-2">
            <label className="text-sm text-gray-400">نام کاربری</label>
            <input defaultValue="admin_master" className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-3 text-sm focus:border-emerald-400 outline-none text-white transition" disabled />
         </div>
         <div className="space-y-2">
            <label className="text-sm text-gray-400">شماره موبایل</label>
            <input defaultValue="09120000000" className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-3 text-sm focus:border-emerald-400 outline-none text-white transition" />
         </div>
         <div className="space-y-2">
            <label className="text-sm text-gray-400">ایمیل</label>
            <input defaultValue="admin@nobat.com" className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-3 text-sm focus:border-emerald-400 outline-none text-white transition" />
         </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition">
          <Save className="w-4 h-4" />
          بروزرسانی پروفایل
        </button>
      </div>
    </div>
  );
}

// --- زیرمجموعه: اعلانات ---
function NotificationSettings() {
  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <h3 className="text-lg font-bold text-white mb-4 border-b border-emerald-500/20 pb-2">تنظیمات پیامک (SMS)</h3>
      
      <div className="bg-[#1a1e26] p-4 rounded-xl border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Smartphone className="w-5 h-5"/></div>
              <div>
                <p className="text-sm font-bold text-white">ارسال پیامک خوش‌آمدگویی</p>
                <p className="text-xs text-gray-500">هنگامی که کاربر جدید ثبت نام می‌کند</p>
              </div>
           </div>
           <ToggleSwitch defaultChecked />
        </div>
        <div className="w-full h-px bg-white/5"></div>
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg text-green-400"><Smartphone className="w-5 h-5"/></div>
              <div>
                <p className="text-sm font-bold text-white">تایید نوبت</p>
                <p className="text-xs text-gray-500">ارسال پیامک به کاربر پس از رزرو نوبت</p>
              </div>
           </div>
           <ToggleSwitch defaultChecked />
        </div>
        <div className="w-full h-px bg-white/5"></div>
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg text-red-400"><Smartphone className="w-5 h-5"/></div>
              <div>
                <p className="text-sm font-bold text-white">لغو نوبت</p>
                <p className="text-xs text-gray-500">اطلاع رسانی در صورت کنسل شدن نوبت</p>
              </div>
           </div>
           <ToggleSwitch />
        </div>
      </div>

      <h3 className="text-lg font-bold text-white mb-4 border-b border-emerald-500/20 pb-2 mt-8">تنظیمات ایمیل</h3>
      <div className="bg-[#1a1e26] p-4 rounded-xl border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400"><Mail className="w-5 h-5"/></div>
              <div>
                <p className="text-sm font-bold text-white">گزارش هفتگی برای مدیر</p>
                <p className="text-xs text-gray-500">ارسال خلاصه آمار سیستم به ایمیل شما</p>
              </div>
           </div>
           <ToggleSwitch defaultChecked />
        </div>
      </div>
    </div>
  );
}

// --- زیرمجموعه: امنیت ---
function SecuritySettings() {
  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div>
         <h3 className="text-lg font-bold text-white mb-4 border-b border-emerald-500/20 pb-2 flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-400" />
            تغییر رمز عبور
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">رمز عبور فعلی</label>
              <input type="password" className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-3 text-sm focus:border-emerald-400 outline-none text-white transition" />
            </div>
            <div className="hidden md:block"></div> {/* Spacer */}
            
            <div className="space-y-2">
              <label className="text-sm text-gray-400">رمز عبور جدید</label>
              <input type="password" className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-3 text-sm focus:border-emerald-400 outline-none text-white transition" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">تکرار رمز عبور جدید</label>
              <input type="password" className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-3 text-sm focus:border-emerald-400 outline-none text-white transition" />
            </div>
         </div>
      </div>

      <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
         <h3 className="text-lg font-bold text-red-400 mb-2">منطقه خطر</h3>
         <p className="text-xs text-gray-400 mb-4">عملیات زیر غیرقابل بازگشت هستند. لطفاً با احتیاط عمل کنید.</p>
         
         <div className="flex items-center justify-between">
            <div>
               <p className="text-white text-sm font-bold">پاکسازی حافظه پنهان (Cache)</p>
               <p className="text-xs text-gray-500">فایل‌های موقت سیستم را حذف می‌کند.</p>
            </div>
            <button className="border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg text-xs transition">
              پاکسازی کش
            </button>
         </div>
      </div>
    </div>
  );
}

// --- کامپوننت دکمه تب ---
function TabItem({ id, label, icon: Icon, isActive, onClick }: any) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full text-right whitespace-nowrap
        ${isActive 
          ? "bg-linear-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20" 
          : "text-gray-400 hover:bg-white/5 hover:text-white"}
      `}
    >
      <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-500 group-hover:text-white"}`} />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

// --- کامپوننت تاگل سوئیچ (Toggle Switch) ---
function ToggleSwitch({ defaultChecked = false }) {
  const [checked, setChecked] = useState(defaultChecked);
  
  return (
    <button 
      onClick={() => setChecked(!checked)}
      className={`
        w-11 h-6 rounded-full relative transition-colors duration-300 focus:outline-none
        ${checked ? "bg-emerald-500" : "bg-gray-700"}
      `}
    >
      <div 
        className={`
          w-4 h-4 rounded-full bg-white absolute top-1 transition-transform duration-300 shadow-md
          ${checked ? "left-1 translate-x-0" : "left-auto right-1"}
        `}
      />
    </button>
  );
}