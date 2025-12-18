// components/CustomerProfile/StatisticsGrid.tsx
import React from "react";
import { CheckCircle, X, Calendar, AlertCircle } from "lucide-react";

interface StatisticsGridProps {
  customer: {
    totalAppointments: number;
    canceledAppointments: number;
    completedAppointments: number;
    activeAppointments: number;
  };
}

export const StatisticsGrid: React.FC<StatisticsGridProps> = ({ customer }) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-8">
      <div className="bg-white/5 rounded-xl p-5 border border-emerald-500/20 text-center">
        <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
        <p className="text-sm text-gray-400">کل نوبت‌ها</p>
        <p className="text-2xl font-bold mt-1">{customer.totalAppointments}</p>
      </div>
      <div className="bg-white/5 rounded-xl p-5 border border-red-500/20 text-center">
        <X className="w-10 h-10 text-red-400 mx-auto mb-2" />
        <p className="text-sm text-gray-400">کنسلی‌ها</p>
        <p className="text-2xl font-bold mt-1 text-red-400">
          {customer.canceledAppointments}
        </p>
      </div>
      <div className="bg-white/5 rounded-xl p-5 border border-blue-500/20 text-center">
        <Calendar className="w-10 h-10 text-blue-400 mx-auto mb-2" />
        <p className="text-sm text-gray-400">انجام شده</p>
        <p className="text-2xl font-bold mt-1 text-blue-400">
          {customer.completedAppointments}
        </p>
      </div>
      <div className="bg-white/5 rounded-xl p-5 border border-yellow-500/20 text-center">
        <AlertCircle className="w-10 h-10 text-yellow-400 mx-auto mb-2" />
        <p className="text-sm text-gray-400">در انتظار</p>
        <p className="text-2xl font-bold mt-1 text-yellow-400">
          {customer.activeAppointments}
        </p>
      </div>
    </div>
  );
};