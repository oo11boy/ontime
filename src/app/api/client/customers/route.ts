import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

const handler = withAuth(async (req: NextRequest, context) => {
  const { userId: rawUserId } = context;
  const userId = Number(rawUserId);

  if (isNaN(userId) || userId <= 0) {
    return NextResponse.json(
      { success: false, message: "Authentication Error" },
      { status: 401 },
    );
  }

  // GET: دریافت لیست مشتریان
  if (req.method === "GET") {
    try {
      const url = new URL(req.url);
      const search = url.searchParams.get("search") || "";
      const rawPage = Number(url.searchParams.get("page") || 1);
      const rawLimit = Number(url.searchParams.get("limit") || 20);

      const page = Math.max(1, Math.floor(rawPage));
      const limit = Math.min(100, Math.max(1, Math.floor(rawLimit)));
      const offset = (page - 1) * limit;

      const cookieStore = await cookies();
      const userType = cookieStore.get("user_type")?.value;
      const staffId = cookieStore.get("staff_id")?.value;

      // حالت پرسنل
      if (userType === "staff" && staffId) {
        const staffInfo = await query<any>(
          "SELECT can_see_all_clients FROM staffs WHERE id = ? AND owner_user_id = ? AND is_active = 1",
          [parseInt(staffId), userId],
        );

        const canSeeAllClients = staffInfo?.[0]?.can_see_all_clients === 1;

        let sql = "";
        let mainParams: any[] = [];

        if (canSeeAllClients) {
          sql = `
            SELECT 
              c.id, c.client_name as name, c.client_phone as phone,
              DATE_FORMAT(c.last_booking_date, '%Y/%m/%d') as lastVisit,
              c.total_bookings, c.cancelled_count, c.is_blocked,
              (SELECT MAX(booking_date) FROM booking WHERE client_phone = c.client_phone AND user_id = c.user_id) as last_booking_date,
              (SELECT COUNT(*) FROM booking WHERE client_phone = c.client_phone AND staff_id = ?) as bookings_with_this_staff,
              CASE WHEN scr.id IS NOT NULL THEN 1 ELSE 0 END as is_my_client
            FROM clients c
            LEFT JOIN staff_client_relation scr ON scr.client_id = c.id AND scr.staff_id = ?
            WHERE c.user_id = ?
          `;
          mainParams = [parseInt(staffId), parseInt(staffId), userId];
        } else {
          const relationExists = await query<any>(
            "SELECT client_id FROM staff_client_relation WHERE staff_id = ?",
            [parseInt(staffId)],
          );

          const clientIds = relationExists.map((r: any) => r.client_id);

          if (clientIds.length === 0) {
            return NextResponse.json({
              success: true,
              clients: [],
              pagination: { page, limit, total: 0, totalPages: 0 },
            });
          }

          sql = `
            SELECT 
              c.id, c.client_name as name, c.client_phone as phone,
              DATE_FORMAT(c.last_booking_date, '%Y/%m/%d') as lastVisit,
              c.total_bookings, c.cancelled_count, c.is_blocked,
              (SELECT MAX(booking_date) FROM booking WHERE client_phone = c.client_phone AND user_id = c.user_id) as last_booking_date,
              (SELECT COUNT(*) FROM booking WHERE client_phone = c.client_phone AND staff_id = ?) as bookings_with_this_staff,
              1 as is_my_client
            FROM clients c
            WHERE c.user_id = ? AND c.id IN (${clientIds.join(",")})
          `;
          mainParams = [parseInt(staffId), userId];
        }

        if (search.trim()) {
          sql += ` AND (c.client_name LIKE ? OR c.client_phone LIKE ?)`;
          mainParams.push(`%${search}%`, `%${search}%`);
        }
        sql += ` ORDER BY c.last_booking_date DESC, c.id DESC LIMIT ${limit} OFFSET ${offset}`;

        const clients = await query(sql, mainParams);

        return NextResponse.json({
          success: true,
          clients,
          pagination: {
            page,
            limit,
            total: clients?.length || 0,
            totalPages: 1,
          },
        });
      }

      // حالت کاربر عادی
      const mainParams: any[] = [userId];
      let searchCondition = "";
      if (search.trim()) {
        searchCondition = ` AND (c.client_name LIKE ? OR c.client_phone LIKE ?)`;
        mainParams.push(`%${search}%`, `%${search}%`);
      }

      const sql = `
        SELECT c.id, c.client_name as name, c.client_phone as phone,
          DATE_FORMAT(c.last_booking_date, '%Y/%m/%d') as lastVisit,
          c.total_bookings, c.cancelled_count, c.is_blocked,
          (SELECT MAX(booking_date) FROM booking WHERE client_phone = c.client_phone AND user_id = c.user_id) as last_booking_date
        FROM clients c
        WHERE c.user_id = ? ${searchCondition}
        ORDER BY c.last_booking_date DESC, c.id DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      const clients = await query(sql, mainParams);

      const countResult: any = await query(
        `SELECT COUNT(*) as total FROM clients c WHERE c.user_id = ? ${searchCondition}`,
        mainParams,
      );
      const total = countResult?.[0]?.total || 0;

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
      console.error("GET error:", error);
      return NextResponse.json(
        { success: false, message: "خطا در دریافت لیست" },
        { status: 500 },
      );
    }
  }

  // POST: افزودن مشتری
  if (req.method === "POST") {
    try {
      const body = await req.json();
      const { action, name, phone: rawPhone, clientId } = body;

      // عملیات بلاک/رفع بلاک
      if (action === "block" || action === "unblock") {
        const isBlocked = action === "block" ? 1 : 0;
        await query(
          "UPDATE clients SET is_blocked = ?, updated_at = NOW() WHERE user_id = ? AND id = ?",
          [isBlocked, userId, clientId],
        );
        return NextResponse.json({
          success: true,
          message: isBlocked ? "مشتری بلاک شد" : "مشتری رفع بلاک شد",
        });
      }

      // افزودن مشتری جدید
      const phone = rawPhone?.replace(/\D/g, "").slice(-10);

      if (!name?.trim() || !phone || phone.length !== 10) {
        return NextResponse.json(
          { success: false, message: "نام و شماره تلفن معتبر الزامی است" },
          { status: 400 },
        );
      }

      const cookieStore = await cookies();
      const userType = cookieStore.get("user_type")?.value;
      const staffId = cookieStore.get("staff_id")?.value;

      // بررسی وجود مشتری
      const existing = await query<any>(
        "SELECT id, client_name FROM clients WHERE user_id = ? AND client_phone = ?",
        [userId, phone],
      );

      if (existing && existing.length > 0) {
        const clientId_result = existing[0].id;
        if (userType === "staff" && staffId) {
          await query(
            "INSERT IGNORE INTO staff_client_relation (staff_id, client_id) VALUES (?, ?)",
            [parseInt(staffId), clientId_result],
          );
        }
        return NextResponse.json({
          success: true,
          message: "مشتری قبلاً ثبت شده بود و به لیست شما اضافه شد",
          alreadyExists: true,
        });
      }

      // اضافه کردن مشتری جدید
      const insertResult: any = await query(
        "INSERT INTO clients (client_name, client_phone, user_id, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())",
        [name.trim(), phone, userId],
      );

      // دسترسی صحیح به insertId
      let clientId_result;
      if (Array.isArray(insertResult) && insertResult.length > 0) {
        clientId_result = insertResult[0].insertId;
      } else if (insertResult && typeof insertResult === "object") {
        clientId_result = insertResult.insertId;
      } else {
        clientId_result = insertResult;
      }

      if (!clientId_result) {
        throw new Error("Failed to get insertId");
      }

      if (userType === "staff" && staffId) {
        await query(
          "INSERT INTO staff_client_relation (staff_id, client_id) VALUES (?, ?)",
          [parseInt(staffId), clientId_result],
        );
      }

      return NextResponse.json({
        success: true,
        message: "مشتری با موفقیت ثبت شد",
        clientId: clientId_result,
      });
    } catch (error) {
      console.error("POST error:", error);
      return NextResponse.json(
        { success: false, message: "خطا در ثبت مشتری" },
        { status: 500 },
      );
    }
  }

  // PATCH: به‌روزرسانی
  if (req.method === "PATCH") {
    try {
      const body = await req.json();
      const { phone: rawPhone, newName, is_blocked } = body;
      const phone = rawPhone?.replace(/\D/g, "").slice(-10);

      if (!phone) {
        return NextResponse.json(
          { success: false, message: "شماره تلفن الزامی است" },
          { status: 400 },
        );
      }

      if (is_blocked !== undefined) {
        if (is_blocked !== 0 && is_blocked !== 1) {
          return NextResponse.json(
            { success: false, message: "مقدار is_blocked نامعتبر است" },
            { status: 400 },
          );
        }
        await query(
          "UPDATE clients SET is_blocked = ?, updated_at = NOW() WHERE user_id = ? AND client_phone = ?",
          [is_blocked, userId, phone],
        );
        return NextResponse.json({
          success: true,
          message: is_blocked === 1 ? "مشتری بلاک شد" : "مشتری رفع بلاک شد",
        });
      }

      if (newName !== undefined) {
        if (!newName?.trim()) {
          return NextResponse.json(
            { success: false, message: "نام جدید نمی‌تواند خالی باشد" },
            { status: 400 },
          );
        }
        await query(
          "UPDATE clients SET client_name = ?, updated_at = NOW() WHERE user_id = ? AND client_phone = ?",
          [newName.trim(), userId, phone],
        );
        return NextResponse.json({
          success: true,
          message: "نام مشتری با موفقیت به‌روزرسانی شد",
        });
      }

      return NextResponse.json(
        { success: false, message: "هیچ عملیاتی مشخص نشده" },
        { status: 400 },
      );
    } catch (error) {
      console.error("PATCH error:", error);
      return NextResponse.json(
        { success: false, message: "خطا در به‌روزرسانی" },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ message: "متد مجاز نیست" }, { status: 405 });
});

export { handler as GET, handler as POST, handler as PATCH };
