/**
 * Seed data for projects
 *
 * This file contains real project data with videos/gifs that can be used to populate
 * the Convex database. Videos are sourced from publicly available demo content.
 */

export const seedProjectsData = [
  {
    id: "ev-rent-gmbh",
    title: "EV Rent GmbH",
    description: "A modern electric vehicle rental platform with real-time availability, booking management, and fleet tracking.",
    src: "https://assets.mixkit.co/videos/preview/mixkit-tesla-model-3-driving-on-highway-4786-large.mp4",
    type: "video" as const,
    poster: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80",
    alt: "Electric vehicle rental platform dashboard",
    badges: [
      { text: "Next.js", position: "bottom-left" as const },
      { text: "TypeScript", position: "bottom-right" as const }
    ],
    aspectRatio: "16/9"
  },
  {
    id: "task-management-app",
    title: "TaskFlow Pro",
    description: "Collaborative task management application with real-time updates, team workspaces, and productivity analytics.",
    src: "https://assets.mixkit.co/videos/preview/mixkit-person-using-laptop-computer-4774-large.mp4",
    type: "video" as const,
    poster: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&q=80",
    alt: "Task management application interface",
    badges: [
      { text: "React", position: "bottom-left" as const },
      { text: "Real-time", position: "bottom-right" as const }
    ],
    aspectRatio: "16/9"
  },
  {
    id: "ecommerce-platform",
    title: "ShopSphere",
    description: "Full-featured e-commerce platform with advanced search, payment integration, and inventory management.",
    src: "https://assets.mixkit.co/videos/preview/mixkit-person-shopping-online-4806-large.mp4",
    type: "video" as const,
    poster: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
    alt: "E-commerce shopping platform",
    badges: [
      { text: "Next.js", position: "bottom-left" as const },
      { text: "Stripe", position: "bottom-right" as const }
    ],
    aspectRatio: "16/9"
  },
  {
    id: "fitness-tracker",
    title: "FitTrack Plus",
    description: "Comprehensive fitness tracking app with workout plans, nutrition logging, and progress analytics.",
    src: "https://assets.mixkit.co/videos/preview/mixkit-athlete-working-out-in-gym-4782-large.mp4",
    type: "video" as const,
    poster: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80",
    alt: "Fitness tracking application",
    badges: [
      { text: "React Native", position: "bottom-left" as const },
      { text: "Mobile", position: "bottom-right" as const }
    ],
    aspectRatio: "9/16"
  },
  {
    id: "ai-chatbot",
    title: "AI Assistant Pro",
    description: "Intelligent chatbot powered by advanced AI models with context-aware responses and multi-language support.",
    src: "https://assets.mixkit.co/videos/preview/mixkit-person-typing-on-laptop-keyboard-4792-large.mp4",
    type: "video" as const,
    poster: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&q=80",
    alt: "AI chatbot interface",
    badges: [
      { text: "OpenAI", position: "bottom-left" as const },
      { text: "Node.js", position: "bottom-right" as const }
    ],
    aspectRatio: "16/9"
  },
  {
    id: "real-estate-platform",
    title: "HomeHub",
    description: "Modern real estate marketplace with virtual tours, mortgage calculators, and property management tools.",
    src: "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-interior-4788-large.mp4",
    type: "video" as const,
    poster: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80",
    alt: "Real estate platform showcase",
    badges: [
      { text: "Vue.js", position: "bottom-left" as const },
      { text: "3D Tours", position: "bottom-right" as const }
    ],
    aspectRatio: "16/9"
  },
  {
    id: "video-streaming",
    title: "StreamVibe",
    description: "Netflix-style video streaming platform with adaptive bitrate, offline downloads, and personalized recommendations.",
    src: "https://assets.mixkit.co/videos/preview/mixkit-watching-videos-on-phone-4798-large.mp4",
    type: "video" as const,
    poster: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&q=80",
    alt: "Video streaming platform",
    badges: [
      { text: "React", position: "bottom-left" as const },
      { text: "HLS", position: "bottom-right" as const }
    ],
    aspectRatio: "16/9"
  },
  {
    id: "social-media-dashboard",
    title: "SocialSync",
    description: "Unified social media management dashboard with scheduling, analytics, and multi-account support.",
    src: "https://assets.mixkit.co/videos/preview/mixkit-social-media-on-phone-4797-large.mp4",
    type: "video" as const,
    poster: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80",
    alt: "Social media management dashboard",
    badges: [
      { text: "Angular", position: "bottom-left" as const },
      { text: "Analytics", position: "bottom-right" as const }
    ],
    aspectRatio: "16/9"
  },
  {
    id: "crypto-wallet",
    title: "CryptoVault",
    description: "Secure cryptocurrency wallet with multi-chain support, DeFi integration, and hardware wallet compatibility.",
    src: "https://assets.mixkit.co/videos/preview/mixkit-bitcoin-and-cryptocurrency-4799-large.mp4",
    type: "video" as const,
    poster: "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=800&q=80",
    alt: "Cryptocurrency wallet application",
    badges: [
      { text: "Web3", position: "bottom-left" as const },
      { text: "Ethereum", position: "bottom-right" as const }
    ],
    aspectRatio: "16/9"
  },
  {
    id: "food-delivery",
    title: "QuickBite",
    description: "On-demand food delivery platform with real-time tracking, restaurant POS integration, and loyalty rewards.",
    src: "https://assets.mixkit.co/videos/preview/mixkit-food-delivery-4804-large.mp4",
    type: "video" as const,
    poster: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&q=80",
    alt: "Food delivery platform",
    badges: [
      { text: "React Native", position: "bottom-left" as const },
      { text: "Maps API", position: "bottom-right" as const }
    ],
    aspectRatio: "9/16"
  },
  {
    id: "project-management",
    title: "ProjectPulse",
    description: "Enterprise project management suite with Gantt charts, resource allocation, and team collaboration tools.",
    src: "https://assets.mixkit.co/videos/preview/mixkit-team-collaboration-4793-large.mp4",
    type: "video" as const,
    poster: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80",
    alt: "Project management software",
    badges: [
      { text: "React", position: "bottom-left" as const },
      { text: "Enterprise", position: "bottom-right" as const }
    ],
    aspectRatio: "16/9"
  },
  {
    id: "weather-app",
    title: "SkyWatch",
    description: "Beautiful weather application with hourly forecasts, severe weather alerts, and interactive radar maps.",
    src: "https://assets.mixkit.co/videos/preview/mixkit-weather-app-on-phone-4800-large.mp4",
    type: "video" as const,
    poster: "https://images.unsplash.com/photo-1592210454359-9043f067919b?w=800&q=80",
    alt: "Weather forecasting application",
    badges: [
      { text: "React Native", position: "bottom-left" as const },
      { text: "Weather API", position: "bottom-right" as const }
    ],
    aspectRatio: "9/16"
  }
];
