"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import {
  AlertCircle,
  Calendar,
  Check,
  ChevronLeft,
  PhoneCall,
  X,
  Link as LinkIcon,
  Copy,
  Share2,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import Footer from "../components/Footer/Footer";
import { getTodayJalali, jalaliToGregorian } from "@/lib/date-utils";
import { useServices } from "@/hooks/useServices";
import { useCreateBooking, useBookingLink } from "@/hooks/useBookings";
import { useCheckCustomer } from "@/hooks/useCustomers";

import ClientInfoSection from "./components/ClientInfoSection";
import DateTimeSection from "./components/DateTimeSection";
import ServicesSection from "./components/ServicesSection";
import NotesSection from "./components/NotesSection";
import SmsReservationSection from "./components/SmsReservationSection";
import SmsReminderSection from "./components/SmsReminderSection";
import SmsBalanceSection from "./components/SmsBalanceSection";
import JalaliCalendarModal from "./components/JalaliCalendarModal";
import TimePickerModal from "./components/TimePickerModal";
import MessageTemplateModal from "./components/MessageTemplateModal";
import NameChangeConfirmationModal from "./components/NameChangeConfirmationModal";
import ServicesModal from "./components/ServicesModal";

import type { Service } from "./types";
import { useAuth } from "@/hooks/useAuth";
import { useSmsBalance } from "@/hooks/useSmsBalance";
import { sendSingleSms } from "@/lib/sms-client";
import { useSmsTemplates } from "@/hooks/useSmsTemplates";

const STORAGE_KEY = "booking_form_draft";

const formatJalaliDate = (
  year: number,
  month: number,
  day: number | null
): string => {
  if (!day) return "انتخاب تاریخ";
  return `${day} ${month + 1} ${year}`;
};

// کامپوننت موفقیت ثبت نوبت با لینک مشتری
function SuccessBookingToast({ 
  onClose, 
  name, 
  jalaliDateStr, 
  selectedTime, 
  customerToken, 
  router 
}: { 
  onClose: () => void; 
  name: string; 
  jalaliDateStr: string; 
  selectedTime: string;
  customerToken: string;
  router: any;
}) {
  const { copyBookingLink, shareBookingLink, getBookingLink } = useBookingLink();
  const bookingLink = getBookingLink(customerToken);

  const handleCopyLink = async () => {
    const result = await copyBookingLink(customerToken);
    if (result.success) {
      toast.success("لینک کپی شد!");
    } else {
      toast.error("خطا در کپی لینک");
    }
  };

  const handleShareLink = async () => {
    const result = await shareBookingLink(customerToken, name);
    if (!result.success && result.error?.name !== 'AbortError') {
      handleCopyLink();
    }
  };

  return (
    <div className="bg-[#1a1e26] border border-emerald-500/30 rounded-xl p-4 shadow-lg w-[90%] md:w-md">
      <div className="flex items-center gap-2 mb-3">
        <Check className="w-5 h-5 text-emerald-400" />
        <p className="text-white font-bold">نوبت با موفقیت ثبت شد!</p>
      </div>
      
      <div className="space-y-2 text-sm text-gray-300 mb-4">
        <div className="flex justify-between">
          <span>مشتری:</span>
          <span className="text-white">{name.trim()}</span>
        </div>
        <div className="flex justify-between">
          <span>تاریخ و زمان:</span>
          <span className="text-white">{jalaliDateStr} - {selectedTime}</span>
        </div>
        
        {/* بخش لینک مشتری */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <LinkIcon className="w-4 h-4 text-emerald-400" />
            <p className="text-emerald-300 font-medium">لینک مدیریت نوبت مشتری:</p>
          </div>
          
          <div className="bg-white/5 rounded-lg p-3 mb-3">
            <p className="text-xs text-gray-400 break-all truncate" title={bookingLink}>
              {bookingLink}
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleCopyLink}
              className="flex-1 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-sm flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" />
              کپی لینک
            </button>
            <button
              onClick={handleShareLink}
              className="flex-1 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg text-sm flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              اشتراک‌گذاری
            </button>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <button
          onClick={onClose}
          className="w-full py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-sm transition-colors"
        >
          مشاهده در تقویم
        </button>
        <button
          onClick={() => {
            onClose();
            router.push("/clientdashboard/calendar");
          }}
          className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors"
        >
          ثبت نوبت جدید
        </button>
      </div>
    </div>
  );
}

export default function NewAppointmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const todayJalali = useMemo(() => getTodayJalali(), []);

  const { data: servicesData } = useServices();
  const { mutate: createBooking, isPending: isSubmitting } = useCreateBooking();
  const { mutate: checkCustomer, data: checkData } = useCheckCustomer();
  const { balance: userSmsBalance, isLoading: isLoadingBalance } =
    useSmsBalance();
  const { generateSmsWithLink } = useBookingLink();

  // دریافت تمپلیت‌های پیامک به صورت دایمانیک
  const {
    data: templatesData,
    isLoading: isLoadingTemplates,
    isError: isTemplatesError,
  } = useSmsTemplates();

  const smsTemplates = templatesData?.templates || [];

  const getInitialDate = () => {
    const dateParam = searchParams.get("date");
    if (dateParam) {
      try {
        const parts = dateParam.split("/").map(Number);
        if (parts.length === 3) {
          return { year: parts[0], month: parts[1] - 1, day: parts[2] };
        }
      } catch (error) {
        console.error("Error parsing date from URL:", error);
      }
    }
    return {
      year: todayJalali.year,
      month: todayJalali.month,
      day: todayJalali.day,
    };
  };

  const loadSavedForm = () => {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("خطا در بارگذاری فرم ذخیره‌شده:", e);
      return null;
    }
  };

  const savedForm = loadSavedForm();

  const [name, setName] = useState(savedForm?.name || "");
  const [phone, setPhone] = useState(savedForm?.phone || "");
  const [selectedDate, setSelectedDate] = useState(
    savedForm?.selectedDate || getInitialDate()
  );
  const [selectedTime, setSelectedTime] = useState(
    savedForm?.selectedTime || ""
  );
  const [selectedServices, setSelectedServices] = useState<Service[]>(
    savedForm?.selectedServices || []
  );
  const [notes, setNotes] = useState(savedForm?.notes || "");
  const [sendReservationSms, setSendReservationSms] = useState(
    savedForm?.sendReservationSms ?? true
  );
  const [sendReminderSms, setSendReminderSms] = useState(
    savedForm?.sendReminderSms ?? true
  );
  const [reservationMessage, setReservationMessage] = useState(
    savedForm?.reservationMessage || ""
  );
  const [reminderMessage, setReminderMessage] = useState(
    savedForm?.reminderMessage || ""
  );
  const [reminderTime, setReminderTime] = useState(
    savedForm?.reminderTime || 24
  );

  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [isServicesModalOpen, setIsServicesModalOpen] = useState(false);
  const [showNameChangeModal, setShowNameChangeModal] = useState(false);
  const [pendingNameChange, setPendingNameChange] = useState<{
    oldName: string;
    newName: string;
  } | null>(null);

  const { userId, isLoading: isAuthLoading, isAuthenticated } = useAuth();

  // ذخیره موقت فرم در localStorage
  useEffect(() => {
    const formData = {
      name,
      phone,
      selectedDate,
      selectedTime,
      selectedServices,
      notes,
      sendReservationSms,
      sendReminderSms,
      reservationMessage,
      reminderMessage,
      reminderTime,
    };

    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }, 400);

    return () => clearTimeout(timer);
  }, [
    name,
    phone,
    selectedDate,
    selectedTime,
    selectedServices,
    notes,
    sendReservationSms,
    sendReminderSms,
    reservationMessage,
    reminderMessage,
    reminderTime,
  ]);

  // مقداردهی اولیه پیام‌ها از تمپلیت‌های پیش‌فرض دیتابیس
  useEffect(() => {
    if (isLoadingTemplates || !smsTemplates.length) return;

    if (!reservationMessage) {
      const reserveDefault = smsTemplates.find(
        (t) =>
          t.payamresan_id === "gyx3qp1fh9r0y5w" ||
          t.title.toLowerCase().includes("رزرو")
      );
      if (reserveDefault) setReservationMessage(reserveDefault.content);
    }

    if (!reminderMessage) {
      const reminderDefault = smsTemplates.find(
        (t) =>
          t.payamresan_id === "cl6lfpotqzrcusk" ||
          t.title.toLowerCase().includes("یادآوری")
      );
      if (reminderDefault) setReminderMessage(reminderDefault.content);
    }
  }, [smsTemplates, isLoadingTemplates, reservationMessage, reminderMessage]);

  const calculateSmsNeeded = useMemo(() => {
    const reservationSms = sendReservationSms ? 1 : 0;
    const reminderSms = sendReminderSms ? 1 : 0;
    return reservationSms + reminderSms;
  }, [sendReservationSms, sendReminderSms]);

  const calculateTotalDuration = useMemo(() => {
    if (selectedServices.length === 0) return 30;
    return selectedServices.reduce(
      (total, service) => total + (service.duration_minutes || 30),
      0
    );
  }, [selectedServices]);

  const services = useMemo(() => {
    if (!servicesData?.services) return [];
    return servicesData.services.filter(
      (service: Service) => service.is_active
    );
  }, [servicesData]);

  const existingClient = useMemo(() => {
    if (!checkData) return null;
    if (checkData.exists && checkData.client) {
      return {
        exists: true,
        name: checkData.client.name,
        totalBookings: checkData.client.totalBookings,
        lastBookingDate: checkData.client.lastBookingDate,
        isBlocked: checkData.client.isBlocked,
      };
    }
    return null;
  }, [checkData]);

  // چک کردن وجود مشتری با تغییر شماره
  useEffect(() => {
    const cleanedPhone = phone.replace(/\D/g, "");
    if (cleanedPhone.length >= 10) {
      const timer = setTimeout(() => {
        checkCustomer(phone);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [phone, checkCustomer]);

  // تشخیص تغییر نام مشتری موجود
  useEffect(() => {
    if (
      existingClient?.name &&
      name &&
      existingClient.name.trim() !== name.trim()
    ) {
      setPendingNameChange({
        oldName: existingClient.name,
        newName: name,
      });
      setShowNameChangeModal(true);
    }
  }, [existingClient, name]);

  const checkTimeAvailability = async (): Promise<boolean> => {
    if (!selectedDate.day || !selectedTime) return true;

    try {
      const bookingDate = jalaliToGregorian(
        selectedDate.year,
        selectedDate.month,
        selectedDate.day
      );

      const response = await fetch(
        `/api/client/available-times?date=${bookingDate}&duration=${calculateTotalDuration}`
      );

      if (!response.ok) return true;

      const data = await response.json();

      if (data.success && data.availableTimes) {
        const isAvailable = data.availableTimes.includes(selectedTime);
        if (!isAvailable) {
          toast.error(
            "این زمان دیگر آزاد نیست. لطفاً زمان یا تاریخ دیگری انتخاب کنید."
          );
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error("Error checking time availability:", error);
      return true;
    }
  };

  const handleSubmitBooking = async () => {
    // ۱. اعتبارسنجی فیلدهای ضروری
    if (!name.trim()) return toast.error("لطفا نام مشتری را وارد کنید");
    if (!phone.trim()) return toast.error("لطفا شماره تلفن را وارد کنید");

    const cleanedPhone = phone.replace(/\D/g, "");
    if (cleanedPhone.length < 10 || cleanedPhone.length > 12)
      return toast.error("شماره تلفن معتبر نیست");

    if (!selectedDate.day) return toast.error("لطفا تاریخ را انتخاب کنید");
    if (!selectedTime) return toast.error("لطفا زمان را انتخاب کنید");

    const bookingDate = jalaliToGregorian(
      selectedDate.year,
      selectedDate.month,
      selectedDate.day
    );

    // ۲. بررسی پیامک و موجودی
    if (sendReservationSms && !reservationMessage.trim())
      return toast.error("لطفا پیام تأیید رزرو را وارد کنید");
    if (sendReminderSms && !reminderMessage.trim())
      return toast.error("لطفا پیام یادآوری را وارد کنید");

    if (calculateSmsNeeded > userSmsBalance)
      return toast.error(`موجودی پیامک کافی نیست. نیاز: ${calculateSmsNeeded}`);

    // ۳. بررسی تداخل زمانی (Race Condition)
    const isTimeAvailable = await checkTimeAvailability();
    if (!isTimeAvailable) return;

    // ۴. آماده‌سازی پیام‌ها و متغیرها
    const jalaliDateStr = formatJalaliDate(selectedDate.year, selectedDate.month, selectedDate.day);
    
    const replaceVars = (text: string) => 
      text.replace(/{client_name}/g, name.trim())
          .replace(/{date}/g, jalaliDateStr)
          .replace(/{time}/g, selectedTime)
          .replace(/{services}/g, selectedServices.map(s => s.name).join(", ") || "—");

    const finalReservationMsg = replaceVars(reservationMessage);
    const finalReminderMsg = replaceVars(reminderMessage);

    // پیدا کردن کدهای پترن داینامیک از دیتابیس (هوک useSmsTemplates)
    const reservePatternId = smsTemplates.find(t => t.type === "reserve" || t.title.includes("رزرو"))?.payamresan_id;
    const reminderPatternId = smsTemplates.find(t => t.type === "reminder" || t.title.includes("یادآوری"))?.payamresan_id;

    const bookingData = {
      client_name: name.trim(),
      client_phone: cleanedPhone,
      booking_date: bookingDate,
      booking_time: selectedTime,
      duration_minutes: calculateTotalDuration,
      booking_description: notes.trim(),
      services: selectedServices.map(s => s.name).join(", "),
      sms_reserve_enabled: sendReservationSms,
      sms_reserve_custom_text: sendReservationSms ? finalReservationMsg : null,
      sms_reminder_enabled: sendReminderSms,
      sms_reminder_custom_text: sendReminderSms ? finalReminderMsg : null,
      sms_reminder_hours_before: sendReminderSms ? reminderTime : null,
    };

    const loadingToastId = toast.loading("در حال ثبت نوبت...");

    // ۵. اجرای عملیات ثبت در دیتابیس
    createBooking(bookingData, {
      onSuccess: async (data) => {
        toast.dismiss(loadingToastId);

        // ۶. ارسال پیامک‌ها به صورت مستقل (Parallel)
        const smsTasks = [];

        if (sendReservationSms) {
          // افزودن لینک به پیامک تأیید رزرو
          const smsWithLink = generateSmsWithLink(data.customerToken, finalReservationMsg);
          
          smsTasks.push(
            sendSingleSms({
              to_phone: cleanedPhone,
              content: smsWithLink,
              sms_type: "reservation",
              booking_id: data.bookingId,
              use_template: true,
              template_key: reservePatternId,
            }).then(res => {
              if (!res.success) {
                toast.error("خطا در ارسال پیامک تایید");
                console.error("SMS Error:", res.error);
              }
            })
          );
        }

        if (sendReminderSms) {
          smsTasks.push(
            sendSingleSms({
              to_phone: cleanedPhone,
              content: finalReminderMsg,
              sms_type: "reminder",
              booking_id: data.bookingId,
              booking_date: bookingDate,
              booking_time: selectedTime,
              sms_reminder_hours_before: reminderTime,
              use_template: true,
              template_key: reminderPatternId,
            }).then(res => {
              if (!res.success) {
                toast.error("خطا در زمان‌بندی یادآوری");
                console.error("SMS Error:", res.error);
              }
            })
          );
        }

        // اجرای درخواست‌های پیامک بدون بلاک کردن UI
        Promise.allSettled(smsTasks).then(results => {
          const failedCount = results.filter(r => r.status === 'rejected').length;
          if (failedCount > 0) {
            console.warn(`${failedCount} پیامک با خطا مواجه شد`);
          }
        });

        // ۷. پاکسازی و نمایش موفقیت
        localStorage.removeItem(STORAGE_KEY);
        queryClient.invalidateQueries({
          predicate: (query) => ["customers", "bookings", "dashboard"].includes(query.queryKey[0] as string),
        });

        // نمایش موفقیت با لینک مشتری
        toast.custom(
          (t) => (
            <SuccessBookingToast
              onClose={() => toast.dismiss(t.id)}
              name={name.trim()}
              jalaliDateStr={jalaliDateStr}
              selectedTime={selectedTime}
              customerToken={data.customerToken}
              router={router}
            />
          ),
          { duration: 10000 }
        );
      },
      onError: (error: any) => {
        toast.dismiss(loadingToastId);
        
        if (error.message?.includes("این زمان قبلاً رزرو شده است")) {
          toast.error("این زمان قبلاً رزرو شده است. لطفاً زمان دیگری انتخاب کنید.");
        } else {
          toast.error(error.message || "خطا در ثبت نوبت");
        }
        
        console.error("Booking Error:", error);
      },
    });
  };

  return (
    <div className="min-h-screen text-white max-w-md mx-auto relative">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#1a1e26",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
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
              existingClient={existingClient}
              isCheckingClient={false}
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
              onRemoveService={(serviceId) =>
                setSelectedServices((prev) =>
                  prev.filter((s) => s.id !== serviceId)
                )
              }
            />

            <NotesSection notes={notes} setNotes={setNotes} />

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
              onBuySms={() => router.push("/clientdashboard/buysms")}
            />

            <button
              onClick={handleSubmitBooking}
              disabled={
                isSubmitting ||
                existingClient?.isBlocked ||
                (calculateSmsNeeded > 0 && calculateSmsNeeded > userSmsBalance)
              }
              className="w-full py-4 bg-linear-to-r from-emerald-500 to-emerald-600 rounded-xl font-bold text-lg shadow-lg hover:from-emerald-600 hover:to-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  در حال ثبت...
                </>
              ) : existingClient?.isBlocked ? (
                <>مشتری بلاک شده</>
              ) : calculateSmsNeeded > 0 &&
                calculateSmsNeeded > userSmsBalance ? (
                <>موجودی پیامک کافی نیست</>
              ) : (
                <>ثبت نوبت</>
              )}
            </button>

            <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <LinkIcon className="w-5 h-5 text-emerald-400" />
                <p className="font-bold text-emerald-300">سیستم لینک مشتری</p>
              </div>
              <p className="text-sm text-gray-300">
                پس از ثبت نوبت، لینک اختصاصی برای مشتری ایجاد می‌شود. 
                مشتری می‌تواند از طریق این لینک نوبت خود را مدیریت کند.
              </p>
            </div>

            <button
              onClick={() => window.open("tel:02112345678", "_blank")}
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
                <p className="text-sm text-gray-400">
                  کمک و راهنمایی نیاز داری؟
                </p>
              </div>
              <ChevronLeft className="w-6 h-6 text-gray-400" />
            </button>
          </div>
        </div>

        <Footer />
      </div>

      {/* مودال‌ها */}
      <NameChangeConfirmationModal
        isOpen={showNameChangeModal}
        onClose={() => setShowNameChangeModal(false)}
        oldName={pendingNameChange?.oldName || ""}
        newName={pendingNameChange?.newName || ""}
        onConfirm={() => {
          setShowNameChangeModal(false);
          setPendingNameChange(null);
          toast.success("نام مشتری به روز شد");
        }}
        onCancel={() => {
          if (pendingNameChange) setName(pendingNameChange.oldName);
          setShowNameChangeModal(false);
          setPendingNameChange(null);
          toast.success("از نام قبلی مشتری استفاده شد");
        }}
      />

      <MessageTemplateModal
        isOpen={isReservationModalOpen}
        onClose={() => setIsReservationModalOpen(false)}
        templates={smsTemplates}
        onSelect={setReservationMessage}
        title="انتخاب پیام تأیید رزرو"
        isLoading={isLoadingTemplates}
      />

      <MessageTemplateModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        templates={smsTemplates}
        onSelect={setReminderMessage}
        title="انتخاب پیام یادآوری"
        isLoading={isLoadingTemplates}
      />

      <ServicesModal
        isOpen={isServicesModalOpen}
        onClose={() => setIsServicesModalOpen(false)}
        selectedServices={selectedServices}
        setSelectedServices={setSelectedServices}
        allServices={services}
        isLoading={!servicesData}
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
        selectedServices={selectedServices}
      />
    </div>
  );
}