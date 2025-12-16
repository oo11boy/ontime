// File Path: src\app\(client pages)\clientdashboard\services\page.tsx

"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Scissors,
  Plus,
  Edit2,
  Trash2,
  ArrowLeft,
  Clock,
  Tag,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Footer from "../components/Footer/Footer";
import { toast, Toaster } from "react-hot-toast";

interface Service {
  id: number;
  name: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
}

export default function ServicesListPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Service | null>(null);
  const [form, setForm] = useState({ 
    name: "", 
    price: "", 
    duration_minutes: "30" 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // فرمت کردن قیمت
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price) + " تومان";
  };

  // دریافت سرویس‌ها از API
  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/client/services');
      const data = await response.json();
      
      if (data.success) {
        setServices(data.services || []);
      } else {
        toast.error(data.message || "خطا در دریافت خدمات");
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const openAddModal = () => {
    setEditData(null);
    setForm({ name: "", price: "", duration_minutes: "30" });
    setModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    setEditData(service);
    setForm({
      name: service.name,
      price: service.price.toString(),
      duration_minutes: service.duration_minutes.toString(),
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("نام خدمت الزامی است");
      return;
    }

    if (!form.duration_minutes || parseInt(form.duration_minutes) <= 0) {
      toast.error("مدت زمان باید بیشتر از صفر باشد");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editData 
        ? `/api/client/services/${editData.id}`
        : '/api/client/services';
      
      const method = editData ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          price: form.price ? parseFloat(form.price) : 0,
          duration_minutes: parseInt(form.duration_minutes),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        setModalOpen(false);
        fetchServices(); // رفرش لیست
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error saving service:", error);
      toast.error("خطا در ذخیره‌سازی");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("آیا از حذف این خدمت اطمینان دارید؟")) return;

    try {
      const response = await fetch(`/api/client/services/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        fetchServices(); // رفرش لیست
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("خطا در حذف خدمت");
    }
  };

  const toggleServiceStatus = async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/client/services/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_active: !currentStatus,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        fetchServices(); // رفرش لیست
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error toggling service:", error);
      toast.error("خطا در تغییر وضعیت");
    }
  };

  return (
    <div className="h-screen text-white overflow-auto max-w-md m-auto">
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1a1e26',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
          },
        }}
      />
      
      <div className="min-h-screen bg-linear-to-br from-[#1a1e26] to-[#242933] text-white pb-24">
        <header className="sticky top-0 z-50 bg-[#0f1117]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center active:scale-90 hover:bg-white/20 transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold">خدمات من</h1>
          <button
            onClick={openAddModal}
            className="bg-linear-to-r from-emerald-500 to-emerald-600 px-4 py-2 rounded-xl text-sm font-bold active:scale-90 hover:from-emerald-600 hover:to-emerald-700 transition"
          >
            افزودن
          </button>
        </header>

        {/* دکمه رفرش */}
        <div className="px-4 mt-3">
          <button
            onClick={fetchServices}
            disabled={isLoading}
            className="w-full bg-white/10 hover:bg-white/20 rounded-xl px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'در حال دریافت...' : 'بروزرسانی لیست'}
          </button>
        </div>

        {/* لیست سرویس‌ها */}
        <div className="px-4 mt-4 space-y-3">
          {isLoading ? (
            // Loading state
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-4 animate-pulse">
                <div className="flex justify-between items-center">
                  <div className="space-y-2 flex-1 mr-3">
                    <div className="h-4 bg-white/10 rounded w-24"></div>
                    <div className="h-3 bg-white/10 rounded w-16"></div>
                    <div className="h-3 bg-white/10 rounded w-20"></div>
                  </div>
                  <div className="w-20 h-20 bg-white/10 rounded-xl"></div>
                </div>
              </div>
            ))
          ) : services.length === 0 ? (
            // Empty state
            <div className="text-center py-12">
              <Scissors className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-400 mb-2">هنوز خدمتی اضافه نکرده‌اید</h3>
              <p className="text-gray-500 text-sm mb-6">
                خدمات خود را اضافه کنید تا در هنگام رزرو نوبت در دسترس باشند
              </p>
              <button
                onClick={openAddModal}
                className="bg-linear-to-r from-emerald-500 to-emerald-600 rounded-xl px-6 py-3 font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                افزودن اولین خدمت
              </button>
            </div>
          ) : (
            // Services list
            services.map((service) => (
              <div
                key={service.id}
                className={`bg-white/5 border rounded-xl p-4 flex justify-between items-center transition-all ${
                  service.is_active 
                    ? 'border-emerald-500/30 bg-emerald-500/5' 
                    : 'border-gray-500/30 bg-gray-500/5 opacity-70'
                }`}
              >
                <div className="text-right flex-1 mr-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg">{service.name}</h3>
                    <button
                      onClick={() => toggleServiceStatus(service.id, service.is_active)}
                      className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
                      title={service.is_active ? 'غیرفعال کردن' : 'فعال کردن'}
                    >
                      {service.is_active ? (
                        <Eye className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  
                  <p className="text-emerald-300 text-sm mt-2 flex gap-1 items-center">
                    <Tag className="w-4 h-4" />
                    {formatPrice(service.price)}
                  </p>
                  <p className="text-gray-400 text-sm mt-1 flex gap-1 items-center">
                    <Clock className="w-4 h-4" />
                    {service.duration_minutes} دقیقه
                  </p>
                  
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => openEditModal(service)}
                      className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-medium transition flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      ویرایش
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-medium transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      حذف
                    </button>
                  </div>
                </div>

                <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center">
                  <Scissors className={`w-8 h-8 ${service.is_active ? 'text-emerald-400' : 'text-gray-400'}`} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Floating Add Button */}
        <button
          onClick={openAddModal}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 w-16 h-16 bg-linear-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl active:scale-95 hover:from-emerald-600 hover:to-emerald-700 transition"
        >
          <Plus className="w-7 h-7" />
        </button>

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-linear-to-b from-[#1a1e26] to-[#242933] w-full max-w-sm rounded-2xl p-5 border border-white/10 shadow-2xl">
              <h2 className="text-lg font-bold mb-4 text-center">
                {editData ? "ویرایش خدمت" : "افزودن خدمت جدید"}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">نام خدمت *</label>
                  <input
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50"
                    placeholder="مثال: کوتاهی مو"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-300 mb-1 block">قیمت (تومان)</label>
                    <input
                      type="number"
                      className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50"
                      placeholder="مثال: 80000"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-300 mb-1 block">مدت زمان (دقیقه) *</label>
                    <input
                      type="number"
                      min="1"
                      max="480"
                      className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50"
                      placeholder="مثال: 45"
                      value={form.duration_minutes}
                      onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between gap-3 mt-6">
                <button
                  onClick={() => setModalOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition font-medium disabled:opacity-50"
                >
                  انصراف
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !form.name.trim()}
                  className="flex-1 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 transition font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      در حال ذخیره...
                    </>
                  ) : (
                    'ذخیره'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}