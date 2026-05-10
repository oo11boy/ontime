// src/app/(client pages)/clientdashboard/support-tickets/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  RefreshCw,
  Send,
  User,
  MessageCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Flag,
  Reply,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface Ticket {
  id: number;
  user_name: string;
  user_phone: string;
  user_email: string | null;
  category: string;
  subject: string;
  message: string;
  priority: string;
  status: string;
  admin_response: string | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Reply {
  id: number;
  ticket_id: number;
  message: string;
  is_admin_reply: boolean;
  created_at: string;
}

const categoryConfig: Record<string, { label: string; icon: string; color: string }> = {
  suggestion: { label: "پیشنهاد", icon: "💡", color: "text-emerald-400" },
  complaint: { label: "انتقاد", icon: "👎", color: "text-red-400" },
  bug: { label: "گزارش باگ", icon: "🐛", color: "text-yellow-400" },
  feature: { label: "درخواست ویژگی", icon: "⭐", color: "text-purple-400" },
  question: { label: "سوال", icon: "❓", color: "text-blue-400" },
  other: { label: "سایر", icon: "📝", color: "text-gray-400" },
};

const priorityConfig = {
  low: { label: "کم", color: "text-gray-400" },
  normal: { label: "متوسط", color: "text-blue-400" },
  high: { label: "بالا", color: "text-orange-400" },
  urgent: { label: "فوری", color: "text-red-400" },
};

const statusConfig = {
  open: { label: "باز", color: "text-yellow-400", icon: AlertCircle, bg: "bg-yellow-500/10" },
  in_progress: { label: "در حال بررسی", color: "text-blue-400", icon: RefreshCw, bg: "bg-blue-500/10" },
  answered: { label: "پاسخ داده شده", color: "text-emerald-400", icon: CheckCircle, bg: "bg-emerald-500/10" },
  closed: { label: "بسته شده", color: "text-gray-400", icon: XCircle, bg: "bg-white/5" },
};

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  // دریافت id از params (در Next.js 15 استفاده از params مستقیماً)
  const ticketId = params?.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const fetchTicket = async () => {
    if (!ticketId) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/client/support-tickets/${ticketId}`);
      const data = await res.json();
      if (data.success) {
        setTicket(data.ticket);
        setReplies(data.replies || []);
      } else {
        toast.error(data.message);
        router.push("/clientdashboard/support-tickets");
      }
    } catch (error) {
      console.error("Error fetching ticket:", error);
      toast.error("خطا در دریافت اطلاعات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ticketId) {
      fetchTicket();
    }
  }, [ticketId]);

  const handleSendReply = async () => {
    if (!replyMessage.trim()) {
      toast.error("لطفاً متن پاسخ را وارد کنید");
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch(`/api/client/support-tickets/${ticketId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyMessage }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("پاسخ شما با موفقیت ارسال شد");
        setReplyMessage("");
        fetchTicket();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error sending reply:", error);
      toast.error("خطا در ارسال پاسخ");
    } finally {
      setIsSending(false);
    }
  };

  const handleCloseTicket = async () => {
    setIsClosing(true);
    try {
      const res = await fetch(`/api/client/support-tickets/${ticketId}/close`, {
        method: "PUT",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("تیکت با موفقیت بسته شد");
        fetchTicket();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error closing ticket:", error);
      toast.error("خطا در بستن تیکت");
    } finally {
      setIsClosing(false);
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("fa-IR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!ticket) return null;

  const categoryInfo = categoryConfig[ticket.category] || categoryConfig.other;
  const priorityInfo = priorityConfig[ticket.priority as keyof typeof priorityConfig] || priorityConfig.normal;
  const statusInfo = statusConfig[ticket.status as keyof typeof statusConfig] || statusConfig.open;
  const StatusIcon = statusInfo.icon;

  return (
    <div className="h-screen text-white overflow-auto max-w-md m-auto mb-10">
     {/* Header */}
      <div className="sticky top-0 z-50 bg-[#1a1e26]/90 backdrop-blur-xl border-b border-emerald-500/30">
        <div className="max-w-2xl mx-auto p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-white">جزئیات تیکت</h1>
              </div>
            {ticket.status !== "closed" && (
              <button
                onClick={handleCloseTicket}
                disabled={isClosing}
                className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30 transition disabled:opacity-50"
              >
                {isClosing ? "در حال بستن..." : "بستن تیکت"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* اطلاعات تیکت */}
        <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <h2 className="text-lg font-bold text-white">{ticket.subject}</h2>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${categoryInfo.color} bg-white/5`}>
              {categoryInfo.icon} {categoryInfo.label}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${priorityInfo.color} bg-white/5`}>
              اولویت: {priorityInfo.label}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusInfo.color} ${statusInfo.bg} flex items-center gap-1`}>
              <StatusIcon className="w-3 h-3" />
              {statusInfo.label}
            </span>
          </div>

          <div className="bg-[#1a1e26] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-white">{ticket.user_name}</span>
              <span className="text-xs text-gray-500">{formatDate(ticket.created_at)}</span>
            </div>
            <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
              {ticket.message}
            </p>
          </div>
        </div>

        {/* پاسخ‌ها */}
        {replies.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 flex items-center gap-2">
              <Reply className="w-4 h-4" />
              پاسخ‌ها ({replies.length})
            </h3>
            {replies.map((reply) => (
              <div
                key={reply.id}
                className={`rounded-xl p-4 ${
                  reply.is_admin_reply
                    ? "bg-emerald-500/10 border border-emerald-500/30 mr-4"
                    : "bg-white/5 ml-4"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {reply.is_admin_reply ? (
                    <>
                      <Flag className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-bold text-emerald-400">پشتیبانی آنتایم</span>
                    </>
                  ) : (
                    <>
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-bold text-white">شما</span>
                    </>
                  )}
                  <span className="text-xs text-gray-500">{formatDate(reply.created_at)}</span>
                </div>
                <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                  {reply.message}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* فرم ارسال پاسخ - فقط برای تیکت‌های بسته نشده */}
        {ticket.status !== "closed" && (
          <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
            <h3 className="text-sm font-bold text-gray-400 mb-4">ارسال پاسخ جدید</h3>
            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="پاسخ خود را وارد کنید..."
              rows={4}
              className="w-full bg-[#1a1e26] border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition resize-none"
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={handleSendReply}
                disabled={isSending || !replyMessage.trim()}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition disabled:opacity-50 flex items-center gap-2"
              >
                {isSending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    ارسال پاسخ
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* وضعیت تیکت */}
        <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
          <h3 className="text-sm font-bold text-gray-400 mb-3">وضعیت تیکت</h3>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-400">تاریخ ایجاد:</span>
              <span className="text-sm text-white">{formatDate(ticket.created_at)}</span>
            </div>
            {ticket.responded_at && (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-gray-400">آخرین پاسخ:</span>
                <span className="text-sm text-white">{formatDate(ticket.responded_at)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}