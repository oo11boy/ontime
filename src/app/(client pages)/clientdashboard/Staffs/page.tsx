"use client";
import React, { useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { Users, RefreshCw, Plus, HelpCircle, X, Calendar, Database, Eye, Shield, Phone, Link as LinkIcon, Clock, Check, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

// مودال راهنما
// مودال راهنما با قابلیت کپی لینک
const HelpModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [copied, setCopied] = useState(false);
  const LOGIN_URL = "https://ontimeapp.ir/login";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(LOGIN_URL);
      setCopied(true);
      toast.success("لینک با موفقیت کپی شد");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("خطا در کپی لینک");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4" dir="rtl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-[#1a1e26] border border-white/10 w-full max-w-md rounded-2xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold text-white">راهنمای مدیریت پرسنل</h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-6">
              {/* 1. نحوه اضافه کردن پرسنل */}
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-md font-bold text-emerald-400 mb-3 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  نحوه اضافه کردن پرسنل
                </h3>
                <ol className="space-y-2 text-sm text-gray-300 list-decimal list-inside mr-2">
                  <li>روی دکمه <span className="text-emerald-400">"+"</span> در هدر کلیک کنید</li>
                  <li>اطلاعات پرسنل (نام، شماره تماس) را وارد کنید</li>
                  <li>مقدار اعتبار پیامک اولیه را تعیین کنید</li>
                  <li>نوع تقویم (هماهنگ یا مستقل) را انتخاب کنید</li>
                  <li>دسترسی به مشتریان و خدمات مجاز را مشخص کنید</li>
                  <li>روی دکمه <span className="text-emerald-400">"افزودن پرسنل"</span> کلیک کنید</li>
                </ol>
              </div>

              {/* 2. لینک ورود پرسنل - با قابلیت کپی */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                <h3 className="text-md font-bold text-emerald-400 mb-3 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  لینک ورود پرسنل
                </h3>
                <p className="text-sm text-gray-300 mb-3">
                  پس از ایجاد پرسنل، لینک زیر را به او بدهید:
                </p>
                <div className="bg-[#0f1115] rounded-xl p-3 flex items-center justify-between gap-2">
                  <code className="text-emerald-400 text-sm break-all flex-1 text-center">
                    {LOGIN_URL}
                  </code>
                  <button
                    onClick={handleCopyLink}
                    className="p-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 transition flex items-center gap-1 shrink-0"
                    title="کپی لینک"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-emerald-400" />
                    )}
                    <span className="text-xs text-emerald-400 hidden sm:inline">
                      {copied ? "کپی شد" : "کپی"}
                    </span>
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  ℹ️ پرسنل با شماره تلفنی که برایش ثبت کرده‌اید وارد پنل خود می‌شود و فقط دسترسی‌های تعیین شده را خواهد داشت.
                </p>
              </div>

              {/* 3. انواع تقویم */}
              <div>
                <h3 className="text-md font-bold text-emerald-400 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  انواع تقویم
                </h3>
                <div className="space-y-3">
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <span className="font-bold text-blue-400">هماهنگ با اصلی (Synced)</span>
                    </div>
                    <p className="text-sm text-gray-300">
                      نوبت‌های رییس و پرسنل در یک تقویم مشترک نمایش داده می‌شوند.<br />
                      پرسنل می‌تواند نوبت‌های رییس را ببیند و نوبت‌هایش با نوبت‌های رییس تداخل نخواهد داشت.
                    </p>
                  </div>
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      <span className="font-bold text-purple-400">مستقل (Independent)</span>
                    </div>
                    <p className="text-sm text-gray-300">
                      پرسنل فقط نوبت‌های خودش را می‌بیند.<br />
                      نوبت‌های پرسنل در تقویم رییس نمایش داده نمی‌شود و کاملاً جدا از سیستم اصلی است.
                    </p>
                  </div>
                </div>
              </div>

              {/* 4. اعتبار پیامک */}
              <div>
                <h3 className="text-md font-bold text-emerald-400 mb-3 flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  اعتبار پیامک پرسنل
                </h3>
                <div className="bg-white/5 rounded-xl p-4 space-y-2">
                  <p className="text-sm text-gray-300">
                    هر پرسنل دارای یک <span className="text-emerald-400">اعتبار پیامک جداگانه</span> است.
                  </p>
                  <ul className="text-sm text-gray-300 list-disc list-inside mr-4 space-y-1">
                    <li>پیامک‌های ارسالی توسط پرسنل از <span className="text-emerald-400">اعتبار خودش</span> کسر می‌شود</li>
                    <li>در صورت اتمام اعتبار، پرسنل نمی‌تواند پیامک ارسال کند</li>
                    <li>مدیر می‌تواند در هر زمان اعتبار پرسنل را افزایش/کاهش دهد</li>
                    <li>در صورت حذف پرسنل، اعتبار باقیمانده به حساب اصلی بازگردانده می‌شود</li>
                  </ul>
                </div>
              </div>

              {/* 5. دسترسی به مشتریان */}
              <div>
                <h3 className="text-md font-bold text-emerald-400 mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  دسترسی به مشتریان
                </h3>
                <div className="bg-white/5 rounded-xl p-4 space-y-2">
                  <ul className="text-sm text-gray-300 list-disc list-inside mr-4 space-y-1">
                    <li><span className="text-emerald-400">دسترسی به همه مشتریان</span>: پرسنل می‌تواند لیست تمام مشتریان کسب‌وکار را ببیند</li>
                    <li><span className="text-emerald-400">فقط مشتریان خود</span>: پرسنل فقط مشتریانی که خودش برایشان نوبت ثبت کرده را می‌بیند</li>
                  </ul>
                </div>
              </div>

              {/* 6. خدمات مجاز */}
              <div>
                <h3 className="text-md font-bold text-emerald-400 mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  خدمات مجاز
                </h3>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-sm text-gray-300">
                    می‌توانید تعیین کنید هر پرسنل فقط به <span className="text-emerald-400">خدمات خاصی</span> دسترسی داشته باشد.<br />
                    پرسنل در هنگام ثبت نوبت فقط می‌تواند از بین خدمات مجاز خود انتخاب کند.
                  </p>
                </div>
              </div>

              {/* 7. حذف پرسنل */}
              <div>
                <h3 className="text-md font-bold text-red-400 mb-3 flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  حذف پرسنل
                </h3>
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                  <ul className="text-sm text-gray-300 list-disc list-inside mr-4 space-y-1">
                    <li>اگر پرسنل <span className="text-red-400">نوبت فعال نداشته باشد</span>، به راحتی حذف می‌شود</li>
                    <li>اگر نوبت فعال داشته باشد، ابتدا باید نوبت‌ها را لغو کنید</li>
                    <li>با <span className="text-red-400">حذف اجباری</span>، تمام نوبت‌های فعال پرسنل به صورت خودکار لغو می‌شوند</li>
                    <li>اعتبار پیامک باقیمانده به حساب اصلی بازگردانده می‌شود</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition"
              >
                متوجه شدم
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const HeaderSection: React.FC<{
  onAddClick: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  onHelpClick: () => void;
}> = ({ onAddClick, onRefresh, isLoading, onHelpClick }) => {
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
              onClick={onHelpClick}
              className="p-2.5 flex items-center space-x-2 rounded-xl bg-white/10 hover:bg-white/20 transition"
              title="راهنما"
            >
              <HelpCircle className="w-5 h-5 text-gray-300" /> 
              <span>راهنما</span>
            </button>

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

  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Staff | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const staffs = staffsData?.staffs || [];

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
          refetch();
        },
        onError: (error: any) => {
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
          onHelpClick={() => setShowHelpModal(true)}
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

      {/* مودال راهنما */}
      <HelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
    </div>
  );
}

// ایمپورت Trash2 برای استفاده در مودال
import { Trash2 } from "lucide-react";

