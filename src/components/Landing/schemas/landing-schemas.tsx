// src/components/Landing/schemas/mainPageSchemas.ts

export const landingPageSchemas = [
  // ۱. HeroSection - WebApplication
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
        description: "۲ ماه اشتراک رایگان برای شروع مدیریت هوشمند نوبت‌ها",
      },
    },
  },

  // ۲. DetailedSMS - Service (اتوماسیون پیامکی)
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
            itemOffered: {
              "@type": "Service",
              name: "کاهش ۸۰ درصدی کنسلی نوبت",
              description: "ارسال لینک هوشمند برای تغییر نوبت توسط مشتری.",
            },
          },
          {
            "@type": "Offer",
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

  // ۳. AnalyticsSection - Service (تحلیل و آنالیز)
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

  // ۴. CalculatorEnhanced - WebApplication (ماشین‌حساب ROI)
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
      },
    },
  },

  // ۵. FeaturesSection (FeaturesGrid) - ItemList (لیست امکانات کلیدی)
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
          description:
            "سیستم هوشمند اطلاع‌رسانی پیامکی جهت کاهش نرخ کنسلی نوبت‌ها.",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "پنل مشتری تحت وب (PWA)",
          description:
            "دسترسی سریع مشتری به جزییات نوبت بدون نیاز به نصب اپلیکیشن.",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "تقویم آنلاین نوبت‌دهی شمسی",
          description: "مدیریت بصری زمان‌های کاری و جلوگیری از تداخل رزروها.",
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "بانک اطلاعاتی و پرونده مشتریان",
          description: "تشکیل پروفایل خودکار و ذخیره تاریخچه مراجعات هر مشتری.",
        },
        {
          "@type": "ListItem",
          position: 5,
          name: "مدیریت لیست سیاه و کنسلی‌ها",
          description: "شناسایی هوشمند مشتریان بدقول بر اساس سوابق قبلی.",
        },
        {
          "@type": "ListItem",
          position: 6,
          name: "مدیریت چندین پرسنل و لاین کاری",
          description:
            "تفکیک تقویم‌های کاری برای مراکز بزرگ و کلینیک‌های چند تخصصی.",
        },
      ],
    },
  },

  // ۶. FAQSection - FAQPage
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
            text: "خیر، مشتری شما هیچ نیازی به نصب برنامه ندارد. تمام تعاملات از طریق پیامک و وب‌اپلیکیشن (PWA) انجام می‌شود که روی تمام گوشی‌ها به سرعت باز می‌شود.",
          },
        },
        {
          "@type": "Question",
          name: "هزینه پیامک‌های یادآوری چگونه محاسبه می‌شود؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "شما بر اساس پلن انتخابی، ماهانه تعدادی پیامک هدیه دریافت می‌کنید و در صورت نیاز به پیامک بیشتر، می‌توانید پنل خود را با تعرفه رسمی شارژ کنید.",
          },
        },
        {
          "@type": "Question",
          name: "سیستم چگونه از کنسلی نوبت‌ها جلوگیری می‌کند؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "آنتایم با ارسال پیامک‌های یادآوری هوشمند و ارائه لینک اختصاصی جهت جابجایی نوبت توسط مشتری، از خالی ماندن تایم کاری شما جلوگیری می‌کند.",
          },
        },
        {
          "@type": "Question",
          name: "آیا امنیت داده‌ها و لیست مشتریان من تضمین شده است؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "بله، اطلاعات به صورت رمزنگاری شده در سرورهای ابری اختصاصی نگهداری می‌شود و شما مالک کامل داده‌ها هستید و امکان خروجی اکسل همیشه مهیاست.",
          },
        },
        {
          "@type": "Question",
          name: "آنتایم برای چه کسب‌وکارهایی مناسب است؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "تمام صنف‌های خدماتی از جمله سالن‌های زیبایی، کلینیک‌های پزشکی، مشاوران، آموزشگاه‌ها و تعمیرگاه‌ها می‌توانند از آنتایم استفاده کنند.",
          },
        },
      ],
    },
  },

  // ۷. FreeTrialPromo - SoftwareApplication
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
        description:
          "۶۰ روز اشتراک کاملاً رایگان به همراه ۱۵۰ پیامک هدیه ماهانه بدون نیاز به ثبت کارت بانکی.",
        availability: "https://schema.org/InStock",
        url: "https://ontimeapp.ir/clientdashboard",
      },
      featureList: [
        "۲ ماه اشتراک هدیه",
        "۱۵۰ پیامک رایگان در ماه",
        "پشتیبانی ویژه راه‌اندازی",
        "بدون هزینه نصب",
      ],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "5",
        reviewCount: "1500",
      },
    },
  },

  // ۸. FinalCTA - Product (پیشنهاد ویژه)
  {
    id: "final-cta-offer-schema",
    data: {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "پنل نوبت‌دهی هوشمند آنتایم",
      image: "https://ontimeapp.ir/icons/icon-192.png",
      description:
        "سیستم مدیریت نوبت‌دهی آنلاین با قابلیت ارسال پیامک یادآوری و مدیریت پرسنل.",
      brand: {
        "@type": "Brand",
        name: "آنتایم",
      },
      offers: {
        "@type": "Offer",
        url: "https://ontimeapp.ir/clientdashboard",
        priceCurrency: "IRR",
        price: "0",
        availability: "https://schema.org/InStock",
        description:
          "۲ ماه اشتراک رایگان به همراه ۱۵۰ پیامک هدیه ماهانه برای شروع.",
        seller: {
          "@type": "Organization",
          name: "آنتایم",
        },
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "1500",
      },
    },
  },

  // ۹. AppCoreValues - Service (ارزش‌های اصلی اپلیکیشن)
  {
    id: "app-core-values-schema",
    data: {
      "@context": "https://schema.org",
      "@type": "Service",
      serviceType: "نرم‌افزار مدیریت نوبت‌دهی و رزرو آنلاین",
      provider: {
        "@type": "Organization",
        name: "آنتایم",
      },
      areaServed: "IR",
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "مزایای هوشمند آنتایم",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "عدم نیاز به نصب اپلیکیشن",
              description:
                "استفاده از تکنولوژی PWA برای دسترسی سریع مشتریان بدون اشغال فضا.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "کنترل هوشمند کنسلی",
              description: "کاهش نرخ لغو نوبت با سیستم جابجایی هوشمند.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "پشتیبان‌گیری ابری امن",
              description:
                "ذخیره ایمن اطلاعات مشتریان در سرورهای ابری اختصاصی.",
            },
          },
        ],
      },
    },
  },

  // ۱۰. Navigation - SiteNavigationElement (منوی ناوبری سایت)
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
          name: "ماشین حساب",
          url: "https://ontimeapp.ir/#roi",
        },
        {
          "@type": "SiteNavigationElement",
          position: 4,
          name: "سوالات متداول",
          url: "https://ontimeapp.ir/#faq",
        },
        {
          "@type": "SiteNavigationElement",
          position: 5,
          name: "درباره آنتایم",
          url: "https://ontimeapp.ir/#industries",
        },
        {
          "@type": "SiteNavigationElement",
          position: 6,
          name: "مجله آنتایم",
          url: "https://ontimeapp.ir/blog",
        },
      ],
    },
  },

  // ۱۱. SpecificSolutions (RealIndustrySolutions) - ItemList (راهکارهای تخصصی برای اصناف)
  {
    id: "industry-solutions-schema",
    data: {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "راهکارهای تخصصی نوبت‌دهی آنتایم برای اصناف",
      description:
        "سامانه مدیریت نوبت و رزرو آنلاین ویژه آرایشگاه‌ها، پزشکان، وکلا و مراکز خدماتی.",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          item: {
            "@type": "Service",
            name: "آرایشگاه و سالن زیبایی",
            description:
              "مدیریت لاین‌های مختلف و کاهش کنسلی نوبت‌های خدمات زیبایی با پیامک یادآوری.",
            serviceType: "نوبت دهی آرایشگاه",
          },
        },
        {
          "@type": "ListItem",
          position: 2,
          item: {
            "@type": "Service",
            name: "پزشکان و کلینیک‌ها",
            description:
              "نظم بخشیدن به صف انتظار بیماران و ارسال خودکار اطلاعات نوبت بلافاصله پس از ثبت.",
            serviceType: "مدیریت نوبت مطب",
          },
        },
        {
          "@type": "ListItem",
          position: 3,
          item: {
            "@type": "Service",
            name: "وکلا و دفاتر مشاوره",
            description:
              "جلوگیری از تداخل جلسات و مدیریت زمان‌های خالی بدون نیاز به دفترچه کاغذی.",
            serviceType: "رزرو وقت مشاوره",
          },
        },
        {
          "@type": "ListItem",
          position: 4,
          item: {
            "@type": "Service",
            name: "کارواش و خدمات خودرو",
            description:
              "ثبت پلاک و نوع سرویس خودرو و اطلاع‌رسانی زمان حضور به مالک خودرو.",
            serviceType: "نوبت دهی کارواش",
          },
        },
        {
          "@type": "ListItem",
          position: 5,
          item: {
            "@type": "Service",
            name: "مراکز لیزر و ماساژ",
            description:
              "پیگیری مراجعات قبلی مشتری و یادآوری جلسات بعدی برای حفظ نظم مرکز.",
            serviceType: "مدیریت نوبت لیزر",
          },
        },
      ],
    },
  },

// ۱۲. StatsSection - Organization + InteractionStatistic (اثبات اجتماعی و آمار موفقیت)
{
  id: "stats-section-schema",
  data: {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "آنتایم",
    description:
      "سامانه هوشمند نوبت‌دهی آنلاین برای کسب‌وکارهای خدماتی ایران",
    url: "https://ontimeapp.ir/",
    interactionStatistic: [
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/SubscribeAction",  // مثلاً تعداد ثبت‌نام/اشتراک کاربران
        userInteractionCount: 1500,
      },
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/TradeAction",     // مثلاً تعداد تراکنش‌ها یا رزروهای موفق
        userInteractionCount: 45000,
      },
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/SendAction",      // مثلاً تعداد پیامک‌های ارسالی
        userInteractionCount: 125000,
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "1500",
      bestRating: "5",
      worstRating: "1",
    },
  },
},
];
