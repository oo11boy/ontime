"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  BookOpen, 
  Edit2, 
  Trash2, 
  X, 
  Loader2, 
  FileText, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  Search,
  BarChart3,
  Link2
} from "lucide-react";
import TiptapEditor from "./components/TiptapEditor";
import toast from "react-hot-toast";

type BlogPost = {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  author: string;
  category: string;
  reading_time: number;
  created_at?: string;
  views?: number;
  likes?: number;
};

type CategorizedTopics = {
  [category: string]: string[];
};

type Stats = {
  total: number;
  used: number;
  remaining: number;
  usedPercent: number;
};

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [categorizedTopics, setCategorizedTopics] = useState<CategorizedTopics>({});
  const [stats, setStats] = useState<Stats>({ total: 0, used: 0, remaining: 0, usedPercent: 0 });
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [categoryInput, setCategoryInput] = useState("مدیریت کسب‌وکار");
  const [topicSearchTerm, setTopicSearchTerm] = useState("");

  // فرم فیلدها
  const [titleInput, setTitleInput] = useState("");
  const [slugInput, setSlugInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [contentInput, setContentInput] = useState("");
  const [authorInput, setAuthorInput] = useState("آنتایم");
  const [readingTimeInput, setReadingTimeInput] = useState("5");

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blog");
      const data = await res.json();
      if (res.ok) setPosts(data.posts || []);
      else toast.error(data.message || "خطا در دریافت مقالات");
    } catch (err) {
      console.error(err);
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async () => {
    try {
      const res = await fetch("/api/admin/blog/generate");
      const data = await res.json();
      if (data.success) {
        setCategorizedTopics(data.categorizedTopics || {});
        setStats(data.stats || { total: 0, used: 0, remaining: 0, usedPercent: 0 });
        setExpandedCategories(new Set(Object.keys(data.categorizedTopics || {})));
      }
    } catch (err) {
      console.error("Error fetching topics:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchTopics();
  }, []);

  const handleOpenModal = (post: BlogPost | null = null) => {
    if (post) {
      setCurrentPost(post);
      setTitleInput(post.title);
      setSlugInput(post.slug);
      setDescriptionInput(post.description || "");
      setContentInput(post.content);
      setAuthorInput(post.author || "آنتایم");
      setCategoryInput(post.category || "مقاله آموزشی");
      setReadingTimeInput(post.reading_time?.toString() || "5");
    } else {
      setCurrentPost(null);
      setTitleInput("");
      setSlugInput("");
      setDescriptionInput("");
      setContentInput("");
      setAuthorInput("آنتایم");
      setCategoryInput("مقاله آموزشی");
      setReadingTimeInput("5");
    }
    setIsModalOpen(true);
  };

  const handleSavePost = async () => {
    if (!titleInput.trim() || !slugInput.trim() || !contentInput.trim()) {
      toast.error("عنوان، نامک و محتوا الزامی هستند");
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
        toast.success(currentPost ? "مقاله با موفقیت ویرایش شد" : "مقاله با موفقیت منتشر شد");
        fetchPosts();
        setIsModalOpen(false);
      } else {
        toast.error(result.message || "خطا در ذخیره مقاله");
      }
    } catch (err) {
      toast.error("خطا در ارتباط با سرور");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("مطمئنید که می‌خواهید این مقاله را حذف کنید؟")) return;

    try {
      const res = await fetch(`/api/admin/blog?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("مقاله حذف شد");
        fetchPosts();
        fetchTopics(); // به‌روزرسانی آمار موضوعات
      } else {
        toast.error("خطا در حذف مقاله");
      }
    } catch (err) {
      toast.error("خطا در ارتباط با سرور");
    }
  };

  const generateAIArticle = async (topic: string) => {
    setIsGenerating(true);
    setShowTopicModal(false);
    setGenerationProgress(0);
    
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) return prev;
        return prev + 10;
      });
    }, 500);
    
    try {
      const res = await fetch("/api/admin/blog/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, category: categoryInput }),
      });
      
      clearInterval(interval);
      setGenerationProgress(100);
      
      const data = await res.json();
      
      if (data.success) {
        toast.success("مقاله با هوش مصنوعی تولید و منتشر شد!");
        fetchPosts();
        fetchTopics(); // به‌روزرسانی آمار موضوعات
        setTimeout(() => {
          setGenerationProgress(0);
        }, 1000);
      } else {
        toast.error(data.message || "خطا در تولید مقاله");
        setGenerationProgress(0);
      }
    } catch (error) {
      clearInterval(interval);
      console.error(error);
      toast.error("خطا در ارتباط با سرور");
      setGenerationProgress(0);
    } finally {
      setTimeout(() => {
        setIsGenerating(false);
      }, 500);
      setSelectedTopic("");
      setCustomTopic("");
      setTopicSearchTerm("");
    }
  };

  const handleGenerateClick = () => {
    if (stats.remaining === 0) {
      toast.error("تمامی موضوعات استفاده شده‌اند! لطفاً موضوعات جدید اضافه کنید.");
      return;
    }
    setShowTopicModal(true);
    setSelectedTopic("");
    setCustomTopic("");
    setTopicSearchTerm("");
  };

  const handleConfirmGenerate = () => {
    const topic = selectedTopic === "custom" ? customTopic : selectedTopic;
    if (!topic) {
      toast.error("لطفاً یک موضوع انتخاب کنید یا موضوع دلخواه را وارد کنید");
      return;
    }
    generateAIArticle(topic);
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const filterTopics = (topics: string[]): string[] => {
    if (!topicSearchTerm) return topics;
    return topics.filter(topic => 
      topic.toLowerCase().includes(topicSearchTerm.toLowerCase())
    );
  };

  const totalTopics = Object.values(categorizedTopics).reduce(
    (sum, topics) => sum + topics.length, 0
  );

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500">
      {/* هدر صفحه */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="text-emerald-400 w-7 h-7" />
            مدیریت وبلاگ
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            نوشتن و ویرایش مقالات با ادیتور حرفه‌ای و ساده
          </p>
        </div>
        <div className="flex gap-3">
          {/* دکمه تولید با هوش مصنوعی */}
          <button
            onClick={handleGenerateClick}
            disabled={isGenerating || stats.remaining === 0}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            تولید با هوش مصنوعی
            {stats.remaining > 0 && (
              <span className="text-xs bg-purple-400/30 px-2 py-0.5 rounded-full">
                {stats.remaining} موضوع باقی‌مانده
              </span>
            )}
          </button>
          
          {/* دکمه مقاله جدید */}
          <button
            onClick={() => handleOpenModal()}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition-all shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-5 h-5" />
            مقاله جدید
          </button>
        </div>
      </div>

      {/* کارت آمار موضوعات */}
      {stats.total > 0 && (
        <div className="bg-gradient-to-r from-purple-600/10 to-emerald-600/10 rounded-2xl p-4 mb-6 border border-purple-500/20">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              <span className="text-white text-sm">موضوعات هوش مصنوعی:</span>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-xs text-gray-400">کل موضوعات</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-400">{stats.used}</p>
                <p className="text-xs text-gray-400">تولید شده</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-400">{stats.remaining}</p>
                <p className="text-xs text-gray-400">باقی‌مانده</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">{stats.usedPercent}%</p>
                <p className="text-xs text-gray-400">پیشرفت</p>
              </div>
            </div>
            <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500 rounded-full"
                style={{ width: `${stats.usedPercent}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* نمایش درصد پیشرفت در حین تولید */}
      {isGenerating && generationProgress > 0 && (
        <div className="fixed bottom-6 right-6 z-[70] bg-[#242933] border border-purple-500/30 rounded-xl p-4 shadow-2xl min-w-[250px]">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
              <span className="text-white text-sm font-medium">در حال تولید مقاله</span>
            </div>
            <span className="text-purple-400 text-sm font-bold">{generationProgress}%</span>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-500 transition-all duration-300 rounded-full"
              style={{ width: `${generationProgress}%` }}
            />
          </div>
          <p className="text-gray-500 text-xs mt-2">لطفاً چند لحظه صبر کنید...</p>
        </div>
      )}

      {/* مودال انتخاب موضوع برای تولید با AI */}
      {showTopicModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#242933] border border-purple-500/30 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-purple-500/20 flex justify-between items-center sticky top-0 bg-[#242933] rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  تولید مقاله با هوش مصنوعی
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  {stats.remaining} موضوع باقی‌مانده از {stats.total} موضوع
                </p>
              </div>
              <button
                onClick={() => setShowTopicModal(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              {/* جستجو */}
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={topicSearchTerm}
                  onChange={(e) => setTopicSearchTerm(e.target.value)}
                  placeholder="جستجوی موضوع..."
                  className="w-full bg-[#1a1e26] border border-purple-500/20 rounded-xl p-3 pr-10 text-white outline-none focus:border-purple-400"
                />
              </div>

              {/* دسته‌بندی موضوعات */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  موضوع مقاله را انتخاب کنید
                </label>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {Object.entries(categorizedTopics).map(([category, topics]) => {
                    const filteredTopics = filterTopics(topics);
                    if (filteredTopics.length === 0) return null;
                    
                    return (
                      <div key={category} className="border border-gray-700/50 rounded-xl overflow-hidden">
                        <button
                          onClick={() => toggleCategory(category)}
                          className="w-full flex items-center justify-between p-3 bg-[#1a1e26] hover:bg-[#1f242d] transition"
                        >
                          <span className="font-bold text-emerald-400">{category}</span>
                          <span className="text-gray-500 text-xs ml-2">
                            {filteredTopics.length} موضوع
                            {expandedCategories.has(category) ? <ChevronUp className="w-4 h-4 inline mr-1" /> : <ChevronDown className="w-4 h-4 inline mr-1" />}
                          </span>
                        </button>
                        {expandedCategories.has(category) && (
                          <div className="p-2 space-y-1">
                            {filteredTopics.map((topic, idx) => (
                              <label
                                key={idx}
                                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                                  selectedTopic === topic
                                    ? "bg-purple-500/20 border border-purple-500/50"
                                    : "hover:bg-[#1a1e26]"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="topic"
                                  value={topic}
                                  checked={selectedTopic === topic}
                                  onChange={(e) => setSelectedTopic(e.target.value)}
                                  className="w-4 h-4 text-purple-500 focus:ring-purple-500"
                                />
                                <span className="text-white text-sm">{topic}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                      selectedTopic === "custom"
                        ? "bg-purple-500/20 border border-purple-500/50"
                        : "bg-[#1a1e26] hover:bg-[#1f242d] border border-transparent"
                    }`}
                  >
                    <input
                      type="radio"
                      name="topic"
                      value="custom"
                      checked={selectedTopic === "custom"}
                      onChange={(e) => setSelectedTopic(e.target.value)}
                      className="w-4 h-4 text-purple-500 focus:ring-purple-500"
                    />
                    <span className="text-white text-sm">موضوع دلخواه (تکراری)</span>
                  </label>
                </div>
              </div>
              
              {selectedTopic === "custom" && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    موضوع دلخواه خود را وارد کنید
                  </label>
                  <input
                    type="text"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder="مثلاً: مزایای استفاده از پیامک خودکار برای کسب‌وکارها"
                    className="w-full bg-[#1a1e26] border border-purple-500/20 rounded-xl p-3 text-white outline-none focus:border-purple-400"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  دسته‌بندی مقاله
                </label>
                <input
                  type="text"
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  placeholder="دسته‌بندی"
                  className="w-full bg-[#1a1e26] border border-purple-500/20 rounded-xl p-3 text-white outline-none focus:border-purple-400"
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-purple-500/20 flex gap-3 sticky bottom-0 bg-[#242933] rounded-b-2xl">
              <button
                onClick={() => setShowTopicModal(false)}
                className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-700 transition"
              >
                انصراف
              </button>
              <button
                onClick={handleConfirmGenerate}
                disabled={isGenerating}
                className="flex-1 py-3 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    تولید مقاله
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* لیست مقالات */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="mb-4">هنوز مقاله‌ای منتشر نشده</p>
          <button
            onClick={handleGenerateClick}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 mx-auto"
          >
            <Sparkles className="w-4 h-4" />
            اولین مقاله را با هوش مصنوعی بسازید
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-[#242933] border border-emerald-500/10 rounded-2xl p-5 flex justify-between items-center hover:border-emerald-500/40 transition-all"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white">{post.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Slug: {post.slug} | {post.category} | {post.reading_time} دقیقه
                    {post.author === "آنتایم" && (
                      <span className="inline-flex items-center gap-1 mr-2 text-purple-400">
                        <Sparkles className="w-3 h-3" />
                        تولید AI
                      </span>
                    )}
                    {post.content.includes('related-links-box') && (
                      <span className="inline-flex items-center gap-1 mr-2 text-blue-400">
                        <Link2 className="w-3 h-3" />
                        دارای لینک داخلی
                      </span>
                    )}
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

      {/* مودال ویرایش/ایجاد مقاله */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#242933] border border-emerald-500/30 rounded-2xl w-full max-w-5xl shadow-2xl h-[95vh] flex flex-col">
            <div className="p-6 border-b border-emerald-500/20 flex justify-between items-center bg-[#242933] sticky top-0 z-10">
              <h2 className="text-xl font-bold text-white">
                {currentPost ? "ویرایش مقاله" : "مقاله جدید"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">نویسنده</label>
                  <input
                    value={authorInput}
                    onChange={(e) => setAuthorInput(e.target.value)}
                    className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-3 text-white outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">زمان خواندن (دقیقه)</label>
                  <input
                    type="number"
                    value={readingTimeInput}
                    onChange={(e) => setReadingTimeInput(e.target.value)}
                    className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-3 text-white outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">توضیح کوتاه (برای SEO و پیش‌نمایش)</label>
                <div className="border border-emerald-500/20 rounded-xl overflow-hidden">
                  <TiptapEditor
                    content={descriptionInput}
                    onChange={setDescriptionInput}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="block text-sm text-gray-400 font-bold">
                  محتوای اصلی مقاله
                </label>
                <div className="h-[500px] w-full border border-emerald-500/20 rounded-xl overflow-hidden">
                  <TiptapEditor
                    content={contentInput}
                    onChange={setContentInput}
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-emerald-500/20 flex gap-3 sticky bottom-0 bg-[#242933]">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-700 transition"
              >
                انصراف
              </button>
              <button
                onClick={handleSavePost}
                className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/20"
              >
                ذخیره مقاله
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}