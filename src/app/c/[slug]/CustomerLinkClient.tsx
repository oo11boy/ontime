"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Calendar, Star } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import Script from "next/script";

import { InfoTab } from "./components/tabs/info/InfoTab";
import { BookingTab } from "./components/tabs/booking/BookingTab";
import { ReviewsTab } from "./components/tabs/reviews/ReviewsTab";
import { BottomNav } from "./components/shared/BottomNav";
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
  if (business.social_media) {
    if (business.social_media.instagram) schema.sameAs.push(`https://instagram.com/${business.social_media.instagram}`);
    if (business.social_media.telegram) schema.sameAs.push(`https://t.me/${business.social_media.telegram}`);
    if (business.social_media.whatsapp) schema.sameAs.push(`https://wa.me/${business.social_media.whatsapp}`);
    if (business.social_media.rubika) schema.sameAs.push(`https://rubika.ir/${business.social_media.rubika}`);
  }
  if (business.work_shifts && business.work_shifts.length > 0) {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    schema.openingHoursSpecification = business.work_shifts.map((shift: any) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: days,
      opens: shift.start,
      closes: shift.end,
    }));
  }
  return schema;
};

const generateSessionId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// تشخیص خودکار منبع ورود
function detectAutoSource(): { source: string; medium: string; sourcePersian: string } {
  if (typeof window === 'undefined') {
    return { source: 'direct', medium: 'none', sourcePersian: '🔵 مستقیم' };
  }
  const userAgent = navigator.userAgent.toLowerCase();
  const referrer = document.referrer.toLowerCase();

  // اولویت با Referrer
  if (referrer.includes('telegram') || referrer.includes('t.me')) return { source: 'telegram', medium: 'social', sourcePersian: '💬 تلگرام' };
  if (referrer.includes('whatsapp') || referrer.includes('wa.me')) return { source: 'whatsapp', medium: 'social', sourcePersian: '💚 واتساپ' };
  if (referrer.includes('instagram') || referrer.includes('instagr.am')) return { source: 'instagram', medium: 'social', sourcePersian: '📷 اینستاگرام' };
  if (referrer.includes('bale.ir') || referrer.includes('ble.ir')) return { source: 'ble', medium: 'social', sourcePersian: '💬 بله' };
  if (referrer.includes('splus.ir') || referrer.includes('soroush')) return { source: 'soroush', medium: 'social', sourcePersian: '💬 سروش' };
  if (referrer.includes('eitaa.com') || referrer.includes('eitaa.ir')) return { source: 'eitaa', medium: 'social', sourcePersian: '💬 ایتا' };
  if (referrer.includes('rubika.ir')) return { source: 'rubika', medium: 'social', sourcePersian: '💬 روبیکا' };
  if (referrer.includes('google.com') || referrer.includes('google.')) return { source: 'google', medium: 'organic', sourcePersian: '🟡 گوگل' };
  if (referrer.includes('bing.com')) return { source: 'bing', medium: 'organic', sourcePersian: '🔵 بینگ' };
  if (referrer.includes('yahoo.com')) return { source: 'yahoo', medium: 'organic', sourcePersian: '🟣 یاهو' };
  if (referrer.includes('facebook.com') || referrer.includes('fb.com')) return { source: 'facebook', medium: 'social', sourcePersian: '📘 فیسبوک' };
  if (referrer.includes('twitter.com') || referrer.includes('x.com')) return { source: 'twitter', medium: 'social', sourcePersian: '🐦 توییتر' };
  if (referrer.includes('linkedin.com')) return { source: 'linkedin', medium: 'social', sourcePersian: '🔗 لینکدین' };
  if (referrer.includes('aparat.com')) return { source: 'aparat', medium: 'social', sourcePersian: '🎬 آپارات' };

  // سپس User‑Agent
  if (userAgent.includes('telegram')) return { source: 'telegram', medium: 'social', sourcePersian: '💬 تلگرام' };
  if (userAgent.includes('whatsapp')) return { source: 'whatsapp', medium: 'social', sourcePersian: '💚 واتساپ' };
  if (userAgent.includes('instagram')) return { source: 'instagram', medium: 'social', sourcePersian: '📷 اینستاگرام' };
  if (userAgent.includes('bale')) return { source: 'ble', medium: 'social', sourcePersian: '💬 بله' };
  if (userAgent.includes('soroush') || userAgent.includes('splus')) return { source: 'soroush', medium: 'social', sourcePersian: '💬 سروش' };
  if (userAgent.includes('eitaa')) return { source: 'eitaa', medium: 'social', sourcePersian: '💬 ایتا' };
  if (userAgent.includes('rubika')) return { source: 'rubika', medium: 'social', sourcePersian: '💬 روبیکا' };

  if (referrer && referrer !== '') return { source: 'other_website', medium: 'referral', sourcePersian: '📎 سایر سایت‌ها' };
  return { source: 'direct', medium: 'none', sourcePersian: '🔵 مستقیم' };
}

export default function CustomerLinkClient({ initialBusiness, initialBookingEnabled, slug }: CustomerLinkClientProps) {
  const [business] = useState<BusinessData>(initialBusiness);
  const [isBookingEnabled] = useState(initialBookingEnabled);
  const [activeTab, setActiveTab] = useState<"info" | "booking" | "reviews">("info");
  const customerPanelRef = useRef<CustomerPanelRef>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [isTrackingStarted, setIsTrackingStarted] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      let stored = sessionStorage.getItem(`session_${slug}`);
      if (!stored) {
        stored = generateSessionId();
        sessionStorage.setItem(`session_${slug}`, stored);
      }
      setSessionId(stored);
    }
  }, [slug]);

  useEffect(() => {
    if (!sessionId || isTrackingStarted) return;
    setIsTrackingStarted(true);

    const trackVisit = async () => {
      if (sessionStorage.getItem(`visited_${slug}`)) return;

      const autoSource = detectAutoSource();
      const urlParams = new URLSearchParams(window.location.search);
      const utmSource = urlParams.get('utm_source') || autoSource.source;
      const utmMedium = urlParams.get('utm_medium') || autoSource.medium;
      const utmCampaign = urlParams.get('utm_campaign');
      const clientReferrer = document.referrer;
      const userAgent = navigator.userAgent;

      try {
        await fetch('/api/client/customer-link/track-visit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug,
            time_on_page: 0,
            session_id: sessionId,
            utm_source: utmSource,
            utm_medium: utmMedium,
            utm_campaign: utmCampaign,
            referrer: clientReferrer,
            user_agent: userAgent,
          }),
        });
        sessionStorage.setItem(`visited_${slug}`, 'true');
      } catch (error) {
        console.error("Failed to track visit:", error);
      }
    };

    trackVisit();
  }, [slug, sessionId, isTrackingStarted]);

  const trackSocialClick = async (socialType: string) => {
    if (!sessionId) return;
    try {
      await fetch('/api/client/customer-link/social-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, social_type: socialType, session_id: sessionId }),
      });
    } catch (error) {
      console.error("Failed to track social click:", error);
    }
  };

  const handleSocialClick = (socialType: string) => trackSocialClick(socialType);
  const handleShareClick = () => trackSocialClick('share');

  const isWorkingNow = () => {
    if (!business) return false;
    const now = new Date();
    const persianDayMap: { [key: number]: number } = { 6: 0, 0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 6 };
    const persianDay = persianDayMap[now.getDay()];
    if (business.off_days?.includes(persianDay)) return false;
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    if (!business.work_shifts?.length) return currentTime >= "08:00" && currentTime <= "22:00";
    return business.work_shifts.some((shift: any) => currentTime >= shift.start && currentTime <= shift.end);
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
  const schemaMarkup = generateSchemaMarkup(business, slug);

  return (
    <>
      <Script
        id="schema-markup"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
        strategy="afterInteractive"
      />
      <div className="min-h-screen max-w-4xl border shadow-2xl m-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rtl pb-20">
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
                onSocialClick={handleSocialClick}
                onShareClick={handleShareClick}
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