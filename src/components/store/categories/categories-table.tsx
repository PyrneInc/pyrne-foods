"use client";

import {
  MoreHorizontal,
  Pencil,
  Tags,
  Trash2,
} from "lucide-react";

import type { Category } from "@/types/marketplace";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type CategoriesTableProps = {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onToggleActive: (
    category: Category,
    isActive: boolean,
  ) => Promise<void>;
};

export function CategoriesTable({
  categories,
  onEdit,
  onDelete,
  onToggleActive,
}: CategoriesTableProps) {
  if (categories.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border bg-background px-6 text-center">
        <div className="flex size-10 items-center justify-center rounded-full bg-muted">
          <Tags className="size-5 text-muted-foreground" />
        </div>

        <h3 className="mt-4 text-sm font-medium">
          No categories found
        </h3>

        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Create your first category to start organizing
          your products.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-lg border bg-background md:block">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/30">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Category
              </th>

              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Description
              </th>

              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Status
              </th>

              <th className="w-20 px-4 py-3" />
            </tr>
          </thead>

          <tbody className="divide-y">
            {categories.map((category) => (
              <CategoryRow
                key={category.id}
                category={category}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleActive={onToggleActive}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleActive={onToggleActive}
          />
        ))}
      </div>
    </>
  );
}

function CategoryRow({
  category,
  onEdit,
  onDelete,
  onToggleActive,
}: Omit<CategoriesTableProps, "categories"> & { category: Category }) {
  return (
    <tr className="transition-colors hover:bg-muted/20">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <CategoryIcon />

          <span className="font-medium">
            {category.name}
          </span>
        </div>
      </td>

      <td className="max-w-md px-4 py-3">
        <p className="truncate text-muted-foreground">
          {category.description || "No description"}
        </p>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Switch
            checked={category.isActive}
            onCheckedChange={(checked) =>
              onToggleActive(category, checked)
            }
          />

          <Badge
            variant={
              category.isActive ? "default" : "secondary"
            }
          >
            {category.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </td>

      <td className="px-4 py-3 text-right">
        <CategoryActions
          category={category}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </td>
    </tr>
  );
}

function CategoryCard({
  category,
  onEdit,
  onDelete,
  onToggleActive,
}: Omit<CategoriesTableProps, "categories"> & { category: Category }) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="flex items-start gap-3">
        <CategoryIcon />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-medium">
                {category.name}
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                {category.description || "No description"}
              </p>
            </div>

            <CategoryActions
              category={category}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>

          <div className="mt-4 flex items-center justify-between border-t pt-3">
            <Badge
              variant={
                category.isActive ? "default" : "secondary"
              }
            >
              {category.isActive ? "Active" : "Inactive"}
            </Badge>

            <Switch
              checked={category.isActive}
              onCheckedChange={(checked) =>
                onToggleActive(category, checked)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryIcon() {
  return (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
      <Tags className="size-4 text-muted-foreground" />
    </div>
  );
}

function CategoryActions({
  category,
  onEdit,
  onDelete,
}: {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Actions for ${category.name}`}
          />
        }
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(category)}>
          <Pencil className="size-4" />
          Edit
        </DropdownMenuItem>

        <DropdownMenuItem
          variant="destructive"
          onClick={() => onDelete(category)}
        >
          <Trash2 className="size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}