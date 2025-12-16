// File Path: src\app\(client pages)\clientdashboard\calendar\page.tsx

"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import {

  Plus,
  Calendar,
  User,
  Clock,
  Scissors,
  Phone,
  Filter,
  X,
  RefreshCw,
  XCircle,
  MoreVertical,
  MessageSquare,
  Send,
} from "lucide-react";
import Footer from "../components/Footer/Footer";
import {  gregorianToPersian, formatPersianDate } from "@/lib/date-utils";

interface Appointment {
  id: number;
  client_name: string;
  client_phone: string;
  booking_date: string;
  booking_time: string;
  services: string;
  status: 'active' | 'cancelled' | 'done';
  booking_description?: string;
  sms_reserve_enabled: boolean;
  sms_reminder_enabled: boolean;
  sms_reminder_hours_before?: number;
}

interface CalendarDay {
  date: Date;
  jalaliDate: {
    year: number;
    month: number;
    day: number;
    monthName: string;
  };
  isToday: boolean;
  isPast: boolean;
  isWeekend: boolean;
  appointments: Appointment[];
  hasAppointments: boolean;
}

const formatTimeDisplay = (timeString: string): string => {
  if (!timeString) return "زمان نامشخص";
  
  if (timeString.includes(':')) {
    const parts = timeString.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
  }
  
  return timeString;
};

// مودال جزئیات نوبت
const AppointmentDetailModal = ({
  appointment,
  onClose,
  onCancel,
}: {
  appointment: Appointment;
  onClose: () => void;
  onCancel: (id: number) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = async () => {
    if (!confirm("آیا از کنسل کردن این نوبت اطمینان دارید؟")) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/bookings/${appointment.id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        toast.success("نوبت با موفقیت کنسل شد");
        onCancel(appointment.id);
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.message || "خطا در کنسل کردن نوبت");
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-emerald-400';
      case 'cancelled': return 'text-red-400';
      case 'done': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'فعال';
      case 'cancelled': return 'کنسل شده';
      case 'done': return 'انجام شده';
      default: return 'نامشخص';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-linear-to-b from-[#1a1e26] to-[#242933] rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-emerald-400" />
            <h3 className="text-xl font-bold text-white">جزئیات نوبت</h3>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">تاریخ</p>
              <p className="text-white font-bold">{formatPersianDate(appointment.booking_date)}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">ساعت</p>
              <p className="text-white font-bold">{formatTimeDisplay(appointment.booking_time)}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-white/10">
              <span className="text-gray-400">نام مشتری</span>
              <span className="text-white font-medium flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-400" />
                {appointment.client_name}
              </span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-white/10">
              <span className="text-gray-400">شماره تماس</span>
              <span className="text-white font-medium flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400" />
                {appointment.client_phone}
              </span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-white/10">
              <span className="text-gray-400">خدمات</span>
              <span className="text-white font-medium flex items-center gap-2">
                <Scissors className="w-4 h-4 text-emerald-400" />
                {appointment.services || "بدون خدمات"}
              </span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-white/10">
              <span className="text-gray-400">وضعیت</span>
              <span className={`font-bold ${getStatusColor(appointment.status)}`}>
                {getStatusText(appointment.status)}
              </span>
            </div>
            
            {appointment.booking_description && (
              <div className="py-3 border-b border-white/10">
                <p className="text-gray-400 mb-2">توضیحات</p>
                <p className="text-white text-sm leading-relaxed">
                  {appointment.booking_description}
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400 mb-1">پیامک رزرو</p>
                <span className={`text-sm font-medium ${appointment.sms_reserve_enabled ? 'text-emerald-400' : 'text-gray-500'}`}>
                  {appointment.sms_reserve_enabled ? 'ارسال شد' : 'ارسال نشد'}
                </span>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400 mb-1">پیامک یادآوری</p>
                <span className={`text-sm font-medium ${appointment.sms_reminder_enabled ? 'text-emerald-400' : 'text-gray-500'}`}>
                  {appointment.sms_reminder_enabled ? 'تنظیم شده' : 'خاموش'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/10 flex gap-3">
          {appointment.status === 'active' && (
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1 py-3.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl font-medium transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              کنسل کردن
            </button>
          )}
          <button
            onClick={onClose}
            className={`py-3.5 ${appointment.status === 'active' ? 'flex-1' : 'w-full'} bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold transition`}
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};

// مودال ارسال پیام همگانی
const BulkSmsModal = ({
  isOpen,
  onClose,
  date,
  appointments,
  userSmsBalance,
  onSend,
}: {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  appointments: Appointment[];
  userSmsBalance: number;
  onSend: (message: string, appointmentIds: number[]) => Promise<void>;
}) => {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [selectedAppointments, setSelectedAppointments] = useState<number[]>([]);

  const activeAppointments = useMemo(() => 
    appointments.filter(app => app.status === 'active'),
    [appointments]
  );

  useEffect(() => {
    if (isOpen && activeAppointments.length > 0) {
      const allActiveIds = activeAppointments.map(app => app.id);
      setSelectedAppointments(allActiveIds);
    }
    
    if (!isOpen) {
      setSelectedAppointments([]);
      setMessage("");
    }
  }, [isOpen]);

  const handleToggleAll = () => {
    if (selectedAppointments.length === activeAppointments.length) {
      setSelectedAppointments([]);
    } else {
      setSelectedAppointments(activeAppointments.map(app => app.id));
    }
  };

  const handleToggleAppointment = (id: number) => {
    setSelectedAppointments(prev =>
      prev.includes(id)
        ? prev.filter(appId => appId !== id)
        : [...prev, id]
    );
  };

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("لطفا متن پیام را وارد کنید");
      return;
    }

    if (selectedAppointments.length === 0) {
      toast.error("لطفا حداقل یک مشتری را انتخاب کنید");
      return;
    }

    if (selectedAppointments.length > userSmsBalance) {
      toast.error(`موجودی پیامک کافی نیست. نیاز: ${selectedAppointments.length}، موجودی: ${userSmsBalance}`);
      return;
    }

    setIsSending(true);
    try {
      await onSend(message, selectedAppointments);
      onClose();
    } catch (error) {
      console.error("Error sending bulk SMS:", error);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-linear-to-b from-[#1a1e26] to-[#242933] rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-emerald-400" />
            <div>
              <h3 className="text-xl font-bold text-white">ارسال پیام همگانی</h3>
              <p className="text-sm text-gray-400 mt-1">{formatPersianDate(date.toISOString().split('T')[0])}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">تعداد مشتریان انتخاب شده</span>
              <span className="text-emerald-300 font-bold">{selectedAppointments.length} نفر</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">هزینه پیامک</span>
              <span className={`font-bold ${selectedAppointments.length > userSmsBalance ? 'text-red-400' : 'text-emerald-300'}`}>
                {selectedAppointments.length} پیامک
              </span>
            </div>
            {selectedAppointments.length > userSmsBalance && (
              <p className="text-xs text-red-400 mt-2">
                ❌ موجودی پیامک کافی نیست
              </p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-3 block items-center justify-between">
              <span>متن پیام</span>
              <span className="text-xs text-gray-500">می‌توانید از متغیر {`{client_name}`} استفاده کنید</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="متن پیام همگانی را وارد کنید...
مثال: سلام {client_name} عزیز، یادآوری می‌کنیم که فردا ساعت نوبت شماست."
              className="w-full bg-white/10 border border-white/10 rounded-xl p-4 text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 resize-none h-40 backdrop-blur-sm"
              rows={4}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm text-gray-300">انتخاب مشتریان</label>
              <button
                onClick={handleToggleAll}
                className="text-xs text-emerald-400 hover:text-emerald-300"
              >
                {selectedAppointments.length === activeAppointments.length ? 'عدم انتخاب همه' : 'انتخاب همه'}
              </button>
            </div>
            
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {activeAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 hover:border-emerald-500/30 transition"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedAppointments.includes(appointment.id)}
                      onChange={() => handleToggleAppointment(appointment.id)}
                      className="w-5 h-5 text-emerald-500 rounded focus:ring-emerald-500"
                    />
                    <div>
                      <p className="text-white font-medium text-sm">{appointment.client_name}</p>
                      <p className="text-xs text-gray-400">{formatTimeDisplay(appointment.booking_time)}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{appointment.services?.split(',')[0] || 'بدون خدمات'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/10 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition"
            disabled={isSending}
          >
            انصراف
          </button>
          <button
            onClick={handleSend}
            disabled={isSending || selectedAppointments.length === 0 || selectedAppointments.length > userSmsBalance}
            className="flex-1 py-3.5 bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-xl font-bold transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSending ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                در حال ارسال...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                ارسال پیام
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// مودال فیلتر
const FilterModal = ({
  isOpen,
  onClose,
  filters,
  setFilters,
  services,
}: {
  isOpen: boolean;
  onClose: () => void;
  filters: any;
  setFilters: (filters: any) => void;
  services: string[];
}) => {
  const [tempFilters, setTempFilters] = useState(filters);

  const handleApply = () => {
    setFilters(tempFilters);
    onClose();
  };

  const handleReset = () => {
    setTempFilters({
      status: 'all',
      service: 'all',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-linear-to-b from-[#1a1e26] to-[#242933] rounded-t-3xl border border-white/10 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Filter className="w-6 h-6 text-emerald-400" />
            <h3 className="text-xl font-bold text-white">فیلتر نوبت‌ها</h3>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="text-sm text-gray-300 mb-3 block">وضعیت</label>
            <div className="flex gap-2 flex-wrap">
              {['all', 'active', 'cancelled', 'done'].map((status) => (
                <button
                  key={status}
                  onClick={() => setTempFilters({ ...tempFilters, status })}
                  className={`px-4 py-2.5 rounded-xl text-sm transition-all ${
                    tempFilters.status === status
                      ? "bg-emerald-500 text-white shadow-lg"
                      : "bg-white/10 text-gray-300 hover:bg-white/20"
                  }`}
                >
                  {status === 'all' ? 'همه' : 
                   status === 'active' ? 'فعال' :
                   status === 'cancelled' ? 'کنسل شده' : 'انجام شده'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-3 block">خدمات</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTempFilters({ ...tempFilters, service: 'all' })}
                className={`p-3 rounded-xl text-sm transition-all ${
                  tempFilters.service === 'all'
                    ? "bg-emerald-500 text-white shadow-lg"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
              >
                همه خدمات
              </button>
              {services.map((service) => (
                <button
                  key={service}
                  onClick={() => setTempFilters({ ...tempFilters, service })}
                  className={`p-3 rounded-xl text-sm transition-all ${
                    tempFilters.service === service
                      ? "bg-emerald-500 text-white shadow-lg"
                      : "bg-white/10 text-gray-300 hover:bg-white/20"
                  }`}
                >
                  {service}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/10 flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 py-3.5 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition"
          >
            بازنشانی
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold transition"
          >
            اعمال فیلتر
          </button>
        </div>
      </div>
    </div>
  );
};

export default function CalendarPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showBulkSmsModal, setShowBulkSmsModal] = useState(false);
  const [selectedDayForSms, setSelectedDayForSms] = useState<Date | null>(null);
  const [userSmsBalance, setUserSmsBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all' as 'all' | 'active' | 'cancelled' | 'done',
    service: 'all',
  });
  // دریافت سرویس‌های داینامیک
  const [dynamicServices, setDynamicServices] = useState<string[]>(["همه خدمات"]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);

  const fetchUserServices = useCallback(async () => {
    try {
      setIsLoadingServices(true);
      const response = await fetch('/api/services');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // فقط نام سرویس‌های فعال
          const serviceNames = data.services
            .filter((service: any) => service.is_active)
            .map((service: any) => service.name);
          
          setDynamicServices(["همه خدمات", ...serviceNames]);
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

const fetchUserSmsBalance = useCallback(async () => {
  try {
    setIsLoadingBalance(true);
    const response = await fetch('/api/client/dashboard');
    if (response.ok) {
      const data = await response.json();
      // اولویت‌ها: total_sms_balance -> مجموع پلن و بسته‌ها
      const totalBalance = data.user?.total_sms_balance || 
                          (data.user?.sms_balance || 0) + 
                          (data.user?.purchased_sms_credit || 0);
      setUserSmsBalance(totalBalance);
      console.log("💰 موجودی پیامک دریافت شد:", {
        totalBalance,
        planBalance: data.user?.sms_balance,
        purchasedCredit: data.user?.purchased_sms_credit,
        totalSmsBalance: data.user?.total_sms_balance
      });
    } else {
      console.error("خطا در دریافت موجودی از API");
      // مقدار پیش‌فرض
      setUserSmsBalance(0);
    }
  } catch (error) {
    console.error("خطا در دریافت موجودی پیامک:", error);
    setUserSmsBalance(0);
  } finally {
    setIsLoadingBalance(false);
  }
}, []);


const fetchAppointments = useCallback(async () => {
  setIsLoading(true);
  try {

    const updateResponse = await fetch('/api/bookings/update-bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (updateResponse.ok) {
      const updateData = await updateResponse.json();
      console.log('✅ نوبت‌های گذشته به‌روزرسانی شد:', updateData);
    }
    
    // 2. سپس نوبت‌ها را دریافت کنید
    const response = await fetch("/api/bookings");
    if (response.ok) {
      const data = await response.json();
      setAppointments(data.bookings || []);
    } else {
      toast.error("خطا در دریافت نوبت‌ها");
    }
  } catch (error) {
    console.error("Error fetching appointments:", error);
    toast.error("خطا در ارتباط با سرور");
  } finally {
    setIsLoading(false);
  }
}, []);

  useEffect(() => {
    fetchAppointments();
    fetchUserSmsBalance();
    fetchUserServices();
  }, [fetchAppointments, fetchUserSmsBalance, fetchUserServices]);

  useEffect(() => {
    const generateCalendar = () => {
      const uniqueDates = new Set<string>();
      appointments.forEach(app => {
        if (app.status === 'active') {
          uniqueDates.add(app.booking_date);
        }
      });

      const sortedDates = Array.from(uniqueDates)
        .map(dateStr => new Date(dateStr))
        .sort((a, b) => a.getTime() - b.getTime())
        .slice(0, 30);

      if (sortedDates.length === 0) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        sortedDates.push(today, tomorrow);
      }

      const days: CalendarDay[] = [];
      const today = new Date();
      
      sortedDates.forEach(date => {
        const persianDate = gregorianToPersian(date);
        
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
        const isToday = date.toDateString() === today.toDateString();
        const isPast = date < today && !isToday;

        const dayAppointments = appointments.filter(app => {
          const appDate = new Date(app.booking_date);
          return appDate.toDateString() === date.toDateString();
        });

        const hasActiveAppointments = dayAppointments.some(app => app.status === 'active');

        if (hasActiveAppointments || dayAppointments.length > 0) {
          days.push({
            date,
            jalaliDate: {
              year: persianDate.year,
              month: persianDate.month - 1,
              day: persianDate.day,
              monthName: persianDate.monthName,
            },
            isToday,
            isPast,
            isWeekend,
            appointments: dayAppointments,
            hasAppointments: dayAppointments.length > 0,
          });
        }
      });
      
      setCalendarDays(days);
    };

    generateCalendar();
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter(app => {
      if (filters.status !== 'all' && app.status !== filters.status) {
        return false;
      }
      
      if (filters.service !== 'all' && !app.services?.includes(filters.service)) {
        return false;
      }
      
      return true;
    });
  }, [appointments, filters.status, filters.service]);

  const handleCancelAppointment = useCallback((id: number) => {
    setAppointments(prev => 
      prev.map(app => 
        app.id === id ? { ...app, status: 'cancelled' as const } : app
      )
    );
  }, []);

  const handleSendBulkSms = useCallback(async (message: string, appointmentIds: number[]) => {
    try {
      console.log("Sending bulk SMS:", { appointmentIds, message });
      
      const response = await fetch('/api/bulk-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentIds,
          message,
        }),
      });

      const result = await response.json();
      console.log("Bulk SMS response:", result);

      if (response.ok) {
        if (result.success) {
          toast.success(result.message || `پیام با موفقیت برای ${appointmentIds.length} نفر ارسال شد`);
          setUserSmsBalance(result.newBalance || (prev => prev - appointmentIds.length));
          
          // رفرش نوبت‌ها
          await fetchAppointments();
          // رفرش موجودی
          await fetchUserSmsBalance();
          
          return result;
        } else {
          toast.error(result.message || "خطا در ارسال پیام همگانی");
          throw new Error(result.message);
        }
      } else {
        toast.error(result.message || "خطا در ارسال پیام همگانی");
        // اگر موجودی کافی نبود، موجودی را رفرش کن
        if (response.status === 402) {
          await fetchUserSmsBalance();
        }
        throw new Error(result.message || "خطا در ارسال");
      }
    } catch (error: any) {
      console.error("Error sending bulk SMS:", error);
      toast.error(error.message || "خطا در ارتباط با سرور");
      throw error;
    }
  }, [fetchAppointments, fetchUserSmsBalance]);

  const getDayName = useCallback((date: Date) => {
    const persianDate = gregorianToPersian(date);
    return persianDate.weekDay;
  }, []);

  const handleBulkSmsClick = useCallback((date: Date, dayAppointments: Appointment[]) => {
    const activeAppointments = dayAppointments.filter(app => app.status === 'active');
    if (activeAppointments.length === 0) {
      toast.error("برای این روز هیچ نوبت فعالی وجود ندارد");
      return;
    }
    setSelectedDayForSms(date);
    setShowBulkSmsModal(true);
  }, []);

  const handleAddAppointment = useCallback((date: Date) => {
    const persianDate = gregorianToPersian(date);
    const jalaliDateStr = `${persianDate.year}/${persianDate.month}/${persianDate.day}`;
    router.push(`/clientdashboard/bookingsubmit?date=${encodeURIComponent(jalaliDateStr)}`);
  }, [router]);

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
        }}
      />
      
      <div className="min-h-screen bg-linear-to-br from-[#1a1e26] to-[#242933] text-white pb-32">
        <div className="sticky top-0 z-50 bg-linear-to-b from-[#1a1e26]/90 to-transparent backdrop-blur-xl border-b border-emerald-500/30">
          <div className="max-w-2xl mx-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <Calendar className="w-7 h-7 text-emerald-400" />
                تقویم نوبت‌ها
              </h1>
              
      <div className="flex items-center gap-2">
  <div className="text-xs text-gray-400 bg-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
    <MessageSquare className="w-3 h-3" />
    موجودی: {isLoadingBalance ? '...' : `${userSmsBalance} پیامک`}
  </div>
  <button
    onClick={() => {
      fetchAppointments();
      fetchUserSmsBalance(); // موجودی را هم رفرش کن
    }}
    disabled={isLoading}
    className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition disabled:opacity-50"
  >
    <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
  </button>
</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowFilterModal(true)}
                className="flex items-center justify-between bg-white/10 rounded-xl px-4 py-3.5 border border-white/10 hover:border-emerald-500/50 transition-all"
              >
                <span className="text-sm font-medium">
                  {filters.status === 'all' ? 'همه وضعیت‌ها' : 
                   filters.status === 'active' ? 'فقط فعال' :
                   filters.status === 'cancelled' ? 'کنسل شده‌ها' : 'انجام شده‌ها'}
                </span>
                <Filter className="w-5 h-5 text-emerald-400" />
              </button>
              
              <button
                onClick={() => router.push('/clientdashboard/bookingsubmit')}
                className="flex items-center justify-center gap-2 bg-linear-to-r from-emerald-500 to-emerald-600 rounded-xl px-4 py-3.5 font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg"
              >
                <Plus className="w-5 h-5" />
                نوبت جدید
              </button>
            </div>
            
            {filters.status !== 'all' && (
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-gray-400">
                  {filteredAppointments.length} نوبت یافت شد
                </span>
                <button
                  onClick={() => setFilters({ ...filters, status: 'all' })}
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  حذف فیلتر
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-white/5 rounded-2xl border border-white/10 p-5 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-white/10"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-white/10 rounded w-24"></div>
                      <div className="h-3 bg-white/10 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="h-10 bg-white/10 rounded-xl w-32"></div>
                </div>
                <div className="h-20 bg-white/10 rounded-xl"></div>
              </div>
            ))
          ) : calendarDays.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-400 mb-2">هیچ نوبتی یافت نشد</h3>
              <p className="text-gray-500 text-sm mb-6">
                می‌توانید اولین نوبت را ثبت کنید
              </p>
              <button
                onClick={() => router.push('/clientdashboard/bookingsubmit')}
                className="bg-linear-to-r from-emerald-500 to-emerald-600 rounded-xl px-6 py-3 font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                ثبت اولین نوبت
              </button>
            </div>
          ) : (
            calendarDays.map((day, index) => {
              const activeAppointmentsCount = day.appointments.filter(app => app.status === 'active').length;
              
              return (
                <div
                  key={index}
                  className={`bg-white/5 backdrop-blur-sm rounded-2xl border p-5 transition-all duration-300 ${
                    day.isToday
                      ? 'border-emerald-500/60 bg-emerald-500/5'
                      : day.isWeekend
                      ? 'border-red-500/30 bg-red-500/5'
                      : 'border-emerald-500/20 hover:border-emerald-400/60 hover:bg-white/8'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center text-white font-bold shadow-xl ${
                        day.isToday
                          ? 'bg-linear-to-br from-emerald-500 to-emerald-600'
                          : day.isWeekend
                          ? 'bg-linear-to-br from-red-500 to-red-600'
                          : 'bg-linear-to-br from-blue-500 to-blue-600'
                      }`}>
                        <span className="text-2xl">{day.jalaliDate.day}</span>
                        <span className="text-xs opacity-90">{day.jalaliDate.monthName}</span>
                      </div>
                      <div className="text-right">
                        <h3 className="text-lg font-bold">
                          {getDayName(day.date)}
                          {day.isToday && (
                            <span className="text-xs text-emerald-400 mr-2">(امروز)</span>
                          )}
                        </h3>
                        {day.isWeekend && (
                          <p className="text-xs text-red-400 mt-1">تعطیل</p>
                        )}
                        <p className="text-sm text-gray-400 mt-1">
                          {activeAppointmentsCount} نوبت فعال
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleAddAppointment(day.date)}
                     disabled={day.isPast}

                        className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                          day.isPast
                            ? "bg-gray-700/50 text-gray-500 cursor-not-allowed"
                            : "bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 active:scale-95"
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                        نوبت جدید
                      </button>
                      
                      {activeAppointmentsCount > 0 && !day.isPast && (
                        <button
                          onClick={() => handleBulkSmsClick(day.date, day.appointments)}
                          className="px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all bg-purple-600 hover:bg-purple-700 active:scale-95"
                        >
                          <MessageSquare className="w-4 h-4" />
                          پیام همگانی
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-2">
                    {day.isPast ? (
                      <p className="text-center text-gray-400 text-sm py-4">
                        ⚠️ تاریخ گذشته - امکان ثبت نوبت وجود ندارد
                      </p>
                    ): day.appointments.length > 0 ? (
                      <div className="space-y-2">
                        {day.appointments.map((app) => (
                          <div
                            key={app.id}
                            onClick={() => setSelectedAppointment(app)}
                            className={`bg-white/10 rounded-xl p-4 cursor-pointer transition-all duration-300 border hover:border-emerald-500/40 group ${
                              app.status === 'cancelled' 
                                ? 'border-red-500/30 opacity-60' 
                                : app.status === 'done'
                                ? 'border-blue-500/30'
                                : 'border-white/10 hover:bg-white/20'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${
                                  app.status === 'active' ? 'bg-emerald-500/20' :
                                  app.status === 'cancelled' ? 'bg-red-500/20' :
                                  'bg-blue-500/20'
                                }`}>
                                  <Clock className={`w-4 h-4 ${
                                    app.status === 'active' ? 'text-emerald-400' :
                                    app.status === 'cancelled' ? 'text-red-400' :
                                    'text-blue-400'
                                  }`} />
                                </div>
                                <div>
                                  <span className="text-sm font-semibold text-white block">
                                    {formatTimeDisplay(app.booking_time)}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {app.services?.split(',')[0] || 'بدون خدمات'}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="text-left">
                                <p className="text-white font-medium text-sm">
                                  {app.client_name}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                    app.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' :
                                    app.status === 'cancelled' ? 'bg-red-500/20 text-red-300' :
                                    'bg-blue-500/20 text-blue-300'
                                  }`}>
                                    {app.status === 'active' ? 'فعال' : 
                                     app.status === 'cancelled' ? 'کنسل شده' : 'انجام شده'}
                                  </span>
                                  <MoreVertical className="w-4 h-4 text-gray-500 group-hover:text-gray-300" />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-400 text-sm py-6">
                        هنوز نوبتی ثبت نشده است
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <Footer />

      {selectedAppointment && (
        <AppointmentDetailModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onCancel={handleCancelAppointment}
        />
      )}

      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        setFilters={setFilters}
        services={dynamicServices.slice(1)}
      />

      {selectedDayForSms && (
        <BulkSmsModal
          isOpen={showBulkSmsModal}
          onClose={() => {
            setShowBulkSmsModal(false);
            setSelectedDayForSms(null);
          }}
          date={selectedDayForSms}
          appointments={calendarDays.find(day => 
            day.date.toDateString() === selectedDayForSms.toDateString()
          )?.appointments || []}
          userSmsBalance={userSmsBalance}
          onSend={handleSendBulkSms}
        />
      )}
    </div>
  );
}