"use client";
import React, { useState } from "react";
import {
  Crown,
  Edit2,
  Trash2,
  Plus,
  X,
  Users,
  CreditCard,
  MessageSquare,
} from "lucide-react";

// --- نوع داده پلن (مخصوص ادمین) ---
interface AdminPlan {
  id: number;
  plan_key: string;
  title: string;
  monthly_fee: number;
  free_sms_month: number;
  price_per_100_sms: number;
  isPopular: boolean; // آیا پلن پیشنهادی است؟
  isActive: boolean;  // آیا پلن برای خرید فعال است؟
  activeSubscribers: number; // تعداد کاربران فعال این پلن (آمار)
}

// --- داده‌های اولیه (Mock Data) ---
const initialPlans: AdminPlan[] = [
  {
    id: 1,
    plan_key: "free_trial",
    title: "شروع رایگان",
    monthly_fee: 0,
    free_sms_month: 50,
    price_per_100_sms: 45000,
    isPopular: false,
    isActive: true,
    activeSubscribers: 150,
  },
  {
    id: 2,
    plan_key: "economy",
    title: "اقتصادی",
    monthly_fee: 199000,
    free_sms_month: 200,
    price_per_100_sms: 42000,
    isPopular: false,
    isActive: true,
    activeSubscribers: 85,
  },
  {
    id: 3,
    plan_key: "pro",
    title: "حرفه‌ای (Pro)",
    monthly_fee: 499000,
    free_sms_month: 1000,
    price_per_100_sms: 38000,
    isPopular: true,
    isActive: true,
    activeSubscribers: 320,
  },
  {
    id: 4,
    plan_key: "enterprise",
    title: "سازمانی",
    monthly_fee: 1200000,
    free_sms_month: 5000,
    price_per_100_sms: 35000,
    isPopular: false,
    isActive: false, // غیرفعال شده
    activeSubscribers: 12,
  },
];

export default function PlansManagement() {
  const [plans, setPlans] = useState<AdminPlan[]>(initialPlans);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<AdminPlan | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<number | null>(null);

  // --- فرمت‌کننده قیمت ---
  const formatPrice = (price: number) => price.toLocaleString();

  // --- هندلر باز کردن مودال ---
  const handleOpenModal = (plan: AdminPlan | null = null) => {
    setCurrentPlan(plan);
    setIsModalOpen(true);
  };

  // --- هندلر ذخیره ---
  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const newPlanData: any = {
      title: formData.get("title"),
      plan_key: formData.get("plan_key"),
      monthly_fee: Number(formData.get("monthly_fee")),
      free_sms_month: Number(formData.get("free_sms_month")),
      price_per_100_sms: Number(formData.get("price_per_100_sms")),
      isPopular: formData.get("isPopular") === "on",
      isActive: formData.get("isActive") === "on",
    };

    if (currentPlan) {
      // ویرایش
      setPlans(plans.map((p) => (p.id === currentPlan.id ? { ...p, ...newPlanData } : p)));
    } else {
      // افزودن
      setPlans([...plans, { id: Date.now(), activeSubscribers: 0, ...newPlanData }]);
    }
    setIsModalOpen(false);
  };

  // --- هندلر حذف ---
  const confirmDelete = () => {
    if (planToDelete) {
      setPlans(plans.filter((p) => p.id !== planToDelete));
      setIsDeleteModalOpen(false);
      setPlanToDelete(null);
    }
  };

  // --- هندلر تغییر وضعیت سریع (Active/Inactive) ---
  const togglePlanStatus = (id: number) => {
    setPlans(plans.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Crown className="text-emerald-400 w-7 h-7" />
            مدیریت پلن‌ها و اشتراک‌ها
          </h1>
          <p className="text-gray-400 text-sm mt-1">تعریف بسته‌های قیمتی و مدیریت دسترسی کاربران</p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          افزودن پلن جدید
        </button>
      </div>

      {/* --- Cards Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className={`
              relative bg-[#242933] rounded-2xl border transition-all duration-300 group
              ${plan.isActive ? "border-emerald-500/20" : "border-gray-700 opacity-75 grayscale-[0.5]"}
              ${plan.isPopular ? "border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]" : "hover:border-emerald-500/40"}
            `}
          >
            {/* Ribbon for Popular */}
            {plan.isPopular && (
              <div className="absolute top-0 left-8 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-b-lg shadow-lg">
                پیشنهادی
              </div>
            )}

            {/* Status Badge */}
            <div className={`absolute top-4 right-4 px-2 py-0.5 rounded-full text-[10px] border ${
               plan.isActive 
               ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
               : "bg-red-500/10 text-red-400 border-red-500/20"
            }`}>
              {plan.isActive ? "فعال" : "غیرفعال"}
            </div>

            <div className="p-6">
              {/* Header */}
              <div className="mt-4 mb-6 text-center">
                 <h3 className="text-xl font-bold text-white mb-2">{plan.title}</h3>
                 <div className="flex items-center justify-center gap-1">
                    <span className="text-2xl font-bold text-emerald-400">{formatPrice(plan.monthly_fee)}</span>
                    <span className="text-xs text-gray-400">تومان / ماهانه</span>
                 </div>
              </div>

              {/* Stats Grid inside Card */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                 <div className="bg-[#1a1e26] p-3 rounded-xl text-center border border-white/5">
                    <MessageSquare className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                    <p className="text-white font-bold">{plan.free_sms_month}</p>
                    <p className="text-[10px] text-gray-500">پیامک هدیه</p>
                 </div>
                 <div className="bg-[#1a1e26] p-3 rounded-xl text-center border border-white/5">
                    <CreditCard className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                    <p className="text-white font-bold">{formatPrice(plan.price_per_100_sms)}</p>
                    <p className="text-[10px] text-gray-500">قیمت بسته پیامک</p>
                 </div>
              </div>

              {/* Subscribers Count */}
              <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-6 bg-white/5 py-2 rounded-lg">
                 <Users className="w-4 h-4" />
                 <span><span className="text-white font-bold">{plan.activeSubscribers}</span> کاربر فعال</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                 <button 
                    onClick={() => togglePlanStatus(plan.id)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border transition ${
                      plan.isActive 
                      ? "border-red-500/30 text-red-400 hover:bg-red-500/10" 
                      : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                    }`}
                 >
                    {plan.isActive ? "غیرفعال کردن" : "فعال کردن"}
                 </button>
                 
                 <button onClick={() => handleOpenModal(plan)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition">
                    <Edit2 className="w-4 h-4" />
                 </button>
                 
                 <button onClick={() => { setPlanToDelete(plan.id); setIsDeleteModalOpen(true); }} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition">
                    <Trash2 className="w-4 h-4" />
                 </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- ADD/EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#242933] border border-emerald-500/30 rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-emerald-500/20 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">
                {currentPlan ? "ویرایش پلن" : "ایجاد پلن جدید"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSavePlan} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">عنوان پلن</label>
                  <input name="title" defaultValue={currentPlan?.title} required placeholder="مثلا: طلایی" className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-3 text-sm focus:border-emerald-400 outline-none text-white transition" />
                </div>
                <div className="space-y-2">
                   <label className="text-sm text-gray-400">شناسه سیستمی (Key)</label>
                   <input name="plan_key" defaultValue={currentPlan?.plan_key} required placeholder="gold_plan" className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-3 text-sm focus:border-emerald-400 outline-none text-white transition dir-ltr text-right" />
                </div>
              </div>

              <div className="space-y-2">
                 <label className="text-sm text-gray-400">هزینه ماهانه (تومان)</label>
                 <input type="number" name="monthly_fee" defaultValue={currentPlan?.monthly_fee} required className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-3 text-sm focus:border-emerald-400 outline-none text-white transition" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">تعداد پیامک هدیه</label>
                  <input type="number" name="free_sms_month" defaultValue={currentPlan?.free_sms_month} required className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-3 text-sm focus:border-emerald-400 outline-none text-white transition" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">قیمت بسته 100تایی SMS</label>
                  <input type="number" name="price_per_100_sms" defaultValue={currentPlan?.price_per_100_sms} required className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-3 text-sm focus:border-emerald-400 outline-none text-white transition" />
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex items-center gap-6 pt-2">
                 <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" name="isPopular" defaultChecked={currentPlan?.isPopular} className="w-5 h-5 rounded border-gray-600 bg-[#1a1e26] text-emerald-500 focus:ring-emerald-500 accent-emerald-500" />
                    <span className="text-sm text-gray-300 group-hover:text-white transition">علامت‌گذاری به عنوان پیشنهادی</span>
                 </label>
                 <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" name="isActive" defaultChecked={currentPlan?.isActive ?? true} className="w-5 h-5 rounded border-gray-600 bg-[#1a1e26] text-emerald-500 focus:ring-emerald-500 accent-emerald-500" />
                    <span className="text-sm text-gray-300 group-hover:text-white transition">پلن فعال باشد</span>
                 </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-700 transition">انصراف</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-linear-to-r from-emerald-500 to-emerald-600 text-white font-bold hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/20 transition">
                  {currentPlan ? "بروزرسانی پلن" : "ایجاد پلن"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRM MODAL --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
           <div className="bg-[#242933] border border-red-500/30 rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl">
             <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8" />
             </div>
             <h3 className="text-xl font-bold text-white mb-2">حذف پلن</h3>
             <p className="text-gray-400 text-sm mb-6">
               آیا مطمئن هستید؟ با حذف این پلن، کاربرانی که در حال حاضر از آن استفاده می‌کنند ممکن است دچار مشکل شوند. پیشنهاد می‌شود به جای حذف، آن را غیرفعال کنید.
             </p>
             <div className="flex gap-3">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-700 transition">لغو</button>
                <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 shadow-lg shadow-red-500/20 transition">بله، حذف کن</button>
             </div>
           </div>
        </div>
      )}

    </div>
  );
}