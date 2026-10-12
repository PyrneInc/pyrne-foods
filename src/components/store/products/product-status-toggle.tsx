"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import type { Product } from "@/types/marketplace";

import { Switch } from "@/components/ui/switch";

type Props = {
  product: Product;
  onChange: (
    product: Product,
    available: boolean,
  ) => Promise<void>;
};

export function ProductStatusToggle({
  product,
  onChange,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handleChange(checked: boolean) {
    setLoading(true);

    try {
      await onChange(product, checked);
    } catch {
      // Parent-level error handling can be added later.
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={product.isAvailable}
        onCheckedChange={handleChange}
        disabled={loading}
        aria-label={`Toggle ${product.name} availability`}
      />

      {loading ? (
        <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
      ) : (
        <span className="text-xs text-muted-foreground">
          {product.isAvailable
            ? "Available"
            : "Unavailable"}
        </span>
      )}
    </div>
  );
}