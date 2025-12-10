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
  SaladIcon,
} from "lucide-react";
import { motion } from "framer-motion";
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const initialStep = urlParams.get('step');
        if (initialStep === 'signup') {
            setStep('signup');
        }
    }
    if (step === "otp") inputRefs.current[0]?.focus();
  }, [step]);

  useEffect(() => {
    let t: NodeJS.Timeout | undefined;
    if (resendCooldown > 0) {
      t = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    }
    return () => clearTimeout(t);
  }, [resendCooldown]);

  useEffect(() => {
    const node = otpContainerRef.current;
    if (!node) return;

    const onPaste = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData("text")?.trim();
      if (text && /^\d{6}$/.test(text)) {
        setOtp(text);
        text.split("").forEach((ch, i) => {
          if (inputRefs.current[i]) inputRefs.current[i]!.value = ch;
        });
        inputRefs.current[5]?.focus();
      }
    };

    node.addEventListener("paste", onPaste as EventListener);
    return () => node.removeEventListener("paste", onPaste as EventListener);
  }, []);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{11}$/.test(phone)) {
      toast.error("شماره موبایل باید ۱۱ رقم باشد");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setStep("otp");
        setResendCooldown(30);
        toast.success("کد تأیید ارسال شد! (تست: 123456)");
      } else {
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
    const arr = otp.padEnd(6, "").split("");
    arr[index] = value;
    const joined = arr.join("").slice(0, 6);
    setOtp(joined);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0)
      inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5)
      inputRefs.current[index + 1]?.focus();
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      toast.error("کد ۶ رقمی را کامل وارد کنید");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok) {
        if (data.signup_complete) {
          toast.success("با موفقیت وارد شدید!");
          router.push("/clientdashboard");
        } else {
          setStep("signup");
          router.replace("/login?step=signup");
          toast("لطفاً اطلاعات سالن خود را تکمیل کنید", { icon: "✏️" });
        }
      } else {
        toast.error(data.message || "کد تأیید اشتباه است");
        setOtp("");
        inputRefs.current.forEach((input) => input && (input.value = ""));
        inputRefs.current[0]?.focus();
      }
    } catch {
      toast.error("خطا در تأیید کد");
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("نام سالن یا نام خود را وارد کنید");
      return;
    }
    if (!job || job === "") {
      toast.error("لطفاً شاخه کاری خود را انتخاب کنید");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup-complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name: name.trim(), job_id: job }),
      });
      const data = await res.json();
      if (res.ok) {
        // اگر اولین بار باشد، فلگ مودال را در sessionStorage ذخیره کن
        if (data.show_welcome_modal) {
          sessionStorage.setItem("show_welcome_modal", "true");
        }

        toast.success("ثبت‌نام با موفقیت تکمیل شد!");
        router.push("/clientdashboard");
      } else {
        toast.error(data.message || "خطا در تکمیل ثبت‌نام");
      }
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    if (resendCooldown > 0 || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, resend: true }),
        credentials: "include",
      });
      if (res.ok) {
        toast.success("کد مجدداً ارسال شد");
        setResendCooldown(30);
      } else {
        const data = await res.json();
        toast.error(data.message || "خطا در ارسال مجدد");
      }
    } catch {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step === "otp") {
      setStep("phone");
      setOtp("");
    }
    if (step === "signup") {
        setStep("otp");
        router.replace("/login");
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-linear-to-br from-[#1a1e26] to-[#242933] text-white flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-xl">
              <SaladIcon className="w-8 h-8 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-bold">خوش آمدید</h1>
              <p className="text-sm text-gray-400">
                ورود یا ثبت‌نام در چند ثانیه
              </p>
            </div>
          </div>
          {step !== "phone" && (
            <button
              onClick={goBack}
              className="p-3 rounded-xl bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
          <div className="p-8">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {step === "phone" && (
                <form onSubmit={handlePhoneSubmit} className="space-y-6">
                  <div className="relative">
                    <Phone className="absolute right-4 top-4 w-5 h-5 text-emerald-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))
                      }
                      placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                      className="w-full pr-12 pl-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                      dir="ltr"
                      inputMode="numeric"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-2xl bg-linear-to-r from-emerald-500 to-emerald-600 font-bold text-lg shadow-lg hover:shadow-emerald-500/50 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "ارسال کد تأیید"
                    )}
                  </button>
                </form>
              )}

              {step === "otp" && (
                <form onSubmit={handleOtpSubmit} className="space-y-8">
                  <div
                    ref={otpContainerRef}
                    className="flex justify-center flex-row-reverse gap-3"
                  >
                    {Array(6)
                      .fill(0)
                      .map((_, i) => (
                        <input
                          key={i}
                          ref={(el) => {
                            inputRefs.current[i] = el;
                          }}
                          type="text"
                          maxLength={1}
                          inputMode="numeric"
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          className="w-8 h-10  text-xl font-bold text-center bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                        />
                      ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={resendCode}
                      disabled={resendCooldown > 0 || loading}
                      className="text-xs text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-2"
                    >
                      {resendCooldown > 0 ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          ارسال مجدد ({resendCooldown}ث)
                        </>
                      ) : (
                        "ارسال مجدد کد"
                      )}
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3 rounded-xl bg-emerald-500 font-bold hover:bg-emerald-600 transition-all disabled:opacity-70 flex items-center gap-2"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        "تأیید کد"
                      )}
                    </button>
                  </div>
                </form>
              )}

              {step === "signup" && (
                <form onSubmit={handleSignupSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      نام سالن یا نام شما
                    </label>
                    <div className="relative">
                      <User className="absolute right-4 top-4 w-5 h-5 text-emerald-400" />
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="مثال: سالن زیبایی آرمان"
                        className="w-full pr-12 pl-5 py-4 bg-white/10 border border-white/20 rounded-2xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      شاخه کاری
                    </label>
                    <select
                      value={job}
                      onChange={(e) => setJob(e.target.value)}
                      className="w-full px-5 py-4 bg-[#40444B] border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all appearance-none"
                      style={{ backgroundImage: "none" }}
                    >
                      <option value="">انتخاب کنید...</option>
                      <option value="1">اصلاح مو و ریش</option>
                      <option value="2">ناخن‌کاری</option>
                      <option value="3">آرایشگر زنانه</option>
                      <option value="4">لیزر و زیبایی</option>
                      <option value="5">سایر</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-2xl bg-linear-to-r from-emerald-500 to-emerald-600 font-bold text-lg shadow-lg hover:shadow-emerald-500/50 transition-all disabled:opacity-70 flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        تکمیل ثبت‌نام و ورود
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          با ادامه، <span className="text-emerald-400">قوانین و شرایط</span> و{" "}
          <span className="text-emerald-400">حریم خصوصی</span> را می‌پذیرید.
        </div>
      </motion.div>
    </div>
  );
}