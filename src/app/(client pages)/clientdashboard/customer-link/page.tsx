// src/app/clientdashboard/customer-link/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Link as LinkIcon,
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
  Gift,
  Loader2,
  Calendar as CalendarIcon,
  RefreshCw,
  MessageCircle,
  Check
} from "lucide-react";
import { toast } from "react-hot-toast";
import { CreateCustomerLinkWizard } from "./components/CreateCustomerLinkWizard";

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
  social_media?: SocialMedia;
  services?: Service[];
  work_shifts?: Shift[];
  off_days?: number[];
}

// ==================== کامپوننت نمایش لینک موجود ====================
function ExistingLinkCard({ 
  link, 
  onEdit, 
  onRefresh,
  isLoading 
}: { 
  link: ExistingLink; 
  onEdit: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://${link.fullUrl}`);
    setCopied(true);
    toast.success("لینک کپی شد");
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

  // نمایش شبکه‌های اجتماعی فعال
  const activeSocials = [];
  if (link.social_media?.instagram) activeSocials.push({ name: "اینستاگرام", icon: "📷", value: link.social_media.instagram });
  if (link.social_media?.telegram) activeSocials.push({ name: "تلگرام", icon: "📨", value: link.social_media.telegram });
  if (link.social_media?.whatsapp) activeSocials.push({ name: "واتساپ", icon: "💬", value: link.social_media.whatsapp });

  return (
    <div className="space-y-5">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-[#1a1e26] rounded-xl p-3 text-center shadow-sm border border-slate-200 dark:border-white/10">
          <Eye className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-slate-800 dark:text-white">
            {link.totalVisits.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500">کل بازدید</p>
        </div>
        <div className="bg-white dark:bg-[#1a1e26] rounded-xl p-3 text-center shadow-sm border border-slate-200 dark:border-white/10">
          <Share2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-slate-800 dark:text-white">۰</p>
          <p className="text-xs text-slate-500">اشتراک‌گذاری</p>
        </div>
        <div className="bg-white dark:bg-[#1a1e26] rounded-xl p-3 text-center shadow-sm border border-slate-200 dark:border-white/10">
          <CalendarIcon className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-slate-800 dark:text-white">
            {new Date(link.createdAt).toLocaleDateString("fa-IR")}
          </p>
          <p className="text-xs text-slate-500">تاریخ ساخت</p>
        </div>
      </div>

      {/* Link Card */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            <span className="text-sm font-medium">لینک اختصاصی شما</span>
          </div>
          <button
            onClick={onEdit}
            className="px-3 py-1 bg-white/20 rounded-full text-sm flex items-center gap-1 hover:bg-white/30 transition"
          >
            <Edit className="w-3 h-3" /> ویرایش
          </button>
        </div>
        
        <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
          <p className="text-xs opacity-80 mb-1">آدرس صفحه اختصاصی:</p>
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-mono truncate">
              {link.fullUrl}
            </p>
            <button
              onClick={handleCopy}
              className="p-1.5 bg-white/20 rounded-lg shrink-0 hover:bg-white/30 transition-colors"
            >
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 mt-3">
          <button 
            onClick={handleShare}
            className="flex-1 py-2 bg-white/10 rounded-xl text-sm flex items-center justify-center gap-1 hover:bg-white/20 transition"
          >
            <Share2 className="w-4 h-4" /> اشتراک
          </button>
          <button 
            onClick={handlePreview}
            className="flex-1 py-2 bg-white/20 rounded-xl text-sm flex items-center justify-center gap-1 hover:bg-white/30 transition"
          >
            <ExternalLink className="w-4 h-4" /> پیش‌نمایش
          </button>
        </div>
      </div>

      {/* Business Info Preview */}
      <div className="bg-slate-100 dark:bg-white/5 rounded-xl p-4">
        <h4 className="font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
          <Crown className="w-4 h-4 text-emerald-500" />
          خلاصه اطلاعات
        </h4>
        <div className="space-y-1 text-sm text-slate-600 dark:text-gray-400">
          <p>📛 {link.business_name}</p>
          <p>📍 {link.business_address}</p>
          <p>📞 {link.phone}</p>
          {link.bio && <p>📝 {link.bio.substring(0, 50)}...</p>}
        </div>
      </div>

      {/* Services Preview */}
      {link.services && link.services.length > 0 && (
        <div className="bg-slate-100 dark:bg-white/5 rounded-xl p-4">
          <h4 className="font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500" />
            خدمات ({link.services.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {link.services.slice(0, 3).map((service) => (
              <span key={service.id} className="px-2 py-1 bg-white dark:bg-[#0f1115] rounded-full text-xs">
                {service.name}
              </span>
            ))}
            {link.services.length > 3 && (
              <span className="px-2 py-1 bg-white dark:bg-[#0f1115] rounded-full text-xs">
                +{link.services.length - 3} مورد دیگر
              </span>
            )}
          </div>
        </div>
      )}

      {/* Social Media Preview */}
      {activeSocials.length > 0 && (
        <div className="bg-slate-100 dark:bg-white/5 rounded-xl p-4">
          <h4 className="font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
            <Instagram className="w-4 h-4 text-emerald-500" />
            شبکه‌های اجتماعی
          </h4>
          <div className="flex flex-wrap gap-2">
            {activeSocials.map((social) => (
              <span key={social.name} className="px-2 py-1 bg-white dark:bg-[#0f1115] rounded-full text-xs flex items-center gap-1">
                <span>{social.icon}</span> {social.value}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Instagram Tip */}
      <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-4 border border-emerald-200 dark:border-emerald-500/20">
        <div className="flex items-center gap-2">
          <Instagram className="w-5 h-5 text-emerald-600" />
          <div>
            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-400">
              این لینک را در بیوگرافی اینستاگرام خود قرار دهید
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-500/70 mt-0.5">
              مشتریان با کلیک روی لینک، مستقیماً به صفحه اختصاصی شما می‌روند
            </p>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="w-full py-3 border border-slate-200 dark:border-white/10 rounded-xl flex items-center justify-center gap-2 text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/5 transition disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <RefreshCw className="w-4 h-4" />
        )}
        بروزرسانی آمار
      </button>
    </div>
  );
}

// ==================== کامپوننت دعوت به ساخت لینک ====================
function CreateLinkCallToAction({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto">
        {/* Animated Icon */}
        <div className="relative w-32 h-32 mx-auto mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl animate-pulse opacity-20" />
          <div className="relative w-full h-full bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-2xl">
            <LinkIcon className="w-12 h-12 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center animate-bounce">
            <Sparkles className="w-4 h-4 text-amber-800" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">
          صفحه اختصاصی برای کسب‌وکارتان بسازید
        </h1>
        
        <p className="text-slate-500 dark:text-gray-400 text-sm mb-6">
          با ساختن صفحه اختصاصی، مشتریان شما می‌توانند:
        </p>

        <div className="space-y-3 mb-8 text-right">
          <div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-white/5 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
              <Check className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-800 dark:text-white">ثبت نوبت آنلاین</p>
              <p className="text-xs text-slate-500">مشتریان ۲۴ ساعته نوبت بگیرند</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-white/5 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
              <Eye className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-800 dark:text-white">مشاهده خدمات و قیمت‌ها</p>
              <p className="text-xs text-slate-500">نمایش کامل خدمات کسب‌وکار شما</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-white/5 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-800 dark:text-white">ارسال نظر و امتیاز</p>
              <p className="text-xs text-slate-500">مشتریان تجربه خود را به اشتراک بگذارند</p>
            </div>
          </div>
        </div>

        {/* Main CTA Button */}
        <button
          onClick={onCreate}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
        >
          <Rocket className="w-5 h-5" />
          بسازید صفحه اختصاصی کسب‌وکارتان
          <Sparkles className="w-4 h-4" />
        </button>

        {/* Price Note */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
          <Gift className="w-3 h-3" />
          <span>۳ ماهه فقط ۲۵۷ هزار تومان</span>
          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
          <span>✨ پشتیبانی ۲۴/۷</span>
        </div>

        {/* Features Grid */}
        <div className="mt-6 grid grid-cols-2 gap-2 text-xs text-slate-500">
          <div className="flex items-center justify-center gap-1">
            <Check className="w-3 h-3 text-emerald-500" /> ثبت نوبت
          </div>
          <div className="flex items-center justify-center gap-1">
            <Check className="w-3 h-3 text-emerald-500" /> آمار بازدید
          </div>
          <div className="flex items-center justify-center gap-1">
            <Check className="w-3 h-3 text-emerald-500" /> پیامک خودکار
          </div>
          <div className="flex items-center justify-center gap-1">
            <Check className="w-3 h-3 text-emerald-500" /> پشتیبانی
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== صفحه اصلی ====================
export default function CustomerLinkHomePage() {
  const [hasLink, setHasLink] = useState<boolean | null>(null);
  const [existingLink, setExistingLink] = useState<ExistingLink | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // دریافت لینک اختصاصی از API
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
          social_media: data.link.social_media,
          services: data.link.services,
          work_shifts: data.link.work_shifts,
          off_days: data.link.off_days,
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

  const handleCreateSuccess = (link: string, slug: string) => {
    setShowCreateModal(false);
    toast.success("لینک اختصاصی با موفقیت ساخته شد!");
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
    toast.success("آمار بروزرسانی شد");
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">
            🔗 لینک اختصاصی
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {hasLink 
              ? "لینک اختصاصی شما آماده است" 
              : "یک صفحه اختصاصی برای کسب‌وکار خود بسازید"}
          </p>
        </div>

        {/* Content based on state */}
        {hasLink && existingLink ? (
          <ExistingLinkCard 
            link={existingLink} 
            onEdit={handleEditLink}
            onRefresh={handleRefresh}
            isLoading={isRefreshing}
          />
        ) : (
          <CreateLinkCallToAction onCreate={() => setShowCreateModal(true)} />
        )}
      </div>

      {/* Create Wizard Modal */}
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

      {/* Edit Wizard Modal */}
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