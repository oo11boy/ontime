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
];
