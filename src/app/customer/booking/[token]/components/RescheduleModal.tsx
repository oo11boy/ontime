"use client";

import React, { useEffect, useMemo, useState } from "react";
import { X, Clock } from "lucide-react";
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
  onClose: () => void;
  onConfirm: (newDate: string, newTime: string) => Promise<void>;
}

export default function RescheduleModal({
  currentDate,
  currentTime,
  customerToken,
  onClose,
  onConfirm,
}: RescheduleModalProps) {
  const currentPersian = gregorianToPersian(currentDate);
  const { currentGregorianDate, currentTimeString } = getCurrentDateTime();

  // 📅 تاریخ شمسی انتخاب‌شده
  const [selectedJalaliDate, setSelectedJalaliDate] = useState<{
    year: number;
    month: number;
    day: number | null;
  }>({
    year: currentPersian.year,
    month: currentPersian.month,
    day: null,
  });

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔁 تبدیل تاریخ شمسی به میلادی فقط وقتی day انتخاب شد
  const selectedGregorianDate = useMemo(() => {
    if (!selectedJalaliDate.day) return null;
    return jalaliToGregorian(
      selectedJalaliDate.year,
      selectedJalaliDate.month,
      selectedJalaliDate.day
    );
  }, [selectedJalaliDate]);

  // ⏱ دریافت زمان‌های آزاد
const fetchAvailableTimes = async (date: string) => {
  setIsFetching(true);
  setSelectedTime(null);
  try {
    const res = await fetch(
      `/api/customer/available-times?token=${customerToken}&date=${date}`
    );
    const data = await res.json();

    if (!data.success) {
      throw new Error(data.message || "خطا در دریافت زمان‌ها");
    }

    setAvailableTimes(data.availableTimes);
  } catch (err: any) {
    toast.error(err.message || "خطا در دریافت زمان‌های آزاد");
    setAvailableTimes([]);
  } finally {
    setIsFetching(false);
  }
};

  // 🧠 هر بار تاریخ عوض شد → دریافت زمان‌ها
  useEffect(() => {
    if (!selectedGregorianDate) return;
    fetchAvailableTimes(selectedGregorianDate);
  }, [selectedGregorianDate]);

  // ❌ فیلتر زمان‌های گذشته اگر تاریخ امروز است
  const filteredTimes = useMemo(() => {
    if (!selectedGregorianDate) return [];

    if (selectedGregorianDate !== currentGregorianDate)
      return availableTimes;

    return availableTimes.filter(
      (time) =>
        !isTimeInPast(
          selectedGregorianDate,
          time,
    
        )
    );
  }, [availableTimes, selectedGregorianDate]);

  // ✅ ثبت تغییر
  const handleSubmit = async () => {
    if (!selectedGregorianDate || !selectedTime) {
      toast.error("لطفاً تاریخ و زمان جدید را انتخاب کنید");
      return;
    }

    if (
      selectedGregorianDate === currentDate &&
      selectedTime === currentTime
    ) {
      toast.error("زمان جدید باید متفاوت باشد");
      return;
    }

    setLoading(true);
    try {
      await onConfirm(selectedGregorianDate, selectedTime);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-[#1a1e26] w-full max-w-md rounded-2xl border border-white/10">

          {/* Header */}
          <div className="p-4 border-b border-white/10 flex justify-between">
            <h2 className="font-bold text-lg">تغییر زمان نوبت</h2>
            <button onClick={onClose}>
              <X />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-6">

            {/* 📅 انتخاب تاریخ (شمسی) */}
            <button
              onClick={() => setIsCalendarOpen(true)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-right hover:bg-white/10 transition"
            >
              <span className="text-sm text-gray-400">تاریخ جدید</span>
              <div className="font-bold mt-1">
                {selectedJalaliDate.day
                  ? `${selectedJalaliDate.day} ${persianMonths[selectedJalaliDate.month]} ${selectedJalaliDate.year}`
                  : "انتخاب تاریخ"}
              </div>
            </button>

            {/* ⏰ انتخاب زمان */}
            <div>
              <p className="text-sm text-gray-300 mb-2 flex items-center gap-1">
                <Clock size={16} /> زمان جدید
              </p>

              {isFetching ? (
                <p className="text-center text-gray-400 text-sm">
                  در حال دریافت زمان‌ها...
                </p>
              ) : filteredTimes.length === 0 ? (
                <p className="text-center text-gray-500 text-sm">
                  زمانی برای این تاریخ وجود ندارد
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {filteredTimes.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`py-2 rounded-lg text-sm transition
                        ${
                          selectedTime === time
                            ? "bg-emerald-500 text-white"
                            : "bg-white/5 hover:bg-white/10"
                        }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-white/5 py-3 rounded-lg"
            >
              انصراف
            </button>

            <button
              onClick={handleSubmit}
              disabled={!selectedTime || loading}
              className="flex-1 bg-emerald-500/20 text-emerald-300 py-3 rounded-lg disabled:opacity-40"
            >
              {loading ? "در حال ثبت..." : "تأیید تغییر"}
            </button>
          </div>
        </div>
      </div>

      {/* 📅 مودال تقویم شمسی */}
      <JalaliCalendarModal
        selectedDate={selectedJalaliDate}
        setSelectedDate={setSelectedJalaliDate}
        isCalendarOpen={isCalendarOpen}
        setIsCalendarOpen={setIsCalendarOpen}
      />
    </>
  );
}
