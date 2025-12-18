"use client";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import { Calendar, Check, ChevronLeft, PhoneCall, X } from "lucide-react";

import Footer from "../components/Footer/Footer";
import { getTodayJalali, jalaliToGregorian } from "@/lib/date-utils";

import { reservationTemplates, reminderTemplates } from "./data/messageTemplates";
import ClientInfoSection from "./components/ClientInfoSection";
import DateTimeSection from "./components/DateTimeSection";
import ServicesSection from "./components/ServicesSection";
import NotesSection from "./components/NotesSection";
import SmsReservationSection from "./components/SmsReservationSection";
import SmsReminderSection from "./components/SmsReminderSection";
import SmsBalanceSection from "./components/SmsBalanceSection";
import JalaliCalendarModal from "./components/JalaliCalendarModal";
import TimePickerModal from "./components/TimePickerModal";
import { Service } from "./types";
import MessageTemplateModal from "./components/MessageTemplateModal";
import NameChangeConfirmationModal from "./components/NameChangeConfirmationModal";
import ServicesModal from "./components/ServicesModal";

const formatJalaliDate = (year: number, month: number, day: number | null): string => {
  if (!day) return "انتخاب تاریخ";
  return `${day} ${month + 1} ${year}`;
};

export default function NewAppointmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const todayJalali = useMemo(() => getTodayJalali(), []);

  // دریافت تاریخ از URL
  const getInitialDate = () => {
    const dateParam = searchParams.get('date');
    if (dateParam) {
      try {
        const parts = dateParam.split('/').map(Number);
        if (parts.length === 3) {
          return {
            year: parts[0],
            month: parts[1] - 1,
            day: parts[2]
          };
        }
      } catch (error) {
        console.error("Error parsing date from URL:", error);
      }
    }
    return { year: todayJalali.year, month: todayJalali.month, day: todayJalali.day };
  };

  // State ها
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
const [selectedDate, setSelectedDate] = useState<{ 
  year: number; 
  month: number; 
  day: number | null 
}>(getInitialDate());
  const [selectedTime, setSelectedTime] = useState("");
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
  const [userSmsBalance, setUserSmsBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);

  // محاسبه تعداد پیامک‌های مورد نیاز
  const calculateSmsNeeded = useMemo(() => {
    const reservationSms = sendReservationSms ? 1 : 0;
    const reminderSms = sendReminderSms ? 1 : 0;
    return reservationSms + reminderSms;
  }, [sendReservationSms, sendReminderSms]);

  // تابع برای دریافت سرویس‌های کاربر
  const fetchUserServices = useCallback(async () => {
    try {
      setIsLoadingServices(true);
      const response = await fetch('/api/client/services');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
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
        const totalBalance = data.user?.total_sms_balance || 
                            (data.user?.sms_balance || 0) + 
                            (data.user?.purchased_sms_credit || 0);
        setUserSmsBalance(totalBalance);
        console.log("💰 موجودی دریافت شد:", totalBalance, data.user);
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

  // تابع چک کردن مشتری موجود
  const checkExistingClient = useCallback(async (phoneNumber: string, currentName: string) => {
    const cleanedPhone = phoneNumber.replace(/\D/g, '');
    if (cleanedPhone.length < 10) return;

    setIsCheckingClient(true);
    try {
      const response = await fetch(`/api/client/customers/checkcustomerexist?phone=${encodeURIComponent(cleanedPhone)}`);
      const data = await response.json();
      
      if (data.exists && data.client) {
        setExistingClient({
          exists: true,
          name: data.client.name,
          totalBookings: data.client.totalBookings,
          lastBookingDate: data.client.lastBookingDate,
          isBlocked: data.client.isBlocked
        });
        
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

  // تایمر برای چک کردن مشتری
  useEffect(() => {
    const cleanedPhone = phone.replace(/\D/g, '');
    if (cleanedPhone.length >= 10) {
      const timer = setTimeout(() => {
        checkExistingClient(phone, name);
      }, 800);
      
      return () => clearTimeout(timer);
    } else {
      setExistingClient(null);
    }
  }, [phone, name, checkExistingClient]);

  const handleNameChangeConfirm = () => {
    setShowNameChangeModal(false);
    setPendingNameChange(null);
    toast.success("نام مشتری به روز شد");
  };

  const handleNameChangeCancel = () => {
    if (pendingNameChange) {
      setName(pendingNameChange.oldName);
    }
    setShowNameChangeModal(false);
    setPendingNameChange(null);
    toast.success("از نام قبلی مشتری استفاده شد");
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

  // اعتبارسنجی موجودی پیامک
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

    if (existingClient?.isBlocked) {
      toast.error("این مشتری در لیست بلاک شده است. نمی‌توانید نوبت ثبت کنید.");
      return;
    }

    if (!validateMessages()) {
      return;
    }

    const smsNeeded = calculateSmsNeeded;
    if (smsNeeded > 0 && !validateSmsBalance()) {
      return;
    }

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

      const response = await fetch("/api/client/bookings", {
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
        }}
      />
      
      <div className="min-h-screen bg-linear-to-br from-[#1a1e26] to-[#242933] text-white pb-32">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-center mb-8 flex items-center justify-center gap-3">
            <Calendar className="w-7 h-7 text-emerald-400" />
            ثبت نوبت جدید
          </h1>

          <div className="space-y-5">
            <ClientInfoSection
              name={name}
              setName={setName}
              phone={phone}
              setPhone={setPhone}
              isCheckingClient={isCheckingClient}
              existingClient={existingClient}
            />

            <div className="h-px bg-white/10 rounded-full"></div>

            <DateTimeSection
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onOpenCalendar={() => setIsCalendarOpen(true)}
              onOpenTimePicker={() => setIsTimePickerOpen(true)}
            />

            <ServicesSection
              selectedServices={selectedServices}
              onOpenServicesModal={() => setIsServicesModalOpen(true)}
              onRemoveService={(serviceId) => setSelectedServices(prev => prev.filter(s => s.id !== serviceId))}
            />

            <NotesSection
              notes={notes}
              setNotes={setNotes}
            />

            <SmsReservationSection
              sendReservationSms={sendReservationSms}
              setSendReservationSms={setSendReservationSms}
              reservationMessage={reservationMessage}
              setReservationMessage={setReservationMessage}
              onOpenTemplateModal={() => setIsReservationModalOpen(true)}
            />

            <SmsReminderSection
              sendReminderSms={sendReminderSms}
              setSendReminderSms={setSendReminderSms}
              reminderTime={reminderTime}
              setReminderTime={setReminderTime}
              reminderMessage={reminderMessage}
              setReminderMessage={setReminderMessage}
              onOpenTemplateModal={() => setIsReminderModalOpen(true)}
            />

            <SmsBalanceSection
              userSmsBalance={userSmsBalance}
              isLoadingBalance={isLoadingBalance}
              sendReservationSms={sendReservationSms}
              sendReminderSms={sendReminderSms}
              calculateSmsNeeded={calculateSmsNeeded}
              onBuySms={() => router.push('/clientdashboard/buysms')}
            />

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