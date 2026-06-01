// src/app/api/client/customer-link/track-visit-advanced/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { headers } from "next/headers";
import crypto from "crypto";
import type { NextRequest } from "next/server";

// تشخیص اطلاعات جغرافیایی از IP (استفاده از API رایگان)
async function getGeoInfo(ip: string) {
    if (ip === "unknown" || ip === "127.0.0.1" || ip.startsWith("192.168")) {
        return { country: "IR", city: "Tehran", region: "Tehran", isp: "Local" };
    }
    
    try {
        // استفاده از API رایگان ip-api.com
        const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,countryCode,city,regionName,isp,lat,lon`);
        const data = await response.json();
        
        if (data.status === "success") {
            return {
                country: data.countryCode,
                city: data.city,
                region: data.regionName,
                isp: data.isp,
                lat: data.lat,
                lon: data.lon
            };
        }
    } catch (error) {
        console.error("Geo IP lookup failed:", error);
    }
    
    return { country: "IR", city: "Unknown", region: "Unknown", isp: "Unknown" };
}

// استخراج UTM parameters از URL
function getUTMParams(url: string | null) {
    if (!url) return {};
    
    try {
        const urlObj = new URL(url);
        return {
            utm_source: urlObj.searchParams.get('utm_source'),
            utm_medium: urlObj.searchParams.get('utm_medium'),
            utm_campaign: urlObj.searchParams.get('utm_campaign'),
            utm_term: urlObj.searchParams.get('utm_term'),
            utm_content: urlObj.searchParams.get('utm_content')
        };
    } catch {
        return {};
    }
}

// تشخیص نحوه ورود
function getEntryPoint(referrer: string | null, utm: any): string {
    if (utm.utm_source) return `campaign:${utm.utm_source}`;
    if (!referrer) return "direct";
    if (referrer.includes("google.com")) return "google_search";
    if (referrer.includes("instagram.com")) return "instagram";
    if (referrer.includes("telegram.me") || referrer.includes("t.me")) return "telegram";
    if (referrer.includes("whatsapp.com")) return "whatsapp";
    if (referrer.includes("linkedin.com")) return "linkedin";
    if (referrer.includes("facebook.com")) return "facebook";
    if (referrer.includes("twitter.com") || referrer.includes("x.com")) return "twitter";
    if (referrer.includes("aparat.com")) return "aparat";
    if (referrer.includes("youtube.com")) return "youtube";
    return "other";
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { slug, session_id, scroll_depth = 0 } = body;
        
        const linkResult = await query<any>(
            `SELECT id, user_id FROM customer_links 
             WHERE slug = ? AND is_active = 1 AND is_deleted = 0`,
            [slug]
        );
        
        if (!linkResult?.length) {
            return NextResponse.json({ success: false, message: "لینک یافت نشد" }, { status: 404 });
        }
        
        const { id: linkId, user_id: userId } = linkResult[0];
        const headersList = await headers();
        
        const userAgent = headersList.get("user-agent") || "";
        const referrer = headersList.get("referer");
        const forwardedFor = headersList.get("x-forwarded-for");
        const realIp = headersList.get("x-real-ip");
        const ip = realIp || forwardedFor?.split(",")[0] || "unknown";
        
        // دریافت اطلاعات جغرافیایی
        const geoInfo = await getGeoInfo(ip);
        
        // استخراج UTM parameters
        const utmParams = getUTMParams(referrer);
        const entryPoint = getEntryPoint(referrer, utmParams);
        
        // هش IP برای تشخیص بازدید یکتا
        const ipHash = crypto
            .createHash("sha256")
            .update(ip + userAgent.substring(0, 100))
            .digest("hex");
        
        const finalSessionId = session_id || crypto.randomUUID();
        
        // بررسی بازدید یکتا در ۲۴ ساعت گذشته
        const existingVisit = await query<any>(
            `SELECT id FROM link_visits 
             WHERE link_id = ? AND ip_hash = ? 
               AND visited_at > NOW() - INTERVAL 24 HOUR`,
            [linkId, ipHash]
        );
        
        const isUnique = existingVisit.length === 0;
        
        // ثبت بازدید پیشرفته
        await query(
            `INSERT INTO link_visits 
             (link_id, user_id, session_id, ip_hash, is_unique, 
              device_type, browser, os, referrer,
              country_code, city, region, isp, latitude, longitude,
              utm_source, utm_medium, utm_campaign, utm_term, utm_content,
              entry_point, scroll_depth, visited_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                linkId, userId, finalSessionId, ipHash, isUnique ? 1 : 0,
                detectDevice(userAgent), detectBrowser(userAgent), detectOS(userAgent), referrer,
                geoInfo.country, geoInfo.city, geoInfo.region, geoInfo.isp,
                geoInfo.lat, geoInfo.lon,
                utmParams.utm_source, utmParams.utm_medium, utmParams.utm_campaign,
                utmParams.utm_term, utmParams.utm_content,
                entryPoint, scroll_depth
            ]
        );
        
        // بروزرسانی شمارنده‌ها
        await Promise.all([
            query(`UPDATE customer_links SET total_visits = total_visits + 1 WHERE id = ?`, [linkId]),
            isUnique && query(`UPDATE customer_links SET unique_visitors = unique_visitors + 1 WHERE id = ?`, [linkId])
        ]);
        
        return NextResponse.json({ 
            success: true, 
            isUnique,
            sessionId: finalSessionId
        });
        
    } catch (error) {
        console.error("Advanced tracking error:", error);
        return NextResponse.json({ success: false, message: "خطا در ثبت بازدید" }, { status: 500 });
    }
}

function detectDevice(ua: string): string {
    const u = ua.toLowerCase();
    if (/mobile|android|iphone/i.test(u)) return "mobile";
    if (/tablet|ipad/i.test(u)) return "tablet";
    return "desktop";
}

function detectBrowser(ua: string): string {
    const u = ua.toLowerCase();
    if (u.includes("chrome") && !u.includes("edg")) return "Chrome";
    if (u.includes("firefox")) return "Firefox";
    if (u.includes("safari") && !u.includes("chrome")) return "Safari";
    if (u.includes("edg")) return "Edge";
    return "Other";
}

function detectOS(ua: string): string {
    const u = ua.toLowerCase();
    if (u.includes("windows")) return "Windows";
    if (u.includes("mac")) return "macOS";
    if (u.includes("android")) return "Android";
    if (u.includes("ios") || u.includes("iphone")) return "iOS";
    return "Other";
}