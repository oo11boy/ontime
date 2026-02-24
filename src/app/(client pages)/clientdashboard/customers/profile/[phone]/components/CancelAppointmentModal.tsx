// components/CustomerProfile/CancelAppointmentModal.tsx
import React, { useState } from "react";
import { AlertCircle, Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSmsTemplates } from "@/hooks/useSmsTemplates";

interface CancelAppointmentModalProps {
  isOpen: boolean;
  appointmentId: number | null;
  sendCancellationSms: boolean;
  canceling: boolean;
  onClose: () => void;
  onToggleSmsCheckbox: (checked: boolean) => void;
  onTemplateSelect: (key: string | null) => void;
  onCancelAppointment: () => void;
}

export const CancelAppointmentModal: React.FC<CancelAppointmentModalProps> = ({
  isOpen,
  appointmentId,
  sendCancellationSms,
  canceling,
  onClose,
  onToggleSmsCheckbox,
  onTemplateSelect,
  onCancelAppointment,
}) => {
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string | null>(null);

  const { data: templatesData, isLoading: templatesLoading } = useSmsTemplates();

  // فقط الگوهایی که احتمالاً مربوط به کنسلی هستند
  const cancellationTemplates = (templatesData?.templates || []).filter((t: any) => {
    if (!t.content) return false;
    const text = t.content.toLowerCase();
    return text.includes("کنسل") || text.includes("لغو") || text.includes("ابطال");
  });

  if (!isOpen || appointmentId === null) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-[#242933] rounded-2xl p-6 max-w-md w-full shadow-2xl border border-red-500/30"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 text-red-400 mb-5">
          <AlertCircle className="w-8 h-8" />
          <h3 className="text-xl font-bold">کنسل کردن نوبت</h3>
        </div>

        <p className="text-gray-300 mb-6">
          آیا از کنسل کردن این نوبت مطمئن هستید؟
        </p>

        <label className="flex items-center gap-3 mb-5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={sendCancellationSms}
            onChange={(e) => {
              const checked = e.target.checked;
              onToggleSmsCheckbox(checked);
              if (!checked) {
                setSelectedTemplateKey(null);
                onTemplateSelect(null);
              }
            }}
            className="w-5 h-5 text-emerald-500 rounded focus:ring-emerald-500"
          />
          <span className="text-sm flex items-center gap-2">
            <Send className="w-4 h-4 text-emerald-400" />
            ارسال پیامک اطلاع‌رسانی کنسلی
          </span>
        </label>

        {sendCancellationSms && (
          <div className="mb-6">
            <p className="text-sm text-gray-400 mb-3">الگوهای پیامک کنسلی:</p>

            {templatesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              </div>
            ) : cancellationTemplates.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm border border-dashed border-gray-700 rounded-xl">
                هیچ الگویی با کلمهٔ کنسل / لغو / ابطال یافت نشد
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
                {cancellationTemplates.map((tpl: any) => {
                  const isSelected = selectedTemplateKey === tpl.payamresan_id;

                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => {
                        setSelectedTemplateKey(tpl.payamresan_id);
                        onTemplateSelect(tpl.payamresan_id);
                      }}
                      className={`w-full text-right p-4 rounded-xl border transition-all text-sm leading-relaxed ${
                        isSelected
                          ? "border-red-500/60 bg-red-950/30 shadow-sm shadow-red-900/20"
                          : "border-white/10 hover:bg-white/5 hover:border-white/20"
                      }`}
                    >
                      {tpl.content ? (
                        <div className={`${isSelected ? "text-white" : "text-gray-300"}`}>
                          {tpl.content}
                        </div>
                      ) : (
                        <div className="text-gray-500 italic">متن الگو موجود نیست</div>
                      )}

                      {tpl.message_count && (
                        <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-white/5">
                          تعداد صفحه پیامک: {tpl.message_count}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => {
              if (sendCancellationSms && !selectedTemplateKey) {
                alert("لطفاً یک الگوی پیامک کنسلی انتخاب کنید");
                return;
              }
              onCancelAppointment();
            }}
            disabled={canceling || (sendCancellationSms && !selectedTemplateKey)}
            className={`flex-1 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              (sendCancellationSms && !selectedTemplateKey) || canceling
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 active:from-red-700 active:to-red-800"
            }`}
          >
            {canceling ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                در حال انجام...
              </>
            ) : (
              "کنسل کن"
            )}
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-3.5 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition"
          >
            انصراف
          </button>
        </div>
      </motion.div>
    </div>
  );
};