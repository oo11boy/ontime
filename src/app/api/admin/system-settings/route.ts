// src/app/api/admin/system-settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { withAdminAuth } from '@/lib/auth';

// GET: دریافت تنظیمات سیستم
export const GET = withAdminAuth(async (req: NextRequest) => {
  try {
    const settings = await query<{ setting_key: string; setting_value: string }>(
      'SELECT setting_key, setting_value FROM system_settings'
    );
    
    const settingsObject: Record<string, string> = {};
    settings.forEach(setting => {
      settingsObject[setting.setting_key] = setting.setting_value;
    });
    
    // مقادیر پیش‌فرض
    const defaults = {
      free_trial_duration: '2',
      free_trial_duration_unit: 'month',
      free_trial_sms_quota: '150',
      free_trial_sms_duration: '3',
      free_trial_sms_duration_unit: 'month',
    };
    
    return NextResponse.json({ 
      success: true, 
      settings: { ...defaults, ...settingsObject }
    });
  } catch (error) {
    console.error('Error fetching system settings:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در دریافت تنظیمات سیستم' },
      { status: 500 }
    );
  }
}, ['super_admin', 'editor']);

// PUT: بروزرسانی تنظیمات سیستم
export const PUT = withAdminAuth(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { settings } = body;
    
    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { success: false, message: 'داده‌های نامعتبر' },
        { status: 400 }
      );
    }
    
    // بروزرسانی هر تنظیمات
    for (const [key, value] of Object.entries(settings)) {
      await query(
        `INSERT INTO system_settings (setting_key, setting_value) 
         VALUES (?, ?) 
         ON DUPLICATE KEY UPDATE setting_value = ?`,
        [key, value, value]
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'تنظیمات با موفقیت ذخیره شد' 
    });
  } catch (error) {
    console.error('Error updating system settings:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در ذخیره تنظیمات' },
      { status: 500 }
    );
  }
}, ['super_admin', 'editor']);