// src/app/clientdashboard/customer-link/components/GalleryBox.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  X, 
  Loader2,
  GripVertical,
  AlertCircle,
  CheckCircle,
  Upload,
  ZoomIn,
  Lock
} from "lucide-react";
import { toast } from "react-hot-toast";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

interface GalleryImage {
  id: number;
  image_url: string;
  title: string | null;
  description: string | null;
  order_index: number;
  created_at: string;
}

interface GalleryBoxProps {
  linkId: number;
  onGalleryChange?: () => void;
}

interface PendingImage {
  file: File;
  previewUrl: string;
  title: string;
  description: string;
}

const MAX_IMAGES = 4;
const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export function GalleryBox({ linkId, onGalleryChange }: GalleryBoxProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [pendingImage, setPendingImage] = useState<PendingImage | null>(null);
  const [newImageTitle, setNewImageTitle] = useState("");
  const [newImageDesc, setNewImageDesc] = useState("");

  const fetchGallery = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/client/customer-link/gallery?linkId=${linkId}`);
      const data = await res.json();
      if (data.success) {
        setImages(data.images || []);
      }
    } catch (error) {
      console.error("Error fetching gallery:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (linkId) {
      fetchGallery();
    }
  }, [linkId]);

  useEffect(() => {
    if (!isModalOpen) {
      if (pendingImage?.previewUrl) {
        URL.revokeObjectURL(pendingImage.previewUrl);
      }
      setPendingImage(null);
      setNewImageTitle("");
      setNewImageDesc("");
    }
  }, [isModalOpen]);

  const checkCompletion = () => {
    const count = images.length;
    return {
      isComplete: count > 0,
      count,
      isFull: count >= MAX_IMAGES,
      remainingSlots: MAX_IMAGES - count,
    };
  };

  const { isComplete, count, isFull, remainingSlots } = checkCompletion();

  const handleFileSelect = (file: File) => {
    if (images.length >= MAX_IMAGES) {
      toast.error(`حداکثر می‌توانید ${MAX_IMAGES} تصویر اضافه کنید`);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error(`حجم فایل نباید بیشتر از ${MAX_FILE_SIZE_MB} مگابایت باشد`);
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("لطفاً فایل تصویری انتخاب کنید");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    
    setPendingImage({
      file,
      previewUrl,
      title: newImageTitle,
      description: newImageDesc,
    });
  };

  const handleAddImage = async () => {
    if (!pendingImage) {
      toast.error("لطفاً ابتدا یک تصویر انتخاب کنید");
      return;
    }

    if (images.length >= MAX_IMAGES) {
      toast.error(`حداکثر می‌توانید ${MAX_IMAGES} تصویر اضافه کنید`);
      setIsModalOpen(false);
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("image", pendingImage.file);
    formData.append("title", pendingImage.title);
    formData.append("description", pendingImage.description);

    try {
      const res = await fetch("/api/client/customer-link/gallery", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        toast.success("تصویر با موفقیت به گالری اضافه شد");
        setIsModalOpen(false);
        fetchGallery();
        onGalleryChange?.();
      } else {
        toast.error(data.message || "خطا در آپلود تصویر");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteImage = async (imageId: number, imageUrl: string) => {
    if (!confirm("آیا از حذف این تصویر اطمینان دارید؟")) return;

    try {
      const res = await fetch(`/api/client/customer-link/gallery?id=${imageId}&url=${encodeURIComponent(imageUrl)}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        toast.success("تصویر با موفقیت حذف شد");
        fetchGallery();
        onGalleryChange?.();
      } else {
        toast.error(data.message || "خطا در حذف تصویر");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("خطا در ارتباط با سرور");
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedImages = items.map((item, index) => ({
      ...item,
      order_index: index,
    }));

    setImages(updatedImages);

    try {
      const res = await fetch("/api/client/customer-link/gallery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: updatedImages.map(img => ({
            id: img.id,
            order_index: img.order_index,
            title: img.title,
            description: img.description,
          })),
        }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error("خطا در ذخیره ترتیب");
        fetchGallery();
      }
    } catch (error) {
      console.error("Error updating order:", error);
      fetchGallery();
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#1a1e26] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white">گالری تصاویر</h3>
          </div>
        </div>
        <div className="p-5 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-[#1a1e26] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white">
              گالری تصاویر
            </h3>
            <span className="text-xs text-slate-500">
              ({count}/{MAX_IMAGES})
            </span>
          </div>
          
          {isComplete ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 rounded-full">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                {count} تصویر
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-500/10 rounded-full">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                {remainingSlots} ظرفیت
              </span>
            </div>
          )}
        </div>

        <div className="p-5">
          {!isFull && !isComplete && (
            <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl p-3 mb-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  می‌توانید تا {remainingSlots} تصویر دیگر اضافه کنید
                </p>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-300 mt-1 mr-6">
                حداکثر حجم هر تصویر {MAX_FILE_SIZE_MB} مگابایت
              </p>
            </div>
          )}

          {isFull && (
            <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-3 mb-4">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  ظرفیت گالری شما تکمیل شده است ({MAX_IMAGES}/{MAX_IMAGES})
                </p>
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-300 mt-1 mr-6">
                برای افزودن تصویر جدید، ابتدا یکی از تصاویر موجود را حذف کنید
              </p>
            </div>
          )}

          {images.length > 0 && (
            <div className="mb-4">
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="gallery">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                    >
                      {images.map((image, index) => (
                        <Draggable key={image.id} draggableId={image.id.toString()} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="relative group"
                            >
                              <div className="rounded-xl overflow-hidden aspect-square bg-slate-100 dark:bg-white/5">
                                <img
                                  src={image.image_url}
                                  alt={image.title || "گالری"}
                                  className="w-full h-full object-cover cursor-pointer"
                                  onClick={() => setPreviewImage(image.image_url)}
                                />
                              </div>
                              {/* دکمه‌ها - همیشه در موبایل نمایش داده می‌شوند */}
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                                <button
                                  onClick={() => setPreviewImage(image.image_url)}
                                  className="p-2 md:p-1.5 bg-white/20 rounded-lg hover:bg-white/30 active:bg-white/40"
                                >
                                  <ZoomIn className="w-5 h-5 md:w-4 md:h-4 text-white" />
                                </button>
                                <button
                                  onClick={() => handleDeleteImage(image.id, image.image_url)}
                                  className="p-2 md:p-1.5 bg-red-500/80 rounded-lg hover:bg-red-600 active:bg-red-700"
                                >
                                  <Trash2 className="w-5 h-5 md:w-4 md:h-4 text-white" />
                                </button>
                              </div>
                              {/* دکمه جابجایی */}
                              <div
                                {...provided.dragHandleProps}
                                className="absolute top-2 left-2 p-1.5 md:p-1 bg-black/50 rounded-lg cursor-grab active:cursor-grabbing"
                              >
                                <GripVertical className="w-4 h-4 md:w-3 md:h-3 text-white" />
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
              <p className="text-xs text-slate-400 text-center mt-3">
                برای تغییر ترتیب، تصاویر را بکشید و جابه‌جا کنید
              </p>
            </div>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            disabled={isFull}
            className={`w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              isFull
                ? "bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-gray-500 cursor-not-allowed border border-slate-200 dark:border-white/10"
                : "border border-dashed border-slate-300 dark:border-white/20 text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5 active:bg-slate-100 dark:active:bg-white/10"
            }`}
          >
            <Plus className="w-4 h-4" />
            {images.length > 0 ? "افزودن تصویر جدید" : "افزودن تصویر به گالری"}
          </button>
        </div>
      </div>

      {/* مودال افزودن تصویر */}
      {isModalOpen && !isFull && (
        <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#1a1e26] rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-white">
                افزودن تصویر جدید
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 active:bg-slate-200"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="bg-blue-50 dark:bg-blue-500/10 rounded-lg p-2 text-center">
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  حداکثر حجم مجاز: {MAX_FILE_SIZE_MB} مگابایت
                </p>
              </div>

              {pendingImage?.previewUrl ? (
                <div className="relative">
                  <div className="rounded-xl overflow-hidden bg-slate-100 dark:bg-white/5">
                    <img
                      src={pendingImage.previewUrl}
                      alt="پیش‌نمایش"
                      className="w-full h-40 object-cover"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (pendingImage.previewUrl) {
                        URL.revokeObjectURL(pendingImage.previewUrl);
                      }
                      setPendingImage(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500 rounded-full hover:bg-red-600 active:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                    تصویر <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-slate-50 dark:bg-white/5 hover:border-purple-500 transition-colors flex flex-col items-center justify-center gap-2 active:bg-slate-100"
                  >
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      کلیک کنید برای انتخاب تصویر
                    </span>
                    <span className="text-xs text-gray-400">
                      JPEG, PNG, WEBP - حداکثر {MAX_FILE_SIZE_MB} مگابایت
                    </span>
                  </button>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
                  عنوان <span className="text-slate-400 text-xs">(اختیاری)</span>
                </label>
                <input
                  type="text"
                  value={pendingImage?.title || newImageTitle}
                  onChange={(e) => {
                    if (pendingImage) {
                      setPendingImage({ ...pendingImage, title: e.target.value });
                    } else {
                      setNewImageTitle(e.target.value);
                    }
                  }}
                  placeholder="مثال: سالن آرایشگاه"
                  className="w-full p-3 border dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-white/5 focus:border-purple-500 outline-none dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
                  توضیحات <span className="text-slate-400 text-xs">(اختیاری)</span>
                </label>
                <textarea
                  value={pendingImage?.description || newImageDesc}
                  onChange={(e) => {
                    if (pendingImage) {
                      setPendingImage({ ...pendingImage, description: e.target.value });
                    } else {
                      setNewImageDesc(e.target.value);
                    }
                  }}
                  placeholder="توضیحات بیشتر درباره تصویر..."
                  rows={2}
                  className="w-full p-3 border dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-white/5 focus:border-purple-500 outline-none resize-none dark:text-white"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-white/10 flex gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2.5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium active:bg-slate-50"
              >
                انصراف
              </button>
              <button
                onClick={handleAddImage}
                disabled={isSubmitting || !pendingImage}
                className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:bg-purple-800"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                افزودن تصویر
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال پیش‌نمایش تصویر */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[1000] bg-black/90 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={previewImage}
              alt="پیش‌نمایش"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 bg-black/50 rounded-full hover:bg-black/70 active:bg-black/80"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}