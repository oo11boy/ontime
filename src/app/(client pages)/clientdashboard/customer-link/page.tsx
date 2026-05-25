// src/app/clientdashboard/customer-link/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  LinkIcon,
  Copy,
  CheckCircle,
  Edit,
  Sparkles,
  Crown,
  Eye,
  Share2,
  ExternalLink,
  Instagram,
  Rocket,
  Loader2,
  Calendar as CalendarIcon,
  RefreshCw,
  MessageCircle,
  Check,
  Zap,
  Users,
  Globe,
  Smartphone,
  Share,
  TrendingUp,
  Send,
  Phone,
  AtSign
} from "lucide-react";
import { toast } from "react-hot-toast";
import { CreateCustomerLinkWizard } from "./components/CreateCustomerLinkWizard";
import { BusinessInfoBox } from "./components/BusinessInfoBox";
import { ServicesBox } from "./components/ServicesBox";
import { WorkingHoursBox } from "./components/WorkingHoursBox";
import { SocialMediaBox } from "./components/SocialMediaBox";

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
  onEdit, 
  onRefresh,
  isLoading,
  onBusinessInfoSave,
  onServicesChange,
  onWorkingHoursChange,
  onSocialMediaChange
}: { 
  link: ExistingLink; 
  onEdit: () => void;
  onRefresh: () => void;
  isLoading: boolean;
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
  const router = useRouter();

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

      <div className="space-y-2">
        <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm">🌐 نمایش در گوگل</p>
            <p className="text-xs text-gray-500">صفحه اختصاصی شما در نتایج جستجوی گوگل نمایش داده میشه</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <Share className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm">📱 اشتراک در شبکه‌های اجتماعی</p>
            <p className="text-xs text-gray-500">لینک صفحه رو میتونی در اینستاگرام، واتساپ، تلگرام و... بذاری</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm">👥 معرفی کامل کسب‌وکار</p>
            <p className="text-xs text-gray-500">خدمات، ساعات کاری، آدرس، شماره تماس و نظرات مشتریان</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-3 text-center">
        <p className="text-amber-700 text-sm flex items-center justify-center gap-1">
          <Sparkles className="w-4 h-4" />
          <span>✨ بعد از ساخت صفحه، می‌تونی قابلیت <span className="font-bold">ثبت نوبت آنلاین</span> رو هم فعال کنی</span>
        </p>
      </div>

      <button
        onClick={onCreate}
        className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg"
      >
        <Rocket className="w-5 h-5" />
        بساز صفحه اختصاصی من
        <Sparkles className="w-4 h-4" />
      </button>

      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="p-2 bg-slate-50 rounded-xl">
          <Check className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
          <p className="text-xs font-medium">بیو اینستاگرام</p>
        </div>
        <div className="p-2 bg-slate-50 rounded-xl">
          <Check className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
          <p className="text-xs font-medium">لینک واتساپ</p>
        </div>
        <div className="p-2 bg-slate-50 rounded-xl">
          <Check className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
          <p className="text-xs font-medium">نمایش در گوگل</p>
        </div>
        <div className="p-2 bg-slate-50 rounded-xl">
          <Check className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
          <p className="text-xs font-medium">کاملاً رایگان</p>
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);

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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchCustomerLink();
    setIsRefreshing(false);
    toast.success("آمار بروز شد");
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
          <ExistingLinkCard 
            link={existingLink} 
            onEdit={handleEditLink}
            onRefresh={handleRefresh}
            isLoading={isRefreshing}
            onBusinessInfoSave={handleBusinessInfoSave}
            onServicesChange={handleServicesChange}
            onWorkingHoursChange={handleWorkingHoursChange}
            onSocialMediaChange={handleSocialMediaChange}
          />
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