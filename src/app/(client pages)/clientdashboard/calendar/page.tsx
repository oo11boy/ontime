"use client";
import React, { useState } from "react";
import {
  ChevronDown,
 Plus,
 Calendar,
 User,
 Clock,
 Scissors,
 Phone,
} from "lucide-react";
import Footer from "../components/Footer/Footer";

// داده‌های روزهای تقویم
const calendarDays = [
  { day: "یکشنبه", date: 16, month: "آذر", isHoliday: false },
  { day: "دوشنبه", date: 17, month: "آذر", isHoliday: false },
  { day: "سه‌شنبه", date: 18, month: "آذر", isHoliday: false },
  { day: "چهارشنبه", date: 19, month: "آذر", isHoliday: false },
  { day: "پنجشنبه", date: 20, month: "آذر", isHoliday: false },
  { day: "جمعه", date: 21, month: "آذر", isHoliday: true },
  { day: "شنبه", date: 22, month: "آذر", isHoliday: false },
  { day: "یکشنبه", date: 23, month: "آذر", isHoliday: false },
  { day: "دوشنبه", date: 24, month: "آذر", isHoliday: false },
  { day: "سه‌شنبه", date: 25, month: "آذر", isHoliday: false },
  { day: "چهارشنبه", date: 26, month: "آذر", isHoliday: false },
  { day: "پنجشنبه", date: 27, month: "آذر", isHoliday: false },
  { day: "جمعه", date: 28, month: "آذر", isHoliday: true },
  { day: "شنبه", date: 29, month: "آذر", isHoliday: false },
  { day: "یکشنبه", date: 30, month: "آذر", isHoliday: false },
  { day: "دوشنبه", date: 1, month: "دی", isHoliday: false },
];

// داده‌های نمونه نوبت‌ها
const appointments = [
  {
    id: "1",
    dayIndex: 0,
    time: "۱۰:۰۰ - ۱۰:۳۰",
    customer: "رضا احمدی",
    service: "کوتاهی مو",
    staff: "علی محمدی",
    phone: "۰۹۳۵ ۴۵۰ ۲۳۶۹",
    status: "تایید شده",
  },
  {
    id: "2",
    dayIndex: 0,
    time: "۱۱:۰۰ - ۱۱:۴۵",
    customer: "سارا رضایی",
    service: "رنگ مو",
    staff: "مریم شریفی",
    phone: "۰۹۳۶ ۷۸۹ ۰۱۲۳",
    status: "در انتظار",
  },
  {
    id: "3",
    dayIndex: 1,
    time: "۰۹:۳۰ - ۱۰:۱۵",
    customer: "محمد حسینی",
    service: "اصلاح ریش",
    staff: "حسین نوری",
    phone: "۰۹۱۱ ۲۳۴ ۵۶۷۸",
    status: "تایید شده",
  },
  {
    id: "4",
    dayIndex: 3,
    time: "۱۴:۰۰ - ۱۴:۳۰",
    customer: "فاطمه کاظمی",
    service: "مانیکور",
    staff: "سارا رضایی",
    phone: "۰۹۳۷ ۸۹۰ ۱۲۳۴",
    status: "تایید شده",
  },
  // چند نوبت اضافه برای تست اسکرول افقی
  {
    id: "5",
    dayIndex: 0,
    time: "۱۲:۰۰ - ۱۲:۳۰",
    customer: "حسین رضایی",
    service: "کوتاهی + اصلاح",
    staff: "علی محمدی",
    phone: "۰۹۱۲ ۳۴۵ ۶۷۸۹",
    status: "تایید شده",
  },
  {
    id: "6",
    dayIndex: 0,
    time: "۱۳:۰۰ - ۱۳:۴۵",
    customer: "مینا کریمی",
    service: "هایلایت",
    staff: "مریم شریفی",
    phone: "۰۹۳۸ ۸۸۸ ۸۸۸۸",
    status: "در انتظار",
  },
];

export default function CalendarPage() {
  const [selectedService, setSelectedService] = useState("همه خدمات");
  const [selectedStaff, setSelectedStaff] = useState("همه پرسنل");
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  return (
    <div className="min-h-screen bg-linear-to-br from-[#1a1e26] to-[#242933] text-white pb-32">
      {/* فیلترها */}
      <div className="sticky top-0 z-50 bg-[#1a1e26]/90 backdrop-blur-xl border-b border-emerald-500/30">
        <div className="max-w-2xl mx-auto p-4">
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-between bg-[#242933]/80 rounded-xl px-4 py-3.5 border border-emerald-500/40 hover:border-emerald-400 transition-all">
              <span className="text-sm font-medium">{selectedService}</span>
              <ChevronDown className="w-5 h-5 text-emerald-400" />
            </button>
            <button className="flex items-center justify-between bg-[#242933]/80 rounded-xl px-4 py-3.5 border border-emerald-500/40 hover:border-emerald-400 transition-all">
              <span className="text-sm font-medium">{selectedStaff}</span>
              <ChevronDown className="w-5 h-5 text-emerald-400" />
            </button>
          </div>
        </div>
      </div>

      {/* تقویم */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {calendarDays.map((day, index) => {
          const dayAppointments = appointments.filter(
            (app) => app.dayIndex === index
          );

          return (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-sm rounded-2xl border border-emerald-500/20 p-5 hover:border-emerald-400/60 hover:bg-white/8 transition-all duration-300"
            >
              {/* سربرگ روز */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-linear-to-br from-emerald-500 to-emerald-600 flex flex-col items-center justify-center text-white font-bold shadow-xl">
                    <span className="text-2xl">{day.date}</span>
                    <span className="text-xs opacity-90">{day.month}</span>
                  </div>
                  <div className="text-right">
                    <h3 className="text-lg font-bold">{day.day}</h3>
                    {day.isHoliday && (
                      <p className="text-xs text-red-400 mt-1">تعطیل رسمی</p>
                    )}
                  </div>
                </div>

                <button
                  disabled={day.isHoliday}
                  className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg ${
                    day.isHoliday
                      ? "bg-gray-700/50 text-gray-500 cursor-not-allowed"
                      : "bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 active:scale-95 shadow-emerald-500/30"
                  }`}
                >
                  <Plus className="w-5 h-5" />
                  ثبت نوبت
                </button>
              </div>

              {/* نوبت‌های روز - اسکرول افقی */}
              <div className="mt-2">
                {day.isHoliday ? (
                  <p className="text-center text-gray-400 text-sm">
                    به دلیل تعطیلی، امکان رزرو وجود ندارد
                  </p>
                ) : dayAppointments.length > 0 ? (
                  <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-emerald-500/30 scrollbar-track-white/5">
                    <div className="flex gap-3 min-w-max">
                      {dayAppointments.map((app) => (
                        <div
                          key={app.id}
                          onClick={() => setSelectedAppointment(app)}
                          className="bg-white/10 flex items-center justify-center gap-2 hover:bg-white/20 rounded-xl px-4 py-2 min-w-[200px] cursor-pointer transition-all duration-300 border border-white/10 hover:border-emerald-500/40"
                        >
                          <div className="flex items-center  text-emerald-400  gap-2">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-semibold">
                              {app.time}
                            </span>
                          </div>
                          <p className="text-white font-medium text-sm">
                            {app.customer}
                          </p>
                      
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-gray-400 text-sm py-6">
                    هنوز نوبتی ثبت نشده است
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* مودال جزئیات نوبت */}
      {selectedAppointment && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setSelectedAppointment(null)}
        >
          <div
            className="bg-[#242933] rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-emerald-500/30"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <Calendar className="w-6 h-6 text-emerald-400" />
              جزئیات نوبت
            </h3>

            <div className="space-y-4 text-right">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-gray-400 text-sm">مشتری</span>
                <span className="text-white font-medium">
                  {selectedAppointment.customer}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-gray-400 text-sm">ساعت</span>
                <span className="text-white font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  {selectedAppointment.time}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-gray-400 text-sm">خدمت</span>
                <span className="text-white font-medium">
                  {selectedAppointment.service}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-gray-400 text-sm">پرسنل</span>
                <span className="text-white font-medium">
                  {selectedAppointment.staff}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-gray-400 text-sm">تماس</span>
                <span className="text-white font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  {selectedAppointment.phone}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">وضعیت</span>
                <span
                  className={`font-bold ${
                    selectedAppointment.status === "تایید شده"
                      ? "text-emerald-400"
                      : "text-yellow-400"
                  }`}
                >
                  {selectedAppointment.status}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedAppointment(null)}
              className="mt-7 w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold transition"
            >
              بستن
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}