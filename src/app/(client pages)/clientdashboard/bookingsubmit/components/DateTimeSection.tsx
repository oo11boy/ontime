import React from "react";
import { Calendar, Clock, Timer } from "lucide-react";
import { SelectedDate } from "../types";

interface DateTimeSectionProps {
  selectedDate: SelectedDate;
  selectedTime: string;
  duration: number; // اضافه شده - مدت زمان کل بر اساس سرویس‌های انتخاب شده
  onOpenCalendar: () => void;
  onOpenTimePicker: () => void;
}

const DateTimeSection: React.FC<DateTimeSectionProps> = ({
  selectedDate,
  selectedTime,
  duration,
  onOpenCalendar,
  onOpenTimePicker,
}) => {
  const formatJalaliDate = (year: number, month: number, day: number | null): string => {
    if (!day) return "انتخاب تاریخ";
    return `${day} ${month + 1} ${year}`;
  };

  const formatDuration = (minutes: number): string => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours} ساعت و ${mins} دقیقه` : `${hours} ساعت`;
    }
    return `${minutes} دقیقه`;
  };

  return (
    <div className="space-y-4">


      {/* تاریخ و ساعت */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-300 mb-2 block">تاریخ</label>
          <button
            onClick={onOpenCalendar}
            className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3.5 flex items-center justify-between hover:border-emerald-500/50 transition backdrop-blur-sm"
          >
            <span className={selectedDate.day ? "text-white" : "text-gray-400"}>
              {formatJalaliDate(selectedDate.year, selectedDate.month, selectedDate.day)}
            </span>
            <Calendar className="w-5 h-5 text-emerald-400" />
          </button>
        </div>
        <div>
          <label className="text-sm text-gray-300 mb-2 block">ساعت</label>
          <button
            onClick={onOpenTimePicker}
            className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3.5 flex items-center justify-between hover:border-emerald-500/50 transition backdrop-blur-sm"
          >
            <span className={selectedTime ? "text-white" : "text-gray-400"}>
              {selectedTime || "انتخاب ساعت"}
            </span>
            <Clock className="w-5 h-5 text-emerald-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateTimeSection;