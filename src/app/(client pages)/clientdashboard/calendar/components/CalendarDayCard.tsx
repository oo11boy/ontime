import React from "react";
import { Plus, MessageSquare, Clock, MoreVertical } from "lucide-react";

import { formatTimeDisplay } from "../utils/formatUtils";
import { Appointment } from "../page";

interface CalendarDay {
  date: Date;
  jalaliDate: {
    year: number;
    month: number;
    day: number;
    monthName: string;
  };
  isToday: boolean;
  isPast: boolean;
  isWeekend: boolean;
  appointments: Appointment[];
  hasAppointments: boolean;
}

interface CalendarDayCardProps {
  day: CalendarDay;
  getDayName: (date: Date) => string;
  onAddAppointment: () => void;
  onBulkSmsClick: () => void;
  onAppointmentClick: (appointment: Appointment) => void;
}

const CalendarDayCard: React.FC<CalendarDayCardProps> = ({
  day,
  getDayName,
  onAddAppointment,
  onBulkSmsClick,
  onAppointmentClick,
}) => {
  const activeAppointmentsCount = day.appointments.filter(app => app.status === 'active').length;

  return (
    <div
      className={`bg-white/5 backdrop-blur-sm rounded-2xl border p-5 transition-all duration-300 ${
        day.isToday
          ? 'border-emerald-500/60 bg-emerald-500/5'
          : day.isWeekend
          ? 'border-red-500/30 bg-red-500/5'
          : 'border-emerald-500/20 hover:border-emerald-400/60 hover:bg-white/8'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center text-white font-bold shadow-xl ${
            day.isToday
              ? 'bg-linear-to-br from-emerald-500 to-emerald-600'
              : day.isWeekend
              ? 'bg-linear-to-br from-red-500 to-red-600'
              : 'bg-linear-to-br from-blue-500 to-blue-600'
          }`}>
            <span className="text-2xl">{day.jalaliDate.day}</span>
            <span className="text-xs opacity-90">{day.jalaliDate.monthName}</span>
          </div>
          <div className="text-right">
            <h3 className="text-lg font-bold">
              {getDayName(day.date)}
              {day.isToday && (
                <span className="text-xs text-emerald-400 mr-2">(امروز)</span>
              )}
            </h3>
            {day.isWeekend && (
              <p className="text-xs text-red-400 mt-1">تعطیل</p>
            )}
            <p className="text-sm text-gray-400 mt-1">
              {activeAppointmentsCount} نوبت فعال
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={onAddAppointment}
            disabled={day.isPast}
            className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
              day.isPast
                ? "bg-gray-700/50 text-gray-500 cursor-not-allowed"
                : "bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 active:scale-95"
            }`}
          >
            <Plus className="w-4 h-4" />
            نوبت جدید
          </button>
          
          {activeAppointmentsCount > 0 && !day.isPast && (
            <button
              onClick={onBulkSmsClick}
              className="px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all bg-purple-600 hover:bg-purple-700 active:scale-95"
            >
              <MessageSquare className="w-4 h-4" />
              پیام همگانی
            </button>
          )}
        </div>
      </div>

      <div className="mt-2">
        {day.isPast ? (
          <p className="text-center text-gray-400 text-sm py-4">
            ⚠️ تاریخ گذشته - امکان ثبت نوبت وجود ندارد
          </p>
        ) : day.appointments.length > 0 ? (
          <div className="space-y-2">
            {day.appointments.map((app) => (
              <AppointmentItem
                key={app.id}
                appointment={app}
                onClick={() => onAppointmentClick(app)}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 text-sm py-6">
            هنوز نوبتی ثبت نشده است
          </p>
        )}
      </div>
    </div>
  );
};

const AppointmentItem: React.FC<{ appointment: Appointment; onClick: () => void }> = ({ appointment, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white/10 rounded-xl p-4 cursor-pointer transition-all duration-300 border hover:border-emerald-500/40 group ${
        appointment.status === 'cancelled' 
          ? 'border-red-500/30 opacity-60' 
          : appointment.status === 'done'
          ? 'border-blue-500/30'
          : 'border-white/10 hover:bg-white/20'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            appointment.status === 'active' ? 'bg-emerald-500/20' :
            appointment.status === 'cancelled' ? 'bg-red-500/20' :
            'bg-blue-500/20'
          }`}>
            <Clock className={`w-4 h-4 ${
              appointment.status === 'active' ? 'text-emerald-400' :
              appointment.status === 'cancelled' ? 'text-red-400' :
              'text-blue-400'
            }`} />
          </div>
          <div>
            <span className="text-sm font-semibold text-white block">
              {formatTimeDisplay(appointment.booking_time)}
            </span>
            <span className="text-xs text-gray-400">
              {appointment.services?.split(',')[0] || 'بدون خدمات'}
            </span>
          </div>
        </div>
        
        <div className="text-left">
          <p className="text-white font-medium text-sm">
            {appointment.client_name}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              appointment.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' :
              appointment.status === 'cancelled' ? 'bg-red-500/20 text-red-300' :
              'bg-blue-500/20 text-blue-300'
            }`}>
              {appointment.status === 'active' ? 'فعال' : 
               appointment.status === 'cancelled' ? 'کنسل شده' : 'انجام شده'}
            </span>
            <MoreVertical className="w-4 h-4 text-gray-500 group-hover:text-gray-300" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarDayCard;