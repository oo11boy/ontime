import React from "react";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps {
  isSubmitting: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ isSubmitting, isDisabled, onClick }) => {
  return (
    <button
      onClick={onClick}
      disabled={isDisabled || isSubmitting}
      className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 disabled:bg-slate-400 dark:disabled:bg-gray-600 rounded-2xl font-bold flex justify-center items-center transition-all shadow-lg active:scale-95 text-white"
    >
      {isSubmitting ? (
        <Loader2 className="animate-spin w-5 h-5" />
      ) : (
        "ثبت نوبت نهایی"
      )}
    </button>
  );
};

export default SubmitButton;