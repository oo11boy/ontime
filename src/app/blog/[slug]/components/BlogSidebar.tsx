"use client";
import React, { useState, useEffect } from 'react';
import TableOfContents from './TableOfContents';
import { Heart, Send, MessageCircle, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BlogSidebar({ headings, slug, initialLikes }: any) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

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
    <aside className="hidden lg:block sticky self-start space-y-6" style={{ top: '120px' }}>
      <TableOfContents headings={headings} />
      
      <div className="p-6 rounded-[2.5rem] bg-white border border-slate-200 shadow-sm">
        <p className="text-sm font-black text-slate-800 mb-5">اشتراک‌گذاری و حمایت</p>
        
        <div className="flex flex-col gap-3">
          {/* دکمه لایک */}
          <button 
            onClick={handleLike}
            className={`flex items-center justify-center gap-2 py-4 rounded-2xl transition-all border ${
              isLiked ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-rose-200 hover:bg-white'
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            <span className="font-bold text-sm">{likes.toLocaleString('fa-IR')} پسند</span>
          </button>

          <div className="grid grid-cols-3 gap-2">
            {/* تلگرام */}
            <a 
              href={`https://t.me/share/url?url=${shareUrl}`}
              target="_blank" 
              className="flex items-center justify-center p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
            >
              <Send className="w-5 h-5" />
            </a>

            {/* واتس‌اپ */}
            <a 
              href={`https://api.whatsapp.com/send?text=${shareUrl}`}
              target="_blank"
              className="flex items-center justify-center p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all"
            >
              <MessageCircle className="w-5 h-5" />
            </a>

            {/* کپی لینک */}
            <button 
              onClick={copyLink}
              className="flex items-center justify-center p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-800 hover:text-white transition-all"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}