import moment from "moment-jalaali";

// نام‌های فارسی کامل ماه‌ها (0-indexed: فروردین = 0)
export const persianMonths = [
  'فروردین', 'اردیبهشت', 'خرداد',
  'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر',
  'دی', 'بهمن', 'اسفند'
];

// نام‌های روزهای هفته – از شنبه شروع می‌شود
export const persianWeekDays = [
  'شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'
];

/**
 * تعیین فرمت ورودی برای moment (میلادی)
 */
const getGregorianDateFormat = (dateString: string): string | undefined => {
  if (typeof dateString === 'string') {
    if (dateString.includes('-')) return 'YYYY-MM-DD';
    if (dateString.includes('/')) return 'YYYY/MM/DD';
  }
  return undefined;
};

/**
 * تبدیل تاریخ شمسی به میلادی YYYY-MM-DD
 * 
 * ورودی month: 0-indexed (فروردین = 0، آذر = 8)
 * moment-jalaali ماه را 1-indexed می‌خواهد → بنابراین month + 1
 */
export const jalaliToGregorian = (year: number, month: number, day: number): string => {
  try {
    // ساخت رشته تاریخ جلالی با ماه 1-indexed
    const jalaliString = `${year}/${month + 1}/${day}`;
    const jalaliMoment = moment(jalaliString, 'jYYYY/jMM/jDD');

    if (!jalaliMoment.isValid()) {
      console.warn('Invalid Jalali date:', jalaliString);
      return new Date().toISOString().split('T')[0];
    }

    return jalaliMoment.format('YYYY-MM-DD');
  } catch (error) {
    console.error('Error in jalaliToGregorian:', error);
    return new Date().toISOString().split('T')[0];
  }
};

/**
 * بررسی اعتبار تاریخ شمسی
 */
export function isValidJalaliDate(year: number, month: number, day: number): boolean {
  if (year < 1300 || year > 1500) return false;
  if (month < 0 || month > 11) return false;
  if (day < 1 || day > 31) return false;

  try {
    const jalaliString = `${year}/${month + 1}/${day}`;
    const m = moment(jalaliString, 'jYYYY/jMM/jDD');
    return m.isValid();
  } catch {
    return false;
  }
}

/**
 * تبدیل تاریخ میلادی به شمسی (month 0-indexed)
 */
export const gregorianToPersian = (date: Date | string): {
  year: number;
  month: number;        // 0-indexed
  monthName: string;
  day: number;
  fullDate: string;
  weekDay: string;
} => {
  try {
    let m;
    if (typeof date === 'string') {
      const format = getGregorianDateFormat(date);
      m = moment(date, format);
    } else {
      m = moment(date);
    }

    if (!m.isValid()) throw new Error('Invalid date');

    const jYear = m.jYear();
    const jMonth = m.jMonth();        // 0-indexed
    const jDay = m.jDate();
    const weekDayIndex = m.day();     // 0 = یکشنبه (میلادی)

    // تبدیل به اندیس شروع از شنبه
    const persianWeekDayIndex = (weekDayIndex + 1) % 7; // شنبه = 0

    return {
      year: jYear,
      month: jMonth,
      monthName: persianMonths[jMonth],
      day: jDay,
      weekDay: persianWeekDays[persianWeekDayIndex],
      fullDate: `${jDay} ${persianMonths[jMonth]} ${jYear}`
    };
  } catch (error) {
    console.error('Error converting Gregorian to Persian:', error);
    return {
      year: 1404,
      month: 8, // آذر
      monthName: 'آذر',
      day: 29,
      weekDay: 'جمعه',
      fullDate: '۲۹ آذر ۱۴۰۴'
    };
  }
};

/**
 * نمایش تاریخ فارسی
 */
export const formatPersianDate = (dateString: string): string => {
  try {
    const format = getGregorianDateFormat(dateString);
    const m = moment(dateString, format);

    if (!m.isValid()) return dateString;

    const jMonth = m.jMonth(); // 0-indexed
    return `${m.jDate()} ${persianMonths[jMonth]} ${m.jYear()}`;
  } catch {
    return dateString;
  }
};

/**
 * نمایش تاریخ و زمان فارسی
 */
export const formatPersianDateTime = (dateString: string, timeString: string): string => {
  try {
    return `${formatPersianDate(dateString)} ساعت ${timeString}`;
  } catch {
    return `${dateString} - ${timeString}`;
  }
};

/**
 * آیا تاریخ گذشته است؟
 */
export const isPastDate = (dateString: string, timeString?: string): boolean => {
  try {
    const format = getGregorianDateFormat(dateString);
    const m = moment(dateString, format);

    if (timeString) {
      const [h, min] = timeString.split(':').map(Number);
      m.hour(h || 0);
      m.minute(min || 0);
      return m.isBefore(moment());
    }

    return m.isBefore(moment(), 'day');
  } catch {
    return false;
  }
};

/**
 * تاریخ امروز شمسی (month 0-indexed)
 */
export const getTodayJalali = (): { year: number; month: number; day: number } => {
  const today = moment();
  return {
    year: today.jYear(),
    month: today.jMonth(),   // 0-indexed
    day: today.jDate()
  };
};

/**
 * نام ماه فارسی از شماره ماه (1-12)
 */
export const getPersianMonthName = (monthNumber: number): string => {
  if (monthNumber >= 1 && monthNumber <= 12) {
    return persianMonths[monthNumber - 1];
  }
  return 'نامشخص';
};


/**
 * گرفتن تاریخ و زمان فعلی به صورت شمسی و میلادی
 */
export const getCurrentDateTime = () => {
  const now = new Date();
  const currentGregorianDate = now.toISOString().split('T')[0];
  
  const jalaliNow = gregorianToPersian(now);
  
  return {
    // تاریخ میلادی فعلی
    currentGregorianDate,
    // تاریخ شمسی فعلی
    currentJalaliDate: {
      year: jalaliNow.year,
      month: jalaliNow.month,
      day: jalaliNow.day,
    },
    // زمان فعلی
    currentTime: {
      hour: now.getHours(),
      minute: now.getMinutes(),
    },
    // رشته زمان برای مقایسه
    currentTimeString: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  };
};

/**
 * بررسی آیا زمان انتخاب شده گذشته است (بر اساس تاریخ میلادی)
 */
export const isTimeInPast = (
  selectedGregorianDate: string,
  selectedTime: string,
  currentGregorianDate?: string,
  currentTimeString?: string
): boolean => {
  try {
    const currentDate = currentGregorianDate || new Date().toISOString().split('T')[0];
    const currentTime = currentTimeString || 
      `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`;

    // اگر تاریخ انتخاب شده قبل از امروز باشد
    if (selectedGregorianDate < currentDate) {
      return true;
    }
    
    // اگر تاریخ انتخاب شده همان امروز است
    if (selectedGregorianDate === currentDate) {
      // تبدیل زمان‌ها به دقیقه برای مقایسه
      const [selectedHour, selectedMinute] = selectedTime.split(':').map(Number);
      const [currentHour, currentMinute] = currentTime.split(':').map(Number);
      
      const selectedTotalMinutes = selectedHour * 60 + selectedMinute;
      const currentTotalMinutes = currentHour * 60 + currentMinute;
      
      return selectedTotalMinutes <= currentTotalMinutes;
    }
    
    return false;
  } catch (error) {
    console.error('Error in isTimeInPast:', error);
    return false;
  }
};