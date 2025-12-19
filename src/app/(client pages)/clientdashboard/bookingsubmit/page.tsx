// src/app/(client pages)/clientdashboard/bookingsubmit/page.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import { Calendar, Check, ChevronLeft, PhoneCall, X } from "lucide-react";

import Footer from "../components/Footer/Footer";
import { getTodayJalali, jalaliToGregorian } from "@/lib/date-utils";
import { useServices } from "@/hooks/useServices";
import { useCreateBooking } from "@/hooks/useBookings";
import { useCheckCustomer } from "@/hooks/useCustomers";
import { useSmsBalance } from "@/hooks/useDashboard";

import {
  reservationTemplates,
  reminderTemplates,
} from "./data/messageTemplates";
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

const STORAGE_KEY = "booking_form_draft"; // کلید ثابت برای ذخیره موقت

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
  const todayJalali = useMemo(() => getTodayJalali(), []);

  // هوک‌های React Query
  const { data: servicesData } = useServices();
  const { mutate: createBooking, isPending: isSubmitting } = useCreateBooking();
  const { mutate: checkCustomer, data: checkData } = useCheckCustomer();
  const { balance: userSmsBalance, isLoading: isLoadingBalance } =
    useSmsBalance();

  // دریافت تاریخ اولیه از URL یا امروز
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

  // بارگذاری فرم ذخیره‌شده از localStorage (فقط در Client)
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

  // Stateها با مقدار اولیه از localStorage یا پیش‌فرض
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

  // ذخیره خودکار فرم در localStorage با debounce
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
    }, 400); // 400ms debounce برای عملکرد بهتر

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

  // محاسبه تعداد پیامک‌های مورد نیاز
  const calculateSmsNeeded = useMemo(() => {
    const reservationSms = sendReservationSms ? 1 : 0;
    const reminderSms = sendReminderSms ? 1 : 0;
    return reservationSms + reminderSms;
  }, [sendReservationSms, sendReminderSms]);

  // سرویس‌های فعال
  const services = useMemo(() => {
    if (!servicesData?.services) return [];
    return servicesData.services.filter(
      (service: Service) => service.is_active
    );
  }, [servicesData]);

  // اطلاعات مشتری موجود
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

  // چک کردن مشتری با debounce
  useEffect(() => {
    const cleanedPhone = phone.replace(/\D/g, "");
    if (cleanedPhone.length >= 10) {
      const timer = setTimeout(() => {
        checkCustomer(phone);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [phone, checkCustomer]);

  // بررسی تغییر نام
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

  const handleSubmitBooking = () => {
    // اعتبارسنجی‌ها
    if (!name.trim()) return toast.error("لطفا نام مشتری را وارد کنید");
    if (!phone.trim()) return toast.error("لطفا شماره تلفن را وارد کنید");

    const cleanedPhone = phone.replace(/\D/g, "");
    if (cleanedPhone.length < 10 || cleanedPhone.length > 12)
      return toast.error("شماره تلفن معتبر نیست");

    if (!selectedDate.day) return toast.error("لطفا تاریخ را انتخاب کنید");

    const bookingDate = jalaliToGregorian(
      selectedDate.year,
      selectedDate.month,
      selectedDate.day
    );

    const today = new Date().toISOString().split("T")[0];
    if (bookingDate < today)
      return toast.error("تاریخ نمی‌تواند در گذشته باشد");

    if (existingClient?.isBlocked)
      return toast.error("این مشتری در لیست بلاک شده است");

    if (
      sendReservationSms &&
      (!reservationMessage.trim() || reservationMessage.trim().length < 10)
    )
      return toast.error("پیام تأیید رزرو باید حداقل ۱۰ کاراکتر باشد");

    if (
      sendReminderSms &&
      (!reminderMessage.trim() || reminderMessage.trim().length < 10)
    )
      return toast.error("پیام یادآوری باید حداقل ۱۰ کاراکتر باشد");

    if (calculateSmsNeeded > 0 && calculateSmsNeeded > userSmsBalance)
      return toast.error(
        `موجودی پیامک کافی نیست. نیاز: ${calculateSmsNeeded} پیامک`
      );

    // فرمت پیام‌ها
    const jalaliDateStr = formatJalaliDate(
      selectedDate.year,
      selectedDate.month,
      selectedDate.day
    );

    const finalReservationMessage = reservationMessage
      .replace(/{client_name}/g, name.trim())
      .replace(/{date}/g, jalaliDateStr)
      .replace(/{time}/g, selectedTime)
      .replace(/{services}/g, selectedServices.map((s) => s.name).join(", "));

    const finalReminderMessage = reminderMessage
      .replace(/{client_name}/g, name.trim())
      .replace(/{time}/g, selectedTime);

    const bookingData = {
      client_name: name.trim(),
      client_phone: cleanedPhone,
      booking_date: bookingDate,
      booking_time: selectedTime,
      booking_description: notes.trim(),
      services: selectedServices.map((s) => s.name).join(", "),
      sms_reserve_enabled: sendReservationSms,
      sms_reserve_custom_text: finalReservationMessage,
      sms_reminder_enabled: sendReminderSms,
      sms_reminder_custom_text: finalReminderMessage,
      sms_reminder_hours_before: reminderTime,
    };

    createBooking(bookingData, {
      onSuccess: () => {
        toast.success(
          `نوبت با موفقیت ثبت شد! ${
            calculateSmsNeeded > 0
              ? `(${calculateSmsNeeded} پیامک ارسال شد)`
              : ""
          }`
        );

        // پاک کردن فرم و ذخیره موقت
        localStorage.removeItem(STORAGE_KEY);
        setName("");
        setPhone("");
        setSelectedDate(getInitialDate());
        setSelectedTime("");
        setSelectedServices([]);
        setNotes("");
        setReservationMessage("");
        setReminderMessage("");
        setReminderTime(24);
        setSendReservationSms(true);
        setSendReminderSms(true);

        setTimeout(() => {
          router.push("/clientdashboard/calendar");
        }, 2000);
      },
      onError: (error: any) => {
        toast.error(error.message || "خطا در ثبت نوبت");
      },
    });
  };

  return (
    <div className="h-screen text-white overflow-auto max-w-md mx-auto">
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
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  در حال ثبت...
                </>
              ) : existingClient?.isBlocked ? (
                <>
                  <X className="w-6 h-6" />
                  مشتری بلاک شده
                </>
              ) : calculateSmsNeeded > 0 &&
                calculateSmsNeeded > userSmsBalance ? (
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
      />
    </div>
  );
}
