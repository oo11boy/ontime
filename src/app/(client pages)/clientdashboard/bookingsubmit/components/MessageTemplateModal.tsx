"use client";
import React from "react";
import { X, MessageCircle } from "lucide-react";

interface MessageTemplate {
  title: string;
  text: string;
  length: number;
}

interface MessageTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: MessageTemplate[];
  onSelect: (text: string) => void;
  title: string;
}

const MessageTemplateModal: React.FC<MessageTemplateModalProps> = ({
  isOpen,
  onClose,
  templates,
  onSelect,
  title,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md animate-in slide-in-from-bottom-4 duration-300">
        <div className="bg-linear-to-b from-[#1a1e26] to-[#242933] backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <button
              onClick={onClose}
              className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="px-6 pb-10 max-h-96 overflow-y-auto custom-scrollbar">
            <p className="text-xs text-gray-500 text-center mb-6 py-2">
              — یا یکی از پیام‌های آماده را انتخاب کنید —
            </p>
            <div className="space-y-4">
              {templates.map((msg, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onSelect(msg.text);
                    onClose();
                  }}
                  className="w-full group"
                >
                  <div className="bg-white/5 hover:bg-white/10 rounded-2xl p-6 border border-white/10 transition-all hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-[0.98]">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-emerald-300 text-lg">{msg.title}</h4>
                      <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 text-xs font-medium rounded-full border border-emerald-500/30">
                        آماده
                      </span>
                    </div>
                    <div className="bg-linear-to-r from-emerald-600/15 to-emerald-500/10 rounded-2xl rounded-tl-none p-5 mb-4 border-l-4 border-emerald-400/50 text-right">
                      <p className="text-sm leading-relaxed text-gray-100 whitespace-pre-line">
                        {msg.text.replace(/{[^}]+}/g, "---")}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-gray-500">
                        این متن <span className="text-emerald-400 font-bold">{msg.length}</span> پیامک
                      </span>
                      <div className="w-8 h-8 bg-emerald-500/20 rounded-xl flex items-center justify-center group-hover:bg-emerald-500/30">
                        <MessageCircle className="w-4 h-4 text-emerald-400" />
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
};

export default MessageTemplateModal;