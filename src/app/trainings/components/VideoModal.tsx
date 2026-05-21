'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

interface VideoModalProps {
  video: {
    id: number;
    title: string;
    subtitle: string | null;
    video_url: string;
    cover_image: string | null;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function VideoModal({ video, isOpen, onClose }: VideoModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      // افزایش بازدید هنگام پخش ویدیو
      if (video) {
        fetch(`/api/trainings?id=${video.id}`, {
          method: 'GET',
        }).catch(console.error);
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, video]);

  if (!isOpen || !video) return null;

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    
    if (url.includes('aparat.com')) {
      const videoId = url.split('/').pop()?.split('?')[0];
      return `https://www.aparat.com/video/video/embed/videohash/${videoId}/vt/frame`;
    }
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      if (url.includes('youtube.com/watch?v=')) {
        videoId = url.split('v=')[1]?.split('&')[0] || '';
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('/').pop()?.split('?')[0] || '';
      }
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  const embedUrl = getEmbedUrl(video.video_url);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-5xl bg-black rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 left-3 z-10 w-10 h-10 bg-black/70 hover:bg-black/90 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
          aria-label="بستن"
        >
          <X size={20} />
        </button>


        <div className="aspect-video w-full bg-black">
          {embedUrl.includes('youtube.com') || embedUrl.includes('aparat.com') ? (
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              title={video.title}
            />
          ) : (
            <video
              src={embedUrl}
              className="w-full h-full"
              controls
              autoPlay
              poster={video.cover_image || undefined}
              controlsList="nodownload"
            />
          )}
        </div>
      </div>
    </div>
  );
}