"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/auth-provider";
import { useStore } from "@/components/store/store-provider";

import { Loader2 } from "lucide-react";

export function StoreAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const { user, stores, loading: authLoading } = useAuth();

  const {
    activeStore,
    loading: storeLoading,
  } = useStore();

  const loading = authLoading || storeLoading;

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace(
        `/login?redirect=${encodeURIComponent(pathname)}`,
      );
      return;
    }

    if (user.role !== "STORE_USER") {
      router.replace("/");
      return;
    }

    if (stores.length === 0) {
      router.replace("/store/create");
      return;
    }

    if (!activeStore) {
      router.replace("/store/select");
    }
  }, [
    loading,
    user,
    stores,
    activeStore,
    pathname,
    router,
  ]);

  if (loading || !user || !activeStore) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />

          <p className="text-sm text-muted-foreground">
            Loading workspace...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}