"use client";
import React, { useState, useEffect } from "react";
import { Filter, X } from "lucide-react";

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

  // همگام‌سازی وقتی که modal باز می‌شود
  useEffect(() => {
    if (isOpen) {
      setTempService(selectedService);
    }
  }, [isOpen, selectedService]);

  const handleApply = () => {
    setSelectedService(tempService);
    onClose();
  };

  const handleReset = () => {
    setTempService('all');
  };

  // بررسی اینکه آیا تغییراتی ایجاد شده است
  const hasChanges = tempService !== selectedService;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-linear-to-b from-[#1a1e26] to-[#242933] rounded-t-3xl border border-white/10 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Filter className="w-6 h-6 text-emerald-400" />
            <h3 className="text-xl font-bold text-white">فیلتر بر اساس خدمات</h3>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div>
            <label className="text-sm text-gray-300 mb-3 block">نوع خدمات</label>
            <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
              {services.map((service) => (
                <button
                  key={service}
                  onClick={() => setTempService(service)}
                  className={`p-4 rounded-xl text-sm transition-all text-center ${
                    tempService === service
                      ? "bg-emerald-500 text-white shadow-lg"
                      : "bg-white/10 text-gray-300 hover:bg-white/20"
                  }`}
                  title={service}
                >
                  <span className="truncate block font-medium">{service}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/10 flex gap-3">
          <button
            onClick={() => {
              handleReset();
              if (hasChanges) {
                setSelectedService('all');
              }
              onClose();
            }}
            className="flex-1 py-3.5 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition"
          >
            {hasChanges ? 'لغو' : 'بستن'}
          </button>
          <button
            onClick={handleApply}
            disabled={!hasChanges}
            className={`flex-1 py-3.5 rounded-xl font-bold transition ${
              hasChanges
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-gray-600 cursor-not-allowed opacity-50"
            }`}
          >
            اعمال فیلتر
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;