"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import { useCart } from "@/components/cart/cart-provider";
import { HomeNavbar } from "@/components/home/home-navbar";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function CartPage() {
  const {
    items,
    subtotal,
    updateQuantity,
    removeItem,
  } = useCart();

  const grouped = items.reduce(
    (groups, item) => {
      const storeId = item.product.store.id;

      if (!groups[storeId]) {
        groups[storeId] = {
          store: item.product.store,
          items: [],
        };
      }

      groups[storeId].items.push(item);

      return groups;
    },
    {} as Record<
      string,
      {
        store: typeof items[number]["product"]["store"];
        items: typeof items;
      }
    >,
  );

  if (!items.length) {
    return (
      <main className="min-h-screen bg-background">
        <HomeNavbar />

        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl items-center justify-center px-4">
          <div className="py-16 text-center">
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-primary/10">
              <ShoppingBag className="size-8 text-primary" />
            </div>

            <h1 className="mt-6 text-3xl font-bold tracking-tight">
              Your cart is empty
            </h1>

            <p className="mx-auto mt-3 max-w-sm text-muted-foreground">
              Nothing here yet. Discover something delicious
              and add it to your order.
            </p>

            <Button
              className="mt-7 rounded-full px-6"
              render={<Link href="/" />}
            >
              Browse treats
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <HomeNavbar />

      <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 rounded-full text-muted-foreground"
          render={<Link href="/" />}
        >
          <ArrowLeft />
          Continue shopping
        </Button>

        <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_360px] lg:items-start">
          {/* Cart */}
          <section>
            <div className="mb-8">
              <Badge
                variant="secondary"
                className="rounded-full"
              >
                Your order
              </Badge>

              <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                Your cart
              </h1>

              <p className="mt-2 text-muted-foreground">
                Review your treats before checking out.
              </p>
            </div>

            <div className="space-y-10">
              {Object.values(grouped).map((group) => (
                <section key={group.store.id}>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        From
                      </p>

                      <h2 className="mt-1 text-lg font-bold tracking-tight">
                        {group.store.name}
                      </h2>
                    </div>

                    <span className="text-sm text-muted-foreground">
                      {group.items.length}{" "}
                      {group.items.length === 1
                        ? "item"
                        : "items"}
                    </span>
                  </div>

                  <div className="divide-y rounded-3xl bg-muted/40">
                    {group.items.map((item) => {
                      const product = item.product;

                      const lineTotal =
                        Number(product.price) *
                        item.quantity;

                      return (
                        <div
                          key={product.id}
                          className="flex gap-4 p-4 sm:p-5"
                        >
                          <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-muted sm:size-28">
                            {product.imageUrl ? (
                              <Image
                                src={product.imageUrl}
                                alt={product.name}
                                fill
                                sizes="112px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-3xl">
                                🥯
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h3 className="truncate font-semibold">
                                  {product.name}
                                </h3>

                                <p className="mt-1 text-sm text-muted-foreground">
                                  KSh{" "}
                                  {Number(
                                    product.price,
                                  ).toLocaleString()}{" "}
                                  each
                                </p>
                              </div>

                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 shrink-0 rounded-full text-muted-foreground hover:text-destructive"
                                onClick={() =>
                                  removeItem(product.id)
                                }
                              >
                                <Trash2 />
                              </Button>
                            </div>

                            <div className="mt-5 flex items-center justify-between gap-3">
                              <div className="flex items-center rounded-full bg-background shadow-sm">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 rounded-full"
                                  onClick={() =>
                                    updateQuantity(
                                      product.id,
                                      item.quantity - 1,
                                    )
                                  }
                                >
                                  <Minus />
                                </Button>

                                <span className="w-8 text-center text-sm font-semibold">
                                  {item.quantity}
                                </span>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 rounded-full"
                                  onClick={() =>
                                    updateQuantity(
                                      product.id,
                                      item.quantity + 1,
                                    )
                                  }
                                >
                                  <Plus />
                                </Button>
                              </div>

                              <p className="font-bold">
                                KSh{" "}
                                {lineTotal.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </section>

          {/* Summary */}
          <aside className="lg:sticky lg:top-24">
            <div className="rounded-[2rem] bg-muted/50 p-6">
              <h2 className="text-xl font-bold tracking-tight">
                Order summary
              </h2>

              <div className="mt-6 space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Subtotal
                  </span>

                  <span className="font-medium">
                    KSh {subtotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Delivery
                  </span>

                  <span className="text-xs text-muted-foreground">
                    Calculated at checkout
                  </span>
                </div>
              </div>

              <Separator className="my-5" />

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total
                  </p>

                  <p className="mt-1 text-2xl font-bold tracking-tight">
                    KSh {subtotal.toLocaleString()}
                  </p>
                </div>
              </div>

              <Button
                size="lg"
                className="mt-6 h-12 w-full rounded-full"
                render={<Link href="/checkout" />}
              >
                Continue to checkout
              </Button>

              <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">
                Delivery and payment details will be
                confirmed at checkout.
              </p>
            </div>

            <p className="mt-5 text-center text-xs text-muted-foreground">
              Fresh food from local vendors
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}