"use client";
import React, { useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { Users, RefreshCw, Plus } from "lucide-react";

import {
  useStaffs,
  useCreateStaff,
  useUpdateStaff,
  useDeleteStaff,
} from "@/hooks/useStaffs";
import Footer from "../components/Footer/Footer";
import { StaffModal } from "./components/StaffModal";
import { StaffsList } from "./components/StaffsList";

interface Staff {
  id: number;
  name: string;
  phone: string;
  sms_balance: number;
  sms_used: number;
  service_ids: string | null;
  services: { id: number; name: string }[];
  calendar_type: string;
  can_see_all_clients: boolean;
  is_active: boolean;
  active_bookings?: number;
  created_at: string;
}

const HeaderSection: React.FC<{
  onAddClick: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}> = ({ onAddClick, onRefresh, isLoading }) => {
  const [isForcingSpin, setIsForcingSpin] = useState(false);

  const handleRefreshClick = () => {
    setIsForcingSpin(true);
    onRefresh();
    setTimeout(() => setIsForcingSpin(false), 1000);
  };

  return (
    <div className="sticky top-0 z-50 bg-[#1a1e26]/90 backdrop-blur-xl border-b border-emerald-500/30 text-white">
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-md font-bold flex items-center gap-3">
            <Users className="w-7 h-7 text-emerald-400" />
            مدیریت پرسنل
          </h1>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefreshClick}
              disabled={isLoading || isForcingSpin}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition disabled:opacity-50"
            >
              <RefreshCw
                className={`w-5 h-5 ${(isLoading || isForcingSpin) ? "animate-spin text-emerald-400" : "text-gray-300"}`}
              />
            </button>

            <button
              onClick={onAddClick}
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 transition text-white"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function StaffsPage() {
  const { data: staffsData, isLoading, refetch } = useStaffs();
  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();
  const deleteStaff = useDeleteStaff();

  const staffs = staffsData?.staffs || [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Staff | null>(null);

  const openAddModal = () => {
    setEditData(null);
    setModalOpen(true);
  };

  const openEditModal = (staff: Staff) => {
    setEditData(staff);
    setModalOpen(true);
  };

  const handleCreate = async (data: any) => {
    createStaff.mutate(data, {
      onSuccess: (result) => {
        toast.success(result.message || "پرسنل با موفقیت اضافه شد");
        setModalOpen(false);
        setEditData(null);
        refetch();
      },
      onError: (error: any) => {
        toast.error(error.message || "خطا در ایجاد پرسنل");
      },
    });
  };

  const handleUpdate = async (data: any) => {
    updateStaff.mutate(data, {
      onSuccess: (result) => {
        toast.success(result.message || "پرسنل با موفقیت ویرایش شد");
        setModalOpen(false);
        setEditData(null);
        refetch();
      },
      onError: (error: any) => {
        toast.error(error.message || "خطا در ویرایش پرسنل");
      },
    });
  };

  const handleDelete = async (id: number, force?: boolean) => {
    deleteStaff.mutate(
      { id, force: force || false },
      {
        onSuccess: (result) => {
          // پیام موفقیت در خود هوک نمایش داده می‌شود
          refetch();
        },
        onError: (error: any) => {
          // خطاها در هوک مدیریت می‌شوند
          console.error("Delete error:", error);
        },
      }
    );
  };

  const handleModalSubmit = (data: any) => {
    if (editData) {
      handleUpdate({ ...data, id: editData.id });
    } else {
      handleCreate(data);
    }
  };

  return (
    <div className="min-h-screen text-white overflow-auto max-w-md m-auto">
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

      <div className="min-h-screen bg-gradient-to-br from-[#1a1e26] to-[#242933] text-white pb-24">
        <HeaderSection
          onAddClick={openAddModal}
          onRefresh={() => refetch()}
          isLoading={isLoading}
        />

        <div className="px-4 mt-6">
          <StaffsList
            staffs={staffs}
            isLoading={isLoading}
            onEdit={openEditModal}
            onDelete={handleDelete}
            onOpenAddModal={openAddModal}
          />
        </div>

        <StaffModal
          isOpen={modalOpen}
          editData={editData}
          isSubmitting={createStaff.isPending || updateStaff.isPending}
          onClose={() => {
            setModalOpen(false);
            setEditData(null);
          }}
          onSubmit={handleModalSubmit}
        />
      </div>

      <Footer />
    </div>
  );
}