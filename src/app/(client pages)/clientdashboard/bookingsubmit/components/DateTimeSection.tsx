import React from "react";
import { Calendar, Clock, Timer } from "lucide-react";
import { SelectedDate } from "../types";
import { persianMonths } from "@/lib/date-utils";

interface DateTimeSectionProps {
  selectedDate: SelectedDate;
  selectedTime: string;
  duration: number;
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
  const toPersianNumber = (num: number): string => {
    const persianDigits: { [key: string]: string } = {
      '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴',
      '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹'
    };
    return num.toString().replace(/[0-9]/g, (d) => persianDigits[d]);
  };

  const formatJalaliDate = (year: number, month: number, day: number | null): string => {
    if (!day) return "انتخاب تاریخ";
    const monthName = persianMonths[month];
    const persianDay = toPersianNumber(day);
    const persianYear = toPersianNumber(year);
    return `${persianDay} ${monthName} ${persianYear}`;
  };

  const formatDuration = (minutes: number): string => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      if (mins > 0) {
        return `${toPersianNumber(hours)} ساعت و ${toPersianNumber(mins)} دقیقه`;
      }
      return `${toPersianNumber(hours)} ساعت`;
    }
    return `${toPersianNumber(minutes)} دقیقه`;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-slate-600 dark:text-gray-300 mb-2 block">تاریخ</label>
          <button
            onClick={onOpenCalendar}
            className="w-full bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3.5 flex items-center justify-between hover:border-emerald-500/50 transition backdrop-blur-sm group"
          >
            <span className={selectedDate.day ? "text-slate-800 dark:text-white" : "text-slate-400 dark:text-gray-400"}>
              {formatJalaliDate(selectedDate.year, selectedDate.month, selectedDate.day)}
            </span>
            <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
          </button>
        </div>
        <div>
          <label className="text-sm text-slate-600 dark:text-gray-300 mb-2 block">ساعت</label>
          <button
            onClick={onOpenTimePicker}
            className="w-full bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3.5 flex items-center justify-between hover:border-emerald-500/50 transition backdrop-blur-sm group"
          >
            <span className={selectedTime ? "text-slate-800 dark:text-white" : "text-slate-400 dark:text-gray-400"}>
              {selectedTime || "انتخاب ساعت"}
            </span>
            <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateTimeSection;