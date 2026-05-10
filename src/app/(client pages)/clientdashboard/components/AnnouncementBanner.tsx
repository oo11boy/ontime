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

const typeColors: Record<AnnouncementItem["type"], string> = {
  info: "bg-blue-500/10 border-blue-500/30 text-blue-400",
  warning: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
  success: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  error: "bg-red-500/10 border-red-500/30 text-red-400",
  update: "bg-purple-500/10 border-purple-500/30 text-purple-400",
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
  const colorClass = typeColors[currentAnnouncement.type] || typeColors.info;

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
            className={`rounded-2xl p-3 border ${colorClass} backdrop-blur-md cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]`}
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
                  <h4 className="font-bold text-sm truncate">
                    {currentAnnouncement.title}
                  </h4>
                  {currentAnnouncement.priority === "urgent" && (
                    <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full shrink-0">
                      فوری
                    </span>
                  )}
                
                </div>
                <p className="text-xs text-gray-300 truncate">
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
                      className="p-1 rounded-lg hover:bg-white/10 transition disabled:opacity-30"
                      disabled={currentIndex === 0}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-gray-400">
                      {currentIndex + 1}/{visibleAnnouncements.length}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNext();
                      }}
                      className="p-1 rounded-lg hover:bg-white/10 transition disabled:opacity-30"
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