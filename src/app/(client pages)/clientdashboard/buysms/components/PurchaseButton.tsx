import React from "react";
import { Loader2 } from "lucide-react";

interface PurchaseButtonProps {
  selected: number | null;
  loading: boolean;
  onPurchase: () => void;
}

export const PurchaseButton: React.FC<PurchaseButtonProps> = ({ selected, loading, onPurchase }) => {
  return (
    <div>
      <button
        onClick={onPurchase}
        disabled={!selected || loading}
        className={`w-full h-14 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all ${
          selected && !loading
            ? "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white shadow-xl shadow-emerald-500/20"
            : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-500 cursor-not-allowed"
        }`}
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "تأیید و پرداخت نهایی"}
      </button>
    </div>
  );
};