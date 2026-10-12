"use client";

import type { Product } from "@/types/marketplace";

import { ProductCard } from "./product-card";

export function ProductGrid({
  products,
}: {
  products: Product[];
}) {
  if (!products.length) {
    return (
      <div className="rounded-3xl border border-dashed bg-muted/30 p-12 text-center">
        <p className="font-medium">No products available.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Check back soon for something delicious.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
        />
      ))}
    </div>
  );
}