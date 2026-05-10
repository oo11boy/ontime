// src/app/(client pages)/clientdashboard/support-tickets/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Plus,
  RefreshCw,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Footer from "../components/Footer/Footer";

interface Ticket {
  id: number;
  category: "suggestion" | "complaint" | "bug" | "feature" | "question" | "other";
  subject: string;
  message: string;
  priority: "low" | "normal" | "high" | "urgent";
  status: "open" | "in_progress" | "answered" | "closed";
  created_at: string;
  updated_at: string;
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
  low: { label: "کم", color: "text-gray-400" },
  normal: { label: "متوسط", color: "text-blue-400" },
  high: { label: "بالا", color: "text-orange-400" },
  urgent: { label: "فوری", color: "text-red-400" },
};

const statusConfig = {
  open: { label: "باز", color: "text-yellow-400", icon: AlertCircle },
  in_progress: { label: "در حال بررسی", color: "text-blue-400", icon: RefreshCw },
  answered: { label: "پاسخ داده شده", color: "text-emerald-400", icon: CheckCircle },
  closed: { label: "بسته شده", color: "text-gray-400", icon: XCircle },
};

export default function SupportTicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/client/support-tickets");
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("خطا در دریافت تیکت‌ها");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const filteredTickets = tickets.filter(ticket => {
    if (filterStatus !== "all" && ticket.status !== filterStatus) return false;
    return true;
  });

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "امروز";
    if (days === 1) return "دیروز";
    if (days < 7) return `${days} روز پیش`;
    return d.toLocaleDateString("fa-IR");
  };

  const getStatusIcon = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config?.icon || AlertCircle;
    return <Icon className="w-4 h-4" />;
  };

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === "open").length,
    answered: tickets.filter(t => t.status === "answered").length,
    urgent: tickets.filter(t => t.priority === "urgent" && t.status !== "closed").length,
  };

  return (
 <div className="h-screen text-white overflow-auto max-w-md m-auto ">
  
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#1a1e26]/90 backdrop-blur-xl border-b border-emerald-500/30">
        <div className="max-w-2xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-white">تیکت‌های پشتیبانی</h1>
                <p className="text-xs text-gray-400">پیگیری و پاسخگویی به درخواست‌ها</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/clientdashboard/support-tickets/new")}
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 transition text-white"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-36 pt-6 space-y-6">
        {/* آمار */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-[10px] text-gray-500">کل تیکت‌ها</p>
          </div>
          <div className="bg-yellow-500/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-yellow-400">{stats.open}</p>
            <p className="text-[10px] text-gray-500">باز</p>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">{stats.answered}</p>
            <p className="text-[10px] text-gray-500">پاسخ داده شده</p>
          </div>
          <div className="bg-red-500/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.urgent}</p>
            <p className="text-[10px] text-gray-500">فوری</p>
          </div>
        </div>

        {/* فیلتر */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap ${
              filterStatus === "all"
                ? "bg-emerald-500 text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            همه
          </button>
          {Object.entries(statusConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap ${
                filterStatus === key
                  ? `${config.color} bg-white/10`
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>

        {/* لیست تیکت‌ها */}
        {loading ? (
          <div className="flex justify-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-20">
            <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500">هیچ تیکتی یافت نشد</p>
            <button
              onClick={() => router.push("/clientdashboard/support-tickets/new")}
              className="mt-4 px-6 py-2 bg-emerald-500 rounded-xl text-white font-bold"
            >
              ایجاد تیکت جدید
            </button>
          </div>
        ) : (
          <div className="space-y-3 ">
            {filteredTickets.map((ticket) => {
              const categoryInfo = categoryConfig[ticket.category];
              const priorityInfo = priorityConfig[ticket.priority];
              const statusInfo = statusConfig[ticket.status];
              const isUrgent = ticket.priority === "urgent" && ticket.status !== "closed";

              return (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push(`/clientdashboard/support-tickets/${ticket.id}`)}
                  className={`bg-white/5 rounded-2xl p-4 border transition-all cursor-pointer ${
                    isUrgent ? "border-red-500/40" : "border-white/10 hover:border-emerald-500/40"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-bold text-white text-base">{ticket.subject}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${categoryInfo.color}`}>
                          {categoryInfo.icon} {categoryInfo.label}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${priorityInfo.color} bg-white/5`}>
                          اولویت: {priorityInfo.label}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm line-clamp-2 mb-2">
                        {ticket.message}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(ticket.created_at)}
                        </span>
                        <span className={`flex items-center gap-1 ${statusInfo.color}`}>
                          {getStatusIcon(ticket.status)}
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 mr-3">
                      <Eye className="w-5 h-5 text-gray-500" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      <Footer/>
    </div>
  );
}