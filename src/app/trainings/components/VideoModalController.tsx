'use client';

import { useState, useCallback } from 'react';
import VideoModal from './VideoModal';
import { Clock, Play } from 'lucide-react';

interface VideoModalControllerProps {
  trainings: any[];
}

export default function VideoModalController({ trainings }: VideoModalControllerProps) {
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = useCallback((video: any) => {
    setSelectedVideo(video);
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setSelectedVideo(null);
  }, []);

  return (
    <>
      <VideoTrainingsList trainings={trainings} onOpenVideo={handleOpen} />
      <VideoModal video={selectedVideo} isOpen={isOpen} onClose={handleClose} />
    </>
  );
}

// کامپوننت لیست آموزش‌ها
function VideoTrainingsList({ trainings, onOpenVideo }: { trainings: any[]; onOpenVideo: (video: any) => void }) {
  const categories = trainings.reduce((acc: any, training: any) => {
    const category = training.category || 'سایر';
    if (!acc[category]) acc[category] = [];
    acc[category].push(training);
    return acc;
  }, {});

  return (
    <>
      {Object.keys(categories).length > 0 ? (
        Object.entries(categories).map(([category, items]: [string, any]) => (
          <section key={category} className="mb-16 last:mb-0">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
                {category}
              </h2>
              <span className="text-sm text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                {items.length} آموزش
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((training: any) => (
                <div
                  key={training.id}
                  onClick={() => onOpenVideo(training)}
                  className="cursor-pointer group"
                >
                  <TrainingCard training={training} />
                </div>
              ))}
            </div>
          </section>
        ))
      ) : (
        <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <p className="text-xl text-slate-400 font-bold">به زودی آموزش‌های جدید منتشر خواهند شد ✨</p>
        </div>
      )}
    </>
  );
}

// کامپوننت کارت آموزش با طراحی جدید
function TrainingCard({ training }: { training: any }) {
  return (
    <div className="group cursor-pointer bg-white  shadow p-5">
      {/* تصویر کاور با نسبت 16:9 */}
      <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-3">
        {training.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={training.cover_image} 
            alt={training.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
            <Play className="w-12 h-12 text-blue-400" />
          </div>
        )}
        
        {/* دکمه پلی روی هاور */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-sm">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform duration-300 shadow-2xl">
            <Play className="w-7 h-7 text-blue-600 mr-0.5" />
          </div>
        </div>

        {/* مدت زمان */}
        {training.duration && (
          <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm px-2.5 py-1 rounded-lg text-white text-[11px] font-bold flex items-center gap-1">
            <Clock size={12} />
            {training.duration}
          </div>
        )}
      </div>

      {/* دسته‌بندی */}
      <div className="mb-2">
        <span className="text-[11px] font-bold text-blue-600">
          {training.category || 'آموزش'}
        </span>
      </div>

      {/* عنوان */}
      <h3 className="text-base font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
        {training.title}
      </h3>
      
      {/* زیرنویس */}
      {training.subtitle && (
        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
          {training.subtitle}
        </p>
      )}
    </div>
  );
}