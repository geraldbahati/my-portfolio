import { Doc } from "@/convex/_generated/dataModel";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ProjectChallengesProps {
  challenges: Doc<"projectChallenges">[];
}

export function ProjectChallenges({ challenges }: ProjectChallengesProps) {
  if (challenges.length === 0) {
    return null;
  }

  return (
    <section className="py-24 bg-background">
      <div className="container max-w-4xl mx-auto">
        {/* SVG Line Separator */}
        <div className="mb-12 opacity-40">
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

        {challenges.map((challenge, idx) => (
          <div
            key={idx}
            className="animate-in fade-in slide-in-from-bottom-6 duration-700 mb-12 last:mb-0"
          >
            <h2 className="text-2xl md:text-3xl lg:text-3xl font-medium tracking-tight mb-8 text-foreground">
              {challenge.title}
            </h2>

            <div className="prose prose-base dark:prose-invert max-w-none text-muted-foreground leading-relaxed font-light prose-headings:text-foreground prose-headings:font-medium prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-ul:text-muted-foreground prose-ol:text-muted-foreground prose-li:marker:text-muted-foreground">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {challenge.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
