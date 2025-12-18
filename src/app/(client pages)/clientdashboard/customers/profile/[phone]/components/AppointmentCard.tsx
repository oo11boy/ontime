// components/CustomerProfile/AppointmentCard.tsx
import React from "react";
import { Trash2 } from "lucide-react";

interface Appointment {
  id: number;
  date: string;
  time: string;
  services: string;
  note: string;
  displayStatus: "pending" | "completed" | "canceled";
}

interface AppointmentCardProps {
  appointment: Appointment;
  customerIsBlocked: boolean;
  getPersianDateTime: (dateStr: string, timeStr: string) => string;
  onShowCancelModal: (id: number) => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  customerIsBlocked,
  getPersianDateTime,
  onShowCancelModal,
}) => {
  return (
    <div
      className={`bg-white/5 backdrop-blur-sm rounded-xl p-5 border transition-all ${
        appointment.displayStatus === "canceled"
          ? "border-red-500/40 opacity-70"
          : appointment.displayStatus === "completed"
          ? "border-blue-500/20"
          : "border-emerald-500/20 hover:border-emerald-500/40 hover:bg-white/10"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 text-right">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className="font-bold text-white">
              {getPersianDateTime(appointment.date, appointment.time)}
            </span>
            <span
              className={`px-3 py-1 rounded-lg text-xs font-bold ${
                appointment.displayStatus === "canceled"
                  ? "bg-red-500/20 text-red-400"
                  : appointment.displayStatus === "completed"
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-emerald-500/20 text-emerald-400"
              }`}
            >
              {appointment.displayStatus === "canceled"
                ? "کنسل شده"
                : appointment.displayStatus === "completed"
                ? "انجام شده"
                : "در انتظار"}
            </span>
          </div>
          {appointment.services && (
            <p className="text-sm text-gray-300 mb-1">
              خدمات: {appointment.services}
            </p>
          )}
          {appointment.note && (
            <p className="text-sm text-gray-300">{appointment.note}</p>
          )}
        </div>

        {appointment.displayStatus === "pending" && !customerIsBlocked && (
          <button
            onClick={() => onShowCancelModal(appointment.id)}
            className="p-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-all"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};