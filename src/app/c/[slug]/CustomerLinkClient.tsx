"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Home, Calendar, Star } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import Script from "next/script";

// Import tab components
import { InfoTab } from "./components/tabs/info/InfoTab";
import { BookingTab } from "./components/tabs/booking/BookingTab";
import { ReviewsTab } from "./components/tabs/reviews/ReviewsTab";
import { BottomNav } from "./components/shared/BottomNav";

// Import types
import { BusinessData } from "./components/shared/types";
import { CustomerPanelRef } from "./components/tabs/booking/components/CustomerPanel";

interface Tab {
  id: "info" | "booking" | "reviews";
  label: string;
  icon: any;
}

interface CustomerLinkClientProps {
  initialBusiness: BusinessData;
  initialBookingEnabled: boolean;
  slug: string;
}

// تابع تولید اسکیما مارکاپ
const generateSchemaMarkup = (business: BusinessData, slug: string) => {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://ontimeapp.ir";
  const url = `${baseUrl}/c/${slug}`;
  
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.business_name,
    description: business.bio || "",
    image: business.avatar_image || business.logo || "",
    telephone: business.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.business_address,
      addressCountry: "IR",
    },
    url: url,
    sameAs: [] as string[],
    openingHoursSpecification: [] as any[],
    priceRange: "$$",
  };

  // اضافه کردن شبکه‌های اجتماعی
  if (business.social_media) {
    if (business.social_media.instagram) schema.sameAs.push(`https://instagram.com/${business.social_media.instagram}`);
    if (business.social_media.telegram) schema.sameAs.push(`https://t.me/${business.social_media.telegram}`);
    if (business.social_media.whatsapp) schema.sameAs.push(`https://wa.me/${business.social_media.whatsapp}`);
    if (business.social_media.rubika) schema.sameAs.push(`https://rubika.ir/${business.social_media.rubika}`);
  }

  // اضافه کردن ساعات کاری
  if (business.work_shifts && business.work_shifts.length > 0) {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    schema.openingHoursSpecification = business.work_shifts.map((shift) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: days,
      opens: shift.start,
      closes: shift.end,
    }));
  }

  return schema;
};

export default function CustomerLinkClient({ 
  initialBusiness, 
  initialBookingEnabled, 
  slug 
}: CustomerLinkClientProps) {
  const [business] = useState<BusinessData>(initialBusiness);
  const [isBookingEnabled] = useState(initialBookingEnabled);
  const [activeTab, setActiveTab] = useState<"info" | "booking" | "reviews">("info");
  const customerPanelRef = useRef<CustomerPanelRef>(null);

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
    if (!isBookingEnabled) {
      toast.error("امکان ثبت نوبت آنلاین برای این کسب‌وکار فعال نیست");
      return;
    }
    if (activeTab === "booking") {
      customerPanelRef.current?.openNewBookingModal();
    } else {
      setActiveTab("booking");
      setTimeout(() => {
        customerPanelRef.current?.openNewBookingModal();
      }, 100);
    }
  };

  const getVisibleTabs = (): Tab[] => {
    const tabs: Tab[] = [{ id: "info", label: "معرفی", icon: Home }];
    if (isBookingEnabled) tabs.push({ id: "booking", label: "نوبت دهی", icon: Calendar });
    tabs.push({ id: "reviews", label: "نظرات", icon: Star });
    return tabs;
  };

  const visibleTabs = getVisibleTabs();

  // اسکیما مارکاپ
  const schemaMarkup = generateSchemaMarkup(business, slug);

  return (
    <>
      {/* Schema.org markup for SEO */}
      <Script
        id="schema-markup"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
        strategy="afterInteractive"
      />

      <div className="min-h-screen max-w-md m-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rtl pb-20">
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
              <InfoTab 
                business={business} 
                isWorkingNow={isWorkingNow()} 
                onBookingClick={handleBookingClick}
                isBookingEnabled={isBookingEnabled}
              />
            </motion.div>
          )}

          {activeTab === "booking" && isBookingEnabled && (
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

        <BottomNav 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          visibleTabs={visibleTabs}
        />
      </div>
    </>
  );
}