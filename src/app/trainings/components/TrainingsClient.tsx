"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Play, Eye, Calendar, ChevronLeft, Clock } from "lucide-react";
import Link from "next/link";

interface Training {
  id: number;
  title: string;
  subtitle: string;
  video_url: string;
  cover_image: string;
  duration: number;
  view_count: number;
  created_at: string;
}

interface TrainingsClientProps {
  trainings: Training[];
}

// تابع دریافت لینک جاسازی آپارات
function getEmbedUrl(url: string): string {
  if (!url) return "";
  if (url.includes("aparat.com")) {
    const match = url.match(/v\/([a-zA-Z0-9]+)/);
    if (match) {
      return `https://www.aparat.com/video/video/embed/videohash/${match[1]}/vt/frame?titleShow=true`;
    }
  }
  return url;
}

// تابع تبدیل ثانیه به فرمت خوانا
function formatDurationReadable(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function TrainingsClient({ trainings }: TrainingsClientProps) {
  const [selectedVideo, setSelectedVideo] = useState<Training | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const openModal = useCallback((training: Training) => {
    setSelectedVideo(training);
    setIsModalOpen(true);
    setIsClosing(false);
    document.body.style.overflow = "hidden";
  }, []);

  const closeModal = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setSelectedVideo(null);
      document.body.style.overflow = "unset";
    }, 300);
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isModalOpen, closeModal]);

  // attach event listeners به کارت‌ها
  useEffect(() => {
    const cards = document.querySelectorAll(".training-card");
    const handlers: (() => void)[] = [];

    cards.forEach((card) => {
      const videoId = card.getAttribute("data-video-id");
      const training = trainings.find((t) => t.id === parseInt(videoId || "0"));
      
      if (training) {
        const handler = () => openModal(training);
        card.addEventListener("click", handler);
        handlers.push(() => card.removeEventListener("click", handler));
      }
    });

    return () => {
      handlers.forEach((cleanup) => cleanup());
    };
  }, [trainings, openModal]);

  const embedUrl = selectedVideo ? getEmbedUrl(selectedVideo.video_url) : "";
  const isAparat = embedUrl.includes("aparat.com");
  const thumbnail = selectedVideo?.cover_image || 
    (selectedVideo?.video_url?.match(/v\/([a-zA-Z0-9]+)/) 
      ? `https://www.aparat.com/public/thumb/${selectedVideo.video_url.match(/v\/([a-zA-Z0-9]+)/)![1]}.jpg`
      : null);

  if (!isModalOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-all duration-300 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
      style={{ backgroundColor: "rgba(0, 0, 0, 0.96)", backdropFilter: "blur(8px)" }}
      onClick={closeModal}
    >
      {/* دکمه بستن */}
      <button
        className="absolute top-5 left-5 text-white/60 hover:text-white transition-all duration-300 z-10 bg-white/10 hover:bg-white/20 rounded-full p-3 backdrop-blur-sm"
        onClick={closeModal}
        aria-label="بستن"
      >
        <X size={24} />
      </button>

      {/* محتوای مودال */}
      <div
        className="relative w-full max-w-5xl bg-black rounded-3xl overflow-hidden shadow-2xl transform transition-all duration-500 animate-in zoom-in-95 fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ویدیو */}
        <div className="relative aspect-video bg-black">
          {isAparat ? (
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              title={selectedVideo?.title}
            />
          ) : (
            <video
              src={selectedVideo?.video_url}
              controls
              autoPlay
              className="w-full h-full"
              poster={thumbnail || undefined}
              title={selectedVideo?.title}
            />
          )}
        </div>

        {/* اطلاعات ویدیو */}
        <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800">
          <h3 className="text-white font-black text-xl lg:text-2xl mb-3">
            {selectedVideo?.title}
          </h3>
          <p className="text-slate-300 text-sm lg:text-base leading-relaxed mb-5">
            {selectedVideo?.subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-5 pt-4 border-t border-slate-700">
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <Eye size={14} className="text-blue-400" />
              <span>{selectedVideo?.view_count?.toLocaleString("fa-IR") || 0} بازدید</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <Calendar size={14} className="text-blue-400" />
              <span>
                {selectedVideo?.created_at
                  ? new Date(selectedVideo.created_at).toLocaleDateString("fa-IR")
                  : ""}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <Clock size={14} className="text-blue-400" />
              <span>مدت: {formatDurationReadable(selectedVideo?.duration || 0)}</span>
            </div>
          </div>

          {/* دکمه اقدام */}
          <div className="mt-6 pt-4 border-t border-slate-700/50">
            <Link
              href="/clientdashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-black text-sm hover:shadow-lg hover:scale-105 transition-all"
            >
              شروع تست رایگان ۲ هفته‌ای
              <ChevronLeft size={14} />
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes zoom-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-in {
          animation: zoom-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}