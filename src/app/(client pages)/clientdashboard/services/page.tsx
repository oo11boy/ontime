"use client";
import React, { useState } from "react";
import {
  Scissors,
  Plus,
  Edit2,
  Trash2,
  ArrowLeft,
  Clock,
  Tag,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Footer from "../components/Footer/Footer";
interface Service {
  id: number;
  name: string;
  price: string;
  duration: string;
}
export default function ServicesListPage() {
  const router = useRouter();

  const [services, setServices] = useState([
    { id: 1, name: "کوتاهی مو", price: "۸۰,۰۰۰ تومان", duration: "۴۵ دقیقه" },
    { id: 2, name: "اصلاح ریش", price: "۵۰,۰۰۰ تومان", duration: "۲۰ دقیقه" },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Service | null>(null);
  const [form, setForm] = useState({ name: "", price: "", duration: "" });

  const openAddModal = () => {
    setEditData(null);
    setForm({ name: "", price: "", duration: "" });
    setModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    setEditData(service);
    setForm({
      name: service.name,
      price: service.price,
      duration: service.duration,
    });
    setModalOpen(true);
  };

  const saveService = () => {
    if (!form.name) return alert("نام خدمت ضروری است");

    if (editData) {
      setServices((prev) =>
        prev.map((s) => (s.id === editData.id ? { ...s, ...form } : s))
      );
    } else {
      setServices((prev) => [...prev, { id: Date.now(), ...form }]);
    }

    setModalOpen(false);
  };

  const handleDelete = (id: any) => {
    if (confirm("حذف شود؟")) setServices((p) => p.filter((s) => s.id !== id));
  };

  return (
           <div className="h-screen text-white overflow-auto max-w-md m-auto">
  
    <div className="min-h-screen bg-linear-to-br from-[#1a1e26] to-[#242933] text-white pb-24">
      <header className="sticky top-0 z-50 bg-[#0f1117]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex justify-between items-center">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center active:scale-90"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">خدمات</h1>
        <button
          onClick={openAddModal}
          className="bg-emerald-600 px-3 py-2 rounded-xl text-sm font-bold active:scale-90"
        >
          افزودن
        </button>
      </header>

      <div className="px-4 mt-4 space-y-3">
        {services.map((service) => (
          <div
            key={service.id}
            className="bg-white/5 border border-white/10 rounded-xl p-3 flex justify-between items-center"
          >
            <div className="text-right">
              <p className="font-bold">{service.name}</p>
              <p className="text-xs text-emerald-300 mt-1 flex gap-1 items-center">
                <Tag className="w-3 h-3" />
                {service.price}
              </p>
              <p className="text-xs text-gray-400 mt-1 flex gap-1 items-center">
                <Clock className="w-3 h-3" />
                {service.duration}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => openEditModal(service)}
                className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center active:scale-90"
              >
                <Edit2 className="w-4 h-4 text-blue-400" />
              </button>
              <button
                onClick={() => handleDelete(service.id)}
                className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center active:scale-90"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Add Button */}
      <button
        onClick={openAddModal}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 w-14 h-14 bg-emerald-600 rounded-full flex items-center justify-center shadow-xl active:scale-95"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-[#1a1d25] w-full max-w-sm rounded-2xl p-5 border border-white/10">
            <h2 className="text-lg font-bold mb-4 text-center">
              {editData ? "ویرایش خدمت" : "افزودن خدمت"}
            </h2>

            <div className="space-y-4">
              <input
                className="w-full bg-white/10 rounded-xl px-3 py-2 text-sm"
                placeholder="نام خدمت"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                className="w-full bg-white/10 rounded-xl px-3 py-2 text-sm"
                placeholder="قیمت"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
              <input
                className="w-full bg-white/10 rounded-xl px-3 py-2 text-sm"
                placeholder="مدت زمان"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
              />
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-gray-600/30 active:scale-90"
              >
                انصراف
              </button>
              <button
                onClick={saveService}
                className="px-4 py-2 rounded-xl bg-emerald-600 active:scale-90 font-bold"
              >
                ذخیره
              </button>
            </div>
          </div>
        </div>
      )}

    </div>

         <Footer />
              </div>
  );
}
