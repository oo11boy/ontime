"use client";
import React, { useState } from "react";
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  Phone,
  Briefcase,
  Users,
  MessageSquare,
  Crown,
  X,
} from "lucide-react";

// --- نوع داده کلاینت ---
type Client = {
  id: number;
  name: string;
  businessName: string;
  phone: string;
  plan: string;
  smsBalance: number;
  customerCount: number;
  status: "active" | "expired";
};

// --- داده‌های اولیه ---
const initialClients: Client[] = [
  {
    id: 1,
    name: "رضا احمدی",
    businessName: "سالن زیبایی گلها",
    phone: "09123456789",
    plan: "طلایی",
    smsBalance: 2500,
    customerCount: 450,
    status: "active",
  },
  {
    id: 2,
    name: "سارا رضایی",
    businessName: "کلینیک پوست مدرن",
    phone: "09351234567",
    plan: "نقره‌ای",
    smsBalance: 120,
    customerCount: 120,
    status: "active",
  },
  {
    id: 3,
    name: "علی محمدی",
    businessName: "پیرایش جنتلمن",
    phone: "09181239876",
    plan: "برنزی",
    smsBalance: 0,
    customerCount: 85,
    status: "expired",
  },
];

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [searchQuery, setSearchQuery] = useState("");

  // استیت‌های مربوط به مودال‌ها
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<number | null>(null);

  // --- جستجو ---
  const filteredClients = clients.filter(
    (c) =>
      c.name.includes(searchQuery) ||
      c.phone.includes(searchQuery) ||
      c.businessName.includes(searchQuery)
  );

  // --- هندلرها ---
  const handleOpenModal = (client: Client | null = null) => {
    setCurrentClient(client);
    setIsModalOpen(true);
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newClientData = {
      name: formData.get("name") as string,
      businessName: formData.get("businessName") as string,
      phone: formData.get("phone") as string,
      plan: formData.get("plan") as string,
      smsBalance: Number(formData.get("smsBalance")),
      customerCount: Number(formData.get("customerCount")),
      status: "active" as const,
    };

    if (currentClient) {
      setClients(
        clients.map((c) =>
          c.id === currentClient.id ? { ...c, ...newClientData } : c
        )
      );
    } else {
      setClients([...clients, { id: Date.now(), ...newClientData }]);
    }
    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    if (clientToDelete) {
      setClients(clients.filter((c) => c.id !== clientToDelete));
      setIsDeleteModalOpen(false);
      setClientToDelete(null);
    }
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500">
      {/* --- هدر اختصاصی صفحه --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="text-emerald-400 w-7 h-7" />
            مدیریت کلاینت‌ها
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            مدیریت لیست کسب‌وکارهای ثبت شده
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* جستجو در لیست */}
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="جستجو نام، شغل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#242933] border border-emerald-500/30 rounded-xl py-2.5 px-4 pr-10 text-sm focus:outline-none focus:border-emerald-400 transition"
            />
            <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
          </div>

          {/* دکمه افزودن */}
          <button
            onClick={() => handleOpenModal()}
            className="bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">افزودن کلاینت</span>
          </button>
        </div>
      </div>

      {/* --- جدول کلاینت‌ها --- */}
      <div className="bg-[#242933] border border-emerald-500/20 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-[#1a1e26]/50 text-gray-400 text-xs uppercase border-b border-emerald-500/10">
              <tr>
                <th className="px-6 py-4 font-medium">کلاینت / شغل</th>
                <th className="px-6 py-4 font-medium">شماره تماس</th>
                <th className="px-6 py-4 font-medium text-center">پلن فعال</th>
                <th className="px-6 py-4 font-medium text-center">پیامک‌ها</th>
                <th className="px-6 py-4 font-medium text-center">مشتریان</th>
                <th className="px-6 py-4 font-medium text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-500/10 text-sm">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-500">
                    موردی یافت نشد
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-gray-700 to-gray-800 border border-white/10 flex items-center justify-center text-emerald-400 font-bold text-lg shadow-inner">
                          {client.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-white group-hover:text-emerald-300 transition">
                            {client.name}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                            <Briefcase className="w-3 h-3" />
                            {client.businessName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-300 font-mono text-sm">
                        <Phone className="w-3 h-3 text-emerald-500/50" />
                        {client.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                          client.plan === "طلایی"
                            ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                            : client.plan === "نقره‌ای"
                            ? "bg-gray-400/10 text-gray-300 border-gray-400/20"
                            : "bg-orange-700/10 text-orange-400 border-orange-500/20"
                        }`}
                      >
                        <Crown className="w-3 h-3" />
                        {client.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1 text-gray-300 bg-[#1a1e26] px-2 py-1 rounded-lg border border-emerald-500/10">
                        <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                        <span className="font-mono">
                          {client.smsBalance.toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1 text-gray-300">
                        <Users className="w-4 h-4 text-emerald-500/50" />
                        <span className="font-bold">
                          {client.customerCount}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal(client)}
                          className="p-2 rounded-lg text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition"
                          title="ویرایش"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setClientToDelete(client.id);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- مودال افزودن / ویرایش --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#242933] border border-emerald-500/30 rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-emerald-500/20 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">
                {currentClient ? "ویرایش کلاینت" : "افزودن کلاینت جدید"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">نام کامل</label>
                  <input
                    name="name"
                    defaultValue={currentClient?.name}
                    required
                    className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-3 text-sm focus:border-emerald-400 outline-none transition"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">نام کسب‌وکار</label>
                  <input
                    name="businessName"
                    defaultValue={currentClient?.businessName}
                    required
                    className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-3 text-sm focus:border-emerald-400 outline-none transition"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">شماره تماس</label>
                <input
                  name="phone"
                  defaultValue={currentClient?.phone}
                  required
                  className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-3 text-sm focus:border-emerald-400 outline-none transition dir-ltr text-right"
                  placeholder="0912..."
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">پلن</label>
                  <select
                    name="plan"
                    defaultValue={currentClient?.plan || "برنزی"}
                    className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-3 text-sm focus:border-emerald-400 outline-none text-white"
                  >
                    <option value="برنزی">برنزی</option>
                    <option value="نقره‌ای">نقره‌ای</option>
                    <option value="طلایی">طلایی</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">تعداد پیامک</label>
                  <input
                    type="number"
                    name="smsBalance"
                    defaultValue={currentClient?.smsBalance || 0}
                    className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-3 text-sm focus:border-emerald-400 outline-none transition"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">مشتریان اولیه</label>
                  <input
                    type="number"
                    name="customerCount"
                    defaultValue={currentClient?.customerCount || 0}
                    className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-3 text-sm focus:border-emerald-400 outline-none transition"
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-700 transition"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-linear-to-r from-emerald-500 to-emerald-600 text-white font-bold hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/20 transition"
                >
                  {currentClient ? "بروزرسانی" : "ثبت اطلاعات"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- مودال تایید حذف --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#242933] border border-red-500/30 rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">حذف کلاینت</h3>
            <p className="text-gray-400 text-sm mb-6">
              آیا از حذف این کلاینت اطمینان دارید؟ تمام اطلاعات مربوط به نوبت‌ها
              و مشتریان این کلاینت نیز حذف خواهد شد.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-700 transition"
              >
                لغو
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 shadow-lg shadow-red-500/20 transition"
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
