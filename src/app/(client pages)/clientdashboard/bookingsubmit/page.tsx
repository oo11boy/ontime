// NewAppointmentPage.jsx (نسخه به‌روز شده)
"use client";
import React, { useState, useMemo } from "react";
import moment from "moment-jalaali";
import {
  User,
  Phone,
  Calendar,
  Clock,
  Scissors,
  MessageSquare,
  Bell,
  Check,
  ChevronLeft,
  Contact,
  X,
} from "lucide-react";

import Footer from "../components/Footer/Footer"; 
import JalaliCalendarModal from "./JalaliCalendarModal";
import TimePickerModal from "./TimePickerModal";

// 🚀 تابع واقعی برای دریافت تاریخ شمسی امروز
const getTodayJalaliDate = () => {
  const today = moment();
  return {
    year: today.jYear(),
    month: today.jMonth(), 
    day: today.jDate(),
  };
};

// تابع فرمت تاریخ به صورت ۱۴۰۴/۰۹/۱۸
const formatJalaliDate = (year: number, month: number, day: number | null): string => {
  if (!day) return "انتخاب تاریخ";
  return moment(`${year}/${month + 1}/${day}`, 'jYYYY/jMM/jDD').format('jYYYY/jMM/jDD');
};

export default function NewAppointmentPage() {
  const todayJalali = useMemo(() => getTodayJalaliDate(), []);
  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedDate, setSelectedDate] = useState<{
    year: number;
    month: number;
    day: number | null;
  }>({ 
    year: todayJalali.year, 
    month: todayJalali.month, 
    day: todayJalali.day 
  }); 
  
  // 💡 حالت زمان (با ساعت و دقیقه پیش فرض)
  const [selectedTime, setSelectedTime] = useState("10:00"); 
  
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [sendReservationSms, setSendReservationSms] = useState(true);
  const [sendReminderSms, setSendReminderSms] = useState(true);
  
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  // 💡 حالت جدید برای Time Picker
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false); 

  const services = [
    "کوتاهی مو", "اصلاح ریش", "رنگ مو", "هایلایت", 
    "مانیکور", "پدیکور", "کراتینه", "لیزر",
  ];

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };
  
  return (
    <div className="h-screen text-white overflow-auto max-w-md mx-auto">
      <div className="min-h-screen bg-linear-to-br from-[#1a1e26] to-[#242933] text-white pb-32">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-center mb-8 flex items-center justify-center gap-3">
            <Calendar className="w-7 h-7 text-emerald-400" />
            ثبت نوبت جدید
          </h1>

          <div className="space-y-5">
            {/* ... (نام، موبایل، خدمات) ... */}
            <div className="flex items-end gap-4">
              <div className="flex-1 space-y-4">
                {/* نام مشتری */}
                <div>
                  <label className="text-sm text-gray-300 mb-2 block px-1">نام مشتری</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="نام و نام خانوادگی"
                      className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3.5 text-right placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 transition backdrop-blur-sm"
                    />
                    <User className="absolute left-4 top-4 w-5 h-5 text-emerald-400" />
                  </div>
                </div>

                {/* موبایل */}
                <div>
                  <label className="text-sm text-gray-300 mb-2 block px-1">موبایل مشتری</label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="۰۹۱۲ ۳۴۵ ۶۷۸۹"
                      dir="ltr"
                      className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3.5 text-left placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 transition backdrop-blur-sm font-mono"
                    />
                    <Phone className="absolute right-4 top-4 w-5 h-5 text-emerald-400" />
                  </div>
                </div>
              </div>

              {/* دکمه انتخاب از مخاطبین */}
              <button className="w-[120px] h-[120px] bg-white/10 backdrop-blur-sm rounded-2xl border border-emerald-500/30 flex flex-col items-center justify-center gap-3 hover:bg-white/15 transition-all hover:border-emerald-400">
                <Contact className="w-10 h-10 text-emerald-400" />
                <span className="text-xs text-center leading-tight">انتخاب از <br /> مخاطبین</span>
              </button>
            </div>

            <div className="h-px bg-white/10 rounded-full"></div>

            {/* تاریخ و ساعت */}
            <div className="grid grid-cols-2 gap-4">
              {/* دکمه تاریخ */}
              <div>
                <label className="text-sm text-gray-300 mb-2 block">تاریخ</label>
                <button
                  onClick={() => setIsCalendarOpen(true)}
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3.5 flex items-center justify-between hover:border-emerald-500/50 transition backdrop-blur-sm"
                >
                  <span className={selectedDate.day ? "text-white" : "text-gray-400"}>
                    {formatJalaliDate(selectedDate.year, selectedDate.month, selectedDate.day)}
                  </span>
                  <Calendar className="w-5 h-5 text-emerald-400" />
                </button>
              </div>

              {/* دکمه ساعت */}
              <div>
                <label className="text-sm text-gray-300 mb-2 block">ساعت</label>
                <button 
                  // 💡 باز کردن Time Picker
                  onClick={() => setIsTimePickerOpen(true)}
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3.5 flex items-center justify-between hover:border-emerald-500/50 transition backdrop-blur-sm"
                >
                  <span className="text-white">{selectedTime}</span>
                  <Clock className="w-5 h-5 text-emerald-400" />
                </button>
              </div>
            </div>

            {/* خدمات */}
            <div>
              <label className="text-sm text-gray-300 mb-3 block">خدمات</label>
              <div className="bg-white/10 border border-white/10 rounded-xl p-4 min-h-[60px] flex flex-wrap gap-3 items-center backdrop-blur-sm">
                {selectedServices.length === 0 ? (
                  <span className="text-gray-500 text-sm mr-2">هیچ خدمتی انتخاب نشده</span>
                ) : (
                  selectedServices.map((s) => (
                    <span
                      key={s}
                      className="bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                    >
                      {s}
                      <button
                        onClick={() => toggleService(s)}
                        className="hover:bg-white/20 rounded-full p-1 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))
                )}
                <button className="ml-auto text-emerald-400 flex items-center gap-2 text-sm font-medium">
                  <Scissors className="w-5 h-5" />
                  افزودن خدمت
                </button>
              </div>
            </div>

            {/* توضیحات */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm text-gray-300">توضیحات (اختیاری)</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked readOnly /> 
                  <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="هر نکته‌ای که لازم است پرسنل بدونند..."
                className="w-full bg-white/10 border border-white/10 rounded-xl p-4 text-sm placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 resize-none h-28 backdrop-blur-sm"
              />
            </div>

            {/* پیامک رزرو */}
            <div className="bg-white/5 rounded-xl p-5 border border-emerald-500/20">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-emerald-400" />
                  <span className="font-medium">ارسال پیامک تأیید رزرو به مشتری</span>
                </div>
                <input
                  type="checkbox"
                  checked={sendReservationSms}
                  onChange={(e) => setSendReservationSms(e.target.checked)}
                  className="w-6 h-6 text-emerald-500 rounded focus:ring-emerald-500"
                />
              </label>
            </div>

            {/* پیامک یادآوری */}
            <div className="bg-white/5 rounded-xl p-5 border border-emerald-500/20">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-emerald-400" />
                  <span className="font-medium">ارسال پیامک یادآوری ۱ ساعت قبل از نوبت</span>
                </div>
                <input
                  type="checkbox"
                  checked={sendReminderSms}
                  onChange={(e) => setSendReminderSms(e.target.checked)}
                  className="w-6 h-6 text-emerald-500 rounded focus:ring-emerald-500"
                />
              </label>
            </div>

            {/* دکمه ثبت */}
            <button className="w-full py-4 bg-linear-to-r from-emerald-500 to-emerald-600 rounded-xl font-bold text-lg shadow-lg hover:from-emerald-600 hover:to-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-3">
              <Check className="w-6 h-6" />
              ثبت نوبت
            </button>

            {/* دکمه پشتیبانی */}
            <button className="w-full bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-4 hover:bg-white/15 transition-all border border-white/10">
              <div className="relative">
                <div className="w-16 h-16 bg-gray-300 rounded-full overflow-hidden">
                  <img src="/image/CSJHVbZh.jpg" alt="پشتیبانی" className="w-full h-full object-cover" />
                </div>
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-4 border-[#242933]"></div>
              </div>
              <div className="flex-1 text-right">
                <h3 className="font-bold">پشتیبانی آنلاین</h3>
                <p className="text-sm text-gray-400">کمک و راهنمایی نیاز داری؟</p>
              </div>
              <ChevronLeft className="w-6 h-6 text-gray-400" />
            </button>
          </div>
        </div>

        <Footer />
      </div>

      <JalaliCalendarModal
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        isCalendarOpen={isCalendarOpen}
        setIsCalendarOpen={setIsCalendarOpen}
      />
      
      {/* 💡 استفاده از Time Picker جدید */}
      <TimePickerModal
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        setSelectedTime={setSelectedTime}
        isTimePickerOpen={isTimePickerOpen}
        setIsTimePickerOpen={setIsTimePickerOpen}
      />
      
    </div>
  );
}