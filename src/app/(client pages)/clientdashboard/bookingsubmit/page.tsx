"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import { Calendar, UserX } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import Footer from "../components/Footer/Footer";
import { getTodayJalali, jalaliToGregorian } from "@/lib/date-utils";
import { useServices } from "@/hooks/useServices";
import { useCreateBooking } from "@/hooks/useBookings";
import { useCheckCustomer } from "@/hooks/useCustomers";
import { useSmsBalance } from "@/hooks/useSmsBalance";
import { useSmsTemplates } from "@/hooks/useSmsTemplates";

import ClientInfoSection from "./components/ClientInfoSection";
import DateTimeSection from "./components/DateTimeSection";
import ServicesSection from "./components/ServicesSection";
import NotesSection from "./components/NotesSection";
import SmsReservationSection from "./components/SmsReservationSection";
import SmsReminderSection from "./components/SmsReminderSection";
import SmsBalanceSection from "./components/SmsBalanceSection";
import ModalManager from "./components/ModalManager";
import SubmitButton from "./components/SubmitButton";
import UnblockCustomerModal from "./components/UnblockCustomerModal";

import type { Service } from "./types";

const STORAGE_KEY = "booking_form_draft";

const formatPreviewMessage = (text: string) =>
  text
    ? text
        .replace(/%name%/g, "مشتری عزیز")
        .replace(/%date%/g, "1404/02/21")
        .replace(/%time%/g, "21:00")
        .replace(/%services%/g, "اصلاح مو")
        .replace(/%link%/g, "ontimeapp.ir/fsdvf")
    : "";

export default function NewAppointmentPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const today = useMemo(() => getTodayJalali(), []);

  const { data: servicesData } = useServices();
  const { mutate: createBooking, isPending: isSubmitting } = useCreateBooking();
  const { balance: userSmsBalance, isLoading: isLoadingBalance } =
    useSmsBalance();
  const { data: templatesData, isLoading: isLoadingTemplates } =
    useSmsTemplates();

  const [form, setForm] = useState<any>(null);
  const [modals, setModals] = useState({
    calendar: false,
    time: false,
    services: false,
    reserve: false,
    remind: false,
    nameChange: false,
  });
  const [unblockModal, setUnblockModal] = useState({
    show: false,
    clientName: "",
    cancelledCount: 0,
  });
  const [isUnblocking, setIsUnblocking] = useState(false);
  const [checkedCustomerData, setCheckedCustomerData] = useState<any>(null);
  const [nameMismatchIgnored, setNameMismatchIgnored] = useState(false);
  const [nameModalShown, setNameModalShown] = useState(false);

  const { mutate: checkCustomer, isPending: isCheckingClient } =
    useCheckCustomer((data) => {
      setCheckedCustomerData(data);
      setNameMismatchIgnored(false);
      setNameModalShown(false);
    });

  // لود فرم از localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : {};
    setForm({
      name: parsed.name || "",
      phone: parsed.phone || "",
      date: parsed.date || {
        year: today.year,
        month: today.month,
        day: today.day,
      },
      time: parsed.time || "",
      services: parsed.services || [],
      notes: parsed.notes || "",
      sendReserveSms: parsed.sendReserveSms ?? true,
      sendRemindSms: parsed.sendRemindSms ?? true,
      reserveMsg: parsed.reserveMsg || "",
      remindMsg: parsed.remindMsg || "",
      remindTime: parsed.remindTime || 24,
    });
  }, [today]);

  // بررسی شماره تلفن
  useEffect(() => {
    const digits = form?.phone?.replace(/\D/g, "");
    if (digits?.length >= 10) checkCustomer(digits.slice(-10));
  }, [form?.phone, checkCustomer]);

  // چک تغییر نام فقط در onBlur
  const handleNameBlur = () => {
    if (!checkedCustomerData?.exists || !checkedCustomerData.client?.name)
      return;

    const dbName = checkedCustomerData.client.name.trim();
    const inputName = form.name.trim();

    if (!inputName && dbName) {
      updateForm({ name: dbName });
      return;
    }

    if (
      inputName &&
      dbName &&
      inputName.toLowerCase() !== dbName.toLowerCase() &&
      !nameMismatchIgnored &&
      !nameModalShown
    ) {
      setNameModalShown(true);
      setModals((prev) => ({ ...prev, nameChange: true }));
    }
  };

  const updateForm = (updates: Partial<typeof form>) =>
    setForm((prev: any) => ({ ...prev, ...updates }));

  const handleConfirmNameChange = async () => {
    const cleanPhone = form.phone.replace(/\D/g, "").slice(-10);
    try {
      const res = await fetch("/api/client/customers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone, newName: form.name.trim() }),
      });
      if (res.ok) {
        toast.success("نام مشتری به‌روزرسانی شد");
        setCheckedCustomerData((prev: any) => ({
          ...prev,
          client: { ...prev.client, name: form.name.trim() },
        }));
        setNameMismatchIgnored(true);
        setNameModalShown(false);
        setModals((prev) => ({ ...prev, nameChange: false }));
      } else toast.error("خطا در به‌روزرسانی نام");
    } catch {
      toast.error("خطا در ارتباط با سرور");
    }
  };

  const handleCancelNameChange = () => {
    const dbName = checkedCustomerData?.client?.name || "";
    updateForm({ name: dbName });
    setNameModalShown(false);
    setModals((prev) => ({ ...prev, nameChange: false }));
  };

  const openUnblockModal = () => {
    setUnblockModal({
      show: true,
      clientName: checkedCustomerData?.client?.client_name || form.name,
      cancelledCount: checkedCustomerData?.client?.cancelled_count || 0,
    });
  };

  const handleUnblockAndSubmit = async () => {
    if (isUnblocking) return;
    setIsUnblocking(true);

    const cleanPhone = form.phone.replace(/\D/g, "").slice(-10);
    try {
      const res = await fetch("/api/client/customers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone, is_blocked: 0 }),
      });

      if (res.ok) {
        toast.success("مشتری رفع مسدودیت شد");
        setCheckedCustomerData((prev: any) => ({
          ...prev,
          client: { ...prev.client, is_blocked: 0 },
        }));
        setUnblockModal({ show: false, clientName: "", cancelledCount: 0 });
        queryClient.invalidateQueries({ queryKey: ["customers"] });
        handleSubmit();
      } else toast.error("خطا در رفع مسدودیت");
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setIsUnblocking(false);
    }
  };

  const handleSubmit = async () => {
    const cleanPhone = form.phone.replace(/\D/g, "").slice(-10);
    if (!form.name.trim() || cleanPhone.length !== 10 || !form.time)
      return toast.error("اطلاعات ضروری را تکمیل کنید");

    const loadingId = toast.loading("در حال ثبت نوبت...");

    createBooking(
      {
        client_name: form.name.trim(),
        client_phone: cleanPhone,
        booking_date: jalaliToGregorian(
          form.date.year,
          form.date.month,
          form.date.day
        ),
        booking_time: form.time,
        duration_minutes:
          form.services.reduce(
            (acc: any, s: any) => acc + (s.duration_minutes || 30),
            0
          ) || 30,
        booking_description: form.notes.trim(),
        services: form.services.map((s: any) => s.name).join(", "),
        sms_reserve_enabled: form.sendReserveSms,
        sms_reminder_enabled: form.sendRemindSms,
        sms_reminder_hours_before: form.sendRemindSms ? form.remindTime : null,
      },
      {
        onSuccess: () => {
          toast.dismiss(loadingId);
          localStorage.removeItem(STORAGE_KEY);
          queryClient.invalidateQueries({
            queryKey: ["bookings", "customers"],
          });
          toast.success("نوبت با موفقیت ثبت شد");
          router.push("/clientdashboard/bookings");
        },
        onError: (error: any) => {
          toast.dismiss(loadingId);
          const data = error?.data || {};
          const status = error?.status;

          if (status === 403 && data.isBlocked) {
            setUnblockModal({
              show: true,
              clientName: data.clientName || form.name.trim(),
              cancelledCount: data.cancelledCount || 0,
            });
            return;
          }

          toast.error(data.message || "خطا در ثبت نوبت");
        },
      }
    );
  };

  // ذخیره فرم
  useEffect(() => {
    if (form) localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
  }, [form]);

  if (!form) return null;

  const smsNeeded =
    (form.sendReserveSms ? 1 : 0) + (form.sendRemindSms ? 1 : 0);
  const isBlocked = checkedCustomerData?.client?.is_blocked === 1;

  return (
    <div className="min-h-screen bg-[#1a1e26] text-white pb-32">
      <Toaster position="top-center" />

      <div className="max-w-md mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-center mb-8 flex items-center justify-center gap-3">
          <Calendar className="w-7 h-7 text-emerald-400" />
          ثبت نوبت جدید
        </h1>

        {isBlocked && (
          <div className="mb-8 p-6 bg-red-900/30 border-2 border-red-600 rounded-2xl flex flex-col items-center gap-4 animate-pulse">
            <div className="flex items-center gap-4">
              <UserX className="w-10 h-10 text-red-500" />
              <div className="text-center">
                <p className="text-xl font-bold text-red-400">
                  مشتری مسدود شده است!
                </p>
                <p className="text-sm text-red-300 mt-1">
                  {checkedCustomerData.client.client_name} به دلیل{" "}
                  <span className="font-bold text-red-400">
                    {checkedCustomerData.client.cancelled_count} بار لغو نوبت
                  </span>{" "}
                  در لیست سیاه است.
                </p>
              </div>
            </div>
            <button
              onClick={openUnblockModal}
              disabled={isUnblocking}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 rounded-xl font-bold transition-all active:scale-95"
            >
              {isUnblocking
                ? "در حال رفع مسدودیت..."
                : "رفع مسدودیت و ثبت نوبت"}
            </button>
          </div>
        )}

        <div className="space-y-5">
          <ClientInfoSection
            name={form.name}
            setName={(v) => updateForm({ name: v })}
            phone={form.phone}
            setPhone={(v) => updateForm({ phone: v })}
            isCheckingClient={isCheckingClient}
            existingClient={checkedCustomerData?.client}
            onNameBlur={handleNameBlur}
          />
          <DateTimeSection
            selectedDate={form.date}
            selectedTime={form.time}
            onOpenCalendar={() => setModals((p) => ({ ...p, calendar: true }))}
            onOpenTimePicker={() => setModals((p) => ({ ...p, time: true }))}
          />
          <ServicesSection
            selectedServices={form.services}
            onOpenServicesModal={() =>
              setModals((p) => ({ ...p, services: true }))
            }
            onRemoveService={(id) =>
              updateForm({
                services: form.services.filter((s: any) => s.id !== id),
              })
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
              setModals((p) => ({ ...p, reserve: true }))
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
              setModals((p) => ({ ...p, remind: true }))
            }
            formatPreview={formatPreviewMessage}
          />
          <SmsBalanceSection
            userSmsBalance={userSmsBalance}
            isLoadingBalance={isLoadingBalance}
            sendReservationSms={form.sendReserveSms}
            sendReminderSms={form.sendRemindSms}
            calculateSmsNeeded={smsNeeded}
            onBuySms={() => router.push("/clientdashboard/buysms")}
          />
          <SubmitButton
            isSubmitting={isSubmitting}
            isDisabled={
              isBlocked || (smsNeeded > (userSmsBalance ?? 0) && smsNeeded > 0)
            }
            onClick={handleSubmit}
          />
        </div>
      </div>

      <UnblockCustomerModal
        isOpen={unblockModal.show}
        clientName={unblockModal.clientName}
        cancelledCount={unblockModal.cancelledCount}
        onConfirm={handleUnblockAndSubmit}
        onCancel={() =>
          setUnblockModal({ show: false, clientName: "", cancelledCount: 0 })
        }
      />

      <ModalManager
        modals={modals}
        setModals={setModals}
        form={form}
        updateForm={updateForm}
        templatesData={templatesData}
        isLoadingTemplates={isLoadingTemplates}
        servicesData={servicesData}
        formatPreviewMessage={formatPreviewMessage}
        checkData={checkedCustomerData}
        onConfirmNameChange={handleConfirmNameChange}
        onCancelNameChange={handleCancelNameChange}
      />

      <Footer />
    </div>
  );
}
