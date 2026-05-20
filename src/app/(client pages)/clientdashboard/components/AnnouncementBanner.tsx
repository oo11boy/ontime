// src/components/AnnouncementBanner.tsx
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  X, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import AnnouncementModal from "./AnnouncementModal";

// تعریف تایپ برای اطلاعیه
interface AnnouncementItem {
  id: number;
  title: string;
  content: string;
  type: "info" | "warning" | "success" | "error" | "update";
  priority: "low" | "normal" | "high" | "urgent";
  action_link: string | null;
  is_dismissible: boolean;
  is_viewed: boolean;
  is_dismissed: boolean;
}

// تعریف تایپ برای آبجکت آیکون‌ها
const typeIcons: Record<AnnouncementItem["type"], React.ComponentType<any>> = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  error: AlertCircle,
  update: Bell,
};

// رنگ‌های لایت مود
const typeColorsLight: Record<AnnouncementItem["type"], string> = {
  info: "bg-blue-50 border-blue-200 text-blue-700",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-700",
  success: "bg-emerald-50 border-emerald-200 text-emerald-700",
  error: "bg-red-50 border-red-200 text-red-700",
  update: "bg-purple-50 border-purple-200 text-purple-700",
};

// رنگ‌های دارک مود
const typeColorsDark: Record<AnnouncementItem["type"], string> = {
  info: "dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-blue-400",
  warning: "dark:bg-yellow-500/10 dark:border-yellow-500/30 dark:text-yellow-400",
  success: "dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400",
  error: "dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-400",
  update: "dark:bg-purple-500/10 dark:border-purple-500/30 dark:text-purple-400",
};

// رنگ‌های متن برای حالت‌های مختلف
const textColorsLight: Record<AnnouncementItem["type"], string> = {
  info: "text-blue-800",
  warning: "text-yellow-800",
  success: "text-emerald-800",
  error: "text-red-800",
  update: "text-purple-800",
};

const textColorsDark: Record<AnnouncementItem["type"], string> = {
  info: "dark:text-blue-100",
  warning: "dark:text-yellow-100",
  success: "dark:text-emerald-100",
  error: "dark:text-red-100",
  update: "dark:text-purple-100",
};

const subTextColorsLight: Record<AnnouncementItem["type"], string> = {
  info: "text-blue-600",
  warning: "text-yellow-600",
  success: "text-emerald-600",
  error: "text-red-600",
  update: "text-purple-600",
};

const subTextColorsDark: Record<AnnouncementItem["type"], string> = {
  info: "dark:text-blue-300",
  warning: "dark:text-yellow-300",
  success: "dark:text-emerald-300",
  error: "dark:text-red-300",
  update: "dark:text-purple-300",
};

export default function AnnouncementBanner() {
  const { announcements, markAsViewed, markAsDismissed, markAsClicked } = useAnnouncements();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // فقط اطلاعیه‌های قابل نمایش (اگر قابل بستن است و نبسته شده، یا غیرقابل بستن)
  const visibleAnnouncements = (announcements as AnnouncementItem[]).filter((a: AnnouncementItem) => !a.is_dismissed);
  const currentAnnouncement = visibleAnnouncements[currentIndex];

  if (!currentAnnouncement || visibleAnnouncements.length === 0) return null;

  const Icon = typeIcons[currentAnnouncement.type] || Info;
  const colorClass = `${typeColorsLight[currentAnnouncement.type]} ${typeColorsDark[currentAnnouncement.type]}`;
  const textColorClass = `${textColorsLight[currentAnnouncement.type]} ${textColorsDark[currentAnnouncement.type]}`;
  const subTextColorClass = `${subTextColorsLight[currentAnnouncement.type]} ${subTextColorsDark[currentAnnouncement.type]}`;

  const handleDismiss = () => {
    if (currentAnnouncement.is_dismissible) {
      markAsDismissed(currentAnnouncement.id);
      if (currentIndex + 1 < visibleAnnouncements.length) {
        setCurrentIndex(currentIndex + 1);
      }
    }
  };

  const handleOpenModal = () => {
    markAsViewed(currentAnnouncement.id);
    setSelectedAnnouncement(currentAnnouncement);
    setIsModalOpen(true);
  };

  const handleNext = () => {
    markAsViewed(currentAnnouncement.id);
    if (currentIndex + 1 < visibleAnnouncements.length) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex - 1 >= 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          className="w-full px-2 pt-2"
        >
          <div 
            className={`rounded-2xl p-3 border ${colorClass} backdrop-blur-sm dark:backdrop-blur-md cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] shadow-sm dark:shadow-none`}
            onClick={handleOpenModal}
          >
            <div className="flex items-center gap-3">
              {/* آیکون */}
              <div className="shrink-0">
                <Icon className="w-5 h-5" />
              </div>

              {/* محتوای خلاصه */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className={`font-bold text-sm truncate ${textColorClass}`}>
                    {currentAnnouncement.title}
                  </h4>
                  {currentAnnouncement.priority === "urgent" && (
                    <span className="text-[10px] bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full shrink-0 font-bold">
                      فوری
                    </span>
                  )}
                  {currentAnnouncement.priority === "high" && (
                    <span className="text-[10px] bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full shrink-0 font-bold">
                      مهم
                    </span>
                  )}
                </div>
                <p className={`text-xs ${subTextColorClass} truncate`}>
                  {currentAnnouncement.content.length > 60 
                    ? currentAnnouncement.content.substring(0, 60) + "..." 
                    : currentAnnouncement.content}
                </p>
              </div>

              {/* نشانگر تعداد */}
              <div className="flex items-center gap-1 shrink-0">
                {visibleAnnouncements.length > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrev();
                      }}
                      className={`p-1 rounded-lg transition disabled:opacity-30 ${
                        currentIndex === 0 
                          ? 'opacity-30 cursor-not-allowed' 
                          : 'hover:bg-black/5 dark:hover:bg-white/10'
                      }`}
                      disabled={currentIndex === 0}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-slate-500 dark:text-gray-400 font-medium">
                      {currentIndex + 1}/{visibleAnnouncements.length}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNext();
                      }}
                      className={`p-1 rounded-lg transition disabled:opacity-30 ${
                        currentIndex === visibleAnnouncements.length - 1 
                          ? 'opacity-30 cursor-not-allowed' 
                          : 'hover:bg-black/5 dark:hover:bg-white/10'
                      }`}
                      disabled={currentIndex === visibleAnnouncements.length - 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* مودال جزئیات اطلاعیه */}
      <AnnouncementModal
        isOpen={isModalOpen}
        announcement={selectedAnnouncement}
        onClose={() => setIsModalOpen(false)}
        onDismiss={handleDismiss}
        onClickLink={() => {
          if (selectedAnnouncement?.action_link) {
            markAsClicked(selectedAnnouncement.id);
          }
        }}
      />
    </>
  );
}