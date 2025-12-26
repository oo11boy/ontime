import { query } from "@/lib/db";
import { notFound } from "next/navigation";
import Navigation from "@/components/Landing/Navigation";
import EnhancedFooter from "@/components/Landing/EnhancedFooter";
import { Clock, Eye, ChevronLeft, Home } from "lucide-react";
import BlogSidebar from "./components/BlogSidebar";
import MobileToolbar from "./components/MobileToolbar";
import DOMPurify from "isomorphic-dompurify";
import Link from "next/link";

export const revalidate = 0;

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const posts: any[] = await query(`SELECT * FROM blog_posts WHERE slug = ?`, [
    slug,
  ]);
  const post = posts[0];
  if (!post) notFound();

  const baseUrl = "https://ontimeapp.ir";
  const formattedDate = new Date(post.created_at).toISOString();
  const displayDate = new Date(post.created_at).toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const headings: { id: string; title: string; level: number }[] = [];
  const contentWithIds = post.content.replace(
    /<h([2-3])(.*?)>([\s\S]*?)<\/h[2-3]>/gi,
    (_: any, level: string, attrs: string, html: string) => {
      const title = html.replace(/<[^>]+>/g, "").trim();
      const id = title
        .toLowerCase()
        .replace(/[^\u0600-\u06FFa-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      headings.push({ id, title, level: Number(level) });
      return `<h${level} id="${id}" ${attrs}>${html}</h${level}>`;
    }
  );

  const safeContent = DOMPurify.sanitize(contentWithIds, {
    USE_PROFILES: { html: true },
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${baseUrl}/blog/${slug}#article`,
        headline: post.title,
        description: post.excerpt || post.title,
        image: post.image_url || `${baseUrl}/blog-og-image.jpg`,
        datePublished: formattedDate,
        dateModified: post.updated_at
          ? new Date(post.updated_at).toISOString()
          : formattedDate,
        author: {
          "@type": "Person",
          name: post.author || "تیم آنتایم",
          url: baseUrl,
        },
        publisher: { "@id": `${baseUrl}/#organization` },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${baseUrl}/blog/${slug}`,
        },
        hasPart: headings.map((h) => ({
          "@type": "WebPageElement",
          name: h.title,
          url: `${baseUrl}/blog/${slug}#${h.id}`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${baseUrl}/blog/${slug}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "خانه", item: baseUrl },
          {
            "@type": "ListItem",
            position: 2,
            name: "مجله آنتایم",
            item: `${baseUrl}/blog`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: post.category,
            item: `${baseUrl}/blog?category=${post.category}`,
          },
          {
            "@type": "ListItem",
            position: 4,
            name: post.title,
            item: `${baseUrl}/blog/${slug}`,
          },
        ],
      },
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        name: "آنتایم",
        url: baseUrl,
        logo: { "@type": "ImageObject", url: `${baseUrl}/icons/icon-512.png` },
      },
    ],
  };

  return (
    <div dir="rtl" className="bg-gray-50 min-h-screen font-sans text-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navigation />

      <main className="max-w-7xl mx-auto pt-24 lg:pt-32 pb-20 px-6">
        {/* Breadcrumb بصری */}
        <nav className="flex items-center gap-2 text-gray-500 text-xs mb-6 overflow-x-auto whitespace-nowrap pb-2">
          <Link
            href="/"
            className="hover:text-blue-600 flex items-center gap-1"
          >
            <Home className="w-3 h-3" /> خانه
          </Link>
          <ChevronLeft className="w-3 h-3 text-gray-300" />
          <Link href="/blog" className="hover:text-blue-600">
            مجله آنتایم
          </Link>
          <ChevronLeft className="w-3 h-3 text-gray-300" />
          <span className="text-blue-600 font-bold">{post.category}</span>
        </nav>

        <header className="lg:mb-10 bg-white border border-gray-200 rounded-3xl lg:rounded-[3.5rem] p-6 lg:p-12 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="px-4 py-1 rounded-full bg-blue-600 text-white font-bold text-[10px] uppercase">
              {post.category}
            </span>
            <div className="flex items-center gap-4 text-gray-500 text-xs font-semibold">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" /> {post.reading_time} دقیقه مطالعه
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />{" "}
                {post.views?.toLocaleString("fa-IR")} بازدید
              </span>
            </div>
          </div>
          <h1 className="text-3xl lg:text-5xl font-extrabold leading-tight mb-8 text-slate-900">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
              {post.author?.charAt(0) || "آ"}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                {post.author || "تحریریه آنتایم"}
              </p>
              <p className="text-xs text-gray-500">{displayDate}</p>
            </div>
          </div>
        </header>

        <div className="grid max-lg:mt-4 lg:grid-cols-[1fr_320px] gap-12 items-start relative">
          <article className="min-w-0 bg-white p-6 lg:p-10 rounded-3xl border border-gray-100 shadow-sm">
            <div
              className="prose prose-lg max-w-none 
                [&_p]:text-gray-700 [&_p]:leading-8 [&_p]:mb-6 [&_p]:text-[1.1rem]
                [&_a]:text-blue-600 [&_a]:font-bold hover:[&_a]:underline
                [&_ul]:list-disc [&_ul]:pr-6 [&_ol]:list-decimal [&_ol]:pr-6
                [&_h2]:text-3xl lg:[&_h2]:text-4xl [&_h2]:font-black [&_h2]:mt-12 [&_h2]:mb-6 [&_h2]:text-slate-900 [&_h2]:scroll-mt-32
                [&_h3]:text-xl lg:[&_h3]:text-2xl [&_h3]:font-bold [&_h3]:mt-10 [&_h3]:mb-4 [&_h3]:text-slate-800 [&_h3]:scroll-mt-32
                [&_blockquote]:border-r-4 [&_blockquote]:border-blue-500 [&_blockquote]:bg-blue-50/50 [&_blockquote]:p-6 [&_blockquote]:rounded-xl"
              dangerouslySetInnerHTML={{ __html: safeContent }}
            />
          </article>
          <BlogSidebar
            headings={headings}
            slug={slug}
            initialLikes={post.likes || 0}
          />
        </div>
      </main>
      <MobileToolbar
        headings={headings}
        slug={slug}
        initialLikes={post.likes || 0}
      />
      <EnhancedFooter />
    </div>
  );
}
