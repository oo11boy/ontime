import React from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";

interface SmsModalProps {
  isOpen: boolean;
  customerName: string;
  message: string;
  sendingSms: boolean;
  onClose: () => void;
  onMessageChange: (value: string) => void;
  onSend: () => void;
}

export const SmsModal: React.FC<SmsModalProps> = ({
  isOpen,
  customerName,
  message,
  sendingSms,
  onClose,
  onMessageChange,
  onSend,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#242933] rounded-2xl p-6 max-w-md w-full shadow-xl dark:shadow-2xl border border-emerald-300 dark:border-emerald-500/30"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-bold flex items-center gap-3 text-slate-800 dark:text-white">
            <MessageCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            ارسال پیامک به {customerName}
          </h3>
          <button onClick={onClose} className="text-slate-400 dark:text-gray-400 hover:text-slate-600 dark:hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        <textarea
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="متن پیامک را اینجا بنویسید..."
          className="w-full bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-400 focus:outline-none focus:border-emerald-500/50 h-40 resize-none"
          dir="rtl"
        />
        <div className="flex gap-3 mt-5">
          <button
            onClick={onSend}
            disabled={!message.trim() || sendingSms}
            className={`flex-1 py-3.5 rounded-xl font-bold transition-all ${
              message.trim() && !sendingSms
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
                : "bg-slate-200 dark:bg-gray-600 text-slate-500 dark:text-gray-400 cursor-not-allowed"
            } flex items-center justify-center gap-2`}
          >
            {sendingSms ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            {sendingSms ? "در حال ارسال..." : "ارسال پیامک"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3.5 bg-slate-100 dark:bg-white/10 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-white/20 transition text-slate-700 dark:text-white"
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
};