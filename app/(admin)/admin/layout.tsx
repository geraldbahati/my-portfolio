import Link from "next/link";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ReactNode, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { AdminAppSidebar } from "./_components/admin-app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AdminProviders } from "./_components/admin-providers";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <Suspense fallback={null}>
      <DynamicAdminLayout>{children}</DynamicAdminLayout>
    </Suspense>
  );
}

async function DynamicAdminLayout({ children }: AdminLayoutProps) {
  await connection();

  if (process.env.NODE_ENV === "production") {
    redirect("/");
  }

  const { userId } = await auth.protect();
  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  if (user.publicMetadata.role !== "admin") {
    redirect("/");
  }

  return (
    <AdminProviders>
      <SidebarProvider>
        <AdminAppSidebar />
        <SidebarInset>
          {/* Header */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex flex-1 items-center justify-between gap-2 px-4">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-semibold">Admin Dashboard</h1>
                </div>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/">
                  <ArrowLeftIcon className="size-4" />
                  <span className="hidden sm:inline">Back to Site</span>
                </Link>
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex flex-1 flex-col gap-4 p-4 md:p-8">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AdminProviders>
  );
}
