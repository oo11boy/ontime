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
  Plus,
  MessageCircle,
  PhoneCall,
} from "lucide-react";

import Footer from "../components/Footer/Footer";
import JalaliCalendarModal from "./JalaliCalendarModal";
import TimePickerModal from "./TimePickerModal";

// تابع تاریخ امروز شمسی
const getTodayJalaliDate = () => {
  const today = moment();
  return {
    year: today.jYear(),
    month: today.jMonth(),
    day: today.jDate(),
  };
};

const formatJalaliDate = (year: number, month: number, day: number | null): string => {
  if (!day) return "انتخاب تاریخ";
  return moment(`${year}/${month + 1}/${day}`, "jYYYY/jMM/jDD").format("jYYYY/jMM/jDD");
};

// پیام‌های آماده رزرو و یادآوری
const reservationTemplates = [
  {
    title: "رسمی و حرفه‌ای",
    text: "سلام {name} عزیز\nنوبت شما با موفقیت ثبت شد!\nتاریخ: {date}\nساعت: {time}\nخدمات: {services}\n\nممنون از اعتمادتون",
    length: 3,
  },
  {
    title: "دوستانه و گرم",
    text: "سلام {name} جان\nنوبتت ثبت شد عزیزم!\n{date} ساعت {time} منتظرتیم\nخدمات: {services}\n\nبه موقع بیا که دلمون برات تنگ میشه",
    length: 3,
  },
  {
    title: "کوتاه و مفید",
    text: "نوبت شما ثبت شد!\n{date} - {time}\nخدمات: {services}\n\nمنتظر حضورتون هستیم",
    length: 2,
  },
  {
    title: "خوش‌آمدگویی گرم",
    text: "خوش اومدی {name} عزیز\nنوبتت ثبت شد:\n{date} ساعت {time}\nخدمات: {services}\n\nمنتظرت هستیم",
    length: 2,
  },
];

const reminderTemplates = [
  {
    title: "یادآوری مودبانه",
    text: "سلام {name} عزیز\nیادآوری نوبت:\nامروز ساعت {time} منتظر شما هستیم\nلطفاً سر وقت تشریف بیاورید",
    length: 2,
  },
  {
    title: "یادآوری دوستانه",
    text: "سلام {name} جان\nامروز ساعت {time} نوبتته!\nاگه نمی‌تونی بیای حتما خبر بده\nدلمون برات تنگ شده",
    length: 2,
  },
  {
    title: "یادآوری عاشقانه",
    text: "عزیزم {name}\nامروز ساعت {time} می‌بینمت\nدلم برات تنگ شده بود\nمنتظرم",
    length: 2,
  },
  {
    title: "یادآوری با طنز",
    text: "سلام {name}!\nساعت {time} نوبتته\nاگه نیای آرایشگرمون دلش می‌گیره\nبیا که منتظرتیم",
    length: 2,
  },
];

// مودال پیام‌های آماده
const MessageTemplateModal = ({
  isOpen,
  onClose,
  templates,
  onSelect,
  title,
}: {
  isOpen: boolean;
  onClose: () => void;
  templates: Array<{ title: string; text: string; length: number }>;
  onSelect: (text: string) => void;
  title: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md animate-in slide-in-from-bottom-4 duration-300">
        <div className="bg-linear-to-b from-[#1a1e26] to-[#242933] backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <button
              onClick={onClose}
              className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="px-6 pb-10 max-h-96 overflow-y-auto custom-scrollbar">
            <p className="text-xs text-gray-500 text-center mb-6 py-2">
              — یا یکی از پیام‌های آماده را انتخاب کنید —
            </p>
            <div className="space-y-4">
              {templates.map((msg, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onSelect(msg.text);
                    onClose();
                  }}
                  className="w-full group"
                >
                  <div className="bg-white/5 hover:bg-white/10 rounded-2xl p-6 border border-white/10 transition-all hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-[0.98]">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-emerald-300 text-lg">{msg.title}</h4>
                      <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 text-xs font-medium rounded-full border border-emerald-500/30">
                        آماده
                      </span>
                    </div>
                    <div className="bg-linear-to-r from-emerald-600/15 to-emerald-500/10 rounded-2xl rounded-tl-none p-5 mb-4 border-l-4 border-emerald-400/50 text-right">
                      <p className="text-sm leading-relaxed text-gray-100 whitespace-pre-line">
                        {msg.text.replace(/{[^}]+}/g, "---")}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-gray-500">
                        این متن <span className="text-emerald-400 font-bold">{msg.length}</span> پیامک
                      </span>
                      <div className="w-8 h-8 bg-emerald-500/20 rounded-xl flex items-center justify-center group-hover:bg-emerald-500/30">
                        <MessageCircle className="w-4 h-4 text-emerald-400" />
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
};

// مودال جدید انتخاب خدمات
const ServicesModal = ({
  isOpen,
  onClose,
  selectedServices,
  setSelectedServices,
  allServices,
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedServices: string[];
  setSelectedServices: React.Dispatch<React.SetStateAction<string[]>>;
  allServices: string[];
}) => {
  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md animate-in slide-in-from-bottom-4 duration-300">
        <div className="bg-linear-to-b from-[#1a1e26] to-[#242933] rounded-3xl border border-white/10 shadow-2xl overflow-hidden max-h-[85vh]">
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h3 className="text-xl font-bold text-white">انتخاب خدمات</h3>
            <button
              onClick={onClose}
              className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* دکمه افزودن خدمت جدید */}
          <div className="px-6 pt-4">
            <button
              onClick={() => {
                onClose();
                window.location.href = "../clientdashboard/services"; 
              }}
              className="w-full bg-linear-to-r from-purple-600 to-pink-600 rounded-2xl py-4 font-bold text-white shadow-lg hover:shadow-purple-500/50 active:scale-98 transition-all flex items-center justify-center gap-3"
            >
              <Plus className="w-6 h-6" />
              افزودن خدمت جدید
            </button>
          </div>

          {/* لیست خدمات */}
          <div className="px-6 py-6 max-h-96 overflow-y-auto custom-scrollbar space-y-3">
            {allServices.map((service) => {
              const isSelected = selectedServices.includes(service);
              return (
                <button
                  key={service}
                  onClick={() => toggleService(service)}
                  className={`w-full rounded-2xl p-5 text-right transition-all border ${
                    isSelected
                      ? "bg-linear-to-r from-emerald-500/30 to-emerald-600/30 border-emerald-400/60 shadow-lg shadow-emerald-500/30"
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-emerald-500/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Scissors className={`w-6 h-6 ${isSelected ? "text-emerald-300" : "text-gray-400"}`} />
                      <span className={`font-medium ${isSelected ? "text-white" : "text-gray-200"}`}>
                        {service}
                      </span>
                    </div>
                    {isSelected && <Check className="w-6 h-6 text-emerald-400" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* فوتر */}
          <div className="p-6 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-emerald-300 font-bold">
                {selectedServices.length} خدمت انتخاب شد
              </span>
              <button
                onClick={onClose}
                className="px-8 py-3 bg-linear-to-r from-emerald-500 to-emerald-600 rounded-xl font-bold text-white shadow-lg active:scale-95 transition"
              >
                تأیید و بستن
              </button>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
};

export default function NewAppointmentPage() {
  const todayJalali = useMemo(() => getTodayJalaliDate(), []);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedDate, setSelectedDate] = useState<{
    year: number;
    month: number;
    day: number | null;
  }>({ year: todayJalali.year, month: todayJalali.month, day: todayJalali.day });
  const [selectedTime, setSelectedTime] = useState("10:00");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const [sendReservationSms, setSendReservationSms] = useState(true);
  const [sendReminderSms, setSendReminderSms] = useState(true);
  const [reservationMessage, setReservationMessage] = useState("");
  const [reminderMessage, setReminderMessage] = useState("");
  const [reminderTime, setReminderTime] = useState<number>(1);

  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [isServicesModalOpen, setIsServicesModalOpen] = useState(false);

  const services = [
    "کوتاهی مو",
    "اصلاح ریش",
    "رنگ مو",
    "هایلایت",
    "مانیکور",
    "پدیکور",
    "کراتینه",
    "لیزر",
    "فیشیال",
    "میکاپ",
  ];

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
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
            {/* نام و موبایل */}
            <div className="flex items-end gap-4">
              <div className="flex-1 space-y-4">
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
              <button className="w-[120px] h-[120px] bg-white/10 backdrop-blur-sm rounded-2xl border border-emerald-500/30 flex flex-col items-center justify-center gap-3 hover:bg-white/15 transition-all hover:border-emerald-400">
                <Contact className="w-10 h-10 text-emerald-400" />
                <span className="text-xs text-center leading-tight">
                  انتخاب از <br /> مخاطبین
                </span>
              </button>
            </div>

            <div className="h-px bg-white/10 rounded-full"></div>

            {/* تاریخ و ساعت */}
            <div className="grid grid-cols-2 gap-4">
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
              <div>
                <label className="text-sm text-gray-300 mb-2 block">ساعت</label>
                <button
                  onClick={() => setIsTimePickerOpen(true)}
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3.5 flex items-center justify-between hover:border-emerald-500/50 transition backdrop-blur-sm"
                >
                  <span className="text-white">{selectedTime}</span>
                  <Clock className="w-5 h-5 text-emerald-400" />
                </button>
              </div>
            </div>

            {/* بخش جدید خدمات */}
            <div>
      
              {/* چیپ‌های انتخاب‌شده */}
              {selectedServices.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {selectedServices.map((service) => (
                    <span
                      key={service}
                      className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-4 py-2.5 rounded-xl text-sm font-medium border border-emerald-500/30"
                    >
                      <Scissors className="w-4 h-4" />
                      {service}
                      <button
                        onClick={() => toggleService(service)}
                        className="hover:bg-white/20 rounded-full p-1 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* دکمه اصلی انتخاب خدمات */}
              <button
                onClick={() => setIsServicesModalOpen(true)}
                className="w-full bg-linear-to-r from-emerald-600 via-emerald-500 to-emerald-600 rounded-2xl py-5 font-bold text-white shadow-2xl hover:shadow-emerald-500/50 active:scale-[0.98] transition-all duration-200 border border-emerald-500/30 flex items-center justify-center gap-4"
              >
                <Scissors className="w-8 h-8" />
                انتخاب خدمات
                {selectedServices.length > 0 && (
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                    {selectedServices.length} مورد
                  </span>
                )}
              </button>
            </div>

            {/* توضیحات */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm text-gray-300">توضیحات (اختیاری)</label>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="هر نکته‌ای که لازم است پرسنل بدونند..."
                className="w-full bg-white/10 border border-white/10 rounded-xl p-4 text-sm placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 resize-none h-28 backdrop-blur-sm"
              />
            </div>

            {/* پیامک رزرو و یادآوری (همون قبلی‌ها) */}
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
              {sendReservationSms && (
                <div className="mt-5 space-y-3">
                  <button
                    onClick={() => setIsReservationModalOpen(true)}
                    className="w-full bg-linear-to-r from-emerald-600 via-emerald-500 to-emerald-600 rounded-2xl p-3 flex items-center gap-4 shadow-2xl hover:shadow-emerald-500/40 active:scale-[0.98] transition-all border border-emerald-500/30"
                  >
                    <div className="w-8 h-8 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg">
                      <Plus className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-right flex-1">
                      <h4 className="font-bold text-sm text-white">پیامک های آماده</h4>
                      <p className="text-emerald-100 text-sm opacity-90">از لیست پیام های آماده انتخاب کن.</p>
                    </div>
                  </button>
                  <textarea
                    value={reservationMessage}
                    onChange={(e) => setReservationMessage(e.target.value)}
                    placeholder="اینجا میتونی پیام دلخواهتو بنویسی..."
                    className="w-full bg-white/10 border border-white/10 rounded-xl p-4 text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 resize-none h-28 backdrop-blur-sm"
                  />
                </div>
              )}
            </div>

            <div className="bg-white/5 rounded-xl p-5 border border-emerald-500/20">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-emerald-400" />
                  <span className="font-medium">ارسال پیامک یادآوری</span>
                </div>
                <input
                  type="checkbox"
                  checked={sendReminderSms}
                  onChange={(e) => setSendReminderSms(e.target.checked)}
                  className="w-6 h-6 text-emerald-500 rounded focus:ring-emerald-500"
                />
              </label>
              {sendReminderSms && (
                <div className="mt-5 space-y-4">
                  <div>
                    <label className="text-sm text-gray-300 mb-3 block">زمان ارسال یادآوری</label>
                    <div className="flex gap-2 flex-wrap">
                      {[1, 3, 6, 24].map((hour) => (
                        <button
                          key={hour}
                          onClick={() => setReminderTime(hour)}
                          className={`px-5 py-3.5 rounded-xl font-medium text-sm transition-all ${
                            reminderTime === hour
                              ? "bg-linear-to-r from-emerald-500 to-emerald-600 text-white shadow-lg scale-105"
                              : "bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20"
                          }`}
                        >
                          {hour} ساعت قبل
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={() => setIsReminderModalOpen(true)}
                      className="w-full bg-linear-to-r from-emerald-600 via-emerald-500 to-emerald-600 rounded-2xl p-3 flex items-center gap-4 shadow-2xl hover:shadow-emerald-500/40 active:scale-[0.98] transition-all border border-emerald-500/30"
                    >
                      <div className="w-8 h-8 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg">
                        <Plus className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-right flex-1">
                        <h4 className="font-bold text-sm text-white">پیامک های آماده</h4>
                        <p className="text-emerald-100 text-sm opacity-90">از لیست پیام های آماده انتخاب کن.</p>
                      </div>
                    </button>
                    <textarea
                      value={reminderMessage}
                      onChange={(e) => setReminderMessage(e.target.value)}
                      placeholder="اینجا میتونی پیام دلخواهتو بنویسی..."
                      className="mt-3 w-full bg-white/10 border border-white/10 rounded-xl p-4 text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 resize-none h-28 backdrop-blur-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* دکمه ثبت */}
            <button className="w-full py-4 bg-linear-to-r from-emerald-500 to-emerald-600 rounded-xl font-bold text-lg shadow-lg hover:from-emerald-600 hover:to-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-3">
              <Check className="w-6 h-6" />
              ثبت نوبت
            </button>

            {/* پشتیبانی */}
            <button className="w-full bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-4 hover:bg-white/15 transition-all border border-white/10">
              <div className="relative">
                <div className="w-16 bg-white/10 h-16 flex justify-center items-center rounded-full overflow-hidden">
                  <PhoneCall className="w-8 h-8" />
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

      {/* همه مودال‌ها */}
      <MessageTemplateModal
        isOpen={isReservationModalOpen}
        onClose={() => setIsReservationModalOpen(false)}
        templates={reservationTemplates}
        onSelect={setReservationMessage}
        title="انتخاب پیام تأیید رزرو"
      />

      <MessageTemplateModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        templates={reminderTemplates}
        onSelect={setReminderMessage}
        title="انتخاب پیام یادآوری"
      />

      <ServicesModal
        isOpen={isServicesModalOpen}
        onClose={() => setIsServicesModalOpen(false)}
        selectedServices={selectedServices}
        setSelectedServices={setSelectedServices}
        allServices={services}
      />

      <JalaliCalendarModal
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        isCalendarOpen={isCalendarOpen}
        setIsCalendarOpen={setIsCalendarOpen}
      />

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