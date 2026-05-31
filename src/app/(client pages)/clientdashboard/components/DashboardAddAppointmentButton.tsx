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
      className="w-full "
    >
      <Link href="../clientdashboard/bookingsubmit">
        <motion.button
          whileHover="hover"
          whileTap="tap"
          className="
            relative w-full h-16 sm:h-20
            rounded-[2rem] sm:rounded-[2.5rem]
            bg-gradient-to-br 
            from-emerald-500 to-emerald-700 
            dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600
            flex items-center justify-center gap-3
            shadow-[0_20px_50px_rgba(16,185,129,0.2)] 
            dark:shadow-[0_20px_50px_rgba(16,185,129,0.3)]
            hover:shadow-[0_25px_60px_rgba(16,185,129,0.25)]
            dark:hover:shadow-[0_25px_60px_rgba(16,185,129,0.35)]
            border-t border-emerald-400/30 dark:border-white/30
            overflow-hidden group
            transition-all duration-300
          "
        >
          {/* لایه درخشش متحرک (Reflective Surface) - لایت مود */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.6),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 dark:opacity-0 dark:group-hover:opacity-50" />
          
          {/* لایه درخشش متحرک مخصوص دارک مود */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.3),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 dark:opacity-50 dark:group-hover:opacity-100" />

          {/* آیکون پلاس با انیمیشن چرخشی */}
          <motion.div 
            variants={{
              hover: { rotate: 90, scale: 1.1 },
              tap: { scale: 0.9 }
            }}
            className="relative z-10 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-black/10 dark:bg-black/20 rounded-2xl backdrop-blur-md border border-white/30 dark:border-white/20 shadow-inner"
          >
            <Plus className="text-white w-6 h-6 sm:w-7 sm:h-7" strokeWidth={3} />
          </motion.div>

          {/* متن با تایپوگرافی سنگین و تمیز */}
          <div className="relative z-10 flex flex-col items-start text-right" dir="rtl">
            <span className="text-white text-base sm:text-xl font-black tracking-tight drop-shadow-sm">
              ثبت نوبت جدید
            </span>
            <span className="text-emerald-100/90 dark:text-emerald-100/80 text-[10px] sm:text-xs font-medium">
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
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-200/80 dark:text-yellow-200 fill-yellow-200/50 dark:fill-yellow-200" />
          </motion.div>

          {/* افکت نوری در پس‌زمینه (Ambient Light) */}
          <motion.div
            className="absolute -inset-full bg-gradient-to-r from-transparent via-white/30 dark:via-white/20 to-transparent w-[200%] h-full skew-x-[-30deg]"
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