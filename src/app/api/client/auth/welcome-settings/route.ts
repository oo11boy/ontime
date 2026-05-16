// src/app/api/client/auth/welcome-settings/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

async function getSystemSetting(key: string, defaultValue: string): Promise<string> {
  try {
    const result = await query<{ setting_value: string }>(
      'SELECT setting_value FROM system_settings WHERE setting_key = ?',
      [key]
    );
    if (result && result.length > 0 && result[0].setting_value) {
      return result[0].setting_value;
    }
    return defaultValue;
  } catch (error) {
    console.error(`Error fetching setting ${key}:`, error);
    return defaultValue;
  }
}

function formatDurationText(duration: number, unit: string): string {
  if (unit === 'week') {
    return `${duration} ${duration > 1 ? 'هفته' : 'هفته'}`;
  }
  return `${duration} ${duration > 1 ? 'ماه' : 'ماه'}`;
}

export async function GET() {
  try {
    const trialDuration = parseInt(await getSystemSetting('free_trial_duration', '2'));
    const trialDurationUnit = await getSystemSetting('free_trial_duration_unit', 'month');
    const freeTrialSmsQuota = parseInt(await getSystemSetting('free_trial_sms_quota', '150'));
    const smsDuration = parseInt(await getSystemSetting('free_trial_sms_duration', '3'));
    const smsDurationUnit = await getSystemSetting('free_trial_sms_duration_unit', 'month');

    return NextResponse.json({
      success: true,
      free_trial_duration: trialDuration,
      free_trial_duration_unit: trialDurationUnit,
      free_trial_duration_text: formatDurationText(trialDuration, trialDurationUnit),
      free_trial_sms_quota: freeTrialSmsQuota,
      free_trial_sms_duration: smsDuration,
      free_trial_sms_duration_unit: smsDurationUnit,
      free_trial_sms_duration_text: formatDurationText(smsDuration, smsDurationUnit),
    });
  } catch (error) {
    console.error("Error fetching welcome settings:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت تنظیمات" },
      { status: 500 }
    );
  }
}