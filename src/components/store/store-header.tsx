"use client";

import { Bell } from "lucide-react";

import { useStore } from "@/components/store/store-provider";
import { useAuth } from "@/components/auth/auth-provider";

import { Button } from "@/components/ui/button";
import { StoreMobileNav } from "./store-mobile-nav";

export function StoreHeader() {
  const { activeStore } = useStore();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur lg:px-6">
      <div className="flex items-center gap-3">
        <StoreMobileNav />

        <div className="lg:hidden">
          <p className="max-w-44 truncate text-sm font-semibold">
            {activeStore?.name}
          </p>

          <p className="text-[11px] text-muted-foreground">
            Store Admin
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
        </Button>

        <div className="hidden border-l pl-3 sm:block">
          <p className="text-right text-sm font-medium">
            {user?.name}
          </p>

          <p className="text-right text-xs text-muted-foreground">
            {activeStore?.role}
          </p>
        </div>
      </div>
    </header>
  );
}