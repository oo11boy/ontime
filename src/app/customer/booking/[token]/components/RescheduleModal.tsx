"use client";

import React, { useEffect, useMemo, useState } from "react";
import { X, Clock, Calendar as CalendarIcon, ChevronLeft } from "lucide-react";
import { toast } from "react-hot-toast";

import {
  gregorianToPersian,
  jalaliToGregorian,
  isTimeInPast,
  getCurrentDateTime,
  persianMonths,
} from "@/lib/date-utils";
import JalaliCalendarModal from "@/app/(client pages)/clientdashboard/bookingsubmit/components/JalaliCalendarModal";

interface RescheduleModalProps {
  currentDate: string; // YYYY-MM-DD
  currentTime: string; // HH:mm
  customerToken: string;
  offDays?: number[];
  onClose: () => void;
  onConfirm: (newDate: string, newTime: string) => Promise<void>;
}

export default function RescheduleModal({
  currentDate,
  currentTime,
  customerToken,
  offDays = [],
  onClose,
  onConfirm,
}: RescheduleModalProps) {
  const currentPersian = gregorianToPersian(currentDate);
  const { currentGregorianDate } = getCurrentDateTime();

  const [selectedJalaliDate, setSelectedJalaliDate] = useState<{
    year: number;
    month: number;
    day: number | null;
  }>({
    year: currentPersian.year,
    month: currentPersian.month,
    day: currentPersian.day, // پیش‌فرض روی روز فعلی نوبت
  });

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectedGregorianDate = useMemo(() => {
    if (!selectedJalaliDate.day) return null;
    return jalaliToGregorian(
      selectedJalaliDate.year,
      selectedJalaliDate.month,
      selectedJalaliDate.day
    );
  }, [selectedJalaliDate]);

  const fetchAvailableTimes = async (date: string) => {
    setIsFetching(true);
    setSelectedTime(null);
    try {
      const res = await fetch(
        `/api/customer/available-times?token=${customerToken}&date=${date}`
      );
      const data = await res.json();

      if (!data.success) throw new Error(data.message);

      setAvailableTimes(data.availableTimes);
    } catch (err: any) {
      toast.error(err.message || "خطا در دریافت زمان‌ها");
      setAvailableTimes([]);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (selectedGregorianDate) {
      fetchAvailableTimes(selectedGregorianDate);
    }
  }, [selectedGregorianDate]);

  const filteredTimes = useMemo(() => {
    if (!selectedGregorianDate) return [];

    // فیلتر زمان‌های گذشته برای امروز
    let times = availableTimes;
    if (selectedGregorianDate === currentGregorianDate) {
      times = availableTimes.filter(
        (time) => !isTimeInPast(selectedGregorianDate, time)
      );
    }
    return times;
  }, [availableTimes, selectedGregorianDate, currentGregorianDate]);

  const handleSubmit = async () => {
    if (!selectedGregorianDate || !selectedTime) {
      toast.error("لطفاً تاریخ و زمان جدید را انتخاب کنید");
      return;
    }

    if (selectedGregorianDate === currentDate && selectedTime === currentTime) {
      toast.error("زمان انتخابی با زمان قبلی یکسان است");
      return;
    }

    setLoading(true);
    try {
      await onConfirm(selectedGregorianDate, selectedTime);
    } catch (error) {
      // خطا توسط والد هندل می‌شود
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center">
        <div className="bg-[#14171c] w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] border-t sm:border border-white/10 overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300">
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#1a1d24]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-emerald-500" />
              </div>
              <h2 className="font-black text-xl text-white">تغییر زمان نوبت</h2>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Date Selection Display */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-500 mr-1 flex items-center gap-1">
                <CalendarIcon size={14} /> انتخاب تاریخ جدید
              </label>
              <button
                onClick={() => setIsCalendarOpen(true)}
                className="w-full bg-[#1a1d24] border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:border-emerald-500/30 transition-all"
              >
                <span className="text-white font-bold">
                  {selectedJalaliDate.day
                    ? `${selectedJalaliDate.day} ${
                        persianMonths[selectedJalaliDate.month - 1]
                      } ${selectedJalaliDate.year}`
                    : "انتخاب از تقویم"}
                </span>
                <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-emerald-500 transition-colors" />
              </button>
            </div>

            {/* Time Grid (Exactly like the picker) */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-500 mr-1 flex items-center gap-1">
                <Clock size={14} /> انتخاب ساعت حضور
              </label>

              {isFetching ? (
                <div className="py-10 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                  <p className="text-sm text-gray-500">در حال بررسی ظرفیت...</p>
                </div>
              ) : filteredTimes.length === 0 ? (
                <div className="py-10 bg-white/[0.02] rounded-2xl border border-dashed border-white/10 text-center">
                  <p className="text-sm text-gray-500">
                    ظرفیتی برای این تاریخ یافت نشد
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {filteredTimes.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`h-12 rounded-xl text-sm font-bold transition-all
                        ${
                          selectedTime === time
                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-95"
                            : "bg-[#1a1d24] text-gray-400 border border-white/5 hover:bg-white/5"
                        }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 bg-[#1a1d24] border-t border-white/5 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 h-14 bg-white/5 text-gray-400 rounded-2xl font-bold hover:bg-white/10 transition-colors"
            >
              انصراف
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedTime || loading || isFetching}
              className="flex-[2] h-14 bg-emerald-500 text-white rounded-2xl font-black text-lg disabled:opacity-30 disabled:grayscale transition-all shadow-lg shadow-emerald-500/10"
            >
              {loading ? "در حال ثبت..." : "تأیید نوبت جدید"}
            </button>
          </div>
        </div>
      </div>

      <JalaliCalendarModal
        selectedDate={selectedJalaliDate}
        setSelectedDate={setSelectedJalaliDate}
        isCalendarOpen={isCalendarOpen}
        setIsCalendarOpen={setIsCalendarOpen}
        offDays={offDays}
      />
    </>
  );
}

// آیکون کمکی
function RefreshCw(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}
