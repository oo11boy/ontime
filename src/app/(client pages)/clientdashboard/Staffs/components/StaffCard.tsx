"use client";
import React, { useState } from "react";
import {
  Users,
  Edit2,
  Trash2,
  Phone,
  Database,
  Calendar,
  AlertTriangle,
  Scissors,
  Eye,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Service {
  id: number;
  name: string;
}

interface Staff {
  id: number;
  name: string;
  phone: string;
  sms_balance: number;
  sms_used: number;
  service_ids: string | null;
  services: Service[];
  calendar_type: string;
  can_see_all_clients: boolean;
  is_active: boolean;
  active_bookings?: number;
  created_at: string;
}

interface StaffCardProps {
  staff: Staff;
  onEdit: (staff: Staff) => void;
  onDelete: (id: number, force?: boolean) => void;
}

// مودال تایید حذف عادی
const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  name,
  activeBookings,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  name: string;
  activeBookings?: number;
}) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-[#1a1e26] border border-white/10 w-full max-w-[320px] rounded-[32px] p-6 shadow-2xl text-center"
        >
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-white font-bold text-lg mb-2">حذف پرسنل؟</h3>
          <p className="text-gray-400 text-sm mb-4 leading-relaxed">
            آیا از حذف{" "}
            <span className="text-white font-semibold">"{name}"</span> اطمینان
            دارید؟
          </p>
          {activeBookings && activeBookings > 0 && (
            <p className="text-amber-400 text-xs mb-4 bg-amber-500/10 p-2 rounded-xl">
              ⚠️ این پرسنل {activeBookings} نوبت فعال دارد.
              <br />
              ابتدا نوبت‌ها را لغو کنید یا از حذف اجباری استفاده نمایید.
            </p>
          )}
          <div className="flex flex-col gap-2">
            <button
              onClick={onConfirm}
              className="w-full py-4 rounded-2xl font-bold transition-all active:scale-95 bg-red-600 hover:bg-red-500 text-white"
            >
              بله، حذف شود
            </button>
            <button
              onClick={onClose}
              className="w-full py-4 rounded-2xl bg-white/5 text-gray-400 font-semibold hover:bg-white/10 transition-all"
            >
              انصراف
            </button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

// مودال حذف اجباری
const ForceDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  name,
  activeBookings,
  isDeleting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  name: string;
  activeBookings: number;
  isDeleting: boolean;
}) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-[#1a1e26] border border-red-500/30 w-full max-w-[320px] rounded-[32px] p-6 shadow-2xl text-center"
        >
          <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-white font-bold text-lg mb-2">حذف اجباری پرسنل</h3>
          <p className="text-gray-400 text-sm mb-4 leading-relaxed">
            پرسنل <span className="text-red-400 font-bold">"{name}"</span> دارای{" "}
            <span className="text-yellow-400 font-bold">{activeBookings}</span>{" "}
            نوبت فعال است.
          </p>
          <p className="text-yellow-400 text-xs mb-4 bg-yellow-500/10 p-2 rounded-xl">
            ⚠️ با حذف اجباری، تمام نوبت‌های فعال این پرسنل لغو خواهند شد.
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="w-full py-4 rounded-2xl font-bold transition-all active:scale-95 bg-red-600 hover:bg-red-500 text-white disabled:bg-red-800/50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "بله، حذف اجباری شود"
              )}
            </button>
            <button
              onClick={onClose}
              className="w-full py-4 rounded-2xl bg-white/5 text-gray-400 font-semibold hover:bg-white/10 transition-all"
            >
              انصراف
            </button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export const StaffCard: React.FC<StaffCardProps> = ({
  staff,
  onEdit,
  onDelete,
}) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isForceDeleteModalOpen, setIsForceDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleNormalDelete = () => {
    setIsDeleting(true);
    onDelete(staff.id, false);
    setIsDeleteModalOpen(false);
    setTimeout(() => setIsDeleting(false), 500);
  };

  const handleForceDelete = () => {
    setIsDeleting(true);
    onDelete(staff.id, true);
    setIsForceDeleteModalOpen(false);
    setTimeout(() => setIsDeleting(false), 500);
  };

  const handleDeleteClick = () => {
    if (staff.active_bookings && staff.active_bookings > 0) {
      // اگر نوبت فعال دارد، مودال حذف اجباری را نشان بده
      setIsForceDeleteModalOpen(true);
    } else {
      // اگر نوبت فعال ندارد، مودال عادی را نشان بده
      setIsDeleteModalOpen(true);
    }
  };

  const getCalendarLabel = (type: string) => {
    return type === "synced" ? "هماهنگ با اصلی" : "مستقل";
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("fa-IR").format(num);
  };

  const displayServices = staff.services?.slice(0, 3) || [];
  const remainingCount = (staff.services?.length || 0) - 3;

  // محاسبه درصد مصرف پیامک
  const totalSms = staff.sms_balance + staff.sms_used;
  const usagePercent = totalSms > 0 ? (staff.sms_used / totalSms) * 100 : 0;

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/[0.03] border border-white/10 rounded-[28px] p-5 transition-all duration-300 hover:border-emerald-500/40 hover:bg-white/[0.05]"
      >
        <div className="flex items-start justify-between">
          <div className="flex gap-4 items-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">{staff.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Phone className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-gray-400 text-sm dir-ltr">
                  {staff.phone}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="my-4 border-t border-white/5" />

        {/* آمار پیامک */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Database className="w-3 h-3" />
              وضعیت پیامک
            </p>
            <span className="text-[10px] text-gray-500">
              مصرف {usagePercent.toFixed(0)}%
            </span>
          </div>

          {/* نوار پیشرفت */}
          <div className="w-full bg-white/10 rounded-full h-2 mb-3">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                usagePercent > 80
                  ? "bg-red-500"
                  : usagePercent > 50
                  ? "bg-yellow-500"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <p className="text-[10px] text-gray-500">تعداد کل پیامک ها</p>
              <p className="text-white font-bold text-sm">
                {formatNumber(totalSms)}
              </p>
            </div>
            <div className="text-center flex-1 border-x border-white/10">
              <p className="text-[10px] text-gray-500 flex items-center justify-center gap-1">
                <TrendingDown className="w-3 h-3 text-red-400" />
                مصرف شده
              </p>
              <p className="text-red-400 font-bold text-sm">
                {formatNumber(staff.sms_used)}
              </p>
            </div>
            <div className="text-center flex-1">
              <p className="text-[10px] text-gray-500 flex items-center justify-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                باقی‌مانده
              </p>
              <p className="text-emerald-400 font-bold text-sm">
                {formatNumber(staff.sms_balance)}
              </p>
            </div>
          </div>
        </div>

        {/* آمار ساده */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-white/5 rounded-xl p-2 text-center">
            <Calendar className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <p className="text-[10px] text-gray-400">تقویم</p>
            <p className="font-bold text-white text-xs">
              {getCalendarLabel(staff.calendar_type)}
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-2 text-center">
            <Eye className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <p className="text-[10px] text-gray-400">دسترسی</p>
            <p className="font-bold text-white text-[10px]">
              {staff.can_see_all_clients ? "همه مشتریان" : "مشتریان خود"}
            </p>
          </div>
        </div>

        {/* خدمات مجاز */}
        {staff.services && staff.services.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
              <Scissors className="w-3 h-3" />
              خدمات مجاز:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {displayServices.map((service) => (
                <span
                  key={service.id}
                  className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full"
                >
                  {service.name}
                </span>
              ))}
              {remainingCount > 0 && (
                <span className="text-xs bg-white/5 px-2.5 py-1 rounded-full text-gray-400">
                  +{remainingCount} مورد
                </span>
              )}
            </div>
          </div>
        )}

        {/* دکمه‌های اقدام */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => onEdit(staff)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-blue-500/10 text-gray-300 hover:text-blue-400 text-sm font-bold transition-all border border-transparent hover:border-blue-500/30"
          >
            <Edit2 className="w-4 h-4" />
            ویرایش
          </button>
          <button
            onClick={handleDeleteClick}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-red-500/10 text-gray-300 hover:text-red-400 text-sm font-bold transition-all border border-transparent hover:border-red-500/30"
          >
            <Trash2 className="w-4 h-4" />
            حذف
          </button>
        </div>

        {/* وضعیت و تاریخ */}
        <div className="mt-3 flex justify-between items-center">
          <span className="text-[10px] uppercase tracking-wider text-gray-500">
            ثبت شده در {new Date(staff.created_at).toLocaleDateString("fa-IR")}
          </span>
          <span
            className={`text-[10px] uppercase font-bold px-2 py-1 rounded-lg ${
              staff.is_active
                ? "text-emerald-500 bg-emerald-500/10"
                : "text-gray-500 bg-white/5"
            }`}
          >
            {staff.is_active ? "فعال" : "غیرفعال"}
          </span>
        </div>
      </motion.div>

      {/* مودال‌ها */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        name={staff.name}
        activeBookings={staff.active_bookings}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleNormalDelete}
      />

      <ForceDeleteModal
        isOpen={isForceDeleteModalOpen}
        name={staff.name}
        activeBookings={staff.active_bookings || 0}
        isDeleting={isDeleting}
        onClose={() => setIsForceDeleteModalOpen(false)}
        onConfirm={handleForceDelete}
      />
    </>
  );
};