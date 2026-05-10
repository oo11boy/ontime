"use client";
import React, { useEffect, useState, useCallback } from "react";
import { X, Clock, Sun, Sunset, Moon, Loader2, AlertCircle, Info, Timer } from "lucide-react";
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

  // محاسبه مدت زمان کل بر اساس سرویس‌های انتخاب شده
  const totalDuration = selectedServices.length === 0
    ? 30
    : selectedServices.reduce((sum, s) => sum + (s.duration_minutes || 30), 0);

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
      const gregorianDate = jalaliToGregorian(selectedDate.year, selectedDate.month, selectedDate.day!);
      const url = `/api/client/available-times?date=${gregorianDate}&duration=${totalDuration}&t=${Date.now()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("خطا در پاسخ سرور");
      const data = await res.json();
      if (data.success) {
        setAvailableTimes(data.availableTimes || []);
        setBookedTimes(data.bookedTimes || []);
        setCurrentTime(data.currentTime || "");
        setIsToday(data.isToday || false);
        if (selectedTime && !data.availableTimes?.includes(selectedTime)) {
          setSelectedTime("");
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

  const handleTimeSelect = useCallback((time: string) => {
    if (isTimeBooked(time)) return;
    setSelectedTime(time);
    setTimeout(() => setIsTimePickerOpen(false), 200);
  }, [setSelectedTime, setIsTimePickerOpen]);

  const isTimeBooked = useCallback((time: string) => {
    return bookedTimes.some(booked => booked.time === time);
  }, [bookedTimes]);

  const getBookedTimeInfo = useCallback((time: string) => {
    return bookedTimes.find(booked => booked.time === time);
  }, [bookedTimes]);

  // دسته‌بندی زمان‌ها
  const morning = availableTimes.filter(t => parseInt(t.split(":")[0]) < 12);
  const afternoon = availableTimes.filter(t => parseInt(t.split(":")[0]) >= 12 && parseInt(t.split(":")[0]) < 18);
  const evening = availableTimes.filter(t => parseInt(t.split(":")[0]) >= 18 && parseInt(t.split(":")[0]) < 20);
  const night = availableTimes.filter(t => parseInt(t.split(":")[0]) >= 20);

  return (
    <AnimatePresence>
      {isTimePickerOpen && (
        <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop انیمیشنی */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsTimePickerOpen(false)}
          />

          {/* بدنه مودال انیمیشنی */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-[#1c212c] border-t border-white/10 sm:border rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl overflow-hidden"
          >
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
                        {selectedDate.year}/{selectedDate.month + 1}/{selectedDate.day}
                      </p>
                      {isToday && currentTime && (
                        <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">
                          اکنون: {currentTime}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setIsTimePickerOpen(false)} 
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* نمایش مدت زمان کل */}
            <div className="px-6 pt-4 pb-2">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-gray-300">مدت زمان نوبت:</span>
                </div>
                <span className="text-sm font-bold text-emerald-400">{formatDuration(totalDuration)}</span>
              </div>
            </div>

            <div className="p-6 max-h-[55vh] overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
                  <p className="mt-4 text-gray-400">در حال بارگذاری زمان‌های خالی...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-8 text-orange-400">
                  <AlertCircle className="w-10 h-10 mb-3" />
                  <p className="text-center px-4">{error}</p>
                </div>
              ) : availableTimes.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-orange-400 text-lg mb-2">زمان خالی موجود نیست</p>
                  <p className="text-gray-500 text-sm">لطفاً تاریخ دیگری را انتخاب کنید</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {morning.length > 0 && (
                    <TimeSection 
                      title="صبح" 
                      icon={<Sun className="w-4 h-4 text-orange-400" />} 
                      times={morning} 
                      selectedTime={selectedTime} 
                      onSelect={handleTimeSelect} 
                      isTimeBooked={isTimeBooked}
                      getBookedTimeInfo={getBookedTimeInfo}
                      hoveredTime={hoveredBookedTime}
                      setHoveredTime={setHoveredBookedTime}
                    />
                  )}
                  {afternoon.length > 0 && (
                    <TimeSection 
                      title="بعد از ظهر" 
                      icon={<Sun className="w-4 h-4 text-yellow-400" />} 
                      times={afternoon} 
                      selectedTime={selectedTime} 
                      onSelect={handleTimeSelect} 
                      isTimeBooked={isTimeBooked}
                      getBookedTimeInfo={getBookedTimeInfo}
                      hoveredTime={hoveredBookedTime}
                      setHoveredTime={setHoveredBookedTime}
                    />
                  )}
                  {evening.length > 0 && (
                    <TimeSection 
                      title="عصر" 
                      icon={<Sunset className="w-4 h-4 text-emerald-400" />} 
                      times={evening} 
                      selectedTime={selectedTime} 
                      onSelect={handleTimeSelect} 
                      isTimeBooked={isTimeBooked}
                      getBookedTimeInfo={getBookedTimeInfo}
                      hoveredTime={hoveredBookedTime}
                      setHoveredTime={setHoveredBookedTime}
                    />
                  )}
                  {night.length > 0 && (
                    <TimeSection 
                      title="شب" 
                      icon={<Moon className="w-4 h-4 text-blue-400" />} 
                      times={night} 
                      selectedTime={selectedTime} 
                      onSelect={handleTimeSelect} 
                      isTimeBooked={isTimeBooked}
                      getBookedTimeInfo={getBookedTimeInfo}
                      hoveredTime={hoveredBookedTime}
                      setHoveredTime={setHoveredBookedTime}
                    />
                  )}
                </div>
              )}
            </div>

            {/* راهنما */}
            <div className="px-6 pb-3 flex items-center justify-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span>زمان خالی</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                <span>رزرو شده</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></div>
                <span>انتخاب شده</span>
              </div>
            </div>

            <div className="p-4 bg-white/5 border-t border-white/5">
              <button 
                onClick={() => setIsTimePickerOpen(false)} 
                className="w-full py-3.5 bg-white/10 hover:bg-white/15 text-white rounded-2xl font-bold transition-all active:scale-95"
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

// کامپوننت کمکی برای هر بخش زمانی
const TimeSection = ({ 
  title, 
  icon, 
  times, 
  selectedTime, 
  onSelect, 
  isTimeBooked,
  getBookedTimeInfo,
  hoveredTime,
  setHoveredTime
}: any) => {
  if (times.length === 0) return null;
  
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1 pb-1 border-b border-white/5">
        {icon}
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {times.map((time: string) => (
          <TimeButton
            key={time}
            time={time}
            isSelected={selectedTime === time}
            isBooked={isTimeBooked(time)}
            bookedInfo={getBookedTimeInfo(time)}
            onClick={() => onSelect(time)}
            isHovered={hoveredTime === time}
            onHoverStart={() => isTimeBooked(time) && setHoveredTime(time)}
            onHoverEnd={() => setHoveredTime(null)}
          />
        ))}
      </div>
    </div>
  );
};

// کامپوننت دکمه زمان
const TimeButton: React.FC<any> = ({ 
  time, 
  isSelected, 
  isBooked, 
  bookedInfo,
  onClick, 
  isHovered,
  onHoverStart, 
  onHoverEnd 
}) => {
  if (isBooked) {
    return (
      <div 
        className="relative py-3 rounded-2xl text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/30 cursor-not-allowed group flex items-center justify-center"
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
      >
        {time}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-2xl">
          <div className="w-full h-px bg-red-500/50 -rotate-45"></div>
        </div>
        
        {/* Tooltip برای نمایش اطلاعات نوبت رزرو شده */}
        {isHovered && bookedInfo && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 rounded-lg shadow-lg text-xs text-white whitespace-nowrap z-50 pointer-events-none">
            <div className="font-bold">{bookedInfo.clientName}</div>
            <div>{bookedInfo.startTime} تا {bookedInfo.endTime}</div>
            {bookedInfo.services && <div className="text-gray-300 text-[10px]">{bookedInfo.services}</div>}
          </div>
        )}
      </div>
    );
  }
  
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`py-3 rounded-2xl text-sm font-medium transition-all ${
        isSelected 
          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-95" 
          : "bg-white/5 text-gray-300 border border-white/5 hover:bg-white/10 hover:scale-105"
      }`}
    >
      {time}
    </motion.button>
  );
};

export default TimePickerModal;