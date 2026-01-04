"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import { Calendar, UserX, Building2, AlertCircle, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

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

const STORAGE_KEY = "booking_form_draft";

const formatPreviewMessage = (text: string) =>
  text
    ? text
        .replace(/%name%/g, "مشتری عزیز")
        .replace(/%date%/g, "1404/02/21")
        .replace(/%time%/g, "21:00")
        .replace(/%services%/g, "اصلاح مو")
        .replace(/%link%/g, "ontimeapp.ir/fsdvf")
        .replace(/%salon%/g, "آنتایم")
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
    businessInfoMissing: false,
  });

  const [businessForm, setBusinessForm] = useState({
    business_name: "",
    business_address: "",
  });
  const [isSavingBusiness, setIsSavingBusiness] = useState(false);

  const [userProfile, setUserProfile] = useState<{
    business_name?: string;
    business_address?: string;
    name?: string;
    phone?: string;
    job_id?: number;
    off_days?: number[];
  }>({});

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

  // همه useEffect‌ها قبل از هر early return
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/client/settings");
        const data = await res.json();
        if (data.success && data.user) {
          const {
            name,
            phone,
            job_id,
            business_name,
            business_address,
            off_days,
          } = data.user;
          setUserProfile({
            name: name || "",
            phone: phone || "",
            job_id: job_id ? job_id.toString() : null,
            business_name: business_name || "",
            business_address: business_address || "",
            off_days: off_days ? JSON.parse(off_days) : [],
          });
          setBusinessForm({
            business_name: business_name || "",
            business_address: business_address || "",
          });
        }
      } catch (err) {
        console.error("خطا در دریافت اطلاعات پروفایل");
      }
    };
    fetchProfile();
  }, []);

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
      sendReserveSms: parsed.sendReserveSms ?? false,
      sendRemindSms: parsed.sendRemindSms ?? false,
      reserveMsg: parsed.reserveMsg || "",
      reservePattern: parsed.reservePattern || "",
      reserveSmsPage: parsed.reserveSmsPage || 1,
      remindMsg: parsed.remindMsg || "",
      remindPattern: parsed.remindPattern || "",
      remindSmsPage: parsed.remindSmsPage || 1,
      remindTime: parsed.remindTime || 24,
    });
  }, [today]);

  useEffect(() => {
    if (form?.phone) {
      const digits = form.phone.replace(/\D/g, "");
      if (digits.length >= 10) checkCustomer(digits.slice(-10));
    }
  }, [form?.phone, checkCustomer]);

  useEffect(() => {
    if (form) localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
  }, [form]);

  // فیلتر الگوهای یادآوری — قبل از early return
  const reminderTemplates = useMemo(() => {
    if (!templatesData?.templates || !form?.sendRemindSms) return [];
    const targetSubType = form?.remindTime >= 24 ? "tomorrow" : "today";
    return templatesData.templates.filter(
      (t: any) => t.type === "reminder" && t.sub_type === targetSubType
    );
  }, [templatesData?.templates, form?.sendRemindSms, form?.remindTime]);

  // محاسبه تعداد پیامک‌ها — قبل از early return
  const reserveSmsCount = form?.sendReserveSms ? form.reserveSmsPage || 1 : 0;
  const remindSmsCount = form?.sendRemindSms ? form.remindSmsPage || 1 : 0;
  const totalSmsNeeded = reserveSmsCount + remindSmsCount;

  // early return فقط بعد از تمام هوک‌ها
  if (!form) {
    return (
      <div className="min-h-screen bg-[#1a1e26] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
      </div>
    );
  }

  const updateForm = (updates: Partial<typeof form>) =>
    setForm((prev: any) => ({ ...prev, ...updates }));

  const isBlocked = checkedCustomerData?.client?.is_blocked === 1;

  const handleNameBlur = () => {
    if (
      !checkedCustomerData?.exists ||
      !checkedCustomerData.client?.name ||
      !form
    )
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

  const handleConfirmNameChange = async () => {
    if (!form) return;
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
      clientName: checkedCustomerData?.client?.client_name || form?.name || "",
      cancelledCount: checkedCustomerData?.client?.cancelled_count || 0,
    });
  };

  const handleUnblockAndSubmit = async () => {
    if (isUnblocking || !form) return;
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

  const saveBusinessInfo = async () => {
    if (
      !businessForm.business_name.trim() ||
      !businessForm.business_address.trim()
    ) {
      toast.error("نام و آدرس کسب‌وکار الزامی است");
      return;
    }

    if (!userProfile.job_id) {
      toast.error("نوع تخصص انتخاب نشده است. لطفاً به تنظیمات بروید.");
      return;
    }

    setIsSavingBusiness(true);
    try {
      const res = await fetch("/api/client/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userProfile.name || "کاربر",
          phone: userProfile.phone,
          job_id: Number(userProfile.job_id),
          business_name: businessForm.business_name.trim(),
          business_address: businessForm.business_address.trim(),
        }),
      });

      if (res.ok) {
        toast.success("اطلاعات کسب‌وکار با موفقیت ذخیره شد");
        setUserProfile((prev) => ({
          ...prev,
          business_name: businessForm.business_name.trim(),
          business_address: businessForm.business_address.trim(),
        }));
        setModals((prev) => ({ ...prev, businessInfoMissing: false }));
        proceedWithBooking();
      } else {
        const data = await res.json();
        toast.error(data.message || "خطا در ذخیره اطلاعات");
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setIsSavingBusiness(false);
    }
  };

  const proceedWithBooking = () => {
    const cleanPhone = form.phone.replace(/\D/g, "").slice(-10);

    // اعتبارسنجی اطلاعات پایه
    if (!form.name.trim() || cleanPhone.length !== 10 || !form.time) {
      toast.error("اطلاعات ضروری (نام، شماره و زمان) را تکمیل کنید");
      return;
    }

    // اعتبارسنجی الزامی بودن انتخاب الگو — این بار قبل از هر چیز
    if (form.sendReserveSms && !form.reservePattern) {
      toast.error("لطفاً الگوی پیامک تایید رزرو را انتخاب کنید");
      setModals((prev) => ({ ...prev, reserve: true }));
      return;
    }

    if (form.sendRemindSms && !form.remindPattern) {
      toast.error("لطفاً الگوی پیامک یادآوری را انتخاب کنید");
      setModals((prev) => ({ ...prev, remind: true }));
      return;
    }

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
        reserve_pattern: form.sendReserveSms ? form.reservePattern : null,
        reminder_pattern: form.sendRemindSms ? form.remindPattern : null,
        reserve_message_count: form.sendReserveSms ? form.reserveSmsPage : 1,
        reminder_message_count: form.sendRemindSms ? form.remindSmsPage : 1,
      },
      {
onSuccess: () => {
  toast.dismiss(loadingId);

  // ۱. پاک کردن localStorage
  localStorage.removeItem(STORAGE_KEY);

  // ۲. ریست کامل state فرم به حالت اولیه (دقیقاً مثل وقتی صفحه اول لود می‌شه)
  setForm({
    name: "",
    phone: "",
    date: {
      year: today.year,
      month: today.month,
      day: today.day,
    },
    time: "",
    services: [],
    notes: "",
    sendReserveSms: false,
    sendRemindSms: false,
    reserveMsg: "",
    reservePattern: "",
    reserveSmsPage: 1,
    remindMsg: "",
    remindPattern: "",
    remindSmsPage: 1,
    remindTime: 24,
  });

  // ۳. invalidate کوئری‌ها
  queryClient.invalidateQueries({
    queryKey: ["bookings", "customers"],
  });

  toast.success("نوبت با موفقیت ثبت شد");

  // ۴. ریدایرکت به صفحه موفقیت
  router.push("/clientdashboard/bookingsubmit");
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

  const handleSubmit = async () => {
    const hasBusinessName = userProfile.business_name?.trim();
    const hasBusinessAddress = userProfile.business_address?.trim();

    if (!hasBusinessName || !hasBusinessAddress) {
      setModals((prev) => ({ ...prev, businessInfoMissing: true }));
      return;
    }

    proceedWithBooking();
  };

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
            reserveSmsCount={reserveSmsCount}
            remindSmsCount={remindSmsCount}
            totalSmsNeeded={totalSmsNeeded}
            onBuySms={() => router.push("/clientdashboard/buysms")}
          />
          <SubmitButton
            isSubmitting={isSubmitting}
            isDisabled={
              isBlocked ||
              (totalSmsNeeded > (userSmsBalance ?? 0) && totalSmsNeeded > 0)
            }
            onClick={handleSubmit}
          />
        </div>
      </div>

      <AnimatePresence>
        {modals.businessInfoMissing && (
          <div
            className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4"
            dir="rtl"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() =>
                setModals((prev) => ({ ...prev, businessInfoMissing: false }))
              }
            />

            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-[#1c212c] rounded-t-[2.5rem] sm:rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
            >
              <div className="p-6 pb-4 text-center">
                <div className="w-16 h-16 mx-auto mb-5 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30">
                  <Building2 className="w-9 h-9 text-emerald-400" />
                </div>
                <h3 className="text-xl font-black text-white mb-3">
                  تکمیل اطلاعات کسب‌وکار
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed px-4">
                  برای ثبت نوبت، لطفاً نام و آدرس کسب‌وکار خود را وارد کنید. این
                  اطلاعات در پیامک‌های مشتریان نمایش داده می‌شود.
                </p>
              </div>

              <div className="px-6 space-y-5 pb-6">
                <input
                  type="text"
                  placeholder="نام برند یا کسب‌وکار"
                  value={businessForm.business_name}
                  onChange={(e) =>
                    setBusinessForm({
                      ...businessForm,
                      business_name: e.target.value,
                    })
                  }
                  className="w-full bg-white/[0.04] border border-white/[0.1] focus:border-emerald-500 rounded-2xl px-5 py-4 text-sm focus:outline-none transition-all font-black text-emerald-50 shadow-sm"
                />

                <textarea
                  placeholder="آدرس کامل (خیابان، پلاک، طبقه و...)"
                  value={businessForm.business_address}
                  onChange={(e) =>
                    setBusinessForm({
                      ...businessForm,
                      business_address: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full bg-white/[0.04] border border-white/[0.1] focus:border-emerald-500 rounded-2xl px-5 py-4 text-sm focus:outline-none transition-all resize-none font-medium text-gray-200 placeholder:text-gray-600"
                />
              </div>

              <div className="px-6 pb-6 grid grid-cols-2 gap-4">
                <button
                  onClick={() =>
                    setModals((prev) => ({
                      ...prev,
                      businessInfoMissing: false,
                    }))
                  }
                  disabled={isSavingBusiness}
                  className="py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold text-gray-300 transition-all active:scale-95 disabled:opacity-50"
                >
                  انصراف
                </button>
                <button
                  onClick={saveBusinessInfo}
                  disabled={isSavingBusiness}
                  className="py-4 bg-emerald-500 hover:bg-emerald-400 text-black rounded-2xl font-black transition-all active:scale-95 shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSavingBusiness ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "ذخیره و ثبت نوبت"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
        offDays={userProfile.off_days || []}
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
        reminderTemplates={reminderTemplates}
      />

      <Footer />
    </div>
  );
}
