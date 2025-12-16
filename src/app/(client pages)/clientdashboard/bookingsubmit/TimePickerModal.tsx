// File Path: src\app\(client pages)\clientdashboard\bookingsubmit\TimePickerModal.tsx

"use client";
import React, { useState, useMemo, useEffect } from "react";
import moment from "moment-jalaali";
import Picker from "react-mobile-picker";
import { Clock, Check } from "lucide-react";

interface TimePickerModalProps {
  selectedDate: { year: number; month: number; day: number | null };
  selectedTime: string;
  setSelectedTime: React.Dispatch<React.SetStateAction<string>>;
  isTimePickerOpen: boolean;
  setIsTimePickerOpen: (isOpen: boolean) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];

export default function TimePickerModal({
  selectedDate,
  selectedTime,
  setSelectedTime,
  isTimePickerOpen,
  setIsTimePickerOpen,
}: TimePickerModalProps) {
  const now = useMemo(() => moment(), []);
  const selectedJalaliDate = useMemo(() => {
    const { year, month, day } = selectedDate;
    return day ? moment(`${year}/${month + 1}/${day}`, "jYYYY/jMM/jDD") : null;
  }, [selectedDate]);

  const isToday = selectedJalaliDate?.isSame(now, "day") ?? false;

  const getInitialTime = () => {
    const [h = "10", m = "00"] = selectedTime.split(":").map(s => s?.trim().padStart(2, "0"));
    if (!isToday) return { hour: h, minute: m };

    const selectedMoment = selectedJalaliDate!.clone().hour(+h).minute(+m || 0);
    if (selectedMoment.isBefore(now, "minute")) {
      // Logic to snap to the next 15-minute interval
      const next = now.clone().add(15 - (now.minute() % 15), "minutes");
      next.minute(Math.ceil(next.minute() / 15) * 15);
      if (next.minute() === 60) {
        next.minute(0).add(1, "hour");
      }
      return { hour: next.format("HH"), minute: next.format("mm") };
    }
    return { hour: h, minute: m };
  };

  const [valueGroups, setValueGroups] = useState<{ hour: string; minute: string }>(getInitialTime());

  // ریست مقدار در هر بار باز شدن
  useEffect(() => {
    if (isTimePickerOpen) {
      setValueGroups(getInitialTime());
    }
  }, [isTimePickerOpen, selectedTime, isToday]);

  // فیلتر زمان‌های گذشته
  const availableMinutes = useMemo(() => {
    if (!isToday) return MINUTES;
    return MINUTES.filter(m => {
      const time = selectedJalaliDate!.clone().hour(+valueGroups.hour).minute(+m);
      return !time.isBefore(now, "minute");
    });
  }, [valueGroups.hour, isToday, selectedJalaliDate, now]);

  const availableHours = useMemo(() => {
    if (!isToday) return HOURS;
    return HOURS.filter(h =>
      MINUTES.some(m => {
        const time = selectedJalaliDate!.clone().hour(+h).minute(+m);
        return !time.isBefore(now, "minute");
      })
    );
  }, [isToday, selectedJalaliDate, now]);

  const handleChange = (newValue: { hour: string; minute: string }) => {
    setValueGroups(newValue);
  };

  const confirm = () => {
    setSelectedTime(`${valueGroups.hour}:${valueGroups.minute}`);
    setIsTimePickerOpen(false);
  };

  // ----------------------------------------------------------------
  // 3. Conditional Return is placed AFTER all Hooks
  // ----------------------------------------------------------------
  if (!isTimePickerOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center px-4 pb-8 sm:pb-0">
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          onClick={() => setIsTimePickerOpen(false)}
        />

        <div className="relative w-full max-w-md rounded-3xl overflow-hidden bg-linear-to-br from-gray-950 via-slate-900 to-black shadow-2xl border border-white/10 ring-1 ring-white/5 backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-10 duration-500">

          {/* هدر لوکس */}
          <div className="relative px-6 pt-8 pb-6 text-center">
            <div className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-emerald-500/10 to-transparent pointer-events-none" />
            <div className="relative">
              <div className="inline-flex p-4 bg-emerald-500/15 rounded-2xl backdrop-blur-md border border-emerald-400/20 mb-4">
                <Clock className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">انتخاب زمان رزرو</h2>
             
            </div>
          </div>

          {/* Picker با افکت درخشان */}
          <div className="relative px-6 pb-10">
           
            <Picker
              value={valueGroups}
              onChange={handleChange}
              wheelMode="natural"
              itemHeight={56}
              height={240}
            >
                  <Picker.Column name="minute">
                {availableMinutes.map(m => (
                  <Picker.Item key={m} value={m}>
                    {({ selected }) => (
                      <div className={`text-5xl h-10 font-bold ${selected ? "text-emerald-400  drop-shadow-2xl" : "text-gray-500"}`}>
                        {m}
                      </div>
                    )}
                  </Picker.Item>
                ))}
              </Picker.Column>
            
        
                <Picker.Column name="hour">
                {availableHours.map(h => (
                  <Picker.Item key={h} value={h}>
                    {({ selected }) => (
                      <div className={`text-5xl h-10   font-bold ${selected ? "text-emerald-400  drop-shadow-2xl" : "text-gray-500"}`}>
                        {h}
                      </div>
                    )}
                  </Picker.Item>
                ))}
              </Picker.Column>
            </Picker>

            <div className="absolute inset-x-0 top-0 h-20 bg-linear-to-b from-gray-950 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-gray-950 to-transparent pointer-events-none" />
          </div>

          {/* دکمه‌ها */}
          <div className="flex gap-4 px-6 pb-8 pt-4">
            <button
              onClick={() => setIsTimePickerOpen(false)}
              className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-medium backdrop-blur-md transition"
            >
              انصراف
            </button>
            <button
              onClick={confirm}
              className="flex-1 py-4 rounded-2xl bg-linear-to-r from-emerald-500 to-emerald-600 text-white font-bold text-lg shadow-2xl shadow-emerald-600/50 hover:shadow-emerald-500/70 active:scale-95 transition flex items-center justify-center gap-2"
            >
              <Check className="w-6 h-6" />
              تأیید زمان
            </button>
          </div>
        </div>
      </div>

      
    </>
  );
}