"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Scissors, X, Plus, Check } from "lucide-react";
import { Service } from "../types";

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
      prev.some(s => s.id === service.id) 
        ? prev.filter((s) => s.id !== service.id) 
        : [...prev, service]
    );
  };

  const calculateTotalDuration = () => {
    return selectedServices.reduce((acc, s) => acc + s.duration_minutes, 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md animate-in slide-in-from-bottom-4 duration-300">
        <div className="bg-linear-to-b from-[#1a1e26] to-[#242933] rounded-3xl border border-white/10 shadow-2xl overflow-hidden max-h-[85vh]">
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h3 className="text-xl font-bold text-white">انتخاب خدمات</h3>
            <button
              onClick={onClose}
              className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="px-6 pt-4">
            <button
              onClick={() => {
                onClose();
                router.push("/clientdashboard/services"); 
              }}
              className="w-full bg-linear-to-r from-purple-600 to-pink-600 rounded-2xl py-4 font-bold text-white shadow-lg hover:shadow-purple-500/50 active:scale-98 transition-all flex items-center justify-center gap-3"
            >
              <Plus className="w-6 h-6" />
              مدیریت خدمات
            </button>
          </div>

          <div className="px-6 py-6 max-h-96 overflow-y-auto custom-scrollbar space-y-3">
            {isLoading ? (
              // Loading state
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="w-full rounded-2xl p-5 bg-white/5 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-6 h-6 bg-white/10 rounded"></div>
                      <div className="h-4 bg-white/10 rounded w-32"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : allServices.length === 0 ? (
              // Empty state
              <div className="text-center py-8">
                <Scissors className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">هنوز خدمتی اضافه نکرده‌اید</p>
                <button
                  onClick={() => {
                    onClose();
                    router.push("/clientdashboard/services");
                  }}
                  className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm"
                >
                  افزودن خدمت
                </button>
              </div>
            ) : (
              // Services list
              allServices.map((service) => {
                const isSelected = selectedServices.some(s => s.id === service.id);
                return (
                  <button
                    key={service.id}
                    onClick={() => toggleService(service)}
                    className={`w-full rounded-2xl p-5 text-right transition-all border ${
                      isSelected
                        ? "bg-linear-to-r from-emerald-500/30 to-emerald-600/30 border-emerald-400/60 shadow-lg shadow-emerald-500/30"
                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-emerald-500/40"
                    }`}
                    disabled={!service.is_active}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Scissors className={`w-6 h-6 ${
                          isSelected ? "text-emerald-300" : 
                          service.is_active ? "text-gray-400" : "text-gray-600"
                        }`} />
                        <div className="text-right">
                          <span className={`font-medium block ${
                            isSelected ? "text-white" : 
                            service.is_active ? "text-gray-200" : "text-gray-500"
                          }`}>
                            {service.name}
                          </span>
                          {!service.is_active && (
                            <span className="text-xs text-gray-500 mt-1">(غیرفعال)</span>
                          )}
                        </div>
                      </div>
                      {isSelected && <Check className="w-6 h-6 text-emerald-400" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="p-6 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-emerald-300 font-bold block">
                  {selectedServices.length} خدمت انتخاب شد
                </span>
                {selectedServices.length > 0 && (
                  <span className="text-xs text-gray-400 mt-1 block">
                    مدت زمان تخمینی: {calculateTotalDuration()} دقیقه
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="px-8 py-3 bg-linear-to-r from-emerald-500 to-emerald-600 rounded-xl font-bold text-white shadow-lg active:scale-95 transition"
              >
                تأیید و بستن
              </button>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
};

export default ServicesModal;