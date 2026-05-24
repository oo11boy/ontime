"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  ChevronLeft, 
  AlertCircle, 
  Loader2,
  Lock,
  Briefcase,
  Sun,
  Sunset,
  Moon,
  Users,
  X,
  CheckCircle
} from "lucide-react";
import {
  gregorianToPersian,
  jalaliToGregorian,
  getCurrentDateTime,
  persianMonths,
} from "@/lib/date-utils";
import JalaliCalendarModal from "@/app/(client pages)/clientdashboard/bookingsubmit/components/JalaliCalendarModal";
import { toast } from "react-hot-toast";

interface DateTimeSelectorProps {
  slug: string;
  selectedDate: string;
  selectedTime: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  onError?: (error: string | null) => void;
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

export function DateTimeSelector({ 
  slug, 
  selectedDate, 
  selectedTime, 
  onDateChange, 
  onTimeChange,
  onError 
}: DateTimeSelectorProps) {
  const { currentGregorianDate, currentTimeString } = getCurrentDateTime();
  
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [bookedTimes, setBookedTimes] = useState<BookedTime[]>([]);
  const [workShifts, setWorkShifts] = useState<WorkShift[]>([]);
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);
  
  const [selectedJalaliDate, setSelectedJalaliDate] = useState<{
    year: number;
    month: number;
    day: number | null;
  }>(() => {
    if (selectedDate) {
      const date = new Date(selectedDate);
      const persian = gregorianToPersian(date);
      return {
        year: persian.year,
        month: persian.month,
        day: persian.day,
      };
    }
    const now = new Date();
    const persian = gregorianToPersian(now);
    return {
      year: persian.year,
      month: persian.month,
      day: null,
    };
  });
  
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  
  const [hour, setHour] = useState<string>("");
  const [minute, setMinute] = useState<string>("");
  const [timeError, setTimeError] = useState<string | null>(null);
  
  const hourInputRef = useRef<HTMLInputElement>(null);
  const minuteInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const selectedGregorianDate = useMemo(() => {
    if (!selectedJalaliDate.day) return null;
    return jalaliToGregorian(
      selectedJalaliDate.year,
      selectedJalaliDate.month,
      selectedJalaliDate.day
    );
  }, [selectedJalaliDate]);

  const fetchAvailableTimes = async (date: string) => {
    if (!date) return;
    
    setIsLoadingTimes(true);
    setAvailableTimes([]);
    setBookedTimes([]);
    setWorkShifts([]);
    setHour("");
    setMinute("");
    setTimeError(null);
    
    try {
      const res = await fetch(
        `/api/customer/${slug}/available-times?date=${date}&t=${Date.now()}`
      );
      const data = await res.json();

      if (data.success) {
        setAvailableTimes(data.availableTimes || []);
        setBookedTimes(data.bookedTimes || []);
        
        const shifts = (data.workShifts || [
          { start: "08:00", end: "22:00" },
        ]).map((shift: any) => {
          const startHour = parseInt(shift.start.split(":")[0]);
          const endHour = parseInt(shift.end.split(":")[0]);
          let name = "شیفت کاری";
          
          const duration = endHour - startHour;
          const isLongShift = duration > 6;
          
          if (isLongShift) {
            if (startHour >= 6 && startHour <= 10 && endHour >= 14) {
              name = "شیفت کامل (صبح تا عصر)";
            } else if (startHour >= 10 && startHour <= 14 && endHour >= 18) {
              name = "شیفت کامل (ظهر تا شب)";
            } else {
              name = "شیفت کاری تمام‌وقت";
            }
          } else {
            if (startHour >= 0 && startHour < 12) {
              name = "شیفت صبح";
            } else if (startHour >= 12 && startHour < 16) {
              name = "شیفت ظهر";
            } else if (startHour >= 16 && startHour < 20) {
              name = "شیفت عصر";
            } else if (startHour >= 20) {
              name = "شیفت شب";
            }
          }
          
          return {
            start: shift.start,
            end: shift.end,
            name: shift.name || name
          };
        });
        
        setWorkShifts(shifts);
        
        if (selectedTime && !data.availableTimes.includes(selectedTime)) {
          onTimeChange("");
          setHour("");
          setMinute("");
        } else if (selectedTime) {
          const [h, m] = selectedTime.split(":");
          setHour(h);
          setMinute(m);
        }
        
        if (onError) onError(null);
      } else {
        if (onError) onError(data.message);
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching available times:", error);
      if (onError) onError("خطا در دریافت زمان‌ها");
      toast.error("خطا در دریافت زمان‌ها");
    } finally {
      setIsLoadingTimes(false);
    }
  };

  useEffect(() => {
    if (selectedGregorianDate) {
      fetchAvailableTimes(selectedGregorianDate);
    }
  }, [selectedGregorianDate]);

  useEffect(() => {
    if (selectedGregorianDate && !isLoadingTimes && availableTimes.length > 0 && !selectedTime) {
      const timer = setTimeout(() => {
        setIsTimeModalOpen(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [selectedGregorianDate, isLoadingTimes, availableTimes.length, selectedTime]);

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

  const hasGapFromBookings = (hourVal: number, minuteVal: number): { isValid: boolean; conflictTime?: string } => {
    const selectedMinutes = hourVal * 60 + minuteVal;
    
    for (const booked of bookedTimes) {
      const [bookedHour, bookedMinute] = booked.time.split(":").map(Number);
      const bookedStart = bookedHour * 60 + bookedMinute;
      const bookedEnd = bookedStart + (booked.duration || 30);
      
      const gapStart = bookedStart - 60;
      const gapEnd = bookedEnd + 60;
      
      if (selectedMinutes >= gapStart && selectedMinutes < gapEnd) {
        return { isValid: false, conflictTime: booked.time };
      }
    }
    
    return { isValid: true };
  };

  const isTimeAvailable = (hourVal: number, minuteVal: number): boolean => {
    const timeStr = `${hourVal.toString().padStart(2, "0")}:${minuteVal.toString().padStart(2, "0")}`;
    return availableTimes.includes(timeStr);
  };

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

  const handleConfirmTime = () => {
    setTimeError(null);

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

    if (!isTimeValidForToday(hourNum, minuteNum)) {
      setTimeError("این زمان در گذشته است و قابل انتخاب نیست");
      return;
    }

    if (!isWithinShift(hourNum, minuteNum)) {
      setTimeError("این زمان خارج از شیفت‌های کاری است");
      return;
    }

    const gapCheck = hasGapFromBookings(hourNum, minuteNum);
    if (!gapCheck.isValid) {
      setTimeError(`حداقل فاصله 60 دقیقه با نوبت رزرو شده در ساعت ${gapCheck.conflictTime} الزامی است`);
      return;
    }

    if (!isTimeAvailable(hourNum, minuteNum)) {
      setTimeError("این زمان قبلاً رزرو شده است");
      return;
    }

    const formattedTime = `${hourNum.toString().padStart(2, "0")}:${minuteNum.toString().padStart(2, "0")}`;
    onTimeChange(formattedTime);
    setIsTimeModalOpen(false);
    setTimeError(null);
  };

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

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length > 2) value = value.slice(0, 2);
    const numValue = parseInt(value);
    if (value && (numValue < 0 || numValue > 59)) return;
    setMinute(value);
    setTimeError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent, field: "hour" | "minute") => {
    if (e.key === "Enter") {
      if (field === "hour" && minuteInputRef.current) {
        minuteInputRef.current.focus();
      } else if (field === "minute") {
        handleConfirmTime();
      }
    }
  };

  const formatDateForDisplay = () => {
    if (!selectedJalaliDate.day) return "انتخاب تاریخ";
    return `${selectedJalaliDate.day} ${persianMonths[selectedJalaliDate.month]} ${selectedJalaliDate.year}`;
  };

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

  const getShiftIcon = (shiftName: string | undefined) => {
    if (!shiftName) return <Briefcase className="w-4 h-4 text-emerald-400" />;
    if (shiftName.includes("صبح")) return <Sun className="w-4 h-4 text-orange-400" />;
    if (shiftName.includes("ظهر")) return <Sun className="w-4 h-4 text-yellow-400" />;
    if (shiftName.includes("عصر")) return <Sunset className="w-4 h-4 text-emerald-400" />;
    if (shiftName.includes("شب")) return <Moon className="w-4 h-4 text-blue-400" />;
    return <Briefcase className="w-4 h-4 text-emerald-400" />;
  };

  // مودال تاریخ با هدر و فوتر ثابت
  const CustomCalendarModal = () => (
    <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-gray-800/95 backdrop-blur-2xl rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[90vh] flex flex-col"
      >
        {/* Header ثابت */}
        <div className="sticky top-0 bg-gray-800/95 backdrop-blur-2xl px-4 sm:px-6 py-4 border-b border-white/10 flex justify-between items-center z-10 rounded-t-3xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">انتخاب تاریخ</h3>
          </div>
          <button
            onClick={() => setIsCalendarOpen(false)}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center active:bg-white/10 transition touch-manipulation"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* محتوای اسکرول‌شونده */}
        <div ref={contentRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          <JalaliCalendarModal
            selectedDate={selectedJalaliDate}
            setSelectedDate={(date) => {
              setSelectedJalaliDate(date);
              if (date.day) {
                const gregorianDate = jalaliToGregorian(date.year, date.month, date.day);
                onDateChange(gregorianDate);
              }
              setIsCalendarOpen(false);
            }}
            isCalendarOpen={isCalendarOpen}
            setIsCalendarOpen={setIsCalendarOpen}
            offDays={[]}
         
          />
        </div>

        {/* Footer ثابت */}
        <div className="sticky bottom-0 bg-gray-800/95 backdrop-blur-2xl px-4 sm:px-6 py-4 border-t border-white/10">
          <button
            onClick={() => setIsCalendarOpen(false)}
            className="w-full py-3.5 sm:py-3 bg-gradient-to-r from-gray-600 to-gray-700 rounded-xl text-white font-bold transition-all active:scale-95 touch-manipulation text-sm sm:text-base"
          >
            بستن
          </button>
        </div>
      </motion.div>
    </div>
  );

  // مودال زمان با هدر و فوتر ثابت
  const TimeModal = () => (
    <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-gray-800/95 backdrop-blur-2xl rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[90vh] flex flex-col"
      >
        {/* Header ثابت */}
        <div className="sticky top-0 bg-gray-800/95 backdrop-blur-2xl px-4 sm:px-6 py-4 border-b border-white/10 flex justify-between items-center z-10 rounded-t-3xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">انتخاب ساعت</h3>
          </div>
          <button
            onClick={() => setIsTimeModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center active:bg-white/10 transition touch-manipulation"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* محتوای اسکرول‌شونده */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-5">
          {/* نمایش تاریخ انتخاب شده */}
          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl p-3 border border-emerald-500/20">
            <p className="text-xs text-gray-400 text-center">تاریخ انتخاب شده</p>
            <p className="text-white font-bold text-sm sm:text-base text-center mt-1">
              {formatDateForDisplay()}
            </p>
          </div>


          {timeError && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-red-400 text-sm p-3 bg-red-500/10 rounded-xl"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm">{timeError}</span>
            </motion.div>
          )}

          {/* شیفت‌های کاری */}
          {workShifts.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-semibold text-gray-300">شیفت‌های کاری</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {workShifts.map((shift, idx) => (
                  <div key={idx} className="bg-white/5 rounded-lg p-2 border border-white/10">
                    <div className="flex items-center gap-1 mb-1">
                      {getShiftIcon(shift.name)}
                      <p className="text-xs text-emerald-400 line-clamp-1">{shift.name || "شیفت کاری"}</p>
                    </div>
                    <p className="text-xs text-white font-medium">{shift.start} تا {shift.end}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* زمان‌های رزرو شده */}
          {bookedTimes.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Users className="w-4 h-4 text-red-400" />
                <h4 className="text-sm font-semibold text-gray-300">
                  زمان‌های رزرو شده ({bookedTimes.length})
                </h4>
                <span className="text-[10px] text-red-400">(۶۰ دقیقه قبل و بعد مسدود)</span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {getBookedTimesByShift().map((shift: any, idx) => (
                  shift.bookings.length > 0 && (
                    <div key={idx} className="bg-red-500/5 rounded-lg p-2 border border-red-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                        <span className="text-xs font-medium text-red-400 line-clamp-1">{shift.name || "شیفت کاری"}</span>
                        <span className="text-xs text-gray-500">({shift.bookings.length} نوبت)</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                        {shift.bookings.map((booking: BookedTime, bIdx: number) => (
                          <div key={bIdx} className="bg-red-500/10 rounded-lg p-1.5 text-center">
                            <p className="text-xs font-mono text-red-400">{booking.time}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {/* زمان‌های موجود */}
          {availableTimes.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-semibold text-gray-300">زمان‌های موجود</h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {availableTimes.map((time) => (
                  <button
                    key={time}
                    onClick={() => {
                      const [h, m] = time.split(":");
                      setHour(h);
                      setMinute(m);
                      onTimeChange(time);
                      setIsTimeModalOpen(false);
                      setTimeError(null);
                    }}
                    className="py-2.5 sm:py-2 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white rounded-lg text-sm font-medium transition active:scale-95 touch-manipulation"
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* پیام عدم وجود زمان خالی */}
          {availableTimes.length === 0 && !isLoadingTimes && (
            <div className="text-center py-6">
              <AlertCircle className="w-10 h-10 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500">هیچ زمان خالی برای این تاریخ وجود ندارد</p>
              <p className="text-xs text-gray-600 mt-1">تاریخ دیگری انتخاب کنید</p>
            </div>
          )}

          {isLoadingTimes && (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            </div>
          )}

          {/* راهنما */}
          {(workShifts.length > 0 || bookedTimes.length > 0) && (
            <div className="pt-2 border-t border-gray-700">
              <div className="flex items-center justify-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-gray-500 flex-wrap">
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
                  <span>۶۰ دقیقه فاصله</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer ثابت با دو دکمه */}
        <div className="sticky bottom-0 bg-gray-800/95 backdrop-blur-2xl px-4 sm:px-6 py-4 border-t border-white/10">
          <div className="flex gap-3">
            <button
              onClick={() => setIsTimeModalOpen(false)}
              className="flex-1 py-3.5 sm:py-3 bg-gray-600 rounded-xl text-white font-bold transition-all active:scale-95 touch-manipulation text-sm sm:text-base"
            >
              انصراف
            </button>
            <button
              onClick={handleConfirmTime}
              disabled={isLoadingTimes || availableTimes.length === 0}
              className="flex-1 py-3.5 sm:py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white font-bold transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 touch-manipulation text-sm sm:text-base"
            >
              {isLoadingTimes ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                "تأیید زمان"
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* باکس انتخاب تاریخ */}
      <div className="bg-white/5 rounded-xl border border-white/10 p-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          تاریخ <span className="text-red-400">*</span>
        </label>
        <button
          onClick={() => setIsCalendarOpen(true)}
          className="w-full flex items-center justify-between p-3 rounded-lg bg-white/10 border border-white/20 text-white hover:border-emerald-500 transition active:scale-98 touch-manipulation"
        >
          <span className="flex items-center gap-2 text-sm sm:text-base">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <span className="line-clamp-1 text-right">{formatDateForDisplay()}</span>
          </span>
          <ChevronLeft className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* باکس نمایش زمان انتخاب شده */}
      <div className="bg-white/5 rounded-xl border border-white/10 p-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          زمان <span className="text-red-400">*</span>
        </label>
        {selectedTime ? (
          <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span className="text-white font-medium text-sm sm:text-base">{selectedTime}</span>
            </div>
            <button
              onClick={() => setIsTimeModalOpen(true)}
              className="text-xs text-emerald-400 hover:text-emerald-300 active:text-emerald-200 touch-manipulation px-2 py-1"
            >
              ویرایش
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              if (selectedJalaliDate.day) {
                setIsTimeModalOpen(true);
              } else {
                toast.error("ابتدا تاریخ را انتخاب کنید");
              }
            }}
            disabled={!selectedJalaliDate.day}
            className="w-full flex items-center justify-between p-3 rounded-lg bg-white/10 border border-white/20 text-white hover:border-emerald-500 transition active:scale-98 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center gap-2 text-sm sm:text-base">
              <Clock className="w-5 h-5 text-emerald-400" />
              <span>انتخاب زمان</span>
            </span>
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>

      {/* مودال تقویم */}
      <AnimatePresence>
        {isCalendarOpen && <CustomCalendarModal />}
      </AnimatePresence>

      {/* مودال زمان */}
      <AnimatePresence>
        {isTimeModalOpen && <TimeModal />}
      </AnimatePresence>
    </div>
  );
}