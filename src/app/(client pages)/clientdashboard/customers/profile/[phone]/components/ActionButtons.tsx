// components/CustomerProfile/ActionButtons.tsx
import React from "react";
import { MessageCircle, CheckCircle, Ban } from "lucide-react";

interface ActionButtonsProps {
  customer: {
    id: string;
    name: string;
    is_blocked: boolean;
  };
  onShowSmsModal: () => void;
  onShowBlockModal: () => void;
  onShowUnblockModal: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  customer,
  onShowSmsModal,
  onShowBlockModal,
  onShowUnblockModal,
}) => {
  return (
    <div className="flex gap-3 mb-8">
      {/* <button
        onClick={onShowSmsModal}
        disabled={customer.is_blocked}
        className={`flex-1 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
          customer.is_blocked
            ? "bg-gray-700/50 text-gray-500 cursor-not-allowed"
            : "bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 active:scale-95"
        }`}
      >
        <MessageCircle className="w-5 h-5" />
        ارسال پیامک
      </button> */}

      {customer.is_blocked ? (
        <button
          onClick={onShowUnblockModal}
          className="flex-1 py-3.5 bg-linear-to-r from-green-500 to-green-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:from-green-600 hover:to-green-700 active:scale-95 shadow-lg"
        >
          <CheckCircle className="w-5 h-5" />
          رفع بلاک
        </button>
      ) : (
        <button
          onClick={onShowBlockModal}
          className="flex-1 py-3.5 bg-linear-to-r from-red-500 to-red-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:from-red-600 hover:to-red-700 active:scale-95 shadow-lg"
        >
          <Ban className="w-5 h-5" />
          بلاک کردن
        </button>
      )}
    </div>
  );
};