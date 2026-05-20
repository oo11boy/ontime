import React from "react";
import { useRouter } from "next/navigation";

interface ErrorScreenProps {
  message?: string;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({ 
  message = "مشتری یافت نشد" 
}) => {
  const router = useRouter();

  return (
    <div className="h-screen overflow-auto max-w-md m-auto bg-slate-50 dark:bg-[#1a1e26] transition-colors">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#1a1e26] dark:to-[#242933] flex flex-col items-center justify-center">
        <h1 className="text-xl font-bold text-slate-800 dark:text-white mb-4">{message}</h1>
        <button
          onClick={() => router.back()}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-lg transition"
        >
          بازگشت
        </button>
      </div>
    </div>
  );
};