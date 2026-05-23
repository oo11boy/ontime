// src/app/c/[slug]/components/ReviewsSection.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, User, Heart, MessageSquare, Send, X, Loader2, ThumbsUp, Calendar as CalendarIcon, Quote } from "lucide-react";
import { toast } from "react-hot-toast";

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
  likes: number;
}

interface ReviewsSectionProps {
  slug: string;
}

export function ReviewsSection({ slug }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    customer_name: "",
    rating: 5,
    comment: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likedReviews, setLikedReviews] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchReviews();
  }, [slug]);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/customer-link/${slug}/reviews`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.data);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewForm.customer_name || !reviewForm.comment) {
      toast.error("لطفاً نام و نظر خود را وارد کنید");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/customer-link/${slug}/reviews/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          customer_name: reviewForm.customer_name,
          rating: reviewForm.rating,
          comment: reviewForm.comment,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("نظر شما با موفقیت ثبت شد و پس از تایید نمایش داده می‌شود");
        setShowReviewModal(false);
        setReviewForm({ customer_name: "", rating: 5, comment: "" });
        fetchReviews();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("خطا در ثبت نظر");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = (reviewId: string) => {
    if (likedReviews.has(reviewId)) {
      setLikedReviews(prev => {
        const newSet = new Set(prev);
        newSet.delete(reviewId);
        return newSet;
      });
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, likes: r.likes - 1 } : r));
    } else {
      setLikedReviews(prev => new Set(prev).add(reviewId));
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, likes: r.likes + 1 } : r));
    }
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percentage: reviews.length ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 : 0,
  }));

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="relative">
          <div className="w-8 h-8 border-2 border-emerald-500/30 rounded-full animate-spin border-t-emerald-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 px-5">
      {/* Rating Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-emerald-600/20 to-teal-600/20 backdrop-blur-sm p-5 border border-white/10"
      >
        <div className="flex items-center gap-5">
          <div className="text-center">
            <p className="text-5xl font-bold text-white">{averageRating.toFixed(1)}</p>
            <div className="flex items-center gap-0.5 mt-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className={`w-4 h-4 ${star <= Math.round(averageRating) ? "text-yellow-500 fill-yellow-500" : "text-gray-500"}`} />
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">بر اساس {reviews.length} نظر</p>
          </div>
          <div className="flex-1 space-y-1">
            {ratingDistribution.map(({ star, percentage }) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-6">{star}</span>
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full" style={{ width: `${percentage}%` }} />
                </div>
                <span className="text-xs text-gray-500 w-8">{Math.round(percentage)}%</span>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={() => setShowReviewModal(true)}
          className="w-full mt-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm font-medium transition flex items-center justify-center gap-2"
        >
          <MessageSquare className="w-4 h-4" /> ثبت نظر جدید
        </button>
      </motion.div>

      {/* Reviews List */}
      <AnimatePresence>
        {reviews.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
          >
            <div className="w-16 h-16 mx-auto bg-white/5 rounded-2xl flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-gray-500" />
            </div>
            <p className="text-gray-400 font-medium">هنوز نظری ثبت نشده است</p>
            <p className="text-sm text-gray-500 mt-1">اولین نفری باشید که نظر می‌دهید</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <h4 className="font-semibold text-white">{review.customer_name}</h4>
                        <div className="flex items-center gap-0.5 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className={`w-3 h-3 ${star <= review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-500"}`} />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <CalendarIcon className="w-3 h-3" />
                        {new Date(review.created_at).toLocaleDateString("fa-IR")}
                      </div>
                    </div>
                    <div className="relative mt-3">
                      <Quote className="w-4 h-4 text-gray-600 absolute -top-1 -right-1" />
                      <p className="text-gray-300 text-sm leading-relaxed pr-5">
                        {review.comment}
                      </p>
                    </div>
                    <button
                      onClick={() => handleLike(review.id)}
                      className={`mt-3 text-xs transition flex items-center gap-1.5 px-2 py-1 rounded-full ${
                        likedReviews.has(review.id)
                          ? "text-emerald-400 bg-emerald-500/20"
                          : "text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" /> {review.likes}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Review Modal - Modern Glass Design */}
      <AnimatePresence>
        {showReviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-gray-800/95 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-white/10 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">ثبت نظر</h3>
                </div>
                <button onClick={() => setShowReviewModal(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              
              <div className="p-5 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    نام شما <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={reviewForm.customer_name}
                    onChange={(e) => setReviewForm({ ...reviewForm, customer_name: e.target.value })}
                    placeholder="نام و نام خانوادگی"
                    className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    امتیاز شما <span className="text-red-400">*</span>
                  </label>
                  <div className="flex gap-2 justify-center py-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-9 h-9 transition-all ${
                            star <= reviewForm.rating
                              ? "text-yellow-500 fill-yellow-500 drop-shadow-lg"
                              : "text-gray-600"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    نظر شما <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    placeholder="تجربه خود را با ما به اشتراک بگذارید..."
                    rows={4}
                    className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 resize-none transition"
                  />
                </div>

                <button
                  onClick={handleSubmitReview}
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold hover:shadow-lg hover:shadow-emerald-500/25 transition disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "ثبت نظر"}
                </button>

                <p className="text-xs text-center text-gray-500">
                  نظر شما پس از تایید نمایش داده می‌شود
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}