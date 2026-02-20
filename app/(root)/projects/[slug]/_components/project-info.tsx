import { Doc } from "@/convex/_generated/dataModel";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function TagList({ items }: { items: string[] | undefined }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium 
                     bg-primary/10 text-primary border border-primary/20
                     hover:bg-primary/15 hover:border-primary/30 
                     transition-all duration-200 cursor-default"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

interface ProjectInfoProps {
  details: Doc<"projectDetails"> | null;
}

export function ProjectInfo({ details }: ProjectInfoProps) {
  if (!details) {
    return null;
  }

  const headline = details.tagline;

  const description = details.fullDescription;

  const simpleMetadata = [
    { label: "Customer:", value: details.client },
    { label: "Period:", value: details.period },
  ];

  const colors = details.colorPalette;

  return (
    <section className="py-20 md:py-24 bg-background relative z-20 max-w-6xl mx-auto px-4 md:px-6">
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

            {/* Simple Metadata (Customer, Period) */}
            <div className="pt-8 space-y-4">
              {simpleMetadata.map((item) => (
                <div key={item.label} className="flex gap-2 items-baseline">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-foreground shrink-0">
                    {item.label}
                  </h3>
                  <span className="text-xs font-medium text-foreground uppercase tracking-wider">
                    {item.value}
                  </span>
                </div>
              ))}

              {/* Performance (Services) */}
              {details.services && details.services.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
                    Performance:
                  </h3>
                  <TagList items={details.services} />
                </div>
              )}

              {/* Features */}
              {details.features && details.features.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
                    Features:
                  </h3>
                  <TagList items={details.features} />
                </div>
              )}
            </div>
          </div>

          {/* Color Palette (Right) - Staggered animations using CSS custom properties */}
          <div className="lg:col-span-4 lg:col-start-9 space-y-4">
            {colors &&
              colors.map((color, i) => (
                <div
                  key={color.hex}
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
