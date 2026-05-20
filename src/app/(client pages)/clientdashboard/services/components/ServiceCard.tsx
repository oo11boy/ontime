"use client";
import React, { useState } from "react";
import { Scissors, Edit2, Trash2, Tag, Clock, Eye, EyeOff, AlertTriangle, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserType } from "@/hooks/useUserType";

interface Service {
  id: number;
  name: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
}

interface ServiceCardProps {
  service: Service;
  formatPrice: (price: number) => string;
  onToggleStatus: (id: number, currentStatus: boolean) => void;
  onEdit: (service: Service) => void;
  onDelete: (id: number) => void;
}

const DeleteConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onConfirm: () => void, 
  title: string 
}) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-md"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white dark:bg-[#1a1e26] border border-slate-200 dark:border-white/10 w-full max-w-[320px] rounded-[32px] p-6 shadow-xl dark:shadow-2xl text-center"
        >
          <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-12">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-500" />
          </div>
          <h3 className="text-slate-800 dark:text-white font-bold text-lg mb-2">حذف خدمت؟</h3>
          <p className="text-slate-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
            آیا از حذف <span className="text-slate-800 dark:text-white font-semibold">"{title}"</span> اطمینان دارید؟ این عمل غیرقابل بازگشت است.
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={onConfirm}
              className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-500 dark:bg-red-500 dark:hover:bg-red-600 text-white font-bold transition-all active:scale-95"
            >
              بله، حذف شود
            </button>
            <button
              onClick={onClose}
              className="w-full py-4 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 font-semibold hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
            >
              انصراف
            </button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  formatPrice,
  onToggleStatus,
  onEdit,
  onDelete,
}) => {
  const { userType } = useUserType();
  const isStaff = userType === "staff";
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleConfirmDelete = () => {
    onDelete(service.id);
    setIsDeleteModalOpen(false);
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative group overflow-hidden border rounded-[28px] p-5 transition-all duration-300 backdrop-blur-sm ${
          service.is_active
            ? "bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/10 hover:border-emerald-500/40 hover:bg-slate-50 dark:hover:bg-white/[0.05]"
            : "bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/5 opacity-60 grayscale-[0.5]"
        }`}
      >
        <div className={`absolute -top-10 -left-10 w-24 h-24 blur-[45px] rounded-full transition-colors -z-10 ${
          service.is_active ? "bg-emerald-500/10" : "bg-gray-500/10"
        }`} />

        <div className="flex items-start justify-between relative z-10">
          <div className="flex gap-4 items-center">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
              service.is_active 
                ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)] group-hover:rotate-12" 
                : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-500"
            }`}>
              <Scissors className="w-7 h-7" />
            </div>

            <div className="text-right">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {service.name}
                </h3>
                {isStaff && (
                  <span className="text-[10px] bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    فقط مشاهده
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium text-sm">
                  <Tag className="w-3.5 h-3.5" />
                  {formatPrice(service.price)}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-white/20" />
                <span className="flex items-center gap-1 text-slate-500 dark:text-gray-400 text-sm font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  {service.duration_minutes} دقیقه
                </span>
              </div>
            </div>
          </div>

          {!isStaff && (
            <button
              onClick={() => onToggleStatus(service.id, service.is_active)}
              className={`p-2.5 rounded-[14px] transition-all active:scale-90 ${
                service.is_active 
                  ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-500/20 shadow-lg shadow-emerald-950/20" 
                  : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-500 hover:bg-slate-200 dark:hover:bg-white/10"
              }`}
            >
              {service.is_active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
          )}

          {isStaff && (
            <div className="w-10 h-10" />
          )}
        </div>

        <div className="my-5 border-t border-slate-200 dark:border-white/5" />

        {!isStaff && (
          <div className="flex items-center justify-between relative z-10">
            <div className="flex gap-2.5">
              <button
                onClick={() => onEdit(service)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-blue-100 dark:hover:bg-blue-500/10 text-slate-600 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 text-xs font-bold transition-all border border-transparent hover:border-blue-300 dark:hover:border-blue-500/30 active:scale-95"
              >
                <Edit2 className="w-3.5 h-3.5" />
                ویرایش
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-red-100 dark:hover:bg-red-500/10 text-slate-600 dark:text-gray-300 hover:text-red-700 dark:hover:text-red-400 text-xs font-bold transition-all border border-transparent hover:border-red-300 dark:hover:border-red-500/30 active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                حذف
              </button>
            </div>

            <span className={`text-[10px] uppercase tracking-[0.1em] font-black px-2.5 py-1.5 rounded-lg ${
              service.is_active ? "text-emerald-600 dark:text-emerald-500/60 bg-emerald-100 dark:bg-emerald-500/5 border border-emerald-300 dark:border-emerald-500/10" : "text-slate-500 dark:text-gray-500 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5"
            }`}>
              {service.is_active ? "Active" : "Inactive"}
            </span>
          </div>
        )}

        {isStaff && (
          <div className="flex items-center justify-end relative z-10">
            <span className={`text-[10px] uppercase tracking-[0.1em] font-black px-2.5 py-1.5 rounded-lg ${
              service.is_active ? "text-emerald-600 dark:text-emerald-500/60 bg-emerald-100 dark:bg-emerald-500/5 border border-emerald-300 dark:border-emerald-500/10" : "text-slate-500 dark:text-gray-500 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5"
            }`}>
              {service.is_active ? "فعال" : "غیرفعال"}
            </span>
          </div>
        )}
      </motion.div>

      {!isStaff && (
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          title={service.name}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </>
  );
};