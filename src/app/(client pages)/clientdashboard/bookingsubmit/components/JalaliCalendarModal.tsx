"use client";
import React, { useState, useMemo, useEffect } from "react";
import moment from "moment-jalaali";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { persianMonths, getTodayJalali } from "@/lib/date-utils";

interface JalaliCalendarModalProps {
  selectedDate: { year: number; month: number; day: number | null };
  setSelectedDate: (date: { year: number; month: number; day: number | null }) => void;
  isCalendarOpen: boolean;
  setIsCalendarOpen: (isOpen: boolean) => void;
  onDateSelected?: () => void;
  offDays: number[]; // 0=شنبه، 1=یکشنبه ... 6=جمعه
}

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const calendarVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 40 },
  visible: { 
    opacity: 1, scale: 1, y: 0,
    transition: { type: "spring", damping: 25, stiffness: 300 }
  },
  exit: { opacity: 0, scale: 0.9, y: 40 }
};

const JalaliCalendarModal: React.FC<JalaliCalendarModalProps> = ({
  selectedDate,
  setSelectedDate,
  isCalendarOpen,
  setIsCalendarOpen,
  onDateSelected,
  offDays = []
}) => {
  const todayJalali = useMemo(() => getTodayJalali(), []);
  const [viewYear, setViewYear] = useState(selectedDate.year);
  const [viewMonth, setViewMonth] = useState(selectedDate.month);

  useEffect(() => {
    if (isCalendarOpen) {
      setViewYear(selectedDate.year);
      setViewMonth(selectedDate.month);
    }
  }, [isCalendarOpen, selectedDate.year, selectedDate.month]);

  // تابع کمکی برای تشخیص روز هفته (تبدیل به سیستم شنبه=0 تا جمعه=6)
  const getDayIndex = (year: number, month: number, day: number) => {
    const m = moment(`${year}/${month + 1}/${day}`, "jYYYY/jMM/jDD");
    const jsDay = m.day(); // 0 (یکشنبه) تا 6 (شنبه) در Moment
    return (jsDay + 1) % 7; // تبدیل به 0 (شنبه) تا 6 (جمعه)
  };

  const generateCalendar = (year: number, month: number) => {
    const m = moment(`${year}/${month + 1}/1`, "jYYYY/jMM/jDD");
    const daysInMonth = m.daysInMonth();
    const firstDayIndex = getDayIndex(year, month, 1);
    
    const days = [];
    for (let i = 0; i < firstDayIndex; i++) { days.push(null); }
    for (let day = 1; day <= daysInMonth; day++) { days.push(day); }
    return days;
  };

  const isDateDisabled = (day: number): boolean => {
    // ۱. بررسی روزهای تعطیل بیزنس بر اساس تنظیمات
    const dayIndex = getDayIndex(viewYear, viewMonth, day);
    if (offDays.includes(dayIndex)) return true;

    // ۲. بررسی زمان گذشته (جلوگیری از رزرو برای روزهای قبل)
    const m = moment(`${viewYear}/${viewMonth + 1}/${day}`, "jYYYY/jMM/jDD");
    if (m.isBefore(moment(), 'day')) return true;

    return false;
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); } 
    else { setViewMonth(viewMonth - 1); }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); } 
    else { setViewMonth(viewMonth + 1); }
  };

  const handleSelectDate = (day: number) => {
    if (isDateDisabled(day)) return;
    setSelectedDate({ year: viewYear, month: viewMonth, day });
    setIsCalendarOpen(false);
    if (onDateSelected) setTimeout(() => onDateSelected(), 300);
  };

  const calendarDays = useMemo(() => generateCalendar(viewYear, viewMonth), [viewYear, viewMonth]);
  const weekDays = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

  return (
    <AnimatePresence>
      {isCalendarOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4" dir="rtl">
          <motion.div
            variants={overlayVariants}
            initial="hidden" animate="visible" exit="hidden"
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setIsCalendarOpen(false)}
          />

          <motion.div
            variants={calendarVariants}
            initial="hidden" animate="visible" exit="exit"
            className="relative w-full max-w-md bg-[#1a1e26] rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-white">انتخاب تاریخ جدید</h3>
              </div>
              <button 
                onClick={() => setIsCalendarOpen(false)} 
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {/* Controller */}
              <div className="flex items-center justify-between mb-8 px-2">
                <button onClick={handlePrevMonth} className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center text-white border border-white/5 hover:bg-white/10 transition-colors">
                  <ChevronRight size={22} />
                </button>
                <div className="text-center">
                  <h2 className="text-xl font-black text-white">{persianMonths[viewMonth]}</h2>
                  <p className="text-emerald-500 font-mono text-sm font-bold opacity-80">{viewYear}</p>
                </div>
                <button onClick={handleNextMonth} className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center text-white border border-white/5 hover:bg-white/10 transition-colors">
                  <ChevronLeft size={22} />
                </button>
              </div>

              {/* Day Names */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day, index) => (
                  <div key={index} className="text-center py-2 text-[11px] font-black text-gray-500 uppercase">{day}</div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1.5">
                {calendarDays.map((day, index) => {
                  if (day === null) return <div key={`empty-${index}`} className="aspect-square" />;
                  
                  const disabled = isDateDisabled(day);
                  const isSelected = selectedDate.year === viewYear && selectedDate.month === viewMonth && selectedDate.day === day;
                  const isToday = todayJalali.year === viewYear && todayJalali.month === viewMonth && todayJalali.day === day;
                  
                  return (
                    <motion.button
                      key={day}
                      whileHover={!disabled ? { scale: 1.1 } : {}}
                      whileTap={!disabled ? { scale: 0.95 } : {}}
                      onClick={() => handleSelectDate(day)}
                      disabled={disabled}
                      className={`
                        aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all duration-200
                        ${isSelected 
                          ? 'bg-emerald-500 text-white shadow-[0_8px_20px_rgba(16,185,129,0.3)] z-10' 
                          : isToday 
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : disabled
                              ? 'text-gray-700 opacity-20 cursor-not-allowed grayscale bg-white/[0.02]'
                              : 'hover:bg-white/10 text-gray-300'
                        }
                      `}
                    >
                      <span className="text-sm font-bold">{day}</span>
                      {isToday && !isSelected && (
                        <span className="absolute bottom-2 w-1 h-1 bg-emerald-400 rounded-full" />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Jump to Today */}
              <button
                onClick={() => {
                  const today = getTodayJalali();
                  setViewYear(today.year);
                  setViewMonth(today.month);
                }}
                className="w-full mt-8 py-4 bg-white/5 border border-white/5 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
              >
                نمایش امروز ({todayJalali.day} {persianMonths[todayJalali.month]})
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default JalaliCalendarModal;