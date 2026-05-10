// src/app/(admin pages)/admindashboard/support-tickets/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  MessageCircle,
  CheckCircle,
  Clock,
  Eye,
  RefreshCw,
  User,
  Phone,
  Mail,
  Flag,
  Send,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Ticket {
  id: number;
  user_id: number;
  user_name: string;
  user_phone: string;
  user_email: string | null;
  category: "suggestion" | "complaint" | "bug" | "feature" | "question" | "other";
  subject: string;
  message: string;
  priority: "low" | "normal" | "high" | "urgent";
  status: "open" | "in_progress" | "answered" | "closed";
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
  admin_id: number | null;
  created_at: string;
}

const categoryConfig = {
  suggestion: { label: "پیشنهاد", color: "text-emerald-400 bg-emerald-500/10", icon: "💡" },
  complaint: { label: "انتقاد", color: "text-red-400 bg-red-500/10", icon: "👎" },
  bug: { label: "گزارش باگ", color: "text-yellow-400 bg-yellow-500/10", icon: "🐛" },
  feature: { label: "درخواست ویژگی", color: "text-purple-400 bg-purple-500/10", icon: "⭐" },
  question: { label: "سوال", color: "text-blue-400 bg-blue-500/10", icon: "❓" },
  other: { label: "سایر", color: "text-gray-400 bg-white/5", icon: "📝" },
};

const priorityConfig = {
  low: { label: "کم", color: "text-gray-400", border: "border-gray-500/30" },
  normal: { label: "متوسط", color: "text-blue-400", border: "border-blue-500/30" },
  high: { label: "بالا", color: "text-orange-400", border: "border-orange-500/30" },
  urgent: { label: "فوری", color: "text-red-400", border: "border-red-500/30" },
};

const statusConfig = {
  open: { label: "باز", color: "text-yellow-400 bg-yellow-500/10", icon: AlertCircle },
  in_progress: { label: "در حال بررسی", color: "text-blue-400 bg-blue-500/10", icon: RefreshCw },
  answered: { label: "پاسخ داده شده", color: "text-emerald-400 bg-emerald-500/10", icon: CheckCircle },
  closed: { label: "بسته شده", color: "text-gray-400 bg-white/5", icon: XCircle },
};

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/support-tickets", {
        cache: "no-store",
      });
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast.error("خطا در دریافت تیکت‌ها");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTicketReplies = useCallback(async (ticketId: number) => {
    try {
      const res = await fetch(`/api/admin/support-tickets/${ticketId}/replies?id=${ticketId}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (data.success) {
        setReplies(data.replies || []);
      }
    } catch (error) {
      console.error("Error fetching replies:", error);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const openModal = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setReplyMessage("");
    await fetchTicketReplies(ticket.id);
    setIsModalOpen(true);
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim()) {
      toast.error("لطفاً متن پاسخ را وارد کنید");
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch(`/api/admin/support-tickets/${selectedTicket!.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyMessage }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("پاسخ با موفقیت ارسال شد");
        setReplyMessage("");
        await fetchTicketReplies(selectedTicket!.id);
        await fetchTickets();
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

  const handleStatusChange = async (ticketId: number, status: string) => {
    try {
      const res = await fetch(`/api/admin/support-tickets/${ticketId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`وضعیت تیکت به "${statusConfig[status as keyof typeof statusConfig].label}" تغییر یافت`);
        await fetchTickets();
        if (selectedTicket && selectedTicket.id === ticketId) {
          setSelectedTicket({ ...selectedTicket, status: status as any });
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("خطا در تغییر وضعیت");
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    if (filterStatus !== "all" && ticket.status !== filterStatus) return false;
    if (filterPriority !== "all" && ticket.priority !== filterPriority) return false;
    return true;
  });

  const getCategoryInfo = (category: string) => {
    return categoryConfig[category as keyof typeof categoryConfig] || categoryConfig.other;
  };

  const formatDate = (date: string) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("fa-IR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === "open").length,
    inProgress: tickets.filter(t => t.status === "in_progress").length,
    urgent: tickets.filter(t => t.priority === "urgent" && t.status !== "closed").length,
  };

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageCircle className="text-emerald-400 w-7 h-7" />
            تیکت‌های پشتیبانی
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            مدیریت و پاسخگویی به پیام‌های کاربران
          </p>
        </div>
        <button
          onClick={fetchTickets}
          className="bg-white/5 hover:bg-white/10 text-gray-300 px-4 py-2 rounded-xl flex items-center gap-2 transition"
        >
          <RefreshCw className="w-4 h-4" />
          بروزرسانی
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#242933] border border-white/10 rounded-xl p-4">
          <p className="text-gray-400 text-xs mb-1">کل تیکت‌ها</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-[#242933] border border-yellow-500/20 rounded-xl p-4">
          <p className="text-gray-400 text-xs mb-1">باز</p>
          <p className="text-2xl font-bold text-yellow-400">{stats.open}</p>
        </div>
        <div className="bg-[#242933] border border-blue-500/20 rounded-xl p-4">
          <p className="text-gray-400 text-xs mb-1">در حال بررسی</p>
          <p className="text-2xl font-bold text-blue-400">{stats.inProgress}</p>
        </div>
        <div className="bg-[#242933] border border-red-500/20 rounded-xl p-4">
          <p className="text-gray-400 text-xs mb-1">فوری</p>
          <p className="text-2xl font-bold text-red-400">{stats.urgent}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-[#1a1e26] border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50"
        >
          <option value="all">همه وضعیت‌ها</option>
          <option value="open">باز</option>
          <option value="in_progress">در حال بررسی</option>
          <option value="answered">پاسخ داده شده</option>
          <option value="closed">بسته شده</option>
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="bg-[#1a1e26] border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50"
        >
          <option value="all">همه اولویت‌ها</option>
          <option value="low">کم</option>
          <option value="normal">متوسط</option>
          <option value="high">بالا</option>
          <option value="urgent">فوری</option>
        </select>
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <RefreshCw className="w-10 h-10 animate-spin text-emerald-400" />
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-[#242933]/50 rounded-2xl border border-dashed border-gray-700">
          <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p>هیچ تیکتی یافت نشد</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => {
            const categoryInfo = getCategoryInfo(ticket.category);
            const priorityInfo = priorityConfig[ticket.priority];
            const StatusIcon = statusConfig[ticket.status].icon;
            const isUrgent = ticket.priority === "urgent" && ticket.status !== "closed";
            
            return (
              <div
                key={ticket.id}
                className={`bg-[#242933] border rounded-2xl p-5 transition-all cursor-pointer ${
                  isUrgent ? "border-red-500/40" : "border-white/10 hover:border-emerald-500/40"
                }`}
                onClick={() => openModal(ticket)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <h3 className="font-bold text-white text-lg">{ticket.subject}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${categoryInfo.color}`}>
                        {categoryInfo.icon} {categoryInfo.label}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${priorityInfo.border} ${priorityInfo.color}`}>
                        اولویت: {priorityInfo.label}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusConfig[ticket.status].color} flex items-center gap-1`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig[ticket.status].label}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                      {ticket.message}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {ticket.user_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" />
                        {ticket.user_phone}
                      </span>
                      {ticket.user_email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          {ticket.user_email}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDate(ticket.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 mr-4">
                    <div className="p-2 rounded-lg bg-white/5">
                      <Eye className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal تیکت */}
      <AnimatePresence>
        {isModalOpen && selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#242933] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10 shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedTicket.subject}</h2>
                    <p className="text-gray-400 text-sm mt-1">
                      از {selectedTicket.user_name} • {formatDate(selectedTicket.created_at)}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 rounded-lg hover:bg-white/10 transition"
                  >
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* پیام اصلی کاربر */}
                <div className="bg-[#1a1e26] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-bold text-white">{selectedTicket.user_name}</span>
                    <span className="text-xs text-gray-500">{formatDate(selectedTicket.created_at)}</span>
                  </div>
                  <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                    {selectedTicket.message}
                  </p>
                </div>

                {/* پاسخ‌ها */}
                {replies.length > 0 ? (
                  replies.map((reply) => (
                    <div
                      key={reply.id}
                      className={`rounded-xl p-4 ${
                        reply.is_admin_reply
                          ? "bg-emerald-500/10 border border-emerald-500/30 ml-8"
                          : "bg-[#1a1e26] mr-8"
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
                            <span className="text-sm font-bold text-white">{selectedTicket.user_name}</span>
                          </>
                        )}
                        <span className="text-xs text-gray-500">{formatDate(reply.created_at)}</span>
                      </div>
                      <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                        {reply.message}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    هنوز پاسخی ارسال نشده است
                  </div>
                )}
              </div>

              {/* تغییر وضعیت - فقط برای تیکت‌های باز یا در حال بررسی */}
              {selectedTicket.status !== "closed" && (
                <div className="px-6 pt-2 pb-4 border-t border-white/10 shrink-0">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusChange(selectedTicket.id, "in_progress")}
                      className={`text-xs px-3 py-1.5 rounded-lg transition ${
                        selectedTicket.status === "in_progress"
                          ? "bg-blue-500 text-white"
                          : "bg-white/5 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      در حال بررسی
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedTicket.id, "answered")}
                      className={`text-xs px-3 py-1.5 rounded-lg transition ${
                        selectedTicket.status === "answered"
                          ? "bg-emerald-500 text-white"
                          : "bg-white/5 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      پاسخ داده شده
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedTicket.id, "closed")}
                      className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition"
                    >
                      بستن تیکت
                    </button>
                  </div>
                </div>
              )}

              {/* فرم ارسال پاسخ */}
              {selectedTicket.status !== "closed" && (
                <div className="p-6 border-t border-white/10 shrink-0">
                  <div className="flex gap-3">
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="پاسخ خود را وارد کنید..."
                      rows={2}
                      className="flex-1 bg-[#1a1e26] border border-white/10 rounded-xl p-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition resize-none"
                    />
                    <button
                      onClick={handleSendReply}
                      disabled={isSending || !replyMessage.trim()}
                      className="px-4 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition disabled:opacity-50 flex items-center justify-center"
                    >
                      {isSending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}