"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion"; 
import { Service } from "../types";
import { Check, Plus, Scissors, X } from "lucide-react";

interface ServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedServices: Service[];
  setSelectedServices: React.Dispatch<React.SetStateAction<Service[]>>;
  allServices: Service[];
  isLoading: boolean;
}

const ServicesModal: React.FC<ServicesModalProps> = ({
  isOpen,
  onClose,
  selectedServices,
  setSelectedServices,
  allServices,
  isLoading,
}) => {
  const router = useRouter();

  const toggleService = (service: Service) => {
    setSelectedServices((prev) =>
      prev.some((s) => s.id === service.id)
        ? prev.filter((s) => s.id !== service.id)
        : [...prev, service]
    );
  };

  const calculateTotalDuration = () => {
    return selectedServices.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div key="services-modal-wrapper" className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4">
          
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            key="modal-content"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md z-[10000]"
          >
            <div className="bg-white dark:bg-[#1a1e26] rounded-t-[2.5rem] sm:rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
              
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5">
                <h3 className="text-xl font-black text-slate-800 dark:text-white">انتخاب خدمات</h3>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <X className="w-6 h-6 text-slate-500 dark:text-gray-400" />
                </motion.button>
              </div>

              <div className="px-6 pt-6">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onClose();
                    router.push("/clientdashboard/services");
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl py-4 font-bold text-white shadow-lg flex items-center justify-center gap-3"
                >
                  <Plus className="w-6 h-6" />
                  مدیریت خدمات
                </motion.button>
              </div>

              <div className="px-6 py-6 overflow-y-auto custom-scrollbar space-y-3 flex-1">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={`skeleton-${i}`} className="w-full rounded-2xl p-5 bg-slate-100 dark:bg-white/5 animate-pulse h-20" />
                  ))
                ) : (
                  allServices.map((service, index) => {
                    const isSelected = selectedServices.some((s) => s.id === service.id);
                    const itemKey = service.id ? `service-${service.id}` : `service-idx-${index}`;
                    
                    return (
                      <motion.button
                        key={itemKey}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => toggleService(service)}
                        disabled={!service.is_active}
                        className={`w-full rounded-2xl p-5 text-right transition-all border relative overflow-hidden ${
                          isSelected
                            ? "bg-emerald-100 dark:bg-emerald-500/20 border-emerald-400 dark:border-emerald-500/50"
                            : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/5 hover:border-emerald-300 dark:hover:border-emerald-500/30"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-right">
                            <Scissors className={isSelected ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-gray-500"} size={20} />
                            <div>
                              <span className={`font-bold block ${isSelected ? "text-slate-800 dark:text-white" : "text-slate-700 dark:text-gray-300"}`}>
                                {service.name}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-gray-500">{service.duration_minutes} دقیقه</span>
                            </div>
                          </div>
                          {isSelected && <Check className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />}
                        </div>
                      </motion.button>
                    );
                  })
                )}
              </div>

              <div className="p-6 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02]">
                <div className="flex items-center justify-between">
                  <div className="text-right">
                    <span className="text-emerald-700 dark:text-emerald-400 font-black text-sm block">
                      {selectedServices.length} خدمت انتخاب شده
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-gray-500 font-bold mt-1 block">
                      زمان کل: {calculateTotalDuration()} دقیقه
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="px-8 py-3 bg-emerald-600 dark:bg-emerald-500 text-white rounded-2xl font-black shadow-lg shadow-emerald-500/20"
                  >
                    تأیید
                  </motion.button>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </AnimatePresence>
  );
};

export default ServicesModal;