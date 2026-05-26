// src/app/c/[slug]/components/shared/Gallery.tsx
"use client";

import { useState } from "react";
import { ImageIcon, X, ZoomIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GalleryImage } from "./types";
import Image from "next/image";

interface GalleryProps {
  images: GalleryImage[];
}

export function Gallery({ images }: GalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
            <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <h3 className="text-white font-bold text-base">گالری تصاویر</h3>
       
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {images.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="relative group cursor-pointer"
              onClick={() => setSelectedImage(image.image_url)}
            >
              <div className="rounded-xl overflow-hidden aspect-square bg-gray-800/50">
                <Image
                  width={100}
              height={100}
                  src={image.image_url}
                  alt={image.title || "گالری"}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              
              {/* عنوان تصویر (اختیاری) */}
              {image.title && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 rounded-b-xl">
                  <p className="text-white text-xs truncate">{image.title}</p>
                </div>
              )}
              
              {/* توضیحات تصویر (اختیاری) - در hover نمایش داده می‌شود */}
              {image.description && (
                <div className="absolute top-0 left-0 right-0 bg-black/60 p-1 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-[10px] text-center truncate">{image.description}</p>
                </div>
              )}
              
              {/* آیکون زوم */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                <ZoomIn className="w-6 h-6 text-white" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* مودال بزرگنمایی */}
      <AnimatePresence>
        {selectedImage && (
          <div
            className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-4xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage}
                alt="گالری"
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}