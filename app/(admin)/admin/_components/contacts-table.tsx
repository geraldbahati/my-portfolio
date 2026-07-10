"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import StatusFilterButtons from "./status-filter-buttons";

type StatusFilter = "all" | "pending" | "sent" | "delivered" | "failed";

export default function ContactsTable() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const allSubmissions = useQuery(api.contactForm.getContactSubmissions, {});

  const isLoading = allSubmissions === undefined;

  // Filter submissions client-side based on status filter
  const submissions =
    allSubmissions && statusFilter !== "all"
      ? allSubmissions.filter((s) => s.status === statusFilter)
      : (allSubmissions ?? []);

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString();
  };

  const getStatusVariant = (
    status: "pending" | "sent" | "delivered" | "failed",
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "pending":
        return "outline";
      case "sent":
        return "secondary";
      case "delivered":
        return "default";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Filter */}
      <Card>
        <CardContent className="pt-6">
          <StatusFilterButtons
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card>
        {isLoading ? (
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-40" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-full max-w-md" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-36" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        ) : submissions.length === 0 ? (
          <CardContent className="py-8 text-center text-muted-foreground">
            {statusFilter === "all"
              ? "No submissions found"
              : `No ${statusFilter} submissions found`}
          </CardContent>
        ) : (
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission._id}>
                      <TableCell className="font-medium">
                        {submission.name}
                      </TableCell>
                      <TableCell>
                        <a
                          href={`mailto:${submission.email}`}
                          className="text-primary hover:underline"
                        >
                          {submission.email}
                        </a>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <div className="line-clamp-2">{submission.message}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(submission.status)}>
                          {submission.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(submission.submittedAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
