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
          <button onClick={onEdit} className="px-2 py-1 bg-white/20 rounded-full text-xs flex items-center gap-1">
            <Edit className="w-3 h-3" /> ویرایش
          </button>
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

      {/* اطلاع از قابلیت ثبت نوبت - بدون ذکر قیمت */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-3 border border-blue-200">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-blue-600 shrink-0" />
          <div>
            <p className="text-xs font-bold text-blue-800 dark:text-blue-400">✨ قابلیت ثبت نوبت آنلاین</p>
            <p className="text-[11px] text-blue-600 dark:text-blue-500">برای فعال‌سازی به بخش پلن‌ها بروید</p>
          </div>
        </div>
      </div>

      {/* خلاصه اطلاعات */}
      <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3">
        <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-2">📋 اطلاعات کسب‌وکار</h4>
        <div className="space-y-1 text-xs text-slate-600 dark:text-gray-400">
          <p className="truncate">🏢 {link.business_name}</p>
          <p className="truncate">📍 {link.business_address}</p>
          <p dir="ltr">📞 {link.phone}</p>
        </div>
      </div>

      {/* خدمات */}
      {link.services && link.services.length > 0 && (
        <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3">
          <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-2">🛎️ خدمات شما</h4>
          <div className="flex flex-wrap gap-1.5">
            {link.services.slice(0, 4).map((service) => (
              <span key={service.id} className="px-2 py-0.5 bg-white dark:bg-[#0f1115] rounded-full text-[11px]">
                {service.name}
              </span>
            ))}
            {link.services.length > 4 && (
              <span className="px-2 py-0.5 bg-white dark:bg-[#0f1115] rounded-full text-[11px]">
                +{link.services.length - 4} مورد
              </span>
            )}
          </div>
        </div>
      )}

{/* شبکه‌های اجتماعی */}
{link.social_media && Object.values(link.social_media).some(v => v) && (
  <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800/50 dark:to-gray-900/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
        <Share2 className="w-4 h-4 text-white" />
      </div>
      <h4 className="font-bold text-gray-800 dark:text-white">شبکه‌های اجتماعی</h4>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {link.social_media.instagram && (
        <a
          href={`https://instagram.com/${link.social_media.instagram}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-200 dark:border-pink-500/20 hover:scale-105 transition-all duration-300 group"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-md">
            <Instagram className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-gray-500 dark:text-gray-400">اینستاگرام</p>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate group-hover:text-pink-600 transition">
              {link.social_media.instagram}
            </p>
          </div>
          <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition" />
        </a>
      )}
      
      {link.social_media.telegram && (
        <a
          href={`https://t.me/${link.social_media.telegram}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-200 dark:border-blue-500/20 hover:scale-105 transition-all duration-300 group"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-md">
            <Send className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-gray-500 dark:text-gray-400">تلگرام</p>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate group-hover:text-blue-600 transition">
              {link.social_media.telegram}
            </p>
          </div>
          <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition" />
        </a>
      )}
      
      {link.social_media.whatsapp && (
        <a
          href={`https://wa.me/${link.social_media.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-200 dark:border-green-500/20 hover:scale-105 transition-all duration-300 group"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md">
            <Phone className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-gray-500 dark:text-gray-400">واتساپ</p>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate group-hover:text-green-600 transition">
              {link.social_media.whatsapp}
            </p>
          </div>
          <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition" />
        </a>
      )}
      
      {link.social_media.rubika && (
        <a
          href={`https://rubika.ir/${link.social_media.rubika}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-teal-500/10 to-green-500/10 border border-teal-200 dark:border-teal-500/20 hover:scale-105 transition-all duration-300 group"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-green-600 flex items-center justify-center shadow-md">
            <MessageCircle className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-gray-500 dark:text-gray-400">روبیکا</p>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate group-hover:text-teal-600 transition">
              {link.social_media.rubika}
            </p>
          </div>
          <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition" />
        </a>
      )}
      
      {link.social_media.eitaa && (
        <a
          href={`https://eitaa.com/${link.social_media.eitaa}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-200 dark:border-purple-500/20 hover:scale-105 transition-all duration-300 group"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md">
            <Globe className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-gray-500 dark:text-gray-400">ایتا</p>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate group-hover:text-purple-600 transition">
              {link.social_media.eitaa}
            </p>
          </div>
          <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition" />
        </a>
      )}
      
      {link.social_media.bale && (
        <a
          href={`https://ble.ir/${link.social_media.bale}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-200 dark:border-amber-500/20 hover:scale-105 transition-all duration-300 group"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-md">
            <AtSign className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-gray-500 dark:text-gray-400">بله</p>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate group-hover:text-amber-600 transition">
              {link.social_media.bale}
            </p>
          </div>
          <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition" />
        </a>
      )}
      
      {link.social_media.soroush && (
        <a
          href={`https://splus.ir/${link.social_media.soroush}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-500/10 to-blue-500/10 border border-indigo-200 dark:border-indigo-500/20 hover:scale-105 transition-all duration-300 group"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md">
            <MessageCircle className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-gray-500 dark:text-gray-400">سروش</p>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate group-hover:text-indigo-600 transition">
              {link.social_media.soroush}
            </p>
          </div>
          <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition" />
        </a>
      )}
    </div>
  </div>
)}

   
    </div>
  );
}

// ==================== صفحه اول (بدون لینک) - کاملاً رایگان و ترغیبی ====================
function CreateLinkCallToAction({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="space-y-5">
      {/* هدر */}
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

      {/* مزایا - بدون اشاره به پول */}
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

      {/* اطلاع از قابلیت ثبت نوبت */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-3 text-center">
        <p className="text-amber-700 text-sm flex items-center justify-center gap-1">
          <Sparkles className="w-4 h-4" />
          <span>✨ بعد از ساخت صفحه، می‌تونی قابلیت <span className="font-bold">ثبت نوبت آنلاین</span> رو هم فعال کنی</span>
        </p>
      </div>

      {/* دکمه اصلی */}
      <button
        onClick={onCreate}
        className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg"
      >
        <Rocket className="w-5 h-5" />
        بساز صفحه اختصاصی من
        <Sparkles className="w-4 h-4" />
      </button>

      {/* ویژگی‌های کلیدی */}
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

      {/* آمار اعتماد */}
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
        avatar_image: (existingLink as any).avatar_image,
        cover_image: (existingLink as any).cover_image,
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

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen  pb-20">
      <div className="max-w-2xl mx-auto px-4">
        {/* هدر ساده */}
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
          />
        ) : (
          <CreateLinkCallToAction onCreate={() => setShowCreateModal(true)} />
        )}
      </div>

      {/* مودال ساخت لینک */}
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

      {/* مودال ویرایش */}
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