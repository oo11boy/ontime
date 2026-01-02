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
      className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-600 rounded-2xl font-bold flex justify-center items-center transition-all shadow-lg active:scale-95"
    >
      {isSubmitting ? (
        <Loader2 className="animate-spin" />
      ) : (
        "ثبت نوبت نهایی"
      )}
    </button>
  );
};

export default SubmitButton;