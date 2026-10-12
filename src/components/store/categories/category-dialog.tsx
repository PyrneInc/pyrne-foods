"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

import type { Category } from "@/types/marketplace";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export type CategoryFormValues = {
  name: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
};

type CategoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  saving: boolean;
  onSubmit: (values: CategoryFormValues) => Promise<void>;
};

export function CategoryDialog({
  open,
  onOpenChange,
  category,
  saving,
  onSubmit,
}: CategoryDialogProps) {
  const isEditing = Boolean(category);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    defaultValues: {
      name: "",
      description: null,
      imageUrl: null,
      isActive: true,
      sortOrder: 0,
    },
  });

  const isActive = watch("isActive");

  useEffect(() => {
    if (!open) return;

    reset({
      name: category?.name ?? "",
      description: category?.description ?? null,
      imageUrl: category?.imageUrl ?? null,
      isActive: category?.isActive ?? true,
      sortOrder: category?.sortOrder ?? 0,
    });
  }, [open, category, reset]);

  async function submit(values: CategoryFormValues) {
    await onSubmit({
      ...values,
      name: values.name.trim(),
      description:
        values.description?.trim() || null,
      imageUrl:
        values.imageUrl?.trim() || null,
      sortOrder: Number(values.sortOrder) || 0,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit category" : "Create category"}
          </DialogTitle>

          <DialogDescription>
            {isEditing
              ? "Update the category details for your store."
              : "Create a category to organize your products."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(submit)}
          className="space-y-5"
        >
          <div className="space-y-2">
            <Label htmlFor="category-name">
              Name
            </Label>

            <Input
              id="category-name"
              placeholder="e.g. Maandazi"
              autoFocus
              {...register("name", {
                required: "Category name is required.",
                minLength: {
                  value: 2,
                  message:
                    "Category name must be at least 2 characters.",
                },
                maxLength: {
                  value: 100,
                  message:
                    "Category name cannot exceed 100 characters.",
                },
              })}
            />

            {errors.name && (
              <p className="text-xs text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-description">
              Description
            </Label>

            <Textarea
              id="category-description"
              placeholder="Briefly describe this category..."
              rows={3}
              {...register("description")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-image">
              Image URL
            </Label>

            <Input
              id="category-image"
              type="url"
              placeholder="https://..."
              {...register("imageUrl")}
            />

            <p className="text-xs text-muted-foreground">
              Optional. You can add category image support
              later through your media system.
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label
                htmlFor="category-active"
                className="cursor-pointer"
              >
                Active category
              </Label>

              <p className="mt-1 text-xs text-muted-foreground">
                Inactive categories won't be shown in the
                customer marketplace.
              </p>
            </div>

            <Switch
              id="category-active"
              checked={isActive}
              onCheckedChange={(checked) =>
                setValue("isActive", checked)
              }
            />
          </div>

          <input
            type="hidden"
            {...register("sortOrder", {
              valueAsNumber: true,
            })}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={saving}>
              {saving && (
                <Loader2 className="size-4 animate-spin" />
              )}

              {isEditing
                ? "Save changes"
                : "Create category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}