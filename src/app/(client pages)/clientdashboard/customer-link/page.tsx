// src/app/clientdashboard/customer-link/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Copy,
  CheckCircle,
  Sparkles,
  Crown,
  Eye,
  Share2,
  ExternalLink,
  Rocket,
  Loader2,
  Check,
  Zap,
  Users,
  Globe,
  Share,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { CreateCustomerLinkWizard } from "./components/CreateCustomerLinkWizard";
import { BusinessInfoBox } from "./components/BusinessInfoBox";
import { ServicesBox } from "./components/ServicesBox";
import { WorkingHoursBox } from "./components/WorkingHoursBox";
import { SocialMediaBox } from "./components/SocialMediaBox";
import { GalleryBox } from "./components/GalleryBox";
import { PlanStatusBox } from "./components/PlanStatusBox";

// ==================== Types ====================
interface SocialMedia {
  instagram: string;
  telegram: string;
  rubika: string;
  whatsapp: string;
  eitaa: string;
  bale: string;
  soroush: string;
}

interface Service {
  id: number;
  name: string;
  price: number;
  duration_minutes: number;
}

interface Shift {
  start: string;
  end: string;
}

interface ExistingLink {
  id: string;
  slug: string;
  fullUrl: string;
  createdAt: string;
  totalVisits: number;
  isActive: boolean;
  business_name: string;
  business_address: string;
  phone: string;
  bio: string;
  logo: string | null;
  avatar_image?: string | null;
  cover_image?: string | null;
  social_media?: SocialMedia;
  services?: Service[];
  work_shifts?: Shift[];
  off_days?: number[];
  province?: string;
  city?: string;
}

// ==================== کامپوننت نمایش لینک موجود ====================
function ExistingLinkCard({ 
  link, 
  onBusinessInfoSave,
  onServicesChange,
  onWorkingHoursChange,
  onSocialMediaChange
}: { 
  link: ExistingLink; 
  onBusinessInfoSave: (data: {
    business_name: string;
    business_address: string;
    bio: string;
    avatar_image: string | null;
    cover_image: string | null;
    province: string;
    city: string;
    phone: string;
  }) => Promise<void>;
  onServicesChange: (services: Service[]) => Promise<void>;
  onWorkingHoursChange: (shifts: Shift[], offDays: number[]) => Promise<void>;
  onSocialMediaChange: (socialMedia: SocialMedia) => Promise<void>;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://${link.fullUrl}`);
    setCopied(true);
    toast.success("✅ لینک کپی شد");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: link.business_name,
        text: "صفحه اختصاصی ما را ببینید",
        url: `https://${link.fullUrl}`,
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  const handlePreview = () => {
    window.open(`https://${link.fullUrl}`, "_blank");
  };

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-[#1a1e26] rounded-xl p-3 text-center shadow-sm border border-slate-200 dark:border-white/10">
          <Eye className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-slate-800 dark:text-white">
            {link.totalVisits.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500">بازدید از صفحه</p>
        </div>
        <div className="bg-white dark:bg-[#1a1e26] rounded-xl p-3 text-center shadow-sm border border-slate-200 dark:border-white/10">
          <Share2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-slate-800 dark:text-white">۰</p>
          <p className="text-xs text-slate-500">دفعه اشتراک</p>
        </div>
      </div>

      {/* Link Card */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-4 text-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <Crown className="w-4 h-4" />
            <span className="text-xs font-medium">لینک اختصاصی شما</span>
          </div>
        </div>
        
        <div className="bg-white/10 rounded-xl p-2">
          <p className="text-[10px] opacity-80 mb-1">آدرس صفحه:</p>
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-mono truncate">{link.fullUrl}</p>
            <button onClick={handleCopy} className="p-1.5 bg-white/20 rounded-lg shrink-0">
              {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <button onClick={handleShare} className="flex-1 py-1.5 bg-white/10 rounded-xl text-xs flex items-center justify-center gap-1">
            <Share2 className="w-3 h-3" /> اشتراک
          </button>
          <button onClick={handlePreview} className="flex-1 py-1.5 bg-white/20 rounded-xl text-xs flex items-center justify-center gap-1">
            <ExternalLink className="w-3 h-3" /> پیش‌نمایش
          </button>
        </div>
      </div>

      <GalleryBox linkId={parseInt(link.id)} />

      {/* باکس اطلاعات کسب‌وکار */}
      <BusinessInfoBox
        businessName={link.business_name}
        businessAddress={link.business_address}
        bio={link.bio || ""}
        avatarImage={link.avatar_image || null}
        coverImage={link.cover_image || null}
        province={link.province || ""}
        city={link.city || ""}
        phone={link.phone || ""}
        onSave={onBusinessInfoSave}
      />

      {/* باکس خدمات */}
      <ServicesBox
        selectedServices={link.services || []}
        onServicesChange={onServicesChange}
      />

      {/* باکس ساعت کاری و تعطیلات */}
      <WorkingHoursBox
        workShifts={link.work_shifts || []}
        offDays={link.off_days || []}
        onWorkingHoursChange={onWorkingHoursChange}
      />

      {/* باکس شبکه‌های اجتماعی */}
      <SocialMediaBox
        socialMedia={link.social_media || {
          instagram: "", telegram: "", rubika: "", whatsapp: "", eitaa: "", bale: "", soroush: ""
        }}
        onSocialMediaChange={onSocialMediaChange}
      />
    </div>
  );
}

// ==================== صفحه اول (بدون لینک) ====================
function CreateLinkCallToAction({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="inline-flex items-center gap-1 bg-emerald-100 px-3 py-1 rounded-full mb-3">
          <Rocket className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-medium text-emerald-700">کاملاً رایگان</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          یه <span className="text-emerald-600">صفحه اختصاصی</span> برای کسب‌وکارت بساز
        </h1>
        <p className="text-gray-500 text-sm mt-2">مشتریات با یه کلیک، همه چی رو ببینن</p>
      </div>
      <button
        onClick={onCreate}
        className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg"
      >
        <Rocket className="w-5 h-5" />
       صفحه اختصاصی من را بساز
        <Sparkles className="w-4 h-4" />
      </button>

<div className="space-y-3">
  {/* ثبت نوبت آنلاین */}
  <div className="flex items-start gap-3 p-3 bg-white dark:bg-[#1a1e26] rounded-xl shadow-sm border border-slate-200 dark:border-white/10 hover:shadow-md transition-shadow">
    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
      <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
    <div>
      <p className="font-bold text-slate-800 dark:text-white text-sm">📅 ثبت نوبت آنلاین ۲۴ ساعته</p>
      <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5 leading-relaxed">
        مشتریان شما در هر ساعت از شبانه‌روز می‌توانند نوبت ثبت کنند و شما درخواست‌ها را تأیید یا رد می‌کنید
      </p>
    </div>
  </div>

  {/* نمایش در گوگل */}
  <div className="flex items-start gap-3 p-3 bg-white dark:bg-[#1a1e26] rounded-xl shadow-sm border border-slate-200 dark:border-white/10 hover:shadow-md transition-shadow">
    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
      <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.66 0 3-4 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4-3-9s1.34-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    </div>
    <div>
      <p className="font-bold text-slate-800 dark:text-white text-sm">🔍 نمایش در نتایج گوگل</p>
      <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5 leading-relaxed">
        صفحه اختصاصی شما در جستجوی گوگل نمایش داده می‌شود و مشتریان به راحتی شما را پیدا می‌کنند
      </p>
    </div>
  </div>

  {/* اشتراک در شبکه‌های اجتماعی */}
  <div className="flex items-start gap-3 p-3 bg-white dark:bg-[#1a1e26] rounded-xl shadow-sm border border-slate-200 dark:border-white/10 hover:shadow-md transition-shadow">
    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
      <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    </div>
    <div>
      <p className="font-bold text-slate-800 dark:text-white text-sm">📱 اشتراک‌گذاری در شبکه‌های اجتماعی</p>
      <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5 leading-relaxed">
        لینک صفحه خود را در اینستاگرام، واتساپ، تلگرام و سایر شبکه‌های اجتماعی به اشتراک بگذارید
      </p>
    </div>
  </div>

  {/* معرفی کامل کسب‌وکار */}
  <div className="flex items-start gap-3 p-3 bg-white dark:bg-[#1a1e26] rounded-xl shadow-sm border border-slate-200 dark:border-white/10 hover:shadow-md transition-shadow">
    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
      <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    </div>
    <div>
      <p className="font-bold text-slate-800 dark:text-white text-sm">🏢 معرفی کامل کسب‌وکار</p>
      <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5 leading-relaxed">
        نمایش خدمات، ساعات کاری، آدرس، شماره تماس و نظرات مشتریان در صفحه اختصاصی
      </p>
    </div>
  </div>

  {/* نمایش گالری نمونه کارها */}
  <div className="flex items-start gap-3 p-3 bg-white dark:bg-[#1a1e26] rounded-xl shadow-sm border border-slate-200 dark:border-white/10 hover:shadow-md transition-shadow">
    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
      <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
    <div>
      <p className="font-bold text-slate-800 dark:text-white text-sm">🖼️ گالری تصاویر نمونه کار</p>
      <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5 leading-relaxed">
        نمایش تصاویر نمونه کارهای خود در صفحه اختصاصی برای جلب اعتماد بیشتر مشتریان
      </p>
    </div>
  </div>

  {/* ثبت نظر توسط مشتری */}
  <div className="flex items-start gap-3 p-3 bg-white dark:bg-[#1a1e26] rounded-xl shadow-sm border border-slate-200 dark:border-white/10 hover:shadow-md transition-shadow">
    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
      <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    </div>
    <div>
      <p className="font-bold text-slate-800 dark:text-white text-sm">⭐ ثبت نظر و امتیاز توسط مشتری</p>
      <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5 leading-relaxed">
        مشتریان می‌توانند نظر و امتیاز خود را ثبت کنند و شما نظرات را در صفحه نمایش دهید
      </p>
    </div>
  </div>
</div>

 


      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="p-2 bg-slate-50 rounded-xl">
          <Check className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
          <p className="text-xs text-black  font-bold">بیو اینستاگرام</p>
        </div>
        <div className="p-2 bg-slate-50 rounded-xl">
          <Check className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
          <p className="text-xs text-black  font-bold">لینک واتساپ</p>
        </div>
        <div className="p-2 bg-slate-50 rounded-xl">
          <Check className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
          <p className="text-xs text-black  font-bold">نمایش در گوگل</p>
        </div>
        <div className="p-2 bg-slate-50 rounded-xl">
          <Check className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
          <p className="text-xs text-black  font-bold">کاملاً رایگان</p>
        </div>
      </div>

      <div className="text-center pt-2">
        <p className="text-[11px] text-gray-400">✨ بیش از ۱۰,۰۰۰ کسب‌وکار از آنتایم استفاده می‌کنن</p>
      </div>
    </div>
  );
}

// ==================== صفحه اصلی ====================
export default function CustomerLinkHomePage() {
  const router = useRouter();
  const [hasLink, setHasLink] = useState<boolean | null>(null);
  const [existingLink, setExistingLink] = useState<ExistingLink | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editData, setEditData] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [planStatus, setPlanStatus] = useState<{
    isEnabled: boolean;
    expiryDate: string | null;
    daysRemaining: number;
  }>({ isEnabled: false, expiryDate: null, daysRemaining: 0 });
  const [hasPurchasedPlan, setHasPurchasedPlan] = useState(false);

  const fetchPlanStatus = async () => {
    try {
      const res = await fetch("/api/client/customer-link/booking-feature-status");
      const data = await res.json();
      console.log("=== Plan Status Response ===", data);
      
      if (data.success) {
        setPlanStatus({
          isEnabled: data.isEnabled,
          expiryDate: data.expiryDate,
          daysRemaining: data.daysRemaining || 0,
        });
        
        // اگر expiryDate وجود داشته باشد، یعنی قبلاً پلن خریده شده
        // (حتی اگر منقضی شده باشد)
        setHasPurchasedPlan(!!data.expiryDate);
      }
    } catch (error) {
      console.error("Error fetching plan status:", error);
    }
  };

  const fetchCustomerLink = async () => {
    try {
      const res = await fetch("/api/client/customer-link");
      const data = await res.json();
      
      if (data.success && data.hasLink && data.link) {
        setExistingLink({
          id: data.link.id,
          slug: data.link.slug,
          fullUrl: data.link.fullUrl,
          createdAt: data.link.createdAt,
          totalVisits: data.link.totalVisits || 0,
          isActive: data.link.isActive,
          business_name: data.link.business_name || "",
          business_address: data.link.business_address || "",
          phone: data.link.phone || "",
          bio: data.link.bio || "",
          logo: data.link.logo || null,
          avatar_image: data.link.avatar_image || null,
          cover_image: data.link.cover_image || null,
          social_media: data.link.social_media,
          services: data.link.services,
          work_shifts: data.link.work_shifts,
          off_days: data.link.off_days,
          province: data.link.province || "",
          city: data.link.city || "",
        });
        setHasLink(true);
      } else {
        setHasLink(false);
        setExistingLink(null);
      }
    } catch (error) {
      console.error("Error fetching customer link:", error);
      setHasLink(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerLink();
    fetchPlanStatus();
  }, []);

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    toast.success("✅ صفحه اختصاصی ساخته شد!");
    fetchCustomerLink();
  };

  const handleEditLink = () => {
    if (existingLink) {
      setEditData({
        slug: existingLink.slug,
        business_name: existingLink.business_name,
        business_address: existingLink.business_address,
        phone: existingLink.phone,
        bio: existingLink.bio,
        logo: existingLink.logo,
        avatar_image: existingLink.avatar_image,
        cover_image: existingLink.cover_image,
        province: existingLink.province || "",
        city: existingLink.city || "",
        social_media: existingLink.social_media || {
          instagram: "", telegram: "", rubika: "", whatsapp: "", eitaa: "", bale: "", soroush: ""
        },
        selected_services: existingLink.services || [],
        work_shifts: existingLink.work_shifts || [],
        off_days: existingLink.off_days || [],
      });
      setShowEditModal(true);
    }
  };

  const handleBusinessInfoSave = async (data: {
    business_name: string;
    business_address: string;
    bio: string;
    avatar_image: string | null;
    cover_image: string | null;
    province: string;
    city: string;
    phone: string;
  }) => {
    if (!existingLink) return;

    const res = await fetch("/api/client/customer-link", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: existingLink.slug,
        business_name: data.business_name,
        business_address: data.business_address,
        bio: data.bio,
        avatar_image: data.avatar_image,
        cover_image: data.cover_image,
        phone: data.phone,
        province: data.province,
        city: data.city,
        logo: data.avatar_image || existingLink.logo,
        social_media: existingLink.social_media || {},
        services: existingLink.services || [],
        work_shifts: existingLink.work_shifts || [],
        off_days: existingLink.off_days || [],
      }),
    });

    const result = await res.json();
    if (!result.success) {
      throw new Error(result.message);
    }
    
    await fetchCustomerLink();
  };

  const handleServicesChange = async (services: Service[]) => {
    if (!existingLink) return;

    const res = await fetch("/api/client/customer-link", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: existingLink.slug,
        business_name: existingLink.business_name,
        business_address: existingLink.business_address,
        bio: existingLink.bio || "",
        avatar_image: existingLink.avatar_image || null,
        cover_image: existingLink.cover_image || null,
        phone: existingLink.phone,
        logo: existingLink.logo,
        province: existingLink.province || "",
        city: existingLink.city || "",
        social_media: existingLink.social_media || {},
        services: services,
        work_shifts: existingLink.work_shifts || [],
        off_days: existingLink.off_days || [],
      }),
    });

    const result = await res.json();
    if (!result.success) {
      throw new Error(result.message);
    }
    
    await fetchCustomerLink();
  };

  const handleWorkingHoursChange = async (shifts: Shift[], offDays: number[]) => {
    if (!existingLink) return;

    const res = await fetch("/api/client/customer-link", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: existingLink.slug,
        business_name: existingLink.business_name,
        business_address: existingLink.business_address,
        bio: existingLink.bio || "",
        avatar_image: existingLink.avatar_image || null,
        cover_image: existingLink.cover_image || null,
        phone: existingLink.phone,
        logo: existingLink.logo,
        province: existingLink.province || "",
        city: existingLink.city || "",
        social_media: existingLink.social_media || {},
        services: existingLink.services || [],
        work_shifts: shifts,
        off_days: offDays,
      }),
    });

    const result = await res.json();
    if (!result.success) {
      throw new Error(result.message);
    }
    
    await fetchCustomerLink();
  };

  const handleSocialMediaChange = async (socialMedia: SocialMedia) => {
    if (!existingLink) return;

    const res = await fetch("/api/client/customer-link", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: existingLink.slug,
        business_name: existingLink.business_name,
        business_address: existingLink.business_address,
        bio: existingLink.bio || "",
        avatar_image: existingLink.avatar_image || null,
        cover_image: existingLink.cover_image || null,
        phone: existingLink.phone,
        logo: existingLink.logo,
        province: existingLink.province || "",
        city: existingLink.city || "",
        social_media: socialMedia,
        services: existingLink.services || [],
        work_shifts: existingLink.work_shifts || [],
        off_days: existingLink.off_days || [],
      }),
    });

    const result = await res.json();
    if (!result.success) {
      throw new Error(result.message);
    }
    
    await fetchCustomerLink();
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-5">
          <h1 className="text-lg font-bold text-gray-800 dark:text-white">
            {hasLink ? "🔗 لینک اختصاصی شما" : "🚀 صفحه اختصاصی کسب‌وکار"}
          </h1>
          {hasLink && (
            <p className="text-xs text-gray-500 mt-0.5">این لینک رو با مشتریات به اشتراک بذار</p>
          )}
        </div>

        {hasLink && existingLink ? (
          <>
            {/* باکس پلن - فقط در صورتی که قبلاً پلن خریده شده باشد */}
            {hasPurchasedPlan && (
              <div className="mb-4">
                <PlanStatusBox 
                  expiryDate={planStatus.expiryDate}
                  daysRemaining={planStatus.daysRemaining}
                  hasPurchasedPlan={hasPurchasedPlan}
                  onRefresh={fetchPlanStatus}
                />
              </div>
            )}
            
            <ExistingLinkCard 
              link={existingLink} 
              onBusinessInfoSave={handleBusinessInfoSave}
              onServicesChange={handleServicesChange}
              onWorkingHoursChange={handleWorkingHoursChange}
              onSocialMediaChange={handleSocialMediaChange}
            />
          </>
        ) : (
          <CreateLinkCallToAction onCreate={() => setShowCreateModal(true)} />
        )}
      </div>

      {showCreateModal && (
        <CreateCustomerLinkWizard 
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            fetchCustomerLink();
          }}
          onSuccess={handleCreateSuccess}
          editMode={false}
        />
      )}

      {showEditModal && editData && (
        <CreateCustomerLinkWizard 
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            fetchCustomerLink();
          }}
          onSuccess={() => {
            setShowEditModal(false);
            fetchCustomerLink();
          }}
          editMode={true}
          existingData={editData}
        />
      )}
    </div>
  );
}