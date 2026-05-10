"use client";
import React, { useState, useEffect } from "react";
import { X, PlusCircle, Edit3, RefreshCw, Users, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserServices } from "@/hooks/useStaffs";
import { toast } from "react-hot-toast";

interface Staff {
  id: number;
  name: string;
  phone: string;
  sms_balance: number;
  service_ids: string | null;
  calendar_type: string;
  can_see_all_clients: boolean | number;
  is_active: boolean;
}

interface StaffModalProps {
  isOpen: boolean;
  editData: Staff | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export const StaffModal: React.FC<StaffModalProps> = ({
  isOpen,
  editData,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const { data: servicesData, isLoading: servicesLoading } = useUserServices();
  const services = servicesData?.services || [];

  const [form, setForm] = useState({
    name: "",
    phone: "",
    sms_balance: "0",
    service_ids: [] as string[],
    calendar_type: "synced" as "synced" | "independent",
    can_see_all_clients: false,
  });

  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name,
        phone: editData.phone,
        sms_balance: editData.sms_balance.toString(),
        service_ids: editData.service_ids
          ? editData.service_ids.split(",")
          : [],
        calendar_type: editData.calendar_type as "synced" | "independent",
        can_see_all_clients:
          editData.can_see_all_clients === 1 ||
          editData.can_see_all_clients === true,
      });
    } else {
      setForm({
        name: "",
        phone: "",
        sms_balance: "0",
        service_ids: [],
        calendar_type: "synced",
        can_see_all_clients: false,
      });
    }
  }, [editData, isOpen]);

  const handleServiceToggle = (serviceId: number) => {
    setForm((prev) => ({
      ...prev,
      service_ids: prev.service_ids.includes(serviceId.toString())
        ? prev.service_ids.filter((id) => id !== serviceId.toString())
        : [...prev.service_ids, serviceId.toString()],
    }));
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast.error("نام پرسنل الزامی است");
      return;
    }
    if (!form.phone.trim()) {
      toast.error("شماره تماس الزامی است");
      return;
    }

    const smsBalanceNum = parseInt(form.sms_balance) || 0;
    if (smsBalanceNum < 0) {
      toast.error("مقدار پیامک نمی‌تواند منفی باشد");
      return;
    }

    onSubmit({
      name: form.name.trim(),
      phone: form.phone.trim(),
      sms_balance: smsBalanceNum,
      service_ids:
        form.service_ids.length > 0 ? form.service_ids.join(",") : null,
      calendar_type: form.calendar_type,
      can_see_all_clients: form.can_see_all_clients,
      ...(editData && { id: editData.id }),
    });
  };

  const isEditMode = !!editData;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center p-4"
          dir="rtl"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="relative bg-[#1a1e26] w-full max-w-sm rounded-[2.5rem] p-6 border border-white/10 shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 blur-[80px] -z-10 rounded-full" />

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  {editData ? <Edit3 size={22} /> : <Users size={22} />}
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">
                    {editData ? "ویرایش پرسنل" : "پرسنل جدید"}
                  </h2>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                    Staff Management
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5">
              {/* نام و نام خانوادگی */}
              <div>
                <label className="text-xs font-bold text-gray-400 mr-2 block mb-2">
                  نام و نام خانوادگی
                </label>
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all"
                  placeholder="مثال: مریم احمدی"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>

              {/* شماره تماس */}
              <div>
                <label className="text-xs font-bold text-gray-400 mr-2 block mb-2">
                  شماره تماس
                </label>
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all dir-ltr"
                  placeholder="09123456789"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, phone: e.target.value }))
                  }
                />
              </div>

              {/* اعتبار پیامک */}
              <div>
                <label className="text-xs font-bold text-gray-400 mr-2 block mb-2">
                  {editData
                    ? "تعداد پیامک های باقیمانده"
                    : "تعداد پیامک های اولیه"}
                </label>
                <input
                  type="number"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                  placeholder="0"
                  min="0"
                  max="10000"
                  value={form.sms_balance}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || parseInt(value) >= 0) {
                      setForm((prev) => ({
                        ...prev,
                        sms_balance: value,
                      }));
                    }
                  }}
                />
                <p className="text-xs text-gray-500 mt-1 mr-2">
                  {editData
                    ? "با تغییر این مقدار، تفاوت آن از/به حساب اصلی منتقل می‌شود"
                    : "این مبلغ از اعتبار اصلی شما کم خواهد شد"}
                </p>
              </div>

              {/* نوع تقویم - در حالت ویرایش غیرفعال */}
              <div>
                <label className="text-xs font-bold text-gray-400 mr-2 block mb-2">
                  نوع تقویم
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      !isEditMode &&
                      setForm((prev) => ({ ...prev, calendar_type: "synced" }))
                    }
                    disabled={isEditMode}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                      form.calendar_type === "synced"
                        ? "bg-emerald-600 text-white"
                        : "bg-white/5 text-gray-400 hover:bg-white/10"
                    } ${isEditMode ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <Calendar className="w-4 h-4 inline ml-1" />
                    هماهنگ با اصلی
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      !isEditMode &&
                      setForm((prev) => ({
                        ...prev,
                        calendar_type: "independent",
                      }))
                    }
                    disabled={isEditMode}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                      form.calendar_type === "independent"
                        ? "bg-emerald-600 text-white"
                        : "bg-white/5 text-gray-400 hover:bg-white/10"
                    } ${isEditMode ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <Calendar className="w-4 h-4 inline ml-1" />
                    مستقل
                  </button>
                </div>
                {isEditMode && (
                  <p className="text-xs text-amber-500 mt-2 mr-2">
                    ⚠️ نوع تقویم قابل تغییر نیست
                  </p>
                )}
              </div>

              {/* دسترسی به مشتریان */}
              <div className="bg-white/5 rounded-xl p-4">
                <label className="text-xs font-bold text-gray-400 block mb-3">
                  دسترسی به مشتریان
                </label>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">
                      دسترسی به همه مشتریان
                    </p>
                    <p className="text-xs text-gray-500">
                      پرسنل می‌تواند لیست همه مشتریان را ببیند
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        can_see_all_clients: !prev.can_see_all_clients,
                      }))
                    }
                    className={`w-12 h-6 rounded-full transition-all ${
                      form.can_see_all_clients
                        ? "bg-emerald-500"
                        : "bg-white/20"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transform transition-transform  ${
                        form.can_see_all_clients
                          ? "-translate-x-6"
                          : "-translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* خدمات مجاز */}
              <div>
                <label className="text-xs font-bold text-gray-400 mr-2 block mb-3">
                  خدمات مجاز
                </label>
                {servicesLoading ? (
                  <div className="text-center py-4 text-gray-500">
                    در حال بارگذاری...
                  </div>
                ) : services.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    ابتدا در بخش خدمات، خدماتی تعریف کنید
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {services.map((service: any) => (
                      <label
                        key={service.id}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition"
                      >
                        <span className="text-white text-sm">
                          {service.name}
                        </span>
                        <input
                          type="checkbox"
                          checked={form.service_ids.includes(
                            service.id.toString(),
                          )}
                          onChange={() => handleServiceToggle(service.id)}
                          className="w-5 h-5 rounded-lg border-white/20 bg-white/5 checked:bg-emerald-500"
                        />
                      </label>
                    ))}
                  </div>
                )}
                {form.service_ids.length === 0 && (
                  <p className="text-xs text-amber-500 mt-2 mr-2">
                    اگر هیچ خدمتی انتخاب نکنید، پرسنل به هیچ خدمتی دسترسی نخواهد
                    داشت
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={onClose}
                className="flex-1 py-4 rounded-2xl bg-white/5 text-gray-400 font-bold hover:bg-white/10 transition-all"
              >
                انصراف
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-[2] py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-black shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {editData ? (
                      <Edit3 className="w-5 h-5" />
                    ) : (
                      <PlusCircle className="w-5 h-5" />
                    )}
                    {editData ? "ویرایش و ذخیره" : "افزودن پرسنل"}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
