import { Metadata } from "next";

// متادیتای اختصاصی برای صفحه بلاگ (این را در صفحه /blog/page.tsx استفاده کنید)
export const blogMetadata: Metadata = {
  title: "مجله آنتایم | مقالات و آموزش‌های تخصصی مدیریت کسب‌وکار و نوبت‌دهی",
  description: "آخرین مقالات و آموزش‌های تخصصی مدیریت کسب‌وکار در مجله آنتایم ✅ راهکارهای عملی برای افزایش نوبت‌دهی، مدیریت هوشمند مشتریان و رشد پایدار درآمد کسب‌وکار شما.",
  keywords: [
    "مقالات مدیریت کسب و کار",
    "آموزش نوبت دهی آنلاین",
    "مدیریت مشتریان آرایشگاه",
    "افزایش درآمد کسب و کار",
    "نکات مدیریت زمان",
    "سامانه نوبت دهی",
    "جذب مشتری بیشتر",
    "یادآوری نوبت پیامکی",
  ],
  alternates: {
    canonical: "https://ontimeapp.ir/blog",
  },
  openGraph: {
    title: "مجله آنتایم | جدیدترین مقالات مدیریت کسب‌وکار و نوبت‌دهی آنلاین",
    description: "راهکارهای عملی و حرفه‌ای برای افزایش نوبت‌ها، مدیریت هوشمند مشتریان و رشد پایدار درآمد شما. مقالات رایگان و به‌روز مجله آنتایم.",
    url: "https://ontimeapp.ir/blog",
    siteName: "آنتایم",
    images: [
      {
        url: "https://ontimeapp.ir/blog-og-image.jpg", // پیشنهاد: یک تصویر اختصاصی برای بلاگ بسازید (1200x630)
        width: 1200,
        height: 630,
        alt: "مجله تخصصی آنتایم - مقالات مدیریت کسب‌وکار",
      },
    ],
    locale: "fa_IR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "مجله آنتایم | آموزش‌ها و مقالات مدیریت نوبت‌دهی",
    description: "نکات کاربردی برای رشد کسب‌وکار: افزایش نوبت، جذب مشتری و مدیریت بهتر زمان.",
    images: ["https://ontimeapp.ir/blog-og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};
export const mainmetadata: Metadata = {
  metadataBase: new URL("https://ontimeapp.ir"),
  title: {
    default: "آنتایم | اپلیکیشن هوشمند نوبت دهی آنلاین و مدیریت مشتریان",
    template: "%s | آنتایم",
  },
  description:
    "هوشمندترین سامانه و اپلیکیشن نوبت دهی برای پزشکان، آرایشگاه‌ها و مراکز آموزشی. همین حالا با ۲ ماه اشتراک رایگان و ۱۵۰ پیامک هدیه ماهانه شروع کنید.",
  keywords: [
    "نوبت دهی آنلاین",
    "مدیریت آرایشگاه",
    "نوبت دهی پزشکان",
    "سامانه یادآوری پیامکی",
    "نرم افزار مدیریت نوبت",
    "رزرو آنلاین",
    "پنل مدیریت مشتریان",
    "اپلیکیشن نوبت دهی آنلاین",
  ],
  authors: [{ name: "OnTime Team" }],
  publisher: "آنتایم",
  alternates: {
    canonical: "https://ontimeapp.ir",
  },
  openGraph: {
    title: "آنتایم - تحولی در مدیریت نوبت‌دهی کسب‌وکار شما",
    description:
      "۲ ماه استفاده رایگان از تمامی امکانات پنل مدیریت و نوبت‌دهی آنتایم",
    url: "https://ontimeapp.ir",
    siteName: "آنتایم",
    images: [
      {
        url: "/icons/icon-192.png",
        width: 1200,
        height: 630,
        alt: "پنل مدیریت نوبت‌دهی آنتایم",
      },
    ],
    locale: "fa_IR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "آنتایم |اپلیکیشن نوبت‌دهی آنلاین",
    description: "۲ ماه رایگان نوبت‌های خود را هوشمند مدیریت کنید.",
    images: ["/icons/icon-192.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png" }, // برای مرورگرهای قدیمی
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }, // آیکون اصلی
    ],
    apple: [
      { url: "/icons/apple-icon.png", sizes: "180x180", type: "image/png" }, // مخصوص آیفون
    ],
  },
};