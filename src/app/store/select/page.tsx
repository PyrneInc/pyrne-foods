"use client";

import {
  Building2,
  ChevronRight,
  Plus,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { useStore } from "@/components/store/store-provider";

import {
  Button,
} from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function StoreSelectPage() {
  const router = useRouter();

  const {
    stores,
    loading: authLoading,
  } = useAuth();

  const {
    selectStore,
    loading: storeLoading,
  } = useStore();

  const [selecting, setSelecting] =
    useState<string | null>(null);

  async function handleSelect(
    storeId: string,
  ) {
    setSelecting(storeId);

    try {
      await selectStore(storeId);
      router.replace("/store");
    } finally {
      setSelecting(null);
    }
  }

  if (
    authLoading ||
    storeLoading
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading stores...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-muted/30 px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-primary">
            Pyrne Foods
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Select a store
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Choose the store you want to manage.
          </p>
        </div>

        <div className="space-y-3">
          {stores.map((store) => (
            <Card
              key={store.id}
              className="cursor-pointer transition hover:border-primary/40"
              onClick={() =>
                handleSelect(store.id)
              }
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="size-5 text-primary" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {store.name}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {store.role}
                  </p>
                </div>

                <ChevronRight className="size-4 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Button
          variant="outline"
          className="mt-6 w-full"
          onClick={() =>
            router.push(
              "/store/create",
            )
          }
        >
          <Plus />
          Create another store
        </Button>
      </div>
    </main>
  );
}