"use client";
import { MessageCircle, Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function SmsStatus() {
  return (
    <div className="flex items-center w-full justify-between">
      {/* بخش چپ */}
      <div className="flex items-center gap-6">
        {/* دایره اصلی با گرادیانت و گلو + پالس قوی‌تر */}
        <motion.div
          className="relative w-20 h-20 shrink-0"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "backOut" }}
        >
          {/* گلو اطراف دایره */}
          <motion.div
            className="absolute inset-0 rounded-full bg-emerald-400/30 blur-xl"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.4, 0.2, 0.4],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            {/* پس‌زمینه خاکستری */}
            <circle cx="60" cy="60" r="54" stroke="#374151" strokeWidth="12" fill="none" />

            {/* دایره اصلی با گرادیانت سبز نئونی */}
            <defs>
              <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34D399" />
                <stop offset="50%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>

            <motion.circle
              cx="60"
              cy="60"
              r="54"
              stroke="url(#greenGradient)"
              strokeWidth="12"
              fill="none"
              strokeDasharray="339.3"
              strokeDashoffset="98"
              strokeLinecap="round"
              initial={{ strokeDashoffset: 339.3 }}
              animate={{ strokeDashoffset: 98 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </svg>

          {/* آیکون با پالس قوی و چرخش ملایم */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                scale: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 8, repeat: Infinity, ease: "linear" },
              }}
            >
              <MessageCircle
                className="w-8 h-8 text-white drop-shadow-lg"
                strokeWidth={2.8}
                fill="#10B981"
              />
            </motion.div>
          </div>
        </motion.div>

        {/* متن‌ها با افکت تایپ و رنگ زنده‌تر */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="text-gray-300 text-sm font-medium tracking-wider">
            پیامک باقیمانده
          </div>
          <div className="text-4xl font-black text-white mt-1.5 tracking-tighter bg-linear-to-r from-emerald-400 to-teal-300 bg-clip-text">
            ۵,۲۸۹
          </div>
        </motion.div>
      </div>
  <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        className="flex items-center mt-2 mr-2 gap-2 bg-white text-amber-700 hover:text-amber-800 px-2 py-3 rounded-2xl font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 border border-amber-200"
      >
        <Plus className="w-4 h-4" strokeWidth={2.5} />
        افزایش پیامک
      </motion.button>
    </div>
  );
}