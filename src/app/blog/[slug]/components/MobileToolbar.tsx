"use client";
import React, { useState, useEffect } from 'react';
import { List, Share2, Heart, X, ChevronLeft, Send, MessageCircle, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MobileToolbar({ headings, slug, initialLikes }: any) {
  const [showTOC, setShowTOC] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    setShareUrl(window.location.href);
    // ثبت بازدید
    fetch('/api/customer/blog/stats', { method: 'POST', body: JSON.stringify({ slug, action: 'view' }) });
    
    // بررسی وضعیت لایک
    const likedPosts = JSON.parse(localStorage.getItem('liked_posts') || '[]');
    if (likedPosts.includes(slug)) setIsLiked(true);
  }, [slug]);

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
          title: 'مقاله مجله آنتایم',
          text: 'این مطلب آموزشی را در آنتایم بخوانید:',
          url: shareUrl,
        });
      } catch (err) { console.log(err); }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('لینک مقاله کپی شد');
  };

  return (
    <>
      {/* نوار ابزار اصلی پایین صفحه */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-100 w-[92%] max-w-[400px]">
        <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/60 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[2.5rem] p-2 flex items-center justify-between">
          
          {/* دکمه فهرست */}
          <button 
            onClick={() => setShowTOC(true)} 
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3.5 rounded-[1.8rem] font-black text-xs active:scale-95 transition-transform"
          >
            <List className="w-4 h-4" /> 
            فهرست محتوا
          </button>

          <div className="flex items-center gap-1 px-3">
            {/* دکمه لایک */}
            <button 
              onClick={handleLike} 
              className={`flex items-center gap-1.5 p-2.5 transition-colors ${isLiked ? 'text-rose-500' : 'text-slate-400 active:scale-125'}`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm font-black tracking-tighter">{likes.toLocaleString('fa-IR')}</span>
            </button>

            <div className="w-px h-6 bg-slate-100 mx-1" />

            {/* دکمه اشتراک‌گذاری */}
            <button 
              onClick={handleShare} 
              className="p-2.5 text-slate-400 active:scale-125 transition-transform"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* منوی کشویی فهرست سرفصل‌ها */}
      {showTOC && (
        <div className="lg:hidden fixed inset-0 z-110">
          {/* لایه تیره پس‌زمینه */}
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowTOC(false)} />
          
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[3rem] p-8 max-h-[85vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-8" />
            
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-black text-xl text-slate-900">سرفصل‌های مقاله</h3>
              <button onClick={() => setShowTOC(false)} className="p-2.5 bg-slate-50 rounded-full active:bg-slate-100 transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* لیست هیدینگ‌ها */}
            <div className="space-y-1 mb-8 text-right" dir="rtl">
              {headings.length > 0 ? (
                headings.map((h: any, i: number) => (
                  <a 
                    key={i} 
                    href={`#${h.id}`} 
                    onClick={() => setShowTOC(false)} 
                    className={`flex items-center justify-between py-4 px-4 rounded-2xl active:bg-blue-50 transition-colors ${
                      h.level === 2 ? 'text-slate-900 font-black bg-slate-50/50 mb-1' : 'text-slate-500 font-bold pr-10 text-sm'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      {h.level === 2 && <span className="w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]" />}
                      {h.title}
                    </span>
                    <ChevronLeft className="w-4 h-4 text-slate-300" />
                  </a>
                ))
              ) : (
                <p className="text-center text-slate-400 py-10 text-sm">محتوای این بخش یافت نشد.</p>
              )}
            </div>

            {/* اشتراک‌گذاری سریع در پایین منو */}
            <div className="border-t border-slate-100 pt-6">
              <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">اشتراک‌گذاری سریع</p>
              <div className="grid grid-cols-3 gap-3">
                <a 
                  href={`https://t.me/share/url?url=${shareUrl}`}
                  className="flex items-center justify-center p-4 bg-sky-50 text-sky-600 rounded-2xl active:scale-95 transition-transform"
                >
                  <Send className="w-5 h-5" />
                </a>
                <a 
                  href={`https://api.whatsapp.com/send?text=${shareUrl}`}
                  className="flex items-center justify-center p-4 bg-emerald-50 text-emerald-600 rounded-2xl active:scale-95 transition-transform"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
                <button 
                  onClick={copyToClipboard}
                  className="flex items-center justify-center p-4 bg-slate-50 text-slate-600 rounded-2xl active:scale-95 transition-transform"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}