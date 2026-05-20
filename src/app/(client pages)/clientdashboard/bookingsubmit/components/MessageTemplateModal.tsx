"use client";

import React, { useState, useMemo } from "react";
import { X, MessageCircle, Loader2, Check, Briefcase, Hash, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface SmsTemplate {
  id: number;
  title: string;
  content: string;
  payamresan_id: string;
  message_count?: number;
  job_id?: number | null;
  job_name?: string;
}

interface MessageTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: SmsTemplate[];
  onSelect: (data: { content: string; pattern: string; message_count?: number }) => void;
  formatPreviewMessage: (text: string) => string;
  title: string;
  isLoading?: boolean;
  jobs?: Array<{ id: number; persian_name: string; english_name: string }>;
}

const MessageTemplateModal: React.FC<MessageTemplateModalProps> = ({
  isOpen,
  onClose,
  templates,
  onSelect,
  title,
  formatPreviewMessage,
  isLoading = false,
  jobs = [],
}) => {
  const [selectedJobId, setSelectedJobId] = useState<number | "all" | "none">("all");

  const calculateSmsCount = (template: SmsTemplate): number => {
    if (template.message_count) return template.message_count;
    return Math.ceil(template.content.length / 70) || 1;
  };

  // گروه‌بندی الگوها بر اساس job_id
  const groupedTemplates = useMemo(() => {
    const groups: { [key: string]: SmsTemplate[] } = {
      all: [],
      none: [],
    };

    templates.forEach((template) => {
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
  }, [templates]);

  // آمار تعداد الگوها برای هر دسته
  const categoryStats = useMemo(() => {
    const stats: { [key: string]: number } = {
      all: templates.length,
      none: groupedTemplates.none?.length || 0,
    };
    jobs.forEach((job) => {
      stats[job.id.toString()] = groupedTemplates[job.id.toString()]?.length || 0;
    });
    return stats;
  }, [templates.length, jobs, groupedTemplates]);

  // لیست دسته‌بندی‌هایی که حداقل یک الگو دارند
  const availableCategories = useMemo(() => {
    const categories = [];
    
    // گزینه "همه" - همیشه نمایش داده می‌شود اگر الگویی وجود داشته باشد
    if (categoryStats.all > 0) {
      categories.push({ id: "all", name: "همه", icon: Layers, count: categoryStats.all });
    }
    
    // گزینه "عمومی" - الگوهایی که job_id ندارند
    if (categoryStats.none > 0) {
      categories.push({ id: "none", name: "عمومی", icon: Hash, count: categoryStats.none });
    }
    
    // گزینه‌های شغلی که حداقل یک الگو دارند
    jobs.forEach((job) => {
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
    <AnimatePresence mode="wait">
      {isOpen && (
        <div
          key="msg-template-overlay"
          className="fixed z-[999] inset-0 flex max-w-md m-auto items-center justify-center p-4"
        >
          <motion.div
            key="msg-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0f1115]/90 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            key="msg-modal-body"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl z-[1000]"
          >
            <div className="bg-gradient-to-br from-[#1a1e26] to-[#151920] border border-white/10 rounded-[2rem] shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/5 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      {title}
                    </h3>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {templates.length} الگوی پیامک موجود
                    </p>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all group"
                >
                  <X className="w-5 h-5 text-gray-400 group-hover:text-white" />
                </motion.button>
              </div>

              {/* Categories Tabs */}
              {availableCategories.length > 0 && (
                <div className="border-b border-white/10 bg-white/2">
                  <div className="p-4 pb-2 overflow-x-auto custom-scrollbar">
                    <div className="flex gap-2 min-w-max">
                      {availableCategories.map((category) => (
                        <motion.button
                          key={category.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedJobId(category.id as any)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                            selectedJobId === category.id
                              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20"
                              : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          <category.icon size={16} />
                          <span>{category.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                            selectedJobId === category.id
                              ? "bg-white/20 text-white"
                              : "bg-white/10 text-gray-500"
                          }`}>
                            {category.count}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="relative">
                      <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                      <div className="absolute inset-0 blur-xl bg-emerald-500/20 animate-pulse" />
                    </div>
                    <p className="text-gray-400 mt-4 text-sm font-medium">
                      در حال دریافت الگوها...
                    </p>
                  </div>
                ) : currentTemplates.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20 bg-white/2 rounded-2xl border border-dashed border-white/10"
                  >
                    <MessageCircle className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">
                      در این دسته الگویی وجود ندارد
                    </p>
                    <p className="text-xs text-gray-600 mt-2">
                      دسته دیگری را انتخاب کنید یا الگوی جدید بسازید
                    </p>
                  </motion.div>
                ) : (
                  <div className="grid gap-3">
                    {currentTemplates.map((template, index) => (
                      <motion.button
                        key={template.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        whileHover={{ scale: 1.01, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          onSelect({
                            content: template.content,
                            pattern: template.payamresan_id,
                            message_count: template.message_count,
                          });
                          onClose();
                        }}
                        className="group relative w-full text-right transition-all"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-emerald-500/0 rounded-xl transition-all" />
                        
                        <div className="relative p-4 space-y-2 bg-white/3 rounded-xl border border-white/5 hover:border-emerald-500/30 transition-all">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                                {template.title}
                              </span>
                              {template.job_id && template.job_name && (
                                <span className="text-cyan-400 text-[10px] font-medium bg-cyan-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Briefcase size={10} />
                                  {template.job_name}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="flex items-center gap-1 text-[10px] text-gray-500 bg-white/5 px-2 py-1 rounded-full">
                                <MessageCircle size={10} />
                                <span>{calculateSmsCount(template)} پیامک</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line line-clamp-3 group-hover:text-white transition-colors">
                              {formatPreviewMessage(template.content)}
                            </p>
                          </div>

                          <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-all duration-200">
                            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold bg-emerald-500/10 px-3 py-1.5 rounded-full">
                              <Check className="w-3.5 h-3.5" />
                              <span>انتخاب این الگو</span>
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
                              <div className="w-full mt-8 flex justify-center items-center">
 <Link
                  href={"../clientdashboard/sms-suggestions"}
                  className=" text-[11px] w-full border py-3 text-gray-400  text-center m-auto rounded-2xl"
                >
                  پیشنهاد متن پیامک
                </Link> 
              </div>
              </div>

              {/* Footer */}
              <div className="p-3 bg-white/2 border-t border-white/5">
                <div className="flex items-center justify-between text-[10px] text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>متغیرها هنگام ارسال جایگزین می‌شوند</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase size={10} />
                    <span>دسته‌بندی بر اساس نوع کسب‌وکار</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.4);
        }
      `}</style>
    </AnimatePresence>
  );
};

export default MessageTemplateModal;