import React, { useEffect, useState, useMemo } from "react";
import { X, Clock, Sun, Sunset, Moon, Loader2, AlertCircle, Info } from "lucide-react";
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
  const [currentTime, setCurrentTime] = useState<string>("");
  const [isToday, setIsToday] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredBookedTime, setHoveredBookedTime] = useState<string | null>(null);

  const totalDuration = selectedServices.length === 0
    ? 30
    : selectedServices.reduce((sum, s) => sum + (s.duration_minutes || 30), 0);

  const fetchAvailableTimes = async () => {
    if (!selectedDate.day) return;

    setLoading(true);
    setError(null);

    try {
      const gregorianDate = jalaliToGregorian(
        selectedDate.year,
        selectedDate.month,
        selectedDate.day!
      );

      console.log("درخواست به API با تاریخ:", gregorianDate, "و مدت:", totalDuration);

      const res = await fetch(
        `/api/client/available-times?date=${gregorianDate}&duration=${totalDuration}&t=${Date.now()}`
      );

      if (!res.ok) throw new Error("خطا در پاسخ سرور");

      const data = await res.json();

      console.log("پاسخ API:", data);

      if (data.success) {
        setAvailableTimes(data.availableTimes || []);
        setBookedTimes(data.bookedTimes || []);
        setCurrentTime(data.currentTime || "");
        setIsToday(data.isToday || false);

        // اگر زمان انتخاب‌شده دیگر آزاد نیست، پاک کن
        if (selectedTime && !data.availableTimes?.includes(selectedTime)) {
          const bookedInfo = data.bookedTimes?.find((b: BookedTime) => b.time === selectedTime);
          if (bookedInfo) {
            setError(`ساعت ${selectedTime} قبلاً برای ${bookedInfo.clientName} از ساعت ${bookedInfo.startTime} تا ${bookedInfo.endTime} رزرو شده است.`);
          } else {
            setError("زمان قبلی شما دیگر آزاد نیست. لطفاً زمان جدیدی انتخاب کنید.");
          }
          setSelectedTime("");
        }
      } else {
        setAvailableTimes([]);
        setBookedTimes([]);
        setError("داده نامعتبر از سرور");
      }
    } catch (err) {
      console.error("خطا در دریافت زمان‌ها:", err);
      setAvailableTimes([]);
      setBookedTimes([]);
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  // چک کردن اینکه آیا یک تایم رزرو شده است
  const isTimeBooked = (time: string) => {
    return bookedTimes.some(booked => booked.time === time);
  };

  // گرفتن اطلاعات تایم رزرو شده
  const getBookedTimeInfo = (time: string): BookedTime | undefined => {
    return bookedTimes.find(booked => booked.time === time);
  };

  useEffect(() => {
    if (isTimePickerOpen && selectedDate.day) {
      fetchAvailableTimes();
    } else {
      setAvailableTimes([]);
      setBookedTimes([]);
      setError(null);
    }
  }, [isTimePickerOpen, selectedDate, totalDuration]);

  const handleTimeSelect = async (time: string) => {
    // اگر تایم رزرو شده است، پیام نشان دهید
    if (isTimeBooked(time)) {
      const bookedInfo = getBookedTimeInfo(time);
      if (bookedInfo) {
        setError(`ساعت ${time} قبلاً برای ${bookedInfo.clientName} از ساعت ${bookedInfo.startTime} تا ${bookedInfo.endTime} رزرو شده است.`);
      }
      return;
    }

    // چک مجدد برای جلوگیری از race condition
    await fetchAvailableTimes();

    // چک دوباره بعد از بروزرسانی
    if (availableTimes.includes(time)) {
      setSelectedTime(time);
      setTimeout(() => setIsTimePickerOpen(false), 200);
    } else {
      setError(`ساعت ${time} دیگر آزاد نیست.`);
    }
  };

  if (!isTimePickerOpen) return null;

  // گروه‌بندی بر اساس لیست
  const morning = availableTimes.filter(t => parseInt(t.split(":")[0]) < 12);
  const afternoon = availableTimes.filter(t => parseInt(t.split(":")[0]) >= 12 && parseInt(t.split(":")[0]) < 20);
  const night = availableTimes.filter(t => parseInt(t.split(":")[0]) >= 20);

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsTimePickerOpen(false)} />

      <div className="relative w-full max-w-md bg-[#1c212c] border-t border-white/10 sm:border rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">انتخاب زمان حضور</h3>
              {selectedDate.day && (
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-gray-400">
                    تاریخ: {selectedDate.year}/{selectedDate.month + 1}/{selectedDate.day}
                  </p>
                  {isToday && currentTime && (
                    <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                      الآن: {currentTime}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          <button onClick={() => setIsTimePickerOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
              <p className="mt-4 text-gray-400">در حال بارگذاری...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8 text-orange-400">
              <AlertCircle className="w-10 h-10 mb-3" />
              <p className="text-center px-4">{error}</p>
            </div>
          ) : availableTimes.length === 0 ? (
            <div className="text-center py-12">
              {selectedDate.day ? (
                <>
                  <p className="text-orange-400 text-lg mb-2">زمان آزادی موجود نیست</p>
                  <p className="text-gray-400 text-sm">
                    {bookedTimes.length > 0 
                      ? `تمام زمان‌ها برای این تاریخ رزرو شده‌اند (${bookedTimes.length} رزرو)`
                      : isToday
                      ? 'زمان‌های امروز گذشته‌اند یا پر هستند'
                      : 'لطفاً تاریخ دیگری انتخاب کنید'}
                  </p>
                </>
              ) : (
                <p className="text-orange-400">لطفاً ابتدا تاریخ را انتخاب کنید</p>
              )}
            </div>
          ) : (
            <>
              {/* اطلاعات تایم رزرو شده در حالت hover */}
              {hoveredBookedTime && (
                <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-orange-300">
                      <p className="font-medium">این زمان قبلاً رزرو شده است</p>
                      {getBookedTimeInfo(hoveredBookedTime) && (
                        <>
                          <p className="mt-1">
                            برای {getBookedTimeInfo(hoveredBookedTime)?.clientName}
                          </p>
                          <p>
                            ساعت {getBookedTimeInfo(hoveredBookedTime)?.startTime} تا{' '}
                            {getBookedTimeInfo(hoveredBookedTime)?.endTime}
                          </p>
                          {getBookedTimeInfo(hoveredBookedTime)?.services && (
                            <p className="mt-1 text-orange-200">
                              خدمات: {getBookedTimeInfo(hoveredBookedTime)?.services}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-8">
                {morning.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                      <Sun className="w-4 h-4 text-orange-400" />
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">صبح</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {morning.map(time => (
                        <TimeButton
                          key={time}
                          time={time}
                          isSelected={selectedTime === time}
                          isBooked={isTimeBooked(time)}
                          onClick={() => handleTimeSelect(time)}
                          onHoverStart={() => isTimeBooked(time) && setHoveredBookedTime(time)}
                          onHoverEnd={() => setHoveredBookedTime(null)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {afternoon.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                      <Sunset className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">عصر</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {afternoon.map(time => (
                        <TimeButton
                          key={time}
                          time={time}
                          isSelected={selectedTime === time}
                          isBooked={isTimeBooked(time)}
                          onClick={() => handleTimeSelect(time)}
                          onHoverStart={() => isTimeBooked(time) && setHoveredBookedTime(time)}
                          onHoverEnd={() => setHoveredBookedTime(null)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {night.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                      <Moon className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">شب</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {night.map(time => (
                        <TimeButton
                          key={time}
                          time={time}
                          isSelected={selectedTime === time}
                          isBooked={isTimeBooked(time)}
                          onClick={() => handleTimeSelect(time)}
                          onHoverStart={() => isTimeBooked(time) && setHoveredBookedTime(time)}
                          onHoverEnd={() => setHoveredBookedTime(null)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="p-4 bg-white/5 border-t border-white/5">
          <button
            onClick={() => setIsTimePickerOpen(false)}
            className="w-full py-4 bg-white/10 hover:bg-white/15 text-white rounded-2xl font-bold"
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
};

interface TimeButtonProps {
  time: string;
  isSelected: boolean;
  isBooked: boolean;
  onClick: () => void;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}

const TimeButton: React.FC<TimeButtonProps> = ({
  time,
  isSelected,
  isBooked,
  onClick,
  onHoverStart,
  onHoverEnd,
}) => {
  if (isBooked) {
    return (
      <div
        className="py-3 rounded-2xl text-sm font-medium bg-gray-800/30 text-gray-500 border border-gray-700/50 cursor-not-allowed relative group"
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
        title="این زمان قبلاً رزرو شده است"
      >
        {time}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-px bg-gray-500 rotate-[-45deg] opacity-60"></div>
        </div>
        {/* Tooltip for booked times */}
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block z-10">
          <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg border border-gray-700">
            <div className="flex items-center gap-1">
              <Info className="w-3 h-3" />
              <span>رزرو شده</span>
            </div>
          </div>
          <div className="w-2 h-2 bg-gray-900 border-r border-b border-gray-700 rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1"></div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      className={`
        py-3 rounded-2xl text-sm font-medium transition-all active:scale-90
        ${isSelected
          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
          : "bg-white/5 text-gray-300 border border-white/5 hover:border-emerald-500/30 hover:bg-white/10"
        }
      `}
    >
      {time}
    </button>
  );
};

export default TimePickerModal;