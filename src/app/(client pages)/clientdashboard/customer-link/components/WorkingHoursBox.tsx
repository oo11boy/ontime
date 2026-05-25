// src/app/clientdashboard/customer-link/components/WorkingHoursBox.tsx
"use client";

import { useState } from "react";
import { 
  Clock, 
  CalendarOff, 
  Plus, 
  Trash2, 
  Edit2, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Loader2,
  ChevronDown,
  Sun,
  Moon
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Shift {
  start: string;
  end: string;
}

interface WorkingHoursBoxProps {
  workShifts: Shift[];
  offDays: number[];
  onWorkingHoursChange: (shifts: Shift[], offDays: number[]) => Promise<void>;
  isSaving?: boolean;
}

const DAYS_OF_WEEK = [
  { id: 0, name: "شنبه", shortName: "ش" },
  { id: 1, name: "یک‌شنبه", shortName: "ی" },
  { id: 2, name: "دوشنبه", shortName: "د" },
  { id: 3, name: "سه‌شنبه", shortName: "س" },
  { id: 4, name: "چهارشنبه", shortName: "چ" },
  { id: 5, name: "پنج‌شنبه", shortName: "پ" },
  { id: 6, name: "جمعه", shortName: "ج" },
];

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2).toString().padStart(2, "0");
  const min = i % 2 === 0 ? "00" : "30";
  return `${hour}:${min}`;
});

export function WorkingHoursBox({
  workShifts,
  offDays,
  onWorkingHoursChange,
  isSaving = false,
}: WorkingHoursBoxProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempShifts, setTempShifts] = useState<Shift[]>([]);
  const [tempOffDays, setTempOffDays] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"shifts" | "holidays">("shifts");

  // بررسی وضعیت تکمیل
  const checkCompletion = () => {
    // شیفت کاری: اگر خالی باشه، پیش‌فرض ۰۸:۰۰ تا ۲۲:۰۰ در نظر گرفته می‌شود
    const hasShifts = workShifts && workShifts.length > 0;
    // روزهای تعطیل اختیاری هستند
    const offDaysCount = offDays?.length || 0;
    
    // ساعت کاری همیشه تعریف شده است (یا دستی یا پیش‌فرض)
    const isComplete = true; // همیشه تکمیل در نظر گرفته می‌شود چون پیش‌فرض دارد
    
    return {
      isComplete,
      shiftsCount: workShifts?.length || 0,
      offDaysCount,
      hasCustomShifts: workShifts && workShifts.length > 0,
    };
  };

  const { shiftsCount, offDaysCount, hasCustomShifts } = checkCompletion();

  const getShiftsDisplayText = () => {
    if (!workShifts || workShifts.length === 0) {
      return "۰۸:۰۰ تا ۲۲:۰۰ (پیش‌فرض)";
    }
    return workShifts.map(s => `${s.start} تا ${s.end}`).join(" و ");
  };

  const getOffDaysNames = () => {
    if (!offDays || offDays.length === 0) return [];
    return offDays.map(dayId => DAYS_OF_WEEK.find(d => d.id === dayId)?.name).filter(Boolean);
  };

  const handleOpenModal = () => {
    setTempShifts(workShifts && workShifts.length > 0 ? [...workShifts] : []);
    setTempOffDays(offDays ? [...offDays] : []);
    setActiveTab("shifts");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const addShift = () => {
    if (tempShifts.length >= 3) {
      toast.error("حداکثر ۳ شیفت مجاز است");
      return;
    }
    setTempShifts([...tempShifts, { start: "09:00", end: "17:00" }]);
  };

  const removeShift = (index: number) => {
    setTempShifts(tempShifts.filter((_, i) => i !== index));
  };

  const updateShift = (index: number, field: "start" | "end", value: string) => {
    const newShifts = [...tempShifts];
    newShifts[index][field] = value;
    setTempShifts(newShifts);
  };

  const toggleOffDay = (dayId: number) => {
    if (tempOffDays.includes(dayId)) {
      setTempOffDays(tempOffDays.filter(id => id !== dayId));
    } else {
      setTempOffDays([...tempOffDays, dayId]);
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await onWorkingHoursChange(tempShifts, tempOffDays);
      setIsModalOpen(false);
      toast.success("ساعت کاری با موفقیت ذخیره شد");
    } catch (error) {
      console.error("Error saving working hours:", error);
      toast.error("خطا در ذخیره ساعت کاری");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetToDefault = () => {
    setTempShifts([]);
    setTempOffDays([]);
  };

  return (
    <>
      <div className="bg-white dark:bg-[#1a1e26] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
        {/* هدر */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
              <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white">
              ساعت کاری و تعطیلات
            </h3>
          </div>
          
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 rounded-full">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
              تنظیم شده
            </span>
          </div>
        </div>

        {/* محتوا */}
        <div className="p-5 space-y-4">
          {/* ساعت کاری */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-700 dark:text-gray-300">
                ساعت کاری
              </span>
              {!hasCustomShifts && (
                <span className="text-xs text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full">
                  پیش‌فرض
                </span>
              )}
            </div>
            <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3">
              <p className="text-sm text-slate-700 dark:text-gray-300">
                {getShiftsDisplayText()}
              </p>
              {hasCustomShifts && shiftsCount > 0 && (
                <p className="text-xs text-slate-500 mt-1">
                  {shiftsCount} شیفت کاری
                </p>
              )}
            </div>
          </div>

          {/* روزهای تعطیل */}
          {offDaysCount > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CalendarOff className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-gray-300">
                  روزهای تعطیل هفتگی
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {getOffDaysNames().map((day) => (
                  <span
                    key={day}
                    className="px-2 py-1 bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 rounded-full text-xs"
                  >
                    {day}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* دکمه ویرایش */}
          <button
            onClick={handleOpenModal}
            disabled={isSaving}
            className="w-full py-2.5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Edit2 className="w-4 h-4" />
            ویرایش ساعت کاری
          </button>
        </div>
      </div>

      {/* مودال ویرایش ساعت کاری */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#1a1e26] rounded-2xl shadow-2xl overflow-hidden">
            {/* هدر مودال */}
            <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-white">
                تنظیمات ساعت کاری
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* تب‌ها */}
            <div className="flex border-b border-slate-200 dark:border-white/10">
              <button
                onClick={() => setActiveTab("shifts")}
                className={`flex-1 py-3 text-sm font-medium transition-all relative ${
                  activeTab === "shifts"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-slate-500 dark:text-gray-400"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4" />
                  شیفت‌های کاری
                </div>
                {activeTab === "shifts" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("holidays")}
                className={`flex-1 py-3 text-sm font-medium transition-all relative ${
                  activeTab === "holidays"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-slate-500 dark:text-gray-400"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <CalendarOff className="w-4 h-4" />
                  روزهای تعطیل
                </div>
                {activeTab === "holidays" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                )}
              </button>
            </div>

            {/* محتوای تب‌ها */}
            <div className="p-5 max-h-[55vh] overflow-y-auto">
              {activeTab === "shifts" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {tempShifts.length === 0 
                        ? "بدون شیفت دستی (استفاده از پیش‌فرض ۰۸:۰۰ تا ۲۲:۰۰)"
                        : `${tempShifts.length} شیفت کاری`}
                    </span>
                    <div className="flex gap-2">
                      {tempShifts.length > 0 && (
                        <button
                          onClick={resetToDefault}
                          className="text-xs text-amber-600 dark:text-amber-400 px-2 py-1 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-500/10"
                        >
                          بازنشانی به پیش‌فرض
                        </button>
                      )}
                      <button
                        onClick={addShift}
                        className="text-xs bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-lg flex items-center gap-1"
                      >
                        <Plus size={12} /> شیفت جدید
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                      {tempShifts.length === 0 ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="p-4 border border-dashed border-slate-200 dark:border-white/10 rounded-xl text-center"
                        >
                          <Sun className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                          <p className="text-sm text-slate-600 dark:text-gray-400">
                            ساعت کاری پیش‌فرض
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            ۰۸:۰۰ صبح تا ۲۲:۰۰ شب
                          </p>
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
                            برای تنظیم دستی، روی دکمه "شیفت جدید" کلیک کنید
                          </p>
                        </motion.div>
                      ) : (
                        tempShifts.map((shift, index) => (
                          <motion.div
                            key={index}
                            layout
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/10"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex-1 grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[10px] text-slate-500 block mb-1">
                                    شروع
                                  </label>
                                  <select
                                    value={shift.start}
                                    onChange={(e) => updateShift(index, "start", e.target.value)}
                                    className="w-full bg-white dark:bg-[#0a0c10] border dark:border-gray-700 rounded-lg py-2 text-center text-sm font-medium outline-none focus:border-emerald-500 dark:text-white"
                                  >
                                    {TIME_OPTIONS.map((t) => (
                                      <option key={t} value={t}>
                                        {t}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[10px] text-slate-500 block mb-1">
                                    پایان
                                  </label>
                                  <select
                                    value={shift.end}
                                    onChange={(e) => updateShift(index, "end", e.target.value)}
                                    className="w-full bg-white dark:bg-[#0a0c10] border dark:border-gray-700 rounded-lg py-2 text-center text-sm font-medium outline-none focus:border-emerald-500 dark:text-white"
                                  >
                                    {TIME_OPTIONS.map((t) => (
                                      <option key={t} value={t}>
                                        {t}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              <button
                                onClick={() => removeShift(index)}
                                className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-red-500/10 rounded-lg mt-5"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </div>

                  {tempShifts.length > 0 && (
                    <p className="text-xs text-slate-500 text-center pt-2">
                      حداکثر ۳ شیفت قابل تنظیم است
                    </p>
                  )}
                </div>
              )}

              {activeTab === "holidays" && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500 text-center">
                    روزهایی که کسب‌وکار شما تعطیل است را انتخاب کنید
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {DAYS_OF_WEEK.map((day) => {
                      const isOff = tempOffDays.includes(day.id);
                      return (
                        <button
                          key={day.id}
                          onClick={() => toggleOffDay(day.id)}
                          className={`py-3 rounded-xl text-sm font-bold transition-all ${
                            isOff
                              ? "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40"
                              : "bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-gray-300 border border-transparent hover:border-slate-200 dark:hover:border-white/10"
                          }`}
                        >
                          {day.shortName}
                          <span className="block text-[10px] font-normal mt-0.5">
                            {day.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {tempOffDays.length > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-500/10 rounded-xl p-3">
                      <p className="text-xs text-amber-700 dark:text-amber-400">
                        روزهای تعطیل انتخاب شده:
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {tempOffDays.map(dayId => {
                          const day = DAYS_OF_WEEK.find(d => d.id === dayId);
                          return day ? (
                            <span key={day.id} className="text-xs bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">
                              {day.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-slate-400 text-center">
                    روزهای تعطیل در صفحه شما نمایش داده می‌شوند و مشتریان نمی‌توانند در آن روزها نوبت بگیرند
                  </p>
                </div>
              )}
            </div>

            {/* دکمه‌های مودال */}
            <div className="p-4 border-t border-slate-200 dark:border-white/10 flex gap-3">
              <button
                onClick={handleCloseModal}
                className="flex-1 py-2.5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium text-slate-700 dark:text-gray-300"
              >
                انصراف
              </button>
              <button
                onClick={handleSave}
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                ذخیره ساعت کاری
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}