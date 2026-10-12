"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import { getAdminSummary } from "@/lib/store-admin-api";

import { useAuth } from "@/components/auth/auth-provider";
import { useStore } from "@/components/store/store-provider";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { DashboardStats } from "@/components/store/dashboard/dashboard-stats";
import { ProductSummary } from "@/components/store/dashboard/product-summary";
import { DashboardActions } from "@/components/store/dashboard/dashboard-actions";

type Summary = {
  store: {
    id: string;
    name: string;
    slug: string;
    role: "OWNER" | "MANAGER" | "STAFF";
  };
  orders: {
    total: number;
    pending: number;
    completed: number;
    sales: string;
  };
  products: {
    total: number;
    available: number;
  };
};

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-3 h-8 w-20" />
              <Skeleton className="mt-2 h-3 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mt-6 h-8 w-20" />
            <Skeleton className="mt-4 h-2 w-full" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-6">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function StoreDashboardPage() {
  const { user } = useAuth();
  const { activeStore } = useStore();

  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadSummary() {
    setLoading(true);
    setError(null);

    try {
      const response = await getAdminSummary();
      setSummary(response.data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load dashboard.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!activeStore) return;

    loadSummary();
  }, [activeStore?.id]);

  if (loading) {
    return (
      <div className="p-4 lg:p-6">
        <DashboardSkeleton />
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="p-4 lg:p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="size-5 text-destructive" />
            </div>

            <h2 className="mt-4 text-base font-semibold">
              Unable to load dashboard
            </h2>

            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              {error ?? "No dashboard data is currently available."}
            </p>

            <Button
              onClick={loadSummary}
              variant="outline"
              className="mt-5"
            >
              <RefreshCw className="mr-2 size-4" />
              Try again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const firstName =
    user?.name?.trim().split(/\s+/)[0] || "there";

  return (
    <div className="p-4 lg:p-6">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Store dashboard
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Good morning, {firstName}
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Here's an overview of {activeStore?.name}.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadSummary}
          >
            <RefreshCw className="mr-2 size-3.5" />
            Refresh
          </Button>
        </div>

        <DashboardStats summary={summary} />

        <div className="grid gap-4 lg:grid-cols-2">
          <ProductSummary
            total={summary.products.total}
            available={summary.products.available}
          />

          <DashboardActions />
        </div>
      </div>
    </div>
  );
}