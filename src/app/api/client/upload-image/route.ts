// src/app/api/client/upload-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export const POST = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;

  try {
    const formData = await req.formData();
    const image = formData.get("image") as File;
    const type = formData.get("type") as string; // 'avatar', 'cover', or 'logo'

    if (!image) {
      return NextResponse.json(
        { success: false, message: "تصویری انتخاب نشده است" },
        { status: 400 }
      );
    }

    // بررسی نوع فایل
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(image.type)) {
      return NextResponse.json(
        { success: false, message: "فرمت تصویر باید JPEG, PNG یا WEBP باشد" },
        { status: 400 }
      );
    }

    // بررسی حجم فایل (حداکثر 5 مگابایت)
    if (image.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "حجم تصویر نباید بیشتر از 5 مگابایت باشد" },
        { status: 400 }
      );
    }

    // ایجاد نام یکتا برای فایل
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = image.type.split("/")[1];
    const fileName = `${userId}_${type}_${timestamp}_${randomString}.${extension}`;
    
    // مسیر ذخیره‌سازی
    const uploadDir = join(process.cwd(), "public", "uploads", "customer-links", userId.toString());
    const filePath = join(uploadDir, fileName);
    const publicUrl = `/uploads/customer-links/${userId}/${fileName}`;

    // ایجاد پوشه در صورت نبود
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // ذخیره فایل
    await writeFile(filePath, buffer);

    // بروزرسانی دیتابیس
    const { query } = await import("@/lib/db");
    
    if (type === "avatar") {
      await query(
        "UPDATE customer_links SET avatar_image = ? WHERE user_id = ? AND is_deleted = 0",
        [publicUrl, userId]
      );
    } else if (type === "cover") {
      await query(
        "UPDATE customer_links SET cover_image = ? WHERE user_id = ? AND is_deleted = 0",
        [publicUrl, userId]
      );
    } else if (type === "logo") {
      await query(
        "UPDATE customer_links SET logo = ? WHERE user_id = ? AND is_deleted = 0",
        [publicUrl, userId]
      );
    }

    return NextResponse.json({
      success: true,
      message: "تصویر با موفقیت آپلود شد",
      url: publicUrl,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: "خطا در آپلود تصویر" },
      { status: 500 }
    );
  }
});

// DELETE - حذف تصویر
export const DELETE = withAuth(async (req: NextRequest, context) => {
  const { userId } = context;
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // 'avatar', 'cover', or 'logo'
  const imageUrl = searchParams.get("url"); // URL تصویر برای حذف فایل فیزیکی

  try {
    const { query } = await import("@/lib/db");
    
    // حذف فایل فیزیکی اگر URL داده شده باشد
    if (imageUrl) {
      try {
        const filePath = join(process.cwd(), "public", imageUrl);
        if (existsSync(filePath)) {
          await unlink(filePath);
          console.log(`Deleted file: ${filePath}`);
        }
      } catch (fileError) {
        console.error("Error deleting physical file:", fileError);
      }
    }
    
    // بروزرسانی دیتابیس
    if (type === "avatar") {
      await query(
        "UPDATE customer_links SET avatar_image = NULL WHERE user_id = ? AND is_deleted = 0",
        [userId]
      );
    } else if (type === "cover") {
      await query(
        "UPDATE customer_links SET cover_image = NULL WHERE user_id = ? AND is_deleted = 0",
        [userId]
      );
    } else if (type === "logo") {
      await query(
        "UPDATE customer_links SET logo = NULL WHERE user_id = ? AND is_deleted = 0",
        [userId]
      );
    }

    return NextResponse.json({
      success: true,
      message: "تصویر با موفقیت حذف شد",
    });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { success: false, message: "خطا در حذف تصویر" },
      { status: 500 }
    );
  }
});