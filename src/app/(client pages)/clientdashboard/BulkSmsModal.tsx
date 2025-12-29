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
  MessageSquare,
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
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-lg animate-in zoom-in-95 duration-200 bg-[#1a1e26] border border-white/10 rounded-[2.5rem] shadow-2xl max-h-[80vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/2">
          <h3 className="text-lg font-bold text-white">انتخاب الگوی پیام</h3>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
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
                <p className="text-sm text-gray-400 leading-relaxed italic line-clamp-2">
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
  const [selectedTemplate, setSelectedTemplate] = useState<{ key: string | null; content: string } | null>(null);
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showConfirmStep, setShowConfirmStep] = useState(false);
  const [newBusinessName, setNewBusinessName] = useState("");
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  const { data: templatesData, isLoading: isLoadingTemplates } = useSmsTemplates();

  const bulkTemplates = useMemo(
    () => templatesData?.templates?.filter((t: any) => t.type === "bulk" || t.type === "generic") || [],
    [templatesData]
  );

  const formatPreview = (text: string | null | undefined) => {
    if (!text) return "متنی انتخاب نشده است...";
    return text.replace(/%name%/g, "مشتری").replace(/%salon%/g, businessName || "نام بیزنس");
  };

  useEffect(() => {
    if (!isOpen) setShowConfirmStep(false);
  }, [isOpen]);

  const executeSend = async () => {
    setIsSending(true);
    try {
      await onSend(selectedTemplate?.key || "", selectedIds);
      toast.success("پیام‌ها با موفقیت ارسال شدند");
      setSelectedIds([]);
      setSelectedTemplate(null);
      onClose();
    } catch (e) {
      toast.error("خطا در ارسال");
    } finally {
      setIsSending(false);
      setShowConfirmStep(false);
    }
  };

  const handleStepClick = () => {
    if (selectedIds.length === 0) return toast.error("حداقل یک گیرنده انتخاب کنید");
    if (!selectedTemplate) return toast.error("لطفاً یک الگو انتخاب کنید");
    if (selectedIds.length > userSmsBalance) return toast.error("اعتبار کافی نیست");
    if (!businessName) return setShowBusinessModal(true);
    setShowConfirmStep(true);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4" dir="rtl">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

        <div className="relative w-full max-w-lg bg-[#1a1e26] rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col h-[90vh] sm:h-[80vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
          {/* Header */}
          <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/2 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Users size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">{title}</h3>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col p-5 space-y-5">
   

            {/* Template Section */}
            <div className="shrink-0 space-y-2">
              {!selectedTemplate ? (
                <button
                  onClick={() => setShowTemplateModal(true)}
                  className="w-full bg-white/5 border border-white/10 border-dashed rounded-2xl p-4 flex items-center justify-between group hover:border-emerald-500/40 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare size={18} className="text-gray-500 group-hover:text-emerald-500" />
                    <span className="text-sm font-bold text-white">انتخاب الگوی پیامک</span>
                  </div>
                  <ChevronLeft size={16} className="text-gray-600 group-hover:-translate-x-1 transition-transform" />
                </button>
              ) : (
                <div className="bg-emerald-500/5 rounded-2xl p-4 border border-emerald-500/20 relative animate-in zoom-in-95">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] font-black text-emerald-400">الگو: {bulkTemplates.find((t: any) => String(t.payamresan_id) === selectedTemplate.key)?.title}</span>
                    <button onClick={() => setSelectedTemplate(null)} className="text-red-400 p-1 hover:bg-red-500/10 rounded-md transition-colors"><X size={14} /></button>
                  </div>
                  <p className="text-[11px] text-gray-300 leading-relaxed line-clamp-2 italic">{formatPreview(selectedTemplate.content)}</p>
                </div>
              )}
            </div>

            {/* Recipients Section - Expanded */}
            <div className="flex-1 flex flex-col min-h-0 space-y-2">
              <div className="flex justify-between items-center px-1 shrink-0">
                <span className="text-xs font-bold text-gray-400 flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500" /> گیرندگان ({selectedIds.length})
                </span>
                <button
                  onClick={() => setSelectedIds(selectedIds.length === recipients.length ? [] : recipients.map((r) => r.id))}
                  className="text-emerald-400 text-[11px] hover:underline font-bold"
                >
                  {selectedIds.length === recipients.length ? "لغو همه" : "انتخاب همه"}
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-2 pb-2">
                {recipients.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedIds((prev) => prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id])}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${selectedIds.includes(item.id) ? "bg-emerald-500/10 border-emerald-500/30" : "bg-white/5 border-white/5 hover:bg-white/10"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${selectedIds.includes(item.id) ? "bg-emerald-500 border-emerald-500" : "border-white/20"}`}>
                        {selectedIds.includes(item.id) && <X size={12} className="text-white rotate-45" />}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-white text-sm font-bold truncate">{item.name}</p>
                        {item.details && <p className="text-[10px] text-gray-500 truncate">{item.details}</p>}
                      </div>
                    </div>
                  </div>
                ))}
                {recipients.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-2">
                    <Users size={40} className="opacity-20" />
                    <p className="text-xs">لیست گیرندگان خالی است</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-white/5 bg-white/2 shrink-0">
            <button
              onClick={handleStepClick}
              disabled={isSending || selectedIds.length === 0}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 disabled:opacity-50 rounded-2xl font-black text-white flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"
            >
              تأیید و ارسال ({selectedIds.length})
            </button>
          </div>

          {/* Confirmation Overlay */}
          {showConfirmStep && (
            <div className="absolute inset-0 z-[60] bg-[#1a1e26] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-200">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mb-6 animate-bounce">
                <Info size={40} />
              </div>
              <h4 className="text-xl font-black text-white mb-2">تأیید نهایی</h4>
              <div className="bg-white/5 rounded-3xl p-6 w-full mb-8 space-y-4">
                <div className="flex justify-between text-sm"><span className="text-gray-400">گیرندگان:</span><span className="text-white font-bold">{selectedIds.length} نفر</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-400">اعتبار مصرفی:</span><span className="text-emerald-400 font-bold">{selectedIds.length} پیامک</span></div>
              </div>
              <div className="flex w-full gap-4">
                <button onClick={() => setShowConfirmStep(false)} className="flex-1 py-4 bg-white/5 rounded-2xl font-bold text-gray-400">انصراف</button>
                <button onClick={executeSend} disabled={isSending} className="flex-[2] py-4 bg-emerald-500 rounded-2xl font-black text-white flex items-center justify-center gap-2">
                  {isSending ? <Loader2 className="animate-spin" /> : <><Send size={18} className="-rotate-45" /> بفرست</>}
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
        onSelect={(content: string, key: string) => setSelectedTemplate({ key, content })}
      />

      {showBusinessModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 text-center">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" />
          <div className="relative w-full max-w-sm bg-[#1e232d] rounded-[3rem] border border-emerald-500/30 p-8 shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mx-auto mb-4">
              <Building2 size={32} />
            </div>
            <h4 className="text-xl font-bold text-white mb-2">نام کسب‌وکار</h4>
            <input
              type="text"
              value={newBusinessName}
              onChange={(e) => setNewBusinessName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 text-center text-white mb-6 outline-none focus:border-emerald-500 font-bold"
              placeholder="مثلاً: آرایشگاه رویال"
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={() => setShowBusinessModal(false)} className="flex-1 py-4 text-gray-500 font-bold">لغو</button>
              <button
                onClick={async () => {
                  if (!newBusinessName.trim()) return toast.error("نام را وارد کنید");
                  setIsUpdatingName(true);
                  if (await onUpdateBusinessName(newBusinessName)) { setShowBusinessModal(false); setShowConfirmStep(true); }
                  setIsUpdatingName(false);
                }}
                disabled={isUpdatingName}
                className="flex-[2] py-4 bg-emerald-500 rounded-2xl text-white font-black flex items-center justify-center"
              >
                {isUpdatingName ? <Loader2 className="animate-spin w-5 h-5" /> : "تأیید"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};