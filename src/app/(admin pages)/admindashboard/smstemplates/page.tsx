"use client";
import { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import {
  Plus,
  Bell,
  Clock,
  MessageSquare,
  Trash2,
  Loader2,
  HelpCircle,
  X,
  ChevronLeft,
  Edit3,
  Save,
  AlertCircle,
} from "lucide-react";

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    id: null as number | null,
    name: "",
    type: "reserve",
    sub_type: "none",
    payamresan_id: "",
    content: "",
    message_count: 1,
  });

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/smstemplates");
      const data = await res.json();
      setTemplates(Array.isArray(data) ? data : data.templates || []);
    } catch (err) {
      toast.error("خطا در دریافت لیست الگوها");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      id: null,
      name: "",
      type: "reserve",
      sub_type: "none",
      payamresan_id: "",
      content: "",
      message_count: 1,
    });
    setShowModal(true);
  };

  const openEditModal = (tpl: any) => {
    setEditingId(tpl.id);
    setFormData({
      id: tpl.id,
      name: tpl.name,
      type: tpl.type,
      sub_type: tpl.sub_type || "none",
      payamresan_id: tpl.payamresan_id,
      content: tpl.content || "",
      message_count: tpl.message_count || 1,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingId = toast.loading(editingId ? "در حال به‌روزرسانی..." : "در حال ذخیره الگو...");

    try {
      const url = editingId
        ? `/api/admin/smstemplates?id=${editingId}`
        : "/api/admin/smstemplates";

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(
          editingId ? "الگو با موفقیت به‌روزرسانی شد" : "پترن با موفقیت ساخته شد",
          { id: loadingId }
        );
        setShowModal(false);
        fetchTemplates();
      } else {
        const error = await res.json();
        toast.error(error.message || "خطا در عملیات", { id: loadingId });
      }
    } catch (err) {
      toast.error("خطا در اتصال به سرور", { id: loadingId });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("آیا از حذف این الگو مطمئن هستید؟")) return;
    try {
      const res = await fetch(`/api/admin/smstemplates?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("الگو با موفقیت حذف شد");
        fetchTemplates();
      }
    } catch (err) {
      toast.error("خطا در سرور");
    }
  };

  return (
    <div className="p-6 bg-[#0f0f0f] min-h-screen text-white">
      <Toaster position="top-center" reverseOrder={false} />

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black flex items-center gap-3">
              <div className="bg-emerald-500/20 p-2 rounded-xl">
                <MessageSquare className="text-emerald-500" size={28} />
              </div>
              مدیریت الگوهای هوشمند
            </h1>
            <p className="text-gray-500 text-sm mt-2 mr-1">
              پیکربندی پترن‌های ارسالی بر اساس زمان‌بندی دقیق
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/20 font-bold"
          >
            <Plus size={22} /> تعریف پترن جدید
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-24 gap-4">
            <Loader2 className="animate-spin text-emerald-500" size={48} />
            <p className="text-gray-400">در حال فراخوانی اطلاعات...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-20">
            <MessageSquare className="w-20 h-20 text-gray-700 mx-auto mb-4 opacity-30" />
            <p className="text-gray-500">هنوز الگویی تعریف نشده است</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((tpl: any) => (
              <div
                key={tpl.id}
                className="bg-[#181818] p-6 rounded-4xl border border-gray-800/50 hover:border-emerald-500/40 transition-all group relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-5 relative z-10">
                  <div className="flex flex-col gap-2">
                    <span
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase w-fit ${
                        tpl.type === "reserve"
                          ? "bg-blue-500/10 text-blue-400"
                          : tpl.type === "reminder"
                          ? "bg-amber-500/10 text-amber-400"
                          : tpl.type === "bulk"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-purple-500/10 text-purple-400"
                      }`}
                    >
                      {tpl.type === "reserve"
                        ? "🔔 ثبت رزرو"
                        : tpl.type === "reminder"
                        ? "⏰ یادآوری"
                        : tpl.type === "bulk"
                        ? "📢 همگانی"
                        : "📩 عمومی"}
                    </span>
                    {tpl.sub_type !== "none" && (
                      <span className="text-[10px] bg-white/5 text-gray-400 px-2 py-1 rounded-md w-fit border border-white/5">
                        🎯 مخصوص نوبت‌های: {tpl.sub_type === "today" ? "امروز" : "فردا"}
                      </span>
                    )}
                    <span className="text-[10px] bg-orange-500/10 text-orange-400 px-2 py-1 rounded-md w-fit border border-orange-500/20">
                      💬 {tpl.message_count || 1} پیامک
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(tpl)}
                      className="bg-emerald-500/10 p-2 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition-all"
                      title="ویرایش"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(tpl.id)}
                      className="bg-red-500/10 p-2 rounded-lg text-gray-500 hover:text-red-500 transition-all"
                      title="حذف"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-xl mb-3 group-hover:text-emerald-400 transition-colors line-clamp-1">
                  {tpl.name}
                </h3>

                <div className="bg-black/40 border border-white/5 p-2.5 rounded-xl text-[12px] font-mono text-emerald-500/80 mb-4 flex justify-between items-center italic">
                  <span className="text-gray-600">ID:</span>
                  <span>{tpl.payamresan_id}</span>
                </div>

                <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-2 min-h-18">
                  "{tpl.content || "-"}"
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* مودال ایجاد/ویرایش */}
      {showModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 z-50">
          <div className="bg-[#181818] w-full max-w-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[95vh]">
            <button
              onClick={() => setShowModal(false)}
              className="absolute left-6 top-6 text-gray-500 hover:text-white transition-all"
            >
              <X size={28} />
            </button>

            <h2 className="text-2xl font-black mb-8 text-white flex items-center gap-2">
              <div className="w-2 h-8 bg-emerald-500 rounded-full" />
              {editingId ? "ویرایش الگو" : "تنظیمات هوشمند پترن"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-400 mb-2 mr-1">
                    عنوان الگو
                  </label>
                  <input
                    required
                    className="w-full bg-black/40 border border-gray-800 rounded-2xl p-4 outline-none focus:border-emerald-500 transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2 mr-1">
                    نوع اصلی
                  </label>
                  <select
                    className="w-full bg-black/40 border border-gray-800 rounded-2xl p-4 outline-none focus:border-emerald-500 cursor-pointer appearance-none"
                    value={formData.type}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({
                        ...formData,
                        type: val,
                        sub_type: val === "reminder" ? formData.sub_type : "none",
                      });
                    }}
                  >
                    <option value="reserve">🔔 پترن ثبت رزرو</option>
                    <option value="reminder">⏰ پترن یادآوری</option>
                    <option value="bulk">📢 پترن همگانی (با نام سالن)</option>
                    <option value="generic">📩 پترن عمومی</option>
                  </select>
                </div>

                <div className={formData.type === "reminder" ? "block" : "invisible"}>
                  <label className="block text-sm text-gray-400 mb-2 mr-1">
                    هدف زمانی
                  </label>
                  <select
                    className="w-full bg-black/40 border border-gray-800 rounded-2xl p-4 outline-none focus:border-amber-500 cursor-pointer appearance-none text-amber-500 font-bold"
                    value={formData.sub_type}
                    onChange={(e) => setFormData({ ...formData, sub_type: e.target.value })}
                  >
                    <option value="tomorrow">📅 نوبت‌های فردا</option>
                    <option value="today">🕒 نوبت‌های امروز</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2 mr-1">
                    تعداد پیامک (دستی)
                  </label>
                  <select
                    className="w-full bg-black/40 border border-gray-800 rounded-2xl p-4 outline-none focus:border-orange-500 cursor-pointer"
                    value={formData.message_count}
                    onChange={(e) => setFormData({ ...formData, message_count: Number(e.target.value) })}
                  >
                    <option value={1}>۱ پیامک</option>
                    <option value={2}>۲ پیامک</option>
                    <option value={3}>۳ پیامک</option>
                    <option value={4}>۴ پیامک</option>
                    <option value={5}>۵ پیامک</option>
                  </select>
                  <p className="text-[10px] text-gray-500 mt-2">
                    این عدد دقیقاً از موجودی کاربر کسر می‌شود
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2 mr-1">
                  Pattern ID (از پنل IPPanel)
                </label>
                <input
                  required
                  className="w-full bg-black/40 border border-gray-800 rounded-2xl p-4 font-mono text-emerald-400 outline-none focus:border-emerald-500"
                  value={formData.payamresan_id}
                  onChange={(e) => setFormData({ ...formData, payamresan_id: e.target.value })}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm text-gray-400 mr-1">
                    متن الگو (جهت اطلاع)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowHelp(!showHelp)}
                    className="text-[11px] flex items-center gap-1.5 text-blue-400 bg-blue-500/5 px-3 py-1 rounded-full"
                  >
                    <HelpCircle size={14} /> راهنمای متغیرها
                  </button>
                </div>

                {showHelp && (
                  <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-2xl mb-4 text-[10px] space-y-2">
                    <div className="text-blue-300 font-bold mb-1">
                      متغیرهای مجاز سیستم:
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <code className="bg-black/40 p-1.5 rounded border border-white/5 text-emerald-400">
                        %name% : نام مشتری
                      </code>
                      <code className="bg-black/40 p-1.5 rounded border border-white/5 text-emerald-400">
                        %salon% : نام کسب‌وکار
                      </code>
                      <code className="bg-black/40 p-1.5 rounded border border-white/5">
                        %date% : تاریخ
                      </code>
                      <code className="bg-black/40 p-1.5 rounded border border-white/5">
                        %time% : ساعت
                      </code>
                      <code className="bg-black/40 p-1.5 rounded border border-white/5">
                        %service% : خدمات
                      </code>
                      <code className="bg-black/40 p-1.5 rounded border border-white/5">
                        %link% : لینک مدیریت
                      </code>
                    </div>
                  </div>
                )}

                <textarea
                  required
                  className="w-full bg-black/40 border border-gray-800 rounded-2xl p-4 h-32 resize-none text-sm outline-none focus:border-emerald-500"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="مثال: سلام %name% عزیز، نوبت‌های امروز در سالن %salon% لغو گردید."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-900 text-gray-400 py-4 rounded-2xl font-bold hover:bg-gray-800 transition"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-black shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 transition-all"
                >
                  {editingId ? (
                    <>
                      <Save size={20} /> ذخیره تغییرات
                    </>
                  ) : (
                    <>
                      ذخیره تنظیمات <ChevronLeft size={20} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}