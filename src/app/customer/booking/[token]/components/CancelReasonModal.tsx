"use client";

import React, { useState } from "react";
import { X, AlertTriangle } from "lucide-react";

interface CancelReasonModalProps {
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  isProcessing: boolean;
}

export default function CancelReasonModal({
  onClose,
  onConfirm,
  isProcessing,
}: CancelReasonModalProps) {
  const [reason, setReason] = useState("");

  const handleSubmit = async () => {
    await onConfirm(reason);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-[#1a1d24] rounded-2xl w-full max-w-md border border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
              <X className="w-4 h-4 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white">لغو نوبت</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">
                با لغو این نوبت، زمان آن آزاد می‌شود و امکان رزرو مجدد وجود دارد.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              دلیل لغو (اختیاری)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="می‌توانید دلیل لغو نوبت را بنویسید..."
              rows={3}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500/50 transition resize-none text-sm"
            />
          </div>
        </div>

        <div className="p-6 border-t border-white/10 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-white/5 text-gray-400 font-bold hover:bg-white/10 transition"
          >
            انصراف
          </button>
          <button
            onClick={handleSubmit}
            disabled={isProcessing}
            className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition disabled:opacity-50"
          >
            {isProcessing ? "در حال لغو..." : "تأیید و لغو نوبت"}
          </button>
        </div>
      </div>
    </div>
  );
}