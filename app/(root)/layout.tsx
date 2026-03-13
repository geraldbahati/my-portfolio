import dynamic from "next/dynamic";
import { Navbar } from "@/components/navbar";

const Footer = dynamic(
  () => import("@/components/footer").then((m) => ({ default: m.Footer })),
  {
    loading: () => <footer className="bg-black min-h-[200px]" />,
  },
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
