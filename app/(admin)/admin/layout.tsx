import Link from "next/link";
import { redirect } from "next/navigation";
import { isAllowedAdminEmail } from "@/convex/adminAllowlist";
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

/**
 * `@clerk/nextjs/server` throws `Missing publishableKey` on module
 * initialisation rather than on first use. As a static import it landed in a
 * shared server chunk, so a Clerk misconfiguration 500'd the entire public site
 * — homepage, project pages, even /robots.txt. Deferring it to a call means the
 * module only initialises when the dashboard is actually enabled and rendering,
 * so the public site stays independent of Clerk configuration.
 *
 * Kept in a plain function rather than inline in the layout because React
 * Compiler cannot lower `import()` inside a component body — see
 * `react-hooks/todo`, "(BuildHIR::lowerExpression) Handle Import expressions".
 * Calling out to a non-component keeps the same laziness and compiles.
 */
function loadClerkServer() {
  return import("@clerk/nextjs/server");
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

  // Closed unless explicitly opened, matching the same gate in proxy.ts. Both
  // must agree: the proxy decides whether Clerk runs at all, this decides
  // whether the dashboard renders.
  if (process.env.NEXT_PUBLIC_ENABLE_ADMIN !== "true") {
    redirect("/");
  }

  // Loaded deliberately *after* the gate above, so a Clerk misconfiguration
  // cannot take down the public site. See `loadClerkServer`.
  const { auth, clerkClient } = await loadClerkServer();

  const [{ userId }, client] = await Promise.all([
    auth.protect(),
    clerkClient(),
  ]);
  const user = await client.users.getUser(userId);

  // Must be one of the allowlisted accounts AND carry the admin role. The same
  // allowlist guards every Convex admin function, so a signed-in non-admin
  // could not mutate anything even if this check were bypassed — but stopping
  // them here avoids rendering a dashboard where every action fails.
  const email =
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses[0]?.emailAddress;

  if (!isAllowedAdminEmail(email) || user.publicMetadata.role !== "admin") {
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
