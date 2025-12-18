// components/CustomerList/AddClientModal.tsx
import React, { useState } from "react";
import { User, X, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddClientModal: React.FC<AddClientModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      return toast.custom((t) => (
        <div className="bg-red-600/90 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
          <X className="w-6 h-6" />
          <span>نام مشتری را وارد کنید</span>
        </div>
      ));
    }

    if (!phone.trim() || phone.length !== 11 || !/^\d{11}$/.test(phone)) {
      return toast.custom((t) => (
        <div className="bg-red-600/90 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
          <X className="w-6 h-6" />
          <span>شماره تلفن معتبر 11 رقمی وارد کنید</span>
        </div>
      ));
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/client/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
      });

      const result = await res.json();

      if (result.success) {
        toast.custom((t) => (
          <div className="bg-emerald-600/90 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
            <User className="w-6 h-6" />
            <span>{result.message || "مشتری با موفقیت ثبت شد"}</span>
          </div>
        ));
        onSuccess();
        resetAndClose();
      } else if (res.status === 409) {
        handleDuplicatePhone(result.existingName);
      } else {
        toast.custom((t) => (
          <div className="bg-red-600/90 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
            <X className="w-6 h-6" />
            <span>{result.message || "خطا در ثبت مشتری"}</span>
          </div>
        ));
      }
    } catch (e) {
      console.error("Error:", e);
      toast.custom((t) => (
        <div className="bg-red-600/90 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
          <X className="w-6 h-6" />
          <span>خطا در ارتباط با سرور</span>
        </div>
      ));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDuplicatePhone = (existingName: string) => {
    toast.custom((t) => (
      <div className="bg-[#1a1e26]/95 backdrop-blur-md border border-white/20 text-white px-6 py-5 rounded-2xl shadow-2xl max-w-md">
        <p className="text-center mb-4">
          شماره <span className="font-bold">{phone}</span> قبلاً برای مشتری{" "}
          <span className="font-bold">{existingName}</span> ثبت شده است.
          <br />
          آیا می‌خواهید نام مشتری را به <span className="font-bold">{name}</span> تغییر دهید؟
        </p>
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              toast.custom((tt) => (
                <div className="bg-gray-700/90 text-white px-6 py-4 rounded-2xl shadow-2xl">
                  عملیات لغو شد
                </div>
              ));
            }}
            className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium"
          >
            خیر
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              await handleUpdateName();
            }}
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold text-sm"
          >
            بله، تغییر بده
          </button>
        </div>
      </div>
    ));
  };

  const handleUpdateName = async () => {
    try {
      const updateRes = await fetch("/api/client/customers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), newName: name.trim() }),
      });

      const updateResult = await updateRes.json();
      if (updateResult.success) {
        toast.custom((tt) => (
          <div className="bg-emerald-600/90 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
            <User className="w-6 h-6" />
            <span>نام مشتری با موفقیت به‌روزرسانی شد</span>
          </div>
        ));
        onSuccess();
        resetAndClose();
      } else {
        toast.custom((tt) => (
          <div className="bg-red-600/90 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
            <X className="w-6 h-6" />
            <span>{updateResult.message || "خطا در به‌روزرسانی"}</span>
          </div>
        ));
      }
    } catch (e) {
      toast.custom((tt) => (
        <div className="bg-red-600/90 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
          <X className="w-6 h-6" />
          <span>خطا در ارتباط با سرور</span>
        </div>
      ));
    }
  };

  const resetAndClose = () => {
    setName("");
    setPhone("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-linear-to-b from-[#1a1e26] to-[#242933] rounded-3xl border border-white/10 shadow-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">افزودن مشتری جدید</h3>
          <button
            onClick={resetAndClose}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20"
          >
            <X className="w-5 h-5 mx-auto" />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-sm text-gray-300 mb-2 block">نام مشتری</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: علی محمدی"
              className="w-full py-3 px-4 bg-[#242933] border border-white/10 rounded-xl text-white focus:border-emerald-500/50"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-2 block">شماره تلفن (11 رقمی)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              placeholder="09123456789"
              maxLength={11}
              className="w-full py-3 px-4 bg-[#242933] border border-white/10 rounded-xl text-white focus:border-emerald-500/50"
            />
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={resetAndClose}
            disabled={isSubmitting}
            className="flex-1 py-3.5 bg-white/10 hover:bg-white/20 rounded-xl"
          >
            انصراف
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" /> در حال ثبت...
              </>
            ) : (
              "ثبت مشتری"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};