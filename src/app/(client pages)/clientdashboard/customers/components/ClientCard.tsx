// components/CustomerList/ClientCard.tsx
import { User, Trash2, AlertTriangle, X } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { toast } from "react-hot-toast";

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
      // ابتدا بررسی می‌کنیم که مشتری نوبت فعال دارد یا نه
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
      <div
        className={`bg-gray-50/5 backdrop-blur-sm rounded-xl border p-4 hover:bg-gray-50/10 transition-all ${
          client.is_blocked
            ? "border-red-500/50"
            : "border-emerald-500/20 hover:border-emerald-400/60"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                client.is_blocked
                  ? "bg-red-500/20 text-red-400"
                  : "bg-gradient-to-br from-emerald-400 to-emerald-600"
              }`}
            >
              {client.name ? client.name[0] : "?"}
            </div>
            <div className="text-right">
              <h3 className="font-bold text-white">
                {client.name}
                {client.is_blocked ? (
                  <span className="text-xs text-red-400 mr-2">بلاک شده</span>
                ) : (
                  ""
                )}
              </h3>
              <p className="text-xs text-gray-400">{formatPhone(client.phone)}</p>
              {client.last_booking_date && (
                <p className="text-xs text-emerald-400 mt-1">{client.total_bookings} نوبت</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-left">
              <p className="text-xs text-gray-500">آخرین مراجعه</p>
              <p className="text-sm font-bold text-emerald-400">
                {client.lastVisit || "ندارد"}
              </p>
            </div>
            
            {/* دکمه حذف */}
            <button
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all disabled:opacity-50"
              title="حذف مشتری"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            
            <Link
              href={`/clientdashboard/customers/profile/${encodeURIComponent(
                client.phone
              )}`}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2.5 rounded-lg text-white text-sm font-medium flex items-center gap-1.5 hover:from-emerald-600 hover:to-emerald-700"
            >
              <User className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* مودال یکپارچه حذف مشتری */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1e26] rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-white/10">
            {/* دکمه بستن */}
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            {/* آیکون و عنوان */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                hasActiveBookings 
                  ? "bg-red-500/20" 
                  : "bg-red-500/20"
              }`}>
                <AlertTriangle className={`w-6 h-6 ${
                  hasActiveBookings ? "text-red-400" : "text-red-400"
                }`} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {hasActiveBookings ? "حذف اجباری مشتری" : "حذف مشتری"}
                </h3>
                <p className="text-xs text-gray-500">غیرقابل بازگشت</p>
              </div>
            </div>
            
            {/* پیام اصلی */}
            <p className="text-gray-300 mb-3">
              آیا از حذف مشتری <span className="text-emerald-400 font-bold">{client.name}</span> مطمئن هستید؟
            </p>
            
            {/* نمایش هشدار در صورت وجود نوبت فعال */}
            {hasActiveBookings && (
              <>
                <p className="text-gray-300 mb-2">
                  این مشتری دارای 
                  <span className="text-red-400 font-bold mx-1">{activeBookingsCount}</span> 
                  نوبت فعال است.
                </p>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-6">
                  <p className="text-yellow-400 text-sm flex items-center gap-2">
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
                className="flex-1 py-3 bg-white/5 rounded-xl text-gray-300 font-medium hover:bg-white/10 transition-all"
              >
                انصراف
              </button>
              <button
                onClick={() => handleDelete(hasActiveBookings)}
                disabled={isDeleting}
                className={`flex-1 py-3 rounded-xl text-white font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                  hasActiveBookings 
                    ? "bg-red-500 hover:bg-red-600" 
                    : "bg-red-500 hover:bg-red-600"
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
          </div>
        </div>
      )}
    </>
  );
};