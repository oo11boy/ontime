// src/app/(admin pages)/admindashboard/announcements/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  X,
  RefreshCw,
  Bell,
  Info,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Users,
  Lock,
  Unlock,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface Announcement {
  id: number;
  title: string;
  content: string;
  type: "info" | "warning" | "success" | "error" | "update";
  priority: "low" | "normal" | "high" | "urgent";
  target_users: "all" | "owners_only" | "staff_only";
  is_active: boolean;
  is_dismissible: boolean;
  view_count: number;
  click_count: number;
  view_count_total: number;
  action_link: string | null;
  created_at: string;
}

const typeConfig = {
  info: { icon: Info, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-500/30" },
  warning: { icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-500/30" },
  success: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-500/30" },
  error: { icon: AlertCircle, color: "text-red-400", bg: "bg-red-400/10", border: "border-red-500/30" },
  update: { icon: Bell, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-500/30" },
};

const priorityConfig = {
  low: { label: "عادی", color: "text-gray-400", bg: "bg-gray-400/10" },
  normal: { label: "متوسط", color: "text-blue-400", bg: "bg-blue-400/10" },
  high: { label: "بالا", color: "text-orange-400", bg: "bg-orange-400/10" },
  urgent: { label: "فوری", color: "text-red-400", bg: "bg-red-400/10" },
};

const targetConfig = {
  all: { label: "همه کاربران", icon: Users },
  owners_only: { label: "فقط صاحبان کسب‌وکار", icon: Users },
  staff_only: { label: "فقط پرسنل", icon: Users },
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "info" as Announcement["type"],
    priority: "normal" as Announcement["priority"],
    target_users: "all" as Announcement["target_users"],
    is_active: true,
    is_dismissible: true,
    action_link: "",
  });

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/announcements");
      const data = await res.json();
      if (data.success) {
        setAnnouncements(data.announcements);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("خطا در دریافت اطلاعیه‌ها");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleOpenModal = (announcement: Announcement | null = null) => {
    if (announcement) {
      setCurrentAnnouncement(announcement);
      setFormData({
        title: announcement.title,
        content: announcement.content,
        type: announcement.type,
        priority: announcement.priority,
        target_users: announcement.target_users,
        is_active: announcement.is_active,
        is_dismissible: announcement.is_dismissible,
        action_link: announcement.action_link || "",
      });
    } else {
      setCurrentAnnouncement(null);
      setFormData({
        title: "",
        content: "",
        type: "info",
        priority: "normal",
        target_users: "all",
        is_active: true,
        is_dismissible: true,
        action_link: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("عنوان و متن اطلاعیه الزامی است");
      return;
    }

    try {
      const url = currentAnnouncement
        ? `/api/admin/announcements?id=${currentAnnouncement.id}`
        : "/api/admin/announcements";
      const method = currentAnnouncement ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setIsModalOpen(false);
        fetchAnnouncements();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("خطا در ذخیره اطلاعیه");
    }
  };

  const handleDelete = async () => {
    if (!currentAnnouncement) return;

    try {
      const res = await fetch(`/api/admin/announcements?id=${currentAnnouncement.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setIsDeleteModalOpen(false);
        fetchAnnouncements();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("خطا در حذف اطلاعیه");
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="text-emerald-400 w-7 h-7" />
            اطلاعیه‌های سیستمی
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            مدیریت اطلاعیه‌های سراسری - اطلاعیه‌ها تا زمان حذف فعال می‌مانند
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          اطلاعیه جدید
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-[#242933] border border-emerald-500/20 rounded-xl p-4">
          <p className="text-gray-400 text-xs mb-1">کل اطلاعیه‌ها</p>
          <p className="text-2xl font-bold text-white">{announcements.length}</p>
        </div>
        <div className="bg-[#242933] border border-emerald-500/20 rounded-xl p-4">
          <p className="text-gray-400 text-xs mb-1">کل بازدیدها</p>
          <p className="text-2xl font-bold text-white">
            {announcements.reduce((sum, a) => sum + (a.view_count_total || 0), 0).toLocaleString("fa-IR")}
          </p>
        </div>
        <div className="bg-[#242933] border border-emerald-500/20 rounded-xl p-4">
          <p className="text-gray-400 text-xs mb-1">اطلاعیه‌های فعال</p>
          <p className="text-2xl font-bold text-white">
            {announcements.filter(a => a.is_active).length}
          </p>
        </div>
        <div className="bg-[#242933] border border-emerald-500/20 rounded-xl p-4">
          <p className="text-gray-400 text-xs mb-1">فوری‌ها</p>
          <p className="text-2xl font-bold text-white">
            {announcements.filter(a => a.priority === "urgent" && a.is_active).length}
          </p>
        </div>
        <div className="bg-[#242933] border border-emerald-500/20 rounded-xl p-4">
          <p className="text-gray-400 text-xs mb-1">غیرقابل بستن</p>
          <p className="text-2xl font-bold text-white">
            {announcements.filter(a => !a.is_dismissible && a.is_active).length}
          </p>
        </div>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <RefreshCw className="w-10 h-10 animate-spin text-emerald-400" />
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-[#242933]/50 rounded-2xl border border-dashed border-gray-700">
          <Bell className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p>هیچ اطلاعیه‌ای ثبت نشده است</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => {
            const Icon = typeConfig[announcement.type].icon;
            const priorityInfo = priorityConfig[announcement.priority];
            const targetInfo = targetConfig[announcement.target_users];
            
            return (
              <div
                key={announcement.id}
                className={`bg-[#242933] border rounded-2xl p-5 transition-all hover:border-emerald-500/40 ${typeConfig[announcement.type].border}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-xl ${typeConfig[announcement.type].bg} ${typeConfig[announcement.type].color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-bold text-white text-lg">{announcement.title}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${priorityInfo.bg} ${priorityInfo.color}`}>
                          {priorityInfo.label}
                        </span>
                        <span className="text-[10px] bg-white/5 text-gray-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <targetInfo.icon className="w-3 h-3" />
                          {targetInfo.label}
                        </span>
                        {!announcement.is_dismissible && (
                          <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            غیرقابل بستن
                          </span>
                        )}
                        {announcement.is_dismissible && (
                          <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Unlock className="w-3 h-3" />
                            قابل بستن
                          </span>
                        )}
                        {!announcement.is_active && (
                          <span className="text-[10px] bg-gray-500/20 text-gray-400 px-2 py-0.5 rounded-full">
                            غیرفعال
                          </span>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm mb-3">{announcement.content}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          بازدید: {(announcement.view_count_total || 0).toLocaleString("fa-IR")}
                        </span>
                        {announcement.action_link && (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <ExternalLink className="w-3.5 h-3.5" />
                            دارای لینک
                          </span>
                        )}
                        <span className="text-gray-600">
                          ایجاد: {new Date(announcement.created_at).toLocaleDateString("fa-IR")}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleOpenModal(announcement)}
                      className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setCurrentAnnouncement(announcement);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#242933] border border-emerald-500/30 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-emerald-500/20 flex justify-between items-center sticky top-0 bg-[#242933]">
              <h2 className="text-xl font-bold text-white">
                {currentAnnouncement ? "ویرایش اطلاعیه" : "اطلاعیه جدید"}
              </h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-6 h-6 text-gray-400 hover:text-white" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">عنوان اطلاعیه *</label>
                <input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="مثال: بروزرسانی جدید اپلیکیشن"
                  className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-3 text-white focus:border-emerald-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">متن اطلاعیه *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="متن اطلاعیه را وارد کنید..."
                  rows={4}
                  className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-3 text-white focus:border-emerald-400 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">نوع اطلاعیه</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-3 text-white focus:border-emerald-400 outline-none"
                  >
                    <option value="info">اطلاع‌رسانی</option>
                    <option value="success">موفقیت</option>
                    <option value="warning">هشدار</option>
                    <option value="error">خطا</option>
                    <option value="update">بروزرسانی</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">اولویت</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-3 text-white focus:border-emerald-400 outline-none"
                  >
                    <option value="low">عادی</option>
                    <option value="normal">متوسط</option>
                    <option value="high">بالا</option>
                    <option value="urgent">فوری</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">مخاطبان</label>
                  <select
                    value={formData.target_users}
                    onChange={(e) => setFormData({ ...formData, target_users: e.target.value as any })}
                    className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-3 text-white focus:border-emerald-400 outline-none"
                  >
                    <option value="all">همه کاربران</option>
                    <option value="owners_only">فقط صاحبان کسب‌وکار</option>
                    <option value="staff_only">فقط پرسنل</option>
                  </select>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 rounded border-emerald-500/30 bg-[#1a1e26] checked:bg-emerald-500"
                    />
                    <span className="text-sm text-gray-400">فعال</span>
                  </label>
                </div>
              </div>

              {/* گزینه قابل بستن توسط کاربر */}
              <div className="bg-[#1a1e26] rounded-xl p-4 border border-emerald-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_dismissible}
                        onChange={(e) => setFormData({ ...formData, is_dismissible: e.target.checked })}
                        className="w-4 h-4 rounded border-emerald-500/30 bg-[#1a1e26] checked:bg-emerald-500"
                      />
                      <span className="text-sm font-medium text-white">قابل بستن توسط کاربر</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.is_dismissible 
                        ? "کاربر می‌تواند این اطلاعیه را ببندد و دیگر آن را نبیند"
                        : "کاربر نمی‌تواند این اطلاعیه را ببندد و همیشه آن را مشاهده می‌کند"}
                    </p>
                  </div>
                  <div className="text-2xl">
                    {formData.is_dismissible ? "🔓" : "🔒"}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">لینک اقدام (اختیاری)</label>
                <input
                  value={formData.action_link}
                  onChange={(e) => setFormData({ ...formData, action_link: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-3 text-white focus:border-emerald-400 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">کاربران با کلیک روی لینک به صفحه مورد نظر هدایت می‌شوند</p>
              </div>
            </div>

            <div className="p-6 border-t border-emerald-500/20 flex gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-700 transition"
              >
                انصراف
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold hover:from-emerald-600 hover:to-emerald-700 shadow-lg"
              >
                {currentAnnouncement ? "ذخیره تغییرات" : "ایجاد اطلاعیه"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#242933] border border-red-500/30 rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">حذف اطلاعیه</h3>
            <p className="text-gray-400 text-sm mb-6">
              آیا از حذف اطلاعیه "
              <span className="text-white font-bold">{currentAnnouncement?.title}</span>
              " اطمینان دارید؟
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                لغو
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600"
              >
                بله، حذف کن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}