import React from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export const HeaderSection: React.FC = () => {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#0f1117]/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 px-5 py-3 flex justify-between items-center transition-colors">
      <button
        onClick={() => router.back()}
        className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center active:scale-90 text-slate-700 dark:text-white"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>
      <h1 className="text-lg font-bold text-slate-800 dark:text-white">پروفایل مشتری</h1>
      <div className="w-10"></div>
    </header>
  );
};