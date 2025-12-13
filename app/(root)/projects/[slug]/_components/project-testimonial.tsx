import { Doc } from "@/convex/_generated/dataModel";

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

  return (
    <section className="bg-background">
      <div className="container py-24 md:py-32">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 items-start">
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

            <div className="space-y-8">
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
