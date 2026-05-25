// src/app/api/client/customer-link/gallery/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { query } from "@/lib/db";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// نوع برای تصویر گالری
interface GalleryImageRow {
  id: number;
  image_url: string;
  title: string | null;
  description: string | null;
  order_index: number;
  created_at: string;
}

interface CustomerLinkRow {
  id: number;
}

interface MaxOrderResult {
  maxOrder: number;
}

// GET - دریافت لیست تصاویر گالری
export const GET = withAuth(async (req: NextRequest, context: { userId: number }) => {
  const { userId } = context;
  const { searchParams } = new URL(req.url);
  const linkId = searchParams.get("linkId");

  try {
    let galleryImages: GalleryImageRow[] = [];
    
    if (linkId) {
      const result = await query<any>(
        `SELECT id, image_url, title, description, order_index, created_at 
         FROM customer_link_gallery 
         WHERE link_id = ? AND user_id = ? AND is_active = 1 
         ORDER BY order_index ASC, created_at DESC`,
        [parseInt(linkId), userId]
      );
      galleryImages = result as GalleryImageRow[];
    } else {
      // ابتدا لینک کاربر را پیدا کن
      const customerLink = await query<any>(
        `SELECT id FROM customer_links WHERE user_id = ? AND is_deleted = 0`,
        [userId]
      );
      
      if (customerLink && customerLink.length > 0) {
        const linkIdValue = (customerLink[0] as CustomerLinkRow).id;
        const result = await query<any>(
          `SELECT id, image_url, title, description, order_index, created_at 
           FROM customer_link_gallery 
           WHERE link_id = ? AND user_id = ? AND is_active = 1 
           ORDER BY order_index ASC, created_at DESC`,
          [linkIdValue, userId]
        );
        galleryImages = result as GalleryImageRow[];
      }
    }

    return NextResponse.json({
      success: true,
      images: galleryImages,
    });
  } catch (error) {
    console.error("Error fetching gallery:", error);
    return NextResponse.json(
      { success: false, message: "خطا در دریافت تصاویر گالری" },
      { status: 500 }
    );
  }
});

// POST - افزودن تصویر جدید به گالری
export const POST = withAuth(async (req: NextRequest, context: { userId: number }) => {
  const { userId } = context;
  
  try {
    const formData = await req.formData();
    const image = formData.get("image") as File;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

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

    // دریافت customer_link کاربر
    const customerLink = await query<any>(
      `SELECT id FROM customer_links WHERE user_id = ? AND is_deleted = 0`,
      [userId]
    );

    if (!customerLink || customerLink.length === 0) {
      return NextResponse.json(
        { success: false, message: "لینک اختصاصی یافت نشد" },
        { status: 404 }
      );
    }

    const linkId = (customerLink[0] as CustomerLinkRow).id;

    // آپلود تصویر
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = image.type.split("/")[1];
    const fileName = `${userId}_gallery_${timestamp}_${randomString}.${extension}`;
    
    const uploadDir = join(process.cwd(), "public", "uploads", "customer-links", userId.toString(), "gallery");
    const filePath = join(uploadDir, fileName);
    const publicUrl = `/uploads/customer-links/${userId}/gallery/${fileName}`;

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    await writeFile(filePath, buffer);

    // دریافت حداکثر order_index فعلی
    const maxOrderResult = await query<any>(
      `SELECT COALESCE(MAX(order_index), 0) as maxOrder FROM customer_link_gallery WHERE link_id = ?`,
      [linkId]
    );
    const nextOrder = ((maxOrderResult?.[0] as MaxOrderResult)?.maxOrder || 0) + 1;

    // ذخیره در دیتابیس
    const result = await query<any>(
      `INSERT INTO customer_link_gallery (link_id, user_id, image_url, title, description, order_index) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [linkId, userId, publicUrl, title || null, description || null, nextOrder]
    );

    const insertId = (result as any).insertId;

    return NextResponse.json({
      success: true,
      message: "تصویر با موفقیت به گالری اضافه شد",
      image: {
        id: insertId,
        image_url: publicUrl,
        title,
        description,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: "خطا در آپلود تصویر" },
      { status: 500 }
    );
  }
});

// DELETE - حذف تصویر از گالری
export const DELETE = withAuth(async (req: NextRequest, context: { userId: number }) => {
  const { userId } = context;
  const { searchParams } = new URL(req.url);
  const imageId = searchParams.get("id");
  const imageUrl = searchParams.get("url");

  if (!imageId) {
    return NextResponse.json(
      { success: false, message: "آیدی تصویر مشخص نشده است" },
      { status: 400 }
    );
  }

  try {
    // دریافت اطلاعات تصویر
    const image = await query<any>(
      `SELECT image_url FROM customer_link_gallery 
       WHERE id = ? AND user_id = ?`,
      [parseInt(imageId), userId]
    );

    if (!image || image.length === 0) {
      return NextResponse.json(
        { success: false, message: "تصویر یافت نشد" },
        { status: 404 }
      );
    }

    // حذف فایل فیزیکی
    try {
      const filePath = join(process.cwd(), "public", (image[0] as GalleryImageRow).image_url);
      if (existsSync(filePath)) {
        await unlink(filePath);
      }
    } catch (fileError) {
      console.error("Error deleting physical file:", fileError);
    }

    // حذف از دیتابیس
    await query(
      `DELETE FROM customer_link_gallery WHERE id = ? AND user_id = ?`,
      [parseInt(imageId), userId]
    );

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

// PUT - بروزرسانی ترتیب و عنوان تصاویر
export const PUT = withAuth(async (req: NextRequest, context: { userId: number }) => {
  const { userId } = context;
  
  try {
    const body = await req.json();
    const { images } = body;

    if (!images || !Array.isArray(images)) {
      return NextResponse.json(
        { success: false, message: "داده‌های نامعتبر" },
        { status: 400 }
      );
    }

    // بروزرسانی هر تصویر
    for (const img of images) {
      await query(
        `UPDATE customer_link_gallery 
         SET order_index = ?, title = ?, description = ? 
         WHERE id = ? AND user_id = ?`,
        [img.order_index, img.title || null, img.description || null, img.id, userId]
      );
    }

    return NextResponse.json({
      success: true,
      message: "ترتیب تصاویر با موفقیت بروزرسانی شد",
    });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { success: false, message: "خطا در بروزرسانی ترتیب تصاویر" },
      { status: 500 }
    );
  }
});