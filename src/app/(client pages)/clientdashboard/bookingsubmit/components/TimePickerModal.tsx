"use client";
import React, { useEffect, useState } from "react";
import { X, Clock, Sun, Sunset, Moon, Loader2, AlertCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // اضافه شده
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
      const gregorianDate = jalaliToGregorian(selectedDate.year, selectedDate.month, selectedDate.day!);
      const res = await fetch(`/api/client/available-times?date=${gregorianDate}&duration=${totalDuration}&t=${Date.now()}`);
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
        setError("داده نامعتبر از سرور");
      }
    } catch (err) {
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  const isTimeBooked = (time: string) => bookedTimes.some(booked => booked.time === time);
  const getBookedTimeInfo = (time: string) => bookedTimes.find(booked => booked.time === time);

  useEffect(() => {
    if (isTimePickerOpen && selectedDate.day) {
      fetchAvailableTimes();
    }
  }, [isTimePickerOpen, selectedDate, totalDuration]);

  const handleTimeSelect = async (time: string) => {
    if (isTimeBooked(time)) return;
    setSelectedTime(time);
    setTimeout(() => setIsTimePickerOpen(false), 200);
  };

  const morning = availableTimes.filter(t => parseInt(t.split(":")[0]) < 12);
  const afternoon = availableTimes.filter(t => parseInt(t.split(":")[0]) >= 12 && parseInt(t.split(":")[0]) < 20);
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
                        تاریخ: {selectedDate.year}/{selectedDate.month + 1}/{selectedDate.day}
                      </p>
                      {isToday && currentTime && (
                        <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">الآن: {currentTime}</span>
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
                  <p className="text-orange-400 text-lg mb-2">زمان آزادی موجود نیست</p>
                </div>
              ) : (
                <div className="space-y-8">
                  <TimeSection title="صبح" icon={<Sun className="w-4 h-4 text-orange-400" />} times={morning} selectedTime={selectedTime} onSelect={handleTimeSelect} isTimeBooked={isTimeBooked} setHovered={setHoveredBookedTime} />
                  <TimeSection title="عصر" icon={<Sunset className="w-4 h-4 text-emerald-400" />} times={afternoon} selectedTime={selectedTime} onSelect={handleTimeSelect} isTimeBooked={isTimeBooked} setHovered={setHoveredBookedTime} />
                  <TimeSection title="شب" icon={<Moon className="w-4 h-4 text-blue-400" />} times={night} selectedTime={selectedTime} onSelect={handleTimeSelect} isTimeBooked={isTimeBooked} setHovered={setHoveredBookedTime} />
                </div>
              )}
            </div>

            <div className="p-4 bg-white/5 border-t border-white/5">
              <button onClick={() => setIsTimePickerOpen(false)} className="w-full py-4 bg-white/10 hover:bg-white/15 text-white rounded-2xl font-bold transition-all active:scale-95">
                انصراف
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// کامپوننت کمکی برای تمیزی کد (بدون تغییر دیزاین)
const TimeSection = ({ title, icon, times, selectedTime, onSelect, isTimeBooked, setHovered }: any) => {
  if (times.length === 0) return null;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        {icon}
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {times.map((time: string) => (
          <TimeButton
            key={time}
            time={time}
            isSelected={selectedTime === time}
            isBooked={isTimeBooked(time)}
            onClick={() => onSelect(time)}
            onHoverStart={() => isTimeBooked(time) && setHovered(time)}
            onHoverEnd={() => setHovered(null)}
          />
        ))}
      </div>
    </div>
  );
};

const TimeButton: React.FC<any> = ({ time, isSelected, isBooked, onClick, onHoverStart, onHoverEnd }) => {
  if (isBooked) {
    return (
      <div className="py-3 rounded-2xl text-sm font-medium bg-gray-800/30 text-gray-500 border border-gray-700/50 cursor-not-allowed relative group flex items-center justify-center">
        {time}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-2xl">
          <div className="w-full h-px bg-gray-500 -rotate-45 opacity-60"></div>
        </div>
      </div>
    );
  }
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`py-3 rounded-2xl text-sm font-medium transition-all ${
        isSelected ? "bg-emerald-500 text-white shadow-lg" : "bg-white/5 text-gray-300 border border-white/5 hover:bg-white/10"
      }`}
    >
      {time}
    </motion.button>
  );
};

export default TimePickerModal;