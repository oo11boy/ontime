"use client";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
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
  AlertCircle,
} from "lucide-react";

import Footer from "../components/Footer/Footer";
import JalaliCalendarModal from "./JalaliCalendarModal";
import TimePickerModal from "./TimePickerModal";
import { persianMonths, getTodayJalali, jalaliToGregorian, formatPersianDate } from "@/lib/date-utils";

// تابع تاریخ امروز شمسی
const getTodayJalaliDate = () => {
  return getTodayJalali();
};

const formatJalaliDate = (year: number, month: number, day: number | null): string => {
  if (!day) return "انتخاب تاریخ";
  return `${day} ${persianMonths[month]} ${year}`;
};

// رابط سرویس
interface Service {
  id: number;
  name: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
}

// مودال تأیید تغییر نام
const NameChangeConfirmationModal = ({
  isOpen,
  onClose,
  oldName,
  newName,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  onClose: () => void;
  oldName: string;
  newName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md animate-in slide-in-from-bottom-4 duration-300">
        <div className="bg-linear-to-b from-[#1a1e26] to-[#242933] backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-amber-500" />
              <h3 className="text-xl font-bold text-white">تغییر نام مشتری</h3>
            </div>
            <button
              onClick={onClose}
              className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="text-center">
              <p className="text-gray-300 mb-4">این شماره موبایل قبلاً در سیستم ثبت شده است:</p>
              
              <div className="space-y-4">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <p className="text-sm text-gray-400 mb-2">نام فعلی در سیستم:</p>
                  <p className="text-lg font-bold text-amber-400">{oldName}</p>
                </div>
                
                <div className="flex items-center justify-center">
                  <ChevronLeft className="w-8 h-8 text-gray-500 rotate-90" />
                </div>
                
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <p className="text-sm text-gray-400 mb-2">نام جدید وارد شده:</p>
                  <p className="text-lg font-bold text-emerald-400">{newName}</p>
                </div>
              </div>
              
              <p className="text-gray-400 mt-6 text-sm">
                آیا می‌خواهید نام مشتری را از "{oldName}" به "{newName}" تغییر دهید؟
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-3.5 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition text-gray-300"
              >
                خیر، همان نام قبلی استفاده شود
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-3.5 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 rounded-xl font-bold text-white shadow-lg transition"
              >
                بله، تغییر نام
              </button>
            </div>
            
            <p className="text-xs text-gray-500 text-center">
              توجه: این تغییر در تمام نوبت‌های آینده این مشتری اعمال خواهد شد.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

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

// مودال انتخاب خدمات
const ServicesModal = ({
  isOpen,
  onClose,
  selectedServices,
  setSelectedServices,
  allServices,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedServices: Service[];
  setSelectedServices: React.Dispatch<React.SetStateAction<Service[]>>;
  allServices: Service[];
  isLoading: boolean;
}) => {
  const router = useRouter();

  const toggleService = (service: Service) => {
    setSelectedServices((prev) =>
      prev.some(s => s.id === service.id) 
        ? prev.filter((s) => s.id !== service.id) 
        : [...prev, service]
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

          <div className="px-6 pt-4">
            <button
              onClick={() => {
                onClose();
                router.push("/clientdashboard/services"); 
              }}
              className="w-full bg-linear-to-r from-purple-600 to-pink-600 rounded-2xl py-4 font-bold text-white shadow-lg hover:shadow-purple-500/50 active:scale-98 transition-all flex items-center justify-center gap-3"
            >
              <Plus className="w-6 h-6" />
              مدیریت خدمات
            </button>
          </div>

          <div className="px-6 py-6 max-h-96 overflow-y-auto custom-scrollbar space-y-3">
            {isLoading ? (
              // Loading state
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="w-full rounded-2xl p-5 bg-white/5 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-6 h-6 bg-white/10 rounded"></div>
                      <div className="h-4 bg-white/10 rounded w-32"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : allServices.length === 0 ? (
              // Empty state
              <div className="text-center py-8">
                <Scissors className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">هنوز خدمتی اضافه نکرده‌اید</p>
                <button
                  onClick={() => {
                    onClose();
                    router.push("/clientdashboard/services");
                  }}
                  className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm"
                >
                  افزودن خدمت
                </button>
              </div>
            ) : (
              // Services list
              allServices.map((service) => {
                const isSelected = selectedServices.some(s => s.id === service.id);
                return (
                  <button
                    key={service.id}
                    onClick={() => toggleService(service)}
                    className={`w-full rounded-2xl p-5 text-right transition-all border ${
                      isSelected
                        ? "bg-linear-to-r from-emerald-500/30 to-emerald-600/30 border-emerald-400/60 shadow-lg shadow-emerald-500/30"
                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-emerald-500/40"
                    }`}
                    disabled={!service.is_active}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Scissors className={`w-6 h-6 ${
                          isSelected ? "text-emerald-300" : 
                          service.is_active ? "text-gray-400" : "text-gray-600"
                        }`} />
                        <div className="text-right">
                          <span className={`font-medium block ${
                            isSelected ? "text-white" : 
                            service.is_active ? "text-gray-200" : "text-gray-500"
                          }`}>
                            {service.name}
                          </span>
                          {!service.is_active && (
                            <span className="text-xs text-gray-500 mt-1">(غیرفعال)</span>
                          )}
                        </div>
                      </div>
                      {isSelected && <Check className="w-6 h-6 text-emerald-400" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="p-6 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-emerald-300 font-bold block">
                  {selectedServices.length} خدمت انتخاب شد
                </span>
                {selectedServices.length > 0 && (
                  <span className="text-xs text-gray-400 mt-1 block">
                    مدت زمان تخمینی: {selectedServices.reduce((acc, s) => acc + s.duration_minutes, 0)} دقیقه
                  </span>
                )}
              </div>
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

// پیام‌های آماده رزرو و یادآوری
const reservationTemplates = [
  {
    title: "رسمی و حرفه‌ای",
    text: "سلام {client_name} عزیز\nنوبت شما با موفقیت ثبت شد!\nتاریخ: {date}\nساعت: {time}\nخدمات: {services}\n\nممنون از اعتمادتون",
    length: 3,
  },
  {
    title: "دوستانه و گرم",
    text: "سلام {client_name} جان\nنوبتت ثبت شد عزیزم!\n{date} ساعت {time} منتظرتیم\nخدمات: {services}\n\nبه موقع بیا که دلمون برات تنگ میشه",
    length: 3,
  },
  {
    title: "کوتاه و مفید",
    text: "نوبت شما ثبت شد!\n{date} - {time}\nخدمات: {services}\n\nمنتظر حضورتون هستیم",
    length: 2,
  },
  {
    title: "خوش‌آمدگویی گرم",
    text: "خوش اومدی {client_name} عزیز\nنوبتت ثبت شد:\n{date} ساعت {time}\nخدمات: {services}\n\nمنتظرت هستیم",
    length: 2,
  },
];

const reminderTemplates = [
  {
    title: "یادآوری مودبانه",
    text: "سلام {client_name} عزیز\nیادآوری نوبت:\nامروز ساعت {time} منتظر شما هستیم\nلطفاً سر وقت تشریف بیاورید",
    length: 2,
  },
  {
    title: "یادآوری دوستانه",
    text: "سلام {client_name} جان\nامروز ساعت {time} نوبتته!\nاگه نمی‌تونی بیای حتما خبر بده\nدلمون برات تنگ شده",
    length: 2,
  },
  {
    title: "یادآوری عاشقانه",
    text: "عزیزم {client_name}\nامروز ساعت {time} می‌بینمت\nدلم برات تنگ شده بود\nمنتظرم",
    length: 2,
  },
  {
    title: "یادآوری با طنز",
    text: "سلام {client_name}!\nساعت {time} نوبتته\nاگه نیای آرایشگرمون دلش می‌گیره\nبیا که منتظرتیم",
    length: 2,
  },
];

export default function NewAppointmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const todayJalali = useMemo(() => getTodayJalaliDate(), []);

  // دریافت تاریخ از URL
  const getInitialDate = () => {
    const dateParam = searchParams.get('date');
    if (dateParam) {
      try {
        const parts = dateParam.split('/').map(Number);
        if (parts.length === 3) {
          return {
            year: parts[0],
            month: parts[1] - 1, // تبدیل به ایندکس 0-11
            day: parts[2]
          };
        }
      } catch (error) {
        console.error("Error parsing date from URL:", error);
      }
    }
    return { year: todayJalali.year, month: todayJalali.month, day: todayJalali.day };
  };

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedDate, setSelectedDate] = useState<{
    year: number;
    month: number;
    day: number | null;
  }>(getInitialDate());
  const [selectedTime, setSelectedTime] = useState("10:00");
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [notes, setNotes] = useState("");

  const [sendReservationSms, setSendReservationSms] = useState(true);
  const [sendReminderSms, setSendReminderSms] = useState(true);
  const [reservationMessage, setReservationMessage] = useState("");
  const [reminderMessage, setReminderMessage] = useState("");
  const [reminderTime, setReminderTime] = useState<number>(24);

  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [isServicesModalOpen, setIsServicesModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // حالت‌های جدید برای بررسی مشتری
  const [isCheckingClient, setIsCheckingClient] = useState(false);
  const [existingClient, setExistingClient] = useState<{
    exists: boolean;
    name?: string;
    totalBookings?: number;
    lastBookingDate?: string;
    isBlocked?: boolean;
  } | null>(null);
  const [showNameChangeModal, setShowNameChangeModal] = useState(false);
  const [pendingNameChange, setPendingNameChange] = useState<{
    oldName: string;
    newName: string;
  } | null>(null);
  
  // موجودی پیامک کاربر
  const [userSmsBalance, setUserSmsBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  
  // سرویس‌های داینامیک
  const [services, setServices] = useState<Service[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);

  // تابع برای دریافت سرویس‌های کاربر
  const fetchUserServices = useCallback(async () => {
    try {
      setIsLoadingServices(true);
      const response = await fetch('/api/services');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // فقط سرویس‌های فعال
          const activeServices = data.services.filter((service: Service) => service.is_active);
          setServices(activeServices);
        } else {
          toast.error(data.message || "خطا در دریافت خدمات");
        }
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("خطا در دریافت خدمات");
    } finally {
      setIsLoadingServices(false);
    }
  }, []);

  // تابع برای دریافت موجودی پیامک کاربر
  const fetchUserSmsBalance = useCallback(async () => {
    try {
      setIsLoadingBalance(true);
      const response = await fetch('/api/client/dashboard');
      if (response.ok) {
        const data = await response.json();
        setUserSmsBalance(data.user?.sms_balance || 0);
      }
    } catch (error) {
      console.error("خطا در دریافت موجودی پیامک:", error);
    } finally {
      setIsLoadingBalance(false);
    }
  }, []);

  useEffect(() => {
    fetchUserServices();
    fetchUserSmsBalance();
  }, [fetchUserServices, fetchUserSmsBalance]);

  // محاسبه تعداد پیامک‌های مورد نیاز
  const calculateSmsNeeded = useMemo(() => {
    const reservationSms = sendReservationSms ? 1 : 0;
    const reminderSms = sendReminderSms ? 1 : 0;
    return reservationSms + reminderSms;
  }, [sendReservationSms, sendReminderSms]);

  // تابع چک کردن مشتری موجود
  const checkExistingClient = useCallback(async (phoneNumber: string, currentName: string) => {
    const cleanedPhone = phoneNumber.replace(/\D/g, '');
    if (cleanedPhone.length < 10) return;

    setIsCheckingClient(true);
    try {
      const response = await fetch(`/api/client/check?phone=${encodeURIComponent(cleanedPhone)}`);
      const data = await response.json();
      
      if (data.exists && data.client) {
        setExistingClient({
          exists: true,
          name: data.client.name,
          totalBookings: data.client.totalBookings,
          lastBookingDate: data.client.lastBookingDate,
          isBlocked: data.client.isBlocked
        });
        
        // اگر نام مشتری با نام موجود متفاوت است
        if (data.client.name && currentName && data.client.name.trim() !== currentName.trim()) {
          setPendingNameChange({
            oldName: data.client.name,
            newName: currentName
          });
          setShowNameChangeModal(true);
        }
      } else {
        setExistingClient(null);
      }
    } catch (error) {
      console.error("Error checking client:", error);
      setExistingClient(null);
    } finally {
      setIsCheckingClient(false);
    }
  }, []);

  // تایمر برای چک کردن مشتری بعد از تایپ کردن
  useEffect(() => {
    const cleanedPhone = phone.replace(/\D/g, '');
    if (cleanedPhone.length >= 10) {
      const timer = setTimeout(() => {
        checkExistingClient(phone, name);
      }, 800); // تأخیر 800 میلی‌ثانیه بعد از تایپ
      
      return () => clearTimeout(timer);
    } else {
      setExistingClient(null);
    }
  }, [phone, name, checkExistingClient]);

  const handleNameChangeConfirm = () => {
    // نام جدید را قبول می‌کنیم (نام فعلی در state می‌ماند)
    setShowNameChangeModal(false);
    setPendingNameChange(null);
    toast.success("نام مشتری به روز شد");
  };

  const handleNameChangeCancel = () => {
    // نام قبلی را اعمال می‌کنیم
    if (pendingNameChange) {
      setName(pendingNameChange.oldName);
    }
    setShowNameChangeModal(false);
    setPendingNameChange(null);
    toast.info("از نام قبلی مشتری استفاده شد");
  };

  // اعتبارسنجی متن پیام‌ها
  const validateMessages = () => {
    if (sendReservationSms && !reservationMessage.trim()) {
      toast.error("لطفا متن پیام تأیید رزرو را وارد کنید");
      return false;
    }
    
    if (sendReservationSms && reservationMessage.trim().length < 10) {
      toast.error("پیام تأیید رزرو باید حداقل ۱۰ کاراکتر باشد");
      return false;
    }
    
    if (sendReminderSms && !reminderMessage.trim()) {
      toast.error("لطفا متن پیام یادآوری را وارد کنید");
      return false;
    }
    
    if (sendReminderSms && reminderMessage.trim().length < 10) {
      toast.error("پیام یادآوری باید حداقل ۱۰ کاراکتر باشد");
      return false;
    }
    
    return true;
  };

  // اعتبارسنجی موجودی پیامک قبل از ارسال
  const validateSmsBalance = () => {
    const smsNeeded = calculateSmsNeeded;
    if (smsNeeded > userSmsBalance) {
      toast.error(`موجودی پیامک کافی نیست. نیاز: ${smsNeeded} پیامک، موجودی: ${userSmsBalance}`);
      return false;
    }
    return true;
  };

  // تابع ارسال نوبت به API
  const handleSubmitBooking = async () => {
    // اعتبارسنجی فیلدهای ضروری
    if (!name.trim()) {
      toast.error("لطفا نام مشتری را وارد کنید");
      return;
    }

    if (!phone.trim()) {
      toast.error("لطفا شماره تلفن را وارد کنید");
      return;
    }

    const cleanedPhone = phone.replace(/\D/g, '');
    if (cleanedPhone.length < 10 || cleanedPhone.length > 12) {
      toast.error("شماره تلفن معتبر نیست (باید ۱۰ تا ۱۲ رقم باشد)");
      return;
    }

    if (!selectedDate.day) {
      toast.error("لطفا تاریخ را انتخاب کنید");
      return;
    }

    // تبدیل تاریخ شمسی به میلادی
    const bookingDate = jalaliToGregorian(
      selectedDate.year,
      selectedDate.month,
      selectedDate.day
    );

    const today = new Date().toISOString().split('T')[0];
    if (bookingDate < today) {
      toast.error("تاریخ نمی‌تواند در گذشته باشد");
      return;
    }

    // اگر مشتری بلاک شده است
    if (existingClient?.isBlocked) {
      toast.error("این مشتری در لیست بلاک شده است. نمی‌توانید نوبت ثبت کنید.");
      return;
    }

    // اعتبارسنجی متن پیام‌ها
    if (!validateMessages()) {
      return;
    }

    // اعتبارسنجی موجودی پیامک
    const smsNeeded = calculateSmsNeeded;
    if (smsNeeded > 0 && !validateSmsBalance()) {
      return;
    }

    // تبدیل پیام‌ها با جایگذاری متغیرها
    let finalReservationMessage = reservationMessage;
    let finalReminderMessage = reminderMessage;
    
    const jalaliDateStr = formatJalaliDate(selectedDate.year, selectedDate.month, selectedDate.day);
    
    if (reservationMessage) {
      finalReservationMessage = reservationMessage
        .replace(/{client_name}/g, name.trim())
        .replace(/{date}/g, jalaliDateStr)
        .replace(/{time}/g, selectedTime)
        .replace(/{services}/g, selectedServices.map(s => s.name).join(", "));
    }
    
    if (reminderMessage) {
      finalReminderMessage = reminderMessage
        .replace(/{client_name}/g, name.trim())
        .replace(/{time}/g, selectedTime);
    }

    setIsSubmitting(true);

    try {
      const bookingData = {
        client_name: name.trim(),
        client_phone: cleanedPhone,
        booking_date: bookingDate,
        booking_time: selectedTime,
        booking_description: notes.trim(),
        services: selectedServices.map(s => s.name).join(", "),
        sms_reserve_enabled: sendReservationSms,
        sms_reserve_custom_text: finalReservationMessage,
        sms_reminder_enabled: sendReminderSms,
        sms_reminder_custom_text: finalReminderMessage,
        sms_reminder_hours_before: reminderTime,
      };

      console.log("Submitting booking data:", bookingData);

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(`نوبت با موفقیت ثبت شد! ${smsNeeded > 0 ? `(${smsNeeded} پیامک ارسال شد)` : ''}`);
        
        // پاک کردن فرم
        setName("");
        setPhone("");
        setSelectedServices([]);
        setNotes("");
        setReservationMessage("");
        setReminderMessage("");
        setExistingClient(null);
        
        // به‌روزرسانی موجودی پیامک
        if (smsNeeded > 0) {
          setUserSmsBalance(prev => prev - smsNeeded);
        }
        
        // هدایت به صفحه تقویم بعد از 2 ثانیه
        setTimeout(() => {
          router.push("/clientdashboard/calendar");
        }, 2000);
      } else {
        toast.error(result.message || "خطا در ثبت نوبت");
        console.error("Booking error:", result);
      }
    } catch (error) {
      console.error("Error submitting booking:", error);
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen text-white overflow-auto max-w-md mx-auto">
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1a1e26',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
          },
          success: {
            style: {
              background: '#10b981',
              color: '#fff',
            },
          },
          error: {
            style: {
              background: '#ef4444',
              color: '#fff',
            },
          },
          info: {
            style: {
              background: '#3b82f6',
              color: '#fff',
            },
          },
        }}
      />
      
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
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="نام و نام خانوادگی"
                      className="w-full bg-white/10 border border-white/10 rounded-xl pr-12 px-4 py-3.5 text-right placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 transition backdrop-blur-sm"
                    />
                    <User className="absolute right-4 top-4 w-5 h-5 text-emerald-400" />
                  </div>
                </div>
                <div>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="شماره موبایل (مثال: 09123456789)"
                      dir="ltr"
                      className="w-full bg-white/10 border border-white/10 rounded-xl text-right px-4 py-3.5 pr-12 placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 transition backdrop-blur-sm font-mono"
                    />
                    <Phone className="absolute right-4 top-4 w-5 h-5 text-emerald-400" />
                    {isCheckingClient && (
                      <div className="absolute left-4 top-4">
                        <div className="w-5 h-5 border-2 border-emerald-400/50 border-t-emerald-400 rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  
                  {/* نمایش اطلاعات مشتری موجود */}
                  {existingClient && !isCheckingClient && (
                    <div className="mt-2">
                      <div className={`p-3 rounded-xl border ${existingClient.isBlocked ? 'bg-red-500/10 border-red-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm font-medium">
                              مشتری موجود: {existingClient.name}
                            </span>
                          </div>
                          {existingClient.isBlocked ? (
                            <span className="px-2 py-1 text-xs bg-red-500/20 text-red-300 rounded-full">
                              بلاک شده
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs bg-emerald-500/20 text-emerald-300 rounded-full">
                              {existingClient.totalBookings || 0} نوبت قبلی
                            </span>
                          )}
                        </div>
                        {existingClient.lastBookingDate && !existingClient.isBlocked && (
                          <p className="text-xs text-gray-400 mt-1">
                            آخرین نوبت: {formatPersianDate(existingClient.lastBookingDate)}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
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

            {/* بخش خدمات */}
            <div>
              {selectedServices.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {selectedServices.map((service) => (
                    <span
                      key={service.id}
                      className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-4 py-2.5 rounded-xl text-sm font-medium border border-emerald-500/30"
                    >
                      <Scissors className="w-4 h-4" />
                      {service.name}
                      <button
                        onClick={() => setSelectedServices(prev => prev.filter(s => s.id !== service.id))}
                        className="hover:bg-white/20 rounded-full p-1 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

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
                    placeholder="اینجا میتونی پیام دلخواهتو بنویسی...
میتونی از متغیرهای زیر استفاده کنی:
{client_name} - نام مشتری
{date} - تاریخ نوبت
{time} - زمان نوبت
{services} - خدمات انتخاب شده"
                    className="w-full bg-white/10 border border-white/10 rounded-xl p-4 text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 resize-none h-40 backdrop-blur-sm"
                    required={sendReservationSms}
                  />
                  {sendReservationSms && !reservationMessage.trim() && (
                    <p className="text-xs text-red-400 mt-1">⚠️ متن پیام رزرو الزامی است</p>
                  )}
                </div>
              )}
            </div>

            {/* پیامک یادآوری */}
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
                      placeholder="اینجا میتونی پیام دلخواهتو بنویسی...
میتونی از متغیرهای زیر استفاده کنی:
{client_name} - نام مشتری
{time} - زمان نوبت"
                      className="mt-3 w-full bg-white/10 border border-white/10 rounded-xl p-4 text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 resize-none h-40 backdrop-blur-sm"
                      required={sendReminderSms}
                    />
                    {sendReminderSms && !reminderMessage.trim() && (
                      <p className="text-xs text-red-400 mt-1">⚠️ متن پیام یادآوری الزامی است</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* نمایش موجودی پیامک */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-emerald-500/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-medium text-gray-300">موجودی و هزینه پیامک</span>
                </div>
                {isLoadingBalance ? (
                  <div className="w-6 h-6 border-2 border-emerald-400/50 border-t-emerald-400 rounded-full animate-spin"></div>
                ) : (
                  <span className="font-bold text-lg text-emerald-300">{userSmsBalance} پیامک</span>
                )}
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">پیامک رزرو:</span>
                  <div className="flex items-center gap-2">
                    <span className={sendReservationSms ? "text-emerald-400 font-bold" : "text-gray-500"}>
                      {sendReservationSms ? "۱ پیامک" : "عدم ارسال"}
                    </span>
                    {sendReservationSms && (
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">پیامک یادآوری:</span>
                  <div className="flex items-center gap-2">
                    <span className={sendReminderSms ? "text-emerald-400 font-bold" : "text-gray-500"}>
                      {sendReminderSms ? "۱ پیامک" : "عدم ارسال"}
                    </span>
                    {sendReminderSms && (
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    )}
                  </div>
                </div>
                
                <div className="h-px bg-white/10 my-2"></div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">مجموع پیامک‌های این نوبت:</span>
                  <div className={`px-3 py-1.5 rounded-lg font-bold ${calculateSmsNeeded > 0 ? "bg-emerald-500/20 text-emerald-300" : "bg-gray-500/20 text-gray-400"}`}>
                    {calculateSmsNeeded} پیامک
                  </div>
                </div>
                
                {calculateSmsNeeded > 0 && calculateSmsNeeded > userSmsBalance && !isLoadingBalance && (
                  <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-xs text-red-300 text-center">
                      ❌ موجودی پیامک کافی نیست!
                      <br />
                      <button 
                        onClick={() => router.push('/clientdashboard/buysms')}
                        className="underline mt-1 hover:text-red-200 transition"
                      >
                        برای ادامه خرید پیامک
                      </button>
                    </p>
                  </div>
                )}
                
                {calculateSmsNeeded === 0 && (
                  <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-xs text-blue-300 text-center">
                      ⚡ هیچ پیامکی برای این نوبت ارسال نمی‌شود
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* دکمه ثبت */}
            <button 
              onClick={handleSubmitBooking}
              disabled={isSubmitting || existingClient?.isBlocked || (calculateSmsNeeded > 0 && calculateSmsNeeded > userSmsBalance)}
              className="w-full py-4 bg-linear-to-r from-emerald-500 to-emerald-600 rounded-xl font-bold text-lg shadow-lg hover:from-emerald-600 hover:to-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  در حال ثبت...
                </>
              ) : existingClient?.isBlocked ? (
                <>
                  <X className="w-6 h-6" />
                  مشتری بلاک شده
                </>
              ) : (calculateSmsNeeded > 0 && calculateSmsNeeded > userSmsBalance) ? (
                <>
                  <X className="w-6 h-6" />
                  موجودی پیامک کافی نیست
                </>
              ) : (
                <>
                  <Check className="w-6 h-6" />
                  ثبت نوبت
                </>
              )}
            </button>

            {/* پشتیبانی */}
            <button 
              onClick={() => window.open('tel:02112345678', '_blank')}
              className="w-full bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-4 hover:bg-white/15 transition-all border border-white/10"
            >
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
      <NameChangeConfirmationModal
        isOpen={showNameChangeModal}
        onClose={() => setShowNameChangeModal(false)}
        oldName={pendingNameChange?.oldName || ""}
        newName={pendingNameChange?.newName || ""}
        onConfirm={handleNameChangeConfirm}
        onCancel={handleNameChangeCancel}
      />

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
        isLoading={isLoadingServices}
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