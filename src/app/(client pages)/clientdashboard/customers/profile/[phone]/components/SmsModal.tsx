// components/CustomerProfile/SmsModal.tsx
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
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#242933] rounded-2xl p-6 max-w-md w-full shadow-2xl border border-emerald-500/30"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-bold flex items-center gap-3">
            <MessageCircle className="w-6 h-6 text-emerald-400" />
            ارسال پیامک به {customerName}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        <textarea
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="متن پیامک را اینجا بنویسید..."
          className="w-full bg-white/10 border border-white/10 rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 h-40 resize-none"
          dir="rtl"
        />
        <div className="flex gap-3 mt-5">
          <button
            onClick={onSend}
            disabled={!message.trim() || sendingSms}
            className={`flex-1 py-3.5 rounded-xl font-bold transition-all ${
              message.trim() && !sendingSms
                ? "bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
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
            className="flex-1 py-3.5 bg-white/10 rounded-xl font-medium hover:bg-white/20 transition"
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
};