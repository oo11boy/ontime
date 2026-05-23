"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import React from "react";

// Import tab components
import { InfoTab } from "./components/tabs/info/InfoTab";
import { BookingTab } from "./components/tabs/booking/BookingTab";
import { ReviewsTab } from "./components/tabs/reviews/ReviewsTab";
import { BottomNav } from "./components/shared/BottomNav";

// Import types
import { BusinessData } from "./components/shared/types";
import { CustomerPanelRef } from "./components/tabs/booking/components/CustomerPanel";

// ==================== Main Component ====================
export default function CustomerLinkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);

  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"info"  | "booking" | "reviews">("info");

  const customerPanelRef = useRef<CustomerPanelRef>(null);

  useEffect(() => {
    const fetchBusiness = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/customer-link/${slug}`);
        const data = await res.json();
        if (data.success) {
          setBusiness(data.data);
        } else {
          setError(data.message);
        }
      } catch {
        setError("خطا در ارتباط با سرور");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBusiness();
  }, [slug]);

  const isWorkingNow = () => {
    if (!business) return false;
    const now = new Date();
    const persianDayMap: { [key: number]: number } = { 6: 0, 0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 6 };
    const persianDay = persianDayMap[now.getDay()];
    if (business.off_days?.includes(persianDay)) return false;
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
    if (!business.work_shifts?.length) return currentTime >= "08:00" && currentTime <= "22:00";
    return business.work_shifts.some((shift) => currentTime >= shift.start && currentTime <= shift.end);
  };

  const handleBookingClick = () => {
    if (activeTab === "booking") {
      customerPanelRef.current?.openNewBookingModal();
    } else {
      setActiveTab("booking");
      setTimeout(() => {
        customerPanelRef.current?.openNewBookingModal();
      }, 100);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">{error || "صفحه یافت نشد"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rtl pb-20">
      <Toaster position="top-center" />

      <AnimatePresence mode="wait">
        {activeTab === "info" && (
          <motion.div
            key="info"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <InfoTab business={business} isWorkingNow={isWorkingNow()} onBookingClick={handleBookingClick} />
          </motion.div>
        )}

 

        {activeTab === "booking" && (
          <motion.div
            key="booking"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <BookingTab ref={customerPanelRef} business={business} slug={slug} />
          </motion.div>
        )}

        {activeTab === "reviews" && (
          <motion.div
            key="reviews"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ReviewsTab slug={slug} />
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}