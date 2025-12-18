// components/CustomerProfile/LoadingScreen.tsx
import React from "react";
import { Loader2 } from "lucide-react";

export const LoadingScreen: React.FC = () => {
  return (
    <div className="h-screen text-white overflow-auto max-w-md m-auto">
      <div className="min-h-screen bg-linear-to-br from-[#1a1e26] to-[#242933] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
      </div>
    </div>
  );
};