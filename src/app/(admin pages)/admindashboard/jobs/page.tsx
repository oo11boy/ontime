// File Path: src\app\(admin pages)\admindashboard\jobs\page.tsx

"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Briefcase,
  Layers,
  Edit2,
  Trash2,
  X,
  Loader2,
} from "lucide-react";

type JobCategory = {
  id: number;
  english_name: string;
  persian_name: string;
  businessCount: number;
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentJob, setCurrentJob] = useState<JobCategory | null>(null);
  const [jobToDelete, setJobToDelete] = useState<number | null>(null);

  const [persianNameInput, setPersianNameInput] = useState("");
  const [englishNameInput, setEnglishNameInput] = useState("");

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/jobs");
      const data = await res.json();
      if (res.ok) {
        setJobs(data.jobs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter((job) =>
    job.persian_name.includes(searchQuery) ||
    job.english_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (job: JobCategory | null = null) => {
    if (job) {
      setCurrentJob(job);
      setPersianNameInput(job.persian_name);
      setEnglishNameInput(job.english_name);
    } else {
      setCurrentJob(null);
      setPersianNameInput("");
      setEnglishNameInput("");
    }
    setIsModalOpen(true);
  };

  const handleSaveJob = async () => {
    if (!persianNameInput.trim() || !englishNameInput.trim()) {
      alert("هر دو فیلد الزامی هستند");
      return;
    }

    const payload = {
      english_name: englishNameInput.trim(),
      persian_name: persianNameInput.trim(),
    };

    try {
      const url = currentJob ? `/api/admin/jobs?id=${currentJob.id}` : "/api/admin/jobs";
      const method = currentJob ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        fetchJobs();
        setIsModalOpen(false);
      } else {
        alert(data.message || "خطا در ذخیره");
      }
    } catch (err) {
      alert("خطا در ارتباط با سرور");
    }
  };

  const confirmDelete = async () => {
    if (!jobToDelete) return;

    try {
      const res = await fetch(`/api/admin/jobs?id=${jobToDelete}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok) {
        fetchJobs();
        setIsDeleteModalOpen(false);
        setJobToDelete(null);
      } else {
        alert(data.message || "نمی‌توان شغل را حذف کرد");
      }
    } catch (err) {
      alert("خطا در حذف");
    }
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Briefcase className="text-emerald-400 w-7 h-7" />
            مدیریت دسته‌بندی مشاغل
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            تعریف و مدیریت دسته‌بندی‌های اصلی شغلی
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="جستجو شغل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#242933] border border-emerald-500/30 rounded-xl py-2.5 px-4 pr-10 text-sm focus:outline-none focus:border-emerald-400 transition text-white placeholder-gray-500"
            />
            <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">شغل جدید</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-[#242933] border border-emerald-500/20 rounded-2xl p-6 hover:border-emerald-500/50 transition-all group shadow-lg"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white group-hover:text-emerald-300 transition">
                      {job.persian_name}
                    </h3>
                    <p className="text-xs text-gray-500">{job.english_name}</p>
                    <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      {job.businessCount} کسب‌وکار فعال
                    </p>
                  </div>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => handleOpenModal(job)}
                    className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setJobToDelete(job.id);
                      setIsDeleteModalOpen(true);
                    }}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500 bg-[#242933]/50 rounded-2xl border border-dashed border-gray-700">
          شغلی یافت نشد.
        </div>
      )}

      {/* مودال اضافه/ویرایش */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#242933] border border-emerald-500/30 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-emerald-500/20 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">
                {currentJob ? "ویرایش شغل" : "شغل جدید"}
              </h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-6 h-6 text-gray-400 hover:text-white" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">عنوان فارسی</label>
                <input
                  value={persianNameInput}
                  onChange={(e) => setPersianNameInput(e.target.value)}
                  placeholder="مثال: آرایشگر مردانه"
                  className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-3 text-white focus:border-emerald-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">نام انگلیسی (یکتا)</label>
                <input
                  value={englishNameInput}
                  onChange={(e) => setEnglishNameInput(e.target.value)}
                  placeholder="مثال: barber"
                  className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-3 text-white focus:border-emerald-400 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  فقط حروف کوچک، عدد و آندرلاین مجاز است
                </p>
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
                onClick={handleSaveJob}
                className="flex-1 py-3 rounded-xl bg-linear-to-r from-emerald-500 to-emerald-600 text-white font-bold hover:from-emerald-600 hover:to-emerald-700 shadow-lg"
              >
                {currentJob ? "ذخیره تغییرات" : "ایجاد شغل"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال حذف */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#242933] border border-red-500/30 rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">حذف شغل</h3>
            <p className="text-gray-400 text-sm mb-6">
              آیا از حذف شغل "
              <span className="text-white font-bold">
                {jobs.find((j) => j.id === jobToDelete)?.persian_name}
              </span>
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
                onClick={confirmDelete}
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