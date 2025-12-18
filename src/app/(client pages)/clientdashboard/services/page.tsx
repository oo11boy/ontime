// src/app/(client pages)/clientdashboard/services/page.tsx
"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import { HeaderSection } from "./components/HeaderSection";
import { RefreshButton } from "./components/RefreshButton";
import { ServicesList } from "./components/ServicesList";
import { ServiceModal } from "./components/ServiceModal";
import Footer from "../components/Footer/Footer";

interface Service {
  id: number;
  name: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
}

export default function ServicesListPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Service | null>(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    duration_minutes: "30",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // فرمت کردن قیمت
  const formatPrice = (price: number) => {
    return (
      new Intl.NumberFormat("fa-IR", {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price) + " تومان"
    );
  };

  // دریافت سرویس‌ها از API
  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/client/services");
      const data = await response.json();

      if (data.success) {
        setServices(data.services || []);
      } else {
        toast.error(data.message || "خطا در دریافت خدمات");
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // توابع مربوط به مودال
  const openAddModal = () => {
    setEditData(null);
    setForm({ name: "", price: "", duration_minutes: "30" });
    setModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    setEditData(service);
    setForm({
      name: service.name,
      price: service.price.toString(),
      duration_minutes: service.duration_minutes.toString(),
    });
    setModalOpen(true);
  };

  const handleFormChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ارسال فرم
  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("نام خدمت الزامی است");
      return;
    }

    if (!form.duration_minutes || parseInt(form.duration_minutes) <= 0) {
      toast.error("مدت زمان باید بیشتر از صفر باشد");
      return;
    }

    setIsSubmitting(true);

    try {
      const url = editData
        ? `/api/client/services/${editData.id}`
        : "/api/client/services";

      const method = editData ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          price: form.price ? parseFloat(form.price) : 0,
          duration_minutes: parseInt(form.duration_minutes) || 30,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setModalOpen(false);
        fetchServices();
      } else {
        toast.error(data.message || "خطا در ذخیره‌سازی");
      }
    } catch (error) {
      console.error("Frontend error:", error);
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setIsSubmitting(false);
    }
  };

  // حذف سرویس
  const handleDelete = async (id: number) => {
    if (!confirm("آیا از حذف این خدمت اطمینان دارید؟")) return;

    try {
      const response = await fetch(`/api/client/services/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        fetchServices();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("خطا در حذف خدمت");
    }
  };

  // تغییر وضعیت سرویس
  const toggleServiceStatus = async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/client/services/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_active: !currentStatus,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        fetchServices();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error toggling service:", error);
      toast.error("خطا در تغییر وضعیت");
    }
  };

  return (
    <div className="h-screen text-white overflow-auto max-w-md m-auto">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#1a1e26",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
          },
        }}
      />

      <div className="min-h-screen bg-linear-to-br from-[#1a1e26] to-[#242933] text-white pb-24">
        <HeaderSection onAddClick={openAddModal} />

        <RefreshButton isLoading={isLoading} onRefresh={fetchServices} />

        {/* لیست سرویس‌ها */}
        <div className="px-4 mt-4 space-y-3">
          <ServicesList
            services={services}
            isLoading={isLoading}
            formatPrice={formatPrice}
            onToggleStatus={toggleServiceStatus}
            onEdit={openEditModal}
            onDelete={handleDelete}
            onOpenAddModal={openAddModal}
          />
        </div>

    
        <ServiceModal
          isOpen={modalOpen}
          editData={editData}
          form={form}
          isSubmitting={isSubmitting}
          onClose={() => setModalOpen(false)}
          onFormChange={handleFormChange}
          onSubmit={handleSubmit}
        />
      </div>

      <Footer />
    </div>
  );
}