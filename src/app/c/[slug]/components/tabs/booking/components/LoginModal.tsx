"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, X, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (name: string, phone: string, token: string) => void;
  slug: string;
}

export function LoginModal({ isOpen, onClose, onLogin, slug }: LoginModalProps) {
  const [step, setStep] = useState<"info" | "otp">("info");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!name.trim()) {
      toast.error("لطفاً نام خود را وارد کنید");
      return;
    }
    if (!phone.trim() || phone.length < 10) {
      toast.error("لطفاً شماره موبایل معتبر وارد کنید");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/customer/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, slug }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setStep("otp");
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("خطا در ارسال کد تایید");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode.trim() || otpCode.length < 4) {
      toast.error("کد تایید معتبر وارد کنید");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/customer/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, slug, code: otpCode }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("خوش آمدید!");
        onLogin(name, phone, data.customer?.token || "");
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("خطا در تأیید کد");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-800/95 backdrop-blur-2xl rounded-3xl w-full max-w-md border border-white/20 shadow-2xl"
      >
        <div className="p-5 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white">
              {step === "info" ? "ورود / ثبت‌نام" : "تأیید کد"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {step === "info" ? (
            <>
              <div>
                <label className="block text-sm text-gray-400 mb-2">نام و نام خانوادگی</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="علی محمدی"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">شماره موبایل</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                  placeholder="09123456789"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 transition"
                  dir="ltr"
                />
              </div>
              <button
                onClick={handleSendOtp}
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white font-bold transition hover:shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "دریافت کد تأیید"}
              </button>
              <p className="text-xs text-gray-500 text-center">
                کد تأیید به شماره شما ارسال می‌شود
              </p>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm text-gray-400 mb-2 text-center">کد تأیید</label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="******"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-center text-2xl font-bold tracking-widest placeholder:text-gray-600 focus:outline-none focus:border-emerald-500"
                  dir="ltr"
                  maxLength={6}
                />
              </div>
              <button
                onClick={handleVerifyOtp}
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white font-bold transition hover:shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "ورود به حساب"}
              </button>
              <button
                onClick={() => setStep("info")}
                className="w-full py-2 text-sm text-gray-500 hover:text-gray-400 transition flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                بازگشت
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}