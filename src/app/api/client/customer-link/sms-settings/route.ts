import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async (req, context) => {
  const { userId } = context;
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json(
      { success: false, message: "slug الزامی است" },
      { status: 400 }
    );
  }

  try {
    const link = await query<any>(
      `SELECT id FROM customer_links WHERE slug = ? AND user_id = ? AND is_deleted = 0`,
      [slug, userId]
    );

    if (link.length === 0) {
      return NextResponse.json(
        { success: false, message: "لینک یافت نشد" },
        { status: 404 }
      );
    }

    const settings = await query<any>(
      `SELECT 
        sms_new_booking_enabled,
        sms_reschedule_enabled,
        sms_approval_enabled
      FROM customer_links WHERE slug = ?`,
      [slug]
    );

    return NextResponse.json({
      success: true,
      settings: {
        new_booking_sms_enabled: settings[0]?.sms_new_booking_enabled ?? 1,
        reschedule_sms_enabled: settings[0]?.sms_reschedule_enabled ?? 1,
        approval_sms_enabled: settings[0]?.sms_approval_enabled ?? 1,
      },
    });
  } catch (error) {
    console.error("Error fetching SMS settings:", error);
    return NextResponse.json(
      { success: false, message: "خطای سرور" },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (req, context) => {
  const { userId } = context;
  const body = await req.json();
  const { slug, settings } = body;

  if (!slug || !settings) {
    return NextResponse.json(
      { success: false, message: "اطلاعات ناقص است" },
      { status: 400 }
    );
  }

  try {
    const link = await query<any>(
      `SELECT id FROM customer_links WHERE slug = ? AND user_id = ? AND is_deleted = 0`,
      [slug, userId]
    );

    if (link.length === 0) {
      return NextResponse.json(
        { success: false, message: "لینک یافت نشد" },
        { status: 404 }
      );
    }

    await query(
      `UPDATE customer_links 
       SET 
         sms_new_booking_enabled = ?,
         sms_reschedule_enabled = ?,
         sms_approval_enabled = ?
       WHERE slug = ?`,
      [
        settings.new_booking_sms_enabled ? 1 : 0,
        settings.reschedule_sms_enabled ? 1 : 0,
        settings.approval_sms_enabled ? 1 : 0,
        slug,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "تنظیمات با موفقیت ذخیره شد",
    });
  } catch (error) {
    console.error("Error saving SMS settings:", error);
    return NextResponse.json(
      { success: false, message: "خطای سرور" },
      { status: 500 }
    );
  }
});