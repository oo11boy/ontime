import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { dbPool } from "@/lib/db";
import jwt from 'jsonwebtoken';
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const JWT_SECRET = process.env.JWT_SECRET!;

function verifyToken(token: string): number | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    return decoded.userId;
  } catch (error) {
    console.error("JWT Verification Failed:", error);
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userType = request.cookies.get("user_type")?.value;

  // ========== سرویس فایل‌های آپلودی ==========
  if (pathname.startsWith("/uploads/")) {
    const filePath = join(process.cwd(), "public", pathname);
    
    if (existsSync(filePath)) {
      try {
        const fileBuffer = await readFile(filePath);
        const ext = pathname.split('.').pop()?.toLowerCase();
        
        const contentTypes: Record<string, string> = {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'webp': 'image/webp',
          'gif': 'image/gif',
          'svg': 'image/svg+xml',
        };
        
        const contentType = contentTypes[ext || ''] || 'application/octet-stream';
        
        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Access-Control-Allow-Origin': '*',
          },
        });
      } catch (error) {
        console.error("Error serving file:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
      }
    }
    
    return new NextResponse("File not found", { status: 404 });
  }

  // دریافت کوکی‌های احراز هویت
  const clientToken = request.cookies.get("authToken")?.value;
  const isRegistered = request.cookies.get("is_registered")?.value;
  const adminToken = request.cookies.get("adminAuthToken")?.value;

  // --- وضعیت الف: مدیریت صفحات لاگین ---
  if (pathname === "/login" && clientToken) {
    if (isRegistered === "true") {
      return NextResponse.redirect(new URL("/clientdashboard", request.url));
    }
  }

  if (pathname === "/admin-login" && adminToken) {
    return NextResponse.redirect(new URL("/admindashboard", request.url));
  }

  // --- وضعیت ب: حفاظت از مسیرهای پنل کلاینت ---
  if (pathname.startsWith("/clientdashboard")) {
    if (!clientToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const userId = verifyToken(clientToken);
    if (!userId) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("authToken");
      response.cookies.delete("is_registered");
      return response;
    }

    if (isRegistered === "false") {
      return NextResponse.redirect(new URL("/login?step=signup", request.url));
    }

    // ========== بررسی اشتراک فعال برای مسیرهای خاص ==========
    const subscriptionRequiredPaths = [
      "/clientdashboard/bookingsubmit",
      "/clientdashboard/Staffs",
    ];
    
    const requiresSubscription = subscriptionRequiredPaths.some(path => 
      pathname === path || pathname.startsWith(path + "/")
    );
    
    if (requiresSubscription) {
      let connection = null;
      
      try {
        connection = await dbPool.getConnection();
        
        const [users]: any = await connection.execute(
          `SELECT 
            u.id, 
            u.plan_key, 
            u.ended_at
          FROM users u
          WHERE u.id = ?
          LIMIT 1`,
          [userId]
        );
        
        if (!users || users.length === 0) {
          return NextResponse.redirect(new URL("/login", request.url));
        }
        
        const user = users[0];
        const now = new Date();
        
        // اصلاح: بررسی اشتراک فعال - پلن‌های رایگان هم اگر تاریخ انقضا دارند معتبر هستند
        let hasActivePlan = false;
        
        // اگر تاریخ انقضا وجود دارد و معتبر است
        if (user.ended_at && new Date(user.ended_at) > now) {
          hasActivePlan = true;
        }
        
        // اگر پلن خاصی دارد (غیر از null)
        if (user.plan_key && user.plan_key !== "expired") {
          // اگر تاریخ انقضا دارد که قبلاً بررسی شد
          // اگر تاریخ انقضا ندارد، پلن‌های پولی را قبول کن
          if (!user.ended_at && user.plan_key !== "free" && user.plan_key !== "free_trial") {
            hasActivePlan = true;
          }
        }
        
        console.log("[Middleware] Subscription Check:", {
          userId: user.id,
          plan_key: user.plan_key,
          ended_at: user.ended_at,
          now: now.toISOString(),
          hasActivePlan: hasActivePlan
        });
        
        if (!hasActivePlan) {
          const pricingUrl = new URL("/clientdashboard/pricingplan?expired=true", request.url);
          return NextResponse.redirect(pricingUrl);
        }
        
      } catch (error) {
        console.error("[Middleware] Error checking subscription:", error);
        return NextResponse.next();
      } finally {
        if (connection) connection.release();
      }
    }
  }

  // --- وضعیت ج: حفاظت از مسیرهای پنل ادمین ---
  if (pathname.startsWith("/admindashboard")) {
    if (!adminToken) {
      return NextResponse.redirect(new URL("/admin-login", request.url));
    }
    
    const adminId = verifyToken(adminToken);
    if (!adminId) {
      const response = NextResponse.redirect(new URL("/admin-login", request.url));
      response.cookies.delete("adminAuthToken");
      return response;
    }
  }
  
  if (
    userType === "staff" &&
    (pathname === "/clientdashboard/Staffs" ||
      pathname === "/clientdashboard/pricingplan" ||
      pathname === "/clientdashboard/buysms" ||
      pathname === "/clientdashboard/settings")
  ) {
    return NextResponse.redirect(new URL("/clientdashboard", request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/uploads/:path*",
    "/login",
    "/admin-login",
    "/clientdashboard/:path*",
    "/admindashboard/:path*",
  ],
};