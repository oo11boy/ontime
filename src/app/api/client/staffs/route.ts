import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";

/**
 * GET: دریافت لیست پرسنل یا یک پرسنل خاص
 */
export const GET = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;

  try {
    const url = new URL(req.url);
    const staffId = url.searchParams.get("id");

    // دریافت یک پرسنل
    if (staffId) {
      const staffs = await query<any>(
        `SELECT s.*, u.business_name as owner_business 
         FROM staffs s
         JOIN users u ON s.owner_user_id = u.id
         WHERE s.id = ? AND s.owner_user_id = ? AND s.is_active = 1`,
        [staffId, userId],
      );

      if (!staffs || staffs.length === 0) {
        return NextResponse.json(
          { success: false, message: "پرسنل یافت نشد" },
          { status: 404 },
        );
      }

      // دریافت نام سرویس‌ها
      let servicesList: { id: number; name: string }[] = [];
      if (staffs[0].service_ids) {
        const ids = staffs[0].service_ids.split(",");
        const placeholders = ids.map(() => "?").join(",");
        const services = await query<any>(
          `SELECT id, name FROM user_services WHERE user_id = ? AND id IN (${placeholders})`,
          [userId, ...ids],
        );
        servicesList = services;
      }

      return NextResponse.json({
        success: true,
        staff: { ...staffs[0], services: servicesList },
      });
    }

    // دریافت لیست همه پرسنل
const staffs = await query<any>(
  `SELECT s.*,
   (SELECT COUNT(*) FROM booking WHERE staff_id = s.id AND status = 'active') as active_bookings
   FROM staffs s
   WHERE s.owner_user_id = ? AND s.is_active = 1
   ORDER BY s.created_at DESC`,
  [userId]
);

    // دریافت نام سرویس‌ها برای هر پرسنل
    const staffsWithServices = await Promise.all(
      staffs.map(async (staff) => {
        let servicesList: { id: number; name: string }[] = [];
        if (staff.service_ids) {
          const ids = staff.service_ids.split(",");
          const placeholders = ids.map(() => "?").join(",");
          const services = await query<any>(
            `SELECT id, name FROM user_services WHERE user_id = ? AND id IN (${placeholders})`,
            [userId, ...ids],
          );
          servicesList = services;
        }
        return { ...staff, services: servicesList };
      }),
    );

    return NextResponse.json({ success: true, staffs: staffsWithServices });
  } catch (error) {
    console.error("GET /api/client/staffs error:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت لیست پرسنل" },
      { status: 500 },
    );
  }
});

/**
 * POST: ایجاد پرسنل جدید
 */
export const POST = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;

  try {
    const body = await req.json();
    const {
      name,
      phone,
      sms_balance = 0,
      service_ids = null,
      calendar_type = "synced",
      can_see_all_clients = false,
    } = body;

    // اعتبارسنجی
    if (!name || !phone) {
      return NextResponse.json(
        { message: "نام و شماره تماس پرسنل الزامی است" },
        { status: 400 },
      );
    }

    // بررسی شماره تکراری
    const existing = await query<any>(
      "SELECT id FROM staffs WHERE owner_user_id = ? AND phone = ? AND is_active = 1",
      [userId, phone],
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { message: "این شماره قبلاً به عنوان پرسنل ثبت شده است" },
        { status: 409 },
      );
    }

    // بررسی مالکیت service_ids
    if (service_ids) {
      const ids = service_ids.split(",").filter((id: string) => id.trim());
      if (ids.length > 0) {
        const placeholders = ids.map(() => "?").join(",");
        const validServices = await query<any>(
          `SELECT COUNT(*) as count FROM user_services 
           WHERE user_id = ? AND id IN (${placeholders})`,
          [userId, ...ids],
        );
        if (validServices[0].count !== ids.length) {
          return NextResponse.json(
            { message: "یکی از خدمات انتخاب شده متعلق به شما نیست" },
            { status: 400 },
          );
        }
      }
    }

    // دریافت اعتبار فعلی کاربر
    const user = await query<any>(
      "SELECT sms_balance FROM users WHERE id = ?",
      [userId],
    );
    const currentBalance = user[0]?.sms_balance || 0;

    if (currentBalance < sms_balance) {
      return NextResponse.json(
        { message: `اعتبار کافی نیست. موجودی: ${currentBalance} پیامک` },
        { status: 400 },
      );
    }

    // شروع تراکنش
    const pool = (await import("@/lib/db")).dbPool;
    const connection = await pool.getConnection();

    try {
      await connection.query("START TRANSACTION");

      // ایجاد پرسنل
      const [result]: any = await connection.query(
        `INSERT INTO staffs 
         (owner_user_id, name, phone, sms_balance, service_ids, calendar_type, 
          can_see_all_clients, is_active, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW())`,
        [
          userId,
          name.trim(),
          phone,
          sms_balance,
          service_ids || null,
          calendar_type,
          can_see_all_clients ? 1 : 0,
        ],
      );

      const staffId = result.insertId;

      // انتقال اعتبار
      if (sms_balance > 0) {
        await connection.query(
          "UPDATE users SET sms_balance = sms_balance - ? WHERE id = ?",
          [sms_balance, userId],
        );

        await connection.query(
          `INSERT INTO credit_transfer_log 
           (from_user_id, to_user_id, amount, reason, related_staff_id, from_balance_before, from_balance_after, created_at)
           VALUES (?, ?, ?, 'initial_assign', ?, ?, ?, NOW())`,
          [
            userId,
            staffId,
            sms_balance,
            staffId,
            currentBalance,
            currentBalance - sms_balance,
          ],
        );
      }

      await connection.query("COMMIT");
      connection.release();

      return NextResponse.json(
        {
          success: true,
          message: "پرسنل با موفقیت اضافه شد",
          staffId,
          sms_transferred: sms_balance,
        },
        { status: 201 },
      );
    } catch (err) {
      await connection.query("ROLLBACK");
      connection.release();
      throw err;
    }
  } catch (error) {
    console.error("POST /api/client/staffs error:", error);
    return NextResponse.json(
      { message: "خطا در ایجاد پرسنل" },
      { status: 500 },
    );
  }
});

/**
 * PUT: ویرایش پرسنل
 */
export const PUT = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;

  try {
    const body = await req.json();
    const {
      id,
      name,
      phone,
      sms_balance,
      service_ids,
      calendar_type,
      is_active,
      can_see_all_clients,
    } = body;

    if (!id) {
      return NextResponse.json(
        { message: "شناسه پرسنل الزامی است" },
        { status: 400 },
      );
    }

    // بررسی وجود پرسنل
    const staff = await query<any>(
      "SELECT * FROM staffs WHERE id = ? AND owner_user_id = ?",
      [id, userId],
    );

    if (staff.length === 0) {
      return NextResponse.json({ message: "پرسنل یافت نشد" }, { status: 404 });
    }

    const oldStaff = staff[0];
    const oldBalance = oldStaff.sms_balance;

    // بررسی مالکیت service_ids
    if (service_ids !== undefined && service_ids !== null) {
      const ids = service_ids.split(",").filter((s: string) => s.trim());
      if (ids.length > 0) {
        const placeholders = ids.map(() => "?").join(",");
        const validServices = await query<any>(
          `SELECT COUNT(*) as count FROM user_services WHERE user_id = ? AND id IN (${placeholders})`,
          [userId, ...ids],
        );
        if (validServices[0].count !== ids.length) {
          return NextResponse.json(
            { message: "یکی از خدمات انتخاب شده متعلق به شما نیست" },
            { status: 400 },
          );
        }
      }
    }

    // ساخت کوئری داینامیک
    const updates: string[] = [];
    const values: any = [];

    if (name !== undefined) {
      updates.push("name = ?");
      values.push(name.trim());
    }
    if (phone !== undefined) {
      updates.push("phone = ?");
      values.push(phone);
    }
    if (service_ids !== undefined) {
      updates.push("service_ids = ?");
      values.push(service_ids || null);
    }
    if (calendar_type !== undefined) {
      updates.push("calendar_type = ?");
      values.push(calendar_type);
    }
    if (is_active !== undefined) {
      updates.push("is_active = ?");
      values.push(is_active ? 1 : 0);
    }
    if (can_see_all_clients !== undefined) {
      updates.push("can_see_all_clients = ?");
      values.push(can_see_all_clients ? 1 : 0);
    }

    // تغییر اعتبار
    const needBalanceUpdate =
      sms_balance !== undefined && sms_balance !== oldBalance;

    const pool = (await import("@/lib/db")).dbPool;
    let connection;
    let useTransaction = needBalanceUpdate || updates.length > 0;

    try {
      if (useTransaction && (needBalanceUpdate || updates.length > 0)) {
        connection = await pool.getConnection();
        await connection.query("START TRANSACTION");
      }

      // به‌روزرسانی فیلدهای ساده
      if (updates.length > 0) {
        updates.push("updated_at = NOW()");
        values.push(id, userId);
        await (connection || pool).query(
          `UPDATE staffs SET ${updates.join(", ")} WHERE id = ? AND owner_user_id = ?`,
          values,
        );
      }

      // تغییر اعتبار
      if (needBalanceUpdate) {
        const newBalance = parseInt(String(sms_balance)) || 0;
        const balanceDiff = newBalance - oldBalance;

        if (balanceDiff > 0) {
          // افزایش اعتبار پرسنل
          const user = await query<any>(
            "SELECT sms_balance FROM users WHERE id = ?",
            [userId],
          );
          const userBalance = user[0]?.sms_balance || 0;

          if (userBalance < balanceDiff) {
            if (connection) await connection.query("ROLLBACK");
            if (connection) connection.release();
            return NextResponse.json(
              {
                message: `اعتبار کافی نیست. نیاز به ${balanceDiff} پیامک بیشتر`,
              },
              { status: 400 },
            );
          }

          await (connection || pool).query(
            "UPDATE users SET sms_balance = sms_balance - ? WHERE id = ?",
            [balanceDiff, userId],
          );
          await (connection || pool).query(
            "UPDATE staffs SET sms_balance = ? WHERE id = ?",
            [newBalance, id],
          );

          await (connection || pool).query(
            `INSERT INTO credit_transfer_log 
             (from_user_id, to_user_id, amount, reason, related_staff_id, 
              from_balance_before, from_balance_after, to_balance_before, to_balance_after, created_at)
             VALUES (?, ?, ?, 'manual_increase', ?, ?, ?, ?, ?, NOW())`,
            [
              userId,
              id,
              balanceDiff,
              id,
              userBalance,
              userBalance - balanceDiff,
              oldBalance,
              newBalance,
            ],
          );
        } else if (balanceDiff < 0) {
          // کاهش اعتبار پرسنل
          const refundAmount = Math.abs(balanceDiff);
          const user = await query<any>(
            "SELECT sms_balance FROM users WHERE id = ?",
            [userId],
          );
          const userBalance = user[0]?.sms_balance || 0;

          await (connection || pool).query(
            "UPDATE users SET sms_balance = sms_balance + ? WHERE id = ?",
            [refundAmount, userId],
          );
          await (connection || pool).query(
            "UPDATE staffs SET sms_balance = ? WHERE id = ?",
            [newBalance, id],
          );

          await (connection || pool).query(
            `INSERT INTO credit_transfer_log 
             (from_user_id, to_user_id, amount, reason, related_staff_id, 
              from_balance_before, from_balance_after, to_balance_before, to_balance_after, created_at)
             VALUES (?, ?, ?, 'manual_decrease', ?, ?, ?, ?, ?, NOW())`,
            [
              id,
              userId,
              refundAmount,
              id,
              oldBalance,
              newBalance,
              userBalance,
              userBalance + refundAmount,
            ],
          );
        }
      }

      if (useTransaction && connection) {
        await connection.query("COMMIT");
        connection.release();
      }

      return NextResponse.json({
        success: true,
        message: "پرسنل با موفقیت ویرایش شد",
      });
    } catch (err) {
      if (useTransaction && connection) {
        await connection.query("ROLLBACK");
        connection.release();
      }
      throw err;
    }
  } catch (error) {
    console.error("PUT /api/client/staffs error:", error);
    return NextResponse.json(
      { message: "خطا در ویرایش پرسنل" },
      { status: 500 },
    );
  }
});

/**
 * DELETE: حذف پرسنل
 */
export const DELETE = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;

  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { message: "شناسه پرسنل الزامی است" },
        { status: 400 },
      );
    }

    const staff = await query<any>(
      "SELECT * FROM staffs WHERE id = ? AND owner_user_id = ?",
      [id, userId],
    );

    if (staff.length === 0) {
      return NextResponse.json({ message: "پرسنل یافت نشد" }, { status: 404 });
    }

    const staffData = staff[0];
    const staffBalance = staffData.sms_balance;

    // بررسی نوبت‌های فعال
    const activeBookings = await query<any>(
      "SELECT COUNT(*) as count FROM booking WHERE staff_id = ? AND status = 'active'",
      [id],
    );

    if (activeBookings[0].count > 0) {
      return NextResponse.json(
        {
          message: `این پرسنل ${activeBookings[0].count} نوبت فعال دارد. ابتدا نوبت‌ها را لغو یا انجام دهید.`,
        },
        { status: 400 },
      );
    }

    const pool = (await import("@/lib/db")).dbPool;
    const connection = await pool.getConnection();

    try {
      await connection.query("START TRANSACTION");

      if (staffBalance > 0) {
        const user = await query<any>(
          "SELECT sms_balance FROM users WHERE id = ?",
          [userId],
        );
        const userBalance = user[0]?.sms_balance || 0;

        await connection.query(
          "UPDATE users SET sms_balance = sms_balance + ? WHERE id = ?",
          [staffBalance, userId],
        );

        await connection.query(
          `INSERT INTO credit_transfer_log 
           (from_user_id, to_user_id, amount, reason, related_staff_id, 
            from_balance_before, from_balance_after, to_balance_before, to_balance_after, created_at)
           VALUES (?, ?, ?, 'deletion_refund', ?, ?, ?, ?, ?, NOW())`,
          [
            id,
            userId,
            staffBalance,
            id,
            staffBalance,
            0,
            userBalance,
            userBalance + staffBalance,
          ],
        );
      }

      await connection.query(
        "DELETE FROM staffs WHERE id = ? AND owner_user_id = ?",
        [id, userId],
      );

      await connection.query("COMMIT");
      connection.release();

      return NextResponse.json({
        success: true,
        message: "پرسنل با موفقیت حذف شد",
        refunded_sms: staffBalance,
      });
    } catch (err) {
      await connection.query("ROLLBACK");
      connection.release();
      throw err;
    }
  } catch (error) {
    console.error("DELETE /api/client/staffs error:", error);
    return NextResponse.json({ message: "خطا در حذف پرسنل" }, { status: 500 });
  }
});

/**
 * API: دریافت مشتریان بر اساس دسترسی پرسنل
 */
export const getStaffClients = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;
  const url = new URL(req.url);
  const staffId = url.searchParams.get("staffId");

  if (!staffId) {
    return NextResponse.json(
      { message: "شناسه پرسنل الزامی است" },
      { status: 400 },
    );
  }

  try {
    const staff = await query<any>(
      "SELECT * FROM staffs WHERE id = ? AND owner_user_id = ?",
      [staffId, userId],
    );

    if (staff.length === 0) {
      return NextResponse.json({ message: "پرسنل یافت نشد" }, { status: 404 });
    }

    const staffData = staff[0];
    let clients;

    if (staffData.can_see_all_clients) {
      clients = await query<any>(
        `SELECT c.*, 
         (SELECT COUNT(*) FROM booking WHERE client_phone = c.client_phone AND staff_id = ?) as bookings_with_this_staff
         FROM clients c
         WHERE c.user_id = ?
         ORDER BY c.last_booking_date DESC`,
        [staffId, userId],
      );
    } else {
      clients = await query<any>(
        `SELECT DISTINCT c.*, 
         (SELECT COUNT(*) FROM booking WHERE client_phone = c.client_phone AND staff_id = ?) as bookings_with_this_staff
         FROM clients c
         JOIN booking b ON b.client_phone = c.client_phone
         WHERE b.staff_id = ? AND c.user_id = ?
         ORDER BY c.last_booking_date DESC`,
        [staffId, staffId, userId],
      );
    }

    return NextResponse.json({ success: true, clients, staff: staffData });
  } catch (error) {
    console.error("GET /api/client/staffs/clients error:", error);
    return NextResponse.json(
      { message: "خطا در دریافت مشتریان" },
      { status: 500 },
    );
  }
});
