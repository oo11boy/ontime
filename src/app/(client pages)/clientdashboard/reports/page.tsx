// app/clientdashboard/reports/page.tsx
"use client";

import { useState, useMemo } from "react";
import { useBookings } from "@/hooks/useBookings";
import { useServices } from "@/hooks/useServices";
import { useStaffs } from "@/hooks/useStaffs";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { 
  Calendar, 
  Download, 
  Printer, 
  TrendingUp, 
  Users, 
  Scissors, 
  Clock,
  Activity,
  UserX,
  Calendar as CalendarIcon,
  Star,
  RefreshCw,
  Eye,
  EyeOff,
  BarChart3,
  LineChart as LineChartIcon,
  Package,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import toast from "react-hot-toast";
import * as XLSX from 'xlsx';
import { gregorianToPersian, getTodayJalali, persianMonths, persianWeekDays } from "@/lib/date-utils";
import Footer from "../components/Footer/Footer";

interface Appointment {
  id: number;
  client_name: string;
  client_phone: string;
  booking_date: string;
  booking_time: string;
  services: string;
  status: "active" | "cancelled" | "done";
  booking_description?: string;
  staff_id?: number;
  created_at: string;
  duration_minutes?: number;
}

interface Service {
  id: number;
  name: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
}

interface Staff {
  id: number;
  name: string;
  phone: string;
  service_ids: string | null;
  calendar_type: string;
  is_active: boolean;
}

type ChartType = "bar" | "line" | "area";

// تابع تبدیل تاریخ میلادی به شمسی (اصلاح شده)
const formatToPersianDate = (dateString: string): string => {
  if (!dateString) return "نامشخص";
  try {
    const persian = gregorianToPersian(dateString);
    return `${persian.year}/${(persian.month + 1).toString().padStart(2, '0')}/${persian.day.toString().padStart(2, '0')}`;
  } catch {
    return dateString;
  }
};

// تابع دریافت روز هفته شمسی
const getPersianWeekday = (dateString: string): string => {
  if (!dateString) return "نامشخص";
  try {
    const persian = gregorianToPersian(dateString);
    return persian.weekDay;
  } catch {
    return "نامشخص";
  }
};

// تابع تبدیل تاریخ شمسی به میلادی (اصلاح شده)
const convertPersianToGregorian = (year: number, month: number, day: number): Date => {
  // ساخت تاریخ شمسی به عنوان string و تبدیل به moment
  const persianStr = `${year}/${month}/${day}`;
  const m = window.moment ? window.moment(persianStr, "jYYYY/jMM/jDD") : null;
  if (m && m.isValid()) {
    return new Date(m.format("YYYY-MM-DD"));
  }
  // fallback ساده
  return new Date(year - 621, month - 1, day);
};

export default function ReportsPage() {
  const { data: bookingsData, isLoading: bookingsLoading, refetch } = useBookings();
  const { data: servicesData } = useServices();
  const { data: staffsData } = useStaffs();
  
  const todayJalali = getTodayJalali();
  
  // State برای تاریخ‌های شمسی
  const [persianStartDate, setPersianStartDate] = useState({
    year: todayJalali.year,
    month: todayJalali.month + 1,
    day: 1
  });
  const [persianEndDate, setPersianEndDate] = useState({
    year: todayJalali.year,
    month: todayJalali.month + 1,
    day: todayJalali.day
  });
  
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedStaff, setSelectedStaff] = useState("all");
  const [selectedService, setSelectedService] = useState("all");
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [showDetails, setShowDetails] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  
  // State برای پیجینیشن
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const allAppointments = useMemo(
    () => (bookingsData?.bookings as unknown as Appointment[]) || [],
    [bookingsData]
  );
  
  const allServices = useMemo(
    () => (servicesData?.services as Service[]) || [],
    [servicesData]
  );
  
  const allStaffs = useMemo(
    () => (staffsData?.staffs as Staff[]) || [],
    [staffsData]
  );
  
  // فیلترهای ترکیبی
  const filteredAppointments = useMemo(() => {
    let filtered = allAppointments;
    
    // فیلتر تاریخ با استفاده از gregorianToPersian برای مقایسه
    filtered = filtered.filter(app => {
      const persianApp = gregorianToPersian(app.booking_date);
      const appPersianDate = `${persianApp.year}${persianApp.month + 1}${persianApp.day}`;
      const startPersianDate = `${persianStartDate.year}${persianStartDate.month}${persianStartDate.day}`;
      const endPersianDate = `${persianEndDate.year}${persianEndDate.month}${persianEndDate.day}`;
      return appPersianDate >= startPersianDate && appPersianDate <= endPersianDate;
    });
    
    if (selectedStatus !== "all") {
      filtered = filtered.filter(app => app.status === selectedStatus);
    }
    
    if (selectedStaff !== "all") {
      filtered = filtered.filter(app => app.staff_id === parseInt(selectedStaff));
    }
    
    if (selectedService !== "all") {
      if (selectedService === "بدون سرویس") {
        filtered = filtered.filter(app => {
          const services = app.services?.split(',').map(s => s.trim()).filter(s => s) || [];
          return services.length === 0;
        });
      } else {
        filtered = filtered.filter(app => {
          const services = app.services?.split(',').map(s => s.trim()).filter(s => s) || [];
          return services.some(s => s === selectedService);
        });
      }
    }
    
    return filtered;
  }, [allAppointments, persianStartDate, persianEndDate, selectedStatus, selectedStaff, selectedService]);
  
  // پیجینیشن
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const paginatedAppointments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAppointments.slice(startIndex, endIndex);
  }, [filteredAppointments, currentPage, itemsPerPage]);
  
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };
  
  // آمار کلی پیشرفته
  const stats = useMemo(() => {
    const total = filteredAppointments.length;
    const active = filteredAppointments.filter(a => a.status === 'active').length;
    const done = filteredAppointments.filter(a => a.status === 'done').length;
    const cancelled = filteredAppointments.filter(a => a.status === 'cancelled').length;
    const cancelRate = total > 0 ? ((cancelled / total) * 100).toFixed(1) : 0;
    const successRate = total > 0 ? ((done / total) * 100).toFixed(1) : 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const future = filteredAppointments.filter(a => {
      const appDate = new Date(a.booking_date);
      appDate.setHours(0, 0, 0, 0);
      return appDate >= today && a.status === 'active';
    }).length;
    
    const past = filteredAppointments.filter(a => {
      const appDate = new Date(a.booking_date);
      appDate.setHours(0, 0, 0, 0);
      return appDate < today;
    }).length;
    
    const uniqueClients = new Set(filteredAppointments.map(a => a.client_phone)).size;
    
    const totalDuration = filteredAppointments.reduce((sum, a) => sum + (a.duration_minutes || 30), 0);
    const avgDuration = total > 0 ? Math.round(totalDuration / total) : 0;
    
    const noService = filteredAppointments.filter(a => {
      const services = a.services?.split(',').map(s => s.trim()).filter(s => s) || [];
      return services.length === 0;
    }).length;
    
    return { 
      total, active, done, cancelled, cancelRate, successRate,
      future, past, uniqueClients, avgDuration, noService
    };
  }, [filteredAppointments]);
  
  // داده برای نمودار روند روزانه
  const trendData = useMemo(() => {
    const trend: Record<string, { 
      date: string, 
      persianDate: string, 
      count: number, 
      active: number, 
      cancelled: number, 
      done: number 
    }> = {};
    
    filteredAppointments.forEach(app => {
      const persianDate = formatToPersianDate(app.booking_date);
      if (!trend[app.booking_date]) {
        trend[app.booking_date] = { 
          date: app.booking_date, 
          persianDate, 
          count: 0, 
          active: 0, 
          cancelled: 0, 
          done: 0 
        };
      }
      trend[app.booking_date].count++;
      if (app.status === 'active') trend[app.booking_date].active++;
      else if (app.status === 'cancelled') trend[app.booking_date].cancelled++;
      else if (app.status === 'done') trend[app.booking_date].done++;
    });
    
    return Object.entries(trend)
      .map(([_, data]) => data)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30);
  }, [filteredAppointments]);
  
  // محبوب‌ترین سرویس‌ها
  const popularServices = useMemo(() => {
    const serviceCount: Record<string, { 
      count: number, 
      active: number, 
      cancelled: number, 
      done: number, 
      totalDuration: number,
      uniqueClients: Set<string>
    }> = {};
    
    serviceCount["بدون سرویس"] = { 
      count: 0, active: 0, cancelled: 0, done: 0, totalDuration: 0, uniqueClients: new Set()
    };
    
    filteredAppointments.forEach(app => {
      const services = app.services?.split(',').map(s => s.trim()).filter(s => s) || [];
      if (services.length === 0) {
        serviceCount["بدون سرویس"].count++;
        serviceCount["بدون سرویس"].uniqueClients.add(app.client_phone);
        if (app.status === 'active') serviceCount["بدون سرویس"].active++;
        else if (app.status === 'cancelled') serviceCount["بدون سرویس"].cancelled++;
        else if (app.status === 'done') serviceCount["بدون سرویس"].done++;
        serviceCount["بدون سرویس"].totalDuration += app.duration_minutes || 30;
      } else {
        services.forEach(service => {
          const trimmed = service.trim();
          if (!serviceCount[trimmed]) {
            serviceCount[trimmed] = { 
              count: 0, active: 0, cancelled: 0, done: 0, totalDuration: 0, uniqueClients: new Set()
            };
          }
          serviceCount[trimmed].count++;
          serviceCount[trimmed].uniqueClients.add(app.client_phone);
          if (app.status === 'active') serviceCount[trimmed].active++;
          else if (app.status === 'cancelled') serviceCount[trimmed].cancelled++;
          else if (app.status === 'done') serviceCount[trimmed].done++;
          serviceCount[trimmed].totalDuration += app.duration_minutes || 30;
        });
      }
    });
    
    return Object.entries(serviceCount)
      .map(([name, data]) => ({ 
        name, 
        count: data.count,
        active: data.active,
        cancelled: data.cancelled,
        done: data.done,
        uniqueClients: data.uniqueClients.size,
        avgDuration: data.count > 0 ? Math.round(data.totalDuration / data.count) : 0
      }))
      .filter(s => s.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [filteredAppointments]);
  
  // آمار پرسنل
  const staffStats = useMemo(() => {
    const statsMap: Record<number, { 
      name: string, 
      total: number, 
      active: number, 
      done: number, 
      cancelled: number,
      totalDuration: number,
      noServiceCount: number
    }> = {};
    
    allStaffs.forEach((staff: Staff) => {
      statsMap[staff.id] = { 
        name: staff.name, 
        total: 0, 
        active: 0, 
        done: 0, 
        cancelled: 0,
        totalDuration: 0,
        noServiceCount: 0
      };
    });
    
    filteredAppointments.forEach(app => {
      if (app.staff_id && statsMap[app.staff_id]) {
        statsMap[app.staff_id].total++;
        if (app.status === 'active') statsMap[app.staff_id].active++;
        else if (app.status === 'done') statsMap[app.staff_id].done++;
        else if (app.status === 'cancelled') statsMap[app.staff_id].cancelled++;
        statsMap[app.staff_id].totalDuration += app.duration_minutes || 30;
        
        const services = app.services?.split(',').map(s => s.trim()).filter(s => s) || [];
        if (services.length === 0) {
          statsMap[app.staff_id].noServiceCount++;
        }
      }
    });
    
    return Object.values(statsMap)
      .filter(s => s.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [filteredAppointments, allStaffs]);
  
  // آمار ساعات کاری
  const hourlyStats = useMemo(() => {
    const hours: Record<number, { hour: number, count: number, active: number, done: number, cancelled: number }> = {};
    for (let i = 8; i <= 20; i++) {
      hours[i] = { hour: i, count: 0, active: 0, done: 0, cancelled: 0 };
    }
    
    filteredAppointments.forEach(app => {
      const hour = parseInt(app.booking_time.split(':')[0]);
      if (hours[hour]) {
        hours[hour].count++;
        if (app.status === 'active') hours[hour].active++;
        else if (app.status === 'done') hours[hour].done++;
        else if (app.status === 'cancelled') hours[hour].cancelled++;
      }
    });
    
    return Object.values(hours);
  }, [filteredAppointments]);
  
  // آمار روزهای هفته
  const weekdayStats = useMemo(() => {
    const weekdays = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];
    const statsMap: Record<string, { name: string, count: number, active: number, done: number, cancelled: number }> = {};
    
    weekdays.forEach(day => {
      statsMap[day] = { name: day, count: 0, active: 0, done: 0, cancelled: 0 };
    });
    
    filteredAppointments.forEach(app => {
      const weekday = getPersianWeekday(app.booking_date);
      if (statsMap[weekday]) {
        statsMap[weekday].count++;
        if (app.status === 'active') statsMap[weekday].active++;
        else if (app.status === 'done') statsMap[weekday].done++;
        else if (app.status === 'cancelled') statsMap[weekday].cancelled++;
      }
    });
    
    return Object.values(statsMap);
  }, [filteredAppointments]);
  
  // مشتریان وفادار
  const loyalClients = useMemo(() => {
    const clientMap: Record<string, { 
      name: string, 
      phone: string, 
      count: number, 
      lastVisit: string,
      lastVisitPersian: string,
      preferredService: string,
      preferredStaff: string
    }> = {};
    
    filteredAppointments.forEach(app => {
      if (!clientMap[app.client_phone]) {
        clientMap[app.client_phone] = {
          name: app.client_name,
          phone: app.client_phone,
          count: 0,
          lastVisit: app.booking_date,
          lastVisitPersian: formatToPersianDate(app.booking_date),
          preferredService: '',
          preferredStaff: ''
        };
      }
      clientMap[app.client_phone].count++;
      if (app.booking_date > clientMap[app.client_phone].lastVisit) {
        clientMap[app.client_phone].lastVisit = app.booking_date;
        clientMap[app.client_phone].lastVisitPersian = formatToPersianDate(app.booking_date);
      }
    });
    
    Object.values(clientMap).forEach(client => {
      const serviceCount: Record<string, number> = {};
      const staffCount: Record<number, number> = {};
      
      filteredAppointments
        .filter(a => a.client_phone === client.phone)
        .forEach(a => {
          const services = a.services?.split(',').map(s => s.trim()).filter(s => s) || [];
          const serviceToUse = services.length > 0 ? services[0] : "بدون سرویس";
          serviceCount[serviceToUse] = (serviceCount[serviceToUse] || 0) + 1;
          
          if (a.staff_id) {
            staffCount[a.staff_id] = (staffCount[a.staff_id] || 0) + 1;
          }
        });
      
      const topService = Object.entries(serviceCount).sort((a, b) => b[1] - a[1])[0];
      if (topService) client.preferredService = topService[0];
      
      const topStaff = Object.entries(staffCount).sort((a, b) => b[1] - a[1])[0];
      if (topStaff) {
    const staff = allStaffs.find(s => s.id === Number(topStaff[0]));
        if (staff) client.preferredStaff = staff.name;
      }
    });
    
    return Object.values(clientMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
  }, [filteredAppointments, allStaffs]);
  
  // داده برای رادار چارت
  const radarData = useMemo(() => {
    return [
      { subject: 'نوبت‌های فعال', value: stats.active, fullMark: stats.total || 1 },
      { subject: 'نوبت‌های انجام شده', value: stats.done, fullMark: stats.total || 1 },
   { subject: 'نرخ موفقیت', value: Number(stats.successRate) || 0, fullMark: 100 },   { subject: 'مشتریان منحصر‌بفرد', value: stats.uniqueClients, fullMark: stats.total || 1 },
    ];
  }, [stats]);
  
  // وضعیت نوبت‌های آینده vs گذشته
  const futurePastStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const future = filteredAppointments.filter(a => {
      const appDate = new Date(a.booking_date);
      appDate.setHours(0, 0, 0, 0);
      return appDate >= today;
    });
    const past = filteredAppointments.filter(a => {
      const appDate = new Date(a.booking_date);
      appDate.setHours(0, 0, 0, 0);
      return appDate < today;
    });
    
    return {
      future: {
        total: future.length,
        active: future.filter(a => a.status === 'active').length,
        cancelled: future.filter(a => a.status === 'cancelled').length,
        done: future.filter(a => a.status === 'done').length
      },
      past: {
        total: past.length,
        active: past.filter(a => a.status === 'active').length,
        cancelled: past.filter(a => a.status === 'cancelled').length,
        done: past.filter(a => a.status === 'done').length
      }
    };
  }, [filteredAppointments]);
  
  // داده برای نمودار وضعیت
  const statusData = [
    { name: 'فعال', value: stats.active, color: '#10b981' },
    { name: 'انجام شده', value: stats.done, color: '#3b82f6' },
    { name: 'کنسل شده', value: stats.cancelled, color: '#ef4444' }
  ];
  
  // توابع کمکی برای تاریخ شمسی
  const handlePersianStartDateChange = (value: string) => {
    const parts = value.split('/');
    if (parts.length === 3) {
      setPersianStartDate({
        year: parseInt(parts[0]),
        month: parseInt(parts[1]),
        day: parseInt(parts[2])
      });
      setCurrentPage(1);
    }
  };
  
  const handlePersianEndDateChange = (value: string) => {
    const parts = value.split('/');
    if (parts.length === 3) {
      setPersianEndDate({
        year: parseInt(parts[0]),
        month: parseInt(parts[1]),
        day: parseInt(parts[2])
      });
      setCurrentPage(1);
    }
  };
  
  const setCurrentMonth = () => {
    setPersianStartDate({
      year: todayJalali.year,
      month: todayJalali.month + 1,
      day: 1
    });
    setPersianEndDate({
      year: todayJalali.year,
      month: todayJalali.month + 1,
      day: todayJalali.day
    });
    setCurrentPage(1);
  };
  
  const setLast30Days = () => {
    let newYear = todayJalali.year;
    let newMonth = todayJalali.month + 1;
    let newDay = todayJalali.day - 30;
    
    if (newDay < 1) {
      newMonth--;
      if (newMonth < 1) {
        newMonth = 12;
        newYear--;
      }
      const daysInPrevMonth = (newMonth >= 1 && newMonth <= 6) || newMonth >= 11 ? 31 : 30;
      newDay = daysInPrevMonth + newDay;
    }
    
    setPersianStartDate({
      year: newYear,
      month: newMonth,
      day: newDay
    });
    setPersianEndDate({
      year: todayJalali.year,
      month: todayJalali.month + 1,
      day: todayJalali.day
    });
    setCurrentPage(1);
  };
  
  const setCurrentYear = () => {
    setPersianStartDate({
      year: todayJalali.year-1,
      month: todayJalali.month+1,
      day: todayJalali.day
    });
    setPersianEndDate({
      year: todayJalali.year,
      month: todayJalali.month+1,
      day: todayJalali.day
    });
    setCurrentPage(1);
  };
  
  // خروجی اکسل
  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const exportData = filteredAppointments.map(app => ({
        'تاریخ (شمسی)': formatToPersianDate(app.booking_date),
        'روز هفته': getPersianWeekday(app.booking_date),
        'ساعت': app.booking_time,
        'نام مشتری': app.client_name,
        'شماره تماس': app.client_phone,
        'خدمات': app.services?.trim() || 'بدون خدمت',
        'مدت زمان (دقیقه)': app.duration_minutes || 30,
        'وضعیت': app.status === 'active' ? 'فعال' : app.status === 'done' ? 'انجام شده' : 'کنسل شده',
        'پرسنل': allStaffs.find(s => s.id === app.staff_id)?.name || '-',
        'توضیحات': app.booking_description || '',
        'تاریخ ثبت': new Date(app.created_at).toLocaleDateString('fa-IR')
      }));
      
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'گزارش نوبت‌ها');
      XLSX.writeFile(wb, `گزارش_نوبت_ها_${todayJalali.year}-${todayJalali.month + 1}-${todayJalali.day}.xlsx`);
      toast.success('فایل اکسل با موفقیت ذخیره شد');
    } catch (error) {
      toast.error('خطا در ایجاد فایل اکسل');
    } finally {
      setIsExporting(false);
    }
  };
  
  const renderChart = () => {
    const chartData = trendData;
    switch (chartType) {
      case "bar":
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="persianDate" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="active" fill="#10b981" name="فعال" />
            <Bar dataKey="done" fill="#3b82f6" name="انجام شده" />
            <Bar dataKey="cancelled" fill="#ef4444" name="کنسل شده" />
          </BarChart>
        );
      case "line":
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="persianDate" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="active" stroke="#10b981" name="فعال" />
            <Line type="monotone" dataKey="done" stroke="#3b82f6" name="انجام شده" />
            <Line type="monotone" dataKey="cancelled" stroke="#ef4444" name="کنسل شده" />
          </LineChart>
        );
      case "area":
        return (
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="persianDate" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="active" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="فعال" />
            <Area type="monotone" dataKey="done" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="انجام شده" />
            <Area type="monotone" dataKey="cancelled" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="کنسل شده" />
          </AreaChart>
        );
    }
  };
  
  if (bookingsLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#1a1e26] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-gray-400">در حال بارگذاری داده‌ها...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pb-64 bg-slate-50 dark:bg-[#1a1e26] p-4 md:p-6">
      <div className="max-w-7xl pb-32 mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              📊 گزارش‌های تحلیلی پیشرفته
            </h1>
            <p className="text-slate-500 dark:text-gray-400 mt-1">
              تحلیل جامع عملکرد، آمار نوبت‌ها و بینش‌های کاربردی برای بهبود کسب‌وکار
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { refetch(); setCurrentPage(1); }}
              className="px-4 py-2 bg-slate-200 dark:bg-gray-700 text-slate-700 dark:text-gray-300 rounded-xl flex items-center gap-2 hover:bg-slate-300 transition"
            >
              <RefreshCw className="w-4 h-4" />
              بروزرسانی
            </button>
            <button
              onClick={exportToExcel}
              disabled={isExporting}
              className="px-4 py-2 bg-emerald-500 text-white rounded-xl flex items-center gap-2 hover:bg-emerald-600 transition disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'در حال آماده‌سازی...' : 'خروجی اکسل'}
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-blue-500 text-white rounded-xl flex items-center gap-2 hover:bg-blue-600 transition"
            >
              <Printer className="w-4 h-4" />
              پرینت
            </button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-white dark:bg-white/5 rounded-2xl p-4 md:p-6 mb-6 border border-slate-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-slate-600 dark:text-gray-400 mb-2">
                از تاریخ (شمسی)
              </label>
              <input
                type="text"
                placeholder="۱۴۰۴/۰۱/۰۱"
                value={`${persianStartDate.year}/${persianStartDate.month.toString().padStart(2, '0')}/${persianStartDate.day.toString().padStart(2, '0')}`}
                onChange={(e) => handlePersianStartDateChange(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-transparent font-mono"
                dir="ltr"
              />
              <p className="text-xs text-slate-400 mt-1">مثال: ۱۴۰۴/۰۱/۰۱</p>
            </div>
            
            <div>
              <label className="block text-sm text-slate-600 dark:text-gray-400 mb-2">
                تا تاریخ (شمسی)
              </label>
              <input
                type="text"
                placeholder="۱۴۰۴/۱۲/۲۹"
                value={`${persianEndDate.year}/${persianEndDate.month.toString().padStart(2, '0')}/${persianEndDate.day.toString().padStart(2, '0')}`}
                onChange={(e) => handlePersianEndDateChange(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-transparent font-mono"
                dir="ltr"
              />
              <p className="text-xs text-slate-400 mt-1">مثال: ۱۴۰۴/۱۲/۲۹</p>
            </div>
            
            <div>
              <label className="block text-sm text-slate-600 dark:text-gray-400 mb-2">وضعیت نوبت</label>
              <select
                value={selectedStatus}
                onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-transparent"
              >
                <option value="all">همه</option>
                <option value="active">فعال</option>
                <option value="done">انجام شده</option>
                <option value="cancelled">کنسل شده</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-slate-600 dark:text-gray-400 mb-2">پرسنل</label>
              <select
                value={selectedStaff}
                onChange={(e) => { setSelectedStaff(e.target.value); setCurrentPage(1); }}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-transparent"
              >
                <option value="all">همه پرسنل</option>
                {allStaffs.map((staff: Staff) => (
                  <option key={staff.id} value={staff.id}>{staff.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-slate-600 dark:text-gray-400 mb-2">سرویس</label>
              <select
                value={selectedService}
                onChange={(e) => { setSelectedService(e.target.value); setCurrentPage(1); }}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-transparent"
              >
                <option value="all">همه سرویس‌ها</option>
                <option value="بدون سرویس">بدون سرویس</option>
                {allServices.filter(s => s.is_active).map((service: Service) => (
                  <option key={service.id} value={service.name}>{service.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end gap-2 flex-wrap">
              <button
                onClick={setCurrentMonth}
                className="px-3 py-2 bg-slate-100 dark:bg-white/10 rounded-lg text-sm hover:bg-slate-200 transition whitespace-nowrap"
              >
                این ماه
              </button>
              <button
                onClick={setLast30Days}
                className="px-3 py-2 bg-slate-100 dark:bg-white/10 rounded-lg text-sm hover:bg-slate-200 transition whitespace-nowrap"
              >
                ۳۰ روز اخیر
              </button>
              <button
                onClick={setCurrentYear}
                className="px-3 py-2 bg-slate-100 dark:bg-white/10 rounded-lg text-sm hover:bg-slate-200 transition whitespace-nowrap"
              >
                امسال
              </button>
            </div>
          </div>
          
          <div className="mt-3 text-center text-xs text-slate-500 dark:text-gray-400">
            بازه زمانی انتخاب شده: {persianStartDate.year}/{persianStartDate.month.toString().padStart(2, '0')}/{persianStartDate.day.toString().padStart(2, '0')} 
            تا {persianEndDate.year}/{persianEndDate.month.toString().padStart(2, '0')}/{persianEndDate.day.toString().padStart(2, '0')} | 
            <span className="mr-1 text-emerald-600">کل نوبت‌ها: {stats.total}</span>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
          <div className="bg-white dark:bg-white/5 rounded-xl p-3 border border-slate-200 dark:border-gray-700 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500 dark:text-gray-400">کل نوبت‌ها</span>
              <Calendar className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-xl font-bold text-slate-800 dark:text-white">{stats.total}</div>
          </div>
          
          <div className="bg-white dark:bg-white/5 rounded-xl p-3 border border-slate-200 dark:border-gray-700 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500 dark:text-gray-400">فعال</span>
              <Activity className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-xl font-bold text-emerald-600">{stats.active}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">نوبت آینده</div>
          </div>
          
          <div className="bg-white dark:bg-white/5 rounded-xl p-3 border border-slate-200 dark:border-gray-700 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500 dark:text-gray-400">انجام شده</span>
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-xl font-bold text-blue-600">{stats.done}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{stats.successRate}% موفقیت</div>
          </div>
          
          <div className="bg-white dark:bg-white/5 rounded-xl p-3 border border-slate-200 dark:border-gray-700 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500 dark:text-gray-400">کنسل شده</span>
              <UserX className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-xl font-bold text-rose-600">{stats.cancelled}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{stats.cancelRate}% کنسلی</div>
          </div>
          
          <div className="bg-white dark:bg-white/5 rounded-xl p-3 border border-slate-200 dark:border-gray-700 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500 dark:text-gray-400">بدون سرویس</span>
              <Package className="w-4 h-4 text-orange-500" />
            </div>
            <div className="text-xl font-bold text-orange-600">{stats.noService}</div>
          </div>
          
          <div className="bg-white dark:bg-white/5 rounded-xl p-3 border border-slate-200 dark:border-gray-700 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500 dark:text-gray-400">مشتریان</span>
              <Users className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-xl font-bold text-purple-600">{stats.uniqueClients}</div>
          </div>
          
          <div className="bg-white dark:bg-white/5 rounded-xl p-3 border border-slate-200 dark:border-gray-700 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500 dark:text-gray-400">میانگین مدت</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl font-bold text-amber-600">{stats.avgDuration}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">دقیقه</div>
          </div>
        </div>
        
        {/* Trend Chart */}
        <div className="bg-white dark:bg-white/5 rounded-2xl p-4 md:p-6 border border-slate-200 dark:border-gray-700 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
            <h3 className="font-bold text-slate-800 dark:text-white text-lg">📈 روند نوبت‌ها (۳۰ روز اخیر)</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setChartType("bar")}
                className={`p-2 rounded-lg transition ${chartType === "bar" ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-white/10"}`}
                title="نمودار میله‌ای"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setChartType("line")}
                className={`p-2 rounded-lg transition ${chartType === "line" ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-white/10"}`}
                title="نمودار خطی"
              >
                <LineChartIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setChartType("area")}
                className={`p-2 rounded-lg transition ${chartType === "area" ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-white/10"}`}
                title="نمودار مساحتی"
              >
                <TrendingUp className="w-4 h-4" />
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            {renderChart()}
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Status Pie Chart */}
          <div className="bg-white dark:bg-white/5 rounded-2xl p-4 border border-slate-200 dark:border-gray-700">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">🎯 وضعیت کلی نوبت‌ها</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Radar Chart */}
          <div className="bg-white dark:bg-white/5 rounded-2xl p-4 border border-slate-200 dark:border-gray-700">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">⚡ عملکرد کلی</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis />
                <Radar name="عملکرد" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Future vs Past */}
          <div className="bg-white dark:bg-white/5 rounded-2xl p-4 border border-slate-200 dark:border-gray-700">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">⏰ مقایسه آینده و گذشته</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-600 dark:text-gray-400">نوبت‌های آینده</span>
                  <span className="text-sm font-bold text-emerald-600">{futurePastStats.future.total}</span>
                </div>
                <div className="flex h-8 rounded-lg overflow-hidden">
                  <div style={{ width: `${(futurePastStats.future.active / Math.max(futurePastStats.future.total, 1)) * 100}%` }} className="bg-emerald-500 flex items-center justify-center text-xs text-white">
                    فعال {futurePastStats.future.active}
                  </div>
                  <div style={{ width: `${(futurePastStats.future.done / Math.max(futurePastStats.future.total, 1)) * 100}%` }} className="bg-blue-500 flex items-center justify-center text-xs text-white">
                    انجام {futurePastStats.future.done}
                  </div>
                  <div style={{ width: `${(futurePastStats.future.cancelled / Math.max(futurePastStats.future.total, 1)) * 100}%` }} className="bg-rose-500 flex items-center justify-center text-xs text-white">
                    کنسل {futurePastStats.future.cancelled}
                  </div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-600 dark:text-gray-400">نوبت‌های گذشته</span>
                  <span className="text-sm font-bold text-blue-600">{futurePastStats.past.total}</span>
                </div>
                <div className="flex h-8 rounded-lg overflow-hidden">
                  <div style={{ width: `${(futurePastStats.past.active / Math.max(futurePastStats.past.total, 1)) * 100}%` }} className="bg-emerald-500 flex items-center justify-center text-xs text-white">
                    فعال {futurePastStats.past.active}
                  </div>
                  <div style={{ width: `${(futurePastStats.past.done / Math.max(futurePastStats.past.total, 1)) * 100}%` }} className="bg-blue-500 flex items-center justify-center text-xs text-white">
                    انجام {futurePastStats.past.done}
                  </div>
                  <div style={{ width: `${(futurePastStats.past.cancelled / Math.max(futurePastStats.past.total, 1)) * 100}%` }} className="bg-rose-500 flex items-center justify-center text-xs text-white">
                    کنسل {futurePastStats.past.cancelled}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Popular Services */}
          <div className="bg-white dark:bg-white/5 rounded-2xl p-4 border border-slate-200 dark:border-gray-700">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Scissors className="w-5 h-5 text-emerald-500" />
              محبوب‌ترین سرویس‌ها
            </h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {popularServices.map((service, idx) => (
                <div key={idx} className={`flex items-center justify-between p-2 rounded-lg transition ${service.name === "بدون سرویس" ? "bg-orange-50 dark:bg-orange-500/10" : "hover:bg-slate-50 dark:hover:bg-white/5"}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-700 dark:text-gray-300">{service.name}</span>
                      {service.name === "بدون سرویس" && <Package className="w-3 h-3 text-orange-500" />}
                    </div>
                    <div className="flex gap-2 mt-1 text-xs flex-wrap">
                      <span className="text-emerald-600">فعال: {service.active}</span>
                      <span className="text-blue-600">انجام: {service.done}</span>
                      <span className="text-rose-600">کنسل: {service.cancelled}</span>
                      <span className="text-amber-600">مدت: {service.avgDuration} دقیقه</span>
                      <span className="text-purple-600">مشتری: {service.uniqueClients}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-slate-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${stats.total > 0 ? (service.count / stats.total) * 100 : 0}%` }} />
                    </div>
                    <span className="text-sm font-bold text-emerald-600 min-w-[40px] text-left">{service.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Hourly Stats */}
          <div className="bg-white dark:bg-white/5 rounded-2xl p-4 border border-slate-200 dark:border-gray-700">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-500" />
              ساعات شلوغ
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#10b981" name="تعداد نوبت" />
                <Bar dataKey="active" fill="#3b82f6" name="فعال" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Weekday Stats */}
          <div className="bg-white dark:bg-white/5 rounded-2xl p-4 border border-slate-200 dark:border-gray-700">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-amber-500" />
              روزهای شلوغ هفته
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weekdayStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#10b981" name="تعداد نوبت" />
                <Bar dataKey="active" fill="#3b82f6" name="فعال" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Staff Performance */}
        <div className="bg-white dark:bg-white/5 rounded-2xl p-4 border border-slate-200 dark:border-gray-700 mb-6">
          <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            عملکرد پرسنل
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {staffStats.map((staff, idx) => (
              <div key={idx} className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-slate-800 dark:text-white">{staff.name}</span>
                  <span className="text-sm text-slate-500">مجموع: {staff.total}</span>
                </div>
                <div className="flex h-6 rounded-lg overflow-hidden mb-3">
                  <div style={{ width: `${(staff.active / Math.max(staff.total, 1)) * 100}%` }} className="bg-emerald-500 flex items-center justify-center text-[10px] text-white">
                    {staff.active}
                  </div>
                  <div style={{ width: `${(staff.done / Math.max(staff.total, 1)) * 100}%` }} className="bg-blue-500 flex items-center justify-center text-[10px] text-white">
                    {staff.done}
                  </div>
                  <div style={{ width: `${(staff.cancelled / Math.max(staff.total, 1)) * 100}%` }} className="bg-rose-500 flex items-center justify-center text-[10px] text-white">
                    {staff.cancelled}
                  </div>
                </div>
                <div className="flex justify-between text-xs flex-wrap gap-2">
                  <span className="text-emerald-600">فعال: {staff.active}</span>
                  <span className="text-blue-600">انجام: {staff.done}</span>
                  <span className="text-rose-600">کنسل: {staff.cancelled}</span>
                  {staff.noServiceCount > 0 && (
                    <span className="text-orange-600">بدون سرویس: {staff.noServiceCount}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Loyal Clients */}
        <div className="bg-white dark:bg-white/5 rounded-2xl p-4 border border-slate-200 dark:border-gray-700 mb-6">
          <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            مشتریان وفادار
          </h3>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-white/5 sticky top-0">
                <tr>
                  <th className="p-3 text-right text-sm">#</th>
                  <th className="p-3 text-right text-sm">نام مشتری</th>
                  <th className="p-3 text-right text-sm">شماره تماس</th>
                  <th className="p-3 text-right text-sm">تعداد نوبت</th>
                  <th className="p-3 text-right text-sm">سرویس مورد علاقه</th>
                  <th className="p-3 text-right text-sm">پرسنل مورد علاقه</th>
                  <th className="p-3 text-right text-sm">آخرین بازدید</th>
                </tr>
              </thead>
              <tbody>
                {loyalClients.map((client, idx) => (
                  <tr key={idx} className="border-t border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-white/5 transition">
                    <td className="p-3 text-sm font-bold text-emerald-600">{idx + 1}</td>
                    <td className="p-3 text-sm font-medium">{client.name}</td>
                    <td className="p-3 text-sm" dir="ltr">{client.phone}</td>
                    <td className="p-3 text-sm">
                      <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 rounded-full text-xs">
                        {client.count} نوبت
                      </span>
                    </td>
                    <td className="p-3 text-sm">{client.preferredService || '-'}</td>
                    <td className="p-3 text-sm">{client.preferredStaff || '-'}</td>
                    <td className="p-3 text-sm">{client.lastVisitPersian}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Details Table with Pagination */}
        <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-gray-700 flex justify-between items-center flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 dark:text-white">📋 لیست کامل نوبت‌ها</h3>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition"
              >
                {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={itemsPerPage}
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="px-2 py-1 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-transparent text-sm"
              >
                <option value={10}>۱۰ در صفحه</option>
                <option value={25}>۲۵ در صفحه</option>
                <option value={50}>۵۰ در صفحه</option>
                <option value={100}>۱۰۰ در صفحه</option>
              </select>
              <div className="text-sm text-slate-500">
                نمایش {filteredAppointments.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredAppointments.length)} از {filteredAppointments.length}
              </div>
            </div>
          </div>
          
          {showDetails && (
            <>
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-white/5 sticky top-0">
                    <tr>
                      <th className="p-3 text-right text-sm">#</th>
                      <th className="p-3 text-right text-sm">تاریخ (شمسی)</th>
                      <th className="p-3 text-right text-sm">روز</th>
                      <th className="p-3 text-right text-sm">ساعت</th>
                      <th className="p-3 text-right text-sm">مشتری</th>
                      <th className="p-3 text-right text-sm">شماره تماس</th>
                      <th className="p-3 text-right text-sm">سرویس</th>
                      <th className="p-3 text-right text-sm">پرسنل</th>
                      <th className="p-3 text-right text-sm">وضعیت</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAppointments.map((app, idx) => {
                      const staff = allStaffs.find((s: Staff) => s.id === app.staff_id);
                      const hasService = app.services?.trim() && app.services.trim() !== '';
                      const rowNumber = (currentPage - 1) * itemsPerPage + idx + 1;
                      return (
                        <tr key={app.id} className="border-t border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-white/5 transition">
                          <td className="p-3 text-sm text-slate-400">{rowNumber}</td>
                          <td className="p-3 text-sm">{formatToPersianDate(app.booking_date)}</td>
                          <td className="p-3 text-sm">{getPersianWeekday(app.booking_date)}</td>
                          <td className="p-3 text-sm">{app.booking_time}</td>
                          <td className="p-3 text-sm font-medium">{app.client_name}</td>
                          <td className="p-3 text-sm" dir="ltr">{app.client_phone}</td>
                          <td className="p-3 text-sm">
                            {hasService ? (
                              <span className="max-w-xs truncate block">{app.services}</span>
                            ) : (
                              <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-500/20 text-orange-700 rounded-full text-xs">بدون خدمت</span>
                            )}
                          </td>
                          <td className="p-3 text-sm">{staff?.name || '-'}</td>
                          <td className="p-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              app.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                              app.status === 'done' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'
                            }`}>
                              {app.status === 'active' ? 'فعال' : app.status === 'done' ? 'انجام شده' : 'کنسل شده'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-slate-200 dark:border-gray-700 flex justify-center items-center gap-2">
                  <button
                    onClick={() => goToPage(1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                    <span className="sr-only">اولین</span>
                  </button>
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="sr-only">قبلی</span>
                  </button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition ${
                            currentPage === pageNum
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-100 dark:bg-white/10 hover:bg-slate-200'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                    <span className="sr-only">بعدی</span>
                  </button>
                  <button
                    onClick={() => goToPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="sr-only">آخرین</span>
                  </button>
                </div>
              )}
            </>
          )}
          
          {!showDetails && (
            <div className="p-8 text-center text-slate-500 dark:text-gray-400">
              <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>برای مشاهده لیست نوبت‌ها، دکمه نمایش را کلیک کنید</p>
            </div>
          )}
        </div>
      </div>

      <Footer/>
    </div>
  );
}