"use client";
import React, { useState } from "react";
import {
  Smartphone,
  Plus,
  Edit2,
  Trash2,
  X,
  MessageSquare,
  TrendingUp,
  Calculator,
  ShoppingBag,
  Percent
} from "lucide-react";

// --- نوع داده بسته پیامکی ---
interface SmsPackage {
  id: number;
  title: string; // مثلا: بسته برنزی
  count: number; // تعداد پیامک
  price: number; // قیمت کل بسته
  isPopular: boolean;
  isActive: boolean;
  totalSold: number; // آمار فروش
}

// --- داده‌های اولیه ---
const initialPackages: SmsPackage[] = [
  {
    id: 1,
    title: "بسته آزمایشی",
    count: 200,
    price: 90000, // هر پیامک 450 تومن
    isPopular: false,
    isActive: true,
    totalSold: 145,
  },
  {
    id: 2,
    title: "بسته اقتصادی",
    count: 1000,
    price: 420000, // هر پیامک 420 تومن
    isPopular: true,
    isActive: true,
    totalSold: 850,
  },
  {
    id: 3,
    title: "بسته کسب‌وکارهای بزرگ",
    count: 5000,
    price: 1900000, // هر پیامک 380 تومن
    isPopular: false,
    isActive: true,
    totalSold: 120,
  },
  {
    id: 4,
    title: "بسته سازمانی (Bulk)",
    count: 20000,
    price: 7000000, // هر پیامک 350 تومن
    isPopular: false,
    isActive: false,
    totalSold: 15,
  },
];

export default function SmsPlansPage() {
  const [packages, setPackages] = useState<SmsPackage[]>(initialPackages);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPkg, setCurrentPkg] = useState<SmsPackage | null>(null);
  
  // استیت‌های حذف
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pkgToDelete, setPkgToDelete] = useState<number | null>(null);

  // --- محاسبات آماری بالای صفحه ---
  const totalSmsSold = packages.reduce((acc, curr) => acc + (curr.count * curr.totalSold), 0);
  const totalRevenue = packages.reduce((acc, curr) => acc + (curr.price * curr.totalSold), 0);

  // --- فرمت اعداد ---
  const formatPrice = (price: number) => price.toLocaleString();

  // --- هندلر باز کردن مودال ---
  const handleOpenModal = (pkg: SmsPackage | null = null) => {
    setCurrentPkg(pkg);
    setIsModalOpen(true);
  };

  // --- هندلر ذخیره ---
  const handleSavePackage = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const newPkgData: any = {
      title: formData.get("title"),
      count: Number(formData.get("count")),
      price: Number(formData.get("price")),
      isPopular: formData.get("isPopular") === "on",
      isActive: formData.get("isActive") === "on",
    };

    if (currentPkg) {
      setPackages(packages.map((p) => (p.id === currentPkg.id ? { ...p, ...newPkgData } : p)));
    } else {
      setPackages([...packages, { id: Date.now(), totalSold: 0, ...newPkgData }]);
    }
    setIsModalOpen(false);
  };

  // --- هندلر حذف ---
  const confirmDelete = () => {
    if (pkgToDelete) {
      setPackages(packages.filter((p) => p.id !== pkgToDelete));
      setIsDeleteModalOpen(false);
      setPkgToDelete(null);
    }
  };

  // --- هندلر تغییر وضعیت ---
  const toggleStatus = (id: number) => {
    setPackages(packages.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Smartphone className="text-emerald-400 w-7 h-7" />
            بسته‌های پیامک (Top-up)
          </h1>
          <p className="text-gray-400 text-sm mt-1">مدیریت بسته‌های شارژ پیامک برای کاربران</p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          بسته پیامک جدید
        </button>
      </div>

      {/* --- Top Stats (آمار سریع) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#242933] border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-4">
           <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
              <MessageSquare className="w-6 h-6" />
           </div>
           <div>
              <p className="text-gray-400 text-xs">کل پیامک‌های فروخته شده</p>
              <h3 className="text-xl font-bold text-white">{formatPrice(totalSmsSold)} <span className="text-xs font-normal">عدد</span></h3>
           </div>
        </div>
        <div className="bg-[#242933] border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-4">
           <div className="p-3 bg-green-500/10 text-green-400 rounded-xl">
              <TrendingUp className="w-6 h-6" />
           </div>
           <div>
              <p className="text-gray-400 text-xs">درآمد حاصل از فروش بسته</p>
              <h3 className="text-xl font-bold text-white">{formatPrice(totalRevenue)} <span className="text-xs font-normal">تومان</span></h3>
           </div>
        </div>
      </div>

      {/* --- Packages Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {packages.map((pkg) => {
          // محاسبه قیمت واحد هر پیامک برای نمایش به ادمین
          const unitPrice = Math.round(pkg.price / pkg.count);
          
          return (
            <div 
              key={pkg.id} 
              className={`
                relative bg-[#242933] rounded-2xl border transition-all duration-300 group overflow-hidden
                ${pkg.isActive ? "border-emerald-500/20" : "border-gray-700 opacity-75 grayscale-[0.5]"}
                ${pkg.isPopular ? "ring-1 ring-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)]" : "hover:border-emerald-500/40"}
              `}
            >
              {/* Top Banner Gradient */}
              <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-emerald-500 to-blue-500"></div>

              {pkg.isPopular && (
                 <div className="absolute top-3 left-3 flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-500/20">
                    <TrendingUp className="w-3 h-3" /> پرفروش
                 </div>
              )}

              <div className="p-6">
                
                {/* Package Count (Hero) */}
                <div className="text-center mb-4">
                  <p className="text-xs text-gray-400 mb-1">{pkg.title}</p>
                  <h3 className="text-3xl font-black text-white tracking-tight flex items-center justify-center gap-1">
                     {formatPrice(pkg.count)}
                     <MessageSquare className="w-5 h-5 text-gray-600 mb-2" />
                  </h3>
                </div>

                {/* Price Info */}
                <div className="bg-[#1a1e26] rounded-xl p-3 border border-white/5 space-y-2 mb-4">
                   <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">قیمت بسته:</span>
                      <span className="text-sm font-bold text-white">{formatPrice(pkg.price)} تومان</span>
                   </div>
                   <div className="flex justify-between items-center border-t border-white/5 pt-2">
                      <span className="text-[10px] text-gray-500 flex items-center gap-1">
                         <Calculator className="w-3 h-3" /> قیمت واحد:
                      </span>
                      <span className="text-xs font-mono text-emerald-400">{unitPrice} تومان</span>
                   </div>
                </div>

                {/* Sales Stat */}
                <div className="flex items-center justify-between text-[11px] text-gray-500 mb-5">
                   <span className="flex items-center gap-1"><ShoppingBag className="w-3 h-3"/> فروش کل:</span>
                   <span>{pkg.totalSold} بار</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                   <button 
                      onClick={() => toggleStatus(pkg.id)}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium border transition ${
                        pkg.isActive 
                        ? "border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10" 
                        : "border-gray-600 text-gray-400 hover:bg-white/5"
                      }`}
                   >
                      {pkg.isActive ? "فعال" : "غیرفعال"}
                   </button>
                   <button onClick={() => handleOpenModal(pkg)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition">
                      <Edit2 className="w-4 h-4" />
                   </button>
                   <button onClick={() => { setPkgToDelete(pkg.id); setIsDeleteModalOpen(true); }} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition">
                      <Trash2 className="w-4 h-4" />
                   </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#242933] border border-emerald-500/30 rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-emerald-500/20 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">
                {currentPkg ? "ویرایش بسته" : "تعریف بسته جدید"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSavePackage} className="p-6 space-y-4">
              <div className="space-y-2">
                 <label className="text-sm text-gray-400">عنوان بسته</label>
                 <input name="title" defaultValue={currentPkg?.title} placeholder="مثلا: بسته برنزی" required className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-3 text-sm focus:border-emerald-400 outline-none text-white transition" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-sm text-gray-400">تعداد پیامک</label>
                    <input type="number" name="count" defaultValue={currentPkg?.count} required className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-3 text-sm focus:border-emerald-400 outline-none text-white transition" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm text-gray-400">قیمت کل (تومان)</label>
                    <input type="number" name="price" defaultValue={currentPkg?.price} required className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-3 text-sm focus:border-emerald-400 outline-none text-white transition" />
                 </div>
              </div>

              {/* Status Toggles */}
              <div className="flex items-center gap-6 pt-2 bg-[#1a1e26] p-3 rounded-xl border border-white/5">
                 <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" name="isPopular" defaultChecked={currentPkg?.isPopular} className="w-4 h-4 rounded border-gray-600 bg-[#242933] text-emerald-500 focus:ring-emerald-500 accent-emerald-500" />
                    <span className="text-xs text-gray-300 group-hover:text-white transition">برچسب پرفروش</span>
                 </label>
                 <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" name="isActive" defaultChecked={currentPkg?.isActive ?? true} className="w-4 h-4 rounded border-gray-600 bg-[#242933] text-emerald-500 focus:ring-emerald-500 accent-emerald-500" />
                    <span className="text-xs text-gray-300 group-hover:text-white transition">وضعیت فعال</span>
                 </label>
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-700 transition">انصراف</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-linear-to-r from-emerald-500 to-emerald-600 text-white font-bold hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/20 transition">
                  {currentPkg ? "بروزرسانی" : "ایجاد بسته"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE MODAL --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
           <div className="bg-[#242933] border border-red-500/30 rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl">
             <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8" />
             </div>
             <h3 className="text-xl font-bold text-white mb-2">حذف بسته پیامکی</h3>
             <p className="text-gray-400 text-sm mb-6">
               آیا از حذف این بسته اطمینان دارید؟ این عمل غیرقابل بازگشت است.
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