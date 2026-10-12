"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getCurrentUser,
  getUserStores,
  logout as logoutApi,
} from "@/lib/auth-api";

import type { AuthUser} from "@/types/auth";
import { AuthStore } from "@/types/marketplace";

type AuthContextValue = {
  user: AuthUser | null;
  stores: AuthStore[];
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext =
  createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [stores, setStores] =
    useState<AuthStore[]>([]);

  const [loading, setLoading] =
    useState(true);

  async function refresh() {
    setLoading(true);

    try {
      const response =
        await getCurrentUser();

      const authenticatedUser =
        response.data.user;

      setUser(authenticatedUser);

      if (
        authenticatedUser.role ===
        "STORE_USER"
      ) {
        try {
          const storeResponse =
            await getUserStores();

          setStores(
            storeResponse.data,
          );
        } catch {
          setStores([]);
        }
      } else {
        setStores([]);
      }
    } catch {
      setUser(null);
      setStores([]);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await logoutApi();
    } finally {
      setUser(null);
      setStores([]);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        stores,
        loading,
        refresh,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider.",
    );
  }

  return context;
}