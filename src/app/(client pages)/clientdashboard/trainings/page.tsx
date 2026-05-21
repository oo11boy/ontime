// src/app/(client pages)/clientdashboard/trainings/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Clock, Eye, X, Film, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Footer from "../components/Footer/Footer";

interface TrainingVideo {
  id: number;
  title: string;
  subtitle: string;
  video_url: string;
  video_id: string;
  cover_image: string;
  duration: string;
  category: string;
  view_count: number;
  created_at: string;
}

export default function TrainingsPage() {
  const searchParams = useSearchParams();
  const videoIdParam = searchParams.get("video");
  
  const [videos, setVideos] = useState<TrainingVideo[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<TrainingVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<TrainingVideo | null>(null);
  const [currentCategory, setCurrentCategory] = useState<string>("همه");
  const [categories, setCategories] = useState<string[]>(["همه"]);
  const [searchTerm, setSearchTerm] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    if (videoIdParam && videos.length > 0) {
      const video = videos.find(v => v.id === parseInt(videoIdParam));
      if (video) setSelectedVideo(video);
    }
  }, [videoIdParam, videos]);

  useEffect(() => {
    let filtered = videos;
    if (currentCategory !== "همه") {
      filtered = filtered.filter(v => v.category === currentCategory);
    }
    if (searchTerm) {
      filtered = filtered.filter(v => v.title.includes(searchTerm) || (v.subtitle && v.subtitle.includes(searchTerm)));
    }
    setFilteredVideos(filtered);
  }, [currentCategory, searchTerm, videos]);

  const fetchVideos = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/client/video-trainings");
      const data = await res.json();
      if (data.success && data.trainings) {
        const trainings = data.trainings as TrainingVideo[];
        setVideos(trainings);
        setFilteredVideos(trainings);
        const uniqueCategories = ["همه", ...new Set(trainings.map((v: TrainingVideo) => v.category))];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollCategories = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction === 'right' ? 200 : -200, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-md m-auto bg-gray-50 dark:bg-[#0f1218] pb-40" dir="rtl">
      <div className="bg-white dark:bg-[#1a1f2e] border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Link href="/clientdashboard" className="p-2 -mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <ChevronRight className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                  <Film className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-500" />
                  آموزش‌های ویدیویی
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
                  {videos.length} ویدیو آموزشی • یادگیری آسان و سریع
                </p>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="جستجوی آموزش..." className="w-full bg-gray-100 dark:bg-[#0f1218] border-0 rounded-xl py-3 pr-10 pl-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <div className="relative mb-6 sm:mb-8">
          <div ref={scrollRef} className="flex flex-nowrap md:flex-wrap gap-2 overflow-x-auto pb-2 hide-scrollbar">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setCurrentCategory(cat)}
                className={`flex-shrink-0 px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  currentCategory === cat
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                    : "bg-gray-100 dark:bg-[#1a1f2e] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#252b3d]"
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">{filteredVideos.length} آموزش یافت شد</div>

        {filteredVideos.length === 0 ? (
          <div className="text-center py-16">
            <Film className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">آموزشی یافت نشد</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">سعی کنید با عبارت دیگری جستجو کنید</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredVideos.map((video, index) => (
              <motion.div key={video.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.05, 0.5) }} onClick={() => setSelectedVideo(video)}
                className="group bg-white dark:bg-[#1a1f2e] rounded-xl sm:rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 dark:border-gray-800 active:scale-[0.98] sm:active:scale-100">
                <div className="relative aspect-video overflow-hidden">
                  {video.cover_image ? (
                    <img src={video.cover_image} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900"></div>
                  )}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all flex items-center justify-center">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 bg-emerald-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                      <Play className="w-5 h-5 sm:w-7 sm:h-7 text-white mr-0.5 sm:mr-1" />
                    </div>
                  </div>
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg flex items-center gap-0.5 sm:gap-1">
                      <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      {video.duration}
                    </div>
                  )}
                </div>
                <div className="p-3 sm:p-4">
                  <span className="text-[10px] sm:text-xs text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg">
                    {video.category}
                  </span>
                  <h3 className="font-bold text-slate-800 dark:text-white mt-2 line-clamp-2 text-sm sm:text-base">{video.title}</h3>
                  {video.subtitle && <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1 line-clamp-2">{video.subtitle}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        )}
        <Footer/>
      </div>

      <AnimatePresence>
        {selectedVideo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm" onClick={() => setSelectedVideo(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className="relative bg-white dark:bg-[#1a1f2e] rounded-xl sm:rounded-2xl w-[95%] sm:w-[90%] md:w-[85%] lg:w-[70%] xl:w-[60%] max-w-5xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setSelectedVideo(null)}
                className="absolute top-2 sm:top-4 left-2 sm:left-4 z-20 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 sm:p-2 transition-all active:scale-95">
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <div className="relative w-full bg-black">
                <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                  <iframe src={`https://www.aparat.com/video/video/embed/videohash/${selectedVideo.video_id}/vt/frame?titleShow=true`}
                    className="absolute top-0 left-0 w-full h-full border-0" allowFullScreen loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <span className="text-[10px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg">
                    {selectedVideo.category}
                  </span>
                  {selectedVideo.duration && (
                    <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />{selectedVideo.duration}
                    </span>
                  )}
                  <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />{selectedVideo.view_count.toLocaleString("fa-IR")} بازدید
                  </span>
                </div>
                <h3 className="text-base sm:text-xl lg:text-2xl font-bold text-slate-800 dark:text-white mb-1 sm:mb-2">{selectedVideo.title}</h3>
                {selectedVideo.subtitle && <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">{selectedVideo.subtitle}</p>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}