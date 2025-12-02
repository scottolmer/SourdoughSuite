import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Pencil, Trash2, Check, X } from "lucide-react";

// Define schema for FAQ form
const faqFormSchema = z.object({
  question: z.string().min(5, "Question must be at least 5 characters"),
  answer: z.string().min(10, "Answer must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  displayOrder: z.number().int().min(0, "Display order must be a positive number"),
  isPublished: z.boolean().default(true),
});

type FaqFormValues = z.infer<typeof faqFormSchema>;

// Define the FAQ interface
interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function FAQManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentFaqId, setCurrentFaqId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Setup form with zod validation
  const form = useForm<FaqFormValues>({
    resolver: zodResolver(faqFormSchema),
    defaultValues: {
      question: "",
      answer: "",
      category: "general",
      displayOrder: 0,
      isPublished: true,
    },
  });

  // Fetch all FAQs
  const { 
    data: faqs, 
    isLoading, 
    isError,
    error
  } = useQuery({
    queryKey: ["/api/faqs"],
  });

  // Create FAQ mutation
  const createFaqMutation = useMutation({
    mutationFn: async (data: FaqFormValues) => {
      const response = await apiRequest("POST", "/api/faqs", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create FAQ");
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faqs"] });
      toast({
        title: "FAQ Created",
        description: "The FAQ has been created successfully.",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update FAQ mutation
  const updateFaqMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<FaqFormValues> }) => {
      const response = await apiRequest("PATCH", `/api/faqs/${id}`, data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update FAQ");
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faqs"] });
      toast({
        title: "FAQ Updated",
        description: "The FAQ has been updated successfully.",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete FAQ mutation
  const deleteFaqMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/faqs/${id}`);
      if (!response.ok) {
        throw new Error("Failed to delete FAQ");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faqs"] });
      toast({
        title: "FAQ Deleted",
        description: "The FAQ has been deleted successfully.",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setIsDeleteDialogOpen(false);
    },
  });

  // Handle form submission
  function onSubmit(values: FaqFormValues) {
    if (isEditMode && currentFaqId) {
      updateFaqMutation.mutate({ id: currentFaqId, data: values });
    } else {
      createFaqMutation.mutate(values);
    }
  }

  // Open dialog for creating a new FAQ
  function handleCreateFaq() {
    setIsEditMode(false);
    setCurrentFaqId(null);
    form.reset({
      question: "",
      answer: "",
      category: "general",
      displayOrder: 0,
      isPublished: true,
    });
    setIsDialogOpen(true);
  }

  // Open dialog for editing an existing FAQ
  function handleEditFaq(faq: FAQ) {
    setIsEditMode(true);
    setCurrentFaqId(faq.id);
    form.reset({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      displayOrder: faq.displayOrder,
      isPublished: faq.isPublished,
    });
    setIsDialogOpen(true);
  }

  // Handle delete confirmation
  function handleDeleteFaq(id: number) {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  }

  // Confirm deletion of FAQ
  function confirmDelete() {
    if (deleteId) {
      deleteFaqMutation.mutate(deleteId);
    }
  }

  // Clean up form when dialog is closed
  function handleDialogClose() {
    setIsDialogOpen(false);
    setTimeout(() => {
      form.reset();
      setIsEditMode(false);
      setCurrentFaqId(null);
    }, 300);
  }

  // Function to categorize FAQs
  function getFaqsByCategory() {
    if (!faqs || !Array.isArray(faqs)) return {} as Record<string, FAQ[]>;
    
    return (faqs as FAQ[]).reduce((acc: Record<string, FAQ[]>, faq: FAQ) => {
      const category = faq.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(faq);
      return acc;
    }, {} as Record<string, FAQ[]>);
  }

  const categorizedFaqs = getFaqsByCategory();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif font-medium">FAQ Management</h2>
        <Button onClick={handleCreateFaq} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add New FAQ
        </Button>
      </div>

      {isLoading && (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      )}

      {isError && (
        <div className="bg-red-50 text-red-800 p-4 rounded-md">
          <p className="mb-2 font-medium">Failed to load FAQs. Please try refreshing the page.</p>
          {error instanceof Error && (
            <p className="text-sm text-red-700">
              Error details: {error.message}
            </p>
          )}
          <div className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/faqs"] })}
              className="text-red-700 border-red-300 hover:bg-red-50"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {!isLoading && !isError && Object.keys(categorizedFaqs).length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-gray-500">
              <p>No FAQs found. Click "Add New FAQ" to create one.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {Object.entries(categorizedFaqs).map(([category, categoryFaqs]: [string, FAQ[]]) => (
        <Card key={category} className="overflow-hidden">
          <CardHeader className="bg-amber-50 py-4">
            <CardTitle className="text-lg capitalize">{category}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Answer</TableHead>
                  <TableHead className="w-24 text-center">Order</TableHead>
                  <TableHead className="w-24 text-center">Published</TableHead>
                  <TableHead className="w-32 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryFaqs.map((faq: FAQ) => (
                  <TableRow key={faq.id}>
                    <TableCell className="font-medium">{faq.question}</TableCell>
                    <TableCell className="max-w-md">
                      <div className="line-clamp-2">{faq.answer}</div>
                    </TableCell>
                    <TableCell className="text-center">{faq.displayOrder}</TableCell>
                    <TableCell className="text-center">
                      {faq.isPublished ? (
                        <Check className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-red-600 mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditFaq(faq)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteFaq(faq.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      {/* FAQ Form Dialog */}
      <Dialog 
        open={isDialogOpen} 
        onOpenChange={(open) => !open && handleDialogClose()}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit FAQ" : "Add New FAQ"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? "Update the FAQ details below" 
                : "Fill in the details for the new FAQ entry"}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter the question" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="answer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Answer</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the answer"
                        className="min-h-[120px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="sourdough">Sourdough</SelectItem>
                          <SelectItem value="baking">Baking</SelectItem>
                          <SelectItem value="ingredients">Ingredients</SelectItem>
                          <SelectItem value="equipment">Equipment</SelectItem>
                          <SelectItem value="troubleshooting">Troubleshooting</SelectItem>
                          <SelectItem value="shipping">Shipping & Delivery</SelectItem>
                          <SelectItem value="returns">Returns & Refunds</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="displayOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Order</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Lower numbers appear first
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isPublished"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Published</FormLabel>
                      <FormDescription>
                        When checked, this FAQ will be visible on the public website
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDialogClose}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createFaqMutation.isPending || updateFaqMutation.isPending}
                >
                  {(createFaqMutation.isPending || updateFaqMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isEditMode ? "Update FAQ" : "Create FAQ"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete FAQ</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this FAQ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleteFaqMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}