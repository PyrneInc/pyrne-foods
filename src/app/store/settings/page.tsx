"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  getUserStores as getAuthStores,
} from "@/lib/auth-api";

import type {
  AuthStore,
} from "@/types/auth";

export default function StoreSettingsPage() {
  const [
    stores,
    setStores,
  ] = useState<AuthStore[]>([]);

  const [
    selected,
    setSelected,
  ] = useState<AuthStore | null>(
    null,
  );

  useEffect(() => {
    getAuthStores().then(
      (result) => {
        setStores(
          result.data,
        );

        setSelected(
          result.data[0] ??
            null,
        );
      },
    );
  }, []);

  return (
    <div className="p-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold">
          Store settings
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage your store information.
        </p>

        <div className="mt-6 rounded-xl border bg-background p-6">
          <label className="text-sm font-medium">
            Store
          </label>

          <select
            value={
              selected?.id ?? ""
            }
            onChange={(event) =>
              setSelected(
                stores.find(
                  (store) =>
                    store.id ===
                    event.target.value,
                ) ?? null,
              )
            }
            className="mt-2 w-full rounded-lg border px-3 py-2"
          >
            {stores.map(
              (store) => (
                <option
                  key={store.id}
                  value={store.id}
                >
                  {store.name}
                </option>
              ),
            )}
          </select>

          {selected && (
            <div className="mt-6 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">
                  Name
                </p>

                <p className="font-medium">
                  {selected.name}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Slug
                </p>

                <p className="font-medium">
                  {selected.slug}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Type
                </p>

                <p className="font-medium">
                  {selected.type}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Your role
                </p>

                <p className="font-medium">
                  {selected.role}
                </p>
              </div>

              <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                Store editing will be added to the settings API after the core marketplace is complete.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}