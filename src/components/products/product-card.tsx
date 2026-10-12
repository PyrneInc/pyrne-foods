"use client";

import Image from "next/image";
import { Check, Minus, Plus } from "lucide-react";

import type { Product } from "@/types/marketplace";

import { useCart } from "@/components/cart/cart-provider";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function ProductCard({
  product,
}: {
  product: Product;
}) {
  const {
    addItem,
    items,
    updateQuantity,
  } = useCart();

  const cartItem = items.find(
    (item) => item.product.id === product.id,
  );

  const quantity = cartItem?.quantity ?? 0;
  const inCart = quantity > 0;

  function handleAdd() {
    addItem(product);
  }

  function handleDecrease() {
    if (!cartItem) return;

    updateQuantity(
      product.id,
      Math.max(0, quantity - 1),
    );
  }

  return (
<Card className="group overflow-hidden gap-0 rounded-3xl border-0 bg-card py-0 shadow-[0_2px_12px_-4px_rgb(0_0_0/0.08)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-8px_rgb(0_0_0/0.15)]">      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted text-5xl">
            🍽️
          </div>
        )}

        <div className="absolute left-3 top-3">
          <Badge
            variant="secondary"
            className="border-0 bg-background/90 backdrop-blur"
          >
            Fresh
          </Badge>
        </div>

        {inCart && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm">
            <Check className="size-3.5" />
            In cart
          </div>
        )}
      </div>

      <div className="space-y-3 p-4">
        <div className="min-w-0">
          <h3 className="truncate font-semibold tracking-tight">
            {product.name}
          </h3>

          <p className="mt-1 truncate text-xs text-muted-foreground">
            {product.store.name}
          </p>
        </div>

        {product.description && (
          <p className="line-clamp-2 text-sm leading-5 text-muted-foreground">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between gap-3 pt-1">
          <div>
            <p className="text-base font-bold tracking-tight">
              KSh {Number(product.price).toLocaleString()}
            </p>

            <p className="text-xs text-muted-foreground">
              per serving
            </p>
          </div>

          {inCart ? (
            <div className="flex items-center rounded-full border bg-muted/50">
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-full"
                onClick={handleDecrease}
              >
                <Minus />
              </Button>

              <span className="min-w-8 text-center text-sm font-semibold">
                {quantity}
              </span>

              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-full"
                onClick={handleAdd}
              >
                <Plus />
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              className="rounded-full"
              onClick={handleAdd}
            >
              <Plus />
              Add
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}