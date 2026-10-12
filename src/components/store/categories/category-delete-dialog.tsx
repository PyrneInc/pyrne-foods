"use client";

import { Loader2, Trash2 } from "lucide-react";

import type { Category } from "@/types/marketplace";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type CategoryDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  deleting: boolean;
  onConfirm: () => Promise<void>;
};

export function CategoryDeleteDialog({
  open,
  onOpenChange,
  category,
  deleting,
  onConfirm,
}: CategoryDeleteDialogProps) {
  if (!category) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete category?
          </AlertDialogTitle>

          <AlertDialogDescription>
            This will remove{" "}
            <span className="font-medium text-foreground">
              {category.name}
            </span>{" "}
            from your store. Products currently assigned
            to this category should be reassigned or will
            become uncategorized depending on the database
            relationship.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            variant="destructive"
            disabled={deleting}
            onClick={async (event) => {
              event.preventDefault();
              await onConfirm();
            }}
          >
            {deleting && (
              <Loader2 className="size-4 animate-spin" />
            )}

            <Trash2 className="size-4" />

            Delete category
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}