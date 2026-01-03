"use client";
import React, { useState, useEffect } from "react";
import { Filter, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedService: string;
  setSelectedService: (service: string) => void;
  services: string[];
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  selectedService,
  setSelectedService,
  services,
}) => {
  const [tempService, setTempService] = useState(selectedService);

  useEffect(() => {
    if (isOpen) setTempService(selectedService);
  }, [isOpen, selectedService]);

  const handleApply = () => {
    setSelectedService(tempService);
    onClose();
  };

  const hasChanges = tempService !== selectedService;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-end justify-center">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md bg-[#161B22] rounded-t-[2.5rem] border-t border-white/10 shadow-2xl overflow-hidden"
          >
            {/* Handle Bar (Drag Indicator) */}
            <div className="w-full flex justify-center pt-4 pb-2">
              <div className="w-12 h-1.5 bg-white/20 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-8 py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-xl">
                  <Filter className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-lg font-black text-white">فیلتر خدمات</h3>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="px-8 py-4">
              <p className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">
                انتخاب نوع خدمت
              </p>
              
              <div className="grid grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto pr-1 custom-scrollbar">
                {/* All Services Option */}
                <ServiceOption 
                  label="همه موارد" 
                  value="all" 
                  selected={tempService === "all"} 
                  onClick={() => setTempService("all")} 
                />
                
                {services.map((service) => (
                  <ServiceOption
                    key={service}
                    label={service}
                    value={service}
                    selected={tempService === service}
                    onClick={() => setTempService(service)}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="p-8 pt-4 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-4 rounded-2xl font-bold text-slate-400 bg-white/5 hover:bg-white/10 transition-all"
              >
                انصراف
              </button>
              <button
                onClick={handleApply}
                disabled={!hasChanges}
                className={`flex-[2] py-4 rounded-2xl font-black text-sm transition-all shadow-lg ${
                  hasChanges
                    ? "bg-emerald-500 text-slate-950 shadow-emerald-500/20"
                    : "bg-slate-800 text-slate-600 cursor-not-allowed"
                }`}
              >
                اعمال تغییرات
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Sub-component for options
const ServiceOption = ({ label, value, selected, onClick }: any) => (
  <button
    onClick={onClick}
    className={`relative flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 ${
      selected
        ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
        : "border-white/5 bg-white/5 text-slate-400 hover:border-white/10"
    }`}
  >
    <span className="text-sm font-bold truncate pr-2">{label}</span>
    {selected && (
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
        <Check size={16} strokeWidth={3} />
      </motion.div>
    )}
  </button>
);

export default FilterModal;