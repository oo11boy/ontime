// src/components/AnnouncementModal.tsx
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Bell, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  AlertTriangle,
  ExternalLink,
} from "lucide-react";

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

interface AnnouncementModalProps {
  isOpen: boolean;
  announcement: AnnouncementItem | null;
  onClose: () => void;
  onDismiss: () => void;
  onClickLink: () => void;
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
  info: "text-blue-400",
  warning: "text-yellow-400",
  success: "text-emerald-400",
  error: "text-red-400",
  update: "text-purple-400",
};

const typeBg: Record<AnnouncementItem["type"], string> = {
  info: "bg-blue-500/10",
  warning: "bg-yellow-500/10",
  success: "bg-emerald-500/10",
  error: "bg-red-500/10",
  update: "bg-purple-500/10",
};

const priorityConfig: Record<AnnouncementItem["priority"], { label: string; color: string }> = {
  low: { label: "عادی", color: "text-gray-400" },
  normal: { label: "متوسط", color: "text-blue-400" },
  high: { label: "بالا", color: "text-orange-400" },
  urgent: { label: "فوری", color: "text-red-400" },
};

export default function AnnouncementModal({
  isOpen,
  announcement,
  onClose,
  onDismiss,
  onClickLink,
}: AnnouncementModalProps) {
  if (!announcement) return null;

  const typeInfo = typeIcons[announcement.type] || Info;
  const Icon = typeInfo;
  const colorClass = typeColors[announcement.type] || typeColors.info;
  const bgClass = typeBg[announcement.type] || typeBg.info;
  const priorityInfo = priorityConfig[announcement.priority] || priorityConfig.normal;

  const handleLinkClick = () => {
    onClickLink();
    if (announcement.action_link) {
      window.open(announcement.action_link, "_blank");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" dir="rtl">
          {/* backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-[#1a1e26] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
          >
            {/* header */}
            <div className={`p-5 border-b border-white/10 flex items-center justify-between ${bgClass}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${bgClass} ${colorClass} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{announcement.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${priorityInfo.color} bg-white/5`}>
                      {priorityInfo.label}
                    </span>
                   
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* content */}
            <div className="p-5">
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                {announcement.content}
              </p>

              {/* action link */}
              {announcement.action_link && (
                <button
                  onClick={handleLinkClick}
                  className="mt-4 inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  مشاهده جزئیات بیشتر
                </button>
              )}
            </div>

            {/* footer */}
            <div className="p-5 border-t border-white/10 flex gap-3">
              {announcement.is_dismissible ? (
                <>
                  <button
                    onClick={() => {
                      onDismiss();
                      onClose();
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-white/5 text-gray-400 font-medium hover:bg-white/10 transition"
                  >
                    رد کردن
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition"
                  >
                    متوجه شدم
                  </button>
                </>
              ) : (
                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition"
                >
                  متوجه شدم
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}