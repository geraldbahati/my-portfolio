import { FaqItem } from "@/components/faq-accordion";

export const FAQ_DATA: FaqItem[] = [
  {
    question: "HOW DOES THE COLLABORATION WITH YOU WORK?",
    answer: (
      <div className="space-y-3 text-foreground-muted">
        <ul className="space-y-3">
          <li className="flex items-start">
            <span className="text-primary mr-3 mt-1">•</span>
            <div>
              <strong className="text-white">Enquiries & Contact:</strong>
              <span className="block mt-1">
                By phone, contact form or WhatsApp – with specific ideas or to
                arrange an appointment for a consultation
              </span>
            </div>
          </li>
          <li className="flex items-start">
            <span className="text-primary mr-3 mt-1">•</span>
            <div>
              <strong className="text-white">Personal meeting:</strong>
              <span className="block mt-1">
                Discussion of ideas, goals and review of the collaboration
              </span>
            </div>
          </li>
          <li className="flex items-start">
            <span className="text-primary mr-3 mt-1">•</span>
            <div>
              <strong className="text-white">Discovery & Architecture:</strong>
              <span className="block mt-1">
                Deep dive into technical requirements, system design, and
                product goals.
              </span>
            </div>
          </li>
          <li className="flex items-start">
            <span className="text-primary mr-3 mt-1">•</span>
            <div>
              <strong className="text-white">Agile Development:</strong>
              <span className="block mt-1">
                Iterative sprint-based development with regular updates and
                feedback loops.
              </span>
            </div>
          </li>
          <li className="flex items-start">
            <span className="text-primary mr-3 mt-1">•</span>
            <div>
              <strong className="text-white">Concept & Design:</strong>
              <span className="block mt-1">
                Determination of the appropriate strategy and selection of
                suitable instruments
              </span>
            </div>
          </li>
          <li className="flex items-start">
            <span className="text-primary mr-3 mt-1">•</span>
            <div>
              <strong className="text-white">
                Implementation, maintenance and reporting
              </strong>
            </div>
          </li>
        </ul>
      </div>
    ),
  },
  {
    question: "WHY SHOULD COMPANIES HIRE YOU?",
    answer:
      "I bring a product-first engineering mindset with 4+ years of production experience. I don't just write code; I build scalable systems that solve business problems. From e-commerce platforms with 40% engagement growth to fintech solutions with secure payment integrations (Stripe, M-Pesa), I deliver software that drives measurable outcomes.",
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
    question: "DO YOU ALSO OFFER INDIVIDUAL SERVICES?",
    answer:
      "Yes, we offer flexible service options tailored to your needs. Whether you need a complete solution or specific services like branding, web design, or digital marketing, we can customize our offerings to match your requirements and budget.",
  },
  {
    question: "HOW MUCH DOES A WEBSITE COST?",
    answer:
      "Website costs vary based on complexity, features, and scope. A basic website starts from $5,000, while more complex e-commerce or custom solutions can range from $15,000 to $50,000+. We provide detailed quotes after understanding your specific requirements.",
  },
  {
    question: "DO YOU ALSO OFFER WEBSITE MAINTENANCE AND SUPPORT AFTER LAUNCH?",
    answer:
      "Absolutely. We offer comprehensive maintenance packages that include regular updates, security monitoring, performance optimization, and ongoing support. Our team ensures your website remains secure, fast, and up-to-date with the latest standards.",
  },
  {
    question: "CAN I MANAGE AND UPDATE MY WEBSITE MYSELF LATER?",
    answer:
      "Yes, we build websites with user-friendly content management systems that allow you to easily update content, add new pages, and manage your site independently. We also provide training and documentation to ensure you're comfortable managing your website.",
  },
];
