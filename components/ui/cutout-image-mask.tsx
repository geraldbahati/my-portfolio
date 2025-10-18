"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";

interface CutoutMaskImageProps {
  imageUrl?: string;
  className?: string;
  clickToChangeImage?: boolean;
  imageArray?: string[];
  maxWidth?: number;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  alt?: string;
}

export const CutoutMaskImage: React.FC<CutoutMaskImageProps> = ({
  imageUrl = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop",
  className = "",
  clickToChangeImage = true,
  imageArray = [
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop",
  ],
  maxWidth = 316,
  alt = "Masked image",
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const currentImage = useMemo(
    () => (clickToChangeImage ? imageArray[currentImageIndex] : imageUrl),
    [clickToChangeImage, imageArray, currentImageIndex, imageUrl],
  );

  const handleClick = () => {
    if (clickToChangeImage && imageArray.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageArray.length);
    }
  };

  // SVG mask as data URL for CSS
  const maskSvg = useMemo(() => {
    const svg = `<svg viewBox="0 0 316 424" xmlns="http://www.w3.org/2000/svg">
      <path d="M108 48C108 21.4903 129.49 0 156 0H160C186.51 0 208 21.4903 208 48V52C208 78.5097 186.51 100 160 100H108V48Z" />
      <path d="M216 324H268C294.51 324 316 345.49 316 372V376C316 402.51 294.51 424 268 424H264C237.49 424 216 402.51 216 376V324Z" />
      <path d="M108 372C108 345.49 129.49 324 156 324H208V376C208 402.51 186.51 424 160 424H108V372Z" />
      <path d="M0 372C0 345.49 21.4903 324 48 324H100V376C100 402.51 78.5097 424 52 424H48C21.4903 424 0 402.51 0 376V372Z" />
      <path d="M108 216H268C294.51 216 316 237.49 316 264V268C316 294.51 294.51 316 268 316H156C129.49 316 108 294.51 108 268V216Z" />
      <path d="M0 156C0 129.49 21.4903 108 48 108H52C78.5097 108 100 129.49 100 156V316H48C21.4903 316 0 294.51 0 268V156Z" />
      <path d="M0 48C0 21.4903 21.4903 0 48 0H52C78.5097 0 100 21.4903 100 48V100H48C21.4903 100 0 78.5097 0 52V48Z" />
      <path d="M108 108H160C186.51 108 208 129.49 208 156V208H156C129.49 208 108 186.51 108 160V108Z" />
      <path d="M216 48C216 21.4903 237.49 0 264 0H268C294.51 0 316 21.4903 316 48V160C316 186.51 294.51 208 268 208H216V48Z" />
    </svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }, []);

  return (
    <div
      className={`relative w-full ${className}`}
      style={{ maxWidth: `${maxWidth}px` }}
    >
      <div
        className="relative"
        style={{
          filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.2))",
          cursor: clickToChangeImage ? "pointer" : "default",
          aspectRatio: "316 / 424",
        }}
        onClick={handleClick}
        role={clickToChangeImage ? "button" : "img"}
        tabIndex={clickToChangeImage ? 0 : -1}
        onKeyDown={(e) => {
          if (clickToChangeImage && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            handleClick();
          }
        }}
        aria-label={clickToChangeImage ? "Click to change image" : alt}
      >
        <div
          className="relative w-full h-full"
          style={{
            WebkitMaskImage: `url("${maskSvg}")`,
            maskImage: `url("${maskSvg}")`,
            WebkitMaskSize: "contain",
            maskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
          }}
        >
          <Image
            src={currentImage}
            alt={alt}
            fill
            sizes={`(max-width: ${maxWidth}px) 100vw, ${maxWidth}px`}
            className="object-cover transition-opacity duration-300"
            priority
          />
        </div>

        {/* Image counter indicator */}
        {clickToChangeImage && imageArray.length > 1 && (
          <div
            className="absolute bottom-4 right-4 flex gap-1"
            aria-hidden="true"
          >
            {imageArray.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 shadow-sm ${
                  index === currentImageIndex
                    ? "bg-white opacity-100 w-6"
                    : "bg-white opacity-50 w-2"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Screen reader only text for image changes */}
      {clickToChangeImage && (
        <span className="sr-only" aria-live="polite">
          Image {currentImageIndex + 1} of {imageArray.length}
        </span>
      )}
    </div>
  );
};
