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
    // ۱. اعتبارسنجی نام
    if (!name.trim()) {
      return toast.custom((t) => (
        <div className="bg-red-600/90 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
          <X className="w-6 h-6" />
          <span>نام مشتری را وارد کنید</span>
        </div>
      ));
    }

    // ۲. نرمال‌سازی و اعتبارسنجی شماره تلفن
    const cleanPhone = phone.replace(/\D/g, ""); // حذف کاراکترهای غیر عددی
    const normalizedPhone = cleanPhone.slice(-10); // گرفتن ۱۰ رقم آخر (حذف صفر اول)

    if (normalizedPhone.length !== 10 || !/^[9][0-9]{9}$/.test(normalizedPhone)) {
      return toast.custom((t) => (
        <div className="bg-red-600/90 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
          <X className="w-6 h-6" />
          <span>شماره تلفن معتبر وارد کنید (مثلاً 09123456789)</span>
        </div>
      ));
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/client/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: name.trim(), 
          phone: normalizedPhone // ارسال شماره ۱۰ رقمی به دیتابیس
        }),
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
        handleDuplicatePhone(result.existingName, normalizedPhone);
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

  const handleDuplicatePhone = (existingName: string, normalizedPhone: string) => {
    toast.custom((t) => (
      <div className="bg-[#1a1e26]/95 backdrop-blur-md border border-white/20 text-white px-6 py-5 rounded-2xl shadow-2xl max-w-md">
        <p className="text-center mb-4">
          شماره <span className="font-bold text-emerald-400">0{normalizedPhone}</span> قبلاً برای مشتری{" "}
          <span className="font-bold text-emerald-400">{existingName}</span> ثبت شده است.
          <br />
          آیا می‌خواهید نام را به <span className="font-bold text-emerald-400">{name}</span> تغییر دهید؟
        </p>
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors"
          >
            خیر
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              await handleUpdateName(normalizedPhone);
            }}
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold text-sm transition-colors"
          >
            بله، تغییر بده
          </button>
        </div>
      </div>
    ), { duration: 6000 });
  };

  const handleUpdateName = async (normalizedPhone: string) => {
    try {
      const updateRes = await fetch("/api/client/customers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalizedPhone, newName: name.trim() }),
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
        toast.error(updateResult.message || "خطا در به‌روزرسانی");
      }
    } catch (e) {
      toast.error("خطا در ارتباط با سرور");
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
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 mx-auto" />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">نام مشتری</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: علی محمدی"
              className="w-full py-3.5 px-4 bg-[#14171d] border border-white/5 rounded-xl text-white focus:border-emerald-500/50 outline-hidden transition-all"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">شماره تلفن</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              placeholder="09123456789"
              maxLength={11}
              className="w-full py-3.5 px-4 bg-[#14171d] border border-white/5 rounded-xl text-white focus:border-emerald-500/50 outline-hidden transition-all text-left"
              dir="ltr"
            />
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={resetAndClose}
            disabled={isSubmitting}
            className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-colors disabled:opacity-50"
          >
            انصراف
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-emerald-900/20"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                در حال ثبت...
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