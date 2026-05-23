// src/app/clientdashboard/customer-link/reviews/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Star,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Eye,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface Review {
  id: number;
  customer_name: string;
  rating: number;
  comment: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  likes: number;
}

export default function ReviewsManagementPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/client/reviews?status=${filter}`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.data);
      }
    } catch (error) {
      toast.error("خطا در دریافت نظرات");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const handleApprove = async (reviewId: number) => {
    try {
      const res = await fetch("/api/client/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, action: "approve" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("نظر تایید شد");
        fetchReviews();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("خطا در تایید نظر");
    }
  };

  const handleReject = async (reviewId: number) => {
    try {
      const res = await fetch("/api/client/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, action: "reject" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("نظر رد شد");
        fetchReviews();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("خطا در رد نظر");
    }
  };

  const handleDelete = async (reviewId: number) => {
    if (!confirm("آیا از حذف این نظر اطمینان دارید؟")) return;
    try {
      const res = await fetch(`/api/client/reviews?id=${reviewId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("نظر حذف شد");
        fetchReviews();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("خطا در حذف نظر");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return { label: "در انتظار تایید", icon: Clock, color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" };
      case "approved":
        return { label: "تایید شده", icon: CheckCircle, color: "bg-green-500/20 text-green-400 border-green-500/30" };
      case "rejected":
        return { label: "رد شده", icon: XCircle, color: "bg-red-500/20 text-red-400 border-red-500/30" };
      default:
        return { label: "نامشخص", icon: Clock, color: "bg-gray-500/20 text-gray-400" };
    }
  };

  const pendingCount = reviews.filter(r => r.status === "pending").length;

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">
            📝 مدیریت نظرات
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {pendingCount > 0 && `${pendingCount} نظر در انتظار تایید`}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 bg-slate-100 dark:bg-white/5 rounded-xl p-1">
        {[
          { id: "all", label: "همه", count: reviews.length },
          { id: "pending", label: "در انتظار", count: reviews.filter(r => r.status === "pending").length },
          { id: "approved", label: "تایید شده", count: reviews.filter(r => r.status === "approved").length },
          { id: "rejected", label: "رد شده", count: reviews.filter(r => r.status === "rejected").length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === tab.id
                ? "bg-emerald-600 text-white"
                : "text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-white/10"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`mr-1 px-1.5 py-0.5 rounded-full text-xs ${
                filter === tab.id ? "bg-white/20" : "bg-slate-200 dark:bg-white/10"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-[#1a1e26] rounded-2xl border border-slate-200 dark:border-white/10">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">نظری وجود ندارد</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => {
            const statusBadge = getStatusBadge(review.status);
            const StatusIcon = statusBadge.icon;
            return (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#1a1e26] rounded-2xl p-4 border border-slate-200 dark:border-white/10"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 dark:text-white">
                        {review.customer_name}
                      </h4>
                      <div className="flex items-center gap-0.5 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${
                              star <= review.rating
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-slate-600 dark:text-gray-300 text-sm mt-2 max-w-md">
                        {review.comment}
                      </p>
                      <p className="text-xs text-slate-400 mt-2">
                        {new Date(review.created_at).toLocaleDateString("fa-IR")}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusBadge.color} border`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusBadge.label}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                {review.status === "pending" && (
                  <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-white/10">
                    <button
                      onClick={() => handleApprove(review.id)}
                      className="flex-1 py-2 bg-green-600 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-green-700 transition"
                    >
                      <CheckCircle className="w-4 h-4" /> تایید
                    </button>
                    <button
                      onClick={() => handleReject(review.id)}
                      className="flex-1 py-2 bg-red-600 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-red-700 transition"
                    >
                      <XCircle className="w-4 h-4" /> رد
                    </button>
                  </div>
                )}

                {(review.status === "approved" || review.status === "rejected") && (
                  <div className="flex justify-end gap-2 mt-3 pt-2">
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="px-3 py-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-sm flex items-center gap-1 transition"
                    >
                      <Trash2 className="w-4 h-4" /> حذف
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}