// src/app/clientdashboard/customer-link/components/BusinessInfoBox.tsx
"use client";

import { useState, useEffect } from "react";
import { Edit2, CheckCircle, AlertCircle, X, Upload, Loader2, Trash2, Image as ImageIcon, User, MapPin, Phone, ChevronDown } from "lucide-react";
import { toast } from "react-hot-toast";

// استان‌های ایران
const IRAN_PROVINCES = [
  "آذربایجان شرقی", "آذربایجان غربی", "اردبیل", "اصفهان", "البرز", "ایلام", 
  "بوشهر", "تهران", "چهارمحال و بختیاری", "خراسان جنوبی", "خراسان رضوی", 
  "خراسان شمالی", "خوزستان", "زنجان", "سمنان", "سیستان و بلوچستان", "فارس", 
  "قزوین", "قم", "کردستان", "کرمان", "کرمانشاه", "کهگیلویه و بویراحمد", 
  "گلستان", "گیلان", "لرستان", "مازندران", "مرکزی", "هرمزگان", "همدان", "یزد"
];

// شهرهای هر استان
const IRAN_CITIES_BY_PROVINCE: Record<string, string[]> = {
  "آذربایجان شرقی": ["تبریز", "مراغه", "مرند", "میاندوآب", "جلفا", "اهر", "بناب", "سراب", "شبستر", "عجبشیر", "کلیبر", "هریس", "هشترود"],
  "آذربایجان غربی": ["ارومیه", "خوی", "بوکان", "مهاباد", "سلماس", "نقده", "پیرانشهر", "تکاب", "چالدران", "شاهین دژ", "ماکو"],
  "اردبیل": ["اردبیل", "پارس آباد", "خلخال", "مشگین شهر", "بیله سوار", "گرمی"],
  "اصفهان": ["اصفهان", "کاشان", "خمینی شهر", "نجف آباد", "شهرضا", "فلاورجان", "لنجان", "مبارکه", "زرین شهر", "گلپایگان", "خوانسار", "سمیرم", "فریدن", "فریدون شهر", "نائین", "نطنز"],
  "البرز": ["کرج", "فردیس", "ساوجبلاغ", "نظرآباد", "اشتهارد", "طالقان"],
  "ایلام": ["ایلام", "دهلران", "مهران", "چرداول", "ایوان", "آبدانان", "دره شهر"],
  "بوشهر": ["بوشهر", "برازجان", "گناوه", "دیلم", "جم", "دشتی", "دیر", "تنگستان", "عسلویه"],
  "تهران": ["تهران", "اسلامشهر", "شهریار", "قدس", "ملارد", "ورامین", "پیشوا", "پاکدشت", "رباط کریم", "ری", "شمیرانات", "دماوند", "فیروزکوه"],
  "چهارمحال و بختیاری": ["شهرکرد", "بروجن", "فارسان", "اردل", "لردگان", "کیار", "کوهرنگ"],
  "خراسان جنوبی": ["بیرجند", "قائن", "فردوس", "نهبندان", "طبس", "سرایان", "درمیان"],
  "خراسان رضوی": ["مشهد", "نیشابور", "سبزوار", "تربت حیدریه", "کاشمر", "گناباد", "چناران", "درگز", "فریمان", "قوچان", "بردسکن", "تایباد", "تربت جام", "خواف", "رشتخوار", "زاوه", "سرخس", "فیروزه", "کلات", "مه ولات"],
  "خراسان شمالی": ["بجنورد", "اسفراین", "شیروان", "جاجرم", "مانه و سملقان", "گرمه", "راز و جرگلان"],
  "خوزستان": ["اهواز", "آبادان", "خرمشهر", "دزفول", "اندیمشک", "مسجدسلیمان", "بهبهان", "شوشتر", "ایذه", "باغملک", "بندر ماهشهر", "رامهرمز", "شادگان", "هندیجان", "گتوند", "لالی", "هفتکل", "حمیدیه"],
  "زنجان": ["زنجان", "ابهر", "خرمدره", "طارم", "ماهنشان", "ایجرود", "سلطانیه"],
  "سمنان": ["سمنان", "شاهرود", "دامغان", "گرمسار", "مهدی شهر", "سرخه", "آرادان", "میامی"],
  "سیستان و بلوچستان": ["زاهدان", "زابل", "چابهار", "ایرانشهر", "سراوان", "خاش", "نیکشهر", "کنارک", "دلگان", "سرباز", "زهک", "فنوج", "قصرقند", "مهرستان"],
  "فارس": ["شیراز", "مرودشت", "کازرون", "لارستان", "جهرم", "فسا", "داراب", "آباده", "نورآباد", "اقلید", "استهبان", "بوانات", "خرامه", "خرم بید", "خنج", "زرین دشت", "سپیدان", "سروستان", "فراشبند", "قیر و کارزین", "لامرد", "ممسنی", "نی ریز", "پاسارگاد"],
  "قزوین": ["قزوین", "البرز", "تاکستان", "آبیک", "بوئین زهرا", "آوج"],
  "قم": ["قم", "جعفرآباد", "کهک"],
  "کردستان": ["سنندج", "سقز", "مریوان", "بانه", "قروه", "دیواندره", "بیجار", "کامیاران", "دهگلان", "سروآباد"],
  "کرمان": ["کرمان", "سیرجان", "رفسنجان", "جیرفت", "بم", "زرند", "کهنوج", "عنبرآباد", "بافت", "راور", "بردسیر", "منوجان", "قلعه گنج", "فهرج", "ریگان", "نرماشیر"],
  "کرمانشاه": ["کرمانشاه", "اسلام آباد غرب", "هرسین", "سنقر", "صحنه", "روانسر", "پاوه", "سرپل ذهاب", "قصر شیرین", "کنگاور", "گیلانغرب", "دالاهو", "جوانرود", "ثلاث باباجانی"],
  "کهگیلویه و بویراحمد": ["یاسوج", "گچساران", "دوگنبدان", "دهدشت", "لنده", "بهمئی", "چرام"],
  "گلستان": ["گرگان", "گنبد کاووس", "علی آباد کتول", "آق قلا", "کردکوی", "بندر ترکمن", "رامیان", "آزادشهر", "کلاله", "مینودشت", "گمیشان"],
  "گیلان": ["رشت", "بندر انزلی", "لاهیجان", "لنگرود", "تالش", "آستارا", "صومعه سرا", "رودسر", "رودبار", "فومن", "سیاهکل", "آستانه اشرفیه", "رضوانشهر", "ماسال", "شفت", "املش"],
  "لرستان": ["خرم آباد", "بروجرد", "دورود", "الیگودرز", "کوهدشت", "ازنا", "نورآباد", "پلدختر", "سلسله"],
  "مازندران": ["ساری", "بابل", "آمل", "قائم شهر", "بهشهر", "نوشهر", "چالوس", "رامسر", "تنکابن", "نکا", "بابلسر", "جویبار", "محمودآباد", "نور", "فریدونکنار", "عباس آباد", "گلوگاه", "میاندرود", "سوادکوه", "سوادکوه شمالی"],
  "مرکزی": ["اراک", "ساوه", "خمین", "محلات", "دلیجان", "تفرش", "زرندیه", "شازند", "آشتیان", "فراهان", "کمیجان"],
  "هرمزگان": ["بندرعباس", "میناب", "قشم", "کیش", "بندر لنگه", "حاجی آباد", "دهبارز", "بستک", "جاسک", "سیریک", "خمیر", "پارسیان", "ابوموسی"],
  "همدان": ["همدان", "ملایر", "نهاوند", "تویسرکان", "کبودرآهنگ", "اسدآباد", "رزن", "فامنین", "بهار"],
  "یزد": ["یزد", "میبد", "اردکان", "بافق", "ابرکوه", "تفت", "مهریز", "اشکذر", "خاتم", "بهاباد"]
};

interface BusinessInfoBoxProps {
  businessName: string;
  businessAddress: string;
  bio: string;
  avatarImage: string | null;
  coverImage: string | null;
  province?: string;
  city?: string;
  phone?: string;
  onSave: (data: {
    business_name: string;
    business_address: string;
    bio: string;
    avatar_image: string | null;
    cover_image: string | null;
    province: string;
    city: string;
    phone: string;
  }) => Promise<void>;
}

export function BusinessInfoBox({
  businessName,
  businessAddress,
  bio,
  avatarImage,
  coverImage,
  province: initialProvince = "",
  city: initialCity = "",
  phone: initialPhone = "",
  onSave,
}: BusinessInfoBoxProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    business_name: businessName,
    business_address: businessAddress,
    bio: bio,
    avatar_image: avatarImage,
    cover_image: coverImage,
    province: initialProvince,
    city: initialCity,
    phone: initialPhone,
  });

  const [availableCities, setAvailableCities] = useState<string[]>([]);

  // بروزرسانی لیست شهرها هنگام تغییر استان
  useEffect(() => {
    if (formData.province && IRAN_CITIES_BY_PROVINCE[formData.province]) {
      setAvailableCities(IRAN_CITIES_BY_PROVINCE[formData.province]);
    } else {
      setAvailableCities([]);
    }
  }, [formData.province]);

  // بررسی تکمیل بودن همه فیلدها
  const checkCompletion = () => {
    const missingFields: string[] = [];
    
    if (!businessName || businessName.trim() === "") {
      missingFields.push("نام کسب‌وکار");
    }
    if (!formData.province || formData.province === "") {
      missingFields.push("استان");
    }
    if (!formData.city || formData.city === "") {
      missingFields.push("شهر");
    }
    if (!businessAddress || businessAddress.trim() === "") {
      missingFields.push("آدرس");
    }
    if (!formData.phone || formData.phone.trim() === "") {
      missingFields.push("شماره تماس");
    }
    if (!avatarImage) {
      missingFields.push("عکس پروفایل");
    }
    if (!coverImage) {
      missingFields.push("عکس کاور");
    }
    
    return {
      isComplete: missingFields.length === 0,
      missingFields,
      totalFields: 7, // نام، استان، شهر، آدرس، شماره تماس، آواتار، کاور
      completedFields: 7 - missingFields.length,
    };
  };

  const { isComplete, missingFields, totalFields, completedFields } = checkCompletion();
  const completionPercentage = (completedFields / totalFields) * 100;

  const handleEdit = () => {
    setFormData({
      business_name: businessName,
      business_address: businessAddress,
      bio: bio || "",
      avatar_image: avatarImage,
      cover_image: coverImage,
      province: initialProvince || "",
      city: initialCity || "",
      phone: initialPhone || "",
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await onSave({
        business_name: formData.business_name,
        business_address: formData.business_address,
        bio: formData.bio,
        avatar_image: formData.avatar_image,
        cover_image: formData.cover_image,
        province: formData.province,
        city: formData.city,
        phone: formData.phone,
      });
      setIsModalOpen(false);
      toast.success("اطلاعات کسب‌وکار با موفقیت ذخیره شد");
    } catch (error) {
      console.error("Error saving business info:", error);
      toast.error("خطا در ذخیره اطلاعات");
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadImage = async (file: File, type: "avatar" | "cover"): Promise<string | null> => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("type", type === "avatar" ? "avatar" : "cover");

    try {
      const res = await fetch("/api/client/upload-image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        return data.url;
      }
      throw new Error(data.message || "خطا در آپلود");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("خطا در آپلود تصویر");
      return null;
    }
  };

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "avatar" | "cover"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم فایل نباید بیشتر از ۵ مگابایت باشد");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("لطفاً فایل تصویری انتخاب کنید");
      return;
    }

    toast.loading("در حال آپلود تصویر...", { id: "upload" });
    const imageUrl = await uploadImage(file, type);
    toast.dismiss("upload");

    if (imageUrl) {
      if (type === "avatar") {
        setFormData((prev) => ({ ...prev, avatar_image: imageUrl }));
      } else {
        setFormData((prev) => ({ ...prev, cover_image: imageUrl }));
      }
      toast.success("تصویر با موفقیت آپلود شد");
    }
  };

  const removeImage = (type: "avatar" | "cover") => {
    if (type === "avatar") {
      setFormData((prev) => ({ ...prev, avatar_image: null }));
    } else {
      setFormData((prev) => ({ ...prev, cover_image: null }));
    }
  };

  const formatPhoneNumber = (value: string) => {
    // فقط اعداد
    const numbers = value.replace(/[^0-9]/g, "");
    if (numbers.length <= 11) return numbers;
    return numbers.slice(0, 11);
  };

  return (
    <>
      <div className="bg-white dark:bg-[#1a1e26] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
        {/* هدر با وضعیت */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
              <Edit2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white">
              اطلاعات کسب‌وکار
            </h3>
          </div>
          
          {isComplete ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 rounded-full">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                تکمیل شد
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-500/10 rounded-full">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                {completedFields}/{totalFields} تکمیل
              </span>
            </div>
          )}
        </div>

        {/* محتوا */}
        <div className="p-5 space-y-4">
          {/* نوار پیشرفت */}
          {!isComplete && (
            <div className="mb-2">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>پیشرفت تکمیل اطلاعات</span>
                <span>{Math.round(completionPercentage)}%</span>
              </div>
              <div className="h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          )}

          {/* تصویر کاور */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ImageIcon className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-500">تصویر کاور</span>
              {!coverImage && <span className="text-xs text-amber-500">(ضروری)</span>}
            </div>
            {coverImage ? (
              <div className="rounded-xl overflow-hidden h-24 w-full bg-slate-100 dark:bg-white/5 relative group">
                <img src={coverImage} alt="کاور" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
            ) : (
              <div className="rounded-xl h-24 w-full bg-slate-100 dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10 flex items-center justify-center">
                <div className="text-center">
                  <ImageIcon className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                  <p className="text-xs text-slate-400">تصویر کاور ثبت نشده</p>
                </div>
              </div>
            )}
          </div>

          {/* آواتار + اطلاعات اصلی */}
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              {avatarImage ? (
                <div className="relative group">
                  <img src={avatarImage} alt="آواتار" className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500" />
                  <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
              ) : (
                <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-white/20">
                  <User className="w-6 h-6 text-slate-400" />
                </div>
              )}
              {!avatarImage && <span className="text-[10px] text-amber-500 mt-1">ضروری</span>}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-slate-800 dark:text-white truncate">
                {businessName || "نام کسب‌وکار"}
                {!businessName && <span className="text-xs text-amber-500 mr-2">(ضروری)</span>}
              </h4>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {formData.province && formData.city ? `${formData.province}، ${formData.city}` : "استان و شهر ثبت نشده"}
                {(!formData.province || !formData.city) && <span className="text-amber-500">(ضروری)</span>}
              </p>
              <p className="text-xs text-slate-500 dark:text-gray-400 truncate mt-0.5">
                {businessAddress || "آدرس ثبت نشده"}
                {!businessAddress && <span className="text-amber-500 mr-1">(ضروری)</span>}
              </p>
              {initialPhone && (
                <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {initialPhone}
                </p>
              )}
              {bio && <p className="text-xs text-slate-500 dark:text-gray-400 line-clamp-2 mt-1">{bio}</p>}
            </div>
          </div>

          {/* پیام موارد ناقص */}
          {!isComplete && missingFields.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-500/10 rounded-xl p-3">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">موارد زیر تکمیل نشده است:</p>
              <div className="flex flex-wrap gap-2">
                {missingFields.map((field) => (
                  <span key={field} className="text-xs text-amber-600 dark:text-amber-300 bg-amber-100 dark:bg-amber-500/20 px-2 py-0.5 rounded-full">
                    {field}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button onClick={handleEdit} className="w-full py-2.5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
            <Edit2 className="w-4 h-4" />
            {isComplete ? "ویرایش اطلاعات" : "تکمیل اطلاعات"}
          </button>
        </div>
      </div>

      {/* مودال ویرایش */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#1a1e26] rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-white">ویرایش اطلاعات کسب‌وکار</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/10">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* تصویر کاور */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                  تصویر کاور <span className="text-red-500">*</span>
                </label>
                {formData.cover_image ? (
                  <div className="relative rounded-xl overflow-hidden">
                    <img src={formData.cover_image} alt="کاور" className="w-full h-32 object-cover" />
                    <button onClick={() => removeImage("cover")} className="absolute top-2 right-2 bg-red-500 rounded-full p-1.5">
                      <Trash2 className="w-5 h-5 text-white" />
                    </button>
                  
                    <input id="coverUpload" type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, "cover")} />
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-slate-50 dark:bg-white/5 hover:border-emerald-500 cursor-pointer">
                    <Upload className="w-6 h-6 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">کلیک کنید برای آپلود تصویر کاور</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, "cover")} />
                  </label>
                )}
              </div>

              {/* تصویر آواتار */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                  عکس پروفایل <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4">
                  {formData.avatar_image ? (
                    <div className="relative">
                      <img src={formData.avatar_image} alt="آواتار" className="w-20 h-20 rounded-full object-cover border-2 border-emerald-500" />
                      <button onClick={() => removeImage("avatar")} className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1">
                        <Trash2 className="w-5 h-5 text-white" />
                      </button>
                
                      <input id="avatarUpload" type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, "avatar")} />
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-20 h-20 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 bg-slate-50 dark:bg-white/5 hover:border-emerald-500 cursor-pointer">
                      <Upload className="w-5 h-5 text-gray-400" />
                      <span className="text-[10px] text-gray-400 mt-1">آپلود</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, "avatar")} />
                    </label>
                  )}
                </div>
              </div>

              {/* نام کسب‌وکار */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
                  نام کسب‌وکار <span className="text-red-500">*</span>
                </label>
                <input type="text" value={formData.business_name} onChange={(e) => setFormData({ ...formData, business_name: e.target.value })} placeholder="مثال: آرایشگاه مدرن سارا" className="w-full p-3 border dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-white/5 focus:border-emerald-500 outline-none dark:text-white" />
              </div>

              {/* استان */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
                  استان <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select value={formData.province} onChange={(e) => setFormData({ ...formData, province: e.target.value, city: "" })} className="w-full p-3 border dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-white/5 focus:border-emerald-500 outline-none appearance-none cursor-pointer dark:text-white">
                    <option value="">انتخاب استان...</option>
                    {IRAN_PROVINCES.map((province) => (
                      <option key={province} value={province}>{province}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* شهر */}
              {formData.province && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
                    شهر <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="w-full p-3 border dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-white/5 focus:border-emerald-500 outline-none appearance-none cursor-pointer dark:text-white">
                      <option value="">انتخاب شهر...</option>
                      {availableCities.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* آدرس */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
                  آدرس <span className="text-red-500">*</span>
                </label>
                <textarea value={formData.business_address} onChange={(e) => setFormData({ ...formData, business_address: e.target.value })} placeholder="آدرس کامل کسب‌وکار..." rows={2} className="w-full p-3 border dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-white/5 focus:border-emerald-500 outline-none resize-none dark:text-white" />
              </div>

              {/* شماره تماس */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
                  شماره تماس <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2 p-3 border dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-white/5">
                  <Phone className="w-5 h-5 text-emerald-500 shrink-0" />
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })} placeholder="۰۹۱۲۳۴۵۶۷۸۹" className="flex-1 dark:text-white bg-transparent outline-none" dir="ltr" />
                </div>
                <p className="text-xs text-slate-400 mt-1">شماره تماس ۱۱ رقمی وارد کنید</p>
              </div>

              {/* معرفی */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
                  متن معرفی <span className="text-slate-400 text-xs">(اختیاری)</span>
                </label>
                <textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} placeholder="درباره کسب‌وکار خود بنویسید..." rows={3} className="w-full p-3 border dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-white/5 focus:border-emerald-500 outline-none resize-none dark:text-white" />
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-white/10 flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium text-slate-700 dark:text-gray-300">انصراف</button>
              <button onClick={handleSave} disabled={isSubmitting} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                ذخیره تغییرات
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}