"use client";
import React from "react";
import { Plus, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export const DashboardAddAppointmentButton: React.FC = () => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full px-2"
    >
      <Link href="../clientdashboard/bookingsubmit">
        <motion.button
          whileHover="hover"
          whileTap="tap"
          className="
            relative w-full h-16 sm:h-20
            rounded-[2rem] sm:rounded-[2.5rem]
            bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600
            flex items-center justify-center gap-3
            shadow-[0_20px_50px_rgba(16,185,129,0.3),inset_0_-4px_8px_rgba(0,0,0,0.1)]
            border-t border-white/30
            overflow-hidden group
          "
        >
          {/* لایه درخشش متحرک (Reflective Surface) */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.4),transparent_70%)] opacity-50" />

          {/* آیکون پلاس با انیمیشن چرخشی */}
          <motion.div 
            variants={{
              hover: { rotate: 90, scale: 1.1 },
              tap: { scale: 0.9 }
            }}
            className="relative z-10 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-black/10 rounded-2xl backdrop-blur-md border border-white/20 shadow-inner"
          >
            <Plus className="text-white w-6 h-6 sm:w-7 sm:h-7" strokeWidth={3} />
          </motion.div>

          {/* متن با تایپوگرافی سنگین و تمیز */}
          <div className="relative z-10 flex flex-col items-start text-right" dir="rtl">
            <span className="text-white text-base sm:text-xl font-black tracking-tight drop-shadow-sm">
              ثبت نوبت جدید
            </span>
            <span className="text-emerald-100/80 text-[10px] sm:text-xs font-medium">
              سریع و آسان در چند ثانیه
            </span>
          </div>

          {/* آیکون تزئینی Sparkles */}
          <motion.div
            variants={{
              hover: { 
                y: [0, -5, 0],
                transition: { repeat: Infinity, duration: 1.5 } 
              }
            }}
            className="relative z-10 mr-2 opacity-80 sm:opacity-100"
          >
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-200 fill-yellow-200" />
          </motion.div>

          {/* افکت نوری در پس‌زمینه (Ambient Light) */}
          <motion.div
            className="absolute -inset-full bg-gradient-to-r from-transparent via-white/20 to-transparent w-[200%] h-full skew-x-[-30deg]"
            variants={{
              hover: { x: ['-100%', '100%'] }
            }}
            transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity }}
          />
          
        </motion.button>
      </Link>
    </motion.div>
  );
};