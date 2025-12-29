"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Send,
  X,
  Building2,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  Wallet,
  Users,
  Info,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useSmsTemplates } from "@/hooks/useSmsTemplates";

interface GenericRecipient {
  id: string | number;
  name: string;
  details?: string;
}

interface UniversalBulkSmsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  recipients: GenericRecipient[];
  userSmsBalance: number;
  businessName: string | null;
  onSend: (templateKey: string, ids: (string | number)[]) => Promise<void>;
  onUpdateBusinessName: (newName: string) => Promise<boolean>;
}

// --- کامپوننت داخلی انتخاب الگو ---
const InternalTemplateModal = ({
  isOpen,
  onClose,
  templates,
  onSelect,
  formatPreview,
  isLoading,
}: any) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4"
      dir="rtl"
    >
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg animate-in zoom-in-95 duration-200 bg-[#1a1e26] border border-white/10 rounded-[2.5rem] shadow-2xl max-h-[75vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/2">
          <h3 className="text-lg font-bold text-white">انتخاب الگوی پیام</h3>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            </div>
          ) : (
            templates.map((template: any) => (
              <button
                key={template.id}
                onClick={() => {
                  onSelect(template.content, template.payamresan_id);
                  onClose();
                }}
                className="w-full text-right p-5 rounded-3xl bg-white/5 border border-white/5 hover:border-emerald-500/40 transition-all group"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-emerald-400 text-xs font-bold px-2 py-0.5 bg-emerald-500/10 rounded-lg">
                    {template.title}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {Math.ceil((template.content?.length || 0) / 70)} پیامک
                  </span>
                </div>
                {/* رفع خطای TS در اینجا با استفاده از ?? "" */}
                <p className="text-sm text-gray-400 leading-relaxed italic">
                  {formatPreview(template.content ?? "")}
                </p>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// --- کامپوننت اصلی ارسال همگانی ---
export const BulkSmsModal: React.FC<UniversalBulkSmsModalProps> = ({
  isOpen,
  onClose,
  title = "ارسال همگانی",
  recipients,
  userSmsBalance,
  businessName,
  onSend,
  onUpdateBusinessName,
}) => {
  const [isSending, setIsSending] = useState(false);
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<{
    key: string | null;
    content: string;
  } | null>(null);
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showConfirmStep, setShowConfirmStep] = useState(false);
  const [newBusinessName, setNewBusinessName] = useState("");
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  const { data: templatesData, isLoading: isLoadingTemplates } =
    useSmsTemplates();

  const bulkTemplates = useMemo(
    () =>
      templatesData?.templates?.filter(
        (t: any) => t.type === "bulk" || t.type === "generic"
      ) || [],
    [templatesData]
  );

  // اصلاح پارامتر ورودی برای پذیرش مقدار null یا undefined جهت رفع خطای TypeScript
  const formatPreview = (text: string | null | undefined) => {
    if (!text) return "متنی انتخاب نشده است...";
    return text
      .replace(/%name%/g, "مشتری")
      .replace(/%salon%/g, businessName || "نام بیزنس");
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedIds(recipients.map((r) => r.id));
      if (bulkTemplates.length > 0 && !selectedTemplate) {
        setSelectedTemplate({
          key: String(bulkTemplates[0].payamresan_id),
          content: bulkTemplates[0].content || "",
        });
      }
    }
  }, [isOpen, recipients, bulkTemplates, selectedTemplate]);

  const executeSend = async () => {
    setIsSending(true);
    try {
      await onSend(selectedTemplate?.key || "", selectedIds);
      toast.success("پیام‌ها با موفقیت ارسال شدند");
      onClose();
    } catch (e) {
      toast.error("خطا در ارسال");
    } finally {
      setIsSending(false);
      setShowConfirmStep(false);
    }
  };

  const handleStepClick = () => {
    if (selectedIds.length === 0)
      return toast.error("حداقل یک گیرنده انتخاب کنید");
    if (!selectedTemplate) return toast.error("لطفاً یک الگو انتخاب کنید");
    if (selectedIds.length > userSmsBalance)
      return toast.error("اعتبار کافی نیست");
    if (!businessName) return setShowBusinessModal(true);
    setShowConfirmStep(true);
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4"
        dir="rtl"
      >
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="relative w-full max-w-md bg-[#1a1e26] rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Users size={20} />
              </div>
              <h3 className="text-xl font-bold text-white">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-full text-gray-400"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            <div
              className={`p-4 rounded-3xl border flex items-center justify-between ${
                userSmsBalance < selectedIds.length
                  ? "bg-red-500/10 border-red-500/20"
                  : "bg-white/5 border-white/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <Wallet
                  size={18}
                  className={
                    userSmsBalance < selectedIds.length
                      ? "text-red-400"
                      : "text-emerald-400"
                  }
                />
                <span className="text-xs text-gray-400">اعتبار فعلی شما:</span>
              </div>
              <span className="font-bold text-white">
                {userSmsBalance} پیامک
              </span>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-500 px-1">
                الگوی ارسال
              </label>
              <button
                onClick={() => setShowTemplateModal(true)}
                className="w-full bg-white/5 border border-white/10 rounded-3xl p-4 flex items-center justify-between group hover:border-emerald-500/30 transition-all"
              >
                <div className="text-right">
                  <p className="text-white font-bold text-sm">
                    {bulkTemplates.find(
                      (t: any) => t.payamresan_id === selectedTemplate?.key
                    )?.title || "انتخاب الگو"}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    برای تغییر کلیک کنید
                  </p>
                </div>
                <ChevronLeft
                  size={18}
                  className="text-gray-600 group-hover:text-emerald-400 transition-transform group-hover:-translate-x-1"
                />
              </button>
              <div className="bg-emerald-500/5 rounded-2xl p-5 border border-emerald-500/10 relative">
                <div className="absolute -top-2 right-4 px-2 py-0.5 bg-emerald-500 text-[9px] text-white font-bold rounded-full shadow-lg">
                  پیش‌نمایش زنده
                </div>
                <p className="text-xs text-gray-300 italic leading-relaxed">
                  {formatPreview(selectedTemplate?.content)}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-bold text-gray-500 flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500" />{" "}
                  گیرندگان ({selectedIds.length})
                </span>
                <button
                  onClick={() =>
                    setSelectedIds(
                      selectedIds.length === recipients.length
                        ? []
                        : recipients.map((r) => r.id)
                    )
                  }
                  className="text-emerald-400 text-[10px] hover:underline font-bold"
                >
                  {selectedIds.length === recipients.length
                    ? "لغو همه"
                    : "انتخاب همه"}
                </button>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {recipients.map((item) => (
                  <div
                    key={item.id}
                    onClick={() =>
                      setSelectedIds((prev) =>
                        prev.includes(item.id)
                          ? prev.filter((id) => id !== item.id)
                          : [...prev, item.id]
                      )
                    }
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      selectedIds.includes(item.id)
                        ? "bg-emerald-500/10 border-emerald-500/30"
                        : "bg-white/5 border-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                          selectedIds.includes(item.id)
                            ? "bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/20"
                            : "border-white/20"
                        }`}
                      >
                        {selectedIds.includes(item.id) && (
                          <X size={14} className="text-white rotate-45" />
                        )}
                      </div>
                      <div>
                        <p className="text-white text-sm font-bold">
                          {item.name}
                        </p>
                        {item.details && (
                          <p className="text-[10px] text-gray-500">
                            {item.details}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-white/5 bg-white/2">
            <button
              onClick={handleStepClick}
              disabled={isSending || selectedIds.length === 0}
              className="w-full py-4.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 disabled:opacity-50 rounded-2xl font-black text-white flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"
            >
              تأیید و ارسال نهایی
            </button>
          </div>

          {showConfirmStep && (
            <div className="absolute inset-0 z-[60] bg-[#1a1e26] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-200">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mb-6 animate-bounce">
                <Info size={40} />
              </div>
              <h4 className="text-xl font-black text-white mb-2">
                تأیید نهایی ارسال
              </h4>
              <div className="bg-white/5 rounded-3xl p-6 w-full mb-8 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">تعداد گیرندگان:</span>
                  <span className="text-white font-bold">
                    {selectedIds.length} نفر
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">اعتبار مصرفی:</span>
                  <span className="text-emerald-400 font-bold">
                    {selectedIds.length} پیامک
                  </span>
                </div>
                <div className="flex justify-between text-sm border-t border-white/5 pt-4">
                  <span className="text-gray-400">باقیمانده اعتبار:</span>
                  <span className="text-white font-bold">
                    {userSmsBalance - selectedIds.length}
                  </span>
                </div>
              </div>
              <div className="flex w-full gap-4">
                <button
                  onClick={() => setShowConfirmStep(false)}
                  className="flex-1 py-4 bg-white/5 rounded-2xl font-bold text-gray-400"
                >
                  انصراف
                </button>
                <button
                  onClick={executeSend}
                  disabled={isSending}
                  className="flex-[2] py-4 bg-emerald-500 rounded-2xl font-black text-white flex items-center justify-center gap-2"
                >
                  {isSending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      <Send size={18} className="-rotate-45" /> بفرست
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <InternalTemplateModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        templates={bulkTemplates}
        isLoading={isLoadingTemplates}
        formatPreview={formatPreview}
        onSelect={(content: string, key: string) =>
          setSelectedTemplate({ key, content })
        }
      />

      {showBusinessModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 text-center">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" />
          <div className="relative w-full max-w-sm bg-[#1e232d] rounded-[3rem] border border-emerald-500/30 p-8 shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mx-auto mb-4">
              <Building2 size={32} />
            </div>
            <h4 className="text-xl font-bold text-white mb-2">
              نام کسب‌وکار شما
            </h4>
            <p className="text-xs text-gray-500 mb-6 px-4">
              این نام به جای متغیر %salon% در پیامک‌ها قرار می‌گیرد.
            </p>
            <input
              type="text"
              value={newBusinessName}
              onChange={(e) => setNewBusinessName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 text-center text-white mb-6 outline-none focus:border-emerald-500 font-bold"
              placeholder="مثلاً: آرایشگاه رویال"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowBusinessModal(false)}
                className="flex-1 py-4 text-gray-500 font-bold"
              >
                لغو
              </button>
              <button
                onClick={async () => {
                  if (!newBusinessName.trim())
                    return toast.error("نام را وارد کنید");
                  setIsUpdatingName(true);
                  if (await onUpdateBusinessName(newBusinessName)) {
                    setShowBusinessModal(false);
                    setShowConfirmStep(true);
                  }
                  setIsUpdatingName(false);
                }}
                disabled={isUpdatingName}
                className="flex-[2] py-4 bg-emerald-500 rounded-2xl text-white font-black flex items-center justify-center gap-2"
              >
                {isUpdatingName ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                  "ذخیره و ادامه"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
