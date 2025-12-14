// src\app\clientdashboard\bookingsubmit\JalaliCalendarModal.tsx
"use client";
import React, { useState, useMemo, useEffect } from "react";
import moment from "moment-jalaali";
import { ChevronLeft, ChevronRight, X, Calendar } from "lucide-react";
import { persianMonths, getTodayJalali, isPastDate } from "@/lib/date-utils";

interface JalaliCalendarModalProps {
  selectedDate: { year: number; month: number; day: number | null };
  setSelectedDate: (date: { year: number; month: number; day: number | null }) => void;
  isCalendarOpen: boolean;
  setIsCalendarOpen: (isOpen: boolean) => void;
}

const JalaliCalendarModal: React.FC<JalaliCalendarModalProps> = ({
  selectedDate,
  setSelectedDate,
  isCalendarOpen,
  setIsCalendarOpen,
}) => {
  const todayJalali = useMemo(() => getTodayJalali(), []);
  
  const [viewYear, setViewYear] = useState(selectedDate.year);
  const [viewMonth, setViewMonth] = useState(selectedDate.month);

  // وقتی مودال باز می‌شود، تاریخ انتخابی را نمایش بده
  useEffect(() => {
    if (isCalendarOpen) {
      setViewYear(selectedDate.year);
      setViewMonth(selectedDate.month);
    }
  }, [isCalendarOpen, selectedDate.year, selectedDate.month]);

  const generateCalendar = (year: number, month: number) => {
    const m = moment(`${year}/${month + 1}/1`, "jYYYY/jMM/jDD");
    const daysInMonth = m.daysInMonth();
    const firstDayOfWeek = m.day(); // 0 = شنبه, 6 = جمعه

    const days = [];
    
    // روزهای خالی قبل از ماه
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // روزهای ماه
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectDate = (day: number) => {
    // بررسی آیا تاریخ گذشته است
    const selectedMoment = moment(`${viewYear}/${viewMonth + 1}/${day}`, "jYYYY/jMM/jDD");
    const todayMoment = moment();
    
    if (selectedMoment.isBefore(todayMoment, 'day')) {
      // تاریخ گذشته - نمی‌توان انتخاب کرد
      return;
    }
    
    setSelectedDate({ year: viewYear, month: viewMonth, day });
    setIsCalendarOpen(false);
  };

  const handleToday = () => {
    const today = getTodayJalali();
    setViewYear(today.year);
    setViewMonth(today.month);
    setSelectedDate({ ...today, day: today.day });
  };

  const isDateDisabled = (day: number): boolean => {
    const selectedMoment = moment(`${viewYear}/${viewMonth + 1}/${day}`, "jYYYY/jMM/jDD");
    const todayMoment = moment();
    return selectedMoment.isBefore(todayMoment, 'day');
  };

  const isDateSelected = (day: number): boolean => {
    return (
      selectedDate.year === viewYear &&
      selectedDate.month === viewMonth &&
      selectedDate.day === day
    );
  };

  const isToday = (day: number): boolean => {
    return (
      todayJalali.year === viewYear &&
      todayJalali.month === viewMonth &&
      todayJalali.day === day
    );
  };

  const calendarDays = useMemo(
    () => generateCalendar(viewYear, viewMonth),
    [viewYear, viewMonth]
  );

  const weekDays = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

  if (!isCalendarOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsCalendarOpen(false)} />
      <div className="relative w-full max-w-md animate-in slide-in-from-bottom-4 duration-300">
        <div className="bg-linear-to-b from-[#1a1e26] to-[#242933] backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
          {/* هدر */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h3 className="text-xl font-bold text-white">انتخاب تاریخ</h3>
            <button
              onClick={() => setIsCalendarOpen(false)}
              className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* انتخاب ماه و سال */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={handlePrevMonth}
                className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white">
                  {persianMonths[viewMonth]}
                </h2>
                <p className="text-gray-400 mt-1">{viewYear}</p>
              </div>
              
              <button
                onClick={handleNextMonth}
                className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>

            {/* روزهای هفته */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {weekDays.map((day, index) => (
                <div
                  key={index}
                  className="text-center py-2.5 text-sm font-medium text-gray-400"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* روزهای ماه */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} className="h-12" />;
                }
                
                const disabled = isDateDisabled(day);
                const selected = isDateSelected(day);
                const today = isToday(day);
                
                return (
                  <button
                    key={day}
                    onClick={() => !disabled && handleSelectDate(day)}
                    disabled={disabled}
                    className={`
                      h-12 rounded-xl flex items-center justify-center transition-all duration-200
                      ${selected 
                        ? 'bg-emerald-500 text-white shadow-lg scale-105' 
                        : today 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : disabled
                            ? 'bg-gray-800/30 text-gray-500 cursor-not-allowed'
                            : 'bg-white/5 text-white hover:bg-white/10 hover:scale-105 active:scale-95'
                      }
                    `}
                  >
                    <span className="font-medium">{day}</span>
                    {today && !selected && (
                      <span className="absolute bottom-1 w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* دکمه امروز */}
            <button
              onClick={handleToday}
              className="w-full mt-8 py-3.5 bg-linear-to-r from-emerald-500 to-emerald-600 rounded-xl font-bold text-white shadow-lg hover:from-emerald-600 hover:to-emerald-700 active:scale-95 transition-all"
            >
              انتخاب امروز ({todayJalali.day} {persianMonths[todayJalali.month]})
            </button>

            {/* پیام هشدار برای تاریخ‌های گذشته */}
            {selectedDate.day && isDateDisabled(selectedDate.day) && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-xs text-red-300 text-center">
                  ⚠️ تاریخ انتخاب شده گذشته است. لطفا تاریخ آینده انتخاب کنید.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JalaliCalendarModal;