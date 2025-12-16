// File Path: src\app\(admin pages)\admindashboard\sms\page.tsx

"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Smartphone,
  Plus,
  Edit2,
  Trash2,
  X,
  MessageSquare,
  Power,
  Loader2, // آیکون برای حالت لودینگ
} from "lucide-react";

// --- نوع داده بسته پیامکی ساده شده ---
interface SmsPackage {
  id: number;

  count: number;       // تعداد پیامک
  isActive: boolean;   // وضعیت فعال/غیرفعال
}

// URL API Route
const API_URL = '/api/admin/sms-packs'; 

export default function SmsPlansPage() {
  const [packages, setPackages] = useState<SmsPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPkg, setCurrentPkg] = useState<SmsPackage | null>(null);

  // استیت‌های حذف
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pkgToDeleteId, setPkgToDeleteId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false); // استیت برای دکمه‌های فرم

  // --- تابع اصلی برای دریافت داده‌ها (GET) و رفرش لیست ---
  const fetchPackages = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch SMS packs');
      }
      const data = await response.json();
      // فرض: خروجی API شما { sms_packs: [...] } است
      setPackages(data.sms_packs);
    } catch (error) {
      console.error('Error fetching SMS packs:', error);
      // می‌توانید یک پیام خطای کاربر پسند نیز نمایش دهید
    } finally {
      setLoading(false);
    }
  }, []);

  // --- بارگذاری اولیه داده‌ها ---
  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  // --- فرمت اعداد ---
  const formatCount = (count: number) => count.toLocaleString("fa-IR");

  // --- هندلر باز کردن مودال (برای افزودن یا ویرایش) ---
  const handleOpenModal = (pkg: SmsPackage | null = null) => {
    setCurrentPkg(pkg);
    setIsModalOpen(true);
  };
  
  // --- هندلر ذخیره (ارتباط واقعی با API POST/PUT) ---
  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.target as HTMLFormElement);

    const newPkgData = {
  
      count: Number(formData.get("count")),
      isActive: formData.get("isActive") === "on",
    };
    
    let url = API_URL;
    let method = 'POST';

    if (currentPkg) {
      // ویرایش (PUT)
      url = `${API_URL}?id=${currentPkg.id}`;
      method = 'PUT';
    }

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPkgData),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${currentPkg ? 'update' : 'create'} package`);
      }
      
      // پس از موفقیت، لیست را دوباره از دیتابیس بارگذاری کنید
      await fetchPackages();

    } catch (error) {
      console.error('Save Error:', error);
      alert('خطا در ذخیره بسته پیامکی. کنسول را بررسی کنید.');
    } finally {
      setIsSaving(false);
      setIsModalOpen(false);
    }
  };

  // --- هندلر حذف (ارتباط واقعی با API DELETE) ---
  const confirmDelete = async () => {
    if (!pkgToDeleteId) return;

    setLoading(true);
    setIsDeleteModalOpen(false);
    
    try {
      const response = await fetch(`${API_URL}?id=${pkgToDeleteId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete package');
      }

      // پس از حذف موفقیت‌آمیز، لیست را رفرش کنید
      await fetchPackages();

    } catch (error) {
      console.error('Delete Error:', error);
      alert('خطا در حذف بسته پیامکی. کنسول را بررسی کنید.');
    } finally {
      setLoading(false);
      setPkgToDeleteId(null);
    }
  };

  // --- هندلر تغییر وضعیت (ارتباط واقعی با API PUT) ---
  const toggleStatus = async (pkg: SmsPackage) => {
    // باید یک PUT برای به‌روزرسانی وضعیت ارسال شود
    setLoading(true);
    const updatedStatus = !pkg.isActive;
    
    try {
        const response = await fetch(`${API_URL}?id=${pkg.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              
                count: pkg.count, 
                isActive: updatedStatus 
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to toggle status');
        }

        // پس از موفقیت، لیست را رفرش کنید
        await fetchPackages();

    } catch (error) {
        console.error('Toggle Status Error:', error);
        alert('خطا در تغییر وضعیت بسته. کنسول را بررسی کنید.');
    } finally {
        setLoading(false);
    }
  };

  if (loading && packages.length === 0) {
    return (
      <div className="text-center text-white p-20 flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <p>در حال بارگذاری بسته‌ها از دیتابیس...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Smartphone className="text-emerald-400 w-7 h-7" />
            مدیریت بسته‌های پیامک
            {loading && <Loader2 className="w-5 h-5 animate-spin text-gray-500" />}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            مشاهده و ویرایش بسته‌ها بر اساس تعداد پیامک و وضعیت فعال بودن.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          disabled={loading || isSaving}
          className="bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          بسته پیامک جدید
        </button>
      </div>

      {/* --- Packages Grid --- */}
      {packages.length === 0 && !loading ? (
        <div className="text-center p-10 border border-gray-700 rounded-xl text-gray-400">
            هنوز هیچ بسته‌ای تعریف نشده است.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {packages.map((pkg) => {
            return (
              <div
                key={pkg.id}
                className={`
                  relative bg-[#242933] rounded-2xl border transition-all duration-300 group overflow-hidden p-6 space-y-4
                  ${
                    pkg.isActive
                      ? "border-emerald-500/20 hover:border-emerald-500/40"
                      : "border-gray-700 opacity-75 grayscale-[0.5] hover:border-red-500/40"
                  }
                `}
              >
                {/* Top Banner Gradient */}
                <div
                  className={`absolute top-0 inset-x-0 h-1 ${
                    pkg.isActive
                      ? "bg-linear-to-r from-emerald-500 to-blue-500"
                      : "bg-gray-500/50"
                  }`}
                ></div>

                <div className="flex items-center justify-between">
                  <div
                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                      pkg.isActive
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                    }`}
                  >
                    <Power className="w-3 h-3" />
                    {pkg.isActive ? "فعال" : "غیرفعال"}
                  </div>
                </div>

                {/* Package Count (Hero) */}
                <div className="text-center bg-[#1a1e26] rounded-xl p-4 border border-white/5">
                  <p className="text-xs text-gray-400 mb-1">تعداد پیامک:</p>
                  <h3 className="text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
                    {formatCount(pkg.count)}
                    <MessageSquare className="w-5 h-5 text-gray-600 mb-1" />
                  </h3>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => toggleStatus(pkg)}
                    disabled={loading}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border transition disabled:opacity-50 disabled:cursor-not-allowed ${
                      pkg.isActive
                        ? "border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
                        : "border-red-500/20 text-red-400 hover:bg-red-500/10"
                    }`}
                  >
                    {pkg.isActive ? "غیرفعال کردن" : "فعال کردن"}
                  </button>
                  <button
                    onClick={() => handleOpenModal(pkg)}
                    disabled={loading}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setPkgToDeleteId(pkg.id);
                      setIsDeleteModalOpen(true);
                    }}
                    disabled={loading}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- MODAL (فرم افزودن/ویرایش) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#242933] border border-emerald-500/30 rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-emerald-500/20 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">
                {currentPkg ? "ویرایش بسته" : "تعریف بسته جدید"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSavePackage} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">عنوان بسته</label>
               
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">تعداد پیامک</label>
                <input
                  type="number"
                  name="count"
                  defaultValue={currentPkg?.count}
                  required
                  min="1"
                  className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-3 text-sm focus:border-emerald-400 outline-none text-white transition"
                />
              </div>

              {/* Status Toggle - فقط isActive */}
              <div className="flex items-center gap-6 pt-2 bg-[#1a1e26] p-3 rounded-xl border border-white/5">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="isActive"
                    defaultChecked={currentPkg?.isActive ?? true}
                    className="w-4 h-4 rounded border-gray-600 bg-[#242933] text-emerald-500 focus:ring-emerald-500 accent-emerald-500"
                  />
                  <span className="text-xs text-gray-300 group-hover:text-white transition">
                    وضعیت فعال
                  </span>
                </label>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-700 transition disabled:opacity-50"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 rounded-xl bg-linear-to-r from-emerald-500 to-emerald-600 text-white font-bold hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {currentPkg ? "بروزرسانی" : "ایجاد بسته"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE MODAL --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#242933] border border-red-500/30 rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              حذف بسته پیامکی
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              آیا از حذف این بسته اطمینان دارید؟ این عمل غیرقابل بازگشت است.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-700 transition"
              >
                لغو
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 shadow-lg shadow-red-500/20 transition"
              >
                بله، حذف کن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}