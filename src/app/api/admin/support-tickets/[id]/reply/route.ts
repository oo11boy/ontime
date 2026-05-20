// src/app/api/admin/support-tickets/[id]/reply/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAdminAuth } from "@/lib/auth";

// تابع ارسال پیامک با پترن
async function sendTicketReplySms(phone: string, name: string, ticketSubject: string, ticketId: number) {
  const API_URL = "https://edge.ippanel.com/v1/api/send";
  const API_KEY = process.env.IP_PANEL_API_KEY;
  const SENDER = process.env.SENDER_NUMBER;
  const PATTERN_CODE = "7ogy5ui3qn19ao6";

  if (!API_KEY || !SENDER) {
    console.error("SMS configuration missing:", { API_KEY: !!API_KEY, SENDER: !!SENDER });
    return false;
  }

  const formattedPhone = phone.startsWith("0") ? `+98${phone.slice(1)}` : phone;

  try {
    console.log(`📤 Sending SMS to ${formattedPhone} with pattern ${PATTERN_CODE}`);
    
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: API_KEY,
      },
      body: JSON.stringify({
        sending_type: "pattern",
        from_number: SENDER,
        code: PATTERN_CODE,
        recipients: [formattedPhone],
        params: {
          name: name || "کاربر گرامی",
          ticket_id: ticketId.toString(),
          subject: ticketSubject,
        },
      }),
    });
    
    const result = await response.json();
    console.log("📨 SMS Response:", result);
    
    if (result.meta?.status === true) {
      console.log("✅ SMS sent successfully");
      return true;
    } else {
      console.error("❌ SMS failed:", result);
      return false;
    }
  } catch (error) {
    console.error("❌ SMS Error:", error);
    return false;
  }
}

export const POST = withAdminAuth(async (req: NextRequest, context: any) => {
  const { userId, role } = context;
  
  console.log("========== [REPLY API START] ==========");
  console.log("Admin userId:", userId);
  console.log("Admin role:", role);
  
  try {
    // دریافت ID تیکت از URL
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const ticketId = pathParts[pathParts.length - 2];
    console.log("Ticket ID:", ticketId);
    
    if (!ticketId) {
      return NextResponse.json(
        { success: false, message: "شناسه تیکت الزامی است" },
        { status: 400 }
      );
    }
    
    const body = await req.json();
    const { message } = body;
    console.log("Reply message:", message);
    
    if (!message || !message.trim()) {
      return NextResponse.json(
        { success: false, message: "متن پاسخ الزامی است" },
        { status: 400 }
      );
    }
    
    // دریافت اطلاعات تیکت و کاربر
    const ticketData = await query(
      `SELECT t.*, u.name as user_name, u.phone as user_phone 
       FROM support_tickets t
       JOIN users u ON t.user_id = u.id
       WHERE t.id = ?`,
      [ticketId]
    );
    
    if (!ticketData || ticketData.length === 0) {
      return NextResponse.json(
        { success: false, message: "تیکت یافت نشد" },
        { status: 404 }
      );
    }
    
    const ticket = ticketData[0] as any;
    console.log("Ticket info:", { id: ticket.id, subject: ticket.subject, user_name: ticket.user_name, user_phone: ticket.user_phone });
    
    // ثبت پاسخ
    console.log("Inserting reply with adminId:", userId);
    await query(
      `INSERT INTO ticket_replies (ticket_id, admin_id, message, is_admin_reply, created_at)
       VALUES (?, ?, ?, TRUE, NOW())`,
      [ticketId, userId, message.trim()]
    );
    console.log("✅ Reply inserted successfully");
    
    // به‌روزرسانی تیکت
    await query(
      `UPDATE support_tickets 
       SET admin_response = ?, responded_at = NOW(), status = 'answered', updated_at = NOW()
       WHERE id = ?`,
      [message.trim(), ticketId]
    );
    console.log("✅ Ticket updated successfully");
    
    // ارسال پیامک به کاربر (اگر شماره تلفن وجود داشته باشد)
    let smsSent = false;
    if (ticket.user_phone) {
      console.log(`📱 Sending SMS to user: ${ticket.user_name} (${ticket.user_phone})`);
      smsSent = await sendTicketReplySms(
        ticket.user_phone,
        ticket.user_name,
        ticket.subject,
        ticket.id
      );
    } else {
      console.warn("⚠️ No phone number found for user, SMS not sent");
    }
    
    return NextResponse.json({
      success: true,
      message: "پاسخ با موفقیت ارسال شد" + (smsSent ? " و پیامک به کاربر ارسال گردید" : ""),
      sms_sent: smsSent,
    });
  } catch (error) {
    console.error("❌ Error sending reply:", error);
    return NextResponse.json(
      { success: false, message: "خطا در ارسال پاسخ", error: String(error) },
      { status: 500 }
    );
  } finally {
    console.log("========== [REPLY API END] ==========\n");
  }
});