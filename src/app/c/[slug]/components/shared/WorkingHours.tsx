// src/app/c/[slug]/components/shared/WorkingHours.tsx
"use client";

import { Clock, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Shift } from "./types";

// ترتیب روزهای هفته در ایران (شنبه = 0)
const DAYS_OF_WEEK = [
  { id: 0, name: "شنبه", persian: "شنبه" },
  { id: 1, name: "یکشنبه", persian: "یکشنبه" },
  { id: 2, name: "دوشنبه", persian: "دوشنبه" },
  { id: 3, name: "سه‌شنبه", persian: "سه‌شنبه" },
  { id: 4, name: "چهارشنبه", persian: "چهارشنبه" },
  { id: 5, name: "پنجشنبه", persian: "پنجشنبه" },
  { id: 6, name: "جمعه", persian: "جمعه" },
];

// تابع تبدیل روز جاوااسکریپت به روز شمسی (ایرانی)
// JS: 0=یکشنبه, 1=دوشنبه, 2=سه‌شنبه, 3=چهارشنبه, 4=پنجشنبه, 5=جمعه, 6=شنبه
// تبدیل به: 0=شنبه, 1=یکشنبه, 2=دوشنبه, 3=سه‌شنبه, 4=چهارشنبه, 5=پنجشنبه, 6=جمعه
const getPersianDayId = (jsDay: number): number => {
  if (jsDay === 6) return 0; // شنبه
  return jsDay + 1; // یکشنبه(0->1), دوشنبه(1->2), سه‌شنبه(2->3), چهارشنبه(3->4), پنجشنبه(4->5), جمعه(5->6)
};

// تابع بررسی امروز در ایران
const getTodayInIran = (): number => {
  const jsDay = new Date().getDay();
  return getPersianDayId(jsDay);
};

interface WorkingHoursProps {
  offDays: number[]; // روزهای تعطیل از دیتابیس (0=شنبه, 1=یکشنبه, 2=دوشنبه, ...)
  workShifts?: Shift[];
}

export function WorkingHours({ offDays = [], workShifts = [] }: WorkingHoursProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const todayInIran = getTodayInIran();
  const isTodayOff = offDays.includes(todayInIran);
  const todayName = DAYS_OF_WEEK.find(d => d.id === todayInIran)?.persian;

  // تابع برای دریافت متن ساعت کاری
  const getWorkingHoursText = () => {
    if (!workShifts || workShifts.length === 0) {
      return "۰۸:۰۰ - ۲۲:۰۰";
    }
    if (workShifts.length === 1) {
      return `${workShifts[0].start} - ${workShifts[0].end}`;
    }
    return `${workShifts.length} شیفت`;
  };

  // تابع برای بررسی وضعیت یک روز
  const getDayStatus = (dayId: number) => {
    const isOff = offDays.includes(dayId);
    const isToday = dayId === todayInIran;
    
    if (isOff) {
      return { isOff: true, isToday, text: "تعطیل", icon: "x" };
    }
    
    let text = getWorkingHoursText();
    if (!workShifts || workShifts.length === 0) {
      text = "۰۸:۰۰ - ۲۲:۰۰";
    } else if (workShifts.length === 1) {
      text = `${workShifts[0].start} - ${workShifts[0].end}`;
    } else {
      text = "چند شیفت";
    }
    
    return { isOff: false, isToday, text, icon: "check" };
  };

  return (
    <div className="mb-6">
      <div 
        className="flex items-center justify-between cursor-pointer mb-3"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="font-bold text-white flex items-center gap-2">
          <Clock size={18} className="text-emerald-400" /> ساعت کاری
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{getWorkingHoursText()}</span>
          {isExpanded ? (
            <ChevronUp size={16} className="text-gray-400" />
          ) : (
            <ChevronDown size={16} className="text-gray-400" />
          )}
        </div>
      </div>



      {/* لیست تمام روزهای هفته */}
      <div className="bg-gradient-to-br from-white/5 to-white/0 rounded-xl overflow-hidden border border-white/10">
        <div className="divide-y divide-white/10">
          {DAYS_OF_WEEK.map((day) => {
            const status = getDayStatus(day.id);
            return (
              <div
                key={day.id}
                className={`flex justify-between p-3 `}
              >
                <span
                  className={`text-sm  text-gray-300`}
                >
                  {day.persian}
             
                </span>
                <span
                  className={`text-sm flex items-center gap-1 ${
                    status.isOff ? "text-red-400" : "text-emerald-400"
                  }`}
                >
                  {status.isOff ? (
                    <XCircle size={14} />
                  ) : (
                    <CheckCircle size={14} />
                  )}
                  {status.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* نمایش جزئیات شیفت‌ها در حالت باز شده */}
      {isExpanded && (
        <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/10">
          {workShifts && workShifts.length > 0 && (
            <>
              <p className="text-xs text-gray-400 mb-2">جزئیات ساعت کاری:</p>
              {workShifts.map((shift, index) => (
                <div key={index} className="flex items-center gap-2 text-sm mb-1">
                  <Clock size={12} className="text-emerald-400" />
                  <span className="text-gray-300">
                    شیفت {index + 1}: {shift.start} تا {shift.end}
                  </span>
                </div>
              ))}
            </>
          )}
          
          {offDays && offDays.length > 0 && (
            <div className={`${workShifts && workShifts.length > 0 ? 'mt-2 pt-2 border-t border-white/10' : ''}`}>
              <p className="text-xs text-red-400">
                روزهای تعطیل هفتگی:{" "}
                {offDays
                  .map(d => DAYS_OF_WEEK.find(day => day.id === d)?.persian)
                  .filter(Boolean)
                  .join("، ")}
              </p>
            </div>
          )}

          {(!workShifts || workShifts.length === 0) && offDays.length === 0 && (
            <p className="text-xs text-gray-400">
              ساعت کاری پیش‌فرض: شنبه تا پنجشنبه ۰۸:۰۰ تا ۲۲:۰۰
            </p>
          )}
        </div>
      )}
    </div>
  );
}