"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { X, Clock, Calendar as CalendarIcon, ChevronLeft, Lock, AlertTriangle, Briefcase, Users, Sun, Sunset, Moon } from "lucide-react";
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
  currentDate: string;
  currentTime: string;
  customerToken: string;
  offDays?: number[];
  onClose: () => void;
  onConfirm: (newDate: string, newTime: string) => Promise<void>;
}

interface BookedTime {
  time: string;
  clientName: string;
  startTime: string;
  endTime: string;
  duration: number;
}

interface WorkShift {
  start: string;
  end: string;
  name?: string;
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
    day: currentPersian.day,
  });

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [bookedTimes, setBookedTimes] = useState<BookedTime[]>([]);
  const [workShifts, setWorkShifts] = useState<WorkShift[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // State برای دو کادر جداگانه ساعت و دقیقه
  const [hour, setHour] = useState<string>("");
  const [minute, setMinute] = useState<string>("");
  const [timeError, setTimeError] = useState<string | null>(null);
  
  const hourInputRef = useRef<HTMLInputElement>(null);
  const minuteInputRef = useRef<HTMLInputElement>(null);

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
    setAvailableTimes([]);
    setBookedTimes([]);
    setWorkShifts([]);
    setHour("");
    setMinute("");
    setTimeError(null);
    
    try {
      const res = await fetch(
        `/api/customer/available-times?token=${customerToken}&date=${date}&t=${Date.now()}`
      );
      const data = await res.json();

      if (!data.success) throw new Error(data.message);

      setAvailableTimes(data.availableTimes || []);
      setBookedTimes(data.bookedTimes || []);
      
      // پردازش شیفت‌های کاری - اطمینان از وجود name
      const shifts = (data.workShifts || [
        { start: "09:00", end: "13:00" },
        { start: "16:00", end: "20:00" }
      ]).map((shift: any) => {
        const startHour = parseInt(shift.start.split(":")[0]);
        let name = "شیفت کاری";
        
        if (startHour >= 0 && startHour < 12) {
          name = "شیفت صبح";
        } else if (startHour >= 12 && startHour < 16) {
          name = "شیفت ظهر";
        } else if (startHour >= 16 && startHour < 20) {
          name = "شیفت عصر";
        } else if (startHour >= 20) {
          name = "شیفت شب";
        }
        
        return {
          start: shift.start,
          end: shift.end,
          name: shift.name || name
        };
      });
      
      setWorkShifts(shifts);
    } catch (err: any) {
      toast.error(err.message || "خطا در دریافت زمان‌ها");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (selectedGregorianDate) {
      fetchAvailableTimes(selectedGregorianDate);
    }
  }, [selectedGregorianDate]);

  // بررسی داخل شیفت بودن
  const isWithinShift = (hourVal: number, minuteVal: number): boolean => {
    const timeMinutes = hourVal * 60 + minuteVal;
    return workShifts.some((shift) => {
      const [startHour, startMinute] = shift.start.split(":").map(Number);
      const [endHour, endMinute] = shift.end.split(":").map(Number);
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;
      return timeMinutes >= startMinutes && timeMinutes < endMinutes;
    });
  };

  // بررسی فاصله 60 دقیقه با نوبت‌های رزرو شده
  const hasGapFromBookings = (hourVal: number, minuteVal: number): { isValid: boolean; conflictTime?: string } => {
    const selectedMinutes = hourVal * 60 + minuteVal;
    
    for (const booked of bookedTimes) {
      const [bookedHour, bookedMinute] = booked.time.split(":").map(Number);
      const bookedStart = bookedHour * 60 + bookedMinute;
      const bookedEnd = bookedStart + (booked.duration || 30);
      
      // بررسی فاصله 60 دقیقه قبل و بعد
      const gapStart = bookedStart - 60;
      const gapEnd = bookedEnd + 60;
      
      if (selectedMinutes >= gapStart && selectedMinutes < gapEnd) {
        return { isValid: false, conflictTime: booked.time };
      }
    }
    
    return { isValid: true };
  };

  // بررسی موجود بودن در لیست زمان‌های خالی
  const isTimeAvailable = (hourVal: number, minuteVal: number): boolean => {
    const timeStr = `${hourVal.toString().padStart(2, "0")}:${minuteVal.toString().padStart(2, "0")}`;
    return availableTimes.includes(timeStr);
  };

  // بررسی زمان گذشته برای امروز
  const isTimeValidForToday = (hourVal: number, minuteVal: number): boolean => {
    if (!selectedGregorianDate) return true;
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMinute;
    const selectedTotalMinutes = hourVal * 60 + minuteVal;
    
    if (selectedGregorianDate === currentGregorianDate) {
      return selectedTotalMinutes > currentTotalMinutes;
    }
    
    return true;
  };

  // اعمال زمان
  const handleConfirmTime = () => {
    setTimeError(null);

    // اعتبارسنجی ورودی‌ها
    if (!hour || !minute) {
      setTimeError("لطفاً ساعت و دقیقه را وارد کنید");
      return;
    }

    const hourNum = parseInt(hour);
    const minuteNum = parseInt(minute);

    if (isNaN(hourNum) || hourNum < 0 || hourNum > 23) {
      setTimeError("ساعت باید بین 0 تا 23 باشد");
      return;
    }

    if (isNaN(minuteNum) || minuteNum < 0 || minuteNum > 59) {
      setTimeError("دقیقه باید بین 0 تا 59 باشد");
      return;
    }

    // بررسی زمان گذشته برای امروز
    if (!isTimeValidForToday(hourNum, minuteNum)) {
      setTimeError("این زمان در گذشته است و قابل انتخاب نیست");
      return;
    }

    // بررسی داخل شیفت بودن
    if (!isWithinShift(hourNum, minuteNum)) {
      setTimeError("این زمان خارج از شیفت‌های کاری است");
      return;
    }

    // بررسی فاصله 60 دقیقه با نوبت‌های رزرو شده
    const gapCheck = hasGapFromBookings(hourNum, minuteNum);
    if (!gapCheck.isValid) {
      setTimeError(`حداقل فاصله 60 دقیقه با نوبت رزرو شده در ساعت ${gapCheck.conflictTime} الزامی است`);
      return;
    }

    // بررسی موجود بودن در لیست زمان‌های خالی
    if (!isTimeAvailable(hourNum, minuteNum)) {
      setTimeError("این زمان در شیفت کاری موجود نیست");
      return;
    }

    // موفقیت
    const formattedTime = `${hourNum.toString().padStart(2, "0")}:${minuteNum.toString().padStart(2, "0")}`;
    if (selectedGregorianDate) {
      onConfirm(selectedGregorianDate, formattedTime);
      onClose();
    }
  };

  // هندل تغییر ساعت
  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length > 2) value = value.slice(0, 2);

    const numValue = parseInt(value);
    if (value && (numValue < 0 || numValue > 23)) return;

    setHour(value);
    setTimeError(null);

    if (value.length === 2 && minuteInputRef.current) {
      minuteInputRef.current.focus();
    }
  };

  // هندل تغییر دقیقه
  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length > 2) value = value.slice(0, 2);

    const numValue = parseInt(value);
    if (value && (numValue < 0 || numValue > 59)) return;

    setMinute(value);
    setTimeError(null);
  };

  // هندل کیبورد
  const handleKeyPress = (e: React.KeyboardEvent, field: "hour" | "minute") => {
    if (e.key === "Enter") {
      if (field === "hour" && minuteInputRef.current) {
        minuteInputRef.current.focus();
      } else if (field === "minute") {
        handleConfirmTime();
      }
    }
  };

  // گروه‌بندی زمان‌های رزرو شده بر اساس شیفت
  const getBookedTimesByShift = () => {
    const shifts = [...workShifts];
    return shifts.map(shift => {
      const bookingsInShift = bookedTimes.filter(booked => {
        const bookedMinutes = parseInt(booked.time.split(":")[0]) * 60 + parseInt(booked.time.split(":")[1]);
        const [startHour, startMinute] = shift.start.split(":").map(Number);
        const [endHour, endMinute] = shift.end.split(":").map(Number);
        const startMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;
        return bookedMinutes >= startMinutes && bookedMinutes < endMinutes;
      });
      return { ...shift, bookings: bookingsInShift };
    });
  };

  // دریافت آیکون مناسب برای شیفت (با بررسی undefined)
  const getShiftIcon = (shiftName: string | undefined) => {
    if (!shiftName) return <Briefcase className="w-4 h-4 text-emerald-400" />;
    if (shiftName.includes("صبح")) return <Sun className="w-4 h-4 text-orange-400" />;
    if (shiftName.includes("ظهر")) return <Sun className="w-4 h-4 text-yellow-400" />;
    if (shiftName.includes("عصر")) return <Sunset className="w-4 h-4 text-emerald-400" />;
    if (shiftName.includes("شب")) return <Moon className="w-4 h-4 text-blue-400" />;
    return <Briefcase className="w-4 h-4 text-emerald-400" />;
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center">
        <div className="bg-[#14171c] w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] border-t sm:border border-white/10 overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300 max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#1a1d24] flex-shrink-0">
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

          <div className="p-6 space-y-6 overflow-y-auto flex-1">
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
                        persianMonths[selectedJalaliDate.month]
                      } ${selectedJalaliDate.year}`
                    : "انتخاب از تقویم"}
                </span>
                <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-emerald-500 transition-colors" />
              </button>
            </div>

            {/* Time Input Section - دو کادر مجزا */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-500 mr-1 flex items-center gap-1">
                <Clock size={14} /> انتخاب ساعت جدید
              </label>
              
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                {/* دو کادر ساعت و دقیقه */}
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="flex-1">
                    <input
                      ref={hourInputRef}
                      type="text"
                      value={hour}
                      onChange={handleHourChange}
                      onKeyPress={(e) => handleKeyPress(e, "hour")}
                      placeholder="ساعت"
                      className="w-full text-center px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white text-2xl font-bold placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                      dir="ltr"
                      maxLength={2}
                    />
                    <p className="text-center text-xs text-gray-500 mt-1">0-23</p>
                  </div>

                  <div className="text-3xl font-bold text-emerald-400">:</div>

                  <div className="flex-1">
                    <input
                      ref={minuteInputRef}
                      type="text"
                      value={minute}
                      onChange={handleMinuteChange}
                      onKeyPress={(e) => handleKeyPress(e, "minute")}
                      placeholder="دقیقه"
                      className="w-full text-center px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white text-2xl font-bold placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                      dir="ltr"
                      maxLength={2}
                    />
                    <p className="text-center text-xs text-gray-500 mt-1">0-59</p>
                  </div>
                </div>

                {/* نمایش پیش‌نمایش زمان انتخابی */}
                {hour && minute && !timeError && (
                  <div className="text-center mb-4 p-2 bg-emerald-500/20 rounded-lg">
                    <span className="text-sm text-gray-300">زمان انتخابی: </span>
                    <span className="text-lg font-bold text-emerald-400">
                      {hour.toString().padStart(2, "0")}:{minute.toString().padStart(2, "0")}
                    </span>
                  </div>
                )}

                {timeError && (
                  <div className="flex items-center gap-2 text-red-400 text-sm p-3 bg-red-500/10 rounded-xl mb-4">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{timeError}</span>
                  </div>
                )}

                <button
                  onClick={handleConfirmTime}
                  disabled={loading || isFetching}
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-white font-medium transition-all active:scale-95 disabled:opacity-50"
                >
                  تغییر زمان نوبت
                </button>
              </div>
            </div>

            {/* Shifts and Booked Times Section */}
            {!isFetching && (
              <div className="space-y-4">
                {/* شیفت‌های کاری */}
                {workShifts.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Briefcase className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-sm font-semibold text-gray-300">شیفت‌های کاری مجموعه</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {workShifts.map((shift, idx) => (
                        <div key={idx} className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <div className="flex items-center gap-2 mb-1">
                            {getShiftIcon(shift.name)}
                            <p className="text-xs text-emerald-400">{shift.name || "شیفت کاری"}</p>
                          </div>
                          <p className="text-sm text-white font-medium">{shift.start} تا {shift.end}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* زمان‌های رزرو شده */}
                {bookedTimes.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 text-red-400" />
                      <h4 className="text-sm font-semibold text-gray-300">
                        زمان‌های رزرو شده ({bookedTimes.length})
                      </h4>
                      <p className="text-[10px] text-red-400">(۶۰ دقیقه قبل و بعد مسدود)</p>
                    </div>
                    <div className="space-y-3">
                      {getBookedTimesByShift().map((shift: any, idx) => (
                        shift.bookings.length > 0 && (
                          <div key={idx} className="bg-red-500/5 rounded-xl p-3 border border-red-500/20">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                              <span className="text-xs font-medium text-red-400">{shift.name || "شیفت کاری"}</span>
                              <span className="text-xs text-gray-500">({shift.bookings.length} نوبت)</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              {shift.bookings.map((booking: BookedTime, bIdx: number) => (
                                <div key={bIdx} className="bg-red-500/10 rounded-lg p-2 text-center">
                                  <p className="text-sm font-mono text-red-400 ">{booking.time}</p>
                                  <p className="text-[10px] text-gray-500">۶۰ دقیقه فاصله الزامی</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {/* راهنما */}
                {(workShifts.length > 0 || bookedTimes.length > 0) && (
                  <div className="pt-2 border-t border-white/10">
                    <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <span>قابل انتخاب</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                        <span>رزرو شده</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Lock className="w-3 h-3 text-yellow-400" />
                        <span>۶۰ دقیقه فاصله الزامی</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* پیام عدم وجود زمان خالی */}
                {availableTimes.length === 0 && bookedTimes.length === 0 && workShifts.length > 0 && (
                  <div className="py-8 text-center">
                    <AlertTriangle className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">هیچ زمان خالی برای این تاریخ وجود ندارد</p>
                  </div>
                )}
              </div>
            )}

            {isFetching && (
              <div className="py-10 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                <p className="text-sm text-gray-500">در حال بررسی ظرفیت...</p>
              </div>
            )}

            {/* نمایش زمان فعلی نوبت */}
            <div className="pt-2 border-t border-white/5">
              <p className="text-xs text-gray-500 text-center">
                زمان فعلی نوبت شما:{" "}
                <span className="text-emerald-400 font-bold">
                  {gregorianToPersian(currentDate).day}{" "}
                  {persianMonths[gregorianToPersian(currentDate).month - 1]} ساعت {currentTime}
                </span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 bg-[#1a1d24] border-t border-white/5 flex gap-3 flex-shrink-0">
            <button
              onClick={onClose}
              className="flex-1 h-14 bg-white/5 text-gray-400 rounded-2xl font-bold hover:bg-white/10 transition-colors"
            >
              انصراف
            </button>
            <button
              onClick={handleConfirmTime}
              disabled={loading || isFetching}
              className="flex-[2] h-14 bg-emerald-500 text-white rounded-2xl font-black text-lg disabled:opacity-30 disabled:grayscale transition-all shadow-lg shadow-emerald-500/10"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  در حال ثبت...
                </div>
              ) : (
                "تأیید نوبت جدید"
              )}
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