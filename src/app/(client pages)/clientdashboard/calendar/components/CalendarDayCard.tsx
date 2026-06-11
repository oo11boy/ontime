import React from "react";
import { 
  Plus, 
  MessageSquare, 
  Clock, 
  MoreVertical, 
  CalendarX, 
  AlertCircle,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { formatTimeDisplay } from "../utils/formatUtils";
import { Appointment } from "@/types";

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
  const pastAppointmentsCount = day.appointments.filter(app => app.status === 'active' && day.isPast).length;

  const getCardStyles = () => {
    if (day.isPast) {
      return 'bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700/50 opacity-75';
    }
    if (day.isToday) {
      return 'bg-white dark:bg-white/5 border-emerald-400 dark:border-emerald-500/60 shadow-lg ring-2 ring-emerald-400/20 dark:ring-emerald-500/20';
    }
    if (day.isWeekend) {
      return 'bg-white dark:bg-white/5 border-rose-300 dark:border-rose-500/30';
    }
    return 'bg-white dark:bg-white/5 border-slate-200 dark:border-emerald-500/20 hover:border-emerald-400 dark:hover:border-emerald-400/60 hover:shadow-md transition-all';
  };

  const getDateGradient = () => {
    if (day.isPast) {
      return 'from-gray-400 to-gray-500';
    }
    if (day.isToday) {
      return 'from-emerald-500 to-emerald-600';
    }
    if (day.isWeekend) {
      return 'from-rose-500 to-rose-600';
    }
    return 'from-blue-500 to-blue-600';
  };

  return (
    <div
      className={`rounded-2xl border p-5 transition-all duration-300 ${getCardStyles()}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center text-white font-bold shadow-lg bg-gradient-to-br ${getDateGradient()}`}>
              <span className="text-2xl leading-6">{day.jalaliDate.day}</span>
              <span className="text-xs opacity-90 mt-0.5">{day.jalaliDate.monthName}</span>
            </div>
            {day.isPast && (
              <div className="absolute -top-2 -right-2 bg-gray-500 text-white rounded-full p-1 shadow-md">
                <CalendarX className="w-4 h-4" />
              </div>
            )}
            {day.isToday && !day.isPast && (
              <div className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full p-1 shadow-md animate-pulse">
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </div>
            )}
          </div>

          <div className="text-right">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 flex-wrap">
              {getDayName(day.date)}
              {day.isToday && !day.isPast && (
                <span className="text-xs bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                  امروز
                </span>
              )}
              {day.isPast && (
                <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                  گذشته
                </span>
              )}
              {day.isWeekend && !day.isPast && (
                <span className="text-xs bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full">
                  تعطیل
                </span>
              )}
            </h3>
            
            <div className="flex items-center gap-3 mt-1.5">
              {activeAppointmentsCount > 0 && (
                <p className="text-sm text-slate-500 dark:text-gray-400">
                  {day.isPast ? (
                    <span className="text-gray-500 dark:text-gray-500">
                      📅 {activeAppointmentsCount} نوبت ثبت‌شده
                    </span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400">
                      🟢 {activeAppointmentsCount} نوبت فعال
                    </span>
                  )}
                </p>
              )}
              {pastAppointmentsCount > 0 && day.isPast && (
                <p className="text-xs text-amber-600 dark:text-amber-500">
                  ⏰ تاریخ گذشته
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={onAddAppointment}
            disabled={day.isPast}
            className={`px-4 py-2 rounded-xl font-bold text-[11px] flex items-center gap-2 transition-all ${
              day.isPast
                ? "bg-gray-200 dark:bg-gray-700/50 text-gray-500 dark:text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 active:scale-95 text-white shadow-md hover:shadow-lg"
            }`}
            title={day.isPast ? "امکان ثبت نوبت در تاریخ گذشته وجود ندارد" : "ثبت نوبت جدید"}
          >
            <Plus className="w-4 h-4" />
            نوبت جدید
          </button>
          
          {activeAppointmentsCount > 0 && !day.isPast && (
            <button
              onClick={onBulkSmsClick}
              className="px-4 py-2 rounded-xl font-bold text-[11px] flex items-center gap-2 transition-all bg-purple-600 hover:bg-purple-700 active:scale-95 text-white shadow-md hover:shadow-lg"
            >
              <MessageSquare className="w-4 h-4" />
              پیام همگانی
            </button>
          )}
        </div>
      </div>

      <div className="mt-2">
        {day.appointments.length > 0 ? (
          <div className="space-y-2.5">
            {day.appointments.map((app) => (
              <AppointmentItem
                key={app.id}
                appointment={app}
                isPast={day.isPast}
                onClick={() => onAppointmentClick(app)}
              />
            ))}
          </div>
        ) : (
          <div className={`text-center py-8 rounded-xl ${
            day.isPast 
              ? 'bg-gray-100 dark:bg-gray-800/30' 
              : 'bg-slate-50 dark:bg-white/5'
          }`}>
            {day.isPast ? (
              <>
                <CalendarX className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-500 text-sm">
                  تاریخ گذشته - هیچ نوبتی ثبت نشده
                </p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-6 h-6 text-slate-400 dark:text-gray-500" />
                </div>
                <p className="text-slate-500 dark:text-gray-400 text-sm">
                  هنوز نوبتی ثبت نشده است
                </p>
                {!day.isPast && !day.isWeekend && (
                  <button
                    onClick={onAddAppointment}
                    className="mt-3 text-emerald-600 dark:text-emerald-400 text-sm font-medium hover:underline"
                  >
                    + ثبت نوبت جدید
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {day.isPast && activeAppointmentsCount > 0 && (
        <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg flex items-center gap-2 text-amber-700 dark:text-amber-400 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>این نوبت‌ها مربوط به تاریخ گذشته هستند - فقط قابل مشاهده می‌باشند</span>
        </div>
      )}
    </div>
  );
};

const AppointmentItem: React.FC<{ 
  appointment: Appointment; 
  isPast: boolean;
  onClick: () => void;
}> = ({ appointment, isPast, onClick }) => {
  
  const getStatusStyles = () => {
    if (isPast) {
      return {
        container: 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-800/60',
        iconBg: 'bg-gray-100 dark:bg-gray-700/50',
        iconColor: 'text-gray-500 dark:text-gray-500',
        statusColor: 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
        nameColor: 'text-gray-600 dark:text-gray-400'
      };
    }
    
    switch (appointment.status) {
      case 'active':
        return {
          container: 'bg-white dark:bg-white/10 border-emerald-200 dark:border-emerald-500/30 hover:border-emerald-400 dark:hover:border-emerald-400/60 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/10',
          iconBg: 'bg-emerald-100 dark:bg-emerald-500/20',
          iconColor: 'text-emerald-600 dark:text-emerald-400',
          statusColor: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
          nameColor: 'text-slate-800 dark:text-white'
        };
      case 'cancelled':
        return {
          container: 'bg-white dark:bg-white/10 border-rose-200 dark:border-rose-500/30 hover:border-rose-400 dark:hover:border-rose-400/60',
          iconBg: 'bg-rose-100 dark:bg-rose-500/20',
          iconColor: 'text-rose-600 dark:text-rose-400',
          statusColor: 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300',
          nameColor: 'text-slate-800 dark:text-white'
        };
      case 'done':
        return {
          container: 'bg-white dark:bg-white/10 border-blue-200 dark:border-blue-500/30 hover:border-blue-400 dark:hover:border-blue-400/60',
          iconBg: 'bg-blue-100 dark:bg-blue-500/20',
          iconColor: 'text-blue-600 dark:text-blue-400',
          statusColor: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
          nameColor: 'text-slate-800 dark:text-white opacity-70'
        };
      default:
        return {
          container: 'bg-white dark:bg-white/10 border-slate-200 dark:border-white/10',
          iconBg: 'bg-slate-100 dark:bg-white/10',
          iconColor: 'text-slate-600 dark:text-gray-400',
          statusColor: 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-gray-400',
          nameColor: 'text-slate-800 dark:text-white'
        };
    }
  };

  const styles = getStatusStyles();
  
  const getStatusText = () => {
    if (isPast) return 'گذشته';
    switch (appointment.status) {
      case 'active': return 'فعال';
      case 'cancelled': return 'کنسل شده';
      case 'done': return 'انجام شده';
      default: return 'نامشخص';
    }
  };
  
  const getStatusIcon = () => {
    if (isPast) return <AlertCircle className="w-3 h-3" />;
    switch (appointment.status) {
      case 'active': return <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>;
      case 'cancelled': return <XCircle className="w-3 h-3" />;
      case 'done': return <CheckCircle2 className="w-3 h-3" />;
      default: return null;
    }
  };

  return (
    <div
      onClick={onClick}  // تغییر: همیشه قابل کلیک
      className={`rounded-xl p-4 transition-all duration-300 border ${styles.container} cursor-pointer hover:shadow-md`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${styles.iconBg}`}>
            <Clock className={`w-4 h-4 ${styles.iconColor}`} />
          </div>
          
          <div>
            <span className={`text-sm font-semibold block ${styles.nameColor}`}>
              {formatTimeDisplay(appointment.booking_time)}
            </span>
            <span className={`text-xs ${isPast ? 'text-gray-500' : 'text-slate-500 dark:text-gray-400'}`}>
              {appointment.services || "بدون خدمات"}
            </span>
          </div>
        </div>
        
        <div className="text-left">
          <p className={`font-medium text-sm ${styles.nameColor}`}>
            {appointment.client_name}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${styles.statusColor}`}>
              {getStatusIcon()}
              {getStatusText()}
            </span>
            <MoreVertical className="w-4 h-4 text-slate-400 dark:text-gray-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarDayCard;