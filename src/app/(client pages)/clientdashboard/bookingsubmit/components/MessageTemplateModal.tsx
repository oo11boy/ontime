"use client";

import React from "react";
import { X, MessageCircle, Loader2, Check } from "lucide-react";

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
  formatPreviewMessage:any,
  title: string;
  isLoading?: boolean;
}



const MessageTemplateModal: React.FC<MessageTemplateModalProps> = ({
  isOpen,
  onClose,
  templates,
  onSelect,
  title,
  formatPreviewMessage,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const calculateSmsCount = (text: string): number => {
    return Math.ceil(text.length / 70) || 1;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:items-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0f1115]/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg animate-in fade-in zoom-in-95 slide-in-from-bottom-10 duration-300">
        <div className="bg-[#1a1e26] border border-white/10 rounded-[2.5rem] shadow-2xl max-h-[85vh] flex flex-col overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors group"
            >
              <X className="w-5 h-5 text-gray-400 group-hover:text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="relative">
                  <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                  <div className="absolute inset-0 blur-xl bg-emerald-500/20 animate-pulse" />
                </div>
                <p className="text-gray-400 mt-4 text-sm font-medium">در حال دریافت الگوها...</p>
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-20 bg-white/2 rounded-3xl border border-dashed border-white/10">
                <MessageCircle className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">لیست الگوها خالی است</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      onSelect(template.content);
                      onClose();
                    }}
                    className="group relative w-full text-right transition-all active:scale-[0.98]"
                  >
                    <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/3 rounded-3xl transition-colors border border-white/5 group-hover:border-emerald-500/30" />
                    
                    <div className="relative p-5 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-400 text-xs font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                          {template.title}
                        </span>
                        <div className="flex items-center gap-1.5">
                           <span className="text-[10px] text-gray-500 font-medium">
                             {calculateSmsCount(template.content)} پیامک
                           </span>
                           <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                        </div>
                      </div>

                      <div className="bg-[#0f1115]/50 rounded-2xl p-4 border border-white/3">
                        <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line group-hover:text-white transition-colors">
                          {formatPreviewMessage(template.content)}
                        </p>
                      </div>

                      <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                         <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                           <span>انتخاب این الگو</span>
                           <Check className="w-3.5 h-3.5" />
                         </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer Note */}
          <div className="p-4 bg-white/2 border-t border-white/5 text-center">
            <p className="text-[10px] text-gray-500">
              متغیرهایی مثل تاریخ و ساعت هنگام ارسال به صورت خودکار جایگزین می‌شوند.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.3);
        }
      `}</style>
    </div>
  );
};

export default MessageTemplateModal;