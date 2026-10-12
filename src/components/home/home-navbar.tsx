"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";

export function HomeNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-3"
        >
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <ShoppingBag className="size-5" />
          </div>

          <div className="leading-none">
            <p className="font-bold tracking-tight">
              Pyrne Foods
            </p>

            <p className="mt-1 text-[11px] text-muted-foreground">
              Maandazi Treats
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link
            href="/"
            className="text-foreground"
          >
            Home
          </Link>

          <Link
            href="/explore"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Explore
          </Link>

          <Link
            href="/stores"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Vendors
          </Link>
        </nav>

        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          render={<Link href="/cart" />}
        >
          <ShoppingBag />
          Cart
        </Button>
      </div>
    </header>
  );
}