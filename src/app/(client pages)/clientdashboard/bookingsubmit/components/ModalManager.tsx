"use client";
import React from "react";
import MessageTemplateModal from "./MessageTemplateModal";
import ServicesModal from "./ServicesModal";
import JalaliCalendarModal from "./JalaliCalendarModal";
import TimePickerModal from "./TimePickerModal";
import NameChangeConfirmationModal from "./NameChangeConfirmationModal";

interface ModalManagerProps {
  modals: any;
  setModals: React.Dispatch<React.SetStateAction<any>>;
  form: any;
  updateForm: (updates: any) => void;
  templatesData: any;
  isLoadingTemplates: boolean;
  servicesData: any;
  formatPreviewMessage: (text: string) => string;
  checkData: any;
  // اضافه کردن این دو پراپ جدید برای مدیریت دقیق‌تر دکمه‌ها
  onConfirmNameChange: () => void;
  onCancelNameChange: () => void;
}

const ModalManager: React.FC<ModalManagerProps> = ({
  modals,
  setModals,
  form,
  updateForm,
  templatesData,
  isLoadingTemplates,
  servicesData,
  formatPreviewMessage,
  checkData,
  onConfirmNameChange,
  onCancelNameChange,
}) => {
  return (
    <>
      <NameChangeConfirmationModal
        isOpen={modals.nameChange}
        onClose={() => setModals((m: any) => ({ ...m, nameChange: false }))}
        oldName={checkData?.client?.name || ""}
        newName={form.name}
        onConfirm={onConfirmNameChange}
        onCancel={onCancelNameChange}
      />

      <MessageTemplateModal
        formatPreviewMessage={formatPreviewMessage}
        isOpen={modals.reserve}
        onClose={() => setModals((m: any) => ({ ...m, reserve: false }))}
        templates={templatesData?.templates?.filter((t: any) => t.type === "reserve") || []}
        onSelect={(v) => updateForm({ reserveMsg: v })}
        title="انتخاب الگوی رزرو"
        isLoading={isLoadingTemplates}
      />

      <MessageTemplateModal
        formatPreviewMessage={formatPreviewMessage}
        isOpen={modals.remind}
        onClose={() => setModals((m: any) => ({ ...m, remind: false }))}
        templates={templatesData?.templates?.filter((t: any) => t.type === "reminder") || []}
        onSelect={(v) => updateForm({ remindMsg: v })}
        title="انتخاب الگوی یادآوری"
        isLoading={isLoadingTemplates}
      />

      <ServicesModal
        isOpen={modals.services}
        onClose={() => setModals((m: any) => ({ ...m, services: false }))}
        selectedServices={form.services}
        setSelectedServices={(v) =>
          updateForm({
            services: typeof v === "function" ? v(form.services) : v,
          })
        }
        allServices={servicesData?.services?.filter((s: any) => s.is_active) || []}
        isLoading={!servicesData}
      />

      <JalaliCalendarModal
        selectedDate={form.date}
        setSelectedDate={(v: any) => updateForm({ date: typeof v === "function" ? v(form.date) : v })}
        isCalendarOpen={modals.calendar}
        setIsCalendarOpen={(v) => setModals((m: any) => ({ ...m, calendar: v }))}
      />

      <TimePickerModal
        selectedDate={form.date}
        selectedTime={form.time}
        setSelectedTime={(v) => updateForm({ time: v })}
        isTimePickerOpen={modals.time}
        setIsTimePickerOpen={(v) => setModals((m: any) => ({ ...m, time: v }))}
        selectedServices={form.services}
      />
    </>
  );
};

export default ModalManager;