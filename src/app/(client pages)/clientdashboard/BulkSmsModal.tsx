"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Send,
  X,
  Building2,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  Users,
  Info,
  MessageSquare,
  MapPin,
  FileText,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { useSmsTemplates } from "@/hooks/useSmsTemplates";

// ── Variants ──
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring" as const, damping: 25, stiffness: 300 },
  },
  exit: { opacity: 0, scale: 0.95, y: 20 },
};

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
  businessAddress: string | null;
  onSend: (templateKey: string, ids: (string | number)[]) => Promise<void>;
  onUpdateBusinessProfile: (
    newName: string,
    newAddress: string,
  ) => Promise<boolean>;
}

const InternalTemplateModal = ({
  isOpen,
  onClose,
  templates,
  onSelect,
  formatPreview,
  isLoading,
}: any) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
          dir="rtl"
        >
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-lg bg-gradient-to-br from-[#1a1e26] to-[#151920] border border-white/10 rounded-[2.5rem] shadow-2xl max-h-[80vh] flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <Sparkles size={16} className="text-white" />
                </div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  انتخاب الگوی پیام
                </h3>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-all duration-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                  <p className="text-sm text-gray-500">
                    در حال بارگذاری الگوها...
                  </p>
                </div>
              ) : templates.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <AlertCircle size={24} className="text-gray-600" />
                  </div>
                  <p className="text-gray-500">هیچ الگویی یافت نشد</p>
                </div>
              ) : (
                templates.map((template: any, index: number) => (
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    key={template.id}
                    onClick={() => {
                      onSelect(
                        template.content,
                        template.payamresan_id,
                        template.message_count,
                      );
                      onClose();
                    }}
                    className="w-full text-right p-5 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-emerald-500/40 transition-all duration-300 group hover:shadow-lg hover:shadow-emerald-500/10"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                          <FileText size={12} className="text-emerald-400" />
                        </div>
                        <span className="text-emerald-400 text-xs font-bold px-2 py-0.5 bg-emerald-500/10 rounded-lg">
                          {template.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-500 font-medium px-2 py-1 bg-white/5 rounded-full">
                        {template.message_count ||
                          Math.ceil((template.content?.length || 0) / 70)}{" "}
                        پیامک
                      </span>
                    </div>

                    {/* نمایش پیامک با پاراگراف بندی صحیح */}
                    <div className="relative">
                      <div className="absolute right-0 top-0 w-1 h-full bg-gradient-to-b from-emerald-500 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="pr-4">
                        <div className="text-sm text-gray-300 leading-loose">
                          {formatPreview(template.content ?? "")
                            .split("\n")
                            .map(
                              (paragraph: string, idx: number) =>
                                paragraph.trim() && (
                                  <p key={idx} className="mb-3 last:mb-0">
                                    {paragraph}
                                  </p>
                                ),
                            )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex justify-end">
                      <span className="text-[10px] text-emerald-500/50 group-hover:text-emerald-400 transition-colors">
                        کلیک برای انتخاب →
                      </span>
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const BulkSmsModal: React.FC<UniversalBulkSmsModalProps> = ({
  isOpen,
  onClose,
  title = "ارسال همگانی",
  recipients,
  userSmsBalance,
  businessName,
  businessAddress,
  onSend,
  onUpdateBusinessProfile,
}) => {
  const [isSending, setIsSending] = useState(false);
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<{
    key: string | null;
    content: string;
    messageCount: number;
  } | null>(null);

  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showConfirmStep, setShowConfirmStep] = useState(false);

  const [newBusinessName, setNewBusinessName] = useState("");
  const [newBusinessAddress, setNewBusinessAddress] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const { data: templatesData, isLoading: isLoadingTemplates } =
    useSmsTemplates();

  const bulkTemplates = useMemo(
    () =>
      templatesData?.templates?.filter(
        (t: any) => t.type === "bulk" || t.type === "generic",
      ) || [],
    [templatesData],
  );

  useEffect(() => {
    if (isOpen) {
      setNewBusinessName(businessName || "");
      setNewBusinessAddress(businessAddress || "");
      setSelectedIds([]);
      setSelectedTemplate(null);
    }
  }, [isOpen, businessName, businessAddress]);

  // بهبود تابع نمایش پیامک با حفظ پاراگراف‌ها
  const formatPreview = (text: string | null | undefined) => {
    if (!text) return "متنی انتخاب نشده است...";

    let formattedText = text
      .replace(/%name%/g, "[نام مشتری]")
      .replace(/%date%/g, "[تاریخ نوبت]")
      .replace(/%time%/g, "[ساعت نوبت]")
      .replace(/%service%/g, "[نام خدمت]")
      .replace(/%link%/g, "ontimeapp.ir/fsdvf")
      .replace(/%salon%/g, "[نام کسب و کار]")
      .replace(/%address%/g, "[آدرس کسب و کار]")
      .replace(/%phone%/g, "[شماره تماس کسب و کار]");

    return formattedText;
  };

  useEffect(() => {
    if (!isOpen) setShowConfirmStep(false);
  }, [isOpen]);

  const handleSelectTemplate = (
    content: string,
    key: string,
    messageCount?: number,
  ) => {
    setSelectedTemplate({
      key,
      content,
      messageCount: Number(messageCount) || 1,
    });
  };

  const smsPerMessage = selectedTemplate?.messageCount || 1;
  const totalSmsCost = selectedIds.length * smsPerMessage;

  const handleStepClick = () => {
    if (selectedIds.length === 0)
      return toast.error("حداقل یک گیرنده انتخاب کنید");
    if (!selectedTemplate) return toast.error("لطفاً یک الگو انتخاب کنید");

    if (totalSmsCost > userSmsBalance) {
      return toast.error(
        `اعتبار کافی نیست — نیاز: ${totalSmsCost} واحد، موجود: ${userSmsBalance}`,
      );
    }

    if (!businessName?.trim() || !businessAddress?.trim()) {
      return setShowBusinessModal(true);
    }

    setShowConfirmStep(true);
  };

  const executeSend = async () => {
    setIsSending(true);
    try {
      await onSend(selectedTemplate?.key || "", selectedIds);
      toast.success(`پیامک برای ${selectedIds.length} نفر با موفقیت ارسال شد`);
      setSelectedIds([]);
      setSelectedTemplate(null);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "خطا در ارسال پیامک‌ها");
    } finally {
      setIsSending(false);
      setShowConfirmStep(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 z-[999] flex items-end justify-center sm:items-center p-4"
            dir="rtl"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={onClose}
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full max-w-lg bg-gradient-to-br from-[#1a1e26] to-[#151920] rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col h-[90vh] sm:h-[80vh] overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-white/5 to-transparent shrink-0 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <Users size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      {title}
                    </h3>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      ارسال پیامک گروهی
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-all duration-200"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col p-5 space-y-5">
                {/* انتخاب الگو */}
                <div className="shrink-0">
                  <AnimatePresence mode="wait">
                    {!selectedTemplate ? (
                      <motion.button
                        key="select"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        onClick={() => setShowTemplateModal(true)}
                        className="w-full bg-gradient-to-r from-white/5 to-transparent border border-dashed border-white/20 rounded-2xl p-4 flex items-center justify-between group hover:border-emerald-500/40 hover:bg-white/10 transition-all duration-300"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-all">
                            <MessageSquare
                              size={18}
                              className="text-gray-500 group-hover:text-emerald-400 transition-colors"
                            />
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-white">
                              انتخاب الگوی پیامک
                            </span>
                            <p className="text-[10px] text-gray-500">
                              از بین الگوهای موجود انتخاب کنید
                            </p>
                          </div>
                        </div>
                        <ChevronLeft
                          size={16}
                          className="text-gray-600 group-hover:text-emerald-400 group-hover:-translate-x-1 transition-all duration-200"
                        />
                      </motion.button>
                    ) : (
                      <motion.div
                        key="selected"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-2xl p-4 border border-emerald-500/30 relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                              <FileText
                                size={12}
                                className="text-emerald-400"
                              />
                            </div>
                            <span className="text-[11px] font-black text-emerald-400 uppercase tracking-tighter">
                              الگوی انتخاب شده
                            </span>
                          </div>
                          <button
                            onClick={() => setSelectedTemplate(null)}
                            className="text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                          >
                            <X size={14} />
                          </button>
                        </div>

                        <div className="flex justify-between text-[10px] text-gray-500 mb-3 pb-2 border-b border-white/10">
                          <span>تعداد پیامک هر گیرنده:</span>
                          <span className="text-emerald-400 font-bold">
                            {smsPerMessage}
                          </span>
                        </div>

                        {/* نمایش پیامک انتخاب شده با پاراگراف بندی صحیح */}
                        <div className="bg-black/20 rounded-xl p-3 max-h-40 overflow-y-auto">
                          <div className="text-[11px] text-gray-300 leading-loose">
                            {formatPreview(selectedTemplate.content)
                              .split("\n")
                              .map(
                                (paragraph: string, idx: number) =>
                                  paragraph.trim() && (
                                    <p key={idx} className="mb-2 last:mb-0">
                                      {paragraph}
                                    </p>
                                  ),
                              )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* لیست گیرندگان */}
                <div className="flex-1 flex flex-col min-h-0 space-y-3">
                  <div className="flex justify-between items-center px-1 shrink-0">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      <span className="text-xs font-bold text-gray-400">
                        گیرندگان ({selectedIds.length} از {recipients.length})
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        setSelectedIds(
                          selectedIds.length === recipients.length
                            ? []
                            : recipients.map((r) => r.id),
                        )
                      }
                      className="text-emerald-400 text-[11px] hover:underline font-bold transition-all hover:text-emerald-300"
                    >
                      {selectedIds.length === recipients.length
                        ? "لغو همه"
                        : "انتخاب همه"}
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-2 pb-2">
                    {recipients.map((item, index) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        key={item.id}
                        onClick={() =>
                          setSelectedIds((prev) =>
                            prev.includes(item.id)
                              ? prev.filter((id) => id !== item.id)
                              : [...prev, item.id],
                          )
                        }
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                          selectedIds.includes(item.id)
                            ? "bg-gradient-to-r from-emerald-500/15 to-emerald-500/5 border-emerald-500/40 shadow-lg shadow-emerald-500/10"
                            : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div
                            className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                              selectedIds.includes(item.id)
                                ? "bg-emerald-500 border-emerald-500"
                                : "border-white/30"
                            }`}
                          >
                            {selectedIds.includes(item.id) && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                              >
                                <CheckCircle2
                                  size={12}
                                  className="text-white"
                                />
                              </motion.div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-white text-sm font-bold">
                              {item.name}
                            </p>
                            {item.details && (
                              <p className="text-[10px] text-gray-500 mt-0.5">
                                {item.details}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* دکمه تأیید */}
                <div className="shrink-0 pt-2">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleStepClick}
                    disabled={
                      isSending || selectedIds.length === 0 || !selectedTemplate
                    }
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-700 disabled:to-gray-700 disabled:opacity-50 rounded-2xl font-black text-white flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 transition-all duration-300"
                  >
                    <Send size={18} className="-rotate-45" />
                    تأیید و ادامه ({selectedIds.length} نفر)
                  </motion.button>
                </div>
              </div>

              {/* مرحله تأیید نهایی */}
              <AnimatePresence>
                {showConfirmStep && (
                  <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "tween", duration: 0.3 }}
                    className="absolute inset-0 z-[60] bg-gradient-to-br from-[#1a1e26] to-[#151920] flex flex-col p-8"
                  >
                    <div className="flex-1 flex flex-col items-center justify-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, rotate: 360 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className="w-24 h-24 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full flex items-center justify-center mb-6"
                      >
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                          <Info size={32} className="text-white" />
                        </div>
                      </motion.div>

                      <h4 className="text-2xl font-black text-white mb-3">
                        تأیید نهایی ارسال
                      </h4>

                      <p className="text-gray-400 text-sm mb-8 text-center">
                        در حال ارسال پیامک به صورت گروهی هستید.
                        <br />
                        لطفاً اطلاعات زیر را بررسی کنید.
                      </p>

                      <div className="bg-gradient-to-br from-white/5 to-transparent rounded-3xl p-6 w-full space-y-4 border border-white/10">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">تعداد گیرندگان:</span>
                          <div className="flex items-center gap-2">
                            <Users size={14} className="text-emerald-400" />
                            <span className="text-white font-bold">
                              {selectedIds.length} نفر
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">پیامک هر نفر:</span>
                          <span className="text-emerald-400 font-bold">
                            {smsPerMessage} واحد
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-base font-bold border-t border-white/10 pt-4 mt-2">
                          <span className="text-gray-300">جمع کل مصرفی:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl text-emerald-400 font-black">
                              {totalSmsCost}
                            </span>
                            <span className="text-xs text-gray-500">واحد</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex w-full gap-4 mt-auto">
                      <button
                        onClick={() => setShowConfirmStep(false)}
                        className="flex-1 py-4 bg-white/10 hover:bg-white/15 rounded-2xl font-bold text-gray-400 hover:text-white transition-all duration-200"
                      >
                        بازگشت
                      </button>
                      <button
                        onClick={executeSend}
                        disabled={isSending}
                        className="flex-[2] py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-2xl font-black text-white flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all duration-200 disabled:opacity-60"
                      >
                        {isSending ? (
                          <>
                            <Loader2 className="animate-spin" />
                            در حال ارسال...
                          </>
                        ) : (
                          <>
                            <Send size={18} className="-rotate-45" />
                            تایید و ارسال
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <InternalTemplateModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        templates={bulkTemplates}
        isLoading={isLoadingTemplates}
        formatPreview={formatPreview}
        onSelect={handleSelectTemplate}
      />

      {/* مودال تکمیل اطلاعات بیزنس */}
      <AnimatePresence>
        {showBusinessModal && (
          <div className="fixed inset-0 z-[1200] flex items-center justify-center p-6 text-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/95 backdrop-blur-md"
              onClick={() => setShowBusinessModal(false)}
            />
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative w-full max-w-sm bg-gradient-to-br from-[#1e232d] to-[#161a22] rounded-[3rem] border border-emerald-500/30 p-8 shadow-2xl"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                  <Building2 size={28} className="text-white" />
                </div>
              </div>

              <h4 className="text-xl font-bold text-white mb-2">
                تکمیل اطلاعات بیزنس
              </h4>

              <p className="text-xs text-gray-500 mb-6">
                برای ارسال پیامک، وارد کردن نام و آدرس الزامی است.
              </p>

              <div className="space-y-4 mb-6">
                <div className="relative group">
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-emerald-400 transition-colors">
                    <Building2 size={16} />
                  </div>
                  <input
                    type="text"
                    value={newBusinessName}
                    onChange={(e) => setNewBusinessName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-right text-white outline-none focus:border-emerald-500 focus:bg-white/10 font-bold transition-all duration-200 text-sm"
                    placeholder="نام بیزنس (مثلاً: سالن مریم)"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute right-4 top-5 text-gray-500 group-hover:text-emerald-400 transition-colors">
                    <MapPin size={16} />
                  </div>
                  <textarea
                    rows={2}
                    value={newBusinessAddress}
                    onChange={(e) => setNewBusinessAddress(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-right text-white outline-none focus:border-emerald-500 focus:bg-white/10 font-bold transition-all duration-200 text-sm resize-none"
                    placeholder="آدرس دقیق بیزنس..."
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowBusinessModal(false)}
                  className="flex-1 py-4 text-gray-500 font-bold hover:text-white transition-colors duration-200"
                >
                  لغو
                </button>
                <button
                  onClick={async () => {
                    if (!newBusinessName.trim() || !newBusinessAddress.trim()) {
                      return toast.error("نام و آدرس را کامل وارد کنید");
                    }
                    setIsUpdatingProfile(true);
                    const success = await onUpdateBusinessProfile(
                      newBusinessName.trim(),
                      newBusinessAddress.trim(),
                    );
                    setIsUpdatingProfile(false);
                    if (success) {
                      setShowBusinessModal(false);
                      setShowConfirmStep(true);
                    }
                  }}
                  disabled={isUpdatingProfile}
                  className="flex-[2] py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-2xl text-white font-black flex items-center justify-center shadow-lg active:scale-95 transition-all duration-200 disabled:opacity-60"
                >
                  {isUpdatingProfile ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                  ) : (
                    "تأیید و ادامه"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
