// components/BuySMS/LoadingScreen.tsx
import React from "react";
import { Loader2 } from "lucide-react";

export const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-[#1a1e26] to-[#242933] flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
    </div>
  );
};