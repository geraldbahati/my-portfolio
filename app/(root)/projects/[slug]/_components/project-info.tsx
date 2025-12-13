import { Doc } from "@/convex/_generated/dataModel";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ProjectInfoProps {
  details: Doc<"projectDetails"> | null;
}

export function ProjectInfo({ details }: ProjectInfoProps) {
  if (!details) {
    return null;
  }

  const headline = details.tagline;

  const description = details.fullDescription;

  const metadata = [
    {
      label: "Perfomance:",
      value: details.services,
    },
    { label: "Customer:", value: details.client },
    { label: "Period:", value: details.period },
    {
      label: "Features:",
      value: details.features,
    },
  ];

  const colors = details.colorPalette;

  return (
    <section className="py-20 md:py-24 bg-background relative z-20 max-w-6xl mx-auto">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
          {/* Main Content (Left) */}
          <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Heading */}
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium leading-tight tracking-tight text-foreground">
              {headline}
            </h2>

            {/* Description */}
            <div className="prose prose-base dark:prose-invert max-w-none text-muted-foreground leading-relaxed font-light prose-headings:text-foreground prose-headings:font-medium prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-ul:text-muted-foreground prose-ol:text-muted-foreground prose-li:marker:text-muted-foreground">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {description}
              </ReactMarkdown>
            </div>

            {/* Metadata List */}
            <div className="pt-8 space-y-4">
              {metadata.map((item, index) => (
                <div key={index} className="flex gap-2 items-baseline">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-foreground shrink-0">
                    {item.label}
                  </h3>
                  <span className="text-xs font-medium text-foreground uppercase tracking-wider">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Color Palette (Right) - Staggered animations using CSS custom properties */}
          <div className="lg:col-span-4 lg:col-start-9 space-y-4">
            {colors &&
              colors.map((color, i) => (
                <div
                  key={i}
                  className="group animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
                  style={{ animationDelay: `${100 + i * 100}ms` }}
                >
                  <div
                    className="w-full h-24 rounded-sm shadow-sm transition-transform duration-300 group-hover:scale-[1.02]"
                    style={{ backgroundColor: color.hex }}
                  />
                  <p className="mt-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {color.name || color.hex}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}
