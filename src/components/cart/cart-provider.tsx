"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  CartItem,
} from "@/types/cart";

import type {
  Product,
} from "@/types/marketplace";

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;

  addItem: (
    product: Product,
  ) => void;

  removeItem: (
    productId: string,
  ) => void;

  updateQuantity: (
    productId: string,
    quantity: number,
  ) => void;

  clearCart: () => void;
};

const CartContext =
  createContext<CartContextValue | null>(
    null,
  );

const STORAGE_KEY =
  "pyrne-foods-cart";

export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [items, setItems] =
    useState<CartItem[]>([]);

  const [hydrated, setHydrated] =
    useState(false);

  useEffect(() => {
    try {
      const stored =
        localStorage.getItem(
          STORAGE_KEY,
        );

      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch {
      localStorage.removeItem(
        STORAGE_KEY,
      );
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(items),
    );
  }, [items, hydrated]);

  function addItem(
    product: Product,
  ) {
    setItems((current) => {
      const existing =
        current.find(
          (item) =>
            item.product.id ===
            product.id,
        );

      if (existing) {
        return current.map((item) =>
          item.product.id ===
          product.id
            ? {
                ...item,
                quantity:
                  item.quantity + 1,
              }
            : item,
        );
      }

      return [
        ...current,
        {
          product,
          quantity: 1,
        },
      ];
    });
  }

  function removeItem(
    productId: string,
  ) {
    setItems((current) =>
      current.filter(
        (item) =>
          item.product.id !==
          productId,
      ),
    );
  }

  function updateQuantity(
    productId: string,
    quantity: number,
  ) {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems((current) =>
      current.map((item) =>
        item.product.id ===
        productId
          ? {
              ...item,
              quantity,
            }
          : item,
      ),
    );
  }

  function clearCart() {
    setItems([]);
  }

  const value = useMemo(() => {
    const itemCount =
      items.reduce(
        (sum, item) =>
          sum + item.quantity,
        0,
      );

    const subtotal =
      items.reduce(
        (sum, item) =>
          sum +
          Number(
            item.product.price,
          ) *
            item.quantity,
        0,
      );

    return {
      items,
      itemCount,
      subtotal,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    };
  }, [items]);

  return (
    <CartContext.Provider
      value={value}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider",
    );
  }

  return context;
}
