// components/CustomerList/ClientCard.tsx
import { User, Trash2, AlertTriangle, X } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface ClientCardProps {
  client: {
    id: string;
    name: string;
    phone: string;
    lastVisit: string;
    total_bookings: number;
    is_blocked: boolean;
    last_booking_date?: string;
  };
  formatPhone: (phone: string) => string;
  onDelete?: (clientId: string) => void;
}

export const ClientCard: React.FC<ClientCardProps> = ({ client, formatPhone, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeBookingsCount, setActiveBookingsCount] = useState(0);
  const [hasActiveBookings, setHasActiveBookings] = useState(false);

  const checkAndShowModal = async () => {
    setIsDeleting(true);
    try {
      const checkResponse = await fetch(
        `/api/client/customers/check-bookings?clientId=${client.id}`
      );
      const checkData = await checkResponse.json();
      
      if (checkData.hasActiveBookings) {
        setActiveBookingsCount(checkData.activeBookingsCount);
        setHasActiveBookings(true);
        setShowDeleteModal(true);
      } else {
        setHasActiveBookings(false);
        setShowDeleteModal(true);
      }
    } catch (error) {
      toast.error("خطا در بررسی وضعیت مشتری");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDelete = async (forceDelete: boolean = false) => {
    setIsDeleting(true);
    try {
      const response = await fetch("/api/client/customers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: client.id, forceDelete }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        if (onDelete) onDelete(client.id);
        setShowDeleteModal(false);
        setHasActiveBookings(false);
        setActiveBookingsCount(0);
      } else {
        toast.error(data.message || "خطا در حذف مشتری");
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteClick = () => {
    checkAndShowModal();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`bg-white/80 dark:bg-gray-50/5 backdrop-blur-sm rounded-xl border p-4 hover:bg-white dark:hover:bg-gray-50/10 transition-all duration-200 shadow-sm dark:shadow-none ${
          client.is_blocked
            ? "border-rose-300 dark:border-red-500/50"
            : "border-emerald-200 dark:border-emerald-500/20 hover:border-emerald-300 dark:hover:border-emerald-400/60"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg shadow-md ${
                client.is_blocked
                  ? "bg-rose-100 dark:bg-red-500/20 text-rose-600 dark:text-red-400"
                  : "bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-400 dark:to-emerald-600 text-white"
              }`}
            >
              {client.name ? client.name[0] : "?"}
            </div>
            <div className="text-right">
              <h3 className="font-bold text-slate-800 dark:text-white">
                {client.name}
                {client.is_blocked ? (
                  <span className="text-xs text-rose-600 dark:text-red-400 mr-2">بلاک شده</span>
                ) : (
                  ""
                )}
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400">{formatPhone(client.phone)}</p>
              {client.last_booking_date && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">{client.total_bookings} نوبت</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-left">
              <p className="text-xs text-slate-400 dark:text-gray-500">آخرین مراجعه</p>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {client.lastVisit || "ندارد"}
              </p>
            </div>
            
            {/* دکمه حذف */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="p-2 rounded-lg bg-rose-50 dark:bg-red-500/10 hover:bg-rose-100 dark:hover:bg-red-500/20 text-rose-600 dark:text-red-400 transition-all disabled:opacity-50"
              title="حذف مشتری"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
            
            <Link
              href={`/clientdashboard/customers/profile/${encodeURIComponent(
                client.phone
              )}`}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-500 dark:to-emerald-600 px-4 py-2.5 rounded-lg text-white text-sm font-medium flex items-center gap-1.5 hover:from-emerald-600 hover:to-emerald-700 dark:hover:from-emerald-600 dark:hover:to-emerald-700 transition-all shadow-sm dark:shadow-none"
            >
              <User className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* مودال یکپارچه حذف مشتری */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-[#1a1e26] rounded-2xl p-6 max-w-sm w-full shadow-xl dark:shadow-2xl border border-slate-200/60 dark:border-white/10 relative"
            >
              {/* دکمه بستن */}
              <button
                onClick={() => setShowDeleteModal(false)}
                className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-slate-400 dark:text-gray-400" />
              </button>

              {/* آیکون و عنوان */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  hasActiveBookings 
                    ? "bg-rose-100 dark:bg-red-500/20" 
                    : "bg-rose-100 dark:bg-red-500/20"
                }`}>
                  <AlertTriangle className={`w-6 h-6 ${
                    hasActiveBookings ? "text-rose-600 dark:text-red-400" : "text-rose-600 dark:text-red-400"
                  }`} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                    {hasActiveBookings ? "حذف اجباری مشتری" : "حذف مشتری"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-gray-500">غیرقابل بازگشت</p>
                </div>
              </div>
              
              {/* پیام اصلی */}
              <p className="text-slate-600 dark:text-gray-300 mb-3">
                آیا از حذف مشتری <span className="text-emerald-600 dark:text-emerald-400 font-bold">{client.name}</span> مطمئن هستید؟
              </p>
              
              {/* نمایش هشدار در صورت وجود نوبت فعال */}
              {hasActiveBookings && (
                <>
                  <p className="text-slate-600 dark:text-gray-300 mb-2">
                    این مشتری دارای 
                    <span className="text-rose-600 dark:text-red-400 font-bold mx-1">{activeBookingsCount}</span> 
                    نوبت فعال است.
                  </p>
                  <div className="bg-amber-50 dark:bg-yellow-500/10 border border-amber-200 dark:border-yellow-500/30 rounded-lg p-3 mb-6">
                    <p className="text-amber-700 dark:text-yellow-400 text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      با حذف اجباری، تمام نوبت‌های فعال این مشتری نیز لغو خواهند شد.
                    </p>
                  </div>
                </>
              )}
              
              {/* دکمه‌های اقدام */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-600 dark:text-gray-300 font-medium hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                >
                  انصراف
                </button>
                <button
                  onClick={() => handleDelete(hasActiveBookings)}
                  disabled={isDeleting}
                  className={`flex-1 py-3 rounded-xl text-white font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                    hasActiveBookings 
                      ? "bg-rose-600 hover:bg-rose-700 dark:bg-red-500 dark:hover:bg-red-600" 
                      : "bg-rose-600 hover:bg-rose-700 dark:bg-red-500 dark:hover:bg-red-600"
                  }`}
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      در حال حذف...
                    </>
                  ) : (
                    hasActiveBookings ? "حذف اجباری" : "حذف مشتری"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};