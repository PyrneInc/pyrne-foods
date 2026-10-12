"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  Package,
  ShoppingBag,
  Tags,
  LayoutDashboard,
  Settings,
} from "lucide-react";

import { useStore } from "@/components/store/store-provider";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";

const items = [
  {
    label: "Dashboard",
    href: "/store",
    icon: LayoutDashboard,
  },
  {
    label: "Orders",
    href: "/store/orders",
    icon: ShoppingBag,
  },
  {
    label: "Products",
    href: "/store/products",
    icon: Package,
  },
  {
    label: "Categories",
    href: "/store/categories",
    icon: Tags,
  },
  {
    label: "Settings",
    href: "/store/settings",
    icon: Settings,
  },
];

export function StoreMobileNav() {
  const pathname = usePathname();
  const { activeStore } = useStore();

  return (
    <Sheet>
      <SheetTrigger render={(
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
        >
          <Menu className="size-5" />
          <span className="sr-only">Open navigation</span>
        </Button>
      )} />

      <SheetContent
        side="left"
        className="w-72 p-0"
      >
        <SheetHeader className="border-b px-5 py-4 text-left">
          <SheetTitle className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShoppingBag className="size-4" />
            </span>

            Pyrne Foods
          </SheetTitle>
        </SheetHeader>

        <div className="border-b px-5 py-4">
          <p className="truncate text-sm font-semibold">
            {activeStore?.name}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {activeStore?.role}
          </p>
        </div>

        <nav className="space-y-1 p-3">
          {items.map((item) => {
            const Icon = item.icon;

            const active =
              item.href === "/store"
                ? pathname === "/store"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                ].join(" ")}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}