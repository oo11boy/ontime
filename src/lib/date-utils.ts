// lib/date-utils.ts
import moment from "moment-jalaali";

/* --------------------------------------------------
   ثابت‌ها
-------------------------------------------------- */

export const persianMonths = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

export const persianWeekDays = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
];

/* --------------------------------------------------
   توابع پایه
-------------------------------------------------- */

// تبدیل هر نوع تاریخ ورودی به فرمت YYYY-MM-DD (فقط تاریخ، بدون زمان)
export const normalizeToDateOnly = (dateStr: string): string => {

  try {
    // اگر تاریخ به فرمت ISO (با T) بود
    if (dateStr.includes("T")) {
      // فقط قسمت تاریخ را بگیر
      const normalized = dateStr.split("T")[0];
   
      return normalized;
    }
    
    // اگر تاریخ به فرمت YYYY-MM-DD بود
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
  
      return dateStr;
    }
    
    return dateStr;
  } catch {
    return dateStr;
  }
};

// ساخت Date محلی امن از YYYY-MM-DD
export const parseLocalDate = (dateStr: string): Date => {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
};

// ساخت moment امن از تاریخ میلادی (فقط تاریخ، بدون زمان)
export const safeMomentFromGregorian = (dateStr: string) => {
  // اول نرمالایز کن
  const normalized = normalizeToDateOnly(dateStr);
  const [year, month, day] = normalized.split("-").map(Number);
  
  // ساخت moment با ساعت 12 ظهر برای جلوگیری از جابه‌جایی منطقه زمانی
  return moment(`${year}-${month}-${day} 12:00:00`, "YYYY-MM-DD HH:mm:ss");
};

/* --------------------------------------------------
   تبدیل تاریخ‌ها
-------------------------------------------------- */

// تبدیل شمسی → میلادی (YYYY-MM-DD)
export const jalaliToGregorian = (
  year: number,
  month: number, // 0-indexed
  day: number
): string => {
  try {
    const jalaliString = `${year}/${month + 1}/${day}`;
    const m = moment(jalaliString, "jYYYY/jMM/jDD");
    m.hour(12).minute(0).second(0);

    if (!m.isValid()) throw new Error("Invalid Jalali date");

    return m.format("YYYY-MM-DD");
  } catch (error) {
    console.error("jalaliToGregorian error:", error);
    return moment().format("YYYY-MM-DD");
  }
};

// تبدیل میلادی → شمسی
export const gregorianToPersian = (
  date: Date | string
): {
  year: number;
  month: number;
  monthName: string;
  day: number;
  fullDate: string;
  weekDay: string;
} => {
  try {
    let dateStr: string;
    
    if (typeof date === "string") {
      dateStr = normalizeToDateOnly(date);
    } else {
      // اگر Date object بود، به فرمت YYYY-MM-DD تبدیل کن
      dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    }
    
    const m = safeMomentFromGregorian(dateStr);
    
    if (!m.isValid()) throw new Error("Invalid date");

    const jYear = m.jYear();
    const jMonth = m.jMonth();
    const jDay = m.jDate();
    const weekDayIndex = (m.day() + 1) % 7;

    return {
      year: jYear,
      month: jMonth,
      monthName: persianMonths[jMonth],
      day: jDay,
      weekDay: persianWeekDays[weekDayIndex],
      fullDate: `${jDay} ${persianMonths[jMonth]} ${jYear}`,
    };
  } catch (error) {
    console.error("gregorianToPersian error:", error);
    return {
      year: 1400,
      month: 0,
      monthName: "فروردین",
      day: 1,
      weekDay: "شنبه",
      fullDate: "1 فروردین 1400",
    };
  }
};

/* --------------------------------------------------
   نمایش تاریخ
-------------------------------------------------- */

export const formatPersianDate = (dateString: string): string => {

  
  try {
    const m = safeMomentFromGregorian(dateString);
    if (!m.isValid()) {
      console.log("formatPersianDate - moment نامعتبر");
      return dateString;
    }
    
    const result = `${m.jDate()} ${persianMonths[m.jMonth()]} ${m.jYear()}`;

    
    return result;
  } catch (error) {
    console.error("formatPersianDate error:", error);
    return dateString;
  }
};

export const formatPersianDateTime = (
  dateString: string,
  timeString: string
): string => {
  return `${formatPersianDate(dateString)} ساعت ${timeString}`;
};

/* --------------------------------------------------
   بررسی گذشته بودن
-------------------------------------------------- */

export const isPastDate = (
  dateString: string,
  timeString?: string
): boolean => {
  try {
    const normalized = normalizeToDateOnly(dateString);
    const [year, month, day] = normalized.split("-").map(Number);
    const m = moment(`${year}-${month}-${day}`, "YYYY-MM-DD").hour(12);
    
    if (!m.isValid()) return false;

    if (timeString) {
      const [h, min] = timeString.split(":").map(Number);
      m.hour(h || 0).minute(min || 0);
      return m.isBefore(moment());
    }

    // فقط مقایسه روز (بدون ساعت)
    return m.isBefore(moment(), "day");
  } catch {
    return false;
  }
};

/* --------------------------------------------------
   تاریخ امروز شمسی
-------------------------------------------------- */

export const getTodayJalali = (): {
  year: number;
  month: number;
  day: number;
} => {
  const today = moment();
  return {
    year: today.jYear(),
    month: today.jMonth(),
    day: today.jDate(),
  };
};

/* --------------------------------------------------
   ابزارهای کمکی
-------------------------------------------------- */

export const getPersianMonthName = (monthNumber: number): string => {
  return persianMonths[monthNumber - 1] || "نامشخص";
};

export const getCurrentDateTime = () => {
  const now = new Date();

  return {
    currentGregorianDate: `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`,
    currentTimeString: `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`,
  };
};

// بررسی اینکه تاریخ + زمان گذشته است
export const isTimeInPast = (date: string, time: string): boolean => {
  try {
    const [y, m, d] = date.split("-").map(Number);
    const [h, min] = time.split(":").map(Number);

    const bookingDate = new Date(y, m - 1, d, h, min, 0, 0);
    return bookingDate.getTime() <= Date.now();
  } catch {
    return false;
  }
};