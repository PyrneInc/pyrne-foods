"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Plus, RefreshCw, Search } from "lucide-react";

import {
  createAdminProduct,
  deleteAdminProduct,
  getAdminCategories,
  getAdminProducts,
  updateAdminProduct,
} from "@/lib/store-admin-api";

import type { Category, Product } from "@/types/marketplace";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import {
  ProductDialog,
  type ProductFormValues,
} from "./product-dialog";
import { ProductDeleteDialog } from "./product-delete-dialog";
import { ProductsTable } from "./products-table";


export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [deleteProduct, setDeleteProduct] =
    useState<Product | null>(null);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [productResponse, categoryResponse] =
        await Promise.all([
          getAdminProducts(),
          getAdminCategories(),
        ]);

      setProducts(productResponse.data);
      setCategories(categoryResponse.data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load products.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query);

      const matchesAvailability =
        !availableOnly || product.isAvailable;

      return matchesSearch && matchesAvailability;
    });
  }, [products, search, availableOnly]);

  function handleCreate() {
    setEditingProduct(null);
    setDialogOpen(true);
  }

  function handleEdit(product: Product) {
    setEditingProduct(product);
    setDialogOpen(true);
  }

  async function handleSubmit(values: ProductFormValues) {
    setSaving(true);

    try {
      if (editingProduct) {
        const response = await updateAdminProduct(
          editingProduct.id,
          values,
        );

        setProducts((current) =>
          current.map((product) =>
            product.id === editingProduct.id
              ? response.data
              : product,
          ),
        );
      } else {
        const response = await createAdminProduct(values);

        setProducts((current) => [
          response.data,
          ...current,
        ]);
      }

      setDialogOpen(false);
      setEditingProduct(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteProduct) return;

    setDeleting(true);

    try {
      await deleteAdminProduct(deleteProduct.id);

      setProducts((current) =>
        current.filter(
          (product) => product.id !== deleteProduct.id,
        ),
      );

      setDeleteProduct(null);
    } finally {
      setDeleting(false);
    }
  }

  async function handleAvailabilityChange(
    product: Product,
    isAvailable: boolean,
  ) {
    const response = await updateAdminProduct(product.id, {
      isAvailable,
    });

    setProducts((current) =>
      current.map((item) =>
        item.id === product.id
          ? response.data
          : item,
      ),
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Catalogue
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Products
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage the products customers can order from your store.
            </p>
          </div>

          <Button onClick={handleCreate}>
            <Plus className="mr-2 size-4" />
            Add product
          </Button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search products..."
              className="pl-9"
            />
          </div>

          <Button
            variant={availableOnly ? "default" : "outline"}
            onClick={() =>
              setAvailableOnly((current) => !current)
            }
          >
            Available only
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={loadProducts}
            disabled={loading}
            aria-label="Refresh products"
          >
            <RefreshCw
              className={[
                "size-4",
                loading && "animate-spin",
              ]
                .filter(Boolean)
                .join(" ")}
            />
          </Button>
        </div>

        {error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="size-5 text-destructive" />

              <div>
                <p className="font-medium">
                  Failed to load products
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  {error}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={loadProducts}
            >
              Try again
            </Button>
          </div>
        ) : loading ? (
          <ProductsSkeleton />
        ) : (
          <ProductsTable
            products={filteredProducts}
            categories={categories}
            onEdit={handleEdit}
            onDelete={setDeleteProduct}
            onAvailabilityChange={
              handleAvailabilityChange
            }
          />
        )}
      </div>

      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editingProduct}
        categories={categories}
        loading={saving}
        onSubmit={handleSubmit}
      />

      <ProductDeleteDialog
        product={deleteProduct}
        open={!!deleteProduct}
        loading={deleting}
        onOpenChange={(open) => {
          if (!open) setDeleteProduct(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}

function ProductsSkeleton() {
  return (
    <div className="rounded-lg border">
      <div className="space-y-4 p-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-4"
          >
            <Skeleton className="size-10 rounded-md" />

            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-64" />
            </div>

            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}