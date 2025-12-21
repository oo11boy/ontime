// File Path: src/app/api/sms/send/route.ts

import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import { deductSms, getSmsBalanceDetails } from "@/lib/sms-server"; // توجه: از فایل سروری ایمپورت شود

export const POST = withAuth(async (req, context) => {
  const { userId } = context;

  try {
    const body = await req.json();

    const {
      to_phone,
      content,
      sms_type = "other",
      booking_id = null,
      booking_date = null, // فرمت YYYY-MM-DD
      booking_time = null, // فرمت HH:mm
      sms_reminder_hours_before = 24,
    } = body;

    // ۱. بررسی اعتبار داده‌های ورودی
    if (!to_phone || !content?.trim()) {
      return NextResponse.json(
        { success: false, message: "اطلاعات ناقص است" },
        { status: 400 }
      );
    }

    // ۲. بررسی موجودی پیامک کاربر (سمت سرور و ایمن)
    const balance = await getSmsBalanceDetails(userId);
    if (balance.total_balance < 1) {
      return NextResponse.json(
        { success: false, message: "موجودی پیامک شما کافی نیست" },
        { status: 402 }
      );
    }

    let bookingAt = null; // زمان نوبت رزرو
    let scheduledAt = null; // زمان محاسبه شده برای ارسال (یادآوری)
    let status = "sent"; // وضعیت پیش‌فرض ارسال آنی

    // ۳. محاسبات زمان نوبت و یادآوری (بدون تداخل با منطقه زمانی UTC)
    if (booking_date && booking_time) {
      try {
        // الف) فرمت استاندارد زمان نوبت برای ذخیره در دیتابیس
        bookingAt = `${booking_date} ${booking_time}:00`;

        if (sms_type === "reminder") {
          const hoursBefore = Number(sms_reminder_hours_before) || 24;

          // ایجاد شیء تاریخ به صورت محلی
          const bookingDT = new Date(`${booking_date}T${booking_time}`);

          // کسر ساعت یادآوری
          bookingDT.setHours(bookingDT.getHours() - hoursBefore);

          // ✅ استخراج دستی اجزا برای جلوگیری از تبدیل خودکار به UTC توسط سیستم
          const year = bookingDT.getFullYear();
          const month = String(bookingDT.getMonth() + 1).padStart(2, "0");
          const day = String(bookingDT.getDate()).padStart(2, "0");
          const hours = String(bookingDT.getHours()).padStart(2, "0");
          const minutes = String(bookingDT.getMinutes()).padStart(2, "0");
          const seconds = String(bookingDT.getSeconds()).padStart(2, "0");

          // فرمت نهایی رشته برای دیتابیس MySQL: YYYY-MM-DD HH:mm:ss
          scheduledAt = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

          // چون پیامک برای آینده است، وضعیت در انتظار قرار می‌گیرد
          status = "pending";
        }
      } catch (e) {
        console.error("خطا در محاسبه زمان ارسال:", e);
      }
    }

    // ۴. کسر موجودی (فقط در صورت تایید در دیتابیس)
    const deducted = await deductSms(userId, 1);
    if (!deducted) {
      return NextResponse.json(
        { success: false, message: "خطا در کسر موجودی یا عدم کفایت اعتبار" },
        { status: 500 }
      );
    }

    // ۵. ثبت لاگ در جدول smslog
    await query(
      `INSERT INTO smslog (
        user_id, 
        booking_id, 
        to_phone, 
        content, 
        cost, 
        sms_type, 
        booking_at, 
        scheduled_at, 
        status, 
        created_at
      ) VALUES (?, ?, ?, ?, 1, ?, ?, ?, ?, NOW())`,
      [
        userId,
        booking_id,
        to_phone,
        content.trim(),
        sms_type,
        bookingAt,
        scheduledAt,
        status,
      ]
    );

    return NextResponse.json({
      success: true,
      message:
        status === "pending"
          ? "یادآوری با موفقیت برای زمان دقیق برنامه‌ریزی شد"
          : "پیامک با موفقیت ارسال شد",
    });
  } catch (error) {
    console.error("❌ خطا در سرور:", error);
    return NextResponse.json(
      { success: false, message: "خطای داخلی سرور" },
      { status: 500 }
    );
  }
});
