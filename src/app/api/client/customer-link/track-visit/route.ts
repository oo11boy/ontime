import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { headers } from "next/headers";
import crypto from "crypto";
import type { NextRequest } from "next/server";

function detectDevice(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (/mobile|android|iphone|ipad|ipod|blackberry/i.test(ua)) return "mobile";
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
  return "desktop";
}

function detectBrowser(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (ua.includes("chrome") && !ua.includes("edg")) return "Chrome";
  if (ua.includes("firefox")) return "Firefox";
  if (ua.includes("safari") && !ua.includes("chrome")) return "Safari";
  if (ua.includes("edg")) return "Edge";
  return "Other";
}

function detectOS(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (ua.includes("windows")) return "Windows";
  if (ua.includes("macintosh") || ua.includes("mac os")) return "macOS";
  if (ua.includes("android")) return "Android";
  if (ua.includes("iphone") || ua.includes("ipad")) return "iOS";
  if (ua.includes("linux")) return "Linux";
  return "Other";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, time_on_page = 0, session_id, utm_source, utm_medium, utm_campaign, referrer: clientReferrer, user_agent, inapp_source } = body;

    if (!slug) {
      return NextResponse.json({ success: false, message: "Slug is required" }, { status: 400 });
    }

    const linkResult = await query<any>(
      `SELECT id, user_id FROM customer_links WHERE slug = ? AND is_active = 1 AND is_deleted = 0 LIMIT 1`,
      [slug]
    );
    if (!linkResult?.length) {
      return NextResponse.json({ success: false, message: "لینک یافت نشد" }, { status: 404 });
    }
    const { id: linkId, user_id: userId } = linkResult[0];

    const headersList = await headers();
    const geoCity = headersList.get('x-geo-city');
    const geoCountry = headersList.get('x-geo-country');
    const geoLatitude = headersList.get('x-geo-latitude');
    const geoLongitude = headersList.get('x-geo-longitude');
    const serverUserAgent = headersList.get("user-agent") || "";
    const serverReferrer = headersList.get("referer") || null;
    const forwardedFor = headersList.get("x-forwarded-for");
    const ip = forwardedFor?.split(",")[0]?.trim() || "unknown";

    const ipHash = crypto.createHash("sha256").update(ip + serverUserAgent.substring(0, 100)).digest("hex");
    const finalSessionId = session_id || crypto.randomUUID();

    const existingVisit = await query<any>(
      `SELECT id FROM link_visits WHERE link_id = ? AND ip_hash = ? AND visited_at > NOW() - INTERVAL 24 HOUR LIMIT 1`,
      [linkId, ipHash]
    );
    const isUnique = existingVisit.length === 0;

    const finalUserAgent = user_agent || serverUserAgent;
    const finalSource = inapp_source || utm_source || 'direct';

    await query(
      `INSERT INTO link_visits 
       (link_id, user_id, session_id, device_type, browser, os, referrer, 
        ip_hash, is_unique, time_on_page, visited_at, 
        utm_source, utm_medium, utm_campaign, user_agent, traffic_source,
        country, city, latitude, longitude)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        linkId, userId, finalSessionId,
        detectDevice(finalUserAgent), detectBrowser(finalUserAgent), detectOS(finalUserAgent),
        clientReferrer || serverReferrer, ipHash, isUnique ? 1 : 0,
        Math.max(0, Math.min(Number(time_on_page), 3600)),
        finalSource, utm_medium || null, utm_campaign || null,
        finalUserAgent, finalSource,
        geoCountry || null, geoCity || null, geoLatitude || null, geoLongitude || null,
      ]
    );

    await Promise.all([
      query(`UPDATE customer_links SET total_visits = total_visits + 1 WHERE id = ?`, [linkId]),
      isUnique ? query(`UPDATE customer_links SET unique_visitors = unique_visitors + 1 WHERE id = ?`, [linkId]) : Promise.resolve(null),
    ]);

    return NextResponse.json({ success: true, isUnique });
  } catch (error) {
    console.error("Error tracking visit:", error);
    return NextResponse.json({ success: false, message: "خطا در ثبت بازدید" }, { status: 500 });
  }
}