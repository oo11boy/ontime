// components/BuySMS/PurchaseButton.tsx
import React from "react";
import { Zap, Loader2 } from "lucide-react";

interface PurchaseButtonProps {
  selected: number | null;
  loading: boolean;
  onPurchase: () => void;
}

export const PurchaseButton: React.FC<PurchaseButtonProps> = ({
  selected,
  loading,
  onPurchase,
}) => {
  return (
    <>
      <button
        onClick={onPurchase}
        disabled={!selected || loading}
        className={`w-full h-16 rounded-2xl flex items-center justify-center gap-3 font-bold text-white text-lg transition-all active:scale-95 shadow-2xl ${
          selected && !loading
            ? "bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
            : "bg-white/10 opacity-60 cursor-not-allowed"
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="w-7 h-7 animate-spin" />
            <span>در حال پردازش...</span>
          </>
        ) : (
          <>
            <span>تأیید و پرداخت</span>
            {selected !== null && <Zap className="w-7 h-7" />}
          </>
        )}
      </button>

      <div className="mt-4 text-center text-sm text-gray-400">
        <p>پرداخت امن از طریق درگاه بانکی</p>
      </div>
    </>
  );
};