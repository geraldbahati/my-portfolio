/**
 * Sample project data for the projects page.
 *
 * NOTE: Using placeholder videos from publicly available sources.
 * Replace these URLs with your actual project videos/assets.
 *
 * For best performance, convert gifs to mp4 using:
 * ffmpeg -i input.gif -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" output.mp4
 */

export interface Project {
  id: string;
  title: string;
  description?: string;
  src: string; // video/gif url (prefer mp4 for performance)
  type: "video" | "gif";
  poster?: string;
  alt?: string;
  badges?: {
    text: string;
    position?: "bottom-left" | "bottom-right";
  }[];
  aspectRatio?: string | number;
}

export const projects: Project[] = [
  {
    id: "design-concept-fund-provider",
    title: "Design concept fund provider",
    description: "Interactive design showcase for a fund provider platform",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    type: "video",
    poster: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
    alt: "Design concept for fund provider showing interactive UI",
    badges: [
      { text: "interactive design", position: "bottom-left" }
    ],
    aspectRatio: "16/9"
  },
  {
    id: "ev-rent-gmbh",
    title: "EV Rent GmbH",
    description: "Lead campaign for electric vehicle rental service",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    type: "video",
    poster: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&h=600&fit=crop",
    alt: "EV Rent GmbH campaign featuring red electric vehicle",
    badges: [
      { text: "marketing", position: "bottom-left" },
      { text: "Lead campaign", position: "bottom-left" }
    ],
    aspectRatio: "4/3"
  },
  {
    id: "landgraf-institute",
    title: "Landgraf Institute",
    description: "Digital platform for educational institute",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    type: "video",
    poster: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop",
    alt: "Landgraf Institute mobile interface design",
    badges: [
      { text: "web development", position: "bottom-left" },
      { text: "UX design", position: "bottom-left" }
    ],
    aspectRatio: "3/4"
  },
  {
    id: "ruff-construction",
    title: "Ruff Construction Company Ltd.",
    description: "Corporate website for construction company",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    type: "video",
    poster: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop",
    alt: "Ruff Construction Company website showcase",
    badges: [
      { text: "web design", position: "bottom-left" },
      { text: "18+", position: "bottom-right" }
    ],
    aspectRatio: "1/1"
  },
  {
    id: "tech-startup-platform",
    title: "Tech Startup Platform",
    description: "SaaS platform for startup management",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    type: "video",
    poster: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
    alt: "Tech startup platform dashboard",
    badges: [
      { text: "full-stack", position: "bottom-left" },
      { text: "React", position: "bottom-left" }
    ],
    aspectRatio: "21/9"
  },
  {
    id: "ecommerce-redesign",
    title: "E-Commerce Redesign",
    description: "Modern redesign of online shopping experience",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    type: "video",
    poster: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop",
    alt: "E-commerce platform redesign",
    badges: [
      { text: "UI/UX", position: "bottom-left" },
      { text: "conversion optimization", position: "bottom-left" }
    ],
    aspectRatio: "9/16"
  }
];