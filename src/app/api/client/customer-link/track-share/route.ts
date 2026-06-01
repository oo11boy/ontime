// src/app/api/client/customer-link/track-share/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const { slug, sessionId, shareType } = await req.json();
        
        const linkResult = await query<any>(
            `SELECT id, user_id FROM customer_links WHERE slug = ?`,
            [slug]
        );
        
        if (!linkResult?.length) {
            return NextResponse.json({ success: false }, { status: 404 });
        }
        
        const { id: linkId, user_id: userId } = linkResult[0];
        
        await query(
            `INSERT INTO share_clicks (link_id, user_id, session_id, share_type, clicked_at)
             VALUES (?, ?, ?, ?, NOW())`,
            [linkId, userId, sessionId, shareType]
        );
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Share tracking error:", error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}