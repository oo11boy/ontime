// components/JalaliCalendarModal.jsx
"use client";
import React, { useMemo } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import moment from "moment-jalaali";

// 🚀 تابع واقعی برای دریافت تاریخ شمسی امروز
const getTodayJalaliDate = () => {
  const today = moment();
  return {
    year: today.jYear(),
    month: today.jMonth(), // ماه شمسی در moment-jalaali از 0 تا 11 است
    day: today.jDate(),
  };
};

// تابع کمکی برای دریافت نام ماه
const getJalaliMonthName = (month: number): string => {
  const names = [
    "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", 
    "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
  ];
  return names[month];
};

interface DateState {
  year: number;
  month: number;
  day: number | null;
}

interface JalaliCalendarModalProps {
  selectedDate: DateState;
  setSelectedDate: React.Dispatch<React.SetStateAction<DateState>>;
  isCalendarOpen: boolean;
  setIsCalendarOpen: (isOpen: boolean) => void;
}

export default function JalaliCalendarModal({
  selectedDate,
  setSelectedDate,
  isCalendarOpen,
  setIsCalendarOpen,
}: JalaliCalendarModalProps) {
  
  const todayJalali = useMemo(() => getTodayJalaliDate(), []);
  const { year, month, day: selectedDay } = selectedDate;

  // --- ناوبری ماه‌ها ---
  const handlePrevMonth = () => {
    setSelectedDate((prev) => {
      if (prev.year === todayJalali.year && prev.month === todayJalali.month) {
        return prev;
      }
      
      let newMonth = prev.month - 1;
      let newYear = prev.year;
      if (newMonth < 0) {
        newMonth = 11;
        newYear -= 1;
      }
      
      if (newYear < todayJalali.year || (newYear === todayJalali.year && newMonth < todayJalali.month)) {
         return prev;
      }
      
      return { ...prev, month: newMonth, year: newYear, day: null };
    });
  };

  const handleNextMonth = () => {
    setSelectedDate((prev) => {
      let newMonth = prev.month + 1;
      let newYear = prev.year;
      if (newMonth > 11) {
        newMonth = 0;
        newYear += 1;
      }
      return { ...prev, month: newMonth, year: newYear, day: null };
    });
  };

  // --- انتخاب روز ---
  const handleDaySelect = (day: number) => {
    const isPastDay = year === todayJalali.year && 
                       month === todayJalali.month && 
                       day < todayJalali.day;
                       
    if (isPastDay) return; 

    setSelectedDate((prev) => ({ ...prev, day }));
    setIsCalendarOpen(false); 
  };

  // --- تولید روزهای ماه ---
  const renderDays = () => {
    // 💡 استفاده از moment-jalaali برای دریافت دقیق تعداد روزها و مدیریت کبیسه
    const daysInMonth = moment.jDaysInMonth(year, month);
    
    const days = [];
    
    const isCurrentMonth = year === todayJalali.year && month === todayJalali.month;
    
    // محاسبه روز هفته برای شروع تقویم (برای تعیین تعداد خانه‌های خالی)
    const firstDayOfMonth = moment(`${year}/${month + 1}/1`, 'jYYYY/jMM/jDD');
    // jDay() روز هفته را از شنبه (0) تا جمعه (6) برمی‌گرداند.
    const startOffset = firstDayOfMonth.day(); 

    // بخش ۱: خانه‌های خالی ابتدای ماه
    for (let i = 0; i < startOffset; i++) {
        days.push(<div key={`empty-${i}`} />);
    }

    // بخش ۲: روزهای ماه
    for (let i = 1; i <= daysInMonth; i++) {
      const isPastDay = isCurrentMonth && i < todayJalali.day;
      const isToday = isCurrentMonth && i === todayJalali.day;

      days.push(
        <button
          key={i}
          onClick={() => handleDaySelect(i)}
          disabled={isPastDay} 
          className={`
            p-3 rounded-full text-sm font-medium transition-all aspect-square 
            ${
              isPastDay
                ? "bg-white/5 text-gray-600 cursor-not-allowed opacity-50"
                : selectedDay === i
                ? "bg-emerald-500 text-white shadow-emerald-500/30 shadow-lg"
                : "bg-white/10 text-gray-200 hover:bg-emerald-500/20 hover:text-emerald-300"
            }
            ${isToday ? "border-2 border-emerald-400" : "" } 
          `}
        >
          {i}
        </button>
      );
    }
    return days;
  };

  if (!isCalendarOpen) return null;

  return (
               <div className="h-screen text-white overflow-auto max-w-md m-auto">
  
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* پس‌زمینه تیره با محو شدن */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCalendarOpen(false)}
      />

      {/* پنل تقویم با انیمیشن از پایین */}
      <div className="relative w-full max-w-md bg-[#1e2530] rounded-t-3xl shadow-2xl overflow-hidden animate-slideUp">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <button
            onClick={handlePrevMonth}
            className={`p-2 rounded-full transition ${year === todayJalali.year && month === todayJalali.month ? "opacity-50 cursor-not-allowed" : "hover:bg-white/10"}`}
            disabled={year === todayJalali.year && month === todayJalali.month}
          >
            <ChevronRight className="w-6 h-6 text-emerald-400" />
          </button>
          <h3 className="text-lg font-bold text-white">
            {getJalaliMonthName(month)} {year}
          </h3>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-white/10 rounded-full transition"
          >
            <ChevronLeft className="w-6 h-6 text-emerald-400" />
          </button>
        </div>

        <div className="p-6">
          {/* روزهای هفته */}
          <div className="grid grid-cols-7 gap-2 text-center mb-2">
            {["ش", "ی", "د", "س", "چ", "پ", "ج"].map((day) => (
              <div key={day} className="text-xs text-gray-400 font-bold">
                {day}
              </div>
            ))}
          </div>
          
          {/* روزهای ماه */}
          <div className="grid grid-cols-7 gap-2">
              {renderDays()}
          </div>

          {/* دکمه‌های فوتر */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={() => {
                // هنگام بازگشت به امروز، تاریخ را به امروز برمی‌گردانیم
                setSelectedDate({ year: todayJalali.year, month: todayJalali.month, day: todayJalali.day });
                setIsCalendarOpen(false);
              }}
              className="px-6 py-3 bg-white/10 text-gray-300 rounded-xl hover:bg-white/20 transition text-sm font-medium"
            >
              بازگشت به امروز
            </button>
            <button
              onClick={() => setIsCalendarOpen(false)}
              className="px-8 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition shadow-lg"
            >
              تأیید
            </button>
          </div>
        </div>
      </div>
      
      {/* انیمیشن و استایل‌های سفارشی */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slideUp {
          animation: slideUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
    </div>
  );
}