import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import type { NextRequest } from "next/server";

const handler = withAuth(async (req: NextRequest, context) => {
  const { userId: rawUserId } = context; 
  const userId = Number(rawUserId); // 1. اطمینان از عدد صحیح بودن userId

  if (isNaN(userId) || userId <= 0) {
      console.error("❌ Authentication Error: Invalid User ID received:", rawUserId);
      return NextResponse.json({ success: false, message: "Authentication Error: Invalid User ID" }, { status: 401 });
  }

  // GET: دریافت لیست مشتریان
  if (req.method === "GET") {
    try {
      const url = new URL(req.url);
      const search = url.searchParams.get("search") || "";
      
      // 2. اعتبارسنجی و تبدیل پارامترهای pagination
      const rawPage = Number(url.searchParams.get("page") || 1);
      const rawLimit = Number(url.searchParams.get("limit") || 20);
      
      // مقادیر limit و offset کاملاً اعتبارسنجی شده و عدد صحیح هستند
      const page = Math.max(1, Math.floor(rawPage));
      const limit = Math.max(1, Math.floor(rawLimit));
      const offset = (page - 1) * limit;

      // پارامترهای اصلی کوئری (فقط شامل userId و جستجو)
      const mainParams: any[] = [userId];
      let searchCondition = "";

      if (search.trim()) {
        searchCondition = ` AND (
          c.client_name LIKE ? OR 
          c.client_phone LIKE ?
        )`;
        mainParams.push(`%${search}%`, `%${search}%`);
      }

      // کوئری اصلی برای دریافت مشتریان
      // 💥 اصلاح نهایی: LIMIT و OFFSET به صورت رشته به کوئری اضافه شدند، نه پارامتر Bound
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

      // آرگومان‌های ارسالی فقط شامل mainParams هستند
      const clients = await query(sql, mainParams);

      // کوئری شمارش (این کوئری نیاز به اصلاح LIMIT/OFFSET ندارد)
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
      console.error("❌ خطا در دریافت لیست مشتریان (بعد از اصلاح LIMIT):", error);
      return NextResponse.json(
        {
          success: false,
          message: "خطا در دریافت لیست مشتریان",
        },
        { status: 500 }
      );
    }
  }

  // POST: بلاک یا رفع بلاک کردن مشتری
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

export { handler as GET, handler as POST };