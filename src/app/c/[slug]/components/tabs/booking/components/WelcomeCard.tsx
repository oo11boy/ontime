"use client";

import { motion } from "framer-motion";
import { User, LogOut } from "lucide-react";
import { CustomerData } from "../../../shared/types";

interface WelcomeCardProps {
  customer: CustomerData;
  onLogout: () => void;
}

export function WelcomeCard({ customer, onLogout }: WelcomeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-white/10 to-transparent backdrop-blur-sm rounded-2xl p-4 border border-white/10"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-gray-400 text-xs">خوش آمدید</p>
            <p className="text-white font-bold text-base">{customer.name}</p>
            <p className="text-gray-500 text-xs" dir="ltr">{customer.phone}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-1 hover:bg-red-500/30 transition"
        >
          <LogOut className="w-3.5 h-3.5" /> خروج
        </button>
      </div>
    </motion.div>
  );
}