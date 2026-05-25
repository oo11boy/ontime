"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  X,
  Clock,
  Loader2,
  AlertCircle,
  CheckCircle,
  Calendar,
  ChevronLeft,
  AlertTriangle,
  Clock as ClockIcon,
  Users,
  Briefcase,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { jalaliToGregorian } from "@/lib/date-utils";

interface Service {
  id: number;
  name: string;
  duration_minutes?: number;
}

interface BookedTime {
  time: string;
  clientName: string;
  startTime: string;
  endTime: string;
  duration: number;
  services?: string;
}

interface WorkShift {
  start: string;
  end: string;
  name: string;
}

interface TimePickerModalProps {
  selectedDate: { year: number; month: number; day: number | null };
  selectedTime: string;
  setSelectedTime: (time: string) => void;
  isTimePickerOpen: boolean;
  setIsTimePickerOpen: (open: boolean) => void;
  selectedServices: Service[];
}

const TimePickerModal: React.FC<TimePickerModalProps> = ({
  selectedDate,
  selectedTime,
  setSelectedTime,
  isTimePickerOpen,
  setIsTimePickerOpen,
  selectedServices,
}) => {
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [bookedTimes, setBookedTimes] = useState<BookedTime[]>([]);
  const [workShifts, setWorkShifts] = useState<WorkShift[]>([]);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [isToday, setIsToday] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [hour, setHour] = useState<string>("");
  const [minute, setMinute] = useState<string>("");
  const [timeError, setTimeError] = useState<string | null>(null);

  const hourInputRef = useRef<HTMLInputElement>(null);
  const minuteInputRef = useRef<HTMLInputElement>(null);

  const totalDuration =
    selectedServices.length === 0
      ? 1
      : selectedServices.reduce((sum, s) => sum + (s.duration_minutes || 1), 0);

  const formatDuration = (minutes: number): string => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours} ساعت و ${mins} دقیقه` : `${hours} ساعت`;
    }
    return `${minutes} دقیقه`;
  };

  const fetchAvailableTimes = useCallback(async () => {
    if (!selectedDate.day) return;
    setLoading(true);
    setError(null);
    try {
      const gregorianDate = jalaliToGregorian(
        selectedDate.year,
        selectedDate.month,
        selectedDate.day!,
      );
      const url = `/api/client/available-times?date=${gregorianDate}&duration=${totalDuration}&t=${Date.now()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("خطا در پاسخ سرور");
      const data = await res.json();
      if (data.success) {
        setAvailableTimes(data.availableTimes || []);
        setBookedTimes(data.bookedTimes || []);
        setWorkShifts(
          data.workShifts || [
            { start: "09:00", end: "13:00", name: "شیفت صبح" },
            { start: "16:00", end: "20:00", name: "شیفت عصر" },
          ],
        );
        setCurrentTime(data.currentTime || "");
        setIsToday(data.isToday || false);

        if (selectedTime && !data.availableTimes?.includes(selectedTime)) {
          setSelectedTime("");
          setHour("");
          setMinute("");
        } else if (selectedTime) {
          const [h, m] = selectedTime.split(":");
          setHour(h);
          setMinute(m);
        }
      } else {
        setError(data.message || "داده نامعتبر از سرور");
      }
    } catch (err) {
      console.error("Error fetching available times:", err);
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  }, [selectedDate, totalDuration, selectedTime, setSelectedTime]);

  useEffect(() => {
    if (isTimePickerOpen && selectedDate.day) {
      fetchAvailableTimes();
    }
  }, [isTimePickerOpen, selectedDate, totalDuration, fetchAvailableTimes]);

  const isValidTime = (hourVal: number, minuteVal: number): boolean => {
    const timeStr = `${hourVal.toString().padStart(2, "0")}:${minuteVal.toString().padStart(2, "0")}`;
    return availableTimes.includes(timeStr);
  };

  const isTimeBooked = (hourVal: number, minuteVal: number): boolean => {
    const timeStr = `${hourVal.toString().padStart(2, "0")}:${minuteVal.toString().padStart(2, "0")}`;
    return bookedTimes.some((booked) => booked.time === timeStr);
  };

  const getBookedTimeInfo = (
    hourVal: number,
    minuteVal: number,
  ): BookedTime | undefined => {
    const timeStr = `${hourVal.toString().padStart(2, "0")}:${minuteVal.toString().padStart(2, "0")}`;
    return bookedTimes.find((booked) => booked.time === timeStr);
  };

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

  const handleConfirmTime = () => {
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

    if (!isWithinShift(hourNum, minuteNum)) {
      setTimeError("این زمان خارج از شیفت‌های کاری است");
      return;
    }

    if (isTimeBooked(hourNum, minuteNum)) {
      const bookedInfo = getBookedTimeInfo(hourNum, minuteNum);
      setTimeError(
        `این زمان قبلاً رزرو شده است${bookedInfo?.clientName ? ` توسط ${bookedInfo.clientName}` : ""}`,
      );
      return;
    }

    if (!isValidTime(hourNum, minuteNum)) {
      setTimeError("این زمان در شیفت کاری موجود نیست");
      return;
    }

    const formattedTime = `${hourNum.toString().padStart(2, "0")}:${minuteNum.toString().padStart(2, "0")}`;
    setSelectedTime(formattedTime);
    setTimeError(null);
    setTimeout(() => setIsTimePickerOpen(false), 200);
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

  const getBookedTimesByShift = () => {
    const shifts = [...workShifts];
    shifts.forEach((shift) => {
      (shift as any).bookings = bookedTimes.filter((booked) => {
        const bookedMinutes =
          parseInt(booked.time.split(":")[0]) * 60 +
          parseInt(booked.time.split(":")[1]);
        const [startHour, startMinute] = shift.start.split(":").map(Number);
        const [endHour, endMinute] = shift.end.split(":").map(Number);
        const startMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;
        return bookedMinutes >= startMinutes && bookedMinutes < endMinutes;
      });
    });
    return shifts;
  };

  return (
    <AnimatePresence>
      {isTimePickerOpen && (
        <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-md"
            onClick={() => setIsTimePickerOpen(false)}
          />

          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className="relative w-full max-w-lg bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 rounded-t-3xl sm:rounded-3xl shadow-xl dark:shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="relative bg-gradient-to-r from-emerald-600 to-teal-600 p-6 flex-shrink-0">
              <button
                onClick={() => setIsTimePickerOpen(false)}
                className="absolute top-4 left-4 p-2 hover:bg-white/20 rounded-full transition-colors z-10"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>

              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white">انتخاب زمان</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-3.5 h-3.5 text-white/70" />
                    <p className="text-sm text-white/80">
                      {selectedDate.year}/{selectedDate.month + 1}/
                      {selectedDate.day}
                    </p>
                    {isToday && currentTime && (
                      <span className="text-xs px-2 py-0.5 bg-white/20 rounded-full text-white">
                        الان {currentTime}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 pt-4 pb-3 flex-shrink-0">
              <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-5 border border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <ClockIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <label className="text-sm font-medium text-slate-700 dark:text-gray-300">
                    ورود زمان دقیق
                  </label>
                </div>

                <div className="flex items-center flex-row-reverse justify-center gap-3 mb-4">
                  <div className="flex-1">
                    <input
                      ref={hourInputRef}
                      type="text"
                      value={hour}
                      onChange={handleHourChange}
                      onKeyPress={(e) => handleKeyPress(e, "hour")}
                      placeholder="ساعت"
                      className="w-full text-center px-4 py-4 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/20 rounded-xl text-slate-800 dark:text-white text-2xl font-bold placeholder:text-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                      dir="ltr"
                      maxLength={2}
                    />
                  </div>

                  <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">:</div>

                  <div className="flex-1">
                    <input
                      ref={minuteInputRef}
                      type="text"
                      value={minute}
                      onChange={handleMinuteChange}
                      onKeyPress={(e) => handleKeyPress(e, "minute")}
                      placeholder="دقیقه"
                      className="w-full text-center px-4 py-4 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/20 rounded-xl text-slate-800 dark:text-white text-2xl font-bold placeholder:text-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                      dir="ltr"
                      maxLength={2}
                    />
                  </div>
                </div>

                {hour && minute && !timeError && (
                  <div className="text-center mb-4 p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg">
                    <span className="text-sm text-slate-600 dark:text-gray-300">
                      زمان انتخابی:{" "}
                    </span>
                    <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                      {hour.toString().padStart(2, "0")}:
                      {minute.toString().padStart(2, "0")}
                    </span>
                  </div>
                )}

                {timeError && (
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm p-3 bg-red-50 dark:bg-red-500/10 rounded-xl mb-4">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{timeError}</span>
                  </div>
                )}

                <button
                  onClick={handleConfirmTime}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 rounded-xl text-white font-medium transition-all active:scale-95"
                >
                  تایید زمان
                </button>
              </div>
            </div>

            <div className="px-6 pb-4 overflow-y-auto flex-1">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-600 dark:text-emerald-400" />
                  <p className="mt-3 text-slate-500 dark:text-gray-400 text-sm">
                    در حال بارگذاری...
                  </p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
                  <p className="text-center text-red-500 text-sm">{error}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {workShifts.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Briefcase className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-gray-300">
                          شیفت‌های کاری
                        </h4>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {workShifts.map((shift, idx) => (
                          <div
                            key={idx}
                            className="bg-slate-100 dark:bg-white/5 rounded-lg p-3 border border-slate-200 dark:border-white/10"
                          >
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">
                              {shift.name}
                            </p>
                            <p className="text-sm text-slate-700 dark:text-white font-medium">
                              {shift.start} تا {shift.end}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {bookedTimes.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3 mt-4">
                        <Users className="w-4 h-4 text-red-600 dark:text-red-400" />
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-gray-300">
                          زمان‌های رزرو شده ({bookedTimes.length})
                        </h4>
                      </div>

                      <div className="space-y-3">
                        {getBookedTimesByShift().map(
                          (shift: any, idx) =>
                            shift.bookings.length > 0 && (
                              <div
                                key={idx}
                                className="bg-red-50 dark:bg-red-500/5 rounded-xl p-3 border border-red-200 dark:border-red-500/20"
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                  <span className="text-xs font-medium text-red-600 dark:text-red-400">
                                    {shift.name}
                                  </span>
                                  <span className="text-xs text-slate-500 dark:text-gray-500">
                                    ({shift.bookings.length} نوبت)
                                  </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  {shift.bookings.map(
                                    (booking: BookedTime, bIdx: number) => (
                                      <div
                                        key={bIdx}
                                        className="bg-red-100 dark:bg-red-500/10 rounded-lg p-2 text-center group relative"
                                      >
                                        <p className="text-sm font-mono text-red-700 dark:text-red-400">
                                          {booking.time}
                                        </p>
                                        <p className="text-xs text-slate-600 dark:text-gray-400 truncate">
                                          {booking.clientName}
                                        </p>

                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                                          <div className="bg-white dark:bg-gray-800 rounded-lg p-2 text-xs whitespace-nowrap shadow-lg border border-slate-200 dark:border-white/10">
                                            <p className="text-red-600 dark:text-red-400 font-bold">
                                              {booking.clientName}
                                            </p>
                                            <p className="text-slate-600 dark:text-gray-300">
                                              {booking.startTime} - {booking.endTime}
                                            </p>
                                            {booking.services && (
                                              <p className="text-slate-500 dark:text-gray-400">
                                                {booking.services}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            ),
                        )}
                      </div>
                    </div>
                  )}
                  
                  {availableTimes.length === 0 && !loading && (
                    <div className="text-center py-8">
                      <Clock className="w-10 h-10 text-slate-400 dark:text-gray-600 mx-auto mb-2" />
                      <p className="text-slate-500 dark:text-gray-400 text-sm">
                        هیچ زمان خالی در شیفت‌های کاری موجود نیست
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 pb-6 pt-3 flex-shrink-0 border-t border-slate-200 dark:border-white/10">
              <button
                onClick={() => setIsTimePickerOpen(false)}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-white rounded-xl font-medium transition-all active:scale-95"
              >
                بستن
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TimePickerModal;