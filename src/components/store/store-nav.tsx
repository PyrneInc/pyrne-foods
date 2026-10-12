"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingBag,
  Store,
  Tags,
  Users,
} from "lucide-react";

import { useStore } from "@/components/store/store-provider";
import { useAuth } from "@/components/auth/auth-provider";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";

const navigation = [
  {
    label: "Dashboard",
    href: "/store",
    icon: LayoutDashboard,
    permission: ""
  },
  {
    label: "Orders",
    href: "/store/orders",
    icon: ShoppingBag,
    permission: "orders",
  },
  {
    label: "Products",
    href: "/store/products",
    icon: Package,
    permission: "products",
  },
  {
    label: "Categories",
    href: "/store/categories",
    icon: Tags,
    permission: "categories",
  },
  {
    label: "Customers",
    href: "/store/customers",
    icon: Users,
    permission: "orders",
  },
  {
    label: "Store settings",
    href: "/store/settings",
    icon: Settings,
    permission: "store",
  },
] as const;

function canAccess(
  role: "OWNER" | "MANAGER" | "STAFF",
  permission?: string,
) {
  if (!permission) return true;

  if (role === "OWNER") return true;

  if (role === "MANAGER") {
    return ["orders", "products", "categories"].includes(permission);
  }

  return permission === "orders";
}

export function StoreNav() {
  const pathname = usePathname();
  const { stores } = useAuth();
  const { activeStore, selectStore } = useStore();

  const role = activeStore?.role ?? "STAFF";

  const items = navigation.filter((item) =>
    canAccess(role, item.permission),
  );

  async function handleStoreChange(storeId: string) {
    await selectStore(storeId);
    window.location.href = "/store";
  }

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-background lg:flex lg:flex-col">
      <div className="flex h-16 items-center border-b px-5">
        <Link
          href="/store"
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Store className="size-4" />
          </span>

          <span>Pyrne Foods</span>
        </Link>
      </div>

      <div className="border-b p-3">
        <DropdownMenu>
          <DropdownMenuTrigger render={(
            <Button
              variant="outline"
              className="h-auto w-full justify-between px-3 py-2"
            >
              <div className="min-w-0 text-left">
                <p className="truncate text-sm font-medium">
                  {activeStore?.name ?? "Select store"}
                </p>

                <p className="text-xs text-muted-foreground">
                  {activeStore?.role ?? "No store selected"}
                </p>
              </div>

              <ChevronDown className="ml-2 size-4 shrink-0 text-muted-foreground" />
            </Button>
          )} />

          <DropdownMenuContent
            align="start"
            className="w-56"
          >
            {stores.map((store) => (
              <DropdownMenuItem
                key={store.id}
                onClick={() => handleStoreChange(store.id)}
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {store.name}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {store.role}
                  </p>
                </div>
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />

            <DropdownMenuItem render={(
              <Link href="/store/select">
                Manage stores
              </Link>
            )} />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <p className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Workspace
        </p>

        {items.map((item) => {
          const Icon = item.icon;

          const isActive =
            item.href === "/store"
              ? pathname === "/store"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              ].join(" ")}
            >
              <Icon className="size-4 shrink-0" />

              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <div className="rounded-lg bg-muted/50 px-3 py-3">
          <p className="text-xs font-medium">
            {activeStore?.name}
          </p>

          <p className="mt-1 text-[11px] text-muted-foreground">
            {activeStore?.slug}
          </p>
        </div>
      </div>
    </aside>
  );
}