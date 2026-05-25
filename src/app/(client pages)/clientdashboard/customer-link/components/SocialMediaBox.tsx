// src/app/clientdashboard/customer-link/components/SocialMediaBox.tsx
"use client";

import { useState } from "react";
import { 
  Share2, 
  Instagram, 
  Send, 
  MessageCircle, 
  Phone, 
  Globe, 
  AtSign,
  Edit2,
  CheckCircle,
  AlertCircle,
  X,
  Loader2,
  ExternalLink,
  Trash2
} from "lucide-react";
import { toast } from "react-hot-toast";

interface SocialMedia {
  instagram: string;
  telegram: string;
  rubika: string;
  whatsapp: string;
  eitaa: string;
  bale: string;
  soroush: string;
}

interface SocialMediaBoxProps {
  socialMedia: SocialMedia;
  onSocialMediaChange: (socialMedia: SocialMedia) => Promise<void>;
  isSaving?: boolean;
}

const defaultSocialMedia: SocialMedia = {
  instagram: "",
  telegram: "",
  rubika: "",
  whatsapp: "",
  eitaa: "",
  bale: "",
  soroush: "",
};

const socialFields = [
  { key: "instagram", label: "اینستاگرام", icon: Instagram, placeholder: "username", color: "pink", urlPrefix: "https://instagram.com/", bgGradient: "from-pink-500 to-purple-600" },
  { key: "telegram", label: "تلگرام", icon: Send, placeholder: "username", color: "blue", urlPrefix: "https://t.me/", bgGradient: "from-blue-500 to-cyan-600" },
  { key: "rubika", label: "روبیکا", icon: MessageCircle, placeholder: "username", color: "teal", urlPrefix: "https://rubika.ir/", bgGradient: "from-teal-500 to-green-600" },
  { key: "whatsapp", label: "واتساپ", icon: Phone, placeholder: "09123456789", color: "green", urlPrefix: "https://wa.me/", bgGradient: "from-green-500 to-emerald-600" },
  { key: "eitaa", label: "ایتا", icon: Globe, placeholder: "username", color: "purple", urlPrefix: "https://eitaa.com/", bgGradient: "from-purple-500 to-indigo-600" },
  { key: "bale", label: "بله", icon: AtSign, placeholder: "username", color: "amber", urlPrefix: "https://ble.ir/", bgGradient: "from-amber-500 to-yellow-600" },
  { key: "soroush", label: "سروش", icon: MessageCircle, placeholder: "username", color: "indigo", urlPrefix: "https://splus.ir/", bgGradient: "from-indigo-500 to-blue-600" },
];

export function SocialMediaBox({
  socialMedia,
  onSocialMediaChange,
  isSaving = false,
}: SocialMediaBoxProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempSocialMedia, setTempSocialMedia] = useState<SocialMedia>({ ...defaultSocialMedia });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // بررسی وضعیت تکمیل (حداقل یک شبکه اجتماعی فعال باشد)
  const checkCompletion = () => {
    const activeSocials = Object.entries(socialMedia).filter(([_, value]) => value && value.trim() !== "");
    const count = activeSocials.length;
    
    return {
      isComplete: count > 0,
      count,
      hasSocial: count > 0,
    };
  };

  const { isComplete, count, hasSocial } = checkCompletion();

  const getActiveSocialsList = () => {
    return Object.entries(socialMedia)
      .filter(([_, value]) => value && value.trim() !== "")
      .map(([key, value]) => {
        const field = socialFields.find(f => f.key === key);
        return { key, value, ...field };
      });
  };

  const handleOpenModal = () => {
    setTempSocialMedia({ ...socialMedia });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSocialChange = (key: keyof SocialMedia, value: string) => {
    // پاک کردن کاراکترهای غیرمجاز
    let cleanedValue = value;
    if (key === "whatsapp") {
      // فقط اعداد برای واتساپ
      cleanedValue = value.replace(/[^0-9]/g, "");
    } else {
      // حروف انگلیسی، اعداد و زیرخط برای بقیه
      cleanedValue = value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    }
    
    setTempSocialMedia(prev => ({ ...prev, [key]: cleanedValue }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await onSocialMediaChange(tempSocialMedia);
      setIsModalOpen(false);
      toast.success("شبکه‌های اجتماعی با موفقیت ذخیره شد");
    } catch (error) {
      console.error("Error saving social media:", error);
      toast.error("خطا در ذخیره شبکه‌های اجتماعی");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSocialLink = (key: string, value: string) => {
    const field = socialFields.find(f => f.key === key);
    if (!field) return "#";
    if (key === "whatsapp") {
      return `https://wa.me/${value.replace(/^0/, "98")}`;
    }
    return `${field.urlPrefix}${value}`;
  };

  const activeSocials = getActiveSocialsList();

  return (
    <>
      <div className="bg-white dark:bg-[#1a1e26] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
        {/* هدر */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <Share2 className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white">
              شبکه‌های اجتماعی
            </h3>
          </div>
          
          {isComplete ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 rounded-full">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                {count} شبکه
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-500/10 rounded-full">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                اضافه نشده
              </span>
            </div>
          )}
        </div>

        {/* محتوا */}
        <div className="p-5">
          {!isComplete && (
            <div className="bg-amber-50 dark:bg-amber-500/10 rounded-xl p-3 mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  هنوز هیچ شبکه اجتماعی اضافه نکرده‌اید
                </p>
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-300 mt-1 mr-6">
                افزودن شبکه‌های اجتماعی به مشتریان کمک می‌کند راحت‌تر با شما ارتباط بگیرند
              </p>
            </div>
          )}

          {/* لیست شبکه‌های اجتماعی اضافه شده */}
          {activeSocials.length > 0 && (
            <div className="space-y-2 mb-4">
              {activeSocials.map((social) => (
                <a
                  key={social.key}
                  href={getSocialLink(social.key, social.value)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-slate-50 to-white dark:from-white/5 dark:to-transparent border border-slate-100 dark:border-white/10 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${social.bgGradient} flex items-center justify-center shadow-md`}>
                      {social.icon && <social.icon className="w-4 h-4 text-white" />}
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-gray-400">
                        {social.label}
                      </p>
                      <p className="text-sm font-medium text-slate-700 dark:text-gray-300">
                        {social.value}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition" />
                </a>
              ))}
            </div>
          )}

          {/* دکمه ویرایش/افزودن */}
          <button
            onClick={handleOpenModal}
            disabled={isSaving}
            className="w-full py-2.5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Edit2 className="w-4 h-4" />
            {hasSocial ? "ویرایش شبکه‌های اجتماعی" : "افزودن شبکه‌های اجتماعی"}
          </button>
        </div>
      </div>

      {/* مودال ویرایش شبکه‌های اجتماعی */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#1a1e26] rounded-2xl shadow-2xl overflow-hidden">
            {/* هدر مودال */}
            <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Share2 className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white">
                  شبکه‌های اجتماعی
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* توضیحات */}
            <div className="p-5 border-b border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/5">
              <p className="text-xs text-slate-600 dark:text-gray-400">
                شبکه‌های اجتماعی خود را وارد کنید. مشتریان با کلیک روی هر کدام، مستقیماً به صفحه شما در آن شبکه هدایت می‌شوند.
              </p>
            </div>

            {/* فرم */}
            <div className="p-5 max-h-[55vh] overflow-y-auto space-y-4">
              {socialFields.map((field) => {
                const Icon = field.icon;
                const value = tempSocialMedia[field.key as keyof SocialMedia] || "";
                
                return (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
                      {field.label}
                    </label>
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${field.bgGradient} flex items-center justify-center shadow-md shrink-0`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="relative">
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => handleSocialChange(field.key as keyof SocialMedia, e.target.value)}
                            placeholder={field.placeholder}
                            className="w-full p-3 border dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-white/5 focus:border-emerald-500 outline-none transition-colors dark:text-white pl-8"
                            dir="ltr"
                          />
                          {value && (
                            <button
                              onClick={() => handleSocialChange(field.key as keyof SocialMedia, "")}
                              className="absolute left-3 top-1/2 transform -translate-y-1/2"
                            >
                              <Trash2 className="w-4 h-4 text-red-400 hover:text-red-500" />
                            </button>
                          )}
                        </div>
                        {field.key === "whatsapp" && value && (
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">
                            لینک: wa.me/{value.replace(/^0/, "98")}
                          </p>
                        )}
                        {field.key !== "whatsapp" && value && (
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">
                            {field.urlPrefix}{value}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* نکته مهم */}
            <div className="mx-5 mb-2 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
              <p className="text-xs text-blue-700 dark:text-blue-400">
                💡 نکته: برای واتساپ فقط شماره تماس را وارد کنید (مثال: 09123456789)
              </p>
            </div>

            {/* دکمه‌های مودال */}
            <div className="p-4 border-t border-slate-200 dark:border-white/10 flex gap-3">
              <button
                onClick={handleCloseModal}
                className="flex-1 py-2.5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium text-slate-700 dark:text-gray-300"
              >
                انصراف
              </button>
              <button
                onClick={handleSave}
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                ذخیره شبکه‌های اجتماعی
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}