// components/CustomerProfile/AppointmentsList.tsx
import React from "react";
import { Calendar } from "lucide-react";
import { AppointmentCard } from "./AppointmentCard";

interface Appointment {
  id: number;
  date: string;
  time: string;
  services: string;
  note: string;
  displayStatus: "pending" | "completed" | "canceled";
}

interface AppointmentsListProps {
  appointments: Appointment[];
  customerIsBlocked: boolean;
  getPersianDateTime: (dateStr: string, timeStr: string) => string;
  onShowCancelModal: (id: number) => void;
}

export const AppointmentsList: React.FC<AppointmentsListProps> = ({
  appointments,
  customerIsBlocked,
  getPersianDateTime,
  onShowCancelModal,
}) => {
  return (
    <div>
      <h3 className="text-lg font-bold mb-5 flex items-center gap-3">
        <Calendar className="w-6 h-6 text-emerald-400" />
        نوبت‌های ثبت شده
      </h3>

      <div className="space-y-4">
        {appointments.length === 0 ? (
          <p className="text-center text-gray-400 py-8">
            هیچ نوبتی ثبت نشده است
          </p>
        ) : (
          appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              customerIsBlocked={customerIsBlocked}
              getPersianDateTime={getPersianDateTime}
              onShowCancelModal={onShowCancelModal}
            />
          ))
        )}
      </div>
    </div>
  );
};