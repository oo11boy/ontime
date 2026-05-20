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
      {customer.is_blocked ? (
        <button
          onClick={onShowUnblockModal}
          className="flex-1 py-3.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 shadow-lg text-white"
        >
          <CheckCircle className="w-5 h-5" />
          رفع بلاک
        </button>
      ) : (
        <button
          onClick={onShowBlockModal}
          className="flex-1 py-3.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 shadow-lg text-white"
        >
          <Ban className="w-5 h-5" />
          بلاک کردن
        </button>
      )}
    </div>
  );
};