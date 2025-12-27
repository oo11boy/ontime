import React from "react";
import { ArrowLeft, Loader2} from "lucide-react";

interface PurchaseButtonProps {
  selected: number | null;
  loading: boolean;
  onPurchase: () => void;
}

export const PurchaseButton: React.FC<PurchaseButtonProps> = ({ selected, loading, onPurchase }) => {
  return (
    <div >
      <button
        onClick={onPurchase}
        disabled={!selected || loading}
        className={`w-full h-14 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all ${
          selected && !loading
            ? "bg-emerald-500 text-[#1a1e26] hover:bg-emerald-400 shadow-xl shadow-emerald-500/20"
            : "bg-white/5 text-gray-500 cursor-not-allowed"
        }`}
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "تأیید و پرداخت نهایی"}
      </button>
    </div>
  );
};