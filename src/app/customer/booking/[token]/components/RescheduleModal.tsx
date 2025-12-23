"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, Clock } from "lucide-react";
import { toast } from "react-hot-toast";

import {

  gregorianToPersian,
  getTodayJalali,
  isPastDate,
  jalaliToGregorian,
  formatPersianDate,
} from "@/lib/date-utils"; 


interface RescheduleModalProps {
  currentDate: string; // YYYY-MM-DD
  currentTime: string; // HH:mm
  onClose: () => void;
  onConfirm: (newDate: string, newTime: string) => Promise<void>;
}

interface AvailableTimesResponse {
  success: boolean;
  availableTimes: string[];
  bookedTimes: Array<{
    time: string;
    clientName: string;
    startTime: string;
    endTime: string;
    duration: number;
    services: string;
  }>;
  currentTime: string;
  isToday: boolean;
}

export default function RescheduleModal({
  currentDate,
  currentTime,
  onClose,
  onConfirm,
}: RescheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [selectedTime, setSelectedTime] = useState(currentTime);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // دریافت زمان‌های آزاد
  const fetchAvailableTimes = async (date: string) => {
    if (!date) return;
    setIsFetching(true);
    try {
      const response = await fetch(
        `/api/client/available-times?date=${date}&duration=30`
      );
      const data: AvailableTimesResponse = await response.json();
      if (data.success) {
        setAvailableTimes(data.availableTimes);
      }
    } catch (error) {
      console.error("Error fetching available times:", error);
      toast.error("خطا در دریافت زمان‌های آزاد");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchAvailableTimes(selectedDate);
  }, [selectedDate]);

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error("لطفا تاریخ و زمان جدید را انتخاب کنید");
      return;
    }

    if (selectedDate === currentDate && selectedTime === currentTime) {
      toast.error("لطفا تاریخ یا زمان جدیدی انتخاب کنید");
      return;
    }

    // اختیاری: اگر می‌خواهید از انتخاب زمان گذشته جلوگیری کنید
    if (isPastDate(selectedDate, selectedTime)) {
      toast.error("نمی‌توانید زمانی در گذشته انتخاب کنید");
      return;
    }

    setLoading(true);
    try {
      await onConfirm(selectedDate, selectedTime);
    } finally {
      setLoading(false);
    }
  };

  // محاسبه min برای input date (فردا به میلادی)
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const minDateStr = tomorrow.toISOString().split("T")[0];

  // تبدیل تاریخ‌های فعلی و انتخاب‌شده به شمسی
  const currentPersian = gregorianToPersian(currentDate);
  const selectedPersian = gregorianToPersian(selectedDate);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1e26] rounded-2xl w-full max-w-md border border-white/10 max-h-[90vh] overflow-y-auto">
        {/* هدر */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#1a1e26]">
          <h2 className="font-bold text-lg">تغییر زمان نوبت</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="بستن"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* محتوا */}
        <div className="p-4 space-y-4">
          {/* انتخاب تاریخ */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              <Calendar className="w-4 h-4 inline ml-1" />
              تاریخ جدید
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={minDateStr} // حداقل از فردا میلادی
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            {/* نمایش تاریخ شمسی زیر input */}
            <p className="mt-2 text-sm text-gray-400">
              {formatPersianDate(selectedDate)} ({selectedPersian.weekDay})
            </p>
          </div>

          {/* انتخاب زمان */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              <Clock className="w-4 h-4 inline ml-1" />
              زمان جدید
            </label>

            {isFetching ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-400 text-sm">
                  در حال دریافت زمان‌های آزاد...
                </p>
              </div>
            ) : availableTimes.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {availableTimes.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`py-3 rounded-lg text-sm transition-all ${
                      selectedTime === time
                        ? "bg-emerald-500 text-white ring-2 ring-emerald-500/50"
                        : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                زمان آزادی برای این تاریخ وجود ندارد
              </div>
            )}
          </div>

          {/* اطلاعات فعلی */}
          <div className="p-3 bg-white/5 rounded-lg">
            <p className="text-sm text-gray-300 mb-1">زمان فعلی:</p>
            <p className="font-bold">
              {currentPersian.fullDate} - {currentTime} (
              {currentPersian.weekDay})
            </p>
          </div>

          {/* اطلاعات جدید */}
          {selectedDate && selectedTime && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <p className="text-sm text-emerald-300 mb-1">زمان جدید:</p>
              <p className="font-bold text-emerald-400">
                {selectedPersian.fullDate} - {selectedTime} (
                {selectedPersian.weekDay})
              </p>
            </div>
          )}
        </div>

        {/* دکمه‌ها */}
        <div className="p-4 border-t border-white/10 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            انصراف
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              loading ||
              isFetching ||
              !selectedDate ||
              !selectedTime ||
              (selectedDate === currentDate && selectedTime === currentTime)
            }
            className="flex-1 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "در حال تغییر..." : "تأیید تغییر"}
          </button>
        </div>
      </div>
    </div>
  );
}
