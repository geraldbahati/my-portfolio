import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ContactStats from "./_components/contact-stats";
import ContentOverview from "./_components/content-overview";

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">
          Welcome to your portfolio admin dashboard
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Contact Form Statistics
        </h3>
        <ContactStats />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Content Overview
        </h3>
        <ContentOverview />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button asChild>
                <Link href="/admin/contacts">View Contacts</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/admin/projects">Manage Projects</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/faqs">Manage FAQs</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
