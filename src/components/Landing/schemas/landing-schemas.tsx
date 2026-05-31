// src/components/Landing/schemas/mainPageSchemas.ts

export const landingPageSchemas = [
  // ۱. معرفی اپلیکیشن به عنوان نرم‌افزار تحت وب (WebApplication)
  {
    id: "hero-webapp-schema",
    data: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "اپلیکیشن نوبت‌دهی آنلاین آنتایم",
      url: "https://ontimeapp.ir",
      applicationCategory: "BusinessApplication",
      operatingSystem: "All",
      abstract:
        "هوشمندترین سامانه نوبت‌دهی آنلاین برای آرایشگاه‌ها، پزشکان و مراکز خدماتی با قابلیت یادآوری پیامکی خودکار.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "IRR",
        priceValidUntil: "2030-12-31",
        description: "۲ ماه اشتراک رایگان برای شروع مدیریت هوشمند نوبت‌ها",
      },
    },
  },

  // ۲. خدمات اتوماسیون پیامکی (Service)
  {
    id: "sms-automation-schema",
    data: {
      "@context": "https://schema.org",
      "@type": "Service",
      serviceType: "سامانه پیامکی نوبت‌دهی هوشمند",
      name: "اتوماسیون یادآوری نوبت آنتایم",
      description:
        "ارسال خودکار پیامک تایید رزرو، یادآوری نوبت و لینک اختصاصی تغییر زمان بدون نیاز به نصب اپلیکیشن توسط مشتری.",
      provider: {
        "@type": "Organization",
        name: "آنتایم",
      },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "مزایای اطلاع‌رسانی آنتایم",
        itemListElement: [
          {
            "@type": "Offer",
              priceValidUntil: "2030-12-31",
            itemOffered: {
              "@type": "Service",
              name: "کاهش ۸۰ درصدی کنسلی نوبت",
              description: "ارسال لینک هوشمند برای تغییر نوبت توسط مشتری.",
            },
          },
          {
            "@type": "Offer",
              priceValidUntil: "2030-12-31",
            itemOffered: {
              "@type": "Service",
              name: "یادآوری خودکار پیامکی",
              description:
                "اطلاع‌رسانی زمان نوبت چند ساعت قبل از موعد به صورت اتوماتیک.",
            },
          },
        ],
      },
    },
  },

  // ۳. تحلیل و آنالیز کسب‌وکار (Service)
  {
    id: "analytics-schema",
    data: {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "پنل تحلیل و آنالیز هوشمند آنتایم",
      description:
        "امکانات پیشرفته مدیریتی شامل لیست سیاه مشتریان، آنالیز نرخ کنسلی و گزارش‌های مالی.",
      provider: {
        "@type": "Organization",
        name: "آنتایم",
      },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "ابزارهای هوش تجاری آنتایم",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "شناسایی مشتریان بدقول (Blacklist)",
              description:
                "مانیتورینگ خودکار مشتریانی که نوبت‌های خود را لغو می‌کنند.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "آنالیز نوبت‌های موفق",
              description: "گزارش‌گیری دقیق از عملکرد ماهانه پرسنل و خدمات.",
            },
          },
        ],
      },
    },
  },

  // ۴. ماشین‌حساب بازگشت سرمایه (WebApplication)
  {
    id: "roi-calculator-schema",
    data: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "ماشین‌حساب هوشمند بازگشت سرمایه (ROI) آنتایم",
      description:
        "ابزاری برای محاسبه میزان جلوگیری از ضرر مالی و صرفه‌جویی در زمان با استفاده از پنل نوبت‌دهی آنلاین.",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "IRR",
            priceValidUntil: "2030-12-31",
      },
    },
  },

  // ۵. لیست امکانات کلیدی (ItemList)
  {
    id: "features-list-schema",
    data: {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "امکانات تخصصی پنل نوبت‌دهی آنتایم",
      description:
        "لیست قابلیت‌های کلیدی سیستم نوبت‌دهی هوشمند شامل اتوماسیون پیامکی و مدیریت مشتریان.",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "ارسال پیامک یادآوری نوبت خودکار",
        },
        { "@type": "ListItem", position: 2, name: "پنل مشتری تحت وب (PWA)" },
        {
          "@type": "ListItem",
          position: 3,
          name: "تقویم آنلاین نوبت‌دهی شمسی",
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "بانک اطلاعاتی و پرونده مشتریان",
        },
        {
          "@type": "ListItem",
          position: 5,
          name: "مدیریت لیست سیاه و کنسلی‌ها",
        },
        {
          "@type": "ListItem",
          position: 6,
          name: "مدیریت چندین پرسنل و لاین کاری",
        },
      ],
    },
  },

  // ۶. سوالات متداول (FAQPage) - بسیار مهم برای نمایش در گوگل
  {
    id: "faq-schema",
    data: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "آیا مشتری من هم باید اپلیکیشن آنتایم را نصب کند؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "خیر، مشتری شما هیچ نیازی به نصب برنامه ندارد. تمام تعاملات از طریق پیامک و وب‌اپلیکیشن (PWA) انجام می‌شود.",
          },
        },
        {
          "@type": "Question",
          name: "هزینه پیامک‌های یادآوری چگونه محاسبه می‌شود؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "شما ماهانه تعدادی پیامک هدیه دریافت می‌کنید و در صورت نیاز بیشتر، می‌توانید با تعرفه رسمی شارژ کنید.",
          },
        },
        {
          "@type": "Question",
          name: "آنتایم برای چه کسب‌وکارهایی مناسب است؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "تمام صنف‌های خدماتی از جمله سالن‌های زیبایی، کلینیک‌های پزشکی، آموزشگاه‌ها و تعمیرگاه‌ها.",
          },
        },
      ],
    },
  },

  // ۷. پیشنهاد ویژه (SoftwareApplication + AggregateRating)
  {
    id: "free-trial-promo-schema",
    data: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "پنل نوبت‌دهی آنلاین آنتایم",
      operatingSystem: "Web, Android, iOS",
      applicationCategory: "BusinessApplication",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "IRR",
            priceValidUntil: "2030-12-31",
        description:
          "۶۰ روز اشتراک کاملاً رایگان به همراه ۱۵۰ پیامک هدیه ماهانه.",
        availability: "https://schema.org/InStock",
        url: "https://ontimeapp.ir/clientdashboard",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "1500",
      },
    },
  },

  // ۸. ناوبری سایت (SiteNavigationElement)
  {
    id: "navigation-schema",
    data: {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "منوی اصلی آنتایم",
      itemListElement: [
        {
          "@type": "SiteNavigationElement",
          position: 1,
          name: "امکانات",
          url: "https://ontimeapp.ir/#features",
        },
        {
          "@type": "SiteNavigationElement",
          position: 2,
          name: "تعرفه‌ها",
          url: "https://ontimeapp.ir/#pricing",
        },
        {
          "@type": "SiteNavigationElement",
          position: 3,
          name: "مجله آنتایم",
          url: "https://ontimeapp.ir/blog",
        },
      ],
    },
  },

  // ۹. راهکارهای اصناف (ItemList)
  {
    id: "industry-solutions-schema",
    data: {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "راهکارهای تخصصی نوبت‌دهی آنتایم برای اصناف",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          item: { "@type": "Service", name: "آرایشگاه و سالن زیبایی" },
        },
        {
          "@type": "ListItem",
          position: 2,
          item: { "@type": "Service", name: "پزشکان و کلینیک‌ها" },
        },
        {
          "@type": "ListItem",
          position: 3,
          item: { "@type": "Service", name: "وکلا و دفاتر مشاوره" },
        },
      ],
    },
  },

  // ۱۰. آمار موفقیت (Organization + Statistics)
  {
    id: "stats-section-schema",
    data: {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "آنتایم",
      url: "https://ontimeapp.ir/",
      interactionStatistic: [
        {
          "@type": "InteractionCounter",
          interactionType: "https://schema.org/SubscribeAction",
          userInteractionCount: 1500,
        },
        {
          "@type": "InteractionCounter",
          interactionType: "https://schema.org/TradeAction",
          userInteractionCount: 45000,
        },
      ],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "1500",
      },
    },
  },

  

  // ==============================================
  // ۱۱. ⭐ اسکیما جدید و اختصاصی برای صفحه اختصاصی کسب و کار
  // ==============================================
  {
    id: "dedicated-business-page-schema",
    data: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "ساخت صفحه اختصاصی رزرو نوبت برای کسب و کار | آنتایم",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web (PWA)",
      abstract:
        "یک صفحه وب اختصاصی و سفارشی با لینک یکتا برای هر کسب و کار که مشتریان می‌توانند بدون نیاز به نصب اپلیکیشن، نوبت خود را ثبت، تغییر یا لغو کنند و در صورت لغو، دلیل آن را ثبت نمایند.",
      description: `صفحه اختصاصی رزرو نوبت آنتایم به کسب و کارها اجازه می‌دهد:
• لینک اختصاصی رزرو با برند خود داشته باشند
• مشتریان در کمتر از ۳۰ ثانیه نوبت ثبت کنند
• مشتریان نوبت خود را آنلاین تغییر دهند (با محدودیت قابل تنظیم)
• مشتریان نوبت خود را لغو کنند و دلیل آن را ثبت نمایند
• لینک را در اینستاگرام، واتساپ و وبسایت به اشتراک بگذارند
• بدون نیاز به نصب اپلیکیشن برای مشتری`,
      featureList: [
        "لینک اختصاصی و یکتا برای هر کسب و کار (ontime.ir/s/business-name)",
        "صفحه کاملاً سفارشی با لوگو و رنگ‌های برند",
        "نمایش لیست خدمات با قیمت و زمان",
        "فرم ثبت نوبت آنلاین (بدون نیاز به ورود / ثبت‌نام مشتری)",
        "قابلیت تغییر نوبت توسط مشتری (با محدودیت زمانی قابل تنظیم)",
        "قابلیت لغو نوبت توسط مشتری با انتخاب دلیل از لیست",
        "ذخیره خودکار دلایل لغو نوبت در پنل مدیریت",
        "سئو شده و سازگار با موبایل (Mobile-First)",
        "قابل اشتراک‌گذاری در تمام شبکه‌های اجتماعی",
        "اتصال خودکار به سیستم پیامک یادآوری آنتایم",
      ],
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "IRR",
        priceValidUntil: "2030-12-31",
        description:
          "این قابلیت در تمام پلن‌های آنتایم (از جمله پلن رایگان) بدون محدودیت در دسترس است.",
        availability: "https://schema.org/InStock",
        availabilityStarts: "2024-01-01",
      },
      provider: {
        "@type": "Organization",
        name: "آنتایم",
        url: "https://ontimeapp.ir",
        logo: "https://ontimeapp.ir/icons/icon-512.png",
      },
      image: "https://ontimeapp.ir/images/dedicated-page-preview.jpg",
      screenshot: [
        "https://ontimeapp.ir/screenshots/business-page-mobile.jpg",
        "https://ontimeapp.ir/screenshots/business-page-dashboard.jpg",
      ],
      url: "https://ontimeapp.ir/#business-page",
      softwareVersion: "2.0",
      keywords: "صفحه اختصاصی رزرو نوبت، لینک اختصاصی نوبت دهی، PWA نوبت دهی، مدیریت نوبت توسط مشتری",
      potentialAction: {
        "@type": "UseAction",
        name: "ساخت صفحه اختصاصی رزرو نوبت",
        description: "ثبت نام در آنتایم و ساخت صفحه اختصاصی رزرو نوبت برای کسب و کار خود",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://ontimeapp.ir/clientdashboard",
          actionPlatform: [
            "http://schema.org/DesktopWebPlatform",
            "http://schema.org/MobileWebPlatform",
          ],
        },
      },
      interactionStatistic: {
        "@type": "InteractionCounter",
        interactionType: {
          "@type": "CreateAction",
          name: "تعداد صفحات اختصاصی ساخته شده",
        },
        userInteractionCount: 1250,
      },
    },
  },

  // ==============================================
  // ۱۲. ⭐ اسکیما برای قابلیت "تغییر و لغو نوبت توسط مشتری" (Action Schema)
  // ==============================================
  {
    id: "appointment-self-management-schema",
    data: {
      "@context": "https://schema.org",
      "@type": "WebAPI", // یا می‌تواند "Service" باشد
      name: "مدیریت آنلاین نوبت توسط مشتری | تغییر و لغو نوبت با ثبت دلیل",
      description:
        "API و قابلیتی که به مشتریان کسب و کارها اجازه می‌دهد از طریق لینک اختصاصی، نوبت خود را تغییر دهند یا لغو کنند و در صورت لغو، دلیل آن را ثبت نمایند تا کسب و کار بازخورد بگیرد.",
      provider: {
        "@type": "Organization",
        name: "آنتایم",
        url: "https://ontimeapp.ir",
      },
      potentialAction: [
        {
          "@type": "ReserveAction", // برای ثبت نوبت
          name: "ثبت نوبت جدید توسط مشتری",
          description: "مشتری از طریق صفحه اختصاصی، نوبت جدید ثبت می‌کند",
          target: {
            "@type": "EntryPoint",
            urlTemplate: "https://ontimeapp.ir/s/{business-id}/book",
          },
        },
        {
          "@type": "ModifyAction", // برای تغییر نوبت
          name: "تغییر نوبت توسط مشتری",
          description: "مشتری نوبت خود را به زمان دیگری تغییر می‌دهد",
          target: {
            "@type": "EntryPoint",
            urlTemplate: "https://ontimeapp.ir/s/{business-id}/reschedule/{appointment-id}",
          },
        },
        {
          "@type": "CancelAction", // برای لغو نوبت
          name: "لغو نوبت توسط مشتری با ثبت دلیل",
          description: "مشتری نوبت خود را لغو می‌کند و دلیل آن را از لیست انتخاب می‌کند",
          target: {
            "@type": "EntryPoint",
            urlTemplate: "https://ontimeapp.ir/s/{business-id}/cancel/{appointment-id}",
          },
        },
      ],
      termsOfService: "https://ontimeapp.ir/terms",
      audience: {
        "@type": "BusinessAudience",
        businessType: "خدمات نوبت‌محور (آرایشگاه، پزشکی، مشاوره، ورزشی، آموزشگاهی)",
      },
    },
  },
];
