"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { XCircle, X, Loader2 } from "lucide-react";

interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isProcessing: boolean;
}

export function CancelBookingModal({ isOpen, onClose, onConfirm, isProcessing }: CancelBookingModalProps) {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-800/95 backdrop-blur-2xl rounded-3xl w-full max-w-md border border-white/20"
      >
        <div className="p-5 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-500/20 rounded-xl flex items-center justify-center">
              <XCircle className="w-4 h-4 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white">لغو نوبت</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-red-500/10 rounded-xl p-3 border border-red-500/20">
            <p className="text-red-400 text-sm">با لغو این نوبت، زمان آن آزاد می‌شود و امکان رزرو مجدد وجود دارد.</p>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">دلیل لغو (اختیاری)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="می‌توانید دلیل لغو نوبت را بنویسید..."
              rows={3}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500/50 resize-none"
            />
          </div>
        </div>

        <div className="p-5 border-t border-white/10 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 bg-white/5 text-gray-400 rounded-xl font-medium hover:bg-white/10 transition">
            انصراف
          </button>
          <button onClick={() => onConfirm(reason)} disabled={isProcessing} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 rounded-xl text-white font-medium transition disabled:opacity-50 flex items-center justify-center gap-2">
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            تأیید لغو
          </button>
        </div>
      </motion.div>
    </div>
  );
}