import { FaqItem } from "@/components/faq-accordion";

export const FAQ_DATA: FaqItem[] = [
  {
    question: "HOW DOES WORKING WITH YOU LOOK LIKE?",
    answer: (
      <div className="space-y-3 text-foreground-muted">
        <ul className="space-y-3">
          <li className="flex items-start">
            <span className="text-primary mr-3 mt-1">•</span>
            <div>
              <strong className="text-white">
                Understanding the Problem:
              </strong>
              <span className="block mt-1">
                I start by understanding the business context, user needs, and
                technical constraints before writing any code.
              </span>
            </div>
          </li>
          <li className="flex items-start">
            <span className="text-primary mr-3 mt-1">•</span>
            <div>
              <strong className="text-white">
                Architecture & Planning:
              </strong>
              <span className="block mt-1">
                I design the system upfront — data models, API contracts, caching
                layers — so the team has a clear technical direction.
              </span>
            </div>
          </li>
          <li className="flex items-start">
            <span className="text-primary mr-3 mt-1">•</span>
            <div>
              <strong className="text-white">Iterative Delivery:</strong>
              <span className="block mt-1">
                I ship in small, testable increments with regular code reviews
                and feedback loops.
              </span>
            </div>
          </li>
          <li className="flex items-start">
            <span className="text-primary mr-3 mt-1">•</span>
            <div>
              <strong className="text-white">
                Ownership & Follow-through:
              </strong>
              <span className="block mt-1">
                I take features from spec to production and stick around for
                monitoring, performance tuning, and iteration.
              </span>
            </div>
          </li>
        </ul>
      </div>
    ),
  },
  {
    question: "WHY SHOULD COMPANIES HIRE YOU?",
    answer:
      "I bring a product-first engineering mindset with production experience across e-commerce, real-time systems, and AI integrations. I don't just write code — I build scalable systems that solve business problems. From edge-first e-commerce platforms with multi-layer caching to M-Pesa payment integrations, I deliver software that drives measurable outcomes.",
  },
  {
    question: "WHAT IS YOUR TECH STACK?",
    answer:
      "I specialize in TypeScript/React/Next.js for frontend, with backend expertise in Node.js, Spring Boot, Go, and Django. I architect real-time systems using WebSockets and Redis Pub/Sub, and leverage Cloud infrastructure (AWS, Cloudflare) with modern databases (PostgreSQL, MongoDB, Convex). I also integrate AI/LLM capabilities for intelligent product features.",
  },
  {
    question: "WHAT TYPES OF PROJECTS HAVE YOU DELIVERED?",
    answer:
      "I've shipped production e-commerce platforms with Stripe and M-Pesa payments, fintech applications with secure transaction handling, AI-native collaboration platforms with Generative UI, distributed real-time chat systems supporting 10,000+ concurrent connections with sub-50ms latency, and digital transformation solutions for electoral processes serving 500+ users.",
  },
  {
    question: "ARE YOU OPEN TO REMOTE OR HYBRID ROLES?",
    answer:
      "Yes. I'm based in Nairobi, Kenya, and I'm open to fully remote positions or hybrid arrangements. I've worked effectively across time zones and async workflows, and I'm comfortable with tools like Slack, Linear, GitHub, and Notion for team collaboration.",
  },
];
