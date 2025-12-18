// components/Services/ServiceCard.tsx
import React from "react";
import { Scissors, Edit2, Trash2, Tag, Clock, Eye, EyeOff } from "lucide-react";

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

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  formatPrice,
  onToggleStatus,
  onEdit,
  onDelete,
}) => {
  return (
    <div
      className={`bg-white/5 border rounded-xl p-4 flex justify-between items-center transition-all ${
        service.is_active
          ? "border-emerald-500/30 bg-emerald-500/5"
          : "border-gray-500/30 bg-gray-500/5 opacity-70"
      }`}
    >
      <div className="text-right flex-1 mr-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-lg">{service.name}</h3>
          <button
            onClick={() => onToggleStatus(service.id, service.is_active)}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            title={service.is_active ? "غیرفعال کردن" : "فعال کردن"}
          >
            {service.is_active ? (
              <Eye className="w-4 h-4 text-emerald-400" />
            ) : (
              <EyeOff className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>

        <p className="text-emerald-300 text-sm mt-2 flex gap-1 items-center">
          <Tag className="w-4 h-4" />
          {formatPrice(service.price)}
        </p>
        <p className="text-gray-400 text-sm mt-1 flex gap-1 items-center">
          <Clock className="w-4 h-4" />
          {service.duration_minutes} دقیقه
        </p>

        <div className="mt-3 flex gap-2">
          <button
            onClick={() => onEdit(service)}
            className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-medium transition flex items-center gap-1"
          >
            <Edit2 className="w-3 h-3" />
            ویرایش
          </button>
          <button
            onClick={() => onDelete(service.id)}
            className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-medium transition flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            حذف
          </button>
        </div>
      </div>

      <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center">
        <Scissors
          className={`w-8 h-8 ${
            service.is_active ? "text-emerald-400" : "text-gray-400"
          }`}
        />
      </div>
    </div>
  );
};