// hooks/useBookingFormPersistence.ts
import { Service } from "@/app/(client pages)/clientdashboard/bookingsubmit/types";
import { useEffect, useState } from "react";

interface FormState {
  name: string;
  phone: string;
  selectedDate: { year: number; month: number; day: number | null };
  selectedTime: string;
  selectedServices: Service[];
  notes: string;
  sendReservationSms: boolean;
  sendReminderSms: boolean;
  reservationMessage: string;
  reminderMessage: string;
  reminderTime: number;
}

const STORAGE_KEY = "booking_form_draft";

export const useBookingFormPersistence = () => {
  const [formData, setFormData] = useState<FormState | null>(null);

  // بارگذاری داده از sessionStorage هنگام mount
  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed);
      } catch (e) {
        console.error("خطا در بارگذاری فرم ذخیره‌شده:", e);
      }
    }
  }, []);

  // ذخیره داده‌ها در sessionStorage
  const saveForm = (data: FormState) => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  // پاک کردن فرم بعد از ثبت موفق
  const clearForm = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setFormData(null);
  };

  return {
    initialFormData: formData,
    saveForm,
    clearForm,
  };
};