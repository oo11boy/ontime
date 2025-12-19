"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import { HeaderSection } from "./components/HeaderSection";
import { RefreshButton } from "./components/RefreshButton";
import { ServicesList } from "./components/ServicesList";
import { ServiceModal } from "./components/ServiceModal";
import Footer from "../components/Footer/Footer";
import {
  useServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
  useToggleService,
} from "@/hooks/useServices";

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

  const { data: servicesData, isLoading, refetch: fetchServices } = useServices();
  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();
  const toggleService = useToggleService();

  const services = servicesData?.services || [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Service | null>(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    duration_minutes: "30",
  });

  const formatPrice = (price: number) => {
    return (
      new Intl.NumberFormat("fa-IR", {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price) + " تومان"
    );
  };

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

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("نام خدمت الزامی است");
      return;
    }

    if (!form.duration_minutes || parseInt(form.duration_minutes) <= 0) {
      toast.error("مدت زمان باید بیشتر از صفر باشد");
      return;
    }

    const serviceData = {
      name: form.name.trim(),
      price: form.price ? parseFloat(form.price) : 0,
      duration_minutes: parseInt(form.duration_minutes) || 30,
    };

    if (editData) {
      updateService.mutate(
        {
          url: `/api/client/services/${editData.id}`,
          data: serviceData,
        },
        {
          onSuccess: () => {
            toast.success("خدمت با موفقیت به‌روزرسانی شد");
            setModalOpen(false);
            setEditData(null);
          },
          onError: (error: any) => {
            toast.error(error.message || "خطا در ذخیره‌سازی");
          },
        }
      );
    } else {
      createService.mutate(serviceData, {
        onSuccess: () => {
          toast.success("خدمت با موفقیت ایجاد شد");
          setModalOpen(false);
        },
        onError: (error: any) => {
          toast.error(error.message || "خطا در ذخیره‌سازی");
        },
      });
    }
  };

  const handleDelete = (id: number) => {
    if (!confirm("آیا از حذف این خدمت اطمینان دارید؟")) return;

    deleteService.mutate(
      { url: `/api/client/services/${id}` },
      {
        onSuccess: () => {
          toast.success("خدمت با موفقیت حذف شد");
        },
        onError: (error: any) => {
          toast.error(error.message || "خطا در حذف خدمت");
        },
      }
    );
  };

  const handleToggleStatus = (id: number, currentStatus: boolean) => {
    toggleService.mutate(
      {
        url: `/api/client/services/${id}`,
        data: { is_active: !currentStatus },
      },
      {
        onSuccess: () => {
          toast.success("وضعیت خدمت با موفقیت تغییر کرد");
        },
        onError: (error: any) => {
          toast.error(error.message || "خطا در تغییر وضعیت");
        },
      }
    );
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

        <div className="px-4 mt-4 space-y-3">
          <ServicesList
            services={services}
            isLoading={isLoading}
            formatPrice={formatPrice}
            onToggleStatus={handleToggleStatus}
            onEdit={openEditModal}
            onDelete={handleDelete}
            onOpenAddModal={openAddModal}
          />
        </div>

        <ServiceModal
          isOpen={modalOpen}
          editData={editData}
          form={form}
          isSubmitting={createService.isPending || updateService.isPending}
          onClose={() => {
            setModalOpen(false);
            setEditData(null);
            setForm({ name: "", price: "", duration_minutes: "30" });
          }}
          onFormChange={handleFormChange}
          onSubmit={handleSubmit}
        />
      </div>

      <Footer />
    </div>
  );
}