// src/app/api/client/customer-link/track-time/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const { slug, sessionId, activeTime, isVisible, scrollDepth } = await req.json();
        
        // بروزرسانی زمان در جدول link_visits
        await query(
            `UPDATE link_visits 
             SET time_on_page_accurate = ?,
                 scroll_depth = GREATEST(scroll_depth, ?),
                 page_visibility_count = page_visibility_count + 1
             WHERE session_id = ? AND link_id = (SELECT id FROM customer_links WHERE slug = ?)`,
            [activeTime, scrollDepth, sessionId, slug]
        );
        
        // ذخیره در جدول رهگیری زمان
        await query(
            `INSERT INTO session_time_tracking (session_id, link_id, page_visible, last_heartbeat, total_active_time)
             VALUES (?, (SELECT id FROM customer_links WHERE slug = ?), ?, NOW(), ?)
             ON DUPLICATE KEY UPDATE 
             total_active_time = ?, last_heartbeat = NOW()`,
            [sessionId, slug, isVisible, activeTime, activeTime]
        );
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Time tracking error:", error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}