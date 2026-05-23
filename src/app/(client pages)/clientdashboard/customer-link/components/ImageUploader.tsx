// src/components/ui/ImageUploader.tsx
"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Camera, X, Upload, Loader2, Check, Trash2, Image as ImageIcon, 
  ZoomIn, ZoomOut, RotateCw, Edit2, AlertTriangle 
} from "lucide-react";
import { toast } from "react-hot-toast";
import AvatarEditor, { AvatarEditorRef } from "react-avatar-editor";

interface ImageUploaderProps {
  currentImage: string | null;
  onImageUploaded: (imageUrl: string) => void;
  onImageRemoved?: () => void;
  aspectRatio?: number;
  maxSizeMB?: number;
  quality?: number;
  title?: string;
  description?: string;
  shape?: "circle" | "square" | "cover";
  className?: string;
}

export function ImageUploader({
  currentImage,
  onImageUploaded,
  onImageRemoved,
  maxSizeMB = 5,
  quality = 0.8,
  title = "آپلود تصویر",
  description = "PNG, JPG یا JPEG حداکثر ۵ مگابایت",
  shape = "square",
  className = "",
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage);
  const [oldImage, setOldImage] = useState<string | null>(currentImage);
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  
  const editorRef = useRef<AvatarEditorRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // تعیین ابعاد بر اساس shape
  const getEditorDimensions = () => {
    if (shape === "cover") return { width: 600, height: 200 };
    if (shape === "circle") return { width: 300, height: 300 };
    return { width: 300, height: 300 };
  };

  const { width, height } = getEditorDimensions();
  const isCircular = shape === "circle";
  const borderRadius = isCircular ? width / 2 : shape === "cover" ? 16 : 12;

  // حذف تصویر قدیمی از سرور
  const deleteOldImage = async (imageUrl: string | null, type: string) => {
    if (!imageUrl) return;
    
    try {
      const res = await fetch(`/api/client/upload-image?type=${type}&url=${encodeURIComponent(imageUrl)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!data.success) {
        console.warn("Failed to delete old image:", imageUrl);
      }
    } catch (error) {
      console.error("Error deleting old image:", error);
    }
  };

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    const type = shape === "circle" ? "avatar" : shape === "cover" ? "cover" : "logo";
    const formData = new FormData();
    formData.append("image", file);
    formData.append("type", type);

    try {
      const res = await fetch("/api/client/upload-image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      
      if (data.success) {
        // حذف تصویر قدیمی بعد از آپلود موفق تصویر جدید
        if (oldImage && oldImage !== data.url) {
          await deleteOldImage(oldImage, type);
        }
        
        onImageUploaded(data.url);
        setPreview(data.url);
        setOldImage(data.url);
        toast.success("تصویر با موفقیت آپلود شد");
        setShowEditorModal(false);
        setImageSrc(null);
        setScale(1);
        setRotate(0);
        setIsEditingExisting(false);
      } else {
        toast.error(data.message || "خطا در آپلود تصویر");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = useCallback(async () => {
    if (!editorRef.current) {
      toast.error("خطا در ویرایش تصویر");
      return;
    }
    
    try {
      const canvas = editorRef.current.getImageScaledToCanvas();
      canvas.toBlob(
        async (blob: Blob | null) => {
          if (blob) {
            const file = new File([blob], "cropped-image.jpg", { type: "image/jpeg" });
            await uploadImage(file);
          } else {
            toast.error("خطا در پردازش تصویر");
          }
        },
        "image/jpeg",
        quality
      );
    } catch (error) {
      console.error("Save error:", error);
      toast.error("خطا در ذخیره تصویر");
    }
  }, [quality]);

  const handleRemove = async () => {
    // Confirm deletion for better UX
    const confirmed = window.confirm("آیا از حذف این تصویر اطمینان دارید؟");
    if (!confirmed) return;
    
    setIsDeleting(true);
    try {
      const type = shape === "circle" ? "avatar" : shape === "cover" ? "cover" : "logo";
      const res = await fetch(`/api/client/upload-image?type=${type}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setPreview(null);
        setOldImage(null);
        if (onImageRemoved) onImageRemoved();
        toast.success("تصویر حذف شد");
        setShowEditorModal(false);
        setImageSrc(null);
        setIsEditingExisting(false);
      } else {
        toast.error(data.message || "خطا در حذف تصویر");
      }
    } catch (error) {
      console.error("Remove error:", error);
      toast.error("خطا در حذف تصویر");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = () => {
    if (preview) {
      setIsImageLoading(true);
      setShowEditorModal(true);
      setIsEditingExisting(true);
      setScale(1);
      setRotate(0);
      
      fetch(preview)
        .then((response) => response.blob())
        .then((blob: Blob) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            setImageSrc(reader.result as string);
            setIsImageLoading(false);
          };
          reader.readAsDataURL(blob);
        })
        .catch((error: Error) => {
          console.error("Error loading image:", error);
          toast.error("خطا در بارگذاری تصویر");
          setIsImageLoading(false);
          setShowEditorModal(false);
        });
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`حجم فایل نباید بیشتر از ${maxSizeMB} مگابایت باشد`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("فایل انتخابی باید تصویر باشد");
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImageSrc(reader.result as string);
      setIsEditingExisting(false);
      setShowEditorModal(true);
    });
    reader.readAsDataURL(file);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 1));
  };

  const handleRotate = () => {
    setRotate((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setScale(1);
    setRotate(0);
  };

  const handleReplaceImage = () => {
    fileInputRef.current?.click();
    setShowEditorModal(false);
    setImageSrc(null);
    setIsEditingExisting(false);
  };

  // نمایش پیام راهنما برای ابعاد مناسب
  const getDimensionHint = () => {
    if (shape === "cover") {
      return "📐 ابعاد پیشنهادی: 1200×400 پیکسل (نسبت 3:1)";
    }
    if (shape === "circle") {
      return "📐 ابعاد پیشنهادی: 400×400 پیکسل (مربع)";
    }
    return "📐 ابعاد پیشنهادی: 200×200 پیکسل";
  };

  return (
    <>
      <div className={`relative group ${className}`}>
        {preview ? (
          <div className="relative">
            <div className={`overflow-hidden ${shape === "circle" ? "rounded-full" : "rounded-xl"} bg-slate-100 dark:bg-white/5`}>
              {shape === "cover" ? (
                <div className="relative w-full h-48">
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="w-full h-full object-cover" 
                  />
                  {/* Progress overlay while uploading new image */}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-white" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Preview"
                    className={`w-24 h-24 ${shape === "circle" ? "rounded-full" : "rounded-xl"} object-cover`}
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-white" />
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Action buttons - only show when not uploading */}
            {!isUploading && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-2 rounded-xl">
                <button
                  onClick={handleEditClick}
                  className="p-2 bg-blue-500/80 backdrop-blur rounded-full hover:bg-blue-600 transition transform hover:scale-110"
                  type="button"
                  title="ویرایش تصویر"
                >
                  <Edit2 className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={handleRemove}
                  disabled={isDeleting}
                  className="p-2 bg-red-500/80 backdrop-blur rounded-full hover:bg-red-600 transition transform hover:scale-110 disabled:opacity-50"
                  type="button"
                  title="حذف تصویر"
                >
                  {isDeleting ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : <Trash2 className="w-5 h-5 text-white" />}
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-300 dark:border-white/20 
                       hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-200
                       ${shape === "cover" ? "w-full h-48 rounded-xl" : "w-24 h-24 rounded-full"}
                       bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10
                       group hover:scale-[1.02] transform transition-all`}
            type="button"
          >
            {shape === "cover" ? (
              <>
                <Upload className="w-8 h-8 text-slate-400 group-hover:text-emerald-500 transition" />
                <span className="text-xs text-slate-500 group-hover:text-emerald-500 transition">{title}</span>
                <span className="text-[10px] text-slate-400">{description}</span>
                <span className="text-[9px] text-slate-400 mt-1">{getDimensionHint()}</span>
              </>
            ) : (
              <>
                <Camera className="w-6 h-6 text-slate-400 group-hover:text-emerald-500 transition" />
                <span className="text-[10px] text-slate-500 group-hover:text-emerald-500 transition">{title}</span>
              </>
            )}
          </button>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* مودال ویرایش با بهبود UX */}
      <AnimatePresence>
        {showEditorModal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#1a1e26] rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-4 border-b dark:border-white/10 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 dark:text-white">
                  {isEditingExisting ? "ویرایش تصویر فعلی" : shape === "cover" ? "آپلود تصویر کاور" : shape === "circle" ? "آپلود تصویر پروفایل" : "آپلود تصویر"}
                </h3>
                <div className="flex gap-2">
                  {preview && (
                    <button
                      onClick={handleRemove}
                      disabled={isDeleting}
                      className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/30 transition text-red-500"
                      type="button"
                      title="حذف تصویر"
                    >
                      {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                    </button>
                  )}
                  {preview && (
                    <button
                      onClick={handleReplaceImage}
                      className="p-2 rounded-full bg-blue-500/20 hover:bg-blue-500/30 transition text-blue-500"
                      type="button"
                      title="جایگزینی با تصویر جدید"
                    >
                      <Upload className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowEditorModal(false);
                      setImageSrc(null);
                      setScale(1);
                      setRotate(0);
                      setIsEditingExisting(false);
                      setIsImageLoading(false);
                    }}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10"
                    type="button"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Editor یا Loading */}
              <div className="flex items-center justify-center p-4 bg-black/20 min-h-[300px]">
                {isImageLoading ? (
                  <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">در حال بارگذاری تصویر...</p>
                  </div>
                ) : imageSrc ? (
                  <AvatarEditor
                    ref={editorRef}
                    image={imageSrc}
                    width={width}
                    height={height}
                    border={50}
                    borderRadius={borderRadius}
                    color={[0, 0, 0, 0.6]}
                    scale={scale}
                    rotate={rotate}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "50vh",
                    }}
                  />
                ) : (
                  <div className="text-center">
                    <ImageIcon className="w-16 h-16 text-gray-500 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">تصویری برای نمایش وجود ندارد</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-3 px-4 py-2 bg-emerald-500 rounded-lg text-white text-sm hover:bg-emerald-600 transition"
                    >
                      انتخاب تصویر
                    </button>
                  </div>
                )}
              </div>

              {/* Dimension Hint */}
              <div className="px-4 py-2 bg-amber-50 dark:bg-amber-500/10 border-b dark:border-white/10">
                <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {getDimensionHint()}
                </p>
              </div>

              {/* Controls */}
              {imageSrc && !isImageLoading && (
                <>
                  <div className="p-4 space-y-4 border-b dark:border-white/10">
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                      <button
                        onClick={handleZoomOut}
                        className="p-2 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 transition"
                        type="button"
                      >
                        <ZoomOut className="w-5 h-5" />
                      </button>
                      <span className="text-sm font-medium">{Math.round(scale * 100)}%</span>
                      <button
                        onClick={handleZoomIn}
                        className="p-2 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 transition"
                        type="button"
                      >
                        <ZoomIn className="w-5 h-5" />
                      </button>
                      
                      <div className="w-px h-6 bg-slate-300 dark:bg-white/20 mx-2" />
                      
                      <button
                        onClick={handleRotate}
                        className="p-2 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 transition"
                        type="button"
                      >
                        <RotateCw className="w-5 h-5" />
                      </button>
                      
                      <button
                        onClick={handleReset}
                        className="px-3 py-2 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 transition text-sm"
                        type="button"
                      >
                        ریست
                      </button>
                    </div>
                  </div>

                  <div className="px-4 py-3">
                    <p className="text-xs text-slate-500 text-center">
                      {/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) 
                        ? "👆 با انگشت خود تصویر را جا به جا کنید (پینچ برای زوم)" 
                        : "🖱️ با موس خود تصویر را جا به جا کنید (اسکرول برای زوم)"}
                    </p>
                    <p className="text-[10px] text-slate-400 text-center mt-1">
                      ✂️ تصویر را جابجا کنید تا قسمت مورد نظر در کادر سبز قرار گیرد
                    </p>
                    {preview && (
                      <p className="text-[10px] text-blue-400 text-center mt-2">
                        💡 برای تعویض کامل تصویر، از دکمه آبی بالا استفاده کنید
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Footer */}
              <div className="p-4 border-t dark:border-white/10 flex gap-3">
                <button
                  onClick={() => {
                    setShowEditorModal(false);
                    setImageSrc(null);
                    setScale(1);
                    setRotate(0);
                    setIsEditingExisting(false);
                    setIsImageLoading(false);
                  }}
                  className="flex-1 py-3 border border-slate-300 dark:border-white/20 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition"
                  type="button"
                >
                  انصراف
                </button>
                <button
                  onClick={handleSave}
                  disabled={isUploading || !imageSrc || isImageLoading}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:from-emerald-600 hover:to-teal-600 transition"
                  type="button"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      در حال آپلود...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      {isEditingExisting ? "ذخیره تغییرات" : "تأیید و آپلود"}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}