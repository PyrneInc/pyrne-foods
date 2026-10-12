"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Plus, RefreshCw, Search } from "lucide-react";

import {
  createAdminCategory,
  deleteAdminCategory,
  getAdminCategories,
  updateAdminCategory,
} from "@/lib/store-admin-api";

import type { Category } from "@/types/marketplace";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import { CategoriesTable } from "./categories-table";
import {
  CategoryDialog,
  type CategoryFormValues,
} from "./category-dialog";
import { CategoryDeleteDialog } from "./category-delete-dialog";

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(
    null,
  );
  const [saving, setSaving] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  const loadCategories = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const response = await getAdminCategories();

      setCategories(response.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load categories.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    return categories.filter((category) => {
      const matchesSearch =
        !query ||
        category.name.toLowerCase().includes(query) ||
        category.description?.toLowerCase().includes(query);

      const matchesActive =
        !activeOnly || category.isActive;

      return matchesSearch && matchesActive;
    });
  }, [categories, search, activeOnly]);

  function openCreateDialog() {
    setEditingCategory(null);
    setDialogOpen(true);
  }

  function openEditDialog(category: Category) {
    setEditingCategory(category);
    setDialogOpen(true);
  }

  function openDeleteDialog(category: Category) {
    setDeletingCategory(category);
    setDeleteOpen(true);
  }

  async function handleSave(values: CategoryFormValues) {
    try {
      setSaving(true);

      if (editingCategory) {
        const categories = (await updateAdminCategory(
          editingCategory.id,
          values,
        )).data;

        setCategories((current) =>
          current.map((category) =>
            category.id === editingCategory.id
              ? categories
              : category,
          ),
        );
      } else {
        const createdCategory = (await createAdminCategory(values)).data;

        setCategories((current) => [
          createdCategory,
          ...current,
        ]);
      }

      setDialogOpen(false);
      setEditingCategory(null);
    } catch (err) {
      throw err instanceof Error
        ? err
        : new Error("Failed to save category.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deletingCategory) return;

    try {
      setDeleting(true);

      await deleteAdminCategory(deletingCategory.id);

      setCategories((current) =>
        current.filter(
          (category) => category.id !== deletingCategory.id,
        ),
      );

      setDeleteOpen(false);
      setDeletingCategory(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete category.",
      );
    } finally {
      setDeleting(false);
    }
  }

  async function handleToggleActive(
    category: Category,
    isActive: boolean,
  ) {
    const previous = categories;

    setCategories((current) =>
      current.map((item) =>
        item.id === category.id
          ? { ...item, isActive }
          : item,
      ),
    );

    try {
      const updatedCategory = (await updateAdminCategory(category.id, {
        isActive,
      })).data;

      setCategories((current) =>
        current.map((item) =>
          item.id === category.id
            ? updatedCategory
            : item,
        ),
      );
    } catch (err) {
      setCategories(previous);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update category status.",
      );
    }
  }

  const activeCount = categories.filter(
    (category) => category.isActive,
  ).length;

  const inactiveCount = categories.length - activeCount;

  if (loading) {
    return <CategoriesPageSkeleton />;
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Categories
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Organize your products into clear categories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadCategories(true)}
            disabled={refreshing}
          >
            <RefreshCw
              className={`size-4 ${refreshing ? "animate-spin" : ""
                }`}
            />
            Refresh
          </Button>

          <Button size="sm" onClick={openCreateDialog}>
            <Plus className="size-4" />
            Add category
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
          <AlertCircle className="mt-0.5 size-4 text-destructive" />

          <div className="flex-1">
            <p className="text-sm font-medium">
              Something went wrong
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {error}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => loadCategories(true)}
          >
            Try again
          </Button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border bg-background p-4">
          <p className="text-xs font-medium text-muted-foreground">
            Total categories
          </p>

          <p className="mt-1 text-2xl font-semibold">
            {categories.length}
          </p>
        </div>

        <div className="rounded-lg border bg-background p-4">
          <p className="text-xs font-medium text-muted-foreground">
            Active
          </p>

          <p className="mt-1 text-2xl font-semibold">
            {activeCount}
          </p>
        </div>

        <div className="rounded-lg border bg-background p-4">
          <p className="text-xs font-medium text-muted-foreground">
            Inactive
          </p>

          <p className="mt-1 text-2xl font-semibold">
            {inactiveCount}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search categories..."
            className="pl-9"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(event) =>
              setActiveOnly(event.target.checked)
            }
            className="size-4 rounded border-input"
          />

          Active only
        </label>
      </div>

      <CategoriesTable
        categories={filteredCategories}
        onEdit={openEditDialog}
        onDelete={openDeleteDialog}
        onToggleActive={handleToggleActive}
      />

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editingCategory}
        saving={saving}
        onSubmit={handleSave}
      />

      <CategoryDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        category={deletingCategory}
        deleting={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}

function CategoriesPageSkeleton() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>

        <Skeleton className="h-9 w-32" />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-lg" />
        ))}
      </div>

      <Skeleton className="h-10 w-full sm:max-w-sm" />

      <Skeleton className="h-72 rounded-lg" />
    </div>
  );
}