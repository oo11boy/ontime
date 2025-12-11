"use client";
import React, { useState } from "react";
import {
  Search,
  Plus,
  Briefcase,
  Layers,
  Edit2,
  Trash2,
  X,
  Tag,
} from "lucide-react";

// --- نوع داده شغل ---
type JobCategory = {
  id: number;
  title: string;
  businessCount: number; // تعداد کسب‌وکارهای فعال در این شغل
  services: string[]; // لیست خدمات
};

// --- داده‌های اولیه ---
const initialJobs: JobCategory[] = [
  { 
    id: 1, 
    title: "سالن زیبایی", 
    businessCount: 145, 
    services: ["کوتاهی مو", "رنگ و مش", "کاشت ناخن", "میکاپ", "پاکسازی پوست"] 
  },
  { 
    id: 2, 
    title: "کلینیک دندانپزشکی", 
    businessCount: 80, 
    services: ["ویزیت", "عصب‌کشی", "لمینت", "ارتودنسی", "جراحی لثه"] 
  },
  { 
    id: 3, 
    title: "تعمیرگاه خودرو", 
    businessCount: 65, 
    services: ["تعویض روغن", "دیاگ", "صافکاری", "نقاشی", "جلوبندی"] 
  },
  { 
    id: 4, 
    title: "مشاوره روانشناسی", 
    businessCount: 42, 
    services: ["مشاوره فردی", "زوج درمانی", "مشاوره تحصیلی"] 
  },
];

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobCategory[]>(initialJobs);
  const [searchQuery, setSearchQuery] = useState("");

  // --- استیت‌های مودال ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentJob, setCurrentJob] = useState<JobCategory | null>(null);
  const [jobToDelete, setJobToDelete] = useState<number | null>(null);

  // --- استیت‌های فرم داخلی (برای مدیریت تگ‌های خدمات) ---
  const [formData, setFormData] = useState<{ title: string; services: string[] }>({ title: "", services: [] });
  const [serviceInput, setServiceInput] = useState("");

  // --- جستجو ---
  const filteredJobs = jobs.filter(
    (job) =>
      job.title.includes(searchQuery) ||
      job.services.some((s) => s.includes(searchQuery))
  );

  // --- باز کردن مودال ---
  const handleOpenModal = (job: JobCategory | null = null) => {
    if (job) {
      setCurrentJob(job);
      setFormData({ title: job.title, services: [...job.services] });
    } else {
      setCurrentJob(null);
      setFormData({ title: "", services: [] });
    }
    setServiceInput("");
    setIsModalOpen(true);
  };

  // --- افزودن سرویس به لیست (در مودال) ---
  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (serviceInput.trim() && !formData.services.includes(serviceInput.trim())) {
      setFormData({ ...formData, services: [...formData.services, serviceInput.trim()] });
      setServiceInput("");
    }
  };

  // --- حذف سرویس از لیست (در مودال) ---
  const handleRemoveService = (serviceToRemove: string) => {
    setFormData({
      ...formData,
      services: formData.services.filter((s) => s !== serviceToRemove),
    });
  };

  // --- ذخیره نهایی شغل ---
  const handleSaveJob = () => {
    if (!formData.title) return;

    if (currentJob) {
      // ویرایش
      setJobs(jobs.map((j) => (j.id === currentJob.id ? { ...j, title: formData.title, services: formData.services } : j)));
    } else {
      // افزودن
      setJobs([...jobs, { 
        id: Date.now(), 
        title: formData.title, 
        services: formData.services, 
        businessCount: 0 // شغل جدید کسب‌وکاری ندارد
      }]);
    }
    setIsModalOpen(false);
  };

  // --- حذف شغل ---
  const confirmDelete = () => {
    if (jobToDelete) {
      setJobs(jobs.filter((j) => j.id !== jobToDelete));
      setIsDeleteModalOpen(false);
      setJobToDelete(null);
    }
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500">
      
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Briefcase className="text-emerald-400 w-7 h-7" />
            مدیریت مشاغل و خدمات
          </h1>
          <p className="text-gray-400 text-sm mt-1">دسته‌بندی‌های شغلی و تعریف خدمات مربوط به هر کدام</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="جستجو شغل یا خدمت..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#242933] border border-emerald-500/30 rounded-xl py-2.5 px-4 pr-10 text-sm focus:outline-none focus:border-emerald-400 transition"
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

      {/* --- Grid Layout for Jobs --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredJobs.map((job) => (
          <div 
            key={job.id} 
            className="bg-[#242933] border border-emerald-500/20 rounded-2xl p-6 hover:border-emerald-500/50 transition-all duration-300 group shadow-lg flex flex-col h-full"
          >
            {/* Card Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white group-hover:text-emerald-300 transition">{job.title}</h3>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    {job.businessCount} کسب‌وکار فعال
                  </p>
                </div>
              </div>
              
              {/* Actions Dropdown/Buttons */}
              <div className="flex gap-1">
                <button onClick={() => handleOpenModal(job)} className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => { setJobToDelete(job.id); setIsDeleteModalOpen(true); }} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Separator */}
            <div className="h-px bg-linear-to-r from-transparent via-emerald-500/20 to-transparent my-2"></div>

            {/* Services List (Tags) */}
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-3">خدمات قابل ارائه:</p>
              <div className="flex flex-wrap gap-2">
                {job.services.map((service, idx) => (
                  <span key={idx} className="bg-[#1a1e26] border border-gray-700 text-gray-300 text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 hover:border-emerald-500/30 hover:text-emerald-300 transition cursor-default">
                    <Tag className="w-3 h-3 opacity-50" />
                    {service}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-20 text-gray-500 bg-[#242933]/50 rounded-2xl border border-dashed border-gray-700">
          شغلی یافت نشد.
        </div>
      )}

      {/* --- ADD/EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#242933] border border-emerald-500/30 rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-emerald-500/20 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">
                {currentJob ? "ویرایش شغل" : "تعریف شغل جدید"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
              
              {/* Job Title */}
              <div className="space-y-2">
                <label className="text-sm text-gray-400">عنوان شغلی</label>
                <input 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="مثلا: سالن زیبایی"
                  className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-3 text-sm focus:border-emerald-400 outline-none transition text-white" 
                />
              </div>

              {/* Services Manager */}
              <div className="space-y-3">
                <label className="text-sm text-gray-400">لیست خدمات این شغل</label>
                
                {/* Input Area */}
                <div className="flex gap-2">
                  <input 
                    value={serviceInput}
                    onChange={(e) => setServiceInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddService(e)}
                    placeholder="نام خدمت (و اینتر بزنید)..."
                    className="flex-1 bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-3 text-sm focus:border-emerald-400 outline-none transition text-white" 
                  />
                  <button 
                    onClick={handleAddService}
                    type="button"
                    className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 p-3 rounded-xl hover:bg-emerald-500 hover:text-white transition"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {/* Tags Display Area */}
                <div className="bg-[#1a1e26]/50 border border-gray-700/50 rounded-xl p-4 min-h-[100px]">
                  {formData.services.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-4">هنوز خدمتی اضافه نشده است</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {formData.services.map((service, idx) => (
                        <div key={idx} className="bg-[#242933] text-emerald-300 text-sm px-3 py-1.5 rounded-lg flex items-center gap-2 border border-emerald-500/20 animate-in fade-in zoom-in duration-200">
                          {service}
                          <button onClick={() => handleRemoveService(service)} className="text-gray-500 hover:text-red-400 transition">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-gray-500 text-right">با زدن دکمه اینتر یا + خدمت را اضافه کنید</p>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-emerald-500/20 flex gap-3 bg-[#242933]">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-700 transition">انصراف</button>
              <button onClick={handleSaveJob} className="flex-1 py-3 rounded-xl bg-linear-to-r from-emerald-500 to-emerald-600 text-white font-bold hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/20 transition">
                {currentJob ? "ذخیره تغییرات" : "ایجاد شغل"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
           <div className="bg-[#242933] border border-red-500/30 rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl">
             <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8" />
             </div>
             <h3 className="text-xl font-bold text-white mb-2">حذف شغل</h3>
             <p className="text-gray-400 text-sm mb-6">
               آیا از حذف شغل <span className="text-white font-bold">{jobs.find(j => j.id === jobToDelete)?.title}</span> اطمینان دارید؟
             </p>
             <div className="flex gap-3">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-700 transition">لغو</button>
                <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 shadow-lg shadow-red-500/20 transition">بله، حذف کن</button>
             </div>
           </div>
        </div>
      )}

    </div>
  );
}