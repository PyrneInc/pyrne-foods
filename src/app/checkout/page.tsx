"use client";

import {
  ChangeEvent,
  FormEvent,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  MapPin,
  ShoppingBag,
  Truck,
} from "lucide-react";

import { checkout } from "@/lib/api";

import { useCart } from "@/components/cart/cart-provider";
import { HomeNavbar } from "@/components/home/home-navbar";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

export default function CheckoutPage() {
  const router = useRouter();

  const {
    items,
    subtotal,
    clearCart,
  } = useCart();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [orderType, setOrderType] =
    useState<"PICKUP" | "DELIVERY">(
      "PICKUP",
    );

  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  async function submit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSubmitting(true);
    setError("");

    try {
      const result = await checkout({
        customer: {
          name,
          phone,
        },
        orderType,
        deliveryAddress:
          orderType === "DELIVERY"
            ? address
            : undefined,
        deliveryNotes:
          notes || undefined,
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      });

      clearCart();

      const orderNumbers =
        result.data.orders
          .map((order) => order.orderNumber)
          .join(",");

      router.push(
        `/checkout/success?orders=${encodeURIComponent(
          orderNumbers,
        )}`,
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Checkout failed.",
      );
    } finally {
      setSubmitting(false);
    }
  }

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
              Nothing to checkout
            </h1>

            <p className="mt-3 text-muted-foreground">
              Add some delicious treats to your cart first.
            </p>

            <Button
              className="mt-7 rounded-full"
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
          render={<Link href="/cart" />}
        >
          <ArrowLeft />
          Back to cart
        </Button>

        <div className="mt-8 mb-10">
          <Badge
            variant="secondary"
            className="rounded-full"
          >
            Almost there
          </Badge>

          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Checkout
          </h1>

          <p className="mt-2 text-muted-foreground">
            Tell us where to bring your treats.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start"
        >
          <div className="space-y-8">
            {/* Customer details */}
            <section>
              <div className="mb-4">
                <h2 className="text-lg font-bold tracking-tight">
                  Your details
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  We'll use these details to contact you about your order.
                </p>
              </div>

              <div className="rounded-[2rem] bg-muted/40 p-5 md:p-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Full name
                    </Label>

                    <Input
                      id="name"
                      required
                      value={name}
                      onChange={(event) =>
                        setName(event.target.value)
                      }
                      placeholder="Your name"
                      className="h-11 rounded-xl border-0 bg-background shadow-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Phone number
                    </Label>

                    <Input
                      id="phone"
                      required
                      type="tel"
                      value={phone}
                      onChange={(event) =>
                        setPhone(event.target.value)
                      }
                      placeholder="07XX XXX XXX"
                      className="h-11 rounded-xl border-0 bg-background shadow-none"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Fulfilment */}
            <section>
              <div className="mb-4">
                <h2 className="text-lg font-bold tracking-tight">
                  How would you like your order?
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Choose how you'll receive your food.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() =>
                    setOrderType("PICKUP")
                  }
                  className={`rounded-[1.5rem] p-5 text-left transition-all ${
                    orderType === "PICKUP"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/40 hover:bg-muted"
                  }`}
                >
                  <div
                    className={`flex size-10 items-center justify-center rounded-xl ${
                      orderType === "PICKUP"
                        ? "bg-primary-foreground/15"
                        : "bg-background"
                    }`}
                  >
                    <ShoppingBag className="size-5" />
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <p className="font-semibold">
                      Pickup
                    </p>

                    {orderType === "PICKUP" && (
                      <Check className="size-5" />
                    )}
                  </div>

                  <p
                    className={`mt-1 text-sm ${
                      orderType === "PICKUP"
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    Pick up your order from the vendor.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setOrderType("DELIVERY")
                  }
                  className={`rounded-[1.5rem] p-5 text-left transition-all ${
                    orderType === "DELIVERY"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/40 hover:bg-muted"
                  }`}
                >
                  <div
                    className={`flex size-10 items-center justify-center rounded-xl ${
                      orderType === "DELIVERY"
                        ? "bg-primary-foreground/15"
                        : "bg-background"
                    }`}
                  >
                    <Truck className="size-5" />
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <p className="font-semibold">
                      Delivery
                    </p>

                    {orderType === "DELIVERY" && (
                      <Check className="size-5" />
                    )}
                  </div>

                  <p
                    className={`mt-1 text-sm ${
                      orderType === "DELIVERY"
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    Have your order brought to you.
                  </p>
                </button>
              </div>

              {orderType === "DELIVERY" && (
                <div className="mt-4 rounded-[1.5rem] bg-muted/40 p-5">
                  <div className="space-y-2">
                    <Label htmlFor="address">
                      Delivery address
                    </Label>

                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 size-4 text-muted-foreground" />

                      <Textarea
                        id="address"
                        required
                        value={address}
                        onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                          setAddress(event.target.value)
                        }
                        placeholder="Enter your delivery location"
                        rows={3}
                        className="resize-none rounded-xl border-0 bg-background pl-9 shadow-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Notes */}
            <section>
              <div className="mb-4">
                <h2 className="text-lg font-bold tracking-tight">
                  Anything else?
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Add optional instructions for your order.
                </p>
              </div>

              <Textarea
                value={notes}
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                  setNotes(event.target.value)
                }
                placeholder="e.g. Please pack separately..."
                rows={4}
                className="resize-none rounded-[1.5rem] border-0 bg-muted/40 px-5 py-4 shadow-none"
              />
            </section>

            {error && (
              <Alert variant="destructive" className="rounded-2xl">
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Order summary */}
          <aside className="lg:sticky lg:top-24">
            <Card className="gap-0 rounded-[2rem] border-0 bg-muted/50 py-0 shadow-none">
              <div className="p-6">
                <h2 className="text-xl font-bold tracking-tight">
                  Your order
                </h2>

                <div className="mt-6 space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {item.product.name}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {item.quantity} × KSh{" "}
                          {Number(
                            item.product.price,
                          ).toLocaleString()}
                        </p>
                      </div>

                      <p className="shrink-0 text-sm font-semibold">
                        KSh{" "}
                        {(
                          Number(item.product.price) *
                          item.quantity
                        ).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator className="my-6" />

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Subtotal
                  </span>

                  <span className="font-medium">
                    KSh {subtotal.toLocaleString()}
                  </span>
                </div>

                <div className="mt-3 flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Delivery
                  </span>

                  <span className="text-xs text-muted-foreground">
                    Calculated by vendor
                  </span>
                </div>

                <Separator className="my-6" />

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
                  type="submit"
                  size="lg"
                  disabled={submitting}
                  className="mt-6 h-12 w-full rounded-full"
                >
                  {submitting
                    ? "Placing order..."
                    : "Place order"}
                </Button>

                <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">
                  By placing your order, you'll receive
                  confirmation with your order details.
                </p>
              </div>
            </Card>
          </aside>
        </form>
      </div>
    </main>
  );
}