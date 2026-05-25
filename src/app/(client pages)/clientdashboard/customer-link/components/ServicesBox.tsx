// src/app/clientdashboard/customer-link/components/ServicesBox.tsx
"use client";

import { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  Plus, 
  Trash2, 
  Edit2, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Loader2,
  Clock,
  DollarSign,
  ChevronRight
} from "lucide-react";
import { toast } from "react-hot-toast";

interface Service {
  id: number;
  name: string;
  price: number;
  duration_minutes: number;
  is_active?: boolean;
}

interface ServicesBoxProps {
  selectedServices: Service[];
  onServicesChange: (services: Service[]) => Promise<void>;
  isSaving?: boolean;
}

export function ServicesBox({
  selectedServices,
  onServicesChange,
  isSaving = false,
}: ServicesBoxProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tempSelectedIds, setTempSelectedIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // مودال افزودن خدمت جدید
  const [showAddModal, setShowAddModal] = useState(false);
  const [newService, setNewService] = useState({
    name: "",
    price: "",
    duration: "30",
  });
  const [isCreating, setIsCreating] = useState(false);

  // بررسی وضعیت تکمیل
  const checkCompletion = () => {
    const hasServices = selectedServices && selectedServices.length > 0;
    
    return {
      isComplete: hasServices,
      serviceCount: selectedServices?.length || 0,
    };
  };

  const { isComplete, serviceCount } = checkCompletion();

  // دریافت لیست خدمات از API
  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/client/services");
      const data = await res.json();
      if (data.success && data.services) {
        setAvailableServices(data.services);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("خطا در دریافت لیست خدمات");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      fetchServices();
      setTempSelectedIds(selectedServices.map(s => s.id));
    }
  }, [isModalOpen]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const toggleService = (serviceId: number) => {
    setTempSelectedIds(prev => 
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const selectedFullServices = availableServices.filter(s => 
        tempSelectedIds.includes(s.id)
      );
      await onServicesChange(selectedFullServices);
      setIsModalOpen(false);
      toast.success("خدمات با موفقیت ذخیره شد");
    } catch (error) {
      console.error("Error saving services:", error);
      toast.error("خطا در ذخیره خدمات");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateService = async () => {
    if (!newService.name.trim()) {
      toast.error("نام خدمت الزامی است");
      return;
    }

    setIsCreating(true);
    try {
      const res = await fetch("/api/client/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newService.name.trim(),
          price: parseFloat(newService.price) || 0,
          duration_minutes: parseInt(newService.duration) || 30,
        }),
      });

      const data = await res.json();
      if (data.success && data.service) {
        toast.success("خدمت با موفقیت اضافه شد");
        const createdService: Service = {
          id: data.service.id,
          name: data.service.name,
          price: data.service.price,
          duration_minutes: data.service.duration_minutes,
          is_active: true,
        };
        setAvailableServices(prev => [...prev, createdService]);
        setTempSelectedIds(prev => [...prev, createdService.id]);
        setShowAddModal(false);
        setNewService({ name: "", price: "", duration: "30" });
      } else {
        toast.error(data.message || "خطا در ایجاد خدمت");
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setIsCreating(false);
    }
  };

  const removeService = async (serviceId: number) => {
    const newServices = selectedServices.filter(s => s.id !== serviceId);
    try {
      await onServicesChange(newServices);
      toast.success("خدمت حذف شد");
    } catch (error) {
      toast.error("خطا در حذف خدمت");
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString() + " تومان";
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} دقیقه`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} ساعت و ${mins} دقیقه` : `${hours} ساعت`;
  };

  return (
    <>
      <div className="bg-white dark:bg-[#1a1e26] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
        {/* هدر */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white">
              خدمات
            </h3>
          </div>
          
          {isComplete ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 rounded-full">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                {serviceCount} خدمت
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-500/10 rounded-full">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                انتخاب نشده
              </span>
            </div>
          )}
        </div>

        {/* محتوا */}
        <div className="p-5">
          {!isComplete && (
            <div className="bg-amber-50 dark:bg-amber-500/10 rounded-xl p-3 mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  هنوز هیچ خدمتی انتخاب نکرده‌اید
                </p>
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-300 mt-1 mr-6">
                خدمات خود را اضافه کنید تا مشتریان بتوانند نوبت بگیرند
              </p>
            </div>
          )}

          {/* لیست خدمات انتخاب شده */}
          {selectedServices.length > 0 && (
            <div className="space-y-2 mb-4">
              {selectedServices.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl"
                >
                  <div className="flex-1">
                    <p className="font-medium text-slate-800 dark:text-white text-sm">
                      {service.name}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {formatPrice(service.price)}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(service.duration_minutes)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeService(service.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* دکمه ویرایش/افزودن */}
          <button
            onClick={handleOpenModal}
            disabled={isSaving}
            className="w-full py-2.5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {selectedServices.length > 0 ? "ویرایش خدمات" : "افزودن خدمات"}
          </button>
        </div>
      </div>

      {/* مودال انتخاب خدمات */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#1a1e26] rounded-2xl shadow-2xl overflow-hidden">
            {/* هدر مودال */}
            <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-white">
                انتخاب خدمات
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* لیست خدمات */}
            <div className="p-5 max-h-[60vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-slate-500">
                  {tempSelectedIds.length} خدمت انتخاب شده
                </span>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="text-xs bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-lg flex items-center gap-1"
                >
                  <Plus size={12} /> خدمت جدید
                </button>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                </div>
              ) : availableServices.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                  <p className="text-slate-500">هیچ خدمتی تعریف نشده است</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="mt-3 text-sm text-emerald-600 flex items-center gap-1 mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    اولین خدمت را اضافه کنید
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableServices.map((service) => {
                    const isSelected = tempSelectedIds.includes(service.id);
                    return (
                      <button
                        key={service.id}
                        onClick={() => toggleService(service.id)}
                        className={`w-full text-right p-3 rounded-xl transition-all ${
                          isSelected
                            ? "bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-700"
                            : "bg-slate-50 dark:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-slate-800 dark:text-white">
                              {service.name}
                            </p>
                            <div className="flex gap-3 mt-1">
                              <span className="text-xs text-slate-500">
                                {formatPrice(service.price)}
                              </span>
                              <span className="text-xs text-slate-500">
                                {formatDuration(service.duration_minutes)}
                              </span>
                            </div>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              isSelected
                                ? "bg-emerald-500 border-emerald-500"
                                : "border-gray-400"
                            }`}
                          >
                            {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* دکمه‌های مودال */}
            <div className="p-4 border-t border-slate-200 dark:border-white/10 flex gap-3">
              <button
                onClick={handleCloseModal}
                className="flex-1 py-2.5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium text-slate-700 dark:text-gray-300"
              >
                انصراف
              </button>
              <button
                onClick={handleSave}
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                ذخیره خدمات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال افزودن خدمت جدید */}
      {showAddModal && (
        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#1a1e26] rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 dark:text-white">
                افزودن خدمت جدید
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <input
                type="text"
                value={newService.name}
                onChange={(e) =>
                  setNewService({ ...newService, name: e.target.value })
                }
                placeholder="نام خدمت (مثال: کوتاهی مو)"
                className="w-full p-3 border dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-white/5 focus:border-emerald-500 outline-none dark:text-white"
              />
              <input
                type="number"
                value={newService.price}
                onChange={(e) =>
                  setNewService({ ...newService, price: e.target.value })
                }
                placeholder="قیمت (تومان)"
                className="w-full p-3 border dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-white/5 focus:border-emerald-500 outline-none dark:text-white"
              />
              <select
                value={newService.duration}
                onChange={(e) =>
                  setNewService({ ...newService, duration: e.target.value })
                }
                className="w-full p-3 border dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-white/5 focus:border-emerald-500 outline-none dark:text-white"
              >
                <option value="15">۱۵ دقیقه</option>
                <option value="30">۳۰ دقیقه</option>
                <option value="45">۴۵ دقیقه</option>
                <option value="60">۱ ساعت</option>
                <option value="90">۱.۵ ساعت</option>
                <option value="120">۲ ساعت</option>
                <option value="180">۳ ساعت</option>
              </select>
              <button
                onClick={handleCreateService}
                disabled={isCreating}
                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                افزودن خدمت
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}