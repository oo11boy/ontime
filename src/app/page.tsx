// File Path: src/app/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Zap,
  MessageSquare,
  Users,
  BarChart3,
  Smartphone,
  CheckCircle2,
  ChevronDown,
  Scissors,
  Stethoscope,
  GraduationCap,
  Star,
  Loader2,
  ArrowLeft,
  Trophy,
  Heart,
  XCircle,
  ShieldCheck,
  Instagram,
  Phone,
  Wallet,
  MousePointer2,
  Settings,
  Clock,
  CreditCard,
  FileText,
  Shield,
  Globe,
  Bell,
  PieChart,
  TrendingUp,
  UserCheck,
  CalendarCheck,
  SmartphoneCharging,
  BarChart,
  Database,
  Cloud,
  Repeat,
  Filter,
  Zap as Lightning,
  Eye,
  Award,
  Check,
  Sparkles,
  Users as Users2,
  Target,
  FolderOpen,
  Server,
  Lock,
  Wifi,
  Download,
  Upload,
  Cpu,
  Smartphone as PhoneIcon,
  Tablet,
  Monitor,
  Sun,
  Moon,
  Palette,
  Layers,
  GitBranch,
  Share2,
  Link as LinkIcon,
  QrCode,
  Mail,
  MapPin,
  Home,
  Building,
  Coffee,
  ShoppingBag,
  Car,
  Home as HomeIcon,
  Briefcase,
  BookOpen,
  Music,
  Camera,
  Utensils,
  Dumbbell,
  Heart as HeartIcon,
  PlusCircle,
  MinusCircle,
  Coffee as CoffeeIcon,
  ShoppingCart,
  Package,
  Truck,
  Headphones,
  HelpCircle,
  ThumbsUp,
  ClipboardCheck,
  Bot,
  Cpu as CpuIcon,
  WifiOff,
  RefreshCw,
  Globe as GlobeIcon,
} from "lucide-react";

// هوک داینامیک پروژه شما
import { usePlans } from "@/hooks/usePlans";

export default function OnTimeLandingPage() {
  const { data: plansData, isLoading: plansLoading } = usePlans();

  // وضعیت برای شمارنده‌ها
  const [counts, setCounts] = useState({
    users: 0,
    bookings: 0,
    sms: 0,
    revenue: 0,
  });

  // وضعیت ماشین‌حساب سود
  const [fee, setFee] = useState(500000);
  const [missed, setMissed] = useState(10);

  // وضعیت FAQ
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // وضعیت تب‌های ویژگی‌ها
  const [activeTab, setActiveTab] = useState("sms");

  useEffect(() => {
    const interval = setInterval(() => {
      setCounts((prev) => ({
        users: prev.users < 1500 ? prev.users + 12 : 1500,
        bookings: prev.bookings < 45000 ? prev.bookings + 450 : 45000,
        sms: prev.sms < 125000 ? prev.sms + 1200 : 125000,
        revenue: prev.revenue < 75000000 ? prev.revenue + 150000 : 75000000,
      }));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const totalSaved = (fee * missed).toLocaleString();

  // ویژگی‌های تخصصی برای هر صنف
  const industryFeatures = [
    {
      icon: <Stethoscope size={28} />,
      title: "کلینیک‌ها و مطب پزشکان",
      features: [
        "تعریف تخصص‌های مختلف پزشکی",
        "سیستم ارجاع بیمار بین پزشکان",
        "مدیریت نسخه‌های الکترونیکی",
        "یکپارچه‌سازی با پرونده سلامت الکترونیک",
      ],
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <Scissors size={28} />,
      title: "آرایشگاه‌ها و سالن‌های زیبایی",
      features: [
        "مدیریت آرایشگران و خدمات",
        "گالری تصاویر کارهای انجام شده",
        "سیستم کد تخفیف و وفاداری",
        "رزرو بر اساس جنسیت مشتری",
      ],
      color: "from-pink-500 to-purple-500",
    },
    {
      icon: <Car size={28} />,
      title: "کارواش‌ها و خدمات خودرو",
      features: [
        "تعریف انواع خدمات خودرو",
        "مدیریت ظرفیت پارکینگ",
        "پیگیری وضعیت خودرو در صف",
        "سیستم هوشمند زمان‌بندی بر اساس نوع خدمت",
      ],
      color: "from-orange-500 to-red-500",
    },
    {
      icon: <Dumbbell size={28} />,
      title: "باشگاه‌های ورزشی",
      features: [
        "مدیریت ظرفیت کلاس‌ها",
        "سیستم عضویت و اشتراک",
        "رزرو تجهیزات ورزشی",
        "برنامه تمرینی شخصی‌سازی شده",
      ],
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: <Utensils size={28} />,
      title: "رستوران‌ها و کافی‌شاپ‌ها",
      features: [
        "رزرو میز با مشخصات",
        "سیستم پیش‌سفارش غذا",
        "مدیریت ظرفیت سالن",
        "یکپارچه‌سازی با پوز",
      ],
      color: "from-amber-500 to-yellow-500",
    },
    {
      icon: <BookOpen size={28} />,
      title: "آموزشگاه‌ها و مدارس",
      features: [
        "مدیریت کلاس‌های مختلف",
        "سیستم حضور و غیاب",
        "برنامه‌ریزی جلسات والدین",
        "پیگیری پیشرفت دانش‌آموزان",
      ],
      color: "from-indigo-500 to-blue-500",
    },
  ];

  return (
    <div
      className="flex flex-col min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-700"
      dir="rtl"
    >
      {/* --- Navigation --- */}
      <nav className="fixed top-0 w-full z-100 bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-11 h-11 bg-linear-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:rotate-12 transition-transform duration-500">
              <span className="text-white font-black text-2xl italic">آ</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tighter text-slate-900">
                آنتایم
              </span>
              <span className="text-xs text-slate-500 font-medium -mt-1">
                سیستم نوبت‌دهی هوشمند
              </span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-10 text-slate-700 font-semibold text-sm">
            <a
              href="#features"
              className="hover:text-blue-600 transition-colors flex items-center gap-2"
            >
              <Sparkles size={16} />
              ویژگی‌ها
            </a>
            <a
              href="#industries"
              className="hover:text-blue-600 transition-colors flex items-center gap-2"
            >
              <Building size={16} />
              صنایع
            </a>
            <a
              href="#sms-preview"
              className="hover:text-blue-600 transition-colors flex items-center gap-2"
            >
              <MessageSquare size={16} />
              پیامک هوشمند
            </a>
            <a
              href="#integrations"
              className="hover:text-blue-600 transition-colors flex items-center gap-2"
            >
              <GitBranch size={16} />
              یکپارچه‌سازی
            </a>
            <a
              href="#pricing"
              className="hover:text-blue-600 transition-colors flex items-center gap-2"
            >
              <CreditCard size={16} />
              تعرفه‌ها
            </a>
            <a
              href="#faq"
              className="hover:text-blue-600 transition-colors flex items-center gap-2"
            >
              <HelpCircle size={16} />
              راهنما
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden md:block px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all"
            >
              ورود
            </Link>
            <Link
              href="/login"
              className="bg-linear-to-r from-blue-600 to-cyan-500 text-white px-7 py-3 rounded-2xl font-bold hover:shadow-2xl hover:shadow-blue-200 transition-all shadow-xl shadow-blue-100"
            >
              شروع رایگان 60 روزه
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-20">
        {/* --- Hero Section --- */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-blue-50/50 via-white to-cyan-50/50"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -mr-48 -mt-48"></div>

          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center relative">
            <div className="text-right z-10">
              <div className="inline-flex items-center gap-2 py-2 px-5 rounded-full bg-linear-to-l from-blue-100 to-cyan-100 text-blue-700 font-black text-xs mb-8 border border-blue-200">
                🚀 برترین پلتفرم نوبت‌دهی ایران با بیش از ۱۵۰۰ کسب‌وکار فعال
              </div>
              <h1 className="text-5xl lg:text-8xl font-black text-slate-900 leading-[1.15] mb-8">
                پایان دردسرهای <br />
                <span className="text-transparent bg-clip-text bg-linear-to-l from-blue-600 via-cyan-500 to-blue-700 text-6xl lg:text-8xl italic">
                  نوبت‌دهی سنتی
                </span>
              </h1>
              <p className="text-xl text-slate-600 mb-12 leading-relaxed max-w-xl font-medium">
                آنتایم فقط یک تقویم هوشمند نیست؛ یک اکوسیستم کامل برای مدیریت
                کسب‌وکار شماست. از ثبت خودکار نوبت تا مدیریت مالی، گزارش‌گیری
                پیشرفته و ارتباط هوشمند با مشتریان - همه در یک پلتفرم یکپارچه.
              </p>
              <div className="flex flex-wrap gap-5">
                <Link
                  href="/login"
                  className="px-10 py-5 bg-linear-to-r from-blue-600 to-cyan-500 text-white rounded-3xl font-black text-xl hover:shadow-2xl hover:shadow-blue-300 transition-all hover:scale-105 shadow-xl shadow-blue-200 flex items-center gap-4"
                >
                  شروع رایگان 60 روزه
                  <ArrowLeft size={24} />
                </Link>
                <button className="px-10 py-5 bg-white text-slate-700 rounded-3xl font-bold text-lg border-2 border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all flex items-center gap-4">
                  <PlayCircle size={24} className="text-blue-600" />
                  مشاهده دمو ویدیویی
                </button>
              </div>

              <div className="mt-12 flex flex-wrap gap-8">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-green-500" size={20} />
                  <span className="text-sm font-semibold text-slate-600">
                    امنیت اطلاعات ISO 27001
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Cloud className="text-blue-500" size={20} />
                  <span className="text-sm font-semibold text-slate-600">
                    پشتیبان‌گیری خودکار روزانه
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Headphones className="text-purple-500" size={20} />
                  <span className="text-sm font-semibold text-slate-600">
                    پشتیبانی ۲۴/۷ تلفنی و چت
                  </span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-20 bg-linear-to-tr from-blue-400/20 via-cyan-300/20 to-purple-400/20 rounded-full blur-[120px] animate-pulse"></div>
              <div className="relative bg-white rounded-[3.5rem] p-8 shadow-2xl border-20 border-white/80 overflow-hidden transform hover:-rotate-1 transition-transform duration-700">
                <div className="absolute top-8 right-8 z-20 flex gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="bg-linear-to-br from-blue-50 to-white p-6 rounded-3xl border border-blue-100">
                    <Calendar className="text-blue-600 mb-3" size={28} />
                    <h4 className="font-black text-lg mb-2">تقویم هوشمند</h4>
                    <p className="text-sm text-slate-600">
                      مدیریت بصری زمان‌های خالی
                    </p>
                  </div>
                  <div className="bg-linear-to-br from-green-50 to-white p-6 rounded-3xl border border-green-100">
                    <BarChart3 className="text-green-600 mb-3" size={28} />
                    <h4 className="font-black text-lg mb-2">داشبورد تحلیلی</h4>
                    <p className="text-sm text-slate-600">
                      آمار لحظه‌ای عملکرد
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop"
                    alt="داشبورد مدیریتی آنتایم"
                    className="rounded-4xl w-full object-cover h-[350px] shadow-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- Stats Section --- */}
        <section className="py-20 bg-linear-to-b from-white to-slate-50 border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 text-center">
              <StatItem
                label="کسب‌وکارهای فعال"
                value={counts.users}
                suffix="+"
                icon={<Trophy className="text-yellow-500" />}
                description="در ۱۲ صنف مختلف"
              />
              <StatItem
                label="نوبت‌های موفق"
                value={counts.bookings}
                suffix="+"
                icon={<CalendarCheck className="text-green-500" />}
                description="در ۳ ماه گذشته"
              />
              <StatItem
                label="پیامک ارسالی"
                value={counts.sms}
                suffix="+"
                icon={<MessageSquare className="text-blue-500" />}
                description="با ۹۸% تحویل موفق"
              />
              <StatItem
                label="درآمد ایجاد شده"
                value={counts.revenue}
                suffix=" تومان"
                icon={<TrendingUp className="text-purple-500" />}
                description="برای کسب‌وکارهای عضو"
              />
            </div>
          </div>
        </section>

        {/* --- Comprehensive Features Section --- */}
        <section id="features" className="py-32 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 py-3 px-6 rounded-full bg-linear-to-r from-blue-50 to-cyan-50 text-blue-700 font-black text-sm mb-6 border border-blue-200">
                ✨ بیش از ۱۰۰ ویژگی حرفه‌ای
              </div>
              <h2 className="text-4xl lg:text-6xl font-black mb-6 text-slate-900">
                تمام ابزارهای مورد نیاز برای <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-500 italic">
                  مدیریت حرفه‌ای کسب‌وکار
                </span>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed">
                از ثبت اولیه نوبت تا تحلیل پیشرفته عملکرد - پلتفرم آنتایم با دقت
                برای نیازهای کسب‌وکارهای ایرانی طراحی شده است
              </p>
            </div>

            {/* تب‌های ویژگی‌ها */}
            <div className="flex flex-wrap justify-center gap-4 mb-16">
              {[
                {
                  id: "sms",
                  label: "سیستم پیامک هوشمند",
                  icon: <MessageSquare size={20} />,
                },
                {
                  id: "calendar",
                  label: "تقویم و زمان‌بندی",
                  icon: <Calendar size={20} />,
                },
                {
                  id: "analytics",
                  label: "گزارش‌گیری پیشرفته",
                  icon: <BarChart size={20} />,
                },
                {
                  id: "crm",
                  label: "مدیریت مشتریان",
                  icon: <Users2 size={20} />,
                },
                {
                  id: "integrations",
                  label: "یکپارچه‌سازی",
                  icon: <GitBranch size={20} />,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 transition-all ${
                    activeTab === tab.id
                      ? "bg-linear-to-r from-blue-600 to-cyan-500 text-white shadow-xl shadow-blue-200"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* محتوای تب‌ها */}
            <div className="bg-linear-to-br from-slate-50 to-white rounded-[3rem] p-12 border border-slate-200 shadow-lg">
              {activeTab === "sms" && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[
                    {
                      title: "تاییدیه رزرو خودکار",
                      desc: "ارسال پیامک تأیید بلافاصله پس از ثبت نوبت با جزئیات کامل",
                      icon: <CheckCircle2 className="text-green-500" />,
                    },
                    {
                      title: "یادآوری هوشمند",
                      desc: "یادآوری ۷۲، ۲۴ و ۲ ساعت قبل از نوبت بر اساس الگوی فراموشی مشتری",
                      icon: <Bell className="text-blue-500" />,
                    },
                    {
                      title: "پیامک انصراف",
                      desc: "ارسال خودکار پیامک لغو نوبت و اطلاع‌رسانی زمان‌های جایگزین",
                      icon: <XCircle className="text-red-500" />,
                    },
                    {
                      title: "پیامک تبلیغاتی",
                      desc: "ارسال کمپین‌های تبلیغاتی به مشتریان وفادار با نرخ بازدید بالا",
                      icon: <Megaphone className="text-orange-500" />,
                    },
                    {
                      title: "پیامک تولد و مناسبت",
                      desc: "سیستم خودکار تبریک تولد و مناسبت‌ها با امکان ارسال هدیه",
                      icon: <Gift className="text-purple-500" />,
                    },
                    {
                      title: "گزارش ارسال پیامک",
                      desc: "مشاهده وضعیت ارسال، تحویل و بازخورد هر پیامک به تفکیک",
                      icon: <FileText className="text-indigo-500" />,
                    },
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="bg-white p-8 rounded-3xl border border-slate-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300"
                    >
                      <div className="inline-flex items-center justify-center p-3 bg-slate-50 rounded-2xl mb-6">
                        {feature.icon}
                      </div>
                      <h4 className="text-xl font-black mb-3 text-slate-900">
                        {feature.title}
                      </h4>
                      <p className="text-slate-600 leading-relaxed">
                        {feature.desc}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "calendar" && (
                <div className="space-y-8">
                  <div className="grid md:grid-cols-3 gap-8">
                    {[
                      "تقویم شمسی و میلادی هوشمند",
                      "مدیریت تعطیلات رسمی و شخصی",
                      "تعریف محدودیت زمانی برای رزرو",
                      "زمان‌بندی شیفتی برای پرسنل",
                      "سیستم نوبت‌دهی گروهی",
                      "رزرو پیوسته و زمان‌های بلوکه",
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Check className="text-green-500" size={20} />
                        <span className="font-semibold text-slate-700">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* محتوای سایر تب‌ها به صورت مشابه */}
            </div>
          </div>
        </section>

        {/* --- Industry Specific Solutions --- */}
        <section
          id="industries"
          className="py-32 bg-linear-to-b from-slate-50 to-white"
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl lg:text-6xl font-black mb-6 text-slate-900">
                راه‌حل‌های تخصصی برای <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600 italic">
                  هر نوع کسب‌وکار
                </span>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto font-medium">
                آنتایم برای بیش از ۱۲ صنف مختلف، ویژگی‌های اختصاصی و رابط کاربری
                بهینه‌شده ارائه می‌دهد
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {industryFeatures.map((industry, index) => (
                <div
                  key={index}
                  className="bg-white rounded-3xl p-8 border border-slate-200 hover:border-blue-300 hover:shadow-2xl transition-all duration-500"
                >
                  <div
                    className={`inline-flex items-center justify-center p-4 rounded-2xl bg-linear-to-r ${industry.color} text-white mb-6`}
                  >
                    {industry.icon}
                  </div>
                  <h3 className="text-2xl font-black mb-6 text-slate-900">
                    {industry.title}
                  </h3>
                  <ul className="space-y-4">
                    {industry.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <Check className="text-green-500" size={18} />
                        <span className="text-slate-700 font-medium">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <button className="mt-8 w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                    مشاهده دموی اختصاصی
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- Detailed SMS System --- */}
        <section
          id="sms-preview"
          className="py-32 bg-linear-to-br from-blue-900 via-slate-900 to-indigo-900 overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center text-right relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 py-2 px-5 rounded-full bg-blue-800/30 text-blue-300 font-black text-xs mb-8 border border-blue-700/30">
                📱 سیستم پیامک هوشمند
              </div>
              <h2 className="text-4xl lg:text-6xl font-black text-white mb-10 leading-tight">
                ارتباط هوشمند با مشتریان <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-cyan-400 italic underline decoration-white/20">
                  بدون نیاز به تلفن‌زدن
                </span>
              </h2>

              <div className="space-y-8 mb-12">
                {[
                  {
                    title: "کاهش ۹۵٪ کنسلی نوبت‌ها",
                    desc: "با سیستم یادآوری چندمرحله‌ای هوشمند که بر اساس رفتار هر مشتری شخصی‌سازی می‌شود",
                    stat: "۹۵٪",
                  },
                  {
                    title: "صرفه‌جویی ۴۰ ساعته در ماه",
                    desc: "حذف تماس‌های تلفنی تایید و یادآوری نوبت برای کارمندان شما",
                    stat: "۴۰ ساعت",
                  },
                  {
                    title: "افزایش ۳۰٪ رضایت مشتری",
                    desc: "با ارتباط حرفه‌ای و به موقع که اعتماد مشتری را جلب می‌کند",
                    stat: "۳۰٪",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="bg-white/5 backdrop-blur-sm p-6 rounded-3xl border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xl font-black text-white">
                        {item.title}
                      </h4>
                      <div className="text-3xl font-black text-blue-400">
                        {item.stat}
                      </div>
                    </div>
                    <p className="text-blue-200/80">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <button className="px-8 py-4 bg-linear-to-r from-blue-600 to-cyan-500 text-white rounded-2xl font-bold hover:shadow-2xl hover:shadow-blue-500/30 transition-all">
                  مشاهده نمونه پیامک‌ها
                </button>
                <button className="px-8 py-4 bg-white/10 text-white rounded-2xl font-bold border border-white/20 hover:bg-white/20 transition-colors">
                  تنظیمات پیشرفته پیامک
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-10 bg-linear-to-r from-blue-600/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="relative bg-slate-900 rounded-[3.5rem] border-16 border-slate-800 shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-700">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-linear-to-r from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center">
                        <span className="text-white font-black">آ</span>
                      </div>
                      <div>
                        <div className="text-white font-black text-sm">
                          آنتایم
                        </div>
                        <div className="text-slate-400 text-xs">
                          سیستم پیامک هوشمند
                        </div>
                      </div>
                    </div>
                    <div className="text-slate-400 text-sm">60:۰۸</div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-linear-to-l from-blue-600 to-blue-700 text-white p-5 rounded-3xl rounded-tr-none animate-in slide-in-from-right duration-700">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-black">تایید رزرو نوبت</div>
                          <div className="text-xs opacity-90">
                            کلینیک زیبایی سارا
                          </div>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed mt-3">
                        عزیز، نوبت شما برای خدمات کوتاهی مو <br />
                        📅 تاریخ: 60۰۳/۱۲/۱۵ <br />
                        🕐 ساعت: ۱۶:۳۰ <br />
                        ✅ وضعیت: تایید شده <br />
                        <br />
                        آدرس: تهران، جردن، پلاک ۱۲۳
                      </p>
                    </div>

                    <div className="bg-slate-800 text-slate-300 p-5 rounded-3xl rounded-tr-none animate-in slide-in-from-right duration-700 delay-300">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-blue-600/20 rounded-full flex items-center justify-center">
                          <Bell className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                          <div className="font-black text-blue-400">
                            یادآوری نوبت
                          </div>
                          <div className="text-xs opacity-90">
                            ۲۴ ساعت باقی مانده
                          </div>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed mt-3">
                        یادآوری: فردا ساعت ۱۶:۳۰ نوبت شماست. <br />
                        در صورت نیاز به تغییر یا لغو، از لینک زیر استفاده کنید:
                      </p>
                      <div className="mt-3 text-blue-400 text-xs font-mono bg-white/5 p-2 rounded-lg">
                        https://ontime.ir/cancel/ABC123
                      </div>
                    </div>

                    <div className="bg-linear-to-l from-green-600 to-emerald-600 text-white p-5 rounded-3xl rounded-tr-none animate-in slide-in-from-right duration-700 delay-600">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          <Gift className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-black">هدیه تولد ویژه</div>
                          <div className="text-xs opacity-90">
                            ۲۰٪ تخفیف خدمات
                          </div>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed mt-3">
                        تولدت مبارک! 🎉 <br />
                        به مناسبت تولد شما، ۲۰٪ تخفیف برای خدمات بعدی در نظر
                        گرفتیم. <br />
                        کد تخفیف: BIRTHDAY20
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- Integration Ecosystem --- */}
        <section id="integrations" className="py-32 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl lg:text-6xl font-black mb-6 text-slate-900">
                یکپارچه با تمام ابزارهای <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600 italic">
                  کسب‌وکار شما
                </span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {[
                {
                  name: "زرین‌پال",
                  icon: "💳",
                  desc: "پرداخت آنلاین نوبت و خدمات",
                },
                {
                  name: "پیامک‌رسان",
                  icon: "📲",
                  desc: "ارسال پیامک با بهترین کیفیت",
                },
                {
                  name: "اینستاگرام",
                  icon: "📱",
                  desc: "نمایش نوبت در بیو اینستاگرام",
                },
                {
                  name: "گوگل کالندر",
                  icon: "📅",
                  desc: "همگام‌سازی با تقویم شخصی",
                },
                { name: "وردپرس", icon: "🌐", desc: "افزونه وبسایت وردپرسی" },
                {
                  name: "سی‌آر‌ام",
                  icon: "👥",
                  desc: "اتصال به سیستم‌های CRM",
                },
                { name: "حسابداری", icon: "📊", desc: "صدور فاکتور و رسید" },
                {
                  name: "درگاه‌های بانکی",
                  icon: "🏦",
                  desc: "همه درگاه‌های ایرانی",
                },
              ].map((integration, index) => (
                <div
                  key={index}
                  className="bg-linear-to-br from-white to-slate-50 p-8 rounded-3xl border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300"
                >
                  <div className="text-4xl mb-4">{integration.icon}</div>
                  <h4 className="text-xl font-black mb-2 text-slate-900">
                    {integration.name}
                  </h4>
                  <p className="text-slate-600 text-sm">{integration.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- Advanced Analytics Section --- */}
        <section className="py-32 bg-linear-to-b from-slate-50 to-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div>
                <h2 className="text-4xl lg:text-6xl font-black mb-10 text-slate-900">
                  تحلیل هوشمند <br />
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-green-500 italic">
                    برای تصمیم‌گیری بهتر
                  </span>
                </h2>

                <div className="space-y-8">
                  {[
                    {
                      title: "داشبورد مدیریتی پیشرفته",
                      features: [
                        "نمودارهای تعاملی در لحظه",
                        "گزارش‌های سفارشی‌سازی شده",
                        "پیش‌بینی درآمد و ترافیک",
                        "تحلیل عملکرد پرسنل",
                      ],
                    },
                    {
                      title: "گزارش‌های مالی جامع",
                      features: [
                        "صورتحساب ماهانه و سالانه",
                        "تحلیل سودآوری هر خدمت",
                        "پیگیری پرداخت‌های معوق",
                        "خروجی اکسل و PDF",
                      ],
                    },
                    {
                      title: "تحلیل رفتار مشتریان",
                      features: [
                        "شناسایی مشتریان وفادار",
                        "تحلیل الگوی نوبت‌گیری",
                        "سیستم امتیازدهی مشتریان",
                        "گروه‌بندی هوشمند مشتریان",
                      ],
                    },
                  ].map((section, index) => (
                    <div
                      key={index}
                      className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm"
                    >
                      <h3 className="text-2xl font-black mb-6 text-slate-900 flex items-center gap-3">
                        <BarChart className="text-blue-600" />
                        {section.title}
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {section.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-slate-700 font-medium">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="bg-white rounded-[3rem] p-8 border border-slate-200 shadow-2xl">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-black text-slate-900">
                      داشبورد تحلیلی نمونه
                    </h3>
                    <div className="flex gap-2">
                      <select className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl font-bold">
                        <option>ماه جاری</option>
                        <option>۳ ماه گذشته</option>
                        <option>سال جاری</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-slate-600 font-bold">
                          نوبت‌های موفق
                        </span>
                        <span className="text-green-600 font-black">+۱۲٪</span>
                      </div>
                      <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-linear-to-r from-green-500 to-emerald-500 w-3/4"></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-slate-600 font-bold">
                          میانگین رضایت
                        </span>
                        <span className="text-blue-600 font-black">۴.۸/۵</span>
                      </div>
                      <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-linear-to-r from-blue-500 to-cyan-500 w-4/5"></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-slate-600 font-bold">
                          درآمد ماهانه
                        </span>
                        <span className="text-purple-600 font-black">
                          ۱۲,۵۰۰,۰۰۰ تومان
                        </span>
                      </div>
                      <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-linear-to-r from-purple-500 to-pink-500 w-2/3"></div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-2xl">
                      <div className="text-2xl font-black text-blue-700">
                        ۹۸٪
                      </div>
                      <div className="text-sm text-slate-600 mt-1">
                        تحویل پیامک
                      </div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-2xl">
                      <div className="text-2xl font-black text-green-700">
                        ۸۵٪
                      </div>
                      <div className="text-sm text-slate-600 mt-1">
                        تکرار مراجعه
                      </div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-2xl">
                      <div className="text-2xl font-black text-purple-700">
                        ۲.۱
                      </div>
                      <div className="text-sm text-slate-600 mt-1">
                        میانگین خدمات
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- ROI Calculator Enhanced --- */}
        <section id="roi" className="py-32 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-linear-to-br from-slate-900 via-blue-900 to-slate-900 rounded-[4rem] p-12 lg:p-20 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full -mr-48 -mt-48 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-600/20 rounded-full -ml-48 -mb-48 blur-3xl"></div>

              <div className="text-center mb-16 relative z-10">
                <h2 className="text-4xl lg:text-5xl font-black mb-6">
                  محاسبه دقیق بازگشت سرمایه
                </h2>
                <p className="text-slate-400 font-bold text-lg">
                  ببینید آنتایم چقدر برای کسب‌وکار شما سودآور است
                </p>
              </div>

              <div className="grid lg:grid-cols-3 gap-12 relative z-10">
                <div className="lg:col-span-2 space-y-12">
                  <div className="space-y-8">
                    <CalculatorSlider
                      label="میانگین درآمد هر نوبت (تومان)"
                      value={fee}
                      onChange={setFee}
                      min={100000}
                      max={2000000}
                      step={50000}
                      format={(value: { toLocaleString: () => any; }) => value.toLocaleString()}
                    />

                    <CalculatorSlider
                      label="تعداد کنسلی یا فراموشی ماهانه"
                      value={missed}
                      onChange={setMissed}
                      min={1}
                      max={50}
                      step={1}
                      format={(value: any) => `${value} نوبت`}
                    />

                    <div className="bg-white/10 p-8 rounded-3xl border border-white/20">
                      <h4 className="text-xl font-black mb-6">
                        متغیرهای اضافی
                      </h4>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold mb-3 text-blue-300">
                            تعداد پرسنل
                          </label>
                          <select className="w-full bg-white/10 text-white p-3 rounded-xl border border-white/20">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                              <option key={n} value={n}>
                                {n} نفر
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-bold mb-3 text-blue-300">
                            ساعت صرفه‌جویی ماهانه
                          </label>
                          <div className="text-3xl font-black text-cyan-400">
                            {(missed * 0.5).toFixed(1)} ساعت
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-linear-to-br from-blue-600 to-cyan-600 rounded-[3rem] p-10 text-center shadow-2xl transform hover:scale-105 transition-transform">
                  <Wallet className="mx-auto mb-6 opacity-80" size={48} />
                  <p className="text-blue-100 mb-2 font-bold text-lg">
                    سود بازگشتی ماهانه
                  </p>
                  <div className="text-5xl lg:text-7xl font-black mb-4 tracking-tighter">
                    {totalSaved}
                  </div>
                  <p className="text-blue-200 text-sm font-bold mb-8">
                    تومان صرفه‌جویی
                  </p>

                  <div className="space-y-4 mt-8">
                    <div className="flex justify-between text-blue-100">
                      <span>صرفه‌جویی زمانی:</span>
                      <span className="font-black">
                        {(missed * 0.5).toFixed(1)} ساعت
                      </span>
                    </div>
                    <div className="flex justify-between text-blue-100">
                      <span>افزایش رضایت:</span>
                      <span className="font-black">
                        +{(missed * 0.3).toFixed(0)}٪
                      </span>
                    </div>
                    <div className="flex justify-between text-blue-100">
                      <span>بازگشت سرمایه:</span>
                      <span className="font-black text-green-300">
                        ۳.۲ برابر
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- Advanced FAQ Section --- */}
        <section id="faq" className="py-32 bg-slate-50">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-black mb-6 text-slate-900">
                سوالات متداول
              </h2>
              <p className="text-slate-600 text-lg">
                پاسخ به رایج‌ترین سوالات درباره پلتفرم آنتایم
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  question: "سیستم پیامک آنتایم چگونه کار می‌کند؟",
                  answer:
                    "سیستم پیامک هوشمند آنتایم به صورت کاملاً خودکار و در ۴ مرحله کار می‌کند: ۱) ارسال تأییدیه بلافاصله پس از ثبت نوبت ۲) یادآوری ۲۴ ساعت قبل ۳) یادآوری ۲ ساعت قبل ۴) پیامک تشکر پس از اتمام خدمت. این سیستم بر اساس الگوی رفتاری هر مشتری شخصی‌سازی می‌شود.",
                },
                {
                  question: "آیا امکان یکپارچه‌سازی با وبسایت وجود دارد؟",
                  answer:
                    "بله، آنتایم با ارائه API کامل، ویجت آماده و افزونه وردپرس، امکان یکپارچه‌سازی کامل با هر نوع وبسایتی را فراهم می‌کند. همچنین می‌توانید از کد iframe یا لینک اختصاصی برای نمایش تقویم نوبت‌دهی در سایت خود استفاده کنید.",
                },
                {
                  question: "نحوه پشتیبانی و آموزش به چه صورت است؟",
                  answer:
                    "پشتیبانی ۲۴/۷ از طریق تلفن، واتساپ و چت آنلاین + آموزش‌های ویدیویی کامل + وبینارهای هفتگی + مستندات فارسی + تیم پیاده‌سازی اختصاصی برای کسب‌وکارهای بزرگ",
                },
                {
                  question: "آیا اطلاعات مشتریان امن است؟",
                  answer:
                    "بله، آنتایم با گواهینامه امنیتی ISO 27001، رمزنگاری end-to-end، پشتیبان‌گیری روزانه در سرورهای داخل ایران و سیستم مانیتورینگ لحظه‌ای، بالاترین سطح امنیت را تضمین می‌کند.",
                },
                {
                  question: "چگونه می‌توانم سیستم را تست کنم؟",
                  answer:
                    "می‌توانید به راحتی و بدون نیاز به کارت اعتباری، از نسخه 60 روزه رایگان استفاده کنید. در این مدت به تمامی امکانات پلتفرم دسترسی کامل دارید و می‌توانید با داده‌های واقعی سیستم را تست کنید.",
                },
              ].map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full p-8 text-right flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <h3 className="text-xl font-black text-slate-900 flex-1">
                      {faq.question}
                    </h3>
                    <ChevronDown
                      className={`transition-transform ${
                        openFaq === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openFaq === index && (
                    <div className="px-8 pb-8">
                      <p className="text-slate-600 leading-relaxed">
                        {faq.answer}
                      </p>
                      {index === 0 && (
                        <div className="mt-6 p-6 bg-blue-50 rounded-2xl">
                          <h4 className="font-black text-blue-900 mb-3">
                            📊 آمار عملکرد سیستم پیامک:
                          </h4>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-black text-blue-700">
                                ۹۸.۷٪
                              </div>
                              <div className="text-sm text-blue-600">
                                تحویل موفق
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-black text-green-700">
                                ۱۲ دقیقه
                              </div>
                              <div className="text-sm text-green-600">
                                میانگین تأخیر
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-black text-purple-700">
                                ۸۵٪
                              </div>
                              <div className="text-sm text-purple-600">
                                کاهش کنسلی
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- Pricing Section Enhanced --- */}
        <section id="pricing" className="py-32 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl lg:text-6xl font-black mb-6 text-slate-900">
                پلن‌های متنوع برای <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-500 italic">
                  هر اندازه کسب‌وکار
                </span>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto font-medium">
                از کسب‌وکارهای کوچک تا سازمان‌های بزرگ - پلنی مناسب برای شما
                داریم
              </p>
            </div>

            {plansLoading ? (
              <div className="flex flex-col items-center py-20">
                <Loader2 className="animate-spin text-blue-600" size={50} />
                <p className="mt-6 text-slate-600 font-bold">
                  در حال دریافت اطلاعات پلن‌ها...
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-8">
                {plansData?.plans.map((plan: any, index: number) => (
                  <div
                    key={plan.id}
                    className={`
                    relative bg-white p-10 rounded-[4rem] border-4 transition-all hover:scale-105 hover:shadow-2xl
                    ${
                      plan.plan_key === "professional"
                        ? "border-blue-600 shadow-xl"
                        : "border-slate-200"
                    }
                    ${
                      index === 1
                        ? "transform md:scale-110 md:-translate-y-8 z-10"
                        : ""
                    }
                  `}
                  >
                    {plan.plan_key === "professional" && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-linear-to-r from-blue-600 to-cyan-500 text-white px-8 py-3 rounded-full font-black text-sm shadow-lg">
                        پرفروش‌ترین پلن
                      </div>
                    )}

                    <div className="text-center mb-10">
                      <h3 className="text-3xl font-black mb-4 text-slate-900">
                        {plan.title}
                      </h3>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-5xl font-black">
                          {plan.monthly_fee === 0
                            ? "رایگان"
                            : plan.monthly_fee.toLocaleString()}
                        </span>
                        {plan.monthly_fee > 0 && (
                          <span className="text-sm text-slate-500 mt-4">
                            تومان/ماه
                          </span>
                        )}
                      </div>
                      {plan.monthly_fee > 0 && (
                        <div className="text-slate-500 text-sm">
                          پرداخت سالانه:{" "}
                          <span className="font-black text-green-600">
                            {(plan.monthly_fee * 10).toLocaleString()} تومان
                          </span>{" "}
                          (۲ ماه رایگان)
                        </div>
                      )}
                    </div>

                    <div className="space-y-6 mb-12">
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                        <span className="font-bold text-slate-700">
                          پیامک رایگان
                        </span>
                        <span className="font-black text-blue-600">
                          {plan.free_sms_month} عدد
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                        <span className="font-bold text-slate-700">
                          نوبت نامحدود
                        </span>
                        <Check className="text-green-500" />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                        <span className="font-bold text-slate-700">
                          پشتیبانی
                        </span>
                        <span className="font-black text-blue-600">
                          {plan.plan_key === "free"
                            ? "چت آنلاین"
                            : plan.plan_key === "professional"
                            ? "۲۴/۷ تلفنی"
                            : "چت و تلفن"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                        <span className="font-bold text-slate-700">
                          فضای ذخیره‌سازی
                        </span>
                        <span className="font-black text-blue-600">
                          {plan.plan_key === "free"
                            ? "۵۰۰ مگابایت"
                            : plan.plan_key === "professional"
                            ? "نامحدود"
                            : "۱۰ گیگابایت"}
                        </span>
                      </div>
                    </div>

                    <Link
                      href="/login"
                      className={`
                        block w-full py-5 rounded-3xl font-black text-xl text-center transition-all
                        ${
                          plan.plan_key === "professional"
                            ? "bg-linear-to-r from-blue-600 to-cyan-500 text-white shadow-xl hover:shadow-2xl hover:shadow-blue-300"
                            : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                        }
                      `}
                    >
                      {plan.plan_key === "free" ? "شروع رایگان" : "انتخاب پلن"}
                    </Link>

                    {plan.plan_key === "professional" && (
                      <div className="mt-8 text-center">
                        <p className="text-sm text-slate-500 font-bold">
                          ⭐ شامل این مزایا:
                        </p>
                        <div className="flex flex-wrap justify-center gap-3 mt-4">
                          <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold">
                            گزارش‌های پیشرفته
                          </span>
                          <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold">
                            API نامحدود
                          </span>
                          <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold">
                            دومین اختصاصی
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-20 bg-linear-to-r from-blue-50 to-cyan-50 rounded-[3rem] p-12 text-center border border-blue-200">
              <h3 className="text-3xl font-black mb-6 text-slate-900">
                سوالی درباره انتخاب پلن دارید؟
              </h3>
              <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
                تیم مشاوره ما آماده است تا بر اساس نیازهای کسب‌وکار شما، بهترین
                پلن را پیشنهاد دهد.
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <button className="px-10 py-4 bg-linear-to-r from-blue-600 to-cyan-500 text-white rounded-2xl font-bold hover:shadow-2xl transition-all flex items-center gap-3">
                  <Phone size={20} />
                  دریافت مشاوره رایگان
                </button>
                <button className="px-10 py-4 bg-white text-slate-700 rounded-2xl font-bold border-2 border-slate-300 hover:border-blue-400 transition-colors flex items-center gap-3">
                  <MessageSquare size={20} />
                  گفتگو با پشتیبانی
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* --- Final CTA --- */}
        <section className="py-24 bg-linear-to-br from-blue-900 via-slate-900 to-indigo-900">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-linear-to-r from-blue-600/20 to-cyan-500/20 rounded-[4rem] p-12 lg:p-24 text-center text-white relative overflow-hidden border border-white/10 shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -ml-48 -mb-48"></div>

              <div className="relative z-10">
                <h2 className="text-4xl lg:text-7xl font-black mb-10 leading-tight">
                  همین امروز <br />
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-cyan-400 italic">
                    مدیریت نوبت‌دهی
                  </span>{" "}
                  خود را متحول کنید
                </h2>

                <div className="grid md:grid-cols-3 gap-8 mb-16">
                  <div className="bg-white/5 p-8 rounded-3xl backdrop-blur-sm border border-white/10">
                    <div className="text-3xl mb-4">🚀</div>
                    <h4 className="text-xl font-black mb-3">
                      شروع رایگان 60 روزه
                    </h4>
                    <p className="text-blue-200/80 text-sm">
                      بدون نیاز به کارت اعتباری
                    </p>
                  </div>

                  <div className="bg-white/5 p-8 rounded-3xl backdrop-blur-sm border border-white/10">
                    <div className="text-3xl mb-4">👨‍💼</div>
                    <h4 className="text-xl font-black mb-3">
                      مشاوره تخصصی رایگان
                    </h4>
                    <p className="text-blue-200/80 text-sm">
                      بررسی نیازهای اختصاصی شما
                    </p>
                  </div>

                  <div className="bg-white/5 p-8 rounded-3xl backdrop-blur-sm border border-white/10">
                    <div className="text-3xl mb-4">⚡</div>
                    <h4 className="text-xl font-black mb-3">پیاده‌سازی سریع</h4>
                    <p className="text-blue-200/80 text-sm">
                      آماده‌سازی در کمتر از ۱ ساعت
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-6">
                  <Link
                    href="/login"
                    className="px-14 py-6 bg-linear-to-r from-blue-500 to-cyan-400 text-white rounded-[2.5rem] font-black text-2xl hover:shadow-2xl hover:shadow-cyan-500/30 transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-blue-500/20"
                  >
                    شروع رایگان 60 روزه
                  </Link>
                  <button className="px-10 py-6 bg-white/10 text-white rounded-[2.5rem] font-black text-xl border-2 border-white/20 hover:bg-white/20 transition-all flex items-center gap-3 backdrop-blur-sm">
                    <Phone />
                    تماس با مشاوره: ۰۲۱-۹۱۰۰۰۰۰۰
                  </button>
                </div>

                <p className="mt-12 text-blue-300/60 text-sm font-bold">
                  بیش از ۱۵۰۰ کسب‌وکار به خانواده آنتایم پیوسته‌اند. منتظر شما
                  هستیم!
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* --- Enhanced Footer --- */}
      <footer className="bg-slate-950 text-slate-500 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-16 mb-20">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-8 text-white font-black text-3xl">
                <div className="w-12 h-12 bg-linear-to-r from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center font-black not-italic">
                  آ
                </div>
                <div className="flex flex-col">
                  <span>آنتایم</span>
                  <span className="text-sm font-normal text-slate-400">
                    پلتفرم نوبت‌دهی هوشمند
                  </span>
                </div>
              </div>
              <p className="max-w-md leading-loose text-lg opacity-60 mb-8">
                ما در آنتایم باور داریم که نظم در نوبت‌دهی، بزرگترین اعتبار یک
                کسب‌وکار است. با بیش از ۵ سال تجربه و ۱۵۰۰ کسب‌وکار فعال، در
                کنار شما هستیم تا بهترین تجربه را برای مشتریانتان خلق کنید.
              </p>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white hover:bg-pink-600 transition-colors cursor-pointer">
                  <Instagram size={24} />
                </div>
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-bold cursor-pointer hover:bg-blue-700 transition-colors">
                  IN
                </div>
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white hover:bg-green-600 transition-colors cursor-pointer">
                  <MessageSquare size={24} />
                </div>
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white hover:bg-blue-600 transition-colors cursor-pointer">
                  <Linkedin size={24} />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-white font-black text-xl mb-8">محصولات</h4>
              <ul className="space-y-4 font-semibold">
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    نوبت‌دهی پزشکان
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    نوبت‌دهی آرایشگاه
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    نوبت‌دهی آموزشگاه
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    نوبت‌دهی کارواش
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    نوبت‌دهی ورزشگاه
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-black text-xl mb-8">راهنما</h4>
              <ul className="space-y-4 font-semibold">
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    مستندات فارسی
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    آموزش‌های ویدیویی
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    وبلاگ تخصصی
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    شرایط استفاده
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    حریم خصوصی
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-black text-xl mb-8">تماس با ما</h4>
              <ul className="space-y-4 font-semibold">
                <li className="flex items-center gap-3">
                  <Phone size={16} />
                  <span>۰۲۱-۹۱۰۰۰۰۰۰</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={16} />
                  <span>support@ontime.ir</span>
                </li>
                <li className="flex items-center gap-3">
                  <MapPin size={16} />
                  <span>تهران، سعادت آباد</span>
                </li>
                <li className="mt-6">
                  <button className="w-full py-3 bg-linear-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-bold hover:shadow-lg transition-all">
                    درخواست تماس
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-900 text-center">
            <div className="flex flex-wrap justify-center gap-8 mb-6">
              <span className="text-xs font-black opacity-30">
                ISO 27001 Certified
              </span>
              <span className="text-xs font-black opacity-30">
                PCI DSS Compliant
              </span>
              <span className="text-xs font-black opacity-30">GDPR Ready</span>
              <span className="text-xs font-black opacity-30">
                Hosted in Iran
              </span>
            </div>
            <div className="text-xs font-black opacity-20 tracking-widest">
              © ۲۰۲۴ پلتفرم آنتایم. تمامی حقوق محفوظ است.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// --- Helper Components ---

function StatItem({ label, value, suffix, icon, description }: any) {
  return (
    <div className="group transition-all duration-500 p-8 rounded-3xl hover:bg-white hover:shadow-2xl hover:shadow-blue-100/30">
      <div className="flex justify-center mb-5 group-hover:scale-125 transition-transform duration-500">
        {icon}
      </div>
      <div
        className="text-4xl font-black text-slate-900 mb-2 font-mono"
        dir="ltr"
      >
        {value.toLocaleString()}
        {suffix}
      </div>
      <div className="text-slate-900 font-black text-lg mb-2">{label}</div>
      {description && (
        <div className="text-slate-500 text-sm">{description}</div>
      )}
    </div>
  );
}

function CalculatorSlider({
  label,
  value,
  onChange,
  min,
  max,
  step,
  format,
}: any) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-black text-white">{label}</label>
        <div className="text-2xl font-black text-blue-300">{format(value)}</div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-linear-to-r [&::-webkit-slider-thumb]:from-blue-500 [&::-webkit-slider-thumb]:to-cyan-400 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg"
      />
      <div className="flex justify-between text-sm text-slate-400">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

// اضافه کردن آیکون‌های مفقود
function PlayCircle(props: any) {
  return (
    <div className="w-6 h-6 rounded-full border-2 border-blue-600 flex items-center justify-center">
      <div className="w-0 h-0 border-t-4 border-b-4 border-l-8 border-transparent border-l-blue-600 ml-1"></div>
    </div>
  );
}
function Megaphone(props: any) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M11 5.882V19.24a1.76 1.76 0 0 1-3.417.592l-2.147-6.15M18 13a3 3 0 1 0 0-6M5.436 13.683A4.001 4.001 0 0 1 7 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 0 1-1.564-.317z" />
    </svg>
  );
}
function Gift(props: any) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13" />
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
    </svg>
  );
}
function Linkedin(props: any) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
