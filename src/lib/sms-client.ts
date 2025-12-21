// File Path: src/lib/sms-client.ts

/**
 * تابع ارسال پیامک که در کامپوننت‌های فرانت‌بند صدا می‌زنید
 */
export async function sendSingleSms({
  to_phone,
  content,
  sms_type = "other",
  booking_id = null,
  booking_date = null,
  booking_time = null,
  
  sms_reminder_hours_before = 24,
  use_template = false,
}: {
  to_phone: string;
  content: string;
  sms_type?: string;
  booking_id?: number | null;
  booking_date?: string | null;
  booking_time?: string | null;
  sms_reminder_hours_before?: number | null;
  use_template?: boolean;
}): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch("/api/sms/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to_phone,
        content,
        sms_type,
        booking_id,
        booking_date,
        booking_time,
        sms_reminder_hours_before,
        use_template
      }),
    });

    const data = await res.json();
    return { success: res.ok && data.success, message: data.message };
  } catch (error) {
    return { success: false, message: "خطای ارتباط با سرور" };
  }
}