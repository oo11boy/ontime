// src/app/clientdashboard/customer-link/components/CreateCustomerLinkWizard.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import {
  X,
  Check,
  ChevronLeft,
  Camera,
  User,
  MapPin,
  Phone,
  Instagram,
  Send,
  MessageCircle,
  Plus,
  Trash2,
  Clock,
  Crown,
  Sparkles,
  Link as LinkIcon,
  Copy,
  Loader2,
  Eye,
  CalendarOff,
  Settings,
  Building2,
  ChevronDown,
  Globe,
  AtSign,
  Edit2,
  AlertTriangle,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

// ==================== Types ====================
interface Service {
  id: number;
  name: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
}

interface Shift {
  start: string;
  end: string;
}

interface SocialMedia {
  instagram: string;
  telegram: string;
  rubika: string;
  whatsapp: string;
  eitaa: string;
  bale: string;
  soroush: string;
}

interface BusinessInfo {
  business_name: string;
  business_address: string;
  phone: string;
  bio: string;
  logo: string | null;
  avatar_image: string | null;
  cover_image: string | null;
}

interface CreateCustomerLinkWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (link: string, slug: string) => void;
  editMode?: boolean;
  existingData?: {
    slug?: string;
    business_name?: string;
    business_address?: string;
    phone?: string;
    bio?: string;
    logo?: string;
    avatar_image?: string;
    cover_image?: string;
    social_media?: SocialMedia;
    selected_services?: Service[];
    work_shifts?: Shift[];
    off_days?: number[];
  };
}

// ==================== Constants ====================
const DAYS_OF_WEEK = [
  { id: 0, name: "شنبه" },
  { id: 1, name: "یک‌شنبه" },
  { id: 2, name: "دوشنبه" },
  { id: 3, name: "سه‌شنبه" },
  { id: 4, name: "چهارشنبه" },
  { id: 5, name: "پنج‌شنبه" },
  { id: 6, name: "جمعه" },
];

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2).toString().padStart(2, "0");
  const min = i % 2 === 0 ? "00" : "30";
  return `${hour}:${min}`;
});

const defaultSocialMedia: SocialMedia = {
  instagram: "",
  telegram: "",
  rubika: "",
  whatsapp: "",
  eitaa: "",
  bale: "",
  soroush: "",
};

// ==================== Image Uploader Component ====================
function ImageUploader({
  currentImage,
  onImageUploaded,
  onImageRemoved,
  aspectRatio = 1,
  maxSizeMB = 5,
  quality = 0.8,
  title = "آپلود تصویر",
  description = "PNG, JPG یا JPEG",
  shape = "square",
  className = "",
}: {
  currentImage: string | null;
  onImageUploaded: (imageUrl: string) => void;
  onImageRemoved?: () => void;
  aspectRatio?: number;
  maxSizeMB?: number;
  quality?: number;
  title?: string;
  description?: string;
  shape?: "circle" | "square" | "cover";
  className?: string;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`حجم فایل نباید بیشتر از ${maxSizeMB} مگابایت باشد`);
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("لطفاً فایل تصویری انتخاب کنید");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/client/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        onImageUploaded(data.url);
        toast.success("تصویر با موفقیت آپلود شد");
      } else {
        toast.error(data.message || "خطا در آپلود تصویر");
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setIsUploading(false);
    }
  };

  const getShapeClass = () => {
    if (shape === "circle") return "rounded-full";
    if (shape === "cover") return "rounded-xl";
    return "rounded-xl";
  };

  return (
    <div className={`${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {currentImage ? (
        <div className={`relative ${getShapeClass()} overflow-hidden bg-slate-100 dark:bg-white/5`}>
          <img
            src={currentImage}
            alt="آپلود شده"
            className={`w-full h-full object-cover ${shape === "circle" ? "rounded-full" : "rounded-xl"}`}
            style={shape === "cover" ? { aspectRatio: "16/9" } : { aspectRatio: "1/1" }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
          >
            <div className="bg-white rounded-full p-2">
              <Edit2 className="w-5 h-5 text-gray-800" />
            </div>
          </button>
          {onImageRemoved && (
            <button
              onClick={() => onImageRemoved()}
              className="absolute top-2 right-2 bg-red-500 rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-white" />
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={`w-full border-2 border-dashed border-gray-300 dark:border-gray-600 ${getShapeClass()} bg-slate-50 dark:bg-white/5 hover:border-emerald-500 transition-colors flex flex-col items-center justify-center p-6 ${shape === "cover" ? "aspect-video" : "aspect-square"}`}
        >
          {isUploading ? (
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
              <p className="text-xs text-gray-400 mt-1">{description}</p>
            </>
          )}
        </button>
      )}
    </div>
  );
}

// ==================== Step Indicator ====================
function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  const steps = [
    { number: 1, title: "آدرس دلخواه", icon: LinkIcon },
    { number: 2, title: "اطلاعات پایه", icon: User },
    { number: 3, title: "خدمات و شیفت", icon: Settings },
    { number: 4, title: "بررسی نهایی", icon: Crown },
  ];

  return (
    <div className="mb-8 px-2">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isActive = currentStep === step.number;
          const Icon = step.icon;
          
          return (
            <div key={step.number} className="flex-1 text-center">
              <div className="relative">
                {index < steps.length - 1 && (
                  <div
                    className={`absolute top-4 left-1/2 w-full h-0.5 transition-all duration-300 ${
                      isCompleted ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                )}
                
                <div
                  className={`relative z-10 w-8 h-8 mx-auto rounded-full flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? "bg-emerald-600 text-white ring-4 ring-emerald-200 dark:ring-emerald-900/50"
                      : isCompleted
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                
                <p className={`text-xs mt-2 hidden sm:block transition-colors ${
                  isActive ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-gray-500"
                }`}>
                  {step.title}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==================== Step 1: Slug Selection ====================
function SlugStep({
  slug,
  onSlugChange,
  onNext,
  editMode,
}: {
  slug: string;
  onSlugChange: (slug: string) => void;
  onNext: () => void;
  editMode?: boolean;
}) {
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [localSlug, setLocalSlug] = useState(slug || "");

  const checkAvailability = async (value: string) => {
    if (value.length < 3) {
      setIsAvailable(null);
      return;
    }
    setIsChecking(true);
    try {
      const res = await fetch(`/api/client/customer-link/check-slug?slug=${value}`);
      const data = await res.json();
      setIsAvailable(data.available);
    } catch {
      setIsAvailable(null);
    } finally {
      setIsChecking(false);
    }
  };

  const handleChange = (value: string) => {
    const cleaned = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40);
    setLocalSlug(cleaned);
    if (!editMode) {
      checkAvailability(cleaned);
    } else {
      setIsAvailable(true);
    }
  };

  const handleNext = () => {
    if (localSlug && (editMode || isAvailable === true)) {
      onSlugChange(localSlug);
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <div className="w-16 h-16 mx-auto bg-emerald-100 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-3">
          <LinkIcon className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
          {editMode ? "ویرایش آدرس صفحه اختصاصی" : "آدرس صفحه اختصاصی"}
        </h3>
        <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
          {editMode ? "آدرس قابل تغییر نیست" : "آدرسی که مشتریان با آن به صفحه شما می‌آیند"}
        </p>
      </div>

      <div className="bg-slate-100 dark:bg-white/5 rounded-xl p-4">
        <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
          آدرس دلخواه شما
        </label>
        <div dir="ltr" className={`flex items-center gap-2 p-3 bg-white dark:bg-[#0f1115] border-2 rounded-xl transition-colors ${
          editMode ? "border-gray-300 bg-gray-50 dark:bg-gray-800/50" : "focus-within:border-emerald-500"
        }`}>
          <span className="text-slate-500 text-sm font-mono shrink-0">ontimeapp.ir/c/</span>
          <input
            type="text"
            value={localSlug}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="نام-کسب-وکار"
            disabled={editMode}
            className={`flex-1 bg-transparent outline-none font-mono text-sm text-slate-800 dark:text-white ${
              editMode ? "opacity-70 cursor-not-allowed" : ""
            }`}
            dir="ltr"
            autoFocus={!editMode}
          />
        </div>
        
        {editMode && (
          <div className="flex items-center gap-2 mt-2 text-sm text-amber-600">
            <AlertTriangle className="w-4 h-4" />
            آدرس صفحه اختصاصی پس از ایجاد قابل تغییر نیست
          </div>
        )}
        
        {!editMode && isChecking && (
          <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            در حال بررسی آدرس...
          </div>
        )}
        {!editMode && !isChecking && isAvailable === true && localSlug.length >= 3 && (
          <div className="flex items-center gap-2 mt-2 text-sm text-emerald-600">
            <Check className="w-4 h-4" />
            این آدرس قابل ثبت است ✓
          </div>
        )}
        {!editMode && !isChecking && isAvailable === false && localSlug.length >= 3 && (
          <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
            <X className="w-4 h-4" />
            این آدرس قبلاً ثبت شده است
          </div>
        )}
      </div>

      {!editMode && (
        <div className="bg-slate-100 dark:bg-white/5 rounded-xl p-4 text-xs text-slate-500 dark:text-gray-400 space-y-1">
          <p className="font-medium text-slate-700 dark:text-gray-300 mb-2">📝 قوانین انتخاب آدرس:</p>
          <p>• فقط حروف انگلیسی (a-z)، اعداد (0-9) و خط تیره (-)</p>
          <p>• حداقل ۳ و حداکثر ۴۰ کاراکتر</p>
          <p>• آدرس قابل تغییر نیست، با دقت انتخاب کنید</p>
        </div>
      )}

      <button
        onClick={handleNext}
        disabled={!editMode && (!localSlug || isAvailable !== true)}
        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        ادامه <ChevronLeft className="w-4 h-4" />
      </button>
    </div>
  );
}

// ==================== Step 2: Basic Info ====================
function BasicInfoStep({
  data,
  socialMedia,
  onDataChange,
  onSocialChange,
  onNext,
  onBack,
}: {
  data: BusinessInfo;
  socialMedia: SocialMedia;
  onDataChange: (data: Partial<BusinessInfo>) => void;
  onSocialChange: (social: Partial<SocialMedia>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const isValid = data.business_name && data.business_address && data.phone;

  return (
    <div className="space-y-5">
      <div className="text-center mb-2">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">اطلاعات کسب‌وکار</h3>
        <p className="text-sm text-slate-500 dark:text-gray-400">اطلاعات پایه و شبکه‌های اجتماعی</p>
      </div>

      {/* Images Section */}
      <div className="space-y-4">
        {/* Cover Image */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
            تصویر کاور صفحه
          </label>
          <ImageUploader
            currentImage={data.cover_image}
            onImageUploaded={(url) => onDataChange({ cover_image: url })}
            onImageRemoved={() => onDataChange({ cover_image: null })}
            shape="cover"
            title="آپلود تصویر کاور"
            description="PNG, JPG یا JPEG، حداکثر ۵ مگابایت"
          />
        </div>

        {/* Avatar/Logo */}
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
              تصویر پروفایل
            </label>
            <ImageUploader
              currentImage={data.avatar_image || data.logo}
              onImageUploaded={(url) => onDataChange({ avatar_image: url, logo: url })}
              onImageRemoved={() => onDataChange({ avatar_image: null, logo: null })}
              shape="circle"
              title="آپلود لوگو"
            />
          </div>
          <div className="flex-1 text-xs text-slate-500">
            <p>این تصویر در کنار نام کسب‌وکار شما نمایش داده می‌شود</p>
            <p className="mt-1">ابعاد پیشنهادی: 200x200 پیکسل</p>
          </div>
        </div>
      </div>

      {/* Business Info */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
            نام کسب‌وکار <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.business_name || ""}
            onChange={(e) => onDataChange({ business_name: e.target.value })}
            placeholder="مثال: آرایشگاه مدرن سارا"
            className="w-full p-3 border dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-white/5 focus:border-emerald-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
            آدرس <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2 p-3 border dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-white/5">
            <MapPin className="w-5 h-5 text-emerald-500 shrink-0" />
            <input
              type="text"
              value={data.business_address || ""}
              onChange={(e) => onDataChange({ business_address: e.target.value })}
              placeholder="استان، شهر، خیابان، پلاک"
              className="flex-1 bg-transparent outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
            شماره تماس <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2 p-3 border dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-white/5">
            <Phone className="w-5 h-5 text-emerald-500 shrink-0" />
            <input
              type="tel"
              value={data.phone || ""}
              onChange={(e) => onDataChange({ phone: e.target.value })}
              placeholder="۰۹۱۲۳۴۵۶۷۸۹"
              className="flex-1 bg-transparent outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
            متن معرفی
          </label>
          <textarea
            value={data.bio || ""}
            onChange={(e) => onDataChange({ bio: e.target.value })}
            placeholder="درباره کسب‌وکار خود بنویسید..."
            rows={3}
            className="w-full p-3 border dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-white/5 resize-none"
          />
        </div>
      </div>

      {/* Social Media Section */}
      <div className="space-y-3 pt-2">
        <p className="font-medium text-slate-700 dark:text-gray-300">شبکه‌های اجتماعی:</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2 border dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-white/5">
            <Instagram className="w-5 h-5 text-pink-600 shrink-0" />
            <input
              type="text"
              value={socialMedia?.instagram || ""}
              onChange={(e) => onSocialChange({ instagram: e.target.value })}
              placeholder="اینستاگرام (username)"
              className="flex-1 bg-transparent outline-none text-sm"
              dir="ltr"
            />
          </div>
          
          <div className="flex items-center gap-2 p-2 border dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-white/5">
            <Send className="w-5 h-5 text-blue-500 shrink-0" />
            <input
              type="text"
              value={socialMedia?.telegram || ""}
              onChange={(e) => onSocialChange({ telegram: e.target.value })}
              placeholder="تلگرام (username)"
              className="flex-1 bg-transparent outline-none text-sm"
              dir="ltr"
            />
          </div>
          
          <div className="flex items-center gap-2 p-2 border dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-white/5">
            <MessageCircle className="w-5 h-5 text-green-500 shrink-0" />
            <input
              type="text"
              value={socialMedia?.rubika || ""}
              onChange={(e) => onSocialChange({ rubika: e.target.value })}
              placeholder="روبیکا (username)"
              className="flex-1 bg-transparent outline-none text-sm"
              dir="ltr"
            />
          </div>
          
          <div className="flex items-center gap-2 p-2 border dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-white/5">
            <Phone className="w-5 h-5 text-green-600 shrink-0" />
            <input
              type="text"
              value={socialMedia?.whatsapp || ""}
              onChange={(e) => onSocialChange({ whatsapp: e.target.value })}
              placeholder="واتساپ (شماره تماس)"
              className="flex-1 bg-transparent outline-none text-sm"
              dir="ltr"
            />
          </div>
          
          <div className="flex items-center gap-2 p-2 border dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-white/5">
            <Globe className="w-5 h-5 text-purple-500 shrink-0" />
            <input
              type="text"
              value={socialMedia?.eitaa || ""}
              onChange={(e) => onSocialChange({ eitaa: e.target.value })}
              placeholder="ایتا (username)"
              className="flex-1 bg-transparent outline-none text-sm"
              dir="ltr"
            />
          </div>
          
          <div className="flex items-center gap-2 p-2 border dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-white/5">
            <AtSign className="w-5 h-5 text-amber-500 shrink-0" />
            <input
              type="text"
              value={socialMedia?.bale || ""}
              onChange={(e) => onSocialChange({ bale: e.target.value })}
              placeholder="بله (username)"
              className="flex-1 bg-transparent outline-none text-sm"
              dir="ltr"
            />
          </div>
          
          <div className="flex items-center gap-2 p-2 border dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-white/5">
            <MessageCircle className="w-5 h-5 text-indigo-500 shrink-0" />
            <input
              type="text"
              value={socialMedia?.soroush || ""}
              onChange={(e) => onSocialChange({ soroush: e.target.value })}
              placeholder="سروش (username)"
              className="flex-1 bg-transparent outline-none text-sm"
              dir="ltr"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="flex-1 py-3 border border-gray-300 dark:border-gray-700 rounded-xl font-medium">
          قبلی
        </button>
        <button onClick={onNext} disabled={!isValid} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold disabled:opacity-50">
          ادامه
        </button>
      </div>
    </div>
  );
}

// ==================== Step 3: Services, Shifts & Holidays ====================
function ServicesAndSettingsStep({
  selectedServices,
  workShifts,
  offDays,
  onServicesChange,
  onShiftsChange,
  onOffDaysChange,
  onNext,
  onBack,
}: {
  selectedServices: Service[];
  workShifts: Shift[];
  offDays: number[];
  onServicesChange: (services: Service[]) => void;
  onShiftsChange: (shifts: Shift[]) => void;
  onOffDaysChange: (offDays: number[]) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [activeSection, setActiveSection] = useState<"services" | "shifts" | "holidays">("services");
  
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [newService, setNewService] = useState({ name: "", price: "", duration: "30" });
  const [isCreatingService, setIsCreatingService] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      setIsLoadingServices(true);
      try {
        const res = await fetch("/api/client/services");
        const result = await res.json();
        if (result.success && result.services) {
          setAvailableServices(result.services);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setIsLoadingServices(false);
      }
    };
    fetchServices();
  }, []);

  const addShift = () => {
    if (workShifts.length >= 3) {
      toast.error("حداکثر ۳ شیفت مجاز است");
      return;
    }
    onShiftsChange([...workShifts, { start: "09:00", end: "17:00" }]);
  };

  const removeShift = (index: number) => {
    onShiftsChange(workShifts.filter((_, i) => i !== index));
  };

  const updateShift = (index: number, field: "start" | "end", value: string) => {
    const newShifts = [...workShifts];
    newShifts[index][field] = value;
    onShiftsChange(newShifts);
  };

  const toggleOffDay = (dayId: number) => {
    if (offDays.includes(dayId)) {
      onOffDaysChange(offDays.filter((id) => id !== dayId));
    } else {
      onOffDaysChange([...offDays, dayId]);
    }
  };

  const toggleService = (service: Service) => {
    const exists = selectedServices.some(s => s.id === service.id);
    if (exists) {
      onServicesChange(selectedServices.filter(s => s.id !== service.id));
    } else {
      onServicesChange([...selectedServices, service]);
    }
  };

  const handleCreateService = async () => {
    if (!newService.name.trim()) {
      toast.error("نام خدمت الزامی است");
      return;
    }
    
    setIsCreatingService(true);
    try {
      const res = await fetch("/api/client/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newService.name.trim(),
          price: parseFloat(newService.price) || 0,
          duration_minutes: parseInt(newService.duration) || 30,
        }),
      });
      
      const data = await res.json();
      if (data.success && data.service) {
        toast.success("خدمت با موفقیت اضافه شد");
        const createdService: Service = {
          id: data.service.id,
          name: data.service.name,
          price: data.service.price,
          duration_minutes: data.service.duration_minutes,
          is_active: true,
        };
        setAvailableServices([...availableServices, createdService]);
        onServicesChange([...selectedServices, createdService]);
        setShowAddServiceModal(false);
        setNewService({ name: "", price: "", duration: "30" });
      } else {
        toast.error(data.message || "خطا در ایجاد خدمت");
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setIsCreatingService(false);
    }
  };

  // تابع برای رفتن به تب بعدی
  const handleNextSection = () => {
    if (activeSection === "services") {
      setActiveSection("shifts");
    } else if (activeSection === "shifts") {
      setActiveSection("holidays");
    } else {
      onNext();
    }
  };

  // تابع برای رفتن به تب قبلی
  const handlePrevSection = () => {
    if (activeSection === "holidays") {
      setActiveSection("shifts");
    } else if (activeSection === "shifts") {
      setActiveSection("services");
    } else {
      onBack();
    }
  };

  // تعیین متن دکمه بعدی
  const getNextButtonText = () => {
    if (activeSection === "services") return "بعدی: شیفت کاری";
    if (activeSection === "shifts") return "بعدی: تعطیلات هفتگی";
    return "تکمیل و ادامه";
  };

  // تعیین متن دکمه قبلی
  const getPrevButtonText = () => {
    if (activeSection === "holidays") return "قبلی: شیفت کاری";
    if (activeSection === "shifts") return "قبلی: خدمات";
    return "قبلی";
  };

  return (
    <div className="space-y-5">
      <div className="text-center mb-2">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">خدمات و تنظیمات</h3>
        <p className="text-sm text-slate-500 dark:text-gray-400">خدمات، شیفت کاری و روزهای تعطیل را تنظیم کنید</p>
      </div>

      {/* تب‌ها - فقط برای نمایش، بدون قابلیت کلیک */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-gray-700 pb-2">
        <div
          className={`flex-1 py-2 rounded-lg text-sm font-medium text-center cursor-default transition-all ${
            activeSection === "services"
              ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
              : "text-slate-500"
          }`}
        >
          <Plus className="w-4 h-4 inline ml-1" /> خدمات
        </div>
        <div
          className={`flex-1 py-2 rounded-lg text-sm font-medium text-center cursor-default transition-all ${
            activeSection === "shifts"
              ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
              : "text-slate-500"
          }`}
        >
          <Clock className="w-4 h-4 inline ml-1" /> شیفت کاری
        </div>
        <div
          className={`flex-1 py-2 rounded-lg text-sm font-medium text-center cursor-default transition-all ${
            activeSection === "holidays"
              ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
              : "text-slate-500"
          }`}
        >
          <CalendarOff className="w-4 h-4 inline ml-1" /> تعطیلات هفتگی
        </div>
      </div>

      {/* تب خدمات */}
      {activeSection === "services" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">خدمات قابل ارائه</span>
            <button
              onClick={() => setShowAddServiceModal(true)}
              className="text-xs bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-lg flex items-center gap-1"
            >
              <Plus size={12} /> سرویس جدید
            </button>
          </div>

          {isLoadingServices ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
          ) : availableServices.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Settings className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">هیچ خدمتی تعریف نشده است</p>
              <p className="text-xs mt-1">روی دکمه "سرویس جدید" کلیک کنید</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availableServices.map((service) => {
                const isSelected = selectedServices.some(s => s.id === service.id);
                return (
                  <button
                    key={service.id}
                    onClick={() => toggleService(service)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                      isSelected
                        ? "bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-700"
                        : "bg-slate-100 dark:bg-white/5 border border-transparent"
                    }`}
                  >
                    <div className="text-right">
                      <p className="font-medium text-slate-800 dark:text-white">{service.name}</p>
                      <div className="flex gap-3 mt-1 text-xs text-slate-500">
                        <span>{service.price.toLocaleString()} تومان</span>
                        <span>{service.duration_minutes} دقیقه</span>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? "bg-emerald-500 border-emerald-500" : "border-gray-400"
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* تب شیفت کاری */}
      {activeSection === "shifts" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">مدیریت شیفت‌های کاری</span>
            <button
              onClick={addShift}
              className="text-xs bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 px-3 py-1.5 rounded-lg flex items-center gap-1"
            >
              <Plus size={12} /> شیفت جدید
            </button>
          </div>

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {workShifts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 border border-dashed border-slate-200 dark:border-white/10 rounded-xl text-center"
                >
                  <p className="text-xs text-slate-500 italic">
                    شیفت دستی انتخاب نشده؛ نوبت‌دهی خودکار{" "}
                    <span className="text-blue-600 font-bold">۰۸:۰۰ الی ۲۲:۰۰</span>
                  </p>
                </motion.div>
              ) : (
                workShifts.map((shift, index) => (
                  <motion.div
                    key={index}
                    layout
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-slate-100 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/10 flex items-center gap-3"
                  >
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <select
                        value={shift.start}
                        onChange={(e) => updateShift(index, "start", e.target.value)}
                        className="bg-white dark:bg-[#0a0c10] border rounded-lg py-2 text-center text-xs font-bold outline-none"
                      >
                        {TIME_OPTIONS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <select
                        value={shift.end}
                        onChange={(e) => updateShift(index, "end", e.target.value)}
                        className="bg-white dark:bg-[#0a0c10] border rounded-lg py-2 text-center text-xs font-bold outline-none"
                      >
                        {TIME_OPTIONS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={() => removeShift(index)}
                      className="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-red-500/10 rounded-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* تب تعطیلات هفتگی */}
      {activeSection === "holidays" && (
        <div className="space-y-4">
          <span className="text-xs text-slate-500">روزهای غیرفعال هفته را انتخاب کنید</span>
          <div className="grid grid-cols-4 gap-2">
            {DAYS_OF_WEEK.map((day) => {
              const isOff = offDays.includes(day.id);
              return (
                <button
                  key={day.id}
                  onClick={() => toggleOffDay(day.id)}
                  className={`py-2.5 rounded-lg text-xs font-bold transition-all border ${
                    isOff
                      ? "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-500/40"
                      : "bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10"
                  }`}
                >
                  {day.name}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-slate-500 text-center pt-2">
            روزهای انتخاب شده به عنوان تعطیل نمایش داده می‌شوند
          </p>
        </div>
      )}

      {/* دکمه‌های ناوبری */}
      <div className="flex gap-3 pt-4">
        <button 
          onClick={handlePrevSection} 
          className="flex-1 py-3 border border-gray-300 dark:border-gray-700 rounded-xl font-medium"
        >
          {getPrevButtonText()}
        </button>
        <button 
          onClick={handleNextSection} 
          className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all"
        >
          {getNextButtonText()}
        </button>
      </div>

      {/* Add Service Modal */}
      {showAddServiceModal && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50">
          <div className="w-full sm:max-w-md bg-white dark:bg-[#1a1e26] rounded-t-2xl sm:rounded-2xl overflow-hidden">
            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 dark:text-white">افزودن خدمت جدید</h3>
              <button onClick={() => setShowAddServiceModal(false)} className="p-1 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <input
                type="text"
                value={newService.name}
                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                placeholder="نام خدمت"
                className="w-full p-3 border dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-white/5"
              />
              <input
                type="number"
                value={newService.price}
                onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                placeholder="قیمت (تومان)"
                className="w-full p-3 border dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-white/5"
              />
              <select
                value={newService.duration}
                onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                className="w-full p-3 border dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-white/5"
              >
                <option value="15">۱۵ دقیقه</option>
                <option value="30">۳۰ دقیقه</option>
                <option value="45">۴۵ دقیقه</option>
                <option value="60">۱ ساعت</option>
                <option value="90">۱.۵ ساعت</option>
                <option value="120">۲ ساعت</option>
              </select>
              <button
                onClick={handleCreateService}
                disabled={isCreatingService}
                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold disabled:opacity-50"
              >
                {isCreatingService ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "افزودن خدمت"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== Step 4: Final Review ====================
function FinalReviewStep({
  slug,
  businessInfo,
  socialMedia,
  selectedServices,
  workShifts,
  offDays,
  onSubmit,
  isSubmitting,
  onBack,
  editMode,
}: {
  slug: string;
  businessInfo: BusinessInfo;
  socialMedia: SocialMedia;
  selectedServices: Service[];
  workShifts: Shift[];
  offDays: number[];
  onSubmit: () => void;
  isSubmitting: boolean;
  onBack: () => void;
  editMode?: boolean;
}) {
  const fullUrl = `myapp.ir/c/${slug}`;

  const getOffDayNames = () => {
    return offDays.map(dayId => DAYS_OF_WEEK.find(d => d.id === dayId)?.name || "").filter(Boolean);
  };

  const shiftsText = workShifts.length === 0 
    ? "۰۸:۰۰ تا ۲۲:۰۰ (پیش‌فرض)"
    : workShifts.map(s => `${s.start} تا ${s.end}`).join(" و ");

  const activeSocials = [];
  if (socialMedia?.instagram) activeSocials.push({ name: "اینستاگرام", icon: "📷", value: socialMedia.instagram });
  if (socialMedia?.telegram) activeSocials.push({ name: "تلگرام", icon: "📨", value: socialMedia.telegram });
  if (socialMedia?.rubika) activeSocials.push({ name: "روبیکا", icon: "🟢", value: socialMedia.rubika });
  if (socialMedia?.whatsapp) activeSocials.push({ name: "واتساپ", icon: "💬", value: socialMedia.whatsapp });
  if (socialMedia?.eitaa) activeSocials.push({ name: "ایتا", icon: "🌐", value: socialMedia.eitaa });
  if (socialMedia?.bale) activeSocials.push({ name: "بله", icon: "@", value: socialMedia.bale });
  if (socialMedia?.soroush) activeSocials.push({ name: "سروش", icon: "💬", value: socialMedia.soroush });

  return (
    <div className="space-y-5">
      <div className="text-center mb-2">
        <div className="w-16 h-16 mx-auto bg-emerald-100 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-3">
          <Crown className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
          {editMode ? "بررسی و ذخیره تغییرات" : "بررسی نهایی"}
        </h3>
        <p className="text-sm text-slate-500 dark:text-gray-400">
          {editMode ? "اطلاعات خود را بررسی کنید" : "اطلاعات خود را بررسی کنید و لینک را بسازید"}
        </p>
      </div>

      {/* Preview Card */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl overflow-hidden">
        {businessInfo.cover_image && (
          <div className="h-32 w-full overflow-hidden">
            <img src={businessInfo.cover_image} alt="Cover" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-4 flex items-center gap-3">
          {businessInfo.avatar_image || businessInfo.logo ? (
            <img
              src={businessInfo.avatar_image || businessInfo.logo || ""}
              alt="Logo"
              className="w-16 h-16 rounded-full border-4 border-white object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center border-4 border-white">
              <Building2 className="w-8 h-8 text-white" />
            </div>
          )}
          <div className="flex-1">
            <p className="text-white font-bold">{businessInfo.business_name}</p>
            <p className="text-emerald-100 text-xs mt-1">{fullUrl}</p>
          </div>
        </div>
      </div>

      {/* Business Info */}
      <div className="bg-slate-100 dark:bg-white/5 rounded-xl p-4">
        <h4 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-emerald-500" />
          اطلاعات کسب‌وکار
        </h4>
        <div className="space-y-2 text-sm">
          <p><span className="text-slate-500">نام:</span> {businessInfo.business_name}</p>
          <p><span className="text-slate-500">آدرس:</span> {businessInfo.business_address}</p>
          <p><span className="text-slate-500">تلفن:</span> {businessInfo.phone}</p>
          {businessInfo.bio && <p><span className="text-slate-500">معرفی:</span> {businessInfo.bio.substring(0, 50)}...</p>}
        </div>
      </div>

      {/* Social Media Summary */}
      {activeSocials.length > 0 && (
        <div className="bg-slate-100 dark:bg-white/5 rounded-xl p-4">
          <h4 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
            <Send className="w-4 h-4 text-emerald-500" />
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

      {/* Working Hours */}
      <div className="bg-slate-100 dark:bg-white/5 rounded-xl p-4">
        <h4 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-500" />
          ساعت کاری
        </h4>
        <p className="text-sm">{shiftsText}</p>
      </div>

      {/* Holidays */}
      {offDays.length > 0 && (
        <div className="bg-slate-100 dark:bg-white/5 rounded-xl p-4">
          <h4 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
            <CalendarOff className="w-4 h-4 text-emerald-500" />
            روزهای تعطیل هفته
          </h4>
          <div className="flex flex-wrap gap-2">
            {getOffDayNames().map(day => (
              <span key={day} className="px-2 py-1 bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 rounded-full text-xs">
                {day}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Services */}
      {selectedServices.length > 0 && (
        <div className="bg-slate-100 dark:bg-white/5 rounded-xl p-4">
          <h4 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-500" />
            خدمات ({selectedServices.length})
          </h4>
          <div className="space-y-1 text-sm">
            {selectedServices.map((service) => (
              <div key={service.id} className="flex justify-between">
                <span>{service.name}</span>
                <span className="text-slate-500">{service.price.toLocaleString()} تومان</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="flex-1 py-3 border rounded-xl">قبلی</button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (editMode ? <Edit2 className="w-5 h-5" /> : <Crown className="w-5 h-5" />)}
          {editMode ? "ذخیره تغییرات" : "ساخت لینک اختصاصی"}
        </button>
      </div>
    </div>
  );
}

// ==================== Success Modal ====================
function SuccessModal({ link, onClose, isEditMode = false }: { link: string; onClose: () => void; isEditMode?: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://${link}`);
    setCopied(true);
    toast.success("لینک کپی شد");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-white dark:bg-[#1a1e26] rounded-2xl overflow-hidden shadow-2xl"
      >
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-center">
          <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center animate-bounce">
            <Check className="w-10 h-10 text-emerald-500" />
          </div>
          <h3 className="text-white font-bold text-xl mt-3">
            {isEditMode ? "✨ ویرایش با موفقیت انجام شد!" : "🎉 تبریک!"}
          </h3>
          <p className="text-emerald-100 text-sm mt-1">
            {isEditMode ? "تغییرات لینک اختصاصی شما ذخیره شد" : "لینک اختصاصی شما ساخته شد"}
          </p>
        </div>

        <div className="p-6">
          <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 dark:text-gray-400 mb-1">لینک اختصاصی شما:</p>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-mono text-emerald-600 dark:text-emerald-400 break-all flex-1">
                {link}
              </p>
              <button onClick={handleCopy} className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg shrink-0">
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-emerald-600" />}
              </button>
            </div>
          </div>

          {!isEditMode && (
            <div className="mt-4 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10 rounded-xl">
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 text-center">
                📌 این لینک را در بیوگرافی اینستاگرام خود قرار دهید
              </p>
              <p className="text-xs text-slate-500 dark:text-gray-400 text-center mt-1">
                مشتریان با کلیک روی لینک، مستقیماً به صفحه اختصاصی شما هدایت می‌شوند
              </p>
            </div>
          )}

          <button onClick={onClose} className="w-full mt-4 py-2.5 bg-emerald-600 text-white rounded-xl font-medium">
            رفتن به داشبورد
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ==================== Main Wizard Component ====================
export function CreateCustomerLinkWizard({
  isOpen,
  onClose,
  onSuccess,
  editMode = false,
  existingData,
}: CreateCustomerLinkWizardProps) {
  const [step, setStep] = useState(1);
  const [slug, setSlug] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdLink, setCreatedLink] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    business_name: "",
    business_address: "",
    phone: "",
    bio: "",
    logo: null,
    avatar_image: null,
    cover_image: null,
  });

  const [socialMedia, setSocialMedia] = useState<SocialMedia>({ ...defaultSocialMedia });

  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [workShifts, setWorkShifts] = useState<Shift[]>([]);
  const [offDays, setOffDays] = useState<number[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (editMode && existingData) {
        setSlug(existingData.slug || "");
        setBusinessInfo({
          business_name: existingData.business_name || "",
          business_address: existingData.business_address || "",
          phone: existingData.phone || "",
          bio: existingData.bio || "",
          logo: existingData.logo || null,
          avatar_image: existingData.avatar_image || null,
          cover_image: existingData.cover_image || null,
        });
        setSocialMedia(existingData.social_media || { ...defaultSocialMedia });
        setSelectedServices(existingData.selected_services || []);
        setWorkShifts(existingData.work_shifts || []);
        setOffDays(existingData.off_days || []);
        setIsLoading(false);
      } else {
        const fetchSettings = async () => {
          setIsLoading(true);
          try {
            const res = await fetch("/api/client/settings");
            const data = await res.json();
            if (data.success && data.user) {
              setBusinessInfo({
                business_name: data.user.business_name || "",
                business_address: data.user.business_address || "",
                phone: data.user.phone || "",
                bio: "",
                logo: null,
                avatar_image: null,
                cover_image: null,
              });
              setWorkShifts(data.user.work_shifts ? JSON.parse(data.user.work_shifts) : []);
              setOffDays(data.user.off_days ? JSON.parse(data.user.off_days) : []);
            }
          } catch (error) {
            console.error("Error fetching settings:", error);
          } finally {
            setIsLoading(false);
          }
        };
        fetchSettings();
      }
    }
  }, [isOpen, editMode, existingData]);

  const updateBusinessInfo = (newData: Partial<BusinessInfo>) => {
    setBusinessInfo((prev) => ({ ...prev, ...newData }));
  };

  const updateSocialMedia = (newData: Partial<SocialMedia>) => {
    setSocialMedia((prev) => ({ ...prev, ...newData }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const url = "/api/client/customer-link";
      const method = editMode ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          business_name: businessInfo.business_name,
          business_address: businessInfo.business_address,
          phone: businessInfo.phone,
          bio: businessInfo.bio,
          logo: businessInfo.logo,
          avatar_image: businessInfo.avatar_image,
          cover_image: businessInfo.cover_image,
          social_media: socialMedia,
          services: selectedServices,
          work_shifts: workShifts,
          off_days: offDays,
        }),
      });

      const data = await res.json();
      
      if (data.success) {
        const finalLink = `myapp.ir/c/${slug}`;
        
        if (!editMode) {
          setCreatedLink(finalLink);
          setShowSuccess(true);
        } else {
          // برای حالت ویرایش، مودال موفقیت با متن متفاوت نشان بده
          setCreatedLink(finalLink);
          setShowSuccess(true);
        }
        
        if (onSuccess) {
          onSuccess(finalLink, slug);
        }
      } else {
        toast.error(data.message || "خطا در ذخیره اطلاعات");
      }
    } catch (error) {
      console.error("Error submitting:", error);
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-white dark:bg-[#1a1e26] rounded-2xl p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-3" />
          <p className="text-slate-600 dark:text-gray-300">در حال بارگذاری اطلاعات...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-2xl bg-white dark:bg-[#1a1e26] rounded-2xl shadow-2xl overflow-hidden">
          <div className="sticky top-0 bg-white dark:bg-[#1a1e26] p-4 border-b border-slate-200 dark:border-emerald-500/30 flex justify-between items-center z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                {editMode ? <Edit2 className="w-4 h-4 text-white" /> : <Crown className="w-4 h-4 text-white" />}
              </div>
              <h2 className="font-bold text-slate-800 dark:text-white">
                {editMode ? "ویرایش لینک اختصاصی" : "ساخت لینک اختصاصی"}
              </h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <div className="p-6 max-h-[80vh] overflow-y-auto">
            <StepIndicator currentStep={step} totalSteps={4} />

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <SlugStep 
                    slug={slug} 
                    onSlugChange={setSlug} 
                    onNext={handleNext}
                    editMode={editMode}
                  />
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <BasicInfoStep 
                    data={businessInfo}
                    socialMedia={socialMedia}
                    onDataChange={updateBusinessInfo}
                    onSocialChange={updateSocialMedia}
                    onNext={handleNext}
                    onBack={handleBack}
                  />
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <ServicesAndSettingsStep
                    selectedServices={selectedServices}
                    workShifts={workShifts}
                    offDays={offDays}
                    onServicesChange={setSelectedServices}
                    onShiftsChange={setWorkShifts}
                    onOffDaysChange={setOffDays}
                    onNext={handleNext}
                    onBack={handleBack}
                  />
                </motion.div>
              )}

              {step === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <FinalReviewStep
                    slug={slug}
                    businessInfo={businessInfo}
                    socialMedia={socialMedia}
                    selectedServices={selectedServices}
                    workShifts={workShifts}
                    offDays={offDays}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    onBack={handleBack}
                    editMode={editMode}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {showSuccess && (
        <SuccessModal link={createdLink} onClose={onClose} isEditMode={editMode} />
      )}
    </>
  );
}