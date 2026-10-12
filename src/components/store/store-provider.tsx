"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getStoreSession,
  selectStore,
  clearStoreSession as clearStoreSessionApi,
} from "@/lib/store-admin-api";
import { AuthStore } from "@/types/marketplace";


type StoreContextValue = {
  activeStore: AuthStore | null;
  loading: boolean;
  selectStore: (
    storeId: string,
  ) => Promise<AuthStore>;
  clearStoreSession: () => Promise<void>;
  refresh: () => Promise<void>;
};

const StoreContext =
  createContext<StoreContextValue | null>(
    null,
  );

export function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeStore, setActiveStore] =
    useState<AuthStore | null>(null);

  const [loading, setLoading] =
    useState(true);

  async function refresh() {
    setLoading(true);

    try {
      const response =
        await getStoreSession();

      setActiveStore(
        response.data.store,
      );
    } catch {
      setActiveStore(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectStore(
    storeId: string,
  ) {
    const response =
      await selectStore(storeId);

    const store =
      response.data.store;

    setActiveStore(store);

    return store;
  }

  async function handleClearStoreSession() {
    await clearStoreSessionApi();
    setActiveStore(null);
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <StoreContext.Provider
      value={{
        activeStore,
        loading,
        selectStore:
          handleSelectStore,
        clearStoreSession:
          handleClearStoreSession,
        refresh,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context =
    useContext(StoreContext);

  if (!context) {
    throw new Error(
      "useStore must be used inside StoreProvider.",
    );
  }

  return context;
}