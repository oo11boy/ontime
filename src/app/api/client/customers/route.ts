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

  // GET: دریافت لیست مشتریان
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

      const sql = `
        SELECT 
          c.id, c.client_name as name, c.client_phone as phone,
          DATE_FORMAT(c.last_booking_date, '%Y/%m/%d') as lastVisit,
          c.total_bookings, c.cancelled_count, c.is_blocked,
          MAX(b.booking_date) as last_booking_date, MAX(b.booking_time) as last_booking_time
        FROM clients c
        LEFT JOIN booking b ON c.client_phone = b.client_phone AND c.user_id = b.user_id
        WHERE c.user_id = ? ${searchCondition}
        GROUP BY c.id
        ORDER BY c.last_booking_date DESC, c.total_bookings DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      const clients = await query(sql, mainParams);

      const countSql = `
        SELECT COUNT(DISTINCT c.id) as total 
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
      return NextResponse.json(
        { success: false, message: "خطا در دریافت لیست مشتریان" },
        { status: 500 }
      );
    }
  }

  // POST: افزودن مشتری جدید
  if (req.method === "POST") {
    try {
      const { name, phone } = await req.json();

      if (!name?.trim() || !phone?.trim()) {
        return NextResponse.json(
          { success: false, message: "نام و شماره تلفن الزامی است" },
          { status: 400 }
        );
      }

      if (phone.length !== 11 || !/^\d{11}$/.test(phone)) {
        return NextResponse.json(
          { success: false, message: "شماره تلفن باید 11 رقم باشد" },
          { status: 400 }
        );
      }

      // چک کردن تکراری بودن
      const [existing]: any = await query(
        "SELECT id, client_name FROM clients WHERE user_id = ? AND client_phone = ?",
        [userId, phone]
      );

      if (existing) {
        return NextResponse.json(
          {
            success: false,
            message: "این شماره تلفن قبلاً ثبت شده است",
            existingName: existing.client_name,
            status: 409,
          },
          { status: 409 }
        );
      }

      // ثبت مشتری جدید
      await query(
        `INSERT INTO clients 
          (client_name, client_phone, user_id, created_at, updated_at) 
        VALUES (?, ?, ?, NOW(), NOW())`,
        [name.trim(), phone, userId]
      );

      return NextResponse.json({
        success: true,
        message: "مشتری با موفقیت اضافه شد",
      });
    } catch (error) {
      console.error("❌ خطا در ثبت مشتری جدید:", error);
      return NextResponse.json(
        { success: false, message: "خطا در ثبت مشتری" },
        { status: 500 }
      );
    }
  }

  // PATCH: به‌روزرسانی نام مشتری (فقط برای شماره تکراری)
  if (req.method === "PATCH") {
    try {
      const { phone, newName } = await req.json();

      if (!phone || !newName?.trim()) {
        return NextResponse.json(
          { success: false, message: "شماره تلفن و نام جدید الزامی است" },
          { status: 400 }
        );
      }

      // چک کردن وجود مشتری
      const [client]: any = await query(
        "SELECT id FROM clients WHERE user_id = ? AND client_phone = ?",
        [userId, phone]
      );

      if (!client) {
        return NextResponse.json(
          { success: false, message: "مشتری یافت نشد" },
          { status: 404 }
        );
      }

      // به‌روزرسانی نام
      await query(
        "UPDATE clients SET client_name = ?, updated_at = NOW() WHERE user_id = ? AND client_phone = ?",
        [newName.trim(), userId, phone]
      );

      return NextResponse.json({
        success: true,
        message: "نام مشتری با موفقیت به‌روزرسانی شد",
      });
    } catch (error) {
      console.error("❌ خطا در به‌روزرسانی نام مشتری:", error);
      return NextResponse.json(
        { success: false, message: "خطا در به‌روزرسانی" },
        { status: 500 }
      );
    }
  }

  // POST: بلاک یا رفع بلاک (کد قبلی شما)
  if (req.method === "POST") {
    try {
      const { action, clientId, phone } = await req.json();

      const cleanClientId = Number(clientId);

      if (action === "block") {
        await query(
          "UPDATE clients SET is_blocked = 1, updated_at = NOW() WHERE user_id = ? AND id = ?",
          [userId, cleanClientId]
        );
        await query(
          "UPDATE booking SET status = 'cancelled', updated_at = NOW() WHERE user_id = ? AND client_phone = ? AND status = 'active'",
          [userId, phone]
        );

        return NextResponse.json({
          success: true,
          message: "مشتری با موفقیت بلاک شد",
        });
      }

      if (action === "unblock") {
        await query(
          "UPDATE clients SET is_blocked = 0, updated_at = NOW() WHERE user_id = ? AND id = ?",
          [userId, cleanClientId]
        );

        return NextResponse.json({
          success: true,
          message: "مشتری با موفقیت رفع بلاک شد",
        });
      }

      return NextResponse.json(
        {
          success: false,
          message: "Action نامعتبر",
        },
        { status: 400 }
      );
    } catch (error) {
      console.error("❌ خطا در عملیات بلاک/رفع بلاک:", error);
      return NextResponse.json(
        {
          success: false,
          message: "خطا در عملیات",
        },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    { message: "متد مجاز نیست" },
    { status: 405 }
  );
});

export { handler as GET, handler as POST, handler as PATCH };