"use client";
import React, { useState } from "react";
import {
  MessageSquare,
  Star,
  CheckCircle,
  XCircle,
  Trash2,
  Reply,
  MoreVertical,
  Search,
  AlertCircle,
  User
} from "lucide-react";

// --- نوع داده دیدگاه ---
type Comment = {
  id: number;
  userName: string;
  businessName: string; // نظری که برای این کسب‌وکار ثبت شده
  avatarColor: string;
  rating: number;
  date: string;
  content: string;
  status: "pending" | "approved" | "rejected";
  reply?: string; // اگر ادمین پاسخ داده باشد
};

// --- داده‌های نمونه ---
const initialComments: Comment[] = [
  {
    id: 1,
    userName: "سارا فراهانی",
    businessName: "سالن زیبایی گلها",
    avatarColor: "from-pink-500 to-rose-500",
    rating: 5,
    date: "۲ ساعت پیش",
    content: "واقعاً کارشون عالی بود، پرسنل بسیار مؤدب و حرفه‌ای بودند. حتما پیشنهاد میکنم.",
    status: "pending",
  },
  {
    id: 2,
    userName: "امیرحسین موسوی",
    businessName: "تعمیرگاه مرکزی",
    avatarColor: "from-blue-500 to-cyan-500",
    rating: 2,
    date: "دیروز",
    content: "متاسفانه خیلی معطل شدم و هزینه نهایی با چیزی که طی کرده بودیم فرق داشت.",
    status: "pending",
  },
  {
    id: 3,
    userName: "زهرا کریمی",
    businessName: "کلینیک دکتر راد",
    avatarColor: "from-emerald-500 to-teal-500",
    rating: 4,
    date: "۳ روز پیش",
    content: "محیط تمیز و آرامی داشت. پزشک هم با حوصله بود.",
    status: "approved",
    reply: "ممنون از ثبت نظر شما، خوشحالیم که راضی بودید.",
  },
  {
    id: 4,
    userName: "کاربر ناشناس",
    businessName: "رستوران ایتالیایی",
    avatarColor: "from-gray-500 to-gray-600",
    rating: 1,
    date: "هفته پیش",
    content: "اصلا کیفیت غذا خوب نبود. سرد سرو شد.",
    status: "rejected",
  },
];

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  // --- فیلتر کردن نظرات ---
  const filteredComments = comments.filter((c) => 
    filter === "all" ? true : c.status === filter
  );

  // --- آمار بالای صفحه ---
  const stats = {
    total: comments.length,
    pending: comments.filter(c => c.status === "pending").length,
    avgRating: (comments.reduce((acc, curr) => acc + curr.rating, 0) / comments.length).toFixed(1)
  };

  // --- هندلر تغییر وضعیت (تایید/رد) ---
  const handleStatusChange = (id: number, newStatus: Comment["status"]) => {
    setComments(comments.map(c => c.id === id ? { ...c, status: newStatus } : c));
  };

  // --- هندلر حذف ---
  const handleDelete = (id: number) => {
    setComments(comments.filter(c => c.id !== id));
  };

  // --- هندلر ارسال پاسخ ---
  const handleSendReply = (id: number) => {
    if (!replyText.trim()) return;
    setComments(comments.map(c => c.id === id ? { ...c, reply: replyText, status: "approved" } : c));
    setReplyText("");
    setReplyingTo(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* --- Header --- */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <MessageSquare className="text-emerald-400 w-7 h-7" />
          دیدگاه‌ها و نظرات
        </h1>
        <p className="text-gray-400 text-sm mt-1">مدیریت بازخورد مشتریان و پاسخ دهی به آنها</p>
      </div>

      {/* --- Stats Cards --- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#242933] border border-emerald-500/20 p-4 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <p className="text-gray-400 text-xs mb-1">نظرات در انتظار تایید</p>
            <h3 className="text-2xl font-bold text-white">{stats.pending}</h3>
          </div>
          <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-xl">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
        
        <div className="bg-[#242933] border border-emerald-500/20 p-4 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <p className="text-gray-400 text-xs mb-1">کل نظرات ثبت شده</p>
            <h3 className="text-2xl font-bold text-white">{stats.total}</h3>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#242933] border border-emerald-500/20 p-4 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <p className="text-gray-400 text-xs mb-1">میانگین امتیازات</p>
            <h3 className="text-2xl font-bold text-white flex items-center gap-1">
              {stats.avgRating} <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            </h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <Star className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* --- Filters & Tabs --- */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#242933] p-2 rounded-2xl border border-emerald-500/10">
        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          {[
            { id: "all", label: "همه نظرات" },
            { id: "pending", label: "در انتظار بررسی" },
            { id: "approved", label: "تایید شده" },
            { id: "rejected", label: "رد شده" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap ${
                filter === tab.id
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="relative w-full sm:w-64">
           <input 
             placeholder="جستجو در نظرات..." 
             className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl py-2 px-4 text-sm focus:outline-none focus:border-emerald-400 transition"
           />
           <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
        </div>
      </div>

      {/* --- Comments List --- */}
      <div className="space-y-4">
        {filteredComments.length === 0 ? (
          <div className="text-center py-20 text-gray-500">نظری در این بخش وجود ندارد.</div>
        ) : (
          filteredComments.map((comment) => (
            <div 
              key={comment.id} 
              className={`bg-[#242933] border rounded-2xl p-5 transition-all duration-300 hover:shadow-lg ${
                comment.status === "pending" ? "border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.05)]" : "border-emerald-500/20"
              }`}
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${comment.avatarColor} flex items-center justify-center text-white font-bold text-lg shadow-inner`}>
                    {comment.userName[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{comment.userName}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">برای: <span className="text-emerald-400">{comment.businessName}</span></span>
                      <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                      <span className="text-xs text-gray-500">{comment.date}</span>
                    </div>
                  </div>
                </div>

                {/* Stars & Status Badge */}
                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`w-4 h-4 ${star <= comment.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`} 
                      />
                    ))}
                  </div>
                  {comment.status === "pending" && (
                    <span className="text-[10px] bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded-full border border-yellow-500/20">در انتظار تایید</span>
                  )}
                  {comment.status === "approved" && (
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full border border-emerald-500/20">تایید شده</span>
                  )}
                   {comment.status === "rejected" && (
                    <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full border border-red-500/20">رد شده</span>
                  )}
                </div>
              </div>

              {/* Comment Content */}
              <div className="bg-[#1a1e26] p-4 rounded-xl border border-white/5 text-gray-300 text-sm leading-6 mb-4 relative">
                <div className="absolute -top-2 right-6 w-4 h-4 bg-[#1a1e26] border-t border-l border-white/5 rotate-45"></div>
                {comment.content}
              </div>

              {/* Admin Reply (if exists) */}
              {comment.reply && (
                <div className="mr-8 mb-4 bg-emerald-500/5 border-r-2 border-emerald-500 p-3 rounded-l-xl">
                   <p className="text-xs text-emerald-400 font-bold mb-1">پاسخ ادمین:</p>
                   <p className="text-sm text-gray-400">{comment.reply}</p>
                </div>
              )}

              {/* Inline Reply Input */}
              {replyingTo === comment.id && (
                <div className="mb-4 animate-in fade-in slide-in-from-top-2">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="پاسخ خود را بنویسید..."
                    className="w-full bg-[#1a1e26] border border-emerald-500/30 rounded-xl p-3 text-sm focus:border-emerald-400 outline-none text-white min-h-[80px]"
                  ></textarea>
                  <div className="flex justify-end gap-2 mt-2">
                    <button onClick={() => setReplyingTo(null)} className="text-xs text-gray-400 hover:text-white px-3 py-2">انصراف</button>
                    <button onClick={() => handleSendReply(comment.id)} className="bg-emerald-500 text-white text-xs px-4 py-2 rounded-lg hover:bg-emerald-600">ارسال پاسخ</button>
                  </div>
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                 <div className="flex gap-2">
                    {comment.status === "pending" && (
                      <>
                        <button onClick={() => handleStatusChange(comment.id, "approved")} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-emerald-400 px-3 py-1.5 rounded-lg hover:bg-emerald-500/10 transition">
                          <CheckCircle className="w-4 h-4" /> تایید
                        </button>
                        <button onClick={() => handleStatusChange(comment.id, "rejected")} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition">
                          <XCircle className="w-4 h-4" /> رد کردن
                        </button>
                      </>
                    )}
                    {comment.status !== "pending" && (
                       <button onClick={() => handleStatusChange(comment.id, "pending")} className="text-xs text-gray-500 hover:text-yellow-400 transition">بازگرداندن به بررسی</button>
                    )}
                 </div>

                 <div className="flex gap-2">
                    {!comment.reply && (
                      <button 
                        onClick={() => { setReplyingTo(comment.id); setReplyText(""); }} 
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-400 px-3 py-1.5 rounded-lg hover:bg-blue-500/10 transition"
                      >
                        <Reply className="w-4 h-4" /> پاسخ
                      </button>
                    )}
                    <button onClick={() => handleDelete(comment.id)} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition">
                      <Trash2 className="w-4 h-4" /> حذف
                    </button>
                 </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}