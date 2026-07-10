"use client";

import { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
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
import FaqFormDialog from "./faq-form-dialog";

export default function FaqsTable() {
  const faqs = useQuery(api.adminFaqs.getAllFaqsQuery);
  const deleteFaqAction = useAction(api.adminFaqs.deleteFaq);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<any | undefined>(undefined);

  const isLoading = faqs === undefined;

  const handleCreate = () => {
    setEditingFaq(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (faqId: Id<"faqs">) => {
    const faq = faqs?.find((f) => f._id === faqId);
    if (faq) {
      setEditingFaq(faq);
      setIsDialogOpen(true);
    }
  };

  const handleDelete = async (faqId: Id<"faqs">) => {
    if (confirm("Are you sure you want to delete this FAQ?")) {
      try {
        await deleteFaqAction({ faqId });
      } catch (error) {
        console.error("Failed to delete FAQ:", error);
        alert("Failed to delete FAQ");
      }
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingFaq(undefined);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">FAQs Management</h2>
          <p className="text-muted-foreground">
            Create, edit, and manage frequently asked questions
          </p>
        </div>
        <Button onClick={handleCreate}>+ New FAQ</Button>
      </div>

      {/* Form Dialog */}
      <FaqFormDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        onSuccess={handleDialogClose}
        editingFaq={editingFaq}
        nextOrder={faqs?.length ?? 0}
      />

      {/* FAQs Table */}
      <Card>
        {isLoading ? (
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Question</TableHead>
                    <TableHead>Answer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(3)].map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-4 w-8" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-64" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-full max-w-lg" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Skeleton className="h-8 w-14" />
                          <Skeleton className="h-8 w-16" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        ) : faqs.length === 0 ? (
          <CardContent className="py-8 text-center text-muted-foreground">
            No FAQs yet. Create your first FAQ!
          </CardContent>
        ) : (
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Question</TableHead>
                    <TableHead>Answer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {faqs.map((faq) => (
                    <TableRow key={faq._id}>
                      <TableCell>{faq.order}</TableCell>
                      <TableCell className="font-medium max-w-md">
                        {faq.question}
                      </TableCell>
                      <TableCell className="max-w-lg">
                        <div className="line-clamp-2">{faq.answer}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={faq.isPublished ? "default" : "outline"}>
                          {faq.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEdit(faq._id)}
                            variant="ghost"
                            size="sm"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDelete(faq._id)}
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                          >
                            Delete
                          </Button>
                        </div>
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
