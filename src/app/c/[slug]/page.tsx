import { Metadata } from "next";
import { notFound } from "next/navigation";
import CustomerLinkClient from "./CustomerLinkClient";

// تابع برای گرفتن اطلاعات کسب‌وکار در سرور
async function getBusinessData(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/customer-link/${slug}`, {
      cache: "no-store",
    });
    
    
    if (!res.ok) return null;
    const data = await res.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error("Error fetching business data:", error);
    return null;
  }
}

// تابع تولید اسکیما مارکاپ
function generateSchemaMarkup(business: any, slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://ontimeapp.ir";
  const url = `${baseUrl}/c/${slug}`;
  
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.business_name,
    description: business.bio || "",
    image: business.avatar_image || business.logo || "",
    telephone: business.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.business_address,
      addressCountry: "IR",
    },
    url: url,
    sameAs: [] as string[],
    priceRange: "$$",
  };

  // اضافه کردن شبکه‌های اجتماعی
  if (business.social_media) {
    if (business.social_media.instagram) schema.sameAs.push(`https://instagram.com/${business.social_media.instagram}`);
    if (business.social_media.telegram) schema.sameAs.push(`https://t.me/${business.social_media.telegram}`);
    if (business.social_media.whatsapp) schema.sameAs.push(`https://wa.me/${business.social_media.whatsapp}`);
    if (business.social_media.rubika) schema.sameAs.push(`https://rubika.ir/${business.social_media.rubika}`);
    if (business.social_media.eitaa) schema.sameAs.push(`https://eitaa.com/${business.social_media.eitaa}`);
    if (business.social_media.bale) schema.sameAs.push(`https://bale.ai/${business.social_media.bale}`);
    if (business.social_media.soroush) schema.sameAs.push(`https://soroush.ai/${business.social_media.soroush}`);
  }

  // اضافه کردن ساعات کاری
  if (business.work_shifts && business.work_shifts.length > 0) {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    schema.openingHoursSpecification = business.work_shifts.map((shift: any) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: days,
      opens: shift.start,
      closes: shift.end,
    }));
  }

  // اضافه کردن خدمات
  if (business.services && business.services.length > 0) {
    schema.makesOffer = business.services.map((service: any) => ({
      "@type": "Offer",
      name: service.name,
      price: service.price,
      priceCurrency: "IRR",
      availability: "https://schema.org/InStock",
    }));
  }

  return JSON.stringify(schema);
}

// ==================== متادیتا برای SEO ====================
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const business = await getBusinessData(slug);

  if (!business) {
    return {
      title: "صفحه یافت نشد",
      description: "متاسفیم، صفحه مورد نظر یافت نشد.",
      robots: { index: false },
    };
  }

  const title = business.business_name || "صفحه اختصاصی";
  const description = business.bio || `${title} - مشاهده خدمات، ساعات کاری و اطلاعات تماس`;
  const imageUrl = business.avatar_image || business.logo || "/default-og-image.jpg";
  const url = `${process.env.NEXT_PUBLIC_BASE_URL || "https://ontimeapp.ir"}/c/${slug}`;

  return {
    title: title,
    description: description,
    keywords: `${title}, نوبت دهی آنلاین, رزرو نوبت, خدمات, آرایشگاه, سالن زیبایی`,
    authors: [{ name: business.business_name }],
    openGraph: {
      title: title,
      description: description,
      url: url,
      siteName: "آنتایم",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "fa_IR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: [imageUrl],
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": 150,
      },
    },
  };
}

// ==================== صفحه اصلی ====================
export default async function CustomerLinkPublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const business = await getBusinessData(slug);

  if (!business) {
    notFound();
  }

  const schemaMarkup = generateSchemaMarkup(business, slug);

  return (
    <>
      {/* Schema.org markup for SEO - رندر شده در سمت سرور */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: schemaMarkup }}
      />
      <CustomerLinkClient 
        initialBusiness={business} 
        slug={slug}
      />
    </>
  );
}