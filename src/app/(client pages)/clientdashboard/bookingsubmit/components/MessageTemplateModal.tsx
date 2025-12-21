"use client";

import React from "react";
import { X, MessageCircle, Loader2 } from "lucide-react";

interface SmsTemplate {
  id: number;
  title: string;
  content: string;
}

interface MessageTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: SmsTemplate[];
  onSelect: (content: string) => void;
  title: string;
  isLoading?: boolean; // جدید: برای نمایش حالت لودینگ
}

const MessageTemplateModal: React.FC<MessageTemplateModalProps> = ({
  isOpen,
  onClose,
  templates,
  onSelect,
  title,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  // محاسبه تعداد پیامک (هر 70 کاراکتر فارسی = 1 پیامک)
  const calculateSmsCount = (text: string): number => {
    const length = text.length;
    return Math.ceil(length / 70);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md animate-in slide-in-from-bottom-4 duration-300">
        <div className="bg-linear-to-b from-[#1a1e26] to-[#242933] backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <button
              onClick={onClose}
              className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-96 overflow-y-auto custom-scrollbar">
            {isLoading ? (
              // حالت لودینگ
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mb-4" />
                <p className="text-gray-400">در حال بارگذاری قالب‌ها...</p>
              </div>
            ) : templates.length === 0 ? (
              // حالت خالی
              <div className="text-center py-16">
                <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">قالب پیامکی یافت نشد</p>
              </div>
            ) : (
              <>
                <p className="text-xs text-gray-500 text-center mb-6 py-2">
                  — یا یکی از پیام‌های آماده را انتخاب کنید —
                </p>

                <div className="space-y-4">
                  {templates.map((template) => {
                    const smsCount = calculateSmsCount(template.content);

                    return (
                      <button
                        key={template.id}
                        onClick={() => {
                          onSelect(template.content);
                          onClose();
                        }}
                        className="w-full group"
                      >
                        <div className="bg-white/5 hover:bg-white/10 rounded-2xl p-6 border border-white/10 transition-all hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-[0.98]">
                          {/* عنوان و برچسب آماده */}
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-emerald-300 text-lg">
                              {template.title}
                            </h4>
                            <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 text-xs font-medium rounded-full border border-emerald-500/30">
                              آماده
                            </span>
                          </div>

                          {/* پیش‌نمایش متن (با جایگزینی متغیرها) */}
                          <div className="bg-linear-to-r from-emerald-600/15 to-emerald-500/10 rounded-2xl rounded-tl-none p-5 mb-4 border-l-4 border-emerald-400/50 text-right">
                            <p className="text-sm leading-relaxed text-gray-100 whitespace-pre-line">
                              {template.content.replace(/{[^}]+}/g, "—")}
                            </p>
                          </div>

                          {/* تعداد پیامک و آیکون */}
                          <div className="flex items-center justify-between pt-2">
                            <span className="text-xs text-gray-500">
                              این متن{" "}
                              <span className="text-emerald-400 font-bold">
                                {smsCount}
                              </span>{" "}
                              پیامک
                            </span>
                            <div className="w-8 h-8 bg-emerald-500/20 rounded-xl flex items-center justify-center group-hover:bg-emerald-500/30 transition">
                              <MessageCircle className="w-4 h-4 text-emerald-400" />
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* اسکرول‌بار سفارشی */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
};

export default MessageTemplateModal;