// src/app/clientdashboard/customer-link/components/PlanStatus.tsx
"use client";

import { useState } from "react";
import { Crown, Sparkles, Gift, Zap, Lock, Unlock } from "lucide-react";

interface PlanStatusProps {
  currentPlan: "free" | "basic" | "pro";
  planExpiryDate?: string;
  onUpgrade: () => void;
}

export function PlanStatus({ currentPlan, planExpiryDate, onUpgrade }: PlanStatusProps) {
  const [isHovered, setIsHovered] = useState(false);

  if (currentPlan === "pro") {
    return (
      <div className="relative">
        <div 
          className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-full text-sm font-medium"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Crown className="w-4 h-4" />
          <span>پلن ویژه</span>
          {planExpiryDate && (
            <span className="text-xs opacity-90">
              تا {new Date(planExpiryDate).toLocaleDateString("fa-IR")}
            </span>
          )}
        </div>
        
        {isHovered && (
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-gray-800 text-white text-xs rounded-lg p-2 text-center z-50">
            ✨ از همه امکانات لذت می‌برید
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45" />
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={onUpgrade}
      className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1.5 rounded-full text-sm font-medium hover:shadow-lg transition-all hover:scale-105"
    >
      <Sparkles className="w-4 h-4" />
      <span>ارتقا به پلن ویژه</span>
      <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">🔥 ۸۷ هزار تومان/ماه</span>
    </button>
  );
}