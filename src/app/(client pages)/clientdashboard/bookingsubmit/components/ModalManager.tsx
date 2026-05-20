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
  onConfirmNameChange: () => void;
  onCancelNameChange: () => void;
  offDays: number[];
  reminderTemplates: any[];
  jobs?: any[]; // اضافه شده
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
  offDays,
  reminderTemplates = [],
  jobs = [], // اضافه شده
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

      {/* مودال انتخاب الگوی پیامک رزرو */}
      <MessageTemplateModal
        formatPreviewMessage={formatPreviewMessage}
        isOpen={modals.reserve}
        onClose={() => setModals((m: any) => ({ ...m, reserve: false }))}
        templates={
          templatesData?.templates?.filter((t: any) => t.type === "reserve") || []
        }
        onSelect={(data: { content: string; pattern: string; message_count?: number }) => {
          updateForm({
            reserveMsg: data.content,
            reservePattern: data.pattern,
            reserveSmsPage: data.message_count || 1,
          });
        }}
        title="انتخاب الگوی رزرو"
        isLoading={isLoadingTemplates}
        jobs={jobs}
      />

      {/* مودال انتخاب الگوی پیامک یادآوری */}
      <MessageTemplateModal
        formatPreviewMessage={formatPreviewMessage}
        isOpen={modals.remind}
        onClose={() => setModals((m: any) => ({ ...m, remind: false }))}
        templates={reminderTemplates}
        onSelect={(data: { content: string; pattern: string; message_count?: number }) => {
          updateForm({
            remindMsg: data.content,
            remindPattern: data.pattern,
            remindSmsPage: data.message_count || 1,
          });
        }}
        title="انتخاب الگوی یادآوری"
        isLoading={isLoadingTemplates}
        jobs={jobs}
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
        offDays={offDays}
        selectedDate={form.date}
        setSelectedDate={(v: any) =>
          updateForm({ date: typeof v === "function" ? v(form.date) : v })
        }
        isCalendarOpen={modals.calendar}
        setIsCalendarOpen={(v: boolean) =>
          setModals((m: any) => ({ ...m, calendar: v }))
        }
        onDateSelected={() => setModals((m: any) => ({ ...m, time: true }))}
      />

      <TimePickerModal
        selectedDate={form.date}
        selectedTime={form.time}
        setSelectedTime={(v: string) => updateForm({ time: v })}
        isTimePickerOpen={modals.time}
        setIsTimePickerOpen={(v: boolean) =>
          setModals((m: any) => ({ ...m, time: v }))
        }
        selectedServices={form.services}
      />
    </>
  );
};

export default ModalManager;