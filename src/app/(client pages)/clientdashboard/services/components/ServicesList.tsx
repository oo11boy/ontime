// components/Services/ServicesList.tsx
import React from "react";
import { ServiceCard } from "./ServiceCard";
import { Plus, Scissors } from "lucide-react";

interface Service {
  id: number;
  name: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
}

interface ServicesListProps {
  services: Service[];
  isLoading: boolean;
  formatPrice: (price: number) => string;
  onToggleStatus: (id: number, currentStatus: boolean) => void;
  onEdit: (service: Service) => void;
  onDelete: (id: number) => void;
  onOpenAddModal: () => void;
}

export const ServicesList: React.FC<ServicesListProps> = ({
  services,
  isLoading,
  formatPrice,
  onToggleStatus,
  onEdit,
  onDelete,
  onOpenAddModal,
}) => {
  if (isLoading) {
    return (
      <>
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="bg-white/5 border border-white/10 rounded-xl p-4 animate-pulse"
          >
            <div className="flex justify-between items-center">
              <div className="space-y-2 flex-1 mr-3">
                <div className="h-4 bg-white/10 rounded w-24"></div>
                <div className="h-3 bg-white/10 rounded w-16"></div>
                <div className="h-3 bg-white/10 rounded w-20"></div>
              </div>
              <div className="w-20 h-20 bg-white/10 rounded-xl"></div>
            </div>
          </div>
        ))}
      </>
    );
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-12">
        <Scissors className="w-16 h-16 text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-400 mb-2">
          هنوز خدمتی اضافه نکرده‌اید
        </h3>
        <p className="text-gray-500 text-sm mb-6">
          خدمات خود را اضافه کنید تا در هنگام رزرو نوبت در دسترس باشند
        </p>
        <button
          onClick={onOpenAddModal}
          className="bg-linear-to-r from-emerald-500 to-emerald-600 rounded-xl px-6 py-3 font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all flex items-center gap-2 mx-auto"
        >
          <Plus className="w-5 h-5" />
          افزودن اولین خدمت
        </button>
      </div>
    );
  }

  return (
    <>
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          formatPrice={formatPrice}
          onToggleStatus={onToggleStatus}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </>
  );
};