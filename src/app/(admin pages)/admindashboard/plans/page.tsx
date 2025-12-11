"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Crown,
  Edit2,
  Trash2,
  Plus,
  X,
  CreditCard,
  MessageSquare,
  Loader2,
} from "lucide-react";

// --- نوع داده پلن (فقط فیلدهای موجود در دیتابیس) ---
interface AdminPlan {
  id: number;
  plan_key: string;
  title: string;
  monthly_fee: number;
  free_sms_month: number;
  price_per_100_sms: number;
  // فیلدهای isPopular، isActive و activeSubscribers حذف شدند
}

export default function PlansManagement() {
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<AdminPlan | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- واکشی داده‌ها از API ---
  const fetchPlans = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/plans");
      if (!response.ok) {
        throw new Error("Failed to fetch plans");
      }
      const data = await response.json();
      // داده‌ها مستقیما از دیتابیس می‌آیند
      setPlans(data.plans); 
    } catch (err) {
      setError("خطا در بارگذاری پلن‌ها.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // --- فرمت‌کننده قیمت ---
  const formatPrice = (price: number) => price.toLocaleString();

  // --- هندلر باز کردن مودال ---
  const handleOpenModal = (plan: AdminPlan | null = null) => {
    setCurrentPlan(plan ? { ...plan } : null);
    setIsModalOpen(true);
  };

  // --- هندلر ذخیره / ویرایش ---
  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.target as HTMLFormElement);
    const apiPayload = {
      title: formData.get("title") as string,
      monthly_fee: Number(formData.get("monthly_fee")),
      free_sms_month: Number(formData.get("free_sms_month")),
      price_per_100_sms: Number(formData.get("price_per_100_sms")),
    };

    try {
      let response;
      if (currentPlan) {
        // ویرایش (PUT)
        response = await fetch(`/api/admin/plans/${currentPlan.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(apiPayload),
        });
      } else {
        // افزودن (POST)
        const plan_key = formData.get("plan_key") as string;
        response = await fetch("/api/admin/plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...apiPayload, plan_key }), 
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "عملیات ذخیره با خطا مواجه شد.");
      }

      setIsModalOpen(false);
      setCurrentPlan(null);
      await fetchPlans(); // رفرش لیست
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- هندلر حذف ---
  const confirmDelete = async () => {
    if (!planToDelete) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/plans/${planToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "عملیات حذف با خطا مواجه شد.");
      }

      setIsDeleteModalOpen(false);
      setPlanToDelete(null);
      await fetchPlans(); // رفرش لیست
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-64 text-white">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            <span className="mr-3">در حال بارگذاری پلن‌ها...</span>
        </div>
    );
  }

  if (error && !isModalOpen && !isDeleteModalOpen) {
    return (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl">
            <p className="font-bold">خطا:</p>
            <p>{error}</p>
            <button onClick={fetchPlans} className="mt-2 text-sm underline">تلاش مجدد</button>
        </div>
    );
  }


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
          {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
          افزودن پلن جدید
        </button>
      </div>

      {/* --- Cards Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            // کلاس‌بندی‌های Mock برای isActive/isPopular حذف شدند
            className={`
              relative bg-[#242933] rounded-2xl border transition-all duration-300 group
              border-emerald-500/20 hover:border-emerald-500/40
            `}
          >
            {/* Ribbon for Popular حذف شد */}
            
            {/* Status Badge حذف شد */}
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
                   <p className="text-[10px] text-gray-500">قیمت بسته ۱۰۰تایی SMS</p>
                 </div>
              </div>

              {/* Subscribers Count حذف شد */}
              {/* <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-6 bg-white/5 py-2 rounded-lg">...</div> */}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                 {/* دکمه Toggle وضعیت حذف شد */}
                 <button onClick={() => handleOpenModal(plan)} className="flex-1 py-2 rounded-lg text-xs font-medium border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition" disabled={isSubmitting}>
                    ویرایش
                 </button>
                 
                 <button onClick={() => { setPlanToDelete(plan.id); setIsDeleteModalOpen(true); }} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition" disabled={isSubmitting}>
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
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white" disabled={isSubmitting}>
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
                   <input 
                      name="plan_key" 
                      defaultValue={currentPlan?.plan_key} 
                      required 
                      placeholder="gold_plan" 
                      className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-3 text-sm focus:border-emerald-400 outline-none text-white transition dir-ltr text-right" 
                      readOnly={!!currentPlan}
                   />
                   {currentPlan && <p className="text-xs text-gray-500 mt-1">شناسه در حالت ویرایش غیرقابل تغییر است.</p>}
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
                  <label className="text-sm text-gray-400">قیمت بسته 100تایی SMS (تومان)</label>
                  <input type="number" name="price_per_100_sms" defaultValue={currentPlan?.price_per_100_sms} required className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-3 text-sm focus:border-emerald-400 outline-none text-white transition" />
                </div>
              </div>

              {/* Checkboxes حذف شدند */}

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-700 transition" disabled={isSubmitting}>انصراف</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2" disabled={isSubmitting}>
                   {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
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
              آیا مطمئن هستید؟ (عملیات حذف از طریق API دیتابیس انجام می‌شود)
            </p>
            <div className="flex gap-3">
               <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-700 transition" disabled={isSubmitting}>لغو</button>
               <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 shadow-lg shadow-red-500/20 transition flex items-center justify-center gap-2" disabled={isSubmitting}>
                 {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                 بله، حذف کن
               </button>
            </div>
           </div>
        </div>
      )}

    </div>
  );
}