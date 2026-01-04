"use client";
import React, { JSX, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Phone, User, CheckCircle, ArrowRight, Loader2,
  RefreshCw, Sparkles, Briefcase
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
  const [jobs, setJobs] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("step") === "signup") setStep("signup");
    }
  }, []);

  useEffect(() => {
    if (step === "otp") setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }, [step]);

  useEffect(() => {
    let t: NodeJS.Timeout;
    if (resendCooldown > 0) t = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const res = await fetch("/api/client/jobs/list");
        const data = await res.json();
        setJobs(data.jobs || []);
      } catch {
        setJobs([{ id: 1, name: "آرایشگر" }, { id: 2, name: "وکیل" }, { id: 3, name: "دندان‌پزشک" }]);
      }
    };
    if (step === "signup") loadJobs();
  }, [step]);

  const handlePhoneSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!/^\d{11}$/.test(phone)) return toast.error("شماره ۱۱ رقمی معتبر وارد کنید");
    setLoading(true);
    try {
      const res = await fetch("/api/client/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (res.ok) {
        setStep("otp");
        setResendCooldown(120);
        toast.success("کد تایید ارسال شد");
      } else {
        const data = await res.json();
        toast.error(data.message || "خطا در ارسال");
      }
    } catch {
      toast.error("خطا در اتصال به سرور");
    } finally {
      setLoading(false);
    }
  };

  // تابع اصلی برای تایید کد (هم به صورت خودکار و هم با دکمه فراخوانی می‌شود)
  const verifyOtp = async (currentOtp: string) => {
    if (currentOtp.length !== 6) return;
    setLoading(true);
    try {
      const res = await fetch("/api/client/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp: currentOtp }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.signup_complete) {
          toast.success("خوش آمدید");
          router.push("/clientdashboard");
        } else {
          setStep("signup");
          router.replace("/login?step=signup");
        }
      } else {
        toast.error(data.message || "کد اشتباه است");
        setOtp(""); // پاک کردن کد در صورت اشتباه بودن
        inputRefs.current[0]?.focus();
      }
    } catch {
      toast.error("خطا در تایید");
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

    // انتقال به اینپوت بعدی
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // تایید خودکار در صورت تکمیل ۶ رقم
    if (newOtp.length === 6) {
      verifyOtp(newOtp);
    }
  };

const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !job) return toast.error("فیلدها را تکمیل کنید");
    setLoading(true);
    try {
      const res = await fetch("/api/client/auth/signup-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), job_id: job }),
      });
      
      const data = await res.json();

      if (res.ok) {
        // اضافه کردن منطق مودال خوش‌آمدگویی
        if (data.show_welcome_modal) {
          sessionStorage.setItem("show_welcome_modal", "true");
        }
        
        toast.success("ثبت‌نام با موفقیت انجام شد");
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
    <div dir="rtl" className="min-h-screen bg-[#06080c] text-white flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[420px] z-10">
        <div className="flex flex-col items-center mb-10">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-20 h-20 rounded-[2.5rem] bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_20px_40px_rgba(16,185,129,0.3)] mb-6"
          >
            <Sparkles className="w-10 h-10 text-black" strokeWidth={2.5} />
          </motion.div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">آنتایم</h1>
          <p className="text-gray-500 font-medium">پلتفرم مدیریت هوشمند کسب‌وکار</p>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-3xl rounded-[3rem] border border-white/10 p-8 shadow-2xl relative">
          {step !== "phone" && (
            <button 
              onClick={() => { setStep(step === "signup" ? "otp" : "phone"); setOtp(""); }}
              className="absolute left-6 top-8 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
            >
              <ArrowRight className="w-5 h-5 rotate-180" />
            </button>
          )}

          <AnimatePresence mode="wait">
            {step === "phone" && (
              <motion.form key="phone" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handlePhoneSubmit} className="space-y-8">
                <div className="text-right">
                  <h2 className="text-xl font-bold mb-2">خوش آمدید</h2>
                  <p className="text-sm text-gray-500 leading-relaxed">برای شروع مدیریت نوبت‌ها، شماره موبایل خود را وارد کنید.</p>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-500 text-gray-500">
                    <Phone size={20} />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    className="w-full h-16 bg-white/[0.03] border border-white/10 rounded-2xl pr-14 pl-6 text-xl font-bold focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-gray-700"
                    dir="ltr"
                  />
                </div>
                <button disabled={loading} className="w-full h-16 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center text-lg">
                  {loading ? <Loader2 className="animate-spin" /> : "دریافت کد تایید"}
                </button>
              </motion.form>
            )}

            {step === "otp" && (
              <motion.form key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={(e) => { e.preventDefault(); verifyOtp(otp); }} className="space-y-10">
                <div className="text-center">
                  <h2 className="text-xl font-bold mb-2">تایید شماره</h2>
                  <p className="text-sm text-gray-500 italic" dir="ltr">{phone}</p>
                </div>
                <div className="flex justify-center w-full" dir="ltr">
                  <div className="grid grid-cols-6 gap-2 sm:gap-3 w-full max-w-sm">
                    {[...Array(6)].map((_, i) => (
                      <input
                        key={i}
                        ref={(el) => { inputRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={1}
                        value={otp[i] || ""}
                        disabled={loading}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onPaste={(e) => {
                          e.preventDefault();
                          const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                          if (pasteData.length > 0) {
                            setOtp(pasteData);
                            if (pasteData.length === 6) verifyOtp(pasteData);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Backspace" && !otp[i] && i > 0) {
                            inputRefs.current[i - 1]?.focus();
                          }
                        }}
                        className={`relative w-full aspect-square flex items-center justify-center text-center text-md sm:text-3xl font-black bg-white/[0.03] border-2 rounded-2xl outline-none transition-all duration-200 ${otp[i] ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)] text-emerald-500' : 'border-white/10 text-white focus:border-emerald-500/50'} hover:bg-white/[0.06] focus:bg-emerald-500/[0.05] disabled:opacity-50`}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <button disabled={loading || otp.length !== 6} className="w-full h-16 bg-white text-black font-black rounded-2xl shadow-xl active:scale-[0.98] transition-all text-lg disabled:opacity-50">
                    {loading ? <Loader2 className="animate-spin mx-auto" /> : "ورود به حساب"}
                  </button>
                  <button
                    type="button"
                    onClick={() => resendCooldown === 0 && handlePhoneSubmit()}
                    disabled={resendCooldown > 0 || loading}
                    className="w-full text-sm font-bold text-emerald-500 disabled:text-gray-600 flex items-center justify-center gap-2"
                  >
                    {resendCooldown > 0 ? `${resendCooldown} ثانیه تا ارسال مجدد` : <><RefreshCw size={16} /> ارسال دوباره کد</>}
                  </button>
                </div>
              </motion.form>
            )}

            {step === "signup" && (
              <motion.form key="signup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSignupSubmit} className="space-y-6">
                <div className="text-right">
                  <h2 className="text-xl font-bold mb-2">تکمیل پروفایل</h2>
                  <p className="text-sm text-gray-500">یک گام تا شروع مدیریت حرفه‌ای فاصله دارید.</p>
                </div>
                <div className="space-y-4">
                  <div className="relative group">
                    <User className="absolute right-5 top-5 text-gray-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
                    <input
                      value={name} onChange={(e) => setName(e.target.value)}
                      placeholder="نام و نام خانوادگی"
                      className="w-full h-16 bg-white/[0.03] border border-white/10 rounded-2xl pr-14 pl-6 text-lg font-bold focus:border-emerald-500/50 outline-none transition-all"
                    />
                  </div>
                  <div className="relative group">
                    <Briefcase className="absolute right-5 top-5 text-gray-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
                    <select
                      value={job} onChange={(e) => setJob(e.target.value)}
                      className="w-full h-16 bg-[#1a1d23] border border-white/10 rounded-2xl pr-14 pl-6 text-lg font-bold appearance-none focus:border-emerald-500/50 outline-none transition-all"
                    >
                      <option value="">انتخاب تخصص...</option>
                      {jobs.map((j) => <option key={j.id} value={j.id}>{j.name}</option>)}
                    </select>
                  </div>
                </div>
                <button disabled={loading} className="w-full h-16 bg-emerald-500 text-black font-black rounded-2xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg">
                  {loading ? <Loader2 className="animate-spin" /> : <><CheckCircle size={22} /> شروع کار با آنتایم</>}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}