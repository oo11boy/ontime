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
 * تعیین فرمت ورودی برای moment
 * تاریخ‌های میلادی معمولاً YYYY-MM-DD (ISO) یا YYYY/MM/DD هستند.
 */
const getGregorianDateFormat = (dateString: string): string | undefined => {
    if (typeof dateString === 'string') {
        if (dateString.includes('-')) return 'YYYY-MM-DD';
        if (dateString.includes('/')) return 'YYYY/MM/DD';
    }
    return undefined; // به moment اجازه می‌دهد تا به صورت هوشمند تشخیص دهد
};

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
    let m;
    if (typeof date === 'string') {
        // اعمال اصلاحیه: تعیین صریح فرمت ورودی برای جلوگیری از هشدار
        const format = getGregorianDateFormat(date);
        m = moment(date, format);
    } else {
        m = moment(date);
    }

    if (!m.isValid()) throw new Error("Invalid date input.");

    const monthIndex = m.jMonth();
    const weekDayIndex = m.day(); // 0 = یکشنبه (میلادی), moment-jalaali آن را به شنبه منطبق می‌کند
    
    return {
      year: m.jYear(),
      month: monthIndex + 1,
      monthName: persianMonths[monthIndex],
      day: m.jDate(),
      weekDay: persianWeekDays[m.day() % 7], // 0: یکشنبه, 1: دوشنبه, ..., 6: شنبه. باید با آرایه persianWeekDays هماهنگ شود (که از شنبه شروع می‌شود)
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
 * این تابع در خط 93 فایل date-utils.ts قرار دارد و هشدار از همین‌جا تولید می‌شد.
 */
export const formatPersianDate = (dateString: string): string => {
  try {
    // اعمال اصلاحیه: تعیین صریح فرمت ورودی برای جلوگیری از هشدار
    const format = getGregorianDateFormat(dateString);
    const m = moment(dateString, format); // <--- خط 93 (خطایی که گزارش شده بود)

    if (!m.isValid()) return dateString; // اگر پارس نشد، رشته اصلی را برگردان

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
    // اعمال اصلاحیه: تعیین صریح فرمت ورودی
    const format = getGregorianDateFormat(dateString);
    const m = moment(dateString, format); 
    
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