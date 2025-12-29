import { Metadata } from "next";

/**
 * متادیتای اختصاصی برای صفحه اصلی (Main Page)
 */
export const mainmetadata: Metadata = {
  metadataBase: new URL("https://ontimeapp.ir"),
  title: {
    default: "آنتایم | اپلیکیشن هوشمند نوبت دهی آنلاین و مدیریت مشتریان",
    template: "%s | آنتایم",
  },
  description:
    "هوشمندترین سامانه و اپلیکیشن نوبت دهی برای پزشکان، آرایشگاه‌ها و مراکز خدماتی. همین حالا با ۲ ماه اشتراک رایگان و ۱۵۰ پیامک هدیه ماهانه شروع کنید.",
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
    canonical: "/",
  },
  openGraph: {
    title: "آنتایم - تحولی در مدیریت نوبت‌دهی کسب‌وکار شما",
    description: "۲ ماه استفاده رایگان از تمامی امکانات پنل مدیریت و نوبت‌دهی آنتایم",
    url: "https://ontimeapp.ir",
    siteName: "آنتایم",
    images: [
      {
        url: "/icons/icon-512.png", // تصویر با کیفیت برای اشتراک‌گذاری
        width: 512,
        height: 512,
        alt: "پنل مدیریت نوبت‌دهی آنتایم",
      },
    ],
    locale: "fa_IR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "آنتایم | اپلیکیشن نوبت‌دهی آنلاین",
    description: "۲ ماه رایگان نوبت‌های خود را هوشمند مدیریت کنید.",
    images: ["/icons/icon-512.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  other: {
    enamad: "39393880",
  },
};

/**
 * متادیتای اختصاصی برای صفحه لیست مقالات بلاگ
 */
export const blogMetadata: Metadata = {
  metadataBase: new URL("https://ontimeapp.ir"),
  title: "مجله آنتایم | مقالات و آموزش‌های تخصصی مدیریت کسب‌وکار و نوبت‌دهی",
  description:
    "آخرین مقالات و آموزش‌های تخصصی مدیریت کسب‌وکار در مجله آنتایم ✅ راهکارهای عملی برای افزایش نوبت‌دهی، مدیریت هوشمند مشتریان و رشد پایدار درآمد شما.",
  keywords: [
    "مقالات مدیریت کسب و کار",
    "آموزش نوبت دهی آنلاین",
    "مدیریت مشتریان آرایشگاه",
    "افزایش درآمد کسب و کار",
    "نکات مدیریت زمان",
    "جذب مشتری بیشتر",
  ],
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "مجله آنتایم | جدیدترین مقالات مدیریت کسب‌وکار و نوبت‌دهی آنلاین",
    description:
      "راهکارهای عملی برای افزایش نوبت‌ها و مدیریت هوشمند مشتریان. مقالات رایگان و به‌روز مجله آنتایم.",
    url: "https://ontimeapp.ir/blog",
    siteName: "آنتایم",
    images: [
      {
        url: "/icons/icon-512.png",// تصویر شاخص بخش بلاگ
        width: 1200,
        height: 630,
        alt: "مجله تخصصی آنتایم - آموزش مدیریت کسب‌وکار",
      },
    ],
    locale: "fa_IR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "مجله آنتایم | آموزش‌ها و مقالات مدیریت نوبت‌دهی",
    description: "نکات کاربردی برای رشد کسب‌وکار: افزایش نوبت، جذب مشتری و مدیریت زمان.",
    images: ["/icons/icon-512.png"],
  
  },
};