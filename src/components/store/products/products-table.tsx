"use client";

import {
  MoreHorizontal,
  PackageOpen,
  Pencil,
  Trash2,
} from "lucide-react";

import type { Category, Product } from "@/types/marketplace";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProductStatusToggle } from "./product-status-toggle";


type ProductsTableProps = {
  products: Product[];
  categories: Category[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onAvailabilityChange: (
    product: Product,
    available: boolean,
  ) => Promise<void>;
};

function formatPrice(price: string) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 2,
  }).format(Number(price));
}

export function ProductsTable({
  products,
  categories,
  onEdit,
  onDelete,
  onAvailabilityChange,
}: ProductsTableProps) {
  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex size-11 items-center justify-center rounded-full bg-muted">
            <PackageOpen className="size-5 text-muted-foreground" />
          </div>

          <h2 className="mt-4 text-base font-semibold">
            No products found
          </h2>

          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Add your first product or adjust your search filters.
          </p>
        </CardContent>
      </Card>
    );
  }

  const categoryMap = new Map(
    categories.map((category) => [
      category.id,
      category.name,
    ]),
  );

  return (
    <Card className="overflow-hidden">
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/30">
            <tr>
              <th className="px-5 py-3 text-left font-medium text-muted-foreground">
                Product
              </th>

              <th className="px-5 py-3 text-left font-medium text-muted-foreground">
                Category
              </th>

              <th className="px-5 py-3 text-left font-medium text-muted-foreground">
                Price
              </th>

              <th className="px-5 py-3 text-left font-medium text-muted-foreground">
                Availability
              </th>

              <th className="w-12 px-3 py-3" />
            </tr>
          </thead>

          <tbody className="divide-y">
            {products.map((product) => (
              <tr
                key={product.id}
                className="transition-colors hover:bg-muted/20"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <ProductImage product={product} />

                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {product.name}
                      </p>

                      {product.description && (
                        <p className="mt-0.5 max-w-md truncate text-xs text-muted-foreground">
                          {product.description}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4 text-muted-foreground">
                  {product.category?.id
                    ? categoryMap.get(product.category?.id) ??
                      "Uncategorized"
                    : "Uncategorized"}
                </td>

                <td className="px-5 py-4 font-medium">
                  {formatPrice(product.price)}
                </td>

                <td className="px-5 py-4">
                  <ProductStatusToggle
                    product={product}
                    onChange={onAvailabilityChange}
                  />
                </td>

                <td className="px-3 py-4">
                  <ProductActions
                    product={product}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y md:hidden">
        {products.map((product) => (
          <div
            key={product.id}
            className="space-y-4 p-4"
          >
            <div className="flex items-start gap-3">
              <ProductImage product={product} />

              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {product.name}
                </p>

                <p className="mt-1 text-sm font-medium">
                  {formatPrice(product.price)}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {product.category?.id
                    ? categoryMap.get(product.category?.id) ??
                      "Uncategorized"
                    : "Uncategorized"}
                </p>
              </div>

              <ProductActions
                product={product}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </div>

            <ProductStatusToggle
              product={product}
              onChange={onAvailabilityChange}
            />
          </div>
        ))}
      </div>
    </Card>
  );
}

function ProductImage({
  product,
}: {
  product: Product;
}) {
  if (product.imageUrl) {
    return (
      <img
        src={product.imageUrl}
        alt=""
        className="size-10 shrink-0 rounded-md border object-cover"
      />
    );
  }

  return (
    <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
      <PackageOpen className="size-4 text-muted-foreground" />
    </div>
  );
}

function ProductActions({
  product,
  onEdit,
  onDelete,
}: {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={(
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
        >
          <MoreHorizontal className="size-4" />
          <span className="sr-only">
            Product actions
          </span>
        </Button>
        )} >
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => onEdit(product)}
        >
          <Pencil className="mr-2 size-4" />
          Edit product
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          onClick={() => onDelete(product)}
        >
          <Trash2 className="mr-2 size-4" />
          Delete product
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}