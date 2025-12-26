"use client";
import React, { useState, useEffect } from "react";
import { Plus, BookOpen, Edit2, Trash2, X, Loader2, FileText } from "lucide-react";
import TiptapEditor from "./components/TiptapEditor";

type BlogPost = {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  author: string;
  category: string;
  reading_time: number;
};

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);

  // فرم فیلدها
  const [titleInput, setTitleInput] = useState("");
  const [slugInput, setSlugInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [contentInput, setContentInput] = useState("");
  const [authorInput, setAuthorInput] = useState("تیم آنتایم");
  const [categoryInput, setCategoryInput] = useState("مقاله آموزشی");
  const [readingTimeInput, setReadingTimeInput] = useState("5");

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blog");
      const data = await res.json();
      if (res.ok) setPosts(data.posts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleOpenModal = (post: BlogPost | null = null) => {
    if (post) {
      setCurrentPost(post);
      setTitleInput(post.title);
      setSlugInput(post.slug);
      setDescriptionInput(post.description);
      setContentInput(post.content);
      setAuthorInput(post.author || "تیم آنتایم");
      setCategoryInput(post.category || "مقاله آموزشی");
      setReadingTimeInput(post.reading_time?.toString() || "5");
    } else {
      setCurrentPost(null);
      setTitleInput("");
      setSlugInput("");
      setDescriptionInput("");
      setContentInput("");
      setAuthorInput("تیم آنتایم");
      setCategoryInput("مقاله آموزشی");
      setReadingTimeInput("5");
    }
    setIsModalOpen(true);
  };

  const handleSavePost = async () => {
    if (!titleInput.trim() || !slugInput.trim() || !contentInput.trim()) {
      alert("عنوان، نامک و محتوا الزامی هستند");
      return;
    }

    const payload = {
      title: titleInput,
      slug: slugInput,
      description: descriptionInput,
      content: contentInput,
      author: authorInput,
      category: categoryInput,
      reading_time: parseInt(readingTimeInput) || 5,
    };

    try {
      const url = currentPost ? `/api/admin/blog?id=${currentPost.id}` : "/api/admin/blog";
      const res = await fetch(url, {
        method: currentPost ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        fetchPosts();
        setIsModalOpen(false);
      } else {
        alert(result.message || "خطا در ذخیره مقاله");
      }
    } catch (err) {
      alert("خطا در ارتباط با سرور");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("مطمئنید که می‌خواهید این مقاله را حذف کنید؟")) return;

    try {
      const res = await fetch(`/api/admin/blog?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchPosts();
      } else {
        alert("خطا در حذف مقاله");
      }
    } catch (err) {
      alert("خطا در ارتباط");
    }
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500">
      {/* هدر صفحه */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="text-emerald-400 w-7 h-7" />
            مدیریت وبلاگ
          </h1>
          <p className="text-gray-400 text-sm mt-1">نوشتن و ویرایش مقالات با ادیتور حرفه‌ای و ساده</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-5 h-5" />
          مقاله جدید
        </button>
      </div>

      {/* لیست مقالات */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>هنوز مقاله‌ای منتشر نشده</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-[#242933] border border-emerald-500/10 rounded-2xl p-5 flex justify-between items-center hover:border-emerald-500/40 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white">{post.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Slug: {post.slug} | {post.category} | {post.reading_time} دقیقه
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenModal(post)}
                  className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    
{/* مودال ویرایش/ایجاد مقاله - نسخه نهایی با toolbar واقعاً sticky */}
{isModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
    <div className="bg-[#242933] border border-emerald-500/30 rounded-2xl w-full max-w-5xl shadow-2xl h-[95vh] flex flex-col">
      {/* هدر مودال - sticky بالا */}
      <div className="p-6 border-b border-emerald-500/20 flex justify-between items-center bg-[#242933] z-50 shadow-md">
        <h2 className="text-xl font-bold text-white">
          {currentPost ? "ویرایش مقاله" : "مقاله جدید"}
        </h2>
        <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* محتوای اصلی - بدون overflow کل، فقط اسکرول داخلی ادیتورها */}
      <div className="p-6 space-y-8 flex-1 overflow-y-auto">
        {/* عنوان و slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">عنوان مقاله</label>
            <input
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-3 text-white outline-none focus:border-emerald-400"
              placeholder="عنوان جذاب مقاله..."
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">نامک (Slug)</label>
            <input
              dir="ltr"
              value={slugInput}
              onChange={(e) => setSlugInput(e.target.value)}
              className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-3 text-white outline-none focus:border-emerald-400 text-left"
              placeholder="my-awesome-post"
            />
          </div>
        </div>

        {/* نویسنده، دسته‌بندی، زمان خواندن */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">نویسنده</label>
            <input value={authorInput} onChange={(e) => setAuthorInput(e.target.value)} className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-3 text-white outline-none focus:border-emerald-400" placeholder="تیم آنتایم" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">دسته‌بندی</label>
            <input value={categoryInput} onChange={(e) => setCategoryInput(e.target.value)} className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-3 text-white outline-none focus:border-emerald-400" placeholder="مقاله آموزشی" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">زمان خواندن (دقیقه)</label>
            <input type="number" value={readingTimeInput} onChange={(e) => setReadingTimeInput(e.target.value)} className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-3 text-white outline-none focus:border-emerald-400" />
          </div>
        </div>

        {/* توضیح کوتاه */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">توضیح کوتاه (برای SEO و پیش‌نمایش)</label>
          <div className="max-h-64 overflow-y-auto border border-emerald-500/20 rounded-xl">
            <TiptapEditor content={descriptionInput} onChange={setDescriptionInput} />
          </div>
        </div>

        {/* محتوای اصلی - ارتفاع بیشتر و اسکرول داخلی */}
 {/* محتوای اصلی مقاله - با ارتفاع کنترل شده */}
<div className="flex flex-col gap-2">
  <label className="block text-sm text-gray-400 font-bold">
    محتوای اصلی مقاله
  </label>
  <div className="h-[500px] w-full border border-emerald-500/20 rounded-xl overflow-hidden">
    <TiptapEditor content={contentInput} onChange={setContentInput} />
  </div>
</div>
      </div>

      {/* دکمه‌های پایین - sticky پایین */}
      <div className="p-6 border-t border-emerald-500/20 flex gap-3 sticky bottom-0 bg-[#242933] z-50 shadow-lg">
        <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-700 transition">
          انصراف
        </button>
        <button onClick={handleSavePost} className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition">
          ذخیره مقاله
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}