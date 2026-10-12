import type { Product } from "@/types/marketplace";

import { ArrowRight } from "lucide-react";

import { ProductGrid } from "@/components/products/product-grid";
import { Button } from "@/components/ui/button";

export function PopularProducts({
  products,
}: {
  products: Product[];
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:py-16">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">
            Explore
          </p>

          <h2 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
            Popular treats
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Fresh picks from our local vendors.
          </p>
        </div>

        <Button
          variant="ghost"
          className="hidden rounded-full sm:flex"
        >
          View all
          <ArrowRight />
        </Button>
      </div>

      <ProductGrid products={products} />
    </section>
  );
}