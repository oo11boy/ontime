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
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import Footer from "../components/Footer/Footer";
import { getTodayJalali, jalaliToGregorian } from "@/lib/date-utils";
import { useServices } from "@/hooks/useServices";
import { useCreateBooking } from "@/hooks/useBookings";
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

  // دریافت تمپلیت‌های پیامک به صورت داینامیک
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
          t.payamresan_id === "100" || t.title.toLowerCase().includes("رزرو")
      );
      if (reserveDefault) setReservationMessage(reserveDefault.content);
    }

    if (!reminderMessage) {
      const reminderDefault = smsTemplates.find(
        (t) =>
          t.payamresan_id === "101" || t.title.toLowerCase().includes("یادآوری")
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
    // اعتبارسنجی‌های اولیه
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

    const today = new Date().toISOString().split("T")[0];
    if (bookingDate < today)
      return toast.error("تاریخ نمی‌تواند در گذشته باشد");

    if (bookingDate === today) {
      const now = new Date();
      const [selectedHour, selectedMinute] = selectedTime
        .split(":")
        .map(Number);
      if (
        selectedHour < now.getHours() ||
        (selectedHour === now.getHours() && selectedMinute <= now.getMinutes())
      )
        return toast.error("زمان انتخاب‌شده در گذشته است");
    }

    if (existingClient?.isBlocked)
      return toast.error("این مشتری در لیست بلاک شده است");

    if (sendReservationSms && !reservationMessage.trim())
      return toast.error("لطفا پیام تأیید رزرو را وارد کنید");
    if (sendReminderSms && !reminderMessage.trim())
      return toast.error("لطفا پیام یادآوری را وارد کنید");

    if (calculateSmsNeeded > userSmsBalance)
      return toast.error(
        `موجودی پیامک کافی نیست. نیاز: ${calculateSmsNeeded}، موجودی: ${userSmsBalance}`
      );

    const isTimeAvailable = await checkTimeAvailability();
    if (!isTimeAvailable) return;

    // بررسی نهایی زمان (race condition)
    const finalCheckResponse = await fetch(
      `/api/client/available-times?date=${bookingDate}&duration=${calculateTotalDuration}&finalCheck=true`
    );

    if (finalCheckResponse.ok) {
      const finalData = await finalCheckResponse.json();
      if (
        finalData.success &&
        finalData.availableTimes &&
        !finalData.availableTimes.includes(selectedTime)
      ) {
        toast.error("این زمان هم‌اکنون رزرو شده است");
        return;
      }
    }

    const durationMinutes = calculateTotalDuration;
    const jalaliDateStr = formatJalaliDate(
      selectedDate.year,
      selectedDate.month,
      selectedDate.day
    );

    const finalReservationMessage = reservationMessage
      .replace(/{client_name}/g, name.trim())
      .replace(/{date}/g, jalaliDateStr)
      .replace(/{time}/g, selectedTime)
      .replace(
        /{services}/g,
        selectedServices.map((s) => s.name).join(", ") || "—"
      );

    const finalReminderMessage = reminderMessage
      .replace(/{client_name}/g, name.trim())
      .replace(/{date}/g, jalaliDateStr)
      .replace(/{time}/g, selectedTime)
      .replace(
        /{services}/g,
        selectedServices.map((s) => s.name).join(", ") || "—"
      );

    const bookingData = {
      client_name: name.trim(),
      client_phone: cleanedPhone,
      booking_date: bookingDate,
      booking_time: selectedTime,
      duration_minutes: durationMinutes,
      booking_description: notes.trim(),
      services: selectedServices.map((s) => s.name).join(", "),
      sms_reserve_enabled: sendReservationSms,
      sms_reserve_custom_text: sendReservationSms
        ? finalReservationMessage
        : null,
      sms_reminder_enabled: sendReminderSms,
      sms_reminder_custom_text: sendReminderSms ? finalReminderMessage : null,
      sms_reminder_hours_before: sendReminderSms ? reminderTime : null,
    };

    const loadingToastId = toast.loading("در حال ثبت نوبت...");

    createBooking(bookingData, {
      onSuccess: async (data) => {
        toast.dismiss(loadingToastId);

        if (sendReservationSms) {
          const res = await sendSingleSms({
            to_phone: cleanedPhone,
            content: finalReservationMessage,
            sms_type: "reservation",
            booking_id: data.bookingId,
          });

          if (!res.success) {
            toast.error(res.message || "ارسال پیامک تأیید ناموفق بود");
            return;
          }
        }

        if (sendReminderSms) {
          await sendSingleSms({
            to_phone: cleanedPhone,
            content: finalReminderMessage,
            sms_type: "reminder",
            booking_id: data.bookingId,
            booking_date: bookingDate,
            booking_time: selectedTime,
            sms_reminder_hours_before: reminderTime,
          });
        }

        localStorage.removeItem(STORAGE_KEY);
        queryClient.invalidateQueries({
          predicate: (query) =>
            ["customers", "bookings", "dashboard"].includes(
              query.queryKey[0] as string
            ),
        });

        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? "animate-enter" : "animate-leave"
              } bg-[#1a1e26] border border-emerald-500/30 rounded-xl p-4 shadow-lg m-auto w-[90%] md:w-md`}
            >
              <div className="flex items-center gap-2 mb-3">
                <Check className="w-5 h-5 text-emerald-400" />
                <p className="text-white font-bold">نوبت با موفقیت ثبت شد!</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">مشتری:</span>
                  <span className="text-white">{name.trim()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">تاریخ:</span>
                  <span className="text-white">{jalaliDateStr}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">زمان:</span>
                  <span className="text-white">{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">خدمات:</span>
                  <span className="text-white text-left">
                    {selectedServices.map((s) => s.name).join("، ")}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  router.push("/clientdashboard/calendar");
                }}
                className="w-full mt-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-sm transition-colors"
              >
                مشاهده در تقویم
              </button>
            </div>
          ),
          { duration: 60000 }
        );
      },
      onError: (error: any) => {
        toast.dismiss(loadingToastId);
        toast.error(error.message || "خطا در ثبت نوبت", { duration: 5000 });
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
                <>در حال ثبت...</>
              ) : existingClient?.isBlocked ? (
                <>مشتری بلاک شده</>
              ) : calculateSmsNeeded > 0 &&
                calculateSmsNeeded > userSmsBalance ? (
                <>موجودی پیامک کافی نیست</>
              ) : (
                <>ثبت نوبت</>
              )}
            </button>

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
