// src/app/(client pages)/clientdashboard/components/VideoTrainingsWidget.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Play, Clock, Eye, Film, ChevronLeft } from "lucide-react";

interface TrainingVideo {
  id: number;
  title: string;
  subtitle: string;
  cover_image: string;
  duration: string;
  category: string;
  view_count: number;
}

export default function VideoTrainings() {
  const [videos, setVideos] = useState<TrainingVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/client/video-trainings?limit=3");
      const data = await res.json();
      if (data.success) {
        setVideos(data.trainings);
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      </div>
    );
  }

  if (videos.length === 0) return null;

  return (
    <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Film className="w-5 h-5 text-emerald-500" />
          <h3 className="font-bold text-slate-800 dark:text-white text-sm sm:text-base">آموزش‌های ویدیویی</h3>
        </div>
        <Link href="/clientdashboard/trainings" className="text-xs text-emerald-500 hover:text-emerald-600 font-medium flex items-center gap-1">
          مشاهده همه <ChevronLeft className="w-3 h-3" />
        </Link>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {videos.map((video) => (
          <Link key={video.id} href={`/clientdashboard/trainings?video=${video.id}`}
            className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            <div className="relative w-16 h-10 sm:w-20 sm:h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-gray-800 to-gray-900">
              {video.cover_image ? (
                <img src={video.cover_image} alt={video.title} className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white mr-0.5" />
                  </div>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-slate-800 dark:text-white text-xs sm:text-sm line-clamp-1">{video.title}</h4>
              <div className="flex items-center gap-2 sm:gap-3 mt-1">
                <span className="text-[8px] sm:text-[10px] text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  {video.category}
                </span>
                {video.duration && (
                  <span className="text-[8px] sm:text-[10px] text-gray-400 flex items-center gap-0.5">
                    <Clock className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                    {video.duration}
                  </span>
                )}
              </div>
            </div>
            <Play className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}