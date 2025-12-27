"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import { Calendar, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import Footer from "../components/Footer/Footer";
import { getTodayJalali, jalaliToGregorian } from "@/lib/date-utils";
import { useServices } from "@/hooks/useServices";
import { useCreateBooking } from "@/hooks/useBookings";
import { useCheckCustomer } from "@/hooks/useCustomers";
import { useSmsBalance } from "@/hooks/useSmsBalance";
import { sendSingleSms } from "@/lib/sms-client";
import { useSmsTemplates } from "@/hooks/useSmsTemplates";

// Components
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
import ServicesModal from "./components/ServicesModal";
import { SuccessBookingToast } from "./components/SuccessBookingToast";

import type { Service } from "./types";

const STORAGE_KEY = "booking_form_draft";

/**
 * تابع فرمت‌دهی پیش‌نمایش پیامک با داده‌های تست
 */
const formatPreviewMessage = (text: string) => {
  if (!text) return "";
  return text
    .replace(/%name%/g, "مشتری عزیز")
    .replace(/%date%/g, "1404/02/21")
    .replace(/%time%/g, "21:00")
    .replace(/%services%/g, "اصلاح مو")
    .replace(/%link%/g, "ontimeapp.ir/fsdvf");
};

export default function NewAppointmentPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const today = useMemo(() => getTodayJalali(), []);

  const { data: servicesData } = useServices();
  const { mutate: createBooking, isPending: isSubmitting } = useCreateBooking();
  const { mutate: checkCustomer, data: checkData } = useCheckCustomer();
  const { balance: userSmsBalance, isLoading: isLoadingBalance } =
    useSmsBalance();
  const { data: templatesData, isLoading: isLoadingTemplates } =
    useSmsTemplates();

  const getInitialState = () => {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  };

  const saved = getInitialState();
  const [form, setForm] = useState({
    name: saved?.name || "",
    phone: saved?.phone || "",
    date: saved?.date || {
      year: today.year,
      month: today.month,
      day: today.day,
    },
    time: saved?.time || "",
    services: (saved?.services as Service[]) || [],
    notes: saved?.notes || "",
    sendReserveSms: saved?.sendReserveSms ?? true,
    sendRemindSms: saved?.sendRemindSms ?? true,
    reserveMsg: saved?.reserveMsg || "",
    remindMsg: saved?.remindMsg || "",
    remindTime: saved?.remindTime || 24,
  });

  const [modals, setModals] = useState({
    calendar: false,
    time: false,
    services: false,
    reserve: false,
    remind: false,
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
  }, [form]);

  // مدیریت پترن رزرو و یادآوری اولیه
  useEffect(() => {
    if (isLoadingTemplates || !templatesData?.templates?.length) return;

    const resTpl = templatesData.templates.find(
      (t: any) => t.type === "reserve"
    );

    const targetSub = form.remindTime >= 24 ? "tomorrow" : "today";
    const remTpl = templatesData.templates.find(
      (t: any) => t.type === "reminder" && t.sub_type === targetSub
    );

    setForm((prev) => ({
      ...prev,
      reserveMsg: prev.reserveMsg || resTpl?.content || "",
      remindMsg: prev.remindMsg || remTpl?.content || "",
    }));
  }, [templatesData, isLoadingTemplates]);

  // تغییر خودکار یادآوری با تغییر زمان
  useEffect(() => {
    if (isLoadingTemplates || !templatesData?.templates?.length) return;

    const targetSub = form.remindTime >= 24 ? "tomorrow" : "today";
    const selectedTemplate = templatesData.templates.find(
      (t: any) => t.type === "reminder" && t.sub_type === targetSub
    );

    if (selectedTemplate) {
      setForm((prev) => ({
        ...prev,
        remindMsg: selectedTemplate.content,
      }));
    }
  }, [form.remindTime, templatesData, isLoadingTemplates]);

  const jalaliDateStr = `${form.date.year}/${form.date.month + 1}/${
    form.date.day
  }`;

  const totalDuration = useMemo(
    () =>
      form.services.reduce((acc, s) => acc + (s.duration_minutes || 30), 0) ||
      30,
    [form.services]
  );

  const smsNeededCount =
    (form.sendReserveSms ? 1 : 0) + (form.sendRemindSms ? 1 : 0);

  const updateForm = (updates: Partial<typeof form>) =>
    setForm((prev) => ({ ...prev, ...updates }));

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.date.day || !form.time)
      return toast.error("لطفاً تمام فیلدهای ضروری را تکمیل کنید");

    if (smsNeededCount > userSmsBalance)
      return toast.error("موجودی پیامک کافی نیست");

    const loadingId = toast.loading("در حال ثبت نوبت...");

    createBooking(
      {
        client_name: form.name.trim(),
        client_phone: form.phone.replace(/\D/g, ""),
        booking_date: jalaliToGregorian(
          form.date.year,
          form.date.month,
          form.date.day
        ),
        booking_time: form.time,
        duration_minutes: totalDuration,
        booking_description: form.notes.trim(),
        services: form.services.map((s) => s.name).join(", "),
        sms_reserve_enabled: form.sendReserveSms,
        sms_reminder_enabled: form.sendRemindSms,
        sms_reminder_hours_before: form.sendRemindSms ? form.remindTime : null,
      },
      {
        onSuccess: (data) => {
          toast.dismiss(loadingId);
          localStorage.removeItem(STORAGE_KEY);
          queryClient.invalidateQueries({ queryKey: ["bookings"] });

          if (form.sendReserveSms) {
            const template = templatesData?.templates.find(
              (t: any) => t.type === "reserve"
            );
            sendSingleSms({
              to_phone: form.phone.replace(/\D/g, ""),
              sms_type: "reservation",
              booking_id: data.bookingId,
              template_key: template?.payamresan_id,
              use_template: true,
              name: form.name.trim(),
              date: jalaliDateStr,
              time: form.time,
              service: form.services.map((s) => s.name).join(", ") || "خدمات",
              link: `ontimeapp.ir/${data.customerToken}`,
            });
          }

          if (form.sendRemindSms) {
            sendSingleSms({
              to_phone: form.phone.replace(/\D/g, ""),
              sms_type: "reminder",
              booking_id: data.bookingId,
              booking_date: jalaliToGregorian(
                form.date.year,
                form.date.month,
                form.date.day
              ),
              booking_time: form.time,
              sms_reminder_hours_before: form.remindTime,
              name: form.name.trim(),
              date: jalaliDateStr,
              time: form.time,
              service: form.services.map((s) => s.name).join(", ") || "خدمات",
              link: `ontimeapp.ir/${data.customerToken}`,
            });
          }

          toast.custom(
            (t) => (
              <SuccessBookingToast
                onClose={() => toast.dismiss(t.id)}
                name={form.name}
                jalaliDateStr={jalaliDateStr}
                selectedTime={form.time}
                customerToken={data.customerToken}
                router={router}
              />
            ),
            { duration: 10000 }
          );
        },
        onError: () => toast.error("خطا در ثبت نوبت", { id: loadingId }),
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#1a1e26] text-white pb-32">
      <Toaster position="top-center" />
      <div className="max-w-md mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-center mb-8 flex items-center justify-center gap-3">
          <Calendar className="w-7 h-7 text-emerald-400" /> ثبت نوبت جدید
        </h1>

        <div className="space-y-5">
          <ClientInfoSection
            name={form.name}
            setName={(v) => updateForm({ name: v })}
            phone={form.phone}
            setPhone={(v) => updateForm({ phone: v })}
            isCheckingClient={false}
            existingClient={checkData?.client}
          />
          <DateTimeSection
            selectedDate={form.date}
            selectedTime={form.time}
            onOpenCalendar={() => setModals((m) => ({ ...m, calendar: true }))}
            onOpenTimePicker={() => setModals((m) => ({ ...m, time: true }))}
          />
          <ServicesSection
            selectedServices={form.services}
            onOpenServicesModal={() =>
              setModals((m) => ({ ...m, services: true }))
            }
            onRemoveService={(id) =>
              updateForm({ services: form.services.filter((s) => s.id !== id) })
            }
          />
          <NotesSection
            notes={form.notes}
            setNotes={(v) => updateForm({ notes: v })}
          />

          <SmsReservationSection
            sendReservationSms={form.sendReserveSms}
            setSendReservationSms={(v) => updateForm({ sendReserveSms: v })}
            reservationMessage={form.reserveMsg}
            setReservationMessage={(v) => updateForm({ reserveMsg: v })}
            onOpenTemplateModal={() =>
              setModals((m) => ({ ...m, reserve: true }))
            }
            formatPreview={formatPreviewMessage}
          />

          <SmsReminderSection
            sendReminderSms={form.sendRemindSms}
            setSendReminderSms={(v) => updateForm({ sendRemindSms: v })}
            reminderTime={form.remindTime}
            setReminderTime={(v) => updateForm({ remindTime: v })}
            reminderMessage={form.remindMsg}
            setReminderMessage={(v) => updateForm({ remindMsg: v })}
            onOpenTemplateModal={() =>
              setModals((m) => ({ ...m, remind: true }))
            }
            formatPreview={formatPreviewMessage}
          />

          <SmsBalanceSection
            userSmsBalance={userSmsBalance}
            isLoadingBalance={isLoadingBalance}
            sendReservationSms={form.sendReserveSms}
            sendReminderSms={form.sendRemindSms}
            calculateSmsNeeded={smsNeededCount}
            onBuySms={() => router.push("/clientdashboard/buysms")}
          />

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || smsNeededCount > userSmsBalance}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-600 rounded-2xl font-bold flex justify-center items-center transition-all shadow-lg active:scale-95"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              "ثبت نوبت نهایی"
            )}
          </button>
        </div>
      </div>

      {/* Modals */}
      <MessageTemplateModal
         formatPreviewMessage={formatPreviewMessage}
        isOpen={modals.reserve}
        onClose={() => setModals((m) => ({ ...m, reserve: false }))}
        templates={
          templatesData?.templates?.filter((t: any) => t.type === "reserve") ||
          []
        }
        onSelect={(v) => updateForm({ reserveMsg: v })}
        title="انتخاب الگوی رزرو"
        isLoading={isLoadingTemplates}
      />


      <MessageTemplateModal
      formatPreviewMessage={formatPreviewMessage}
        isOpen={modals.remind}
        onClose={() => setModals((m) => ({ ...m, remind: false }))}
        templates={
          templatesData?.templates?.filter((t: any) => t.type === "reminder") ||
          []
        }
        onSelect={(v) => updateForm({ remindMsg: v })}
        title="انتخاب الگوی یادآوری"
        isLoading={isLoadingTemplates}
      />
      <ServicesModal
        isOpen={modals.services}
        onClose={() => setModals((m) => ({ ...m, services: false }))}
        selectedServices={form.services}
        setSelectedServices={(v) =>
          updateForm({
            services: typeof v === "function" ? v(form.services) : v,
          })
        }
        allServices={
          servicesData?.services?.filter((s: any) => s.is_active) || []
        }
        isLoading={!servicesData}
      />
      <JalaliCalendarModal
        selectedDate={form.date}
        setSelectedDate={(v: any) =>
          updateForm({ date: typeof v === "function" ? v(form.date) : v })
        }
        isCalendarOpen={modals.calendar}
        setIsCalendarOpen={(v) => setModals((m) => ({ ...m, calendar: v }))}
      />
      <TimePickerModal
        selectedDate={form.date}
        selectedTime={form.time}
        setSelectedTime={(v) => updateForm({ time: v })}
        isTimePickerOpen={modals.time}
        setIsTimePickerOpen={(v) => setModals((m) => ({ ...m, time: v }))}
        selectedServices={form.services}
      />
      <Footer />
    </div>
  );
}
