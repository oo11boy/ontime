// components/Services/ServiceModal.tsx
import React from "react";
import { RefreshCw } from "lucide-react";

interface Service {
  id: number;
  name: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
}

interface ServiceModalProps {
  isOpen: boolean;
  editData: Service | null;
  form: {
    name: string;
    price: string;
    duration_minutes: string;
  };
  isSubmitting: boolean;
  onClose: () => void;
  onFormChange: (field: string, value: string) => void;
  onSubmit: () => void;
}

export const ServiceModal: React.FC<ServiceModalProps> = ({
  isOpen,
  editData,
  form,
  isSubmitting,
  onClose,
  onFormChange,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-linear-to-b from-[#1a1e26] to-[#242933] w-full max-w-sm rounded-2xl p-5 border border-white/10 shadow-2xl">
        <h2 className="text-lg font-bold mb-4 text-center">
          {editData ? "ویرایش خدمت" : "افزودن خدمت جدید"}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-300 mb-1 block">
              نام خدمت *
            </label>
            <input
              className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50"
              placeholder="مثال: کوتاهی مو"
              value={form.name}
              onChange={(e) => onFormChange("name", e.target.value)}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-300 mb-1 block">
                قیمت (تومان)
              </label>
              <input
                type="number"
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50"
                placeholder="مثال: 80000"
                value={form.price}
                onChange={(e) => onFormChange("price", e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm text-gray-300 mb-1 block">
                مدت زمان (دقیقه) *
              </label>
              <input
                type="number"
                min="1"
                max="480"
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50"
                placeholder="مثال: 45"
                value={form.duration_minutes}
                onChange={(e) => onFormChange("duration_minutes", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition font-medium disabled:opacity-50"
          >
            انصراف
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting || !form.name.trim()}
            className="flex-1 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 transition font-bold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                در حال ذخیره...
              </>
            ) : (
              "ذخیره"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};