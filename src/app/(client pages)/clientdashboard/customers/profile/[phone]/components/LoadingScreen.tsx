import React from "react";
import { Loader2 } from "lucide-react";

export const LoadingScreen: React.FC = () => {
  return (
    <div className="h-screen overflow-auto max-w-md m-auto bg-slate-50 dark:bg-[#1a1e26] transition-colors">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#1a1e26] dark:to-[#242933] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 animate-spin" />
      </div>
    </div>
  );
};