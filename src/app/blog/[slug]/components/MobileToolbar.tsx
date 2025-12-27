"use client";
import React, { useState, useEffect } from 'react';
import { List, Share2, Heart, X, ChevronLeft, Send, MessageCircle, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MobileToolbar({ headings, slug, initialLikes }: any) {
  const [showTOC, setShowTOC] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setShareUrl(window.location.href);
    
    // محاسبه پیشرفت مطالعه
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentProgress = (window.scrollY / totalHeight) * 100;
      setProgress(currentProgress);
    };

    window.addEventListener("scroll", handleScroll);
    
    // بررسی وضعیت لایک از قبل
    const likedPosts = JSON.parse(localStorage.getItem('liked_posts') || '[]');
    if (likedPosts.includes(slug)) setIsLiked(true);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [slug]);

  // جلوگیری از اسکرول صفحه هنگام باز بودن فهرست
  useEffect(() => {
    if (showTOC) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [showTOC]);

  const handleLike = async () => {
    if (isLiked) return;
    try {
      const res = await fetch('/api/customer/blog/stats', { 
        method: 'POST', 
        body: JSON.stringify({ slug, action: 'like' }) 
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'مجله تخصصی آنتایم',
          text: 'این مقاله کاربردی را از دست ندهید:',
          url: shareUrl,
        });
      } catch (err) { console.log(err); }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('لینک کپی شد');
  };

  return (
    <>
      {/* نوار ابزار شناور پایینی */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-100 w-[92%] max-w-[400px]">
        
        {/* نوار پیشرفت مطالعه بسیار ظریف بالای تولبار */}
        <div className="w-[80%] mx-auto h-1 bg-white/40 backdrop-blur-md rounded-t-full overflow-hidden -mb-1">
          <div 
            className="h-full bg-blue-500 transition-all duration-150" 
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/60 shadow-[0_20px_50px_rgba(0,0,0,0.2)] rounded-[2.5rem] p-2 flex items-center justify-between">
          
          {/* دکمه فهرست با استایل متمایز */}
          <button 
            onClick={() => setShowTOC(true)} 
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3.5 rounded-[1.8rem] font-black text-xs active:scale-95 transition-all shadow-lg shadow-slate-200"
          >
            <List className="w-4 h-4 text-white" /> 
            فهرست محتوا
          </button>

          <div className="flex items-center gap-1 px-3">
            {/* لایک */}
            <button 
              onClick={handleLike} 
              className={`flex items-center gap-1.5 p-2.5 transition-all ${isLiked ? 'text-rose-500 scale-110' : 'text-slate-400 active:scale-125'}`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm font-black tracking-tighter">{likes.toLocaleString('fa-IR')}</span>
            </button>

            <div className="w-px h-6 bg-slate-100 mx-1" />

            {/* اشتراک‌گذاری */}
            <button 
              onClick={handleShare} 
              className="p-2.5 text-slate-400 active:scale-125 transition-transform"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* منوی کشویی فهرست (BottomSheet Style) */}
      {showTOC && (
        <div className="lg:hidden fixed inset-0 z-110">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowTOC(false)} />
          
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[3rem] p-8 max-h-[80vh] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-500">
            {/* دستگیره بالای منو */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 shrink-0" />
            
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h3 className="font-black text-xl text-slate-900">سرفصل‌های مقاله</h3>
              <button onClick={() => setShowTOC(false)} className="p-2.5 bg-slate-50 rounded-full active:rotate-90 transition-transform">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* محتوای قابل اسکرول فهرست */}
            <div className="overflow-y-auto space-y-1 mb-6 pr-1 custom-scrollbar" dir="rtl">
              {headings.map((h: any, i: number) => (
                <a 
                  key={i} 
                  href={`#${h.id}`} 
                  onClick={() => setShowTOC(false)} 
                  className={`flex items-center justify-between py-4 px-4 rounded-2xl active:bg-blue-50 transition-colors ${
                    h.level === 2 ? 'text-slate-900 font-black bg-slate-50/50 mb-1 border border-slate-100' : 'text-slate-500 font-bold pr-10 text-sm'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    {h.level === 2 && <span className="w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]" />}
                    {h.title}
                  </span>
                  <ChevronLeft className="w-4 h-4 text-slate-300" />
                </a>
              ))}
            </div>

            {/* بخش ثابت اشتراک‌گذاری در انتهای منو */}
            <div className="border-t border-slate-100 pt-6 shrink-0 bg-white">
              <div className="grid grid-cols-3 gap-3">
                <a href={`https://t.me/share/url?url=${shareUrl}`} className="flex items-center justify-center p-4 bg-sky-50 text-sky-600 rounded-2xl active:scale-90 transition-transform"><Send className="w-5 h-5" /></a>
                <a href={`https://api.whatsapp.com/send?text=${shareUrl}`} className="flex items-center justify-center p-4 bg-emerald-50 text-emerald-600 rounded-2xl active:scale-90 transition-transform"><MessageCircle className="w-5 h-5" /></a>
                <button onClick={copyToClipboard} className="flex items-center justify-center p-4 bg-slate-50 text-slate-600 rounded-2xl active:scale-90 transition-transform"><Copy className="w-5 h-5" /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </>
  );
}