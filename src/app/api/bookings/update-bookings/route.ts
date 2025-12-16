// File Path: src\app\api\bookings\update-bookings\route.ts

import { query, QueryResult } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // درخواست ممکن است body نداشته باشد (برای فراخوانی عمومی)
    let userId: number | undefined;
    
    try {
      const body = await request.json();
      userId = body.userId;
    } catch (e) {
      // اگر body وجود نداشت، مشکلی نیست
      console.log("No userId provided in request body");
    }
    
    const sql = `
      UPDATE booking 
      SET status = 'done', 
          updated_at = NOW()
      WHERE status = 'active'
        AND (
          (booking_date < CURDATE()) OR
          (booking_date = CURDATE() AND booking_time < CURTIME())
        )
        ${userId ? 'AND user_id = ?' : ''}
    `;
    
    const params = userId ? [userId] : [];
    const result = await query<QueryResult>(sql, params);
    
    return NextResponse.json({ 
      success: true, 
      updatedCount: result[0].affectedRows || 0 
    });
  } catch (error: any) {
    console.error("Error updating bookings:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}