"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Search,
  FileText,
  MessageSquare,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Template {
  id: number;
  title: string;
  content: string;
  payamresan_id: string;
  message_count?: number;
  sub_type?: string;
}

interface TemplateSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: Template[];
  isLoading?: boolean;
  onSelect: (template: {
    key: string;
    content: string;
    message_count: number;
    title: string;
  }) => void;
  businessName?: string | null;
  businessAddress?: string | null;
}

const formatPreviewMessage = (
  text: string,
  businessName?: string | null,
  businessAddress?: string | null
) => {
  if (!text) return "متنی انتخاب نشده است...";

  let formattedText = text
    .replace(/%name%/g, "[نام مشتری]")
    .replace(/%date%/g, "[تاریخ نوبت]")
    .replace(/%time%/g, "[ساعت نوبت]")
    .replace(/%service%/g, "[نام خدمت]")
    .replace(/%link%/g, "ontimeapp.ir/fsdvf")
    .replace(/%salon%/g, businessName || "[نام کسب و کار]")
    .replace(/%address%/g, businessAddress || "[آدرس کسب و کار]")
    .replace(/%phone%/g, "[شماره تماس کسب و کار]");

  return formattedText;
};

export const TemplateSelectionModal: React.FC<TemplateSelectionModalProps> = ({
  isOpen,
  onClose,
  templates,
  isLoading = false,
  onSelect,
  businessName,
  businessAddress,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);

  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return templates;
    return templates.filter((template) =>
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [templates, searchQuery]);

  const handleSelect = (template: Template) => {
    setSelectedTemplateId(template.id);
    setTimeout(() => {
      onSelect({
        key: template.payamresan_id,
        content: template.content,
        message_count: template.message_count || 1,
        title: template.title,
      });
      onClose();
    }, 200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          key="template-selection-modal"
          className="fixed inset-0 z-[1100] flex items-center justify-center p-4"
          dir="rtl"
        >
          <motion.div
            key="template-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 dark:bg-black/90 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            key="template-modal-container"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-white dark:bg-gradient-to-br dark:from-[#1a1e26] dark:to-[#151920] border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-xl dark:shadow-2xl flex flex-col h-[85vh] overflow-hidden"
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 backdrop-blur-sm shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
                  <MessageSquare size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                    انتخاب الگوی پیامک کنسلی
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-gray-500 mt-0.5">
                    {templates.length} الگوی کنسلی موجود
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white transition-all duration-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 border-b border-slate-200 dark:border-white/10 bg-white/2 shrink-0">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="جستجوی الگو..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 pr-10 pl-4 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-rose-500/50 transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="relative">
                    <Loader2 className="w-10 h-10 text-rose-500 animate-spin" />
                    <div className="absolute inset-0 blur-xl bg-rose-500/20 animate-pulse" />
                  </div>
                  <p className="text-slate-500 dark:text-gray-400 mt-4 text-sm">در حال بارگذاری الگوها...</p>
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-300 dark:border-gray-700">
                  <MessageSquare className="w-12 h-12 text-slate-400 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-gray-500 text-sm">
                    {searchQuery ? "الگویی با این عبارت یافت نشد" : "هیچ الگوی کنسلی یافت نشد"}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-gray-600 mt-2">
                    لطفاً ابتدا الگو ایجاد کنید
                  </p>
                </div>
              ) : (
                filteredTemplates.map((template, index) => (
                  <motion.button
                    key={`template-${template.id}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelect(template)}
                    className={`w-full text-right transition-all duration-200 ${
                      selectedTemplateId === template.id
                        ? "ring-2 ring-rose-500/50"
                        : ""
                    }`}
                  >
                    <div
                      className={`p-4 rounded-xl border transition-all ${
                        selectedTemplateId === template.id
                          ? "bg-gradient-to-br from-rose-500/15 to-rose-500/5 border-rose-500/40 shadow-lg shadow-rose-500/10"
                          : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 hover:border-rose-500/30"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              selectedTemplateId === template.id
                                ? "bg-rose-500/20"
                                : "bg-slate-200 dark:bg-white/10"
                            }`}
                          >
                            <FileText
                              className={`w-4 h-4 ${
                                selectedTemplateId === template.id
                                  ? "text-rose-600 dark:text-rose-400"
                                  : "text-slate-500 dark:text-gray-500"
                              }`}
                            />
                          </div>
                          <div className="text-right">
                            <span
                              className={`text-sm font-bold ${
                                selectedTemplateId === template.id
                                  ? "text-rose-600 dark:text-rose-400"
                                  : "text-slate-800 dark:text-white"
                              }`}
                            >
                              {template.title}
                            </span>
                            {template.sub_type === "cancel" && (
                              <div className="flex items-center gap-1 mt-1">
                                <AlertTriangle size={10} className="text-rose-600 dark:text-red-400" />
                                <span className="text-[9px] text-rose-600 dark:text-red-400">الگوی کنسلی</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <span className="text-[9px] text-slate-500 dark:text-gray-500 bg-slate-200 dark:bg-white/5 px-2 py-1 rounded-full">
                          {template.message_count || 1} پیامک
                        </span>
                      </div>

                      <div className="bg-slate-100 dark:bg-black/30 rounded-xl p-3">
                        <div className="text-[11px] text-slate-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                          {formatPreviewMessage(template.content, businessName, businessAddress)
                            .split("\n")
                            .map((paragraph: string, idx: number) =>
                              paragraph.trim() ? (
                                <p key={`${template.id}-para-${idx}`} className="mb-2 last:mb-0">
                                  {paragraph}
                                </p>
                              ) : null
                            )}
                        </div>
                      </div>

                      {selectedTemplateId === template.id && (
                        <div className="mt-3 flex justify-end">
                          <span className="text-[10px] text-rose-600 dark:text-rose-400 flex items-center gap-1">
                            <CheckCircle2 size={12} />
                            انتخاب شده
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/2 shrink-0">
              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>الگوهای کنسلی برای اطلاع از لغو نوبت‌ها</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare size={10} />
                  <span>{filteredTemplates.length} الگو</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const styles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
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
    background: rgba(239, 68, 68, 0.4);
  }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default TemplateSelectionModal;