import React from "react";
import { Calendar, Clock } from "lucide-react";
import { SelectedDate } from "../types";

interface DateTimeSectionProps {
  selectedDate: SelectedDate;
  selectedTime: string;
  onOpenCalendar: () => void;
  onOpenTimePicker: () => void;
}

const DateTimeSection: React.FC<DateTimeSectionProps> = ({
  selectedDate,
  selectedTime,
  onOpenCalendar,
  onOpenTimePicker,
}) => {
  const formatJalaliDate = (year: number, month: number, day: number | null): string => {
    if (!day) return "انتخاب تاریخ";
    return `${day} ${month + 1} ${year}`;
  };

  return (
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
          <span className="text-white">{selectedTime || "انتخاب ساعت"}</span>
          <Clock className="w-5 h-5 text-emerald-400" />
        </button>
      </div>
    </div>
  );
};

export default DateTimeSection;