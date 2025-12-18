// src/app/(client pages)/clientdashboard/components/DashboardAddAppointmentButton.tsx
"use client";
import React from "react";
import { Plus, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export const DashboardAddAppointmentButton: React.FC = () => {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: "backOut" }}
      className="w-full"
    >
      <Link href="../clientdashboard/bookingsubmit">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="
            relative group
            w-full h-16 sm:h-18
            overflow-hidden
            rounded-2xl sm:rounded-3xl
            bg-linear-to-r from-emerald-500 via-emerald-400 to-teal-500
            shadow-2xl shadow-emerald-500/40
            flex items-center justify-center gap-4
            font-bold text-black text-lg sm:text-2xl
            tracking-tight
          "
        >
          {/* افکت شاین متحرک */}
          <motion.div
            className="absolute inset-0 bg-white/30 skew-x-12"
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />

          {/* هاله گلو دور دکمه */}
          <motion.div
            className="absolute -inset-1 bg-emerald-400/50 rounded-3xl blur-xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.6, 0.3, 0.6],
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />

          {/* آیکون اصلی */}
          <motion.div className="relative">
            <Plus
              className="w-6 h-6 sm:w-12 sm:h-12 drop-shadow-lg"
              strokeWidth={3}
            />
          </motion.div>

          {/* متن */}
          <motion.span
            className="relative z-10 bg-clip-text text-transparent bg-linear-to-r from-black via-black/90 to-gray-800"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 120 }}
            aria-label="افزودن نوبت جدید"
          >
            افزودن نوبت جدید
          </motion.span>

          {/* آیکون اسپارکل سمت راست */}
          <motion.div
            animate={{ rotate: [0, -15, 15, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Sparkles
              className="w-7 h-7 text-yellow-400 drop-shadow-md"
              fill="currentColor"
            />
          </motion.div>

          {/* موج صوتی دایره‌ای موقع هاور */}
          <motion.div
            className="absolute inset-0 rounded-3xl border-4 border-white/30"
            initial={{ scale: 1, opacity: 0 }}
            whileHover={{
              scale: [1, 1.4, 1.8],
              opacity: [0.8, 0.4, 0],
            }}
            transition={{ duration: 1.2 }}
          />
        </motion.button>
      </Link>
    </motion.div>
  );
};