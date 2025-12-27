"use client";
import React, { useState, useEffect } from 'react';
import TableOfContents from './TableOfContents';
import { Heart, Send, MessageCircle, Copy, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BlogSidebar({ headings, slug, initialLikes }: any) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [progress, setProgress] = useState(0);

  // محاسبه میزان اسکرول برای نوار پیشرفت
  useEffect(() => {
    const updateProgress = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        setProgress((window.scrollY / scrollHeight) * 100);
      }
    };

    window.addEventListener("scroll", updateProgress);
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  useEffect(() => {
    setShareUrl(window.location.href);
    const likedPosts = JSON.parse(localStorage.getItem('liked_posts') || '[]');
    if (likedPosts.includes(slug)) setIsLiked(true);
  }, [slug]);

  const handleLike = async () => {
    if (isLiked) return;
    try {
      const res = await fetch('/api/customer/blog/stats', {
        method: 'POST',
        body: JSON.stringify({ slug, action: 'like' }),
      });
      if (res.ok) {
        const data = await res.json();
        setLikes(data.likes);
        setIsLiked(true);
        const likedPosts = JSON.parse(localStorage.getItem('liked_posts') || '[]');
        likedPosts.push(slug);
        localStorage.setItem('liked_posts', JSON.stringify(likedPosts));
        toast.success('ممنون از حمایت شما!');
      }
    } catch (err) { toast.error('خطایی رخ داد'); }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('لینک مقاله کپی شد');
  };

  return (
    <>
      {/* --- نسخه دسکتاپ --- */}
      <aside className="hidden lg:block sticky self-start space-y-6" style={{ top: '120px' }}>
        {/* نوار پیشرفت عمودی ظریف در کنار سایدبار */}
        <div className="absolute -right-4 top-0 bottom-0 w-1 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="w-full bg-blue-600 transition-all duration-150" 
            style={{ height: `${progress}%` }}
          />
        </div>

        <TableOfContents headings={headings} />
        
        <div className="p-6 rounded-[2.5rem] bg-white border border-slate-200 shadow-sm relative overflow-hidden">
          <p className="text-sm font-black text-slate-800 mb-5">اشتراک‌گذاری و حمایت</p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={handleLike}
              className={`flex items-center justify-center gap-2 py-4 rounded-2xl transition-all border ${
                isLiked ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-rose-200'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="font-bold text-sm">{likes.toLocaleString('fa-IR')} پسند</span>
            </button>

            <div className="grid grid-cols-3 gap-2">
              <button onClick={copyLink} className="flex items-center justify-center p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-800 hover:text-white transition-all">
                <Copy className="w-5 h-5" />
              </button>
              {/* سایر دکمه‌ها مشابه قبل... */}
            </div>
          </div>
        </div>
      </aside>

      {/* --- نسخه موبایل (Floating Bar با نوار پیشرفت) --- */}
      <div className="lg:hidden fixed bottom-6 left-6 right-6 z-100 bg-white/90 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-10">
        
        {/* نوار پیشرفت مطالعه (بالای دکمه‌ها) */}
        <div className="w-full h-1 bg-slate-100">
          <div 
            className="h-full bg-black transition-all duration-150" 
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-4 p-3">
          <button 
            onClick={handleLike}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl transition-all ${
              isLiked ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            <span className="font-black text-xs">{likes > 0 ? likes.toLocaleString('fa-IR') : 'پسند'}</span>
          </button>

          <div className="flex items-center gap-2">
             <button onClick={copyLink} className="p-3 bg-slate-100 text-slate-600 rounded-2xl"><Copy size={18} /></button>
             <button 
              onClick={() => navigator.share && navigator.share({ title: 'آنتایم', url: shareUrl })}
              className="p-3 bg-blue-50 text-blue-600 rounded-2xl"
             >
              <Share2 size={18} />
             </button>
          </div>
        </div>
      </div>
    </>
  );
}