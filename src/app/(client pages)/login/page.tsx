"use client";
import React, { JSX, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Phone,
  User,
  CheckCircle,
  ArrowLeft,
  Loader2,
  RefreshCw,
  LayoutDashboard,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

export default function LoginPage(): JSX.Element {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp" | "signup">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [job, setJob] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const otpContainerRef = useRef<HTMLDivElement | null>(null);
  const [jobs, setJobs] = useState<{ id: number; name: string }[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // هندل کردن گام‌های ورود
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("step") === "signup") setStep("signup");
    }
  }, []);

  useEffect(() => {
    if (step === "otp") inputRefs.current[0]?.focus();
  }, [step]);

  // تایمر ارسال مجدد
  useEffect(() => {
    let t: NodeJS.Timeout;
    if (resendCooldown > 0) {
      t = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    }
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // لود لیست مشاغل
  useEffect(() => {
    const loadJobs = async () => {
      try {
        const res = await fetch("/api/client/jobs/list");
        const data = await res.json();
        setJobs(data.jobs || []);
      } catch (err) {
        setJobs([
          { id: 1, name: "آرایشگر" },
          { id: 2, name: "وکیل" },
          { id: 3, name: "دندان‌پزشک" },
        ]);
      } finally {
        setLoadingJobs(false);
      }
    };
    if (step === "signup") loadJobs();
  }, [step]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{11}$/.test(phone)) {
      toast.error("شماره موبایل معتبر (۱۱ رقم) وارد کنید");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/client/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (res.ok) {
        setStep("otp");
        setResendCooldown(60); // افزایش زمان برای سیستم واقعی
        toast.success("کد تأیید به شماره شما ارسال شد");
      } else {
        const data = await res.json();
        toast.error(data.message || "خطا در ارسال کد");
      }
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const currentOtpArr = otp.split("");
    currentOtpArr[index] = value;
    const newOtp = currentOtpArr.join("");
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("کد ۶ رقمی را کامل وارد کنید");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/client/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();

      if (res.ok) {
        if (data.signup_complete) {
          toast.success("خوش آمدید!");
          router.push("/clientdashboard");
        } else {
          setStep("signup");
          router.replace("/login?step=signup");
        }
      } else {
        toast.error(data.message || "کد وارد شده صحیح نیست");
      }
    } catch {
      toast.error("خطا در تأیید کد");
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !job) {
      toast.error("تکمیل تمام فیلدها الزامی است");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/client/auth/signup-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), job_id: job }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.show_welcome_modal)
          sessionStorage.setItem("show_welcome_modal", "true");
        toast.success("ثبت‌نام تکمیل شد");
        router.push("/clientdashboard");
      } else {
        toast.error(data.message || "خطا در ثبت اطلاعات");
      }
    } catch {
      toast.error("خطا در اتصال");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#0f1115] text-white flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <LayoutDashboard className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-bold">آنتایم</h1>
              <p className="text-xs text-gray-400">مدیریت هوشمند نوبت‌دهی</p>
            </div>
          </div>
          {step !== "phone" && (
            <button
              onClick={() => setStep(step === "signup" ? "otp" : "phone")}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-8">
          <AnimatePresence mode="wait">
            {step === "phone" && (
              <motion.form
                key="phone"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handlePhoneSubmit}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 mr-1">
                    شماره موبایل
                  </label>
                  <div className="relative">
                    <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))
                      }
                      placeholder="۰۹۱XXXXXXXX"
                      className="w-full pr-12 pl-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      dir="ltr"
                    />
                  </div>
                </div>
                <button
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 font-bold text-black transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "دریافت کد تایید"
                  )}
                </button>
              </motion.form>
            )}

            {step === "otp" && (
              <motion.form
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleOtpSubmit}
                className="space-y-8"
              >
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-400">
                    کد ارسال شده به {phone} را وارد کنید
                  </p>
                </div>
                <div className="flex justify-between gap-2" dir="ltr">
                  {[...Array(6)].map((_, i) => (
                    <input
                      key={i}
                 ref={(el) => { inputRefs.current[i] = el; }}
                      type="text"
                      maxLength={1}
                      inputMode="numeric"
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Backspace" &&
                        !otp[i] &&
                        inputRefs.current[i - 1]?.focus()
                      }
                      className="w-12 h-14 text-center bg-white/5 border border-white/10 rounded-xl text-xl font-bold focus:border-emerald-500 outline-none transition-all"
                    />
                  ))}
                </div>
                <div className="flex flex-col gap-4">
                  <button
                    disabled={loading}
                    className="w-full py-4 rounded-2xl bg-emerald-500 text-black font-bold"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      "تایید و ادامه"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      resendCooldown === 0 &&
                      handlePhoneSubmit(new Event("submit") as any)
                    }
                    disabled={resendCooldown > 0}
                    className="text-sm text-emerald-500 disabled:text-gray-500 flex items-center justify-center gap-2"
                  >
                    {resendCooldown > 0 ? (
                      `${resendCooldown} ثانیه تا ارسال مجدد`
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" /> ارسال مجدد کد
                      </>
                    )}
                  </button>
                </div>
              </motion.form>
            )}

            {step === "signup" && (
              <motion.form
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={handleSignupSubmit}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 block mb-2">
                      نام و نام‌ خانوادگی 
                    </label>
                    <div className="relative">
                      <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pr-12 pl-4 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="مثلا: سالن زیبایی نیل"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-2">
                      نوع فعالیت
                    </label>
                    <select
                      value={job}
                      onChange={(e) => setJob(e.target.value)}
                      className="w-full px-4 py-4 bg-[#1d2026] border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                    >
                      <option value="">انتخاب کنید...</option>
                      {jobs.map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-emerald-500 text-black font-bold flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" /> ورود به پنل مدیریت
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
