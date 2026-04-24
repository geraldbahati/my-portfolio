import { Doc } from "@/convex/_generated/dataModel";
import Image from "next/image";
import { ImageWarmupSentinel } from "@/components/ImageWarmupSentinel";

interface ProjectGalleryProps {
  gallery: Doc<"projectGallery">[];
}

export function ProjectGallery({ gallery }: ProjectGalleryProps) {
  if (gallery.length === 0) {
    return null;
  }

  // Separate gallery items by type
  const featureImage = gallery.find((item) => item.galleryType === "feature");
  const stackImages = gallery
    .filter((item) => item.galleryType === "stack")
    .sort((a, b) => a.order - b.order);
  const galleryImages = gallery.map((item) => item.src);

  return (
    <section className="relative bg-muted py-24 ">
      <ImageWarmupSentinel images={galleryImages} limit={2} />
      <div className="container overflow-hidden max-w-6xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Long Scrolling Screenshot */}
          {featureImage && (
            <div className="lg:col-span-6 relative w-full rounded-sm overflow-hidden shadow-sm border border-border/50 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Image
                src={featureImage.src}
                alt={featureImage.alt || "Project feature image"}
                width={featureImage.width}
                height={featureImage.height}
                className="w-full h-auto object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                loading="lazy"
              />
            </div>
          )}

          {/* Right Column: Stack of Mockups */}
          {stackImages.length > 0 && (
            <div className="lg:col-span-6 space-y-8 lg:space-y-12">
              {stackImages.map((item, index) => (
                <div
                  key={item._id}
                  className="relative w-full rounded-sm overflow-hidden shadow-sm group animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Image
                    src={item.src}
                    alt={item.alt || "Project mockup"}
                    width={item.width}
                    height={item.height}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.01]"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
