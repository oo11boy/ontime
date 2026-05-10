"use client";
import React from "react";
import { StaffCard } from "./StaffCard";
import { Users, Plus } from "lucide-react";

interface Service {
  id: number;
  name: string;
}

interface Staff {
  id: number;
  name: string;
  phone: string;
  sms_balance: number;
  sms_used:number;
  service_ids: string | null;
  services: Service[];
  calendar_type: string;
  can_see_all_clients: boolean;
  is_active: boolean;
  active_bookings?: number;
  created_at: string;
}

interface StaffsListProps {
  staffs: Staff[];
  isLoading: boolean;
  onEdit: (staff: Staff) => void;
  onDelete: (id: number) => void;
  onOpenAddModal: () => void;
}

export const StaffsList: React.FC<StaffsListProps> = ({
  staffs,
  isLoading,
  onEdit,
  onDelete,
  onOpenAddModal,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="bg-white/5 border border-white/10 rounded-xl p-4 animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/10 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/10 rounded w-32"></div>
                <div className="h-3 bg-white/10 rounded w-24"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (staffs.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-400 mb-2">
          هنوز پرسنلی اضافه نکرده‌اید
        </h3>
        <p className="text-gray-500 text-sm mb-6">
          پرسنل خود را اضافه کنید و برای هر کدام اعتبار و خدمات جداگانه تعیین کنید
        </p>
        <button
          onClick={onOpenAddModal}
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl px-6 py-3 font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all flex items-center gap-2 mx-auto"
        >
          <Plus className="w-5 h-5" />
          افزودن پرسنل جدید
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {staffs.map((staff) => (
        <StaffCard
          key={staff.id}
          staff={staff}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};