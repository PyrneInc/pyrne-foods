import type { Category } from "@/types/marketplace";

import { Button } from "@/components/ui/button";

export function CategorySection({
  categories,
}: {
  categories: Category[];
}) {
  if (!categories.length) {
    return null;
  }

  return (
    <section className="border-b bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-5">
          <p className="text-sm font-medium text-primary">
            Browse
          </p>

          <h2 className="mt-1 text-xl font-bold tracking-tight">
            What are you craving?
          </h2>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-1">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant="outline"
              className="h-auto min-w-28 shrink-0 rounded-2xl px-5 py-4"
            >
              <span className="text-xl">🍽️</span>

              <span>{category.name}</span>
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}