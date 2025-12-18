// src/app/(client pages)/clientdashboard/customers/profile/[phone]/components/HeaderSection.tsx
import React from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export const HeaderSection: React.FC = () => {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 bg-[#0f1117]/90 backdrop-blur-xl border-b border-white/10 px-5 py-3 flex justify-between items-center">
      <button
        onClick={() => router.back()}
        className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center active:scale-90"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>
      <h1 className="text-lg font-bold">پروفایل مشتری</h1>
      <div className="w-10"></div>
    </header>
  );
};