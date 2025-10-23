import ConvexClientProvider from "@/components/ConvexClientProvider";

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ConvexClientProvider>{children}</ConvexClientProvider>;
}
