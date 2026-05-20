import React from "react";
import { Loader2 } from "lucide-react";

export const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#1a1e26] dark:to-[#242933] flex items-center justify-center transition-colors">
      <Loader2 className="w-10 h-10 animate-spin text-emerald-600 dark:text-emerald-500" />
    </div>
  );
};