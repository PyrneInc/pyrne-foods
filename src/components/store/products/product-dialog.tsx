"use client";

import { ReactElement, useEffect } from "react";
import { Loader2 } from "lucide-react";

import type {
  Category,
  Product,
} from "@/types/marketplace";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import {
    Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  useForm,
  Controller,
} from "react-hook-form";

export type ProductFormValues = {
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  categoryId: string | null;
  isAvailable: boolean;
  sortOrder: number;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  categories: Category[];
  loading: boolean;
  onSubmit: (
    values: ProductFormValues,
  ) => Promise<void>;
};

export function ProductDialog({
  open,
  onOpenChange,
  product,
  categories,
  loading,
  onSubmit,
}: Props) {
  const isEditing = !!product;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ProductFormValues>({
    defaultValues: {
      name: "",
      description: "",
      price: "",
      imageUrl: "",
      categoryId: null,
      isAvailable: true,
      sortOrder: 0,
    },
  });

  useEffect(() => {
    if (!open) return;

    reset({
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: product?.price ?? "",
      imageUrl: product?.imageUrl ?? "",
      categoryId: product?.category?.id ?? null,
      isAvailable: product?.isAvailable ?? true,
      sortOrder: product?.sortOrder ?? 0,
    });
  }, [open, product, reset]);

  async function submit(values: ProductFormValues) {
    await onSubmit({
      ...values,
      description: values.description?.trim() || null,
      imageUrl: values.imageUrl?.trim() || null,
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? "Edit product"
              : "Add product"}
          </DialogTitle>

          <DialogDescription>
            {isEditing
              ? "Update the details of this product."
              : "Add a product to your store catalogue."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(submit)}
          className="space-y-5"
        >
          <div className="space-y-2">
            <Label htmlFor="product-name">
              Product name
            </Label>

            <Input
              id="product-name"
              placeholder="e.g. Plain Maandazi"
              {...register("name", {
                required: "Product name is required.",
                minLength: {
                  value: 2,
                  message:
                    "Product name must contain at least 2 characters.",
                },
                maxLength: {
                  value: 150,
                  message:
                    "Product name is too long.",
                },
              })}
            />

            {errors.name && (
              <p className="text-xs text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="product-price">
                Price
              </Label>

              <Input
                id="product-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="20.00"
                {...register("price", {
                  required: "Price is required.",
                  validate: (value: string) =>
                    Number(value) >= 0 ||
                    "Price cannot be negative.",
                })}
              />

              {errors.price && (
                <p className="text-xs text-destructive">
                  {errors.price.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Category</Label>

              <Controller
                name="categoryId"
                control={control}
                render={({ field }: { field: any}) => (
                  <Select
                    value={field.value ?? "none"}
                    onValueChange={(value) =>
                      field.onChange(
                        value === "none"
                          ? null
                          : value,
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="none">
                        Uncategorized
                      </SelectItem>

                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-description">
              Description
            </Label>

            <Textarea
              id="product-description"
              placeholder="Describe the product..."
              rows={4}
              {...register("description", {
                maxLength: {
                  value: 1000,
                  message:
                    "Description is too long.",
                },
              })}
            />

            {errors.description && (
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-image">
              Image URL
            </Label>

            <Input
              id="product-image"
              type="url"
              placeholder="https://..."
              {...register("imageUrl", {
                validate: (value: any) =>
                  !value ||
                  /^https?:\/\/.+/i.test(value) ||
                  "Enter a valid image URL.",
              })}
            />

            {errors.imageUrl && (
              <p className="text-xs text-destructive">
                {errors.imageUrl.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">
                Available for ordering
              </p>

              <p className="text-xs text-muted-foreground">
                Customers can order this product.
              </p>
            </div>

            <Controller
              name="isAvailable"
              control={control}
              render={({ field }: { field: any}) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={loading}
            >
              {loading && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}

              {isEditing
                ? "Save changes"
                : "Create product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}