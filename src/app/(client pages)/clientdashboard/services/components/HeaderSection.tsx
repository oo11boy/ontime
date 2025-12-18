// src/app/(client pages)/clientdashboard/services/components/HeaderSection.tsximport React from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  onAddClick: () => void;
}

export const HeaderSection: React.FC<HeaderProps> = ({ onAddClick }) => {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 bg-[#0f1117]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex justify-between items-center">
      <button
        onClick={() => router.back()}
        className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center active:scale-90 hover:bg-white/20 transition"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>
      <h1 className="text-lg font-bold">خدمات من</h1>
      <button
        onClick={onAddClick}
        className="bg-linear-to-r from-emerald-500 to-emerald-600 px-4 py-2 rounded-xl text-sm font-bold active:scale-90 hover:from-emerald-600 hover:to-emerald-700 transition"
      >
        افزودن
      </button>
    </header>
  );
};