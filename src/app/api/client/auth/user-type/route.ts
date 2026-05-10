import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;
    const userTypeCookie = cookieStore.get("user_type")?.value;
    const staffIdCookie = cookieStore.get("staff_id")?.value;

    if (!token) {
      return NextResponse.json({ userType: "none" });
    }

    const userId = verifyToken(token);
    
    if (!userId) {
      return NextResponse.json({ userType: "none" });
    }

    // اگر user_type کوکی staff است و staff_id دارد
    if (userTypeCookie === "staff" && staffIdCookie) {
      const staff = await query<any[]>(
        `SELECT s.id, s.name, s.owner_user_id, s.can_see_all_clients, s.calendar_type, s.sms_balance, s.sms_used,
         u.business_name as owner_business
         FROM staffs s
         JOIN users u ON s.owner_user_id = u.id
         WHERE s.id = ? AND s.is_active = 1`,
        [parseInt(staffIdCookie)]
      );
      
      if (staff.length > 0) {
        return NextResponse.json({
          userType: "staff",
          staff: staff[0],
        });
      }
    }
    
    // کاربر عادی
    const user = await query<any>(
      "SELECT id, name, plan_key FROM users WHERE id = ?",
      [userId]
    );
    
    if (user.length > 0) {
      return NextResponse.json({
        userType: "user",
        userId: user[0].id,
      });
    }
    
    return NextResponse.json({ userType: "none" });
    
  } catch (error) {
    console.error("Error checking user type:", error);
    return NextResponse.json({ userType: "none" });
  }
}