// File Path: src\lib\date-utils.ts

// src\lib\date-utils.ts
import moment from "moment-jalaali";

// نام‌های فارسی کامل ماه‌ها
export const persianMonths = [
  'فروردین', 'اردیبهشت', 'خرداد',
  'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر',
  'دی', 'بهمن', 'اسفند'
];

// نام‌های روزهای هفته
export const persianWeekDays = [
  'شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'
];

/**
 * تبدیل تاریخ شمسی (سال، ماه، روز) به تاریخ میلادی YYYY-MM-DD
 */
export function jalaliToGregorian(year: number, month: number, day: number): string {
  try {
    const jalaliDate = moment(`${year}/${month + 1}/${day}`, "jYYYY/jMM/jDD");
    const gregorianDate = jalaliDate.format("YYYY-MM-DD");
    return gregorianDate;
  } catch (error) {
    console.error("Error converting Jalali to Gregorian:", error);
    // در صورت خطا، تاریخ امروز را برگردانید
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * بررسی اینکه آیا تاریخ شمسی معتبر است
 */
export function isValidJalaliDate(year: number, month: number, day: number): boolean {
  try {
    if (year < 1300 || year > 1500) return false;
    if (month < 0 || month > 11) return false;
    if (day < 1 || day > 31) return false;
    
    const dateStr = `${year}/${month + 1}/${day}`;
    const m = moment(dateStr, "jYYYY/jMM/jDD");
    return m.isValid();
  } catch {
    return false;
  }
}

/**
 * تبدیل تاریخ میلادی به شمسی با ماه فارسی
 */
export const gregorianToPersian = (date: Date | string): {
  year: number;
  month: number;
  monthName: string;
  day: number;
  fullDate: string;
  weekDay: string;
} => {
  try {
    const m = moment(date);
    const monthIndex = m.jMonth();
    const weekDayIndex = m.day(); // 0 = شنبه, 6 = جمعه
    
    return {
      year: m.jYear(),
      month: monthIndex + 1,
      monthName: persianMonths[monthIndex],
      day: m.jDate(),
      weekDay: persianWeekDays[weekDayIndex],
      fullDate: `${m.jDate()} ${persianMonths[monthIndex]} ${m.jYear()}`
    };
  } catch (error) {
    console.error("Error converting Gregorian to Persian:", error);
    return {
      year: 1400,
      month: 1,
      monthName: 'فروردین',
      day: 1,
      weekDay: 'شنبه',
      fullDate: '1 فروردین 1400'
    };
  }
};

/**
 * برای نمایش تاریخ در جدول‌ها
 */
export const formatPersianDate = (dateString: string): string => {
  try {
    const m = moment(dateString);
    const monthIndex = m.jMonth();
    return `${m.jDate()} ${persianMonths[monthIndex]} ${m.jYear()}`;
  } catch {
    return dateString;
  }
};

/**
 * برای نمایش تاریخ و زمان به صورت فارسی
 */
export const formatPersianDateTime = (dateString: string, timeString: string): string => {
  try {
    const datePart = formatPersianDate(dateString);
    return `${datePart} ساعت ${timeString}`;
  } catch {
    return `${dateString} - ${timeString}`;
  }
};

/**
 * بررسی آیا تاریخ گذشته است
 */
export const isPastDate = (dateString: string, timeString?: string): boolean => {
  try {
    const m = moment(dateString);
    
    if (timeString) {
      // اگر زمان هم مشخص شده
      const [hours, minutes] = timeString.split(':').map(Number);
      m.set('hour', hours || 0);
      m.set('minute', minutes || 0);
      return m.isBefore(moment());
    }
    
    // فقط تاریخ
    return m.isBefore(moment(), 'day');
  } catch {
    return false;
  }
};

/**
 * گرفتن تاریخ امروز شمسی
 */
export const getTodayJalali = (): { year: number; month: number; day: number } => {
  const today = moment();
  return {
    year: today.jYear(),
    month: today.jMonth(),
    day: today.jDate()
  };
};

/**
 * گرفتن نام ماه فارسی از شماره ماه (1-12)
 */
export const getPersianMonthName = (monthNumber: number): string => {
  if (monthNumber >= 1 && monthNumber <= 12) {
    return persianMonths[monthNumber - 1];
  }
  return 'نامشخص';
};