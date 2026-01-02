import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import type { NextRequest } from "next/server";

const handler = withAuth(async (req: NextRequest, context) => {
  const { userId: rawUserId } = context;
  const userId = Number(rawUserId);

  if (isNaN(userId) || userId <= 0) {
    console.error("❌ Authentication Error: Invalid User ID received:", rawUserId);
    return NextResponse.json({ success: false, message: "Authentication Error: Invalid User ID" }, { status: 401 });
  }

  // GET: دریافت لیست مشتریان با جستجو و صفحه‌بندی
  if (req.method === "GET") {
    try {
      const url = new URL(req.url);
      const search = url.searchParams.get("search") || "";
      const rawPage = Number(url.searchParams.get("page") || 1);
      const rawLimit = Number(url.searchParams.get("limit") || 20);

      const page = Math.max(1, Math.floor(rawPage));
      const limit = Math.max(1, Math.floor(rawLimit));
      const offset = (page - 1) * limit;

      const mainParams: any[] = [userId];
      let searchCondition = "";

      if (search.trim()) {
        searchCondition = ` AND (
          c.client_name LIKE ? OR 
          c.client_phone LIKE ?
        )`;
        mainParams.push(`%${search}%`, `%${search}%`);
      }

      // کوئری بهینه برای لیست مشتریان و آخرین نوبت آن‌ها
      const sql = `
        SELECT 
          c.id, 
          c.client_name as name, 
          c.client_phone as phone,
          DATE_FORMAT(c.last_booking_date, '%Y/%m/%d') as lastVisit,
          c.total_bookings, 
          c.cancelled_count, 
          c.is_blocked,
          (SELECT MAX(booking_date) FROM booking WHERE client_phone = c.client_phone AND user_id = c.user_id) as last_booking_date
        FROM clients c
        WHERE c.user_id = ? ${searchCondition}
        ORDER BY c.last_booking_date DESC, c.id DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      const clients = await query(sql, mainParams);

      const countSql = `
        SELECT COUNT(*) as total 
        FROM clients c 
        WHERE c.user_id = ? ${searchCondition}
      `;

      const [countResult]: any = await query(countSql, mainParams);
      const total = countResult.total || 0;

      return NextResponse.json({
        success: true,
        clients,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("❌ خطا در دریافت لیست مشتریان:", error);
      return NextResponse.json({ success: false, message: "خطا در دریافت لیست مشتریان" }, { status: 500 });
    }
  }

  // POST: افزودن مشتری جدید یا بلاک/رفع بلاک
  if (req.method === "POST") {
    try {
      const body = await req.json();
      const { action, name, phone: rawPhone, clientId } = body;

      // عملیات بلاک/رفع بلاک
      if (action === "block" || action === "unblock") {
        const isBlocked = action === "block" ? 1 : 0;
        const targetPhone = rawPhone?.replace(/\D/g, "").slice(-10);

        await query(
          "UPDATE clients SET is_blocked = ?, updated_at = NOW() WHERE user_id = ? AND id = ?",
          [isBlocked, userId, clientId]
        );

        // اگر بلاک شد، نوبت‌های فعال او کنسل شود
        if (isBlocked === 1 && targetPhone) {
          await query(
            "UPDATE booking SET status = 'cancelled', updated_at = NOW() WHERE user_id = ? AND client_phone = ? AND status = 'active'",
            [userId, targetPhone]
          );
        }

        return NextResponse.json({ 
          success: true, 
          message: isBlocked ? "مشتری بلاک شد" : "مشتری رفع بلاک شد" 
        });
      }

      // عملیات افزودن مشتری جدید
      const phone = rawPhone?.replace(/\D/g, "").slice(-10);

      if (!name?.trim() || !phone || phone.length !== 10) {
        return NextResponse.json({ success: false, message: "نام و شماره تلفن ۱۰ رقمی معتبر الزامی است" }, { status: 400 });
      }

      // بررسی تکراری بودن شماره (۱۰ رقمی)
      const [existing]: any = await query(
        "SELECT id, client_name FROM clients WHERE user_id = ? AND client_phone = ?",
        [userId, phone]
      );

      if (existing) {
        return NextResponse.json({
          success: false,
          message: "این شماره تلفن قبلاً ثبت شده است",
          existingName: existing.client_name,
          status: 409,
        }, { status: 409 });
      }

      await query(
        `INSERT INTO clients (client_name, client_phone, user_id, created_at, updated_at) 
         VALUES (?, ?, ?, NOW(), NOW())`,
        [name.trim(), phone, userId]
      );

      return NextResponse.json({ success: true, message: "مشتری با موفقیت ثبت شد" });
    } catch (error) {
      console.error("❌ خطا در عملیات POST مشتری:", error);
      return NextResponse.json({ success: false, message: "خطا در پردازش درخواست" }, { status: 500 });
    }
  }

  // PATCH: به‌روزرسانی نام مشتری یا وضعیت بلاک
  if (req.method === "PATCH") {
    try {
      const body = await req.json();
      const { phone: rawPhone, newName, is_blocked } = body;

      const phone = rawPhone?.replace(/\D/g, "").slice(-10);

      if (!phone) {
        return NextResponse.json({ success: false, message: "شماره تلفن الزامی است" }, { status: 400 });
      }

      // اگر is_blocked ارسال شده (0 یا 1)
      if (is_blocked !== undefined) {
        if (is_blocked !== 0 && is_blocked !== 1) {
          return NextResponse.json({ success: false, message: "مقدار is_blocked نامعتبر است" }, { status: 400 });
        }

        const result: any = await query(
          "UPDATE clients SET is_blocked = ?, updated_at = NOW() WHERE user_id = ? AND client_phone = ?",
          [is_blocked, userId, phone]
        );

        if (result.affectedRows === 0) {
          return NextResponse.json({ success: false, message: "مشتری یافت نشد" }, { status: 404 });
        }

        return NextResponse.json({
          success: true,
          message: is_blocked === 1 ? "مشتری بلاک شد" : "مشتری رفع بلاک شد",
        });
      }

      // اگر newName ارسال شده → تغییر نام
      if (newName !== undefined) {
        if (!newName?.trim()) {
          return NextResponse.json({ success: false, message: "نام جدید نمی‌تواند خالی باشد" }, { status: 400 });
        }

        const result: any = await query(
          "UPDATE clients SET client_name = ?, updated_at = NOW() WHERE user_id = ? AND client_phone = ?",
          [newName.trim(), userId, phone]
        );

        if (result.affectedRows === 0) {
          return NextResponse.json({ success: false, message: "مشتری یافت نشد" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "نام مشتری با موفقیت به‌روزرسانی شد" });
      }

      // اگر هیچ‌کدوم نبود
      return NextResponse.json({ success: false, message: "هیچ عملیاتی مشخص نشده" }, { status: 400 });
    } catch (error) {
      console.error("خطا در PATCH مشتری:", error);
      return NextResponse.json({ success: false, message: "خطا در به‌روزرسانی" }, { status: 500 });
    }
  }

  return NextResponse.json({ message: "متد مجاز نیست" }, { status: 405 });
});

export { handler as GET, handler as POST, handler as PATCH };