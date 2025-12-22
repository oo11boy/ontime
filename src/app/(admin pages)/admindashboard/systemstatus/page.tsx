"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Activity,
  Clock,
  Trash2,
  RotateCcw,
  Calculator,
  CalendarClock,
  Search,
  CheckCircle2,
  AlertCircle,
  Layers,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function SystemStatusPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<
    "history" | "waiting" | "delayed" | "failed" | "completed" | "active"
  >("history");

  const [testMsg, setTestMsg] = useState("");
  const [calcLoading, setCalcLoading] = useState(false);
  const [priceInfo, setPriceInfo] = useState<any>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/system/status");
      const result = await res.json();
      if (result.success) setData(result);
    } catch (e) {
      toast.error("خطا در بروزرسانی");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const inv = setInterval(fetchStatus, 30000);
    return () => clearInterval(inv);
  }, [fetchStatus]);

  const handleAction = async (act: string, id?: string) => {
    if (!window.confirm("آیا مطمئن هستید؟")) return;
    try {
      const url = `/api/admin/system/status?action=${act}${
        id ? (act === "deleteLog" ? `&logId=${id}` : `&jobId=${id}`) : ""
      }`;
      const res = await fetch(url);
      if (res.ok) {
        toast.success("عملیات موفق");
        fetchStatus();
      }
    } catch (e) {
      toast.error("خطا در اجرا");
    }
  };

  const getPrice = async () => {
    if (!testMsg) return toast.error("متن را وارد کنید");
    setCalcLoading(true);
    try {
      const res = await fetch(
        "/api/admin/system/status?action=calculatePrice",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: testMsg }),
        }
      );
      const result = await res.json();
      if (result.success) setPriceInfo(result.data);
    } finally {
      setCalcLoading(false);
    }
  };

  const filteredList = data?.details[activeTab]?.filter(
    (i: any) =>
      i.phone?.includes(searchTerm) ||
      i.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className="space-y-6 pb-20 text-right animate-in fade-in duration-500"
      dir="rtl"
    >
      {/* ردیف اول: موجودی، استعلام و نمودار */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-1 space-y-4">
          <div
            className={`p-6 rounded-[2.2rem] text-white shadow-xl relative overflow-hidden ${
              data?.panel?.credit < 500000
                ? "bg-gradient-to-br from-red-600 to-rose-800"
                : "bg-gradient-to-br from-indigo-700 to-blue-800"
            }`}
          >
            <p className="text-[10px] font-black opacity-70 mb-1">موجودی پنل</p>
            <h2 className="text-3xl font-black">
              {data?.panel
                ? Math.floor(data.panel.credit / 10).toLocaleString("fa-IR")
                : "---"}{" "}
              <span className="text-xs font-normal">تومان</span>
            </h2>
            <div className="mt-4 flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full animate-pulse ${
                  data?.workerStatus ? "bg-emerald-400" : "bg-red-500"
                }`}
              ></div>
              <span className="text-[9px] font-bold">
                {data?.workerStatus ? "پردازشگر فعال" : "سرور متوقف"}
              </span>
            </div>
          </div>

          <div className="bg-[#1e232d] border border-white/5 p-5 rounded-[2.2rem] shadow-xl">
            <p className="text-white text-[10px] font-black mb-3 flex items-center gap-2">
              <Calculator className="w-3.5 h-3.5 text-amber-400" /> استعلام
              تعرفه اپراتورها
            </p>
            <textarea
              value={testMsg}
              onChange={(e) => setTestMsg(e.target.value)}
              placeholder="متن پیامک..."
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[11px] text-white h-16 outline-none focus:border-amber-500 transition-all resize-none"
            />
            <button
              onClick={getPrice}
              disabled={calcLoading}
              className="w-full mt-2 py-2.5 bg-amber-500/10 text-amber-500 rounded-xl text-[10px] font-black hover:bg-amber-500 hover:text-white transition-all"
            >
              {calcLoading ? "در حال استعلام..." : "محاسبه هزینه"}
            </button>
            {priceInfo && (
              <div className="mt-4 space-y-2 animate-in slide-in-from-top-2">
                <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg text-[10px]">
                  <span className="text-gray-400">همراه اول:</span>
                  <span className="text-emerald-400 font-black">
                    {priceInfo.mci_price?.toLocaleString("fa-IR")} ریال
                  </span>
                </div>
                <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg text-[10px]">
                  <span className="text-gray-400">ایرانسل/سایر:</span>
                  <span className="text-blue-400 font-black">
                    {priceInfo.other_price?.toLocaleString("fa-IR")} ریال
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="xl:col-span-3 bg-[#1e232d] border border-white/5 p-7 rounded-[2.5rem] shadow-xl">
          <p className="text-white text-xs font-black mb-6 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" /> ترافیک ۲۴ ساعت
            اخیر
          </p>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.chart}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#ffffff05"
                  vertical={false}
                />
                <XAxis
                  dataKey="hour"
                  stroke="#4b5563"
                  fontSize={10}
                  tickFormatter={(v) => `${v}:00`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#161a21",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "10px",
                  }}
                />
                <Bar
                  dataKey="success"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  barSize={15}
                />
                <Bar
                  dataKey="failed"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                  barSize={15}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* کارت‌های آمار ۵ گانه */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          {
            t: "در صف انتظار",
            v: data?.counts.waiting,
            c: "text-blue-400",
            id: "waiting",
          },
          {
            t: "در حال ارسال",
            v: data?.counts.active,
            c: "text-amber-400",
            id: "active",
          },
          {
            t: "زمان‌بندی شده",
            v: data?.counts.delayed,
            c: "text-purple-400",
            id: "delayed",
          },
          {
            t: "موفقیت‌آمیز",
            v: data?.counts.completed,
            c: "text-emerald-400",
            id: "completed",
          },
          {
            t: "کل خطاها",
            v: data?.counts.failed,
            c: "text-red-400",
            id: "failed",
          },
        ].map((s, idx) => (
          <div
            key={idx}
            onClick={() => setActiveTab(s.id as any)}
            className={`bg-[#1e232d] border p-5 rounded-3xl text-center cursor-pointer transition-all ${
              activeTab === s.id
                ? "border-emerald-500 ring-1 ring-emerald-500"
                : "border-white/5 hover:border-white/20"
            }`}
          >
            <p className="text-gray-500 text-[9px] font-black uppercase mb-1">
              {s.t}
            </p>
            <h4 className={`text-2xl font-black ${s.c}`}>
              {loading ? "..." : (s.v || 0).toLocaleString("fa-IR")}
            </h4>
          </div>
        ))}
      </div>

      {/* جدول و تب‌ها */}
      <div className="bg-[#1e232d] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-5 bg-[#161a21] border-b border-white/5 flex flex-col lg:flex-row justify-between items-center gap-4">
          <div className="flex bg-white/5 rounded-2xl p-1 overflow-x-auto no-scrollbar">
            {[
              {
                id: "history",
                l: "آرشیو لاگ",
                icon: <Layers className="w-3 h-3" />,
              },
              {
                id: "completed",
                l: "موفق",
                icon: <CheckCircle2 className="w-3 h-3" />,
              },
              {
                id: "delayed",
                l: "آینده",
                icon: <CalendarClock className="w-3 h-3" />,
              },
              {
                id: "waiting",
                l: "در صف",
                icon: <Clock className="w-3 h-3" />,
              },
              {
                id: "failed",
                l: "خطاها",
                icon: <AlertCircle className="w-3 h-3" />,
              },
              {
                id: "active",
                l: "در جریان",
                icon: <Activity className="w-3 h-3" />,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-3 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-emerald-500 text-white shadow-lg"
                    : "text-gray-500 hover:text-white"
                }`}
              >
                {tab.icon} {tab.l}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-96 flex gap-2">
            <div className="relative w-full">
              <Search className="absolute right-4 top-3.5 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="جستجوی شماره یا متن..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pr-11 text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>
            <button
              onClick={() => handleAction("retryAll")}
              className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/10 hover:bg-blue-500 hover:text-white transition-all"
              title="تلاش مجدد خطاهای صف"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleAction("flush")}
              className="p-3 bg-red-500/10 text-red-500 rounded-xl border border-red-500/10 hover:bg-red-600 hover:text-white transition-all"
              title="پاکسازی کل سیستم"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="text-[10px] text-gray-500 uppercase bg-[#161a21]">
              <tr>
                <th className="px-8 py-6">شماره گیرنده</th>
                <th className="px-8 py-6">محتوای پیام</th>
                <th className="px-8 py-6">
                  {activeTab === "delayed"
                    ? "زمان ارسال برنامه‌ریزی شده"
                    : "زمان ثبت"}
                </th>
                <th className="px-8 py-6 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredList?.length > 0 ? (
                filteredList.map((item: any) => (
                  <tr
                    key={item.id}
                    className="hover:bg-white/[0.02] transition-all group"
                  >
                    <td className="px-8 py-6 font-black text-white text-sm tracking-widest">
                      {item.phone}
                    </td>
                    <td className="px-8 py-6 text-gray-400 text-xs max-w-md truncate">
                      {item.content}
                    </td>
                    <td className="px-8 py-6 text-[11px] font-bold">
                      <span
                        className={
                          activeTab === "delayed"
                            ? "text-purple-400"
                            : "text-gray-600"
                        }
                      >
                        {new Date(
                          activeTab === "delayed" ? item.sendAt : item.timestamp
                        ).toLocaleString("fa-IR", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <button
                        onClick={() =>
                          handleAction(
                            activeTab === "history" ? "deleteLog" : "remove",
                            item.id
                          )
                        }
                        className="p-3 bg-red-500/5 text-red-500/20 group-hover:text-red-500 rounded-2xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="py-20 text-center text-gray-600 text-xs font-bold"
                  >
                    دیتا در این بخش خالی است
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
