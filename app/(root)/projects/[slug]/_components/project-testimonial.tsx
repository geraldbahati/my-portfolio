import { Doc } from "@/convex/_generated/dataModel";
import Image from "next/image";

interface ProjectTestimonialProps {
  testimonial: Doc<"projectTestimonials"> | null;
}

export function ProjectTestimonial({ testimonial }: ProjectTestimonialProps) {
  // Don't render if no testimonial data
  if (!testimonial) {
    return null;
  }

  const quote = testimonial.quote;
  const author = testimonial.authorName;
  const role = testimonial.authorRole;
  const company = testimonial.authorCompany;
  const authorImage = testimonial.authorImage;

  return (
    <section className="bg-background">
      <div className="container py-24 md:py-32 mx-auto">
        <div className="px-4 md:px-8">
          {/* Conditional layout based on whether author image exists */}
          {authorImage ? (
            // Two-column layout when image is provided
            <div className="flex flex-col md:flex-row gap-12 items-center">
              {/* Author Image */}
              <div className="shrink-0 animate-in fade-in zoom-in-90 duration-500">
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden">
                  <Image
                    src={authorImage}
                    alt={author}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 128px, 160px"
                  />
                </div>
              </div>

              <div className="space-y-6 flex-1">
                {/* Quote Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="text-foreground"
                >
                  <path
                    d="M5.29289 1.29291L6.70711 2.70712L3 6.41423V7.00001H7V14H1V5.5858L5.29289 1.29291Z"
                    fill="currentColor"
                  />
                  <path
                    d="M15 7.00001H11V6.41423L14.7071 2.70712L13.2929 1.29291L9 5.5858V14H15V7.00001Z"
                    fill="currentColor"
                  />
                </svg>

                {/* Testimonial Text */}
                <p className="text-lg md:text-xl md:leading-relaxed font-normal text-foreground animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                  {quote}
                </p>

                {/* Author Details */}
                <div className="space-y-1 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                  <h3 className="text-foreground text-xs font-bold uppercase tracking-widest">
                    {author}
                  </h3>
                  {(role || company) && (
                    <p className="text-muted-foreground text-xs uppercase tracking-wide">
                      {role}
                      {role && company && " · "}
                      {company}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Full-width layout when no image - original design spanning full width
            <div className="flex flex-col md:flex-row gap-8 items-start w-full">
              {/* Quote Icon SVG - Left Aligned */}
              <div className="shrink-0 animate-in fade-in zoom-in-90 duration-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="60"
                  height="60"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="text-foreground"
                >
                  <path
                    d="M5.29289 1.29291L6.70711 2.70712L3 6.41423V7.00001H7V14H1V5.5858L5.29289 1.29291Z"
                    fill="currentColor"
                  />
                  <path
                    d="M15 7.00001H11V6.41423L14.7071 2.70712L13.2929 1.29291L9 5.5858V14H15V7.00001Z"
                    fill="currentColor"
                  />
                </svg>
              </div>

              {/* Text content spans remaining width */}
              <div className="space-y-8 flex-1">
                {/* Testimonial Text */}
                <p className="text-lg md:text-xl md:leading-relaxed font-normal text-foreground animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                  {quote}
                </p>

                {/* Author Details */}
                <div className="space-y-1 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                  <h3 className="text-foreground text-xs font-bold uppercase tracking-widest">
                    {author}
                  </h3>
                  {(role || company) && (
                    <p className="text-muted-foreground text-xs uppercase tracking-wide">
                      {role}
                      {role && company && " · "}
                      {company}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SVG Separator Line */}
          <div className="mt-20 w-full max-w-full overflow-hidden opacity-30 animate-in fade-in duration-1000 delay-400">
            <svg
              className="w-full h-auto"
              viewBox="0 0 1200 5"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line
                x1="0"
                y1="2.5"
                x2="1200"
                y2="2.5"
                stroke="currentColor"
                strokeWidth="0.5"
                strokeLinecap="round"
                strokeDasharray="1200"
                strokeDashoffset="0"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
