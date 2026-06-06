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
  Briefcase,
  Hash,
  Layers,
  Bell,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { useSmsTemplates } from "@/hooks/useSmsTemplates";
import Link from "next/link";

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
  jobs = [],
  selectedSubType = "all",
}: any) => {
  const [selectedJobId, setSelectedJobId] = useState<number | "all" | "none">(
    "all",
  );

  const filteredBySubType = useMemo(() => {
    if (selectedSubType === "all") return templates;
    return templates.filter((t: any) => t.sub_type === selectedSubType);
  }, [templates, selectedSubType]);
  const groupedTemplates = useMemo(() => {
    const groups: { [key: string]: any[] } = {
      all: [],
      none: [],
    };

    filteredBySubType.forEach((template: any) => {
      const jobId = template.job_id;
      if (jobId) {
        if (!groups[jobId.toString()]) {
          groups[jobId.toString()] = [];
        }
        groups[jobId.toString()].push(template);
      } else {
        groups.none.push(template);
      }
      groups.all.push(template);
    });

    return groups;
  }, [filteredBySubType]);

  const categoryStats = useMemo(() => {
    const stats: { [key: string]: number } = {
      all: filteredBySubType.length,
      none: groupedTemplates.none?.length || 0,
    };
    jobs.forEach((job: any) => {
      stats[job.id.toString()] =
        groupedTemplates[job.id.toString()]?.length || 0;
    });
    return stats;
  }, [filteredBySubType.length, jobs, groupedTemplates]);

  const availableCategories = useMemo(() => {
    const categories: Array<{
      id: string;
      name: string;
      icon: any;
      count: number;
    }> = [];

    if (categoryStats.all > 0) {
      categories.push({
        id: "all",
        name: "همه",
        icon: Layers,
        count: categoryStats.all,
      });
    }

    if (categoryStats.none > 0) {
      categories.push({
        id: "none",
        name: "عمومی",
        icon: Hash,
        count: categoryStats.none,
      });
    }

    jobs.forEach((job: any) => {
      const count = categoryStats[job.id.toString()];
      if (count > 0) {
        categories.push({
          id: job.id.toString(),
          name: job.persian_name,
          icon: Briefcase,
          count,
        });
      }
    });

    return categories;
  }, [jobs, categoryStats]);

  const currentTemplates = useMemo(() => {
    if (selectedJobId === "all") return groupedTemplates.all || [];
    if (selectedJobId === "none") return groupedTemplates.none || [];
    return groupedTemplates[selectedJobId.toString()] || [];
  }, [selectedJobId, groupedTemplates]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          key="internal-template-modal"
          className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4"
          dir="rtl"
        >
          <motion.div
            key="internal-backdrop"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute inset-0 bg-black/50 dark:bg-black/90 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            key="internal-modal-container"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-[95%] sm:max-w-lg bg-white dark:bg-gradient-to-br dark:from-[#1a1e26] dark:to-[#151920] border border-slate-200 dark:border-white/10 rounded-2xl sm:rounded-[2rem] shadow-xl dark:shadow-2xl flex flex-col h-[90vh] sm:h-[85vh] overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 backdrop-blur-sm shrink-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <Sparkles size={16} className="text-white sm:size-5" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">
                  انتخاب الگوی پیام
                </h3>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white transition-all duration-200"
              >
                <X size={18} className="sm:size-5" />
              </button>
            </div>

            {selectedSubType !== "all" && (
              <div
                className={`mx-3 sm:mx-5 mt-3 sm:mt-4 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl flex items-center gap-2 shrink-0 ${
                  selectedSubType === "cancel"
                    ? "bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20"
                    : "bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20"
                }`}
              >
                {selectedSubType === "cancel" ? (
                  <AlertTriangle size={14} className="text-red-600 dark:text-red-400 sm:size-4" />
                ) : (
                  <Bell size={14} className="text-emerald-600 dark:text-emerald-400 sm:size-4" />
                )}
                <span
                  className={`text-[10px] sm:text-xs font-medium ${
                    selectedSubType === "cancel"
                      ? "text-red-700 dark:text-red-400"
                      : "text-emerald-700 dark:text-emerald-400"
                  }`}
                >
                  {selectedSubType === "cancel"
                    ? "در حال نمایش الگوهای کنسلی نوبت"
                    : "در حال نمایش الگوهای اطلاع‌رسانی عمومی"}
                </span>
              </div>
            )}

            {availableCategories.length > 0 && (
              <div className="border-b border-slate-200 dark:border-white/10 bg-white/2 shrink-0">
                <div className="p-2 sm:p-3 pb-2 overflow-x-auto custom-scrollbar">
                  <div className="flex gap-1.5 sm:gap-2 min-w-max">
                    {availableCategories.map((category) => (
                      <motion.button
                        key={category.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedJobId(category.id as any)}
                        className={`flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-medium transition-all duration-200 ${
                          selectedJobId === category.id
                            ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20"
                            : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white"
                        }`}
                      >
                        <category.icon size={12} className="sm:size-3.5" />
                        <span className="hidden xs:inline">{category.name}</span>
                        <span className="inline xs:hidden">
                          {category.name}
                        </span>
                        <span
                          className={`text-[8px] sm:text-[9px] px-1 py-0.5 rounded-full ${
                            selectedJobId === category.id
                              ? "bg-white/20 text-white"
                              : "bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-gray-500"
                          }`}
                        >
                          {category.count}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 sm:space-y-4 custom-scrollbar">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 sm:py-20 gap-2 sm:gap-3">
                  <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-500 animate-spin" />
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-500">
                    در حال بارگذاری الگوها...
                  </p>
                </div>
              ) : currentTemplates.length === 0 ? (
                <div className="text-center py-16 sm:py-20">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <AlertCircle size={20} className="text-slate-500 dark:text-gray-600 sm:size-6" />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-500">
                    در این دسته الگویی وجود ندارد
                  </p>
                  <p className="text-[10px] sm:text-xs text-slate-400 dark:text-gray-600 mt-1 sm:mt-2">
                    دسته دیگری را انتخاب کنید
                  </p>
                </div>
              ) : (
                <>
                  {currentTemplates.map((template: any, index: number) => (
                    <motion.button
                      key={`template-${template.id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        onSelect(
                          template.content,
                          template.payamresan_id,
                          template.message_count,
                        );
                        onClose();
                      }}
                      className="w-full text-right p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-gradient-to-br dark:from-white/5 dark:to-transparent border border-slate-200 dark:border-white/10 hover:border-emerald-500/40 transition-all duration-300 group hover:shadow-lg hover:shadow-emerald-500/10"
                    >
                      <div className="flex flex-wrap justify-between items-start gap-2 mb-2 sm:mb-3">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                     
                  
                          {template.sub_type === "cancel" && (
                            <span className="text-red-700 dark:text-red-400 text-[8px] sm:text-[10px] font-medium bg-red-100 dark:bg-red-500/10 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 sm:gap-1">
                              <AlertTriangle size={8} className="sm:size-2.5" />
                              کنسلی
                            </span>
                          )}
                          {template.job_id && template.job_name && (
                            <span className="text-cyan-700 dark:text-cyan-400 text-[8px] sm:text-[10px] font-medium bg-cyan-100 dark:bg-cyan-500/10 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 sm:gap-1">
                              <Briefcase size={8} className="sm:size-2.5" />
                              {template.job_name.length > 8
                                ? template.job_name.slice(0, 8) + "..."
                                : template.job_name}
                            </span>
                          )}
                        </div>
                        <span className="text-[8px] sm:text-[10px] text-slate-500 dark:text-gray-500 font-medium px-1.5 py-0.5 sm:px-2 bg-slate-100 dark:bg-white/5 rounded-full">
                          {template.message_count ||
                            Math.ceil((template.content?.length || 0) / 70)}{" "}
                          پیامک
                        </span>
                      </div>

                      <div className="relative">
                        <div className="pr-2 sm:pr-4">
                          <div className="text-[10px] sm:text-sm text-slate-700 dark:text-gray-300 leading-relaxed ">
                            {formatPreview(template.content ?? "")
                              .split("\n")
                              
                              .map(
                                (paragraph: string, idx: number) =>
                                  paragraph.trim() && (
                                    <p
                                      key={`${template.id}-para-${idx}`}
                                      className="mb-1 last:mb-0"
                                    >
                                      {paragraph}
                                    </p>
                                  ),
                              )}
                     
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 sm:mt-3 flex justify-end">
                        <span className="text-[8px] sm:text-[10px] text-emerald-500/50 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          کلیک برای انتخاب ←
                        </span>
                      </div>
                    </motion.button>
                  ))}
                  <Link
                    href={"/clientdashboard/sms-suggestions"}
                    className="text-[10px] sm:text-xs w-full border border-slate-200 dark:border-white/10 py-2.5 sm:py-3 text-slate-500 dark:text-gray-400 text-center block rounded-xl sm:rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all mt-2"
                  >
                    پیشنهاد متن پیامک
                  </Link>
                </>
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
  const [selectedMessageType, setSelectedMessageType] = useState<
    "all" | "cancel" | "info"
  >("all");

  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showConfirmStep, setShowConfirmStep] = useState(false);

  const [newBusinessName, setNewBusinessName] = useState("");
  const [newBusinessAddress, setNewBusinessAddress] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);

  const { data: templatesData, isLoading: isLoadingTemplates } =
    useSmsTemplates();

  const bulkTemplates = useMemo(() => {
    let templates =
      templatesData?.templates?.filter(
        (t: any) => t.type === "bulk" || t.type === "generic",
      ) || [];

    if (selectedMessageType !== "all") {
      templates = templates.filter(
        (t: any) => t.sub_type === selectedMessageType,
      );
    }

    return templates;
  }, [templatesData, selectedMessageType]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch("/api/client/jobs/list");
        const data = await res.json();
        if (data.jobs) {
          setJobs(data.jobs);
        }
      } catch (err) {
        console.error("خطا در دریافت مشاغل:", err);
      }
    };
    if (isOpen) {
      fetchJobs();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setNewBusinessName(businessName || "");
      setNewBusinessAddress(businessAddress || "");
      setSelectedIds([]);
      setSelectedTemplate(null);
      setSelectedMessageType("all");
    }
  }, [isOpen, businessName, businessAddress]);

  const formatPreview = (text: string | null | undefined) => {
    if (!text) return "متنی انتخاب نشده است...";
    return text
      .replace(/%name%/g, "[نام مشتری]")
      .replace(/%date%/g, "[تاریخ نوبت]")
      .replace(/%time%/g, "[ساعت نوبت]")
      .replace(/%service%/g, "[نام خدمت]")
      .replace(/%link%/g, "ontimeapp.ir/fsdvf")
      .replace(/%salon%/g, "[نام کسب و کار]")
      .replace(/%address%/g, "[آدرس کسب و کار]")
      .replace(/%phone%/g, "[شماره تماس کسب و کار]");
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
            key="bulk-sms-modal"
            className="fixed inset-0 z-[999] flex items-end justify-center sm:items-center p-3 sm:p-4"
            dir="rtl"
          >
            <motion.div
              key="bulk-sms-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm"
              onClick={onClose}
            />

            <motion.div
              key="bulk-sms-container"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full max-w-[95%] sm:max-w-md bg-white dark:bg-gradient-to-br dark:from-[#1a1e26] dark:to-[#151920] rounded-2xl sm:rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-2xl flex flex-col h-[90vh] sm:h-[85vh] overflow-hidden"
            >
              <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-gradient-to-r from-slate-50 to-transparent dark:bg-gradient-to-r dark:from-white/5 dark:to-transparent shrink-0 backdrop-blur-sm">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <Users size={16} className="text-white sm:size-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-lg font-bold text-slate-800 dark:text-white">
                      {title}
                    </h3>
                    <p className="text-[8px] sm:text-[10px] text-slate-500 dark:text-gray-500 mt-0.5">
                      ارسال پیامک گروهی
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 sm:w-10 sm:h-10 p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white transition-all duration-200"
                >
                  <X size={16} className="sm:size-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-4 sm:p-5 space-y-4 sm:space-y-5">
                  <div className="shrink-0">
                    <label className="block text-[10px] sm:text-xs text-slate-500 dark:text-gray-500 mb-1.5 sm:mb-2 mr-1">
                      نوع پیام همگانی
                    </label>
                    <div className="flex gap-2 sm:gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedMessageType("all")}
                        className={`flex-1 py-2 sm:py-3 rounded-xl text-[10px] sm:text-xs font-medium transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 ${
                          selectedMessageType === "all"
                            ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20"
                            : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-white/10"
                        }`}
                      >
                        <Layers size={12} className="sm:size-4" />
                        همه
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedMessageType("info")}
                        className={`flex-1 py-2 sm:py-3 rounded-xl text-[10px] sm:text-xs font-medium transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 ${
                          selectedMessageType === "info"
                            ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20"
                            : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-white/10"
                        }`}
                      >
                        <Bell size={12} className="sm:size-4" />
                        اطلاع‌رسانی
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedMessageType("cancel")}
                        className={`flex-1 py-2 sm:py-3 rounded-xl text-[10px] sm:text-xs font-medium transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 ${
                          selectedMessageType === "cancel"
                            ? "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/20"
                            : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-white/10"
                        }`}
                      >
                        <AlertTriangle size={12} className="sm:size-4" />
                        کنسلی
                      </button>
                    </div>
                    <p className="text-[8px] sm:text-[10px] text-slate-500 dark:text-gray-500 mt-1.5 sm:mt-2 text-center">
                      {selectedMessageType === "cancel"
                        ? "پیام‌های کنسلی برای اطلاع از لغو نوبت‌ها استفاده می‌شوند"
                        : selectedMessageType === "info"
                        ? "پیام‌های اطلاع‌رسانی برای ارتباط عمومی با مشتریان استفاده می‌شوند"
                        : "نمایش همه الگوهای همگانی"}
                    </p>
                  </div>

                  <div className="shrink-0">
                    <AnimatePresence mode="wait">
                      {!selectedTemplate ? (
                        <motion.button
                          key="select"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          onClick={() => setShowTemplateModal(true)}
                          className="w-full bg-white dark:bg-gradient-to-r dark:from-white/5 dark:to-transparent border border-dashed border-slate-300 dark:border-white/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center justify-between group hover:border-emerald-500/40 hover:bg-slate-50 dark:hover:bg-white/10 transition-all duration-300"
                        >
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 transition-all">
                              <MessageSquare
                                size={14}
                                className="text-slate-500 dark:text-gray-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors sm:size-4"
                              />
                            </div>
                            <div className="text-right">
                              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">
                                انتخاب الگوی پیامک
                              </span>
                              <p className="text-[8px] sm:text-[10px] text-slate-500 dark:text-gray-500">
                                از بین الگوهای موجود انتخاب کنید
                              </p>
                            </div>
                          </div>
                          <ChevronLeft
                            size={14}
                            className="text-slate-400 dark:text-gray-600 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:-translate-x-1 transition-all duration-200 sm:size-4"
                          />
                        </motion.button>
                      ) : (
                        <motion.div
                          key="selected"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-emerald-500/30 relative overflow-hidden"
                        >
                          <div className="absolute top-0 left-0 w-full h-0.5 sm:h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                          <div className="flex justify-between items-center mb-2 sm:mb-3">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                                <FileText
                                  size={10}
                                  className="text-emerald-600 dark:text-emerald-400 sm:size-3"
                                />
                              </div>
                              <span className="text-[9px] sm:text-[11px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-tighter">
                                الگوی انتخاب شده
                              </span>
                            </div>
                            <button
                              onClick={() => setSelectedTemplate(null)}
                              className="text-red-600 dark:text-red-400 p-1 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all duration-200"
                            >
                              <X size={12} className="sm:size-3.5" />
                            </button>
                          </div>

                          <div className="flex justify-between text-[8px] sm:text-[10px] text-slate-500 dark:text-gray-500 mb-2 sm:mb-3 pb-1.5 sm:pb-2 border-b border-slate-200 dark:border-white/10">
                            <span>تعداد پیامک هر گیرنده:</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                              {smsPerMessage}
                            </span>
                          </div>

                          <div className="bg-slate-100 dark:bg-black/20 rounded-lg sm:rounded-xl p-2 sm:p-3 max-h-28 sm:max-h-40 overflow-y-auto">
                            <div className="text-[9px] sm:text-[11px] text-slate-700 dark:text-gray-300 leading-relaxed">
                              {formatPreview(selectedTemplate.content)
                                .split("\n")
                                .slice(0, 2)
                                .map(
                                  (paragraph: string, idx: number) =>
                                    paragraph.trim() && (
                                      <p
                                        key={`selected-para-${idx}`}
                                        className="mb-1 last:mb-0"
                                      >
                                        {paragraph}
                                      </p>
                                    ),
                                )}
                              {(selectedTemplate.content?.split("\n").length || 0) > 2 && (
                                <span className="text-emerald-500/70 text-[8px] mt-1 inline-block">
                                  ... ادامه
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <CheckCircle2 size={12} className="text-emerald-500 sm:size-3.5" />
                        <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-gray-400">
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
                        className="text-emerald-600 dark:text-emerald-400 text-[9px] sm:text-[11px] hover:underline font-bold transition-all hover:text-emerald-700 dark:hover:text-emerald-300"
                      >
                        {selectedIds.length === recipients.length
                          ? "لغو همه"
                          : "انتخاب همه"}
                      </button>
                    </div>

                    <div className="space-y-1.5 sm:space-y-2 max-h-40 sm:max-h-56 overflow-y-auto custom-scrollbar pr-0.5 sm:pr-1">
                      {recipients.map((item, index) => (
                        <motion.div
                          layout
                          key={`recipient-${item.id}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.02 }}
                          onClick={() =>
                            setSelectedIds((prev) =>
                              prev.includes(item.id)
                                ? prev.filter((id) => id !== item.id)
                                : [...prev, item.id],
                            )
                          }
                          className={`flex items-center justify-between p-2 sm:p-3 rounded-lg sm:rounded-xl border transition-all duration-200 cursor-pointer ${
                            selectedIds.includes(item.id)
                              ? "bg-gradient-to-r from-emerald-500/15 to-emerald-500/5 border-emerald-500/40 shadow-lg shadow-emerald-500/10"
                              : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20"
                          }`}
                        >
                          <div className="flex items-center gap-2 sm:gap-3 flex-1">
                            <div
                              className={`w-4 h-4 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                                selectedIds.includes(item.id)
                                  ? "bg-emerald-500 border-emerald-500"
                                  : "border-slate-400 dark:border-white/30"
                              }`}
                            >
                              {selectedIds.includes(item.id) && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                >
                                  <CheckCircle2
                                    size={9}
                                    className="text-white sm:size-3"
                                  />
                                </motion.div>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-slate-800 dark:text-white text-xs sm:text-sm font-bold">
                                {item.name}
                              </p>
                              {item.details && (
                                <p className="text-[8px] sm:text-[10px] text-slate-500 dark:text-gray-500 mt-0.5 truncate max-w-[150px] sm:max-w-[200px]">
                                  {item.details}
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-5 border-t border-slate-200 dark:border-white/10 bg-gradient-to-t from-white to-transparent dark:from-[#1a1e26] dark:to-transparent shrink-0">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleStepClick}
                  disabled={
                    isSending || selectedIds.length === 0 || !selectedTemplate
                  }
                  className="w-full py-3 sm:py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-slate-300 dark:disabled:from-gray-700 disabled:to-slate-300 dark:disabled:to-gray-700 disabled:opacity-50 rounded-xl sm:rounded-2xl font-black text-white flex items-center justify-center gap-2 sm:gap-3 shadow-xl shadow-emerald-500/20 transition-all duration-300 text-xs sm:text-base"
                >
                  <Send size={14} className="-rotate-45 sm:size-4" />
                  تأیید و ادامه ({selectedIds.length} نفر)
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showConfirmStep && (
          <div
            key="confirm-step-modal"
            className="fixed inset-0 z-[1200] flex items-center justify-center p-3 sm:p-4"
            dir="rtl"
          >
            <motion.div
              key="confirm-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 dark:bg-black/90 backdrop-blur-md"
              onClick={() => setShowConfirmStep(false)}
            />
            <motion.div
              key="confirm-container"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-[90%] sm:max-w-md bg-white dark:bg-gradient-to-br dark:from-[#1a1e26] dark:to-[#151920] rounded-xl sm:rounded-2xl border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-2xl overflow-hidden"
            >
              <div className="p-4 sm:p-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: 360 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                  className="w-14 h-14 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full flex items-center justify-center mb-3 sm:mb-4"
                >
                  <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                    <Info size={20} className="text-white sm:size-7" />
                  </div>
                </motion.div>

                <h4 className="text-base sm:text-xl font-black text-slate-800 dark:text-white mb-1 sm:mb-2">
                  تأیید نهایی ارسال
                </h4>

                <p className="text-gray-500 dark:text-gray-400 text-[11px] sm:text-sm mb-4 sm:mb-6 leading-relaxed">
                  {selectedMessageType === "cancel"
                    ? "در حال ارسال پیامک کنسلی نوبت به صورت گروهی هستید."
                    : "در حال ارسال پیامک اطلاع‌رسانی به صورت گروهی هستید."}
                </p>

                <div className="bg-slate-100 dark:bg-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center text-[11px] sm:text-sm">
                    <span className="text-slate-500 dark:text-gray-400">تعداد گیرندگان:</span>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Users size={12} className="text-emerald-600 dark:text-emerald-400 sm:size-3.5" />
                      <span className="text-slate-800 dark:text-white font-bold">
                        {selectedIds.length} نفر
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[11px] sm:text-sm">
                    <span className="text-slate-500 dark:text-gray-400">پیامک هر نفر:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {smsPerMessage} واحد
                    </span>
                  </div>

                  <div className="pt-2 sm:pt-3 border-t border-slate-200 dark:border-white/10">
                    <div className="flex justify-between items-center text-xs sm:text-base font-bold">
                      <span className="text-slate-600 dark:text-gray-300">جمع کل مصرفی:</span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {totalSmsCost} واحد
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={() => setShowConfirmStep(false)}
                    className="flex-1 py-2.5 sm:py-3 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 rounded-lg sm:rounded-xl font-bold text-slate-600 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white transition-all duration-200 text-[11px] sm:text-sm"
                  >
                    بازگشت
                  </button>
                  <button
                    onClick={executeSend}
                    disabled={isSending}
                    className="flex-[2] py-2.5 sm:py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-lg sm:rounded-xl font-black text-white flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all duration-200 disabled:opacity-60 text-[11px] sm:text-sm"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="animate-spin w-4 h-4 sm:w-5 sm:h-5" />
                        در حال ارسال...
                      </>
                    ) : (
                      <>
                        <Send size={14} className="-rotate-45 sm:size-4" />
                        تایید و ارسال
                      </>
                    )}
                  </button>
                </div>
              </div>
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
        jobs={jobs}
        selectedSubType={
          selectedMessageType !== "all" ? selectedMessageType : "all"
        }
      />

      <AnimatePresence>
        {showBusinessModal && (
          <div
            key="business-modal"
            className="fixed inset-0 z-[1200] flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div
              key="business-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 dark:bg-black/95 backdrop-blur-md"
              onClick={() => setShowBusinessModal(false)}
            />
            <motion.div
              key="business-container"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative w-full max-w-[90%] sm:max-w-sm bg-white dark:bg-gradient-to-br dark:from-[#1e232d] dark:to-[#161a22] rounded-2xl sm:rounded-3xl border border-emerald-500/30 p-5 sm:p-6 shadow-xl dark:shadow-2xl"
            >
              <div className="w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                  <Building2 size={20} className="text-white sm:size-7" />
                </div>
              </div>

              <h4 className="text-base sm:text-xl font-bold text-slate-800 dark:text-white mb-1 sm:mb-2 text-center">
                تکمیل اطلاعات بیزنس
              </h4>

              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-gray-500 mb-4 sm:mb-6 text-center">
                برای ارسال پیامک، وارد کردن نام و آدرس الزامی است.
              </p>

              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div className="relative group">
                  <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-gray-500 group-hover:text-emerald-400 transition-colors">
                    <Building2 size={14} className="sm:size-4" />
                  </div>
                  <input
                    type="text"
                    value={newBusinessName}
                    onChange={(e) => setNewBusinessName(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl sm:rounded-2xl py-3 sm:py-4 pr-9 sm:pr-12 pl-3 sm:pl-4 text-right text-slate-800 dark:text-white outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-white/10 font-bold transition-all duration-200 text-xs sm:text-sm"
                    placeholder="نام بیزنس (مثلاً: سالن مریم)"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute right-3 sm:right-4 top-3 sm:top-5 text-slate-500 dark:text-gray-500 group-hover:text-emerald-400 transition-colors">
                    <MapPin size={14} className="sm:size-4" />
                  </div>
                  <textarea
                    rows={2}
                    value={newBusinessAddress}
                    onChange={(e) => setNewBusinessAddress(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl sm:rounded-2xl py-3 sm:py-4 pr-9 sm:pr-12 pl-3 sm:pl-4 text-right text-slate-800 dark:text-white outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-white/10 font-bold transition-all duration-200 text-xs sm:text-sm resize-none"
                    placeholder="آدرس دقیق بیزنس..."
                  />
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={() => setShowBusinessModal(false)}
                  className="flex-1 py-2.5 sm:py-4 text-slate-500 dark:text-gray-500 font-bold hover:text-slate-700 dark:hover:text-white transition-colors duration-200 text-[11px] sm:text-sm"
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
                  className="flex-[2] py-2.5 sm:py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl sm:rounded-2xl text-white font-black flex items-center justify-center shadow-lg active:scale-95 transition-all duration-200 disabled:opacity-60 text-[11px] sm:text-sm"
                >
                  {isUpdatingProfile ? (
                    <Loader2 className="animate-spin w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    "تأیید و ادامه"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.4);
        }
        @media (max-width: 480px) {
          .custom-scrollbar::-webkit-scrollbar {
            width: 2px;
          }
        }
      `}</style>
    </>
  );
};