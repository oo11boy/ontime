"use client";
import React, { useState } from "react";
import { Filter, X } from "lucide-react";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    status: 'all' | 'active' | 'cancelled' | 'done';
    service: string;
  };
  setFilters: (filters: { status: 'all' | 'active' | 'cancelled' | 'done'; service: string }) => void;
  services: string[];
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  setFilters,
  services,
}) => {
  const [tempFilters, setTempFilters] = useState(filters);

  const handleApply = () => {
    setFilters(tempFilters);
    onClose();
  };

  const handleReset = () => {
    setTempFilters({
      status: 'all',
      service: 'all',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-linear-to-b from-[#1a1e26] to-[#242933] rounded-t-3xl border border-white/10 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Filter className="w-6 h-6 text-emerald-400" />
            <h3 className="text-xl font-bold text-white">فیلتر نوبت‌ها</h3>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="text-sm text-gray-300 mb-3 block">وضعیت</label>
            <div className="flex gap-2 flex-wrap">
              {['all', 'active', 'cancelled', 'done'].map((status) => (
                <button
                  key={status}
                  onClick={() => setTempFilters({ ...tempFilters, status: status as any })}
                  className={`px-4 py-2.5 rounded-xl text-sm transition-all ${
                    tempFilters.status === status
                      ? "bg-emerald-500 text-white shadow-lg"
                      : "bg-white/10 text-gray-300 hover:bg-white/20"
                  }`}
                >
                  {status === 'all' ? 'همه' : 
                   status === 'active' ? 'فعال' :
                   status === 'cancelled' ? 'کنسل شده' : 'انجام شده'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-3 block">خدمات</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTempFilters({ ...tempFilters, service: 'all' })}
                className={`p-3 rounded-xl text-sm transition-all ${
                  tempFilters.service === 'all'
                    ? "bg-emerald-500 text-white shadow-lg"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
              >
                همه خدمات
              </button>
              {services.map((service) => (
                <button
                  key={service}
                  onClick={() => setTempFilters({ ...tempFilters, service })}
                  className={`p-3 rounded-xl text-sm transition-all ${
                    tempFilters.service === service
                      ? "bg-emerald-500 text-white shadow-lg"
                      : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
                >
                  {service}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/10 flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 py-3.5 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition"
          >
            بازنشانی
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold transition"
          >
            اعمال فیلتر
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;