// src/app/(client pages)/clientdashboard/components/DashboardProgressCircle.tsx
import React from "react";
import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

interface DashboardProgressCircleProps {
  percentage: number;
  isLowSms: boolean;
}

export const DashboardProgressCircle: React.FC<DashboardProgressCircleProps> = ({
  percentage,
  isLowSms,
}) => {
  const finalPercentage = Math.min(100, Math.max(0, percentage));
  const CIRCUMFERENCE = 2 * Math.PI * 54;
  
  let dashOffset = CIRCUMFERENCE - (finalPercentage / 100) * CIRCUMFERENCE;
  
  if (finalPercentage === 100) {
    dashOffset = -1;
  } else if (finalPercentage === 0) {
    dashOffset = CIRCUMFERENCE + 1;
  }

  const gradientId = isLowSms ? "redGradient" : "greenGradient";

  return (
    <motion.div
      className="relative w-20 h-20 mb-4"
      initial={{ scale: 0.85 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.6, ease: "backOut" }}
    >
      <motion.div
        className={`absolute inset-0 rounded-full blur-xl ${
          isLowSms ? "bg-red-500/30" : "bg-emerald-400/25"
        }`}
        animate={{ scale: [1, 1.3, 1], opacity: [0.35, 0.15, 0.35] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r="54"
          stroke="#334155"
          strokeWidth="10"
          fill="none"
          opacity="0.6"
        />

        <motion.circle
          cx="60"
          cy="60"
          r="54"
          stroke={`url(#${gradientId})`}
          strokeWidth="10"
          fill="none"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          initial={{ strokeDashoffset: CIRCUMFERENCE + 1 }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />

        <defs>
          <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="50%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F87171" />
            <stop offset="50%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#DC2626" />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <MessageCircle
            className="w-9 h-9 text-white"
            strokeWidth={2.6}
            fill={isLowSms ? "#EF4444" : "#10B981"}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};