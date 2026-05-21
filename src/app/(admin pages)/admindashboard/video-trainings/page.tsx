// src/app/(admin pages)/admindashboard/video-trainings/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, Edit2, Trash2, X, Play, Eye, Clock, Loader2, Upload, ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

interface TrainingVideo {
  id: number;
  title: string;
  subtitle: string;
  video_url: string;
  video_id: string;
  cover_image: string;
  duration: string;
  category: string;
  order_index: number;
  is_active: boolean;
  view_count: number;
  created_at: string;
}

export default function VideoTrainingsAdmin() {
  const [videos, setVideos] = useState<TrainingVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<TrainingVideo | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    video_url: "",
    category: "عمومی",
    order_index: 0,
    is_active: true,
    cover_image: "",
  });

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/video-trainings");
      const data = await res.json();
      if (data.success) {
        setVideos(data.trainings);
      }
    } catch (error) {
      toast.error("خطا در دریافت آموزش‌ها");
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImage = async (file: File) => {
    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setFormData(prev => ({ ...prev, cover_image: data.url }));
        toast.success('تصویر کاور با موفقیت آپلود شد');
      } else {
        toast.error(data.message || 'خطا در آپلود تصویر');
      }
    } catch (error) {
      toast.error('خطا در آپلود تصویر');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadImage(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = currentVideo
        ? `/api/admin/video-trainings?id=${currentVideo.id}`
        : "/api/admin/video-trainings";
      const method = currentVideo ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(currentVideo ? "آموزش ویرایش شد" : "آموزش اضافه شد");
        fetchVideos();
        setIsModalOpen(false);
        resetForm();
      } else {
        toast.error(data.message || "خطا در ذخیره");
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("آیا مطمئن هستید؟")) return;

    try {
      const res = await fetch(`/api/admin/video-trainings?id=${id}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        toast.success("آموزش حذف شد");
        fetchVideos();
      } else {
        toast.error(data.message || "خطا در حذف");
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      video_url: "",
      category: "عمومی",
      order_index: 0,
      is_active: true,
      cover_image: "",
    });
    setCurrentVideo(null);
  };

  const openEditModal = (video: TrainingVideo) => {
    setCurrentVideo(video);
    setFormData({
      title: video.title,
      subtitle: video.subtitle || "",
      video_url: video.video_url,
      category: video.category,
      order_index: video.order_index,
      is_active: video.is_active,
      cover_image: video.cover_image || "",
    });
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Play className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-400" />
            مدیریت آموزش‌های ویدیویی
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">افزودن، ویرایش و حذف ویدیوهای آموزشی</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 sm:px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-all"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          آموزش جدید
        </button>
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-[#242933] rounded-2xl">
          <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>هیچ آموزشی وجود ندارد</p>
          <button onClick={() => setIsModalOpen(true)} className="mt-4 text-emerald-400 hover:underline">
            اولین آموزش را اضافه کنید
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {videos.map((video) => (
            <div key={video.id} className="bg-[#242933] border border-emerald-500/20 rounded-2xl overflow-hidden hover:border-emerald-500/40 transition-all">
              <div className="relative aspect-video bg-black">
                {video.cover_image ? (
                  <img src={video.cover_image} alt={video.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="w-12 h-12 text-white/30" />
                  </div>
                )}
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {video.view_count.toLocaleString("fa-IR")}
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
                    {video.category}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => openEditModal(video)} className="p-1.5 text-gray-400 hover:text-emerald-400 transition">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(video.id)} className="p-1.5 text-gray-400 hover:text-red-400 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="font-bold text-white mb-1 line-clamp-1 text-sm sm:text-base">{video.title}</h3>
                {video.subtitle && <p className="text-gray-400 text-xs sm:text-sm line-clamp-2">{video.subtitle}</p>}
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-emerald-500/10 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{video.duration || "نامشخص"}</span>
                  <span>ترتیب: {video.order_index}</span>
                  <span className={video.is_active ? "text-emerald-400" : "text-red-400"}>{video.is_active ? "فعال" : "غیرفعال"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#242933] border border-emerald-500/30 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-emerald-500/20 flex justify-between items-center sticky top-0 bg-[#242933]">
              <h2 className="text-lg sm:text-xl font-bold text-white">{currentVideo ? "ویرایش آموزش" : "آموزش جدید"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition">
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">عنوان آموزش *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-3 text-white outline-none focus:border-emerald-400 text-sm sm:text-base" required />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">زیر عنوان</label>
                <input type="text" value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-3 text-white outline-none focus:border-emerald-400 text-sm sm:text-base" />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">لینک ویدیو آپارات *</label>
                <input type="url" value={formData.video_url} onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="https://www.aparat.com/v/xxxxx"
                  className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-3 text-white outline-none focus:border-emerald-400 text-sm sm:text-base" required />
                <p className="text-xs text-gray-500 mt-1">مثال: https://www.aparat.com/v/abc123</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">دسته‌بندی</label>
                  <input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-3 text-white outline-none focus:border-emerald-400 text-sm sm:text-base" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">ترتیب نمایش</label>
                  <input type="number" value={formData.order_index} onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                    className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-3 text-white outline-none focus:border-emerald-400 text-sm sm:text-base" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">تصویر کاور (اختیاری)</label>
                {formData.cover_image && (
                  <div className="relative mb-3 rounded-xl overflow-hidden bg-gray-800 w-full h-32 sm:h-40">
                    <img src={formData.cover_image} alt="کاور" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, cover_image: "" }))}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <div onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed border-emerald-500/30 rounded-xl p-4 sm:p-6 text-center cursor-pointer hover:border-emerald-500/60 transition-all ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  {uploadingImage ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-500 animate-spin" />
                      <p className="text-xs sm:text-sm text-gray-400">در حال آپلود...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-500" />
                      <p className="text-xs sm:text-sm text-gray-400">برای آپلود تصویر کاور کلیک کنید</p>
                      <p className="text-[10px] sm:text-xs text-gray-500">فرمت‌های مجاز: JPEG, PNG, WEBP (حداکثر ۲ مگابایت)</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-emerald-500 rounded" />
                <span className="text-sm text-gray-400">فعال</span>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-700 transition text-sm sm:text-base">
                  انصراف
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition flex items-center justify-center gap-2 text-sm sm:text-base">
                  {isSubmitting && <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />}
                  {currentVideo ? "ویرایش" : "افزودن"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}